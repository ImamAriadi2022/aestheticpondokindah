import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image, ActivityIndicator, Modal, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/contentService';
import { bookingService } from '@/services/bookingService';
import { consultationService, ConsultationSession } from '@/services/consultationService';
import { notificationService } from '@/services/notificationService';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { getStorageUrl } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import type { Post, Reservation, Promo, Popup } from '@/types/booking';

const { width } = Dimensions.get('window');

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  gold: '#C59E3F',
  platinum: '#8B9DAF',
};

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [showPopupModal, setShowPopupModal] = useState<boolean>(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationSession | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (force = false) => {
    try {
      const [postsRes, promosRes, popupRes, bookingsRes, consultsRes, notifsRes] = await Promise.allSettled([
        contentService.getPosts(force),
        contentService.getPromos(force),
        contentService.getActivePopup(),
        bookingService.getReservations(force),
        consultationService.getConsultations(),
        notificationService.getNotifications(),
      ]);

      // 1. Posts from Production API
      if (postsRes.status === 'fulfilled') {
        setPosts(postsRes.value?.posts || []);
      }

      // 2. Promos from Production API
      if (promosRes.status === 'fulfilled') {
        setPromos(promosRes.value?.promos || []);
      }

      // 3. Active Popup from Production API
      if (popupRes.status === 'fulfilled' && popupRes.value && (popupRes.value as any).id) {
        setActivePopup(popupRes.value);
        if (!force) {
          setShowPopupModal(true);
        }
      }

      // 4. Active Reservation from Production API
      if (bookingsRes.status === 'fulfilled') {
        const rList = bookingsRes.value?.reservations || [];
        const active = rList.find((r) => r.status === 'confirmed' || r.status === 'pending' || r.status === 'in_progress');
        setActiveReservation(active || null);
      }

      // 5. Active Consultation from Production API
      if (consultsRes.status === 'fulfilled') {
        const cList = consultsRes.value || [];
        const activeC = cList.find((c) => c.status !== 'Selesai') || (cList.length > 0 ? cList[0] : null);
        setActiveConsultation(activeC || null);
      }

      // 6. Notifications unread count
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
  }, [loadData, refreshUser]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refreshUser(),
      loadData(true),
    ]);
    setIsRefreshing(false);
  }, [loadData, refreshUser]);

  const tier = (user?.membership_level || 'bronze').toLowerCase();
  const tierColor = TIER_COLORS[tier] || colors.gold;
  const tierName = tier.toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* 1. TOP NAVBAR */}
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
          <Text style={styles.subGreeting}>Selamat datang di Aesthetic Pondok Indah Dental Clinic</Text>
        </View>

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

        {/* 3. QUICK ACTION MENU */}
        <View style={styles.quickMenuWrap}>
          <TouchableOpacity
            style={styles.quickMenuItem}
            onPress={() => router.push('/booking/new')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickMenuIcon, { backgroundColor: '#FAF5EA' }]}>
              <Ionicons name="calendar" size={22} color={colors.goldDark} />
            </View>
            <Text style={styles.quickMenuLabel}>Buat Janji</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickMenuItem}
            onPress={() => router.push('/consultation/new' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickMenuIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="chatbubbles" size={22} color="#059669" />
            </View>
            <Text style={styles.quickMenuLabel}>Konsultasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickMenuItem}
            onPress={() => router.push('/(tabs)/membership')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickMenuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="gift" size={22} color="#D97706" />
            </View>
            <Text style={styles.quickMenuLabel}>Membership</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickMenuItem}
            onPress={() => router.push('/gallery' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickMenuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="images" size={22} color="#2563EB" />
            </View>
            <Text style={styles.quickMenuLabel}>Galeri Klinik</Text>
          </TouchableOpacity>
        </View>

        {/* 4. PROMO SPESIAL KLINIK (API PRODUCTION) */}
        {promos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="pricetag-outline" size={18} color={colors.goldDark} />
                <Text style={styles.sectionTitle}>Promo Spesial</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoScrollContent}
            >
              {promos.map((promo) => (
                <TouchableOpacity
                  key={String(promo.id)}
                  style={styles.promoCard}
                  onPress={() => router.push('/booking/new')}
                  activeOpacity={0.88}
                >
                  {promo.image_url ? (
                    <Image
                      source={{ uri: getStorageUrl(promo.image_url) ?? '' }}
                      style={styles.promoImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.promoImageFallback}>
                      <Ionicons name="sparkles" size={28} color={colors.gold} />
                    </View>
                  )}
                  <View style={styles.promoBody}>
                    <View style={styles.promoBadgeRow}>
                      <Text style={styles.promoBadgeText}>
                        {(promo as any).discount_text || (promo as any).category || 'Spesial'}
                      </Text>
                    </View>
                    <Text style={styles.promoTitle} numberOfLines={2}>{promo.title}</Text>
                    <Text style={styles.promoDesc} numberOfLines={2}>
                      {promo.description || (promo as any).headline || 'Penawaran istimewa untuk perawatan gigi Anda.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. DATA RESERVASI AKTIF */}
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
                <Ionicons name="calendar-outline" size={26} color={colors.gold} />
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

        {/* 6. DATA KONSULTASI AKTIF */}
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
                <Ionicons name="chatbubbles-outline" size={26} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyCardTitle}>Belum Ada Konsultasi Aktif</Text>
                <Text style={styles.emptyCardDesc}>Tanyakan keluhan gigi secara online sekarang.</Text>
              </View>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: '#059669' }]}
                onPress={() => router.push('/consultation/new' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>Tanya Dokter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 7. EDUKASI & ARTIKEL GIGI (DARI API PRODUCTION) */}
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

      {/* 8. POPUP PROMO MODAL (JIKA ADA DARI BACKEND) */}
      {activePopup && (
        <Modal
          visible={showPopupModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPopupModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowPopupModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>

              {activePopup.image_url ? (
                <Image
                  source={{ uri: getStorageUrl(activePopup.image_url) ?? '' }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalImageFallback}>
                  <Ionicons name="sparkles" size={42} color={colors.gold} />
                </View>
              )}

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{activePopup.title}</Text>
                <Text style={styles.modalMessage}>
                  {(activePopup as any).headline || activePopup.message || 'Dapatkan promo eksklusif untuk perawatan gigi Anda hari ini.'}
                </Text>

                <TouchableOpacity
                  style={styles.modalActionBtn}
                  onPress={() => {
                    setShowPopupModal(false);
                    router.push('/booking/new');
                  }}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalActionBtnText}>
                    {activePopup.cta_text || 'Klaim Promo Sekarang'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 140, height: 38 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tierText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  scroll: { paddingBottom: spacing.xxl },
  greetingWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: fonts.heading,
  },
  subGreeting: {
    fontSize: 13,
    color: colors.charcoalMedium,
    marginTop: 2,
  },
  memberCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: '#1E1B18',
    borderRadius: radius.xxl,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  memberCardBgCircle: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.gold + '1A',
  },
  memberCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  memberCardLabel: {
    fontSize: 12,
    color: '#A89E90',
    fontWeight: '500',
  },
  memberCardPoints: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F5EBD7',
    marginTop: 2,
  },
  memberCardPts: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  },
  tierStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2A2520',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tierStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E8DFC8',
  },
  memberCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  memberCardBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickMenuWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  quickMenuItem: {
    alignItems: 'center',
    gap: 6,
    width: (width - 48) / 4,
  },
  quickMenuIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  quickMenuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoal,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.goldDark,
  },
  promoScrollContent: {
    gap: 12,
    paddingRight: spacing.lg,
  },
  promoCard: {
    width: 240,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  promoImage: {
    width: '100%',
    height: 120,
  },
  promoImageFallback: {
    width: '100%',
    height: 120,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBody: {
    padding: spacing.md,
  },
  promoBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 6,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldDark,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 3,
  },
  promoDesc: {
    fontSize: 11,
    color: colors.charcoalMedium,
    lineHeight: 16,
  },
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
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconCircleGold: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
  },
  activeCardSub: {
    fontSize: 12,
    color: colors.charcoalMedium,
    marginLeft: 3,
  },
  activeCardComplaint: {
    fontSize: 12,
    color: colors.charcoalMedium,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoalMedium,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  emptyCardDesc: {
    fontSize: 11,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  emptyActionBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.goldDark,
  },
  articleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    lineHeight: 18,
    marginBottom: 3,
  },
  articleExcerpt: {
    fontSize: 11,
    color: colors.charcoalMedium,
    lineHeight: 16,
    marginBottom: 6,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  articleMetaText: {
    fontSize: 10,
    color: colors.charcoalMedium,
  },
  articleThumb: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: '#FAF5EA',
  },
  emptyArticleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: 6,
  },
  emptyArticleText: {
    fontSize: 12,
    color: colors.charcoalMedium,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: 160,
  },
  modalImageFallback: {
    width: '100%',
    height: 120,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 12,
    color: colors.charcoalMedium,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  modalActionBtn: {
    width: '100%',
    height: 44,
    backgroundColor: colors.gold,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
