import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Cấu hình hiển thị và phát âm thanh khi có thông báo (cả khi app đang mở)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('[Notifications Handler] 🔔 Handling notification in foreground:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    });
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export const ORDER_NOTIFICATION_CHANNEL = 'new_orders';

export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    try {
      console.log('[Notifications] ⚙️ Configuring Android Notification Channels...');

      // Kênh thông báo cho đơn hàng mới với âm thanh tùy chỉnh notification_sound.mp3
      await Notifications.setNotificationChannelAsync(ORDER_NOTIFICATION_CHANNEL, {
        name: 'Đơn Hàng Mới (Âm thanh riêng)',
        importance: AndroidImportance.MAX,
        sound: 'notification_sound.mp3',
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF208AEF',
        enableVibrate: true,
        showBadge: true,
      });
      console.log(`[Notifications] ✅ Channel "${ORDER_NOTIFICATION_CHANNEL}" created.`);

      // Kênh mặc định
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Mặc định',
        importance: AndroidImportance.MAX,
        sound: 'notification_sound.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF208AEF',
      });
      console.log('[Notifications] ✅ Channel "default" created.');
    } catch (err) {
      console.warn('[Notifications] ❌ Error setting notification channels:', err);
    }
  }
}

export async function registerForPushNotificationsAsync() {
  let token;

  // Luôn đảm bảo tạo Notification Channel trên Android trước
  await setupNotificationChannels();

  try {
    console.log('[Notifications] 🔍 Checking notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    console.log('[Notifications] Existing permission status:', existingStatus);

    if (existingStatus !== 'granted') {
      console.log('[Notifications] 🔑 Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log('[Notifications] Final permission status:', finalStatus);

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] ⚠️ Notification permission DENIED by user.');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    console.log('[Notifications] 📡 Getting Expo Push Token with projectId:', projectId);

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || projectId,
    })).data;

    console.log('[Notifications] 🔑 Expo Push Token successfully retrieved:', token);
  } catch (e: any) {
    console.warn('[Notifications] ⚠️ Unable to get FCM/Expo Push Token:', e?.message || e);
    console.warn('[Notifications] ℹ️ App will rely on Real-Time Polling + Sound Local Notifications.');
  }

  return token;
}

/**
 * Phát thông báo cục bộ với âm thanh khi phát hiện đơn hàng mới
 */
export async function triggerNewOrderNotification(order: {
  id?: string;
  customerName?: string;
  total?: number | string;
  itemsCount?: number;
}) {
  console.log('[Notifications] 🚀 Triggering local notification for order ID:', order.id);
  const title = '🔔 ĐƠN HÀNG MỚI!';
  const customer = order.customerName || 'Khách hàng';
  const priceFormatted = typeof order.total === 'number' ? `${order.total.toFixed(2)} €` : (order.total || '');
  const body = `Khách ${customer} vừa đặt đơn mới ${priceFormatted ? `(${priceFormatted})` : ''}. Chạm để xem chi tiết!`;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'notification_sound.mp3',
        data: { orderId: order.id, type: 'new_order' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: ORDER_NOTIFICATION_CHANNEL,
      },
    });
    console.log('[Notifications] ✅ Local Notification scheduled successfully! Scheduled ID:', id);
  } catch (err) {
    console.warn('[Notifications] ❌ Error in scheduleNotificationAsync:', err);
  }
}

export function addNotificationListener(callback: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications Event] 📩 Notification Received in App:', {
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    });
    callback(notification);
  });
}

export function addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Notifications Event] 👆 User Tapped Notification:', {
      actionIdentifier: response.actionIdentifier,
      notificationId: response.notification.request.identifier,
      title: response.notification.request.content.title,
      data: response.notification.request.content.data,
    });
    callback(response);
  });
}

