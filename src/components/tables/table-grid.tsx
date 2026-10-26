import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { TableCard } from '@/components/tables/table-card';
import { BrandColors } from '@/constants/theme';
import type { Table } from '@/types';

interface TableGridProps {
  tables: Table[];
  onTablePress: (table: Table) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

function groupByZone(tables: Table[]): Record<string, Table[]> {
  return tables.reduce<Record<string, Table[]>>((acc, t) => {
    if (!acc[t.zone]) acc[t.zone] = [];
    acc[t.zone].push(t);
    return acc;
  }, {});
}

export function TableGrid({ tables, onTablePress, refreshing, onRefresh }: TableGridProps) {
  const zones = groupByZone(tables);

  return (
    <FlatList
      data={Object.entries(zones)}
      keyExtractor={([zone]) => zone}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={BrandColors.brand}
            colors={[BrandColors.brand]}
          />
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🪑</Text>
          <Text style={styles.emptyTitle}>Chưa có sơ đồ bàn</Text>
          <Text style={styles.emptySub}>Vui lòng bấm vào biểu tượng ⚙️ ở góc trên để cấu hình sơ đồ bàn cho nhà hàng.</Text>
        </View>
      }
      renderItem={({ item: [zoneName, zoneTables] }) => (
        <View style={styles.zone}>
          <Text style={styles.zoneTitle}>{zoneName}</Text>
          <View style={styles.grid}>
            {zoneTables.map(table => (
              <View key={table.id} style={styles.cell}>
                <TableCard table={table} onPress={onTablePress} />
              </View>
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 140,
  },
  zone: {
    gap: 12,
  },
  zoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '30.5%',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
