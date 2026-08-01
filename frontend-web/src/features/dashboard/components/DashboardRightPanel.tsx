import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ChevronRight,
  Edit3,
  Award,
  Star,
  Sparkles,
} from "lucide-react";
import { API_BASE } from "@/shared/lib/apiConfig";

interface RightPanelProps {
  session: any;
  navbarLabel: string;
  role: "user" | "clinic" | "doctor";
  recentActivity?: { title: string; subtitle: string; time: string; icon?: React.ElementType }[];
  consultationsCount?: number;
  activeTreatmentsCount?: number;
  availableDoctorsCount?: number;
}

export default function DashboardRightPanel({
  session,
  navbarLabel,
  role,
}: RightPanelProps) {
  void navbarLabel;

  const [liveData, setLiveData] = useState<any>(null);

  const getCleanAvatar = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return "";
    if (avatarUrl.includes("storage/data:image")) {
      return avatarUrl.substring(avatarUrl.indexOf("data:image"));
    }
    return avatarUrl;
  };

  useEffect(() => {
    const token = localStorage.getItem("apident:token");
    if (!token) return;

    fetch(`${API_BASE}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLiveData(data);
      })
      .catch(() => {});
  }, []);

  const name = liveData?.name || session?.name || "Pengguna";
  const avatar = getCleanAvatar(liveData?.avatar || (session as any)?.avatar);
  const membershipLevel = (liveData?.membership_level || (session as any)?.membership_level || "bronze").toLowerCase();
  const membershipPoints = liveData?.membership_points ?? (session as any)?.membership_points ?? 0;

  // Calculate profile completion percentage dynamically
  const calculateCompletion = () => {
    const fields = [
      liveData?.name || session?.name,
      liveData?.email || session?.email,
      liveData?.phone || liveData?.whatsapp || (session as any)?.whatsapp || session?.phone,
      liveData?.gender || (session as any)?.gender,
      liveData?.birthDate || (session as any)?.birthDate,
      liveData?.bloodType || (session as any)?.blood_type,
      liveData?.job || (session as any)?.job,
      liveData?.address || (session as any)?.address_line,
      liveData?.province || (session as any)?.province,
      liveData?.city || (session as any)?.city,
    ];
    const filled = fields.filter((f) => f && f !== "-" && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  const getMembershipDetails = (level: string) => {
    switch (level) {
      case "diamond":
        return {
          title: "DIAMOND MEMBER",
          discount: "40%",
          priority: "VIP Fast Track",
          gradient: "from-[#0EA5E9] to-[#0369A1]",
        };
      case "platinum":
        return {
          title: "PLATINUM MEMBER",
          discount: "30%",
          priority: "Prioritas Utama",
          gradient: "from-[#64748B] to-[#334155]",
        };
      case "gold":
        return {
          title: "GOLD MEMBER",
          discount: "20%",
          priority: "Tinggi",
          gradient: "from-[#D4AF37] to-[#AA7C11]",
        };
      default:
        return {
          title: "BRONZE MEMBER",
          discount: "10%",
          priority: "Standar",
          gradient: "from-[#C9A24A] to-[#B8943F]",
        };
    }
  };

  const memberInfo = getMembershipDetails(membershipLevel);

  if (role === "user") {
    return (
      <aside className="w-[320px] min-w-[320px] bg-white p-4 pl-3 hidden lg:flex flex-col gap-5 overflow-y-auto">
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-[#3D3428] to-[#2A241C] rounded-2xl p-5 text-white shadow-lg">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-4">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-[#E8C547]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8C547] to-[#C9A24A] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {name[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-base truncate max-w-[170px]">{name}</h3>
              <span className="text-xs font-semibold text-[#E8C547] capitalize">{membershipLevel} Member</span>
            </div>
          </div>
          
          {/* Progress Kelengkapan Profil */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Progress Kelengkapan Profil</span>
              <span className="font-bold text-[#E8C547]">{completionPercent}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8C547] to-[#C9A24A] rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          
          {/* Edit Profil Button */}
          <Link to="/profile/edit">
            <button className="w-full py-3 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 group shadow-md cursor-pointer">
              <Edit3 className="w-4 h-4" />
              Edit Profil
            </button>
          </Link>
        </div>

        {/* Membership Card Connected to API */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#5C4A32] font-bold flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-[#C9A24A]" />
              Membership
            </h4>
            <Link to="/membership" className="text-xs font-semibold text-[#8B7355] hover:text-[#C9A24A] flex items-center gap-1 transition-colors">
              Detail
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className={`bg-gradient-to-br ${memberInfo.gradient} rounded-2xl p-5 text-white shadow-md`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/80 mb-1">Level Membership</p>
                <p className="text-lg font-bold text-white tracking-wide">{memberInfo.title}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Diskon perawatan</span>
                <span className="font-semibold text-white">{memberInfo.discount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Prioritas booking</span>
                <span className="font-semibold text-white">{memberInfo.priority}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Total Poin</span>
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {membershipPoints.toLocaleString("id-ID")} Pts
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <span className="text-xs text-white/80">Status Keanggotaan</span>
              <span className="text-xs font-bold text-white">Aktif</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
