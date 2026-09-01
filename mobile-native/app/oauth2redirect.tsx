import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { authStorage } from '@/storage/authStorage';
import { colors } from '@/theme/colors';

export default function OAuth2RedirectScreen() {
  const params = useLocalSearchParams<{ token?: string; user?: string; error?: string }>();

  useEffect(() => {
    const handleRedirect = async () => {
      if (params.token && params.user) {
        try {
          const user = JSON.parse(decodeURIComponent(params.user));
          await authStorage.saveToken(params.token);
          await authStorage.saveUser(user);
          router.replace('/(tabs)');
          return;
        } catch {
          router.replace('/(auth)/login');
          return;
        }
      }

      // If error or missing params, return to login
      router.replace('/(auth)/login');
    };

    handleRedirect();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.gold} />
      <Text style={styles.text}>Menghubungkan akun...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2416',
  },
});
