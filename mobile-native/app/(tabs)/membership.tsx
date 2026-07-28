import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { membershipService } from '@/services/membershipService';
import { colors, spacing, radius } from '@/theme/colors';
import type { MembershipProfile, MembershipPoint, MembershipTier } from '@/types/membership';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: '#FDF4E8', text: '#92400E', border: '#CD7F32' },
  gold: { bg: '#FFFBEB', text: '#78350F', border: '#C59E3F' },
  platinum: { bg: '#F9FAFB', text: '#374151', border: '#9CA3AF' },
  diamond: { bg: '#EFF6FF', text: '#1E3A5F', border: '#60A5FA' },
};

export default function MembershipScreen() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<any>(null);
  const [points, setPoints] = useState<MembershipPoint[]>([]);
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

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
  }, [loadData]);

  const tier = user?.membership_level ?? 'bronze';
  const tierStyle = TIER_COLORS[tier];
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Membership</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {/* Membership Card */}
            <View style={[styles.memberCard, { backgroundColor: colors.charcoal }]}>
              <View style={styles.memberCardTop}>
                <View>
                  <Text style={styles.memberCardTier}>✦ {tierName.toUpperCase()} MEMBER</Text>
                  <Text style={styles.memberCardName}>{user?.name}</Text>
                  <Text style={styles.memberCardPhone}>{user?.phone}</Text>
                </View>
                <View style={[styles.tierBadge, { borderColor: tierStyle.border }]}>
                  <Text style={[styles.tierBadgeText, { color: tierStyle.border }]}>
                    {tierName.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.memberCardBottom}>
                <View>
                  <Text style={styles.pointsLabel}>Total Poin</Text>
                  <Text style={styles.pointsValue}>
                    {membership?.membership?.total_points ?? (user as any)?.total_points ?? 0}
                    <Text style={styles.pointsSuffix}> Pts</Text>
                  </Text>
                </View>
                <View>
                  <Text style={styles.pointsLabel}>Status</Text>
                  <Text style={[styles.pointsValue, { fontSize: 16 }]}>
                    {user?.membership_status === 'active' ? '✅ Aktif' : '❌ Tidak Aktif'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Upgrade Button */}
            {tier !== 'diamond' && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/membership/upgrade' as any)}
              >
                <Text style={styles.upgradeBtnText}>💎 Upgrade Tier Membership</Text>
              </TouchableOpacity>
            )}

            {/* Tier Benefits */}
            {tiers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Paket Membership</Text>
                {tiers.map((t) => {
                  const ts = TIER_COLORS[t.level] ?? TIER_COLORS.bronze;
                  const isCurrent = t.level === tier;
                  return (
                    <View key={t.level} style={[styles.tierCard, isCurrent ? styles.tierCardActive : null, { borderColor: isCurrent ? ts.border : colors.border }]}>
                      <View style={styles.tierCardHeader}>
                        <Text style={[styles.tierCardName, { color: ts.border }]}>✦ {t.name ?? t.level.toUpperCase()}</Text>
                        {isCurrent && (
                          <View style={[styles.currentBadge, { backgroundColor: ts.bg }]}>
                            <Text style={[styles.currentBadgeText, { color: ts.text }]}>Tier Anda</Text>
                          </View>
                        )}
                      </View>
                      {Array.isArray(t.benefits) && t.benefits.slice(0, 3).map((b, i) => (
                        <Text key={i} style={styles.benefit}>• {b}</Text>
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
  header: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal },
  memberCard: {
    marginHorizontal: spacing.lg, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  memberCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  memberCardTier: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  memberCardName: { fontSize: 18, fontWeight: '700', color: colors.white },
  memberCardPhone: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  tierBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  tierBadgeText: { fontSize: 12, fontWeight: '700' },
  memberCardBottom: { flexDirection: 'row', gap: spacing.xl, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: spacing.md },
  pointsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  pointsValue: { fontSize: 24, fontWeight: '700', color: colors.gold },
  pointsSuffix: { fontSize: 14, color: colors.gold + '80' },
  upgradeBtn: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 14, alignItems: 'center',
    shadowColor: colors.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  upgradeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  tierCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, marginBottom: spacing.sm },
  tierCardActive: { backgroundColor: colors.creamDark },
  tierCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  tierCardName: { fontSize: 15, fontWeight: '700' },
  currentBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  currentBadgeText: { fontSize: 11, fontWeight: '700' },
  benefit: { fontSize: 13, color: colors.charcoalMedium, marginTop: 2 },
});
