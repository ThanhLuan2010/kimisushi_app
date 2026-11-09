import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/theme';
import type { OrderHistoryItem, PaymentMethod } from '@/types';

interface HistoryDetailModalProps {
  visible: boolean;
  item: OrderHistoryItem | null;
  onClose: () => void;
}

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; emoji: string }> = {
  cash: { label: 'Tiền mặt (Bar)', emoji: '💵' },
  card: { label: 'Thẻ ngân hàng (Karte)', emoji: '💳' },
  qr: { label: 'Chuyển khoản QR', emoji: '📲' },
  ewallet: { label: 'Ví điện tử', emoji: '📱' },
};

export function HistoryDetailModal({ visible, item, onClose }: HistoryDetailModalProps) {
  const insets = useSafeAreaInsets();
  if (!item) return null;

  const isDineIn = item.method === 'dine-in';
  const payConfig = PAYMENT_LABELS[item.paymentMethod] || PAYMENT_LABELS.cash;

  const dateObj = new Date(item.completedAt || item.createdAt);
  const timeFormatted = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  const dateFormatted = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`;

  const subtotal = item.items.reduce((s, i) => s + (i.price * i.quantity), 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Chi tiết hoá đơn</Text>
            <Text style={styles.orderId}>#{item.id}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hình thức phục vụ:</Text>
              <Text style={styles.infoValue}>
                {isDineIn ? '🍽 Tại bàn (Dine-in)' : item.method === 'delivery' ? '🚴 Giao hàng' : '🏪 Khách tự lấy'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{isDineIn ? 'Bàn / Khách:' : 'Tên khách:'}</Text>
              <Text style={[styles.infoValue, { fontWeight: '700' }]}>
                {isDineIn ? (item.tableName || `Bàn ${item.tableId}`) : item.customerName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số lượng khách:</Text>
              <Text style={styles.infoValue}>👥 {item.guests || 1} người</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian:</Text>
              <Text style={styles.infoValue}>🕒 {timeFormatted} — {dateFormatted}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thanh toán bằng:</Text>
              <Text style={[styles.infoValue, { color: BrandColors.success, fontWeight: '700' }]}>
                {payConfig.emoji} {payConfig.label}
              </Text>
            </View>

            {item.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <Text style={styles.infoValue}>{item.customerPhone}</Text>
              </View>
            )}

            {item.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Địa chỉ giao:</Text>
                <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>{item.address}</Text>
              </View>
            )}
          </View>

          {/* Items List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh sách món đã dùng ({item.items.length} món)</Text>
            <View style={styles.itemsTable}>
              {item.items.map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemQty}>{it.quantity}x</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{it.name}</Text>
                      {it.note ? <Text style={styles.itemNote}>↳ {it.note}</Text> : null}
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>
                    {(it.price * it.quantity).toFixed(2).replace('.', ',')} €
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Notes if any */}
          {item.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{item.notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{subtotal.toFixed(2).replace('.', ',')} €</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TỔNG THANH TOÁN:</Text>
              <Text style={styles.totalValue}>{item.total.toFixed(2).replace('.', ',')} €</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) : Math.max(insets.bottom, 16) }]}>
          <Pressable style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  orderId: {
    fontSize: 12,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: BrandColors.textMuted,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#161626',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#26263D',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: '#fff',
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  itemsTable: {
    backgroundColor: '#161626',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#26263D',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  itemQty: {
    color: BrandColors.brand,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 26,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemNote: {
    color: BrandColors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  noteBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderRadius: 10,
    padding: 12,
  },
  noteText: {
    color: '#FCD34D',
    fontSize: 13,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#161626',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#26263D',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: BrandColors.brand,
    fontSize: 20,
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  doneBtn: {
    backgroundColor: '#26263D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
