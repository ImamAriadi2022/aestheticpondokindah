import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
    if (!phone.trim()) newErrors.phone = 'Nomor WhatsApp / telepon wajib diisi.';
    else if (phone.trim().length < 9) newErrors.phone = 'Nomor telepon tidak valid.';
    if (!email.trim()) newErrors.email = 'Alamat email wajib diisi.';
    else if (!email.includes('@')) newErrors.email = 'Format email tidak valid.';
    if (!password) newErrors.password = 'Kata sandi wajib diisi.';
    else if (password.length < 6) newErrors.password = 'Kata sandi minimal 6 karakter.';
    if (password !== passwordConfirmation) newErrors.password_confirmation = 'Konfirmasi kata sandi tidak cocok.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (err: any) {
      const msg = err?.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.';
      if (err?.errors) {
        setErrors({
          name: err.errors?.name?.[0],
          phone: err.errors?.phone?.[0],
          email: err.errors?.email?.[0],
          password: err.errors?.password?.[0],
          password_confirmation: err.errors?.password_confirmation?.[0],
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
            <Image
              source={require('@/assets/logo/logo-vertikal.webp')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Pendaftaran Pasien Baru</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Buat Akun Baru</Text>
            <Text style={styles.cardSubtitle}>Daftar langsung untuk kemudahan reservasi & konsultasi</Text>

            {errors.general ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Name Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Contoh: Ahmad Wijaya"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
                autoCapitalize="words"
              />
              {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
            </View>

            {/* Phone Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Nomor WhatsApp / Telepon</Text>
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

            {/* Email Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Alamat Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Contoh: pasien@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                autoComplete="email"
              />
              {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
            </View>

            {/* Password Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Kata Sandi</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
                  placeholder="Minimal 6 karakter"
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

            {/* Password Confirmation Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
              <TextInput
                style={[styles.input, errors.password_confirmation ? styles.inputError : null]}
                placeholder="Ulangi kata sandi"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={passwordConfirmation}
                onChangeText={(v) => { setPasswordConfirmation(v); setErrors((e) => ({ ...e, password_confirmation: undefined })); }}
              />
              {errors.password_confirmation ? <Text style={styles.fieldError}>{errors.password_confirmation}</Text> : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerBtn, isLoading ? styles.registerBtnDisabled : null]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Login */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Sudah memiliki akun? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.switchLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    maxWidth: 390,
    marginTop: -20,
  },
  logoImage: {
    width: 160,
    height: 75,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2, textAlign: 'center' },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: colors.charcoalMedium, marginBottom: spacing.md },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: radius.md,
    borderWidth: 1, borderColor: '#FECACA',
    padding: spacing.sm, marginBottom: spacing.md,
  },
  errorBannerText: { color: colors.error, fontSize: 13 },
  fieldWrap: { marginBottom: spacing.md },
  label: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm + 2,
    fontSize: 14, color: colors.charcoal,
    backgroundColor: colors.cream,
  },
  inputError: { borderColor: colors.error },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 10 },
  eyeText: { fontSize: 16 },
  fieldError: { color: colors.error, fontSize: 11, marginTop: 3 },
  registerBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    padding: spacing.md - 2,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  switchText: { fontSize: 13, color: colors.charcoalMedium },
  switchLink: { fontSize: 13, fontWeight: '700', color: colors.gold },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: spacing.lg },
});