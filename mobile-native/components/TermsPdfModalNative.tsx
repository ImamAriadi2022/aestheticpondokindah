import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator,
} from "react-native";
import { colors, spacing, radius } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { bookingService, ClinicSettingsData } from "@/services/bookingService";

interface TermsPdfModalNativeProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isAgreed: boolean;
}

export default function TermsPdfModalNative({
  isOpen,
  onClose,
  onAccept,
  isAgreed,
}: TermsPdfModalNativeProps) {
  const [checked, setChecked] = useState(isAgreed);
  const [settings, setSettings] = useState<ClinicSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setChecked(isAgreed);
  }, [isAgreed, isOpen]);

  useEffect(() => {
    if (isOpen && !settings) {
      setIsLoading(true);
      bookingService.getPublicSettings()
        .then((s) => {
          setSettings(s);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    if (!checked) return;
    onAccept();
    onClose();
  };

  const termsText = settings?.booking_terms || "";
  const pdfTerms = settings?.pdf_terms_and_conditions;
  const clinicName = pdfTerms?.kop?.clinicName || "AESTHETIC PONDOK INDAH";
  const clinicAddress = pdfTerms?.kop?.address || "Jl. Sapta Taruna Raya No.7, Pondok Pinang, Kebayoran Lama, Jakarta Selatan";
  const clinicPhone = pdfTerms?.kop?.phone || "+62 21 555 1900";

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIcon}>
                <Ionicons name="document-text" size={18} color={colors.goldDark} />
              </View>
              <View>
                <Text style={styles.headerTitle}>SYARAT & KETENTUAN</Text>
                <Text style={styles.headerSub}>{clinicName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.charcoal} />
            </TouchableOpacity>
          </View>

          {/* Document Content */}
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={true}>
            {isLoading ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.xl }} />
            ) : (
              <View style={styles.docBox}>
                <Text style={styles.docHeader}>KEBIJAKAN & PERJANJIAN LAYANAN PASIEN</Text>
                <Text style={styles.docSub}>{clinicAddress} · Telp: {clinicPhone}</Text>
                <View style={styles.divider} />

                {termsText ? (
                  <Text style={styles.paragraph}>{termsText}</Text>
                ) : Array.isArray(pdfTerms?.sections) ? (
                  pdfTerms.sections.map((sec: any, idx: number) => (
                    <View key={idx} style={{ marginBottom: 12 }}>
                      <Text style={styles.sectionTitle}>{sec.title || sec.heading}</Text>
                      {Array.isArray(sec.clauses) ? (
                        sec.clauses.map((cl: string, cIdx: number) => (
                          <Text key={cIdx} style={styles.paragraph}>• {cl}</Text>
                        ))
                      ) : (
                        <Text style={styles.paragraph}>{sec.content || sec.text}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View>
                    <Text style={styles.sectionTitle}>1. Ketentuan Umum Reservasi & Kedatangan</Text>
                    <Text style={styles.paragraph}>
                      1.1. Pasien diharapkan hadir minimal 10–15 menit sebelum waktu jadwal janji temu untuk keperluan administrasi dan persiapan rekam medis digital.
                    </Text>
                    <Text style={styles.paragraph}>
                      1.2. Keterlambatan lebih dari 20 menit dari waktu jadwal yang telah disepakati dapat mengakibatkan penyesuaian durasi atau penjadwalan ulang agar tidak mengganggu antrean pasien lain.
                    </Text>
                    <Text style={styles.sectionTitle}>2. Kebijakan Pembatalan & Penjadwalan Ulang</Text>
                    <Text style={styles.paragraph}>
                      2.1. Pembatalan atau perubahan jadwal dapat dilakukan secara mandiri melalui aplikasi mobile selambat-lambatnya 3 jam sebelum jadwal tindakan.
                    </Text>
                    <Text style={styles.paragraph}>
                      3.1. Pasien berhak mendapatkan penjelasan medis yang transparan, estimasi biaya, serta penanganan profesional dengan standar sterilisasi dental internasional.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer with Checkbox and Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setChecked(!checked)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, checked ? styles.checkboxActive : null]}>
                {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Saya telah membaca, memahami, dan menyetujui seluruh <Text style={{ fontWeight: "700", color: colors.goldDark }}>Syarat & Ketentuan Layanan</Text> di atas.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptBtn, !checked ? styles.acceptBtnDisabled : null]}
              onPress={handleSave}
              disabled={!checked}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.acceptBtnText}>Simpan & Setujui S&K</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAF5EA",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E6D3",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0E6D3",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 10,
    color: colors.charcoalMedium,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0E6D3",
  },
  bodyScroll: {
    padding: spacing.md,
    maxHeight: 380,
  },
  docBox: {
    backgroundColor: "#FCFAF6",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#F0E6D3",
  },
  docHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.charcoal,
    textAlign: "center",
  },
  docSub: {
    fontSize: 9,
    color: colors.charcoalMedium,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8DFC8",
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.goldDark,
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    lineHeight: 16,
    marginBottom: 6,
  },
  footer: {
    backgroundColor: "#FAF5EA",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F0E6D3",
    gap: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.goldDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    backgroundColor: colors.white,
  },
  checkboxActive: {
    backgroundColor: colors.goldDark,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11,
    color: colors.charcoal,
    lineHeight: 16,
  },
  acceptBtn: {
    height: 44,
    backgroundColor: colors.gold,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtnDisabled: {
    backgroundColor: "#D1C4A5",
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});