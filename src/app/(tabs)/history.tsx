import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/theme';
import { useHistory } from '@/hooks/use-history';
import { HistoryCard } from '@/components/history/history-card';
import { HistoryDetailModal } from '@/components/history/history-detail-modal';
import type { OrderHistoryItem } from '@/types';

type TypeFilter = 'all' | 'dine-in' | 'online';
type DateFilter = 'all' | 'today' | 'week';

export default function HistoryScreen() {
  const { history, loading, refreshing, refresh } = useHistory();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedItem, setSelectedItem] = useState<OrderHistoryItem | null>(null);

  // Lọc theo loại đơn và ngày
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return history.filter(item => {
      // 1. Lọc theo hình thức (typeFilter)
      if (typeFilter === 'dine-in' && item.method !== 'dine-in') return false;
      if (typeFilter === 'online' && item.method === 'dine-in') return false;

      // 2. Lọc theo ngày (dateFilter)
      const itemDate = new Date(item.completedAt || item.createdAt);
      if (dateFilter === 'today') {
        const itemDateStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}-${String(itemDate.getDate()).padStart(2, '0')}`;
        if (itemDateStr !== todayStr) return false;
      } else if (dateFilter === 'week') {
        if (itemDate < oneWeekAgo) return false;
      }

      return true;
    });
  }, [history, typeFilter, dateFilter]);

  // Thống kê theo bộ lọc hiện tại
  const stats = useMemo(() => {
    const revenue = filteredHistory.reduce((sum, h) => sum + h.total, 0);
    const guests = filteredHistory.reduce((sum, h) => sum + (h.guests || 1), 0);
    const count = filteredHistory.length;
    const cashTotal = filteredHistory
      .filter(h => h.paymentMethod === 'cash' || h.paymentMethod === 'bar')
      .reduce((sum, h) => sum + h.total, 0);
    const nonCashTotal = filteredHistory
      .filter(h => h.paymentMethod !== 'cash' && h.paymentMethod !== 'bar')
      .reduce((sum, h) => sum + h.total, 0);
    return { revenue, guests, count, cashTotal, nonCashTotal };
  }, [filteredHistory]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lịch sử hoá đơn</Text>
          <Text style={styles.subtitle}>Bàn tại quán & Đơn online</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Doanh thu</Text>
            <Text style={[styles.statValue, { color: BrandColors.brand }]}>
              {stats.revenue.toFixed(2).replace('.', ',')} €
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tổng số đơn</Text>
            <Text style={styles.statValue}>{stats.count}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lượt khách</Text>
            <Text style={styles.statValue}>👥 {stats.guests}</Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        {stats.count > 0 && (
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownText}>
                💵 Bar: <Text style={styles.breakdownBold}>{stats.cashTotal.toFixed(2).replace('.', ',')} €</Text>
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownText}>
                💳 Karte/Überweisung: <Text style={styles.breakdownBold}>{stats.nonCashTotal.toFixed(2).replace('.', ',')} €</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filtersWrapper}>
          {/* Method Filter */}
          <View style={styles.filterRow}>
            <Pressable
              style={[styles.filterPill, typeFilter === 'all' && styles.filterPillActive]}
              onPress={() => setTypeFilter('all')}
            >
              <Text style={[styles.filterPillText, typeFilter === 'all' && styles.filterPillTextActive]}>
                Tất cả
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterPill, typeFilter === 'dine-in' && styles.filterPillActive]}
              onPress={() => setTypeFilter('dine-in')}
            >
              <Text style={[styles.filterPillText, typeFilter === 'dine-in' && styles.filterPillTextActive]}>
                🍽 Tại bàn
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterPill, typeFilter === 'online' && styles.filterPillActive]}
              onPress={() => setTypeFilter('online')}
            >
              <Text style={[styles.filterPillText, typeFilter === 'online' && styles.filterPillTextActive]}>
                📦 Đơn Online
              </Text>
            </Pressable>
          </View>

          {/* Date Filter */}
          <View style={[styles.filterRow, { marginTop: 8 }]}>
            <Pressable
              style={[styles.datePill, dateFilter === 'today' && styles.datePillActive]}
              onPress={() => setDateFilter('today')}
            >
              <Text style={[styles.datePillText, dateFilter === 'today' && styles.datePillTextActive]}>
                Hôm nay
              </Text>
            </Pressable>
            <Pressable
              style={[styles.datePill, dateFilter === 'week' && styles.datePillActive]}
              onPress={() => setDateFilter('week')}
            >
              <Text style={[styles.datePillText, dateFilter === 'week' && styles.datePillTextActive]}>
                7 ngày qua
              </Text>
            </Pressable>
            <Pressable
              style={[styles.datePill, dateFilter === 'all' && styles.datePillActive]}
              onPress={() => setDateFilter('all')}
            >
              <Text style={[styles.datePillText, dateFilter === 'all' && styles.datePillTextActive]}>
                Tất cả ngày
              </Text>
            </Pressable>
          </View>
        </View>

        {/* History List */}
        <FlatList
          data={filteredHistory}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={BrandColors.brand}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>Chưa có lịch sử nào</Text>
              <Text style={styles.emptyText}>
                {loading
                  ? 'Đang tải dữ liệu...'
                  : 'Các bàn thanh toán xong và đơn online hoàn thành sẽ xuất hiện tại đây.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <HistoryCard item={item} onPress={setSelectedItem} />
          )}
        />

        {/* Detail Modal */}
        <HistoryDetailModal
          visible={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#161626',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#26263D',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownText: {
    color: BrandColors.textMuted,
    fontSize: 12,
  },
  breakdownBold: {
    color: '#fff',
    fontWeight: '700',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLabel: {
    color: BrandColors.textMuted,
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  filtersWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#161626',
    borderWidth: 1,
    borderColor: '#26263D',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: BrandColors.brand,
    borderColor: BrandColors.brand,
  },
  filterPillText: {
    color: BrandColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  datePillActive: {
    backgroundColor: 'rgba(255, 77, 46, 0.15)',
    borderWidth: 1,
    borderColor: BrandColors.brand,
  },
  datePillText: {
    color: BrandColors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  datePillTextActive: {
    color: BrandColors.brand,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: BrandColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
