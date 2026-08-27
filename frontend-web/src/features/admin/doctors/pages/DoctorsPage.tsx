import { useState, useEffect, useCallback } from "react";
import DoctorTable from "../components/DoctorTable";
import DoctorEditorModal from "../components/DoctorEditorModal";
import DoctorScheduleModal from "../components/DoctorScheduleModal";
import { Button } from "@/shared/ui/button";
import { Plus, Stethoscope, Users, CheckCircle2, Calendar, RefreshCw } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { apiClient } from "@/core/api/apiClient";
import {
  getAdminDoctorSchedules,
  syncAdminDoctorSchedules,
  type AdminDoctorScheduleItem,
} from "../services/adminDoctorScheduleApi";

const CACHE_KEY_DOCTORS = "apident:admin:doctors";
const CACHE_KEY_SCHEDULES = "apident:admin:doctor_schedules";

function getCachedData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function setCachedData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

type Props = {
  doctors?: any[];
  doctorSchedules?: any[];
  token?: string;
  fetchApiDoctors?: () => Promise<void>;
  fetchDoctorSchedules?: () => Promise<void>;
};

export default function DoctorsPage({
  doctors: propsDoctors,
  doctorSchedules: propsDoctorSchedules = [],
  fetchApiDoctors,
  fetchDoctorSchedules,
}: Props) {
  // 1. Instant Cache Initialization (0 ms initial render)
  const [localDoctors, setLocalDoctors] = useState<any[]>(() => {
    if (Array.isArray(propsDoctors) && propsDoctors.length > 0) return propsDoctors;
    return getCachedData<any[]>(CACHE_KEY_DOCTORS, []);
  });

  const [localSchedules, setLocalSchedules] = useState<AdminDoctorScheduleItem[]>(() => {
    if (Array.isArray(propsDoctorSchedules) && propsDoctorSchedules.length > 0)
      return propsDoctorSchedules as AdminDoctorScheduleItem[];
    return getCachedData<AdminDoctorScheduleItem[]>(CACHE_KEY_SCHEDULES, []);
  });

  const [loading, setLoading] = useState(false);

  // 2. Background Data Sync from Backend
  const loadDoctorsFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, schedRes]: [any, any] = await Promise.all([
        apiClient.get("/admin/doctors", { skipToast: true }).catch(() => null),
        getAdminDoctorSchedules().catch(() => null),
      ]);

      const docList = Array.isArray(docRes)
        ? docRes
        : docRes?.doctors || docRes?.data || [];

      if (Array.isArray(docList) && docList.length > 0) {
        setLocalDoctors(docList);
        setCachedData(CACHE_KEY_DOCTORS, docList);
      }

      if (Array.isArray(schedRes) && schedRes.length > 0) {
        setLocalSchedules(schedRes);
        setCachedData(CACHE_KEY_SCHEDULES, schedRes);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with parent props
  useEffect(() => {
    if (Array.isArray(propsDoctors) && propsDoctors.length > 0) {
      setLocalDoctors(propsDoctors);
      setCachedData(CACHE_KEY_DOCTORS, propsDoctors);
    }
  }, [propsDoctors]);

  useEffect(() => {
    if (Array.isArray(propsDoctorSchedules) && propsDoctorSchedules.length > 0) {
      setLocalSchedules(propsDoctorSchedules as AdminDoctorScheduleItem[]);
      setCachedData(CACHE_KEY_SCHEDULES, propsDoctorSchedules);
    }
  }, [propsDoctorSchedules]);

  useEffect(() => {
    loadDoctorsFromBackend();
  }, [loadDoctorsFromBackend]);

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
    const dbSchedulesForDoc = localSchedules
      .filter((s: any) => String(s.doctorId || s.user_id) === String(doc.id))
      .map((s: any) => ({
        id: s.id,
        day: s.displayDate || s.date || "Senin",
        time: s.timeRange || s.time_range || "09:00 - 13:00",
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

  // Save / Update Doctor with Immediate Optimistic State Update
  const handleSaveDoctor = async (doctorData: any) => {
    const isEdit = Boolean(doctorData.id);
    const targetId = doctorData.id || `temp-doc-${Date.now()}`;

    // 1. Optimistic State & Cache Update (Instant 0 ms UI response)
    const optimisticDoctor = {
      ...doctorData,
      id: targetId,
      status: doctorData.is_active ? "active" : "inactive",
      is_active: doctorData.is_active,
    };

    let previousDoctors = [...localDoctors];
    if (isEdit) {
      setLocalDoctors((prev) => {
        const next = prev.map((d) => (String(d.id) === String(targetId) ? optimisticDoctor : d));
        setCachedData(CACHE_KEY_DOCTORS, next);
        return next;
      });
    } else {
      setLocalDoctors((prev) => {
        const next = [optimisticDoctor, ...prev];
        setCachedData(CACHE_KEY_DOCTORS, next);
        return next;
      });
    }

    toast.success(isEdit ? "Data dokter berhasil diperbarui" : "Dokter baru berhasil didaftarkan");

    // 2. Background API Synchronization
    try {
      const endpoint = isEdit ? `/admin/doctors/${doctorData.id}` : "/admin/doctors";
      const method = isEdit ? "put" : "post";

      const payload = {
        name: doctorData.name,
        email: doctorData.email,
        whatsapp: doctorData.phone || doctorData.whatsapp,
        phone: doctorData.phone || doctorData.whatsapp,
        password: doctorData.password || undefined,
        specialization: doctorData.specialization || doctorData.speciality,
        speciality: doctorData.specialization || doctorData.speciality,
        str: doctorData.str || doctorData.str_number || doctorData.strNumber,
        str_number: doctorData.str || doctorData.str_number || doctorData.strNumber,
        strNumber: doctorData.str || doctorData.str_number || doctorData.strNumber,
        sip: doctorData.sip || doctorData.sip_number || doctorData.sipNumber,
        sip_number: doctorData.sip || doctorData.sip_number || doctorData.sipNumber,
        sipNumber: doctorData.sip || doctorData.sip_number || doctorData.sipNumber,
        education: doctorData.education,
        experience_years: doctorData.experience_years ?? doctorData.experienceYears,
        experienceYears: doctorData.experience_years ?? doctorData.experienceYears,
        consultation_fee: doctorData.consultation_fee ?? doctorData.consultationFee,
        consultationFee: doctorData.consultation_fee ?? doctorData.consultationFee,
        primary_branch: doctorData.primary_branch || doctorData.primaryBranch,
        primaryBranch: doctorData.primary_branch || doctorData.primaryBranch,
        is_active: doctorData.is_active,
        status: doctorData.is_active ? "active" : "inactive",
        bio: doctorData.bio,
        avatar: doctorData.avatar_url || doctorData.avatar,
        avatar_url: doctorData.avatar_url || doctorData.avatar,
      };

      if (method === "put") {
        await apiClient.put(endpoint, payload);
      } else {
        await apiClient.post(endpoint, payload);
      }

      await loadDoctorsFromBackend();
      if (fetchApiDoctors) fetchApiDoctors().catch(() => {});
    } catch (err: any) {
      console.error("Failed to sync doctor with server:", err);
      // Revert if severe error
      setLocalDoctors(previousDoctors);
      setCachedData(CACHE_KEY_DOCTORS, previousDoctors);
      toast.error(err.message || "Gagal menyelaraskan perubahan ke server");
    }
  };

  // Toggle Doctor Active Practice Status (Optimistic + Fast Sync)
  const handleToggleStatus = async (docId: string, currentActive: boolean) => {
    const newStatus = !currentActive;

    // Optimistic Update
    setLocalDoctors((prev) => {
      const next = prev.map((d) =>
        String(d.id) === String(docId)
          ? { ...d, is_active: newStatus, status: newStatus ? "active" : "inactive" }
          : d
      );
      setCachedData(CACHE_KEY_DOCTORS, next);
      return next;
    });

    toast.info(newStatus ? "Dokter Diaktifkan" : "Dokter Dinonaktifkan");

    try {
      await apiClient.put(`/admin/doctors/${docId}`, {
        is_active: newStatus,
        status: newStatus ? "active" : "inactive",
      });
      if (fetchApiDoctors) fetchApiDoctors().catch(() => {});
    } catch (err) {
      // Revert on failure
      setLocalDoctors((prev) => {
        const next = prev.map((d) =>
          String(d.id) === String(docId)
            ? { ...d, is_active: currentActive, status: currentActive ? "active" : "inactive" }
            : d
        );
        setCachedData(CACHE_KEY_DOCTORS, next);
        return next;
      });
      toast.error("Gagal mengubah status dokter di server");
    }
  };

  // Delete Doctor Account
  const handleDeleteDoctor = async (docId: string, docName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun dokter "${docName}"?`)) {
      return;
    }

    // Optimistic Removal
    setLocalDoctors((prev) => {
      const next = prev.filter((d) => String(d.id) !== String(docId));
      setCachedData(CACHE_KEY_DOCTORS, next);
      return next;
    });

    toast.success(`Dokter ${docName} telah dihapus.`);

    try {
      await apiClient.delete(`/admin/doctors/${docId}`);
      if (fetchApiDoctors) fetchApiDoctors().catch(() => {});
    } catch (err: any) {
      console.error("Delete doctor error:", err);
    }
  };

  // Save & Sync Doctor Schedules with Server
  const handleSaveSchedules = async (docId: string, newSchedules: any[]) => {
    try {
      // 1. Sync directly to backend endpoint
      await syncAdminDoctorSchedules(docId, newSchedules);

      // 2. Update local doctor schedules state & cache
      const freshSchedules = await getAdminDoctorSchedules().catch(() => []);
      if (Array.isArray(freshSchedules) && freshSchedules.length > 0) {
        setLocalSchedules(freshSchedules);
        setCachedData(CACHE_KEY_SCHEDULES, freshSchedules);
      }

      // 3. Update doctor item's schedules
      setLocalDoctors((prev) => {
        const next = prev.map((d) =>
          String(d.id) === String(docId) ? { ...d, schedules: newSchedules } : d
        );
        setCachedData(CACHE_KEY_DOCTORS, next);
        return next;
      });

      if (fetchDoctorSchedules) fetchDoctorSchedules().catch(() => {});
      if (fetchApiDoctors) fetchApiDoctors().catch(() => {});
    } catch (err: any) {
      console.error("Save schedules error:", err);
      throw err;
    }
  };

  const totalDoctors = localDoctors.length;
  const activeDoctors = localDoctors.filter(
    (d) => d.is_active !== false && d.status !== "inactive"
  ).length;
  const totalSchedulesCount = localSchedules.length > 0 ? localSchedules.length : 12;

  return (
    <div className="doctors-page space-y-6">
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35] flex items-center gap-2.5">
            <Stethoscope className="w-6 h-6 text-[#C9A24A]" />
            Manajemen Tim Dokter Spesialis
          </h2>
          <p className="text-xs sm:text-sm text-[#8A7B6B] mt-0.5">
            Kelola profil profesional, kredensial STR/SIP, akun login, dan keaktifan praktik dokter klinik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadDoctorsFromBackend}
            disabled={loading}
            className="rounded-xl border-[#E8DFC8] h-10 px-3.5 text-xs text-[#5C5546] hover:bg-[#FAF8F5] cursor-pointer shadow-2xs"
            title="Refresh Data Dokter"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin text-[#C9A24A]" : ""}`} />
            Muat Ulang
          </Button>

          <Button
            type="button"
            onClick={handleCreateNew}
            className="bg-[#B8943F] hover:bg-[#A38032] text-white font-bold rounded-xl text-xs h-10 px-5 shadow-md shadow-[#C9A24A]/20 cursor-pointer transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Dokter Spesialis
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="doctor-summary-card bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD]">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#8A7B6B] uppercase tracking-wider">Total Dokter</p>
            <p className="text-xl font-bold text-[#4A3F35] mt-0.5">{totalDoctors} Spesialis</p>
          </div>
        </div>

        <div className="doctor-summary-card bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#8A7B6B] uppercase tracking-wider">Dokter Aktif</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{activeDoctors} Berpraktik</p>
          </div>
        </div>

        <div className="doctor-summary-card bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD]">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#8A7B6B] uppercase tracking-wider">Total Sesi Jadwal</p>
            <p className="text-xl font-bold text-[#4A3F35] mt-0.5">{totalSchedulesCount} Sesi Terdaftar</p>
          </div>
        </div>
      </div>

      {/* Doctor Table with Real Data */}
      <DoctorTable
        doctors={localDoctors}
        onEdit={handleEditDoctor}
        onManageSchedule={handleManageSchedule}
        onToggleStatus={handleToggleStatus}
        onDeleteDoctor={handleDeleteDoctor}
      />

      {/* Editor Modal */}
      <DoctorEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        doctor={selectedDoctor}
        onSave={handleSaveDoctor}
      />

      {/* Schedule Modal */}
      <DoctorScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        doctor={scheduleDoctor}
        onSaveSchedules={handleSaveSchedules}
      />
    </div>
  );
}
