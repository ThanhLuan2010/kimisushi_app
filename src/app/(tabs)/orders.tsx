import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnlineOrderCard } from '@/components/orders/online-order-card';
import { OnlineOrderDetailModal } from '@/components/orders/online-order-detail-modal';
import { CreateOnlineOrderModal } from '@/components/orders/create-online-order-modal';
import { TimePickerModal } from '@/components/orders/time-picker-modal';
import { BrandColors } from '@/constants/theme';
import { useOrders } from '@/hooks/use-orders';
import { ordersApi } from '@/services/api';
import type { OnlineOrder, OnlineOrderStatus } from '@/types';

type Tab = 'pending' | 'cooking' | 'done';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'pending', label: 'Chờ nhận', emoji: '🆕' },
  { key: 'cooking', label: 'Đang làm', emoji: '🔥' },
  { key: 'done', label: 'Hoàn thành', emoji: '✅' },
];

export default function OrdersScreen() {
  const { pendingOrders, cookingOrders, doneOrders, acceptOrder, completeOrder, loading, refresh } = useOrders();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tabData: Record<Tab, typeof pendingOrders> = {
    pending: pendingOrders,
    cooking: cookingOrders,
    done: doneOrders,
  };

  const displayOrders = tabData[activeTab];

  const handleAccept = (id: string) => {
    const order = pendingOrders.find(o => o.id === id);
    const isAsap = !order || !order.pickupTime || order.pickupTime === 'asap';
    if (isAsap) {
      setAcceptingOrderId(id);
    } else {
      acceptOrder(id, 0);
      setActiveTab('cooking');
    }
  };

  const handleTimeConfirm = (minutes: number) => {
    if (acceptingOrderId) {
      acceptOrder(acceptingOrderId, minutes);
      setAcceptingOrderId(null);
      setActiveTab('cooking');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Đơn hàng online</Text>
          <Pressable onPress={() => setIsCreateOpen(true)} style={styles.addBtn} hitSlop={8}>
            <Text style={{ fontSize: 16 }}>➕</Text>
          </Pressable>
          {pendingOrders.length > 0 && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>{pendingOrders.length} chờ xử lý</Text>
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

        {/* Orders list */}
        <FlatList
          data={displayOrders}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={BrandColors.brand}
              colors={[BrandColors.brand]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>
                {activeTab === 'pending' ? '🎉' : activeTab === 'cooking' ? '🍳' : '✅'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'pending'
                  ? 'Không có đơn chờ xử lý'
                  : activeTab === 'cooking'
                    ? 'Không có đơn đang làm'
                    : 'Chưa có đơn hoàn thành'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OnlineOrderCard
              order={item}
              onAccept={activeTab === 'pending' ? handleAccept : undefined}
              onComplete={activeTab === 'cooking' ? completeOrder : undefined}
              onPress={() => setSelectedOrder(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </SafeAreaView>

      {/* Time picker modal */}
      <TimePickerModal
        visible={acceptingOrderId !== null}
        onClose={() => setAcceptingOrderId(null)}
        onConfirm={handleTimeConfirm}
      />

      {/* Order detail modal */}
      <OnlineOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAccept={handleAccept}
        onComplete={completeOrder}
      />

      <CreateOnlineOrderModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (data) => {
          try {
            await ordersApi.create({
              type: 'order',
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              method: data.method,
              address: data.address,
              items: data.items,
              total: data.total,
              notes: data.notes,
              pickupDate: data.pickupDate,
              pickupTime: data.pickupTime,
              status: 'neu',
            });
            Alert.alert('✅ Thành công', 'Đã đặt đơn online mới.');
            refresh();
            setIsCreateOpen(false);
          } catch (e: any) {
            Alert.alert('❌ Thất bại', 'Không thể tạo đơn online: ' + e.message);
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
  urgentBadge: {
    backgroundColor: BrandColors.dangerFaded,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BrandColors.danger,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.danger,
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
