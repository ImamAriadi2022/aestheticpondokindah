import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { membershipService } from '@/services/membershipService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { MembershipPoint, MembershipTier } from '@/types/membership';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: '#FDF4E8', text: '#92400E', border: '#CD7F32' },
  gold: { bg: '#FFFBEB', text: '#78350F', border: '#C59E3F' },
  platinum: { bg: '#F9FAFB', text: '#374151', border: '#8B9DAF' },
};

const TIER_IMAGES: Record<string, any> = {
  bronze: require('@/assets/dashboard/cardbronze.webp'),
  gold: require('@/assets/dashboard/cardgold.webp'),
  platinum: require('@/assets/dashboard/cardplatinum.webp'),
};

export default function MembershipScreen() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<any>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (force = false) => {
    try {
      const [memberRes, tiersRes] = await Promise.allSettled([
        membershipService.getMembership(force),
        membershipService.getTiers(),
        membershipService.getPoints(),
      ]);
      if (memberRes.status === 'fulfilled') setMembership(memberRes.value);
      if (tiersRes.status === 'fulfilled') setTiers(tiersRes.value?.tiers ?? []);
    } catch {
      // handled globally
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
  }, [loadData]);

  const tier = user?.membership_level ?? 'bronze';
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const isActive = user?.membership_status === 'active';

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
            <Text style={styles.title}>Membership & Loyalty</Text>
            <Text style={styles.subtitle}>Nikmati keistimewaan dan reward perawatan</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {/* Membership Card with WebP Artwork */}
            <View style={styles.cardArtworkWrap}>
              <Image
                source={TIER_IMAGES[tier] ?? TIER_IMAGES.bronze}
                style={styles.cardArtwork}
                resizeMode="cover"
              />
            </View>

            {/* Member Details Card */}
            <View style={styles.memberCard}>
              <View style={styles.memberCardTop}>
                <View>
                  <View style={styles.tierPill}>
                    <Ionicons name="sparkles" size={12} color={colors.gold} />
                    <Text style={styles.memberCardTier}>{tierName.toUpperCase()} MEMBER</Text>
                  </View>
                  <Text style={styles.memberCardName}>{user?.name}</Text>
                  <Text style={styles.memberCardPhone}>{user?.phone || user?.email || '-'}</Text>
                </View>
                <View style={[styles.tierBadge, { borderColor: tierStyle.border + '60' }]}>
                  <Text style={[styles.tierBadgeText, { color: tierStyle.border }]}>
                    {tierName.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.memberCardBottom}>
                <View>
                  <Text style={styles.pointsLabel}>Total Poin Loyalty</Text>
                  <Text style={styles.pointsValue}>
                    {membership?.membership?.total_points ?? (user as any)?.total_points ?? 0}
                    <Text style={styles.pointsSuffix}> Pts</Text>
                  </Text>
                </View>
                <View>
                  <Text style={styles.pointsLabel}>Status Keanggotaan</Text>
                  <View style={styles.statusRow}>
                    <Ionicons
                      name={isActive ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={isActive ? "#10B981" : "#EF4444"}
                    />
                    <Text style={[styles.statusText, { color: isActive ? "#10B981" : "#EF4444" }]}>
                      {isActive ? 'Aktif' : 'Non-aktif'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Upgrade Button */}
            {tier !== 'platinum' && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/membership/upgrade' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.upgradeBtnText}>Upgrade Tier Membership</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            {/* Tier Benefits */}
            {tiers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilihan Paket Membership</Text>
                {tiers.map((t) => {
                  const ts = TIER_COLORS[t.level] ?? TIER_COLORS.bronze;
                  const isCurrent = t.level === tier;
                  return (
                    <View
                      key={t.level}
                      style={[
                        styles.tierCard,
                        isCurrent ? styles.tierCardActive : null,
                        { borderColor: isCurrent ? ts.border : colors.border },
                      ]}
                    >
                      <View style={styles.tierCardHeader}>
                        <View style={styles.tierNameWrap}>
                          <Ionicons name="ribbon-outline" size={16} color={ts.border} />
                          <Text style={[styles.tierCardName, { color: ts.border }]}>
                            {t.name ?? t.level.toUpperCase()}
                          </Text>
                        </View>
                        {isCurrent && (
                          <View style={[styles.currentBadge, { backgroundColor: ts.bg, borderColor: ts.border + '40' }]}>
                            <Ionicons name="checkmark-circle" size={12} color={ts.text} style={{ marginRight: 3 }} />
                            <Text style={[styles.currentBadgeText, { color: ts.text }]}>Tier Anda</Text>
                          </View>
                        )}
                      </View>
                      {Array.isArray(t.benefits) && t.benefits.slice(0, 4).map((b, i) => (
                        <View key={i} style={styles.benefitRow}>
                          <Ionicons name="checkmark" size={14} color={colors.goldDark} style={{ marginTop: 2 }} />
                          <Text style={styles.benefitText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
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
  cardArtworkWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cardArtwork: {
    width: '100%',
    height: 185,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 74, 0.25)',
  },
  memberCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#2C2416',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 74, 0.3)',
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  memberCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  tierPill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  memberCardTier: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1 },
  memberCardName: { fontSize: 18, fontWeight: '700', color: colors.white },
  memberCardPhone: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  tierBadge: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
  tierBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  memberCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  pointsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  pointsValue: { fontSize: 24, fontWeight: '800', color: colors.gold, marginTop: 2 },
  pointsSuffix: { fontSize: 14, color: 'rgba(201,162,74,0.8)' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusText: { fontSize: 14, fontWeight: '700' },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tierCardActive: { backgroundColor: '#FAF8F5' },
  tierCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  tierNameWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tierCardName: { fontSize: 15, fontWeight: '700' },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '700' },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  benefitText: { fontSize: 12, color: colors.charcoalMedium, flex: 1, lineHeight: 18 },
});
