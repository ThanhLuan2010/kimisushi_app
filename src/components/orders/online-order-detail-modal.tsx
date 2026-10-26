import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandColors } from '@/constants/theme';
import type { OnlineOrder } from '@/types';

interface OnlineOrderDetailModalProps {
  order: OnlineOrder | null;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onComplete?: (id: string, skipEmail?: boolean) => void;
}

const statusConfig = {
  pending: { label: 'Chờ nhận', variant: 'warning' as const },
  cooking: { label: 'Đang làm', variant: 'info' as const },
  done: { label: 'Hoàn thành', variant: 'success' as const },
  cancelled: { label: 'Đã hủy', variant: 'danger' as const },
};

function formatDateTime(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  const date = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return `${date} lúc ${time}`;
}

function formatPickupDate(dateStr?: string) {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    return dateStr.split('-').reverse().join('.');
  }
  return dateStr;
}

export function OnlineOrderDetailModal({ order, onClose, onAccept, onComplete }: OnlineOrderDetailModalProps) {
  const insets = useSafeAreaInsets();
  if (!order) return null;

  const status = statusConfig[order.status] || { label: order.status, variant: 'warning' as const };
  const isDelivery = order.deliveryType === 'delivery';

  // Calculate Subtotal if there is a discount
  const discountVal = order.discountAmount || 0;
  const subtotalVal = order.total + discountVal;

  return (
    <Modal visible={!!order} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chi tiết Đơn hàng</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Customer Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Họ tên:</Text>
                <Text style={styles.value}>{order.customerName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Điện thoại:</Text>
                <Text style={styles.value}>{order.customerPhone}</Text>
              </View>
              {order.customerEmail ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{order.customerEmail}</Text>
                </View>
              ) : null}
            </View>

            {/* Order Settings & Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin giao nhận</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Mã đơn hàng:</Text>
                <Text style={styles.value}>#{order.id}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Hình thức:</Text>
                <Badge
                  label={isDelivery ? '🛵 Giao tận nơi' : '🏠 Đến lấy / Tại quán'}
                  variant={isDelivery ? 'info' : 'success'}
                />
              </View>

              {/* Delivery Address */}
              {isDelivery && order.address ? (
                <View style={[styles.row, { alignItems: 'flex-start', marginVertical: 4 }]}>
                  <Text style={[styles.label, { marginTop: 2 }]}>Địa chỉ giao:</Text>
                  <Text style={[styles.value, { textAlign: 'right', color: BrandColors.info }]}>
                    📍 {order.address}
                  </Text>
                </View>
              ) : null}

              {/* Time scheduled */}
              <View style={styles.row}>
                <Text style={styles.label}>Thời gian nhận:</Text>
                <Text style={styles.valueHighlight}>
                  {order.pickupTime === 'asap' || !order.pickupTime
                    ? 'Càng sớm càng tốt (ASAP)'
                    : `${formatPickupDate(order.pickupDate)} vào lúc ${order.pickupTime} Uhr`}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Thời gian đặt:</Text>
                <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
              </View>

              {order.estimatedMinutes ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Dự kiến hoàn thành:</Text>
                  <Text style={[styles.value, { color: BrandColors.warning, fontWeight: '700' }]}>
                    ⏱ {order.estimatedMinutes} phút
                  </Text>
                </View>
              ) : null}

              <View style={styles.row}>
                <Text style={styles.label}>Trạng thái đơn:</Text>
                <Badge label={status.label} variant={status.variant} />
              </View>
            </View>

            {/* Items list */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Món ăn đã đặt</Text>
              <View style={styles.itemsList}>
                {order.items.map((item, idx) => {
                  const itemSubtotal = item.price * item.quantity;
                  return (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemName}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemQtyPrice}>
                          {item.quantity} × {item.price.toLocaleString('de-DE')} €
                        </Text>
                        {item.note ? (
                          <Text style={styles.itemNote}>
                            ↳ Ghi chú: {item.note}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.itemRightPrice}>
                        {itemSubtotal.toLocaleString('de-DE')} €
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* General Note */}
            {order.note ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{order.note}</Text>
                </View>
              </View>
            ) : null}

            {/* Bill Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
              {discountVal > 0 ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>Tạm tính:</Text>
                    <Text style={styles.value}>{subtotalVal.toLocaleString('de-DE')} €</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Khuyến mãi ({order.discountCode || 'CODE'}):</Text>
                    <Text style={[styles.value, { color: BrandColors.success }]}>
                      -{discountVal.toLocaleString('de-DE')} €
                    </Text>
                  </View>
                </>
              ) : null}
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12, marginTop: 4 }]}>
                <Text style={[styles.label, { fontSize: 16, fontWeight: '700', color: '#fff' }]}>Tổng thanh toán:</Text>
                <Text style={[styles.value, { fontSize: 19, fontWeight: '800', color: BrandColors.brand }]}>
                  {order.total.toLocaleString('de-DE')} €
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 28) : Math.max(insets.bottom, 16) }]}>
            {order.status === 'pending' && onAccept ? (
              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  onAccept(order.id);
                  onClose();
                }}
              >
                <Text style={styles.confirmBtnText}>
                  {order.pickupTime && order.pickupTime !== 'asap'
                    ? '✓ Xác nhận đơn hàng'
                    : '✓ Nhận đơn và Chọn thời gian'}
                </Text>
              </Pressable>
            ) : order.status === 'cooking' && onComplete ? (
              <View style={{ gap: 12 }}>
                <Pressable
                  style={[styles.confirmBtn, { backgroundColor: BrandColors.success }]}
                  onPress={() => {
                    onComplete(order.id, false);
                    onClose();
                  }}
                >
                  <Text style={styles.confirmBtnText}>🎉 Hoàn thành đơn hàng</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: BrandColors.border }]}
                  onPress={() => {
                    onComplete(order.id, true);
                    onClose();
                  }}
                >
                  <Text style={[styles.confirmBtnText, { color: BrandColors.textSecondary }]}>Hoàn thành và ko gửi mail</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.closeActionBtn} onPress={onClose}>
                <Text style={styles.closeActionBtnText}>Đóng</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: BrandColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: BrandColors.surfaceElevated,
    borderRadius: 20,
  },
  closeIcon: {
    color: BrandColors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    backgroundColor: BrandColors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.brandLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  valueHighlight: {
    fontSize: 14,
    color: BrandColors.brand,
    fontWeight: '700',
    flex: 2,
    textAlign: 'right',
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemLeft: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemQtyPrice: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  itemNote: {
    fontSize: 12,
    color: BrandColors.warning,
    fontStyle: 'italic',
  },
  itemRightPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
    minWidth: 70,
  },
  noteBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.warning,
  },
  noteText: {
    color: BrandColors.warning,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  closeActionBtn: {
    backgroundColor: BrandColors.surfaceElevated,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  closeActionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
