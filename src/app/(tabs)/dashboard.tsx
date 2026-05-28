import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CookingCount } from '@/components/dashboard/cooking-count';
import { TableOverview } from '@/components/dashboard/table-overview';
import { BrandColors } from '@/constants/theme';
import { useOrders } from '@/hooks/use-orders';
import { useTables } from '@/hooks/use-tables';
import { useRouter } from 'expo-router';

interface NotificationBannerProps {
  message: string;
  onDismiss: () => void;
}

function NotificationBanner({ message, onDismiss }: NotificationBannerProps) {
  const slideY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  }, [slideY]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideY }] }]}>
      <Text style={styles.bannerIcon}>🔔</Text>
      <Text style={styles.bannerText} numberOfLines={2}>{message}</Text>
      <Pressable onPress={onDismiss} style={styles.bannerClose}>
        <Text style={styles.bannerCloseText}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const { emptyCount, reservedCount, occupiedCount, cookingCount } = useTables();
  const { pendingOrders } = useOrders();
  const router = useRouter();
  const [notification, setNotification] = useState<string | null>(null);

  // Simulate incoming notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification('🍣 Khách Lê Văn Hùng vừa đặt đơn mới – 2 Sushi Cá Hồi, 1 Ramen');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <View style={styles.container}>
      {/* Notification banner */}
      {notification && (
        <NotificationBanner
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}

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
              <Text style={styles.restaurantName}>KimiSushi</Text>
            </View>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👨‍🍳</Text>
            </View>
          </View>

          {/* Today badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>

          {/* Cooking count */}
          <CookingCount count={cookingCount} />

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
            </View>
          </View>

          {/* Recent notifications */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            {[
              { emoji: '✅', text: 'Bàn 5 đã thanh toán – 410.000đ', time: '10 phút trước' },
              { emoji: '🆕', text: 'Đơn online mới từ Phạm Thị Mai', time: '7 phút trước' },
              { emoji: '📅', text: 'Đặt bàn mới: Gia đình Bảo – 18:30 – 8 người', time: '2 giờ trước' },
            ].map((item, idx) => (
              <View key={idx} style={styles.activityRow}>
                <Text style={styles.activityEmoji}>{item.emoji}</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>{item.text}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>
            ))}
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
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: BrandColors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    gap: 10,
    shadowColor: BrandColors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bannerClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCloseText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
    paddingBottom: 100,
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
