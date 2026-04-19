import { Telegraf } from 'telegraf';
import { BaseAdapter } from './BaseAdapter';

export class TelegramAdapter extends BaseAdapter {
  name = 'Telegram';
  private bot: Telegraf;

  constructor(token: string) {
    super();
    this.bot = new Telegraf(token);

    this.bot.on('text', async (ctx) => {
      if (!this.onMessageReceived) return;
      try {
        const reply = await this.onMessageReceived(
          ctx.from.id.toString(),
          ctx.message.text
        );
        await ctx.reply(reply);
      } catch (err) {
        console.error('[Telegram] Error handling message:', err);
        await ctx.reply('Sorry, I encountered an error. Please try again.');
      }
    });
  }

  async start() {
    // Graceful shutdown
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    await this.bot.launch();
    console.log('🚀 Telegram adapter started');
  }

  async sendMessage(recipientId: string, text: string) {
    await this.bot.telegram.sendMessage(recipientId, text);
  }
}
