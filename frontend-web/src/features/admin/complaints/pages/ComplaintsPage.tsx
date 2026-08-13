import { useState } from "react";
import ComplaintTable from "../components/ComplaintTable";

type Props = {
  complaints: any[];
  onSelectComplaint?: (complaint: any) => void;
};

export default function ComplaintsPage({ complaints, onSelectComplaint }: Props) {
  const [selected, setSelected] = useState<any | null>(null);

  const handleSelect = (item: any) => {
    setSelected(item);
    if (onSelectComplaint) onSelectComplaint(item);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Pengaduan Pasien</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Daftar laporan masukan, komplain, dan tanggapan admin untuk meningkatkan kualitas layanan klinik.</p>
      </div>

      <ComplaintTable complaints={complaints} onSelect={handleSelect} />
    </div>
  );
}
