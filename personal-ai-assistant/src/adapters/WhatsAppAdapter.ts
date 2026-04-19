import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { execSync } from 'child_process';
import { BaseAdapter } from './BaseAdapter';

function getChromiumPath(): string | undefined {
  // Detect Chromium on common Linux paths
  const candidates = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  for (const p of candidates) {
    try {
      execSync(`test -f ${p}`, { stdio: 'ignore' });
      return p;
    } catch {}
  }
  return undefined;
}

export class WhatsAppAdapter extends BaseAdapter {
  name = 'WhatsApp';
  private client: Client;

  constructor() {
    super();

    const executablePath = getChromiumPath();
    if (!executablePath) {
      console.warn('⚠️  [WhatsApp] Chromium not found. Install with: sudo apt install chromium-browser');
    }

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: '.whatsapp-session' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        ...(executablePath ? { executablePath } : {}),
      },
    });

    this.client.on('qr', (qr) => {
      console.log('\n📱 Scan this QR code with WhatsApp to connect:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp authenticated!');
    });

    this.client.on('ready', () => {
      console.log('🚀 WhatsApp adapter is ready!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('[WhatsApp] Auth failure:', msg);
    });

    this.client.on('message', async (message) => {
      // Ignore group messages and status broadcasts
      if (message.from === 'status@broadcast' || message.from.includes('@g.us')) return;
      if (!this.onMessageReceived) return;
      try {
        const reply = await this.onMessageReceived(message.from, message.body);
        await message.reply(reply);
      } catch (err) {
        console.error('[WhatsApp] Error handling message:', err);
      }
    });
  }

  async start() {
    await this.client.initialize();
  }

  async sendMessage(recipientId: string, text: string) {
    await this.client.sendMessage(recipientId, text);
  }
}
