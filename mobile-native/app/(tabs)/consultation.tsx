import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { consultationService, ConsultationSession } from '@/services/consultationService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultationTabScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async (force = false) => {
    try {
      const res = await consultationService.getConsultations(force);
      setSessions(res || []);
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
    await loadData(true);
    setIsRefreshing(false);
  }, [loadData]);

  const activeConsultations = useMemo(() => {
    return sessions.filter((s) => ['Menunggu', 'Dibuka', 'Dijadwalkan'].includes(s.status));
  }, [sessions]);

  const completedConsultations = useMemo(() => {
    return sessions.filter((s) => ['Selesai', 'Ditolak'].includes(s.status));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let list = sessions;
    if (filterTab === 'active') list = activeConsultations;
    if (filterTab === 'completed') list = completedConsultations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        (c.topic && c.topic.toLowerCase().includes(q)) ||
        (c.chief_complaint && c.chief_complaint.toLowerCase().includes(q)) ||
        (c.doctor_name && c.doctor_name.toLowerCase().includes(q)) ||
        (c.status && c.status.toLowerCase().includes(q))
      );
    }
    return list;
  }, [sessions, filterTab, activeConsultations, completedConsultations, searchQuery]);

  const renderHeader = () => (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      {/* 1. FILTER TABS (PARITY WITH WEB) */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'all' ? styles.filterPillActive : null]}
          onPress={() => setFilterTab('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filterTab === 'all' ? styles.filterPillTextActive : null]}>
            Semua ({sessions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'active' ? styles.filterPillActive : null]}
          onPress={() => setFilterTab('active')}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={13} color={filterTab === 'active' ? '#fff' : '#D97706'} />
          <Text style={[styles.filterPillText, filterTab === 'active' ? styles.filterPillTextActive : null]}>
            Berjalan ({activeConsultations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'completed' ? styles.filterPillActive : null]}
          onPress={() => setFilterTab('completed')}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={13} color={filterTab === 'completed' ? '#fff' : '#059669'} />
          <Text style={[styles.filterPillText, filterTab === 'completed' ? styles.filterPillTextActive : null]}>
            Selesai ({completedConsultations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. SEARCH BAR */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.charcoalMedium} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari topik atau dokter..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ConsultationSession }) => {
    const isCompleted = item.status === 'Selesai';
    const isRejected = item.status === 'Ditolak';
    const dateStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : (item.date || 'Hari ini');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/consultation/[id]', params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.goldDark} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.topic} numberOfLines={1}>{item.topic || 'Konsultasi Gigi'}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={11} color={colors.charcoalMedium} />
              <Text style={styles.date}>{dateStr}</Text>
            </View>
          </View>
          <View style={[
            styles.badge,
            isCompleted ? styles.badgeSuccess : isRejected ? styles.badgeRejected : styles.badgeActive,
          ]}>
            <Text style={[
              styles.badgeText,
              isCompleted ? styles.badgeTextSuccess : isRejected ? styles.badgeTextRejected : styles.badgeTextActive,
            ]}>
              {item.status || 'Aktif'}
            </Text>
          </View>
        </View>

        <Text style={styles.complaint} numberOfLines={2}>
          {item.chief_complaint || 'Tidak ada catatan keluhan tambahan.'}
        </Text>

        {item.doctor_name ? (
          <View style={styles.doctorInfoRow}>
            <Ionicons name="medkit-outline" size={12} color={colors.goldDark} />
            <Text style={styles.doctorInfoText} numberOfLines={1}>
              Dokter: <Text style={{ fontWeight: '700' }}>drg. {item.doctor_name}</Text>
            </Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.ticketIdText}>ID: #{String(item.id).padStart(5, '0')}</Text>
          <View style={styles.chatAction}>
            <Text style={styles.actionText}>{isCompleted ? 'Lihat Percakapan' : 'Buka Chat'}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.goldDark} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.goldDark} />
      </View>
      <Text style={styles.emptyTitle}>
        {filterTab === 'completed'
          ? 'Belum Ada Konsultasi Selesai'
          : filterTab === 'active'
          ? 'Tidak Ada Konsultasi Berjalan'
          : 'Belum Ada Sesi Konsultasi'}
      </Text>
      <Text style={styles.emptySub}>
        Konsultasikan keluhan gigi Anda langsung dengan tim dokter spesialis secara online atau tanya Zesta AI 24/7.
      </Text>
      <TouchableOpacity
        style={styles.emptyActionBtn}
        onPress={() => router.push('/consultation/new')}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text style={styles.emptyActionBtnText}>Mulai Konsultasi Baru</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* COMPACT & BALANCED TOP HEADER (PARITY WITH BOOKING HEADER) */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>Konsultasi Gigi</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>Tanya dokter spesialis & AI assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/consultation/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.newBtnText}>Konsultasi Baru</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.gold]}
              tintColor={colors.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.charcoal,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    gap: 4,
    flexShrink: 0,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoalMedium,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  cardInfo: {
    flex: 1,
  },
  topic: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.charcoal,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  date: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeActive: {
    backgroundColor: '#FEF3C7',
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#D97706',
  },
  badgeTextSuccess: {
    color: '#059669',
  },
  badgeTextRejected: {
    color: '#DC2626',
  },
  complaint: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
    lineHeight: 16,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCFAF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  doctorInfoText: {
    fontSize: 11,
    color: colors.charcoalMedium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  ticketIdText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  chatAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.goldDark,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
    gap: 6,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.charcoal,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.xl,
    marginTop: 8,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
