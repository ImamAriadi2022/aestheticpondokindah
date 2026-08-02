import { useState } from "react";
import { Link2, Plus, Trash2, Loader2, Pencil, ExternalLink, Check, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { MEETING_PROVIDERS } from "@/features/doctor/consultation/constants/consultation";
import type {
  ConsultationMeeting,
  MeetingInput,
  MeetingProvider,
} from "@/features/doctor/consultation/types/consultation";
import { formatMeetingDate, toDateTimeLocal } from "@/features/doctor/consultation/utils/format";

interface MeetingLinkPanelProps {
  meetings: ConsultationMeeting[];
  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;
  onAdd: (input: MeetingInput) => Promise<unknown>;
  onUpdate: (id: string, input: Partial<MeetingInput>) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function MeetingLinkPanel({
  meetings,
  loading = false,
  saving = false,
  disabled = false,
  onAdd,
  onUpdate,
  onDelete,
}: MeetingLinkPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [provider, setProvider] = useState<MeetingProvider>("custom");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const providerMeta = (value: MeetingProvider) =>
    MEETING_PROVIDERS.find((p) => p.value === value) ?? MEETING_PROVIDERS[3];

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setProvider("custom");
    setTitle("");
    setUrl("");
    setStartsAt("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (meeting: ConsultationMeeting) => {
    setEditingId(meeting.id);
    setProvider(meeting.provider);
    setTitle(meeting.title ?? "");
    setUrl(meeting.url);
    setStartsAt(toDateTimeLocal(meeting.startsAt));
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!url.trim()) return;
    const payload: MeetingInput = {
      provider,
      title: title.trim() || undefined,
      url: url.trim(),
      startsAt: startsAt || undefined,
    };
    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onAdd(payload);
    }
    resetForm();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#F0E6D3] bg-[#FDF8F0]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C9A24A]/15 flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-[#8A6B2B]" />
          </div>
          <h3 className="text-sm font-bold text-[#4A3F35]">Link Meeting</h3>
        </div>
        {!disabled && (
          <Button
            size="sm"
            variant="ghost"
            onClick={openCreate}
            className="text-[#8A6B2B] hover:bg-[#F5E6C8] h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-[#C9A24A] animate-spin" />
          </div>
        ) : meetings.length === 0 && !showForm ? (
          <p className="text-xs text-[#B8A99A] text-center py-4">
            Belum ada link meeting. Tambahkan link untuk konsultasi video.
          </p>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="rounded-xl border border-[#F0E6D3] p-3 hover:border-[#E8D4A2] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C9A24A]" />
                    <span className="text-xs font-bold text-[#4A3F35] capitalize">
                      {providerMeta(meeting.provider).label}
                    </span>
                  </div>
                  {meeting.title && (
                    <p className="text-xs text-[#8A7B6B] mt-0.5 truncate">{meeting.title}</p>
                  )}
                  <a
                    href={meeting.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#B8943F] hover:text-[#8A6B2B] truncate block mt-0.5 break-all"
                  >
                    {meeting.url}
                  </a>
                  <p className="text-[10px] text-[#B8A99A] mt-0.5">
                    {formatMeetingDate(meeting.startsAt)}
                  </p>
                </div>
                {!disabled && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(meeting)}
                      className="text-[#8A6B2B] hover:bg-[#F5E6C8]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        if (window.confirm("Hapus link meeting ini?")) onDelete(meeting.id);
                      }}
                      className="text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" asChild className="text-sky-600 hover:bg-sky-50">
                      <a href={meeting.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {showForm && (
          <div className="rounded-xl border border-[#C9A24A]/50 bg-[#FDF8F0] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3F35]">
                {editingId ? "Edit Link Meeting" : "Tambah Link Meeting"}
              </span>
              <Button variant="ghost" size="icon-xs" onClick={resetForm} className="text-[#8A7B6B]">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#8A7B6B] uppercase tracking-wide">
                Platform
              </label>
              <Select value={provider} onValueChange={(v) => setProvider(v as MeetingProvider)}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#8A7B6B] uppercase tracking-wide">
                Judul
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Konsultasi Veneer"
                className="bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#8A7B6B] uppercase tracking-wide">
                URL Meeting *
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={providerMeta(provider).placeholder}
                className="bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#8A7B6B] uppercase tracking-wide">
                Jadwal Mulai
              </label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="bg-white"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!url.trim() || saving}
              className="w-full h-9 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {editingId ? "Simpan Perubahan" : "Simpan Link"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
