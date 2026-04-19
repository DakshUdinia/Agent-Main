"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const generative_ai_1 = require("@google/generative-ai");
const MemoryManager_1 = require("./MemoryManager");
class AIProvider {
    constructor() {
        this.providers = [];
        this.currentProviderIndex = 0;
        this.memory = new MemoryManager_1.MemoryManager();
        this.initProviders();
    }
    initProviders() {
        const order = (process.env.PROVIDER_ORDER || 'openai,gemini,groq,openrouter')
            .split(',')
            .map(p => p.trim());
        const keyMap = {
            openai: process.env.OPENAI_API_KEYS,
            gemini: process.env.GEMINI_API_KEYS,
            openrouter: process.env.OPENROUTER_API_KEYS,
            groq: process.env.GROQ_API_KEYS,
        };
        for (const name of order) {
            const raw = keyMap[name];
            if (!raw)
                continue;
            const keys = raw.split(',').map(k => k.trim()).filter(k => k.length > 0);
            if (keys.length > 0) {
                this.providers.push({ name, keys, currentKeyIndex: 0 });
            }
        }
        if (this.providers.length === 0) {
            throw new Error('No AI provider keys configured. Please set keys in your .env file.');
        }
        console.log(`✅ Loaded providers: ${this.providers.map(p => `${p.name}(${p.keys.length} keys)`).join(', ')}`);
    }
    currentProvider() {
        return this.providers[this.currentProviderIndex];
    }
    currentKey() {
        const p = this.currentProvider();
        return p.keys[p.currentKeyIndex];
    }
    /** Rotate key within the current provider, or rotate to next provider */
    rotate() {
        const p = this.currentProvider();
        if (p.currentKeyIndex < p.keys.length - 1) {
            p.currentKeyIndex++;
            console.warn(`🔄 [${p.name}] Rotated to key index ${p.currentKeyIndex}`);
            return true;
        }
        // All keys for this provider exhausted — try next provider
        if (this.currentProviderIndex < this.providers.length - 1) {
            this.currentProviderIndex++;
            console.warn(`🔀 Switched to provider: ${this.currentProvider().name}`);
            return true;
        }
        return false; // All providers exhausted
    }
    isRateLimitError(err) {
        const status = err?.status ?? err?.statusCode ?? err?.response?.status;
        const code = err?.code ?? err?.error?.code ?? '';
        return status === 429 || code === 'insufficient_quota' || code === 'rate_limit_exceeded';
    }
    async callOpenAI(messages, key) {
        const client = new openai_1.default({ apiKey: key });
        const res = await client.chat.completions.create({
            model: 'gpt-4-turbo',
            messages,
        });
        return res.choices[0]?.message?.content ?? '';
    }
    async callOpenRouter(messages, key) {
        const client = new openai_1.default({
            apiKey: key,
            baseURL: 'https://openrouter.ai/api/v1',
        });
        const res = await client.chat.completions.create({
            model: 'openai/gpt-4-turbo',
            messages,
        });
        return res.choices[0]?.message?.content ?? '';
    }
    async callGroq(messages, key) {
        const client = new groq_sdk_1.default({ apiKey: key });
        const res = await client.chat.completions.create({
            model: 'llama3-70b-8192',
            messages,
        });
        return res.choices[0]?.message?.content ?? '';
    }
    async callGemini(messages, key) {
        const genAI = new generative_ai_1.GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // Build a single prompt string from message history
        const prompt = messages
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n');
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    async callCurrentProvider(messages) {
        const p = this.currentProvider();
        const key = this.currentKey();
        switch (p.name) {
            case 'openai': return this.callOpenAI(messages, key);
            case 'openrouter': return this.callOpenRouter(messages, key);
            case 'groq': return this.callGroq(messages, key);
            case 'gemini': return this.callGemini(messages, key);
        }
    }
    async generateResponse(userId, platform, userMessage) {
        this.memory.addEntry(userId, platform, 'user', userMessage);
        const history = this.memory.getRecentContext(userId, platform, 10);
        const systemMsg = {
            role: 'system',
            content: 'You are OmniMind, a helpful personal AI assistant. Be concise, professional, and friendly.',
        };
        const messages = [systemMsg, ...history];
        let totalAttempts = this.providers.reduce((sum, p) => sum + p.keys.length, 0);
        while (totalAttempts > 0) {
            try {
                const reply = await this.callCurrentProvider(messages);
                const cleaned = reply.trim() || "Sorry, I couldn't generate a response.";
                this.memory.addEntry(userId, platform, 'assistant', cleaned);
                return cleaned;
            }
            catch (err) {
                if (this.isRateLimitError(err)) {
                    const p = this.currentProvider();
                    console.warn(`⚠️  [${p.name}] Key[${p.currentKeyIndex}] exhausted. Rotating...`);
                    if (!this.rotate()) {
                        break;
                    }
                    totalAttempts--;
                }
                else {
                    console.error(`❌ Provider error [${this.currentProvider().name}]:`, err?.message ?? err);
                    if (!this.rotate())
                        break;
                    totalAttempts--;
                }
            }
        }
        throw new Error('All AI providers and keys have been exhausted. Please check your .env file.');
    }
}
exports.AIProvider = AIProvider;
//# sourceMappingURL=AIProvider.js.map