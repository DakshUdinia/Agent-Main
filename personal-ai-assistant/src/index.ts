import 'dotenv/config';
import { ConfigManager } from './utils/ConfigManager';
import { AIProvider } from './core/AIProvider';
import { TelegramAdapter } from './adapters/TelegramAdapter';
import { DiscordAdapter } from './adapters/DiscordAdapter';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';
import { runSetup } from './cli/setup';

async function main() {
  const configManager = new ConfigManager();

  if (process.argv.includes('--setup') || !configManager.isConfigured()) {
    await runSetup();
    return;
  }

  const config = configManager.loadConfig();
  console.log('🤖 OmniMind is waking up...');

  // AIProvider now reads keys directly from process.env
  const ai = new AIProvider();

  const messageHandler = async (userId: string, text: string): Promise<string> => {
    console.log(`[MSG] From ${userId}: ${text}`);
    return await ai.generateResponse(userId, 'global', text);
  };

  const adapters: any[] = [];

  if (config.TELEGRAM_TOKEN) {
    const telegram = new TelegramAdapter(config.TELEGRAM_TOKEN);
    telegram.setMessageHandler(messageHandler);
    adapters.push(telegram);
    console.log('📱 Telegram enabled');
  }

  if (config.DISCORD_TOKEN) {
    const discord = new DiscordAdapter(config.DISCORD_TOKEN);
    discord.setMessageHandler(messageHandler);
    adapters.push(discord);
    console.log('🎮 Discord enabled');
  }

  if (String(config.WHATSAPP_ENABLED) === 'true') {
    const whatsapp = new WhatsAppAdapter();
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
