import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReservationCard } from '@/components/reservations/reservation-card';
import { MOCK_RESERVATIONS } from '@/constants/mock-data';
import { BrandColors } from '@/constants/theme';
import type { Reservation, ReservationStatus } from '@/types';

type Tab = 'pending' | 'confirmed' | 'today';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'pending', label: 'Chờ xác nhận', emoji: '⏳' },
  { key: 'confirmed', label: 'Đã xác nhận', emoji: '✅' },
  { key: 'today', label: 'Hôm nay', emoji: '📅' },
];

function isToday(isoDate: string) {
  const d = new Date(isoDate);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const pending = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const today = reservations.filter(r => isToday(r.arrivalTime));

  const tabData: Record<Tab, Reservation[]> = { pending, confirmed, today };
  const displayList = tabData[activeTab];

  const handleConfirm = (id: string) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'confirmed' as ReservationStatus } : r),
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Đặt bàn</Text>
          {pending.length > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>{pending.length} chờ xác nhận</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => {
            const count = tabData[tab.key].length;
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                    <Text style={styles.tabCountText}>{count}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* List */}
        <FlatList
          data={displayList}
          keyExtractor={r => r.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>Không có đặt bàn nào</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ReservationCard
              reservation={item}
              onConfirm={item.status === 'pending' ? handleConfirm : undefined}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: BrandColors.warningFaded,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BrandColors.warning,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.warning,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: BrandColors.surface,
    gap: 4,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  tabActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  tabEmoji: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  tabLabelActive: {
    color: BrandColors.brand,
  },
  tabCount: {
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountActive: {
    backgroundColor: BrandColors.brand,
  },
  tabCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.textMuted,
  },
});
