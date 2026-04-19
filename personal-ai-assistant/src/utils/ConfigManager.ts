import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export interface AppConfig {
  OPENAI_API_KEYS?: string;
  GEMINI_API_KEYS?: string;
  OPENROUTER_API_KEYS?: string;
  GROQ_API_KEYS?: string;
  PROVIDER_ORDER?: string;
  TELEGRAM_TOKEN?: string;
  DISCORD_TOKEN?: string;
  WHATSAPP_ENABLED?: boolean;
  VOICE_ENABLED?: boolean;
}

export class ConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), '.env');
    dotenv.config({ path: this.configPath });
  }

  saveConfig(config: AppConfig) {
    const lines = Object.entries(config)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`);
    fs.writeFileSync(this.configPath, lines.join('\n'));
    dotenv.config({ path: this.configPath, override: true });
  }

  loadConfig(): AppConfig {
    if (fs.existsSync(this.configPath)) {
      const result = dotenv.config({ path: this.configPath, override: true });
      return (result.parsed as AppConfig) || {};
    }
    return {};
  }

  isConfigured(): boolean {
    const c = this.loadConfig();
    return !!(c.OPENAI_API_KEYS || c.GEMINI_API_KEYS || c.GROQ_API_KEYS || c.OPENROUTER_API_KEYS);
  }
}
