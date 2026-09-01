import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { membershipService } from '@/services/membershipService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { UpgradeOption } from '@/types/membership';

const TIER_RANKS: Record<string, number> = {
  bronze: 1,
  gold: 2,
  platinum: 3,
};

const TIER_THEMES: Record<string, { bg: string; text: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
  bronze: { bg: '#FDF4E8', text: '#92400E', border: '#CD7F32', icon: 'star' },
  gold: { bg: '#FFFBEB', text: '#78350F', border: '#C59E3F', icon: 'ribbon' },
  platinum: { bg: '#F9FAFB', text: '#374151', border: '#8B9DAF', icon: 'sparkles' },
};

export default function MembershipUpgradeScreen() {
  const { user, refreshUser } = useAuth();
  const [options, setOptions] = useState<UpgradeOption[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>('bronze');
  const [currentLabel, setCurrentLabel] = useState<string>('Bronze Member');
  const [autoProgress, setAutoProgress] = useState<any>(null);
  const [unmetRequirements, setUnmetRequirements] = useState<Array<{ message: string; action: string }>>([]);
  const [clinicPhone, setClinicPhone] = useState<string>('081990114949');

  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [manualPayment, setManualPayment] = useState<{
    orderId: string;
    targetLevel: string;
    targetLabel: string;
    priceFormatted: string;
    whatsappUrl: string;
  } | null>(null);

  const [showReqModal, setShowReqModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [optRes, phoneRes] = await Promise.all([
        membershipService.getUpgradeOptions(),
        membershipService.getClinicContact(),
      ]);

      if (optRes.success) {
        setOptions(optRes.tiers || []);
        setCurrentLevel(optRes.current_level || user?.membership_level || 'bronze');
        setCurrentLabel(optRes.current_label || 'Bronze Member');
        setAutoProgress(optRes.auto_upgrade_progress);
        setUnmetRequirements(optRes.unmet_requirements || []);
      }
      if (phoneRes) {
        setClinicPhone(phoneRes);
      }
    } catch {
      // safe
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelRank = (lvl: string) => TIER_RANKS[lvl?.toLowerCase()] || 0;

  const handleUpgrade = async (option: UpgradeOption) => {
    if (unmetRequirements.length > 0) {
      setShowReqModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await membershipService.requestUpgrade(option.level as 'gold' | 'platinum');
      const orderId = res.orderId;

      const userName = user?.name || 'Pasien';
      const userContact = user?.phone || (user as any)?.whatsapp || user?.email || '-';
      const cleanPhone = clinicPhone.replace(/\D/g, '').replace(/^0/, '62');

      const waMessage = [
        'Halo Admin Aesthetic Pondok Indah,',
        '',
        'Saya ingin mengajukan *Upgrade Membership* akun saya:',
        `• *Nama*: ${userName}`,
        `• *Email / No. HP*: ${userContact}`,
        `• *Tier Saat Ini*: ${currentLabel || currentLevel.toUpperCase()}`,
        `• *Target Upgrade*: ${option.label} (${option.price_formatted})`,
        `• *Kode Referensi*: ${orderId}`,
        '',
        'Mohon petunjuk nomor rekening / QRIS pembayaran klinik untuk menyelesaikan upgrade membership. Terima kasih!',
      ].join('\n');

      const whatsappUrl = `https://wa.me/${cleanPhone || '6281990114949'}?text=${encodeURIComponent(waMessage)}`;

      setManualPayment({
        orderId,
        targetLevel: option.level,
        targetLabel: option.label,
        priceFormatted: option.price_formatted,
        whatsappUrl,
      });
    } catch (err: any) {
      Alert.alert('Gagal', err?.message || 'Gagal mengajukan upgrade membership.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rp ' + (Number(amount) || 0).toLocaleString('id-ID');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>Upgrade Membership</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>Tingkatkan privilese & diskon perawatan</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Current Tier Info Card */}
          <View style={styles.currentCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentCardSub}>TIER ANDA SAAT INI</Text>
              <Text style={styles.currentCardTitle}>{currentLabel || currentLevel.toUpperCase()}</Text>
              <Text style={styles.currentCardDesc}>
                Upgrade untuk menikmati privilese diskon & pelayanan prioritas instan.
              </Text>
            </View>
            <View style={styles.currentCardIconWrap}>
              <Ionicons name="ribbon" size={24} color={colors.goldDark} />
            </View>
          </View>

          {/* Auto Upgrade Progress if applicable */}
          {autoProgress && autoProgress.next_level && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Ionicons name="trending-up" size={18} color={colors.goldDark} />
                <Text style={styles.progressTitle}>
                  Akumulasi Perawatan ke {autoProgress.next_level.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.progressDesc}>
                Tier Anda juga dapat naik otomatis dari total transaksi perawatan klinik.
              </Text>
              <View style={styles.progressBarWrap}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, autoProgress.percentage || 0)}%` },
                  ]}
                />
              </View>
              <View style={styles.progressMetaRow}>
                <Text style={styles.progressPercent}>
                  {(autoProgress.percentage || 0).toFixed(0)}% tercapai
                </Text>
                <Text style={styles.progressRemaining}>
                  {formatCurrency(autoProgress.remaining)} lagi
                </Text>
              </View>
            </View>
          )}

          {/* Upgrade Instruction Alert */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.goldDark} style={{ marginTop: 1 }} />
            <Text style={styles.infoBoxText}>
              Pembayaran upgrade membership dilakukan secara transfer manual dan diverifikasi langsung oleh Admin Klinik via WhatsApp resmi.
            </Text>
          </View>

          <Text style={styles.sectionHeading}>Pilihan Paket Upgrade</Text>

          {/* Tiers List */}
          {options.map((option) => {
            const isCurrent = option.level === currentLevel;
            const isLower = getLevelRank(option.level) < getLevelRank(currentLevel);
            const isSelected = selected === option.level;
            const theme = TIER_THEMES[option.level] || TIER_THEMES.gold;
            const benefits = option.benefits || {};

            return (
              <View
                key={option.level}
                style={[
                  styles.tierCard,
                  isCurrent ? styles.tierCardCurrent : null,
                  isSelected ? styles.tierCardSelected : null,
                ]}
              >
                <View style={[styles.tierCardTop, { backgroundColor: theme.bg, borderColor: theme.border + '40' }]}>
                  <View style={styles.tierIconWrap}>
                    <Ionicons name={theme.icon} size={20} color={theme.border} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tierTitle, { color: theme.text }]}>{option.label}</Text>
                    <Text style={styles.tierPrice}>{option.price_formatted} / tahun</Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentPill}>
                      <Text style={styles.currentPillText}>Tier Anda</Text>
                    </View>
                  )}
                </View>

                <View style={styles.tierBenefitsWrap}>
                  <Text style={styles.benefitHeading}>Privilese & Keuntungan:</Text>

                  {(benefits.discount_percentage ?? 0) > 0 && (
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.benefitText}>
                        Diskon <Text style={{ fontWeight: '700' }}>{benefits.discount_percentage}%</Text> seluruh perawatan
                      </Text>
                    </View>
                  )}

                  {(benefits.point_multiplier ?? 0) > 0 && (
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.benefitText}>
                        Kelipatan <Text style={{ fontWeight: '700' }}>{benefits.point_multiplier}x</Text> Poin Reward
                      </Text>
                    </View>
                  )}

                  {benefits.priority_booking && (
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.benefitText}>Prioritas penentuan jadwal dokter spesialis</Text>
                    </View>
                  )}

                  {(benefits.free_scaling_per_year ?? 0) > 0 && (
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.benefitText}>
                        Gratis Scaling <Text style={{ fontWeight: '700' }}>{benefits.free_scaling_per_year}x/tahun</Text>
                      </Text>
                    </View>
                  )}

                  {benefits.free_consultation && (
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.benefitText}>Free Konsultasi Dokter & AI Assistant</Text>
                    </View>
                  )}

                  {benefits.birthday_voucher && (
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.benefitText}>Birthday Special Voucher Treatment</Text>
                    </View>
                  )}
                </View>

                {/* Upgrade Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isCurrent ? styles.actionBtnCurrent : isLower ? styles.actionBtnLower : styles.actionBtnActive,
                  ]}
                  onPress={() => handleUpgrade(option)}
                  disabled={isCurrent || isLower || isProcessing}
                  activeOpacity={0.85}
                >
                  {isProcessing && selected === option.level ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : isCurrent ? (
                    <Text style={styles.actionBtnTextCurrent}>Tier Saat Ini</Text>
                  ) : isLower ? (
                    <Text style={styles.actionBtnTextLower}>Sudah di Tier Lebih Tinggi</Text>
                  ) : (
                    <>
                      <Ionicons name="logo-whatsapp" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnTextActive}>Ajukan Upgrade via WhatsApp</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Manual Payment WhatsApp Modal (Parity with Web Dialog) */}
      <Modal
        visible={manualPayment !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setManualPayment(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark-circle" size={32} color="#059669" />
            </View>

            <Text style={styles.modalTitle}>Permohonan Upgrade Tercatat!</Text>
            <Text style={styles.modalDesc}>
              Silakan hubungi Admin Klinik via WhatsApp untuk petunjuk transfer dan aktivasi tier Anda.
            </Text>

            <View style={styles.modalSummaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nomor Referensi:</Text>
                <Text style={styles.summaryValMono}>{manualPayment?.orderId}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Target Tier:</Text>
                <Text style={[styles.summaryVal, { color: colors.goldDark }]}>{manualPayment?.targetLabel}</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E8DFC8', paddingTop: 6 }]}>
                <Text style={styles.summaryLabelBold}>Biaya Upgrade:</Text>
                <Text style={styles.summaryPriceBold}>{manualPayment?.priceFormatted}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.waSubmitBtn}
              onPress={() => {
                if (manualPayment?.whatsappUrl) {
                  Linking.openURL(manualPayment.whatsappUrl);
                }
              }}
              activeOpacity={0.88}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.waSubmitBtnText}>Lanjut ke WhatsApp Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setManualPayment(null);
                refreshUser();
                router.back();
              }}
            >
              <Text style={styles.modalCloseBtnText}>Lihat Status di Membership</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    gap: spacing.sm,
  },
  currentCardSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.charcoalMedium,
    letterSpacing: 0.5,
  },
  currentCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
    marginTop: 2,
  },
  currentCardDesc: {
    fontSize: 11,
    color: colors.goldDark,
    marginTop: 2,
    fontWeight: '600',
  },
  currentCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  progressDesc: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: '#F0E6D3',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 3,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressPercent: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.goldDark,
  },
  progressRemaining: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF5EA',
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EADBBD',
    gap: spacing.xs + 2,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11,
    color: '#5C5546',
    lineHeight: 15,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.charcoal,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    overflow: 'hidden',
  },
  tierCardCurrent: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  tierCardSelected: {
    borderColor: colors.gold,
  },
  tierCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  tierIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  tierPrice: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  currentPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  currentPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.goldDark,
  },
  tierBenefitsWrap: {
    padding: spacing.md,
    gap: 6,
  },
  benefitHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.charcoalMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 11.5,
    color: '#4A3F35',
  },
  actionBtn: {
    margin: spacing.md,
    marginTop: 0,
    height: 42,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: colors.gold,
  },
  actionBtnCurrent: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
  },
  actionBtnLower: {
    backgroundColor: '#F3F4F6',
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnTextCurrent: {
    color: colors.goldDark,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnTextLower: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.charcoal,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 11,
    color: colors.charcoalMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalSummaryBox: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    gap: 6,
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.charcoalMedium,
  },
  summaryValMono: {
    fontSize: 11.5,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: colors.charcoal,
  },
  summaryVal: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  summaryLabelBold: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.charcoal,
  },
  summaryPriceBold: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.charcoal,
  },
  waSubmitBtn: {
    width: '100%',
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  modalCloseBtn: {
    paddingVertical: 6,
  },
  modalCloseBtnText: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
    fontWeight: '600',
  },
});
