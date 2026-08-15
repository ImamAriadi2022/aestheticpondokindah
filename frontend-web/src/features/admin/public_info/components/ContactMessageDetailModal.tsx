import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Loader2, Mail, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { type ContactMessageItem } from "../services/publicInfoAdminApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: ContactMessageItem | null;
  onUpdateStatus: (id: number | string, data: Partial<ContactMessageItem>) => Promise<void>;
}

export default function ContactMessageDetailModal({
  open,
  onOpenChange,
  message,
  onUpdateStatus,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ContactMessageItem["status"]>("unread");
  const [replyNotes, setReplyNotes] = useState("");

  useEffect(() => {
    if (message) {
      setStatus(message.status || "read");
      setReplyNotes(message.reply_notes || "");
    }
  }, [message, open]);

  const handleSave = async () => {
    if (!message) return;
    setLoading(true);
    try {
      await onUpdateStatus(message.id, {
        status,
        reply_notes: replyNotes,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!message) return null;

  const waNumber = message.phone ? message.phone.replace(/\D/g, "") : "";
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.startsWith("0") ? "62" + waNumber.slice(1) : waNumber}?text=${encodeURIComponent(`Halo ${message.name}, kami dari Aesthetic Pondok Indah Dental Clinic menanggapi pesan Anda.`)}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-charcoal">
            Detail Pesan Masuk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground">Pengirim</p>
              <p className="font-semibold text-brand-charcoal">{message.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Waktu Masuk</p>
              <p className="font-medium">{message.created_at ? new Date(message.created_at).toLocaleString("id-ID") : "-"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-gold" />
              <a href={`mailto:${message.email}`} className="text-brand-gold hover:underline">
                {message.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>{message.phone || "Tidak ada nomor"}</span>
            </div>
          </div>

          {message.subject && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Subjek</p>
              <p className="font-medium text-brand-charcoal">{message.subject}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Isi Pesan</p>
            <div className="p-3 bg-background border rounded-xl whitespace-pre-wrap leading-relaxed text-brand-charcoal">
              {message.message}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noreferrer">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-1.5" /> Balas via WhatsApp
                </Button>
              </a>
            )}
            <a href={`mailto:${message.email}?subject=${encodeURIComponent("Balasan Pesan: " + (message.subject || "Aesthetic Pondok Indah"))}`}>
              <Button size="sm" variant="outline">
                <Mail className="w-4 h-4 mr-1.5" /> Balas via Email <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </a>
          </div>

          {/* Follow-up Note & Status Update */}
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status Tindak Lanjut</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
              >
                <option value="unread">Belum Dibaca (Unread)</option>
                <option value="read">Sudah Dibaca (Read)</option>
                <option value="replied">Sudah Dibalas (Replied)</option>
                <option value="archived">Diarsipkan (Archived)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Catatan Internal / Riwayat Balasan</Label>
              <Textarea
                value={replyNotes}
                onChange={(e) => setReplyNotes(e.target.value)}
                placeholder="Tuliskan catatan tindak lanjut staff admin..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Tutup
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="bg-brand-gold hover:opacity-90 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
