import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import {
  Search,
  Book,
  Video,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Droplets,
  Mail,
  Clock,
  Phone,
  Loader2,
  ShieldCheck,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Award,
  BookOpen,
  Printer,
  Sparkles,
} from "lucide-react";
import { fetchPublicFaqs, type FAQItem } from "../services/helpService";
import UserManualModal from "../components/UserManualModal";

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualModalRole, setManualModalRole] = useState<"admin" | "doctor" | "user">("user");
  const [activeGuideTab, setActiveGuideTab] = useState<"user" | "doctor" | "admin">("user");

  useEffect(() => {
    fetchPublicFaqs()
      .then((data) => setFaqs(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const openGuideFor = (role: "admin" | "doctor" | "user") => {
    setManualModalRole(role);
    setIsManualModalOpen(true);
  };

  return (
    <DashboardLayout role="user">
      <div className="w-full px-0 sm:px-2 space-y-8">
        {/* Header Section */}
        <div className="text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#8C6B1C] flex items-center justify-center text-white shadow-lg shadow-[#C9A24A]/25 mx-auto mb-4 border border-[#EADBBD]">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4A3F35] tracking-tight mb-2">
            Pusat Bantuan & Panduan Operasional
          </h1>
          <p className="text-xs sm:text-sm text-[#8A7B6B] max-w-xl mx-auto leading-relaxed">
            Panduan lengkap alur kerja, standar operasional prosedur (SOP), dan jawaban pertanyaan untuk Pasien, Dokter Spesialis, dan Admin Klinik.
          </p>

          <div className="max-w-xl mx-auto mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7B6B] w-4 h-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik bantuan (cth: Cara reservasi, tanda tangan PDF, jadwal dokter)..."
              className="h-12 pl-11 pr-4 rounded-2xl border-[#F0E6D3] shadow-md shadow-[#C9A24A]/5 bg-white text-sm focus:border-[#C9A24A]"
            />
          </div>
        </div>

        {/* 3 Role Guide Quick Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8C6B1C]" />
              <h2 className="text-lg font-bold text-[#4A3F35]">Pilih Buku Panduan Sesuai Peran</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openGuideFor(activeGuideTab)}
              className="h-8 px-3 rounded-xl border-[#F0E6D3] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold"
            >
              <Book className="w-3.5 h-3.5 mr-1" /> Buka Modal Panduan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Panduan Pasien */}
            <div
              onClick={() => {
                setActiveGuideTab("user");
                openGuideFor("user");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                activeGuideTab === "user" ? "border-[#C9A24A] ring-2 ring-[#C9A24A]/20" : "border-[#F0E6D3]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mb-3 border border-[#EADBBD]">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A3F35]">👤 Panduan Pasien / Tamu</h3>
              <p className="text-xs text-[#8A7B6B] mt-1 line-clamp-2">
                Alur reservasi online, pemilihan dokter, tanda tangan informed consent di PDF, dan e-ticket.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C6B1C] mt-3">
                Baca Panduan Pasien <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 2. Panduan Dokter */}
            <div
              onClick={() => {
                setActiveGuideTab("doctor");
                openGuideFor("doctor");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                activeGuideTab === "doctor" ? "border-[#C9A24A] ring-2 ring-[#C9A24A]/20" : "border-[#F0E6D3]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 border border-blue-200">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A3F35]">🩺 Panduan Dokter Spesialis</h3>
              <p className="text-xs text-[#8A7B6B] mt-1 line-clamp-2">
                Pemeriksaan jadwal praktik, daftar antrean pasien, dan verifikasi tanda tangan digital surat persetujuan medis (Informed Consent).
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 mt-3">
                Baca Panduan Dokter <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 3. Panduan Admin */}
            <div
              onClick={() => {
                setActiveGuideTab("admin");
                openGuideFor("admin");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                activeGuideTab === "admin" ? "border-[#C9A24A] ring-2 ring-[#C9A24A]/20" : "border-[#F0E6D3]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A3F35]">👑 Panduan Admin Klinik</h3>
              <p className="text-xs text-[#8A7B6B] mt-1 line-clamp-2">
                Manajemen 200+ layanan tarif, jadwal dokter, validasi WhatsApp Zesta, dan kustomisasi kop surat PDF.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 mt-3">
                Baca Panduan Admin <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Embedded SOP & Interactive Guide Accordion */}
        <div className="bg-white rounded-3xl border border-[#F0E6D3] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F0E6D3]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#4A3F35]">
                Ringkasan Standar Operasional Prosedur (SOP)
              </h2>
              <p className="text-xs text-[#8A7B6B]">
                Langkah cepat pengoperasian fitur klinis sehari-hari.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#F0E6D3]">
              <button
                type="button"
                onClick={() => setActiveGuideTab("user")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === "user" ? "bg-[#C9A24A] text-white shadow-xs" : "text-[#5C5546] hover:bg-white"
                }`}
              >
                Pasien
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("doctor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === "doctor" ? "bg-[#C9A24A] text-white shadow-xs" : "text-[#5C5546] hover:bg-white"
                }`}
              >
                Dokter
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === "admin" ? "bg-[#C9A24A] text-white shadow-xs" : "text-[#5C5546] hover:bg-white"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* User Guide Tab Details */}
          {activeGuideTab === "user" && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Alur Booking Mandiri & Memilih Jadwal Dokter
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Buka website, pilih cabang klinik dan dokter spesialis, tentukan tanggal & jam yang tersedia, lalu isi data pasien dan keluhan gigi.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Persetujuan & Tanda Tangan Digital di Dokumen PDF
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Saat submit booking, lembar <strong>Informed Consent</strong> resmi akan muncul. Centang persetujuan dan goreskan tanda tangan Anda langsung di dalam lembar PDF.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  E-Ticket QR Code & Klaim Poin Reward
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Simpan E-Ticket Anda untuk ditunjukkan saat tiba di klinik. Kumpulkan loyalty points setiap selesai perawatan dan tukarkan dengan diskon perawatan berikutnya.
                </p>
              </div>
            </div>
          )}

          {/* Doctor Guide Tab Details */}
          {activeGuideTab === "doctor" && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Dashboard Jadwal & Antrean Praktik
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Akses menu Dashboard Dokter untuk memantau pasien yang dijadwalkan hadir hari ini sesuai cabang praktik.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Verifikasi Surat Persetujuan Tindakan Medis (Informed Consent)
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Periksa kelengkapan tanda tangan digital dan persetujuan tindakan medis pasien sebelum memulai prosedur.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Pembaruan Status Penanganan Reservasi Pasien
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Perbarui status reservasi pasien di menu Daftar Pasien (Dalam Tindakan atau Selesai) untuk kelancaran antrean klinik.
                </p>
              </div>
            </div>
          )}

          {/* Admin Guide Tab Details */}
          {activeGuideTab === "admin" && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Verifikasi Reservasi & Notifikasi WhatsApp Zesta
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Konfirmasi reservasi pasien masuk, atur jadwal ulang jika dokter berhalangan, dan kirimkan reminder otomatis via WhatsApp.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Katalog Tarif Medis (200+ Layanan) & Kredensial Dokter
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Kelola 200+ jenis perawatan gigi dengan pencarian cepat, ubah harga, serta update nomor STR, SIP, dan jam praktik dokter spesialis.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] space-y-2">
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C9A24A] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Konfigurasi Kop Surat & Template PDF Persetujuan
                </p>
                <p className="text-xs text-[#5C5546] leading-relaxed pl-7">
                  Atur logo resmi, alamat, telepon kop surat, serta sesuaikan pasal-pasal S&K dan Informed Consent di menu Pengaturan Klinik.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#8C6B1C]" />
            </div>
            <h2 className="text-lg font-bold text-[#4A3F35]">Pusat FAQ (Pertanyaan yang Sering Diajukan)</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#C9A24A] animate-spin" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0E6D3] p-8 text-center text-xs text-[#8A7B6B]">
              Tidak ada pertanyaan FAQ yang sesuai dengan pencarian.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <details key={idx} className="group bg-white rounded-2xl border border-[#F0E6D3] shadow-xs overflow-hidden transition-all">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                    <span className="font-bold text-[#4A3F35] text-sm pr-4">{faq.q}</span>
                    <div className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#F0E6D3] flex items-center justify-center transition-transform group-open:rotate-180">
                      <ChevronRight className="w-3.5 h-3.5 text-[#8A7B6B] rotate-90" />
                    </div>
                  </summary>
                  <div className="px-4 pb-4 text-[#5C5546] text-xs leading-relaxed border-t border-[#F0E6D3] pt-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-[#2C2416] to-[#4A3F35] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A24A]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="relative flex flex-col lg:flex-row gap-8 items-center text-center lg:text-left">
            <div className="flex-1">
              <h2 className="text-xl font-bold tracking-tight mb-2">Butuh bantuan operasional lainnya?</h2>
              <p className="text-xs text-[#D9D0BC] mb-6">
                Tim Support Aesthetic Pondok Indah siap membantu Anda setiap hari pukul 09:00 - 20:00 WIB.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
                  <Button className="bg-[#C9A24A] hover:bg-[#B8943F] text-white h-10 px-6 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md">
                    <Droplets className="w-4 h-4" /> WhatsApp Support
                  </Button>
                </a>
                <a href="mailto:aesthetic.pondokindah@gmail.com">
                  <Button variant="outline" className="border-[#F0E6D3]/20 bg-white/10 hover:bg-white/20 text-white h-10 px-6 rounded-xl font-bold text-xs flex items-center gap-2 backdrop-blur-md cursor-pointer">
                    <Mail className="w-4 h-4" /> Email Resmi
                  </Button>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[130px]">
                <Phone className="w-4 h-4 text-[#C9A24A] mb-2 mx-auto lg:mx-0" />
                <p className="text-[9px] text-[#D9D0BC] font-bold uppercase tracking-wider mb-0.5">Telepon</p>
                <p className="font-bold text-xs text-white">021-7695948</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[130px]">
                <Clock className="w-4 h-4 text-[#C9A24A] mb-2 mx-auto lg:mx-0" />
                <p className="text-[9px] text-[#D9D0BC] font-bold uppercase tracking-wider mb-0.5">Jam Praktik</p>
                <p className="font-bold text-xs text-white">09:00 - 20:00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal User Manual */}
        <UserManualModal
          open={isManualModalOpen}
          onOpenChange={setIsManualModalOpen}
          defaultRole={manualModalRole}
        />
      </div>
    </DashboardLayout>
  );
}
