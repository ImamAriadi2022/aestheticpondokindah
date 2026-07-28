import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { bookingService } from '@/services/bookingService';
import { colors, spacing, radius } from '@/theme/colors';
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
          <Text style={styles.cardCode}>{item.code}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.serviceName}>{item.service_name}</Text>
        {item.doctor_name && <Text style={styles.doctorName}>drg. {item.doctor_name}</Text>}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>📅 {item.scheduled_date} · {item.scheduled_time}</Text>
          {item.price && <Text style={styles.priceText}>Rp {Number(item.price).toLocaleString('id-ID')}</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Janji Temu</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/booking/new')}>
          <Text style={styles.newBtnText}>+ Buat Janji</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'all', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.tabActive : null]}
            onPress={() => setActiveTab(tab)}
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
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Belum ada janji temu</Text>
              <Text style={styles.emptySub}>Buat janji temu pertama Anda sekarang</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal },
  newBtn: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.creamDark, borderRadius: radius.lg, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.white, shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.charcoalMedium },
  tabTextActive: { color: colors.charcoal },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardCode: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  serviceName: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  doctorName: { fontSize: 12, color: colors.charcoalMedium, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  dateText: { fontSize: 12, color: colors.charcoalMedium },
  priceText: { fontSize: 13, color: colors.gold, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  emptySub: { fontSize: 13, color: colors.charcoalMedium, marginTop: 4 },
});
