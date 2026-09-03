import { apiClient } from '@/services/apiClient';
import { colors, radius, spacing } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
  category?: string | null;
}

export default function FaqScreen() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<any>('/public/faqs', { skipAuth: true })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.faqs || []);
        setItems(list);
      })
      .catch((err: any) => setError(err?.message || 'FAQ belum dapat dimuat.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Panduan FAQ</Text>
          <Text style={styles.subtitle}>Jawaban untuk pertanyaan umum pasien</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? <ActivityIndicator color={colors.gold} size="large" /> : null}
        {!isLoading && error ? <Text style={styles.feedback}>{error}</Text> : null}
        {!isLoading && !error && items.length === 0 ? <Text style={styles.feedback}>Belum ada panduan FAQ yang tersedia.</Text> : null}
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity style={styles.questionRow} onPress={() => setOpenId(isOpen ? null : item.id)} activeOpacity={0.75}>
                <View style={styles.questionIcon}><Ionicons name="help" size={16} color={colors.goldDark} /></View>
                <Text style={styles.question}>{item.question}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={17} color={colors.charcoalMedium} />
              </TouchableOpacity>
              {isOpen ? <Text style={styles.answer}>{item.answer}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 19, fontWeight: '800', color: colors.charcoal },
  subtitle: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2 },
  content: { padding: spacing.md, gap: spacing.sm },
  faqItem: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  questionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  questionIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' },
  question: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700', color: colors.charcoal },
  answer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingLeft: 54, fontSize: 12.5, lineHeight: 19, color: colors.charcoalMedium },
  feedback: { textAlign: 'center', color: colors.charcoalMedium, fontSize: 12, paddingVertical: spacing.xl },
});
