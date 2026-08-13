import { useState, useEffect, useMemo } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { getSession } from "@/core/auth/services/session";
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
import AnalyticsDashboard from "@/features/admin/dashboard/components/AnalyticsDashboard";
import DesktopClinicHome from "@/features/admin/dashboard/components/DesktopClinicHome";

import { getAllConsultations } from "@/features/patient/consultation/services/consultationApi";
import { getAdminDoctorSchedules } from "@/features/admin/doctors/services/adminDoctorScheduleApi";
import { getAllComplaints } from "@/features/patient/consultation/services/complaintApi";

export default function ClinicDashboardPage() {
  const session = getSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";
  const token = localStorage.getItem("apident:token");

  useEffect(() => {
    if (!token) {
      toast({ title: "Authentication Required", message: "Silakan login untuk mengakses dashboard admin", variant: "error" });
      navigate("/klinik", { replace: true });
    }
  }, [token, navigate]);

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
  const [reservations, setReservations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any[]>([]);

  // API Fetchers
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { logger.error("Gagal memuat pengguna", e); }
  };

  const fetchApiDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/doctors`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiDoctors(await res.json());
    } catch (e) { logger.error("Gagal memuat dokter", e); }
  };

  const fetchDoctorSchedules = async () => {
    try {
      const data = await getAdminDoctorSchedules();
      setDoctorSchedules(data);
    } catch (e) { logger.error("Gagal memuat jadwal dokter", e); }
  };

  const fetchApiPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/posts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiPosts(await res.json());
    } catch (e) { logger.error("Gagal memuat artikel", e); }
  };

  const fetchApiPopups = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/popups`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiPopups(await res.json());
    } catch (e) { logger.error("Gagal memuat pop-up", e); }
  };

  const fetchApiGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/gallery-items`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiGalleryItems(await res.json());
    } catch (e) { logger.error("Gagal memuat galeri", e); }
  };

  const fetchApiTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiTestimonials(await res.json());
    } catch (e) { logger.error("Gagal memuat testimoni", e); }
  };

  const fetchApiPromos = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/promos`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiPromos(await res.json());
    } catch (e) { logger.error("Gagal memuat promo", e); }
  };

  const fetchApiDownloadApps = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/download-apps`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApiDownloadApps(await res.json());
    } catch (e) { logger.error("Gagal memuat rilis aplikasi", e); }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reservations`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setReservations(await res.json());
    } catch (e) { logger.error("Gagal memuat reservasi", e); }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/branches`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setBranches(await res.json());
    } catch (e) { logger.error("Gagal memuat cabang", e); }
  };

  const fetchComplaints = async () => {
    try {
      const res = await getAllComplaints({});
      setComplaints(res.data || []);
    } catch (e) { logger.error("Gagal memuat pengaduan", e); }
  };

  const fetchConsultations = async () => {
    try {
      const data = await getAllConsultations({});
      setConsultations(data || []);
    } catch (e) { logger.error("Gagal memuat konsultasi", e); }
  };

  const fetchClinicSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clinic-settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setClinicSettings(await res.json());
    } catch (e) { logger.error("Gagal memuat pengaturan klinik", e); }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "doctors") { fetchApiDoctors(); fetchDoctorSchedules(); }
    if (activeTab === "content-blog") fetchApiPosts();
    if (activeTab === "content-popup") fetchApiPopups();
    if (activeTab === "content-gallery") fetchApiGallery();
    if (activeTab === "content-testimonials") fetchApiTestimonials();
    if (activeTab === "content-promo") fetchApiPromos();
    if (activeTab === "content-download") fetchApiDownloadApps();
    if (activeTab === "branches") fetchBranches();
    if (activeTab === "reservasi") fetchReservations();
    if (activeTab === "pengaduan") fetchComplaints();
    if (activeTab === "konsultasi") fetchConsultations();
    if (activeTab === "settings") fetchClinicSettings();
  }, [activeTab]);

  const stats = [
    { title: "Total Pengguna", value: users.length || 0, subtitle: "Pengguna terdaftar" },
    { title: "Artikel", value: apiPosts.length || 0, subtitle: "Konten terpublikasi" },
    { title: "Jadwal Dokter", value: doctorSchedules.length || 0, subtitle: "Jadwal aktif" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
      case "dashboard":
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
        return <DoctorsPage doctors={apiDoctors} />;

      case "konsultasi":
        return <ConsultationPage consultations={consultations} />;

      case "reservasi":
        return <ReservationPage reservations={reservations} />;

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

      default:
        return (
          <div className="space-y-8">
            <DesktopClinicHome
              session={session}
              stats={stats}
              users={users}
              doctorSchedules={doctorSchedules}
              consultations={consultations}
              complaints={complaints}
            />
            <AnalyticsDashboard />
          </div>
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
