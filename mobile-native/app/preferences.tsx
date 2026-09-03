import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing } from '@/theme/colors';
import { registerForPushNotifications } from '@/services/pushNotificationService';

const SETTINGS_KEY = 'apident_notification_preferences';
type NotificationPreferences = { enabled: boolean; reservations: boolean; consultations: boolean; promotions: boolean };
const DEFAULTS: NotificationPreferences = { enabled: true, reservations: true, consultations: true, promotions: true };

export default function PreferencesScreen() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SETTINGS_KEY),
      Notifications.getPermissionsAsync(),
    ]).then(([raw, permission]) => {
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      setPermissionStatus(permission.status);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const updateSetting = async (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const enableNotifications = async () => {
    const token = await registerForPushNotifications();
    const permission = await Notifications.getPermissionsAsync();
    setPermissionStatus(permission.status);
    if (token) {
      await updateSetting('enabled', true);
      return;
    }
    if (permission.status === 'denied') {
      Alert.alert('Izin Notifikasi Ditolak', 'Aktifkan izin notifikasi dari pengaturan perangkat.', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const toggleNotifications = (value: boolean) => {
    if (value) {
      enableNotifications();
    } else {
      updateSetting('enabled', false);
    }
  };

  const isGranted = permissionStatus === Notifications.PermissionStatus.GRANTED;
  const rows: { key: keyof NotificationPreferences; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'reservations', title: 'Reservasi dan Janji Temu', description: 'Pembaruan status booking dan konfirmasi jadwal', icon: 'calendar-outline' },
    { key: 'consultations', title: 'Konsultasi', description: 'Pesan baru dan pembaruan konsultasi dokter', icon: 'chatbubble-ellipses-outline' },
    { key: 'promotions', title: 'Promo dan Membership', description: 'Informasi promo, poin, dan manfaat membership', icon: 'gift-outline' },
  ];

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.header}><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={colors.charcoal} /></TouchableOpacity><View><Text style={styles.title}>Preferensi Sistem</Text><Text style={styles.subtitle}>Kelola notifikasi aplikasi native</Text></View></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {isLoading ? <ActivityIndicator color={colors.gold} size="large" /> : <>
        <View style={styles.card}>
          <View style={styles.cardHeader}><View style={styles.mainIcon}><Ionicons name="notifications-outline" size={22} color={colors.goldDark} /></View><View style={styles.cardHeaderText}><Text style={styles.sectionTitle}>Notifikasi Aplikasi</Text><Text style={styles.helper}>Terima informasi penting langsung di perangkat Anda.</Text></View></View>
          <View style={styles.mainToggle}><View><Text style={styles.rowTitle}>Izinkan notifikasi</Text><Text style={styles.rowDescription}>{isGranted ? 'Izin perangkat aktif' : 'Izin perangkat belum aktif'}</Text></View><Switch value={settings.enabled && isGranted} onValueChange={toggleNotifications} trackColor={{ false: '#D1D5DB', true: '#D6B765' }} thumbColor={settings.enabled && isGranted ? colors.goldDark : '#F9FAFB'} /></View>
          {!isGranted ? <TouchableOpacity style={styles.settingsLink} onPress={() => Linking.openSettings()}><Text style={styles.settingsLinkText}>Buka pengaturan perangkat</Text><Ionicons name="open-outline" size={15} color={colors.goldDark} /></TouchableOpacity> : null}
        </View>
        <View style={[styles.card, !settings.enabled && styles.disabledCard]}><Text style={styles.sectionTitle}>Jenis Notifikasi</Text>{rows.map((row) => <View style={styles.preferenceRow} key={row.key}><View style={styles.rowIcon}><Ionicons name={row.icon} size={18} color={colors.goldDark} /></View><View style={styles.rowText}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.rowDescription}>{row.description}</Text></View><Switch value={settings[row.key]} onValueChange={(value) => updateSetting(row.key, value)} disabled={!settings.enabled} trackColor={{ false: '#D1D5DB', true: '#D6B765' }} thumbColor={settings[row.key] ? colors.goldDark : '#F9FAFB'} /></View>)}</View>
        <Text style={styles.note}>Pengaturan ini hanya mengatur notifikasi di aplikasi native. Anda tetap dapat melihat seluruh riwayat notifikasi pada tab Notifikasi.</Text>
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.cream }, header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }, backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 19, fontWeight: '800', color: colors.charcoal }, subtitle: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2 }, content: { padding: spacing.md, gap: spacing.md }, card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md }, disabledCard: { opacity: 0.55 }, cardHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, mainIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' }, cardHeaderText: { flex: 1 }, sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.charcoal }, helper: { fontSize: 11, lineHeight: 16, color: colors.charcoalMedium, marginTop: 2 }, mainToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5EFE6', paddingTop: spacing.md }, preferenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: '#F5EFE6', paddingTop: spacing.sm }, rowIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' }, rowText: { flex: 1 }, rowTitle: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal }, rowDescription: { fontSize: 10.5, color: colors.charcoalMedium, marginTop: 2 }, settingsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 5 }, settingsLinkText: { color: colors.goldDark, fontSize: 12, fontWeight: '700' }, note: { fontSize: 11, lineHeight: 17, color: colors.charcoalMedium, textAlign: 'center', paddingHorizontal: spacing.sm } });
