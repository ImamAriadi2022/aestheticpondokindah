import { useState } from "react";
import BranchTable from "../components/BranchTable";
import { PageHeader } from "@/shared/ui/PageHeader";

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
    <div className="mobile-branches-page space-y-5">
      <PageHeader title="Daftar Cabang Klinik" />

      <BranchTable branches={branches} onEdit={handleEdit} />
    </div>
  );
}
