import { CheckCircle2, ExternalLink, Phone, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { stripPhone } from "@/shared/consultation/utils/format";
import type { Consultation } from "@/shared/consultation/types/consultation";

interface QuickActionsProps {
  consultation: Consultation;
  phone?: string;
  busy?: boolean;
  onComplete: () => void;
  onJoinMeeting?: (url: string) => void;
}

export function QuickActions({
  consultation,
  phone,
  busy = false,
  onComplete,
  onJoinMeeting,
}: QuickActionsProps) {
  const isDone = consultation.status === "Selesai" || consultation.status === "Ditolak";
  const meetingUrl = consultation.meetings?.[0]?.url;
  const waNumber = stripPhone(phone);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isDone && (
        <Button
          size="sm"
          onClick={onComplete}
          disabled={busy}
          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Tandai Selesai
        </Button>
      )}

      {(onJoinMeeting || meetingUrl) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (onJoinMeeting) onJoinMeeting(meetingUrl || "");
          }}
          className="h-9 rounded-xl border-[#C9A24A]/60 text-[#8A6B2B] hover:bg-[#F5E6C8]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Buka Meeting
        </Button>
      )}

      {waNumber && (
        <Button
          size="sm"
          variant="outline"
          asChild
          className="h-9 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer">
            <Phone className="w-3.5 h-3.5" />
            Hubungi Pasien
          </a>
        </Button>
      )}
    </div>
  );
}
