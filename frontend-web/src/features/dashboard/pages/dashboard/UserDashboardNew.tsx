import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { getSession, clearSession } from "@/features/auth/services/session";
import { clearSessionStorage } from "@/features/auth/services/sessionTtl";
import { getMyConsultations } from "@/features/consultation/services/consultationApi";
import { getMyComplaints } from "@/features/consultation/services/complaintApi";
import { getPublicDoctorSchedules } from "@/features/doctors/services/publicDoctorScheduleApi";
import { toast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import DesktopUserHome from "@/components/dashboard/DesktopUserHome";
import DesktopReservasi from "@/components/dashboard/DesktopReservasi";
import DesktopKonsultasi from "@/components/dashboard/DesktopKonsultasi";
import DesktopPengaduan from "@/components/dashboard/DesktopPengaduan";
import AccountSidebar from "@/components/dashboard/AccountSidebar";
import DashboardRightPanel from "@/components/dashboard/DashboardRightPanel";

// Import mobile pages
import MobileHome from "@/pages/mobile/MobileHome";
import MobileBookingPage from "@/pages/mobile/MobileBooking";
import MobileBookingDoctorPage from "@/pages/mobile/MobileBookingDoctor";
import MobileBookingSchedulePage from "@/pages/mobile/MobileBookingSchedule";
import MobileBookingConfirmPage from "@/pages/mobile/MobileBookingConfirm";
import MobileBookingSuccessPage from "@/pages/mobile/MobileBookingSuccess";
import MobileKonsultasiPage from "@/pages/mobile/MobileKonsultasi";
import MobileRiwayatPage from "@/pages/mobile/MobileRiwayat";
import MobileAkunPage from "@/pages/mobile/MobileAkun";

// Hook untuk detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function UserDashboardPage() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  // Ambil session
  const session = getSession();

  const [consultations, setConsultations] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [publicSchedules, setPublicSchedules] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "konsultasi" || activeTab === "dashboard" || activeTab === "riwayat") {
      getMyConsultations()
        .then((data) => setConsultations(data))
        .catch((err) => {
          logger.error("Gagal memuat konsultasi", err);
          toast({ title: "Gagal memuat", message: "Tidak bisa memuat riwayat konsultasi." });
        })
        .finally(() => {});
    }

    if (activeTab === "pengaduan" || activeTab === "dashboard") {
      getMyComplaints()
        .then((data) => setComplaints(data))
        .catch((err) => {
          logger.error("Gagal memuat pengaduan", err);
          toast({ title: "Gagal memuat", message: "Tidak bisa memuat riwayat pengaduan." });
        })
        .finally(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    getPublicDoctorSchedules()
      .then((items) => setPublicSchedules(items))
      .catch(() => {});
  }, []);

  // Semua pengguna terdaftar adalah member; navbar menunjukkan tier.
  const isMembership = true;
  const tierLabel =
    (session as any)?.membership_level === 'platinum'
      ? "Priority Member"
      : (session as any)?.membership_level === 'gold'
        ? "Premium Member"
        : "Basic Member";

  // Calculate progress
  const calculateProgress = () => {
    if (!session) return 0;
    const fields = [
      "name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo",
    ];
    const filledFields = fields.filter((field) => {
      const value = (session as any)[field] || (session as any)[field.replace(/([A-Z])/g, "_$1").toLowerCase()] ||
                    (session as any)[field === 'phone' ? 'whatsapp' : field] ||
                    (session as any)[field === 'bloodType' ? 'blood_type' : field] ||
                    (session as any)[field === 'address' ? 'address_line' : field];
      return !!value;
    });
    const interests = (session as any).interests || [];
    const interestScore = interests.length > 0 ? 1 : 0;
    return Math.round(((filledFields.length + interestScore) / (fields.length + 1)) * 100);
  };
  const progress = calculateProgress();

  // MOBILE VIEW
  if (isMobile) {
    // Render berdasarkan tab
    if (activeTab === "booking") {
      const step = searchParams.get("step") || "layanan";
      if (step === "dokter") return <MobileBookingDoctorPage />;
      if (step === "jadwal") return <MobileBookingSchedulePage />;
      if (step === "konfirmasi") return <MobileBookingConfirmPage />;
      if (step === "sukses") return <MobileBookingSuccessPage />;
      return <MobileBookingPage />;
    }
    if (activeTab === "konsultasi") {
      return <MobileKonsultasiPage />;
    }
    if (activeTab === "riwayat") {
      return <MobileRiwayatPage />;
    }
    if (activeTab === "akun" || activeTab === "profile") {
      return <MobileAkunPage />;
    }

    // Default: Dashboard Home
    return <MobileHome />;
  }

  // Helper function to render desktop content based on active tab
  const renderDesktopContent = () => {
    switch (activeTab) {
      case "reservasi":
      case "booking":
        return <DesktopReservasi />;
      case "konsultasi":
        return <DesktopKonsultasi />;
      case "pengaduan":
        return <DesktopPengaduan />;
      case "dashboard":
      default:
        return (
          <DesktopUserHome
            session={session}
            consultations={consultations}
            complaints={complaints}
            publicSchedules={publicSchedules}
            isMembership={isMembership}
            progress={progress}
          />
        );
    }
  };

  const shouldShowRightPanel = !["reservasi", "booking", "konsultasi"].includes(activeTab);

  // DESKTOP VIEW - With Sidebar Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start">
      {/* Left Sidebar - AccountSidebar for User */}
      <AccountSidebar userName={session?.name || "User"} onLogout={() => { clearSession(); clearSessionStorage(); window.location.href = "/login"; }} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 flex min-h-0 bg-gray-50/50">
          <main className="flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto">
            {renderDesktopContent()}
          </main>
          {/* Right Panel - Hide for certain tabs or adjust based on content */}
          {shouldShowRightPanel && (
            <DashboardRightPanel
              session={session}
              navbarLabel={tierLabel}
              role="user"
              consultationsCount={consultations.length}
              activeTreatmentsCount={consultations.filter((c) => c.status !== "Selesai").length}
              availableDoctorsCount={publicSchedules.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
