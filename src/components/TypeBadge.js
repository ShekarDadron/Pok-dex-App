import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE_COLORS } from '../constants/theme';

export default function TypeBadge({ type }) {
  const backgroundColor = TYPE_COLORS[type.toLowerCase()] || '#888888';
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{type.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});