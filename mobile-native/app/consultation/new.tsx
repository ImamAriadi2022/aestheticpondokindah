import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { consultationService } from '@/services/consultationService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const TOPIC_OPTIONS = [
  'Gusi Berdarah / Radang Gusi',
  'Gigi Sensitif / Ngilu Saat Minum Es',
  'Gigi Berlubang / Sakit Berdenyut',
  'Bau Mulut (Halitosis)',
  'Gigi Goyang / Masalah Penyangga',
  'Gigi Bungsu / Impaksi Geraham',
  'Estetika Gigi / Pemutihan Whitening',
  'Pemasangan Behel / Aligner',
  'Pemeriksaan Umum Gigi & Mulut',
];

export default function NewConsultationScreen() {
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_OPTIONS[0]);
  const [complaint, setComplaint] = useState('');
  const [painScale, setPainScale] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      Alert.alert('Perhatian', 'Mohon jelaskan gejala atau keluhan yang Anda rasakan.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await consultationService.createConsultation({
        topic: selectedTopic,
        chief_complaint: complaint.trim(),
        pain_scale: painScale,
      });

      router.replace({ pathname: '/consultation/[id]', params: { id: res.id } });
    } catch (err: any) {
      Alert.alert('Gagal', err?.message || 'Gagal memulai sesi konsultasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mulai Konsultasi Baru</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pilih Topik Keluhan</Text>
            <View style={styles.chipGrid}>
              {TOPIC_OPTIONS.map((item) => {
                const isSelected = selectedTopic === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected ? styles.chipSelected : null]}
                    onPress={() => setSelectedTopic(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Complaint details */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Ceritakan Keluhan Anda</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Jelaskan detail rasa sakit, sudah berapa lama, atau bagian gigi mana yang bermasalah..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              value={complaint}
              onChangeText={setComplaint}
            />

            {/* Pain Scale */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Tingkat Rasa Sakit (0 - 10)</Text>
            <View style={styles.painScaleRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = painScale === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[styles.painBtn, isSelected ? styles.painBtnSelected : null]}
                    onPress={() => setPainScale(num)}
                  >
                    <Text style={[styles.painBtnText, isSelected ? styles.painBtnTextSelected : null]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.painHint}>
              Skala {painScale}: {painScale <= 3 ? 'Ringan' : painScale <= 6 ? 'Sedang' : 'Berat / Mengganggu'}
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading ? styles.submitBtnDisabled : null]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="chatbubbles" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Mulai Chat Konsultasi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { padding: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
  },
  chipText: { fontSize: 11, color: colors.charcoalMedium },
  chipTextSelected: { color: colors.goldDark, fontWeight: '700' },
  textArea: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 13,
    color: colors.charcoal,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  painScaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  painBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painBtnSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  painBtnText: { fontSize: 11, fontWeight: '700', color: colors.charcoal },
  painBtnTextSelected: { color: '#fff' },
  painHint: { fontSize: 11, color: colors.goldDark, marginTop: 6, fontWeight: '600' },
  submitBtn: {
    marginTop: 20,
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});