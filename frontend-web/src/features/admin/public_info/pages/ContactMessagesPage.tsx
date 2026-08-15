import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Search,
  Mail,
  Trash2,
  Eye,
  Loader2,
  Phone,
  MessageCircle,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import {
  getAdminContactMessages,
  updateAdminContactMessage,
  deleteAdminContactMessage,
  type ContactMessageItem,
} from "../services/publicInfoAdminApi";
import ContactMessageDetailModal from "../components/ContactMessageDetailModal";

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getAdminContactMessages(statusFilter, search);
      setMessages(data || []);
    } catch {
      toast({
        title: "Gagal Memuat",
        message: "Tidak dapat memuat pesan kontak masuk.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id: number | string, data: Partial<ContactMessageItem>) => {
    try {
      await updateAdminContactMessage(id, data);
      toast({ title: "Berhasil", message: "Status pesan berhasil diperbarui." });
      fetchMessages();
    } catch {
      toast({
        title: "Gagal Memperbarui",
        message: "Terjadi kesalahan saat memperbarui status pesan.",
        variant: "error",
      });
      throw new Error();
    }
  };

  const handleDelete = async (id: number | string, name: string) => {
    if (!confirm(`Hapus pesan dari "${name}"?`)) return;
    try {
      await deleteAdminContactMessage(id);
      toast({ title: "Berhasil", message: "Pesan berhasil dihapus." });
      fetchMessages();
    } catch {
      toast({
        title: "Gagal Menghapus",
        message: "Tidak dapat menghapus pesan.",
        variant: "error",
      });
    }
  };

  const getStatusBadge = (status: ContactMessageItem["status"]) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Belum Dibaca</Badge>;
      case "read":
        return <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Sudah Dibaca</Badge>;
      case "replied":
        return <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">Sudah Dibalas</Badge>;
      case "archived":
        return <Badge variant="secondary">Diarsipkan</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-charcoal">Pesan Kontak Masuk</h1>
        <p className="text-sm text-brand-warm-gray">
          Daftar pesan dan pertanyaan yang dikirimkan oleh pasien & pengunjung melalui formulir Kontak Kami.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "unread", "read", "replied", "archived"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              className={`rounded-xl text-xs font-semibold ${
                statusFilter === st ? "bg-brand-gold text-white" : ""
              }`}
              onClick={() => setStatusFilter(st)}
            >
              {st === "all" ? "Semua Status" : st === "unread" ? "Belum Dibaca" : st === "read" ? "Sudah Dibaca" : st === "replied" ? "Sudah Dibalas" : "Diarsipkan"}
            </Button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengirim / isi pesan..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Tidak ada pesan masuk pada filter ini.
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`rounded-2xl border-border transition-all ${
                msg.status === "unread" ? "bg-amber-50/20 border-amber-200/80 shadow-xs" : "bg-card"
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-brand-charcoal">{msg.name}</span>
                      {getStatusBadge(msg.status)}
                      <span className="text-xs text-muted-foreground">
                        {msg.created_at ? new Date(msg.created_at).toLocaleString("id-ID") : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-brand-warm-gray">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-brand-gold" /> {msg.email}
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-brand-gold" /> {msg.phone}
                        </span>
                      )}
                    </div>

                    {msg.subject && (
                      <p className="text-xs font-semibold text-brand-charcoal pt-0.5">
                        {msg.subject}
                      </p>
                    )}

                    <p className="text-xs text-brand-warm-gray line-clamp-2 leading-relaxed pt-0.5">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setSelectedMessage(msg);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Buka & Balas
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(msg.id, msg.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail & Reply Modal */}
      <ContactMessageDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        message={selectedMessage}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
