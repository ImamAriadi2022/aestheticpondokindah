import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Award,
  Calendar,
  Clock,
  QrCode,
  Gift,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  History,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function PatientGuideView() {
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
            <Award className="w-3.5 h-3.5 text-[#C9A24A]" />
            Dokumentasi Khusus Pasien Member Terdaftar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D332A] tracking-tight">
            Panduan Lengkap Pasien Member
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed max-w-2xl">
            Panduan ini dirancang khusus dari sudut pandang Anda sebagai <strong>Pasien Member Aesthetic Pondok Indah</strong>. Pelajari cara memanfaatkan kartu pasien digital, kemudahan reservasi prioritas, pengumpulan poin loyalty di setiap kunjungan, hingga penukaran voucher diskon eksklusif.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/booking-new">
              <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer">
                Booking Perawatan Sekarang <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            1
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Kartu Member Digital</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Tier Bronze, Gold, Platinum & diskon hingga 15%.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            2
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Booking Prioritas 1-Klik</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Identitas terisi otomatis tanpa perlu ketik ulang.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            3
          </div>
          <p className="text-xs font-bold text-[#3D332A]">E-Ticket & Riwayat</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Pantau status reservasi & catatan medis kunjungan.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            4
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Poin Reward & Voucher</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Tukarkan poin dengan potongan biaya perawatan.</p>
        </div>
      </div>

      {/* Chapters Accordion */}
      <div className="space-y-4">
        {/* BAB 1 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-1")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 1: Memahami Kartu Member Digital & Keuntungan Tiap Level
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Hierarki tingkatan membership, persentase diskon tindakan medis, dan perolehan poin.
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
              <p>
                Sebagai pasien member terdaftar, Anda memiliki <strong>Kartu Pasien Digital</strong> yang selalu dapat diakses dari dashboard akun Anda. Terdapat 3 tingkatan loyalty dengan privilege istimewa:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 text-xs">🥉 BRONZE (Tingkat Awal)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 font-bold text-amber-900">Gratis Daftar</span>
                  </div>
                  <p className="text-xs text-[#6B5E4F]">Akses E-Ticket digital, riwayat perawatan, dan perolehan poin standar 1x setiap transaksi.</p>
                </div>

                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-yellow-900 text-xs">🥇 GOLD</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 font-bold text-yellow-900">Diskon 10%</span>
                  </div>
                  <p className="text-xs text-[#6B5E4F]">Potongan harga 10% untuk perawatan estetik & behel, 1.5x multiplier poin, prioritas booking, dan gratis scaling 1x/tahun.</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-900 text-xs">💎 PLATINUM (VIP)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 font-bold text-purple-900">Diskon 15% VIP</span>
                  </div>
                  <p className="text-xs text-[#6B5E4F]">Potongan harga 15% VIP, 2.0x multiplier poin tercepat, prioritas ruang tunggu VIP, free scaling 2x/tahun, dan dedicated CS.</p>
                </div>
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
                  Bab 2: Pemesanan Jadwal Kontrol & Perawatan Prioritas
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Reservasi cepat dengan profil akun otomatis dan memilih dokter langganan.
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
              <div className="space-y-3">
                <h3 className="font-bold text-[#3D332A] text-sm">Kemudahan Reservasi Pasien Member</h3>
                <p>
                  Ketika Anda masuk sebagai member, formulir reservasi secara otomatis mengenali nama lengkap, email, dan nomor WhatsApp Anda, sehingga Anda tidak perlu mengetik ulang data diri:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-2 text-[#5C5042]">
                  <li>Buka menu <strong>Reservasi</strong> di sidebar akun Anda atau klik tombol "Book Now".</li>
                  <li>Pilih tindakan perawatan atau paket promo yang ingin Anda jalani.</li>
                  <li>Pilih dokter spesialis langganan Anda dan tentukan tanggal kontrol.</li>
                  <li>Lakukan verifikasi persetujuan di lembar PDF (S&K dan Informed Consent) lalu kirim reservasi.</li>
                </ol>
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
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 3: E-Ticket Digital, Status Reservasi & Riwayat Kunjungan
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Memantau tiket aktif, QR Code check-in, dan arsip riwayat perawatan medis.
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
                Semua janji temu Anda tercatat secara aman pada tab <strong>Riwayat Reservasi</strong> di dashboard pasien:
              </p>
              <div className="space-y-2.5">
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A] text-xs">🟡 Menunggu Konfirmasi</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Reservasi baru saja dikirim dan sedang dijadwalkan oleh sistem klinik.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-emerald-800 text-xs">🟢 Terkonfirmasi (Confirmed)</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Jadwal telah dikunci oleh klinik. QR Code E-Ticket siap dipindai saat Anda hadir di klinik.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-blue-800 text-xs">🔵 Dalam Perawatan</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Anda sedang berada di ruang tindakan bersama dokter spesialis.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-stone-700 text-xs">⚪ Selesai (Completed)</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Prosedur telah tuntas, poin reward otomatis masuk ke saldo loyalty akun Anda.</p>
                </div>
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
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 4: Program Loyalty Points & Penukaran Voucher Diskon
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Cara mengumpulkan poin dari transaksi di kasir dan menukarkannya di katalog hadiah.
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
              <p>
                Setiap pembayaran yang diselesaikan di kasir klinik (Tunai, Debit, Kartu Kredit, QRIS, Transfer) otomatis menghasilkan <strong>Poin Reward</strong> yang masuk ke akun Anda.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-[#EADBBD] space-y-2">
                <p className="font-bold text-[#3D332A]">Langkah Menukar Poin dengan Voucher:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#5C5042]">
                  <li>Buka tab <strong>Membership</strong> di dashboard akun Anda.</li>
                  <li>Periksa saldo poin Anda di kartu member digital.</li>
                  <li>Pilih voucher diskon yang diinginkan dari <em>Katalog Hadiah Reward</em> (misal: <em>Voucher Diskon Rp 100.000 Scaling Gigi</em>).</li>
                  <li>Klik tombol <strong>"Tukar Poin"</strong>. Kode voucher Anda akan langsung tersimpan dan dapat digunakan saat pembayaran di kasir klinik.</li>
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
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 5: Pengaturan Profil, Nomor WhatsApp & Keamanan Akun
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Memperbarui nomor WhatsApp (+62), preferensi kesehatan gigi, dan menghubungkan Google SSO.
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
              <ul className="list-disc list-inside space-y-2 text-[#5C5042]">
                <li>
                  <strong>Pembaruan Nomor WhatsApp:</strong> Masuk ke <em>Pengaturan Profil</em>. Kolom WhatsApp dilengkapi badge <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">+62</code> permanen. Pastikan nomor selalu aktif agar tidak melewatkan tiket reservasi.
                </li>
                <li>
                  <strong>Preferensi Kesehatan Gigi:</strong> Anda dapat mengisi riwayat keluhan gigi, kebiasaan konsumsi kopi/teh, atau tanggal kunjungan gigi terakhir agar dokter dapat mempersiapkan penanganan terbaik sebelum Anda tiba.
                </li>
                <li>
                  <strong>Google Sign-In (SSO):</strong> Hubungkan akun Google Anda di halaman Keamanan untuk login 1-klik yang cepat dan praktis tanpa perlu mengingat password.
                </li>
              </ul>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
