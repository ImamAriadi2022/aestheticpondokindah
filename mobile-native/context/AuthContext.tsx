import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { registerForPushNotifications } from '@/services/pushNotificationService';
import { authStorage } from '@/storage/authStorage';
import { authService } from '@/services/authService';
import { router } from 'expo-router';
import type { User, RegisterPayload } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginGoogle: (payload: { credential?: string; access_token?: string; code?: string; mode?: 'login' | 'register' }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthSession: (token: string, user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await authStorage.getToken();
        const storedUser = await authStorage.getUser();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (err) {
        // Silent — treat as logged out
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const setAuthSession = useCallback(async (newToken: string, newUser: User) => {
    if (newUser?.role === 'doctor' || newUser?.role === 'clinic_admin' || newUser?.role === 'admin') {
      await authStorage.clearAll();
      throw new Error('Aplikasi mobile ini khusus untuk Pasien. Akun Dokter dan Admin silakan login melalui portal web klinik.');
    }
    await authStorage.saveToken(newToken);
    await authStorage.saveUser(newUser);
    setToken(newToken);
    setUser(newUser);
    registerForPushNotifications();
    router.replace('/(tabs)');
  }, []);

  const routeByRole = (role?: string) => {
    if (role === 'doctor' || role === 'clinic_admin' || role === 'admin') {
      throw new Error('Aplikasi mobile ini khusus untuk Pasien. Akun Dokter dan Admin silakan login melalui portal web klinik.');
    }
    router.replace('/(tabs)');
  };

  const login = useCallback(async (phoneOrEmail: string, password: string) => {
    const res = await authService.login({ login: phoneOrEmail, password });
    if (res.user?.role === 'doctor' || res.user?.role === 'clinic_admin' || res.user?.role === 'admin') {
      await authStorage.clearAll();
      throw new Error('Aplikasi mobile ini khusus untuk Pasien. Akun Dokter dan Admin silakan login melalui portal web klinik.');
    }
    setToken(res.token);
    setUser(res.user);
    registerForPushNotifications();
    router.replace('/(tabs)');
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    setToken(res.token);
    setUser(res.user);
    registerForPushNotifications();
    router.replace('/(tabs)');
  }, []);

  const loginGoogle = useCallback(async (payload: { credential?: string; access_token?: string; code?: string; mode?: 'login' | 'register' }) => {
    const res = await authService.loginGoogle(payload);
    if (res.user?.role === 'doctor' || res.user?.role === 'clinic_admin' || res.user?.role === 'admin') {
      await authStorage.clearAll();
      throw new Error('Aplikasi mobile ini khusus untuk Pasien. Akun Dokter dan Admin silakan login melalui portal web klinik.');
    }
    setToken(res.token);
    setUser(res.user);
    registerForPushNotifications();
    router.replace('/(tabs)');
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await authService.logout();
    setToken(null);
    setUser(null);
    setIsLoading(false);
    router.replace('/(auth)/login');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = await authStorage.getToken();
      if (storedToken && !token) {
        setToken(storedToken);
      }
      const res = await authService.me();
      if (res?.user) {
        setUser(res.user);
        await authStorage.saveUser(res.user);
      }
    } catch {
      // Silent refresh failure
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      loginGoogle,
      logout,
      refreshUser,
      setAuthSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
