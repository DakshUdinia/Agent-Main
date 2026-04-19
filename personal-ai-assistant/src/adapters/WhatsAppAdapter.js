"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAdapter = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const BaseAdapter_1 = require("./BaseAdapter");
class WhatsAppAdapter extends BaseAdapter_1.BaseAdapter {
    name = 'WhatsApp';
    client;
    constructor() {
        super();
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox'],
            }
        });
        this.client.on('qr', (qr) => {
            console.log('Scan this QR code with WhatsApp to connect:');
            qrcode_terminal_1.default.generate(qr, { small: true });
        });
        this.client.on('ready', () => {
            console.log('🚀 WhatsApp adapter is ready!');
        });
        this.client.on('message', async (message) => {
            if (this.onMessageReceived) {
                const reply = await this.onMessageReceived(message.from, message.body);
                await message.reply(reply);
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