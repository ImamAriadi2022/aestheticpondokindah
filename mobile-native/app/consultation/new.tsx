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

interface TopicItem {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const TOPIC_ITEMS: TopicItem[] = [
  {
    id: 'Gigi Berlubang / Sakit Berdenyut',
    title: 'Gigi Berlubang & Nyeri',
    desc: 'Rasa sakit berdenyut atau ngilu saat mengunyah makanan',
    icon: 'medkit-outline',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    id: 'Gigi Sensitif / Ngilu Saat Minum Es',
    title: 'Gigi Sensitif & Ngilu',
    desc: 'Sensasi ngilu tajam saat minum dingin, asam, atau manis',
    icon: 'snow-outline',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    id: 'Gusi Berdarah / Radang Gusi',
    title: 'Gusi Berdarah & Radang',
    desc: 'Gusi bengkak, kemerahan, atau berdarah saat sikat gigi',
    icon: 'water-outline',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    id: 'Estetika Gigi / Pemutihan Whitening',
    title: 'Estetika & Whitening',
    desc: 'Pembersihan karang gigi, noda, veneer & pemutihan',
    icon: 'sparkles-outline',
    color: '#C9A24A',
    bg: '#FAF5EA',
  },
  {
    id: 'Pemasangan Behel / Aligner',
    title: 'Behel & Aligner (Ortodonti)',
    desc: 'Perataan susunan gigi & konsultasi kawat gigi transparan',
    icon: 'grid-outline',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    id: 'Pemeriksaan Umum Gigi & Mulut',
    title: 'Pemeriksaan Rutin / Lainnya',
    desc: 'Check-up berkala, bau mulut, atau keluhan gigi lainnya',
    icon: 'search-outline',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

export default function NewConsultationScreen() {
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPIC_ITEMS[0].id);
  const [complaint, setComplaint] = useState('');
  const [painScale, setPainScale] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      Alert.alert('Perhatian', 'Mohon ceritakan gejala atau keluhan yang Anda rasakan secara singkat.');
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
      Alert.alert('Gagal', err?.message || 'Gagal memulai sesi konsultasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPainLevelMeta = (scale: number) => {
    if (scale <= 3) return { label: 'Ringan (Masih bisa beraktivitas)', color: '#10B981', bg: '#D1FAE5' };
    if (scale <= 6) return { label: 'Sedang (Mengganggu kenyamanan)', color: '#D97706', bg: '#FEF3C7' };
    return { label: 'Berat (Sangat nyeri / butuh tindakan)', color: '#DC2626', bg: '#FEE2E2' };
  };

  const painMeta = getPainLevelMeta(painScale);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Mulai Konsultasi Baru</Text>
          <Text style={styles.headerSubtitle}>Ceritakan keluhan Anda ke tim dokter & AI</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Section 1: Pilih Topik Keluhan */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <Text style={styles.sectionHeading}>Pilih Kategori Keluhan</Text>
            </View>
            <Text style={styles.sectionDesc}>Pilih salah satu kondisi yang paling sesuai dengan apa yang Anda rasakan.</Text>

            <View style={styles.topicList}>
              {TOPIC_ITEMS.map((item) => {
                const isSelected = selectedTopic === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.topicCard, isSelected ? styles.topicCardActive : null]}
                    onPress={() => setSelectedTopic(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.topicIconWrap, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View style={styles.topicInfo}>
                      <Text style={[styles.topicTitle, isSelected ? { color: colors.goldDark } : null]}>
                        {item.title}
                      </Text>
                      <Text style={styles.topicDesc} numberOfLines={2}>
                        {item.desc}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected ? styles.radioCircleActive : null]}>
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 2: Detail Keluhan */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <Text style={styles.sectionHeading}>Ceritakan Gejala Anda</Text>
            </View>
            <Text style={styles.sectionDesc}>Tuliskan detail rasa sakit, sejak kapan, atau lokasi gigi yang bermasalah.</Text>

            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                placeholder="Contoh: Gigi geraham bawah kanan sakit berdenyut sejak 2 hari lalu, terutama saat mengunyah makanan keras..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={complaint}
                onChangeText={setComplaint}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{complaint.length} karakter</Text>
            </View>
          </View>

          {/* Section 3: Tingkat Rasa Sakit */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <Text style={styles.sectionHeading}>Skala Rasa Sakit (1 - 10)</Text>
            </View>

            <View style={[styles.painBadge, { backgroundColor: painMeta.bg }]}>
              <Text style={[styles.painBadgeText, { color: painMeta.color }]}>
                Level {painScale} : {painMeta.label}
              </Text>
            </View>

            <View style={styles.painRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = painScale === num;
                const isHigh = num >= 7;
                const isMedium = num >= 4 && num < 7;
                const activeBg = isHigh ? '#DC2626' : isMedium ? '#D97706' : colors.gold;

                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.painBtn,
                      isSelected ? { backgroundColor: activeBg, borderColor: activeBg } : null,
                    ]}
                    onPress={() => setPainScale(num)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.painBtnText, isSelected ? { color: '#fff', fontWeight: '800' } : null]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading ? { opacity: 0.7 } : null]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Kirim & Buka Ruang Konsultasi</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  headerSubtitle: { fontSize: 11, color: colors.charcoalMedium, marginTop: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  sectionDesc: { fontSize: 12, color: colors.charcoalMedium, lineHeight: 18, marginBottom: spacing.md },
  topicList: { gap: spacing.sm },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderRadius: radius.lg,
    padding: 12,
    gap: 12,
  },
  topicCardActive: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  topicIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicInfo: { flex: 1 },
  topicTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  topicDesc: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2, lineHeight: 16 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: colors.gold },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  textAreaWrap: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  textArea: {
    fontSize: 13,
    color: colors.charcoal,
    minHeight: 90,
    lineHeight: 20,
  },
  charCount: { fontSize: 10, color: colors.charcoalMedium, textAlign: 'right', marginTop: 4 },
  painBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  painBadgeText: { fontSize: 12, fontWeight: '700' },
  painRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  painBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  painBtnText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
