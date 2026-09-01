import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { doctorService } from '@/services/doctorService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorConsultationsScreen() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await doctorService.getConsultations();
      setConsultations(res);
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

  const renderItem = ({ item }: { item: any }) => {
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
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.goldDark} />
          </View>
          <View style={styles.info}>
            <Text style={styles.patientName}>{item.participant_name || item.patient_name || 'Pasien Klinik'}</Text>
            <Text style={styles.topicText}>{item.topic || 'Keluhan Sakit Gigi'}</Text>
          </View>
          <View style={[styles.badge, isCompleted ? styles.badgeSuccess : styles.badgeActive]}>
            <Text style={[styles.badgeText, isCompleted ? styles.badgeTextSuccess : styles.badgeTextActive]}>
              {item.status || 'Aktif'}
            </Text>
          </View>
        </View>

        <Text style={styles.complaintText} numberOfLines={2}>
          {item.chief_complaint || 'Tidak ada catatan keluhan.'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Masuk: {dateStr}</Text>
          <View style={styles.replyBtn}>
            <Text style={styles.replyBtnText}>Buka Chat & Respon</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.gold} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Konsultasi Pasien Masuk</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={consultations}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.gold} />
              <Text style={styles.emptyTitle}>Tidak Ada Konsultasi Masuk</Text>
              <Text style={styles.emptySubtitle}>Pertanyaan dan keluhan pasien yang dialihkan ke dokter akan muncul di sini.</Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
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
  info: { flex: 1 },
  patientName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  topicText: { fontSize: 12, color: colors.goldDark, marginTop: 1, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
  badgeActive: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  badgeSuccess: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextActive: { color: '#92400E' },
  badgeTextSuccess: { color: '#065F46' },
  complaintText: { fontSize: 12, color: colors.charcoalMedium, lineHeight: 17, marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  dateText: { fontSize: 11, color: colors.muted },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyBtnText: { fontSize: 11, fontWeight: '700', color: colors.gold },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: 32 },
});