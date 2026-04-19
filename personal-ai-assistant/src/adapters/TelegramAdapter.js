"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = void 0;
const telegraf_1 = require("telegraf");
const BaseAdapter_1 = require("./BaseAdapter");
class TelegramAdapter extends BaseAdapter_1.BaseAdapter {
    name = 'Telegram';
    bot;
    constructor(token) {
        super();
        this.bot = new telegraf_1.Telegraf(token);
        this.bot.on('text', async (ctx) => {
            if (this.onMessageReceived) {
                const reply = await this.onMessageReceived(ctx.from.id.toString(), ctx.message.text);
                await ctx.reply(reply);
            }
        });
    }
    async start() {
        this.bot.launch();
        console.log('🚀 Telegram adapter started');
    }
    async sendMessage(recipientId, text) {
        await this.bot.telegram.sendMessage(recipientId, text);
    }
}
exports.TelegramAdapter = TelegramAdapter;
//# sourceMappingURL=TelegramAdapter.js.map