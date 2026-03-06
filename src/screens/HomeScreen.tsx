import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Device from 'expo-device';
import { audioManager } from '../AudioManager';
import { bluetoothManager } from '../BluetoothManager';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { DeviceList } from '../components/DeviceList';
import { PushToTalkButton } from '../components/PushToTalkButton';
import { meshRouter } from '../MeshRouter';
import { bluetoothService } from '../services/BluetoothService';
import { internetFallbackService } from '../services/InternetFallbackService';
import { PeerDevice } from '../types';

const INTERNET_SERVER_URL = 'ws://YOUR_SOCKET_SERVER:3000';

export function HomeScreen() {
  const [devices, setDevices] = useState<PeerDevice[]>([]);
  const [selected, setSelected] = useState<PeerDevice | null>(null);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [internetConnected, setInternetConnected] = useState(false);
  const [transmitting, setTransmitting] = useState(false);

  const localDeviceId = useMemo(() => Device.osInternalBuildId ?? Device.deviceName ?? `device-${Date.now()}`, []);

  useEffect(() => {
    const init = async () => {
      await audioManager.initialize();
      await bluetoothManager.initialize(async (rawPacket) => {
        await meshRouter.routeIncomingPacket(
          rawPacket,
          localDeviceId,
          async (packet) => {
            await audioManager.playChunk(packet.audioData);
          },
          connectedDeviceId,
        );
      });

      internetFallbackService.connect(INTERNET_SERVER_URL, localDeviceId);
      internetFallbackService.onPacket(async (packet) => {
        if (packet.targetDeviceId === localDeviceId) {
          await audioManager.playChunk(packet.audioData);
        }
      });
    };

    init().catch((error) => {
      Alert.alert('Initialization failed', String(error));
    });
  }, [connectedDeviceId, localDeviceId]);

  const scanDevices = async () => {
    const discovered = await bluetoothService.discoverDevices();
    setDevices(discovered);
  };

  const connectToSelected = async () => {
    if (!selected) return;

    const connected = await bluetoothService.connect(selected.id);
    setConnectedDeviceId(connected ? selected.id : null);
    setBluetoothConnected(connected);

    if (!connected) {
      setInternetConnected(internetFallbackService.connected);
      Alert.alert('Bluetooth unavailable', 'Will try internet fallback for packet delivery.');
    }
  };

  const startTransmit = async () => {
    if (!selected) return;
    setTransmitting(true);

    await audioManager.startTransmission(async (chunk) => {
      const usedTransport = await meshRouter.sendAudio({
        targetDeviceId: selected.id,
        senderId: localDeviceId,
        audioData: chunk,
        connectedDeviceId,
      });

      setBluetoothConnected(usedTransport === 'bluetooth');
      setInternetConnected(usedTransport === 'internet');
    });
  };

  const stopTransmit = async () => {
    setTransmitting(false);
    await audioManager.stopTransmission();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Bluetooth Mesh Walkie-Talkie</Text>

      <ConnectionStatus bluetoothConnected={bluetoothConnected} internetConnected={internetConnected} />

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={scanDevices}>
          <Text style={styles.actionText}>Scan Devices</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={connectToSelected} disabled={!selected}>
          <Text style={styles.actionText}>Connect</Text>
        </Pressable>
      </View>

      <DeviceList devices={devices} selectedId={selected?.id ?? null} onSelect={setSelected} />

      <PushToTalkButton
        transmitting={transmitting}
        onPressIn={() => {
          startTransmit().catch(() => setTransmitting(false));
        }}
        onPressOut={() => {
          stopTransmit().catch(() => setTransmitting(false));
        }}
        disabled={!selected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});
