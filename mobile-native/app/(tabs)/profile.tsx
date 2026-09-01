import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const MENU_ITEMS = [
  { icon: 'calendar-outline', label: 'Riwayat Janji Temu', route: '/(tabs)/booking', color: '#C9A24A' },
  { icon: 'chatbubbles-outline', label: 'Konsultasi Online', route: '/(tabs)/consultation', color: '#059669' },
  { icon: 'sparkles-outline', label: 'Membership & Poin Loyalty', route: '/(tabs)/membership', color: '#D97706' },
  { icon: 'notifications-outline', label: 'Pusat Notifikasi', route: '/(tabs)/notifications', color: '#2563EB' },
  { icon: 'lock-closed-outline', label: 'Keamanan & Kata Sandi', route: null, color: '#4B5563' },
  { icon: 'help-circle-outline', label: 'Pusat Bantuan & FAQ', route: null, color: '#4B5563' },
  { icon: 'information-circle-outline', label: 'Tentang Aesthetic Pondok Indah', route: null, color: '#4B5563' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const tier = (user?.membership_level ?? 'bronze').toUpperCase();
  const roleLabel = user?.role === 'doctor' ? 'Dokter Spesialis' : user?.role === 'clinic_admin' ? 'Administrator' : 'Pasien Terdaftar';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil Pengguna</Text>
          <Text style={styles.subtitle}>Informasi akun & pengaturan aplikasi</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'P'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{user?.name ?? 'Pasien'}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={13} color={colors.charcoalMedium} />
              <Text style={styles.profileMeta}>{user?.phone || 'Nomor WhatsApp belum diisi'}</Text>
            </View>
            {user?.email ? (
              <View style={styles.metaRow}>
                <Ionicons name="mail-outline" size={13} color={colors.charcoalMedium} />
                <Text style={styles.profileMeta} numberOfLines={1}>{user.email}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.role === 'doctor' ? 'medkit' : user?.role === 'clinic_admin' ? 'shield-checkmark' : 'person'}
              size={12}
              color={colors.goldDark}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Membership Banner */}
        <View style={styles.memberBanner}>
          <View style={styles.memberBannerLeft}>
            <Ionicons name="sparkles" size={16} color={colors.gold} />
            <Text style={styles.memberBannerTier}>Tier {tier}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: user?.membership_status === 'active' ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.memberBannerStatus}>
              {user?.membership_status === 'active' ? 'Aktif' : 'Non-aktif'}
            </Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, idx === MENU_ITEMS.length - 1 ? { borderBottomWidth: 0 } : null]}
              onPress={() => item.route ? router.push(item.route as any) : null}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.charcoalMedium} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Aesthetic Pondok Indah Dental Clinic · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.charcoal },
  subtitle: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.goldDark },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  profileMeta: { fontSize: 12, color: colors.charcoalMedium },
  roleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.goldDark },
  memberBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: '#2C2416',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberBannerTier: { fontSize: 13, fontWeight: '700', color: colors.gold },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  memberBannerStatus: { fontSize: 11, color: '#fff', fontWeight: '600' },
  menuSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.charcoal },
  logoutBtn: {
    marginHorizontal: spacing.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: radius.xl,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  version: { textAlign: 'center', fontSize: 11, color: colors.charcoalMedium, marginTop: spacing.xs },
});
