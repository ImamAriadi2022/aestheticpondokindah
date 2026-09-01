import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, ImageBackground, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '@/context/AuthContext';
import { membershipService } from '@/services/membershipService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { MembershipPoint, MembershipTier } from '@/types/membership';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  bronze: { bg: '#FDF4E8', text: '#92400E', border: '#CD7F32', accent: '#A0522D' },
  gold: { bg: '#FFFBEB', text: '#78350F', border: '#C59E3F', accent: '#B8943F' },
  platinum: { bg: '#F9FAFB', text: '#374151', border: '#8B9DAF', accent: '#4B5563' },
};

const TIER_IMAGES: Record<string, any> = {
  bronze: require('@/assets/dashboard/cardbronze.webp'),
  gold: require('@/assets/dashboard/cardgold.webp'),
  platinum: require('@/assets/dashboard/cardplatinum.webp'),
};

export default function MembershipScreen() {
  const { user, refreshUser } = useAuth();
  const [membership, setMembership] = useState<any>(null);
  const [pointsHistory, setPointsHistory] = useState<MembershipPoint[]>([]);
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
      if (memberRes.status === 'fulfilled') setMembership(memberRes.value);
      if (tiersRes.status === 'fulfilled') setTiers(tiersRes.value?.tiers ?? []);
      if (pointsRes.status === 'fulfilled') {
        const pList = pointsRes.value?.points || pointsRes.value || [];
        setPointsHistory(Array.isArray(pList) ? pList : []);
      }
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refreshUser(),
      loadData(true),
    ]);
    setIsRefreshing(false);
  }, [loadData, refreshUser]);

  const tier = user?.membership_level ?? 'bronze';
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const isActive = user?.membership_status === 'active';
  const totalPoints = Number(membership?.membership?.total_points ?? (user as any)?.total_points ?? (user as any)?.points ?? 0);
  const memberId = `#API-${String(user?.id || '001').padStart(3, '0')}`;

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
            @page {
              size: A4 portrait;
              margin: 20mm;
            }
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
              color: rgba(255, 255, 255, 0.7);
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
              color: rgba(255, 255, 255, 0.6);
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
            <div class="clinic-subtitle">Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310 | WA: +62 819-9011-4949</div>
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

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Membership & Loyalty</Text>
          <Text style={styles.subtitle}>Kartu digital & keistimewaan eksklusif pasien</Text>
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
            <Ionicons name="document-text-outline" size={15} color="#fff" style={{ marginRight: 4 }} />
          )}
          <Text style={styles.exportBtnText}>{isExportingPdf ? 'Membuat PDF...' : 'Export PDF'}</Text>
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
            {/* 1. SINGLE UNIFIED DIGITAL MEMBERSHIP CARD (ImageBackground with Typography) */}
            <View style={styles.cardContainer}>
              <View style={styles.cardImageWrapper}>
                <ImageBackground
                  source={TIER_IMAGES[tier] ?? TIER_IMAGES.bronze}
                  style={styles.unifiedCard}
                  imageStyle={styles.cardBgImage}
                  resizeMode="cover"
                >
                  {/* Top Row: Brand & Vertical Logo */}
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

                  {/* Middle Row: Tier Pill & Member Name */}
                  <View style={styles.cardMidRow}>
                    <View style={styles.cardTierBadge}>
                      <Ionicons name="sparkles" size={11} color="#C9A24A" style={{ marginRight: 3 }} />
                      <Text style={styles.cardTierText}>{tierName.toUpperCase()} MEMBER</Text>
                    </View>
                    <Text style={styles.cardHolderName} numberOfLines={1}>
                      {user?.name?.toUpperCase() || 'PASIEN MEMBER'}
                    </Text>
                  </View>

                  {/* Bottom Row: Member ID & Status */}
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.cardMetaLabel}>MEMBER ID</Text>
                      <Text style={styles.cardMetaValue}>{memberId}</Text>
                    </View>
                    <View style={styles.cardStatusPill}>
                      <View style={[styles.cardStatusDot, { backgroundColor: isActive ? '#10B981' : '#EF4444' }]} />
                      <Text style={styles.cardStatusText}>{isActive ? 'AKTIF' : 'NON-AKTIF'}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>

              {/* Card Meta Stats (Points & Validity) */}
              <View style={styles.cardStatsWrap}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>TOTAL POIN LOYALTY</Text>
                  <Text style={styles.statBoxValue}>{totalPoints} <Text style={styles.statBoxSuffix}>Pts</Text></Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>STATUS KEANGGOTAAN</Text>
                  <Text style={[styles.statBoxValue, { color: isActive ? '#10B981' : '#EF4444', fontSize: 13 }]}>
                    {isActive ? 'Tier Aktif' : 'Non-aktif'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. UPGRADE TIER BUTTON */}
            {tier !== 'platinum' && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/membership/upgrade' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.upgradeBtnText}>Upgrade ke Tier {tier === 'bronze' ? 'GOLD' : 'PLATINUM'}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            {/* 3. SEGMENTED TABS (Benefit Tier & Riwayat Poin) */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'benefits' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('benefits')}
                activeOpacity={0.8}
              >
                <Ionicons name="ribbon-outline" size={15} color={activeTab === 'benefits' ? colors.goldDark : colors.charcoalMedium} />
                <Text style={[styles.tabBtnText, activeTab === 'benefits' ? styles.tabBtnTextActive : null]}>
                  Benefit Tier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'history' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('history')}
                activeOpacity={0.8}
              >
                <Ionicons name="receipt-outline" size={15} color={activeTab === 'history' ? colors.goldDark : colors.charcoalMedium} />
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

                        {Array.isArray(t.benefits) && t.benefits.map((b, i) => (
                          <View key={i} style={styles.benefitRow}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.goldDark} style={{ marginTop: 2 }} />
                            <Text style={styles.benefitText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.tierCard}>
                    <Text style={styles.tierCardName}>Benefit Keanggotaan Klinik</Text>
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.goldDark} />
                      <Text style={styles.benefitText}>Diskon perawatan berkala hingga 20%</Text>
                    </View>
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.goldDark} />
                      <Text style={styles.benefitText}>Kumpulkan poin setiap reservasi dan pembayaran</Text>
                    </View>
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.goldDark} />
                      <Text style={styles.benefitText}>Prioritas antrean & jadwal dokter spesialis</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* TAB 2: RIWAYAT POIN */}
            {activeTab === 'history' && (
              <View style={styles.tabContent}>
                {pointsHistory.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Ionicons name="receipt-outline" size={36} color={colors.charcoalMedium} />
                    <Text style={styles.emptyHistoryTitle}>Belum Ada Riwayat Poin</Text>
                    <Text style={styles.emptyHistoryText}>
                      Poin reward akan bertambah secara otomatis setiap kali Anda menyelesaikan perawatan di klinik kami.
                    </Text>
                  </View>
                ) : (
                  pointsHistory.map((item, idx) => (
                    <View key={item.id || idx} style={styles.historyCard}>
                      <View style={styles.historyIconWrap}>
                        <Ionicons
                          name={(item as any).type === 'redeem' ? 'gift-outline' : 'sparkles-outline'}
                          size={18}
                          color={colors.goldDark}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyTitle}>{item.description || 'Poin Perawatan Dental'}</Text>
                        <Text style={styles.historyDate}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </Text>
                      </View>
                      <Text style={[styles.historyPoints, { color: (item as any).type === 'redeem' ? '#DC2626' : '#10B981' }]}>
                        {(item as any).type === 'redeem' ? '-' : '+'}{item.points || 0} Pts
                      </Text>
                    </View>
                  ))
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
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.charcoal },
  subtitle: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  exportBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: '#1C1814',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 74, 0.3)',
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  cardImageWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: '#1C1814',
  },
  unifiedCard: {
    width: '100%',
    aspectRatio: 1.586,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardBgImage: {
    transform: [{ scaleX: 1.36 }, { scaleY: 1.25 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrandSub: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  cardBrandMain: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: '#FFFFFF' },
  cardLogo: { width: 28, height: 28, tintColor: '#FFFFFF', opacity: 0.9 },
  cardMidRow: {
    marginVertical: 'auto',
  },
  cardTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 74, 0.5)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  cardTierText: { fontSize: 9, fontWeight: '700', color: '#EADBBD', letterSpacing: 0.5 },
  cardHolderName: { fontSize: 17, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMetaLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  cardMetaValue: { fontSize: 12, fontWeight: '800', color: '#FAF5EA', letterSpacing: 1 },
  cardStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  cardStatusDot: { width: 6, height: 6, borderRadius: 3 },
  cardStatusText: { fontSize: 9, fontWeight: '700', color: '#FAF5EA' },
  cardStatsWrap: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#3A3228',
    padding: spacing.md,
    backgroundColor: '#1C1814',
  },
  statBox: { flex: 1 },
  statBoxLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5 },
  statBoxValue: { fontSize: 17, fontWeight: '800', color: colors.gold, marginTop: 2 },
  statBoxSuffix: { fontSize: 12, color: 'rgba(201,162,74,0.8)' },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: 13,
    paddingHorizontal: 20,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: colors.charcoalMedium },
  tabBtnTextActive: { color: colors.goldDark, fontWeight: '700' },
  tabContent: { paddingHorizontal: spacing.lg },
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
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 5 },
  benefitText: { fontSize: 12, color: colors.charcoalMedium, flex: 1, lineHeight: 18 },
  emptyHistory: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  emptyHistoryTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginTop: spacing.sm },
  emptyHistoryText: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    gap: 10,
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: { fontSize: 13, fontWeight: '600', color: colors.charcoal },
  historyDate: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2 },
  historyPoints: { fontSize: 13, fontWeight: '700' },
});
