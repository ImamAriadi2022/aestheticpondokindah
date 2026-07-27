import { Link, Navigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import DashboardLayout from "@/react-app/components/dashboard/DashboardLayout";
import DashboardStats from "@/react-app/components/dashboard/DashboardStats";
import MobileUserHome from "@/react-app/components/dashboard/MobileUserHome";
import DesktopUserHome from "@/react-app/components/dashboard/DesktopUserHome";
import MobileDoctorBooking from "@/react-app/components/dashboard/MobileDoctorBooking";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/react-app/components/ui/table";
import { getSession } from "@/react-app/lib/demoAuth";
import { getMyConsultations, createConsultation } from "@/react-app/lib/consultationApi";
import { uploadFile } from "@/react-app/lib/uploadApi";
import { getPublicDoctorSchedules, type PublicDoctorScheduleItem } from "@/react-app/lib/publicDoctorScheduleApi";
import { submitPublicReservation } from "@/react-app/lib/reservationApi";
import { 
  getMyComplaints, 
  createComplaint, 
  ComplaintItem, 
  ComplaintCategory as ApiComplaintCategory 
} from "@/react-app/lib/complaintApi";
import { toast } from "@/react-app/components/ui/toast";
import { logger } from "@/react-app/lib/logger";
import { Calendar, Clock, FileText, MessageSquare, User, ChevronRight, ChevronDown, PlayCircle, Plus, ArrowLeft, AlertCircle, Send, Eye, Check, Stethoscope, Bell, Lightbulb, Lock, Camera, Wifi } from "lucide-react";

export default function UserDashboardPage() {
  // Ambil session dari demo atau backend asli
  let session = getSession();
  if (!session) {
    const storedUser = localStorage.getItem("apident:user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Map role backend ke role yang diharapkan frontend
        const role = user.role === "patient" ? "user" : user.role;
        session = { ...user, role };
      } catch (e) {
        logger.error("Gagal parse user session", e);
      }
    }
  }

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const viewParam = searchParams.get("view");

  const [consultations, setConsultations] = useState<any[]>([]);
  const [consultLoading, setConsultLoading] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const selectedConsultation = consultations.find((c) => c.id === selectedConsultationId) || null;
  const [consultView, setConsultView] = useState<"home" | "quick" | "schedule" | "scheduleConfirm">("home");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [publicSchedules, setPublicSchedules] = useState<PublicDoctorScheduleItem[]>([]);
  const [publicScheduleLoading, setPublicScheduleLoading] = useState(false);
  const selectedSchedule = publicSchedules.find((s) => s.id === selectedScheduleId) || null;

  useEffect(() => {
    if (activeTab === "konsultasi" || activeTab === "dashboard" || activeTab === "riwayat") {
      setConsultLoading(true);
      getMyConsultations()
        .then((data) => setConsultations(data))
        .catch((err) => {
          logger.error("Gagal memuat konsultasi", err);
          toast({ title: "Gagal memuat", message: "Tidak bisa memuat riwayat konsultasi." });
        })
        .finally(() => setConsultLoading(false));
    }

    if (activeTab === "pengaduan" || activeTab === "dashboard") {
      setComplaintLoading(true);
      getMyComplaints()
        .then((data) => setComplaints(data))
        .catch((err) => {
          logger.error("Gagal memuat pengaduan", err);
          toast({ title: "Gagal memuat", message: "Tidak bisa memuat riwayat pengaduan." });
        })
        .finally(() => setComplaintLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (consultView !== "schedule") return;
    setPublicScheduleLoading(true);
    getPublicDoctorSchedules()
      .then((items) => setPublicSchedules(items))
      .catch(() => {
        toast({ title: "Gagal", message: "Tidak bisa memuat jadwal dokter.", variant: "error" });
      })
      .finally(() => setPublicScheduleLoading(false));
  }, [consultView]);

  useEffect(() => {
    if (activeTab === "konsultasi" && viewParam) {
      if (viewParam === "quick") setConsultView("quick");
      else if (viewParam === "schedule") setConsultView("schedule");
    }
  }, [activeTab, viewParam]);

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    address: session?.address || "",
    city: session?.city || "",
    postalCode: session?.postalCode || "",
  });

  // Helper: calculate progress (same logic as MembershipPage)
  const calculateProgress = () => {
    if (!session) return 0;
    const fields = [
      "name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo",
    ];
    const filledFields = fields.filter((field) => {
      const value = (session as any)[field] || (session as any)[field.replace(/([A-Z])/g, "_$1").toLowerCase()] ||
                    (session as any)[field === 'phone' ? 'whatsapp' : field] ||
                    (session as any)[field === 'bloodType' ? 'blood_type' : field] ||
                    (session as any)[field === 'address' ? 'address_line' : field];
      return !!value;
    });
    const interests = (session as any).interests || [];
    const interestScore = interests.length > 0 ? 1 : 0;
    return Math.round(((filledFields.length + interestScore) / (fields.length + 1)) * 100);
  };
  const progress = calculateProgress();

  const isProfileComplete = progress >= 100;
  const hasDentalSegmentation =
    Array.isArray((session as any)?.dentalComplaints) && (session as any)?.dentalComplaints?.length > 0 &&
    Array.isArray((session as any)?.desiredServices) && (session as any)?.desiredServices?.length > 0;
  const isMembership =
    (session as any)?.membershipStatus === "active" ||
    (session as any)?.membership_status === "active" ||
    (isProfileComplete && hasDentalSegmentation);

  const [quickForm, setQuickForm] = useState({
    topic: "",
    category: "Konsultasi Umum",
    chiefComplaint: "",
    duration: "",
    painScale: 0,
    allergies: "",
    medications: "",
    priorTreatment: "",
    preferredContact: "WhatsApp",
    contactNumber: "",
    expectations: "",
  });

  const [quickAttachments, setQuickAttachments] = useState<File[]>([]);
  const [quickAttachmentError, setQuickAttachmentError] = useState<string | null>(null);

  const [scheduleAttachments, setScheduleAttachments] = useState<File[]>([]);
  const [scheduleAttachmentError, setScheduleAttachmentError] = useState<string | null>(null);

  const [scheduleForm, setScheduleForm] = useState({
    topic: "",
    category: "Konsultasi Umum",
    chiefComplaint: "",
    duration: "",
    painScale: 0,
    allergies: "",
    medications: "",
    priorTreatment: "",
    preferredContact: "WhatsApp",
    contactNumber: "",
    expectations: "",
    notes: "",
  });

  const ADMIN_WA = "+6281990114949";

  const myConsultations = consultations;
  const totalMyConsultations = myConsultations.length;

  const toWaDigits = (wa: string) => wa.replace(/\D/g, "");

  const openAdminWa = (message: string) => {
    const waDigits = toWaDigits(ADMIN_WA);
    const url = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatQuickConsultationMessage = () => {
    const attachmentLine = quickAttachments.length
      ? `Lampiran foto: ${quickAttachments.length} file (akan saya kirim setelah chat terbuka)`
      : "Lampiran foto: -";

    return (
      `Halo Admin Aesthetic Pondok Indah Dental, saya ingin *Konsultasi Cepat*.` +
      `\n\nNama: ${session?.name ?? "-"}` +
      `\nUser ID: ${session?.id ?? "-"}` +
      `\nKontak (${quickForm.preferredContact}): ${quickForm.contactNumber}` +
      `\n\nTopik: ${quickForm.topic || quickForm.category}` +
      `\nKategori: ${quickForm.category}` +
      `\nKeluhan utama: ${quickForm.chiefComplaint}` +
      `\nDurasi: ${quickForm.duration || "-"}` +
      `\nSkala nyeri: ${quickForm.painScale}/10` +
      `\nAlergi: ${quickForm.allergies || "-"}` +
      `\nObat yang dikonsumsi: ${quickForm.medications || "-"}` +
      `\nPerawatan sebelumnya: ${quickForm.priorTreatment || "-"}` +
      `\nHarapan: ${quickForm.expectations || "-"}` +
      `\n${attachmentLine}` +
      `\n\nMohon arahan langkah selanjutnya ya. Terima kasih.`
    );
  };

  const formatScheduledConsultationMessage = (input: { doctorName: string; dateTime: string; location?: string }) => {
    const attachmentLine = scheduleAttachments.length
      ? `Lampiran foto: ${scheduleAttachments.length} file (akan saya kirim setelah chat terbuka)`
      : "Lampiran foto: -";

    return (
      `Halo Admin Aesthetic Pondok Indah Dental, saya ingin *Konsultasi Terjadwal*.` +
      `\n\nNama: ${session?.name ?? "-"}` +
      `\nUser ID: ${session?.id ?? "-"}` +
      `\nKontak (WhatsApp/Telepon): ${scheduleForm.contactNumber}` +
      `\n\nJadwal dipilih:` +
      `\n- Dokter: ${input.doctorName}` +
      `\n- Waktu: ${input.dateTime}` +
      (input.location ? `\n- Lokasi: ${input.location}` : "") +
      `\n\nTopik: ${scheduleForm.topic || scheduleForm.category || "Konsultasi Terjadwal"}` +
      `\nKategori: ${scheduleForm.category}` +
      `\nKeluhan utama: ${scheduleForm.chiefComplaint}` +
      `\nDurasi: ${scheduleForm.duration || "-"}` +
      `\nSkala nyeri: ${scheduleForm.painScale}/10` +
      `\nAlergi: ${scheduleForm.allergies || "-"}` +
      `\nObat yang dikonsumsi: ${scheduleForm.medications || "-"}` +
      `\nPerawatan sebelumnya: ${scheduleForm.priorTreatment || "-"}` +
      `\nHarapan: ${scheduleForm.expectations || "-"}` +
      `\n${attachmentLine}` +
      `\nCatatan: ${scheduleForm.notes || "-"}` +
      `\n\nMohon konfirmasi ya. Terima kasih.`
    );
  };
  
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "Pelayanan" as ApiComplaintCategory,
  });

  const stats = [
    {
      title: "Total Konsultasi",
      value: totalMyConsultations,
      subtitle: "Semua riwayat konsultasi",
      trend: "up" as const,
      trendValue: "Bulan ini",
      icon: FileText,
      variant: "green" as const,
    },
    {
      title: "Konsultasi Aktif",
      value: myConsultations.filter((c) => c.status !== "Selesai").length,
      subtitle: "Sedang berlangsung",
      trend: "neutral" as const,
      trendValue: "Aktif",
      icon: MessageSquare,
    },
    {
      title: "Jadwal Tersedia",
      value: publicSchedules.length,
      subtitle: "Dokter tersedia",
      trend: "up" as const,
      trendValue: "Update harian",
      icon: Calendar,
    },
    {
      title: "Pengaduan",
      value: complaints.length,
      subtitle: "Status pengaduan",
      trend: "neutral" as const,
      trendValue: "Terkirim",
      icon: MessageSquare,
    },
  ];

  // Helper functions for complaint category/status styling
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Pelayanan": return "bg-[#C9A24A]/20 text-[#C9A24A]";
      case "Fasilitas": return "bg-[#E8C547]/20 text-[#B8943F]";
      case "Dokter": return "bg-purple-100 text-purple-700";
      case "Jadwal": return "bg-orange-100 text-orange-700";
      case "Pembayaran": return "bg-red-100 text-red-700";
      case "Lainnya": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-[#E8C547]/20 text-[#B8943F]";
      case "resolved": return "bg-[#E8C547]/20 text-[#B8943F]";
      case "rejected": return "bg-red-100 text-red-700";
      case "pending": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "processing": return "Diproses";
      case "resolved": return "Selesai";
      case "rejected": return "Ditolak";
      case "pending": return "Menunggu";
      default: return status;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="lg:hidden">
              <MobileUserHome
                session={session}
                consultations={consultations}
                complaints={complaints}
                isMembership={isMembership}
                progress={progress}
              />
            </div>
            <div className="hidden lg:block">
              <DesktopUserHome
                session={session}
                consultations={consultations}
                complaints={complaints}
                publicSchedules={publicSchedules}
                isMembership={isMembership}
                progress={progress}
              />
            </div>

            <div className="space-y-6 sm:space-y-8 hidden">
              {/* Membership & Profile Status Card */}
            <Card className={`overflow-hidden border-0 shadow-sm ${isMembership ? 'bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 ${isMembership ? 'bg-white/20' : 'bg-[#c9a24a]/10'}`}>
                      <User className={`w-6 h-6 sm:w-8 sm:h-8 ${isMembership ? 'text-white' : 'text-[#a8843a]'}`} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">{isMembership ? 'Member Eksklusif' : 'Client Klinik'}</h2>
                      <p className={`text-xs sm:text-sm ${isMembership ? 'text-white/80' : 'text-gray-500'}`}>
                        {isMembership 
                          ? 'Gunakan kartu membership digital Anda untuk mendapatkan promo dan keuntungan eksklusif di klinik.' 
                          : 'Lengkapi profil Anda untuk mengaktifkan status membership & promo.'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    {isMembership ? (
                      <Link to="/membership" className="w-full md:w-auto">
                        <Button
                          className="w-full md:w-auto rounded-xl font-semibold shadow-lg bg-white text-[#a8843a] hover:bg-gray-100"
                        >
                          Lihat Membership
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/settings?tab=profile" className="w-full md:w-auto">
                        <Button
                          className="w-full md:w-auto rounded-xl font-semibold shadow-lg bg-[#a8843a] text-white hover:bg-[#8a6b2b]"
                        >
                          Lengkapi Profil Sekarang
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Profile Form (Inline) */}
                {showProfileForm && (
                  <div className={`mt-6 pt-6 border-t ${isMembership ? 'border-white/20' : 'border-gray-100'} space-y-4 animate-in fade-in slide-in-from-top-2`}>
                    <h3 className="text-sm font-bold">Data Alamat & Pengiriman</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium opacity-80">Alamat Lengkap</label>
                        <input
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          className={`w-full rounded-xl border p-3 text-sm outline-none focus:ring-1 ${isMembership ? 'bg-white/10 border-white/20 focus:border-white focus:ring-white' : 'bg-gray-50 border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]'}`}
                          placeholder="Jl. Nama Jalan No. XX"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium opacity-80">Kota</label>
                          <input
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            className={`w-full rounded-xl border p-3 text-sm outline-none focus:ring-1 ${isMembership ? 'bg-white/10 border-white/20 focus:border-white focus:ring-white' : 'bg-gray-50 border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]'}`}
                            placeholder="Jakarta Selatan"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium opacity-80">Kode Pos</label>
                          <input
                            value={profileForm.postalCode}
                            onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                            className={`w-full rounded-xl border p-3 text-sm outline-none focus:ring-1 ${isMembership ? 'bg-white/10 border-white/20 focus:border-white focus:ring-white' : 'bg-gray-50 border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]'}`}
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowProfileForm(false)}
                        className={`text-xs ${isMembership ? 'hover:bg-white/10 text-white' : ''}`}
                      >
                        Batal
                      </Button>
                      <Button 
                        onClick={() => {
                          // Simpan simulasi ke localStorage/session demo via helper
                          const { updateSessionProfile } = require("@/react-app/lib/demoAuth");
                          updateSessionProfile(profileForm);
                          setShowProfileForm(false);
                          window.location.reload(); 
                        }}
                        className={`px-6 rounded-xl font-bold shadow-md ${isMembership ? 'bg-white text-[#a8843a] hover:bg-gray-100' : 'bg-[#a8843a] text-white'}`}
                      >
                        Simpan Data
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/dashboard/user?tab=konsultasi" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-xl border-gray-200 hover:bg-[#c9a24a]/5 hover:border-[#c9a24a]/30 hover:text-[#a8843a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center group-hover:bg-[#c9a24a]/20 transition-colors">
                      <MessageSquare className="w-5 h-5 text-[#a8843a]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#a8843a]">Konsultasi</p>
                      <p className="text-[10px] text-gray-500">Chat langsung dengan dokter</p>
                    </div>
                  </div>
                </Button>
              </Link>
              <Link to="/dashboard/user?tab=pengaduan" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-xl border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-red-700">Pengaduan</p>
                      <p className="text-[10px] text-gray-500">Sampaikan masukan atau keluhan</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>

            <DashboardStats stats={stats} />
          </div>
          </>
        );

      case "riwayat":
        return (
          <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Riwayat Konsultasi Anda</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Lihat semua konsultasi yang pernah Anda lakukan</p>
              </div>
              <div className="relative">
                <select className="appearance-none rounded-xl border border-[#E8D4A2]/40 bg-[#FDF8F0] px-4 py-2.5 pr-10 text-sm text-[#4A3F35] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 outline-none cursor-pointer">
                  <option>Semua Status</option>
                  <option>Menunggu</option>
                  <option>Dijadwalkan</option>
                  <option>Selesai</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A] pointer-events-none" />
              </div>
            </div>

            {/* Modern Table */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {consultLoading ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Memuat riwayat...</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Mohon tunggu sebentar</p>
                  </div>
                ) : myConsultations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-7 h-7 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Belum ada konsultasi</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Riwayat konsultasi Anda akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3]">
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Konsultasi</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Tanggal</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Topik</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Dokter</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                        <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myConsultations.map((c) => (
                        <tr key={c.id} className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F5E6C8] flex items-center justify-center shrink-0">
                                <MessageSquare className="w-4 h-4 text-[#B8943F]" />
                              </div>
                              <span className="text-sm font-semibold text-[#4A3F35]">Konsultasi #{c.id?.slice(-6) || c.id}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#B8A99A]" />
                              <span className="text-sm text-[#4A3F35]">{c.date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 hidden sm:table-cell">
                            <span className="text-sm text-[#4A3F35]">{c.topic || "-"}</span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#F5E6C8] flex items-center justify-center">
                                <Stethoscope className="w-3 h-3 text-[#B8943F]" />
                              </div>
                              <span className="text-sm text-[#4A3F35]">{c.doctorName || "-"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              c.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : c.status === "Dijadwalkan" || c.status === "Terjadwal"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedConsultationId(c.id)}
                              className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:text-[#8A6B2B] hover:bg-[#F5E6C8] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {myConsultations.length > 0 && (
                <div className="px-5 py-3 border-t border-[#F0E6D3]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#8A7B6B] hover:text-[#4A3F35]"
                  >
                    Lihat Semua Riwayat
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case "jadwal":
        return (
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Jadwal Dokter Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicScheduleLoading ? (
                  <div className="col-span-full text-center py-6 text-gray-400">Memuat jadwal...</div>
                ) : publicSchedules.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-400">Belum ada jadwal tersedia.</div>
                ) : (
                  publicSchedules.map((s) => (
                    <div key={s.id} className="bg-gray-50 rounded-sm p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#c9a24a]/15 rounded-sm flex items-center justify-center">
                          <User className="w-5 h-5 text-[#a8843a]" />
                        </div>
                        <div>
                          <p className="font-medium text-base text-gray-900">{s.doctorName ?? "Dokter"}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{s.date} • {s.timeRange}</p>
                          <p className="text-xs sm:text-sm text-gray-400">{s.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 bg-[#c9a24a]/15 text-[#8a6b2b] rounded-sm text-xs sm:text-sm font-medium">
                          {s.slotsLeft} slot
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "konsultasi": {
        if (consultView === "home" && selectedConsultation) {
          const c: any = selectedConsultation;
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedConsultationId(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Detail Konsultasi</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">ID: {c.id}</p>
                    </div>
                    {c.status === "Menunggu" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (c.type === "quick") {
                            setQuickForm({
                              topic: c.topic || "",
                              category: (c as any).category || "Konsultasi Umum",
                              chiefComplaint: (c as any).chiefComplaint || "",
                              duration: (c as any).duration || "",
                              painScale: (c as any).painScale || 0,
                              allergies: (c as any).allergies || "",
                              medications: (c as any).medications || "",
                              priorTreatment: (c as any).priorTreatment || "",
                              preferredContact: (c as any).preferredContact || "WhatsApp",
                              contactNumber: (c as any).contactNumber || "",
                              expectations: (c as any).expectations || "",
                            });
                            setConsultView("quick");
                          } else {
                            setScheduleForm({
                              topic: c.topic || "",
                              category: (c as any).category || "Konsultasi Umum",
                              chiefComplaint: (c as any).chiefComplaint || "",
                              duration: (c as any).duration || "",
                              painScale: (c as any).painScale || 0,
                              allergies: (c as any).allergies || "",
                              medications: (c as any).medications || "",
                              priorTreatment: (c as any).priorTreatment || "",
                              expectations: (c as any).expectations || "",
                              preferredContact: (c as any).preferredContact || "WhatsApp",
                              contactNumber: (c as any).contactNumber || "",
                              notes: (c as any).notes || "",
                            });
                            setScheduleAttachments([]);
                            setScheduleAttachmentError(null);
                            setConsultView("schedule");
                          }
                          setSelectedConsultationId(null);
                        }}
                        className="rounded-sm border-gray-200 text-[#a8843a] hover:bg-[#c9a24a]/10"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Edit Konsultasi
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Tipe</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.type === "scheduled" ? "Konsultasi Terjadwal" : "Konsultasi Cepat"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.status}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Tanggal Dibuat</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</p>
                    </div>
                    {c.type === "scheduled" && (
                      <div className="bg-gray-50 rounded-sm p-4">
                        <p className="text-xs text-gray-500">Dokter</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{c.doctorName || "-"}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Pasien</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.user?.name ?? "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Kontak</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.preferredContact || "WhatsApp/Telepon"}</p>
                      <p className="text-xs text-gray-600 mt-1">{c.contactNumber || "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Topik</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.topic || "-"}</p>
                      {c.category ? <p className="text-xs text-gray-500 mt-1">Kategori: {c.category}</p> : null}
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Tanggal Konsultasi</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.date || "-"}</p>
                    </div>
                  </div>

                  {c.type === "scheduled" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-sm p-4">
                        <p className="text-xs text-gray-500">Tanggal Jadwal</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{c.scheduleDate || "-"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-sm p-4">
                        <p className="text-xs text-gray-500">Waktu</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{c.scheduleTime || "-"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-sm p-4">
                        <p className="text-xs text-gray-500">Lokasi</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{c.location || "-"}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-gray-50 rounded-sm p-4">
                    <p className="text-xs text-gray-500">Keluhan Utama</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.chiefComplaint || "-"}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Durasi Keluhan</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.duration || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Skala Nyeri</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{c.painScale != null ? `${c.painScale} / 10` : "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Catatan Tambahan</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.notes || "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Alergi</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.allergies || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Obat yang Dikonsumsi</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.medications || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Perawatan Sebelumnya</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.priorTreatment || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Harapan</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.expectations || "-"}</p>
                    </div>
                  </div>

                  <div className="bg-[#c9a24a]/5 border border-[#c9a24a]/15 rounded-sm p-4">
                    <p className="text-xs text-gray-500 mb-2">Lampiran</p>
                    {!c.attachments || c.attachments.length === 0 ? (
                      <p className="text-sm text-gray-700">-</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {c.attachments.map((a: any, idx: number) => {
                          const url = typeof a === "string" ? a : a?.url || a?.path || "";
                          const name = typeof a === "string" ? `Lampiran ${idx + 1}` : a?.name || `Lampiran ${idx + 1}`;
                          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|heic|heif)$/i.test(url);
                          return (
                            <div key={`${name}_${idx}`} className="rounded-sm border border-gray-200 bg-white p-2">
                              {isImage ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" download>
                                  <img
                                    src={url}
                                    alt={name}
                                    className="w-full h-24 object-cover rounded-sm"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                </a>
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-sm text-xs text-gray-500">
                                  File
                                </div>
                              )}
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="block mt-2 text-xs text-[#a8843a] hover:underline truncate"
                                title={name}
                              >
                                {name}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        if (consultView === "quick") {
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setConsultView("home")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Konsultasi Cepat</CardTitle>
                  <p className="text-sm text-gray-500">
                    Isi detail keluhan Anda agar dokter bisa memberi saran awal yang lebih akurat.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Topik</label>
                      <input
                        value={quickForm.topic}
                        onChange={(e) => setQuickForm({ ...quickForm, topic: e.target.value })}
                        placeholder="Contoh: Gigi berlubang / Invisalign / Scaling"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Kategori</label>
                      <select
                        value={quickForm.category}
                        onChange={(e) => setQuickForm({ ...quickForm, category: e.target.value })}
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      >
                        <option value="Konsultasi Umum">Konsultasi Umum</option>
                        <option value="Gigi Berlubang">Gigi Berlubang</option>
                        <option value="Gusi & Karang Gigi">Gusi & Karang Gigi</option>
                        <option value="Kawat/Aligner">Kawat/Aligner</option>
                        <option value="Estetik (Veneer/Bleaching)">Estetik (Veneer/Bleaching)</option>
                        <option value="Implan">Implan</option>
                        <option value="Anak">Anak</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Keluhan Utama</label>
                    <textarea
                      value={quickForm.chiefComplaint}
                      onChange={(e) => setQuickForm({ ...quickForm, chiefComplaint: e.target.value })}
                      rows={4}
                      placeholder="Ceritakan keluhan: lokasi gigi, kapan mulai, apa yang memperparah/mengurangi..."
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Durasi Keluhan</label>
                      <input
                        value={quickForm.duration}
                        onChange={(e) => setQuickForm({ ...quickForm, duration: e.target.value })}
                        placeholder="Contoh: 3 hari / 2 minggu"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Skala Nyeri</label>
                      <select
                        value={quickForm.painScale}
                        onChange={(e) => setQuickForm({ ...quickForm, painScale: Number(e.target.value) })}
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      >
                        {Array.from({ length: 11 }).map((_, i) => (
                          <option key={i} value={i}>
                            {i} / 10
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Kontak</label>
                      <select
                        value={quickForm.preferredContact}
                        onChange={(e) => setQuickForm({ ...quickForm, preferredContact: e.target.value })}
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Telepon">Telepon</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nomor WhatsApp/Telepon</label>
                      <input
                        value={quickForm.contactNumber}
                        onChange={(e) => setQuickForm({ ...quickForm, contactNumber: e.target.value })}
                        placeholder="Contoh: 0812xxxxxxx"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      />
                      <p className="text-xs text-gray-400">Pastikan nomor aktif untuk konfirmasi dari admin/dokter.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Alergi (opsional)</label>
                      <input
                        value={quickForm.allergies}
                        onChange={(e) => setQuickForm({ ...quickForm, allergies: e.target.value })}
                        placeholder="Contoh: alergi penicillin"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Obat yang sedang dikonsumsi (opsional)</label>
                      <input
                        value={quickForm.medications}
                        onChange={(e) => setQuickForm({ ...quickForm, medications: e.target.value })}
                        placeholder="Contoh: obat darah tinggi"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Perawatan sebelumnya (opsional)</label>
                      <input
                        value={quickForm.priorTreatment}
                        onChange={(e) => setQuickForm({ ...quickForm, priorTreatment: e.target.value })}
                        placeholder="Contoh: tambal gigi 2024"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Lampiran Foto (opsional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const maxFiles = 4;
                        const next = files.slice(0, maxFiles);
                        const tooMany = files.length > maxFiles;

                        const maxSizeBytes = 5 * 1024 * 1024;
                        const oversized = next.find((f) => f.size > maxSizeBytes);

                        if (oversized) {
                          setQuickAttachmentError("Ukuran file terlalu besar. Maksimal 5MB per foto.");
                          setQuickAttachments([]);
                          e.target.value = "";
                          return;
                        }

                        if (tooMany) {
                          setQuickAttachmentError("Maksimal 4 foto. Silakan pilih ulang.");
                        } else {
                          setQuickAttachmentError(null);
                        }

                        setQuickAttachments(next);
                      }}
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-[#c9a24a]/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#8a6b2b] hover:file:bg-[#c9a24a]/15 focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                    />
                    {quickAttachmentError && (
                      <p className="text-xs text-red-600">{quickAttachmentError}</p>
                    )}
                    {quickAttachments.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickAttachments.map((file, idx) => (
                          <div key={`${file.name}_${idx}`} className="relative rounded-sm border border-gray-200 overflow-hidden bg-white">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setQuickAttachments(quickAttachments.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1 right-1 bg-white/90 border border-gray-200 rounded-sm text-xs px-2 py-1 hover:bg-white"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Setelah chat WhatsApp terbuka, Anda bisa mengirim foto yang dipilih melalui WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Harapan Anda (opsional)</label>
                    <textarea
                      value={quickForm.expectations}
                      onChange={(e) => setQuickForm({ ...quickForm, expectations: e.target.value })}
                      rows={3}
                      placeholder="Contoh: ingin tahu apakah perlu ditambal/dirawat saluran akar..."
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuickForm({
                          topic: "",
                          category: "Konsultasi Umum",
                          chiefComplaint: "",
                          duration: "",
                          painScale: 0,
                          allergies: "",
                          medications: "",
                          priorTreatment: "",
                          preferredContact: "WhatsApp",
                          contactNumber: "",
                          expectations: "",
                        });
                      }}
                      className="rounded-sm border-gray-200"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          setQuickAttachmentError(null);
                          let uploadedAttachments: { url: string; name: string; size: number }[] = [];
                          if (quickAttachments.length > 0) {
                            uploadedAttachments = await Promise.all(
                              quickAttachments.map((f) => uploadFile(f))
                            );
                          }
                          const payload = {
                            type: "quick" as const,
                            topic: quickForm.topic,
                            category: quickForm.category,
                            chiefComplaint: quickForm.chiefComplaint,
                            duration: quickForm.duration,
                            painScale: quickForm.painScale,
                            allergies: quickForm.allergies,
                            medications: quickForm.medications,
                            priorTreatment: quickForm.priorTreatment,
                            preferredContact: quickForm.preferredContact,
                            contactNumber: quickForm.contactNumber,
                            expectations: quickForm.expectations,
                            attachments: uploadedAttachments.map((a) => ({ url: a.url, name: a.name, size: a.size })),
                          };
                          const created = await createConsultation(payload);
                          setConsultations([created, ...consultations]);
                          setQuickAttachments([]);
                          openAdminWa(formatQuickConsultationMessage());
                          setConsultView("home");
                          toast({ title: "Terkirim", message: "Konsultasi cepat berhasil dibuat.", variant: "success" });
                        } catch (err: any) {
                          toast({ title: "Gagal", message: err.message || "Tidak bisa membuat konsultasi." });
                        }
                      }}
                      disabled={!quickForm.chiefComplaint || !quickForm.contactNumber || !!quickAttachmentError}
                      className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Chat Admin (WhatsApp)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        if (consultView === "schedule") {
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setConsultView("home");
                  setSelectedScheduleId(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Pilih Jadwal Dokter</CardTitle>
                  <p className="text-sm text-gray-500">Pilih slot yang tersedia, lalu lanjutkan untuk mengisi detail konsultasi.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {publicScheduleLoading ? (
                      <div className="col-span-full text-center py-6 text-gray-400">Memuat jadwal...</div>
                    ) : publicSchedules.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-gray-400">Belum ada jadwal tersedia.</div>
                    ) : (
                      publicSchedules.map((s) => {
                      const selected = selectedScheduleId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedScheduleId(s.id)}
                          className={`text-left rounded-sm border p-4 transition-all ${
                            selected ? "border-[#c9a24a] bg-[#c9a24a]/5" : "border-gray-200 hover:border-[#c9a24a]/60 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${selected ? "bg-[#c9a24a]/15" : "bg-gray-100"}`}>
                                <User className={`w-5 h-5 ${selected ? "text-[#a8843a]" : "text-gray-500"}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{s.doctorName}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{s.date} • {s.timeRange}</p>
                                <p className="text-xs sm:text-sm text-gray-400">{s.location}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${selected ? "bg-[#c9a24a] text-white" : "bg-[#c9a24a]/15 text-[#8a6b2b]"}`}>
                              {s.slotsLeft} slot
                            </span>
                          </div>
                        </button>
                      );
                    })
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs sm:text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Tips:</span> Untuk pemeriksaan lebih lanjut, jadwal terdekat biasanya lebih cepat mendapat penanganan.
                    </div>
                    <Button
                      onClick={() => setConsultView("scheduleConfirm")}
                      disabled={!selectedScheduleId}
                      className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm disabled:opacity-50"
                    >
                      Lanjutkan
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        if (consultView === "scheduleConfirm") {
          const handleMobileBook = (_date: Date, time: string) => {
            if (!selectedSchedule) return;
            // Pre-fill schedule form time from mobile selection
            setScheduleForm((prev) => ({
              ...prev,
              contactNumber: (session as any)?.phone || (session as any)?.whatsapp || "",
            }));
            // For mobile UX: directly trigger submission-like behavior or proceed to WhatsApp
            const payload = {
              type: "scheduled" as const,
              topic: scheduleForm.topic || scheduleForm.category || "Konsultasi Terjadwal",
              category: scheduleForm.category,
              chiefComplaint: scheduleForm.chiefComplaint || "Booking via mobile app",
              duration: scheduleForm.duration,
              painScale: scheduleForm.painScale,
              allergies: scheduleForm.allergies,
              medications: scheduleForm.medications,
              priorTreatment: scheduleForm.priorTreatment,
              preferredContact: scheduleForm.preferredContact,
              contactNumber: scheduleForm.contactNumber || (session as any)?.phone || (session as any)?.whatsapp || "",
              expectations: scheduleForm.expectations,
              notes: scheduleForm.notes,
              attachments: [] as { url: string; name: string; size: number }[],
              doctorName: selectedSchedule.doctorName ?? "Dokter",
              scheduleDate: selectedSchedule.date,
              scheduleTime: time || selectedSchedule.timeRange,
              location: selectedSchedule.location,
              doctorScheduleId: Number(selectedSchedule.id),
            };
            createConsultation(payload)
              .then((created) => {
                setConsultations([created, ...consultations]);
                openAdminWa(
                  formatScheduledConsultationMessage({
                    doctorName: selectedSchedule.doctorName ?? "Dokter",
                    dateTime: `${selectedSchedule.date} • ${time || selectedSchedule.timeRange}`,
                    location: selectedSchedule.location,
                  })
                );
                setConsultView("home");
                setSelectedScheduleId(null);
                toast({ title: "Terkirim", message: "Konsultasi terjadwal berhasil dibuat.", variant: "success" });
              })
              .catch((err: any) => {
                toast({ title: "Gagal", message: err.message || "Tidak bisa membuat konsultasi." });
              });
          };

          return (
            <>
              {/* Mobile Booking UI */}
              <div className="lg:hidden -mx-4 -mt-4">
                <MobileDoctorBooking
                  doctorName={selectedSchedule?.doctorName || "drg. Amanda S."}
                  doctorTitle="Sp.KG"
                  specialty="Dokter Gigi"
                  rating={4.9}
                  patientsHelped="190+"
                  doctorImage={"/dokter/dokter1.jpeg"}
                  onBack={() => {
                    setConsultView("schedule");
                    setSelectedScheduleId(null);
                  }}
                  onBook={handleMobileBook}
                  onShare={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Booking ${selectedSchedule?.doctorName || "Dokter"}`,
                        text: `Saya ingin booking jadwal dengan ${selectedSchedule?.doctorName || "Dokter"}`,
                      });
                    }
                  }}
                />
              </div>

              {/* Desktop Form */}
              <div className="hidden lg:block space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setConsultView("schedule")}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali pilih jadwal
                </Button>

                <Card className="rounded-sm border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Detail Konsultasi Terjadwal</CardTitle>
                    <p className="text-sm text-gray-500">Pastikan informasi berikut benar sebelum mengirim.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedSchedule ? (
                      <div className="bg-[#c9a24a]/5 border border-[#c9a24a]/20 rounded-sm p-4">
                        <p className="text-xs text-gray-500">Jadwal dipilih</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedSchedule.doctorName}</p>
                        <p className="text-sm text-gray-600">{selectedSchedule.date} • {selectedSchedule.timeRange} • {selectedSchedule.location}</p>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Topik</label>
                        <input
                          value={scheduleForm.topic}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, topic: e.target.value })}
                          placeholder="Contoh: Pemeriksaan nyeri gigi"
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Kategori</label>
                        <select
                          value={scheduleForm.category}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        >
                          <option value="Konsultasi Umum">Konsultasi Umum</option>
                          <option value="Gigi Berlubang">Gigi Berlubang</option>
                          <option value="Gusi & Karang Gigi">Gusi & Karang Gigi</option>
                          <option value="Kawat/Aligner">Kawat/Aligner</option>
                          <option value="Estetik (Veneer/Bleaching)">Estetik (Veneer/Bleaching)</option>
                          <option value="Implan">Implan</option>
                          <option value="Anak">Anak</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Durasi Keluhan</label>
                        <input
                          value={scheduleForm.duration}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                          placeholder="Contoh: 1 minggu"
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Keluhan Utama</label>
                      <textarea
                        value={scheduleForm.chiefComplaint}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, chiefComplaint: e.target.value })}
                        rows={4}
                        placeholder="Jelaskan keluhan Anda..."
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Skala Nyeri</label>
                        <select
                          value={scheduleForm.painScale}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, painScale: Number(e.target.value) })}
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        >
                          {Array.from({ length: 11 }).map((_, i) => (
                            <option key={i} value={i}>
                              {i} / 10
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nomor WhatsApp/Telepon</label>
                        <input
                          value={scheduleForm.contactNumber}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, contactNumber: e.target.value })}
                          placeholder="Contoh: 0812xxxxxxx"
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        />
                        <p className="text-xs text-gray-400">Dipakai untuk pengingat & konfirmasi.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Alergi (opsional)</label>
                        <input
                          value={scheduleForm.allergies}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, allergies: e.target.value })}
                          placeholder="Contoh: alergi penicillin"
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Obat yang sedang dikonsumsi (opsional)</label>
                        <input
                          value={scheduleForm.medications}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, medications: e.target.value })}
                          placeholder="Contoh: obat darah tinggi"
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Perawatan sebelumnya (opsional)</label>
                        <input
                          value={scheduleForm.priorTreatment}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, priorTreatment: e.target.value })}
                          placeholder="Contoh: tambal gigi 2024"
                          className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Lampiran Foto (opsional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 5) {
                            setScheduleAttachmentError("Maksimal 5 foto.");
                            setScheduleAttachments([]);
                            return;
                          }
                          setScheduleAttachmentError(null);
                          setScheduleAttachments(files);
                        }}
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none bg-white"
                      />
                      {scheduleAttachmentError ? (
                        <p className="text-xs text-red-600">{scheduleAttachmentError}</p>
                      ) : (
                        <p className="text-xs text-gray-400">Setelah chat WhatsApp terbuka, Anda bisa mengirim foto yang dipilih melalui WhatsApp.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Harapan Anda (opsional)</label>
                      <textarea
                        value={scheduleForm.expectations}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, expectations: e.target.value })}
                        rows={3}
                        placeholder="Contoh: ingin tahu apakah perlu ditambal/dirawat saluran akar..."
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Catatan Tambahan (opsional)</label>
                      <textarea
                        value={scheduleForm.notes}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                        rows={3}
                        placeholder="Contoh: ada riwayat sakit maag, takut jarum, dll"
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setConsultView("schedule")}
                        className="rounded-sm border-gray-200"
                      >
                        Ubah Jadwal
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!selectedSchedule) return;
                          try {
                            setScheduleAttachmentError(null);
                            let uploadedAttachments: { url: string; name: string; size: number }[] = [];
                            if (scheduleAttachments.length > 0) {
                              uploadedAttachments = await Promise.all(
                                scheduleAttachments.map((f) => uploadFile(f))
                              );
                            }
                            const payload = {
                              type: "scheduled" as const,
                              topic: scheduleForm.topic || scheduleForm.category || "Konsultasi Terjadwal",
                              category: scheduleForm.category,
                              chiefComplaint: scheduleForm.chiefComplaint,
                              duration: scheduleForm.duration,
                              painScale: scheduleForm.painScale,
                              allergies: scheduleForm.allergies,
                              medications: scheduleForm.medications,
                              priorTreatment: scheduleForm.priorTreatment,
                              preferredContact: scheduleForm.preferredContact,
                              contactNumber: scheduleForm.contactNumber,
                              expectations: scheduleForm.expectations,
                              notes: scheduleForm.notes,
                              attachments: uploadedAttachments.map((a) => ({ url: a.url, name: a.name, size: a.size })),
                              doctorName: selectedSchedule.doctorName ?? "Dokter",
                              scheduleDate: selectedSchedule.date,
                              scheduleTime: selectedSchedule.timeRange,
                              location: selectedSchedule.location,
                              doctorScheduleId: Number(selectedSchedule.id),
                            };
                            const created = await createConsultation(payload);
                            setConsultations([created, ...consultations]);
                            setScheduleAttachments([]);
                            openAdminWa(
                              formatScheduledConsultationMessage({
                                doctorName: selectedSchedule.doctorName ?? "Dokter",
                                dateTime: `${selectedSchedule.date} • ${selectedSchedule.timeRange}`,
                                location: selectedSchedule.location,
                              })
                            );
                            setConsultView("home");
                            setSelectedScheduleId(null);
                            setScheduleForm({
                              topic: "",
                              category: "Konsultasi Umum",
                              chiefComplaint: "",
                              duration: "",
                              painScale: 0,
                              allergies: "",
                              medications: "",
                              priorTreatment: "",
                              preferredContact: "WhatsApp",
                              contactNumber: "",
                              expectations: "",
                              notes: "",
                            });
                            setScheduleAttachments([]);
                            setScheduleAttachmentError(null);
                            toast({ title: "Terkirim", message: "Konsultasi terjadwal berhasil dibuat.", variant: "success" });
                          } catch (err: any) {
                            toast({ title: "Gagal", message: err.message || "Tidak bisa membuat konsultasi." });
                          }
                        }}
                        disabled={!selectedScheduleId || !scheduleForm.chiefComplaint || !scheduleForm.contactNumber || !!scheduleAttachmentError}
                        className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Chat Admin (WhatsApp)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          );
        }

        return (
          <div className="space-y-6">
            {/* Two Column Layout: Main Content + Tips Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Main Content - Left Column */}
              <div className="xl:col-span-9 space-y-6">
                {/* Consultation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quick Consultation Card */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex gap-4">
                      {/* Illustration */}
                      <div className="shrink-0">
                        <div className="w-20 h-20 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#e8c547]/30 to-[#c9a24a]/20 rounded-2xl"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img src="/dashboard/gigichat.png" alt="Chat" className="w-16 h-16 object-contain" />
                          </div>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-[#c9a24a]" />
                          <span className="text-xs font-medium text-[#c9a24a]">Konsultasi Cepat</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Chat langsung dengan dokter gigi</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                          Ajukan pertanyaan singkat dan dapatkan saran awal dari dokter kami dalam waktu singkat.
                        </p>
                        <Button
                          onClick={() => setConsultView("quick")}
                          className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl text-sm h-10 shadow-md shadow-[#c9a24a]/20"
                        >
                          Mulai Konsultasi
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        {/* Benefits */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-2 h-2 text-green-600" />
                            </span>
                            Respon cepat
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-2 h-2 text-green-600" />
                            </span>
                            Mudah & praktis
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-2 h-2 text-green-600" />
                            </span>
                            Aman & nyaman
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Consultation Card */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex gap-4">
                      {/* Illustration */}
                      <div className="shrink-0">
                        <div className="w-20 h-20 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#e8d4a2]/40 to-[#c9a24a]/20 rounded-2xl"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img src="/dashboard/kalender.png" alt="Calendar" className="w-16 h-16 object-contain" />
                          </div>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#c9a24a]" />
                          <span className="text-xs font-medium text-[#c9a24a]">Konsultasi Terjadwal</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Pilih jadwal dan konsultasi sesuai waktu Anda</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                          Pilih jadwal dokter yang sesuai dan lakukan konsultasi sesuai waktu yang Anda inginkan.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setConsultView("schedule")}
                          className="w-full rounded-xl border-gray-200 text-sm h-10 hover:bg-gray-50 hover:border-[#c9a24a]/30"
                        >
                          Pilih Jadwal
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        {/* Benefits */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#c9a24a]/10 flex items-center justify-center">
                              <Stethoscope className="w-2 h-2 text-[#a8843a]" />
                            </span>
                            Dokter profesional
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#c9a24a]/10 flex items-center justify-center">
                              <Calendar className="w-2 h-2 text-[#a8843a]" />
                            </span>
                            Jadwal fleksibel
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="w-3 h-3 rounded-full bg-[#c9a24a]/10 flex items-center justify-center">
                              <Bell className="w-2 h-2 text-[#a8843a]" />
                            </span>
                            Reminder otomatis
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Sidebar - Right Column */}
              <div className="xl:col-span-3 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#c9a24a]" />
                    Tips Sebelum Konsultasi
                  </h4>
                  <div className="space-y-4">
                    {/* Tip 1 */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-[#a8843a]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Siapkan keluhan Anda</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Jelaskan keluhan dengan detail agar dokter dapat membantu lebih akurat.
                        </p>
                      </div>
                    </div>
                    {/* Tip 2 */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4 text-[#a8843a]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Upload foto (jika perlu)</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Foto gigi atau kondisi yang dirasakan membantu dokter memahami lebih baik.
                        </p>
                      </div>
                    </div>
                    {/* Tip 3 */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center shrink-0">
                        <Wifi className="w-4 h-4 text-[#a8843a]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Pastikan koneksi stabil</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Untuk pengalaman konsultasi yang lancar dan nyaman.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation History Table - Full Width */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="px-5 py-4 border-b border-[#F0E6D3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">Riwayat Konsultasi Anda</h3>
                    <p className="text-xs text-[#8A7B6B]">Lihat semua konsultasi yang pernah Anda lakukan</p>
                  </div>
                </div>
                {/* Status Filter */}
                <div className="relative">
                  <select className="appearance-none rounded-xl border border-[#E8D4A2]/40 bg-[#FDF8F0] px-4 py-2 pr-10 text-sm text-[#4A3F35] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 outline-none cursor-pointer">
                    <option>Semua Status</option>
                    <option>Menunggu</option>
                    <option>Dijadwalkan</option>
                    <option>Selesai</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A] pointer-events-none" />
                </div>
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0E6D3]">
                      <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Konsultasi</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Tanggal</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Topik</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Dokter</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultLoading && (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                          </div>
                          <p className="text-[#4A3F35] font-medium">Memuat...</p>
                        </td>
                      </tr>
                    )}
                    {consultations.map((c: any) => (
                      <tr key={c.id} className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#F5E6C8] flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4 text-[#B8943F]" />
                            </div>
                            <span className="text-sm font-semibold text-[#4A3F35]">
                              Konsultasi #{c.id?.slice(-6) || c.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#B8A99A]" />
                            <span className="text-sm text-[#4A3F35]">{c.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 hidden sm:table-cell">
                          <span className="text-sm text-[#4A3F35] line-clamp-1">{c.topic || "-"}</span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#F5E6C8] flex items-center justify-center">
                              <Stethoscope className="w-3 h-3 text-[#B8943F]" />
                            </div>
                            <span className="text-sm text-[#4A3F35]">{c.doctorName || "-"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            c.status === "Selesai"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : c.status === "Terjadwal" || c.status === "Dijadwalkan"
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConsultationId(c.id)}
                            className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:text-[#8A6B2B] hover:bg-[#F5E6C8] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!consultLoading && consultations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-7 h-7 text-[#B8A99A]" />
                          </div>
                          <p className="text-[#4A3F35] font-medium">Belum ada konsultasi.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Table Footer */}
              {consultations.length > 0 && (
                <div className="px-5 py-3 border-t border-[#F0E6D3]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#8A7B6B] hover:text-[#4A3F35]"
                  >
                    Lihat Semua Riwayat
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      }

      case "pengaduan": {
        if (selectedComplaint) {
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Pengaduan
              </Button>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-sm bg-[#c9a24a]/10 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-[#a8843a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getCategoryColor(selectedComplaint.category)}`}>
                          {selectedComplaint.category}
                        </span>
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                          {getStatusLabel(selectedComplaint.status)}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900">{selectedComplaint.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{selectedComplaint.date}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Detail Pengaduan</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-sm">{selectedComplaint.description}</p>
                  </div>
                  {selectedComplaint.adminResponse && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Respon dari Admin</h4>
                      <p className="text-sm text-gray-600 bg-[#c9a24a]/5 p-4 rounded-sm border-l-4 border-[#c9a24a]">{selectedComplaint.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }

        if (showCreateForm) {
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Pengaduan
              </Button>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-sm bg-[#c9a24a]/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-[#a8843a]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Buat Pengaduan Baru</CardTitle>
                      <p className="text-sm text-gray-500">Sampaikan keluhan atau masukan Anda</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kategori Pengaduan</label>
                    <select
                      value={newComplaint.category}
                      onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value as ApiComplaintCategory })}
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                    >
                      <option value="Pelayanan">Pelayanan</option>
                      <option value="Fasilitas">Fasilitas</option>
                      <option value="Dokter">Dokter</option>
                      <option value="Jadwal">Jadwal</option>
                      <option value="Pembayaran">Pembayaran</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Judul Pengaduan</label>
                    <input
                      type="text"
                      value={newComplaint.title}
                      onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                      placeholder="Masukkan judul singkat pengaduan"
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Detail Pengaduan</label>
                    <textarea
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                      rows={5}
                      placeholder="Jelaskan detail pengaduan Anda..."
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="rounded-sm border-gray-200"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const created = await createComplaint({
                            title: newComplaint.title,
                            description: newComplaint.description,
                            category: newComplaint.category,
                          });
                          setComplaints([created, ...complaints]);
                          setNewComplaint({ title: "", description: "", category: "Pelayanan" });
                          setShowCreateForm(false);
                          toast({ title: "Terkirim", message: "Pengaduan berhasil dikirim!", variant: "success" });
                        } catch (err: any) {
                          toast({ title: "Gagal", message: err.message || "Gagal mengirim pengaduan" });
                        }
                      }}
                      disabled={!newComplaint.title || !newComplaint.description}
                      className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Pengaduan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pengaduan Saya</h2>
                <p className="text-sm text-gray-500">Riwayat dan status pengaduan Anda</p>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Pengaduan
              </Button>
            </div>

            <Card className="rounded-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Daftar Pengaduan</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Belum ada pengaduan</p>
                    <p className="text-sm text-gray-400">Klik "Buat Pengaduan" untuk mengirimkan keluhan Anda</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Tanggal</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Kategori</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm hidden sm:table-cell">Judul</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaintLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                            Memuat pengaduan...
                          </TableCell>
                        </TableRow>
                      )}
                      {complaints.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium text-sm sm:text-base">{p.date}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${getCategoryColor(p.category)}`}>
                              {p.category}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-normal text-gray-600 text-sm sm:text-base hidden sm:table-cell">{p.title}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs sm:text-sm font-medium ${getStatusColor(p.status)}`}>
                              {getStatusLabel(p.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedComplaint(p)}
                                className="text-[#a8843a] hover:text-[#9a7630] hover:bg-[#c9a24a]/10"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }

      case "reservasi":
        return (
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Reservasi / Booking</CardTitle>
              <p className="text-sm text-gray-500">Pilih cabang dan tanggal kunjungan Anda.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  branchId: formData.get("branchId") as string,
                  preferredDate: formData.get("preferredDate") as string,
                  patientName: formData.get("patientName") as string,
                  phone: formData.get("phone") as string,
                  note: formData.get("note") as string,
                };
                if (!data.branchId || !data.preferredDate || !data.patientName || !data.phone) {
                  toast({ title: "Form belum lengkap", message: "Mohon isi semua field yang wajib.", variant: "error" });
                  return;
                }
                try {
                  await submitPublicReservation({
                    name: data.patientName,
                    phone: data.phone,
                    complaint: data.note || "Booking Baru",
                    date: data.preferredDate,
                    source: "dashboard_reservasi",
                  });
                  toast({ title: "Berhasil", message: "Reservasi berhasil dikirim. Admin akan menghubungi Anda via WhatsApp.", variant: "success" });
                  (e.target as HTMLFormElement).reset();
                } catch (err) {
                  toast({ title: "Gagal", message: "Tidak bisa mengirim reservasi.", variant: "error" });
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cabang</label>
                    <select name="branchId" className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none bg-white" required>
                      <option value="">Pilih cabang</option>
                      <option value="pondok-indah">Aesthetic Pondok Indah</option>
                      <option value="bintaro">Bintaro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tanggal</label>
                    <input
                      name="preferredDate"
                      type="date"
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama</label>
                    <input
                      name="patientName"
                      type="text"
                      placeholder="Nama lengkap"
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">WhatsApp / Telepon</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="0812xxxxxxx"
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Catatan (opsional)</label>
                  <input
                    name="note"
                    type="text"
                    placeholder="Contoh: sakit gigi kanan atas, sudah 2 hari"
                    className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-sm bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold text-sm"
                  >
                    Kirim Permintaan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      default:
        return (
          <>
            {/* Welcome Section */}
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Selamat datang, {session?.name}!
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Pantau riwayat konsultasi dan jadwal dokter Anda di sini.
              </p>
            </div>

            {/* Stats */}
            <DashboardStats stats={stats} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Recent Consultations */}
              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Konsultasi Terakhir</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#a8843a] hover:text-[#9a7630] text-sm h-auto py-1">
                    Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myConsultations.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-sm">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c9a24a]/15 rounded-sm flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#a8843a]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{c.doctorName}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{c.date} • {c.topic}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${
                          c.status === "Selesai" 
                            ? "bg-[#c9a24a]/15 text-[#8a6b2b]" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reminders */}
              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Pengingat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myConsultations.filter(c => c.status === "Dijadwalkan").slice(0, 2).map((c) => (
                      <div key={c.id} className="bg-gradient-to-r from-[#f8f4ed] to-[#e8d4a2]/25 rounded-sm p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-sm flex items-center justify-center flex-shrink-0">
                            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base text-gray-900">Konsultasi dengan {c.doctorName}</p>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{c.date}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm text-sm h-9">
                          Mulai Sekarang
                        </Button>
                      </div>
                    ))}
                    {myConsultations.filter(c => c.status === "Dijadwalkan").length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Tidak ada pengingat saat ini</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  if (!session) return <Navigate to="/login" replace />;

  // Calculate stats for right panel
  const consultationsCount = consultations.length;
  const activeTreatmentsCount = consultations.filter((c) => c.status !== "Selesai").length;
  const availableDoctorsCount = publicSchedules.length > 0 ? publicSchedules.length : 3;

  return (
    <DashboardLayout 
      role="user"
      consultationsCount={consultationsCount}
      activeTreatmentsCount={activeTreatmentsCount}
      availableDoctorsCount={availableDoctorsCount}
    >
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 transition-all duration-300 ${activeTab === "dashboard" ? 'px-4 lg:px-8' : 'px-2 lg:pl-2 lg:pr-4'}`}>
        {/* Full width main content */}
        <div className="lg:col-span-12 space-y-6">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
