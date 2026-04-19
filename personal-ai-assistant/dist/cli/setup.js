"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSetup = runSetup;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ConfigManager_1 = require("../utils/ConfigManager");
const ServiceManager_1 = require("../utils/ServiceManager");
async function runSetup() {
    console.log(chalk_1.default.cyan.bold('\n╔══════════════════════════════════╗'));
    console.log(chalk_1.default.cyan.bold('║   OmniMind Assistant Setup       ║'));
    console.log(chalk_1.default.cyan.bold('╚══════════════════════════════════╝\n'));
    const configManager = new ConfigManager_1.ConfigManager();
    const current = configManager.loadConfig();
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'OPENAI_API_KEYS',
            message: 'OpenAI API Keys (comma-separated, leave blank to skip):',
            default: current.OPENAI_API_KEYS || '',
        },
        {
            type: 'input',
            name: 'GEMINI_API_KEYS',
            message: 'Gemini API Keys (comma-separated, leave blank to skip):',
            default: current.GEMINI_API_KEYS || '',
        },
        {
            type: 'input',
            name: 'GROQ_API_KEYS',
            message: 'Groq API Keys (comma-separated, leave blank to skip):',
            default: current.GROQ_API_KEYS || '',
        },
        {
            type: 'input',
            name: 'OPENROUTER_API_KEYS',
            message: 'OpenRouter API Keys (comma-separated, leave blank to skip):',
            default: current.OPENROUTER_API_KEYS || '',
        },
        {
            type: 'input',
            name: 'PROVIDER_ORDER',
            message: 'Provider priority order (comma-separated):',
            default: current.PROVIDER_ORDER || 'openai,gemini,groq,openrouter',
        },
        {
            type: 'checkbox',
            name: 'platforms',
            message: 'Which chat platforms do you want to enable?',
            choices: [
                { name: 'Telegram', value: 'telegram' },
                { name: 'Discord', value: 'discord' },
                { name: 'WhatsApp', value: 'whatsapp' },
            ],
        },
        {
            type: 'input',
            name: 'TELEGRAM_TOKEN',
            message: 'Telegram Bot Token:',
            default: current.TELEGRAM_TOKEN || '',
            when: (a) => a.platforms.includes('telegram'),
        },
        {
            type: 'input',
            name: 'DISCORD_TOKEN',
            message: 'Discord Bot Token:',
            default: current.DISCORD_TOKEN || '',
            when: (a) => a.platforms.includes('discord'),
        },
        {
            type: 'confirm',
            name: 'installService',
            message: 'Install OmniMind as a background service (systemd)?',
            default: false,
        },
    ]);
    const newConfig = {
        OPENAI_API_KEYS: answers.OPENAI_API_KEYS || undefined,
        GEMINI_API_KEYS: answers.GEMINI_API_KEYS || undefined,
        GROQ_API_KEYS: answers.GROQ_API_KEYS || undefined,
        OPENROUTER_API_KEYS: answers.OPENROUTER_API_KEYS || undefined,
        PROVIDER_ORDER: answers.PROVIDER_ORDER,
        TELEGRAM_TOKEN: answers.TELEGRAM_TOKEN || undefined,
        DISCORD_TOKEN: answers.DISCORD_TOKEN || undefined,
        WHATSAPP_ENABLED: answers.platforms.includes('whatsapp'),
    };
    configManager.saveConfig(newConfig);
    console.log(chalk_1.default.green('\n✅ Configuration saved to .env'));
    if (answers.installService) {
        const serviceManager = new ServiceManager_1.ServiceManager();
        serviceManager.installService();
    }
    console.log(chalk_1.default.yellow('\n▶  Run  npm run dev  to start OmniMind\n'));
}
//# sourceMappingURL=setup.js.map