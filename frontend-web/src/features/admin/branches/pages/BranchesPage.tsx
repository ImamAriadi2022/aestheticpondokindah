import { useState } from "react";
import BranchTable from "../components/BranchTable";

type Props = {
  branches: any[];
  onEditBranch?: (branch: any) => void;
};

export default function BranchesPage({ branches, onEditBranch }: Props) {
  const [selected, setSelected] = useState<any | null>(null);

  const handleEdit = (branch: any) => {
    setSelected(branch);
    if (onEditBranch) onEditBranch(branch);
  };

  return (
    <div className="mobile-branches-page space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Cabang Klinik</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Kelola data lokasi cabang, alamat, kontak WhatsApp, dan jam operasional klinik.</p>
      </div>

      <BranchTable branches={branches} onEdit={handleEdit} />
    </div>
  );
}
