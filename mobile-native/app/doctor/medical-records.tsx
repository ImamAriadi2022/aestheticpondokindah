import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doctorService, MedicalRecord } from '@/services/doctorService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorMedicalRecordsScreen() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await doctorService.getMedicalRecords();
      setRecords(res);
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

  const renderItem = ({ item }: { item: MedicalRecord }) => {
    const dateStr = item.visit_date || item.created_at
      ? new Date(item.visit_date || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color={colors.goldDark} />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{item.patient_name || 'Nama Pasien'}</Text>
            <Text style={styles.dateText}>Tanggal Kunjungan: {dateStr}</Text>
          </View>
        </View>

        {/* Diagnosis & Treatment */}
        {item.diagnosis ? (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>🩺 Diagnosis Medis:</Text>
            <Text style={styles.sectionValue}>{item.diagnosis}</Text>
          </View>
        ) : null}

        {item.treatment ? (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>⚡ Tindakan Klinis:</Text>
            <Text style={styles.sectionValue}>{item.treatment}</Text>
          </View>
        ) : null}

        {/* SOAP Notes */}
        {item.soap ? (
          <View style={styles.soapContainer}>
            <Text style={styles.soapTitle}>📋 Catatan Pemeriksaan SOAP:</Text>
            {item.soap.subjective ? <Text style={styles.soapText}>• S (Keluhan): {item.soap.subjective}</Text> : null}
            {item.soap.objective ? <Text style={styles.soapText}>• O (Objektif): {item.soap.objective}</Text> : null}
            {item.soap.assessment ? <Text style={styles.soapText}>• A (Penilaian): {item.soap.assessment}</Text> : null}
            {item.soap.plan ? <Text style={styles.soapText}>• P (Rencana Tindakan): {item.soap.plan}</Text> : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rekam Medis Pasien (EMR)</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="document-text-outline" size={48} color={colors.gold} />
              <Text style={styles.emptyTitle}>Belum Ada Rekam Medis</Text>
              <Text style={styles.emptySubtitle}>Data rekam medis SOAP dan odontogram pasien yang telah Anda periksa akan muncul di sini.</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
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
  patientInfo: { flex: 1 },
  patientName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  dateText: { fontSize: 11, color: colors.muted, marginTop: 1 },
  sectionWrap: { marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  sectionValue: { fontSize: 12, color: colors.charcoal, marginTop: 2 },
  soapContainer: {
    marginTop: 6,
    padding: 10,
    backgroundColor: '#FAF8F5',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F0EAE1',
  },
  soapTitle: { fontSize: 11, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  soapText: { fontSize: 11, color: colors.charcoalMedium, lineHeight: 16 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: 32 },
});