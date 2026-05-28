import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';

interface StatCardProps {
  emoji: string;
  value: number | string;
  label: string;
  color?: string;
}

export function StatCard({ emoji, value, label, color = BrandColors.brand }: StatCardProps) {
  return (
    <View style={[styles.card, { borderColor: color + '30' }]}>
      <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
});
