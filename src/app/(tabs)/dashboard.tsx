import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TableOverview } from '@/components/dashboard/table-overview';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-orders';
import { useTables } from '@/hooks/use-tables';
import { activityApi, type ApiActivityLog } from '@/services/api';
import { triggerNewOrderNotification } from '@/services/notifications';
import { useRouter } from 'expo-router';



export default function DashboardScreen() {
  const { tables, emptyCount, reservedCount, occupiedCount } = useTables();
  const { pendingOrders } = useOrders();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [activityLog, setActivityLog] = useState<ApiActivityLog[]>([]);

  // Fetch activity log
  useEffect(() => {
    activityApi.getRecent(5).then(res => setActivityLog(res.items ?? [])).catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };



  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.restaurantName}>{user?.name ?? 'KimiSushi'}</Text>
            </View>
            <Pressable onPress={handleLogout} style={styles.avatarContainer}>
              <Text style={styles.avatar}>👨‍🍳</Text>
            </Pressable>
          </View>

          {/* Today badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>

          
          {/* Reserved Tables Section */}
          {reservedCount > 0 && (
            <View style={styles.quickAccess}>
              <Text style={styles.sectionTitle}>Bàn đã đặt</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
                {tables.filter(t => t.status === 'reserved').map(t => (
                  <View key={t.id} style={[styles.quickCard, { borderColor: '#FF9800', borderWidth: 1, backgroundColor: 'rgba(255,152,0,0.1)' }]}>
                    <Text style={styles.quickEmoji}>🪑</Text>
                    <Text style={[styles.quickLabel, { color: '#FF9800', marginTop: 8 }]}>Bàn {t.number}</Text>
                    {t.reservedFor && <Text style={{ fontSize: 12, color: '#FF9800', marginTop: 4, fontWeight: 'bold' }}>{t.reservedFor}</Text>}
                    {t.reservedTime && <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{t.reservedTime}</Text>}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Table overview */}
          <TableOverview
            emptyCount={emptyCount}
            reservedCount={reservedCount}
            occupiedCount={occupiedCount}
          />

          {/* Quick access */}
          <View style={styles.quickAccess}>
            <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
            <View style={styles.quickGrid}>
              <Pressable
                style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
                onPress={() => router.push('/(tabs)/orders')}
              >
                <Text style={styles.quickEmoji}>📦</Text>
                <Text style={styles.quickLabel}>Đơn online</Text>
                {pendingOrders.length > 0 && (
                  <View style={styles.quickBadge}>
                    <Text style={styles.quickBadgeText}>{pendingOrders.length}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
                onPress={() => router.push('/(tabs)/reservations')}
              >
                <Text style={styles.quickEmoji}>📅</Text>
                <Text style={styles.quickLabel}>Đặt bàn</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
                onPress={() => router.push('/(tabs)/tables')}
              >
                <Text style={styles.quickEmoji}>🪑</Text>
                <Text style={styles.quickLabel}>Sơ đồ bàn</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
                onPress={async () => {
                  await triggerNewOrderNotification({
                    customerName: 'Khách thử nghiệm',
                    total: 29.90,
                  });
                  Alert.alert('Thông báo', 'Đã phát thông báo đơn hàng mới với âm thanh!');
                }}
              >
                <Text style={styles.quickEmoji}>🔔</Text>
                <Text style={styles.quickLabel}>Thử chuông</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent activity */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            {activityLog.length === 0 ? (
              <View style={[styles.activityRow, { justifyContent: 'center' }]}>
                <Text style={styles.activityTime}>Chưa có hoạt động nào</Text>
              </View>
            ) : (
              activityLog.map((item, idx) => (
                <View key={idx} style={styles.activityRow}>
                  <Text style={styles.activityEmoji}>📌</Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>[{item.action}] {item.detail ?? ''}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.brandFaded,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.brand,
  },
  avatar: {
    fontSize: 24,
  },
  dateBadge: {
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    textTransform: 'capitalize',
  },
  quickAccess: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    position: 'relative',
  },
  quickCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  quickEmoji: {
    fontSize: 28,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: BrandColors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  recentSection: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  activityEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  activityInfo: {
    flex: 1,
    gap: 3,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  activityTime: {
    fontSize: 11,
    color: BrandColors.textMuted,
    fontWeight: '500',
  },
});
