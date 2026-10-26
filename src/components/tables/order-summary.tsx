import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BrandColors } from '@/constants/theme';
import type { OrderItem, Table } from '@/types';

interface OrderSummaryProps {
  visible: boolean;
  table: Table | null;
  onClose: () => void;
  onAddMore: () => void;
  onBill: () => void;
  onAddCustomItem?: (name: string, price: number) => void;
  onRemoveItem?: (menuItemId: string) => void;
}

export function OrderSummary({ visible, table, onClose, onAddMore, onBill, onAddCustomItem, onRemoveItem }: OrderSummaryProps) {
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [feeName, setFeeName] = useState('');
  const [feePrice, setFeePrice] = useState('');

  if (!table) return null;

  const items: OrderItem[] = table.currentOrder?.items || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleAddFee = () => {
    const price = parseFloat(feePrice.replace(',', '.'));
    if (feeName && !isNaN(price) && onAddCustomItem) {
      onAddCustomItem(feeName, price);
      setIsAddingFee(false);
      setFeeName('');
      setFeePrice('');
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} heightFraction={0.75}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bàn {table.number} – {table.zone}</Text>
          <Text style={styles.sub}>{items.reduce((s, i) => s + i.quantity, 0)} món • {subtotal.toLocaleString('de-DE')} €</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Items list */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.length === 0
          ? <Text style={styles.empty}>Chưa có món nào</Text>
          : items.map((item, idx) => (
            <View key={`${item.menuItemId}-${idx}`} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.note && <Text style={styles.itemNote}>📝 {item.note}</Text>}
              </View>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
              <View style={styles.itemPriceContainer}>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('de-DE')} €</Text>
                {item.category === 'Phí dịch vụ' && onRemoveItem && (
                  <Pressable style={styles.removeItemBtn} hitSlop={8} onPress={() => onRemoveItem(item.menuItemId)}>
                    <Text style={styles.removeItemBtnText}>✕</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        }

        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tạm tính</Text>
          <Text style={styles.totalValue}>{subtotal.toLocaleString('de-DE')} €</Text>
        </View>

        {!isAddingFee && onAddCustomItem && (
          <Pressable style={styles.addFeeBtn} onPress={() => setIsAddingFee(true)}>
            <Text style={styles.addFeeBtnText}>+ Thêm phí dịch vụ</Text>
          </Pressable>
        )}

        {isAddingFee && onAddCustomItem && (
          <View style={styles.feeInputContainer}>
            <TextInput
              style={styles.feeInput}
              placeholder="Tên phí..."
              placeholderTextColor={BrandColors.textMuted}
              value={feeName}
              onChangeText={setFeeName}
            />
            <TextInput
              style={[styles.feeInput, styles.feePriceInput]}
              placeholder="Giá (€)"
              placeholderTextColor={BrandColors.textMuted}
              keyboardType="numeric"
              value={feePrice}
              onChangeText={setFeePrice}
            />
            <Pressable style={styles.feeConfirmBtn} onPress={handleAddFee}>
              <Text style={styles.feeConfirmBtnText}>Thêm</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.btnSecondary} onPress={onAddMore}>
          <Text style={styles.btnSecondaryText}>+ Gọi thêm món</Text>
        </Pressable>
        <Pressable style={styles.btnPrimary} onPress={onBill}>
          <Text style={styles.btnPrimaryText}>💰 Thanh toán</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  sub: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: BrandColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  empty: {
    color: BrandColors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemNote: {
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    minWidth: 28,
    textAlign: 'right',
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.brand,
    textAlign: 'right',
  },
  removeItemBtn: {
    padding: 2,
    backgroundColor: BrandColors.dangerFaded,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeItemBtnText: {
    color: BrandColors.danger,
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.brand,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: BrandColors.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  addFeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
  },
  addFeeBtnText: {
    color: BrandColors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  feeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 8,
  },
  feeInput: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
    fontSize: 14,
  },
  feePriceInput: {
    flex: 0.6,
  },
  feeConfirmBtn: {
    backgroundColor: BrandColors.brand,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  feeConfirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
