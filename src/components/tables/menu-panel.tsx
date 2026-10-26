import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { MenuItemCard } from '@/components/tables/menu-item-card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BrandColors } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { useCategories } from '@/hooks/use-categories';
import type { MenuItem, MenuCategory, OrderItem, Table } from '@/types';

interface MenuPanelProps {
  visible: boolean;
  table: Table | null;
  onClose: () => void;
  onConfirm: (items: { item: MenuItem; quantity: number; note?: string }[]) => void;
  /** If table already has an order, show existing items for context */
  existingItems?: OrderItem[];
}

const getCategoryEmoji = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('sushi') || cat.includes('roll')) return '🍣';
  if (cat.includes('drink') || cat.includes('nước') || cat.includes('getränke')) return '🥤';
  if (cat.includes('hot') || cat.includes('nóng') || cat.includes('soup') || cat.includes('suppe')) return '🍜';
  if (cat.includes('appetizer') || cat.includes('khai vị') || cat.includes('vorspeise')) return '🥗';
  if (cat.includes('box') || cat.includes('set')) return '🍱';
  if (cat.includes('dessert') || cat.includes('tráng miệng')) return '🍨';
  return '🍽️';
};

export function MenuPanel({ visible, table, onClose, onConfirm, existingItems }: MenuPanelProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { menu, loading: menuLoading } = useMenu();
  const { categories, loading: categoriesLoading } = useCategories();

  // Map API categories to the format used in UI
  const displayCategories = React.useMemo(() => {
    return categories.map(c => ({
      key: c.name,
      label: c.name,
      emoji: getCategoryEmoji(c.name),
    }));
  }, [categories]);

  // Set default category when categories load
  React.useEffect(() => {
    if (displayCategories.length > 0 && !activeCategory) {
      setActiveCategory(displayCategories[0].key);
    }
  }, [displayCategories, activeCategory]);

  // (If available is missing or false but we want to show everything during testing, we can check. For now rely on m.available ?? true)
  const filteredMenu = React.useMemo(() => {
    const availableMenu = menu.filter(m => m.available !== false);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return availableMenu.filter(m => 
        m.name.toLowerCase().includes(query) || 
        (m.description && m.description.toLowerCase().includes(query))
      );
    }
    return availableMenu.filter(m => m.category === activeCategory);
  }, [menu, activeCategory, searchQuery]);

  const handleAdd = (id: string) => setQuantities(q => {
    const item = menu.find(m => m.id === id);
    const minQty = item?.minQty ? (typeof item.minQty === 'string' ? parseInt(item.minQty as any, 10) : item.minQty) : 1;
    const current = q[id] ?? 0;
    if (current === 0) {
      return { ...q, [id]: minQty };
    }
    return { ...q, [id]: current + 1 };
  });

  const handleRemove = (id: string) => setQuantities(q => {
    const item = menu.find(m => m.id === id);
    const minQty = item?.minQty ? (typeof item.minQty === 'string' ? parseInt(item.minQty as any, 10) : item.minQty) : 1;
    const current = q[id] ?? 0;
    if (current <= minQty) {
      const copy = { ...q };
      delete copy[id];
      return copy;
    }
    return { ...q, [id]: current - 1 };
  });

  const totalItems = Object.values(quantities).reduce((s, v) => s + v, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = menu.find(m => m.id === id);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  const handleConfirm = () => {
    const selected = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({
        item: menu.find(m => m.id === id)!,
        quantity,
        note: note || undefined,
      }));
    onConfirm(selected);
    setQuantities({});
    setNote('');
    setSearchQuery('');
  };

  const handleClose = () => {
    setQuantities({});
    setNote('');
    setSearchQuery('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} heightFraction={0.88}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍  Tìm kiếm món ăn..."
          placeholderTextColor={BrandColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.trim().length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchBtnText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Menu items */}
      <FlatList
        data={menuLoading ? [] : filteredMenu}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.catContainer}>
            {categoriesLoading && displayCategories.length === 0 ? (
              <ActivityIndicator color={BrandColors.brand} size="small" />
            ) : (
              displayCategories.map(cat => (
                <Pressable
                  key={cat.key}
                  style={[styles.catTab, activeCategory === cat.key && styles.catTabActive]}
                  onPress={() => {
                    setActiveCategory(cat.key);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, activeCategory === cat.key && styles.catLabelActive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        }
        ListEmptyComponent={
          menuLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color={BrandColors.brand} size="large" />
              <Text style={{ color: BrandColors.textMuted, marginTop: 12, fontSize: 13 }}>Đang tải thực đơn...</Text>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 32 }}>🍽️</Text>
              <Text style={{ color: BrandColors.textMuted, marginTop: 8, fontSize: 14, fontWeight: '600' }}>
                {searchQuery.trim() ? 'Không tìm thấy món ăn phù hợp' : 'Chưa có món trong danh mục này'}
              </Text>
            </View>
          )
        }
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
            <Text style={styles.confirmPrice}>{totalPrice.toLocaleString('de-DE')} €</Text>
          </View>
          <Text style={styles.confirmText}>Xác nhận gọi món →</Text>
        </Pressable>
        )}
      </KeyboardAvoidingView>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingLeft: 12,
    paddingRight: 36,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 28,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchBtnText: {
    color: BrandColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  catContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
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
