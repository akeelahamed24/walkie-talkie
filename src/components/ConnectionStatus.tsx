import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConnectionStatusProps {
  bluetoothConnected: boolean;
  internetConnected: boolean;
}

export function ConnectionStatus({ bluetoothConnected, internetConnected }: ConnectionStatusProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.status, bluetoothConnected ? styles.good : styles.bad]}>
        Bluetooth: {bluetoothConnected ? 'Connected' : 'Disconnected'}
      </Text>
      <Text style={[styles.status, internetConnected ? styles.good : styles.bad]}>
        Internet Fallback: {internetConnected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 6, marginBottom: 16 },
  status: { fontWeight: '600' },
  good: { color: '#22C55E' },
  bad: { color: '#F87171' },
});
