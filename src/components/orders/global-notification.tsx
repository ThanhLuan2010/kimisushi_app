import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-orders';
import { BrandColors } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface NotificationBannerProps {
  message: string;
  onDismiss: () => void;
  onPress: () => void;
}

function NotificationBanner({ message, onDismiss, onPress }: NotificationBannerProps) {
  const slideY = useRef(new Animated.Value(-120)).current;

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
      <Pressable onPress={onPress} style={styles.bannerContent}>
        <Text style={styles.bannerIcon}>🍣</Text>
        <View style={styles.textContainer}>
          <Text style={styles.bannerTitle}>Có đơn hàng mới!</Text>
          <Text style={styles.bannerText} numberOfLines={1}>{message}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onDismiss} style={styles.bannerClose}>
        <Text style={styles.bannerCloseText}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export function GlobalOrderNotification() {
  const { isAuthenticated } = useAuth();
  const { pendingOrders } = useOrders();
  const [notification, setNotification] = useState<string | null>(null);
  const [notifiedOrderId, setNotifiedOrderId] = useState<string | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);
  const router = useRouter();

  // Listen for order status changes (e.g. accepted from another screen/hook)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('orderStatusChanged', ({ id }) => {
      if (id === notifiedOrderId) {
        setNotification(null);
        setNotifiedOrderId(null);
        setDismissedOrderId(id);
      }
    });
    return () => {
      sub.remove();
    };
  }, [notifiedOrderId]);

  // Watch pending orders and show/hide notification
  useEffect(() => {
    if (!isAuthenticated) {
      setNotification(null);
      setNotifiedOrderId(null);
      return;
    }

    if (pendingOrders.length === 0) {
      setNotification(null);
      setNotifiedOrderId(null);
      return;
    }

    // If currently showing a toast, check if that order is still pending
    if (notifiedOrderId) {
      const isStillPending = pendingOrders.some(o => o.id === notifiedOrderId);
      if (!isStillPending) {
        // The order has been accepted/removed! Clear the toast.
        setNotification(null);
        setNotifiedOrderId(null);
        return;
      }
    }

    // Show notification for the first pending order if not dismissed
    const o = pendingOrders[0];
    if (o.id === dismissedOrderId) {
      setNotification(null);
      setNotifiedOrderId(null);
      return;
    }

    // Only show toast for very recent orders (e.g. placed within the last 5 minutes)
    // to prevent old pending orders from triggering toast spams on app launch or order accept.
    const isVeryRecent = Math.abs(Date.now() - new Date(o.createdAt).getTime()) < 300000;
    if (!isVeryRecent) {
      return;
    }

    // Set notification if it's a new order we haven't notified for yet
    if (notifiedOrderId !== o.id) {
      setNotification(`Đơn từ ${o.customerName} – ${o.items.length} món (${o.total.toLocaleString('de-DE')} €)`);
      setNotifiedOrderId(o.id);
    }
  }, [pendingOrders, isAuthenticated, dismissedOrderId, notifiedOrderId]);

  if (!notification) return null;

  const firstOrder = pendingOrders[0];

  return (
    <NotificationBanner
      message={notification}
      onDismiss={() => {
        if (firstOrder) {
          setDismissedOrderId(firstOrder.id);
        }
        setNotification(null);
        setNotifiedOrderId(null);
      }}
      onPress={() => {
        if (firstOrder) {
          setDismissedOrderId(firstOrder.id);
        }
        setNotification(null);
        setNotifiedOrderId(null);
        router.push('/(tabs)/orders');
      }}
    />
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: BrandColors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 55, // Height padding for Safe Area
    gap: 10,
    shadowColor: BrandColors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  bannerClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCloseText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
