import { apiClient } from "@/core/api/apiClient";
import { useState, useEffect, useMemo } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { useRealtimeReservations } from "@/core/services/reservationSyncEngine";
import { getSession } from "@/core/auth/services/session";
import { triggerPushNotification } from "@/core/services/pushNotificationService";
import { useRef } from "react";
import { API_BASE } from "@/core/api/apiConfig";
import { toast } from "@/shared/ui/toast";
import { logger } from "@/core/utils/logger";
import { getSummaryForRole } from "@/features/admin/dashboard/services/demoData";

// Feature Page Imports
import PopupPage from "@/features/admin/content/pages/PopupPage";
import BlogPage from "@/features/admin/content/pages/BlogPage";
import PromoPage from "@/features/admin/content/pages/PromoPage";
import GalleryPage from "@/features/admin/content/pages/GalleryPage";
import TestimonialsPage from "@/features/admin/content/pages/TestimonialsPage";
import DownloadAppPage from "@/features/admin/content/pages/DownloadAppPage";
import ConsultationPage from "@/features/admin/consultation/pages/ConsultationPage";
import ReservationPage from "@/features/admin/reservation/pages/ReservationPage";
import DoctorsPage from "@/features/admin/doctors/pages/DoctorsPage";
import UsersPage from "@/features/admin/users/pages/UsersPage";
import BranchesPage from "@/features/admin/branches/pages/BranchesPage";
import ComplaintsPage from "@/features/admin/complaints/pages/ComplaintsPage";
import MessagesPage from "@/features/admin/messages/pages/MessagesPage";
import SettingsPage from "@/features/admin/settings/pages/SettingsPage";
import ServicesManagePage from "@/features/admin/public_info/pages/ServicesManagePage";
import FaqsManagePage from "@/features/admin/public_info/pages/FaqsManagePage";
import ContactMessagesPage from "@/features/admin/public_info/pages/ContactMessagesPage";
import AboutManagePage from "@/features/admin/public_info/pages/AboutManagePage";
import LegalManagePage from "@/features/admin/public_info/pages/LegalManagePage";
import AnalyticsDashboard from "@/features/admin/dashboard/components/AnalyticsDashboard";
import DesktopClinicHome from "@/features/admin/dashboard/components/DesktopClinicHome";

import { getAllConsultations } from "@/features/patient/consultation/services/consultationApi";
import { getAdminDoctorSchedules } from "@/features/admin/doctors/services/adminDoctorScheduleApi";
import { getAllComplaints } from "@/features/patient/consultation/services/complaintApi";
import { getAnalyticsSummary, type AnalyticsSummaryResponse } from "@/core/api/analyticsApi";

export default function ClinicDashboardPage() {
  const session = getSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";
  const token =
    (session as any)?.token ||
    localStorage.getItem("apident:token") ||
    localStorage.getItem("auth_token") ||
    "";

  useEffect(() => {
    if (!token && !session) {
      toast({ title: "Authentication Required", message: "Silakan login untuk mengakses dashboard admin", variant: "error" });
      navigate("/klinik", { replace: true });
    }
  }, [token, session, navigate]);

  // Data States
  const summary = useMemo(() => getSummaryForRole((session?.role || "clinic") as any), [session?.role]);
  const [users, setUsers] = useState<any[]>([]);
  const [apiDoctors, setApiDoctors] = useState<any[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  const [apiPosts, setApiPosts] = useState<any[]>([]);
  const [apiPopups, setApiPopups] = useState<any[]>([]);
  const [apiGalleryItems, setApiGalleryItems] = useState<any[]>([]);
  const [apiTestimonials, setApiTestimonials] = useState<any[]>([]);
  const [apiPromos, setApiPromos] = useState<any[]>([]);
  const [apiDownloadApps, setApiDownloadApps] = useState<any[]>([]);
  const { reservations, refresh: refreshReservations } = useRealtimeReservations();
  const [branches, setBranches] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummaryResponse | null>(null);

  // API Fetchers
  const fetchAnalytics = async () => {
    try {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 30);
      const fromStr = from.toISOString().split("T")[0];
      const toStr = today.toISOString().split("T")[0];
      const data = await getAnalyticsSummary(fromStr, toStr);
      setAnalyticsData(data);
    } catch (e) {
      logger.error("Gagal memuat data analitik", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat pengguna", e); }
  };

    const fetchApiDoctors = async () => {
    try {
      const res: any = await apiClient.get("/admin/doctors", { skipToast: true });
      const list = Array.isArray(res) ? res : res?.doctors || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setApiDoctors(list);
      } else {
        const pubRes: any = await apiClient.get("/doctors", { skipToast: true });
        const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.doctors || pubRes?.data || [];
        setApiDoctors(pubList);
      }
    } catch (e) {
      try {
        const pubRes: any = await apiClient.get("/doctors", { skipToast: true });
        const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.doctors || pubRes?.data || [];
        setApiDoctors(pubList);
      } catch (err) {
        logger.error("Gagal memuat dokter", err);
      }
    }
  };

  const fetchDoctorSchedules = async () => {
    try {
      const data = await getAdminDoctorSchedules();
      setDoctorSchedules(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (e) { logger.error("Gagal memuat jadwal dokter", e); }
  };

  const fetchApiPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/posts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiPosts(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat artikel", e); }
  };

  const fetchApiPopups = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/popups`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiPopups(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat pop-up", e); }
  };

  const fetchApiGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/gallery-items`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiGalleryItems(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat galeri", e); }
  };

  const fetchApiTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiTestimonials(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat testimoni", e); }
  };

  const fetchApiPromos = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/promos`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiPromos(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat promo", e); }
  };

  const fetchApiDownloadApps = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/download-apps`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiDownloadApps(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) {
      logger.error("Gagal memuat rilis aplikasi", e);
    }
  };

  const knownReservationIdsRef = useRef<Set<string | number> | null>(null);

  // Reservations are now powered by Incremental Change Polling & IndexedDB Persistent Cache

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/branches`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : data?.data || data?.branches || []);
      }
    } catch (e) { logger.error("Gagal memuat cabang", e); }
  };

  const fetchComplaints = async () => {
    try {
      const res = await getAllComplaints({});
      setComplaints(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (e) { logger.error("Gagal memuat pengaduan", e); }
  };

  const fetchConsultations = async () => {
    try {
      const data = await getAllConsultations({});
      setConsultations(Array.isArray(data) ? data : (data as any)?.data || (data as any)?.consultations || []);
    } catch (e) { logger.error("Gagal memuat konsultasi", e); }
  };

  const fetchClinicSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clinic-settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setClinicSettings(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (e) { logger.error("Gagal memuat pengaturan klinik", e); }
  };

  useEffect(() => {
    if (activeTab === "dashboard" || !activeTab) {
      fetchUsers();
      fetchApiPosts();
      fetchDoctorSchedules();
      fetchConsultations();
      fetchComplaints();
      fetchAnalytics();
    }
    if (activeTab === "users") fetchUsers();
    if (activeTab === "doctors" || activeTab === "reservasi") { fetchApiDoctors(); fetchDoctorSchedules(); }
    if (activeTab === "content-blog") fetchApiPosts();
    if (activeTab === "content-popup") fetchApiPopups();
    if (activeTab === "content-gallery") fetchApiGallery();
    if (activeTab === "content-testimonials") fetchApiTestimonials();
    if (activeTab === "content-promo") fetchApiPromos();
    if (activeTab === "content-download") fetchApiDownloadApps();
    if (activeTab === "branches") fetchBranches();
    if (activeTab === "reservasi") {
      refreshReservations();
      fetchApiDoctors();
    }
    if (activeTab === "pengaduan") fetchComplaints();
    if (activeTab === "konsultasi") fetchConsultations();
    if (activeTab === "settings") fetchClinicSettings();
  }, [activeTab]);

  const stats = [
    { title: "Total Pengguna", value: users.length, subtitle: "Pengguna terdaftar" },
    { title: "Artikel", value: apiPosts.length, subtitle: "Konten terpublikasi" },
    { title: "Jadwal Dokter", value: doctorSchedules.length, subtitle: "Jadwal aktif" },
    { title: "Pengunjung", value: analyticsData?.totals?.visitors ?? 0, subtitle: "Pengunjung bulan ini" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AnalyticsDashboard />;

      case "content-blog":
        return (
          <BlogPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            apiPosts={apiPosts}
            token={token || ""}
            sessionName={session?.name || "Admin"}
            fetchApiPosts={fetchApiPosts}
          />
        );

      case "content-popup":
        return <PopupPage token={token || ""} apiPopups={apiPopups} fetchApiPopups={fetchApiPopups} />;

      case "content-promo":
        return <PromoPage token={token || ""} apiPromos={apiPromos} fetchApiPromos={fetchApiPromos} />;

      case "content-gallery":
        return (
          <GalleryPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            apiGalleryItems={apiGalleryItems}
            token={token || ""}
            fetchApiGallery={fetchApiGallery}
          />
        );

      case "content-testimonials":
        return (
          <TestimonialsPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            apiTestimonials={apiTestimonials}
            token={token || ""}
            fetchApiTestimonials={fetchApiTestimonials}
          />
        );

      case "content-download":
        return (
          <DownloadAppPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            apiDownloadApps={apiDownloadApps}
            token={token || ""}
            fetchApiDownloadApps={fetchApiDownloadApps}
          />
        );

      case "doctors":
        return (
          <DoctorsPage
            doctors={apiDoctors}
            doctorSchedules={doctorSchedules}
            token={token || ""}
            fetchApiDoctors={fetchApiDoctors}
            fetchDoctorSchedules={fetchDoctorSchedules}
          />
        );

      case "konsultasi":
        return <ConsultationPage consultations={consultations} />;

      case "reservasi":
        return (
          <ReservationPage
            reservations={reservations as any}
            doctors={apiDoctors}
            token={token || ""}
            onRefresh={refreshReservations}
          />
        );

      case "users":
        return <UsersPage users={users} />;

      case "branches":
        return <BranchesPage branches={branches} />;

      case "pengaduan":
        return <ComplaintsPage complaints={complaints} />;

      case "messages":
        return <MessagesPage messages={messages} />;

      case "settings":
        return <SettingsPage settings={clinicSettings} />;

      case "public-services":
        return <ServicesManagePage />;

      case "public-faqs":
        return <FaqsManagePage />;

      case "public-contact-messages":
        return <ContactMessagesPage />;

      case "public-about":
        return <AboutManagePage />;

      case "public-legal":
        return <LegalManagePage />;

      default:
        return (
          <DesktopClinicHome
            session={session}
            stats={stats}
            users={users}
            doctorSchedules={doctorSchedules}
            consultations={consultations}
            complaints={complaints}
            analyticsData={analyticsData}
          />
        );
    }
  };

  if (!session) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout role="clinic">
      {renderContent()}
    </DashboardLayout>
  );
}
