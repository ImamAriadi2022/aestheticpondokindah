import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import NewMobileDashboardLayout from "@/components/dashboard/NewMobileDashboardLayout";
import { Button } from "@/components/ui/button";
import { getSession, clearSession } from "@/lib/demoAuth";
import { clearSessionStorage } from "@/lib/sessionTtl";
import { 
  User,
  ChevronRight,
  Crown,
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
  MapPin,
  Bell,
  LogOut,
  Edit3,
  Phone,
  Mail,
  Award
} from "lucide-react";

const menuItems = [
  { icon: User, label: "Edit Profil", href: "/settings?tab=profile", color: "bg-blue-100 text-blue-600" },
  { icon: CreditCard, label: "Membership", href: "/membership", color: "bg-purple-100 text-purple-600" },
  { icon: Shield, label: "Keamanan Akun", href: "/security", color: "bg-green-100 text-green-600" },
  { icon: MapPin, label: "Alamat Saya", href: "/settings?tab=address", color: "bg-orange-100 text-orange-600" },
  { icon: Bell, label: "Notifikasi", href: "/settings?tab=notifications", color: "bg-pink-100 text-pink-600" },
  { icon: FileText, label: "Syarat & Ketentuan", href: "/terms-of-service", color: "bg-gray-100 text-gray-600" },
  { icon: HelpCircle, label: "Pusat Bantuan", href: "/help", color: "bg-teal-100 text-teal-600" },
];

export default function MobileAkunPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let s = getSession();
    const storedUser = localStorage.getItem("apident:user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        s = { ...(s || {}), ...parsed };
      } catch (e) {}
    }
    setSession(s);
  }, []);

  const isMembership =
    session?.membership_status === "active" ||
    session?.membershipStatus === "active";

  const handleLogout = () => {
    clearSession();
    clearSessionStorage();
    localStorage.removeItem("apident:token");
    localStorage.removeItem("apident:user");
    navigate("/login");
  };

  return (
    <NewMobileDashboardLayout role="user">
      <div className="space-y-4 pb-24">
        {/* Profile Card */}
        <div className="bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(session?.name || "U")[0].toUpperCase()}
              </div>
              <button 
                onClick={() => navigate("/settings?tab=profile")}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100"
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                {session?.name || "Pengguna"}
              </h1>
              <p className="text-sm text-gray-500 mb-2">
                {session?.email || session?.whatsapp || "email@contoh.com"}
              </p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isMembership 
                    ? "bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Crown className="w-3 h-3" />
                  {isMembership ? "Gold Member" : "Bronze Member"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">Booking</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">8</p>
              <p className="text-xs text-gray-500">Konsultasi</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500">Tahun</p>
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div className="px-4">
          <Link to="/membership">
            <div className={`relative overflow-hidden rounded-2xl p-4 ${
              isMembership 
                ? "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460]" 
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}>
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-[#c9a24a]" />
                    <span className="text-xs text-[#c9a24a] font-medium">
                      {isMembership ? "Gold Membership" : "Upgrade Membership"}
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-1">
                    {isMembership ? "Member Eksklusif" : "Jadilah Gold Member"}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {isMembership 
                      ? "Nikmati diskon 25% untuk semua layanan" 
                      : "Dapatkan diskon dan benefit menarik"}
                  </p>
                </div>
                <div className="w-14 h-14 bg-[#c9a24a]/20 rounded-full flex items-center justify-center">
                  <Crown className="w-7 h-7 text-[#c9a24a]" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Menu List */}
        <div className="px-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Pengaturan</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {menuItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-4 ${
                  index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
                } hover:bg-gray-50 transition-colors`}
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-900">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="px-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Info Kontak</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">WhatsApp</p>
                <p className="text-sm font-medium text-gray-900">
                  {session?.whatsapp || "+62 819-9011-4949"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {session?.email || "info@aestheticpondokindah.com"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App Version */}
        <div className="px-4 text-center">
          <p className="text-xs text-gray-400">Aesthetic Pondok Indah v2.0.0</p>
        </div>

        {/* Logout Button */}
        <div className="px-4">
          <Button
            variant="outline"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-14 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Keluar Akun
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Keluar Akun?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Anda perlu login kembali untuk mengakses akun Anda
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-12 rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl"
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </NewMobileDashboardLayout>
  );
}
