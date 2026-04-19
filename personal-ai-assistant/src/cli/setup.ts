import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager, AppConfig } from '../utils/ConfigManager';
import { ServiceManager } from '../utils/ServiceManager';

export async function runSetup() {
  console.log(chalk.cyan.bold('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   OmniMind Assistant Setup       ║'));
  console.log(chalk.cyan.bold('╚══════════════════════════════════╝\n'));

  const configManager = new ConfigManager();
  const current = configManager.loadConfig();

  const answers = await inquirer.prompt([
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
      when: (a: any) => a.platforms.includes('telegram'),
    },
    {
      type: 'input',
      name: 'DISCORD_TOKEN',
      message: 'Discord Bot Token:',
      default: current.DISCORD_TOKEN || '',
      when: (a: any) => a.platforms.includes('discord'),
    },
    {
      type: 'confirm',
      name: 'installService',
      message: 'Install OmniMind as a background service (systemd)?',
      default: false,
    },
  ]);

  const newConfig: AppConfig = {
    OPENAI_API_KEYS:    answers.OPENAI_API_KEYS    || undefined,
    GEMINI_API_KEYS:    answers.GEMINI_API_KEYS    || undefined,
    GROQ_API_KEYS:      answers.GROQ_API_KEYS      || undefined,
    OPENROUTER_API_KEYS: answers.OPENROUTER_API_KEYS || undefined,
    PROVIDER_ORDER:     answers.PROVIDER_ORDER,
    TELEGRAM_TOKEN:     answers.TELEGRAM_TOKEN     || undefined,
    DISCORD_TOKEN:      answers.DISCORD_TOKEN      || undefined,
    WHATSAPP_ENABLED:   answers.platforms.includes('whatsapp'),
  };

  configManager.saveConfig(newConfig);
  console.log(chalk.green('\n✅ Configuration saved to .env'));

  if (answers.installService) {
    const serviceManager = new ServiceManager();
    serviceManager.installService();
  }

  console.log(chalk.yellow('\n▶  Run  npm run dev  to start OmniMind\n'));
}
