import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { consultationService, ConsultationMessage, ConsultationSession } from '@/services/consultationService';
import { colors, spacing, radius, fonts } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultationChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationSession | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await consultationService.getConsultation(id);
      setConsultation(res);
      setMessages(res.messages || []);
      await consultationService.markRead(id);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !id || isSending) return;

    setInputText('');
    setIsSending(true);

    // Optimistic message
    const tempId = Date.now();
    const optimisticMsg: ConsultationMessage = {
      id: tempId,
      consultation_id: Number(id),
      sender_id: user?.id || null,
      sender_role: 'patient',
      body: text,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const sent = await consultationService.sendMessage(id, text);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
      await loadData();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleHandoff = async () => {
    setInputText('Saya ingin berbicara langsung dengan Admin Klinik');
  };

  const isHandedOver = consultation?.notes === 'connected_to_human_admin';

  const renderItem = ({ item }: { item: ConsultationMessage }) => {
    const isPatient = item.sender_role === 'patient';
    const rec = item.attachments?.type === 'ai_recommendation' ? item.attachments : null;
    const isHandoff = item.attachments?.type === 'handoff_confirmed';

    const timeStr = item.created_at
      ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.bubbleWrap, isPatient ? styles.bubbleWrapPatient : styles.bubbleWrapOther]}>
        <View style={[
          styles.bubble,
          isPatient ? styles.bubblePatient : (isHandoff ? styles.bubbleHandoff : styles.bubbleOther),
        ]}>
          {!isPatient && (
            <View style={styles.senderHeader}>
              <Ionicons name="sparkles" size={12} color={colors.gold} />
              <Text style={styles.senderLabel}>
                {isHandoff ? 'Admin Klinik • Sesi Dialihkan' : (isHandedOver ? 'Tim Admin Klinik' : 'AESPI AI Dental Advisor')}
              </Text>
            </View>
          )}

          <Text style={styles.messageText}>{item.body}</Text>

          {/* Interactive Recommendation Card */}
          {rec && (
            <View style={styles.recCard}>
              <View style={styles.recHeader}>
                <Text style={styles.recTag}>⭐ Rekomendasi Klinik</Text>
              </View>
              <Text style={styles.recService}>{rec.service_name}</Text>
              {rec.doctor_name ? (
                <Text style={styles.recDoctor}>🩺 Dokter: {rec.doctor_name}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.recBtn}
                onPress={() => router.push('/(tabs)/booking')}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar" size={14} color="#fff" />
                <Text style={styles.recBtnText}>Booking Layanan Ini</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Handoff Button inside AI bubble */}
          {!isPatient && !isHandedOver && item.attachments?.can_handoff ? (
            <TouchableOpacity style={styles.handoffBtn} onPress={handleHandoff} activeOpacity={0.85}>
              <Ionicons name="person" size={12} color={colors.gold} />
              <Text style={styles.handoffBtnText}>Bicara dengan Admin Langsung</Text>
            </TouchableOpacity>
          ) : null}

          {/* Timestamp */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{timeStr}</Text>
            {isPatient && (
              <Ionicons name="checkmark-done" size={14} color={colors.gold} style={{ marginLeft: 3 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* WhatsApp-Style Dark Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Ionicons name="medkit" size={16} color={colors.gold} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isHandedOver ? 'Admin & Dokter Klinik' : 'AESPI AI Dental Assistant'}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSubtitle}>
              {isHandedOver ? 'Live Chat Terhubung' : 'Konsultasi Interaktif AI'}
            </Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, idx) => String(item.id || idx)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Tulis keluhan atau pertanyaan..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isSending) ? styles.sendBtnDisabled : null]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.85}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2416',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 162, 74, 0.3)',
  },
  backBtn: { padding: 4, marginRight: 6 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(201, 162, 74, 0.15)',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: colors.white },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 5 },
  headerSubtitle: { fontSize: 11, color: '#D4AF37' },
  listContent: { padding: spacing.md, paddingBottom: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubbleWrap: { marginVertical: 4, flexDirection: 'row' },
  bubbleWrapPatient: { justifyContent: 'flex-end' },
  bubbleWrapOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    padding: spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubblePatient: {
    backgroundColor: '#FAF3DF',
    borderWidth: 1,
    borderColor: '#ECD9A8',
    borderTopRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    borderTopLeftRadius: 2,
  },
  bubbleHandoff: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderTopLeftRadius: 2,
  },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  senderLabel: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  messageText: { fontSize: 13, color: '#2C2416', lineHeight: 19 },
  recCard: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FAF5EA',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#EADBBD',
  },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  recTag: { fontSize: 10, fontWeight: '700', color: colors.goldDark, textTransform: 'uppercase' },
  recService: { fontSize: 12, fontWeight: '700', color: '#2C2416' },
  recDoctor: { fontSize: 11, color: '#6B5E4F', marginTop: 2 },
  recBtn: {
    marginTop: 8,
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: radius.md,
    gap: 6,
  },
  recBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  handoffBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EADBBD',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  handoffBtnText: { fontSize: 11, fontWeight: '700', color: colors.goldDark },
  timeRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 10, color: '#8C8272' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EADBBD',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EADBBD',
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2C2416',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});