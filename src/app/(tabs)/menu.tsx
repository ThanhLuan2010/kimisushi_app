import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { useCategories } from '@/hooks/use-categories';
import { useTables } from '@/hooks/use-tables';
import { TableGrid } from '@/components/tables/table-grid';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { MenuItem } from '@/types';

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

export default function MenuScreen() {
  const { menu, loading: menuLoading, refresh: refreshMenu } = useMenu();
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useCategories();
  const { tables, addItemsToTable, refresh: refreshTables, loading: tablesLoading } = useTables();

  const [activeCategory, setActiveCategory] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isTableSelectOpen, setIsTableSelectOpen] = useState(false);

  const displayCategories = useMemo(() => {
    const list = categories.map(c => ({
      key: c.name,
      label: c.name,
      emoji: getCategoryEmoji(c.name),
    }));
    return [{ key: 'Alle', label: 'Tất cả', emoji: '🍽️' }, ...list];
  }, [categories]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = activeCategory === 'Alle' || item.category === activeCategory;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  const handleRefresh = () => {
    refreshMenu();
    refreshCategories();
    refreshTables();
  };

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

  const handleTableSelect = (table: any) => {
    const selectedItems = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({
        item: menu.find(m => m.id === id)!,
        quantity,
      }));

    if (selectedItems.length === 0) {
      setIsTableSelectOpen(false);
      return;
    }

    const openTableIfEmpty = table.status === 'empty';
    addItemsToTable(table.id, selectedItems, openTableIfEmpty);

    Alert.alert(
      '✅ Gọi món thành công',
      openTableIfEmpty 
        ? `Đã mở bàn ${table.number} và gửi ${selectedItems.length} món vào bếp.`
        : `Đã gọi thêm ${selectedItems.length} món vào Bàn ${table.number}.`
    );

    setQuantities({});
    setIsTableSelectOpen(false);
  };

  const renderItem = ({ item }: { item: MenuItem }) => {
    const qty = quantities[item.id] ?? 0;
    return (
      <View style={styles.card}>
        <Text style={styles.emoji}>{item.imageEmoji}</Text>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {!item.available && (
              <View style={[styles.statusBadge, { backgroundColor: BrandColors.danger + '20' }]}>
                <Text style={[styles.statusText, { color: BrandColors.danger }]}>
                  Hết hàng
                </Text>
              </View>
            )}
          </View>
          {item.description ? (
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <Text style={styles.price}>{item.price.toLocaleString('de-DE')} €</Text>
        </View>
        {item.available !== false && (
          <View style={styles.controls}>
            {qty > 0 && (
              <Pressable
                style={styles.btnMinus}
                onPress={() => handleRemove(item.id)}
                hitSlop={8}
              >
                <Text style={styles.btnText}>−</Text>
              </Pressable>
            )}
            {qty > 0 && (
              <Text style={styles.qty}>{qty}</Text>
            )}
            <Pressable
              style={styles.btnPlus}
              onPress={() => handleAdd(item.id)}
              hitSlop={8}
            >
              <Text style={styles.btnText}>+</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Thực đơn</Text>
          <Pressable onPress={handleRefresh} style={styles.refreshBtn}>
            <Text style={{ fontSize: 16 }}>🔄</Text>
          </Pressable>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn..."
            placeholderTextColor={BrandColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Menu List */}
        {menuLoading || categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={BrandColors.brand} size="large" />
            <Text style={styles.loadingText}>Đang tải thực đơn...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMenu}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.listContent,
              totalItems > 0 && { paddingBottom: 100 }
            ]}
            ListHeaderComponent={
              <View style={styles.catContainer}>
                {displayCategories.map(cat => (
                  <Pressable
                    key={cat.key}
                    style={[styles.catTab, activeCategory === cat.key && styles.catTabActive]}
                    onPress={() => activeCategory !== cat.key && setActiveCategory(cat.key)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, activeCategory === cat.key && styles.catLabelActive]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 32 }}>🍽️</Text>
                <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
              </View>
            }
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            refreshing={menuLoading}
            onRefresh={handleRefresh}
          />
        )}

        {/* Confirm bar */}
        {totalItems > 0 && (
          <Pressable style={styles.confirmBar} onPress={() => setIsTableSelectOpen(true)}>
            <View style={styles.confirmInfo}>
              <Text style={styles.confirmCount}>{totalItems} món</Text>
              <Text style={styles.confirmPrice}>{totalPrice.toLocaleString('de-DE')} €</Text>
            </View>
            <Text style={styles.confirmText}>Chọn bàn gọi món →</Text>
          </Pressable>
        )}
      </SafeAreaView>

      {/* Table selection bottom sheet */}
      <BottomSheet
        visible={isTableSelectOpen}
        onClose={() => setIsTableSelectOpen(false)}
        heightFraction={0.85}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Chọn bàn gọi món</Text>
          <Pressable onPress={() => setIsTableSelectOpen(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          <TableGrid
            tables={tables}
            onTablePress={handleTableSelect}
            refreshing={tablesLoading}
            onRefresh={refreshTables}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: BrandColors.surface,
    borderColor: BrandColors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
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
    fontSize: 14,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  catLabelActive: {
    color: BrandColors.brand,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: BrandColors.textMuted,
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: BrandColors.textMuted,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 130,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  emoji: {
    fontSize: 30,
    width: 40,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  desc: {
    fontSize: 11,
    color: BrandColors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.brand,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  qty: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    minWidth: 20,
    textAlign: 'center',
  },
  confirmBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: BrandColors.brand,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
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
});
