import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/core/utils/utils";
import type { ConsultationMessage } from "@/shared/consultation/types/consultation";
import { formatChatDate, formatChatTime } from "@/shared/consultation/utils/format";

interface ChatWindowProps {
  messages: ConsultationMessage[];
  loading?: boolean;
  disabled?: boolean;
  currentRole?: string;
  onSend: (body: string) => Promise<void> | void;
  quickReplies?: string[];
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function ChatWindow({
  messages,
  loading = false,
  disabled = false,
  currentRole = "doctor",
  onSend,
  quickReplies = [],
  emptyStateTitle = "Belum ada pesan",
  emptyStateDescription = "Mulai percakapan dengan pasien di ruang chat ini.",
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || disabled) return;
    setDraft("");
    await onSend(text);
  };

  const isMine = (message: ConsultationMessage) => message.senderRole === currentRole;

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0E6D3] bg-[#FDF8F0]/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#4A3F35]">Ruang Chat Konsultasi</h3>
            <p className="text-xs text-[#8A7B6B] truncate">
              Pesan terkirim secara langsung ke tim klinik
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#FAF8F5]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#C9A24A] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-full bg-[#F5E6C8]/60 flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-[#C9A24A]" />
            </div>
            <p className="text-sm font-semibold text-[#4A3F35]">{emptyStateTitle}</p>
            <p className="text-xs text-[#B8A99A] mt-1 max-w-xs">{emptyStateDescription}</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const mine = isMine(message);
            const previous = messages[index - 1];
            const showDate =
              !previous || formatChatDate(previous.createdAt) !== formatChatDate(message.createdAt);
            const showSender =
              !mine && (!previous || previous.senderRole !== message.senderRole);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex items-center justify-center py-2">
                    <span className="px-3 py-1 text-[10px] font-semibold text-[#8A7B6B] bg-white border border-[#F0E6D3] rounded-full">
                      {formatChatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[78%] flex flex-col", mine ? "items-end" : "items-start")}>
                    {showSender && !mine && (
                      <span className="text-[10px] font-semibold text-[#C9A24A] mb-1 px-1">
                        {message.senderName || "Pasien"}
                      </span>
                    )}
                    <div
                      className={cn(
                        "px-4 py-2.5 text-sm leading-relaxed rounded-2xl shadow-sm whitespace-pre-wrap break-words",
                        mine
                          ? "bg-gradient-to-br from-[#C9A24A] to-[#B8943F] text-white rounded-br-md"
                          : "bg-white border border-[#F0E6D3] text-[#4A3F35] rounded-bl-md"
                      )}
                    >
                      {message.body}
                    </div>
                    <span className="text-[10px] text-[#B8A99A] mt-1 px-1">
                      {formatChatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && !disabled && (
        <div className="px-5 pt-3 pb-1 flex flex-wrap gap-2 border-t border-[#F5F0E8] bg-white">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => setDraft(reply)}
              className="px-3 py-1.5 text-xs font-medium text-[#8A6B2B] bg-[#FDF6E9] border border-[#E8D4A2] rounded-full hover:bg-[#F5E6C8] transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-[#F5F0E8]">
        {disabled ? (
          <div className="px-4 py-3 text-center text-xs text-[#B8A99A] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E0D6C4]">
            Konsultasi telah selesai — chat terkunci.
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tulis pesan..."
              rows={1}
              className="min-h-[44px] max-h-32 bg-[#FAF8F5] border-[#E0D6C4] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
            />
            <Button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
