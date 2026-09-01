import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { consultationService, ConsultationSession } from '@/services/consultationService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultationTabScreen() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await consultationService.getConsultations();
      setSessions(res || []);
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

  const renderItem = ({ item }: { item: ConsultationSession }) => {
    const isCompleted = item.status === 'Selesai';
    const dateStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/consultation/[id]', params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.gold} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.topic} numberOfLines={1}>{item.topic || 'Konsultasi Kesehatan Gigi'}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color={colors.charcoalMedium} />
              <Text style={styles.date}>{dateStr}</Text>
            </View>
          </View>
          <View style={[styles.badge, isCompleted ? styles.badgeSuccess : styles.badgeActive]}>
            <Text style={[styles.badgeText, isCompleted ? styles.badgeTextSuccess : styles.badgeTextActive]}>
              {item.status || 'Aktif'}
            </Text>
          </View>
        </View>

        <Text style={styles.complaint} numberOfLines={2}>
          {item.chief_complaint || 'Tidak ada catatan keluhan tambahan.'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.chatAction}>
            <Ionicons name="chatbubbles-outline" size={15} color={colors.goldDark} />
            <Text style={styles.actionText}>Buka Percakapan Chat</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gold} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Konsultasi Gigi</Text>
          <Text style={styles.headerSubtitle}>Tanya dokter spesialis & asisten klinis</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/consultation/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>Konsultasi Baru</Text>
        </TouchableOpacity>
      </View>

      {/* Banner / Info Card */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerIconWrap}>
          <Ionicons name="sparkles" size={20} color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Konsultasi Online Fleksibel</Text>
          <Text style={styles.bannerDesc}>
            Dapatkan saran awal dan rekomendasi perawatan sebelum kunjungan klinik langsung.
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubbles-outline" size={42} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Belum Ada Riwayat Konsultasi</Text>
              <Text style={styles.emptyText}>
                Mulai konsultasi online dengan dokter spesialis kami untuk diagnosis awal keluhan gigi Anda.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/consultation/new')}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.emptyBtnText}>Mulai Konsultasi Pertama</Text>
              </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal },
  headerSubtitle: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    gap: 4,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    gap: 12,
  },
  bannerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(201, 162, 74, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: colors.goldDark },
  bannerDesc: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2, lineHeight: 16 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  topic: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  date: { fontSize: 11, color: colors.charcoalMedium },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeActive: { backgroundColor: '#FEF3C7' },
  badgeSuccess: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextActive: { color: '#92400E' },
  badgeTextSuccess: { color: '#065F46' },
  complaint: { fontSize: 12, color: colors.charcoalMedium, lineHeight: 18, marginBottom: spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  chatAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.goldDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
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
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.xs, textAlign: 'center' },
  emptyText: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center', lineHeight: 18, marginBottom: spacing.lg, maxWidth: 280 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.full,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
