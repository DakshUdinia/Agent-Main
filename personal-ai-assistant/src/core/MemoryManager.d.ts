export interface MemoryEntry {
    timestamp: string;
    userId: string;
    platform: string;
    role: 'user' | 'assistant';
    content: string;
}
export declare class MemoryManager {
    private logsDir;
    private memoryFile;
    private memoryCache;
    constructor();
    addEntry(userId: string, platform: string, role: 'user' | 'assistant', content: string): void;
    getRecentContext(userId: string, platform: string, limit?: number): any[];
}
//# sourceMappingURL=MemoryManager.d.ts.map