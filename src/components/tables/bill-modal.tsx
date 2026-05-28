import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandColors } from '@/constants/theme';
import type { OrderItem, PaymentMethod, Table } from '@/types';

type SplitMode = 'none' | 'equal' | 'byItem';

interface BillModalProps {
  visible: boolean;
  table: Table | null;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, tableId: string) => void;
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; emoji: string }[] = [
  { key: 'cash', label: 'Tiền mặt', emoji: '💵' },
  { key: 'qr', label: 'Chuyển khoản QR', emoji: '📲' },
  { key: 'ewallet', label: 'Ví điện tử', emoji: '📱' },
];

export function BillModal({ visible, table, onClose, onConfirm }: BillModalProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>('none');
  const [splitCount, setSplitCount] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  if (!table?.currentOrder) return null;

  const items: OrderItem[] = table.currentOrder.items;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discountAmount;

  const splitCountNum = parseInt(splitCount, 10) || 1;
  const perPerson = splitMode === 'equal' ? Math.ceil(total / splitCountNum) : 0;

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'KIMI10') setDiscountApplied(true);
  };

  const handleConfirm = () => {
    onConfirm(paymentMethod, table.id);
    setSplitMode('none');
    setSplitCount('2');
    setDiscountCode('');
    setDiscountApplied(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hóa đơn – Bàn {table.number}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh sách món</Text>
            {items.map((item, idx) => (
              <View key={`${item.menuItemId}-${idx}`} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>×{item.quantity} × {item.price.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
              </View>
            ))}
          </View>

          {/* Discount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mã giảm giá</Text>
            <View style={styles.discountRow}>
              <TextInput
                style={[styles.discountInput, discountApplied && styles.discountInputApplied]}
                value={discountCode}
                onChangeText={setDiscountCode}
                placeholder="Nhập mã (VD: KIMI10)"
                placeholderTextColor={BrandColors.textMuted}
                autoCapitalize="characters"
                editable={!discountApplied}
              />
              <Pressable
                style={[styles.discountBtn, discountApplied && styles.discountBtnApplied]}
                onPress={applyDiscount}
                disabled={discountApplied}
              >
                <Text style={styles.discountBtnText}>{discountApplied ? '✓' : 'Áp dụng'}</Text>
              </Pressable>
            </View>
            {discountApplied && (
              <Text style={styles.discountSuccess}>🎉 Giảm 10% – tiết kiệm {discountAmount.toLocaleString('vi-VN')}đ</Text>
            )}
          </View>

          {/* Split bill */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chia tiền</Text>
            <View style={styles.splitBtns}>
              {([['none', 'Không chia'], ['equal', 'Chia đều'], ['byItem', 'Theo món']] as [SplitMode, string][]).map(
                ([mode, label]) => (
                  <Pressable
                    key={mode}
                    style={[styles.splitBtn, splitMode === mode && styles.splitBtnActive]}
                    onPress={() => setSplitMode(mode)}
                  >
                    <Text style={[styles.splitBtnText, splitMode === mode && styles.splitBtnTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
            {splitMode === 'equal' && (
              <View style={styles.splitEqualRow}>
                <Text style={styles.splitEqualLabel}>Số người:</Text>
                <TextInput
                  style={styles.splitCountInput}
                  value={splitCount}
                  onChangeText={setSplitCount}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={styles.splitPerPerson}>→ {perPerson.toLocaleString('vi-VN')}đ/người</Text>
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={[styles.section, styles.summarySection]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
            </View>
            {discountApplied && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: BrandColors.success }]}>Giảm giá</Text>
                <Text style={[styles.summaryValue, { color: BrandColors.success }]}>−{discountAmount.toLocaleString('vi-VN')}đ</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentBtns}>
              {PAYMENT_METHODS.map(pm => (
                <Pressable
                  key={pm.key}
                  style={[styles.paymentBtn, paymentMethod === pm.key && styles.paymentBtnActive]}
                  onPress={() => setPaymentMethod(pm.key)}
                >
                  <Text style={styles.paymentEmoji}>{pm.emoji}</Text>
                  <Text style={[styles.paymentLabel, paymentMethod === pm.key && styles.paymentLabelActive]}>
                    {pm.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

        </ScrollView>

        {/* Confirm button */}
        <View style={styles.footer}>
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>✓ Xác nhận đã nhận tiền • Đóng bàn</Text>
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
    borderBottomColor: BrandColors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: BrandColors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemMeta: {
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.brand,
    minWidth: 80,
    textAlign: 'right',
  },
  discountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  discountInput: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  discountInputApplied: {
    borderColor: BrandColors.success,
    color: BrandColors.success,
  },
  discountBtn: {
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  discountBtnApplied: {
    backgroundColor: BrandColors.successFaded,
    borderColor: BrandColors.success,
  },
  discountBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  discountSuccess: {
    fontSize: 13,
    color: BrandColors.success,
    fontWeight: '600',
  },
  splitBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  splitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: BrandColors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  splitBtnActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  splitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  splitBtnTextActive: {
    color: BrandColors.brand,
  },
  splitEqualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splitEqualLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  splitCountInput: {
    width: 56,
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    paddingVertical: 8,
  },
  splitPerPerson: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.brand,
    flex: 1,
  },
  summarySection: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.brand,
  },
  paymentBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentBtn: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  paymentBtnActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  paymentEmoji: {
    fontSize: 24,
  },
  paymentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  paymentLabelActive: {
    color: BrandColors.brand,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
