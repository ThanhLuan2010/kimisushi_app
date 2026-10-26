import React, { useState } from 'react';
import {
  RefreshControl,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReservationCard } from '@/components/reservations/reservation-card';
import { ReservationDetailModal } from '@/components/reservations/reservation-detail-modal';
import { CreateReservationModal } from '@/components/reservations/create-reservation-modal';
import { useReservations } from '@/hooks/use-reservations';
import { BrandColors } from '@/constants/theme';
import { ordersApi } from '@/services/api';
import type { Reservation, ReservationStatus } from '@/types';

type Tab = 'pending' | 'confirmed' | 'today';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'pending', label: 'Chờ xác nhận', emoji: '⏳' },
  { key: 'confirmed', label: 'Đã xác nhận', emoji: '✅' },
  { key: 'today', label: 'Hôm nay', emoji: '📅' },
];

import moment from 'moment';

function isToday(isoDate: string) {
  return moment(isoDate).isSame(moment(), 'day');
}

export default function ReservationsScreen() {
  const { reservations, loading, refresh, acceptReservation, cancelReservation } = useReservations();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pending = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const today = reservations.filter(r => isToday(r.arrivalTime));
  console.log("======today====", today)

  const tabData: Record<Tab, Reservation[]> = { pending, confirmed, today };
  const displayList = tabData[activeTab];

  const handleConfirm = (id: string, tableId?: string) => {
    acceptReservation(id, tableId);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Đặt bàn</Text>
          <Pressable onPress={() => setIsCreateOpen(true)} style={styles.addBtn} hitSlop={8}>
            <Text style={{ fontSize: 16 }}>➕</Text>
          </Pressable>
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
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
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
              onPress={() => setSelectedReservation(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </SafeAreaView>

      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onConfirm={handleConfirm}
      />

      <CreateReservationModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (data) => {
          try {
            await ordersApi.create({
              type: 'reservation',
              customerName: data.name,
              customerPhone: data.phone,
              guests: data.guests,
              persons: data.guests,
              date: data.date,
              time: data.time,
              notes: data.notes,
              status: 'neu',
            });
            Alert.alert('✅ Thành công', 'Đã tạo đặt bàn mới.');
            refresh();
            setIsCreateOpen(false);
          } catch (e: any) {
            Alert.alert('❌ Thất bại', 'Không thể tạo đặt bàn: ' + e.message);
            throw e;
          }
        }}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addBtn: {
    padding: 8,
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 8,
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
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: BrandColors.surface,
    gap: 2,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  tabActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  tabEmoji: {
    fontSize: 12,
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
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountActive: {
    backgroundColor: BrandColors.brand,
  },
  tabCountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  listContent: {
    padding: 20,
    paddingBottom: 130,
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
