import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { membershipService } from '@/services/membershipService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const TIERS = [
  { level: 'gold', name: 'Gold', price: 'Rp 299.000', benefits: ['Diskon 10% semua layanan', '+100 Bonus Poin', 'Priority booking', 'Birthday treat'] },
  { level: 'platinum', name: 'Platinum', price: 'Rp 599.000', benefits: ['Diskon 20% semua layanan', '+300 Bonus Poin', 'Priority booking', 'Free konsultasi 1x/bulan', 'Birthday treat Premium'] },
];

export default function MembershipUpgradeScreen() {
  const { user, refreshUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentTier = user?.membership_level ?? 'bronze';
  const availableTiers = TIERS.filter((t) => {
    const order = ['bronze', 'gold', 'platinum'];
    return order.indexOf(t.level) > order.indexOf(currentTier);
  });

  const handleUpgrade = async () => {
    if (!selected) return;

    Alert.alert(
      'Konfirmasi Upgrade',
      `Upgrade ke tier ${selected.toUpperCase()}?\nPembayaran akan disimulasikan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Upgrade',
          onPress: async () => {
            setIsLoading(true);
            try {
              const payRes = await membershipService.upgrade({ tier: selected });
              const txId = payRes?.transaction_id ?? payRes?.id;
              if (txId) {
                await membershipService.simulatePayment(String(txId), 'success');
              }
              await refreshUser();
              Alert.alert(
                'Upgrade Berhasil',
                `Selamat! Anda kini menjadi member ${selected.toUpperCase()}.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (err: any) {
              Alert.alert('Gagal', err?.message ?? 'Gagal melakukan upgrade.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pilih Tier Membership</Text>
        <Text style={styles.subtitle}>Tier saat ini: <Text style={{ color: colors.gold, fontWeight: '700' }}>{currentTier.toUpperCase()}</Text></Text>

        {availableTiers.map((tier) => (
          <TouchableOpacity
            key={tier.level}
            style={[styles.card, selected === tier.level ? styles.cardSelected : null]}
            onPress={() => setSelected(tier.level)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="ribbon-outline" size={16} color={selected === tier.level ? colors.gold : colors.charcoal} />
                <Text style={[styles.cardTier, selected === tier.level ? { color: colors.gold } : null]}>
                  {tier.name.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.cardPrice}>{tier.price}</Text>
            </View>
            {tier.benefits.map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color={colors.goldDark} />
                <Text style={styles.benefit}>{b}</Text>
              </View>
            ))}
            {selected === tier.level && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" style={{ marginRight: 3 }} />
                <Text style={styles.selectedText}>Dipilih</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.upgradeBtn, (!selected || isLoading) ? styles.upgradeBtnDisabled : null]}
          onPress={handleUpgrade}
          disabled={!selected || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.upgradeBtnText}>
              {selected ? `Upgrade ke ${selected.toUpperCase()}` : 'Pilih Tier Terlebih Dahulu'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * Pembayaran menggunakan simulasi. Payment gateway production akan diintegrasikan di tahap berikutnya.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.charcoalMedium, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 2, borderColor: colors.border,
    marginBottom: spacing.md, position: 'relative',
  },
  cardSelected: { borderColor: colors.gold, backgroundColor: colors.creamDark },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTier: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  cardPrice: { fontSize: 15, fontWeight: '700', color: colors.gold },
  benefit: { fontSize: 13, color: colors.charcoalMedium, marginTop: 3 },
  selectedBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: colors.gold, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  selectedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  upgradeBtn: {
    backgroundColor: colors.gold, borderRadius: 999, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.sm,
    shadowColor: colors.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  upgradeBtnDisabled: { opacity: 0.5 },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
});
