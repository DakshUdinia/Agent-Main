import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class VoiceEngine {
  // FIX: stt_helper.py must be referenced from src/, not dist/
  // We copy it to dist/ via the build, or reference the src path at runtime.
  private sttScriptPath: string;

  constructor() {
    // Resolve path relative to this file — works in both dev (src/) and prod (dist/)
    const scriptDir = path.join(__dirname, '..', '..', 'src', 'core');
    const fallbackDir = path.join(__dirname);

    const srcPath = path.join(scriptDir, 'stt_helper.py');
    const distPath = path.join(fallbackDir, 'stt_helper.py');

    if (fs.existsSync(srcPath)) {
      this.sttScriptPath = srcPath;
    } else if (fs.existsSync(distPath)) {
      this.sttScriptPath = distPath;
    } else {
      this.sttScriptPath = srcPath; // default, will error gracefully if missing
    }
  }

  async speechToText(audioPath: string): Promise<string> {
    try {
      const { stdout, stderr } = await execPromise(
        `python3 "${this.sttScriptPath}" "${audioPath}"`
      );
      if (stderr) console.warn('[STT] Warning:', stderr);
      return stdout.trim();
    } catch (error: any) {
      console.error('[STT] Error:', error?.message ?? error);
      return '';
    }
  }

  async textToSpeech(text: string, outputDir?: string): Promise<string> {
    try {
      const dir = outputDir ?? process.cwd();
      const outputPath = path.join(dir, `tts_${Date.now()}.mp3`);

      // Safely escape for shell — replace single quotes
      const safeText = text.replace(/'/g, "'\\''");
      await execPromise(`edge-tts --text '${safeText}' --write-media '${outputPath}'`);

      return outputPath;
    } catch (error: any) {
      console.error('[TTS] Error:', error?.message ?? error);
      throw new Error('TTS generation failed. Is edge-tts installed? Run: pip install edge-tts');
    }
  }

  /** Check if voice dependencies are available */
  async checkDependencies(): Promise<{ stt: boolean; tts: boolean }> {
    const sttOk = fs.existsSync(this.sttScriptPath);
    let ttsOk = false;
    try {
      await execPromise('edge-tts --version');
      ttsOk = true;
    } catch {}
    return { stt: sttOk, tts: ttsOk };
  }
}
