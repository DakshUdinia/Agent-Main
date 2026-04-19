"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const MemoryManager_1 = require("./MemoryManager");
class AIProvider {
    clients = [];
    currentClientIndex = 0;
    memoryManager;
    constructor(apiKeysString) {
        const keys = apiKeysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
        if (keys.length === 0) {
            throw new Error("No OpenAI API keys provided.");
        }
        this.clients = keys.map(key => new openai_1.default({ apiKey: key }));
        this.memoryManager = new MemoryManager_1.MemoryManager();
        console.log(`Loaded ${this.clients.length} API keys for rotation.`);
    }
    getClient() {
        return this.clients[this.currentClientIndex];
    }
    rotateKey() {
        this.currentClientIndex++;
        if (this.currentClientIndex >= this.clients.length) {
            console.error("All API keys have been exhausted!");
            throw new Error("All API keys exhausted. Please update your keys.");
        }
        console.log(`Switched to API key index ${this.currentClientIndex}`);
    }
    async generateResponse(userId, platform, message) {
        // Save user message
        this.memoryManager.addEntry(userId, platform, 'user', message);
        // Get recent history
        const recentHistory = this.memoryManager.getRecentContext(userId, platform, 10);
        let attempts = 0;
        while (attempts < this.clients.length) {
            try {
                const client = this.getClient();
                const response = await client.chat.completions.create({
                    model: 'gpt-4-turbo',
                    messages: [
                        { role: 'system', content: 'You are OmniMind, a personal AI assistant. You have access to your conversation memory. Be helpful, concise, and professional.' },
                        ...recentHistory
                    ],
                });
                const reply = response.choices[0].message.content || "I'm sorry, I couldn't process that.";
                // Save assistant reply
                this.memoryManager.addEntry(userId, platform, 'assistant', reply);
                return reply;
            }
            catch (error) {
                // Check if error is related to quota or rate limit
                if (error?.status === 429 || error?.code === 'insufficient_quota') {
                    console.warn(`Key index ${this.currentClientIndex} exhausted or rate limited. Rotating...`);
                    this.rotateKey();
                    attempts++;
                }
                else {
                    console.error("OpenAI API error:", error);
                    throw error;
                }
            }
        }
        throw new Error("Failed to generate response after trying all keys.");
    }
}
exports.AIProvider = AIProvider;
//# sourceMappingURL=AIProvider.js.map