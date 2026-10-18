import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RETRO_COLORS } from '../constants/theme';

export default function StatBar({ label, value, max = 255 }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    width: 105,
    fontSize: 11,
    fontWeight: 'bold',
    color: RETRO_COLORS.textPrimary,
  },
  value: {
    width: 32,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 8,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: RETRO_COLORS.statBarBg,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#AAAAAA',
  },
  barFill: {
    height: '100%',
    backgroundColor: RETRO_COLORS.statBarFill,
  },
});