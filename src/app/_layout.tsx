import { Slot } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/AuthContext';
import { GlobalOrderNotification } from '@/components/orders/global-notification';

/**
 * Root layout — AuthProvider phải bọc ngoài cùng để
 * mọi screen trong Expo Router đều có context.
 * Dùng <Slot> thay <Stack> để tránh re-mount context khi navigate.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <AnimatedSplashOverlay />
      <Slot />
      <GlobalOrderNotification />
    </AuthProvider>
  );
}
