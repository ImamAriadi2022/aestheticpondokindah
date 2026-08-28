import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Loader2, Save, FileText, Shield } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import {
  getAdminLegal,
  updateAdminLegal,
  type ClinicLegalPolicy,
} from "../services/publicInfoAdminApi";

export default function LegalManagePage() {
  const [activeType, setActiveType] = useState<"privacy_policy" | "terms_of_service">("privacy_policy");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [legal, setLegal] = useState<ClinicLegalPolicy>({
    type: "privacy_policy",
    title: "",
    last_updated: "",
    content: "",
  });

  const fetchLegal = async (type: "privacy_policy" | "terms_of_service") => {
    setLoading(true);
    try {
      const data = await getAdminLegal(type);
      if (data) setLegal(data);
    } catch {
      toast({
        title: "Gagal Memuat",
        message: "Tidak dapat memuat dokumen legal.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegal(activeType);
  }, [activeType]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminLegal(activeType, legal);
      toast({ title: "Berhasil", message: "Dokumen legal berhasil diperbarui." });
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan dokumen.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Kebijakan & Ketentuan Legal</h1>
          <p className="text-sm text-brand-warm-gray">
            Kelola teks resmi Syarat & Ketentuan Layanan (*Terms of Service*) serta Kebijakan Privasi (*Privacy Policy*).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Button
          type="button"
          variant={activeType === "privacy_policy" ? "default" : "outline"}
          className={`rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
            activeType === "privacy_policy" ? "bg-[#C9A24A] hover:bg-[#B8943F] text-white" : ""
          }`}
          onClick={() => setActiveType("privacy_policy")}
        >
          <Shield className="w-3.5 h-3.5 mr-1.5" /> Kebijakan Privasi (Privacy Policy)
        </Button>
        <Button
          type="button"
          variant={activeType === "terms_of_service" ? "default" : "outline"}
          className={`rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
            activeType === "terms_of_service" ? "bg-[#C9A24A] hover:bg-[#B8943F] text-white" : ""
          }`}
          onClick={() => setActiveType("terms_of_service")}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" /> Syarat & Ketentuan (Terms of Service)
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-charcoal">
                {activeType === "privacy_policy" ? "Isi Kebijakan Privasi" : "Isi Syarat & Ketentuan"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Judul Dokumen</Label>
                  <Input
                    value={legal.title}
                    onChange={(e) => setLegal({ ...legal, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tanggal Terakhir Diperbarui</Label>
                  <Input
                    value={legal.last_updated}
                    onChange={(e) => setLegal({ ...legal, last_updated: e.target.value })}
                    placeholder="cth: 15 Agustus 2026"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Isi Teks Lengkap (Mendukung Format Paragraf & Poin)</Label>
                <Textarea
                  value={legal.content}
                  onChange={(e) => setLegal({ ...legal, content: e.target.value })}
                  rows={14}
                  className="font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-[#C9A24A] hover:bg-[#B8943F] text-white font-bold rounded-xl h-10 px-5 shadow-xs cursor-pointer justify-center"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Dokumen
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
