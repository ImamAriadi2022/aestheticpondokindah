import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import NewMobileDashboardLayout from "@/components/dashboard/NewMobileDashboardLayout";
import { Button } from "@/components/ui/button";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { mobileSyncManager } from "@/features/mobile/services/mobileSyncManager";
import { 
  CalendarDays,
  Clock,
  Stethoscope,
  ChevronRight,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock4,
  AlertCircle,
  FileText
} from "lucide-react";

const tabs = [
  { id: "all", label: "Semua" },
  { id: "upcoming", label: "Mendatang" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

const mockBookings = [
  {
    id: "BK-060526-001",
    service: "Scaling / Pembersihan Karang Gigi",
    doctor: "drg. Jenny Wilson",
    date: "Senin, 5 Mei 2026",
    time: "10:00 - 11:00",
    status: "upcoming",
    price: "Rp 300.000",
  },
  {
    id: "BK-042812-003",
    service: "Konsultasi & Pemeriksaan",
    doctor: "drg. Alana Rusner",
    date: "Senin, 28 Apr 2026",
    time: "14:00 - 15:00",
    status: "completed",
    price: "Rp 150.000",
  },
  {
    id: "BK-041505-002",
    service: "Tambal Gigi",
    doctor: "drg. Arvin Primera",
    date: "Selasa, 15 Apr 2026",
    time: "09:30 - 10:30",
    status: "completed",
    price: "Rp 250.000",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  upcoming: { label: "Akan Datang", color: "bg-blue-100 text-blue-700", icon: Clock4 },
  completed: { label: "Selesai", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function MobileRiwayatPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mobileSyncManager.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const filteredBookings = mockBookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  }).filter(booking => {
    if (!searchQuery) return true;
    return booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
           booking.doctor.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <NewMobileDashboardLayout role="user">
      <PullToRefresh onRefresh={async () => { mobileSyncManager.syncAll(true); }}>
      {/* Search Header */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari riwayat booking..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
            />
          </div>
          <button className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#c9a24a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-2xl font-bold text-[#c9a24a]">{mockBookings.length}</p>
            <p className="text-xs text-gray-500">Total Booking</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">
              {mockBookings.filter(b => b.status === "upcoming").length}
            </p>
            <p className="text-xs text-gray-500">Mendatang</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">
              {mockBookings.filter(b => b.status === "completed").length}
            </p>
            <p className="text-xs text-gray-500">Selesai</p>
          </div>
        </div>

        {/* Booking List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Memuat riwayat...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">Belum ada riwayat</p>
              <p className="text-gray-500 text-sm mb-4">
                Riwayat booking Anda akan muncul di sini
              </p>
              <Button
                onClick={() => navigate("/m/booking")}
                className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-xl"
              >
                Booking Sekarang
              </Button>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const status = statusConfig[booking.status];
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={booking.id}
                  onClick={() => {
                    navigate(`/dashboard/user?tab=booking&step=sukses&code=${encodeURIComponent(booking.id)}&serviceName=${encodeURIComponent(booking.service)}&doctorName=${encodeURIComponent(booking.doctor)}&dateText=${encodeURIComponent(booking.date)}&timeText=${encodeURIComponent(booking.time)}`);
                  }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{booking.id}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {booking.service}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{booking.doctor}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-[#c9a24a]">
                      {booking.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/user?tab=booking&step=sukses&code=${encodeURIComponent(booking.id)}&serviceName=${encodeURIComponent(booking.service)}&doctorName=${encodeURIComponent(booking.doctor)}&dateText=${encodeURIComponent(booking.date)}&timeText=${encodeURIComponent(booking.time)}`);
                      }}
                      className="flex items-center gap-1 text-xs text-[#c9a24a] font-medium"
                    >
                      Lihat Detail
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {filteredBookings.length > 0 && (
          <button className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Muat lebih banyak
          </button>
        )}
      </div>
      </PullToRefresh>
    </NewMobileDashboardLayout>
  );
}
