import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doctorService, DoctorSchedule } from '@/services/doctorService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const DAY_NAMES: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

export default function DoctorSchedulesScreen() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await doctorService.getSchedules();
      setSchedules(res);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const renderItem = ({ item }: { item: DoctorSchedule }) => {
    const dayLabel = DAY_NAMES[item.day_of_week?.toLowerCase()] || item.day_of_week;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dayBadge}>
            <Ionicons name="calendar" size={14} color={colors.goldDark} />
            <Text style={styles.dayText}>{dayLabel}</Text>
          </View>
          <View style={[styles.statusBadge, item.is_active ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, item.is_active ? styles.statusTextActive : styles.statusTextInactive]}>
              {item.is_active ? 'Aktif Praktik' : 'Libur / Tutup'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.gold} />
            <Text style={styles.infoText}>Jam Praktik: {item.start_time} - {item.end_time} WIB</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={colors.gold} />
            <Text style={styles.infoText}>Maksimal Kuota: {item.max_quota || 10} Pasien / Hari</Text>
          </View>
          {item.branch_name ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.gold} />
              <Text style={styles.infoText}>Cabang: {item.branch_name}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jadwal Praktik Dokter</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={48} color={colors.gold} />
              <Text style={styles.emptyTitle}>Belum Ada Jadwal Praktik</Text>
              <Text style={styles.emptySubtitle}>Jadwal praktik dokter Anda di klinik akan ditampilkan di sini.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#EADBBD',
    gap: 6,
  },
  dayText: { fontSize: 12, fontWeight: '700', color: colors.goldDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
  statusActive: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  statusInactive: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextActive: { color: '#065F46' },
  statusTextInactive: { color: '#991B1B' },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 12, color: colors.charcoalMedium },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 },
});