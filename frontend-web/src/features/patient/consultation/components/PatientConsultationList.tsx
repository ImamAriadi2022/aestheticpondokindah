import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  MessageSquare,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import type { ConsultationItem } from "@/features/patient/consultation/services/consultationApi";
import { Button } from "@/shared/ui/button";

export default function PatientConsultationList({
  consultations,
}: {
  consultations: ConsultationItem[];
}) {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<"all" | "completed" | "active">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sorted = useMemo(() => {
    return [...consultations].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [consultations]);

  const activeConsultations = useMemo(() => {
    return sorted.filter((item) =>
      ["Menunggu", "Dijadwalkan", "Dibuka"].includes(item.status)
    );
  }, [sorted]);

  const completedConsultations = useMemo(() => {
    return sorted.filter(
      (item) => item.status === "Selesai" || item.status === "Ditolak"
    );
  }, [sorted]);

  const filteredItems = useMemo(() => {
    let list = sorted;
    if (filterTab === "active") list = activeConsultations;
    if (filterTab === "completed") list = completedConsultations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.topic?.toLowerCase().includes(q) ||
          c.chiefComplaint?.toLowerCase().includes(q) ||
          c.doctorName?.toLowerCase().includes(q) ||
          c.status?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sorted, filterTab, activeConsultations, completedConsultations, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterTab === "all"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#5C5546] hover:bg-[#F3EAD5]"
            }`}
          >
            Semua ({sorted.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === "completed"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#5C5546] hover:bg-[#F3EAD5]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Sudah Selesai ({completedConsultations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === "active"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#5C5546] hover:bg-[#F3EAD5]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Sedang Berjalan ({activeConsultations.length})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari riwayat keluhan..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C6B1C]"
          />
        </div>
      </div>

      {/* Consultation Cards List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#F0E6D3] p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mx-auto shadow-inner">
            <MessageCircle className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2C2416]">
              {filterTab === "completed"
                ? "Belum Ada Riwayat Konsultasi Selesai"
                : filterTab === "active"
                ? "Tidak Ada Konsultasi yang Sedang Berjalan"
                : "Belum Ada Percakapan Konsultasi"}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
              Konsultasikan keluhan gigi Anda langsung dengan tim dokter spesialis Aesthetic Pondok Indah kapan saja secara online.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=konsultasi&view=create")}
            className="h-10 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mulai Konsultasi Sekarang</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((consultation) => {
            const isFinished =
              consultation.status === "Selesai" ||
              consultation.status === "Ditolak";

            return (
              <div
                key={consultation.id}
                onClick={() =>
                  navigate(`/dashboard/user/consultation/${consultation.id}`)
                }
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E6D3] hover:border-[#8C6B1C] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group text-left"
              >
                <div>
                  {/* Card Header: Status & Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#F5EFE6] pb-2.5">
                    <StatusBadge status={consultation.status} />
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Calendar className="w-3 h-3 text-[#8C6B1C]" />
                      <span>{consultation.date || "Hari ini"}</span>
                    </div>
                  </div>

                  {/* Topic / Symptom */}
                  <div className="pt-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-colors line-clamp-1">
                      {consultation.topic || "Keluhan Pemeriksaan Gigi"}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                      {consultation.chiefComplaint ||
                        "Tidak ada deskripsi keluhan tambahan."}
                    </p>
                  </div>

                  {/* Doctor Info if assigned */}
                  {consultation.doctorName && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-[#F0E6D3] flex items-center gap-2 text-xs text-[#5C5546]">
                      <Stethoscope className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                      <span className="truncate">
                        Dokter: <strong>{consultation.doctorName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Action */}
                <div className="pt-2 border-t border-[#F5EFE6] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400">
                    ID: #{String(consultation.id).padStart(5, "0")}
                  </span>
                  <span className="font-bold text-[#8C6B1C] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{isFinished ? "Lihat Percakapan" : "Lanjutkan Chat"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
