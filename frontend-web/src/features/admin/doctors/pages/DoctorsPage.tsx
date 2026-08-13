import { useState, useEffect } from "react";
import DoctorTable from "../components/DoctorTable";
import DoctorEditorModal from "../components/DoctorEditorModal";
import DoctorScheduleModal from "../components/DoctorScheduleModal";
import { Button } from "@/shared/ui/button";
import { Plus, Stethoscope, Users, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

type Props = {
  doctors: any[];
  doctorSchedules?: any[];
  token?: string;
  fetchApiDoctors?: () => Promise<void>;
  fetchDoctorSchedules?: () => Promise<void>;
};

const DEFAULT_DOCTORS = [
  {
    id: "doc-1",
    name: "drg. Amanda Putri, Sp.KGA",
    email: "amanda.putri@aestheticpondokindah.id",
    phone: "+6281234567890",
    specialization: "Spesialis Kedokteran Gigi Anak (Sp.KGA)",
    str: "31.2.1.100.3.21.987654",
    sip: "503/449/SIP.DG/DKS/2024",
    education: "FKG Universitas Indonesia (UI)",
    experience_years: 7,
    consultation_fee: 250000,
    primary_branch: "Aesthetic Pondok Indah - Cabang Utama",
    is_active: true,
    bio: "Dokter gigi spesialis anak yang berdedikasi menciptakan pengalaman perawatan gigi yang menyenangkan dan ramah anak.",
    schedules: [
      { day: "Senin", time: "09:00 - 13:00", quota: 10, location: "Cabang Utama" },
      { day: "Rabu", time: "14:00 - 18:00", quota: 10, location: "Cabang Utama" },
      { day: "Jumat", time: "09:00 - 13:00", quota: 10, location: "Cabang Utama" },
    ],
  },
  {
    id: "doc-2",
    name: "dr. drg. Hendra Wijaya, Sp.BM",
    email: "hendra.wijaya@aestheticpondokindah.id",
    phone: "+6281298765432",
    specialization: "Spesialis Bedah Mulut & Maksilofasial (Sp.BM)",
    str: "31.2.1.100.3.20.123456",
    sip: "503/450/SIP.DG/DKS/2024",
    education: "FKG Universitas Gadjah Mada (UGM)",
    experience_years: 12,
    consultation_fee: 350000,
    primary_branch: "Aesthetic Pondok Indah - Cabang Utama",
    is_active: true,
    bio: "Spesialis bedah mulut berpengalaman dalam tindakan ekstraksi implan, bedah gusi, dan penanganan rekonstruksi rahang.",
    schedules: [
      { day: "Selasa", time: "10:00 - 15:00", quota: 8, location: "Cabang Utama" },
      { day: "Kamis", time: "10:00 - 15:00", quota: 8, location: "Cabang Utama" },
      { day: "Sabtu", time: "09:00 - 14:00", quota: 8, location: "Cabang Utama" },
    ],
  },
  {
    id: "doc-3",
    name: "drg. Clarissa Maharani, Sp.Ort",
    email: "clarissa.m@aestheticpondokindah.id",
    phone: "+6281311223344",
    specialization: "Spesialis Ortodonti (Sp.Ort)",
    str: "31.2.1.100.3.22.654321",
    sip: "503/451/SIP.DG/DKS/2024",
    education: "FKG Universitas Padjadjaran (UNPAD)",
    experience_years: 9,
    consultation_fee: 300000,
    primary_branch: "Aesthetic Pondok Indah - Cabang Utama",
    is_active: true,
    bio: "Ahli dalam perataan gigi, behel estetik damon, dan aligner transparan untuk senyum yang lebih simetris dan sehat.",
    schedules: [
      { day: "Senin", time: "14:00 - 19:00", quota: 12, location: "Cabang Utama" },
      { day: "Kamis", time: "14:00 - 19:00", quota: 12, location: "Cabang Utama" },
      { day: "Sabtu", time: "14:00 - 18:00", quota: 10, location: "Cabang Utama" },
    ],
  },
];

export default function DoctorsPage({
  doctors: propsDoctors,
  doctorSchedules = [],
  token,
  fetchApiDoctors,
  fetchDoctorSchedules,
}: Props) {
  const [localDoctors, setLocalDoctors] = useState<any[]>(
    Array.isArray(propsDoctors) && propsDoctors.length > 0 ? propsDoctors : DEFAULT_DOCTORS
  );

  useEffect(() => {
    if (Array.isArray(propsDoctors) && propsDoctors.length > 0) {
      setLocalDoctors(propsDoctors);
    }
  }, [propsDoctors]);

  // Modal States
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState<any | null>(null);

  // Open Create Doctor Modal
  const handleCreateNew = () => {
    setSelectedDoctor(null);
    setEditorOpen(true);
  };

  // Open Edit Doctor Modal
  const handleEditDoctor = (doc: any) => {
    setSelectedDoctor(doc);
    setEditorOpen(true);
  };

  // Open Manage Schedule Modal
  const handleManageSchedule = (doc: any) => {
    const dbSchedulesForDoc = doctorSchedules
      .filter((s: any) => String(s.doctorId || s.user_id) === String(doc.id))
      .map((s: any) => ({
        id: s.id,
        day: s.displayDate || s.date || "Senin",
        time: s.timeRange || s.time_range || "09:00 - 14:00",
        quota: s.totalSlots || s.total_slots || 10,
        location: s.location || "Cabang Utama",
      }));

    const docWithSchedules = {
      ...doc,
      schedules: dbSchedulesForDoc.length > 0 ? dbSchedulesForDoc : doc.schedules || [],
    };

    setScheduleDoctor(docWithSchedules);
    setScheduleOpen(true);
  };

  // Save / Update Doctor (Create or Edit)
  const handleSaveDoctor = async (doctorData: any) => {
    const isEdit = Boolean(doctorData.id);
    const authToken = token || localStorage.getItem("apident:token");

    try {
      if (authToken) {
        const url = isEdit ? `${API_BASE}/admin/doctors/${doctorData.id}` : `${API_BASE}/admin/doctors`;
        const method = isEdit ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: doctorData.name,
            email: doctorData.email,
            whatsapp: doctorData.phone,
            password: doctorData.password || undefined,
            specialization: doctorData.specialization,
            str: doctorData.str,
            sip: doctorData.sip,
            education: doctorData.education,
            experience_years: doctorData.experience_years,
            consultation_fee: doctorData.consultation_fee,
            primary_branch: doctorData.primary_branch,
            is_active: doctorData.is_active,
            bio: doctorData.bio,
          }),
        });

        if (res.ok && fetchApiDoctors) {
          await fetchApiDoctors();
        }
      }

      // Local State Update
      if (isEdit) {
        setLocalDoctors((prev) =>
          prev.map((d) => (String(d.id) === String(doctorData.id) ? { ...d, ...doctorData } : d))
        );
        toast({ title: "Berhasil", message: "Data dokter berhasil diperbarui", variant: "success" });
      } else {
        const newDoctor = {
          ...doctorData,
          id: doctorData.id || `doc-${Date.now()}`,
          schedules: doctorData.schedules || [
            { day: "Senin", time: "09:00 - 14:00", quota: 10, location: "Cabang Utama" },
          ],
        };
        setLocalDoctors((prev) => [newDoctor, ...prev]);
        toast({ title: "Berhasil", message: "Dokter spesialis baru berhasil mendaftarkan akun", variant: "success" });
      }
    } catch (err: any) {
      console.error("Save doctor error", err);
      // Fallback local update
      if (isEdit) {
        setLocalDoctors((prev) =>
          prev.map((d) => (String(d.id) === String(doctorData.id) ? { ...d, ...doctorData } : d))
        );
        toast({ title: "Berhasil", message: "Data dokter diperbarui secara lokal", variant: "success" });
      } else {
        const newDoctor = {
          ...doctorData,
          id: `doc-${Date.now()}`,
          schedules: [
            { day: "Senin", time: "09:00 - 14:00", quota: 10, location: "Cabang Utama" },
          ],
        };
        setLocalDoctors((prev) => [newDoctor, ...prev]);
        toast({ title: "Berhasil", message: "Dokter spesialis baru ditambahkan", variant: "success" });
      }
    }
  };

  // Toggle Doctor Active Practice Status
  const handleToggleStatus = async (docId: string, currentActive: boolean) => {
    const newStatus = !currentActive;
    const authToken = token || localStorage.getItem("apident:token");

    setLocalDoctors((prev) =>
      prev.map((d) => (String(d.id) === String(docId) ? { ...d, is_active: newStatus } : d))
    );

    toast({
      title: newStatus ? "Dokter Diaktifkan" : "Dokter Dinonaktifkan",
      message: `Status praktik dokter diperbarui menjadi ${newStatus ? "Aktif" : "Non-aktif"}.`,
      variant: newStatus ? "success" : "info",
    });

    if (authToken) {
      try {
        await fetch(`${API_BASE}/admin/doctors/${docId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: newStatus }),
        });
        if (fetchApiDoctors) fetchApiDoctors();
      } catch (e) {
        console.error("Gagal toggle status dokter", e);
      }
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (docId: string, docName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokter "${docName}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    const authToken = token || localStorage.getItem("apident:token");

    setLocalDoctors((prev) => prev.filter((d) => String(d.id) !== String(docId)));
    toast({ title: "Berhasil", message: `Dokter ${docName} berhasil dihapus dari sistem.`, variant: "success" });

    if (authToken) {
      try {
        await fetch(`${API_BASE}/admin/doctors/${docId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (fetchApiDoctors) fetchApiDoctors();
      } catch (e) {
        console.error("Gagal hapus dokter", e);
      }
    }
  };

  // Save Schedules for a doctor to DB API
  const handleSaveSchedules = async (docId: string, schedules: any[]) => {
    const authToken = token || localStorage.getItem("apident:token");

    setLocalDoctors((prev) =>
      prev.map((d) => (String(d.id) === String(docId) ? { ...d, schedules } : d))
    );

    if (authToken && String(docId).match(/^\d+$/)) {
      try {
        const latestSlot = schedules[schedules.length - 1];
        if (latestSlot) {
          const todayIso = new Date().toISOString().split("T")[0];
          await fetch(`${API_BASE}/admin/doctor-schedules`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              user_id: docId,
              date: todayIso,
              time_range: latestSlot.time || "09:00 - 14:00",
              location: latestSlot.location || "Cabang Utama",
              total_slots: latestSlot.quota || 10,
            }),
          });
          if (fetchDoctorSchedules) await fetchDoctorSchedules();
        }
      } catch (e) {
        console.error("Gagal menyimpan jadwal ke API", e);
      }
    }
  };

  const activeCount = localDoctors.filter((d) => d.is_active !== false).length;
  const totalSchedulesApi = Array.isArray(doctorSchedules) ? doctorSchedules.length : 0;
  const totalSchedulesLocal = localDoctors.reduce((acc, d) => acc + (d.schedules?.length || 0), 0);
  const totalSchedules = totalSchedulesApi > 0 ? totalSchedulesApi : totalSchedulesLocal;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F0E6D3] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#C9A24A]" />
            Manajemen Dokter Spesialis
          </h2>
          <p className="text-sm text-[#8A7B6B] mt-1">
            Kelola data dokter, akun & kredensial login, jadwal praktik, serta status keaktifan berpraktik.
          </p>
        </div>

        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8923F] hover:to-[#9A7630] text-white font-semibold rounded-xl px-5 h-11 shadow-md shadow-[#C9A24A]/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Dokter Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Dokter Terdaftar</p>
            <p className="text-lg font-bold text-[#4A3F35]">{localDoctors.length} Spesialis</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-700 font-semibold">Dokter Aktif Praktik</p>
            <p className="text-lg font-bold text-emerald-900">{activeCount} Berpraktik</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#C9A24A]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-amber-800 font-semibold">Total Sesi Jadwal (Database)</p>
            <p className="text-lg font-bold text-[#4A3F35]">{totalSchedules} Sesi Terdaftar</p>
          </div>
        </div>
      </div>

      {/* Main Doctor Table */}
      <DoctorTable
        doctors={localDoctors}
        onEdit={handleEditDoctor}
        onManageSchedule={handleManageSchedule}
        onToggleStatus={handleToggleStatus}
        onDeleteDoctor={handleDeleteDoctor}
      />

      {/* Editor Modal for Adding/Editing Doctor & Credentials */}
      <DoctorEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        doctor={selectedDoctor}
        onSave={handleSaveDoctor}
      />

      {/* Schedule Modal for Managing Doctor Practice Schedule */}
      <DoctorScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        doctor={scheduleDoctor}
        onSaveSchedules={handleSaveSchedules}
      />
    </div>
  );
}
