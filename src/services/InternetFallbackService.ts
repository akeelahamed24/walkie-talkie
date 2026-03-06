import { io, Socket } from 'socket.io-client';
import { MeshPacket } from '../types';

class InternetFallbackService {
  private socket: Socket | null = null;

  connect(serverUrl: string, deviceId: string): void {
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      auth: { deviceId },
    });
  }

  onPacket(callback: (packet: MeshPacket) => void): void {
    this.socket?.on('audio-packet', callback);
  }

  sendPacket(packet: MeshPacket): void {
    this.socket?.emit('audio-packet', packet);
  }

  get connected(): boolean {
    return !!this.socket?.connected;
  }
}

export const internetFallbackService = new InternetFallbackService();
