import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius } from '@/theme/colors';

const MENU_ITEMS = [
  { icon: '📅', label: 'Riwayat Janji Temu', route: '/(tabs)/booking' },
  { icon: '💎', label: 'Membership & Poin', route: '/(tabs)/membership' },
  { icon: '🔔', label: 'Notifikasi', route: '/(tabs)/notifications' },
  { icon: '🔒', label: 'Ubah Kata Sandi', route: null },
  { icon: '❓', label: 'Bantuan', route: null },
  { icon: 'ℹ️', label: 'Tentang Aplikasi', route: null },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profilePhone}>{user?.phone}</Text>
            {user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
          </View>
          <View style={[styles.roleBadge, user?.role === 'clinic_admin' ? styles.adminBadge : null]}>
            <Text style={[styles.roleText, user?.role === 'clinic_admin' ? { color: colors.gold } : null]}>
              {user?.role === 'clinic_admin' ? '⚙️ Admin' : user?.role === 'doctor' ? '🩺 Dokter' : '👤 Pasien'}
            </Text>
          </View>
        </View>

        {/* Membership Status */}
        <View style={styles.memberBanner}>
          <Text style={styles.memberBannerTier}>
            ✦ Tier {(user?.membership_level ?? 'Bronze').toUpperCase()}
          </Text>
          <Text style={styles.memberBannerStatus}>
            {user?.membership_status === 'active' ? '● Aktif' : '○ Tidak Aktif'}
          </Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as any) : null}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Keluar dari Akun</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Aesthetic Pondok Indah v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: spacing.xxl },
  header: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal },
  profileCard: {
    marginHorizontal: spacing.lg, backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.goldMuted, borderWidth: 2, borderColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.gold },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  profilePhone: { fontSize: 13, color: colors.charcoalMedium, marginTop: 2 },
  profileEmail: { fontSize: 12, color: colors.muted, marginTop: 1 },
  roleBadge: { backgroundColor: colors.creamDark, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadge: { backgroundColor: colors.goldMuted },
  roleText: { fontSize: 11, fontWeight: '700', color: colors.charcoalMedium },
  memberBanner: {
    marginHorizontal: spacing.lg, backgroundColor: colors.charcoal,
    borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  memberBannerTier: { color: colors.gold, fontSize: 14, fontWeight: '700' },
  memberBannerStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  menuSection: { marginHorizontal: spacing.lg, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: { fontSize: 18, marginRight: spacing.md, width: 28 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.charcoal },
  menuChevron: { fontSize: 20, color: colors.muted },
  logoutBtn: {
    marginHorizontal: spacing.lg, borderRadius: 999, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.error,
    marginBottom: spacing.md,
  },
  logoutText: { color: colors.error, fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
