import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme/colors';

const CHAPTERS = [
  { id: 'bab-1', icon: 'card-outline' as const, title: 'Bab 1: Kartu Member Digital', summary: 'Pahami tingkatan membership, diskon, dan poin reward.', body: 'Kartu pasien digital dapat diakses dari akun Anda. Bronze adalah tingkat awal dengan akses E-Ticket, riwayat perawatan, dan poin standar. Gold dan Platinum memberikan manfaat tambahan seperti diskon, multiplier poin, dan prioritas booking.' },
  { id: 'bab-2', icon: 'calendar-outline' as const, title: 'Bab 2: Booking Perawatan', summary: 'Buat reservasi dengan data akun yang terisi otomatis.', body: 'Buka menu Booking, pilih layanan, dokter, tanggal, dan jam yang tersedia. Periksa kembali data pasien, baca Syarat dan Ketentuan, isi persetujuan tindakan medis, lalu kirim permintaan reservasi.' },
  { id: 'bab-3', icon: 'qr-code-outline' as const, title: 'Bab 3: E-Ticket dan Riwayat', summary: 'Pantau status reservasi dan gunakan tiket saat datang.', body: 'Reservasi baru akan berstatus Menunggu Konfirmasi sampai diproses tim klinik. Setelah dikonfirmasi, E-Ticket dapat dibuka dari riwayat booking dan ditunjukkan saat check-in di klinik.' },
  { id: 'bab-4', icon: 'gift-outline' as const, title: 'Bab 4: Poin Reward', summary: 'Kumpulkan poin dari transaksi dan gunakan untuk voucher.', body: 'Pembayaran yang selesai di kasir dapat menghasilkan poin reward. Periksa saldo di tab Membership, pilih voucher yang tersedia, lalu gunakan tombol Tukar Poin untuk menyimpan kode voucher.' },
  { id: 'bab-5', icon: 'lock-closed-outline' as const, title: 'Bab 5: Profil dan Keamanan', summary: 'Kelola nomor WhatsApp, preferensi kesehatan, dan keamanan akun.', body: 'Pastikan nomor WhatsApp aktif agar menerima informasi reservasi. Anda juga dapat memperbarui data profil, preferensi kesehatan gigi, dan kata sandi dari menu Profil.' },
];

export default function TutorialScreen() {
  const [openId, setOpenId] = useState('bab-1');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Panduan Pasien</Text>
          <Text style={styles.subtitle}>Pelajari fitur dan alur layanan aplikasi</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introIcon}><Ionicons name="book-outline" size={25} color={colors.goldDark} /></View>
          <Text style={styles.introTitle}>Panduan Lengkap Pasien Member</Text>
          <Text style={styles.introText}>Gunakan panduan ini untuk memahami kartu member, booking perawatan, E-Ticket, poin reward, dan pengaturan profil.</Text>
          <TouchableOpacity style={styles.bookingButton} onPress={() => router.push('/booking/new')} activeOpacity={0.8}>
            <Text style={styles.bookingButtonText}>Booking Perawatan</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>{['Member', 'Booking', 'E-Ticket', 'Reward'].map((label, index) => <View style={styles.summaryItem} key={label}><Text style={styles.summaryNumber}>{index + 1}</Text><Text style={styles.summaryLabel}>{label}</Text></View>)}</View>
        {CHAPTERS.map((chapter) => {
          const isOpen = openId === chapter.id;
          return <View key={chapter.id} style={styles.chapter}>
            <TouchableOpacity style={styles.chapterHeader} onPress={() => setOpenId(isOpen ? '' : chapter.id)} activeOpacity={0.75}>
              <View style={styles.chapterIcon}><Ionicons name={chapter.icon} size={20} color={colors.goldDark} /></View>
              <View style={styles.chapterText}><Text style={styles.chapterTitle}>{chapter.title}</Text><Text style={styles.chapterSummary}>{chapter.summary}</Text></View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.goldDark} />
            </TouchableOpacity>
            {isOpen ? <Text style={styles.chapterBody}>{chapter.body}</Text> : null}
          </View>;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.cream }, header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }, backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' }, headerText: { flex: 1 }, title: { fontSize: 19, fontWeight: '800', color: colors.charcoal }, subtitle: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2 }, content: { padding: spacing.md, gap: spacing.md }, intro: { backgroundColor: '#FAF5EA', borderWidth: 1, borderColor: '#EADBBD', borderRadius: radius.xl, padding: spacing.lg }, introIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, introTitle: { fontSize: 20, fontWeight: '800', color: colors.charcoal }, introText: { fontSize: 12, lineHeight: 18, color: colors.charcoalMedium, marginTop: spacing.xs }, bookingButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.gold, borderRadius: radius.lg, paddingVertical: 11, marginTop: spacing.md }, bookingButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm }, summaryItem: { alignItems: 'center', flex: 1, gap: 3 }, summaryNumber: { width: 27, height: 27, borderRadius: 14, textAlign: 'center', textAlignVertical: 'center', backgroundColor: '#FAF5EA', color: colors.goldDark, fontWeight: '800' }, summaryLabel: { fontSize: 10, color: colors.charcoalMedium, fontWeight: '700' }, chapter: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' }, chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm }, chapterIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: '#FAF5EA', alignItems: 'center', justifyContent: 'center' }, chapterText: { flex: 1 }, chapterTitle: { fontSize: 13, lineHeight: 18, fontWeight: '800', color: colors.charcoal }, chapterSummary: { fontSize: 11, lineHeight: 16, color: colors.charcoalMedium, marginTop: 2 }, chapterBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingLeft: 68, fontSize: 12.5, lineHeight: 19, color: colors.charcoalMedium }, });
