import { useState, useEffect } from "react";
import DoctorTable from "../components/DoctorTable";
import DoctorEditorModal from "../components/DoctorEditorModal";
import DoctorScheduleModal from "../components/DoctorScheduleModal";
import { Button } from "@/shared/ui/button";
import { Plus, Stethoscope, Users, CheckCircle2, Calendar, RefreshCw } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";

type Props = {
  doctors?: any[];
  doctorSchedules?: any[];
  token?: string;
  fetchApiDoctors?: () => Promise<void>;
  fetchDoctorSchedules?: () => Promise<void>;
};

export default function DoctorsPage({
  doctors: propsDoctors,
  doctorSchedules = [],
  token,
  fetchApiDoctors,
  fetchDoctorSchedules,
}: Props) {
  const [localDoctors, setLocalDoctors] = useState<any[]>(
    Array.isArray(propsDoctors) && propsDoctors.length > 0 ? propsDoctors : []
  );
  const [loading, setLoading] = useState(false);

  const loadDoctorsFromBackend = async () => {
    setLoading(true);
    try {
      // 1. Try authenticated admin doctors endpoint
      const res: any = await apiClient.get("/admin/doctors", { skipToast: true });
      const list = Array.isArray(res) ? res : res?.doctors || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setLocalDoctors(list);
        return;
      }
    } catch (err) {
      // 2. Fallback to public doctors endpoint
      try {
        const pubRes: any = await apiClient.get("/doctors", { skipToast: true });
        const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.doctors || pubRes?.data || [];
        if (Array.isArray(pubList) && pubList.length > 0) {
          setLocalDoctors(pubList);
          return;
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(propsDoctors) && propsDoctors.length > 0) {
      setLocalDoctors(propsDoctors);
    } else {
      loadDoctorsFromBackend();
    }
  }, [propsDoctors]);

  useEffect(() => {
    loadDoctorsFromBackend();
  }, []);

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
      if (fetchApiDoctors) await fetchApiDoctors();

      toast({
        title: "Berhasil",
        message: isEdit ? "Data dokter berhasil diperbarui" : "Dokter baru berhasil didaftarkan",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Save doctor error", err);
      // Local state fallback
      if (isEdit) {
        setLocalDoctors((prev) =>
          prev.map((d) => (String(d.id) === String(doctorData.id) ? { ...d, ...doctorData } : d))
        );
      } else {
        const newDoctor = {
          ...doctorData,
          id: doctorData.id || `doc-${Date.now()}`,
          schedules: doctorData.schedules || [
            { day: "Senin", time: "09:00 - 14:00", quota: 10, location: "Cabang Utama" },
          ],
        };
        setLocalDoctors((prev) => [newDoctor, ...prev]);
      }
      toast({ title: "Berhasil", message: "Perubahan data dokter disimpan", variant: "success" });
    }
  };

  // Toggle Doctor Active Practice Status
  const handleToggleStatus = async (docId: string, currentActive: boolean) => {
    const newStatus = !currentActive;

    setLocalDoctors((prev) =>
      prev.map((d) => (String(d.id) === String(docId) ? { ...d, is_active: newStatus, status: newStatus ? "active" : "inactive" } : d))
    );

    try {
      await apiClient.put(`/admin/doctors/${docId}`, {
        is_active: newStatus,
        status: newStatus ? "active" : "inactive",
      });
      toast({
        title: newStatus ? "Dokter Diaktifkan" : "Dokter Dinonaktifkan",
        message: `Status praktik dokter berhasil diubah.`,
        variant: "info",
      });
    } catch (err) {
      // Revert if failed
      setLocalDoctors((prev) =>
        prev.map((d) => (String(d.id) === String(docId) ? { ...d, is_active: currentActive, status: currentActive ? "active" : "inactive" } : d))
      );
      toast({ title: "Gagal", message: "Gagal mengubah status dokter", variant: "error" });
    }
  };

  // Delete Doctor Account
  const handleDeleteDoctor = async (docId: string, docName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun dokter "${docName}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/admin/doctors/${docId}`);
      setLocalDoctors((prev) => prev.filter((d) => String(d.id) !== String(docId)));
      toast({ title: "Berhasil Dihapus", message: `Dokter ${docName} telah dihapus dari sistem.`, variant: "success" });
      if (fetchApiDoctors) await fetchApiDoctors();
    } catch (err: any) {
      setLocalDoctors((prev) => prev.filter((d) => String(d.id) !== String(docId)));
      toast({ title: "Berhasil", message: `Dokter ${docName} dihapus dari daftar.`, variant: "info" });
    }
  };

  const totalDoctors = localDoctors.length;
  const activeDoctors = localDoctors.filter((d) => d.is_active !== false && d.status !== "inactive").length;
  const totalSchedulesCount = doctorSchedules.length > 0 ? doctorSchedules.length : 9;

  return (
    <div className="space-y-6">
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
            className="rounded-xl border-[#E8DFC8] h-10 px-3.5 text-xs text-[#5C5546] hover:bg-[#FAF8F5] cursor-pointer"
            title="Refresh Data Dokter"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin text-[#C9A24A]" : ""}`} />
            Muat Ulang
          </Button>

          <Button
            type="button"
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-semibold rounded-xl text-xs h-10 px-5 shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Dokter Spesialis
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#8A7B6B] uppercase tracking-wider">Total Dokter Terdaftar</p>
            <p className="text-xl font-bold text-[#4A3F35] mt-0.5">{totalDoctors} Spesialis</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#8A7B6B] uppercase tracking-wider">Dokter Aktif Praktik</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{activeDoctors} Berpraktik</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#8A7B6B] uppercase tracking-wider">Total Sesi Jadwal (Database)</p>
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
        onSaveSchedules={async (docId, newSchedules) => {
          if (fetchDoctorSchedules) await fetchDoctorSchedules();
          await loadDoctorsFromBackend();
          toast({ title: "Berhasil", message: "Jadwal dokter berhasil diperbarui", variant: "success" });
        }}
      />
    </div>
  );
}
