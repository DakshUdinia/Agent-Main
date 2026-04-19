"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MemoryManager {
    constructor() {
        this.memoryCache = [];
        this.logsDir = path_1.default.join(process.cwd(), 'logs');
        this.memoryFile = path_1.default.join(process.cwd(), 'memory.json');
        if (!fs_1.default.existsSync(this.logsDir)) {
            fs_1.default.mkdirSync(this.logsDir, { recursive: true });
        }
        if (fs_1.default.existsSync(this.memoryFile)) {
            try {
                const data = fs_1.default.readFileSync(this.memoryFile, 'utf-8');
                const parsed = JSON.parse(data);
                this.memoryCache = Array.isArray(parsed) ? parsed : [];
                console.log(`📚 Memory loaded: ${this.memoryCache.length} entries`);
            }
            catch (e) {
                console.warn('⚠️  Failed to load memory.json — starting fresh.');
                this.memoryCache = [];
            }
        }
    }
    addEntry(userId, platform, role, content) {
        const now = new Date();
        const timestamp = now.toISOString();
        // FIX: safe split — dateStr won't be undefined
        const dateStr = timestamp.substring(0, 10); // YYYY-MM-DD
        const entry = { timestamp, userId, platform, role, content };
        this.memoryCache.push(entry);
        // Persist to JSON
        try {
            fs_1.default.writeFileSync(this.memoryFile, JSON.stringify(this.memoryCache, null, 2));
        }
        catch (e) {
            console.error('Failed to write memory.json:', e);
        }
        // Persist to daily txt log
        try {
            const logFilePath = path_1.default.join(this.logsDir, `${dateStr}.txt`);
            const logLine = `[${timestamp}] [${platform}] [${userId}] ${role.toUpperCase()}: ${content}\n`;
            fs_1.default.appendFileSync(logFilePath, logLine);
        }
        catch (e) {
            console.error('Failed to write daily log:', e);
        }
    }
    getRecentContext(userId, platform, limit = 20) {
        return this.memoryCache
            .filter(e => e.userId === userId && e.platform === platform)
            .slice(-limit)
            .map(e => ({ role: e.role, content: e.content }));
    }
    /** Search memory for a keyword — useful for reminders */
    search(query) {
        const q = query.toLowerCase();
        return this.memoryCache.filter(e => e.content.toLowerCase().includes(q));
    }
    getTotalEntries() {
        return this.memoryCache.length;
    }
}
exports.MemoryManager = MemoryManager;
//# sourceMappingURL=MemoryManager.js.map