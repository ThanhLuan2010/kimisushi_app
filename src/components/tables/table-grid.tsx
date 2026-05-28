import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { TableCard } from '@/components/tables/table-card';
import { BrandColors } from '@/constants/theme';
import type { Table } from '@/types';

interface TableGridProps {
  tables: Table[];
  onTablePress: (table: Table) => void;
}

function groupByZone(tables: Table[]): Record<string, Table[]> {
  return tables.reduce<Record<string, Table[]>>((acc, t) => {
    if (!acc[t.zone]) acc[t.zone] = [];
    acc[t.zone].push(t);
    return acc;
  }, {});
}

export function TableGrid({ tables, onTablePress }: TableGridProps) {
  const zones = groupByZone(tables);

  return (
    <FlatList
      data={Object.entries(zones)}
      keyExtractor={([zone]) => zone}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
    paddingBottom: 120,
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
});
