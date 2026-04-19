export interface AppConfig {
    OPENAI_API_KEYS?: string;
    TELEGRAM_TOKEN?: string;
    DISCORD_TOKEN?: string;
    SLACK_BOT_TOKEN?: string;
    SLACK_APP_TOKEN?: string;
    WHATSAPP_ENABLED?: boolean;
    VOICE_ENABLED?: boolean;
}
export declare class ConfigManager {
    private configPath;
    constructor();
    saveConfig(config: AppConfig): void;
    loadConfig(): AppConfig;
    isConfigured(): boolean;
}
//# sourceMappingURL=ConfigManager.d.ts.map