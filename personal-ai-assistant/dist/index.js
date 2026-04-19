"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const ConfigManager_1 = require("./utils/ConfigManager");
const AIProvider_1 = require("./core/AIProvider");
const TelegramAdapter_1 = require("./adapters/TelegramAdapter");
const DiscordAdapter_1 = require("./adapters/DiscordAdapter");
const WhatsAppAdapter_1 = require("./adapters/WhatsAppAdapter");
const setup_1 = require("./cli/setup");
async function main() {
    const configManager = new ConfigManager_1.ConfigManager();
    if (process.argv.includes('--setup') || !configManager.isConfigured()) {
        await (0, setup_1.runSetup)();
        return;
    }
    const config = configManager.loadConfig();
    console.log('🤖 OmniMind is waking up...');
    // AIProvider now reads keys directly from process.env
    const ai = new AIProvider_1.AIProvider();
    const messageHandler = async (userId, text) => {
        console.log(`[MSG] From ${userId}: ${text}`);
        return await ai.generateResponse(userId, 'global', text);
    };
    const adapters = [];
    if (config.TELEGRAM_TOKEN) {
        const telegram = new TelegramAdapter_1.TelegramAdapter(config.TELEGRAM_TOKEN);
        telegram.setMessageHandler(messageHandler);
        adapters.push(telegram);
        console.log('📱 Telegram enabled');
    }
    if (config.DISCORD_TOKEN) {
        const discord = new DiscordAdapter_1.DiscordAdapter(config.DISCORD_TOKEN);
        discord.setMessageHandler(messageHandler);
        adapters.push(discord);
        console.log('🎮 Discord enabled');
    }
    if (String(config.WHATSAPP_ENABLED) === 'true') {
        const whatsapp = new WhatsAppAdapter_1.WhatsAppAdapter();
        whatsapp.setMessageHandler(messageHandler);
        adapters.push(whatsapp);
        console.log('💬 WhatsApp enabled');
    }
    if (adapters.length === 0) {
        console.log('⚠️  No chat platforms configured. Add tokens to .env and restart.');
        console.log('   Run: npm run setup — for guided configuration.');
        return;
    }
    for (const adapter of adapters) {
        await adapter.start();
    }
    console.log('✅ OmniMind is active and listening on all configured platforms.');
}
main().catch(err => {
    console.error('❌ Fatal error:', err.message ?? err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map