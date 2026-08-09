import { useEffect, useState } from "react";
import { CheckCircle2, ScrollText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

interface GuestBookingTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terms?: string;
  onConfirm: () => void;
}

const fallbackTerms = [
  "Reservasi ini bersifat permintaan dan akan dikonfirmasi oleh admin klinik.",
  "Harap datang 10 menit sebelum jadwal yang telah dikonfirmasi.",
  "Data pribadi Anda hanya digunakan untuk keperluan layanan medis klinik.",
].join("\n");

/** Shown only before a reservation is submitted by a guest. */
export default function GuestBookingTermsDialog({
  open,
  onOpenChange,
  terms,
  onConfirm,
}: GuestBookingTermsDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const items = (terms || fallbackTerms).split("\n").filter((item) => item.trim());

  useEffect(() => {
    if (open) setAccepted(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-lg rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c9a24a]/20 border border-[#c9a24a]/40 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-[#c9a24a]" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white">Syarat & Ketentuan Reservasi</DialogTitle>
              <p className="text-[11px] text-[#d4c5b0] mt-0.5">Baca dan setujui sebelum mengirim booking</p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[42vh] overflow-y-auto p-5">
          <ul className="space-y-3">
            {items.map((term, index) => (
              <li key={`${index}-${term}`} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 shrink-0 rounded-full bg-amber-100 border border-amber-300/60 text-[#c9a24a] text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{term.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-100 p-5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 h-5 w-5 accent-[#c9a24a]"
            />
            <span className="text-xs text-gray-700 leading-relaxed">
              Saya telah membaca dan menyetujui seluruh syarat dan ketentuan reservasi.
            </span>
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              type="button"
              disabled={!accepted}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white"
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Setuju & Kirim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
