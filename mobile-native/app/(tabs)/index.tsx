import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/contentService';
import { bookingService } from '@/services/bookingService';
import { colors, spacing, radius } from '@/theme/colors';
import { getStorageUrl } from '@/constants/api';
import type { Post, Promo } from '@/types/booking';
import type { Reservation } from '@/types/booking';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  gold: '#C59E3F',
  platinum: '#9CA3AF',
  diamond: '#60A5FA',
};

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [upcoming, setUpcoming] = useState<Reservation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [postsRes, promosRes, bookingsRes] = await Promise.allSettled([
        contentService.getPosts(),
        contentService.getPromos(),
        bookingService.getReservations(),
      ]);
      if (postsRes.status === 'fulfilled') {
        setPosts(postsRes.value?.posts?.slice(0, 3) ?? []);
      }
      if (promosRes.status === 'fulfilled') {
        setPromos(promosRes.value?.promos?.slice(0, 2) ?? []);
      }
      if (bookingsRes.status === 'fulfilled') {
        const list = bookingsRes.value?.reservations ?? [];
        const next = list.find((r) => r.status === 'confirmed' || r.status === 'pending');
        setUpcoming(next ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    refreshUser();
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      contentService.getPosts(true),
      contentService.getPromos(true),
      bookingService.getReservations(true),
      refreshUser(),
    ]);
    await loadData();
    setIsRefreshing(false);
  }, [loadData, refreshUser]);

  const tierColor = TIER_COLORS[user?.membership_level ?? 'bronze'];
  const tierName = (user?.membership_level ?? 'bronze').toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo, {user?.name?.split(' ')[0] ?? 'Pengguna'} 👋</Text>
            <Text style={styles.subGreeting}>Selamat datang kembali</Text>
          </View>
          <TouchableOpacity style={[styles.tierBadge, { backgroundColor: tierColor + '20', borderColor: tierColor }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>✦ {tierName}</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Card */}
        <View style={styles.memberCard}>
          <View style={styles.memberCardBg} />
          <View style={styles.memberCardContent}>
            <Text style={styles.memberCardLabel}>Total Poin Loyalty</Text>
            <Text style={styles.memberCardPoints}>
              {(user as any)?.total_points ?? 0} <Text style={styles.memberCardPts}>Pts</Text>
            </Text>
            <Text style={styles.memberCardExpiry}>
              {user?.membership_status === 'active' ? `Aktif · Tier ${tierName}` : 'Tier Tidak Aktif'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.memberCardBtn}
            onPress={() => router.push('/(tabs)/membership')}
          >
            <Text style={styles.memberCardBtnText}>Lihat Membership</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Layanan Cepat</Text>
          <View style={styles.quickActions}>
            {[
              { label: 'Buat Janji', icon: '📅', route: '/(tabs)/booking' },
              { label: 'Membership', icon: '💎', route: '/(tabs)/membership' },
              { label: 'Notifikasi', icon: '🔔', route: '/(tabs)/notifications' },
              { label: 'Profil', icon: '👤', route: '/(tabs)/profile' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickAction}
                onPress={() => router.push(action.route as any)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Appointment */}
        {upcoming && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jadwal Terdekat</Text>
            <TouchableOpacity
              style={styles.appointmentCard}
              onPress={() => router.push('/(tabs)/booking')}
            >
              <View style={styles.appointmentIcon}>
                <Text style={{ fontSize: 24 }}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.appointmentService}>{upcoming.service_name}</Text>
                {upcoming.doctor_name && (
                  <Text style={styles.appointmentDoctor}>{upcoming.doctor_name}</Text>
                )}
                <Text style={styles.appointmentDate}>{upcoming.scheduled_date} · {upcoming.scheduled_time}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: upcoming.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: upcoming.status === 'confirmed' ? '#065F46' : '#92400E' }}>
                  {upcoming.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Promo */}
        {promos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promo Terkini</Text>
            {promos.map((promo) => (
              <TouchableOpacity key={promo.id} style={styles.promoCard}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>PROMO</Text>
                </View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                {promo.discount_text && (
                  <Text style={styles.promoDiscount}>{promo.discount_text}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Articles */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Artikel Terbaru</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.md }} />
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.articleCard}
                onPress={() => router.push(`/article/${post.id}` as any)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.articleTitle} numberOfLines={2}>{post.title}</Text>
                  {post.excerpt && (
                    <Text style={styles.articleExcerpt} numberOfLines={2}>{post.excerpt}</Text>
                  )}
                </View>
                {post.thumbnail_url && (
                  <Image
                    source={{ uri: getStorageUrl(post.thumbnail_url) ?? '' }}
                    style={styles.articleThumb}
                    resizeMode="cover"
                  />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.charcoal },
  subGreeting: { fontSize: 13, color: colors.charcoalMedium, marginTop: 2 },
  tierBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  tierText: { fontSize: 12, fontWeight: '700' },
  memberCard: {
    marginHorizontal: spacing.lg, borderRadius: radius.xl,
    backgroundColor: colors.charcoal, overflow: 'hidden',
    padding: spacing.lg, marginBottom: spacing.lg,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  memberCardBg: {
    position: 'absolute', top: -20, right: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(197, 158, 63, 0.15)',
  },
  memberCardContent: { marginBottom: spacing.md },
  memberCardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  memberCardPoints: { fontSize: 36, fontWeight: '700', color: colors.gold },
  memberCardPts: { fontSize: 18, color: 'rgba(197,158,63,0.7)' },
  memberCardExpiry: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  memberCardBtn: {
    backgroundColor: colors.gold, borderRadius: 999,
    paddingVertical: 10, alignItems: 'center',
  },
  memberCardBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  quickActions: { flexDirection: 'row', gap: spacing.sm },
  quickAction: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.sm, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickActionIcon: { fontSize: 22, marginBottom: 4 },
  quickActionLabel: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium, textAlign: 'center' },
  appointmentCard: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  appointmentIcon: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.goldMuted, alignItems: 'center', justifyContent: 'center',
  },
  appointmentService: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  appointmentDoctor: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  appointmentDate: { fontSize: 12, color: colors.gold, fontWeight: '600', marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  promoCard: {
    backgroundColor: colors.goldMuted, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.gold + '40',
  },
  promoBadge: {
    backgroundColor: colors.gold, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: spacing.xs,
  },
  promoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  promoTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  promoDiscount: { fontSize: 13, color: colors.goldDark, fontWeight: '600', marginTop: 2 },
  articleCard: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start',
    gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  articleTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  articleExcerpt: { fontSize: 12, color: colors.charcoalMedium, marginTop: 4, lineHeight: 18 },
  articleThumb: { width: 72, height: 72, borderRadius: radius.md },
});
