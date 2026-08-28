import { Suspense, lazy, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router";
import ScrollToTop from "@/core/router/ScrollToTop";
import RouteTransition from "@/core/router/RouteTransition";
import ErrorBoundary from "@/core/router/ErrorBoundary";
import ProtectedRoute from "@/core/router/ProtectedRoute";
import ChatBot from "@/features/guest/chatbot/components/ChatBot";
import { ToastViewport } from "@/shared/ui/toast";
import PushNotificationBanner from "@/core/components/PushNotificationBanner";
import GlobalNotificationManager from "@/core/services/GlobalNotificationManager";
import { trackVisit } from "@/core/api/analyticsApi";
import { PwaManager } from "@/core/providers/PwaManager";
import { GuestSessionProvider } from "@/features/guest/consultation/services/GuestSessionContext";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import ForbiddenPage from "@/shared/pages/ForbiddenPage";
import { getSession } from "@/core/auth/services/session";
import { getDefaultDashboardPath } from "@/core/permissions/index";

import { isSessionExpired, touchSessionLastActive, clearSessionStorage } from "@/core/auth/services/sessionTtl";
import { apiClient } from "@/core/api/apiClient";

function PublicRouteRedirect({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session && session.role && (session.role as string) !== "guest") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function SessionManager() {
  useEffect(() => {
    // 1. Check if session has exceeded 10 days of inactivity
    if (isSessionExpired()) {
      clearSessionStorage();
      return;
    }

    const token = localStorage.getItem("apident:token") || localStorage.getItem("auth_token");
    if (!token) return;

    // 2. Mark session as active
    touchSessionLastActive();

    // 3. Only refresh token ONCE per session or if older than 30 minutes
    const lastRefresh = Number(localStorage.getItem("apident:last_refresh_time") || 0);
    const now = Date.now();
    if (now - lastRefresh < 30 * 60 * 1000) {
      return; // Skip refresh if refreshed within 30 minutes
    }

    localStorage.setItem("apident:last_refresh_time", String(now));

    apiClient
      .post("/auth/refresh", {}, { skipToast: true })
      .then((res) => {
        if (res?.token) {
          localStorage.setItem("apident:token", res.token);
          if (res?.user) {
            localStorage.setItem("apident:user", JSON.stringify(res.user));
          }
          touchSessionLastActive();
        }
      })
      .catch((err) => {
        if (err?.status === 401) {
          clearSessionStorage();
        }
      });
  }, []);

  return null;
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
const DoctorConsultationChatPage = lazy(() => import("@/features/doctor/consultation/pages/ConsultationChatPage"));
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

const GuestKonsultasiPage = lazy(() => import("@/features/guest/consultation/pages/GuestKonsultasiPage"));
const GuestConsultationChatPage = lazy(() => import("@/features/guest/consultation/pages/GuestConsultationChatPage"));
const GuestHistoryPage = lazy(() => import("@/features/guest/consultation/pages/GuestHistoryPage"));
const PatientConsultationChatPage = lazy(() => import("@/features/patient/consultation/pages/PatientConsultationChatPage"));

const DoctorProfileDetailPage = lazy(() => import("@/features/doctor/profile/pages/ProfileDetail"));
const DoctorProfileEditPage = lazy(() => import("@/features/doctor/profile/pages/ProfileEdit"));
const DoctorSettingsPage = lazy(() => import("@/features/doctor/settings/pages/Settings"));
const DoctorSecurityPage = lazy(() => import("@/features/doctor/settings/pages/Security"));
const DoctorDownloadPage = lazy(() => import("@/features/doctor/download/pages/Download"));

const BookingNewPage = lazy(() => import("@/features/guest/reservation/pages/BookingNew"));
const BookingStatusPage = lazy(() => import("@/features/guest/reservation/pages/BookingStatus"));
const BookingProposalPage = lazy(() => import("@/features/guest/reservation/pages/BookingProposal"));
const BookingRequestDetailPage = lazy(() => import("@/features/guest/reservation/pages/BookingRequestDetail"));

// Onboarding & Mobile PWA Entry
const OnboardingPage = lazy(() => import("@/features/guest/onboarding/pages/Onboarding"));
const MobileLoginPage = lazy(() => import("@/core/auth/pages/MobileLogin"));

// Developer API Documentation
const DocsApiPage = lazy(() => import("@/features/developer/pages/DocsApiPage"));

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
  const isGuestKonsultasi = location.pathname.startsWith("/konsultasi");
  const isDocsApi = location.pathname === "/docs-api" || location.pathname === "/doc-api";

  if (isDashboard || isSettings || isProfile || isMembership || isSecurity || isHelp || isOnboarding || isGuestKonsultasi || isDocsApi) return null;
  return <ChatBot />;
}

// Role-aware wrappers: select doctor-specific pages when session role is doctor
function isDoctorSession() {
  const session = getSession();
  return !!session && session.role === "doctor";
}

function RoleAwareProfileDetail() {
  return isDoctorSession() ? <DoctorProfileDetailPage /> : <ProfileDetailPage />;
}

function RoleAwareProfileEdit() {
  return isDoctorSession() ? <DoctorProfileEditPage /> : <ProfileEditPage />;
}

function RoleAwareSettings() {
  return isDoctorSession() ? <DoctorSettingsPage /> : <SettingsPage />;
}

function RoleAwareSecurity() {
  return isDoctorSession() ? <DoctorSecurityPage /> : <SecurityPage />;
}

function RoleAwareDownload() {
  return isDoctorSession() ? <DoctorDownloadPage /> : <DownloadPage />;
}

function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");

    trackVisit({
      landingPage: location.pathname || "/",
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
    <GuestSessionProvider>
      <Router>
      <SessionManager />
      <VisitTracker />
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full border-2 border-[#C9A24A]/30 border-t-[#C9A24A] animate-spin" />
            <span className="text-xs font-semibold text-[#8C6B1C] tracking-wide">Memuat Halaman...</span>
          </div>
        }
      >
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
              <Route path="/download" element={<RoleAwareDownload />} />
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
                path="/dashboard/doctor/consultation/:id"
                element={<Navigate to="/dashboard/doctor" replace />}
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
                    <RoleAwareProfileDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute allow={["user", "doctor", "clinic"]}>
                    <RoleAwareProfileEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allow={["user", "doctor", "clinic"]}>
                    <RoleAwareSettings />
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
                    <RoleAwareSecurity />
                  </ProtectedRoute>
                }
              />
              <Route path="/help" element={<HelpPage />} />

              {/* Guest Online Consultation (public) */}
              <Route path="/konsultasi" element={<GuestKonsultasiPage />} />
              <Route path="/konsultasi/lanjut" element={<GuestHistoryPage />} />
              <Route
                path="/konsultasi/guest/:token"
                element={
                  <ProtectedRoute guestAccessible>
                    <GuestConsultationChatPage />
                  </ProtectedRoute>
                }
              />

              {/* Patient consultation chat */}
              <Route
                path="/dashboard/user/consultation/:id"
                element={
                  <ProtectedRoute allow={["user"]}>
                    <PatientConsultationChatPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared pages */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />

              {/* Onboarding & Mobile PWA Routes */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/mobile-login" element={<MobileLoginPage />} />

              {/* Developer REST API Documentation */}
              <Route path="/docs-api" element={<DocsApiPage />} />
              <Route path="/doc-api" element={<Navigate to="/docs-api" replace />} />
            </Routes>
          </RouteTransition>
        </ErrorBoundary>
      </Suspense>
      <ChatBotWrapper />
      <GlobalNotificationManager />
      <PushNotificationBanner />
      <ToastViewport />
      <PwaManager />
      </Router>
    </GuestSessionProvider>
  );
}
