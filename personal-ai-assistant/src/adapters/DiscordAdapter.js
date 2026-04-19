"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordAdapter = void 0;
const discord_js_1 = require("discord.js");
const BaseAdapter_1 = require("./BaseAdapter");
class DiscordAdapter extends BaseAdapter_1.BaseAdapter {
    name = 'Discord';
    client;
    constructor(token) {
        super();
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.DirectMessages,
            ],
        });
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot)
                return;
            if (this.onMessageReceived) {
                const reply = await this.onMessageReceived(message.author.id, message.content);
                await message.reply(reply);
            }
        });
    }
    async start() {
        await this.client.login(process.env.DISCORD_TOKEN);
        console.log('🚀 Discord adapter started');
    }
    async sendMessage(recipientId, text) {
        const user = await this.client.users.fetch(recipientId);
        await user.send(text);
    }
}
exports.DiscordAdapter = DiscordAdapter;
//# sourceMappingURL=DiscordAdapter.js.map