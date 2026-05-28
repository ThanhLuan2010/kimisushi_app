import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { BrandColors } from '@/constants/theme';
import type { OnlineOrder } from '@/types';

interface OnlineOrderCardProps {
  order: OnlineOrder;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function minutesAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

export function OnlineOrderCard({ order, onAccept, onComplete }: OnlineOrderCardProps) {
  const ago = minutesAgo(order.createdAt);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.customerPhone}>{order.customerPhone}</Text>
        </View>
        <View style={styles.headerRight}>
          <Badge
            label={order.deliveryType === 'delivery' ? '🛵 Giao hàng' : '🏠 Tại quán'}
            variant={order.deliveryType === 'delivery' ? 'info' : 'success'}
          />
          <Text style={styles.time}>{formatTime(order.createdAt)} ({ago} phút trước)</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.items}>
        {order.items.map((item, idx) => (
          <Text key={idx} style={styles.itemText}>
            {item.name} × {item.quantity}
          </Text>
        ))}
      </View>

      {/* Address */}
      {order.deliveryType === 'delivery' && order.address && (
        <Text style={styles.address}>📍 {order.address}</Text>
      )}

      {order.note && <Text style={styles.note}>📝 {order.note}</Text>}

      {/* Estimated time */}
      {order.estimatedMinutes && (
        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>⏱ Dự kiến: {order.estimatedMinutes} phút</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.total}>
          {order.total.toLocaleString('vi-VN')}đ
        </Text>
        <View style={styles.actions}>
          {order.status === 'pending' && onAccept && (
            <Pressable
              style={styles.btnAccept}
              onPress={() => onAccept(order.id)}
            >
              <Text style={styles.btnText}>✓ Nhận đơn</Text>
            </Pressable>
          )}
          {order.status === 'cooking' && onComplete && (
            <Pressable
              style={styles.btnComplete}
              onPress={() => onComplete(order.id)}
            >
              <Text style={styles.btnText}>🎉 Hoàn thành</Text>
            </Pressable>
          )}
          {order.status === 'done' && (
            <View style={styles.doneTag}>
              <Text style={styles.doneTagText}>✓ Đã xong</Text>
            </View>
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
    gap: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  customerPhone: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: BrandColors.textMuted,
    fontWeight: '500',
  },
  items: {
    gap: 4,
    paddingLeft: 4,
  },
  itemText: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  address: {
    fontSize: 13,
    color: BrandColors.info,
    fontWeight: '500',
  },
  note: {
    fontSize: 13,
    color: BrandColors.warning,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  etaBadge: {
    backgroundColor: BrandColors.warningFaded,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.warning,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingTop: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.brand,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAccept: {
    backgroundColor: BrandColors.brand,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnComplete: {
    backgroundColor: BrandColors.success,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  doneTag: {
    backgroundColor: BrandColors.successFaded,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doneTagText: {
    color: BrandColors.success,
    fontSize: 13,
    fontWeight: '700',
  },
});
