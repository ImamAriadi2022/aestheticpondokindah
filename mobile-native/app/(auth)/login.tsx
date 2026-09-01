import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import GoogleAuthButtonNative from '@/components/GoogleAuthButtonNative';

type AuthMode = 'welcome' | 'login' | 'register';

export default function MobileLoginScreen() {
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // Login Form
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const normalizePhone = (val: string) => {
    let cleaned = val.replace(/[^\d]/g, '');
    if (cleaned.startsWith('62')) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.replace(/^0+/, '');
    }
    return cleaned;
  };

  const getFullPhone = (val: string) => {
    const digits = normalizePhone(val);
    return digits ? `+62${digits}` : '';
  };

  const handleLogin = async () => {
    setLoginError('');
    const digits = normalizePhone(phone);
    if (!digits) {
      setLoginError('Nomor WhatsApp / telepon wajib diisi.');
      return;
    }
    if (!password) {
      setLoginError('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = getFullPhone(phone);
      await login(fullPhone, password);
    } catch (err: any) {
      setLoginError(err?.message || 'Nomor WhatsApp atau kata sandi tidak valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    const cleanName = regName.trim();
    if (!cleanName || cleanName.length < 2) {
      setRegisterError('Nama lengkap wajib diisi minimal 2 karakter.');
      return;
    }
    const digits = normalizePhone(regPhone);
    if (!digits || digits.length < 8) {
      setRegisterError('Nomor WhatsApp tidak valid. Masukkan nomor yang aktif.');
      return;
    }
    if (regPassword.length < 6) {
      setRegisterError('Kata sandi minimal harus 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegisterError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = getFullPhone(regPhone);
      await register({
        name: cleanName,
        phone: fullPhone,
        email: `${digits}@aestheticpondokindah.com`,
        password: regPassword,
        password_confirmation: regConfirmPassword,
      });
    } catch (err: any) {
      setRegisterError(err?.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. WELCOME SCREEN (RATA TENGAH ATAS-BAWAH & KANAN-KIRI)
  if (mode === 'welcome') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.centerScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerCard}>
            {/* Header with Vertical Logo */}
            <View style={styles.welcomeHeader}>
              <Image
                source={require('@/assets/logo/logo-vertikal.webp')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Subtitle */}
            <Text style={styles.welcomeDescription}>
              Senang melihatmu kembali! Masuk untuk melanjutkan perawatan gigi terbaik Anda di Aesthetic Pondok Indah.
            </Text>

            {/* Login Options */}
            <View style={styles.optionsWrap}>
              <TouchableOpacity
                style={styles.mainActionBtn}
                onPress={() => {
                  setLoginError('');
                  setMode('login');
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.mainActionBtnText}>Masuk dengan WhatsApp</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ATAU</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In */}
              <GoogleAuthButtonNative mode="login" />
            </View>

            {/* Footer */}
            <View style={styles.welcomeFooter}>
              <Text style={styles.footerPrompt}>Belum punya akun? </Text>
              <TouchableOpacity
                onPress={() => {
                  setRegisterError('');
                  setMode('register');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. LOGIN FORM (RATA TENGAH ATAS-BAWAH & KANAN-KIRI)
  if (mode === 'login') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.centerScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.centerCard}>
              {/* Top Bar with Back Button */}
              <View style={styles.topBar}>
                <TouchableOpacity onPress={() => setMode('welcome')} style={styles.backBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={20} color={colors.charcoal} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topBarTitle}>Masuk ke Akun</Text>
                  <Text style={styles.topBarSubtitle}>Aesthetic Pondok Indah</Text>
                </View>
              </View>

              {/* Error Banner */}
              {loginError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{loginError}</Text>
                </View>
              ) : null}

              {/* Phone Input with +62 Prefix */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.prefixBadge}>
                    <Text style={styles.flagIcon}>🇮🇩</Text>
                    <Text style={styles.prefixText}>+62</Text>
                  </View>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder="857xxxxxxxx"
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(v) => {
                      setPhone(normalizePhone(v));
                      setLoginError('');
                    }}
                    autoFocus
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <View style={styles.passwordInputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={{ marginLeft: 12 }} />
                  <TextInput
                    style={styles.passwordTextInput}
                    placeholder="Masukkan kata sandi"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setLoginError('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.mainActionBtn, isLoading ? styles.btnDisabled : null]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mainActionBtnText}>Masuk Sekarang</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ATAU</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In */}
              <GoogleAuthButtonNative mode="login" />

              {/* Switch to Register */}
              <View style={styles.switchRow}>
                <Text style={styles.footerPrompt}>Belum punya akun? </Text>
                <TouchableOpacity onPress={() => setMode('register')} activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Daftar Sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // 3. REGISTER FORM (RATA TENGAH ATAS-BAWAH & KANAN-KIRI)
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.centerScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerCard}>
            {/* Top Bar with Back Button */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => setMode('welcome')} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={colors.charcoal} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.topBarTitle}>Daftar Akun Baru</Text>
                <Text style={styles.topBarSubtitle}>Aesthetic Pondok Indah</Text>
              </View>
            </View>

            {/* Error Banner */}
            {registerError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{registerError}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <View style={styles.passwordInputRow}>
                <Ionicons name="person-outline" size={18} color={colors.muted} style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Contoh: Ahmad Wijaya"
                  placeholderTextColor={colors.muted}
                  value={regName}
                  onChangeText={(v) => {
                    setRegName(v);
                    setRegisterError('');
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Phone Input with +62 Prefix */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.prefixBadge}>
                  <Text style={styles.flagIcon}>🇮🇩</Text>
                  <Text style={styles.prefixText}>+62</Text>
                </View>
                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="857xxxxxxxx"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  value={regPhone}
                  onChangeText={(v) => {
                    setRegPhone(normalizePhone(v));
                    setRegisterError('');
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi</Text>
              <View style={styles.passwordInputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showRegPassword}
                  value={regPassword}
                  onChangeText={(v) => {
                    setRegPassword(v);
                    setRegisterError('');
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowRegPassword(!showRegPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name={showRegPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Konfirmasi Kata Sandi</Text>
              <View style={styles.passwordInputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Ulangi kata sandi"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showRegPassword}
                  value={regConfirmPassword}
                  onChangeText={(v) => {
                    setRegConfirmPassword(v);
                    setRegisterError('');
                  }}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.mainActionBtn, isLoading ? styles.btnDisabled : null]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainActionBtnText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <GoogleAuthButtonNative mode="register" />

            {/* Switch to Login */}
            <View style={styles.switchRow}>
              <Text style={styles.footerPrompt}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => setMode('login')} activeOpacity={0.7}>
                <Text style={styles.footerLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  centerScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 28,
  },
  centerCard: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    marginTop: -30,
  },
  welcomeHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 200,
    height: 90,
  },
  welcomeDescription: {
    fontSize: 13.5,
    color: '#5C5546',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  optionsWrap: {
    gap: 12,
  },
  mainActionBtn: {
    height: 52,
    backgroundColor: '#C9A24A',
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: '#C9A24A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  mainActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8DFC8',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C8272',
    letterSpacing: 1,
  },
  welcomeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerPrompt: {
    fontSize: 13,
    color: '#8C8272',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C9A24A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2416',
    fontFamily: fonts.heading,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#8C8272',
    marginTop: 1,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBoxText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  prefixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderRightWidth: 1,
    borderRightColor: '#EADBBD',
    paddingHorizontal: 12,
    gap: 4,
  },
  flagIcon: { fontSize: 14 },
  prefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C6B1C',
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2416',
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    borderRadius: radius.xl,
  },
  passwordTextInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#2C2416',
  },
  eyeBtn: {
    padding: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
