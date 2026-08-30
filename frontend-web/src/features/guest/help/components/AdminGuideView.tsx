import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  ShieldAlert,
  Calendar,
  Clock,
  Settings,
  Users,
  Award,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  Edit3,
  Globe,
  Sliders,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export default function AdminGuideView({ onPrint }: { onPrint?: () => void }) {
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
            <ShieldAlert className="w-3.5 h-3.5 text-[#C9A24A]" />
            Dokumentasi Manajemen Operasional Administrator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D332A] tracking-tight">
            Panduan Administrator & Manajemen Klinik
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed max-w-2xl">
            Panduan lengkap ini disusun dari sudut pandang Anda sebagai <strong>Administrator Klinik (Admin / Developer)</strong>. Meliputi tata kelola operasional reservasi, master 200+ layanan gigi, manajemen dokter, pengaturan kop surat & template PDF resmi, membership loyalty, hingga konten website publik.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/dashboard/clinic">
              <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer">
                Buka Dashboard Admin <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            1
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Reservasi & Notifikasi WA</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Validasi antrean pasien & gateway notifikasi Zesta WhatsApp.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            2
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Master Layanan & Dokter</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Kelola tarif 200+ perawatan, akun dokter, dan jadwal shift.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EADBBD] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center font-bold text-sm mb-2 border border-amber-200/60">
            3
          </div>
          <p className="text-xs font-bold text-[#3D332A]">Template PDF & CMS Publik</p>
          <p className="text-[11px] text-[#7A6E60] mt-0.5">Kustomisasi kop surat, klausul S&K, blog, promo, dan FAQ.</p>
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
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 1: Manajemen Reservasi Pasien & Integrasi WhatsApp Gateway (Zesta)
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Memantau reservasi masuk (Guest & Member), konfirmasi jadwal, dan pengiriman notifikasi instan.
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
                Melalui menu <strong>Manajemen Reservasi</strong>, admin dapat mengontrol alur penerimaan janji temu:
              </p>
              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A]">1. Memvalidasi Reservasi Baru</p>
                  <p className="text-xs text-[#6B5E4F] mt-1">
                    Setiap reservasi yang masuk (baik dari tamu maupun member) akan berstatus <em>Pending</em>. Admin dapat memeriksa ketersediaan ruang dental chair dan mengklik <strong>"Konfirmasi Jadwal"</strong>.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A]">2. Otomatisasi Notifikasi WhatsApp (Zesta Gateway)</p>
                  <p className="text-xs text-[#6B5E4F] mt-1">
                    Saat status diubah menjadi <em>Confirmed</em>, gateway otomatis mengirimkan pesan konfirmasi resmi ke nomor WhatsApp pasien berawalan <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">+62</code> yang memuat tautan E-Ticket dan reminder jadwal.
                  </p>
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
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 2: Manajemen Katalog 200+ Layanan Gigi & Tarif Medis
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Menambah tindakan baru, memperbarui harga resmi, estimasi durasi, dan toggle aktif/nonaktif.
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
                Pada menu <strong>Katalog Layanan</strong>, sistem terhubung dengan database 181+ data perawatan gigi:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#5C5042]">
                <li><strong>Kustomisasi Tarif:</strong> Admin dapat mengubah nominal harga satuan atau tarif paket promo.</li>
                <li><strong>Durasi Waktu Tindakan:</strong> Mengatur estimasi menit di dental chair (cth: <em>30 Menit, 60 Menit</em>) agar sistem reservasi dapat membatasi kuota slot jam kedatangan.</li>
                <li><strong>Visibilitas Publik:</strong> Matikan toggle status layanan jika stok material medis tertentu sedang kosong sementara.</li>
              </ul>
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
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 3: Manajemen Dokter Spesialis & Pengaturan Jadwal Shift Cabang
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Pendaftaran akun dokter baru, verifikasi kredensial STR/SIP, dan jadwal praktik per klinik.
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
                Pada menu <strong>Manajemen Dokter</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-2 text-[#5C5042]">
                <li><strong>Tambah Dokter Baru:</strong> Masukkan Nama & Gelar, Spesialisasi Kedokteran Gigi, Nomor STR, Nomor SIP, Cabang Penugasan, dan Nomor WhatsApp aktif (format <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">+62</code>).</li>
                <li><strong>Kelola Jadwal Praktik:</strong> Atur ketersediaan hari praktik dokter pada tab jadwal untuk sinkronisasi otomatis dengan pilihan booking pasien.</li>
              </ol>
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
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 4: Konfigurasi Kop Surat & Template PDF Resmi (S&K & Informed Consent)
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Mengatur kop surat klinik, logo vertikal, pasal-pasal S&K, dan klausul persetujuan medis.
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
                Buka menu <strong>Pengaturan Klinik ➔ Tab Pengaturan PDF & Kop Surat</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-[#5C5042]">
                <li><strong>Kop Surat Resmi:</strong> Atur nama resmi instansi, logo klinik vertikal, alamat cabang, nomor telepon resmi, dan email kontak.</li>
                <li><strong>Pasal Syarat & Ketentuan (S&K):</strong> Kustomisasi poin-poin klausul hak & kewajiban pasien yang tampil pada PDF 1.</li>
                <li><strong>Klausul Informed Consent:</strong> Kustomisasi pernyataan persetujuan tindakan medis dan risiko kedokteran pada PDF 2.</li>
                <li><strong>Live Preview & Print Test:</strong> Gunakan fitur pratinjau langsung untuk memastikan tata letak dokumen 100% rapi dan simetris dengan dokumen yang dilihat oleh pasien.</li>
              </ul>
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
                  Bab 5: Tata Kelola Program Membership Loyalty & Voucher Promo
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Mengatur persentase diskon tier, validasi pembayaran membership manual, dan katalog reward.
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
                Pada menu <strong>Membership Admin</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#5C5042]">
                <li><strong>Verifikasi Upgrade Manual:</strong> Konfirmasi mutasi pembayaran jika pasien melakukan upgrade membership via transfer bank / WhatsApp.</li>
                <li><strong>Katalog Reward:</strong> Tambah dan kelola voucher potongan harga yang dapat ditukarkan pasien menggunakan loyalty points mereka.</li>
                <li><strong>Pencatatan Klaim Promo di Kasir:</strong> Gunakan fitur *Promo Claim* untuk memvalidasi voucher diskon pasien sebelum mencetak struk invoice.</li>
              </ul>
            </CardContent>
          )}
        </Card>

        {/* BAB 6 */}
        <Card className="rounded-2xl border-[#EADBBD] bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection("bab-6")}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0E6D3]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] font-extrabold text-sm shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#3D332A]">
                  Bab 6: Manajemen Konten Publik (CMS) Website
                </h2>
                <p className="text-xs text-[#7A6E60] mt-0.5">
                  Publikasi artikel blog edukasi, testimoni pasien, promo bulanan, pop-up pengumuman, dan FAQ.
                </p>
              </div>
            </div>
            {openSection === "bab-6" ? (
              <ChevronUp className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8C6B1C] shrink-0" />
            )}
          </div>

          {openSection === "bab-6" && (
            <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-[#4A3F35] leading-relaxed bg-[#FAFBF9]/40">
              <p>
                Admin dapat memperbarui seluruh informasi di website publik tanpa menyentuh kode program:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A] text-xs">📝 Artikel Blog Edukasi</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Tulis artikel tips kesehatan gigi lengkap dengan cover gambar WebP.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A] text-xs">⭐ Moderasi Testimoni</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Kelola ulasan pasien dan rating bintang yang ditampilkan di beranda.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A] text-xs">🎉 Banner Promo Bulanan</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Aktifkan poster promo diskon perawatan dengan target tier membership.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBBD]">
                  <p className="font-bold text-[#3D332A] text-xs">📢 Pop-up & FAQ Interaktif</p>
                  <p className="text-[11px] text-[#6B5E4F] mt-0.5">Buat pengumuman penting saat hari libur dan perbarui daftar tanya-jawab.</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
