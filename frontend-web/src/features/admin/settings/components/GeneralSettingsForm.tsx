import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Save } from "lucide-react";
import { toast } from "@/shared/ui/toast";

type Props = {
  settings?: any;
  onSave?: (data: any) => Promise<void>;
};

export default function GeneralSettingsForm({ settings, onSave }: Props) {
  const [formData, setFormData] = useState({
    clinicName: settings?.clinic_name || "Aesthetic Pondok Indah Dental Clinic",
    whatsappNumber: settings?.whatsapp_number || "628198974030",
    email: settings?.email || "info@aestheticpondokindah.com",
    address: settings?.address || "Pondok Indah, Jakarta Selatan",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      await onSave(formData);
    } else {
      toast({ title: "Tersimpan", message: "Pengaturan klinik diperbarui.", variant: "success" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#F0E6D3] p-6 space-y-5 shadow-xs">
      <h3 className="text-base font-bold text-[#4A3F35]">Pengaturan Umum Klinik</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#4A3F35]">Nama Klinik</label>
          <Input
            value={formData.clinicName}
            onChange={(e) => setFormData((p) => ({ ...p, clinicName: e.target.value }))}
            className="rounded-xl border-[#F0E6D3]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#4A3F35]">Nomor WhatsApp Klinik</label>
          <Input
            value={formData.whatsappNumber}
            onChange={(e) => setFormData((p) => ({ ...p, whatsappNumber: e.target.value }))}
            className="rounded-xl border-[#F0E6D3]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#4A3F35]">Email Resmi</label>
          <Input
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            className="rounded-xl border-[#F0E6D3]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#4A3F35]">Alamat Utama</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            className="rounded-xl border-[#F0E6D3]"
          />
        </div>
      </div>

      <Button type="submit" className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-xs font-semibold">
        <Save className="w-4 h-4 mr-2" />
        Simpan Pengaturan
      </Button>
    </form>
  );
}
