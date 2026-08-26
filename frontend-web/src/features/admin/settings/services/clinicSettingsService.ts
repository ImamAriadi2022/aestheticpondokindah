import { apiClient } from "@/core/api/apiClient";

export interface ClinicGeneralInfo {
  clinicName: string;
  tagline: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  operatingHours: string;
}

export interface PdfKopSurat {
  clinicName: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string; // Optional Logo (Base64 / URL)
  logoWidth?: number; // Custom Logo Width in px
  logoHeight?: number; // Custom Logo Height in px
}

export interface TermsSection {
  id: string;
  title: string;
  content: string;
}

export interface PdfTermsSettings {
  kop: PdfKopSurat;
  docTitle: string;
  docSubtitle: string;
  docVersion: string;
  bodyHtml?: string; // Rich text editor content (TipTap/Word format)
  baseFontSize?: string; // Base document font size (e.g. "9.5pt", "10pt", "11pt")
  sections: TermsSection[];
  footerNote: string;
}

export interface ConsentClausul {
  id: string;
  title: string;
  content: string;
}

export interface PdfConsentSettings {
  kop: PdfKopSurat;
  docTitle: string;
  docSubtitle: string;
  docCode: string;
  bodyHtml?: string; // Rich text editor content (TipTap/Word format)
  baseFontSize?: string; // Base document font size (e.g. "9.5pt", "10pt", "11pt")
  clausuls: ConsentClausul[];
  closingStatement: string;
}

export const DEFAULT_TERMS_HTML = `
<h3>1. Ketentuan Reservasi & Janji Temu</h3>
<p>Permintaan reservasi yang diajukan secara daring akan diproses oleh staf admin dan dikonfirmasi melalui sistem notifikasi resmi dan WhatsApp. Pasien dimohon memberikan data kontak aktif untuk keperluan verifikasi jadwal.</p>

<h3>2. Waktu Kedatangan & Keterlambatan</h3>
<p>Pasien diharapkan hadir di klinik minimal <strong>10 menit sebelum waktu janji temu</strong>. Keterlambatan lebih dari 15 menit tanpa konfirmasi dapat menyebabkan penyesuaian urutan antrean demi kenyamanan pasien lain.</p>

<h3>3. Kebijakan Pembatalan & Penjadwalan Ulang (Reschedule)</h3>
<p>Pembatalan atau perubahan jadwal wajib diinformasikan selambat-lambatnya <strong>2 jam sebelum waktu kunjungan</strong> agar slot konsultasi dokter dapat dialihkan secara efisien.</p>

<h3>4. Rekam Medis & Kerahasiaan Data</h3>
<p>Seluruh data riwayat medis, foto rontgen gigi (panoramic/periapikal), dan identitas pasien tersimpan dalam sistem <strong>Rekam Medis Elektronik (EMR)</strong> berenkripsi dan dilindungi kerahasiaannya sesuai regulasi perundang-undangan kesehatan Republik Indonesia.</p>

<h3>5. Pembayaran, Biaya & Kebijakan Transaksi</h3>
<p>Biaya tindakan medis disesuaikan dengan jenis perawatan, tingkat kesulitan klinis, dan bahan medis yang disetujui pasien dalam rencana perawatan (<em>treatment plan</em>) sebelum tindakan medis dimulai. Pembayaran dapat dilakukan via tunai, debit, kartu kredit, transfer, maupun QRIS resmi klinik.</p>

<h3>6. Garansi & Perawatan Pasca Tindakan</h3>
<p>Klinik memberikan jaminan kualitas pengerjaan medis sesuai standar baku profesi kedokteran gigi dengan syarat pasien mematuhi anjuran kontrol pasca tindakan dan petunjuk perawatan di rumah.</p>
`;

export const DEFAULT_CONSENT_HTML = `
<h3>Pasal 1: Penjelasan Rencana Tindakan Medis</h3>
<p>Dokter gigi yang merawat telah memberikan penjelasan secara lengkap, jelas, dan transparan mengenai <strong>diagnosa klinis, tujuan perawatan, tata cara tindakan medis, manfaat, serta alternatif perawatan</strong> yang tersedia bagi pasien.</p>

<h3>Pasal 2: Pemahaman Risiko & Respon Biologis</h3>
<p>Pasien memahami dan menerima bahwa setiap tindakan medis kedokteran gigi memiliki risiko dan kemungkinan komplikasi wajar (seperti rasa ngilu sementara, pembengkakan ringan, atau penyesuaian gigitan) yang bergantung pada respon biologis jaringan tubuh dan anatomi gigi pasien.</p>

<h3>Pasal 3: Persetujuan Tindakan Anestesi & Sedasi</h3>
<p>Pasien menyetujui pemberian anestesi lokal, desensitisasi, atau obat-obatan pendukung yang dinilai perlu secara medis oleh dokter gigi untuk kelancaran dan kenyamanan prosedur tindakan.</p>

<h3>Pasal 4: Komitmen Pasca Perawatan & Kontrol Evaluasi</h3>
<p>Pasien berkomitmen untuk mematuhi seluruh petunjuk perawatan pasca tindakan (<em>post-treatment care</em>) serta menghadiri jadwal kontrol evaluasi medis yang telah ditetapkan demi hasil perawatan optimal.</p>

<h3>Pasal 5: Pernyataan Kesadaran Penuh & Tanda Tangan Digital</h3>
<p>Surat persetujuan tindakan medis ini disetujui dan ditandatangani secara sadar tanpa paksaan dari pihak manapun, serta disahkan melalui <strong>tanda tangan digital / persetujuan elektronik</strong> yang memiliki kekuatan hukum pembuktian resmi.</p>
`;

export function getTermsBodyHtml(terms: Partial<PdfTermsSettings> | null | undefined): string {
  if (terms?.bodyHtml && terms.bodyHtml.trim().length > 0) {
    return terms.bodyHtml;
  }
  if (terms?.sections && terms.sections.length > 0) {
    return terms.sections
      .map((s) => `<h3>${s.title}</h3><p>${s.content}</p>`)
      .join("\n");
  }
  return DEFAULT_TERMS_HTML.trim();
}

export function getConsentBodyHtml(consent: Partial<PdfConsentSettings> | null | undefined): string {
  if (consent?.bodyHtml && consent.bodyHtml.trim().length > 0) {
    return consent.bodyHtml;
  }
  if (consent?.clausuls && consent.clausuls.length > 0) {
    return consent.clausuls
      .map((c) => `<h3>${c.title}</h3><p>${c.content}</p>`)
      .join("\n");
  }
  return DEFAULT_CONSENT_HTML.trim();
}

// Default Fallback Configurations
export const DEFAULT_GENERAL_INFO: ClinicGeneralInfo = {
  clinicName: "Aesthetic Pondok Indah Dental Clinic",
  tagline: "Pusat Perawatan Gigi Estetik & Spesialis Komprehensif",
  whatsappNumber: "628198974030",
  phone: "(021) 750-1234",
  email: "info@aestheticpondokindah.com",
  address: "Jl. Metro Pondok Indah Blok TB No. 12, Pondok Pinang, Kebayoran Lama, Jakarta Selatan 12310",
  operatingHours: "Senin - Sabtu: 09:00 - 20:00 WIB | Minggu: 10:00 - 17:00 WIB",
};

export const DEFAULT_TERMS_SETTINGS: PdfTermsSettings = {
  kop: {
    clinicName: "PT NAVENA INTERNATIONAL GROUP",
    phone: "+62 21 555 1900",
    email: "navenainternationalgroup@gmail.com",
    address: "Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan, Provinsi DKI Jakarta, 12310",
    logoUrl: "/logo/logo.webp",
    logoWidth: 75,
    logoHeight: 75,
  },
  docTitle: "SYARAT DAN KETENTUAN LAYANAN & PERAWATAN GIGI",
  docSubtitle: "Pedoman Resmi Pasien Aesthetic Pondok Indah Dental Clinic",
  docVersion: "Versi 2.4 - Berlaku Resmi Tahun 2026",
  bodyHtml: DEFAULT_TERMS_HTML.trim(),
  baseFontSize: "9.5pt",
  sections: [
    {
      id: "sec-1",
      title: "1. Ketentuan Reservasi & Janji Temu",
      content: "Permintaan reservasi yang diajukan secara daring akan diproses oleh staf admin dan dikonfirmasi melalui sistem notifikasi resmi dan WhatsApp.",
    },
    {
      id: "sec-2",
      title: "2. Waktu Kedatangan & Keterlambatan",
      content: "Pasien diharapkan hadir di klinik minimal 10 menit sebelum waktu janji temu. Keterlambatan lebih dari 15 menit dapat menyebabkan penyesuaian jadwal antrean demi kenyamanan pasien lain.",
    },
    {
      id: "sec-3",
      title: "3. Kebijakan Pembatalan & Penjadwalan Ulang",
      content: "Pembatalan atau perubahan jadwal wajib diinformasikan selambat-lambatnya 2 jam sebelum waktu kunjungan agar jadwal dapat dialihkan.",
    },
    {
      id: "sec-4",
      title: "4. Rekam Medis & Kerahasiaan Data",
      content: "Seluruh data riwayat medis, foto rontgen, dan identitas pasien tersimpan dalam sistem Rekam Medis Elektronik berenkripsi dan dilindungi kerahasiaannya.",
    },
    {
      id: "sec-5",
      title: "5. Pembayaran, Biaya & Kebijakan Transaksi",
      content: "Biaya tindakan medis disesuaikan dengan jenis perawatan, tingkat kesulitan klinis, dan bahan medis yang disetujui pasien sebelum tindakan dimulai.",
    },
    {
      id: "sec-6",
      title: "6. Garansi & Perawatan Pasca Tindakan",
      content: "Klinik memberikan jaminan kualitas pengerjaan medis sesuai standar baku profesi kedokteran gigi dengan syarat pasien mematuhi anjuran kontrol pasca tindakan.",
    },
  ],
  footerNote: "Dokumen ini sah dan diterbitkan secara digital oleh Aesthetic Pondok Indah Dental Clinic.",
};

export const DEFAULT_CONSENT_SETTINGS: PdfConsentSettings = {
  kop: {
    clinicName: "PT NAVENA INTERNATIONAL GROUP",
    phone: "+62 21 555 1900",
    email: "navenainternationalgroup@gmail.com",
    address: "Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan, Provinsi DKI Jakarta, 12310",
    logoUrl: "/logo/logo.webp",
    logoWidth: 75,
    logoHeight: 75,
  },
  docTitle: "SURAT PERSETUJUAN TINDAKAN KEDOKTERAN GIGI (INFORMED CONSENT)",
  docSubtitle: "Pernyataan Persetujuan Tindakan Medis & Prosedur Perawatan Pasien",
  docCode: "IC-APID-2026",
  bodyHtml: DEFAULT_CONSENT_HTML.trim(),
  baseFontSize: "9.5pt",
  clausuls: [
    {
      id: "clausul-1",
      title: "Pasal 1: Penjelasan Rencana Tindakan Medis",
      content: "Dokter gigi yang merawat telah memberikan penjelasan secara lengkap mengenai diagnosa klinis, tujuan perawatan, tata cara tindakan medis, serta alternatif perawatan yang tersedia.",
    },
    {
      id: "clausul-2",
      title: "Pasal 2: Pemahaman Risiko & Respon Biologis",
      content: "Pasien memahami bahwa setiap tindakan medis kedokteran gigi memiliki risiko dan kemungkinan komplikasi wajar yang bergantung pada respon biologis jaringan tubuh dan anatomi gigi pasien.",
    },
    {
      id: "clausul-3",
      title: "Pasal 3: Persetujuan Tindakan Anestesi & Sedasi",
      content: "Pasien menyetujui pemberian anestesi lokal atau obat-obatan pendukung yang dinilai perlu secara medis oleh dokter gigi untuk kelancaran dan kenyamanan tindakan.",
    },
    {
      id: "clausul-4",
      title: "Pasal 4: Komitmen Pasca Perawatan & Kontrol",
      content: "Pasien berkomitmen untuk mematuhi seluruh petunjuk perawatan pasca tindakan dan menghadiri jadwal kontrol evaluasi medis yang telah ditetapkan.",
    },
    {
      id: "clausul-5",
      title: "Pasal 5: Pernyataan Kesadaran Penuh & Tanda Tangan Digital",
      content: "Surat persetujuan ini ditandatangani secara sadar, tanpa paksaan, dan disahkan melalui tanda tangan digital yang memiliki kekuatan hukum pembuktian resmi.",
    },
  ],
  closingStatement: "Demikian surat persetujuan tindakan medis ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.",
};

export async function getAdminClinicSettings(): Promise<{
  general: ClinicGeneralInfo;
  terms: PdfTermsSettings;
  consent: PdfConsentSettings;
}> {
  try {
    const res: any = await apiClient.get("/admin/clinic-settings", { skipToast: true });
    const settingsList: any[] = res?.settings || (Array.isArray(res) ? res : []);
    const settingsMap = new Map<string, any>();
    settingsList.forEach((s) => settingsMap.set(s.key, s.value));

    const general = settingsMap.get("clinic_general_info") || DEFAULT_GENERAL_INFO;
    const terms = settingsMap.get("pdf_terms_and_conditions") || DEFAULT_TERMS_SETTINGS;
    const consent = settingsMap.get("pdf_informed_consent") || DEFAULT_CONSENT_SETTINGS;

    return { general, terms, consent };
  } catch {
    return {
      general: DEFAULT_GENERAL_INFO,
      terms: DEFAULT_TERMS_SETTINGS,
      consent: DEFAULT_CONSENT_SETTINGS,
    };
  }
}

export async function saveClinicSetting(key: string, value: any): Promise<void> {
  await apiClient.put('/admin/clinic-settings/' + key, { value });
}
