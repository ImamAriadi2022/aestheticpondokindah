import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StyleSheet, Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi.';
    else if (phone.trim().length < 9) newErrors.phone = 'Nomor telepon tidak valid.';
    if (!password) newErrors.password = 'Kata sandi wajib diisi.';
    else if (password.length < 6) newErrors.password = 'Kata sandi minimal 6 karakter.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await login(phone.trim(), password);
    } catch (err: any) {
      const msg = err?.message || 'Gagal masuk. Periksa nomor telepon dan kata sandi Anda.';
      if (err?.errors) {
        setErrors({
          phone: err.errors?.phone?.[0],
          password: err.errors?.password?.[0],
          general: msg,
        });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>✦</Text>
            </View>
            <Text style={styles.brandName}>Aesthetic Pondok Indah</Text>
            <Text style={styles.subtitle}>Dental Clinic</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selamat Datang</Text>
            <Text style={styles.cardSubtitle}>Masuk ke akun Anda untuk melanjutkan</Text>

            {errors.general ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Phone Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Contoh: 08123456789"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: undefined })); }}
                autoComplete="tel"
              />
              {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
            </View>

            {/* Password Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Kata Sandi</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                  autoComplete="password"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoading ? styles.loginBtnDisabled : null]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Masuk</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            © {new Date().getFullYear()} Aesthetic Pondok Indah Dental Clinic
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.goldMuted,
    borderWidth: 2, borderColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoIcon: { fontSize: 28, color: colors.gold },
  brandName: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: fonts.heading },
  subtitle: { fontSize: 13, color: colors.charcoalMedium, marginTop: 2 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.charcoalMedium, marginBottom: spacing.lg },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: radius.md,
    borderWidth: 1, borderColor: '#FECACA',
    padding: spacing.sm, marginBottom: spacing.md,
  },
  errorBannerText: { color: colors.error, fontSize: 13 },
  fieldWrap: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '600', color: colors.charcoalMedium, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm + 4,
    fontSize: 15, color: colors.charcoal,
    backgroundColor: colors.cream,
  },
  inputError: { borderColor: colors.error },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  eyeText: { fontSize: 18 },
  fieldError: { color: colors.error, fontSize: 12, marginTop: 4 },
  loginBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: spacing.xl },
});
