import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { toast } from "@/react-app/components/ui/toast";
import { 
  AlertCircle,
  Send,
  ArrowLeft,
  Clock,
  Check,
  FileText,
  ChevronRight,
  Search,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  Calendar,
  CreditCard,
  User
} from "lucide-react";

const complaintCategories = [
  { id: "pelayanan", label: "Pelayanan", icon: User, color: "bg-blue-100 text-blue-600", description: "Keluhan tentang pelayanan staff" },
  { id: "fasilitas", label: "Fasilitas", icon: ShieldAlert, color: "bg-orange-100 text-orange-600", description: "Masalah dengan fasilitas klinik" },
  { id: "dokter", label: "Dokter", icon: Stethoscope, color: "bg-purple-100 text-purple-600", description: "Keluhan terkait dokter" },
  { id: "jadwal", label: "Jadwal", icon: Calendar, color: "bg-yellow-100 text-yellow-600", description: "Masalah dengan jadwal/booking" },
  { id: "pembayaran", label: "Pembayaran", icon: CreditCard, color: "bg-green-100 text-green-600", description: "Keluhan tentang pembayaran" },
  { id: "lainnya", label: "Lainnya", icon: MessageSquare, color: "bg-gray-100 text-gray-600", description: "Keluhan lainnya" },
];

const mockComplaints = [
  {
    id: "CMP-001",
    category: "pelayanan",
    title: "Waktu tunggu terlalu lama",
    description: "Saya menunggu hampir 2 jam untuk konsultasi padahal sudah booking",
    status: "resolved",
    date: "15 Mei 2026",
    response: "Mohon maaf atas ketidaknyamanannya. Kami akan memperbaiki sistem antrian.",
  },
  {
    id: "CMP-002",
    category: "jadwal",
    title: "Jadwal dokter berubah tiba-tiba",
    description: "Jadwal saya di reschedule tanpa pemberitahuan sebelumnya",
    status: "processing",
    date: "20 Mei 2026",
    response: null,
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Menunggu", color: "text-gray-600", bgColor: "bg-gray-100" },
  processing: { label: "Diproses", color: "text-[#B8943F]", bgColor: "bg-[#E8C547]/20" },
  resolved: { label: "Selesai", color: "text-green-700", bgColor: "bg-green-100" },
  rejected: { label: "Ditolak", color: "text-red-700", bgColor: "bg-red-100" },
};

export default function DesktopPengaduan() {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "form" | "success">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async () => {
    if (!selectedCategory || !title.trim() || !description.trim()) {
      toast({ 
        title: "Data Belum Lengkap", 
        message: "Silakan pilih kategori dan isi judul serta deskripsi pengaduan", 
        variant: "error" 
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setView("success");
  };

  const filteredComplaints = mockComplaints.filter(complaint => {
    if (!searchQuery) return true;
    return complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Success Screen
  if (view === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Pengaduan berhasil dikirim!
        </h1>
        <p className="text-base text-gray-500 text-center mb-8 max-w-md">
          Tim kami akan meninjau pengaduan Anda dan memberikan respons dalam waktu 1-2 hari kerja
        </p>
        
        <div className="w-full max-w-md bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c9a24a]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#c9a24a]" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">Estimasi Respon</p>
              <p className="text-sm text-gray-500">1-2 hari kerja</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => {
              setView("list");
              setSelectedCategory(null);
              setTitle("");
              setDescription("");
            }}
            className="h-12 px-6 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl"
          >
            Lihat Riwayat Pengaduan
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/user")}
            className="h-12 px-6 rounded-xl"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view === "form" && (
            <button
              onClick={() => setView("list")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pengaduan</h2>
            <p className="text-sm text-gray-500">
              {view === "list" ? "Lihat riwayat pengaduan atau buat pengaduan baru" : "Sampaikan keluhan atau masukan Anda"}
            </p>
          </div>
        </div>
        {view === "list" && (
          <Button
            onClick={() => setView("form")}
            className="h-11 px-5 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Buat Pengaduan
          </Button>
        )}
      </div>

      {view === "list" ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengaduan..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-[#c9a24a]">{mockComplaints.length}</p>
              <p className="text-sm text-gray-500">Total Pengaduan</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-[#B8943F]">
                {mockComplaints.filter(c => c.status === "processing").length}
              </p>
              <p className="text-sm text-gray-500">Diproses</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-green-600">
                {mockComplaints.filter(c => c.status === "resolved").length}
              </p>
              <p className="text-sm text-gray-500">Selesai</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-gray-400">
                {mockComplaints.filter(c => c.status === "pending").length}
              </p>
              <p className="text-sm text-gray-500">Menunggu</p>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Belum ada pengaduan</p>
                <p className="text-gray-500 text-sm mb-4">
                  Riwayat pengaduan Anda akan muncul di sini
                </p>
                <Button
                  onClick={() => setView("form")}
                  className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-xl"
                >
                  Buat Pengaduan Baru
                </Button>
              </div>
            ) : (
              filteredComplaints.map((complaint) => {
                const category = complaintCategories.find(c => c.id === complaint.category);
                const CategoryIcon = category?.icon || MessageSquare;
                const status = statusConfig[complaint.status];
                
                return (
                  <div
                    key={complaint.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${category?.color || "bg-gray-100"} rounded-xl flex items-center justify-center`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{category?.label || "Lainnya"}</p>
                          <h3 className="text-base font-semibold text-gray-900">{complaint.title}</h3>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {complaint.description}
                    </p>
                    
                    {/* Response if exists */}
                    {complaint.response && (
                      <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100">
                        <p className="text-xs text-green-700 font-medium mb-1">Respons dari Klinik:</p>
                        <p className="text-sm text-green-800">{complaint.response}</p>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{complaint.date}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{complaint.id}</span>
                      </div>
                      <button className="flex items-center gap-1 text-sm text-[#c9a24a] font-medium hover:underline">
                        Lihat Detail
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Form View */
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Kategori Pengaduan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {complaintCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-left ${
                        isSelected
                          ? "border-[#c9a24a] bg-[#c9a24a]/5"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-medium block ${isSelected ? "text-[#c9a24a]" : "text-gray-700"}`}>
                          {category.label}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1">{category.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Judul Pengaduan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Waktu tunggu terlalu lama"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail pengaduan Anda..."
                rows={6}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30 resize-none"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Informasi</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Pengaduan Anda akan ditinjau oleh tim kami. Kami berkomitmen untuk memberikan respons dalam 1-2 hari kerja.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setView("list")}
                className="flex-1 h-12 rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCategory || !title.trim() || !description.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Pengaduan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
