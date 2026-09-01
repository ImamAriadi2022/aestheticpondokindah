import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Modal, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { bookingService } from '@/services/bookingService';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { Reservation } from '@/types/booking';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Menunggu', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Dikonfirmasi', bg: '#D1FAE5', text: '#065F46' },
  completed: { label: 'Selesai', bg: '#DCFCE7', text: '#166534' },
  cancelled: { label: 'Dibatalkan', bg: '#FEE2E2', text: '#991B1B' },
  rejected: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B' },
  no_show: { label: 'Tidak Hadir', bg: '#F3F4F6', text: '#374151' },
};

export default function BookingScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  // E-Ticket Modal
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadData = useCallback(async (force = false) => {
    try {
      const res = await bookingService.getReservations(force);
      setReservations(res?.reservations ?? []);
    } catch {
      // Error handled by apiClient
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

  const filtered = reservations.filter((r) => {
    if (activeTab === 'upcoming') return r.status === 'pending' || r.status === 'confirmed';
    if (activeTab === 'completed') return r.status === 'completed' || r.status === 'cancelled' || r.status === 'rejected';
    return true;
  });

  const handleOpenDetail = (item: Reservation) => {
    setSelectedReservation(item);
    setIsDetailModalOpen(true);
  };

  const handleCancelBooking = (r: Reservation) => {
    Alert.alert(
      'Batalkan Reservasi',
      `Apakah Anda yakin ingin membatalkan jadwal reservasi #${r.code || r.id}?`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await bookingService.cancelReservation(r.id, 'Dibatalkan oleh pasien melalui aplikasi mobile.');
              Alert.alert('Berhasil', 'Reservasi berhasil dibatalkan.');
              setIsDetailModalOpen(false);
              await loadData(true);
            } catch (err: any) {
              Alert.alert('Gagal', err?.message || 'Gagal membatalkan reservasi.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenWhatsApp = (r: Reservation) => {
    const code = r.code || `RSV-${r.id}`;
    const doc = r.doctor_name ? `drg. ${r.doctor_name}` : 'Dokter Spesialis';
    const date = r.scheduled_date || '-';
    const time = r.scheduled_time || '-';
    const msg = [
      '*KONFIRMASI RESERVASI KLINIK GIGI*',
      '*Aesthetic Pondok Indah*',
      '━━━━━━━━━━━━━━━━━━━━━',
      `Halo Admin, saya ingin menanyakan jadwal reservasi saya:`,
      `📋 *Kode:* ${code}`,
      `🏥 *Layanan:* ${r.service_name}`,
      `👨‍⚕️ *Dokter:* ${doc}`,
      `📅 *Tanggal:* ${date}`,
      `⏰ *Jam:* ${time}`,
      '',
      'Mohon informasi lebih lanjut. Terima kasih!',
    ].join('\n');

    const phone = '6281112345678';
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(msg)}`).catch(() => {
      Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
    });
  };

  const renderItem = ({ item }: { item: Reservation }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenDetail(item)}
        activeOpacity={0.88}
      >
        <View style={styles.cardHeader}>
          <View style={styles.codeWrap}>
            <Ionicons name="receipt-outline" size={13} color={colors.goldDark} />
            <Text style={styles.cardCode}>{item.code || `RSV-${item.id}`}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.serviceName}>{item.service_name}</Text>

        {item.doctor_name && (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={12} color={colors.charcoalMedium} />
            <Text style={styles.doctorName}>drg. {item.doctor_name}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={13} color={colors.goldDark} />
            <Text style={styles.dateText}>
              {item.scheduled_date ?? 'Menunggu jadwal'}
              {item.scheduled_time ? ` · ${item.scheduled_time}` : ''}
            </Text>
          </View>
          <View style={styles.detailArrow}>
            <Text style={styles.detailText}>E-Ticket</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.goldDark} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftWrap}>
          <Text style={styles.title}>Janji Temu</Text>
          <Text style={styles.subtitle} numberOfLines={1}>Riwayat jadwal & E-Ticket digital</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/booking/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.newBtnText}>Buat Janji</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'all', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.tabActive : null]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>
              {tab === 'upcoming' ? 'Mendatang' : tab === 'all' ? 'Semua' : 'Selesai'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={40} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Tidak Ada Jadwal</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming'
                  ? 'Belum ada jadwal janji temu mendatang. Buat janji baru dengan dokter spesialis kami sekarang.'
                  : 'Belum ada data riwayat janji temu pada kategori ini.'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/booking/new')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyBtnText}>Buat Janji Sekarang</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* E-TICKET DETAIL MODAL */}
      {selectedReservation && (
        <Modal
          visible={isDetailModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsDetailModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.ticketHeader}>
                <View>
                  <Text style={styles.ticketHeaderTitle}>E-TICKET JANJI TEMU</Text>
                  <Text style={styles.ticketHeaderSub}>Aesthetic Pondok Indah Dental Clinic</Text>
                </View>
                <TouchableOpacity
                  style={styles.ticketCloseBtn}
                  onPress={() => setIsDetailModalOpen(false)}
                >
                  <Ionicons name="close" size={20} color={colors.charcoal} />
                </TouchableOpacity>
              </View>

              {/* Ticket Body */}
              <View style={styles.ticketBody}>
                {/* Code & Status */}
                <View style={styles.ticketRowBetween}>
                  <View>
                    <Text style={styles.ticketLabel}>KODE BOOKING</Text>
                    <Text style={styles.ticketCode}>{selectedReservation.code || `RSV-${selectedReservation.id}`}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: (STATUS_CONFIG[selectedReservation.status] || STATUS_CONFIG.pending).bg }]}>
                    <Text style={[styles.badgeText, { color: (STATUS_CONFIG[selectedReservation.status] || STATUS_CONFIG.pending).text }]}>
                      {(STATUS_CONFIG[selectedReservation.status] || STATUS_CONFIG.pending).label}
                    </Text>
                  </View>
                </View>

                <View style={styles.ticketDivider} />

                {/* Details */}
                <View style={styles.ticketField}>
                  <Text style={styles.ticketLabel}>LAYANAN PERAWATAN</Text>
                  <Text style={styles.ticketValueBold}>{selectedReservation.service_name}</Text>
                </View>

                <View style={styles.ticketField}>
                  <Text style={styles.ticketLabel}>DOKTER SPESIALIS</Text>
                  <Text style={styles.ticketValue}>drg. {selectedReservation.doctor_name || 'Dokter Spesialis'}</Text>
                </View>

                <View style={styles.ticketGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketLabel}>TANGGAL</Text>
                    <Text style={styles.ticketValue}>{selectedReservation.scheduled_date || '-'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketLabel}>WAKTU / JAM</Text>
                    <Text style={styles.ticketValue}>{selectedReservation.scheduled_time || 'Jadwal Reguler'}</Text>
                  </View>
                </View>

                <View style={styles.ticketField}>
                  <Text style={styles.ticketLabel}>LOKASI KLINIK</Text>
                  <Text style={styles.ticketValue}>Aesthetic Pondok Indah, Jl. Metro Pondok Indah, Jakarta Selatan</Text>
                </View>

                {selectedReservation.notes ? (
                  <View style={styles.ticketField}>
                    <Text style={styles.ticketLabel}>CATATAN KELUHAN</Text>
                    <Text style={styles.ticketValueSmall}>{selectedReservation.notes}</Text>
                  </View>
                ) : null}

                {/* Actions */}
                <View style={styles.ticketActions}>
                  <TouchableOpacity
                    style={styles.waBtn}
                    onPress={() => handleOpenWhatsApp(selectedReservation)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.waBtnText}>Konfirmasi via WhatsApp</Text>
                  </TouchableOpacity>

                  {(selectedReservation.status === 'pending' || selectedReservation.status === 'confirmed') && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelBooking(selectedReservation)}
                      disabled={isCancelling}
                      activeOpacity={0.85}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={16} color="#EF4444" style={{ marginRight: 4 }} />
                          <Text style={styles.cancelBtnText}>Batalkan Jadwal Janji Temu</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeftWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  subtitle: { fontSize: 11, color: colors.charcoalMedium, marginTop: 1 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 3,
    flexShrink: 0,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  newBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
  },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium },
  tabTextActive: { color: '#fff', fontWeight: '700' },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  codeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardCode: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  badge: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  serviceName: { fontSize: 14, fontWeight: '700', color: colors.charcoal, marginVertical: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xs },
  doctorName: { fontSize: 12, color: colors.charcoalMedium },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  dateWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11, color: colors.charcoalMedium },
  detailArrow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailText: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.xs },
  emptyText: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center', lineHeight: 18, marginBottom: spacing.lg, maxWidth: 280 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D3',
  },
  ticketHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.goldDark,
    letterSpacing: 0.5,
  },
  ticketHeaderSub: {
    fontSize: 10,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  ticketCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBody: {
    padding: spacing.md,
  },
  ticketRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C7E6C',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ticketCode: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#F0E6D3',
    marginVertical: spacing.sm,
  },
  ticketField: {
    marginBottom: 10,
  },
  ticketGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  ticketValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
  },
  ticketValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  ticketValueSmall: {
    fontSize: 11,
    color: colors.charcoalMedium,
    lineHeight: 16,
  },
  ticketActions: {
    marginTop: spacing.sm,
    gap: 8,
  },
  waBtn: {
    height: 42,
    backgroundColor: '#25D366',
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 38,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
});
