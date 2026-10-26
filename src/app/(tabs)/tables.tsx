import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BillModal } from '@/components/tables/bill-modal';
import { MenuPanel } from '@/components/tables/menu-panel';
import { OrderSummary } from '@/components/tables/order-summary';
import { TableGrid } from '@/components/tables/table-grid';
import { TableAdminModal } from '@/components/tables/table-admin-modal';
import { BrandColors } from '@/constants/theme';
import { useTables } from '@/hooks/use-tables';
import type { MenuItem, OrderItem, PaymentMethod, Table } from '@/types';

type ActiveSheet = 'none' | 'menu' | 'summary' | 'bill';

export default function TablesScreen() {
  const { tables, emptyCount, occupiedCount, reservedCount, loading, refresh, openTable, addItemsToTable, closeTable, updateTableItems, removeItemFromTable } = useTables();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleTablePress = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'empty') {
      // Show menu directly, don't occupy until items are added
      setSelectedTable(table);
      setActiveSheet('menu');
    } else if (table.status === 'occupied') {
      setActiveSheet('summary');
    } else if (table.status === 'reserved') {
      Alert.alert(
        `Bàn ${table.number} – Đặt trước`,
        `Khách: ${table.reservedFor}\nGiờ đến: ${table.reservedTime}\n\nMở bàn cho khách ngồi?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Mở bàn',
            onPress: () => {
              openTable(table.id);
              setSelectedTable({ ...table, status: 'occupied' });
              setActiveSheet('menu');
            },
          },
        ],
      );
    }
  };

  const handleMenuConfirm = (items: { item: MenuItem; quantity: number; note?: string }[]) => {
    if (!selectedTable || items.length === 0) {
      setActiveSheet('none');
      return;
    }
    
    addItemsToTable(selectedTable.id, items, selectedTable.status === 'empty');
    setActiveSheet('none');
  };

  const handleBillConfirm = (_method: PaymentMethod, tableId: string, remainingItems?: OrderItem[] | null) => {
    if (remainingItems && remainingItems.length > 0) {
      updateTableItems(tableId, remainingItems);
      Alert.alert('✅ Thanh toán thành công', 'Đã thanh toán phần của khách. Bàn vẫn còn các món chưa thanh toán.');
    } else {
      closeTable(tableId);
      setActiveSheet('none');
      setSelectedTable(null);
      Alert.alert('✅ Thanh toán thành công', 'Bàn đã được giải phóng.');
    }
  };

  const liveSelectedTable = selectedTable
    ? tables.find(t => t.id === selectedTable.id) ?? selectedTable
    : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.title}>Sơ đồ bàn</Text>
            <Pressable onPress={() => setIsAdminOpen(true)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </Pressable>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: BrandColors.success }]} />
              <Text style={styles.legendText}>{emptyCount} Trống</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: BrandColors.danger }]} />
              <Text style={styles.legendText}>{occupiedCount} Khách</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: BrandColors.warning }]} />
              <Text style={styles.legendText}>{reservedCount} Đặt</Text>
            </View>
          </View>
        </View>

        {/* Table grid */}
        <TableGrid
          tables={tables}
          onTablePress={handleTablePress}
          refreshing={loading}
          onRefresh={refresh}
        />
      </SafeAreaView>

      {/* Menu panel */}
      <MenuPanel
        visible={activeSheet === 'menu'}
        table={liveSelectedTable}
        onClose={() => setActiveSheet('none')}
        onConfirm={handleMenuConfirm}
        existingItems={liveSelectedTable?.currentOrder?.items}
      />

      {/* Order summary */}
      <OrderSummary
        visible={activeSheet === 'summary'}
        table={liveSelectedTable}
        onClose={() => setActiveSheet('none')}
        onAddMore={() => setActiveSheet('menu')}
        onBill={() => setActiveSheet('bill')}
        onAddCustomItem={(name, price) => {
          if (!liveSelectedTable || !liveSelectedTable.currentOrder) return;
          const newItems = [...liveSelectedTable.currentOrder.items];
          newItems.push({
            menuItemId: `custom-${Date.now()}`,
            name,
            price,
            quantity: 1,
            category: 'Phí dịch vụ'
          });
          updateTableItems(liveSelectedTable.id, newItems);
        }}
        onRemoveItem={(menuItemId) => {
          if (!liveSelectedTable) return;
          removeItemFromTable(liveSelectedTable.id, menuItemId);
        }}
      />

      {/* Bill modal */}
      <BillModal
        visible={activeSheet === 'bill'}
        table={liveSelectedTable}
        onClose={() => setActiveSheet('summary')}
        onConfirm={handleBillConfirm}
      />

      {/* Admin CRUD Modal */}
      <TableAdminModal
        visible={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
});
