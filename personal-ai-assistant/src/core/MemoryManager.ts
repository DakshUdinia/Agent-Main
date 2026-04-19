import fs from 'fs';
import path from 'path';

export interface MemoryEntry {
  timestamp: string;
  userId: string;
  platform: string;
  role: 'user' | 'assistant';
  content: string;
}

export class MemoryManager {
  private logsDir: string;
  private memoryFile: string;
  private memoryCache: MemoryEntry[] = [];

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.memoryFile = path.join(process.cwd(), 'memory.json');

    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    if (fs.existsSync(this.memoryFile)) {
      try {
        const data = fs.readFileSync(this.memoryFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.memoryCache = Array.isArray(parsed) ? parsed : [];
        console.log(`📚 Memory loaded: ${this.memoryCache.length} entries`);
      } catch (e) {
        console.warn('⚠️  Failed to load memory.json — starting fresh.');
        this.memoryCache = [];
      }
    }
  }

  addEntry(userId: string, platform: string, role: 'user' | 'assistant', content: string) {
    const now = new Date();
    const timestamp = now.toISOString();
    // FIX: safe split — dateStr won't be undefined
    const dateStr = timestamp.substring(0, 10); // YYYY-MM-DD

    const entry: MemoryEntry = { timestamp, userId, platform, role, content };
    this.memoryCache.push(entry);

    // Persist to JSON
    try {
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.memoryCache, null, 2));
    } catch (e) {
      console.error('Failed to write memory.json:', e);
    }

    // Persist to daily txt log
    try {
      const logFilePath = path.join(this.logsDir, `${dateStr}.txt`);
      const logLine = `[${timestamp}] [${platform}] [${userId}] ${role.toUpperCase()}: ${content}\n`;
      fs.appendFileSync(logFilePath, logLine);
    } catch (e) {
      console.error('Failed to write daily log:', e);
    }
  }

  getRecentContext(userId: string, platform: string, limit = 20): { role: string; content: string }[] {
    return this.memoryCache
      .filter(e => e.userId === userId && e.platform === platform)
      .slice(-limit)
      .map(e => ({ role: e.role, content: e.content }));
  }

  /** Search memory for a keyword — useful for reminders */
  search(query: string): MemoryEntry[] {
    const q = query.toLowerCase();
    return this.memoryCache.filter(
      e => e.content.toLowerCase().includes(q)
    );
  }

  getTotalEntries(): number {
    return this.memoryCache.length;
  }
}
