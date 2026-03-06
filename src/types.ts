export type Transport = 'bluetooth' | 'internet';

export interface MeshPacket {
  id: string;
  senderId: string;
  targetDeviceId: string;
  hopCount: number;
  maxHops: number;
  timestamp: number;
  transport: Transport;
  audioData: string;
}

export interface PeerDevice {
  id: string;
  name: string;
  address?: string;
}

export interface ConnectionState {
  connectedDeviceId: string | null;
  isBluetoothConnected: boolean;
  isInternetConnected: boolean;
}
