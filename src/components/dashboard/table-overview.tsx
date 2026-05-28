import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StatCard } from '@/components/ui/stat-card';
import { BrandColors } from '@/constants/theme';

interface TableOverviewProps {
  emptyCount: number;
  reservedCount: number;
  occupiedCount: number;
}

export function TableOverview({ emptyCount, reservedCount, occupiedCount }: TableOverviewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trạng thái bàn</Text>
      <View style={styles.row}>
        <StatCard
          emoji="✅"
          value={emptyCount}
          label="Bàn trống"
          color={BrandColors.success}
        />
        <StatCard
          emoji="📅"
          value={reservedCount}
          label="Đặt trước"
          color={BrandColors.warning}
        />
        <StatCard
          emoji="👥"
          value={occupiedCount}
          label="Có khách"
          color={BrandColors.danger}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
