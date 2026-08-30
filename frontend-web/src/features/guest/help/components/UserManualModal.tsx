import { useState } from "react";
import {
  BookOpen,
  X,
  Printer,
  ShieldCheck,
  Stethoscope,
  User,
  Calendar,
  CheckCircle2,
  FileText,
  CreditCard,
  Award,
  Sparkles,
  MessageSquare,
  Search,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";

interface UserManualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: "admin" | "doctor" | "user";
}

export default function UserManualModal({
  open,
  onOpenChange,
  defaultRole = "user",
}: UserManualModalProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "doctor" | "user">(defaultRole);
  const [search, setSearch] = useState("");

  const handlePrintGuide = () => {
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

    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Buku Panduan Pengguna & SOP - Aesthetic Pondok Indah</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 15mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.6; font-size: 10pt; }
            .kop { text-align: center; border-bottom: 2.5px solid #000; padding-bottom: 10px; margin-bottom: 16px; }
            .title { font-size: 14pt; font-weight: 800; text-transform: uppercase; margin: 0; }
            .sub { font-size: 8.5pt; color: #555; margin-top: 4px; }
            h2 { font-size: 12pt; color: #8C6B1C; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 18px; }
            h3 { font-size: 10.5pt; color: #222; margin-top: 12px; margin-bottom: 4px; }
            p { margin: 4px 0 8px 0; color: #333; }
            ol, ul { margin: 4px 0 8px 20px; padding: 0; }
            li { margin-bottom: 4px; }
            .badge { display: inline-block; padding: 2px 6px; background: #FAF5EA; border: 1px solid #EADBBD; color: #8C6B1C; font-size: 8pt; font-weight: bold; border-radius: 4px; }
            .note { background: #f9f9f9; border-left: 3px solid #8C6B1C; padding: 6px 10px; font-style: italic; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="kop">
            <div class="title">Buku Panduan Pengguna & Standar Operasional Prosedur (SOP)</div>
            <div class="sub">Aesthetic Pondok Indah Dental Clinic — Sistem Informasi & Manajemen Terpadu</div>
          </div>
          <div>
            <h2>1. PANDUAN PENGGUNA PASIEN & PENGUNJUNG (USER / GUEST)</h2>
            <h3>A. Alur Reservasi Online</h3>
            <ol>
              <li>Pilih layanan perawatan gigi yang dibutuhkan dari katalog layanan.</li>
              <li>Pilih dokter spesialis gigi dan cabang klinik yang diinginkan.</li>
              <li>Tentukan tanggal dan jam konsultasi sesuai ketersediaan slot.</li>
              <li>Isi data identitas diri dan nomor WhatsApp aktif.</li>
              <li>Tanda tangani Surat Persetujuan Tindakan Medis (Informed Consent) secara digital di dalam dokumen PDF.</li>
              <li>Dapatkan E-Ticket QR Code untuk check-in di klinik.</li>
            </ol>

            <h2>2. PANDUAN DOKTER SPESIALIS GIGI</h2>
            <h3>A. Manajemen Jadwal Praktik & Antrean Pasien</h3>
            <ol>
              <li>Buka jadwal praktik harian di Dashboard Dokter untuk melihat antrean pasien hari ini.</li>
              <li>Atur ketersediaan hari dan jam shift kerja pada menu Jadwal Praktik.</li>
              <li>Tinjau daftar pasien, jenis perawatan yang dipilih, dan riwayat keluhan awal pasien.</li>
              <li>Periksa Surat Persetujuan Medis (Informed Consent) ber-tanda tangan digital pasien.</li>
              <li>Perbarui status penanganan pasien (Terkonfirmasi, Dalam Tindakan, Selesai).</li>
            </ol>

            <h2>3. PANDUAN ADMINISTRATOR & MANAJEMEN KLINIK</h2>
            <h3>A. Pengelolaan Operasional Reservasi & Layanan</h3>
            <ol>
              <li>Validasi permohonan reservasi baru yang masuk dan sinkronkan dengan WhatsApp Zesta.</li>
              <li>Kelola data 200+ layanan gigi, kategori spesialisasi, tarif medis, dan estimasi durasi.</li>
              <li>Atur jadwal praktik, shift, dan status ketersediaan dokter spesialis.</li>
              <li>Konfigurasi Kop Surat resmi, logo klinik, Syarat & Ketentuan, serta Surat Perjanjian Informed Consent PDF.</li>
            </ol>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#EDE5D6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner">
              <BookOpen className="w-5 h-5 text-[#8C6B1C]" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-[#2C2416]">
                Buku Panduan Pengguna & SOP Operasional
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8C8272]">
                Dokumentasi fungsional resmi untuk Administrator, Dokter Spesialis, dan Pasien Klinik
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintGuide}
              className="h-8 px-3 rounded-xl border-[#E8DFC8] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Panduan</span>
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-[#FAF5EA] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="px-6 pt-4 pb-2 bg-white/70 border-b border-[#EDE5D6] flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedRole("user")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              selectedRole === "user"
                ? "bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-xs"
                : "bg-white text-[#5C5546] border-[#E8DFC8] hover:bg-[#FAF8F5]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>👤 Panduan Pasien / Tamu</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("doctor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              selectedRole === "doctor"
                ? "bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-xs"
                : "bg-white text-[#5C5546] border-[#E8DFC8] hover:bg-[#FAF8F5]"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>🩺 Panduan Dokter Spesialis</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              selectedRole === "admin"
                ? "bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-xs"
                : "bg-white text-[#5C5546] border-[#E8DFC8] hover:bg-[#FAF8F5]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>👑 Panduan Admin Klinik</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. ROLE: PASIEN / TAMU */}
          {selectedRole === "user" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>1. Cara Melakukan Reservasi Janji Temu (Online Booking)</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <p>
                    Pasien dapat memesan jadwal konsultasi atau perawatan gigi dengan langkah mudah berikut:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Pilih menu <strong>"Book Now"</strong> di beranda atau masuk ke katalog <strong>"Layanan"</strong>.</li>
                    <li>Tentukan kategori perawatan (misal: <em>Veneer, Scaling, Ortodonti, Tambal Gigi</em>).</li>
                    <li>Pilih cabang klinik terdekat (Pondok Indah / Cabang Lain) dan dokter spesialis yang diinginkan.</li>
                    <li>Pilih tanggal kedatangan dan slot jam praktik dokter yang masih tersedia.</li>
                    <li>Isi nama lengkap, nomor WhatsApp aktif, dan keluhan utama pada gigi Anda.</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>2. Persetujuan Syarat & Tanda Tangan Digital di PDF (Informed Consent)</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <p>
                    Untuk memenuhi standar regulasi medis resmi dan rekam medis elektronik:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Setelah klik <strong>Book Now</strong>, sistem akan menampilkan lembar <strong>Surat Pernyataan & Persetujuan Pasien (Informed Consent)</strong> resmi ber-kop surat.</li>
                    <li>Centang kotak persetujuan pada bagian bawah lembar PDF.</li>
                    <li>Goreskan tanda tangan digital Anda langsung di area tanda tangan menggunakan jari (layar sentuh HP) atau mouse.</li>
                    <li>Klik <strong>"Setujui & Kirim Reservasi"</strong>. Dokumen PDF tersimpan aman dan sah secara hukum.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span>3. Menggunakan E-Ticket & Program Membership Loyalty Poin</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Setelah reservasi berhasil, buka menu <strong>"Riwayat Reservasi"</strong> untuk melihat <strong>E-Ticket digital ber-QR Code</strong>.</li>
                    <li>Tunjukkan QR Code E-Ticket kepada petugas resepsionis saat tiba di klinik untuk check-in instan.</li>
                    <li>Kumpulkan poin loyalty setiap selesai tindakan medis untuk menaikkan tier membership (Bronze, Silver, Gold, Platinum).</li>
                    <li>Poin dapat ditukarkan dengan voucher potongan biaya perawatan di menu <strong>"Membership & Hadiah"</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. ROLE: DOKTER SPESIALIS */}
          {selectedRole === "doctor" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>1. Memeriksa Jadwal Praktik & Antrean Pasien Harian</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <p>
                    Sebagai dokter gigi mitra spesialis di Aesthetic Pondok Indah:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Login dengan akun Dokter dan buka <strong>"Dashboard Dokter"</strong>.</li>
                    <li>Lihat ringkasan jadwal kunjungan pasien hari ini, slot jam praktik, dan status kedatangan pasien.</li>
                    <li>Pilih pasien untuk melihat detail keluhan awal, foto rontgen terlampir, dan riwayat kunjungan terdahulu.</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>2. Verifikasi Surat Persetujuan Tindakan (Informed Consent)</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Sebelum tindakan medis dilakukan, dokter dapat meninjau lembar <strong>Informed Consent</strong> yang telah ditandatangani secara digital oleh pasien.</li>
                    <li>Dokumen ini memastikan pasien telah memahami prosedur, indikasi perawatan, dan menyetujui tindakan klinis yang akan dijalani.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Pembaruan Status Penanganan Reservasi Pasien</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <p>
                    Dokter dapat memperbarui status penanganan pasien pada tab <strong>"Daftar Pasien"</strong> saat pasien sedang dalam penanganan (<em>Dalam Tindakan</em>) hingga perawatan selesai (<em>Selesai</em>) demi kelancaran alur antrean klinik.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. ROLE: ADMIN KLINIK */}
          {selectedRole === "admin" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>1. Manajemen Reservasi & WhatsApp Gateway (Zesta)</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <ol className="list-decimal pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Buka menu <strong>"Reservasi Pasien"</strong> di sidebar Admin.</li>
                    <li>Tinjau reservasi masuk berstatus <em>"Menunggu Konfirmasi"</em>.</li>
                    <li>Konfirmasi jadwal dan kirimkan notifikasi otomatis WhatsApp ke pasien melalui gateway terintegrasi.</li>
                    <li>Cetak formulir Informed Consent atau E-Ticket jika pasien membutuhkan versi fisik di klinik.</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <Stethoscope className="w-4 h-4" />
                  <span>2. Pengelolaan 200+ Katalog Layanan, Dokter & Jadwal</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li><strong>Katalog Layanan (public-services)</strong>: Kelola 200+ prosedur gigi, tarif resmi, deskripsi tahapan medis, dan toggle aktif/nonaktif.</li>
                    <li><strong>Data Dokter (doctors)</strong>: Tambah dokter spesialis baru, unggah foto profil, atur nomor STR/SIP, dan jadwalkan hari/jam praktik.</li>
                    <li><strong>Informasi Publik (CMS)</strong>: Atur artikel edukasi gigi (blog), testimoni pasien, promo diskon, pop-up klinik, dan pusat FAQ.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#8C6B1C] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. Pengaturan Kop Surat Resmi & Template Dokumen PDF</span>
                </div>
                <div className="space-y-2 text-xs text-[#5C5546] leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1.5 text-[#3D332A] font-medium">
                    <li>Buka menu <strong>"Pengaturan Klinik"</strong> di sidebar Admin.</li>
                    <li>Atur logo instansi, nama klinik resmi, alamat lengkap, kontak telepon, dan email kop surat.</li>
                    <li>Edit pasal-pasal <strong>Syarat & Ketentuan (S&K)</strong> dan <strong>Surat Pernyataan Informed Consent</strong>.</li>
                    <li>Gunakan tombol <strong>"Lihat Preview PDF"</strong> untuk memastikan format tampilan 100% presisi dengan lembar yang dilihat oleh pasien.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EDE5D6] flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#8C8272]">
            Perlu bantuan lebih lanjut? Hubungi IT Support Aesthetic Pondok Indah di <strong className="text-[#8C6B1C]">0819-9011-4949</strong>.
          </p>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Tutup Panduan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
