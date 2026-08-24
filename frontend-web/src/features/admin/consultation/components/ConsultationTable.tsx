import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { MessageSquare, Check, Clock, AlertCircle } from "lucide-react";

type Props = {
  consultations: any[];
  onSelect: (id: string) => void;
};

export default function ConsultationTable({ consultations, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5] border-b border-[#E8DFC8]">
            <TableHead className="font-bold text-[#2C2416] text-xs">Kode / Pasien</TableHead>
            <TableHead className="font-bold text-[#2C2416] text-xs">Keluhan Utama & Gejala</TableHead>
            <TableHead className="font-bold text-[#2C2416] text-xs">Status</TableHead>
            <TableHead className="font-bold text-[#2C2416] text-xs text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-xs text-[#8C8272]">
                <MessageSquare className="w-8 h-8 text-[#C9A24A]/40 mx-auto mb-2 stroke-1" />
                Tidak ada data konsultasi yang sesuai filter.
              </TableCell>
            </TableRow>
          ) : (
            consultations.map((item) => {
              const status = item.status || "Menunggu";
              const isWaiting = status === "Menunggu";
              const isOpened = status === "Dibuka";
              const isClosed = status === "Selesai" || status === "Ditolak";

              return (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors border-b border-[#F0EAE1]">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-[#FAF5EA] border border-[#EADBBD] text-[10px] font-mono font-bold text-[#8C6B1C]">
                        #{item.code || item.id}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#2C2416]">{item.participantName || item.patientName || item.user?.name || "Pasien"}</p>
                        <p className="text-[10px] text-[#8C8272]">{item.date || "-"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-xs font-semibold text-[#4A3F35]">
                        {item.topic || item.category || "Konsultasi Gigi"}
                        {item.painScale !== undefined && item.painScale !== null && (
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                            Nyeri: {item.painScale}/10
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#8C8272] line-clamp-1 mt-0.5">
                        {item.chiefComplaint || item.complaintText || item.notes || "Tidak ada detail tambahan"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {isWaiting && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 mr-1 text-amber-600" />
                        Menunggu
                      </span>
                    )}
                    {isOpened && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                        Dibuka
                      </span>
                    )}
                    {isClosed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        <Check className="w-3 h-3 mr-0.5 text-gray-500" />
                        Selesai
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      size="sm"
                      onClick={() => onSelect(String(item.id))}
                      className={`h-8 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isWaiting
                          ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white shadow-2xs"
                          : isOpened
                          ? "bg-[#FAF5EA] hover:bg-[#F3EAD8] text-[#8C6B1C] border border-[#EADBBD]"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      {isWaiting ? "Buka Chat" : isOpened ? "Buka Chat Aktif" : "Lihat Riwayat"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
