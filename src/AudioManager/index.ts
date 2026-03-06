import { audioService } from '../services/AudioService';

class AudioManager {
  async initialize(): Promise<void> {
    await audioService.prepare();
  }

  async startTransmission(onChunk: (chunk: string) => Promise<void>): Promise<void> {
    await audioService.startPushToTalk(onChunk);
  }

  async stopTransmission(): Promise<void> {
    await audioService.stopPushToTalk();
  }

  async playChunk(chunk: string): Promise<void> {
    await audioService.playBase64Chunk(chunk);
  }
}

export const audioManager = new AudioManager();
