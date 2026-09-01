import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { consultationService, ConsultationSession } from '@/services/consultationService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultationListScreen() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await consultationService.getConsultations();
      setSessions(res);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const renderItem = ({ item }: { item: ConsultationSession }) => {
    const isCompleted = item.status === 'Selesai';
    const dateStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/consultation/[id]', params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Ionicons name="chatbubbles" size={18} color={colors.gold} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.topic} numberOfLines={1}>{item.topic || 'Konsultasi Kesehatan Gigi'}</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={[styles.badge, isCompleted ? styles.badgeSuccess : styles.badgeActive]}>
            <Text style={[styles.badgeText, isCompleted ? styles.badgeTextSuccess : styles.badgeTextActive]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.complaint} numberOfLines={2}>
          {item.chief_complaint || 'Tidak ada catatan keluhan.'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.actionText}>Buka Percakapan Chat</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.gold} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konsultasi Gigi Online</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/consultation/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubbles-outline" size={40} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Belum Ada Konsultasi</Text>
              <Text style={styles.emptySubtitle}>Mulai tanya keluhan gigi Anda sekarang. Didampingi AI dan dokter spesialis.</Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push('/consultation/new')}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.startBtnText}>Mulai Konsultasi Baru</Text>
              </TouchableOpacity>
            </View>
          }
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
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  newBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardInfo: { flex: 1 },
  topic: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  date: { fontSize: 11, color: colors.muted, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
  badgeActive: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  badgeSuccess: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextActive: { color: '#92400E' },
  badgeTextSuccess: { color: '#065F46' },
  complaint: { fontSize: 12, color: colors.charcoalMedium, lineHeight: 17, marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  actionText: { fontSize: 11, fontWeight: '700', color: colors.gold },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: 6 },
  emptySubtitle: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.full,
    gap: 8,
  },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});