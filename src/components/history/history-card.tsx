import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '@/constants/theme';
import type { OrderHistoryItem, PaymentMethod } from '@/types';

interface HistoryCardProps {
  item: OrderHistoryItem;
  onPress: (item: OrderHistoryItem) => void;
}

const PAYMENT_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  cash: { label: 'Bar', emoji: '💵', color: '#10B981' },
  bar: { label: 'Bar', emoji: '💵', color: '#10B981' },
  card: { label: 'EC Karte', emoji: '💳', color: '#3B82F6' },
  ec_card: { label: 'EC Karte', emoji: '💳', color: '#3B82F6' },
  kreditkarte: { label: 'Kreditkarte', emoji: '💳', color: '#8B5CF6' },
  ewallet: { label: 'Kreditkarte', emoji: '💳', color: '#8B5CF6' },
  ueberweisung: { label: 'Überweisung', emoji: '🏦', color: '#F59E0B' },
  qr: { label: 'Überweisung', emoji: '🏦', color: '#F59E0B' },
};

export function HistoryCard({ item, onPress }: HistoryCardProps) {
  const isDineIn = item.method === 'dine-in';
  const payConfig = PAYMENT_CONFIG[item.paymentMethod] || PAYMENT_CONFIG.cash;

  const dateObj = new Date(item.completedAt || item.createdAt);
  const timeFormatted = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  const dateFormatted = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`;

  // Tổng số món
  const totalItemsCount = item.items.reduce((s, i) => s + i.quantity, 0);

  // Preview 2-3 món đầu
  const previewItems = item.items.slice(0, 3).map(i => `${i.quantity}x ${i.name}`).join(' • ');
  const moreCount = item.items.length > 3 ? item.items.length - 3 : 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.typeEmoji}>{isDineIn ? '🍽' : item.method === 'delivery' ? '🚴' : '🏪'}</Text>
          <View>
            <Text style={styles.titleText}>
              {isDineIn ? (item.tableName || `Bàn #${item.tableId}`) : item.customerName}
            </Text>
            {!isDineIn && item.tableName && (
              <Text style={styles.subTitleText}>{item.tableName}</Text>
            )}
          </View>
        </View>

        <View style={[styles.methodBadge, { backgroundColor: isDineIn ? 'rgba(59, 130, 246, 0.15)' : 'rgba(249, 115, 22, 0.15)' }]}>
          <Text style={[styles.methodBadgeText, { color: isDineIn ? '#60A5FA' : '#FB923C' }]}>
            {isDineIn ? 'Tại bàn' : item.method === 'delivery' ? 'Giao hàng' : 'Tự lấy'}
          </Text>
        </View>
      </View>

      {/* Info Row: Guests & Time */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>👥 {item.guests || 1} khách</Text>
        </View>
        <Text style={styles.metaDot}>•</Text>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>🕒 {timeFormatted} ({dateFormatted})</Text>
        </View>
      </View>

      {/* Payment Method Badge */}
      <View style={styles.paymentRow}>
        <View style={[styles.paymentBadge, { borderColor: payConfig.color }]}>
          <Text style={styles.paymentEmoji}>{payConfig.emoji}</Text>
          <Text style={[styles.paymentLabel, { color: payConfig.color }]}>{payConfig.label}</Text>
        </View>
      </View>

      {/* Items Preview */}
      <View style={styles.itemsPreview}>
        <Text style={styles.itemsPreviewText} numberOfLines={2}>
          {previewItems}
          {moreCount > 0 && <Text style={styles.itemsMoreText}> (+{moreCount} món khác)</Text>}
        </Text>
      </View>

      {/* Footer: Item Count & Total */}
      <View style={styles.footerRow}>
        <Text style={styles.itemCountText}>Tổng {totalItemsCount} phần món</Text>
        <Text style={styles.totalText}>{item.total.toFixed(2).replace('.', ',')} €</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161626',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#26263D',
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: '#1C1C30',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  typeEmoji: {
    fontSize: 22,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subTitleText: {
    color: BrandColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  methodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
  metaDot: {
    color: '#4B4B68',
    fontSize: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  paymentEmoji: {
    fontSize: 13,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  itemsPreviewText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  itemsMoreText: {
    color: BrandColors.textMuted,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  itemCountText: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
  totalText: {
    color: BrandColors.brand,
    fontSize: 18,
    fontWeight: '800',
  },
});
