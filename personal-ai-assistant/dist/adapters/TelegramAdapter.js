"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = void 0;
const telegraf_1 = require("telegraf");
const BaseAdapter_1 = require("./BaseAdapter");
class TelegramAdapter extends BaseAdapter_1.BaseAdapter {
    constructor(token) {
        super();
        this.name = 'Telegram';
        this.bot = new telegraf_1.Telegraf(token);
        this.bot.on('text', async (ctx) => {
            if (!this.onMessageReceived)
                return;
            try {
                const reply = await this.onMessageReceived(ctx.from.id.toString(), ctx.message.text);
                await ctx.reply(reply);
            }
            catch (err) {
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
    async sendMessage(recipientId, text) {
        await this.bot.telegram.sendMessage(recipientId, text);
    }
}
exports.TelegramAdapter = TelegramAdapter;
//# sourceMappingURL=TelegramAdapter.js.map