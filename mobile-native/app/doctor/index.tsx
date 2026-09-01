import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { doctorService, DoctorQueueItem, DoctorStats } from '@/services/doctorService';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DoctorDashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [queue, setQueue] = useState<DoctorQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, queueRes] = await Promise.allSettled([
        doctorService.getDashboardStats(),
        doctorService.getQueue(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (queueRes.status === 'fulfilled') setQueue(queueRes.value);
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

  const renderQueueItem = ({ item }: { item: DoctorQueueItem }) => {
    const isWaiting = item.status === 'waiting';
    const isCompleted = item.status === 'completed';

    return (
      <View style={styles.queueCard}>
        <View style={styles.queueHeader}>
          <View style={styles.queueNumberWrap}>
            <Text style={styles.queueNumber}>{item.queue_number || '#A1'}</Text>
          </View>
          <View style={styles.queueInfo}>
            <Text style={styles.patientName}>{item.patient_name}</Text>
            <Text style={styles.serviceName}>{item.service_name || 'Konsultasi Spesialis'}</Text>
          </View>
          <View style={[styles.statusBadge, isCompleted ? styles.statusSuccess : styles.statusWaiting]}>
            <Text style={[styles.statusText, isCompleted ? styles.statusTextSuccess : styles.statusTextWaiting]}>
              {isWaiting ? 'Menunggu' : isCompleted ? 'Selesai' : 'Diproses'}
            </Text>
          </View>
        </View>

        <View style={styles.timeSlotRow}>
          <Ionicons name="time-outline" size={14} color={colors.gold} />
          <Text style={styles.timeSlotText}>Slot: {item.time_slot || '14:00 - 15:00 WIB'}</Text>
        </View>

        {item.complaint ? (
          <Text style={styles.complaintText} numberOfLines={2}>
            Keluhan: {item.complaint}
          </Text>
        ) : null}

        <View style={styles.queueActions}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => router.push('/doctor/medical-records')}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text" size={14} color={colors.goldDark} />
            <Text style={styles.actionBtnSecondaryText}>EMR Rekam Medis</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Dokter Spesialis</Text>
          <Text style={styles.doctorName}>{user?.name || 'drg. Spesialis'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderQueueItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListHeaderComponent={
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={20} color={colors.gold} />
                <Text style={styles.statNumber}>{stats?.today_patients_count ?? queue.length}</Text>
                <Text style={styles.statLabel}>Pasien Hari Ini</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="hourglass" size={20} color="#F59E0B" />
                <Text style={styles.statNumber}>{stats?.waiting_queue_count ?? queue.filter((q) => q.status === 'waiting').length}</Text>
                <Text style={styles.statLabel}>Antrean Menunggu</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.statNumber}>{stats?.total_completed_visits ?? 0}</Text>
                <Text style={styles.statLabel}>Selesai Dilayani</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.gold} />
              <Text style={styles.emptyTitle}>Tidak Ada Antrean Pasien</Text>
              <Text style={styles.emptySubtitle}>Semua antrean pasien hari ini telah selesai dilayani atau belum ada reservasi baru.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: 11, color: colors.goldDark, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  doctorName: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: fonts.heading },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: { fontSize: 18, fontWeight: '700', color: colors.charcoal, marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' },
  queueCard: {
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
  queueHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  queueNumberWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  queueNumber: { fontSize: 12, fontWeight: '700', color: colors.goldDark },
  queueInfo: { flex: 1 },
  patientName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  serviceName: { fontSize: 12, color: colors.charcoalMedium, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
  statusWaiting: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  statusSuccess: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextWaiting: { color: '#92400E' },
  statusTextSuccess: { color: '#065F46' },
  timeSlotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  timeSlotText: { fontSize: 11, color: colors.charcoalMedium },
  complaintText: { fontSize: 11, color: colors.muted, lineHeight: 16, marginBottom: 10 },
  queueActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    paddingTop: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
    gap: 6,
  },
  actionBtnSecondaryText: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: 32 },
});