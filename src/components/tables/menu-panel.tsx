import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MenuItemCard } from '@/components/tables/menu-item-card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { MOCK_MENU } from '@/constants/mock-data';
import { BrandColors } from '@/constants/theme';
import type { MenuItem, MenuCategory, OrderItem, Table } from '@/types';

interface MenuPanelProps {
  visible: boolean;
  table: Table | null;
  onClose: () => void;
  onConfirm: (items: { item: MenuItem; quantity: number; note?: string }[]) => void;
  /** If table already has an order, show existing items for context */
  existingItems?: OrderItem[];
}

const CATEGORIES: { key: MenuCategory; label: string; emoji: string }[] = [
  { key: 'sushi', label: 'Sushi', emoji: '🍣' },
  { key: 'appetizer', label: 'Khai vị', emoji: '🥗' },
  { key: 'hot-dish', label: 'Món nóng', emoji: '🍜' },
  { key: 'drink', label: 'Nước uống', emoji: '🥤' },
];

export function MenuPanel({ visible, table, onClose, onConfirm, existingItems }: MenuPanelProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('sushi');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const filteredMenu = MOCK_MENU.filter(m => m.category === activeCategory && m.available);

  const handleAdd = (id: string) => setQuantities(q => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  const handleRemove = (id: string) => setQuantities(q => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) }));

  const totalItems = Object.values(quantities).reduce((s, v) => s + v, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = MOCK_MENU.find(m => m.id === id);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  const handleConfirm = () => {
    const selected = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({
        item: MOCK_MENU.find(m => m.id === id)!,
        quantity,
        note: note || undefined,
      }));
    onConfirm(selected);
    setQuantities({});
    setNote('');
  };

  const handleClose = () => {
    setQuantities({});
    setNote('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} heightFraction={0.88}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {table ? `Bàn ${table.number} – ${table.zone}` : 'Gọi món'}
          </Text>
          {existingItems && existingItems.length > 0 && (
            <Text style={styles.headerSub}>Gọi thêm món vào bàn</Text>
          )}
        </View>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat.key}
            style={[styles.catTab, activeCategory === cat.key && styles.catTabActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, activeCategory === cat.key && styles.catLabelActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Menu items */}
      <FlatList
        data={filteredMenu}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            quantity={quantities[item.id] ?? 0}
            onAdd={() => handleAdd(item.id)}
            onRemove={() => handleRemove(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {/* Note input */}
      <View style={styles.noteArea}>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Ghi chú cho bếp (ít cay, không hành...)"
          placeholderTextColor={BrandColors.textMuted}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Confirm bar */}
      {totalItems > 0 && (
        <Pressable style={styles.confirmBar} onPress={handleConfirm}>
          <View style={styles.confirmInfo}>
            <Text style={styles.confirmCount}>{totalItems} món</Text>
            <Text style={styles.confirmPrice}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <Text style={styles.confirmText}>Xác nhận gọi món →</Text>
        </Pressable>
      )}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: BrandColors.warning,
    fontWeight: '600',
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
  catScroll: {
    maxHeight: 56,
  },
  catContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: BrandColors.surface,
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  catTabActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  catEmoji: {
    fontSize: 15,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  catLabelActive: {
    color: BrandColors.brand,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  noteArea: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  noteInput: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    maxHeight: 70,
  },
  confirmBar: {
    margin: 16,
    backgroundColor: BrandColors.brand,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmInfo: {
    gap: 2,
  },
  confirmCount: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  confirmPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
