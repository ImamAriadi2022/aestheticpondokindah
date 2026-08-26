import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import UserTable from "../components/UserTable";
import UserDetailModal from "../components/UserDetailModal";

type Props = {
  users: any[];
  onSelectUser?: (user: any) => void;
  onRefresh?: () => void;
};

export default function UsersPage({ users, onSelectUser, onRefresh }: Props) {
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const handleSelect = (user: any) => {
    setSelected(user);
    if (onSelectUser) onSelectUser(user);
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter((u) => (u.name || "").toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Pengguna / Pasien Klinik</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola data pasien terdaftar, peran pengguna, dan level membership tier.</p>
        </div>

        {/* Search by User Name */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#8A7B6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pengguna..."
            className="w-full pl-9 pr-9 py-2 bg-white border border-[#F0E6D3] rounded-xl text-xs text-[#4A3F35] placeholder:text-[#8A7B6B]/70 focus:outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <UserTable users={filteredUsers} onSelect={handleSelect} isSearching={Boolean(search.trim())} />

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
