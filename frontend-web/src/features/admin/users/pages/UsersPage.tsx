import { useState } from "react";
import UserTable from "../components/UserTable";

type Props = {
  users: any[];
  onSelectUser?: (user: any) => void;
};

export default function UsersPage({ users, onSelectUser }: Props) {
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
    </div>
  );
}
