import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import { ArrowLeft, MessageSquareText, Clock, KeyRound, Trash2 } from "lucide-react";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import type { ConsultationStatus } from "@/shared/consultation/types/consultation";
import { useGuestSession } from "../services/GuestSessionContext";

export default function GuestHistoryPage() {
  const navigate = useNavigate();
  const { refs, removeRef } = useGuestSession();
  const [tokenInput, setTokenInput] = useState("");

  const resumeByToken = (token: string) => {
    const clean = token.trim();
    if (!clean) {
      toast({ title: "Kode Kosong", message: "Masukkan kode konsultasi Anda", variant: "error" });
      return;
    }
    navigate(`/konsultasi/guest/${clean}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F0] via-white to-[#F5E6C8]/40">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <button
          onClick={() => navigate("/konsultasi")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8A7B6B] hover:text-[#4A3F35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Konsultasi
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center shadow-lg shadow-[#C9A24A]/20 mb-4">
            <MessageSquareText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#4A3F35]">Lanjutkan Konsultasi</h1>
          <p className="mt-2 text-sm text-[#8A7B6B] max-w-md mx-auto">
            Konsultasi yang Anda mulai akan tersimpan di perangkat ini. Lanjutkan percakapan kapan saja.
          </p>
        </div>

        {/* Resume by token */}
        <div className="bg-white rounded-3xl border border-[#F0E6D3] shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-[#B8943F]" />
            <p className="text-sm font-bold text-[#4A3F35]">Punya Kode Konsultasi?</p>
          </div>
          <p className="text-xs text-[#8A7B6B] mb-3">
            Tempel kode konsultasi dari pesan WhatsApp / email untuk membuka percakapan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") resumeByToken(tokenInput);
              }}
              placeholder="Tempel kode konsultasi di sini..."
              className="flex-1 h-11 rounded-xl border-[#E8D4A2] bg-[#FDF8F0] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
            />
            <Button
              onClick={() => resumeByToken(tokenInput)}
              className="h-11 px-6 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl"
            >
              Buka
            </Button>
          </div>
        </div>

        {/* Saved list */}
        {refs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#F0E6D3] p-10 text-center shadow-sm">
            <MessageSquareText className="w-10 h-10 text-[#C9A24A]/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#4A3F35]">Belum Ada Konsultasi Tersimpan</p>
            <p className="text-xs text-[#8A7B6B] mt-1">Mulai konsultasi baru untuk melihat riwayat di sini.</p>
            <Button
              onClick={() => navigate("/konsultasi")}
              className="mt-5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white rounded-xl"
            >
              Mulai Konsultasi
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {refs.map((ref) => (
              <div
                key={ref.token}
                className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm p-4 flex items-center justify-between gap-3 hover:border-[#E8D4A2] transition-colors"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold shrink-0">
                    {(ref.name || "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#4A3F35] truncate">{ref.topic}</p>
                    <p className="text-[11px] text-[#8A7B6B] truncate flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ref.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {ref.phone ? ` • ${ref.phone}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={(ref.status as ConsultationStatus) || "Menunggu"} />
                  <Button
                    size="sm"
                    onClick={() => navigate(`/konsultasi/guest/${ref.token}`)}
                    className="h-9 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold"
                  >
                    Buka Chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRef(ref.token)}
                    className="text-[#B8A99A] hover:text-red-500 hover:bg-red-50"
                    title="Hapus dari daftar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
