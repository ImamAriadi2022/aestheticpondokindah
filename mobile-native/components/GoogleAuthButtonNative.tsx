import React, { useState } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing } from '@/theme/colors';
import { API_BASE } from '@/constants/api';
import { authStorage } from '@/storage/authStorage';
import { authService } from '@/services/authService';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthButtonNativeProps {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export default function GoogleAuthButtonNative({
  mode = 'login',
  onSuccess,
  onError,
}: GoogleAuthButtonNativeProps) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'aestheticpondokindah',
        path: 'oauth2redirect',
      });

      const backendAuthUrl =
        `${API_BASE}/auth/google/redirect?` +
        `mode=${encodeURIComponent(mode)}` +
        `&return_to=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(backendAuthUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        let token: string | null = null;
        let userJson: string | null = null;
        let errorMsg: string | null = null;

        const queryIdx = result.url.indexOf('?');
        if (queryIdx !== -1) {
          const queryString = result.url.substring(queryIdx + 1);
          const params = new URLSearchParams(queryString);
          token = params.get('token');
          userJson = params.get('user');
          errorMsg = params.get('error');
        }

        if (errorMsg) {
          throw new Error(decodeURIComponent(errorMsg));
        }

        if (token && userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          await authStorage.saveToken(token);
          await authStorage.saveUser(user);
          await refreshUser();

          if (user.role === 'doctor' || user.role === 'clinic_admin' || user.role === 'admin') {
            await authStorage.clearAll();
            throw new Error('Aplikasi mobile ini khusus untuk Pasien. Akun Dokter dan Admin silakan login melalui portal web.');
          }

          router.replace('/(tabs)');
          onSuccess?.();
          return;
        }
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return;
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal masuk dengan Google.';
      onError?.(msg);
      Alert.alert('Google Sign-In', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handleGoogleAuth}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.charcoal} />
      ) : (
        <View style={styles.inner}>
          {/* Google G Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.googleLetter}>G</Text>
          </View>
          <Text style={styles.btnText}>
            {mode === 'register' ? 'Daftar dengan Google' : 'Masuk dengan Google'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4285F4',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2416',
  },
});
