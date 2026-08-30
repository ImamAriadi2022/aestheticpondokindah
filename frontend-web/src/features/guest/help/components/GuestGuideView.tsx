import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Sparkles,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  FileCheck,
  PenTool,
  QrCode,
  MessageSquare,
  Award,
  ChevronDown,
  ChevronUp,
  Printer,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  ArrowRight,
} from "lucide-react";

export default function GuestGuideView({ onPrint }: { onPrint?: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>("bab-1");

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#FAF5EA] via-[#FDFBF7] to-white border border-[#EADBBD] p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C9A24A]/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#C9A24A]/15 to-[#B8943F]/15 border border-[#C9A24A]/30 text-[#8C6B1C] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
            Dokumentasi Resmi Tamu & Pengunjung Klinik
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D332A] tracking-tight">
            Panduan Lengkap Pasien Tamu (Guest)
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed max-w-2xl">
            Selamat datang di portal Aesthetic Pondok Indah Dental Clinic. Panduan ini disusun dari sudut pandang Anda sebagai pengunjung untuk mempermudah proses pencarian perawatan gigi, konsultasi dokter spesialis, hingga reservasi jadwal tindakan medis tanpa perlu mendaftar akun terlebih dahulu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/booking-new">
              <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer">
                Mulai Reservasi Cepat <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl border-[#D9D0BC] text-[#6B5E4F] hover:bg-[#FAF5EA] font-semibold text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Cetak / Simpan PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            1
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Pilih Layanan & Dokter</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Eksplorasi 200+ jenis perawatan dan jadwal spesialis.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            2
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Pilih Waktu Kedatangan</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Tentukan tanggal dan shift praktik yang fleksibel.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            3
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Persetujuan 2 PDF Medis</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Ceklis S&K dan bubuhkan Tanda Tangan Digital di PDF.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            4
          </div>
          <p className="text-xs font-bold text-[#3D332A]">E-Ticket & WhatsApp</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Dapatkan QR Code tiket dan notifikasi konfirmasi instan.</p>
        </div>
      </div>

      {/* Detailed Chapters */}
      <div className="space-y-4">
        {/* BAB 1 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-1")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 1: Menemukan Perawatan Gigi & Profil Dokter Spesialis
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Cara menelusuri katalog layanan, membaca deskripsi prosedur medis, dan memilih dokter yang tepat.
                </p>
              </div>
            </div>
            {openSection === "bab-1" ? (
              <ChevronUp className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            )}
          </div>

          {openSection === "bab-1" && (
            <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-[#4A3F35] leading-relaxed bg-[#FAFBF9]/40">
              <div className="space-y-3">
                <h3 className="font-bold text-[#3D332A] text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  1. Eksplorasi Katalog Layanan (200+ Tindakan Medis)
                </h3>
                <p>
                  Sebagai pengunjung, Anda dapat membuka halaman <strong>Layanan</strong> untuk melihat daftar lengkap seluruh tindakan medis yang tersedia di klinik kami. Layanan dikelompokkan dalam kategori spesifik:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#5C5042]">
                  <li><strong>Ortodonti (Behel & Aligner)</strong>: Pemasangan kawat gigi metal/damon/sapphire serta Invisalign untuk merapikan susunan gigi.</li>
                  <li><strong>Estetika Gigi (Cosmetic Dentistry)</strong>: Dental Whitening (Bleaching laser), Porcelain/Composite Veneer, dan Smile Makeover.</li>
                  <li><strong>Konservasi & Endodontik</strong>: Penambalan estetik, Perawatan Saluran Akar (Root Canal Treatment), dan Onlay/Crown gigi.</li>
                  <li><strong>Bedah Mulut & Implan</strong>: Odontektomi (pencabutan gigi bungsu impaksi), Implan titanium, dan Frenektomi.</li>
                  <li><strong>Periodonsia & Dental Spa</strong>: Pembersihan karang gigi (Scaling Ultrasonic), Gum Treatment, dan Air Flow Stain Removal.</li>
                  <li><strong>Pedodonti (Gigi Anak)</strong>: Perawatan gigi khusus anak-anak dengan pendekatan ramah dan tanpa rasa takut.</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-[#3D332A] text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  2. Memeriksa Kredensial Dokter Spesialis
                </h3>
                <p>
                  Pada menu <strong>Dokter</strong>, Anda dapat melihat daftar seluruh dokter gigi spesialis kami yang telah teregistrasi resmi dengan nomor STR dan SIP dari Kementerian Kesehatan RI dan Konsil Kedokteran Indonesia. Anda dapat membaca spesialisasi klinis, riwayat universitas, pengalaman praktik, serta cabang klinik tempat dokter tersebut bertugas.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* BAB 2 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-2")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 2: Alur Reservasi Cepat Pasien Tamu (Guest Booking)
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Langkah memilih cabang, tanggal, dokter, mengisi identitas dengan format WhatsApp +62.
                </p>
              </div>
            </div>
            {openSection === "bab-2" ? (
              <ChevronUp className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            )}
          </div>

          {openSection === "bab-2" && (
            <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-[#4A3F35] leading-relaxed bg-[#FAFBF9]/40">
              <p>
                Sebagai pasien tamu, Anda tidak diwajibkan mendaftar akun terlebih dahulu untuk memesan janji temu. Proses reservasi dapat diselesaikan dalam 4 langkah terstruktur:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A]">Langkah 1: Menentukan Perawatan Gigi</p>
                  <p className="text-xs text-[#6B5E4F] mt-1">
                    Pilih nama perawatan yang Anda butuhkan melalui formulir booking atau klik tombol "Book Now" pada kartu layanan pilihan Anda di beranda.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A]">Langkah 2: Memilih Dokter & Jadwal Kedatangan</p>
                  <p className="text-xs text-[#6B5E4F] mt-1">
                    Pilih dokter gigi spesialis yang Anda inginkan beserta tanggal kunjungan dan jam shift praktik (Pagi / Siang / Sore). Sistem secara otomatis hanya menampilkan slot waktu dokter yang sedang aktif dan bersedia.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A]">Langkah 3: Mengisi Data Pasien & Nomor WhatsApp (+62)</p>
                  <p className="text-xs text-[#6B5E4F] mt-1">
                    Masukkan <strong>Nama Lengkap Pasien</strong> yang akan menjalani tindakan dan <strong>Nomor WhatsApp Aktif</strong>.
                  </p>
                  <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#C9A24A] shrink-0 mt-0.5" />
                    <span>
                      <strong>Format WhatsApp Standar:</strong> Kolom nomor telepon dilengkapi prefix otomatis <code className="bg-amber-100/80 px-1 py-0.5 rounded font-bold">+62</code>. Anda cukup mengetikkan sisa digit nomor HP (misal: <em>81234567890</em>). E-Ticket dan reminder jadwal akan otomatis dikirimkan ke nomor WhatsApp ini.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* BAB 3 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-3")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 3: Verifikasi 2 Dokumen Persetujuan Medis (PDF) Resmi
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Prosedur persetujuan Syarat & Ketentuan serta penandatanganan Informed Consent di dalam lembar PDF.
                </p>
              </div>
            </div>
            {openSection === "bab-3" ? (
              <ChevronUp className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            )}
          </div>

          {openSection === "bab-3" && (
            <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-[#4A3F35] leading-relaxed bg-[#FAFBF9]/40">
              <p>
                Sesuai standar operasional medis dan kepatuhan medikolegal klinik, setiap reservasi mewajibkan persetujuan terhadap <strong>2 dokumen terpisah</strong> yang dilakukan langsung di dalam tampilan PDF:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* PDF 1 */}
                <div className="p-4 bg-white rounded-2xl border border-[#EADBBD] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center">1</span>
                    <h3 className="font-bold text-[#3D332A] text-xs">PDF 1: Syarat & Ketentuan Layanan (S&K)</h3>
                  </div>
                  <p className="text-xs text-[#6B5E4F]">
                    Memuat hak dan kewajiban pasien, kebijakan pembatalan / penyesuaian jadwal, dan etika kunjungan klinik.
                  </p>
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                    <strong>Cara Validasi:</strong> Klik tombol <em>"Buka & Ceklis S&K PDF"</em>, gulir dokumen hingga selesai, centang persetujuan di dalam PDF, lalu klik <em>"Simpan & Lanjutkan"</em>.
                  </div>
                </div>

                {/* PDF 2 */}
                <div className="p-4 bg-white rounded-2xl border border-[#EADBBD] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">2</span>
                    <h3 className="font-bold text-[#3D332A] text-xs">PDF 2: Surat Persetujuan Medis (Informed Consent)</h3>
                  </div>
                  <p className="text-xs text-[#6B5E4F]">
                    Dokumen resmi persetujuan tindakan medis yang memuat nama pasien, dokter penanggung jawab, dan rincian perawatan.
                  </p>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                    <strong>Cara Validasi:</strong> Klik tombol <em>"Buka & Tanda Tangan PDF"</em>, goreskan tanda tangan Anda pada canvas digital di dalam PDF, ketik nama penandatangan, lalu klik <em>"Simpan Tanda Tangan"</em>.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF5EA] rounded-xl border border-[#EADBBD] text-xs text-[#6B5E4F]">
                Setelah kedua status dokumen berstatus hijau (<em>🟢 Telah Disetujui di PDF</em> & <em>🟢 Tanda Tangan Tersemat</em>), klik tombol <strong>"Setuju & Kirim Reservasi"</strong> untuk menyelesaikan pemesanan jadwal.
              </div>
            </CardContent>
          )}
        </Card>

        {/* BAB 4 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-4")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 4: E-Ticket Digital & Prosedur Kedatangan di Klinik
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Menyimpan QR Code tiket booking, menerima notifikasi WhatsApp Zesta, dan check-in di klinik.
                </p>
              </div>
            </div>
            {openSection === "bab-4" ? (
              <ChevronUp className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            )}
          </div>

          {openSection === "bab-4" && (
            <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-[#4A3F35] leading-relaxed bg-[#FAFBF9]/40">
              <div className="space-y-3">
                <h3 className="font-bold text-[#3D332A] text-sm">Penerbitan E-Ticket Instan</h3>
                <p>
                  Setelah reservasi terkirim, layar Anda akan menampilkan <strong>E-Ticket Digital Resmi</strong> yang memuat:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-[#5C5042]">
                  <li><strong>Kode Booking Unik</strong> (misal: <em>API-GUEST-2026-0830-101</em>).</li>
                  <li><strong>QR Code Verifikasi</strong> untuk pemindaian instan di resepsionis.</li>
                  <li>Rincian dokter spesialis, cabang klinik, tanggal, dan estimasi waktu konsultasi.</li>
                </ul>

                <h3 className="font-bold text-[#3D332A] text-sm pt-2">Kedatangan di Meja Resepsionis Klinik</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2 text-[#5C5042]">
                  <li>Disarankan tiba di klinik <strong>10–15 menit</strong> sebelum jadwal tindakan untuk persiapan kenyamanan Anda.</li>
                  <li>Tunjukkan QR Code E-Ticket pada ponsel Anda atau sebutkan Nama / Nomor WhatsApp kepada staf front office resepsionis.</li>
                  <li>Staf kami akan langsung mencocokkan data tanpa perlu mengisi formulir manual lagi, dan Anda akan dipersilakan menuju ruang tunggu premium.</li>
                </ol>
              </div>
            </CardContent>
          )}
        </Card>

        {/* BAB 5 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-5")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 5: Beralih Menjadi Member (Klaim Poin Reward Loyalty)
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Cara mendaftarkan akun member dengan nomor WhatsApp yang sama untuk mendapatkan diskon & reward.
                </p>
              </div>
            </div>
            {openSection === "bab-5" ? (
              <ChevronUp className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            )}
          </div>

          {openSection === "bab-5" && (
            <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-[#4A3F35] leading-relaxed bg-[#FAFBF9]/40">
              <p>
                Setiap tindakan perawatan yang Anda lakukan di klinik berhak mendapatkan <strong>Poin Loyalty</strong> yang dapat ditukarkan dengan voucher potongan biaya perawatan di masa mendatang.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-[#EADBBD] space-y-2">
                <p className="font-bold text-[#3D332A]">Cara Mengaktifkan Akun Pasien Member:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#5C5042]">
                  <li>Buka menu <strong>Masuk / Daftar</strong> di pojok kanan atas website.</li>
                  <li>Pilih <em>"Daftar Akun Baru"</em> dan masukkan nomor WhatsApp yang sama dengan saat Anda melakukan reservasi tamu.</li>
                  <li>Verifikasi 6-digit kode OTP yang dikirimkan via WhatsApp.</li>
                  <li>Akun Anda langsung aktif dengan level membership <strong>Bronze</strong> dan seluruh riwayat perawatan serta poin Anda akan otomatis terhubung!</li>
                </ol>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Customer Support Contact Card */}
      <Card className="rounded-3xl border-[#EADBBD] bg-gradient-to-br from-[#FAF5EA] to-[#FDFBF7] p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white text-[#8C6B1C] border border-[#EADBBD] flex items-center justify-center mx-auto shadow-2xs">
          <Phone className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#3D332A]">Butuh Bantuan Reservasi Langsung?</h3>
        <p className="text-xs text-[#7A6E60] max-w-md mx-auto">
          Tim Customer Care Aesthetic Pondok Indah siap membantu Anda setiap hari pukul 08:00 – 21:00 WIB via WhatsApp Official.
        </p>
        <div className="pt-1">
          <a
            href="https://wa.me/6281990114949?text=Halo%20Admin%20Aesthetic%20Pondok%20Indah,%20saya%20ingin%20konsultasi%20jadwal%20reservasi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" /> Chat WhatsApp Customer Care (+62 819-9011-4949)
          </a>
        </div>
      </Card>
    </div>
  );
}
