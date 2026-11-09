import { Tabs } from 'expo-router';
import { Image, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4D2E',
        tabBarInactiveTintColor: '#6B6B8A',
        tabBarStyle: {
          backgroundColor: '#0D0D1A',
          borderTopWidth: 1,
          borderTopColor: '#1A1A2E',
          height: Platform.OS === 'ios' ? 88 : 68 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12 + insets.bottom,
          paddingTop: Platform.OS === 'ios' ? 0 : 6,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tables"
        options={{
          title: 'Bàn',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: 'Thực đơn',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn Online',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Đặt bàn',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18 }}>📜</Text>
          ),
        }}
      />
    </Tabs>
  );
}
