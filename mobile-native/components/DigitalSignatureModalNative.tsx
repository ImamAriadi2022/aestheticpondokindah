import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  PanResponder,
  GestureResponderEvent,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, spacing, radius } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { bookingService, ClinicSettingsData } from "@/services/bookingService";

interface DigitalSignatureModalNativeProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureData: string) => void;
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  serviceName?: string;
  appointmentDate?: string;
  initialSignature?: string | null;
  readOnly?: boolean;
}

export default function DigitalSignatureModalNative({
  isOpen,
  onClose,
  onSaveSignature,
  patientName,
  patientPhone = "-",
  doctorName = "Dokter Spesialis",
  serviceName = "Pemeriksaan Gigi",
  appointmentDate = "Jadwal Reguler",
  initialSignature,
  readOnly = false,
}: DigitalSignatureModalNativeProps) {
  const [paths, setPaths] = useState<string[]>(initialSignature ? [initialSignature] : []);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [fullName, setFullName] = useState<string>(patientName || "");
  const [hasDrawn, setHasDrawn] = useState<boolean>(Boolean(initialSignature));
  const [settings, setSettings] = useState<ClinicSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (patientName) {
      setFullName(patientName);
    }
    if (initialSignature) {
      setPaths([initialSignature]);
      setHasDrawn(true);
    }
  }, [patientName, initialSignature, isOpen]);

  useEffect(() => {
    if (isOpen && !settings) {
      setIsLoading(true);
      bookingService
        .getPublicSettings()
        .then((s) => setSettings(s))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, settings]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        setScrollEnabled(false);
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setCurrentPath(newPath);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`);
      },
      onPanResponderRelease: () => {
        setCurrentPath((prev) => {
          if (prev) {
            setPaths((p) => [...p, prev]);
            setHasDrawn(true);
          }
          return "";
        });
        setScrollEnabled(true);
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath("");
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      setErrorMessage("Harap lengkapi Nama Pasien / Wali Sah.");
      return;
    }
    if (!hasDrawn || paths.length === 0) {
      setErrorMessage("Harap bubuhkan tanda tangan digital Anda di bawah.");
      return;
    }
    setErrorMessage(null);
    const fullSvgString = paths.join(" ");
    onSaveSignature(fullSvgString);
    onClose();
  };

  const consentData = settings?.pdf_informed_consent;
  const clinicName = consentData?.kop?.clinicName || "AESTHETIC PONDOK INDAH";
  const clinicAddress =
    consentData?.kop?.address ||
    "Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310";
  const clinicPhone = consentData?.kop?.phone || "021-7695948 | 0812-3456-7890";
  const clinicEmail = consentData?.kop?.email || "aesthetic.pondokindah@gmail.com";

  const docTitle =
    consentData?.docTitle ||
    "SURAT PERNYATAAN & PERSETUJUAN PASIEN (INFORMED CONSENT)";
  const docSubtitle =
    consentData?.docSubtitle ||
    "Pernyataan Persetujuan Tindakan Medis & Prosedur Perawatan Pasien";
  const docCode = consentData?.docCode || "IC-APID-2026";
  const closingStatement =
    consentData?.closingStatement ||
    "Demikian surat persetujuan tindakan medis ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.";

  // Standard clauses from live API / website
  const standardClausuls = [
    {
      title: "Pasal 1: Penjelasan Rencana Tindakan Medis",
      content:
        "Dokter gigi yang merawat telah memberikan penjelasan secara lengkap mengenai diagnosa klinis, tujuan perawatan, tata cara tindakan medis, serta alternatif perawatan yang tersedia.",
    },
    {
      title: "Pasal 2: Pemahaman Risiko & Respon Biologis",
      content:
        "Pasien memahami bahwa setiap tindakan medis kedokteran gigi memiliki risiko dan kemungkinan komplikasi wajar yang bergantung pada respon biologis jaringan tubuh dan anatomi gigi pasien.",
    },
    {
      title: "Pasal 3: Persetujuan Tindakan Anestesi & Sedasi",
      content:
        "Pasien menyetujui pemberian anestesi lokal atau obat-obatan pendukung yang dinilai perlu secara medis oleh dokter gigi untuk kelancaran dan kenyamanan tindakan.",
    },
    {
      title: "Pasal 4: Komitmen Pasca Perawatan & Kontrol",
      content:
        "Pasien berkomitmen untuk mematuhi seluruh petunjuk perawatan pasca tindakan dan menghadiri jadwal kontrol evaluasi medis yang telah ditetapkan.",
    },
    {
      title: "Pasal 5: Pernyataan Kesadaran Penuh & Tanda Tangan Digital",
      content:
        "Surat persetujuan ini ditandatangani secara sadar, tanpa paksaan, dan disahkan melalui tanda tangan digital yang memiliki kekuatan hukum pembuktian resmi.",
    },
  ];

  const clausulsToRender =
    Array.isArray(consentData?.clausuls) && consentData.clausuls.length > 0
      ? consentData.clausuls
      : standardClausuls;

  // Clean html paragraphs if bodyHtml is present
  const introParagraphs = [
    "Saya yang bertanda tangan di bawah ini menyatakan bahwa saya telah membaca secara menyeluruh, memahami, dan menyetujui Syarat dan Ketentuan Layanan Pasien Aesthetic Pondok Indah yang berlaku pada saat persetujuan ini diberikan.",
    "Saya menyatakan telah memperoleh kesempatan yang memadai untuk meminta penjelasan atas hal-hal yang belum saya pahami dan memberikan persetujuan ini secara sadar, tanpa paksaan, serta berdasarkan informasi yang telah saya terima.",
  ];

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
                <Text style={styles.modalHeaderTitle}>
                  Surat Persetujuan Pasien
                </Text>
                <Text style={styles.modalHeaderSub}>
                  Informed Consent & Tanda Tangan Digital Pasien
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
            scrollEnabled={scrollEnabled}
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
                <Text style={styles.docSubtitleText}>
                  No. Registrasi: API-CONSENT-{docCode}
                </Text>
              </View>

              {/* Metadata Table (Tabel Identitas Pasien & Janji Temu) */}
              <View style={styles.metaTable}>
                <View style={styles.metaTableRow}>
                  <View style={[styles.metaTableCell, styles.metaCellLabel, { flex: 0.9 }]}>
                    <Text style={styles.metaCellLabelText}>Nama Pasien</Text>
                  </View>
                  <View style={[styles.metaTableCell, { flex: 1.1 }]}>
                    <Text style={styles.metaCellValueText}>{fullName || patientName}</Text>
                  </View>
                  <View style={[styles.metaTableCell, styles.metaCellLabel, { flex: 0.8 }]}>
                    <Text style={styles.metaCellLabelText}>Layanan</Text>
                  </View>
                  <View style={[styles.metaTableCell, { flex: 1.2 }]}>
                    <Text style={styles.metaCellValueText}>{serviceName}</Text>
                  </View>
                </View>

                <View style={[styles.metaTableRow, { borderTopWidth: 1, borderTopColor: "#D1D5DB" }]}>
                  <View style={[styles.metaTableCell, styles.metaCellLabel, { flex: 0.9 }]}>
                    <Text style={styles.metaCellLabelText}>No. WhatsApp</Text>
                  </View>
                  <View style={[styles.metaTableCell, { flex: 1.1 }]}>
                    <Text style={styles.metaCellValueText}>{patientPhone || "-"}</Text>
                  </View>
                  <View style={[styles.metaTableCell, styles.metaCellLabel, { flex: 0.8 }]}>
                    <Text style={styles.metaCellLabelText}>Dokter</Text>
                  </View>
                  <View style={[styles.metaTableCell, { flex: 1.2 }]}>
                    <Text style={styles.metaCellValueText}>drg. {doctorName}</Text>
                  </View>
                </View>

                <View style={[styles.metaTableRow, { borderTopWidth: 1, borderTopColor: "#D1D5DB" }]}>
                  <View style={[styles.metaTableCell, styles.metaCellLabel, { flex: 0.9 }]}>
                    <Text style={styles.metaCellLabelText}>Jadwal Praktik</Text>
                  </View>
                  <View style={[styles.metaTableCell, { flex: 3.1 }]}>
                    <Text style={styles.metaCellValueText}>📅 {appointmentDate}</Text>
                  </View>
                </View>
              </View>

              {/* Introductory Paragraphs */}
              <View style={styles.introBox}>
                {introParagraphs.map((p, idx) => (
                  <Text key={idx} style={styles.introParagraph}>
                    {p}
                  </Text>
                ))}
              </View>

              {/* Clauses Body */}
              {isLoading ? (
                <View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={colors.goldDark} />
                  <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>
                    Memuat pasal persetujuan medis dari klinik...
                  </Text>
                </View>
              ) : (
                <View style={styles.clausesContainer}>
                  {clausulsToRender.map((c: any, idx: number) => (
                    <View key={c.id || idx} style={styles.clauseBlock}>
                      <Text style={styles.clauseTitle}>
                        {c.title || c.heading}
                      </Text>
                      <Text style={styles.clauseText}>
                        {c.content || c.text}
                      </Text>
                    </View>
                  ))}

                  {/* Closing Statement */}
                  <View style={styles.closingBox}>
                    <Text style={styles.closingText}>{closingStatement}</Text>
                  </View>
                </View>
              )}

              {/* Digital Signature & Submission Section */}
              <View style={styles.signatureSection}>
                {readOnly ? (
                  /* Read-only verification view */
                  <View style={styles.verifiedBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.verifiedTag}>STATUS PERSETUJUAN MEDIS</Text>
                      <View style={styles.verifiedRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#059669" />
                        <Text style={styles.verifiedText}>Informed Consent Telah Ditandatangani</Text>
                      </View>
                      <Text style={styles.verifiedSignee}>
                        Penandatangan: {fullName || patientName}
                      </Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>✓ Sah & Tercatat</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* Patient Name Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Nama Pasien / Wali Sah <Text style={{ color: "#EF4444" }}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={fullName}
                        onChangeText={(t) => {
                          setFullName(t);
                          setErrorMessage(null);
                        }}
                        placeholder="Nama Lengkap Pasien / Wali Sah"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    {/* Touchscreen Digital Signature Canvas */}
                    <View style={styles.signatureBox}>
                      <View style={styles.signatureBoxHeader}>
                        <Text style={styles.inputLabel}>
                          Tanda Tangan Digital Pasien <Text style={{ color: "#EF4444" }}>*</Text>
                        </Text>
                        {(hasDrawn || paths.length > 0) && (
                          <TouchableOpacity
                            onPress={handleClear}
                            style={styles.clearBtn}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="refresh" size={12} color="#DC2626" />
                            <Text style={styles.clearBtnText}>Ulangi / Ganti</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                        {!hasDrawn && paths.length === 0 && !currentPath && (
                          <View style={styles.watermarkWrap} pointerEvents="none">
                            <Ionicons name="pencil-outline" size={18} color="#9CA3AF" />
                            <Text style={styles.watermarkText}>
                              Sign Here (Goreskan tanda tangan Anda di sini)
                            </Text>
                          </View>
                        )}

                        <Svg style={StyleSheet.absoluteFill}>
                          {paths.map((d, index) => (
                            <Path
                              key={index}
                              d={d}
                              stroke="#111827"
                              strokeWidth={2.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          ))}
                          {currentPath ? (
                            <Path
                              d={currentPath}
                              stroke="#111827"
                              strokeWidth={2.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          ) : null}
                        </Svg>
                      </View>
                    </View>

                    {/* Error Notice */}
                    {errorMessage && (
                      <View style={styles.errorNotice}>
                        <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                        <Text style={styles.errorNoticeText}>{errorMessage}</Text>
                      </View>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        (!hasDrawn && paths.length === 0) || !fullName.trim()
                          ? styles.submitBtnDisabled
                          : null,
                      ]}
                      onPress={handleSave}
                      disabled={(!hasDrawn && paths.length === 0) || !fullName.trim()}
                      activeOpacity={0.88}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.submitBtnText}>
                        Simpan & Terapkan Tanda Tangan
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
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  docSubtitleText: {
    fontSize: 9.5,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 3,
    fontWeight: "600",
  },
  metaTable: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: radius.md,
    overflow: "hidden",
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  metaTableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaTableCell: {
    paddingHorizontal: 8,
    paddingVertical: 5.5,
    justifyContent: "center",
  },
  metaCellLabel: {
    backgroundColor: "#F9FAFB",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  metaCellLabelText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#374151",
  },
  metaCellValueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
  introBox: {
    marginVertical: 6,
    gap: 4,
  },
  introParagraph: {
    fontSize: 10.5,
    color: "#374151",
    lineHeight: 15.5,
    textAlign: "justify",
  },
  clausesContainer: {
    gap: 10,
    marginTop: 4,
  },
  clauseBlock: {
    gap: 3,
  },
  clauseTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
  },
  clauseText: {
    fontSize: 10.5,
    color: "#374151",
    lineHeight: 15.5,
    textAlign: "justify",
  },
  closingBox: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  closingText: {
    fontSize: 10,
    color: "#4B5563",
    fontStyle: "italic",
    lineHeight: 14.5,
  },
  signatureSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: "#E5E7EB",
    gap: 12,
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
  signatureBox: {
    gap: 6,
  },
  signatureBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: "#FEF2F2",
  },
  clearBtnText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#DC2626",
  },
  canvasContainer: {
    height: 120,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  watermarkWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    opacity: 0.6,
  },
  watermarkText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
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
