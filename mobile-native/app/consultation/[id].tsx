import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { consultationService, ConsultationMessage, ConsultationSession } from '@/services/consultationService';
import { colors, spacing, radius } from '@/theme/colors';
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

  const isClosed = consultation?.status === 'Selesai' || consultation?.status === 'Ditolak';

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !id || isSending || isClosed) return;

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
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId && m.id !== sent.id);
        return [...withoutTemp, sent];
      });
      // Poll slightly later for the AI assistant reply without overwriting optimistic state
      setTimeout(() => {
        loadData();
      }, 1200);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenMeeting = (url: string) => {
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: ConsultationMessage }) => {
    const role = item.sender_role || (item as any).senderRole;
    const isPatient = role === 'patient' || (user?.id && (String(item.sender_id) === String(user.id) || String((item as any).senderId) === String(user.id)));
    const isDoctor = role === 'doctor';
    const rec = item.attachments?.type === 'ai_recommendation' ? item.attachments : null;

    const createdAtVal = item.created_at || (item as any).createdAt;
    const timeStr = createdAtVal
      ? new Date(createdAtVal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.bubbleWrap, isPatient ? styles.bubbleWrapPatient : styles.bubbleWrapOther]}>
        <View style={[
          styles.bubble,
          isPatient ? styles.bubblePatient : (isDoctor ? styles.bubbleDoctor : styles.bubbleOther),
        ]}>
          {!isPatient && (
            <View style={styles.senderHeader}>
              <Ionicons name={isDoctor ? 'medkit' : 'sparkles'} size={12} color={colors.goldDark} />
              <Text style={styles.senderLabel}>
                {isDoctor ? (`drg. ${consultation?.doctor_name || 'Dokter Spesialis'}`) : 'AESPI AI Dental Assistant'}
              </Text>
            </View>
          )}

          <Text style={[styles.messageText, isPatient ? { color: '#FFFFFF' } : null]}>
            {item.body}
          </Text>

          {/* Interactive Recommendation Card */}
          {rec && (
            <View style={styles.recCard}>
              <View style={styles.recHeader}>
                <Text style={styles.recTag}>⭐ Rekomendasi Perawatan</Text>
              </View>
              <Text style={styles.recService}>{rec.service_name}</Text>
              {rec.doctor_name ? (
                <Text style={styles.recDoctor}>🩺 Dokter: {rec.doctor_name}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.recBtn}
                onPress={() => router.push('/booking/new')}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar" size={13} color="#fff" />
                <Text style={styles.recBtnText}>Buat Janji Temu</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Timestamp */}
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, isPatient ? { color: 'rgba(255,255,255,0.75)' } : null]}>
              {timeStr}
            </Text>
            {isPatient && (
              <Ionicons name="checkmark-done" size={13} color="#FFFFFF" style={{ marginLeft: 3 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          <Ionicons name="chatbubbles" size={16} color={colors.goldDark} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {consultation?.doctor_name ? `drg. ${consultation.doctor_name}` : (consultation?.topic || 'Konsultasi Gigi')}
          </Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              isClosed ? styles.statusDotClosed : styles.statusDotActive,
            ]} />
            <Text style={styles.headerSubtitle}>
              {consultation?.status || 'Aktif'} · {consultation?.category || 'Umum'}
            </Text>
          </View>
        </View>
      </View>

      {/* Video Meeting Banner if Scheduled */}
      {consultation?.meetings && consultation.meetings.length > 0 && (
        <View style={styles.meetingBanner}>
          <Ionicons name="videocam" size={18} color="#059669" />
          <View style={{ flex: 1 }}>
            <Text style={styles.meetingTitle}>Sesi Video Call Terjadwal</Text>
            <Text style={styles.meetingSub}>{consultation.meetings[0].start_time}</Text>
          </View>
          <TouchableOpacity
            style={styles.meetingBtn}
            onPress={() => handleOpenMeeting(consultation.meetings![0].meeting_url)}
            activeOpacity={0.85}
          >
            <Text style={styles.meetingBtnText}>Masuk Room</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Closed Notice if Finished */}
      {isClosed && (
        <View style={styles.closedNotice}>
          <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />
          <Text style={styles.closedNoticeText}>
            Sesi konsultasi ini telah ditutup ({consultation?.status}). Anda dapat melihat riwayat pesan di bawah.
          </Text>
        </View>
      )}

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
        {!isClosed ? (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Tulis balasan pesan..."
              placeholderTextColor="#9CA3AF"
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
                <Ionicons name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.charcoal,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotClosed: {
    backgroundColor: '#9CA3AF',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
  },
  meetingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    gap: spacing.sm,
  },
  meetingTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  meetingSub: {
    fontSize: 10,
    color: '#047857',
  },
  meetingBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  meetingBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  closedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closedNoticeText: {
    fontSize: 10.5,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  bubbleWrap: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  bubbleWrapPatient: {
    justifyContent: 'flex-end',
  },
  bubbleWrapOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubblePatient: {
    backgroundColor: colors.gold,
    borderBottomRightRadius: 4,
  },
  bubbleDoctor: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderBottomLeftRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderBottomLeftRadius: 4,
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  senderLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.goldDark,
  },
  messageText: {
    fontSize: 13,
    color: colors.charcoal,
    lineHeight: 18,
  },
  recCard: {
    backgroundColor: '#FAF5EA',
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EADBBD',
    gap: 4,
  },
  recHeader: {
    flexDirection: 'row',
  },
  recTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.goldDark,
  },
  recService: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  recDoctor: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
  },
  recBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    paddingVertical: 6,
    borderRadius: radius.md,
    gap: 4,
    marginTop: 4,
  },
  recBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 9.5,
    color: colors.charcoalMedium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.charcoal,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D1C4A5',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
