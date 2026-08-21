import { useState, useEffect, useRef } from "react";
import {
  Building2,
  FileText,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Eye,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Edit3,
  Image as ImageIcon,
  Upload,
  Sliders,
  Maximize2,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  getAdminClinicSettings,
  saveClinicSetting,
  type ClinicGeneralInfo,
  type PdfTermsSettings,
  type PdfConsentSettings,
  DEFAULT_GENERAL_INFO,
  DEFAULT_TERMS_SETTINGS,
  DEFAULT_CONSENT_SETTINGS,
} from "../services/clinicSettingsService";

type SettingsPageProps = {
  settings?: any;
  onSaveSettings?: (data: any) => Promise<void>;
};

export default function SettingsPage({ settings, onSaveSettings }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<"clinic" | "terms" | "consent">("terms");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [generalInfo, setGeneralInfo] = useState<ClinicGeneralInfo>(DEFAULT_GENERAL_INFO);
  const [termsSettings, setTermsSettings] = useState<PdfTermsSettings>(DEFAULT_TERMS_SETTINGS);
  const [consentSettings, setConsentSettings] = useState<PdfConsentSettings>(DEFAULT_CONSENT_SETTINGS);

  const termsFileInputRef = useRef<HTMLInputElement>(null);
  const consentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminClinicSettings();
      if (data.general) setGeneralInfo(data.general);
      if (data.terms) setTermsSettings(data.terms);
      if (data.consent) setConsentSettings(data.consent);
    } catch {
      toast({ title: "Gagal Memuat", message: "Gagal memuat pengaturan dari server, menggunakan data default.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "terms" | "consent") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Ukuran Terlalu Besar", message: "Maksimal ukuran logo adalah 3MB.", variant: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (target === "terms") {
        setTermsSettings((p) => ({
          ...p,
          kop: {
            ...p.kop,
            logoUrl: result,
            logoWidth: p.kop.logoWidth || 75,
            logoHeight: p.kop.logoHeight || 75,
          },
        }));
      } else {
        setConsentSettings((p) => ({
          ...p,
          kop: {
            ...p.kop,
            logoUrl: result,
            logoWidth: p.kop.logoWidth || 75,
            logoHeight: p.kop.logoHeight || 75,
          },
        }));
      }
      toast({ title: "Logo Berhasil Dimuat", message: "Logo kop surat siap disimpan ke database.", variant: "success" });
    };
    reader.readAsDataURL(file);
  };

  // Save General Clinic Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveClinicSetting("clinic_general_info", generalInfo);
      if (generalInfo.whatsappNumber) {
        await saveClinicSetting("booking_whatsapp_number", generalInfo.whatsappNumber);
      }
      toast({ title: "Tersimpan", message: "Pengaturan umum klinik berhasil disimpan ke database.", variant: "success" });
    } catch {
      toast({ title: "Gagal", message: "Gagal menyimpan pengaturan ke database.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Save Terms PDF Settings
  const handleSaveTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveClinicSetting("pdf_terms_and_conditions", termsSettings);
      const textTerms = termsSettings.sections.map((s, idx) => `${idx + 1}. ${s.title}: ${s.content}`).join("\n");
      await saveClinicSetting("booking_terms", textTerms);
      toast({ title: "Tersimpan", message: "Template Kop Surat, Ukuran Logo & Isi PDF Syarat dan Ketentuan berhasil disimpan ke database.", variant: "success" });
    } catch {
      toast({ title: "Gagal", message: "Gagal menyimpan pengaturan S&K ke database.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Save Consent PDF Settings
  const handleSaveConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveClinicSetting("pdf_informed_consent", consentSettings);
      toast({ title: "Tersimpan", message: "Template Kop Surat, Ukuran Logo & Isi PDF Surat Perjanjian berhasil disimpan ke database.", variant: "success" });
    } catch {
      toast({ title: "Gagal", message: "Gagal menyimpan pengaturan Surat Perjanjian ke database.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Terms Section Management
  const addTermsSection = () => {
    const newId = `sec-${Date.now()}`;
    setTermsSettings((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: newId, title: `${prev.sections.length + 1}. Judul Ketentuan Baru`, content: "Isi klausul atau petunjuk ketentuan baru..." },
      ],
    }));
  };

  const removeTermsSection = (index: number) => {
    setTermsSettings((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const updateTermsSection = (index: number, field: "title" | "content", value: string) => {
    setTermsSettings((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  // Consent Clausul Management
  const addConsentClausul = () => {
    const newId = `clausul-${Date.now()}`;
    setConsentSettings((prev) => ({
      ...prev,
      clausuls: [
        ...prev.clausuls,
        { id: newId, title: `Pasal ${prev.clausuls.length + 1}: Judul Pasal Baru`, content: "Isi pasal atau ketentuan persetujuan medis baru..." },
      ],
    }));
  };

  const removeConsentClausul = (index: number) => {
    setConsentSettings((prev) => ({
      ...prev,
      clausuls: prev.clausuls.filter((_, i) => i !== index),
    }));
  };

  const updateConsentClausul = (index: number, field: "title" | "content", value: string) => {
    setConsentSettings((prev) => {
      const updated = [...prev.clausuls];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, clausuls: updated };
    });
  };

  // Print Handlers
  const handlePrintTerms = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) return;

    const w = termsSettings.kop.logoWidth || 75;
    const h = termsSettings.kop.logoHeight || 75;

    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${termsSettings.docTitle} - Aesthetic Pondok Indah</title>
          <style>
            @page { size: A4 portrait; margin: 16mm 14mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.5; margin: 0; padding: 15px; font-size: 9.5pt; background: #fff; }
            .kop-header { display: flex; align-items: center; justify-content: center; gap: 18px; padding-bottom: 10px; margin-bottom: 16px; border-bottom: 3px double #111; }
            .kop-logo { flex-shrink: 0; }
            .kop-logo img { width: ${w}px; height: ${h}px; object-fit: contain; }
            .kop-details { text-align: center; flex: 1; }
            .kop-title { font-size: 13.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
            .kop-contact { font-size: 8.5pt; font-weight: 500; color: #222; margin-bottom: 2px; }
            .kop-contact a { color: #0056b3; text-decoration: underline; }
            .kop-address { font-size: 8pt; color: #333; line-height: 1.3; }
            .doc-heading { text-align: center; margin: 12px 0 18px; }
            .doc-title { font-size: 11pt; font-weight: 800; color: #111; text-transform: uppercase; letter-spacing: 0.5px; }
            .doc-sub { font-size: 8.5pt; color: #555; font-style: italic; margin-top: 1px; }
            .section-box { margin-bottom: 11px; }
            .section-title { font-size: 9.5pt; font-weight: 700; color: #111; margin-bottom: 2px; }
            .section-content { font-size: 8.8pt; color: #333; text-align: justify; line-height: 1.45; }
            .footer-note { margin-top: 20px; border-top: 1px dashed #bbb; padding-top: 8px; font-size: 7.5pt; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="kop-header">
            ${termsSettings.kop.logoUrl ? `<div class="kop-logo"><img src="${termsSettings.kop.logoUrl}" alt="Logo" /></div>` : ''}
            <div class="kop-details">
              <div class="kop-title">${termsSettings.kop.clinicName}</div>
              <div class="kop-contact">Phone: ${termsSettings.kop.phone} &nbsp; E-mail: <a href="mailto:${termsSettings.kop.email}">${termsSettings.kop.email}</a></div>
              <div class="kop-address">${termsSettings.kop.address}</div>
            </div>
          </div>
          <div class="doc-heading">
            <div class="doc-title">${termsSettings.docTitle}</div>
            <div class="doc-sub">${termsSettings.docSubtitle} (${termsSettings.docVersion})</div>
          </div>
          ${termsSettings.sections.map(s => `
            <div class="section-box">
              <div class="section-title">${s.title}</div>
              <div class="section-content">${s.content}</div>
            </div>
          `).join('')}
          <div class="footer-note">${termsSettings.footerNote}</div>
        </body>
      </html>
    `);
    frameDoc.close();
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 400);
  };

    const handlePrintConsent = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) return;

    const w = consentSettings.kop.logoWidth || 75;
    const h = consentSettings.kop.logoHeight || 75;

    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${consentSettings.docTitle} - Aesthetic Pondok Indah</title>
          <style>
            @page { size: A4 portrait; margin: 16mm 14mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.5; margin: 0; padding: 15px; font-size: 9.5pt; background: #fff; }
            .kop-header { display: flex; align-items: center; justify-content: center; gap: 18px; padding-bottom: 10px; margin-bottom: 16px; border-bottom: 3px double #111; }
            .kop-logo { flex-shrink: 0; }
            .kop-logo img { width: ${w}px; height: ${h}px; object-fit: contain; }
            .kop-details { text-align: center; flex: 1; }
            .kop-title { font-size: 13.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
            .kop-contact { font-size: 8.5pt; font-weight: 500; color: #222; margin-bottom: 2px; }
            .kop-contact a { color: #0056b3; text-decoration: underline; }
            .kop-address { font-size: 8pt; color: #333; line-height: 1.3; }
            .doc-heading { text-align: center; margin: 12px 0 16px; }
            .doc-title { font-size: 11pt; font-weight: 800; color: #111; text-transform: uppercase; letter-spacing: 0.5px; }
            .doc-sub { font-size: 8.5pt; color: #555; font-style: italic; margin-top: 1px; }
            .clausul-box { margin-bottom: 11px; }
            .clausul-title { font-size: 9.5pt; font-weight: 700; color: #111; margin-bottom: 2px; }
            .clausul-content { font-size: 8.8pt; color: #333; text-align: justify; line-height: 1.45; }
            .statement { margin: 16px 0; padding: 10px 14px; background: #fbfbfb; border-left: 3px solid #111; font-size: 8.5pt; font-style: italic; }
            .footer-grid { margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .seal-box { font-size: 8pt; color: #555; }
            .seal-badge { display: inline-block; padding: 3px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 4px; font-weight: bold; margin-bottom: 4px; }
            .sig-box { width: 220px; text-align: center; border: 1px solid #e5e5e5; border-radius: 8px; padding: 10px; background: #fafafa; }
            .sig-title { font-size: 8pt; font-weight: bold; color: #8C6B1C; text-transform: uppercase; margin-bottom: 4px; }
            .sig-status { font-size: 8.5pt; font-weight: bold; color: #047857; padding: 8px 0; }
            .sig-name { font-size: 9pt; font-weight: bold; text-decoration: underline; margin-top: 4px; }
            .sig-sub { font-size: 7.5pt; color: #777; }
          </style>
        </head>
        <body>
          <div class="kop-header">
            ${consentSettings.kop.logoUrl ? `<div class="kop-logo"><img src="${consentSettings.kop.logoUrl}" alt="Logo" /></div>` : ''}
            <div class="kop-details">
              <div class="kop-title">${consentSettings.kop.clinicName}</div>
              <div class="kop-contact">Phone: ${consentSettings.kop.phone} &nbsp; E-mail: <a href="mailto:${consentSettings.kop.email}">${consentSettings.kop.email}</a></div>
              <div class="kop-address">${consentSettings.kop.address}</div>
            </div>
          </div>
          <div class="doc-heading">
            <div class="doc-title">${consentSettings.docTitle}</div>
            <div class="doc-sub">${consentSettings.docSubtitle} (Kode: ${consentSettings.docCode})</div>
          </div>
          ${consentSettings.clausuls.map(c => `
            <div class="clausul-box">
              <div class="clausul-title">${c.title}</div>
              <div class="clausul-content">${c.content}</div>
            </div>
          `).join('')}
          <div class="statement">${consentSettings.closingStatement}</div>
          <div class="footer-grid">
            <div class="seal-box">
              <span class="seal-badge">✓ Dokumen Digital Tersertifikasi & Sah Secara Medikolegal</span><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan<br/>
              <span style="font-size: 7.5pt; color: #888;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>
            <div class="sig-box">
              <div class="sig-title">Tanda Tangan Pasien / Wali</div>
              <div class="sig-status">✓ Disetujui Secara Digital</div>
              <div class="sig-name">Nama Pasien Terdaftar</div>
              <div class="sig-sub">Pasien / Wali Penanggung Jawab</div>
            </div>
          </div>
        </body>
      </html>
    `);
    frameDoc.close();
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 400);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#8C6B1C] mx-auto" />
        <p className="text-xs font-semibold text-[#8C8272]">Memuat seluruh konfigurasi klinik dari database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("clinic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "clinic"
              ? "bg-[#8C6B1C] text-white shadow-sm"
              : "bg-white text-[#5C5346] hover:bg-[#FAF8F5] border border-[#E8DFC8]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pengaturan Klinik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "terms"
              ? "bg-[#8C6B1C] text-white shadow-sm"
              : "bg-white text-[#5C5346] hover:bg-[#FAF8F5] border border-[#E8DFC8]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Syarat dan Ketentuan (PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("consent")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "consent"
              ? "bg-[#8C6B1C] text-white shadow-sm"
              : "bg-white text-[#5C5346] hover:bg-[#FAF8F5] border border-[#E8DFC8]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Surat Perjanjian (PDF Consent)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENGATURAN KLINIK */}
      {/* ========================================================================= */}
      {activeTab === "clinic" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl border border-[#E8DFC8] p-6 space-y-6 shadow-xs animate-in fade-in-50 duration-200">
          <div>
            <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#8C6B1C]" />
              <span>Profil & Informasi Resmi Klinik</span>
            </h3>
            <p className="text-xs text-[#8C8272] mt-0.5">
              Data ini tersimpan langsung di database MySQL dan disinkronkan ke seluruh modul publik & reservasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416]">Nama Resmi Klinik</label>
              <Input
                value={generalInfo.clinicName}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, clinicName: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs font-semibold"
                placeholder="Aesthetic Pondok Indah Dental Clinic"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416]">Slogan / Tagline Klinik</label>
              <Input
                value={generalInfo.tagline}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, tagline: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs"
                placeholder="Pusat Perawatan Gigi Estetik & Spesialis"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416]">Nomor WhatsApp Klinik</label>
              <Input
                value={generalInfo.whatsappNumber}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, whatsappNumber: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs"
                placeholder="628198974030"
                required
              />
              <span className="text-[10px] text-[#8C8272]">Format internasional tanpa tanda + (contoh: 62819...)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416]">Nomor Telepon Hotline</label>
              <Input
                value={generalInfo.phone}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, phone: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs"
                placeholder="(021) 750-1234"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416]">Email Resmi</label>
              <Input
                type="email"
                value={generalInfo.email}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs"
                placeholder="info@aestheticpondokindah.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416]">Jam Operasional Klinik</label>
              <Input
                value={generalInfo.operatingHours}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, operatingHours: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs"
                placeholder="Senin - Sabtu: 09:00 - 20:00 WIB"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#2C2416]">Alamat Lengkap Klinik</label>
              <textarea
                value={generalInfo.address}
                onChange={(e) => setGeneralInfo((p) => ({ ...p, address: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-[#E8DFC8] p-3 text-xs focus:ring-1 focus:ring-[#8C6B1C] outline-none"
                placeholder="Jl. Metro Pondok Indah Blok TB No. 12..."
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#8C6B1C] hover:bg-[#735614] text-white rounded-xl text-xs font-bold px-6 py-2.5 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan ke Database..." : "Simpan Pengaturan Klinik"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYARAT DAN KETENTUAN (S&K PDF) */}
      {/* ========================================================================= */}
      {activeTab === "terms" && (
        <form onSubmit={handleSaveTerms} className="space-y-6 animate-in fade-in-50 duration-200">
          {/* 1. Pengaturan Kop Surat S&K (Desain Formal) */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#8C6B1C]" />
                  <span>Kop Surat & Logo Dokumen Syarat & Ketentuan</span>
                </h3>
                <p className="text-xs text-[#8C8272] mt-0.5">
                  Atur logo, ukuran panjang & lebar, nama instansi, nomor telepon, email, dan alamat kop surat.
                </p>
              </div>
              <Button
                type="button"
                onClick={handlePrintTerms}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Preview PDF</span>
              </Button>
            </div>

            {/* Visual Kop Surat Live Preview Box */}
            <div className="p-4 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5]">
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider mb-2">Live Preview Kop Surat S&K:</p>
              <div className="bg-white p-4 rounded-lg border border-[#E8DFC8] flex items-center justify-center gap-4 pb-3" style={{ borderBottom: "3px double #111" }}>
                {termsSettings.kop.logoUrl ? (
                  <div
                    className="flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg p-1 bg-white shadow-2xs overflow-hidden"
                    style={{
                      width: `${termsSettings.kop.logoWidth || 75}px`,
                      height: `${termsSettings.kop.logoHeight || 75}px`,
                    }}
                  >
                    <img src={termsSettings.kop.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 text-center p-1">
                    Tanpa Logo
                  </div>
                )}
                <div className="text-center flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-black tracking-wide uppercase">{termsSettings.kop.clinicName || "NAMA INSTANSI / KLINIK"}</h4>
                  <p className="text-[10px] text-gray-800 font-medium mt-0.5">
                    Phone: {termsSettings.kop.phone || "-"} &nbsp; E-mail: <span className="text-blue-600 underline">{termsSettings.kop.email || "-"}</span>
                  </p>
                  <p className="text-[9px] text-gray-600 mt-0.5 leading-tight">{termsSettings.kop.address || "Alamat lengkap instansi..."}</p>
                </div>
              </div>
            </div>

            {/* Logo Manager & Dimension Customizer Card */}
            <div className="p-4 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#2C2416] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#8C6B1C]" />
                  <span>Kustomisasi Logo Kop Surat (Opsional)</span>
                </span>
                {termsSettings.kop.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoUrl: "" } }))}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Logo (Gunakan Mode Teks Saja)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  ref={termsFileInputRef}
                  onChange={(e) => handleLogoUpload(e, "terms")}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => termsFileInputRef.current?.click()}
                  className="bg-[#FAF5EA] hover:bg-[#FAF0D9] text-[#8C6B1C] border border-[#EADBBD] rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{termsSettings.kop.logoUrl ? "Ganti Gambar Logo" : "Unggah Gambar Logo"}</span>
                </Button>
                <Input
                  value={termsSettings.kop.logoUrl || ""}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoUrl: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs flex-1 min-w-[200px]"
                  placeholder="Atau masukkan URL / path logo (misal: /logo/logo.png)"
                />
              </div>

              {/* Editable Logo Dimensions (Panjang & Lebar) */}
              {termsSettings.kop.logoUrl && (
                <div className="pt-2 border-t border-[#E8DFC8]/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#5C5346] flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-[#8C6B1C]" />
                      <span>Lebar Logo (Width px):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        value={termsSettings.kop.logoWidth || 75}
                        onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: Number(e.target.value) || 75 } }))}
                        className="rounded-lg border-[#E8DFC8] text-xs font-bold h-8"
                      />
                      <span className="text-xs text-[#8C8272]">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#5C5346] flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-[#8C6B1C]" />
                      <span>Tinggi Logo (Height px):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        value={termsSettings.kop.logoHeight || 75}
                        onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoHeight: Number(e.target.value) || 75 } }))}
                        className="rounded-lg border-[#E8DFC8] text-xs font-bold h-8"
                      />
                      <span className="text-xs text-[#8C8272]">px</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-[#5C5346]">Preset Ukuran Cepat:</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 55, logoHeight: 55 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Kecil (55px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 75, logoHeight: 75 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Standar (75px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 100, logoHeight: 100 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Besar (100px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 130, logoHeight: 65 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Persegi Panjang (130x65)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields Kop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#2C2416]">Nama Perusahaan / Instansi Kop Surat</label>
                <Input
                  value={termsSettings.kop.clinicName}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, clinicName: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs font-bold uppercase"
                  placeholder="PT NAVENA INTERNATIONAL GROUP / AESTHETIC PONDOK INDAH"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">Nomor Telepon / Phone Kop</label>
                <Input
                  value={termsSettings.kop.phone}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, phone: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs"
                  placeholder="+62 21 555 1900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">E-mail Resmi Kop</label>
                <Input
                  type="email"
                  value={termsSettings.kop.email}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, email: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs"
                  placeholder="navenainternationalgroup@gmail.com"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#2C2416]">Alamat Lengkap Kop Surat</label>
                <textarea
                  value={termsSettings.kop.address}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, kop: { ...p.kop, address: e.target.value } }))}
                  rows={2}
                  className="w-full rounded-xl border border-[#E8DFC8] p-2.5 text-xs text-[#333] focus:ring-1 focus:ring-[#8C6B1C] outline-none"
                  placeholder="Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang..."
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Pengaturan Isi Klausul S&K */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#2C2416]">Isi Poin-Poin Syarat & Ketentuan Layanan</h3>
                <p className="text-xs text-[#8C8272] mt-0.5">
                  Ubah, tambah, atau hapus klausul poin syarat dan ketentuan perawatan medis klinik.
                </p>
              </div>
              <Button
                type="button"
                onClick={addTermsSection}
                className="bg-[#FAF5EA] hover:bg-[#FAF0D9] text-[#8C6B1C] border border-[#EADBBD] rounded-xl text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Poin Baru</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">Judul Dokumen</label>
                <Input
                  value={termsSettings.docTitle}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, docTitle: e.target.value }))}
                  className="rounded-xl border-[#E8DFC8] text-xs font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">Versi Dokumen</label>
                <Input
                  value={termsSettings.docVersion}
                  onChange={(e) => setTermsSettings((p) => ({ ...p, docVersion: e.target.value }))}
                  className="rounded-xl border-[#E8DFC8] text-xs"
                  placeholder="Versi 2.4 - Berlaku 2026"
                />
              </div>
            </div>

            {/* List of Clauses */}
            <div className="space-y-3 pt-2">
              {termsSettings.sections.map((section, idx) => (
                <div key={section.id || idx} className="p-4 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] space-y-2 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={section.title}
                      onChange={(e) => updateTermsSection(idx, "title", e.target.value)}
                      className="text-xs font-bold bg-white border-[#E8DFC8] rounded-lg max-w-md"
                      placeholder="Judul Poin (misal: 1. Ketentuan Reservasi)"
                      required
                    />
                    {termsSettings.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTermsSection(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Poin Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateTermsSection(idx, "content", e.target.value)}
                    rows={2}
                    className="w-full bg-white rounded-lg border border-[#E8DFC8] p-2.5 text-xs text-[#444] focus:ring-1 focus:ring-[#8C6B1C] outline-none"
                    placeholder="Isi klausul poin ini..."
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#2C2416]">Catatan Kaki (Footer Note PDF)</label>
              <Input
                value={termsSettings.footerNote}
                onChange={(e) => setTermsSettings((p) => ({ ...p, footerNote: e.target.value }))}
                className="rounded-xl border-[#E8DFC8] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={handlePrintTerms}
              className="bg-white hover:bg-[#FAF8F5] text-[#8C6B1C] border border-[#E8DFC8] rounded-xl text-xs font-bold px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF S&K</span>
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#8C6B1C] hover:bg-[#735614] text-white rounded-xl text-xs font-bold px-6 py-2.5 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan ke Database..." : "Simpan Syarat dan Ketentuan"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SURAT PERJANJIAN (INFORMED CONSENT PDF) */}
      {/* ========================================================================= */}
      {activeTab === "consent" && (
        <form onSubmit={handleSaveConsent} className="space-y-6 animate-in fade-in-50 duration-200">
          {/* 1. Pengaturan Kop Surat Perjanjian (Desain Formal) */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#8C6B1C]" />
                  <span>Kop Surat & Logo Surat Persetujuan Medis (Informed Consent)</span>
                </h3>
                <p className="text-xs text-[#8C8272] mt-0.5">
                  Atur logo, ukuran panjang & lebar, nama instansi, nomor telepon, email, dan alamat kop surat.
                </p>
              </div>
              <Button
                type="button"
                onClick={handlePrintConsent}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Preview PDF</span>
              </Button>
            </div>

            {/* Visual Kop Surat Live Preview Box */}
            <div className="p-4 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5]">
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider mb-2">Live Preview Kop Surat Perjanjian:</p>
              <div className="bg-white p-4 rounded-lg border border-[#E8DFC8] flex items-center justify-center gap-4 pb-3" style={{ borderBottom: "3px double #111" }}>
                {consentSettings.kop.logoUrl ? (
                  <div
                    className="flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg p-1 bg-white shadow-2xs overflow-hidden"
                    style={{
                      width: `${consentSettings.kop.logoWidth || 75}px`,
                      height: `${consentSettings.kop.logoHeight || 75}px`,
                    }}
                  >
                    <img src={consentSettings.kop.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 text-center p-1">
                    Tanpa Logo
                  </div>
                )}
                <div className="text-center flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-black tracking-wide uppercase">{consentSettings.kop.clinicName || "NAMA INSTANSI / KLINIK"}</h4>
                  <p className="text-[10px] text-gray-800 font-medium mt-0.5">
                    Phone: {consentSettings.kop.phone || "-"} &nbsp; E-mail: <span className="text-blue-600 underline">{consentSettings.kop.email || "-"}</span>
                  </p>
                  <p className="text-[9px] text-gray-600 mt-0.5 leading-tight">{consentSettings.kop.address || "Alamat lengkap instansi..."}</p>
                </div>
              </div>
            </div>

            {/* Logo Manager & Dimension Customizer Card */}
            <div className="p-4 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#2C2416] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#8C6B1C]" />
                  <span>Kustomisasi Logo Kop Surat (Opsional)</span>
                </span>
                {consentSettings.kop.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoUrl: "" } }))}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Logo (Gunakan Mode Teks Saja)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  ref={consentFileInputRef}
                  onChange={(e) => handleLogoUpload(e, "consent")}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => consentFileInputRef.current?.click()}
                  className="bg-[#FAF5EA] hover:bg-[#FAF0D9] text-[#8C6B1C] border border-[#EADBBD] rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{consentSettings.kop.logoUrl ? "Ganti Gambar Logo" : "Unggah Gambar Logo"}</span>
                </Button>
                <Input
                  value={consentSettings.kop.logoUrl || ""}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoUrl: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs flex-1 min-w-[200px]"
                  placeholder="Atau masukkan URL / path logo (misal: /logo/logo.png)"
                />
              </div>

              {/* Editable Logo Dimensions (Panjang & Lebar) */}
              {consentSettings.kop.logoUrl && (
                <div className="pt-2 border-t border-[#E8DFC8]/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#5C5346] flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-[#8C6B1C]" />
                      <span>Lebar Logo (Width px):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        value={consentSettings.kop.logoWidth || 75}
                        onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: Number(e.target.value) || 75 } }))}
                        className="rounded-lg border-[#E8DFC8] text-xs font-bold h-8"
                      />
                      <span className="text-xs text-[#8C8272]">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#5C5346] flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-[#8C6B1C]" />
                      <span>Tinggi Logo (Height px):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        value={consentSettings.kop.logoHeight || 75}
                        onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoHeight: Number(e.target.value) || 75 } }))}
                        className="rounded-lg border-[#E8DFC8] text-xs font-bold h-8"
                      />
                      <span className="text-xs text-[#8C8272]">px</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-[#5C5346]">Preset Ukuran Cepat:</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 55, logoHeight: 55 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Kecil (55px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 75, logoHeight: 75 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Standar (75px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 100, logoHeight: 100 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Besar (100px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, logoWidth: 130, logoHeight: 65 } }))}
                        className="px-2 py-1 bg-white border border-[#E8DFC8] hover:bg-[#FAF5EA] rounded-md text-[10px] font-semibold text-[#8C6B1C]"
                      >
                        Persegi Panjang (130x65)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields Kop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#2C2416]">Nama Perusahaan / Instansi Kop Surat</label>
                <Input
                  value={consentSettings.kop.clinicName}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, clinicName: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs font-bold uppercase"
                  placeholder="PT NAVENA INTERNATIONAL GROUP / AESTHETIC PONDOK INDAH"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">Nomor Telepon / Phone Kop</label>
                <Input
                  value={consentSettings.kop.phone}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, phone: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs"
                  placeholder="+62 21 555 1900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">E-mail Resmi Kop</label>
                <Input
                  type="email"
                  value={consentSettings.kop.email}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, email: e.target.value } }))}
                  className="rounded-xl border-[#E8DFC8] text-xs"
                  placeholder="navenainternationalgroup@gmail.com"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#2C2416]">Alamat Lengkap Kop Surat</label>
                <textarea
                  value={consentSettings.kop.address}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, kop: { ...p.kop, address: e.target.value } }))}
                  rows={2}
                  className="w-full rounded-xl border border-[#E8DFC8] p-2.5 text-xs text-[#333] focus:ring-1 focus:ring-[#8C6B1C] outline-none"
                  placeholder="Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang..."
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Pengaturan Isi Pasal-Pasal Surat Perjanjian */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#2C2416]">Isi Pasal-Pasal Surat Persetujuan Medis</h3>
                <p className="text-xs text-[#8C8272] mt-0.5">
                  Ubah, tambah, atau sesuaikan pasal-pasal perjanjian tindakan medis yang ditandatangani pasien.
                </p>
              </div>
              <Button
                type="button"
                onClick={addConsentClausul}
                className="bg-[#FAF5EA] hover:bg-[#FAF0D9] text-[#8C6B1C] border border-[#EADBBD] rounded-xl text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pasal Baru</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">Judul Dokumen Surat</label>
                <Input
                  value={consentSettings.docTitle}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, docTitle: e.target.value }))}
                  className="rounded-xl border-[#E8DFC8] text-xs font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416]">Kode Dokumen</label>
                <Input
                  value={consentSettings.docCode}
                  onChange={(e) => setConsentSettings((p) => ({ ...p, docCode: e.target.value }))}
                  className="rounded-xl border-[#E8DFC8] text-xs"
                  placeholder="IC-APID-2026"
                />
              </div>
            </div>

            {/* List of Clausuls */}
            <div className="space-y-3 pt-2">
              {consentSettings.clausuls.map((clausul, idx) => (
                <div key={clausul.id || idx} className="p-4 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] space-y-2 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={clausul.title}
                      onChange={(e) => updateConsentClausul(idx, "title", e.target.value)}
                      className="text-xs font-bold bg-white border-[#E8DFC8] rounded-lg max-w-md"
                      placeholder="Judul Pasal (misal: Pasal 1: Penjelasan Tindakan)"
                      required
                    />
                    {consentSettings.clausuls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConsentClausul(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Pasal Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={clausul.content}
                    onChange={(e) => updateConsentClausul(idx, "content", e.target.value)}
                    rows={2}
                    className="w-full bg-white rounded-lg border border-[#E8DFC8] p-2.5 text-xs text-[#444] focus:ring-1 focus:ring-[#8C6B1C] outline-none"
                    placeholder="Isi ketentuan pasal ini..."
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#2C2416]">Pernyataan Penutup & Legalitas</label>
              <textarea
                value={consentSettings.closingStatement}
                onChange={(e) => setConsentSettings((p) => ({ ...p, closingStatement: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-[#E8DFC8] p-3 text-xs text-[#444] focus:ring-1 focus:ring-[#8C6B1C] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={handlePrintConsent}
              className="bg-white hover:bg-[#FAF8F5] text-[#8C6B1C] border border-[#E8DFC8] rounded-xl text-xs font-bold px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF Surat Perjanjian</span>
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#8C6B1C] hover:bg-[#735614] text-white rounded-xl text-xs font-bold px-6 py-2.5 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan ke Database..." : "Simpan Surat Perjanjian"}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
