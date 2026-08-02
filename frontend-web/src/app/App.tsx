import { Suspense, lazy, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router";
import ScrollToTop from "@/components/routing/ScrollToTop";
import RouteTransition from "@/components/routing/RouteTransition";
import ErrorBoundary from "@/components/routing/ErrorBoundary";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import ChatBot from "@/components/chatbot/ChatBot";
import { ToastViewport } from "@/components/ui/toast";
import { trackVisit } from "@/lib/analyticsApi";
import { PwaManager } from "@/components/pwa/PwaManager";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import ForbiddenPage from "@/shared/pages/ForbiddenPage";
import { getSession } from "@/features/auth/services/session";
import { getDefaultDashboardPath } from "@/authorization";

function PublicRouteRedirect({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session && session.role && (session.role as string) !== "guest") {
    const targetPath = getDefaultDashboardPath(session.role);
    return <Navigate to={targetPath} replace />;
  }
  return <>{children}</>;
}

const HomePage = lazy(() => import("@/features/marketing/pages/Home"));
const AboutPage = lazy(() => import("@/features/marketing/pages/About"));
const DoctorsPage = lazy(() => import("@/features/marketing/pages/Doctors"));
const CeritaPage = lazy(() => import("@/features/marketing/pages/Cerita"));
const ServicesPage = lazy(() => import("@/features/marketing/pages/Services"));
const BlogPage = lazy(() => import("@/features/marketing/pages/Blog"));
const BlogDetailPage = lazy(() => import("@/features/marketing/pages/BlogDetail"));
const PromoPage = lazy(() => import("@/features/marketing/pages/Promo"));
const PromoDetailPage = lazy(() => import("@/features/marketing/pages/PromoDetail"));
const DownloadPage = lazy(() => import("@/pages/Download"));
const ContactPage = lazy(() => import("@/features/marketing/pages/Contact"));
const LoginPage = lazy(() => import("@/features/auth/pages/Login"));
const PrivacyPolicyPage = lazy(() => import("@/features/marketing/pages/PrivacyPolicy"));
const TermsOfServicePage = lazy(() => import("@/features/marketing/pages/TermsOfService"));
const BranchesPage = lazy(() => import("@/features/marketing/pages/Branches"));
const BranchDetailPage = lazy(() => import("@/pages/BranchDetail"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const UserDashboardPage = lazy(() => import("@/pages/dashboard/UserDashboardNew"));
const DoctorDashboardPage = lazy(() => import("@/pages/dashboard/DoctorDashboard"));
const DoctorScheduleFormPage = lazy(() => import("@/pages/dashboard/DoctorScheduleForm"));
const ClinicDashboardPage = lazy(() => import("@/pages/dashboard/ClinicDashboard"));
const ClinicDoctorFormPage = lazy(() => import("@/pages/dashboard/ClinicDoctorForm"));
const SettingsPage = lazy(() => import("@/features/profile/pages/Settings"));
const ProfileDetailPage = lazy(() => import("@/features/profile/pages/ProfileDetail"));
const ProfileEditPage = lazy(() => import("@/features/profile/pages/ProfileEdit"));
const MembershipPage = lazy(() => import("@/features/membership/pages/Membership"));
const MembershipUpgradePage = lazy(() => import("@/features/membership/pages/MembershipUpgrade"));
const AdminMembershipPage = lazy(() => import("@/features/membership/pages/AdminMembership"));
const SecurityPage = lazy(() => import("@/features/profile/pages/Security"));
const HelpPage = lazy(() => import("@/features/marketing/pages/Help"));

const BookingNewPage = lazy(() => import("@/pages/booking/BookingNew"));
const BookingStatusPage = lazy(() => import("@/pages/booking/BookingStatus"));
const BookingProposalPage = lazy(() => import("@/pages/booking/BookingProposal"));
const BookingRequestDetailPage = lazy(() => import("@/pages/booking/BookingRequestDetail"));

// New Mobile Pages
const OnboardingPage = lazy(() => import("@/features/marketing/pages/Onboarding"));
const MobileLoginPage = lazy(() => import("@/features/auth/pages/MobileLogin"));
const MobileHomePage = lazy(() => import("@/pages/mobile/MobileHome"));
const MobileBookingPage = lazy(() => import("@/pages/mobile/MobileBooking"));
const MobileBookingDoctorPage = lazy(() => import("@/pages/mobile/MobileBookingDoctor"));
const MobileBookingSchedulePage = lazy(() => import("@/pages/mobile/MobileBookingSchedule"));
const MobileBookingConfirmPage = lazy(() => import("@/pages/mobile/MobileBookingConfirm"));
const MobileBookingSuccessPage = lazy(() => import("@/pages/mobile/MobileBookingSuccess"));
const MobileKonsultasiPage = lazy(() => import("@/pages/mobile/MobileKonsultasi"));
const MobileRiwayatPage = lazy(() => import("@/pages/mobile/MobileRiwayat"));
const MobileAkunPage = lazy(() => import("@/pages/mobile/MobileAkun"));

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
