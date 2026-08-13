import DoctorTable from "../components/DoctorTable";

type Props = {
  doctors: any[];
  onEditDoctor?: (doc: any) => void;
};

export default function DoctorsPage({ doctors, onEditDoctor }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Manajemen Dokter Spesialis</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Daftar dokter gigi dan spesialis estetika klinik yang terdaftar di sistem.</p>
      </div>

      <DoctorTable doctors={doctors} onEdit={onEditDoctor || (() => {})} />
    </div>
  );
}
