"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAdapter = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const child_process_1 = require("child_process");
const BaseAdapter_1 = require("./BaseAdapter");
function getChromiumPath() {
    // Detect Chromium on common Linux paths
    const candidates = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
    ];
    for (const p of candidates) {
        try {
            (0, child_process_1.execSync)(`test -f ${p}`, { stdio: 'ignore' });
            return p;
        }
        catch { }
    }
    return undefined;
}
class WhatsAppAdapter extends BaseAdapter_1.BaseAdapter {
    constructor() {
        super();
        this.name = 'WhatsApp';
        const executablePath = getChromiumPath();
        if (!executablePath) {
            console.warn('⚠️  [WhatsApp] Chromium not found. Install with: sudo apt install chromium-browser');
        }
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth({ dataPath: '.whatsapp-session' }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                ...(executablePath ? { executablePath } : {}),
            },
        });
        this.client.on('qr', (qr) => {
            console.log('\n📱 Scan this QR code with WhatsApp to connect:');
            qrcode_terminal_1.default.generate(qr, { small: true });
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
            if (message.from === 'status@broadcast' || message.from.includes('@g.us'))
                return;
            if (!this.onMessageReceived)
                return;
            try {
                const reply = await this.onMessageReceived(message.from, message.body);
                await message.reply(reply);
            }
            catch (err) {
                console.error('[WhatsApp] Error handling message:', err);
            }
        });
    }
    async start() {
        await this.client.initialize();
    }
    async sendMessage(recipientId, text) {
        await this.client.sendMessage(recipientId, text);
    }
}
exports.WhatsAppAdapter = WhatsAppAdapter;
//# sourceMappingURL=WhatsAppAdapter.js.map