import { useState } from "react";
import ConsultationTable from "../components/ConsultationTable";

type Props = {
  consultations: any[];
  onSelectConsultation?: (id: string) => void;
};

export default function ConsultationPage({ consultations, onSelectConsultation }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelectConsultation) onSelectConsultation(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Konsultasi Pasien</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Kelola sesi chat konsultasi medis online antara pasien dan tim dokter klinik.</p>
      </div>

      <ConsultationTable consultations={consultations} onSelect={handleSelect} />
    </div>
  );
}
