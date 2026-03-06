import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PeerDevice } from '../types';

const APP_DISCOVERY_PREFIX = 'WT-APP';

class BluetoothService {
  private listener?: { remove: () => void };

  async requestPermissions(): Promise<boolean> {
    try {
      await RNBluetoothClassic.requestBluetoothEnabled();
      return true;
    } catch {
      return false;
    }
  }

  async discoverDevices(): Promise<PeerDevice[]> {
    const bonded = await RNBluetoothClassic.getBondedDevices();
    return bonded
      .filter((device: any) => (device?.name ?? '').includes(APP_DISCOVERY_PREFIX))
      .map((device: any) => ({
        id: device.address,
        name: device.name ?? 'Unknown',
        address: device.address,
      }));
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      const device = await RNBluetoothClassic.getDevice(deviceId);
      return await device.connect();
    } catch {
      return false;
    }
  }

  async send(deviceId: string, payload: string): Promise<boolean> {
    try {
      const device = await RNBluetoothClassic.getDevice(deviceId);
      await device.write(`${payload}\n`);
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    const device = await RNBluetoothClassic.getDevice(deviceId);
    await device.disconnect();
  }

  startListening(onMessage: (message: string) => void): void {
    this.listener = RNBluetoothClassic.onDataReceived((event: any) => {
      if (typeof event?.data === 'string') {
        onMessage(event.data);
      }
    });
  }

  stopListening(): void {
    this.listener?.remove();
  }
}

export const bluetoothService = new BluetoothService();
