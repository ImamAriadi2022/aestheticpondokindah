import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Stethoscope,
  Calendar,
  Clock,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Printer,
  Sparkles,
  ShieldCheck,
  PenTool,
  Users,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function DoctorGuideView({ onPrint }: { onPrint?: () => void }) {
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
            <Stethoscope className="w-3.5 h-3.5 text-[#C9A24A]" />
            Standar Operasional Prosedur (SOP) Dokter Spesialis
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D332A] tracking-tight">
            Panduan Dokter Spesialis Gigi
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed max-w-2xl">
            Selamat bertugas di Aesthetic Pondok Indah Dental Clinic. Dokumen ini disusun dari sudut pandang Anda sebagai <strong>Dokter Praktisi / Spesialis</strong> untuk memandu pengelolaan jadwal praktik, peninjauan daftar pasien, verifikasi berkas <em>Informed Consent</em> ber-tanda tangan digital, hingga manajemen kredensial SIP/STR.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/dashboard/doctor">
              <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer">
                Buka Dashboard Dokter <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl border-[#D9D0BC] text-[#6B5E4F] hover:bg-[#FAF5EA] font-semibold text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Cetak SOP Dokter (PDF)
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
          <p className="text-xs font-bold text-[#3D332A]">Dashboard & Antrean</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Pantau pasien terjadwal hari ini di cabang praktik.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            2
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Jadwal Shift Praktik</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Atur hari, jam shift (Pagi/Siang/Sore), dan status cuti.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            3
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Cek Informed Consent</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Verifikasi tanda tangan digital pasien di lembar PDF.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            4
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Update Status Pasien</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Ubah status tindakan ke "Selesai" untuk kasir & poin.</p>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {/* BAB 1 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-1")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 1: Dashboard Praktik & Monitoring Pasien Harian
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Memahami indikator statistik kunjungan, ringkasan jadwal, dan antrean tindakan.
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
                Sebagai dokter spesialis, Dashboard Utama Anda (<code className="bg-[#FAF5EA] px-1 py-0.5 rounded text-[#8C6B1C] font-bold">/dashboard/doctor</code>) memberikan gambaran operasional harian secara instan:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#5C5042] pl-2">
                <li><strong>Kartu Statistik Kunjungan:</strong> Menampilkan total pasien terdaftar hari ini, pasien yang telah selesai, dan pasien yang sedang menunggu di ruang tunggu klinik.</li>
                <li><strong>Slot Waktu Tindakan:</strong> Memperlihatkan jam kedatangan masing-masing pasien (misal: <em>10:00 WIB</em>, <em>14:30 WIB</em>) sehingga Anda dapat membagi waktu persiapan alat medis steril dengan efisien.</li>
                <li><strong>Ringkasan Keluhan Awal:</strong> Membaca keluhan gigi yang diisi pasien pada saat reservasi sebelum pasien dipersilakan masuk ke *dental unit chair*.</li>
              </ul>
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
                  Bab 2: Pengaturan Jadwal Praktik, Shift Kerja & Status Cuti
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Menentukan hari praktik (Senin - Minggu), jam shift kerja, dan menonaktifkan slot saat berhalangan.
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
                Sistem penjadwalan terhubung langsung dengan formulir reservasi pasien di website publik. Anda memiliki kendali penuh atas jadwal Anda:
              </p>
              <div className="p-4 bg-white rounded-2xl border border-[#EADBBD] space-y-2">
                <p className="font-bold text-[#3D332A]">Langkah Mengatur Jadwal Praktik:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#5C5042]">
                  <li>Buka tab <strong>Jadwal Praktik</strong> di menu dashboard dokter.</li>
                  <li>Pilih hari praktik (misal: <em>Senin, Rabu, Jumat, Sabtu</em>).</li>
                  <li>Tentukan jam shift praktik:
                    <ul className="list-disc list-inside pl-4 text-xs text-[#7A6E60] mt-1 space-y-0.5">
                      <li>Shift Pagi (09:00 - 13:00)</li>
                      <li>Shift Siang (13:00 - 17:00)</li>
                      <li>Shift Sore/Malam (17:00 - 21:00)</li>
                    </ul>
                  </li>
                  <li><strong>Status Ketersediaan / Cuti:</strong> Jika Anda berhalangan hadir atau sedang cuti simposium/seminar medis, matikan toggle <em>"Aktif Praktik"</em> agar pasien tidak dapat memilih tanggal tersebut pada sistem booking publik.</li>
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
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 3: Menu Daftar Pasien & Verifikasi Lembar Informed Consent
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Memeriksa keabsahan persetujuan medis digital pasien sebelum memulai prosedur klinis.
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
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A24A] shrink-0 mt-0.5" />
                <span>
                  <strong>Kepatuhan Medikolegal:</strong> Setiap tindakan kedokteran gigi wajib didahului oleh persetujuan tertulis dari pasien atau wali yang sah melalui surat <em>Informed Consent</em>.
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <h3 className="font-bold text-[#3D332A] text-sm">Prosedur Verifikasi Dokumen Dokter:</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2 text-[#5C5042]">
                  <li>Buka tab <strong>Daftar Pasien / Reservasi</strong> pada dashboard dokter.</li>
                  <li>Klik tombol <strong>"Lihat Berkas PDF / Informed Consent"</strong> pada baris pasien yang bersangkutan.</li>
                  <li>Periksa lembar PDF resmi berkop klinik untuk memastikan:
                    <ul className="list-disc list-inside pl-4 text-xs text-[#7A6E60] mt-1 space-y-0.5">
                      <li>Nama pasien dan tindakan medis sesuai dengan rencana perawatan.</li>
                      <li>Tanda tangan digital pasien tersemat rapi pada canvas dokumen beserta waktu persetujuan (*timestamp*).</li>
                    </ul>
                  </li>
                  <li>Setelah dokumen terverifikasi lengkap, Anda dapat memulai tindakan medis di dental chair.</li>
                </ol>
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
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 4: Pembaruan Status Penanganan Pasien di Klinik
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Alur status dari "Dalam Tindakan" hingga "Selesai" untuk integrasi kasir & loyalty points.
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
                Untuk menjaga sinkronisasi antara ruang tindakan dokter, resepsionis, dan kasir, dokter diharapkan memperbarui status reservasi:
              </p>
              <div className="space-y-2.5">
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-blue-800 text-xs">1. Pasien Masuk ➔ Status: "Dalam Tindakan"</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Memberi tahu staf front office bahwa ruang praktik sedang terisi.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-emerald-800 text-xs">2. Tindakan Selesai ➔ Status: "Selesai (Completed)"</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Sistem kasir langsung menerima data bahwa pasien siap menyelesaikan pembayaran, dan perolehan poin reward pasien akan segera diproses.</p>
                </div>
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
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 5: Pengelolaan Kredensial Medis & Profil Dokter
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Pembaruan gelar spesialisasi, biografi, alumni universitas, nomor STR & SIP, serta foto profil WebP.
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
                Profil publik dokter ditampilkan pada halaman beranda dan katalog booking website. Melalui menu <strong>Edit Profil Dokter</strong>, Anda dapat:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#5C5042] pl-2">
                <li><strong>Mengunggah Foto Profil HD:</strong> Foto otomatis dikompres ke format WebP jernih dan ringan.</li>
                <li><strong>Nomor STR & SIP Resmi:</strong> Pastikan nomor izin praktik tercantum akurat untuk transparansi medikolegal publik.</li>
                <li><strong>Biografi & Pengalaman Klinis:</strong> Cantumkan keahlian khusus (misal: <em>Spesialis Bedah Mulut, Implan, Aligner Orthodontics</em>) untuk membangun kepercayaan calon pasien.</li>
                <li><strong>Nomor WhatsApp Dokter:</strong> Dilengkapi format standar <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">+62</code> untuk keperluan koordinasi darurat dengan manajemen klinik.</li>
              </ul>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
