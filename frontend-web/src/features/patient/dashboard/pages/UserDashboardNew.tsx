import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getSession, clearSession } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
import { getMyConsultations } from "@/features/patient/consultation/services/consultationApi";
import { getCachedConsultationList, setCachedConsultationList } from "@/features/patient/consultation/services/consultationCache";
import { getMyComplaints } from "@/features/patient/consultation/services/complaintApi";
import { getPublicDoctorSchedules } from "@/features/guest/doctors/services/publicDoctorScheduleApi";
import { toast } from "@/shared/ui/toast";
import { logger } from "@/core/utils/logger";
import DesktopUserHome from "@/features/patient/dashboard/components/DesktopUserHome";
import DesktopReservasi from "@/features/patient/reservation/components/DesktopReservasi";
import DesktopKonsultasi from "@/features/patient/consultation/components/DesktopKonsultasi";
import PatientConsultationList from "@/features/patient/consultation/components/PatientConsultationList";
import DesktopPengaduan from "@/features/patient/complaint/components/DesktopPengaduan";
import DesktopUserPromo from "@/features/patient/dashboard/components/DesktopUserPromo";
import DesktopUserBlog from "@/features/patient/dashboard/components/DesktopUserBlog";
import DesktopUserBlogDetail from "@/features/patient/dashboard/components/DesktopUserBlogDetail";
import DesktopUserDownload from "@/features/patient/dashboard/components/DesktopUserDownload";
import DesktopUserAkun from "@/features/patient/dashboard/components/DesktopUserAkun";
import AccountSidebar from "@/core/layouts/AccountSidebar";
import DashboardTopBar from "@/core/layouts/DashboardTopBar";
import DashboardRightPanel from "@/core/layouts/DashboardRightPanel";
import NewMobileDashboardLayout from "@/core/layouts/NewMobileDashboardLayout";

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
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";
  const consultationView = searchParams.get("view") === "list" ? "list" : "create";

  // Ambil session
  const session = getSession();

  const [consultations, setConsultations] = useState<any[]>(() => getCachedConsultationList() || []);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [publicSchedules, setPublicSchedules] = useState<any[]>([]);

  const fetchUserConsultations = useCallback((silent = true) => {
    getMyConsultations({ silent: true })
      .then((data) => {
        if (Array.isArray(data)) {
          setConsultations(data);
          setCachedConsultationList(data);
        }
      })
      .catch((err) => {
        logger.warn("Gagal memuat konsultasi (silent fallback to cache)", err);
      });
  }, []);

  useEffect(() => {
    if (activeTab === "konsultasi" || activeTab === "dashboard" || activeTab === "riwayat") {
      fetchUserConsultations(true);
    }

    if (activeTab === "pengaduan" || activeTab === "dashboard") {
      getMyComplaints()
        .then((data) => setComplaints(data))
        .catch((err) => {
          logger.warn("Gagal memuat pengaduan", err);
        });
    }
  }, [activeTab, fetchUserConsultations]);

  // Real-time silent polling every 5s on consultation tab
  useEffect(() => {
    if (activeTab !== "konsultasi") return;
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchUserConsultations(true);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [activeTab, fetchUserConsultations]);

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

  // Helper function to render content based on active tab (shared desktop & mobile)
  const renderContent = () => {
    switch (activeTab) {
      case "reservasi":
      case "booking":
        return <DesktopReservasi key={`reservasi-${activeTab}`} />;
      case "riwayat":
        return <DesktopReservasi key="riwayat" initialView="history" />;
      case "konsultasi":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-[#F0E6D3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Konsultasi</h1>
                <p className="text-sm text-gray-500">Pilih halaman konsultasi yang ingin Anda buka.</p>
              </div>
              <select
                aria-label="Pilih halaman konsultasi"
                value={consultationView}
                onChange={(event) => navigate(`/dashboard/user?tab=konsultasi&view=${event.target.value}`)}
                className="h-10 w-full rounded-xl border border-[#DCC799] bg-white px-3 text-sm font-semibold text-[#6B521C] outline-none focus:ring-2 focus:ring-[#C9A24A]/30 sm:w-56"
              >
                <option value="create">Buat Konsultasi</option>
                <option value="list">Daftar Konsultasi</option>
              </select>
            </div>
            {consultationView === "list" ? <PatientConsultationList consultations={consultations} /> : <DesktopKonsultasi />}
          </div>
        );
      case "pengaduan":
        return <DesktopPengaduan />;
      case "promo":
        return <DesktopUserPromo />;
      case "blog":
        return <DesktopUserBlog />;
      case "blog-detail":
        return <DesktopUserBlogDetail />;
      case "download":
        return <DesktopUserDownload />;
      case "akun":
      case "profile":
        return <DesktopUserAkun />;
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

  const shouldShowRightPanel = !["reservasi", "booking", "konsultasi", "riwayat", "akun"].includes(activeTab);

  // MOBILE VIEW - reuse the same website features, wrapped in bottom-nav layout
  if (isMobile) {
    return (
      <NewMobileDashboardLayout role="user">
        {renderContent()}
      </NewMobileDashboardLayout>
    );
  }

  // DESKTOP VIEW - With Sidebar Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start">
      {/* Left Sidebar - AccountSidebar for User */}
      <AccountSidebar userName={session?.name || "User"} onLogout={() => { clearSession(); clearSessionStorage(); window.location.href = "/login"; }} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar Header Bar for Patient */}
        <DashboardTopBar role="user" navbarLabel={tierLabel} />

        <div className="flex-1 flex min-h-0 bg-gray-50/50">
          <main className="flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto">
            {renderContent()}
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
