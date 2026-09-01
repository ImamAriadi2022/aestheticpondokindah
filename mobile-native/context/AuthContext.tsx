import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const routeByRole = (role?: string) => {
    if (role === 'doctor') {
      router.replace('/doctor');
    } else {
      router.replace('/(tabs)');
    }
  };

  const login = useCallback(async (phoneOrEmail: string, password: string) => {
    const res = await authService.login({ login: phoneOrEmail, password });
    setToken(res.token);
    setUser(res.user);
    routeByRole(res.user?.role);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    setToken(res.token);
    setUser(res.user);
    routeByRole(res.user?.role);
  }, []);

  const loginGoogle = useCallback(async (payload: { credential?: string; access_token?: string; code?: string; mode?: 'login' | 'register' }) => {
    const res = await authService.loginGoogle(payload);
    setToken(res.token);
    setUser(res.user);
    routeByRole(res.user?.role);
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
      const res = await authService.me();
      if (res?.user) {
        setUser(res.user);
        await authStorage.saveUser(res.user);
      }
    } catch {
      // Silent refresh failure
    }
  }, []);

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
