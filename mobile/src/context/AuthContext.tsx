import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { name: string; email?: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isGuest: false,
  });

  // Auto-login on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          const res = await authAPI.me();
          setState({ user: res.data, isLoading: false, isGuest: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await authAPI.login(identifier, password);
    const { access_token, refresh_token, user } = res.data;
    await SecureStore.setItemAsync('access_token', access_token);
    await SecureStore.setItemAsync('refresh_token', refresh_token);
    setState({ user, isLoading: false, isGuest: false });
  }, []);

  const register = useCallback(async (data: Parameters<typeof authAPI.register>[0]) => {
    const res = await authAPI.register(data);
    const { access_token, refresh_token, user } = res.data;
    await SecureStore.setItemAsync('access_token', access_token);
    await SecureStore.setItemAsync('refresh_token', refresh_token);
    setState({ user, isLoading: false, isGuest: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      const refresh = await SecureStore.getItemAsync('refresh_token');
      if (refresh) await authAPI.logout(refresh);
    } catch {}
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setState({ user: null, isLoading: false, isGuest: false });
  }, []);

  const continueAsGuest = useCallback(() => {
    setState((s) => ({ ...s, isGuest: true, isLoading: false }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

