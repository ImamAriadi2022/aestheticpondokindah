import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { bookingService } from '@/services/bookingService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { Reservation } from '@/types/booking';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Menunggu', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Dikonfirmasi', bg: '#D1FAE5', text: '#065F46' },
  completed: { label: 'Selesai', bg: '#DCFCE7', text: '#166534' },
  cancelled: { label: 'Dibatalkan', bg: '#FEE2E2', text: '#991B1B' },
  no_show: { label: 'Tidak Hadir', bg: '#F3F4F6', text: '#374151' },
};

export default function BookingScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  const loadData = useCallback(async (force = false) => {
    try {
      const res = await bookingService.getReservations(force);
      setReservations(res?.reservations ?? []);
    } catch (err) {
      // Error handled by apiClient
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
  }, [loadData]);

  const filtered = reservations.filter((r) => {
    if (activeTab === 'upcoming') return r.status === 'pending' || r.status === 'confirmed';
    if (activeTab === 'completed') return r.status === 'completed' || r.status === 'cancelled';
    return true;
  });

  const renderItem = ({ item }: { item: Reservation }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.codeWrap}>
            <Ionicons name="receipt-outline" size={13} color={colors.goldDark} />
            <Text style={styles.cardCode}>{item.code || `INV-${item.id}`}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>
        
        <Text style={styles.serviceName}>{item.service_name}</Text>
        
        {item.doctor_name && (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={12} color={colors.charcoalMedium} />
            <Text style={styles.doctorName}>drg. {item.doctor_name}</Text>
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={13} color={colors.goldDark} />
            <Text style={styles.dateText}>
              {item.scheduled_date ?? 'Menunggu jadwal'}
              {item.scheduled_time ? ` · ${item.scheduled_time}` : ''}
            </Text>
          </View>
          {item.price ? (
            <Text style={styles.priceText}>Rp {Number(item.price).toLocaleString('id-ID')}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Janji Temu & Riwayat</Text>
          <Text style={styles.subtitle}>Kelola reservasi jadwal perawatan klinik</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/booking/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>Buat Janji</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'all', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.tabActive : null]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>
              {tab === 'upcoming' ? 'Mendatang' : tab === 'all' ? 'Semua' : 'Selesai'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={42} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Tidak Ada Jadwal</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming'
                  ? 'Belum ada jadwal janji temu aktif. Buat janji baru dengan dokter spesialis kami.'
                  : 'Belum ada data riwayat janji temu pada kategori ini.'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/booking/new')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyBtnText}>Buat Janji Sekarang</Text>
                </TouchableOpacity>
              )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.charcoal },
  subtitle: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
  },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.charcoalMedium },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  codeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardCode: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  badge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  serviceName: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginVertical: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xs },
  doctorName: { fontSize: 12, color: colors.charcoalMedium },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  dateWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: colors.charcoalMedium },
  priceText: { fontSize: 13, fontWeight: '700', color: colors.goldDark },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.xs },
  emptyText: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center', lineHeight: 18, marginBottom: spacing.lg, maxWidth: 280 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
