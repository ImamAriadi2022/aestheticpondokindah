import { useState } from "react";
import UserTable from "../components/UserTable";
import UserDetailModal from "../components/UserDetailModal";

type Props = {
  users: any[];
  onSelectUser?: (user: any) => void;
  onRefresh?: () => void;
};

export default function UsersPage({ users, onSelectUser, onRefresh }: Props) {
  const [selected, setSelected] = useState<any | null>(null);

  const handleSelect = (user: any) => {
    setSelected(user);
    if (onSelectUser) onSelectUser(user);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Pengguna / Pasien Klinik</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Kelola data pasien terdaftar, peran pengguna, dan level membership tier.</p>
      </div>

      <UserTable users={users} onSelect={handleSelect} />

      <UserDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        user={selected}
        onUpdated={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
