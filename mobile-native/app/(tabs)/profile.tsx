import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  Modal, TextInput, ActivityIndicator, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { userService, UserProfileData } from '@/services/userService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];
const BLOOD_OPTIONS = ['A', 'B', 'AB', 'O', 'Tidak Tahu'];

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Laki-laki',
    birthDate: '',
    bloodType: 'Tidak Tahu',
    job: '',
    address: '',
    city: '',
    isCoffeeDrinker: false,
    isSmoker: false,
  });

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const data = await userService.getProfile();
      if (data) {
        setProfileData(data);
        populateForm(data);
      }
    } catch {
      // fallback to auth user
      if (user) populateForm(user as any);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const populateForm = (data: any) => {
    setEditForm({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || data.whatsapp || '',
      gender: data.gender || 'Laki-laki',
      birthDate: data.birthDate || data.birth_date || '',
      bloodType: data.bloodType || data.blood_type || 'Tidak Tahu',
      job: data.job || data.occupation || '',
      address: data.address || data.address_line || '',
      city: data.city || '',
      isCoffeeDrinker: Boolean(data.isCoffeeDrinker ?? data.is_coffee_drinker),
      isSmoker: Boolean(data.isSmoker ?? data.is_smoker),
    });
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleOpenEdit = () => {
    if (profileData) populateForm(profileData);
    else if (user) populateForm(user as any);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Perhatian', 'Nama lengkap wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        gender: editForm.gender,
        birthDate: editForm.birthDate.trim(),
        bloodType: editForm.bloodType,
        job: editForm.job.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        isCoffeeDrinker: editForm.isCoffeeDrinker,
        isSmoker: editForm.isSmoker,
      });

      await refreshUser();
      await loadProfile();
      setIsEditModalOpen(false);
      Alert.alert('Berhasil', 'Data profil Anda telah berhasil diperbarui.');
    } catch (err: any) {
      Alert.alert('Gagal', err?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passForm.current_password || !passForm.new_password) {
      Alert.alert('Perhatian', 'Semua kolom kata sandi wajib diisi.');
      return;
    }
    if (passForm.new_password.length < 6) {
      Alert.alert('Perhatian', 'Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (passForm.new_password !== passForm.confirm_password) {
      Alert.alert('Perhatian', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsChangingPass(true);
    try {
      await userService.changePassword({
        current_password: passForm.current_password,
        new_password: passForm.new_password,
        new_password_confirmation: passForm.confirm_password,
      });
      setIsPasswordModalOpen(false);
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
      Alert.alert('Berhasil', 'Kata sandi Anda berhasil diperbarui.');
    } catch (err: any) {
      Alert.alert('Gagal', err?.message || 'Gagal mengubah kata sandi. Pastikan kata sandi lama benar.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL('https://wa.me/6281990114949?text=Halo%20Admin%20Aesthetic%20Pondok%20Indah,%20saya%20ingin%20bertanya%20seputar%20layanan%20klinik.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const activeUser = profileData || (user as any);
  const tier = (activeUser?.membership_level ?? 'bronze').toUpperCase();
  const roleLabel = activeUser?.role === 'doctor' ? 'Dokter Spesialis' : activeUser?.role === 'clinic_admin' ? 'Administrator' : 'Pasien Terdaftar';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Profil Pasien</Text>
          <Text style={styles.subtitle}>Informasi data pribadi & rekam medis klinik</Text>
        </View>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={handleOpenEdit} activeOpacity={0.85}>
          <Ionicons name="pencil-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.editHeaderBtnText}>Edit Profil</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card Summary */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{activeUser?.name?.[0]?.toUpperCase() ?? 'P'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{activeUser?.name ?? 'Pasien'}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={13} color={colors.charcoalMedium} />
              <Text style={styles.profileMeta}>{activeUser?.phone || activeUser?.whatsapp || '-'}</Text>
            </View>
            {activeUser?.email ? (
              <View style={styles.metaRow}>
                <Ionicons name="mail-outline" size={13} color={colors.charcoalMedium} />
                <Text style={styles.profileMeta} numberOfLines={1}>{activeUser.email}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.roleBadge}>
            <Ionicons
              name={activeUser?.role === 'doctor' ? 'medkit' : activeUser?.role === 'clinic_admin' ? 'shield-checkmark' : 'person'}
              size={12}
              color={colors.goldDark}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* 1. INFORMASI DATA DIRI PASIEN (Attributes from Website) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="id-card-outline" size={18} color={colors.goldDark} />
              <Text style={styles.sectionTitle}>Data Pribadi Pasien</Text>
            </View>
            <TouchableOpacity onPress={handleOpenEdit} activeOpacity={0.7}>
              <Text style={styles.sectionEditLink}>Ubah</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attributeList}>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Nama Lengkap</Text>
              <Text style={styles.attributeValue}>{activeUser?.name || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Email</Text>
              <Text style={styles.attributeValue}>{activeUser?.email || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>No. WhatsApp</Text>
              <Text style={styles.attributeValue}>{activeUser?.phone || activeUser?.whatsapp || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Jenis Kelamin</Text>
              <Text style={styles.attributeValue}>{activeUser?.gender || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Tanggal Lahir</Text>
              <Text style={styles.attributeValue}>{activeUser?.birthDate || activeUser?.birth_date || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Golongan Darah</Text>
              <Text style={styles.attributeValue}>{activeUser?.bloodType || activeUser?.blood_type || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Pekerjaan</Text>
              <Text style={styles.attributeValue}>{activeUser?.job || activeUser?.occupation || '-'}</Text>
            </View>
            <View style={[styles.attributeRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.attributeLabel}>Alamat Domisili</Text>
              <Text style={[styles.attributeValue, { flex: 1, textAlign: 'right' }]}>
                {activeUser?.address || activeUser?.address_line || activeUser?.city ? `${activeUser?.address || activeUser?.address_line || ''} ${activeUser?.city || ''}`.trim() : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. REKAM KEBIASAAN PASIEN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="fitness-outline" size={18} color="#059669" />
            <Text style={styles.sectionTitle}>Kebiasaan & Gaya Hidup Gigi</Text>
          </View>

          <View style={styles.habitGrid}>
            <View style={styles.habitItem}>
              <View style={[styles.habitIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cafe-outline" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.habitTitle}>Konsumsi Kopi / Teh</Text>
                <Text style={styles.habitStatus}>
                  {Boolean(activeUser?.isCoffeeDrinker ?? activeUser?.is_coffee_drinker) ? 'Ya, Rutin' : 'Tidak Rutin'}
                </Text>
              </View>
            </View>

            <View style={styles.habitItem}>
              <View style={[styles.habitIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="flame-outline" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.habitTitle}>Riwayat Merokok</Text>
                <Text style={styles.habitStatus}>
                  {Boolean(activeUser?.isSmoker ?? activeUser?.is_smoker) ? 'Ya (Perokok)' : 'Tidak Merokok'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. PENGATURAN AKUN & BANTUAN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="settings-outline" size={18} color={colors.charcoal} />
            <Text style={styles.sectionTitle}>Pengaturan & Bantuan</Text>
          </View>

          <TouchableOpacity style={styles.actionMenuRow} onPress={() => setIsPasswordModalOpen(true)} activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionMenuTitle}>Ubah Kata Sandi</Text>
              <Text style={styles.actionMenuDesc}>Amankan akun Anda dengan kata sandi baru</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.charcoalMedium} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionMenuRow} onPress={handleOpenWhatsApp} activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="logo-whatsapp" size={18} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionMenuTitle}>Customer Care WhatsApp</Text>
              <Text style={styles.actionMenuDesc}>Hubungi staf front office klinik resmi</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.charcoalMedium} />
          </TouchableOpacity>
        </View>

        {/* 4. LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: EDIT PROFIL */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil Pasien</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
              {/* Nama Lengkap */}
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm((p) => ({ ...p, name: text }))}
                placeholder="Nama Lengkap Pasien"
                placeholderTextColor="#9CA3AF"
              />

              {/* Email */}
              <Text style={styles.inputLabel}>Alamat Email</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm((p) => ({ ...p, email: text }))}
                placeholder="nama@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              {/* Nomor WhatsApp */}
              <Text style={styles.inputLabel}>No. WhatsApp / HP</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.phone}
                onChangeText={(text) => setEditForm((p) => ({ ...p, phone: text }))}
                placeholder="08123456789"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />

              {/* Jenis Kelamin */}
              <Text style={styles.inputLabel}>Jenis Kelamin</Text>
              <View style={styles.radioGroup}>
                {GENDER_OPTIONS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.radioPill, editForm.gender === g ? styles.radioPillActive : null]}
                    onPress={() => setEditForm((p) => ({ ...p, gender: g }))}
                  >
                    <Text style={[styles.radioPillText, editForm.gender === g ? styles.radioPillTextActive : null]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tanggal Lahir */}
              <Text style={styles.inputLabel}>Tanggal Lahir (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.birthDate}
                onChangeText={(text) => setEditForm((p) => ({ ...p, birthDate: text }))}
                placeholder="Contoh: 1995-08-17"
                placeholderTextColor="#9CA3AF"
              />

              {/* Golongan Darah */}
              <Text style={styles.inputLabel}>Golongan Darah</Text>
              <View style={styles.radioGroup}>
                {BLOOD_OPTIONS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.radioPill, editForm.bloodType === b ? styles.radioPillActive : null]}
                    onPress={() => setEditForm((p) => ({ ...p, bloodType: b }))}
                  >
                    <Text style={[styles.radioPillText, editForm.bloodType === b ? styles.radioPillTextActive : null]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pekerjaan */}
              <Text style={styles.inputLabel}>Pekerjaan</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.job}
                onChangeText={(text) => setEditForm((p) => ({ ...p, job: text }))}
                placeholder="Pekerjaan / Profesi"
                placeholderTextColor="#9CA3AF"
              />

              {/* Alamat */}
              <Text style={styles.inputLabel}>Alamat Domisili</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 60 }]}
                value={editForm.address}
                onChangeText={(text) => setEditForm((p) => ({ ...p, address: text }))}
                placeholder="Alamat jalan, nomor rumah, RT/RW..."
                multiline
                placeholderTextColor="#9CA3AF"
              />

              {/* Kota */}
              <Text style={styles.inputLabel}>Kota / Kabupaten</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.city}
                onChangeText={(text) => setEditForm((p) => ({ ...p, city: text }))}
                placeholder="Contoh: Jakarta Selatan"
                placeholderTextColor="#9CA3AF"
              />

              {/* Kebiasaan */}
              <Text style={styles.inputLabel}>Kebiasaan Konsumsi</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setEditForm((p) => ({ ...p, isCoffeeDrinker: !p.isCoffeeDrinker }))}
              >
                <Ionicons
                  name={editForm.isCoffeeDrinker ? "checkbox" : "square-outline"}
                  size={20}
                  color={editForm.isCoffeeDrinker ? colors.goldDark : "#9CA3AF"}
                />
                <Text style={styles.checkboxText}>Rutin minum Kopi / Teh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setEditForm((p) => ({ ...p, isSmoker: !p.isSmoker }))}
              >
                <Ionicons
                  name={editForm.isSmoker ? "checkbox" : "square-outline"}
                  size={20}
                  color={editForm.isSmoker ? colors.goldDark : "#9CA3AF"}
                />
                <Text style={styles.checkboxText}>Merokok / Vaping</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.modalSaveBtn, isSaving ? { opacity: 0.7 } : null]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Simpan Perubahan Profil</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: CHANGE PASSWORD */}
      <Modal visible={isPasswordModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Kata Sandi</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Kata Sandi Saat Ini</Text>
              <TextInput
                style={styles.textInput}
                value={passForm.current_password}
                onChangeText={(text) => setPassForm((p) => ({ ...p, current_password: text }))}
                placeholder="Masukkan kata sandi lama"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Kata Sandi Baru</Text>
              <TextInput
                style={styles.textInput}
                value={passForm.new_password}
                onChangeText={(text) => setPassForm((p) => ({ ...p, new_password: text }))}
                placeholder="Minimal 6 karakter"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Konfirmasi Kata Sandi Baru</Text>
              <TextInput
                style={styles.textInput}
                value={passForm.confirm_password}
                onChangeText={(text) => setPassForm((p) => ({ ...p, confirm_password: text }))}
                placeholder="Ulangi kata sandi baru"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[styles.modalSaveBtn, isChangingPass ? { opacity: 0.7 } : null]}
                onPress={handleChangePassword}
                disabled={isChangingPass}
                activeOpacity={0.85}
              >
                {isChangingPass ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Simpan Kata Sandi Baru</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.charcoal },
  subtitle: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2 },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editHeaderBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2C2416',
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.gold },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  profileMeta: { fontSize: 12, color: colors.charcoalMedium },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.goldDark },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  sectionEditLink: { fontSize: 12, fontWeight: '700', color: colors.goldDark },
  attributeList: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  attributeLabel: { fontSize: 12, color: colors.charcoalMedium },
  attributeValue: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  habitGrid: { gap: 10, marginTop: spacing.xs },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: radius.lg,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  habitIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: { fontSize: 12, fontWeight: '700', color: colors.charcoal },
  habitStatus: { fontSize: 11, color: colors.charcoalMedium, marginTop: 1 },
  actionMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenuTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  actionMenuDesc: { fontSize: 11, color: colors.charcoalMedium, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    paddingVertical: 13,
    marginTop: spacing.xs,
  },
  logoutBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.charcoal, marginTop: spacing.sm, marginBottom: 4 },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.charcoal,
  },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  radioPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  radioPillActive: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  radioPillText: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium },
  radioPillTextActive: { color: colors.goldDark, fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  checkboxText: { fontSize: 12, color: colors.charcoal },
  modalSaveBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
