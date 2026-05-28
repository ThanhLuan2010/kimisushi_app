import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BillModal } from '@/components/tables/bill-modal';
import { MenuPanel } from '@/components/tables/menu-panel';
import { OrderSummary } from '@/components/tables/order-summary';
import { TableGrid } from '@/components/tables/table-grid';
import { BrandColors } from '@/constants/theme';
import { useTables } from '@/hooks/use-tables';
import type { MenuItem, PaymentMethod, Table } from '@/types';

type ActiveSheet = 'none' | 'menu' | 'summary' | 'bill';

export default function TablesScreen() {
  const { tables, emptyCount, occupiedCount, reservedCount, openTable, addItemToTable, closeTable } = useTables();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');

  const handleTablePress = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'empty') {
      // Open table and show menu
      openTable(table.id);
      // Update selected table ref
      setSelectedTable({ ...table, status: 'occupied' });
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
    if (!selectedTable) return;
    items.forEach(({ item, quantity, note }) => {
      addItemToTable(selectedTable.id, item, quantity, note);
    });
    setActiveSheet('none');
  };

  const handleBillConfirm = (_method: PaymentMethod, tableId: string) => {
    closeTable(tableId);
    setActiveSheet('none');
    setSelectedTable(null);
    Alert.alert('✅ Thanh toán thành công', 'Bàn đã được giải phóng.');
  };

  const liveSelectedTable = selectedTable
    ? tables.find(t => t.id === selectedTable.id) ?? selectedTable
    : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sơ đồ bàn</Text>
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
        <TableGrid tables={tables} onTablePress={handleTablePress} />
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
      />

      {/* Bill modal */}
      <BillModal
        visible={activeSheet === 'bill'}
        table={liveSelectedTable}
        onClose={() => setActiveSheet('summary')}
        onConfirm={handleBillConfirm}
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
