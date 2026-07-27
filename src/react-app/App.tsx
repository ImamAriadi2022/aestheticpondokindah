import { Suspense, lazy, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router";
import ScrollToTop from "@/react-app/components/routing/ScrollToTop";
import RouteTransition from "@/react-app/components/routing/RouteTransition";
import ErrorBoundary from "@/react-app/components/routing/ErrorBoundary";
import ProtectedRoute from "@/react-app/components/routing/ProtectedRoute";
import ChatBot from "@/react-app/components/chatbot/ChatBot";
import { ToastViewport } from "@/react-app/components/ui/toast";
import { trackVisit } from "@/react-app/lib/analyticsApi";

const HomePage = lazy(() => import("@/react-app/pages/Home"));
const AboutPage = lazy(() => import("@/react-app/pages/About"));
const DoctorsPage = lazy(() => import("@/react-app/pages/Doctors"));
const CeritaPage = lazy(() => import("@/react-app/pages/Cerita"));
const ServicesPage = lazy(() => import("@/react-app/pages/Services"));
const BlogPage = lazy(() => import("@/react-app/pages/Blog"));
const BlogDetailPage = lazy(() => import("@/react-app/pages/BlogDetail"));
const PromoPage = lazy(() => import("@/react-app/pages/Promo"));
const PromoDetailPage = lazy(() => import("@/react-app/pages/PromoDetail"));
const ContactPage = lazy(() => import("@/react-app/pages/Contact"));
const LoginPage = lazy(() => import("@/react-app/pages/Login"));
const PrivacyPolicyPage = lazy(() => import("@/react-app/pages/PrivacyPolicy"));
const TermsOfServicePage = lazy(() => import("@/react-app/pages/TermsOfService"));
const BranchesPage = lazy(() => import("@/react-app/pages/Branches"));
const BranchDetailPage = lazy(() => import("@/react-app/pages/BranchDetail"));
const DashboardPage = lazy(() => import("@/react-app/pages/Dashboard"));
const UserDashboardPage = lazy(() => import("@/react-app/pages/dashboard/UserDashboardNew"));
const DoctorDashboardPage = lazy(() => import("@/react-app/pages/dashboard/DoctorDashboard"));
const DoctorScheduleFormPage = lazy(() => import("@/react-app/pages/dashboard/DoctorScheduleForm"));
const ClinicDashboardPage = lazy(() => import("@/react-app/pages/dashboard/ClinicDashboard"));
const ClinicDoctorFormPage = lazy(() => import("@/react-app/pages/dashboard/ClinicDoctorForm"));
const SettingsPage = lazy(() => import("@/react-app/pages/Settings"));
const MembershipPage = lazy(() => import("@/react-app/pages/Membership"));
const MembershipUpgradePage = lazy(() => import("@/react-app/pages/MembershipUpgrade"));
const SecurityPage = lazy(() => import("@/react-app/pages/Security"));
const HelpPage = lazy(() => import("@/react-app/pages/Help"));

const BookingNewPage = lazy(() => import("@/react-app/pages/booking/BookingNew"));
const BookingStatusPage = lazy(() => import("@/react-app/pages/booking/BookingStatus"));
const BookingProposalPage = lazy(() => import("@/react-app/pages/booking/BookingProposal"));
const BookingRequestDetailPage = lazy(() => import("@/react-app/pages/booking/BookingRequestDetail"));

// New Mobile Pages
const OnboardingPage = lazy(() => import("@/react-app/pages/Onboarding"));
const MobileLoginPage = lazy(() => import("@/react-app/pages/MobileLogin"));
const MobileHomePage = lazy(() => import("@/react-app/pages/mobile/MobileHome"));
const MobileBookingPage = lazy(() => import("@/react-app/pages/mobile/MobileBooking"));
const MobileBookingDoctorPage = lazy(() => import("@/react-app/pages/mobile/MobileBookingDoctor"));
const MobileBookingSchedulePage = lazy(() => import("@/react-app/pages/mobile/MobileBookingSchedule"));
const MobileBookingConfirmPage = lazy(() => import("@/react-app/pages/mobile/MobileBookingConfirm"));
const MobileBookingSuccessPage = lazy(() => import("@/react-app/pages/mobile/MobileBookingSuccess"));
const MobileKonsultasiPage = lazy(() => import("@/react-app/pages/mobile/MobileKonsultasi"));
const MobileRiwayatPage = lazy(() => import("@/react-app/pages/mobile/MobileRiwayat"));
const MobileAkunPage = lazy(() => import("@/react-app/pages/mobile/MobileAkun"));

// Wrapper component to conditionally show ChatBot
function ChatBotWrapper() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isSettings = location.pathname === "/settings";
  const isMembership = location.pathname === "/membership" || location.pathname === "/membership/upgrade";
  const isSecurity = location.pathname === "/security";
  const isHelp = location.pathname === "/help";
  const isOnboarding = location.pathname === "/onboarding" || location.pathname === "/mobile-login";

  if (isDashboard || isSettings || isMembership || isSecurity || isHelp || isOnboarding) return null;
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
              <Route path="/" element={<HomePage />} />
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/klinik" element={<LoginPage />} />
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
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/membership/upgrade" element={<MembershipUpgradePage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/help" element={<HelpPage />} />

              {/* Onboarding & Mobile Login */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/mobile-login" element={<MobileLoginPage />} />
            </Routes>
          </RouteTransition>
        </ErrorBoundary>
      </Suspense>
      <ChatBotWrapper />
      <ToastViewport />
    </Router>
  );
}
