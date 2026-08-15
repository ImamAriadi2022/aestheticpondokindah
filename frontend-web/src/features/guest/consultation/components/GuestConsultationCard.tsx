import { Clock, MessageSquareText, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import type { GuestConsultationRef } from "../services/GuestSessionContext";
import type { ConsultationStatus } from "@/shared/consultation/types/consultation";

interface GuestConsultationCardProps {
  item: GuestConsultationRef;
  onResume: (token: string) => void;
  onRemove: (token: string) => void;
}

export function GuestConsultationCard({ item, onResume, onRemove }: GuestConsultationCardProps) {
  return (
    <div className="bg-white border border-[#F0E6D3] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={(item.status as ConsultationStatus) || "Menunggu"} />
          <span className="text-xs text-[#8A7B6B] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <h4 className="text-base font-bold text-[#4A3F35]">{item.topic || "Konsultasi Gigi"}</h4>
        <p className="text-xs text-[#8A7B6B]">
          Pasien: <span className="font-semibold text-[#4A3F35]">{item.name}</span> ({item.phone})
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onResume(item.token)}
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-xs font-bold"
        >
          <MessageSquareText className="w-3.5 h-3.5 mr-1" />
          Buka Chat
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRemove(item.token)}
          className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs"
        >
          Hapus
        </Button>
      </div>
    </div>
  );
}
