"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
class ConfigManager {
    configPath;
    constructor() {
        this.configPath = path_1.default.join(process.cwd(), '.env');
    }
    saveConfig(config) {
        const lines = Object.entries(config)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${value}`);
        fs_1.default.writeFileSync(this.configPath, lines.join('\n'));
        dotenv_1.default.config();
    }
    loadConfig() {
        if (fs_1.default.existsSync(this.configPath)) {
            const result = dotenv_1.default.config();
            return result.parsed || {};
        }
        return {};
    }
    isConfigured() {
        const config = this.loadConfig();
        return !!config.OPENAI_API_KEYS;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map