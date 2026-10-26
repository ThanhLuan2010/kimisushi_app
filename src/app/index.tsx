import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#E8413E" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/dashboard' : '/(auth)/login'} />;
}
