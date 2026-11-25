import { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Stethoscope,
  Sparkles,
  Calendar,
  Clock,
  Search,
  Check,
  ChevronDown,
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  doctors?: any[];
  onSuccess?: () => void;
}

export default function CreateReservationModal({
  isOpen,
  onClose,
  token = "",
  doctors = [],
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [treatmentInterest, setTreatmentInterest] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | number>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Layanan List
  const [treatments, setTreatments] = useState<Array<{ id: any; title: string; price_formatted?: string }>>([]);
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);

  // Dropdown UI States
  const [treatmentOpen, setTreatmentOpen] = useState(false);
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");

  const treatmentRef = useRef<HTMLDivElement>(null);
  const doctorRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (treatmentRef.current && !treatmentRef.current.contains(e.target as Node)) {
        setTreatmentOpen(false);
      }
      if (doctorRef.current && !doctorRef.current.contains(e.target as Node)) {
        setDoctorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch treatments on modal open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingTreatments(true);
      fetch(`${API_BASE}/services`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setTreatments(list);
        })
        .catch(() => {
          // fallback default treatments
          setTreatments([
            { id: 1, title: "Pemeriksaan & Konsultasi Gigi" },
            { id: 2, title: "Scaling / Pembersihan Karang Gigi" },
            { id: 3, title: "Bleaching / Pemutihan Gigi" },
            { id: 4, title: "Tambal Gigi Estetik" },
            { id: 5, title: "Pemasangan Kawat Gigi / Behel" },
            { id: 6, title: "Cabut Gigi & Odontektomi" },
            { id: 7, title: "Dental Implant" },
            { id: 8, title: "Perawatan Saluran Akar" },
          ]);
        })
        .finally(() => setIsLoadingTreatments(false));
    }
  }, [isOpen]);

  // Filtered Treatments
  const filteredTreatments = useMemo(() => {
    if (!treatmentSearch.trim()) return treatments;
    return treatments.filter((t) =>
      t.title.toLowerCase().includes(treatmentSearch.toLowerCase())
    );
  }, [treatments, treatmentSearch]);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return doctors;
    return doctors.filter((d: any) => {
      const docName = (d.name || d.nama || "").toLowerCase();
      const spec = (d.specialization || d.spesialisasi || "").toLowerCase();
      const q = doctorSearch.toLowerCase();
      return docName.includes(q) || spec.includes(q);
    });
  }, [doctors, doctorSearch]);

  // Selected Doctor Object
  const selectedDoctor = useMemo(() => {
    return doctors.find((d: any) => String(d.id) === String(selectedDoctorId));
  }, [doctors, selectedDoctorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama pasien wajib diisi");
      return;
    }
    if (!phone.trim()) {
      toast.error("Nomor WhatsApp/Telepon pasien wajib diisi");
      return;
    }
    if (!treatmentInterest.trim()) {
      toast.error("Silakan pilih layanan tindakan");
      return;
    }
    if (!date) {
      toast.error("Silakan pilih tanggal janji temu");
      return;
    }
    if (!time) {
      toast.error("Silakan tentukan jam reservasi");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        treatment_interest: treatmentInterest,
        date: date,
        preferred_time: time,
        complaint: complaint.trim() || null,
        source: "admin_manual",
      };

      if (selectedDoctorId) {
        payload.doctor_id = selectedDoctorId;
      }

      const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.message || "Gagal membuat reservasi");
      }

      toast.success("Reservasi berhasil ditambahkan!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem saat menyimpan reservasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl border border-[#EFE8DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#3D332A] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE6] flex items-center justify-between bg-white/80 sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-[#3D332A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C]">
                <Calendar className="w-4 h-4" />
              </span>
              Tambah Reservasi Baru
            </h3>
            <p className="text-xs text-[#7A6E60] mt-0.5">
              Input janji temu pasien langsung ke sistem antrean klinik
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#998A78] hover:text-[#3D332A] hover:bg-[#F7F3EC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Section: Data Pasien */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#5C4F40] uppercase tracking-wider block">
              1. Identitas Pasien
            </label>

            <div>
              <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Nama Pasien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] focus:bg-white text-sm text-[#3D332A] placeholder-[#A89D8F] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  Nomor WhatsApp/HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] focus:bg-white text-sm text-[#3D332A] placeholder-[#A89D8F] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pasien@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] focus:bg-white text-sm text-[#3D332A] placeholder-[#A89D8F] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#F4EFE6] my-2" />

          {/* Section: Layanan & Dokter */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#5C4F40] uppercase tracking-wider block">
              2. Layanan Tindakan & Dokter
            </label>

            {/* Dropdown Layanan with Search */}
            <div className="relative" ref={treatmentRef}>
              <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Pilih Layanan Tindakan <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setTreatmentOpen(!treatmentOpen)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] hover:bg-white text-left text-sm flex items-center justify-between text-[#3D332A] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
              >
                <span className={treatmentInterest ? "font-medium text-[#3D332A]" : "text-[#A89D8F]"}>
                  {treatmentInterest || "Cari & pilih layanan..."}
                </span>
                <ChevronDown className="w-4 h-4 text-[#8A7C6D]" />
              </button>

              {treatmentOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#E8DFC8] shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-[#F4EFE6] flex items-center gap-2 bg-[#FAF8F5]">
                    <Search className="w-3.5 h-3.5 text-[#8A7C6D]" />
                    <input
                      type="text"
                      autoFocus
                      value={treatmentSearch}
                      onChange={(e) => setTreatmentSearch(e.target.value)}
                      placeholder="Ketik nama layanan gigi..."
                      className="w-full bg-transparent text-xs text-[#3D332A] placeholder-[#A89D8F] focus:outline-hidden"
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto p-1 divide-y divide-transparent">
                    {isLoadingTreatments ? (
                      <div className="p-3 text-center text-xs text-[#7A6E60] flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memuat layanan...
                      </div>
                    ) : filteredTreatments.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#7A6E60]">
                        Tidak ditemukan layanan "{treatmentSearch}"
                      </div>
                    ) : (
                      filteredTreatments.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setTreatmentInterest(t.title);
                            setTreatmentOpen(false);
                            setTreatmentSearch("");
                          }}
                          className={`w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                            treatmentInterest === t.title
                              ? "bg-[#FAF4E6] text-[#8C6B1C] font-semibold"
                              : "hover:bg-[#FAF8F5] text-[#3D332A]"
                          }`}
                        >
                          <span>{t.title}</span>
                          {treatmentInterest === t.title && <Check className="w-4 h-4 text-[#8C6B1C]" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Dokter with Search */}
            <div className="relative" ref={doctorRef}>
              <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Pilih Dokter (Opsional / Ditentukan)
              </label>

              <button
                type="button"
                onClick={() => setDoctorOpen(!doctorOpen)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] hover:bg-white text-left text-sm flex items-center justify-between text-[#3D332A] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
              >
                <span className={selectedDoctor ? "font-medium text-[#3D332A]" : "text-[#A89D8F]"}>
                  {selectedDoctor
                    ? `${selectedDoctor.name || selectedDoctor.nama} ${selectedDoctor.specialization ? `(${selectedDoctor.specialization})` : ""}`
                    : "Pilih dokter pemeriksa (bisa dikosongkan)"}
                </span>
                <ChevronDown className="w-4 h-4 text-[#8A7C6D]" />
              </button>

              {doctorOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#E8DFC8] shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-[#F4EFE6] flex items-center gap-2 bg-[#FAF8F5]">
                    <Search className="w-3.5 h-3.5 text-[#8A7C6D]" />
                    <input
                      type="text"
                      autoFocus
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      placeholder="Cari nama atau spesialis dokter..."
                      className="w-full bg-transparent text-xs text-[#3D332A] placeholder-[#A89D8F] focus:outline-hidden"
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctorId("");
                        setDoctorOpen(false);
                        setDoctorSearch("");
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs text-[#7A6E60] hover:bg-[#FAF8F5] transition-colors italic"
                    >
                      -- Belum Ditentukan / Dokter Piket --
                    </button>
                    {filteredDoctors.map((doc: any) => {
                      const docName = doc.name || doc.nama || "Dokter";
                      const docSpec = doc.specialization || doc.spesialisasi || "";
                      const isSelected = String(selectedDoctorId) === String(doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId(doc.id);
                            setDoctorOpen(false);
                            setDoctorSearch("");
                          }}
                          className={`w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-[#FAF4E6] text-[#8C6B1C] font-semibold"
                              : "hover:bg-[#FAF8F5] text-[#3D332A]"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-[#3D332A]">{docName}</p>
                            {docSpec && <p className="text-[11px] text-[#8A7C6D]">{docSpec}</p>}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#8C6B1C]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-[#F4EFE6] my-2" />

          {/* Section: Jadwal Tanggal & Jam */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#5C4F40] uppercase tracking-wider block">
              3. Waktu & Catatan Keluhan
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  Hari & Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] focus:bg-white text-sm text-[#3D332A] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  Jam Janji Temu <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] focus:bg-white text-sm text-[#3D332A] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#665849] mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Keluhan / Catatan Pasien (Opsional)
              </label>
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Deskripsi singkat keluhan atau permintaan pasien..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2D8C7] bg-[#FAF8F5] focus:bg-white text-sm text-[#3D332A] placeholder-[#A89D8F] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/15 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#E2D8C7] text-xs sm:text-sm font-semibold text-[#7A6E60] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#8C6B1C] hover:bg-[#785A17] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Simpan Reservasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
