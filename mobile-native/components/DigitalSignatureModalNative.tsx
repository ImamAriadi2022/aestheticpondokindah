import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  PanResponder, GestureResponderEvent, ActivityIndicator,
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
  doctorName?: string;
  serviceName?: string;
  appointmentDate?: string;
  initialSignature?: string | null;
}

export default function DigitalSignatureModalNative({
  isOpen,
  onClose,
  onSaveSignature,
  patientName,
  doctorName = "Dokter Spesialis",
  serviceName = "Pemeriksaan Gigi",
  appointmentDate = "Jadwal Reguler",
  initialSignature,
}: DigitalSignatureModalNativeProps) {
  const [paths, setPaths] = useState<string[]>(initialSignature ? [initialSignature] : []);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(Boolean(initialSignature));
  const [settings, setSettings] = useState<ClinicSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !settings) {
      setIsLoading(true);
      bookingService.getPublicSettings()
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
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath("");
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!hasDrawn || paths.length === 0 || !agreed) return;
    const fullSvgString = paths.join(" ");
    onSaveSignature(fullSvgString);
    onClose();
  };

  const consentData = settings?.pdf_informed_consent;
  const clinicName = consentData?.kop?.clinicName || "AESTHETIC PONDOK INDAH";

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
                <Ionicons name="pencil" size={18} color={colors.goldDark} />
              </View>
              <View>
                <Text style={styles.headerTitle}>SURAT PERSETUJUAN TINDAKAN</Text>
                <Text style={styles.headerSub}>Informed Consent & Tanda Tangan Digital</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.charcoal} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={true}>
            {/* Treatment Summary Meta */}
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Pasien:</Text>
                <Text style={styles.metaValue}>{patientName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Dokter:</Text>
                <Text style={styles.metaValue}>drg. {doctorName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Layanan:</Text>
                <Text style={styles.metaValue}>{serviceName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Jadwal:</Text>
                <Text style={styles.metaValue}>{appointmentDate}</Text>
              </View>
            </View>

            {/* Declaration Text from Live API */}
            <View style={styles.consentTextBox}>
              <Text style={styles.consentHeading}>PERNYATAAN PERSETUJUAN MEDIS ({clinicName})</Text>
              {isLoading ? (
                <ActivityIndicator color={colors.gold} style={{ marginVertical: 10 }} />
              ) : Array.isArray(consentData?.sections) ? (
                consentData.sections.map((sec: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 6 }}>
                    <Text style={[styles.consentParagraph, { fontWeight: "700", color: colors.charcoal }]}>{sec.title || sec.heading}</Text>
                    <Text style={styles.consentParagraph}>{sec.content || sec.text}</Text>
                  </View>
                ))
              ) : (
                <View>
                  <Text style={styles.consentParagraph}>
                    Saya yang bertanda tangan di bawah ini menyatakan telah mendapatkan penjelasan lengkap mengenai rencana perawatan gigi, manfaat, risiko umum yang mungkin timbul, serta instruksi pasca-tindakan.
                  </Text>
                  <Text style={styles.consentParagraph}>
                    Dengan ini saya memberikan persetujuan penuh secara sadar untuk dilakukan tindakan perawatan oleh tim dokter gigi spesialis Aesthetic Pondok Indah Dental Clinic.
                  </Text>
                </View>
              )}
            </View>

            {/* Touch Signature Pad */}
            <View style={styles.padContainer}>
              <View style={styles.padHeader}>
                <Text style={styles.padTitle}>Goreskan Tanda Tangan di Kolom Ini:</Text>
                {hasDrawn && (
                  <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <Ionicons name="refresh" size={13} color="#EF4444" style={{ marginRight: 3 }} />
                    <Text style={styles.clearBtnText}>Ulangi</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.canvasWrap} {...panResponder.panHandlers}>
                <Svg style={StyleSheet.absoluteFill}>
                  {paths.map((p, idx) => (
                    <Path
                      key={idx}
                      d={p}
                      stroke="#1A1A1A"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ))}
                  {currentPath ? (
                    <Path
                      d={currentPath}
                      stroke="#1A1A1A"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ) : null}
                </Svg>

                {!hasDrawn && !currentPath && (
                  <View style={styles.placeholderWrap} pointerEvents="none">
                    <Ionicons name="finger-print-outline" size={28} color="#D1C4A5" />
                    <Text style={styles.placeholderText}>Sentuh & tandatangani di sini dengan jari</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer with Checkbox & Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed ? styles.checkboxActive : null]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Saya menyatakan keabsahan tanda tangan digital ini atas nama <Text style={{ fontWeight: "700" }}>{patientName}</Text>.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptBtn, (!hasDrawn || !agreed) ? styles.acceptBtnDisabled : null]}
              onPress={handleSave}
              disabled={!hasDrawn || !agreed}
              activeOpacity={0.88}
            >
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.acceptBtnText}>Simpan Surat Persetujuan</Text>
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
    maxHeight: "92%",
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
    fontSize: 12,
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
    maxHeight: 420,
  },
  metaCard: {
    backgroundColor: "#FAF5EA",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#F0E6D3",
    gap: 4,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: 11,
    color: colors.charcoalMedium,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.charcoal,
  },
  consentTextBox: {
    backgroundColor: "#FCFAF6",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#F0E6D3",
    marginBottom: spacing.md,
  },
  consentHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.goldDark,
    marginBottom: 4,
  },
  consentParagraph: {
    fontSize: 10.5,
    color: colors.charcoalMedium,
    lineHeight: 16,
    marginBottom: 4,
  },
  padContainer: {
    marginBottom: spacing.md,
  },
  padHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  padTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.charcoal,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "#FEE2E2",
  },
  clearBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  canvasWrap: {
    height: 150,
    backgroundColor: "#FAFAFA",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "#D1C4A5",
    borderStyle: "dashed",
    position: "relative",
    overflow: "hidden",
  },
  placeholderWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  placeholderText: {
    fontSize: 11,
    color: "#A89E90",
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