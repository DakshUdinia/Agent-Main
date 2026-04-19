"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceEngine = void 0;
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
class VoiceEngine {
    async speechToText(audioPath) {
        try {
            const scriptPath = path_1.default.join(__dirname, 'stt_helper.py');
            // Using python3 to execute the script
            const { stdout } = await execPromise(`python3 ${scriptPath} "${audioPath}"`);
            return stdout.trim();
        }
        catch (error) {
            console.error('STT Error:', error);
            return '';
        }
    }
    async textToSpeech(text) {
        try {
            const outputPath = path_1.default.join(process.cwd(), `response_${Date.now()}.mp3`);
            // Escape single quotes in text for bash
            const safeText = text.replace(/'/g, "'\\''");
            // Use edge-tts CLI
            await execPromise(`edge-tts --text '${safeText}' --write-media '${outputPath}'`);
            return outputPath;
        }
        catch (error) {
            console.error('TTS Error:', error);
            throw new Error('Failed to generate speech');
        }
    }
}
exports.VoiceEngine = VoiceEngine;
//# sourceMappingURL=VoiceEngine.js.map