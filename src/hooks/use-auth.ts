import { useState } from 'react';

import { MOCK_USERS } from '@/constants/mock-data';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const login = async (phone: string, _password: string): Promise<boolean> => {
    // Mock: accept any password for demo users
    const user = MOCK_USERS.find(u => u.phone === phone) ?? MOCK_USERS[0];
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    setState({ user, isAuthenticated: true });
    return true;
  };

  const logout = () => {
    setState({ user: null, isAuthenticated: false });
  };

  return { ...state, login, logout };
}
