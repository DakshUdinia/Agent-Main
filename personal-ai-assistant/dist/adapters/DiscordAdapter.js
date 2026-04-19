"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordAdapter = void 0;
const discord_js_1 = require("discord.js");
const BaseAdapter_1 = require("./BaseAdapter");
class DiscordAdapter extends BaseAdapter_1.BaseAdapter {
    constructor(token) {
        super();
        this.name = 'Discord';
        this.token = token; // FIX: store token — start() was using process.env directly
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.DirectMessages,
            ],
            partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Message], // needed for DMs
        });
        this.client.on('messageCreate', async (message) => {
            // Ignore bots and messages without content
            if (message.author.bot || !message.content.trim())
                return;
            if (!this.onMessageReceived)
                return;
            try {
                const reply = await this.onMessageReceived(message.author.id, message.content);
                await message.reply(reply);
            }
            catch (err) {
                console.error('[Discord] Error handling message:', err);
                await message.reply('Sorry, I encountered an error. Please try again.');
            }
        });
        this.client.on('ready', () => {
            console.log(`🚀 Discord adapter started — logged in as ${this.client.user?.tag}`);
        });
    }
    async start() {
        await this.client.login(this.token); // FIX: use stored token, not process.env
    }
    async sendMessage(recipientId, text) {
        const user = await this.client.users.fetch(recipientId);
        await user.send(text);
    }
}
exports.DiscordAdapter = DiscordAdapter;
//# sourceMappingURL=DiscordAdapter.js.map