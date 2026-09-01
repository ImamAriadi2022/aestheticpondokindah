import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, Alert, Modal, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { doctorService } from '@/services/doctorService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'scaling-polishing',
    name: 'Scaling & Polishing',
    category: 'Umum',
    duration: '30–45 mnt',
    description: 'Pembersihan karang gigi menyeluruh dan pemolesan untuk mencegah radang gusi.',
    icon: 'sparkles-outline',
  },
  {
    id: 'dental-whitening',
    name: 'Dental Whitening',
    category: 'Estetik',
    duration: '60–90 mnt',
    description: 'Perawatan pemutihan gigi profesional untuk senyum lebih cerah dan percaya diri.',
    icon: 'flash-outline',
  },
  {
    id: 'dental-filling',
    name: 'Tambal Gigi Komposit Estetik',
    category: 'Umum',
    duration: '30–45 mnt',
    description: 'Penambalan gigi berlubang menggunakan resin komposit sewarna gigi asli.',
    icon: 'medkit-outline',
  },
  {
    id: 'porcelain-veneers',
    name: 'Porcelain Veneers',
    category: 'Estetik',
    duration: '90 mnt',
    description: 'Lapisan porselen tipis presisi tinggi untuk memperbaiki bentuk & warna gigi.',
    icon: 'diamond-outline',
  },
  {
    id: 'root-canal',
    name: 'Perawatan Saluran Akar (Root Canal)',
    category: 'Umum',
    duration: '60–90 mnt',
    description: 'Perawatan saraf gigi terinfeksi untuk mempertahankan gigi alami.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'invisalign',
    name: 'Invisalign Clear Aligners',
    category: 'Ortodonti',
    duration: '45 mnt',
    description: 'Perataan susunan gigi transparan modern tanpa kawat behel konvensional.',
    icon: 'grid-outline',
  },
  {
    id: 'dental-extraction',
    name: 'Pencabutan / Odontektomi Gigi Bungsu',
    category: 'Bedah Mulut',
    duration: '45–60 mnt',
    description: 'Pencabutan gigi bungsu impaksi dengan pembiusan lokal yang aman dan minim trauma.',
    icon: 'cut-outline',
  },
  {
    id: 'pediatric-cleaning',
    name: 'Pemeriksaan & Fluoride Gigi Anak',
    category: 'Gigi Anak',
    duration: '30 mnt',
    description: 'Pencegahan gigi berlubang dan aplikasi topical fluoride ramah anak.',
    icon: 'happy-outline',
  },
];

const CATEGORIES = ['Semua', 'Umum', 'Estetik', 'Ortodonti', 'Bedah Mulut', 'Gigi Anak'];

const DEFAULT_TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '16:00', '17:00', '18:00', '19:00',
];

const INITIAL_DOCTORS = [
  { id: 3, name: 'drg. Yulita Dora', specialization: 'Aesthetic & Cosmetic Dentistry', university: 'Universitas Indonesia' },
  { id: 4, name: 'drg. Achmad Riwandy', specialization: 'General Dentistry', university: 'Universitas Airlangga' },
  { id: 5, name: 'drg. Della Sparringa', specialization: 'Preventive Dentistry', university: 'Universitas Padjadjaran' },
  { id: 6, name: 'drg. Nadia Safira, Sp.Ort', specialization: 'Spesialis Ortodonti (Behel & Aligner)', university: 'Universitas Gadjah Mada' },
  { id: 7, name: 'drg. Eric Sulistio, Sp.Perio', specialization: 'Spesialis Periodonsia & Implan', university: 'Universitas Indonesia' },
  { id: 8, name: 'drg. Yudy Ardila Utomo, Sp.BMM', specialization: 'Spesialis Bedah Mulut & Maksilofasial', university: 'Universitas Indonesia' },
];

function parseTimeRangeToSlots(timeRange: string): string[] {
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
          const slotStr = `${hh}:${mm}`;
          if (!allSlots.includes(slotStr)) {
            allSlots.push(slotStr);
          }
          currentTotalM += 30;
        }
      }
    }
  }

  return allSlots.length > 0 ? allSlots : DEFAULT_TIME_SLOTS;
}

export default function NewBookingScreen() {
  const { user } = useAuth();

  // 4 Steps: 1: Layanan, 2: Dokter, 3: Jadwal, 4: Konfirmasi
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected Service & Category Filter
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchService, setSearchService] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem>(SERVICES_CATALOG[0]);

  // Step 2: Doctors List & Selected Doctor
  const [doctors, setDoctors] = useState<any[]>(INITIAL_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(INITIAL_DOCTORS[0]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Doctor Schedules from Database
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);

  // Step 3: Selected Date & Time Slot
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(DEFAULT_TIME_SLOTS[0]);

  // Step 4: Confirmation & Notes
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || (user as any)?.whatsapp || '');
  const [complaintNotes, setComplaintNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal
  const [successTicket, setSuccessTicket] = useState<any | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Fetch doctors & doctor schedules from database
  useEffect(() => {
    doctorService.getPublicDoctors()
      .then((list: any[]) => {
        if (list && list.length > 0) {
          setDoctors(list);
          setSelectedDoctor(list[0]);
        }
      })
      .catch(() => {});

    bookingService.getPublicDoctorSchedules()
      .then((schedules: any[]) => {
        if (Array.isArray(schedules)) {
          setDoctorSchedules(schedules);
        }
      })
      .catch(() => {});
  }, []);

  // Generate 14 available booking dates with database practice schedule check
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const dayName = days[dayIndex];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];

      // Check against database schedules
      let matchingSchedule: any = null;
      if (selectedDoctor && doctorSchedules.length > 0) {
        matchingSchedule = doctorSchedules.find((s) => {
          const matchDoc = String(s.doctorId) === String(selectedDoctor.id) ||
            String(s.doctorId) === String(selectedDoctor.userId) ||
            (s.doctorName && selectedDoctor.name && (
              s.doctorName.toLowerCase().includes(selectedDoctor.name.toLowerCase()) ||
              selectedDoctor.name.toLowerCase().includes(s.doctorName.toLowerCase())
            ));
          const matchDate = s.date === iso;
          return matchDoc && matchDate;
        });
      }

      // If database has schedules, use exact schedule status.
      // If doctor has no specific schedule on this date or clinic is closed on Sunday:
      let isPractice = false;
      let timeSlotsForDay = DEFAULT_TIME_SLOTS;

      if (matchingSchedule) {
        isPractice = !matchingSchedule.isFull;
        if (matchingSchedule.timeRange) {
          timeSlotsForDay = parseTimeRangeToSlots(matchingSchedule.timeRange);
        }
      } else if (doctorSchedules.length > 0) {
        // Database has schedules loaded, but this doctor is not scheduled for this date
        isPractice = false;
      } else {
        // Fallback default: Senin - Sabtu adalah hari praktik, Minggu adalah hari libur
        isPractice = dayIndex !== 0;
      }

      dates.push({
        iso,
        dayName,
        dayNum,
        monthName,
        isPractice,
        timeSlots: timeSlotsForDay,
        descText: isPractice ? 'Praktik' : 'Libur',
        fullDisplay: `${dayName}, ${dayNum} ${monthName} ${d.getFullYear()}`,
      });
    }
    return dates;
  }, [selectedDoctor, doctorSchedules]);

  // When doctor changes or dates update, auto-select first available practice day
  useEffect(() => {
    const firstPracticeIdx = availableDates.findIndex((d) => d.isPractice);
    if (firstPracticeIdx !== -1 && !availableDates[selectedDateIndex]?.isPractice) {
      setSelectedDateIndex(firstPracticeIdx);
    }
  }, [selectedDoctor, availableDates]);

  const activeDateItem = availableDates[selectedDateIndex] || availableDates[0];
  const activeTimeSlots = activeDateItem?.isPractice ? (activeDateItem.timeSlots || DEFAULT_TIME_SLOTS) : [];

  const filteredServices = useMemo(() => {
    return SERVICES_CATALOG.filter((s) => {
      const matchCat = selectedCategory === 'Semua' || s.category === selectedCategory;
      const matchQuery = !searchService.trim() ||
        s.name.toLowerCase().includes(searchService.toLowerCase()) ||
        s.description.toLowerCase().includes(searchService.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchService]);

  // 1. Service Click Handler: Auto-advance to Step 2
  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  // 2. Doctor Click Handler: Auto-advance to Step 3
  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc);
    setCurrentStep(3);
  };

  // 3. Time Slot Click Handler: Auto-advance to Step 4
  const handleSelectTimeSlot = (slot: string) => {
    setSelectedTimeSlot(slot);
    setCurrentStep(4);
  };

  const handleSubmitBooking = async () => {
    if (!patientName.trim() || !patientPhone.trim()) {
      Alert.alert('Perhatian', 'Nama lengkap dan nomor WhatsApp pasien wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const chosenDate = activeDateItem?.iso;

    try {
      const res = await bookingService.createReservation({
        treatment_interest: selectedService.name,
        doctor_id: selectedDoctor?.id || null,
        branch_id: 1,
        date: chosenDate,
        preferred_time: selectedTimeSlot,
        complaint: complaintNotes.trim() || `Reservasi ${selectedService.name} bersama ${selectedDoctor?.name || 'Dokter Spesialis'}`,
      });

      const ticketCode = res.code || (res.reservation as any)?.code || `#RSV-${new Date().getFullYear()}001`;
      const ticket = {
        code: ticketCode,
        service: selectedService.name,
        doctor: selectedDoctor?.name || 'Dokter Spesialis',
        date: activeDateItem?.fullDisplay,
        time: `${selectedTimeSlot} WIB`,
        patientName: patientName,
        patientPhone: patientPhone,
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
    const waMsg = [
      '*KONFIRMASI RESERVASI JANJI TEMU DOKTER GIGI*',
      '*Aesthetic Pondok Indah Dental Clinic*',
      '━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      'Halo Admin Aesthetic Pondok Indah, saya telah membuat reservasi janji temu melalui aplikasi mobile dengan rincian berikut:',
      '',
      `📋 *Kode Reservasi:* ${successTicket.code}`,
      `👤 *Nama Pasien:* ${successTicket.patientName}`,
      `📱 *No. WhatsApp:* ${successTicket.patientPhone}`,
      '',
      `👨‍⚕️ *Dokter Spesialis:* ${successTicket.doctor}`,
      `🏥 *Layanan Perawatan:* ${successTicket.service}`,
      `📅 *Tanggal:* ${successTicket.date}`,
      `⏰ *Waktu/Jam:* ${successTicket.time}`,
      `📍 *Lokasi:* Aesthetic Pondok Indah, Jakarta Selatan`,
      complaintNotes ? `📝 *Catatan:* ${complaintNotes}` : '',
      '',
      'Mohon verifikasi ketersediaan jadwal tersebut. Terima kasih! 🙏',
    ].filter(Boolean).join('\n');

    Linking.openURL(`https://wa.me/6281990114949?text=${encodeURIComponent(waMsg)}`);
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
        {/* ================= STEP 1: PILIH LAYANAN (AUTO-ADVANCE) ================= */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Pilih Layanan Perawatan Gigi</Text>
            <Text style={styles.sectionDesc}>Ketuk salah satu layanan untuk langsung melanjutkan ke pemilihan dokter.</Text>

            {/* Search Bar */}
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.charcoalMedium} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari perawatan (e.g. Scaling, Whitening)..."
                placeholderTextColor="#9CA3AF"
                value={searchService}
                onChangeText={setSearchService}
              />
            </View>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((cat) => (
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

            {/* Service Cards */}
            <View style={styles.serviceList}>
              {filteredServices.map((service) => {
                const isSelected = selectedService.id === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[styles.serviceCard, isSelected ? styles.serviceCardActive : null]}
                    onPress={() => handleSelectService(service)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.serviceIconWrap}>
                      <Ionicons name={service.icon} size={22} color={colors.goldDark} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.serviceBadgeRow}>
                        <View style={styles.serviceCategoryBadge}>
                          <Text style={styles.serviceCategoryText}>{service.category.toUpperCase()}</Text>
                        </View>
                        <View style={styles.durationTag}>
                          <Ionicons name="time-outline" size={11} color={colors.charcoalMedium} />
                          <Text style={styles.durationText}>{service.duration}</Text>
                        </View>
                      </View>
                      <Text style={[styles.serviceName, isSelected ? { color: colors.goldDark } : null]}>
                        {service.name}
                      </Text>
                      <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.gold} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ================= STEP 2: PILIH DOKTER (AUTO-ADVANCE) ================= */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Pilih Dokter Gigi Spesialis</Text>
            <Text style={styles.sectionDesc}>Ketuk nama dokter untuk langsung memilih jadwal praktik.</Text>

            {isLoadingDoctors ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.xl }} />
            ) : (
              <View style={styles.doctorList}>
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <TouchableOpacity
                      key={doc.id}
                      style={[styles.doctorCard, isSelected ? styles.doctorCardActive : null]}
                      onPress={() => handleSelectDoctor(doc)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.doctorAvatar}>
                        <Text style={styles.doctorAvatarText}>
                          {doc.name?.replace('drg.', '')?.trim()?.[0] || 'D'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.doctorName, isSelected ? { color: colors.goldDark } : null]}>
                          {doc.name}
                        </Text>
                        <Text style={styles.doctorSpec}>{doc.specialization || 'Dokter Gigi Spesialis'}</Text>
                        <View style={styles.metaRow}>
                          <Ionicons name="school-outline" size={12} color={colors.charcoalMedium} />
                          <Text style={styles.doctorMeta}>{doc.university || 'Universitas Indonesia'}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.gold} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ================= STEP 3: PILIH JADWAL & JAM (DATABASE CHECK) ================= */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Pilih Tanggal & Jam Praktik</Text>
            <Text style={styles.sectionDesc}>
              Jadwal dokter {selectedDoctor?.name || 'spesialis'} di klinik Aesthetic Pondok Indah.
            </Text>

            {/* Horizontal Date Picker */}
            <Text style={styles.subHeading}>1. Pilih Tanggal Praktik</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={{ gap: 8 }}>
              {availableDates.map((d, idx) => {
                const isSelected = selectedDateIndex === idx;
                return (
                  <TouchableOpacity
                    key={d.iso}
                    style={[styles.dateCard, isSelected ? styles.dateCardActive : null]}
                    onPress={() => setSelectedDateIndex(idx)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.dateDayName, isSelected ? styles.dateTextActive : null]}>{d.dayName}</Text>
                    <Text style={[styles.dateDayNum, isSelected ? styles.dateTextActive : null]}>{d.dayNum}</Text>
                    <Text style={[styles.dateDesc, isSelected ? styles.dateTextActive : null]}>{d.descText}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time Slots or Holiday Message */}
            <Text style={[styles.subHeading, { marginTop: spacing.lg }]}>2. Pilih Jam Praktik</Text>
            {activeDateItem?.isPractice ? (
              <View style={styles.timeGrid}>
                {activeTimeSlots.map((slot: string) => {
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
            ) : (
              <View style={styles.holidayBanner}>
                <Ionicons name="calendar-outline" size={28} color={colors.goldDark} style={{ marginBottom: 6 }} />
                <Text style={styles.holidayBannerTitle}>Tidak Ada Jadwal Praktik (Hari Libur)</Text>
                <Text style={styles.holidayBannerDesc}>
                  Dokter {selectedDoctor?.name} tidak berpraktik pada {activeDateItem?.fullDisplay}. Silakan pilih tanggal praktik lainnya yang bertanda "Praktik".
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ================= STEP 4: KONFIRMASI ================= */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Konfirmasi Rincian Reservasi</Text>
            <Text style={styles.sectionDesc}>Periksa kembali rincian janji temu Anda sebelum konfirmasi.</Text>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Layanan Perawatan</Text>
                <Text style={styles.summaryValue}>{selectedService.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Dokter Spesialis</Text>
                <Text style={styles.summaryValue}>{selectedDoctor?.name || 'Dokter Spesialis'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jadwal Praktik</Text>
                <Text style={styles.summaryValue}>
                  {activeDateItem?.fullDisplay} · {selectedTimeSlot} WIB
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>Lokasi Klinik</Text>
                <Text style={styles.summaryValue}>Aesthetic Pondok Indah, Jaksel</Text>
              </View>
            </View>

            {/* Patient Form */}
            <Text style={[styles.subHeading, { marginTop: spacing.md }]}>Data Pasien</Text>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              value={patientName}
              onChangeText={setPatientName}
              placeholder="Nama Pasien"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={patientPhone}
              onChangeText={setPatientPhone}
              placeholder="08123456789"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Catatan Keluhan (Opsional)</Text>
            <TextInput
              style={[styles.input, { minHeight: 70 }]}
              value={complaintNotes}
              onChangeText={setComplaintNotes}
              placeholder="Tuliskan keluhan atau permintaan khusus..."
              placeholderTextColor="#9CA3AF"
              multiline
            />

            {/* Submit Action */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.primaryBtn, isSubmitting ? { opacity: 0.7 } : null]}
                onPress={handleSubmitBooking}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Konfirmasi & Buat Janji Temu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL E-TIKET SUKSES */}
      <Modal visible={isSuccessModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.ticketCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
            <Text style={styles.ticketHeading}>Reservasi Berhasil Diajukan!</Text>
            <Text style={styles.ticketSub}>Kode Tiket Reservasi Anda:</Text>
            <View style={styles.ticketCodeBadge}>
              <Text style={styles.ticketCodeText}>{successTicket?.code}</Text>
            </View>

            <View style={styles.ticketDetails}>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketRowLabel}>Layanan:</Text>
                <Text style={styles.ticketRowValue}>{successTicket?.service}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketRowLabel}>Dokter:</Text>
                <Text style={styles.ticketRowValue}>{successTicket?.doctor}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketRowLabel}>Jadwal:</Text>
                <Text style={styles.ticketRowValue}>{successTicket?.date} · {successTicket?.time}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.waConfirmBtn} onPress={handleOpenWhatsAppConfirmation} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.waConfirmBtnText}>Konfirmasi ke WhatsApp Klinik</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setIsSuccessModalOpen(false);
                router.replace('/(tabs)/booking');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Lihat Daftar Janji Temu</Text>
            </TouchableOpacity>
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
  progressRow: { flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingBottom: 10, gap: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E8DFC8' },
  progressBarActive: { backgroundColor: colors.gold },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  stepContainer: {},
  sectionHeading: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  sectionDesc: { fontSize: 12, color: colors.charcoalMedium, marginTop: 2, marginBottom: spacing.md },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, height: 42, fontSize: 13, color: colors.charcoal },
  categoryScroll: { marginBottom: spacing.md },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  categoryPillText: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium },
  categoryPillTextActive: { color: '#fff', fontWeight: '700' },
  serviceList: { gap: spacing.sm },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  serviceCardActive: { borderColor: colors.gold, borderWidth: 1.5, backgroundColor: '#FAF5EA' },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  serviceCategoryBadge: { backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#F0E6D3', borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 1 },
  serviceCategoryText: { fontSize: 8, fontWeight: '700', color: colors.goldDark },
  durationTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  durationText: { fontSize: 10, color: colors.charcoalMedium },
  serviceName: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  serviceDesc: { fontSize: 11, color: colors.charcoalMedium, marginTop: 2, lineHeight: 16 },
  doctorList: { gap: spacing.sm },
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
  doctorCardActive: { borderColor: colors.gold, borderWidth: 1.5, backgroundColor: '#FAF5EA' },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2416',
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarText: { fontSize: 20, fontWeight: '800', color: colors.gold },
  doctorName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  doctorSpec: { fontSize: 12, color: colors.goldDark, fontWeight: '600', marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  doctorMeta: { fontSize: 11, color: colors.charcoalMedium },
  subHeading: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.xs },
  dateScroll: { marginBottom: spacing.xs },
  dateCard: {
    width: 68,
    height: 82,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateCardActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  dateDayName: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium },
  dateDayNum: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  dateDesc: { fontSize: 10, fontWeight: '600', color: colors.charcoalMedium },
  dateTextActive: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: {
    width: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  timeBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  timeBtnText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  holidayBanner: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  holidayBannerTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  holidayBannerDesc: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  summaryLabel: { fontSize: 12, color: colors.charcoalMedium },
  summaryValue: { fontSize: 12, fontWeight: '700', color: colors.charcoal, maxWidth: '60%', textAlign: 'right' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.charcoal, marginTop: spacing.sm, marginBottom: 4 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.charcoal,
  },
  bottomBar: { marginTop: spacing.lg, marginBottom: spacing.xl },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: 14,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ticketHeading: { fontSize: 17, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  ticketSub: { fontSize: 12, color: colors.charcoalMedium, marginTop: 4 },
  ticketCodeBadge: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: spacing.md,
  },
  ticketCodeText: { fontSize: 16, fontWeight: '800', color: colors.goldDark, letterSpacing: 1 },
  ticketDetails: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 8,
    marginBottom: spacing.lg,
  },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketRowLabel: { fontSize: 12, color: colors.charcoalMedium },
  ticketRowValue: { fontSize: 12, fontWeight: '700', color: colors.charcoal, textAlign: 'right', flex: 1, marginLeft: 8 },
  waConfirmBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: radius.full,
    paddingVertical: 13,
    marginBottom: 8,
  },
  waConfirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  doneBtn: { paddingVertical: 8 },
  doneBtnText: { color: colors.charcoalMedium, fontSize: 12, fontWeight: '600' },
});
