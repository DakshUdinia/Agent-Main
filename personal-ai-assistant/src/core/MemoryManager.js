"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MemoryManager {
    logsDir;
    memoryFile;
    memoryCache = [];
    constructor() {
        this.logsDir = path_1.default.join(process.cwd(), 'logs');
        this.memoryFile = path_1.default.join(process.cwd(), 'memory.json');
        if (!fs_1.default.existsSync(this.logsDir)) {
            fs_1.default.mkdirSync(this.logsDir, { recursive: true });
        }
        if (fs_1.default.existsSync(this.memoryFile)) {
            try {
                const data = fs_1.default.readFileSync(this.memoryFile, 'utf-8');
                this.memoryCache = JSON.parse(data);
            }
            catch (e) {
                console.error('Failed to load memory.json', e);
                this.memoryCache = [];
            }
        }
    }
    addEntry(userId, platform, role, content) {
        const now = new Date();
        const timestamp = now.toISOString();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const entry = { timestamp, userId, platform, role, content };
        // Save to memory.json
        this.memoryCache.push(entry);
        fs_1.default.writeFileSync(this.memoryFile, JSON.stringify(this.memoryCache, null, 2));
        // Save to daily .txt log
        const logFilePath = path_1.default.join(this.logsDir, `${dateStr}.txt`);
        const logLine = `[${timestamp}] [${platform}] [${userId}] ${role.toUpperCase()}: ${content}\n`;
        fs_1.default.appendFileSync(logFilePath, logLine);
    }
    getRecentContext(userId, platform, limit = 20) {
        return this.memoryCache
            .filter(e => e.userId === userId && e.platform === platform)
            .slice(-limit)
            .map(e => ({ role: e.role, content: e.content }));
    }
}
exports.MemoryManager = MemoryManager;
//# sourceMappingURL=MemoryManager.js.map