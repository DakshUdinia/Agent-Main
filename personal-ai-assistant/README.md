# 🤖 OmniMind — Personal AI Assistant

> A private, always-on AI assistant you own and control. Talk to it from **Telegram, Discord, or WhatsApp** using any of **OpenAI, Gemini, Groq, or OpenRouter** as the AI brain — with automatic failover between providers and keys.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Multi-Platform Chat** | Telegram, Discord, WhatsApp |
| **Multi-Provider AI** | OpenAI, Gemini, Groq, OpenRouter |
| **Key Rotation** | Auto-rotates through multiple API keys before failing over |
| **Provider Failover** | If all keys for one provider fail, jumps to the next provider |
| **Persistent Memory** | Every conversation saved to `memory.json` + daily `.txt` logs |
| **Voice (STT)** | Free Google Speech Recognition via Python |
| **Voice (TTS)** | Microsoft Edge TTS via `edge-tts` |
| **Background Service** | Runs as a `systemd` service — always on at boot |
| **Guided Setup** | Interactive CLI wizard to configure everything |

---

## 🏗️ Architecture

```
personal-ai-assistant/
├── src/
│   ├── index.ts                  ← Main entry point
│   ├── core/
│   │   ├── AIProvider.ts         ← Multi-provider AI engine (key rotation + failover)
│   │   ├── MemoryManager.ts      ← Conversation memory (JSON + daily txt logs)
│   │   ├── VoiceEngine.ts        ← STT (Google) + TTS (edge-tts)
│   │   └── stt_helper.py         ← Python STT script
│   ├── adapters/
│   │   ├── BaseAdapter.ts        ← Abstract base all adapters extend
│   │   ├── TelegramAdapter.ts    ← Telegram bot (via Telegraf)
│   │   ├── DiscordAdapter.ts     ← Discord bot (via discord.js)
│   │   └── WhatsAppAdapter.ts    ← WhatsApp (via whatsapp-web.js + Puppeteer)
│   ├── cli/
│   │   └── setup.ts              ← Interactive setup wizard
│   └── utils/
│       ├── ConfigManager.ts      ← .env reader/writer
│       └── ServiceManager.ts     ← systemd service file generator
├── logs/                         ← Daily conversation logs (YYYY-MM-DD.txt)
├── memory.json                   ← Full conversation memory database
├── .env                          ← Your secrets (never commit this!)
├── tsconfig.json
└── package.json
```

### How the AI Engine Works

```
User Message
     │
     ▼
AIProvider.generateResponse()
     │
     ├─ Load history from MemoryManager
     ├─ Try Provider[0] Key[0]
     │      ├─ Success → save reply → return
     │      └─ Rate limit / quota error
     │           ├─ Try Provider[0] Key[1], Key[2]...
     │           └─ All keys exhausted → move to Provider[1]
     │                ├─ Try Provider[1] Key[0], Key[1]...
     │                └─ All exhausted → Provider[2]... etc.
     └─ If ALL providers exhausted → throw error
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js 18+
node --version

# Python 3
python3 --version

# Install Python voice dependencies
pip install SpeechRecognition edge-tts --break-system-packages

# Install Chromium (for WhatsApp)
sudo apt install chromium-browser
```

### Installation

```bash
# Clone / navigate to project
cd personal-ai-assistant

# Install Node.js dependencies
npm install
```

---

## ⚙️ Configuration

### Option A — Interactive Setup Wizard (recommended)

```bash
npm run setup
```

The wizard will ask you for:
- Your API keys (any/all of OpenAI, Gemini, Groq, OpenRouter)
- Which chat platforms to enable
- Bot tokens
- Whether to install as a background service

### Option B — Manual `.env` editing

Edit `.env` in the project root:

```ini
# ── AI Provider Keys (comma-separated for rotation) ───────────────────────────
OPENAI_API_KEYS=sk-key1,sk-key2,sk-key3
GEMINI_API_KEYS=AIza-key1,AIza-key2
GROQ_API_KEYS=gsk_key1,gsk_key2
OPENROUTER_API_KEYS=sk-or-key1

# ── Provider priority (tried left to right, falls over on failure) ─────────────
PROVIDER_ORDER=openai,gemini,groq,openrouter

# ── Chat Platforms ─────────────────────────────────────────────────────────────
TELEGRAM_TOKEN=123456:ABC-your-bot-token
DISCORD_TOKEN=your-discord-bot-token
WHATSAPP_ENABLED=false
```

---

## ▶️ Running OmniMind

### Development Mode (with live output)

```bash
npm run dev
```

### Production Mode

```bash
npm run build
node dist/index.js
```

### Background Service (always-on at boot)

After running `npm run setup` and selecting "install systemd service":

```bash
# Move the generated service file into systemd
sudo cp omnimind.service /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable --now omnimind

# Check status
sudo systemctl status omnimind

# View live logs
sudo journalctl -u omnimind -f
```

---

## 💬 Setting Up Each Chat Platform

### Telegram

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot` and follow the steps
3. Copy the token → paste into `TELEGRAM_TOKEN` in `.env`
4. Open your new bot in Telegram and send a message

### Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → give it a name
3. Go to **Bot** tab → **Reset Token** → copy it → paste into `DISCORD_TOKEN`
4. Under **Privileged Gateway Intents**, enable **Message Content Intent**
5. Go to **OAuth2 → URL Generator** → select `bot` scope + `Send Messages`, `Read Message History` permissions
6. Open the generated URL to invite the bot to your server

### WhatsApp

1. Set `WHATSAPP_ENABLED=true` in `.env`
2. Run `npm run dev`
3. A **QR code** will appear in the terminal
4. Open WhatsApp on your phone → **Linked Devices** → **Link a Device** → scan the QR code
5. Session is saved locally — you won't need to scan again

---

## 🧠 Memory System

Every conversation is saved in two places:

| Storage | Location | Format | Use Case |
|---|---|---|---|
| `memory.json` | Project root | JSON array | Context for AI responses |
| `logs/YYYY-MM-DD.txt` | `logs/` folder | Human-readable text | Reviewing past conversations |

**Example log entry:**
```
[2026-04-19T12:35:01Z] [telegram] [123456789] USER: What's the capital of France?
[2026-04-19T12:35:02Z] [telegram] [123456789] ASSISTANT: The capital of France is Paris.
```

The AI uses the last **10 messages** per user as context when generating replies.

---

## 🎙️ Voice Support

### Text-to-Speech (TTS)
Uses Microsoft Edge TTS (free, no API key required):
```bash
# Test it manually
edge-tts --text "Hello, I am OmniMind" --write-media test.mp3
```

### Speech-to-Text (STT)
Uses Google's free Speech Recognition API via Python:
```bash
# Test it manually
python3 src/core/stt_helper.py your_audio_file.wav
```

> **Note:** Voice input/output is available as a programmatic API via `VoiceEngine`. Direct voice integration with chat platforms requires sending/receiving audio files, which varies by platform.

---

## 🔄 Provider Rotation Logic

```
PROVIDER_ORDER=openai,gemini,groq,openrouter
OPENAI_API_KEYS=key-A,key-B
GEMINI_API_KEYS=key-C
```

On a quota/rate-limit error, the rotation order is:

```
openai[key-A] → openai[key-B] → gemini[key-C] → groq[...] → openrouter[...]
```

This means you can add as many keys as you own and OmniMind will squeeze maximum usage out of them before stopping.

---

## 🛠️ NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run in development mode (ts-node, no build needed) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Build then run from `dist/` |
| `npm run setup` | Launch the interactive configuration wizard |

---

## 📁 Project Dependencies

| Package | Purpose |
|---|---|
| `openai` | OpenAI GPT-4 API client |
| `@google/generative-ai` | Google Gemini API client |
| `groq-sdk` | Groq LLaMA3 API client |
| `telegraf` | Telegram bot framework |
| `discord.js` | Discord bot framework |
| `whatsapp-web.js` | WhatsApp Web automation |
| `dotenv` | Environment variable loader |
| `inquirer` | Interactive CLI prompts |
| `chalk` | Coloured terminal output |
| `msedge-tts` | Edge TTS (backup TTS option) |

---

## 🔐 Security Notes

- **Never commit `.env`** — it contains your API keys
- The `.whatsapp-session/` folder holds your WhatsApp session — keep it private
- `memory.json` contains your full conversation history — store it securely
- The systemd service runs as your user account (not root)

---

## 🧩 Extending OmniMind

To add a new chat platform, create a file in `src/adapters/`:

```typescript
import { BaseAdapter } from './BaseAdapter';

export class MyPlatformAdapter extends BaseAdapter {
  name = 'MyPlatform';

  constructor(token: string) {
    super();
    // listen for incoming messages and call:
    // this.onMessageReceived?.(userId, messageText)
  }

  async start() { /* connect to platform */ }
  async sendMessage(recipientId: string, text: string) { /* send a message */ }
}
```

Then register it in `src/index.ts` — same pattern as Telegram/Discord.

---

## 📝 License

MIT — use freely, modify as you wish.

---

*Built with ❤️ — OmniMind is your private AI, running on your machine, under your control.*
