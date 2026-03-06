import { MeshPacket } from '../types';

class MeshService {
  private readonly seenPacketIds = new Set<string>();

  buildPacket(senderId: string, targetDeviceId: string, audioData: string): MeshPacket {
    return {
      id: `${senderId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      senderId,
      targetDeviceId,
      hopCount: 0,
      maxHops: 3,
      timestamp: Date.now(),
      transport: 'bluetooth',
      audioData,
    };
  }

  parsePacket(raw: string): MeshPacket | null {
    try {
      const parsed = JSON.parse(raw) as MeshPacket;
      if (!parsed.id || !parsed.senderId || !parsed.targetDeviceId || !parsed.audioData) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  markSeen(packet: MeshPacket): void {
    this.seenPacketIds.add(packet.id);
  }

  hasSeen(packet: MeshPacket): boolean {
    return this.seenPacketIds.has(packet.id);
  }

  shouldRelay(packet: MeshPacket, localDeviceId: string): boolean {
    if (packet.targetDeviceId === localDeviceId) return false;
    if (packet.hopCount >= packet.maxHops) return false;
    return true;
  }

  toRelayPacket(packet: MeshPacket): MeshPacket {
    return {
      ...packet,
      hopCount: packet.hopCount + 1,
    };
  }
}

export const meshService = new MeshService();
