import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { colors, radius, spacing } from '@/theme/colors';

type FormErrors = Partial<Record<'name' | 'phone' | 'complaint' | 'date' | 'general', string>>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export default function NewBookingScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [complaint, setComplaint] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minimumDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Nama wajib diisi.';
    if (!phone.trim()) next.phone = 'Nomor telepon wajib diisi.';
    else if (phone.replace(/\D/g, '').length < 9) next.phone = 'Nomor telepon tidak valid.';
    if (!complaint.trim()) next.complaint = 'Keluhan atau kebutuhan layanan wajib diisi.';
    if (date && (!datePattern.test(date) || date < minimumDate)) {
      next.date = `Gunakan tanggal ${minimumDate} atau setelahnya (YYYY-MM-DD).`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await bookingService.createReservation({
        complaint: complaint.trim(),
        date: date || null,
      });
      Alert.alert(
        'Permintaan booking terkirim',
        `Nomor permintaan Anda: ${result.reservation.code}. Tim klinik akan menghubungi Anda untuk konfirmasi jadwal.`,
        [{ text: 'Selesai', onPress: () => router.replace('/(tabs)/booking') }],
      );
    } catch (error: any) {
      const serverErrors = error?.errors as Record<string, string[]> | undefined;
      setErrors({
        general: error?.message ?? 'Booking tidak dapat dikirim. Silakan coba lagi.',
        name: serverErrors?.name?.[0],
        phone: serverErrors?.phone?.[0],
        complaint: serverErrors?.complaint?.[0],
        date: serverErrors?.date?.[0],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Buat Janji Temu</Text>
          <Text style={styles.subtitle}>Isi data berikut. Tim klinik akan mengonfirmasi jadwal Anda.</Text>

          {errors.general ? <Text style={styles.errorBanner}>{errors.general}</Text> : null}

          <Field label="Nama Lengkap" value={name} onChangeText={(v) => setName(v)} error={errors.name} autoComplete="name" />
          <Field label="Nomor Telepon" value={phone} onChangeText={(v) => setPhone(v)} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" />
          <Field label="Keluhan / Layanan yang Dibutuhkan" value={complaint} onChangeText={(v) => setComplaint(v)} error={errors.complaint} multiline placeholder="Contoh: konsultasi dan scaling" />
          <Field label="Tanggal yang Diinginkan (opsional)" value={date} onChangeText={(v) => setDate(v)} error={errors.date} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />

          <Text style={styles.note}>Jadwal dan dokter akan dikonfirmasi oleh tim Aesthetic Pondok Indah.</Text>
          <TouchableOpacity style={[styles.submit, isSubmitting && styles.disabled]} onPress={submit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Kirim Permintaan Booking</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, error, ...input }: { label: string; error?: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...input} style={[styles.input, input.multiline && styles.textarea, error && styles.inputError]} placeholderTextColor={colors.muted} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, flex: { flex: 1 }, scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal }, subtitle: { fontSize: 13, color: colors.charcoalMedium, marginTop: 4, marginBottom: spacing.lg, lineHeight: 19 },
  field: { marginBottom: spacing.md }, label: { fontSize: 12, fontWeight: '700', color: colors.charcoalMedium, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .4 },
  input: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, color: colors.charcoal, fontSize: 15, padding: spacing.sm + 4 }, textarea: { height: 104, textAlignVertical: 'top' }, inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 12, marginTop: 4 }, errorBanner: { color: colors.error, backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, fontSize: 13 },
  note: { color: colors.charcoalMedium, fontSize: 12, lineHeight: 18, marginBottom: spacing.md }, submit: { backgroundColor: colors.gold, borderRadius: radius.full, alignItems: 'center', padding: spacing.md + 2 }, disabled: { opacity: .7 }, submitText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
