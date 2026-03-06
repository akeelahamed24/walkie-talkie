import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PeerDevice } from '../types';

interface DeviceListProps {
  devices: PeerDevice[];
  selectedId: string | null;
  onSelect: (device: PeerDevice) => void;
}

export function DeviceList({ devices, selectedId, onSelect }: DeviceListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Walkie-Talkies</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          return (
            <Pressable style={[styles.item, selected && styles.selected]} onPress={() => onSelect(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.id}>{item.id}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No compatible devices found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  item: { backgroundColor: '#1F2937', padding: 12, marginBottom: 8, borderRadius: 8 },
  selected: { borderWidth: 2, borderColor: '#22C55E' },
  name: { color: '#F9FAFB', fontWeight: '600' },
  id: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  empty: { color: '#9CA3AF', fontStyle: 'italic', marginTop: 12 },
});
