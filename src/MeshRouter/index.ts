import { bluetoothService } from '../services/BluetoothService';
import { internetFallbackService } from '../services/InternetFallbackService';
import { meshService } from '../services/MeshService';
import { MeshPacket, Transport } from '../types';

interface SendOptions {
  targetDeviceId: string;
  senderId: string;
  audioData: string;
  connectedDeviceId: string | null;
}

class MeshRouter {
  async sendAudio(options: SendOptions): Promise<Transport> {
    const packet = meshService.buildPacket(options.senderId, options.targetDeviceId, options.audioData);

    if (options.connectedDeviceId) {
      const sent = await bluetoothService.send(options.connectedDeviceId, JSON.stringify(packet));
      if (sent) {
        return 'bluetooth';
      }
    }

    packet.transport = 'internet';
    internetFallbackService.sendPacket(packet);
    return 'internet';
  }

  async routeIncomingPacket(
    rawPacket: string,
    localDeviceId: string,
    onTargetReached: (packet: MeshPacket) => Promise<void>,
    relayToDeviceId: string | null,
  ): Promise<void> {
    const packet = meshService.parsePacket(rawPacket);
    if (!packet || meshService.hasSeen(packet)) return;

    meshService.markSeen(packet);

    if (packet.targetDeviceId === localDeviceId) {
      await onTargetReached(packet);
      return;
    }

    if (meshService.shouldRelay(packet, localDeviceId) && relayToDeviceId) {
      const relayed = meshService.toRelayPacket(packet);
      await bluetoothService.send(relayToDeviceId, JSON.stringify(relayed));
    }
  }
}

export const meshRouter = new MeshRouter();
