import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'apident_auth_token';
const USER_KEY = 'apident_user';

export const authStorage = {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },

  async getToken(): Promise<string | null> {
    const sec = await SecureStore.getItemAsync(TOKEN_KEY);
    if (sec) return sec;
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async removeToken(): Promise<void> {
    await Promise.allSettled([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      AsyncStorage.removeItem(TOKEN_KEY),
    ]);
  },

  async saveUser(user: any): Promise<void> {
    const raw = JSON.stringify(user);
    await SecureStore.setItemAsync(USER_KEY, raw);
    try {
      await AsyncStorage.setItem(USER_KEY, raw);
    } catch {}
  },

  async getUser(): Promise<any | null> {
    let raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) {
      try {
        raw = await AsyncStorage.getItem(USER_KEY);
      } catch {}
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    await Promise.allSettled([
      SecureStore.deleteItemAsync(USER_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },

  async clearAll(): Promise<void> {
    await Promise.allSettled([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.clear(),
    ]);
  },
};
