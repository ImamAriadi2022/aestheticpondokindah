import { useState } from "react";
import ReservationTable from "../components/ReservationTable";

type Props = {
  reservations: any[];
  onSelectReservation?: (item: any) => void;
};

export default function ReservationPage({ reservations, onSelectReservation }: Props) {
  const [selected, setSelected] = useState<any | null>(null);

  const handleSelect = (item: any) => {
    setSelected(item);
    if (onSelectReservation) onSelectReservation(item);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Reservasi Janji Temu Pasien</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Kelola dan jadwalkan kunjungan perawatan pasien di klinik cabang Aesthetic Pondok Indah.</p>
      </div>

      <ReservationTable reservations={reservations} onSelect={handleSelect} />
    </div>
  );
}
