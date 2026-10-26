import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import type { OrderItem, PaymentMethod, Table } from '@/types';

type SplitMode = 'none' | 'equal' | 'byItem';

interface BillModalProps {
  visible: boolean;
  table: Table | null;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, tableId: string, remainingItems?: OrderItem[] | null) => void;
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; emoji: string }[] = [
  { key: 'cash', label: 'Tiền mặt', emoji: '💵' },
  { key: 'qr', label: 'Chuyển khoản QR', emoji: '📲' },
  { key: 'ewallet', label: 'Ví điện tử', emoji: '📱' },
];

export function BillModal({ visible, table, onClose, onConfirm }: BillModalProps) {
  const insets = useSafeAreaInsets();
  const [splitMode, setSplitMode] = useState<SplitMode>('none');
  const [splitCount, setSplitCount] = useState('2');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  // State for split by item: map of menuItemId to quantity selected by the current person
  const [splitItemsByPerson, setSplitItemsByPerson] = useState<Record<number, Record<string, number>>>({ 1: {} });
  const [activePersonId, setActivePersonId] = useState(1);
  if (!table?.currentOrder) return null;

  const items: OrderItem[] = table.currentOrder.items;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = discountApplied ? Math.round((subtotal * 0.1) * 100) / 100 : 0;
  const total = Math.round((subtotal - discountAmount) * 100) / 100;

  const splitCountNum = parseInt(splitCount, 10) || 1;
  const perPerson = splitMode === 'equal' ? Math.round((total / splitCountNum) * 100) / 100 : 0;

  const persons = Object.keys(splitItemsByPerson).map(Number);
  const currentPersonItems = splitItemsByPerson[activePersonId] || {};

  const getSplitSubtotalForPerson = (personId: number) => {
    const pItems = splitItemsByPerson[personId] || {};
    return Object.entries(pItems).reduce((sum, [id, qty]) => {
      const item = items.find(i => i.menuItemId === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const splitByItemSubtotal = getSplitSubtotalForPerson(activePersonId);
  const splitByItemDiscount = discountApplied ? Math.round((splitByItemSubtotal * 0.1) * 100) / 100 : 0;
  const splitByItemTotal = Math.round((splitByItemSubtotal - splitByItemDiscount) * 100) / 100;

  const handleSplitItemChange = (id: string, delta: number, max: number) => {
    setSplitItemsByPerson(prev => {
      const currentPersonData = prev[activePersonId] || {};
      const current = currentPersonData[id] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return {
        ...prev,
        [activePersonId]: {
          ...currentPersonData,
          [id]: next,
        },
      };
    });
  };

  const addPerson = () => {
    const newId = Math.max(...persons, 0) + 1;
    setSplitItemsByPerson(prev => ({ ...prev, [newId]: {} }));
    setActivePersonId(newId);
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'KIMI10') setDiscountApplied(true);
  };

  const handleConfirm = () => {
    onConfirm('cash', table.id);
    setSplitMode('none');
    setSplitCount('2');
    setDiscountCode('');
    setDiscountApplied(false);
    setSplitItemsByPerson({ 1: {} });
    setActivePersonId(1);
  };

  const handlePayForActivePerson = () => {
    const activePersonItems = splitItemsByPerson[activePersonId] || {};
    const hasSelectedItems = Object.values(activePersonItems).some(qty => qty > 0);
    if (!hasSelectedItems) {
      Alert.alert('Thông báo', `Vui lòng chọn ít nhất 1 món cho Person ${activePersonId} để thanh toán.`);
      return;
    }

    // Calculate remaining items on the table
    const remainingItems: OrderItem[] = items.map(item => {
      const selectedQty = activePersonItems[item.menuItemId] || 0;
      return {
        ...item,
        quantity: item.quantity - selectedQty,
      };
    }).filter(item => item.quantity > 0);

    // Call onConfirm with remainingItems
    onConfirm('cash', table.id, remainingItems);

    // Update local state: remove active person's split items
    setSplitItemsByPerson(prev => {
      const next = { ...prev };
      delete next[activePersonId];
      
      const remainingPersonIds = Object.keys(next).map(Number);
      if (remainingPersonIds.length > 0) {
        setActivePersonId(remainingPersonIds[0]);
        return next;
      } else {
        setActivePersonId(1);
        return { 1: {} };
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rechnung – Tisch {table.number}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bestellte Artikel</Text>
            {items.map((item, idx) => (
              <View key={`${item.menuItemId}-${idx}`} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>×{item.quantity} × {item.price.toLocaleString('de-DE')} €</Text>
                <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString('de-DE')} €</Text>
              </View>
            ))}
          </View>

          {/* Discount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rabattcode</Text>
            <View style={styles.discountRow}>
              <TextInput
                style={[styles.discountInput, discountApplied && styles.discountInputApplied]}
                value={discountCode}
                onChangeText={setDiscountCode}
                placeholder="Code eingeben (z.B. KIMI10)"
                placeholderTextColor={BrandColors.textMuted}
                autoCapitalize="characters"
                editable={!discountApplied}
              />
              <Pressable
                style={[styles.discountBtn, discountApplied && styles.discountBtnApplied]}
                onPress={applyDiscount}
                disabled={discountApplied}
              >
                <Text style={styles.discountBtnText}>{discountApplied ? '✓' : 'Anwenden'}</Text>
              </Pressable>
            </View>
            {discountApplied && (
              <Text style={styles.discountSuccess}>🎉 10% Rabatt – {discountAmount.toLocaleString('de-DE')} € gespart</Text>
            )}
          </View>

          {/* Split bill */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rechnung aufteilen</Text>
            <View style={styles.splitBtns}>
              {([['none', 'Nicht aufteilen'], ['equal', 'Gleichmäßig aufteilen'], ['byItem', 'Nach Artikel']] as [SplitMode, string][]).map(
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
                <Text style={styles.splitEqualLabel}>Personen:</Text>
                <TextInput
                  style={styles.splitCountInput}
                  value={splitCount}
                  onChangeText={setSplitCount}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={styles.splitPerPerson}>→ {perPerson.toLocaleString('de-DE')} €/Person</Text>
              </View>
            )}
            {splitMode === 'byItem' && (
              <View style={styles.splitByItemContainer}>
                
                {/* Person Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personTabsScroll}>
                  {persons.map(p => (
                    <Pressable
                      key={p}
                      style={[styles.personTab, activePersonId === p && styles.personTabActive]}
                      onPress={() => setActivePersonId(p)}
                    >
                      <Text style={[styles.personTabText, activePersonId === p && styles.personTabTextActive]}>
                        Person {p}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.addPersonTab} onPress={addPerson}>
                    <Text style={styles.addPersonTabText}>+ Hinzufügen</Text>
                  </Pressable>
                </ScrollView>

                <Text style={styles.splitByItemDesc}>Artikel wählen für Person {activePersonId}:</Text>
                
                {items.map((item, idx) => {
                  const usedByOthers = persons.filter(p => p !== activePersonId).reduce((sum, p) => sum + ((splitItemsByPerson[p] || {})[item.menuItemId] || 0), 0);
                  const maxAllowedForCurrent = item.quantity - usedByOthers;
                  const currentSelected = currentPersonItems[item.menuItemId] || 0;

                  return (
                    <View key={`split-${item.menuItemId}-${idx}`} style={styles.splitItemRow}>
                      <View style={styles.splitItemInfo}>
                        <Text style={styles.splitItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.splitItemPrice}>{item.price.toLocaleString('de-DE')} €/Artikel (Noch {maxAllowedForCurrent}/{item.quantity})</Text>
                      </View>
                      <View style={styles.qtyControl}>
                        <Pressable 
                          style={[styles.qtyBtn, currentSelected <= 0 && styles.qtyBtnDisabled]}
                          onPress={() => handleSplitItemChange(item.menuItemId, -1, maxAllowedForCurrent)}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </Pressable>
                        <Text style={styles.qtyValue}>{currentSelected}</Text>
                        <Pressable 
                          style={[styles.qtyBtn, currentSelected >= maxAllowedForCurrent && styles.qtyBtnDisabled]}
                          onPress={() => handleSplitItemChange(item.menuItemId, 1, maxAllowedForCurrent)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
                
                <View style={styles.splitByItemResult}>
                  <Text style={styles.splitByItemResultLabel}>Summe für Person {activePersonId}:</Text>
                  <Text style={styles.splitByItemResultValue}>{splitByItemTotal.toLocaleString('de-DE')} €</Text>
                </View>
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={[styles.section, styles.summarySection]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Zwischensumme</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString('de-DE')} €</Text>
            </View>
            {discountApplied && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: BrandColors.success }]}>Rabatt</Text>
                <Text style={[styles.summaryValue, { color: BrandColors.success }]}>−{discountAmount.toLocaleString('de-DE')} €</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>GESAMTSUMME</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('de-DE')} €</Text>
            </View>
          </View>

        </ScrollView>

        {/* Confirm button */}
        <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 28) : Math.max(insets.bottom, 20) }]}>
          {splitMode === 'byItem' ? (
            <Pressable style={[styles.confirmBtn, { backgroundColor: BrandColors.success }]} onPress={handlePayForActivePerson}>
              <Text style={styles.confirmBtnText}>✓ Zahlung für Person {activePersonId} erhalten</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>✓ Zahlung erhalten • Tisch schließen</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
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
  
  personTabsScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  personTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  personTabActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: BrandColors.success,
  },
  personTabText: {
    color: BrandColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  personTabTextActive: {
    color: BrandColors.success,
  },
  addPersonTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    marginRight: 16,
    justifyContent: 'center',
  },
  addPersonTabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  splitByItemContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  splitByItemDesc: {
    fontSize: 13,
    color: BrandColors.textMuted,
    marginBottom: 12,
  },
  splitItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  splitItemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  splitItemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  splitItemPrice: {
    color: BrandColors.textMuted,
    fontSize: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qtyBtnDisabled: {
    opacity: 0.3,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  splitByItemResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitByItemResultLabel: {
    color: BrandColors.success,
    fontSize: 13,
    fontWeight: '500',
  },
  splitByItemResultValue: {
    color: BrandColors.success,
    fontSize: 16,
    fontWeight: '700',
  },
});
