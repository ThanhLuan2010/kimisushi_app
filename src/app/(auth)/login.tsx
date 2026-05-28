import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (phone: string, password: string) => {
    const ok = await login(phone, password);
    if (ok) {
      router.replace('/(tabs)/dashboard');
    }
    return ok;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <LoginForm onLogin={handleLogin} />
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
});
