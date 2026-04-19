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
    console.log(chalk_1.default.cyan.bold('\n--- OmniMind Assistant Setup ---\n'));
    const configManager = new ConfigManager_1.ConfigManager();
    const currentConfig = configManager.loadConfig();
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'OPENAI_API_KEY',
            message: 'Enter your OpenAI API Key:',
            default: currentConfig.OPENAI_API_KEY,
            validate: (input) => input.length > 0 || 'API Key is required',
        },
        {
            type: 'checkbox',
            name: 'platforms',
            message: 'Which platforms do you want to enable?',
            choices: [
                { name: 'Telegram', value: 'telegram' },
                { name: 'Discord', value: 'discord' },
                { name: 'WhatsApp', value: 'whatsapp' },
                { name: 'Slack', value: 'slack' },
            ],
        },
        {
            type: 'input',
            name: 'TELEGRAM_TOKEN',
            message: 'Enter Telegram Bot Token:',
            when: (answers) => answers.platforms.includes('telegram'),
        },
        {
            type: 'input',
            name: 'DISCORD_TOKEN',
            message: 'Enter Discord Bot Token:',
            when: (answers) => answers.platforms.includes('discord'),
        },
        {
            type: 'confirm',
            name: 'installService',
            message: 'Do you want to install OmniMind as a background service (systemd)?',
            default: true,
        }
    ]);
    const newConfig = {
        OPENAI_API_KEY: answers.OPENAI_API_KEY,
        TELEGRAM_TOKEN: answers.TELEGRAM_TOKEN,
        DISCORD_TOKEN: answers.DISCORD_TOKEN,
        WHATSAPP_ENABLED: answers.platforms.includes('whatsapp'),
    };
    configManager.saveConfig(newConfig);
    console.log(chalk_1.default.green('\n✅ Configuration saved to .env'));
    if (answers.installService) {
        const serviceManager = new ServiceManager_1.ServiceManager();
        serviceManager.installService();
        console.log(chalk_1.default.green('✅ Systemd service file generated!'));
        console.log(chalk_1.default.yellow('To start the service, run: sudo systemctl enable --now omnimind'));
    }
}
//# sourceMappingURL=setup.js.map