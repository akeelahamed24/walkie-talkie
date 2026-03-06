import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface PushToTalkButtonProps {
  transmitting: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
}

export function PushToTalkButton({ transmitting, onPressIn, onPressOut, disabled }: PushToTalkButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.button, transmitting && styles.active, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{transmitting ? 'Transmitting...' : 'Hold to Talk'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  active: { backgroundColor: '#DC2626' },
  disabled: { backgroundColor: '#6B7280' },
  label: { color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' },
});
