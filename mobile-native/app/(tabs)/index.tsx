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
import { consultationService, ConsultationSession } from '@/services/consultationService';
import { notificationService } from '@/services/notificationService';
import { colors, spacing, radius } from '@/theme/colors';
import { getStorageUrl } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import type { Post, Reservation } from '@/types/booking';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  gold: '#C59E3F',
  platinum: '#8B9DAF',
};

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationSession | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (force = false) => {
    try {
      const [postsRes, bookingsRes, consultsRes, notifsRes] = await Promise.allSettled([
        contentService.getPosts(force),
        bookingService.getReservations(force),
        consultationService.getConsultations(),
        notificationService.getNotifications(),
      ]);

      // 1. Posts / Articles from Production Backend API
      if (postsRes.status === 'fulfilled') {
        const pList = postsRes.value?.posts || [];
        setPosts(pList);
      }

      // 2. Active Reservation (pending / confirmed / in_progress)
      if (bookingsRes.status === 'fulfilled') {
        const rList = bookingsRes.value?.reservations || [];
        const active = rList.find((r) => r.status === 'confirmed' || r.status === 'pending' || r.status === 'in_progress');
        setActiveReservation(active || null);
      }

      // 3. Active Consultation (not finished / recent)
      if (consultsRes.status === 'fulfilled') {
        const cList = consultsRes.value || [];
        const activeC = cList.find((c) => c.status !== 'Selesai') || (cList.length > 0 ? cList[0] : null);
        setActiveConsultation(activeC || null);
      }

      // 4. Notifications unread count
      if (notifsRes.status === 'fulfilled') {
        const notifList = notifsRes.value?.notifications || [];
        const unreadDirect = notifsRes.value?.unread_count;
        const unreadCalc = notifList.filter((n: any) => !n.read_at && !n.is_read).length;
        setUnreadNotifCount(typeof unreadDirect === 'number' ? unreadDirect : unreadCalc);
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
      refreshUser(),
      loadData(true),
    ]);
    setIsRefreshing(false);
  }, [loadData, refreshUser]);

  const tier = user?.membership_level ?? 'bronze';
  const tierColor = TIER_COLORS[tier] || colors.gold;
  const tierName = tier.toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* 1. FIXED TOP NAVBAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('@/assets/logo/logo.webp')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          {/* Membership Tier Badge */}
          <TouchableOpacity
            style={[styles.tierBadge, { backgroundColor: tierColor + '15', borderColor: tierColor + '60' }]}
            onPress={() => router.push('/(tabs)/membership')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={12} color={tierColor} style={{ marginRight: 4 }} />
            <Text style={[styles.tierText, { color: tierColor }]}>{tierName}</Text>
          </TouchableOpacity>

          {/* Notification Bell with Badge */}
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(tabs)/notifications')}
            activeOpacity={0.8}
            accessibilityLabel="Notifikasi"
          >
            <Ionicons name="notifications-outline" size={21} color={colors.charcoal} />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SCROLLABLE BODY */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greeting}>Halo, {user?.name?.split(' ')[0] ?? 'Pasien'}</Text>
          <Text style={styles.subGreeting}>Selamat datang di Aesthetic Pondok Indah</Text>
        </View>

        {/* Doctor Portal Switch Banner (If Doctor) */}
        {user?.role === 'doctor' && (
          <TouchableOpacity
            style={styles.doctorBanner}
            onPress={() => router.push('/doctor')}
            activeOpacity={0.85}
          >
            <View style={styles.doctorBannerIcon}>
              <Ionicons name="medkit-outline" size={22} color={colors.goldDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.doctorBannerTitle}>Portal Dokter Aktif</Text>
              <Text style={styles.doctorBannerDesc}>Buka antrean pasien & kelola rekam medis</Text>
            </View>
            <View style={styles.doctorBannerBtn}>
              <Text style={styles.doctorBannerBtnText}>Buka</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Membership & Loyalty Card */}
        <View style={styles.memberCard}>
          <View style={styles.memberCardBgCircle} />
          <View style={styles.memberCardTop}>
            <View>
              <Text style={styles.memberCardLabel}>Total Poin Loyalty</Text>
              <Text style={styles.memberCardPoints}>
                {(user as any)?.total_points ?? (user as any)?.points ?? 0}
                <Text style={styles.memberCardPts}> Pts</Text>
              </Text>
            </View>
            <View style={[styles.tierStatusPill, { borderColor: tierColor + '40' }]}>
              <Ionicons name="ribbon-outline" size={14} color={colors.gold} />
              <Text style={styles.tierStatusText}>
                {user?.membership_status === 'active' ? `Tier ${tierName}` : 'Tier Non-aktif'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.memberCardBtn}
            onPress={() => router.push('/(tabs)/membership')}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.memberCardBtnText}>Lihat Benefit Membership</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* 3. DATA RESERVASI AKTIF */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="calendar-outline" size={18} color={colors.goldDark} />
              <Text style={styles.sectionTitle}>Reservasi Aktif</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/booking')} activeOpacity={0.7}>
              <Text style={styles.sectionActionText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {activeReservation ? (
            <TouchableOpacity
              style={styles.activeCard}
              onPress={() => router.push('/(tabs)/booking')}
              activeOpacity={0.85}
            >
              <View style={styles.activeCardHeader}>
                <View style={styles.iconCircleGold}>
                  <Ionicons name="calendar" size={20} color={colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeCardTitle}>{activeReservation.service_name}</Text>
                  {activeReservation.doctor_name ? (
                    <View style={styles.metaRow}>
                      <Ionicons name="person-outline" size={12} color={colors.charcoalMedium} />
                      <Text style={styles.activeCardSub}>drg. {activeReservation.doctor_name}</Text>
                    </View>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        activeReservation.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          activeReservation.status === 'confirmed' ? '#065F46' : '#92400E',
                      },
                    ]}
                  >
                    {activeReservation.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                  </Text>
                </View>
              </View>

              <View style={styles.activeCardFooter}>
                <View style={styles.footerInfoRow}>
                  <Ionicons name="time-outline" size={13} color={colors.goldDark} />
                  <Text style={styles.footerDateText}>
                    {activeReservation.scheduled_date} · {activeReservation.scheduled_time || 'Jadwal Reguler'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.gold} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyCardIconWrap}>
                <Ionicons name="calendar-outline" size={28} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyCardTitle}>Belum Ada Reservasi Aktif</Text>
                <Text style={styles.emptyCardDesc}>Buat janji temu perawatan gigi Anda berikutnya.</Text>
              </View>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => router.push('/booking/new')}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>Buat Janji</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. DATA KONSULTASI AKTIF */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="chatbubbles-outline" size={18} color="#059669" />
              <Text style={styles.sectionTitle}>Konsultasi Aktif</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/consultation')} activeOpacity={0.7}>
              <Text style={styles.sectionActionText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {activeConsultation ? (
            <TouchableOpacity
              style={styles.activeCard}
              onPress={() => router.push({ pathname: '/consultation/[id]', params: { id: activeConsultation.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.activeCardHeader}>
                <View style={styles.iconCircleGreen}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeCardTitle}>
                    {activeConsultation.topic || 'Konsultasi Kesehatan Gigi'}
                  </Text>
                  <Text style={styles.activeCardComplaint} numberOfLines={1}>
                    {activeConsultation.chief_complaint || 'Percakapan aktif dengan tim dokter'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        activeConsultation.status === 'Selesai' ? '#D1FAE5' : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          activeConsultation.status === 'Selesai' ? '#065F46' : '#92400E',
                      },
                    ]}
                  >
                    {activeConsultation.status || 'Aktif'}
                  </Text>
                </View>
              </View>

              <View style={styles.activeCardFooter}>
                <View style={styles.footerInfoRow}>
                  <Ionicons name="chatbubbles-outline" size={13} color="#059669" />
                  <Text style={[styles.footerDateText, { color: '#059669' }]}>Lanjutkan Chat Konsultasi</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#059669" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <View style={[styles.emptyCardIconWrap, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                <Ionicons name="chatbubbles-outline" size={28} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyCardTitle}>Belum Ada Konsultasi Aktif</Text>
                <Text style={styles.emptyCardDesc}>Tanyakan keluhan gigi secara online sekarang.</Text>
              </View>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: '#059669' }]}
                onPress={() => router.push('/consultation/new')}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>Tanya Dokter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 5. EDUKASI & ARTIKEL GIGI (DARI API PRODUCTION) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="newspaper-outline" size={18} color={colors.charcoal} />
              <Text style={styles.sectionTitle}>Edukasi & Artikel Gigi</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.lg }} />
          ) : posts.length === 0 ? (
            <View style={styles.emptyArticleWrap}>
              <Ionicons name="newspaper-outline" size={32} color={colors.charcoalMedium} />
              <Text style={styles.emptyArticleText}>Belum ada artikel edukasi yang dipublikasikan saat ini.</Text>
            </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={String(post.id)}
                style={styles.articleCard}
                onPress={() => router.push(`/article/${post.slug || post.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{post.category || 'Edukasi Gigi'}</Text>
                  </View>
                  <Text style={styles.articleTitle} numberOfLines={2}>{post.title}</Text>
                  {post.excerpt && (
                    <Text style={styles.articleExcerpt} numberOfLines={2}>{post.excerpt}</Text>
                  )}
                  <View style={styles.articleMeta}>
                    <Ionicons name="time-outline" size={11} color={colors.charcoalMedium} />
                    <Text style={styles.articleMetaText}>
                      {post.reading_time_minutes ? `${post.reading_time_minutes} menit baca` : '3 menit baca'}
                    </Text>
                  </View>
                </View>
                {post.cover_image_url || post.thumbnail_url ? (
                  <Image
                    source={{ uri: getStorageUrl(post.cover_image_url || post.thumbnail_url) ?? '' }}
                    style={styles.articleThumb}
                    resizeMode="cover"
                  />
                ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 135, height: 38 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tierText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  greetingWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.charcoal },
  subGreeting: { fontSize: 13, color: colors.charcoalMedium, marginTop: 2 },
  doctorBanner: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#C9A24A',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(201, 162, 74, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorBannerTitle: { fontSize: 13, fontWeight: '700', color: colors.goldDark },
  doctorBannerDesc: { fontSize: 11, color: colors.charcoalMedium, marginTop: 1 },
  doctorBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 2,
  },
  doctorBannerBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  memberCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: '#2C2416',
    overflow: 'hidden',
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 74, 0.3)',
  },
  memberCardBgCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(201, 162, 74, 0.12)',
  },
  memberCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  memberCardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  memberCardPoints: { fontSize: 34, fontWeight: '800', color: '#C9A24A' },
  memberCardPts: { fontSize: 16, color: 'rgba(201,162,74,0.8)', fontWeight: '600' },
  tierStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tierStatusText: { fontSize: 11, color: '#FAF8F5', fontWeight: '600' },
  memberCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C9A24A',
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  memberCardBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  sectionActionText: { fontSize: 12, fontWeight: '700', color: colors.goldDark },
  activeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activeCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  iconCircleGold: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCardTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  activeCardSub: { fontSize: 12, color: colors.charcoalMedium },
  activeCardComplaint: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusBadge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  activeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  footerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerDateText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  emptyCardDesc: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2 },
  emptyActionBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  emptyActionBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  emptyArticleWrap: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyArticleText: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center' },
  articleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', color: colors.goldDark },
  articleTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal, lineHeight: 18 },
  articleExcerpt: { fontSize: 11, color: colors.charcoalMedium, marginTop: 3, lineHeight: 16 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  articleMetaText: { fontSize: 10, color: colors.charcoalMedium, fontWeight: '500' },
  articleThumb: { width: 72, height: 72, borderRadius: radius.md },
});
