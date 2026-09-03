import { getStorageUrl } from '@/constants/api';
import { useAuth } from '@/context/AuthContext';
import { UserProfileData, userService } from '@/services/userService';
import { WilayahItem, wilayahService } from '@/services/wilayahService';
import { colors, radius, spacing } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];
const BLOOD_OPTIONS = ['A', 'B', 'AB', 'O', 'Tidak Tahu'];

const normalizePhoneLocal = (raw: string): string => {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('62')) return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
};

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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
    province: '',
    provinceId: '',
    city: '',
    cityId: '',
    district: '',
    districtId: '',
    postalCode: '',
    isCoffeeDrinker: false,
    isSmoker: false,
  });

  // Wilayah Indonesia dropdown states
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [isLoadingWilayah, setIsLoadingWilayah] = useState(false);
  const [pickerModalType, setPickerModalType] = useState<'province' | 'city' | 'district' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [jobOptions, setJobOptions] = useState<{ id: string; name: string }[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [isJobPickerOpen, setIsJobPickerOpen] = useState(false);
  const [isBirthDatePickerOpen, setIsBirthDatePickerOpen] = useState(false);
  const [birthDateValue, setBirthDateValue] = useState(new Date(2000, 0, 1));

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const loadProfile = useCallback(async () => {
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
  }, [user]);

  const populateForm = (data: any) => {
    setEditForm({
      name: data.name || '',
      email: data.email || '',
      phone: normalizePhoneLocal(data.phone || data.whatsapp || ''),
      gender: data.gender === 'female' ? 'Perempuan' : data.gender === 'male' ? 'Laki-laki' : (data.gender || 'Laki-laki'),
      birthDate: data.birthDate || data.birth_date || '',
      bloodType: data.bloodType || data.blood_type || 'Tidak Tahu',
      job: data.job || data.occupation || '',
      address: data.address || data.address_line || '',
      province: data.province || '',
      provinceId: data.provinceId || data.province || '',
      city: data.city || '',
      cityId: data.cityId || data.city || '',
      district: data.district || '',
      districtId: data.districtId || data.district || '',
      postalCode: data.postalCode || data.postal_code || '',
      isCoffeeDrinker: Boolean(data.isCoffeeDrinker ?? data.is_coffee_drinker),
      isSmoker: Boolean(data.isSmoker ?? data.is_smoker),
    });
  };

  // Fetch provinces when edit modal opens
  useEffect(() => {
    if (isEditModalOpen && provinces.length === 0) {
      setIsLoadingWilayah(true);
      wilayahService.getProvinces()
        .then((list) => setProvinces(list || []))
        .finally(() => setIsLoadingWilayah(false));
    }
  }, [isEditModalOpen, provinces.length]);

  useEffect(() => {
    if (!isEditModalOpen || jobOptions.length > 0) return;
    userService.getJobOptions().then(setJobOptions).catch(() => setJobOptions([]));
  }, [isEditModalOpen, jobOptions.length]);

  // Fetch regencies when province changes
  useEffect(() => {
    const provKey = editForm.provinceId || editForm.province;
    if (provKey) {
      wilayahService.getRegencies(provKey).then((list) => setRegencies(list || []));
    } else {
      setRegencies([]);
    }
  }, [editForm.provinceId, editForm.province]);

  // Fetch districts when city changes
  useEffect(() => {
    const cityKey = editForm.cityId || editForm.city;
    if (cityKey) {
      wilayahService.getDistricts(cityKey).then((list) => setDistricts(list || []));
    } else {
      setDistricts([]);
    }
  }, [editForm.cityId, editForm.city]);

  const handleSelectProvince = (item: WilayahItem) => {
    setEditForm((p) => ({
      ...p,
      province: item.name,
      provinceId: item.id || item.kode || item.name,
      city: '',
      cityId: '',
      district: '',
      districtId: '',
    }));
    setDistricts([]);
    setPickerModalType(null);
    setPickerSearch('');
  };

  const handleSelectCity = (item: WilayahItem) => {
    setEditForm((p) => ({
      ...p,
      city: item.name,
      cityId: item.id || item.kode || item.name,
      district: '',
      districtId: '',
    }));
    setPickerModalType(null);
    setPickerSearch('');
  };

  const handleSelectDistrict = (item: WilayahItem) => {
    setEditForm((p) => ({
      ...p,
      district: item.name,
      districtId: item.id || item.kode || item.name,
    }));
    setPickerModalType(null);
    setPickerSearch('');
  };

  // Filter items in modal picker
  const currentPickerItems = useMemo(() => {
    let source: WilayahItem[] = [];
    if (pickerModalType === 'province') source = provinces;
    else if (pickerModalType === 'city') source = regencies;
    else if (pickerModalType === 'district') source = districts;

    if (!pickerSearch.trim()) return source;
    const q = pickerSearch.toLowerCase().trim();
    return source.filter((item) => item.name.toLowerCase().includes(q));
  }, [pickerModalType, provinces, regencies, districts, pickerSearch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refreshUser(),
      loadProfile(),
    ]);
    setIsRefreshing(false);
  }, [loadProfile, refreshUser]);

  const handleOpenEdit = () => {
    if (profileData) populateForm(profileData);
    else if (user) populateForm(user as any);
    setIsEditModalOpen(true);
  };

  const openBirthDatePicker = () => {
    const parsed = editForm.birthDate ? new Date(`${editForm.birthDate}T00:00:00`) : new Date(2000, 0, 1);
    setBirthDateValue(Number.isNaN(parsed.getTime()) ? new Date(2000, 0, 1) : parsed);
    setIsBirthDatePickerOpen(true);
  };

  const handleBirthDateChange = (event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === 'android') setIsBirthDatePickerOpen(false);
    if (event.type === 'set' && value) {
      setBirthDateValue(value);
      setEditForm((p) => ({ ...p, birthDate: value.toISOString().slice(0, 10) }));
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Perhatian', 'Nama lengkap wajib diisi.');
      return;
    }
    if (!editForm.phone.trim()) {
      Alert.alert('Perhatian', 'No. WhatsApp / HP wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const normalizedGender = editForm.gender === 'Perempuan' ? 'female' : 'male';

      await userService.updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        whatsapp: editForm.phone.trim(),
        gender: normalizedGender,
        birthDate: editForm.birthDate.trim(),
        bloodType: editForm.bloodType,
        job: editForm.job.trim(),
        address: editForm.address.trim(),
        province: editForm.province.trim(),
        city: editForm.city.trim(),
        district: editForm.district.trim(),
        postalCode: editForm.postalCode.trim(),
        isCoffeeDrinker: editForm.isCoffeeDrinker,
        isSmoker: editForm.isSmoker,
      });

      await refreshUser();
      await loadProfile();
      setIsEditModalOpen(false);
      Alert.alert('Berhasil', 'Data profil Anda telah berhasil diperbarui di server.');
    } catch (err: any) {
      Alert.alert('Gagal Memperbarui Profil', err?.message || 'Gagal memperbarui profil. Periksa koneksi internet Anda.');
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
        password: passForm.new_password,
        new_password: passForm.new_password,
        password_confirmation: passForm.confirm_password,
        new_password_confirmation: passForm.confirm_password,
      });
      setIsPasswordModalOpen(false);
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
      Alert.alert('Berhasil', 'Kata sandi akun Anda berhasil diperbarui.');
    } catch (err: any) {
      Alert.alert('Gagal Mengubah Kata Sandi', err?.message || 'Gagal mengubah kata sandi. Pastikan kata sandi lama benar.');
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
  const rawAvatar = activeUser?.avatar_url || activeUser?.avatar || activeUser?.photo_url || activeUser?.picture || (user as any)?.avatar_url || (user as any)?.avatar || (user as any)?.photo_url;
  const fullAvatarUri = rawAvatar ? getStorageUrl(rawAvatar) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* COMPACT TOP HEADER (IDENTICAL TO MEMBERSHIP, CONSULTATION, BOOKING) */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title} numberOfLines={1}>Profil Pasien</Text>
          <Text style={styles.subtitle} numberOfLines={1}>Data diri & keamanan akun</Text>
        </View>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={handleOpenEdit} activeOpacity={0.85}>
          <Ionicons name="pencil-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.editHeaderBtnText}>Edit Profil</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Summary (Google Avatar + No "Pasien Terdaftar" text) */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {fullAvatarUri && !avatarError ? (
              <Image
                source={{ uri: fullAvatarUri }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Text style={styles.avatarText}>{activeUser?.name?.[0]?.toUpperCase() ?? 'P'}</Text>
            )}
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
        </View>

        {/* 1. INFORMASI DATA DIRI PASIEN (Synced from API) */}
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
              <Text style={styles.attributeValue}>
                {activeUser?.gender === 'female' ? 'Perempuan' : activeUser?.gender === 'male' ? 'Laki-laki' : (activeUser?.gender || '-')}
              </Text>
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
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Alamat Domisili</Text>
              <Text style={[styles.attributeValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                {activeUser?.address || activeUser?.address_line || '-'}
              </Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Provinsi</Text>
              <Text style={styles.attributeValue}>{activeUser?.province || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Kota / Kabupaten</Text>
              <Text style={styles.attributeValue}>{activeUser?.city || '-'}</Text>
            </View>
            <View style={styles.attributeRow}>
              <Text style={styles.attributeLabel}>Kecamatan</Text>
              <Text style={styles.attributeValue}>{activeUser?.district || '-'}</Text>
            </View>
            <View style={[styles.attributeRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.attributeLabel}>Kode Pos</Text>
              <Text style={styles.attributeValue}>{activeUser?.postalCode || activeUser?.postal_code || '-'}</Text>
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
              <Text style={styles.inputLabel}>Nama Lengkap <Text style={styles.requiredMark}>*</Text></Text>
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
              <Text style={styles.inputLabel}>No. WhatsApp / HP <Text style={styles.requiredMark}>*</Text></Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+62</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm((p) => ({ ...p, phone: normalizePhoneLocal(text) }))}
                  placeholder="8123456789"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                  maxLength={13}
                />
              </View>

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
              <Text style={styles.inputLabel}>Tanggal Lahir</Text>
              <TouchableOpacity style={styles.dropdownSelector} onPress={openBirthDatePicker} activeOpacity={0.8}>
                <Text style={[styles.dropdownSelectorText, !editForm.birthDate ? styles.dropdownSelectorPlaceholder : null]}>
                  {editForm.birthDate || 'Pilih tanggal lahir'}
                </Text>
                <Ionicons name="calendar-outline" size={17} color={colors.charcoalMedium} />
              </TouchableOpacity>

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
              <TouchableOpacity style={styles.dropdownSelector} onPress={() => { setJobSearch(''); setIsJobPickerOpen(true); }} activeOpacity={0.8}>
                <Text style={[styles.dropdownSelectorText, !editForm.job ? styles.dropdownSelectorPlaceholder : null]} numberOfLines={1}>
                  {editForm.job || 'Pilih pekerjaan / profesi'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.charcoalMedium} />
              </TouchableOpacity>

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

              {/* Provinsi Dropdown */}
              <Text style={styles.inputLabel}>Provinsi</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => { setPickerSearch(''); setPickerModalType('province'); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownSelectorText, !editForm.province ? styles.dropdownSelectorPlaceholder : null]}>
                  {editForm.province || 'Pilih Provinsi'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.charcoalMedium} />
              </TouchableOpacity>

              {/* Kota / Kabupaten Dropdown */}
              <Text style={styles.inputLabel}>Kota / Kabupaten</Text>
              <TouchableOpacity
                style={[styles.dropdownSelector, !editForm.province ? styles.dropdownSelectorDisabled : null]}
                onPress={() => {
                  if (!editForm.province) {
                    Alert.alert('Perhatian', 'Harap pilih provinsi terlebih dahulu.');
                    return;
                  }
                  setPickerSearch('');
                  setPickerModalType('city');
                }}
                disabled={!editForm.province}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownSelectorText, !editForm.city ? styles.dropdownSelectorPlaceholder : null]}>
                  {editForm.city || (editForm.province ? 'Pilih Kota / Kabupaten' : 'Pilih Provinsi Terlebih Dahulu')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.charcoalMedium} />
              </TouchableOpacity>

              {/* Kecamatan Dropdown */}
              <Text style={styles.inputLabel}>Kecamatan</Text>
              <TouchableOpacity
                style={[styles.dropdownSelector, !editForm.city ? styles.dropdownSelectorDisabled : null]}
                onPress={() => {
                  if (!editForm.city) {
                    Alert.alert('Perhatian', 'Harap pilih kota/kabupaten terlebih dahulu.');
                    return;
                  }
                  setPickerSearch('');
                  setPickerModalType('district');
                }}
                disabled={!editForm.city}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownSelectorText, !editForm.district ? styles.dropdownSelectorPlaceholder : null]}>
                  {editForm.district || (editForm.city ? 'Pilih Kecamatan' : 'Pilih Kota Terlebih Dahulu')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.charcoalMedium} />
              </TouchableOpacity>

              {/* Kode Pos */}
              <Text style={styles.inputLabel}>Kode Pos</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.postalCode}
                onChangeText={(text) => setEditForm((p) => ({ ...p, postalCode: text.replace(/[^0-9]/g, '').slice(0, 5) }))}
                placeholder="Contoh: 12310"
                keyboardType="number-pad"
                maxLength={5}
                placeholderTextColor="#9CA3AF"
              />

              {/* Gaya Hidup: Kopi & Rokok */}
              <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>Gaya Hidup & Kebiasaan</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Rutin Mengonsumsi Kopi / Teh</Text>
                <TouchableOpacity
                  style={[styles.toggleBtn, editForm.isCoffeeDrinker ? styles.toggleBtnActive : null]}
                  onPress={() => setEditForm((p) => ({ ...p, isCoffeeDrinker: !p.isCoffeeDrinker }))}
                >
                  <Text style={[styles.toggleBtnText, editForm.isCoffeeDrinker ? styles.toggleBtnTextActive : null]}>
                    {editForm.isCoffeeDrinker ? 'Ya' : 'Tidak'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Riwayat Merokok</Text>
                <TouchableOpacity
                  style={[styles.toggleBtn, editForm.isSmoker ? styles.toggleBtnActive : null]}
                  onPress={() => setEditForm((p) => ({ ...p, isSmoker: !p.isSmoker }))}
                >
                  <Text style={[styles.toggleBtnText, editForm.isSmoker ? styles.toggleBtnTextActive : null]}>
                    {editForm.isSmoker ? 'Ya' : 'Tidak'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tombol Simpan */}
              <TouchableOpacity
                style={[styles.modalSaveBtn, isSaving ? { opacity: 0.7 } : null]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: PILIH TANGGAL LAHIR */}
      <Modal visible={isBirthDatePickerOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.datePickerCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tanggal Lahir</Text>
              <TouchableOpacity onPress={() => setIsBirthDatePickerOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={birthDateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              onChange={handleBirthDateChange}
              themeVariant="light"
            />
            {Platform.OS === 'ios' ? (
              <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setIsBirthDatePickerOpen(false)} activeOpacity={0.85}>
                <Text style={styles.modalSaveBtnText}>Pakai Tanggal Ini</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* MODAL: PILIH PEKERJAAN */}
      <Modal visible={isJobPickerOpen} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { maxHeight: '80%', paddingBottom: spacing.md }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Pekerjaan</Text>
              <TouchableOpacity onPress={() => setIsJobPickerOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerSearchWrap}>
              <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.pickerSearchInput}
                value={jobSearch}
                onChangeText={setJobSearch}
                placeholder="Cari pekerjaan / profesi..."
                placeholderTextColor="#9CA3AF"
                autoCorrect={false}
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {jobOptions.filter((job) => !jobSearch.trim() || job.name.toLowerCase().includes(jobSearch.toLowerCase().trim())).map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.pickerItemRow, editForm.job === job.name ? styles.pickerItemRowSelected : null]}
                  onPress={() => { setEditForm((p) => ({ ...p, job: job.name })); setIsJobPickerOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerItemText, editForm.job === job.name ? styles.pickerItemTextSelected : null]}>{job.name}</Text>
                  {editForm.job === job.name ? <Ionicons name="checkmark-circle" size={18} color={colors.goldDark} /> : null}
                </TouchableOpacity>
              ))}
              {jobOptions.length === 0 ? <Text style={styles.inputHelper}>Opsi pekerjaan belum tersedia dari server.</Text> : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: PILIH WILAYAH (PROVINSI / KOTA / KECAMATAN) */}
      <Modal visible={pickerModalType !== null} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { maxHeight: '80%', paddingBottom: spacing.md }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerModalType === 'province'
                  ? 'Pilih Provinsi'
                  : pickerModalType === 'city'
                  ? 'Pilih Kota / Kabupaten'
                  : 'Pilih Kecamatan'}
              </Text>
              <TouchableOpacity
                onPress={() => { setPickerModalType(null); setPickerSearch(''); }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.pickerSearchWrap}>
              <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.pickerSearchInput}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder="Cari nama wilayah / daerah..."
                placeholderTextColor="#9CA3AF"
                clearButtonMode="while-editing"
                autoCorrect={false}
              />
              {pickerSearch ? (
                <TouchableOpacity onPress={() => setPickerSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Region Items List */}
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {isLoadingWilayah ? (
                <View style={{ paddingVertical: 32, alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={colors.gold} />
                  <Text style={{ fontSize: 12, color: colors.charcoalMedium }}>Memuat data wilayah dari server...</Text>
                </View>
              ) : currentPickerItems.length === 0 ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.charcoalMedium }}>Tidak ada daerah yang sesuai pencarian.</Text>
                </View>
              ) : (
                currentPickerItems.map((item) => {
                  const isSelected =
                    (pickerModalType === 'province' && editForm.province === item.name) ||
                    (pickerModalType === 'city' && editForm.city === item.name) ||
                    (pickerModalType === 'district' && editForm.district === item.name);

                  return (
                    <TouchableOpacity
                      key={item.id || item.name}
                      style={[styles.pickerItemRow, isSelected ? styles.pickerItemRowSelected : null]}
                      onPress={() => {
                        if (pickerModalType === 'province') handleSelectProvince(item);
                        else if (pickerModalType === 'city') handleSelectCity(item);
                        else if (pickerModalType === 'district') handleSelectDistrict(item);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, isSelected ? styles.pickerItemTextSelected : null]}>
                        {item.name}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={18} color={colors.goldDark} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: UBAH KATA SANDI */}
      <Modal visible={isPasswordModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Kata Sandi</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
              <Text style={styles.inputHelper}>
                Gunakan kata sandi yang aman dengan kombinasi huruf dan angka minimal 6 karakter.
              </Text>

              {/* Password Lama */}
              <Text style={styles.inputLabel}>Kata Sandi Saat Ini</Text>
              <TextInput
                style={styles.textInput}
                value={passForm.current_password}
                onChangeText={(text) => setPassForm((p) => ({ ...p, current_password: text }))}
                placeholder="Masukkan kata sandi lama"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />

              {/* Password Baru */}
              <Text style={styles.inputLabel}>Kata Sandi Baru</Text>
              <TextInput
                style={styles.textInput}
                value={passForm.new_password}
                onChangeText={(text) => setPassForm((p) => ({ ...p, new_password: text }))}
                placeholder="Minimal 6 karakter"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />

              {/* Konfirmasi Password Baru */}
              <Text style={styles.inputLabel}>Konfirmasi Kata Sandi Baru</Text>
              <TextInput
                style={styles.textInput}
                value={passForm.confirm_password}
                onChangeText={(text) => setPassForm((p) => ({ ...p, confirm_password: text }))}
                placeholder="Ulangi kata sandi baru"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />

              {/* Tombol Simpan Password */}
              <TouchableOpacity
                style={[styles.modalSaveBtn, isChangingPass ? { opacity: 0.7 } : null]}
                onPress={handleChangePassword}
                disabled={isChangingPass}
                activeOpacity={0.85}
              >
                {isChangingPass ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Ubah Kata Sandi Sekarang</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.charcoal,
  },
  subtitle: {
    fontSize: 11,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    gap: 4,
    flexShrink: 0,
  },
  editHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.goldDark,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.charcoal,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  profileMeta: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm + 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.charcoal,
  },
  sectionEditLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.goldDark,
  },
  attributeList: {
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    paddingTop: spacing.xs,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F5',
  },
  attributeLabel: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
  },
  attributeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  habitGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  habitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0E6D3',
    gap: spacing.xs + 2,
  },
  habitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    fontSize: 10,
    color: colors.charcoalMedium,
    fontWeight: '600',
  },
  habitStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 1,
  },
  actionMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    gap: spacing.sm,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenuTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.charcoal,
  },
  actionMenuDesc: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.xl,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  datePickerCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    alignItems: 'center',
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputHelper: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  requiredMark: {
    color: '#DC2626',
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: '#F5EFE6',
  },
  phonePrefixText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.charcoal,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  radioPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAF8F5',
  },
  radioPillActive: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
  },
  radioPillText: {
    fontSize: 11,
    color: colors.charcoalMedium,
    fontWeight: '600',
  },
  radioPillTextActive: {
    color: colors.goldDark,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  switchLabel: {
    fontSize: 11.5,
    color: colors.charcoal,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAF8F5',
  },
  toggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  toggleBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.charcoalMedium,
  },
  toggleBtnTextActive: {
    color: '#059669',
  },
  modalSaveBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dropdownSelector: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownSelectorDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  dropdownSelectorText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.charcoal,
    flex: 1,
  },
  dropdownSelectorPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  pickerSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 12.5,
    color: colors.charcoal,
    padding: 0,
  },
  pickerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  pickerItemRowSelected: {
    backgroundColor: '#FAF5EA',
    borderRadius: radius.md,
  },
  pickerItemText: {
    fontSize: 13,
    color: colors.charcoal,
    flex: 1,
  },
  pickerItemTextSelected: {
    color: colors.goldDark,
    fontWeight: '700',
  },
});
