import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { colors, spacing, radius } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { bookingService, ClinicSettingsData } from "@/services/bookingService";

interface TermsPdfModalNativeProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (name?: string) => void;
  isAgreed: boolean;
  patientName?: string;
  readOnly?: boolean;
}

export default function TermsPdfModalNative({
  isOpen,
  onClose,
  onAccept,
  isAgreed,
  patientName = "",
  readOnly = false,
}: TermsPdfModalNativeProps) {
  const [checked, setChecked] = useState(isAgreed);
  const [fullName, setFullName] = useState(patientName);
  const [settings, setSettings] = useState<ClinicSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setChecked(isAgreed);
  }, [isAgreed, isOpen]);

  useEffect(() => {
    if (patientName) {
      setFullName(patientName);
    }
  }, [patientName]);

  useEffect(() => {
    if (isOpen && !settings) {
      setIsLoading(true);
      bookingService
        .getPublicSettings()
        .then((s) => {
          setSettings(s);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    if (!checked) {
      setErrorMessage("Harap centang kotak persetujuan Syarat dan Ketentuan.");
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage("Harap lengkapi Nama Pasien.");
      return;
    }
    setErrorMessage(null);
    onAccept(fullName.trim());
    onClose();
  };

  const pdfTerms = settings?.pdf_terms_and_conditions;
  const clinicName = pdfTerms?.kop?.clinicName || "AESTHETIC PONDOK INDAH";
  const clinicAddress =
    pdfTerms?.kop?.address ||
    "Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310";
  const clinicPhone = pdfTerms?.kop?.phone || "021-7695948 | 0812-3456-7890";
  const clinicEmail = pdfTerms?.kop?.email || "aesthetic.pondokindah@gmail.com";

  const docTitle =
    pdfTerms?.docTitle || "SYARAT DAN KETENTUAN LAYANAN & PERAWATAN GIGI";
  const docSubtitle =
    pdfTerms?.docSubtitle ||
    "Harap baca dan berikan tanda centang persetujuan Anda di bawah ini";
  const footerNote =
    pdfTerms?.footerNote ||
    "Dokumen ini sah dan diterbitkan secara digital oleh Aesthetic Pondok Indah Dental Clinic.";

  // Standard clauses matching website
  const standardClauses = [
    {
      title: "1. Ketentuan Reservasi & Janji Temu",
      content:
        "Permintaan reservasi yang diajukan secara daring akan diproses oleh staf admin dan dikonfirmasi melalui sistem notifikasi resmi dan WhatsApp.",
    },
    {
      title: "2. Waktu Kedatangan & Keterlambatan",
      content:
        "Pasien diharapkan hadir di klinik minimal 10 menit sebelum waktu janji temu. Keterlambatan lebih dari 15 menit dapat menyebabkan penyesuaian jadwal antrean demi kenyamanan pasien lain.",
    },
    {
      title: "3. Kebijakan Pembatalan & Penjadwalan Ulang",
      content:
        "Pembatalan atau perubahan jadwal wajib diinformasikan selambat-lambatnya 2 jam sebelum waktu kunjungan agar jadwal dapat dialihkan.",
    },
    {
      title: "4. Rekam Medis & Kerahasiaan Data",
      content:
        "Seluruh data riwayat medis, foto rontgen, dan identitas pasien tersimpan dalam sistem Rekam Medis Elektronik berenkripsi dan dilindungi kerahasiaannya.",
    },
    {
      title: "5. Pembayaran, Biaya & Kebijakan Transaksi",
      content:
        "Biaya tindakan medis disesuaikan dengan jenis perawatan, tingkat kesulitan klinis, dan bahan medis yang disetujui pasien sebelum tindakan dimulai.",
    },
    {
      title: "6. Garansi & Perawatan Pasca Tindakan",
      content:
        "Klinik memberikan jaminan kualitas pengerjaan medis sesuai standar baku profesi kedokteran gigi dengan syarat pasien mematuhi anjuran kontrol pasca tindakan.",
    },
  ];

  const sectionsToRender =
    Array.isArray(pdfTerms?.sections) && pdfTerms.sections.length > 0
      ? pdfTerms.sections
      : standardClauses;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Modal Header Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="document-text" size={16} color="#1F2937" />
              </View>
              <View>
                <Text style={styles.modalHeaderTitle}>Syarat dan Ketentuan</Text>
                <Text style={styles.modalHeaderSub}>
                  Dokumen Resmi Syarat dan Ketentuan Layanan Pasien
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Paper Document Preview Container */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* White Paper Sheet */}
            <View style={styles.paperSheet}>
              {/* Formal Letterhead (Header Kop Surat) */}
              <View style={styles.kopContainer}>
                <Image
                  source={require("@/assets/logo/logo-vertikal.webp")}
                  style={styles.kopLogo}
                />
                <Text style={styles.kopTitle}>{clinicName}</Text>
                <Text style={styles.kopAddress}>{clinicAddress}</Text>
                <Text style={styles.kopContact}>
                  Telepon: {clinicPhone} | Email: {clinicEmail}
                </Text>

                {/* Formal Double Line Divider */}
                <View style={styles.doubleLineWrap}>
                  <View style={styles.doubleLineThick} />
                  <View style={styles.doubleLineThin} />
                </View>
              </View>

              {/* Document Title Header */}
              <View style={styles.docHeaderBox}>
                <Text style={styles.docTitleText}>{docTitle}</Text>
                <Text style={styles.docSubtitleText}>{docSubtitle}</Text>
              </View>

              {/* Clauses Body */}
              {isLoading ? (
                <View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={colors.goldDark} />
                  <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>
                    Memuat dokumen resmi dari klinik...
                  </Text>
                </View>
              ) : (
                <View style={styles.clausesContainer}>
                  {sectionsToRender.map((sec: any, idx: number) => (
                    <View key={sec.id || idx} style={styles.clauseBlock}>
                      <Text style={styles.clauseTitle}>
                        {sec.title || sec.heading}
                      </Text>
                      <Text style={styles.clauseText}>
                        {sec.content || sec.text}
                      </Text>
                    </View>
                  ))}

                  {/* Footer Note */}
                  <View style={styles.footerNoteBox}>
                    <Text style={styles.footerNoteText}>• {footerNote}</Text>
                  </View>
                </View>
              )}

              {/* Agreement & Signature Confirmation Section */}
              <View style={styles.agreementSection}>
                {readOnly ? (
                  /* Read-only verification box */
                  <View style={styles.verifiedBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.verifiedTag}>
                        STATUS PERSETUJUAN KETENTUAN
                      </Text>
                      <View style={styles.verifiedRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#059669"
                        />
                        <Text style={styles.verifiedText}>
                          Syarat & Ketentuan Layanan Telah Disetujui
                        </Text>
                      </View>
                      <Text style={styles.verifiedSignee}>
                        Disetujui oleh: {fullName || patientName || "Pasien"}
                      </Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>✓ Terverifikasi</Text>
                    </View>
                  </View>
                ) : (
                  /* Form / Checkbox & Name Mode */
                  <>
                    {/* Checkbox */}
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => {
                        setChecked(!checked);
                        setErrorMessage(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkboxSquare,
                          checked ? styles.checkboxSquareActive : null,
                        ]}
                      >
                        {checked && (
                          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={styles.checkboxText}>
                        Saya telah membaca, memahami, dan menyetujui seluruh{" "}
                        <Text style={styles.checkboxTextBold}>
                          Syarat dan Ketentuan Layanan Pasien
                        </Text>{" "}
                        klinik Aesthetic Pondok Indah di atas.{" "}
                        <Text style={{ color: "#EF4444" }}>*</Text>
                      </Text>
                    </TouchableOpacity>

                    {/* Patient Name Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Nama Lengkap Pasien <Text style={{ color: "#EF4444" }}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={fullName}
                        onChangeText={(t) => {
                          setFullName(t);
                          setErrorMessage(null);
                        }}
                        placeholder="Nama Lengkap Pasien"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    {/* Error Notice */}
                    {errorMessage && (
                      <View style={styles.errorNotice}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={14}
                          color="#DC2626"
                        />
                        <Text style={styles.errorNoticeText}>
                          {errorMessage}
                        </Text>
                      </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        !checked || !fullName.trim()
                          ? styles.submitBtnDisabled
                          : null,
                      ]}
                      onPress={handleSave}
                      disabled={!checked || !fullName.trim()}
                      activeOpacity={0.88}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.submitBtnText}>
                        Saya Menyetujui Syarat & Ketentuan
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    flex: 1,
    maxHeight: "92%",
    backgroundColor: "#ECEAE5",
    borderRadius: radius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  modalHeaderSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#ECEAE5",
  },
  scrollContent: {
    padding: spacing.sm,
    paddingBottom: spacing.lg,
  },
  paperSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#D9D0BC",
  },
  kopContainer: {
    alignItems: "center",
    paddingBottom: 4,
  },
  kopLogo: {
    width: 52,
    height: 52,
    resizeMode: "contain",
    marginBottom: 4,
  },
  kopTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  kopAddress: {
    fontSize: 9.5,
    color: "#374151",
    textAlign: "center",
    marginTop: 2,
    lineHeight: 13.5,
    paddingHorizontal: 8,
  },
  kopContact: {
    fontSize: 9,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 2,
  },
  doubleLineWrap: {
    width: "100%",
    marginTop: 10,
    marginBottom: 6,
  },
  doubleLineThick: {
    height: 2,
    backgroundColor: "#000000",
  },
  doubleLineThin: {
    height: 1,
    backgroundColor: "#000000",
    marginTop: 2,
  },
  docHeaderBox: {
    alignItems: "center",
    marginVertical: 10,
  },
  docTitleText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  docSubtitleText: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 3,
  },
  clausesContainer: {
    gap: 12,
    marginTop: 4,
  },
  clauseBlock: {
    gap: 3,
  },
  clauseTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#111827",
  },
  clauseText: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 16.5,
    textAlign: "justify",
  },
  footerNoteBox: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerNoteText: {
    fontSize: 9.5,
    color: "#6B7280",
    fontStyle: "italic",
  },
  agreementSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 1,
  },
  checkboxSquareActive: {
    backgroundColor: "#00A859",
    borderColor: "#00A859",
  },
  checkboxText: {
    flex: 1,
    fontSize: 11,
    color: "#1F2937",
    lineHeight: 16,
  },
  checkboxTextBold: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  errorNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorNoticeText: {
    fontSize: 10.5,
    color: "#DC2626",
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A859",
    paddingVertical: 12,
    borderRadius: radius.lg,
    shadowColor: "#00A859",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 10,
    borderRadius: radius.md,
  },
  verifiedTag: {
    fontSize: 9,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: 0.5,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  verifiedSignee: {
    fontSize: 10,
    color: "#047857",
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#166534",
  },
});
