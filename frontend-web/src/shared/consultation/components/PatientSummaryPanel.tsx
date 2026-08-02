import { Loader2, Stethoscope, FileText, History, User } from "lucide-react";
import { cn } from "@/core/utils/utils";
import type { PatientSummary } from "@/shared/consultation/types/consultation";
import { formatChatDate } from "@/shared/consultation/utils/format";

interface PatientSummaryPanelProps {
  summary: PatientSummary | null;
  loading?: boolean;
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[#F0E6D3] bg-[#FDF8F0]/60">
        <div className="w-7 h-7 rounded-lg bg-[#C9A24A]/15 flex items-center justify-center text-[#8A6B2B]">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-[#4A3F35]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function PatientSummaryPanel({ summary, loading = false }: PatientSummaryPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#C9A24A] animate-spin" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-10 text-[#B8A99A]">
        <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Ringkasan pasien tidak tersedia</p>
      </div>
    );
  }

  const { patient, visits, medical_records: records, history } = summary;

  return (
    <div className="space-y-4">
      {/* Patient identity */}
      <div className="bg-gradient-to-br from-[#C9A24A] to-[#B8943F] rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold shrink-0 ring-2 ring-white/40">
            {(patient.name || "P").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold truncate">{patient.name}</h3>
            <p className="text-xs text-white/80 truncate">{patient.email}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-white/90">
          {patient.whatsapp && (
            <p><span className="text-white/60">WA:</span> {patient.whatsapp}</p>
          )}
          {patient.gender && <p><span className="text-white/60">Gender:</span> {patient.gender}</p>}
          {patient.blood_type && <p><span className="text-white/60">Gol. Darah:</span> {patient.blood_type}</p>}
          {patient.birth_date && <p><span className="text-white/60">Lahir:</span> {patient.birth_date}</p>}
          {patient.job && <p><span className="text-white/60">Pekerjaan:</span> {patient.job}</p>}
          {patient.membership_level && (
            <p><span className="text-white/60">Member:</span> <span className="capitalize">{patient.membership_level}</span></p>
          )}
        </div>
        {patient.address && (
          <p className="mt-2 text-[11px] text-white/70">{patient.address}</p>
        )}
      </div>

      {/* Visits */}
      <SectionCard icon={<Stethoscope className="w-3.5 h-3.5" />} title="Riwayat Kunjungan">
        {visits.length === 0 ? (
          <p className="text-xs text-[#B8A99A] text-center py-2">Belum ada kunjungan</p>
        ) : (
          <ul className="space-y-2.5">
            {visits.map((visit) => (
              <li key={visit.id} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#4A3F35]">
                    {visit.visit_number || "Kunjungan"}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      visit.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {visit.status}
                  </span>
                </div>
                <p className="text-[#8A7B6B] mt-0.5">
                  {formatChatDate(visit.visit_date)}
                  {visit.doctor_name ? ` • ${visit.doctor_name}` : ""}
                </p>
                {visit.chief_complaint && (
                  <p className="text-[#8A7B6B] mt-0.5 line-clamp-2">{visit.chief_complaint}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Medical Records */}
      <SectionCard icon={<FileText className="w-3.5 h-3.5" />} title="Rekam Medis">
        {records.length === 0 ? (
          <p className="text-xs text-[#B8A99A] text-center py-2">Belum ada rekam medis</p>
        ) : (
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id} className="text-xs border border-[#F5F0E8] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#4A3F35]">
                    {record.record_number || "RM"}
                  </span>
                  <span className="text-[10px] text-[#8A7B6B]">
                    {record.doctor_name || ""}
                  </span>
                </div>
                {(record.diagnoses?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {record.diagnoses!.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-medium">
                        {d.name}
                      </span>
                    ))}
                  </div>
                )}
                {(record.procedures?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {record.procedures!.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-medium">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Consultation history */}
      <SectionCard icon={<History className="w-3.5 h-3.5" />} title="Riwayat Konsultasi">
        {history.length === 0 ? (
          <p className="text-xs text-[#B8A99A] text-center py-2">Belum ada konsultasi</p>
        ) : (
          <ul className="space-y-2.5">
            {history.map((item) => (
              <li key={item.id} className="text-xs flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[#4A3F35] truncate">{item.topic}</p>
                  <p className="text-[#8A7B6B]">{item.date}</p>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0",
                    item.status === "Selesai"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.status === "Dijadwalkan"
                        ? "bg-sky-50 text-sky-700"
                        : "bg-amber-50 text-amber-700"
                  )}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
