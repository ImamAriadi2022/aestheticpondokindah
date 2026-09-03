import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, Alert, Modal, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { bookingService, ClinicServiceItem, ClinicSettingsData } from '@/services/bookingService';
import { doctorService } from '@/services/doctorService';
import { colors, spacing, radius } from '@/theme/colors';
import { getStorageUrl } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import TermsPdfModalNative from '@/components/TermsPdfModalNative';
import DigitalSignatureModalNative from '@/components/DigitalSignatureModalNative';

// Exact parity with web NewBookingFlow.tsx
export function parseTimeRangeToSlots(timeRange: string, intervalMinutes: number = 15): string[] {
  if (!timeRange) return [];
  const ranges = timeRange.split(/[,;/]/).map((r) => r.trim()).filter(Boolean);
  const allSlots: string[] = [];

  for (const range of ranges) {
    const parts = range.split(/[-–—]/).map((p) => p.trim().replace('.', ':'));
    if (parts.length === 2) {
      const [startH, startM = 0] = parts[0].split(':').map(Number);
      const [endH, endM = 0] = parts[1].split(':').map(Number);
      if (!isNaN(startH) && !isNaN(endH)) {
        let currentTotalM = startH * 60 + (isNaN(startM) ? 0 : startM);
        const endTotalM = endH * 60 + (isNaN(endM) ? 0 : endM);
        while (currentTotalM < endTotalM) {
          const hh = String(Math.floor(currentTotalM / 60)).padStart(2, '0');
          const mm = String(currentTotalM % 60).padStart(2, '0');
          const slotStr = hh + ':' + mm;
          if (!allSlots.includes(slotStr)) {
            allSlots.push(slotStr);
          }
          currentTotalM += intervalMinutes;
        }
      }
    }
  }

  return allSlots.sort();
}

export default function NewBookingScreen() {
  const { user } = useAuth();

  // 4 Steps: 1: Layanan, 2: Dokter, 3: Jadwal & Jam, 4: Konfirmasi
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Dynamic Services from Database API (GET /services)
  const [services, setServices] = useState<ClinicServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchService, setSearchService] = useState('');
  const [selectedService, setSelectedService] = useState<ClinicServiceItem | null>(null);

  // Dynamic Doctors from Database API (GET /public/doctors)
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  // Dynamic Doctor Schedules from Database API (GET /public/doctor-schedules)
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);

  // Dynamic Clinic Settings from Database API (GET /public/settings)
  const [clinicSettings, setClinicSettings] = useState<ClinicSettingsData | null>(null);

  // Step 3: Selected Date & Time Slot
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Step 4: Confirmation & Form Inputs
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || (user as any)?.whatsapp || '');
  const [complaintNotes, setComplaintNotes] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal
  const [successTicket, setSuccessTicket] = useState<any | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 1. Fetch All Production APIs Live on Mount
  useEffect(() => {
    // 1.1 Services (206 treatments from DB)
    setIsLoadingServices(true);
    bookingService.getServices()
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          setSelectedService(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingServices(false));

    // 1.2 Doctors (13 specialists from DB)
    setIsLoadingDoctors(true);
    doctorService.getPublicDoctors()
      .then((data) => {
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingDoctors(false));

    // 1.3 Doctor Schedules (1.341 schedule slots from DB)
    bookingService.getPublicDoctorSchedules()
      .then((schedules) => {
        if (Array.isArray(schedules)) {
          setDoctorSchedules(schedules);
        }
      })
      .catch(() => {});

    // 1.4 Clinic Settings (Terms & WA contact from DB)
    bookingService.getPublicSettings()
      .then((settings) => {
        setClinicSettings(settings);
      })
      .catch(() => {});
  }, []);

  // Update user prefill on Auth change
  useEffect(() => {
    if (user?.name && !patientName) setPatientName(user.name);
    if ((user?.phone || (user as any)?.whatsapp) && !patientPhone) {
      setPatientPhone(user?.phone || (user as any)?.whatsapp || '');
    }
  }, [user, patientName, patientPhone]);

  // Is Phone Missing / Registered via Google without WhatsApp
  const isPhoneMissing = useMemo(() => {
    const clean = patientPhone ? patientPhone.replace(/[^0-9]/g, '') : '';
    return clean.length < 9;
  }, [patientPhone]);

  // Dynamic Categories derived from real services
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category && s.category.trim()) {
        set.add(s.category.trim());
      }
    });
    return ['Semua', ...Array.from(set)];
  }, [services]);

  // Helper to match schedules for a doctor on a specific date (parity with web)
  const getDoctorSchedulesForDate = (dateIso: string) => {
    if (!selectedDoctor || doctorSchedules.length === 0) return [];
    return doctorSchedules.filter((s) => {
      const matchDoc =
        String(s.doctorId) === String(selectedDoctor.id) ||
        String(s.doctorId) === String(selectedDoctor.userId) ||
        (s.doctorName &&
          selectedDoctor.name &&
          (s.doctorName.toLowerCase().includes(selectedDoctor.name.toLowerCase()) ||
            selectedDoctor.name.toLowerCase().includes(s.doctorName.toLowerCase())));
      const matchDate = s.date === dateIso;
      return matchDoc && matchDate;
    });
  };

  // Generate 21 available booking dates with database practice schedule check
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = 0; i < 21; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const dayName = days[dayIndex];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];

      const daySchedules = getDoctorSchedulesForDate(iso);
      const isPractice = daySchedules.length > 0;

      dates.push({
        iso,
        dayName,
        dayNum,
        monthName,
        isPractice,
        daySchedules,
        descText: isPractice ? 'Praktik' : 'Libur',
        fullDisplay: dayName + ', ' + dayNum + ' ' + monthName + ' ' + d.getFullYear(),
      });
    }
    return dates;
  }, [selectedDoctor, doctorSchedules]);

  // Auto-select first available practice date when doctor or schedules change
  useEffect(() => {
    if (selectedDoctor && doctorSchedules.length > 0) {
      const currentAvail = availableDates[selectedDateIndex]?.isPractice;
      if (!currentAvail) {
        const firstAvailIndex = availableDates.findIndex((d) => d.isPractice);
        if (firstAvailIndex !== -1) {
          setSelectedDateIndex(firstAvailIndex);
        }
      }
    }
  }, [selectedDoctor, doctorSchedules, availableDates]);

  const activeDateItem = availableDates[selectedDateIndex] || availableDates[0];
  const currentDaySchedules = activeDateItem?.daySchedules || [];
  const isDoctorAvailableOnSelectedDate = activeDateItem?.isPractice || false;

  // Next available date for off-duty recommendation
  const nextAvailableDate = useMemo(() => {
    if (!selectedDoctor || isDoctorAvailableOnSelectedDate) return null;
    return availableDates.find((d, idx) => idx > selectedDateIndex && d.isPractice) ||
           availableDates.find((d) => d.isPractice) || null;
  }, [selectedDoctor, isDoctorAvailableOnSelectedDate, availableDates, selectedDateIndex]);

  // Dynamic Time Slots derived from all schedules on that day (15-min intervals)
  const timeSlots = useMemo(() => {
    if (!isDoctorAvailableOnSelectedDate || currentDaySchedules.length === 0) return [];

    const slots: string[] = [];
    currentDaySchedules.forEach((s: any) => {
      if (s.timeRange) {
        const generated = parseTimeRangeToSlots(s.timeRange, 15);
        generated.forEach((slot) => {
          if (!slots.includes(slot)) slots.push(slot);
        });
      }
    });

    return slots.sort();
  }, [isDoctorAvailableOnSelectedDate, currentDaySchedules]);

  // Set default selected time slot when slots change
  useEffect(() => {
    if (timeSlots.length > 0 && (!selectedTimeSlot || !timeSlots.includes(selectedTimeSlot))) {
      setSelectedTimeSlot(timeSlots[0]);
    }
  }, [timeSlots, selectedTimeSlot]);

  // Filtered Dynamic Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === 'Semua' || s.category === selectedCategory;
      const matchSearch = !searchService.trim() ||
        s.title.toLowerCase().includes(searchService.toLowerCase()) ||
        (s.intro && s.intro.toLowerCase().includes(searchService.toLowerCase())) ||
        (s.category && s.category.toLowerCase().includes(searchService.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchService]);

  // Step 1: Auto-advance on service selection
  const handleSelectService = (service: ClinicServiceItem) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  // Step 2: Auto-advance on doctor selection
  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc);
    setCurrentStep(3);
  };

  // Step 3: Auto-advance on time slot selection
  const handleSelectTimeSlot = (slot: string) => {
    setSelectedTimeSlot(slot);
    setCurrentStep(4);
  };

  const handleSubmitBooking = async () => {
    if (!patientName.trim()) {
      Alert.alert('Perhatian', 'Nama lengkap pasien wajib diisi.');
      return;
    }

    const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      Alert.alert(
        'Nomor WhatsApp Diperlukan',
        'Mohon masukkan nomor WhatsApp aktif yang valid (minimal 9 digit) agar klinik dapat mengirimkan konfirmasi reservasi dan E-Ticket.'
      );
      return;
    }

    if (!isTermsAgreed) {
      Alert.alert('Persetujuan Diperlukan', 'Harap buka dan setujui Syarat & Ketentuan Layanan di dalam pop-up sebelum melanjutkan.');
      return;
    }

    if (!signatureData) {
      Alert.alert('Persetujuan Diperlukan', 'Harap buka Surat Persetujuan Tindakan Medis dan bubuhkan tanda tangan digital di dalam pop-up.');
      return;
    }

    setIsSubmitting(true);
    const chosenDate = activeDateItem?.iso;
    const scheduleId = currentDaySchedules[0]?.id || null;

    try {
      const res = await bookingService.createReservation({
        name: patientName.trim(),
        phone: cleanPhone,
        treatment_interest: selectedService?.title || 'Pemeriksaan Gigi',
        doctor_id: selectedDoctor?.id || null,
        doctor_schedule_id: scheduleId ? Number(scheduleId) : null,
        branch_id: 1,
        date: chosenDate,
        preferred_time: selectedTimeSlot,
        complaint: complaintNotes.trim() || ('Reservasi ' + (selectedService?.title || 'Perawatan Gigi') + ' bersama ' + (selectedDoctor?.name || 'Dokter Spesialis')),
        signature_data: signatureData,
        service_price: selectedService?.price ? Number(selectedService.price) : 500000,
      });

      const ticketCode = res.code || (res.reservation as any)?.code || ('RSV-' + new Date().getFullYear() + '001');
      const ticket = {
        code: ticketCode,
        service: selectedService?.title || 'Perawatan Gigi',
        doctor: selectedDoctor?.name || 'Dokter Spesialis',
        date: activeDateItem?.fullDisplay,
        time: selectedTimeSlot + ' WIB',
        location: currentDaySchedules[0]?.location || 'Aesthetic Pondok Indah Main Branch',
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
      };

      setSuccessTicket(ticket);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      Alert.alert('Gagal', err?.message || 'Gagal mengirimkan reservasi janji temu. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppConfirmation = () => {
    if (!successTicket) return;
    const waPhone = clinicSettings?.booking_whatsapp_number || '6281990114949';
    const waMsg = [
      '*KONFIRMASI RESERVASI JANJI TEMU DOKTER GIGI*',
      '*Aesthetic Pondok Indah Dental Clinic*',
      '━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      'Halo Admin Aesthetic Pondok Indah, saya telah membuat reservasi janji temu melalui aplikasi mobile dengan rincian berikut:',
      '',
      '📋 *Kode Reservasi:* ' + successTicket.code,
      '👤 *Nama Pasien:* ' + successTicket.patientName,
      '📱 *No. WhatsApp:* ' + successTicket.patientPhone,
      '',
      '👨‍⚕️ *Dokter Spesialis:* ' + successTicket.doctor,
      '🏥 *Layanan Perawatan:* ' + successTicket.service,
      '📅 *Tanggal:* ' + successTicket.date,
      '⏰ *Waktu/Jam:* ' + successTicket.time,
      '📍 *Lokasi:* ' + (successTicket.location || 'Aesthetic Pondok Indah, Jakarta Selatan'),
      complaintNotes ? ('📝 *Catatan Keluhan:* ' + complaintNotes) : '',
      '',
      'Mohon verifikasi ketersediaan jadwal tersebut. Terima kasih! 🙏',
    ].filter(Boolean).join('\n');

    const cleanPhone = waPhone.replace(/[^0-9]/g, '');
    Linking.openURL('https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(waMsg));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* 1. TOP HEADER WITH STEP INDICATOR */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep > 1) setCurrentStep((s) => s - 1);
            else router.back();
          }}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Buat Janji Temu</Text>
          <Text style={styles.headerSubtitle}>
            Langkah {currentStep} dari 4: {currentStep === 1 ? 'Pilih Layanan' : currentStep === 2 ? 'Pilih Dokter' : currentStep === 3 ? 'Pilih Waktu' : 'Konfirmasi'}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* STEP PROGRESS BAR */}
      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressBar,
              step <= currentStep ? styles.progressBarActive : null,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ================= STEP 1: PILIH LAYANAN (LIVE DATABASE API) ================= */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Pilih Layanan Perawatan Gigi</Text>
            <Text style={styles.sectionDesc}>Pilih salah satu dari {services.length} layanan resmi klinik untuk langsung melanjutkan ke pemilihan dokter.</Text>

            {/* Search Bar */}
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.charcoalMedium} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari perawatan (e.g. Scaling, Whitening, Veneer)..."
                placeholderTextColor="#9CA3AF"
                value={searchService}
                onChangeText={setSearchService}
              />
            </View>

            {/* Category Filter Pills (Derived from Database) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ gap: 8 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, selectedCategory === cat ? styles.categoryPillActive : null]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryPillText, selectedCategory === cat ? styles.categoryPillTextActive : null]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Service List from API */}
            {isLoadingServices ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.xl }} />
            ) : filteredServices.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={36} color={colors.goldDark} />
                <Text style={styles.emptyTitle}>Layanan Tidak Ditemukan</Text>
                <Text style={styles.emptySub}>Coba kata kunci pencarian lain atau pilih kategori Semua.</Text>
              </View>
            ) : (
              <View style={styles.serviceList}>
                {filteredServices.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  const serviceImgUri = getStorageUrl(service.image);

                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[styles.serviceCard, isSelected ? styles.serviceCardActive : null]}
                      onPress={() => handleSelectService(service)}
                      activeOpacity={0.85}
                    >
                      {serviceImgUri ? (
                        <Image source={{ uri: serviceImgUri }} style={styles.serviceThumbnail} resizeMode="cover" />
                      ) : (
                        <View style={styles.serviceIconWrap}>
                          <Ionicons name="sparkles" size={20} color={colors.goldDark} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <View style={styles.serviceBadgeRow}>
                          <View style={styles.serviceCategoryBadge}>
                            <Text style={styles.serviceCategoryText}>{(service.category || 'GIGI').toUpperCase()}</Text>
                          </View>
                          {service.duration ? (
                            <View style={styles.durationTag}>
                              <Ionicons name="time-outline" size={11} color={colors.charcoalMedium} />
                              <Text style={styles.durationText}>{service.duration}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.serviceName, isSelected ? { color: colors.goldDark } : null]}>
                          {service.title}
                        </Text>
                        <Text style={styles.serviceDesc} numberOfLines={2}>{service.intro || 'Layanan perawatan gigi estetika dan kesehatan mulut profesional.'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.gold} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ================= STEP 2: PILIH DOKTER (FOTO ASLI & TANPA UNIVERSITAS) ================= */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Pilih Dokter Gigi Spesialis</Text>
            <Text style={styles.sectionDesc}>Pilih salah satu dari {doctors.length} dokter spesialis terdaftar untuk melihat jadwal praktiknya.</Text>

            {isLoadingDoctors ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.xl }} />
            ) : doctors.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="person-outline" size={36} color={colors.goldDark} />
                <Text style={styles.emptyTitle}>Data Dokter Sedang Dimuat</Text>
              </View>
            ) : (
              <View style={styles.doctorList}>
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  const photoUri = getStorageUrl(doc.avatar_url || doc.photo_url || doc.avatar || doc.image);

                  return (
                    <TouchableOpacity
                      key={doc.id}
                      style={[styles.doctorCard, isSelected ? styles.doctorCardActive : null]}
                      onPress={() => handleSelectDoctor(doc)}
                      activeOpacity={0.85}
                    >
                      {photoUri ? (
                        <Image
                          source={{ uri: photoUri }}
                          style={styles.doctorAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.doctorAvatar}>
                          <Text style={styles.doctorAvatarText}>
                            {doc.name?.replace('drg.', '')?.trim()?.[0] || 'D'}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.doctorName, isSelected ? { color: colors.goldDark } : null]}>
                          {doc.name}
                        </Text>
                        <Text style={styles.doctorSpec}>{doc.specialization || doc.speciality || 'Dokter Gigi Spesialis'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.gold} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ================= STEP 3: PILIH JADWAL & JAM (100% PARITAS WEB PASIEN & LIVE DATABASE) ================= */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Pilih Tanggal & Jam Praktik</Text>
            <Text style={styles.sectionDesc}>
              Jadwal praktik dokter {selectedDoctor?.name || 'spesialis'} di Aesthetic Pondok Indah.
            </Text>

            {/* Section 1: Kalender Pemilihan Tanggal */}
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleCardTitle}>1. Pilih Tanggal Kunjungan</Text>
                  <Text style={styles.scheduleCardSub}>Pilih tanggal dari slider kalender mingguan</Text>
                </View>
                <View style={styles.activeDateBadge}>
                  <Ionicons name="calendar" size={13} color={colors.goldDark} />
                  <Text style={styles.activeDateBadgeText}>{activeDateItem?.fullDisplay}</Text>
                </View>
              </View>

              {/* Horizontal Date Picker */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {availableDates.map((d, idx) => {
                  const isSelected = selectedDateIndex === idx;
                  const isPractice = d.isPractice;

                  return (
                    <TouchableOpacity
                      key={d.iso}
                      style={[
                        styles.dateCard,
                        isSelected ? styles.dateCardActive : null,
                        !isPractice && !isSelected ? styles.dateCardOff : null,
                      ]}
                      onPress={() => setSelectedDateIndex(idx)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.dateDayName, isSelected ? styles.dateTextActive : null]}>{d.dayName}</Text>
                      <Text style={[styles.dateDayNum, isSelected ? styles.dateTextActive : null]}>{d.dayNum}</Text>
                      <View style={[
                        styles.practiceBadge,
                        isSelected ? styles.practiceBadgeActive : isPractice ? styles.practiceBadgeOn : styles.practiceBadgeOff,
                      ]}>
                        <Text style={[
                          styles.practiceBadgeText,
                          isSelected ? { color: '#FFFFFF' } : isPractice ? { color: colors.goldDark } : { color: '#9CA3AF' },
                        ]}>
                          {d.descText}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Section 2: Time Slots Grid (Generated Live from Doctor's Database Schedules) */}
            {isDoctorAvailableOnSelectedDate ? (
              <View style={styles.scheduleCard}>
                <View style={styles.scheduleCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleCardTitle}>2. Pilih Jam Kunjungan</Text>
                    <Text style={styles.scheduleCardSub}>Ketuk slot jam untuk langsung melanjutkan ke konfirmasi</Text>
                  </View>
                  <View style={styles.slotsCountBadge}>
                    <Text style={styles.slotsCountText}>{timeSlots.length} Sesi Tersedia</Text>
                  </View>
                </View>

                {/* Doctor Session Info */}
                {currentDaySchedules.length > 0 && (
                  <View style={styles.sessionInfoBox}>
                    <Ionicons name="location-outline" size={14} color={colors.goldDark} />
                    <Text style={styles.sessionInfoText}>
                      drg. {selectedDoctor?.name} · {currentDaySchedules.map((s: any) => s.timeRange).join(', ')} WIB ({currentDaySchedules[0]?.location || 'Pondok Indah'})
                    </Text>
                  </View>
                )}

                {/* Time Slots Grid */}
                <View style={styles.timeGrid}>
                  {timeSlots.map((slot: string) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.timeBtn, isSelected ? styles.timeBtnActive : null]}
                        onPress={() => handleSelectTimeSlot(slot)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="time-outline" size={13} color={isSelected ? '#fff' : colors.charcoal} style={{ marginRight: 4 }} />
                        <Text style={[styles.timeBtnText, isSelected ? { color: '#fff', fontWeight: '800' } : null]}>
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.holidayBanner}>
                <Ionicons name="calendar-outline" size={32} color={colors.goldDark} style={{ marginBottom: 6 }} />
                <Text style={styles.holidayBannerTitle}>Tidak Ada Jadwal Praktik (Hari Libur)</Text>
                <Text style={styles.holidayBannerDesc}>
                  Dokter {selectedDoctor?.name} tidak memiliki jadwal praktik pada {activeDateItem?.fullDisplay}.
                </Text>
                {nextAvailableDate && (
                  <TouchableOpacity
                    style={styles.switchDateBtn}
                    onPress={() => {
                      const nextIdx = availableDates.findIndex((d) => d.iso === nextAvailableDate.iso);
                      if (nextIdx !== -1) setSelectedDateIndex(nextIdx);
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="arrow-forward-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.switchDateBtnText}>
                      Pindah ke Jadwal Praktik Terdekat ({nextAvailableDate.dayName}, {nextAvailableDate.dayNum} {nextAvailableDate.monthName})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= STEP 4: KONFIRMASI RINCIAN RESERVASI & VALIDASI WHATSAPP ================= */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Konfirmasi Rincian Reservasi</Text>
            <Text style={styles.sectionDesc}>Periksa rincian janji temu Anda dan lengkapi data pasien serta persetujuan medis.</Text>

            {/* GOOGLE LOGIN / MISSING WHATSAPP NOTICE BANNER */}
            {isPhoneMissing && (
              <View style={styles.googlePhoneBanner}>
                <View style={styles.googlePhoneIconWrap}>
                  <Ionicons name="alert-circle" size={22} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.googlePhoneTitle}>Nomor WhatsApp Belum Terisi</Text>
                  <Text style={styles.googlePhoneDesc}>
                    Akun Anda belum memiliki nomor WhatsApp terdaftar. Mohon isi nomor WhatsApp aktif Anda di bawah ini agar klinik dapat mengirimkan konfirmasi E-Ticket.
                  </Text>
                </View>
              </View>
            )}

            {/* Rincian Reservasi Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="receipt-outline" size={16} color={colors.goldDark} />
                <Text style={styles.summaryHeaderTitle}>RINGKASAN JADWAL TINDAKAN</Text>
              </View>

              <View style={styles.summaryItemRow}>
                <View style={styles.summaryIconWrap}>
                  <Ionicons name="sparkles" size={15} color={colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Layanan Perawatan Gigi</Text>
                  <Text style={styles.summaryValue}>{selectedService?.title || 'Perawatan Gigi'}</Text>
                  {selectedService?.category ? (
                    <Text style={styles.summarySubBadge}>{selectedService.category.toUpperCase()}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItemRow}>
                <View style={styles.summaryIconWrap}>
                  <Ionicons name="person" size={15} color={colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Dokter Spesialis</Text>
                  <Text style={styles.summaryValue}>{selectedDoctor?.name || 'Dokter Spesialis'}</Text>
                  <Text style={styles.summarySubText}>{selectedDoctor?.specialization || 'Dokter Gigi Spesialis'}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItemRow}>
                <View style={styles.summaryIconWrap}>
                  <Ionicons name="calendar" size={15} color={colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Waktu & Jadwal Praktik</Text>
                  <Text style={styles.summaryValue}>{activeDateItem?.fullDisplay}</Text>
                  <Text style={styles.summaryTimeBadge}>⏰ Pukul {selectedTimeSlot} WIB</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItemRow}>
                <View style={styles.summaryIconWrap}>
                  <Ionicons name="location" size={15} color={colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Lokasi Cabang Praktik</Text>
                  <Text style={styles.summaryValue}>{currentDaySchedules[0]?.location || 'Aesthetic Pondok Indah Main Branch'}</Text>
                  <Text style={styles.summarySubText}>Jl. Sapta Taruna Raya No.7, Pondok Pinang, Jaksel</Text>
                </View>
              </View>
            </View>

            {/* FORM DATA PASIEN */}
            <View style={styles.patientFormCard}>
              <Text style={styles.cardSectionTitle}>Data Pasien</Text>

              {/* Patient Name */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={styles.inputLabel}>Nama Lengkap Pasien</Text>
                  <Text style={styles.requiredMark}>*Wajib</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Nama Lengkap Pasien"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Patient WhatsApp (Mandatory for Google Login / All users) */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={styles.inputLabel}>Nomor WhatsApp Aktif</Text>
                  <Text style={[styles.requiredMark, isPhoneMissing ? { color: '#DC2626', fontWeight: '800' } : null]}>
                    *Wajib untuk Notifikasi & E-Ticket
                  </Text>
                </View>
                <View style={[styles.phoneInputWrap, isPhoneMissing ? styles.phoneInputWrapWarn : null]}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>🇮🇩 +62</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    placeholder="81234567890"
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {isPhoneMissing && (
                  <Text style={styles.inputHintWarn}>
                    * Harap masukkan nomor WhatsApp aktif Anda (min. 9 digit angka).
                  </Text>
                )}
              </View>

              {/* Complaint Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catatan Keluhan / Kebutuhan (Opsional)</Text>
                <TextInput
                  style={[styles.input, { minHeight: 68, textAlignVertical: 'top' }]}
                  value={complaintNotes}
                  onChangeText={setComplaintNotes}
                  placeholder="Tuliskan keluhan atau preferensi khusus..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
              </View>
            </View>

            {/* 2 PERSETUJUAN DOKUMEN RESMI (S&K + TANDA TANGAN DIGITAL) */}
            <View style={styles.patientFormCard}>
              <Text style={styles.cardSectionTitle}>Persetujuan Medis & Legalitas</Text>
              <Text style={styles.consentIntro}>
                Sesuai standar operasional klinik, silakan buka dan setujui 2 dokumen resmi di bawah ini:
              </Text>

              {/* 1. Syarat & Ketentuan Layanan */}
              <View style={[styles.agreementCard, isTermsAgreed ? styles.agreementCardDone : null]}>
                <View style={styles.agreementHeader}>
                  <View style={[styles.agreementIconWrap, isTermsAgreed ? { backgroundColor: '#ECFDF5' } : null]}>
                    <Ionicons name="document-text" size={18} color={isTermsAgreed ? '#059669' : colors.goldDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agreementTitle}>1. Syarat & Ketentuan Layanan</Text>
                    <Text style={styles.agreementDesc}>Kebijakan reservasi, kedatangan, & privasi klinik</Text>
                  </View>
                  <View style={[styles.statusPill, isTermsAgreed ? styles.statusPillDone : null]}>
                    <Ionicons name={isTermsAgreed ? 'checkmark-circle' : 'time-outline'} size={12} color={isTermsAgreed ? '#059669' : '#D97706'} />
                    <Text style={[styles.statusPillText, isTermsAgreed ? { color: '#059669' } : null]}>
                      {isTermsAgreed ? 'Disetujui' : 'Belum'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.agreementActionBtn, isTermsAgreed ? styles.agreementActionBtnDone : null]}
                  onPress={() => setShowTermsModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.agreementActionBtnText, isTermsAgreed ? { color: '#059669' } : null]}>
                    {isTermsAgreed ? 'Lihat Kembali Dokumen S&K' : 'Buka Pop-up & Setujui S&K'}
                  </Text>
                  <Ionicons name="open-outline" size={14} color={isTermsAgreed ? '#059669' : colors.goldDark} />
                </TouchableOpacity>
              </View>

              {/* 2. Surat Persetujuan Tindakan Medis & TTD Digital */}
              <View style={[styles.agreementCard, signatureData ? styles.agreementCardDone : null]}>
                <View style={styles.agreementHeader}>
                  <View style={[styles.agreementIconWrap, signatureData ? { backgroundColor: '#ECFDF5' } : null]}>
                    <Ionicons name="pencil" size={18} color={signatureData ? '#059669' : colors.goldDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agreementTitle}>2. Surat Persetujuan Tindakan Medis</Text>
                    <Text style={styles.agreementDesc}>Informed Consent & Tanda Tangan Digital Touchscreen</Text>
                  </View>
                  <View style={[styles.statusPill, signatureData ? styles.statusPillDone : null]}>
                    <Ionicons name={signatureData ? 'checkmark-circle' : 'time-outline'} size={12} color={signatureData ? '#059669' : '#D97706'} />
                    <Text style={[styles.statusPillText, signatureData ? { color: '#059669' } : null]}>
                      {signatureData ? 'Ditandatangani' : 'Belum'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.agreementActionBtn, signatureData ? styles.agreementActionBtnDone : null]}
                  onPress={() => setShowSignatureModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.agreementActionBtnText, signatureData ? { color: '#059669' } : null]}>
                    {signatureData ? 'Ubah Tanda Tangan Digital' : 'Buka Pop-up & Tandatangani'}
                  </Text>
                  <Ionicons name="create-outline" size={14} color={signatureData ? '#059669' : colors.goldDark} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!isTermsAgreed || !signatureData || isPhoneMissing || !patientName.trim() || isSubmitting) ? styles.submitBtnDisabled : null,
              ]}
              onPress={handleSubmitBooking}
              disabled={!isTermsAgreed || !signatureData || isPhoneMissing || !patientName.trim() || isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="calendar-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Kirim Permintaan Reservasi</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Validation Helper Notices */}
            {(!isTermsAgreed || !signatureData || isPhoneMissing || !patientName.trim()) && (
              <View style={styles.validationNoticeBox}>
                <Ionicons name="information-circle-outline" size={15} color="#D97706" />
                <Text style={styles.validationNoticeText}>
                  {isPhoneMissing
                    ? 'Mohon lengkapi Nomor WhatsApp aktif Anda di atas.'
                    : !patientName.trim()
                    ? 'Mohon lengkapi Nama Pasien di atas.'
                    : !isTermsAgreed
                    ? 'Buka dan setujui Dokumen Syarat & Ketentuan Layanan di atas.'
                    : 'Buka dan bubuhkan Tanda Tangan Digital pada Surat Persetujuan di atas.'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* POPUP MODAL 1: TERMS & CONDITIONS */}
      <TermsPdfModalNative
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setIsTermsAgreed(true)}
        isAgreed={isTermsAgreed}
      />

      {/* POPUP MODAL 2: DIGITAL SIGNATURE & INFORMED CONSENT */}
      <DigitalSignatureModalNative
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSaveSignature={(sig) => setSignatureData(sig)}
        patientName={patientName || user?.name || 'Pasien Klinik'}
        doctorName={selectedDoctor?.name || 'Dokter Spesialis'}
        serviceName={selectedService?.title || 'Pemeriksaan Gigi'}
        appointmentDate={activeDateItem?.fullDisplay + ' (' + selectedTimeSlot + ' WIB)'}
        initialSignature={signatureData}
      />

      {/* SUCCESS E-TICKET MODAL */}
      <Modal
        visible={isSuccessModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSuccessModalOpen(false);
          router.replace('/(tabs)/booking');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.successHeader}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={44} color="#059669" />
              </View>
              <Text style={styles.successTitle}>Reservasi Berhasil Dikirim!</Text>
              <Text style={styles.successSubtitle}>Jadwal Anda sedang diproses oleh tim kami.</Text>
            </View>

            {/* Ticket Box */}
            <View style={styles.ticketBox}>
              <View style={styles.ticketCodeRow}>
                <Text style={styles.ticketCodeLabel}>KODE BOOKING</Text>
                <Text style={styles.ticketCodeVal}>{successTicket?.code}</Text>
              </View>
              <View style={styles.ticketDivider} />

              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMetaLabel}>Pasien:</Text>
                <Text style={styles.ticketMetaVal}>{successTicket?.patientName}</Text>
              </View>
              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMetaLabel}>No. WhatsApp:</Text>
                <Text style={styles.ticketMetaVal}>{successTicket?.patientPhone}</Text>
              </View>
              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMetaLabel}>Layanan:</Text>
                <Text style={styles.ticketMetaVal}>{successTicket?.service}</Text>
              </View>
              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMetaLabel}>Dokter:</Text>
                <Text style={styles.ticketMetaVal}>drg. {successTicket?.doctor}</Text>
              </View>
              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMetaLabel}>Waktu:</Text>
                <Text style={styles.ticketMetaVal}>{successTicket?.date} · {successTicket?.time}</Text>
              </View>
              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMetaLabel}>Lokasi:</Text>
                <Text style={styles.ticketMetaVal}>{successTicket?.location || 'Pondok Indah'}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.waConfirmBtn}
                onPress={handleOpenWhatsAppConfirmation}
                activeOpacity={0.88}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.waConfirmBtnText}>Konfirmasi via WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setIsSuccessModalOpen(false);
                  router.replace('/(tabs)/booking');
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.doneBtnText}>Lihat Riwayat Janji Temu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  headerSubtitle: { fontSize: 11, color: colors.goldDark, fontWeight: '600', marginTop: 1 },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8DFC8',
  },
  progressBarActive: {
    backgroundColor: colors.gold,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    gap: spacing.sm,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.charcoal,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.charcoalMedium,
    marginBottom: spacing.xs,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.charcoal,
  },
  categoryScroll: {
    marginBottom: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoalMedium,
  },
  categoryPillTextActive: {
    color: colors.goldDark,
    fontWeight: '700',
  },
  serviceList: {
    gap: spacing.sm,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  serviceCardActive: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
  },
  serviceThumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  serviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  serviceCategoryBadge: {
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceCategoryText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.goldDark,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 10,
    color: colors.charcoalMedium,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
  },
  serviceDesc: {
    fontSize: 11,
    color: colors.charcoalMedium,
    lineHeight: 16,
    marginTop: 2,
  },
  doctorList: {
    gap: spacing.sm,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  doctorCardActive: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.gold,
  },
  doctorAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  doctorAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.goldDark,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
  },
  doctorSpec: {
    fontSize: 11.5,
    color: colors.goldDark,
    fontWeight: '600',
    marginTop: 1,
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.charcoal,
  },
  scheduleCardSub: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  activeDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  activeDateBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.goldDark,
  },
  dateScroll: {
    marginBottom: 2,
  },
  dateCard: {
    width: 66,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  dateCardActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  dateCardOff: {
    backgroundColor: '#FBF9F5',
    borderColor: '#EFE9DE',
  },
  dateDayName: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.charcoalMedium,
  },
  dateDayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
  },
  practiceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  practiceBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  practiceBadgeOn: {
    backgroundColor: '#FAF5EA',
  },
  practiceBadgeOff: {
    backgroundColor: '#F3EFEA',
  },
  practiceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  slotsCountBadge: {
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  slotsCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
  },
  sessionInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCFAF6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F0E6D3',
    marginBottom: 4,
  },
  sessionInfoText: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    flex: 1,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  timeBtn: {
    flexBasis: '22%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#FAF8F5',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  timeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  holidayBanner: {
    backgroundColor: '#FAF5EA',
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    gap: 4,
  },
  holidayBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 4,
  },
  holidayBannerDesc: {
    fontSize: 11.5,
    color: colors.charcoalMedium,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 6,
  },
  switchDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginTop: 4,
  },
  switchDateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  googlePhoneBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  googlePhoneIconWrap: {
    marginTop: 1,
  },
  googlePhoneTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
  },
  googlePhoneDesc: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D3',
  },
  summaryHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.goldDark,
    letterSpacing: 0.5,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  summaryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  summaryLabel: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 1,
  },
  summarySubBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '700',
    color: colors.goldDark,
    marginTop: 3,
  },
  summarySubText: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  summaryTimeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldDark,
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F5EFE6',
  },
  patientFormCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: 2,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.charcoal,
  },
  requiredMark: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
  },
  input: {
    backgroundColor: '#FAFAF8',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  phoneInputWrapWarn: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  phonePrefix: {
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  phonePrefixText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.charcoal,
  },
  inputHintWarn: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  consentIntro: {
    fontSize: 11,
    color: colors.charcoalMedium,
    lineHeight: 16,
  },
  agreementCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    gap: 10,
  },
  agreementCardDone: {
    backgroundColor: '#FDFBF7',
    borderColor: '#D1FAE5',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  agreementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  agreementIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreementTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.charcoal,
  },
  agreementDesc: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: '#FEF3C7',
  },
  statusPillDone: {
    backgroundColor: '#ECFDF5',
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D97706',
  },
  agreementActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  agreementActionBtnDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  agreementActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.goldDark,
  },
  submitBtn: {
    height: 48,
    backgroundColor: colors.gold,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  submitBtnDisabled: {
    backgroundColor: '#D1C4A5',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  validationNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    marginTop: 4,
  },
  validationNoticeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 11,
    color: colors.charcoalMedium,
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  successHeader: {
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D3',
  },
  successIconCircle: {
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 11,
    color: colors.charcoalMedium,
    textAlign: 'center',
    marginTop: 2,
  },
  ticketBox: {
    padding: spacing.md,
    gap: 6,
  },
  ticketCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C7E6C',
  },
  ticketCodeVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.goldDark,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#F0E6D3',
    marginVertical: 4,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketMetaLabel: {
    fontSize: 11,
    color: colors.charcoalMedium,
  },
  ticketMetaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
  },
  modalActions: {
    padding: spacing.md,
    paddingTop: 0,
    gap: 8,
  },
  waConfirmBtn: {
    height: 42,
    backgroundColor: '#25D366',
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  doneBtn: {
    height: 40,
    backgroundColor: colors.cream,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneBtnText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
});
