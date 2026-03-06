import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const CHUNK_MS = 80;

class AudioService {
  private active = false;
  private recorder: Audio.Recording | null = null;

  async prepare(): Promise<void> {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
  }

  async startPushToTalk(onChunk: (base64Chunk: string) => Promise<void>): Promise<void> {
    if (this.active) return;

    this.active = true;

    while (this.active) {
      const recording = new Audio.Recording();
      this.recorder = recording;

      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
      await recording.startAsync();
      await this.wait(CHUNK_MS);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (uri) {
        const chunk = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await onChunk(chunk);
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    }
  }

  async stopPushToTalk(): Promise<void> {
    this.active = false;
    if (this.recorder) {
      try {
        await this.recorder.stopAndUnloadAsync();
      } catch {
        // Already stopped.
      }
      this.recorder = null;
    }
  }

  async playBase64Chunk(base64Chunk: string): Promise<void> {
    const fileUri = `${FileSystem.cacheDirectory}incoming-${Date.now()}.m4a`;
    await FileSystem.writeAsStringAsync(fileUri, base64Chunk, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: true });
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded && status.didJustFinish) {
        await sound.unloadAsync();
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    });
  }

  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const audioService = new AudioService();
