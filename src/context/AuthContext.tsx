import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, removeToken, setToken, BASE_URL } from '@/services/api';
import { registerForPushNotificationsAsync } from '@/services/notifications';

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      // Đăng ký quyền & tạo kênh thông báo ngay khi ứng dụng khởi chạy
      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          console.log('[AuthContext] Push Token obtained on startup:', pushToken);
        }
      });

      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const res = await authApi.verify(token);
          if (res.valid && res.user) {
            setUser(res.user);
            if (token) {
              const pushToken = await registerForPushNotificationsAsync();
              if (pushToken) {
                fetch(`${BASE_URL}/api/fcm/token`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: pushToken, deviceInfo: 'Expo App' })
                }).catch(console.warn);
              }
            }
          } else {
            await removeToken();
          }
        }
      } catch {
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(username, password);
      if (res.success && res.token) {
        await setToken(res.token);
        setUser(res.user);
        
        registerForPushNotificationsAsync().then(pushToken => {
          if (pushToken) {
            fetch(`${BASE_URL}/api/fcm/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: pushToken, deviceInfo: 'Expo App' })
            }).catch(console.warn);
          }
        });

        return true;
      }
      return false;
    } catch (e) {
      console.warn('[Auth] Login failed:', e);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
