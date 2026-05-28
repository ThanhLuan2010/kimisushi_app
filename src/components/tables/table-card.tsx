import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors, TableStatusColors } from '@/constants/theme';
import type { Table } from '@/types';

interface TableCardProps {
  table: Table;
  onPress: (table: Table) => void;
}

function formatDuration(isoTime?: string): string {
  if (!isoTime) return '';
  const mins = Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000);
  if (mins < 60) return `${mins} phút`;
  return `${Math.floor(mins / 60)}g${mins % 60}p`;
}

export function TableCard({ table, onPress }: TableCardProps) {
  const statusColor = TableStatusColors[table.status];
  const duration = table.status === 'occupied' ? formatDuration(table.occupiedAt) : null;
  const itemCount = table.currentOrder?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor: statusColor.border + '80' },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(table)}
    >
      {/* Status dot */}
      <View style={[styles.statusDot, { backgroundColor: statusColor.border }]} />

      {/* Table number */}
      <Text style={styles.tableNumber}>{table.number}</Text>
      <Text style={styles.zone}>{table.zone}</Text>

      {/* Capacity */}
      <View style={styles.capacityRow}>
        <Text style={styles.capacityIcon}>👤</Text>
        <Text style={styles.capacityText}>{table.capacity}</Text>
      </View>

      {/* Status info */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
        <Text style={[styles.statusText, { color: statusColor.text }]}>
          {statusColor.label}
        </Text>
      </View>

      {/* Extra info */}
      {duration && (
        <Text style={styles.duration}>⏱ {duration}</Text>
      )}
      {table.status === 'occupied' && itemCount > 0 && (
        <Text style={styles.itemCount}>{itemCount} món</Text>
      )}
      {table.status === 'reserved' && table.reservedTime && (
        <Text style={styles.reservedTime}>📅 {table.reservedTime}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    minHeight: 140,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  statusDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tableNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 36,
  },
  zone: {
    fontSize: 10,
    fontWeight: '600',
    color: BrandColors.textMuted,
    letterSpacing: 0.3,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  capacityIcon: {
    fontSize: 10,
  },
  capacityText: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  duration: {
    fontSize: 11,
    color: BrandColors.warning,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  reservedTime: {
    fontSize: 11,
    color: BrandColors.warning,
    fontWeight: '600',
  },
});
