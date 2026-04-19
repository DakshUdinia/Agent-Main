"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigManager_1 = require("./utils/ConfigManager");
const AIProvider_1 = require("./core/AIProvider");
const TelegramAdapter_1 = require("./adapters/TelegramAdapter");
const DiscordAdapter_1 = require("./adapters/DiscordAdapter");
const WhatsAppAdapter_1 = require("./adapters/WhatsAppAdapter");
const setup_1 = require("./cli/setup");
async function main() {
    const configManager = new ConfigManager_1.ConfigManager();
    // Check if we should run setup
    if (process.argv.includes('--setup') || !configManager.isConfigured()) {
        await (0, setup_1.runSetup)();
        return;
    }
    const config = configManager.loadConfig();
    console.log('🤖 OmniMind is waking up...');
    const ai = new AIProvider_1.AIProvider(config.OPENAI_API_KEY);
    const messageHandler = async (userId, text) => {
        console.log(`[Message] From ${userId}: ${text}`);
        return await ai.generateResponse(userId, 'global', text);
    };
    const adapters = [];
    if (config.TELEGRAM_TOKEN) {
        const telegram = new TelegramAdapter_1.TelegramAdapter(config.TELEGRAM_TOKEN);
        telegram.setMessageHandler(messageHandler);
        adapters.push(telegram);
    }
    if (config.DISCORD_TOKEN) {
        const discord = new DiscordAdapter_1.DiscordAdapter(config.DISCORD_TOKEN);
        discord.setMessageHandler(messageHandler);
        adapters.push(discord);
    }
    if (config.WHATSAPP_ENABLED) {
        const whatsapp = new WhatsAppAdapter_1.WhatsAppAdapter();
        whatsapp.setMessageHandler(messageHandler);
        adapters.push(whatsapp);
    }
    // Start all enabled adapters
    for (const adapter of adapters) {
        await adapter.start();
    }
    console.log('✅ OmniMind is now active and listening.');
}
main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map