"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceEngine = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
class VoiceEngine {
    constructor() {
        // Resolve path relative to this file — works in both dev (src/) and prod (dist/)
        const scriptDir = path_1.default.join(__dirname, '..', '..', 'src', 'core');
        const fallbackDir = path_1.default.join(__dirname);
        const srcPath = path_1.default.join(scriptDir, 'stt_helper.py');
        const distPath = path_1.default.join(fallbackDir, 'stt_helper.py');
        if (fs_1.default.existsSync(srcPath)) {
            this.sttScriptPath = srcPath;
        }
        else if (fs_1.default.existsSync(distPath)) {
            this.sttScriptPath = distPath;
        }
        else {
            this.sttScriptPath = srcPath; // default, will error gracefully if missing
        }
    }
    async speechToText(audioPath) {
        try {
            const { stdout, stderr } = await execPromise(`python3 "${this.sttScriptPath}" "${audioPath}"`);
            if (stderr)
                console.warn('[STT] Warning:', stderr);
            return stdout.trim();
        }
        catch (error) {
            console.error('[STT] Error:', error?.message ?? error);
            return '';
        }
    }
    async textToSpeech(text, outputDir) {
        try {
            const dir = outputDir ?? process.cwd();
            const outputPath = path_1.default.join(dir, `tts_${Date.now()}.mp3`);
            // Safely escape for shell — replace single quotes
            const safeText = text.replace(/'/g, "'\\''");
            await execPromise(`edge-tts --text '${safeText}' --write-media '${outputPath}'`);
            return outputPath;
        }
        catch (error) {
            console.error('[TTS] Error:', error?.message ?? error);
            throw new Error('TTS generation failed. Is edge-tts installed? Run: pip install edge-tts');
        }
    }
    /** Check if voice dependencies are available */
    async checkDependencies() {
        const sttOk = fs_1.default.existsSync(this.sttScriptPath);
        let ttsOk = false;
        try {
            await execPromise('edge-tts --version');
            ttsOk = true;
        }
        catch { }
        return { stt: sttOk, tts: ttsOk };
    }
}
exports.VoiceEngine = VoiceEngine;
//# sourceMappingURL=VoiceEngine.js.map