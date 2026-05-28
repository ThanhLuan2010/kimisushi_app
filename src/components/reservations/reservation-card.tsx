import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { BrandColors } from '@/constants/theme';
import type { Reservation } from '@/types';

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm?: (id: string) => void;
}

function formatArrival(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const statusConfig = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' as const },
  confirmed: { label: 'Đã xác nhận', variant: 'success' as const },
  cancelled: { label: 'Đã hủy', variant: 'danger' as const },
  arrived: { label: 'Đã đến', variant: 'brand' as const },
};

export function ReservationCard({ reservation, onConfirm }: ReservationCardProps) {
  const status = statusConfig[reservation.status];

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Left: Time */}
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{formatArrival(reservation.arrivalTime)}</Text>
          <Text style={styles.timeLabel}>giờ đến</Text>
        </View>

        {/* Middle: Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{reservation.customerName}</Text>
          <Text style={styles.phone}>{reservation.customerPhone}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>👥 {reservation.partySize} người</Text>
            {reservation.tableId && (
              <Text style={styles.detail}>🪑 Bàn #{reservation.tableId.replace('t', '')}</Text>
            )}
          </View>
          {reservation.note && (
            <Text style={styles.note} numberOfLines={2}>📝 {reservation.note}</Text>
          )}
        </View>

        {/* Right: Status + Action */}
        <View style={styles.right}>
          <Badge label={status.label} variant={status.variant} />
          {reservation.status === 'pending' && onConfirm && (
            <Pressable
              style={styles.confirmBtn}
              onPress={() => onConfirm(reservation.id)}
            >
              <Text style={styles.confirmBtnText}>✓ Xác nhận</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  timeBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.brandFaded,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 60,
    gap: 2,
  },
  time: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.brand,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BrandColors.brandLight,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  phone: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  detail: {
    fontSize: 12,
    color: BrandColors.textMuted,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: BrandColors.warning,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
