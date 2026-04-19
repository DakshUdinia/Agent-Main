import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { BaseAdapter } from './BaseAdapter';

export class DiscordAdapter extends BaseAdapter {
  name = 'Discord';
  private client: Client;
  private token: string;

  constructor(token: string) {
    super();
    this.token = token; // FIX: store token — start() was using process.env directly

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel, Partials.Message], // needed for DMs
    });

    this.client.on('messageCreate', async (message) => {
      // Ignore bots and messages without content
      if (message.author.bot || !message.content.trim()) return;

      if (!this.onMessageReceived) return;
      try {
        const reply = await this.onMessageReceived(message.author.id, message.content);
        await message.reply(reply);
      } catch (err) {
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

  async sendMessage(recipientId: string, text: string) {
    const user = await this.client.users.fetch(recipientId);
    await user.send(text);
  }
}
