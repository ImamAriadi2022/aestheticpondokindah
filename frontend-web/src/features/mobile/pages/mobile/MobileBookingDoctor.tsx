import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import NewMobileDashboardLayout from "@/components/dashboard/NewMobileDashboardLayout";
import { 
  Stethoscope, 
  Star,
  ArrowRight,
  Check
} from "lucide-react";
import { getPublicDoctorSchedules, PublicDoctorScheduleItem } from "@/features/doctors/services/publicDoctorScheduleApi";

type DoctorLite = { id: string; name: string; firstSchedule?: PublicDoctorScheduleItem };

const serviceNames: Record<string, string> = {
  konsultasi: "Konsultasi & Pemeriksaan",
  scaling: "Scaling / Pembersihan Karang Gigi",
  tambal: "Tambal Gigi",
  behel: "Behel (Orthodonti)",
  pembersihan: "Pembersihan Gigi",
  cabut: "Cabut Gigi",
};

export default function MobileBookingDoctorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service") || "konsultasi";
  
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<PublicDoctorScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getPublicDoctorSchedules()
      .then((items) => {
        const valid = (items || []).filter((it) => it.doctorId && it.doctorName);
        setSchedules(valid);
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  const doctors: DoctorLite[] = useMemo(() => {
    const map = new Map<string, DoctorLite>();
    for (const s of schedules) {
      if (!s.doctorId || !s.doctorName) continue;
      if (!map.has(s.doctorId)) {
        map.set(s.doctorId, { id: s.doctorId, name: s.doctorName || "Dokter", firstSchedule: s });
      }
    }
    return Array.from(map.values());
  }, [schedules]);

  const handleSelectDoctor = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setTimeout(() => {
      navigate(`/dashboard/user?tab=booking&step=jadwal&service=${serviceId}&doctor=${doctorId}`);
    }, 200);
  };

  return (
    <NewMobileDashboardLayout role="user" hideBottomNav>
      {/* Progress Steps */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-green-600">Layanan</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#c9a24a] text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-xs font-medium text-[#c9a24a]">Dokter</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-xs font-medium text-gray-400">Jadwal</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              4
            </div>
            <span className="text-xs font-medium text-gray-400">Konfirmasi</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected Service Badge */}
        <div className="bg-[#c9a24a]/10 rounded-xl p-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#c9a24a] rounded-full" />
          <span className="text-sm font-medium text-[#c9a24a]">
            {serviceNames[serviceId] || "Konsultasi"}
          </span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Pilih Dokter</h1>
          <p className="text-sm text-gray-500">
            Pilih dokter yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Doctors List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-sm text-gray-500 py-10">Memuat dokter...</div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-10">Belum ada dokter dengan jadwal publik.</div>
          ) : (
            doctors.map((doctor) => {
              const isSelected = selectedDoctor === doctor.id;
              const timeInfo = doctor.firstSchedule?.timeRange || "";
              const dateInfo = doctor.firstSchedule?.displayDate || doctor.firstSchedule?.date || "";
              return (
                <div
                  key={doctor.id}
                  onClick={() => handleSelectDoctor(doctor.id)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    isSelected 
                      ? "border-[#c9a24a] bg-[#c9a24a]/5" 
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Doctor Image/Avatar */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {doctor.name}
                          </h3>
                          <p className="text-xs text-gray-500">Tersedia</p>
                        </div>
                        
                        {isSelected && (
                          <div className="w-6 h-6 bg-[#c9a24a] rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Ringkasan jadwal dari backend */}
                      {doctor.firstSchedule && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{dateInfo}</span>
                          <span>•</span>
                          <span>{timeInfo}</span>
                        </div>
                      )}
                      
                      {/* Slot indicator */}
                      <div className="mt-3 inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Slot tersedia</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </NewMobileDashboardLayout>
  );
}
