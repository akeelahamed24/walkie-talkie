import BackgroundService from 'react-native-background-actions';
import { bluetoothService } from '../services/BluetoothService';

class BluetoothManager {
  async initialize(onMessage: (message: string) => void): Promise<void> {
    const enabled = await bluetoothService.requestPermissions();
    if (!enabled) {
      throw new Error('Bluetooth is unavailable or permissions are missing.');
    }

    bluetoothService.startListening(onMessage);
    await this.startBackgroundListener();
  }

  async startBackgroundListener(): Promise<void> {
    if (BackgroundService.isRunning()) return;

    const veryLightweightTask = async () => {
      while (BackgroundService.isRunning()) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    await BackgroundService.start(veryLightweightTask, {
      taskName: 'WalkieTalkieListener',
      taskTitle: 'Walkie-Talkie is listening',
      taskDesc: 'Listening for incoming Bluetooth audio packets.',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#1D4ED8',
      parameters: {},
    });
  }
}

export const bluetoothManager = new BluetoothManager();
