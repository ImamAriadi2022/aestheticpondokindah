import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, ImageBackground, Image, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '@/context/AuthContext';
import { membershipService } from '@/services/membershipService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { MembershipPoint, MembershipTier, MembershipData } from '@/types/membership';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  bronze: { bg: '#FDF4E8', text: '#92400E', border: '#CD7F32', accent: '#A0522D' },
  gold: { bg: '#FFFBEB', text: '#78350F', border: '#C59E3F', accent: '#B8943F' },
  platinum: { bg: '#F9FAFB', text: '#374151', border: '#8B9DAF', accent: '#4B5563' },
};

const TIER_CARD_BGS: Record<string, any> = {
  bronze: require('@/assets/dashboard/cardbronze.webp'),
  gold: require('@/assets/dashboard/cardgold.webp'),
  platinum: require('@/assets/dashboard/cardplatinum.webp'),
};

const TIER_RIBBONS: Record<string, any> = {
  bronze: require('@/assets/dashboard/bronze.webp'),
  gold: require('@/assets/dashboard/gold.webp'),
  platinum: require('@/assets/dashboard/platinum.webp'),
};

export default function MembershipScreen() {
  const { user, refreshUser } = useAuth();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [pointsHistory, setPointsHistory] = useState<MembershipPoint[]>([]);
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [activeTab, setActiveTab] = useState<'benefits' | 'history'>('benefits');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const loadData = useCallback(async (force = false) => {
    try {
      const [memberRes, tiersRes, pointsRes] = await Promise.allSettled([
        membershipService.getMembership(force),
        membershipService.getTiers(),
        membershipService.getPoints(),
      ]);

      if (memberRes.status === 'fulfilled' && memberRes.value) {
        setMembership(memberRes.value);
      }
      if (tiersRes.status === 'fulfilled' && tiersRes.value?.tiers) {
        setTiers(tiersRes.value.tiers);
      }
      if (pointsRes.status === 'fulfilled' && pointsRes.value) {
        setPointsBalance(pointsRes.value.current_balance || 0);
        setPointsHistory(pointsRes.value.points || []);
      }
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refreshUser(),
      loadData(true),
    ]);
    setIsRefreshing(false);
  }, [loadData, refreshUser]);

  const tier = (membership?.membership?.level || user?.membership_level || 'bronze').toLowerCase();
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const isActive = (membership?.membership?.status || user?.membership_status || 'active') === 'active';
  const totalPoints = pointsBalance || Number(membership?.membership?.points ?? (user as any)?.points ?? 0);
  const memberId = (user as any)?.membership_id || (user as any)?.member_id || `MEM-AESPI_${user?.id || '22'}`;
  const membershipExpiry = membership?.membership?.expires_at
    ? new Date(membership.membership.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Seumur Hidup';

  const autoProgress = membership?.progress;

  const handleExportCardPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);

    try {
      const gradientBg = tier === 'gold'
        ? 'linear-gradient(135deg, #1C1814 0%, #3D2E14 50%, #1C1814 100%)'
        : tier === 'platinum'
        ? 'linear-gradient(135deg, #111827 0%, #374151 50%, #111827 100%)'
        : 'linear-gradient(135deg, #1C1814 0%, #3B2011 50%, #1C1814 100%)';

      const tierBadgeColor = tier === 'gold' ? '#C9A24A' : tier === 'platinum' ? '#9CA3AF' : '#CD7F32';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>AESPI Digital Membership Card</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #2C2416;
              margin: 0;
              padding: 0;
              background-color: #FFFFFF;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #C9A24A;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .clinic-title {
              font-size: 20px;
              font-weight: 800;
              color: #2C2416;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .clinic-subtitle {
              font-size: 11px;
              color: #7A6E60;
              margin-top: 4px;
            }
            .card-wrapper {
              display: flex;
              justify-content: center;
              margin: 20px 0 35px 0;
            }
            .card {
              width: 480px;
              height: 280px;
              background: ${gradientBg};
              border: 2px solid #C9A24A;
              border-radius: 20px;
              padding: 24px 28px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              color: #FFFFFF;
              box-shadow: 0 10px 25px rgba(44, 36, 22, 0.2);
            }
            .card-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand-sub {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 2px;
              color: rgba(255, 255, 255, 0.75);
              text-transform: uppercase;
            }
            .brand-main {
              font-size: 14px;
              font-weight: 900;
              letter-spacing: 1px;
              color: #FFFFFF;
            }
            .card-mid {
              margin: 15px 0;
            }
            .tier-pill {
              display: inline-block;
              background: rgba(0,0,0,0.4);
              border: 1px solid ${tierBadgeColor};
              color: #FAF5EA;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .holder-name {
              font-size: 22px;
              font-weight: 900;
              color: #FFFFFF;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .card-bottom {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .meta-label {
              font-size: 9px;
              font-weight: 700;
              color: rgba(255, 255, 255, 0.65);
              letter-spacing: 1px;
            }
            .meta-value {
              font-size: 14px;
              font-weight: 800;
              color: #FAF5EA;
              letter-spacing: 1.5px;
            }
            .status-badge {
              background: rgba(16, 185, 129, 0.2);
              border: 1px solid #10B981;
              color: #10B981;
              font-size: 11px;
              font-weight: 800;
              padding: 4px 12px;
              border-radius: 12px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .info-table th {
              background-color: #FAF8F5;
              color: #7A6E60;
              font-size: 11px;
              text-transform: uppercase;
              text-align: left;
              padding: 10px 14px;
              border-bottom: 1px solid #E8DFC8;
            }
            .info-table td {
              padding: 12px 14px;
              font-size: 13px;
              border-bottom: 1px solid #F0E6D3;
              color: #2C2416;
            }
            .footer-note {
              margin-top: 40px;
              padding: 15px;
              background-color: #FAF8F5;
              border-radius: 12px;
              border: 1px solid #E8DFC8;
              font-size: 11px;
              color: #7A6E60;
              line-height: 1.6;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-title">Aesthetic Pondok Indah Dental Clinic</div>
            <div class="clinic-subtitle">Jl. Metro Pondok Indah Blok TB No. 12, Jakarta Selatan | WA: +62 819-9011-4949</div>
          </div>

          <div style="text-align: center; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 16px; color: #2C2416;">KARTU KEANGGOTAAN DIGITAL RESMI</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #7A6E60;">Dokumen Bukti Keanggotaan & Hak Istimewa Pasien</p>
          </div>

          <div class="card-wrapper">
            <div class="card">
              <div class="card-top">
                <div>
                  <div class="brand-sub">AESPI DIGITAL</div>
                  <div class="brand-main">MEMBERSHIP CARD</div>
                </div>
                <div style="font-weight: 800; font-size: 13px; color: #C9A24A;">AESTHETIC</div>
              </div>

              <div class="card-mid">
                <div class="tier-pill">${tierName.toUpperCase()} MEMBER</div>
                <div class="holder-name">${user?.name?.toUpperCase() || 'PASIEN MEMBER'}</div>
              </div>

              <div class="card-bottom">
                <div>
                  <div class="meta-label">MEMBER ID</div>
                  <div class="meta-value">${memberId}</div>
                </div>
                <div class="status-badge">${isActive ? '● AKTIF' : 'NON-AKTIF'}</div>
              </div>
            </div>
          </div>

          <table class="info-table">
            <tr>
              <th>Atribut Keanggotaan</th>
              <th>Rincian Pasien</th>
            </tr>
            <tr>
              <td><strong>Nama Lengkap Pasien</strong></td>
              <td>${user?.name || '-'}</td>
            </tr>
            <tr>
              <td><strong>Nomor Identitas Member</strong></td>
              <td>${memberId}</td>
            </tr>
            <tr>
              <td><strong>Tingkat Tier Keanggotaan</strong></td>
              <td><strong>${tierName.toUpperCase()}</strong></td>
            </tr>
            <tr>
              <td><strong>Total Poin Loyalty Aktif</strong></td>
              <td><span style="color: #C9A24A; font-weight: bold;">${totalPoints} Pts</span></td>
            </tr>
            <tr>
              <td><strong>Status Kartu</strong></td>
              <td>${isActive ? 'Keanggotaan Aktif & Terverifikasi' : 'Non-aktif'}</td>
            </tr>
            <tr>
              <td><strong>Tanggal Cetak Dokumen</strong></td>
              <td>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
          </table>

          <div class="footer-note">
            Kartu digital ini merupakan identitas resmi pasien klinik gigi Aesthetic Pondok Indah. Tunjukkan kartu ini saat melakukan reservasi atau pembayaran tindakan medis untuk memperoleh poin loyalty dan penawaran eksklusif.
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Simpan / Bagikan Kartu Membership PDF',
        });
      } else {
        Alert.alert('Sukses', `File PDF kartu membership berhasil dibuat: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Gagal Ekspor PDF', err?.message || 'Gagal membuat file PDF kartu membership.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rp ' + (Number(amount) || 0).toLocaleString('id-ID');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* COMPACT TOP HEADER (IDENTICAL TO BOOKING & CONSULTATION) */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title} numberOfLines={1}>Membership & Loyalty</Text>
          <Text style={styles.subtitle} numberOfLines={1}>Kartu digital & privilese pasien</Text>
        </View>
        <TouchableOpacity
          style={[styles.exportBtn, isExportingPdf ? { opacity: 0.7 } : null]}
          onPress={handleExportCardPdf}
          disabled={isExportingPdf}
          activeOpacity={0.85}
        >
          {isExportingPdf ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 4 }} />
          ) : (
            <Ionicons name="document-text-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
          )}
          <Text style={styles.exportBtnText}>{isExportingPdf ? 'Membuat...' : 'Export PDF'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {/* 1. SEAMLESS DIGITAL MEMBERSHIP CARD (EXACT MATCH TO WEB PREVIEW) */}
            <View style={styles.cardContainer}>
              <View style={styles.membershipCardWrap}>
                <ImageBackground
                  source={TIER_CARD_BGS[tier] ?? TIER_CARD_BGS.bronze}
                  style={styles.membershipCardBg}
                  imageStyle={styles.membershipCardImageStyle}
                  resizeMode="cover"
                >
                  {/* Top Row: Brand & Logo */}
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.cardBrandSub}>AESPI DIGITAL</Text>
                      <Text style={styles.cardBrandMain}>MEMBERSHIP CARD</Text>
                    </View>
                    <Image
                      source={require('@/assets/logo/logo-vertikal.webp')}
                      style={styles.cardLogo}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Middle Row: Tier Subtitle & Patient Full Name */}
                  <View style={styles.cardMidRow}>
                    <Text style={styles.cardTierSubText}>{tierName.toUpperCase()} MEMBER</Text>
                    <Text style={styles.cardHolderName} numberOfLines={1}>
                      {user?.name?.toUpperCase() || 'PASIEN MEMBER'}
                    </Text>
                  </View>

                  {/* Bottom Row: Member ID & Gold Medal Ribbon */}
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.cardMetaLabel}>MEMBER ID</Text>
                      <Text style={styles.cardMetaValue}>{memberId}</Text>
                    </View>
                    <Image
                      source={TIER_RIBBONS[tier] ?? TIER_RIBBONS.bronze}
                      style={styles.cardRibbon}
                      resizeMode="contain"
                    />
                  </View>
                </ImageBackground>
              </View>

              {/* Card Meta Stats (Expiry & Current Points) */}
              <View style={styles.cardStatsWrap}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>BERLAKU HINGGA</Text>
                  <Text style={styles.statBoxValueSmall}>{membershipExpiry}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>POIN SAAT INI</Text>
                  <Text style={styles.statBoxValueGold}>
                    {totalPoints.toLocaleString('id-ID')} <Text style={styles.statBoxSuffix}>Pts</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. AUTO UPGRADE PROGRESS BAR IF APPLICABLE */}
            {autoProgress && autoProgress.next_level && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Ionicons name="trending-up" size={16} color={colors.goldDark} />
                  <Text style={styles.progressTitle}>
                    Akumulasi Perawatan ke {autoProgress.next_level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.progressDesc}>
                  Tier Anda naik otomatis dari total transaksi tindakan medis di klinik.
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
                    {(autoProgress.percentage || 0).toFixed(0)}% tercapai ({formatCurrency(autoProgress.current_amount)})
                  </Text>
                  <Text style={styles.progressRemaining}>
                    {formatCurrency(autoProgress.remaining)} lagi
                  </Text>
                </View>
              </View>
            )}

            {/* 3. UPGRADE TIER BUTTON */}
            {tier !== 'platinum' && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/membership/upgrade' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.upgradeBtnText}>Upgrade ke Tier {tier === 'bronze' ? 'GOLD' : 'PLATINUM'}</Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            {/* 4. SEGMENTED TABS (2 Tabs Only: Benefit Tier & Riwayat Poin) */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'benefits' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('benefits')}
                activeOpacity={0.8}
              >
                <Ionicons name="ribbon-outline" size={14} color={activeTab === 'benefits' ? colors.goldDark : colors.charcoalMedium} />
                <Text style={[styles.tabBtnText, activeTab === 'benefits' ? styles.tabBtnTextActive : null]}>
                  Benefit Tier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'history' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('history')}
                activeOpacity={0.8}
              >
                <Ionicons name="receipt-outline" size={14} color={activeTab === 'history' ? colors.goldDark : colors.charcoalMedium} />
                <Text style={[styles.tabBtnText, activeTab === 'history' ? styles.tabBtnTextActive : null]}>
                  Riwayat Poin
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: BENEFIT TIER */}
            {activeTab === 'benefits' && (
              <View style={styles.tabContent}>
                {tiers.length > 0 ? (
                  tiers.map((t) => {
                    const ts = TIER_COLORS[t.level] ?? TIER_COLORS.bronze;
                    const isCurrent = t.level === tier;
                    const b = (typeof t.benefits === 'object' && !Array.isArray(t.benefits)) ? t.benefits : {};

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
                            <Ionicons name="ribbon-outline" size={18} color={ts.border} />
                            <Text style={[styles.tierCardName, { color: ts.border }]}>
                              {t.label || t.name || t.level.toUpperCase()}
                            </Text>
                          </View>
                          {isCurrent && (
                            <View style={[styles.currentBadge, { backgroundColor: ts.bg, borderColor: ts.border + '40' }]}>
                              <Ionicons name="checkmark-circle" size={12} color={ts.text} style={{ marginRight: 3 }} />
                              <Text style={[styles.currentBadgeText, { color: ts.text }]}>Tier Anda</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.tierPriceText}>
                          {t.price > 0 ? `${t.price_formatted} / tahun` : 'Gratis untuk Pasien Terdaftar'}
                        </Text>

                        <View style={styles.benefitList}>
                          {b.discount_percentage > 0 ? (
                            <View style={styles.benefitItem}>
                              <Ionicons name="checkmark" size={14} color="#059669" />
                              <Text style={styles.benefitItemText}>
                                Diskon <Text style={{ fontWeight: '700' }}>{b.discount_percentage}%</Text> seluruh perawatan medis
                              </Text>
                            </View>
                          ) : null}

                          {b.point_multiplier > 0 ? (
                            <View style={styles.benefitItem}>
                              <Ionicons name="checkmark" size={14} color="#059669" />
                              <Text style={styles.benefitItemText}>
                                Kelipatan <Text style={{ fontWeight: '700' }}>{b.point_multiplier}x</Text> Poin Reward Loyalty
                              </Text>
                            </View>
                          ) : null}

                          {b.priority_booking ? (
                            <View style={styles.benefitItem}>
                              <Ionicons name="checkmark" size={14} color="#059669" />
                              <Text style={styles.benefitItemText}>Prioritas penentuan jadwal dokter spesialis</Text>
                            </View>
                          ) : null}

                          {b.free_scaling_per_year > 0 ? (
                            <View style={styles.benefitItem}>
                              <Ionicons name="checkmark" size={14} color="#059669" />
                              <Text style={styles.benefitItemText}>
                                Gratis Scaling <Text style={{ fontWeight: '700' }}>{b.free_scaling_per_year}x/tahun</Text>
                              </Text>
                            </View>
                          ) : null}

                          {b.free_consultation ? (
                            <View style={styles.benefitItem}>
                              <Ionicons name="checkmark" size={14} color="#059669" />
                              <Text style={styles.benefitItemText}>Konsultasi dokter gigi & asisten online</Text>
                            </View>
                          ) : null}

                          {b.birthday_voucher ? (
                            <View style={styles.benefitItem}>
                              <Ionicons name="checkmark" size={14} color="#059669" />
                              <Text style={styles.benefitItemText}>Birthday Special Voucher Treatment</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <ActivityIndicator color={colors.gold} />
                )}
              </View>
            )}

            {/* TAB 2: RIWAYAT POIN MUTATION */}
            {activeTab === 'history' && (
              <View style={styles.tabContent}>
                {pointsHistory.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Ionicons name="receipt-outline" size={40} color={colors.charcoalMedium} />
                    <Text style={styles.emptyHistoryTitle}>Belum Ada Mutasi Poin</Text>
                    <Text style={styles.emptyHistorySub}>
                      Poin akan diperoleh setiap kali Anda menyelesaikan transaksi tindakan medis atau upgrade tier.
                    </Text>
                  </View>
                ) : (
                  pointsHistory.map((p, idx) => {
                    const isEarned = p.type === 'earned';
                    const dateStr = p.created_at
                      ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-';

                    return (
                      <View key={p.id || idx} style={styles.historyCard}>
                        <View style={[styles.historyIconWrap, { backgroundColor: isEarned ? '#ECFDF5' : '#FEF2F2' }]}>
                          <Ionicons
                            name={isEarned ? 'arrow-down' : 'arrow-up'}
                            size={16}
                            color={isEarned ? '#059669' : '#DC2626'}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyDesc}>{p.description || 'Poin Loyalty Treatment'}</Text>
                          <Text style={styles.historyDate}>{dateStr}</Text>
                        </View>
                        <Text style={[styles.historyPoints, { color: isEarned ? '#059669' : '#DC2626' }]}>
                          {isEarned ? '+' : '-'}{p.points} Pts
                        </Text>
                      </View>
                    );
                  })
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.charcoal,
  },
  subtitle: {
    fontSize: 11,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    gap: 4,
    flexShrink: 0,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  cardContainer: {
    gap: spacing.sm,
  },
  membershipCardWrap: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#1C1814',
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  membershipCardBg: {
    width: '100%',
    height: '100%',
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  membershipCardImageStyle: {
    width: '128%',
    height: '110%',
    left: '-6%',
    top: '-5%',
    resizeMode: 'cover',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrandSub: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
  cardBrandMain: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  cardLogo: {
    width: 28,
    height: 28,
  },
  cardMidRow: {
    marginVertical: 'auto',
  },
  cardTierSubText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#EADBBD',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardHolderName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMetaLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  },
  cardMetaValue: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#FAF5EA',
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardRibbon: {
    width: 44,
    height: 44,
  },
  cardStatsWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#26211B',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#3A3228',
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statBoxValueSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
  },
  statBoxValueGold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E8C547',
    marginTop: 2,
  },
  statBoxSuffix: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTitle: {
    fontSize: 12.5,
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
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
  },
  progressRemaining: {
    fontSize: 10,
    color: colors.charcoalMedium,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.xl,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  tabBtnActive: {
    backgroundColor: '#FAF5EA',
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.charcoalMedium,
  },
  tabBtnTextActive: {
    color: colors.goldDark,
    fontWeight: '700',
  },
  tabContent: {
    gap: spacing.sm,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    gap: 6,
  },
  tierCardActive: {
    borderWidth: 2,
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierCardName: {
    fontSize: 14,
    fontWeight: '800',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  currentBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  tierPriceText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoalMedium,
  },
  benefitList: {
    gap: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    paddingTop: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitItemText: {
    fontSize: 11,
    color: '#4A3F35',
  },
  emptyHistory: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  emptyHistoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  emptyHistorySub: {
    fontSize: 11,
    color: colors.charcoalMedium,
    textAlign: 'center',
    maxWidth: 240,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  historyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  historyDate: {
    fontSize: 10,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  historyPoints: {
    fontSize: 13,
    fontWeight: '800',
  },
});
