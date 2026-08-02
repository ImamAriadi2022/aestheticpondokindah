import { Suspense, lazy, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router";
import ScrollToTop from "@/core/router/ScrollToTop";
import RouteTransition from "@/core/router/RouteTransition";
import ErrorBoundary from "@/core/router/ErrorBoundary";
import ProtectedRoute from "@/core/router/ProtectedRoute";
import ChatBot from "@/features/guest/chatbot/components/ChatBot";
import { ToastViewport } from "@/shared/ui/toast";
import { trackVisit } from "@/core/api/analyticsApi";
import { PwaManager } from "@/core/providers/PwaManager";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import ForbiddenPage from "@/shared/pages/ForbiddenPage";
import { getSession } from "@/core/auth/services/session";
import { getDefaultDashboardPath } from "@/core/permissions/index";

function PublicRouteRedirect({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session && session.role && (session.role as string) !== "guest") {
    const targetPath = getDefaultDashboardPath(session.role);
    return <Navigate to={targetPath} replace />;
  }
  return <>{children}</>;
}

const HomePage = lazy(() => import("@/features/guest/home/pages/Home"));
const AboutPage = lazy(() => import("@/features/guest/about/pages/About"));
const DoctorsPage = lazy(() => import("@/features/guest/doctors/pages/Doctors"));
const CeritaPage = lazy(() => import("@/features/guest/articles/pages/Cerita"));
const ServicesPage = lazy(() => import("@/features/guest/services/pages/Services"));
const BlogPage = lazy(() => import("@/features/guest/articles/pages/Blog"));
const BlogDetailPage = lazy(() => import("@/features/guest/articles/pages/BlogDetail"));
const PromoPage = lazy(() => import("@/features/guest/promotions/pages/Promo"));
const PromoDetailPage = lazy(() => import("@/features/guest/promotions/pages/PromoDetail"));
const DownloadPage = lazy(() => import("@/features/guest/download/pages/Download"));
const ContactPage = lazy(() => import("@/features/guest/contact/pages/Contact"));
const LoginPage = lazy(() => import("@/core/auth/pages/Login"));
const PrivacyPolicyPage = lazy(() => import("@/features/guest/legal/pages/PrivacyPolicy"));
const TermsOfServicePage = lazy(() => import("@/features/guest/legal/pages/TermsOfService"));
const BranchesPage = lazy(() => import("@/features/guest/branches/pages/Branches"));
const BranchDetailPage = lazy(() => import("@/features/guest/branches/pages/BranchDetail"));
const DashboardPage = lazy(() => import("@/core/router/Dashboard"));
const UserDashboardPage = lazy(() => import("@/features/patient/dashboard/pages/UserDashboardNew"));
const DoctorDashboardPage = lazy(() => import("@/features/doctor/dashboard/pages/DoctorDashboard"));
const DoctorScheduleFormPage = lazy(() => import("@/features/doctor/schedule/pages/DoctorScheduleForm"));
const ClinicDashboardPage = lazy(() => import("@/features/admin/dashboard/pages/ClinicDashboard"));
const ClinicDoctorFormPage = lazy(() => import("@/features/admin/doctors/pages/ClinicDoctorForm"));
const SettingsPage = lazy(() => import("@/features/patient/profile/pages/Settings"));
const ProfileDetailPage = lazy(() => import("@/features/patient/profile/pages/ProfileDetail"));
const ProfileEditPage = lazy(() => import("@/features/patient/profile/pages/ProfileEdit"));
const MembershipPage = lazy(() => import("@/features/patient/membership/pages/Membership"));
const MembershipUpgradePage = lazy(() => import("@/features/patient/membership/pages/MembershipUpgrade"));
const AdminMembershipPage = lazy(() => import("@/features/admin/membership/pages/AdminMembership"));
const SecurityPage = lazy(() => import("@/features/patient/profile/pages/Security"));
const HelpPage = lazy(() => import("@/features/guest/help/pages/Help"));

const BookingNewPage = lazy(() => import("@/features/guest/reservation/pages/BookingNew"));
const BookingStatusPage = lazy(() => import("@/features/guest/reservation/pages/BookingStatus"));
const BookingProposalPage = lazy(() => import("@/features/guest/reservation/pages/BookingProposal"));
const BookingRequestDetailPage = lazy(() => import("@/features/guest/reservation/pages/BookingRequestDetail"));

// New Mobile Pages
const OnboardingPage = lazy(() => import("@/features/guest/onboarding/pages/Onboarding"));
const MobileLoginPage = lazy(() => import("@/core/auth/pages/MobileLogin"));
const MobileHomePage = lazy(() => import("@/features/patient/mobile/pages/MobileHome"));
const MobileBookingPage = lazy(() => import("@/features/patient/mobile/pages/MobileBooking"));
const MobileBookingDoctorPage = lazy(() => import("@/features/patient/mobile/pages/MobileBookingDoctor"));
const MobileBookingSchedulePage = lazy(() => import("@/features/patient/mobile/pages/MobileBookingSchedule"));
const MobileBookingConfirmPage = lazy(() => import("@/features/patient/mobile/pages/MobileBookingConfirm"));
const MobileBookingSuccessPage = lazy(() => import("@/features/patient/mobile/pages/MobileBookingSuccess"));
const MobileKonsultasiPage = lazy(() => import("@/features/patient/mobile/pages/MobileKonsultasi"));
const MobileRiwayatPage = lazy(() => import("@/features/patient/mobile/pages/MobileRiwayat"));
const MobileAkunPage = lazy(() => import("@/features/patient/mobile/pages/MobileAkun"));

// Wrapper component to conditionally show ChatBot
function ChatBotWrapper() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isSettings = location.pathname === "/settings";
  const isProfile = location.pathname.startsWith("/profile");
  const isMembership = location.pathname === "/membership" || location.pathname === "/membership/upgrade";
  const isSecurity = location.pathname === "/security";
  const isHelp = location.pathname === "/help";
  const isOnboarding = location.pathname === "/onboarding" || location.pathname === "/mobile-login";

  if (isDashboard || isSettings || isProfile || isMembership || isSecurity || isHelp || isOnboarding) return null;
  return <ChatBot />;
}

function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const isDashboard = location.pathname.startsWith("/dashboard");
    if (isDashboard) return;

    const url = new URL(window.location.href);
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");

    trackVisit({
      landingPage: location.pathname,
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <VisitTracker />
      <ScrollToTop />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>}>
        <ErrorBoundary>
          <RouteTransition>
            <Routes>
              <Route path="/" element={<PublicRouteRedirect><HomePage /></PublicRouteRedirect>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/cerita" element={<CeritaPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/promo" element={<PromoPage />} />
              <Route path="/promo/:slug" element={<PromoDetailPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/branches/:slug" element={<BranchDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/login" element={<PublicRouteRedirect><LoginPage /></PublicRouteRedirect>} />
              <Route path="/klinik" element={<PublicRouteRedirect><LoginPage /></PublicRouteRedirect>} />
              <Route path="/booking/new" element={<BookingNewPage />} />
              <Route path="/booking/status" element={<BookingStatusPage />} />
              <Route path="/booking/proposal/:token" element={<BookingProposalPage />} />
              <Route path="/booking/request/:id" element={<BookingRequestDetailPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/user"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor"
                element={
                  <ProtectedRoute allow={["doctor"]}>
                    <DoctorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/schedule/new"
                element={
                  <ProtectedRoute allow={["doctor"]}>
                    <DoctorScheduleFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/schedule/edit/:id"
                element={
                  <ProtectedRoute allow={["doctor"]}>
                    <DoctorScheduleFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/clinic"
                element={
                  <ProtectedRoute allow={["clinic"]}>
                    <ClinicDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/clinic/membership"
                element={
                  <ProtectedRoute allow={["clinic"]}>
                    <AdminMembershipPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/clinic/doctor/new"
                element={
                  <ProtectedRoute allow={["clinic"]}>
                    <ClinicDoctorFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/clinic/doctor/edit/:id"
                element={
                  <ProtectedRoute allow={["clinic"]}>
                    <ClinicDoctorFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allow={["user", "doctor", "clinic"]}>
                    <ProfileDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute allow={["user", "doctor", "clinic"]}>
                    <ProfileEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allow={["user", "doctor", "clinic"]}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/membership"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <MembershipPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/membership/upgrade"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <MembershipUpgradePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <ProtectedRoute allow={["user", "doctor", "clinic"]}>
                    <SecurityPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/help" element={<HelpPage />} />

              {/* Shared pages */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />

              {/* Onboarding & Mobile PWA Routes */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/mobile-login" element={<MobileLoginPage />} />
              <Route path="/mobile" element={<MobileHomePage />} />
              <Route path="/mobile/booking" element={<MobileBookingPage />} />
              <Route path="/mobile/booking/doctor" element={<MobileBookingDoctorPage />} />
              <Route path="/mobile/booking/schedule" element={<MobileBookingSchedulePage />} />
              <Route path="/mobile/booking/confirm" element={<MobileBookingConfirmPage />} />
              <Route path="/mobile/booking/success" element={<MobileBookingSuccessPage />} />
              <Route
                path="/mobile/konsultasi"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <MobileKonsultasiPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/riwayat"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <MobileRiwayatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/akun"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <MobileAkunPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </RouteTransition>
        </ErrorBoundary>
      </Suspense>
      <ChatBotWrapper />
      <ToastViewport />
      <PwaManager />
    </Router>
  );
}
