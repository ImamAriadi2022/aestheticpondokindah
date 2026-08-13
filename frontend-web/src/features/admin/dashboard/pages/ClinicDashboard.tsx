import { Navigate, useSearchParams, useNavigate } from "react-router";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import PopupPage from "@/features/admin/content/pages/PopupPage";
import DashboardStats from "@/features/admin/dashboard/components/DashboardStats";
import DesktopClinicHome from "@/features/admin/dashboard/components/DesktopClinicHome";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { MultiSelect, type MultiSelectOption } from "@/shared/ui/multi-select";
import { getSession } from "@/core/auth/services/session";
import {
  BLOOD_TYPE_OPTIONS,
  GENDER_OPTIONS,
  getCitiesByProvince,
  getDistrictsByCity,
  JOB_OPTIONS,
  PROVINCES,
} from "@/core/constants/regionData";
import { demoVisitorAnalytics, getSummaryForRole } from "@/features/admin/dashboard/services/demoData";
import { getAllConsultations, updateConsultationStatus, type ConsultationItem, getConsultationDetail, acceptConsultation, rejectConsultation, transferConsultation, closeConsultation, sendAdminConsultationMessage, markAdminConsultationRead, getDoctorsAvailability } from "@/features/patient/consultation/services/consultationApi";
import { ChatWindow } from "@/shared/consultation/components/ChatWindow";
import type { Consultation, ConsultationMeeting, ConsultationMessage, DoctorAvailabilityItem } from "@/shared/consultation/types/consultation";
import { getAdminDoctorSchedules, type AdminDoctorScheduleItem } from "@/features/admin/doctors/services/adminDoctorScheduleApi";
import {
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  ComplaintItem,
  ComplaintStatus as ApiComplaintStatus,
} from "@/features/patient/consultation/services/complaintApi";
import { toast } from "@/shared/ui/toast";
import { useEffect, useMemo, useState } from "react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";
import { logger } from "@/core/utils/logger";
import BlogEditorPanel from "@/features/admin/content/components/BlogEditorPanel";
import WpEditor from "@/features/admin/content/components/WpEditor";
import AnalyticsDashboard from "@/features/admin/dashboard/components/AnalyticsDashboard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Users,
  ChevronRight,
  ChevronDown,
  Plus,
  ArrowLeft,
  Eye,
  TrendingUp,
  Send,
  Inbox,
  Filter,
  Search,
  Trash2,
  Phone,
  MessageCircle,
  Wallet,
  Globe,
  Mail,
  MapPin,
  Briefcase,
  Heart,
  Droplets,
  Info,
  Shield,
  Coffee,
  Cigarette,
  Pencil,
  BarChart3,
  Image,
  Loader2,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Crown,
  Star,
  Tag,
  Save,
  Type,
  Upload,
  Stethoscope,
  RefreshCw,
  Download,
  X,
  Video,
  ScrollText,
  Settings,
} from "lucide-react";

type PostStatus = "Draft" | "Published";
type DashboardPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: PostStatus;
  date: string;
  excerpt: string;
  featuredImage: string;
  content: string;
};

type MessageCategory = "Umum" | "Konsultasi" | "Pengaduan" | "Reservasi" | "Lainnya";
type MessageStatus = "Baru" | "Dibaca" | "Dibalas";

type Message = {
  id: string;
  subject: string;
  content: string;
  category: MessageCategory;
  status: MessageStatus;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  replyTo?: string;
};

function TestimonialEditor({ current, editorId, token, fetchApiTestimonials, setSearchParams }: any) {
  const isNew = !editorId;

  const [testimonialEditor, setTestimonialEditor] = useState({
    name: current?.name || "",
    rating: current?.rating || 5,
    quote: current?.quote || "",
    photoUrl: current?.photo_url || "",
    photoFile: null as File | null,
  });

  useEffect(() => {
    if (current) {
      setTestimonialEditor({
        name: current.name || "",
        rating: current.rating || 5,
        quote: current.quote || "",
        photoUrl: current.photo_url || "",
        photoFile: null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof testimonialEditor>) => {
    setTestimonialEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleTestimonialSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", testimonialEditor.name);
      formData.append("rating", String(testimonialEditor.rating));
      formData.append("quote", testimonialEditor.quote);
      if (testimonialEditor.photoFile) {
        formData.append("photo", testimonialEditor.photoFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/testimonials`
        : `${API_BASE}/admin/testimonials/${editorId}`;

      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        logger.error("Gagal simpan testimoni", await res.text());
        return;
      }

      toast({
        title: "Berhasil",
        message: isNew ? "Testimoni berhasil ditambahkan" : "Testimoni diperbarui",
        variant: "success",
      });
      await fetchApiTestimonials();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-testimonials");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      logger.error("Gagal simpan testimoni", e);
    }
  };

  const saved = testimonialEditor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200"
            onClick={() => {
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-testimonials");
                next.set("view", "list");
                next.delete("id");
                return next;
              });
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah / Edit Testimoni</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
            onClick={handleTestimonialSave}
            disabled={!saved.name.trim() || !saved.quote.trim()}
          >
            Simpan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-sm border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Nama</p>
              <Input
                value={saved.name}
                onChange={(e) => updateSaved({ name: e.target.value })}
                className="rounded-sm border-gray-200"
                placeholder="Nama"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Testimoni</p>
              <textarea
                value={saved.quote}
                onChange={(e) => updateSaved({ quote: e.target.value })}
                className="w-full min-h-[140px] rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/25"
                placeholder="Tulis testimoni..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Foto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    updateSaved({ photoUrl: url, photoFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[4/3] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.photoUrl ? (
                    <img src={saved.photoUrl} alt={saved.name || "preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 text-lg">↑</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Klik untuk unggah</p>
                      <p className="text-[11px] text-emerald-700/80">PNG, JPG, WEBP (2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                value={saved.rating}
                onChange={(e) => updateSaved({ rating: Number(e.target.value) })}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r}/5
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function generateMemberId(userId: string | number): string {
  const id = String(userId).toUpperCase();
  if (id.startsWith("AESPI_")) {
    return `MEM-${id}`;
  }
  return `MEM-AESPI_${String(userId).padStart(2, "0")}`;
}

function InfoItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

const TIER_PRESENTATION: Record<string, { label: string; badge: string; bar: string; dot: string }> = {
  gold: {
    label: "Gold",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "from-amber-300 to-amber-500",
    dot: "bg-amber-500",
  },
  platinum: {
    label: "Platinum",
    badge: "bg-slate-100 text-slate-600 border-slate-300",
    bar: "from-slate-300 to-slate-500",
    dot: "bg-slate-500",
  },
  bronze: {
    label: "Bronze",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    bar: "from-orange-300 to-orange-500",
    dot: "bg-orange-500",
  },
};

// Semua pengguna terdaftar otomatis menjadi Bronze member (gratis).
function isMember(user: any): boolean {
  return !!user;
}

function tierOf(user: any): string {
  return user?.membership_level && TIER_PRESENTATION[user.membership_level] ? user.membership_level : "bronze";
}

function DownloadAppEditor({ current, editorId, token, fetchApiDownloadApps, setSearchParams }: any) {
  const isNew = !editorId;

  const [editor, setEditor] = useState({
    title: current?.title || "",
    description: current?.description || "",
    version: current?.version || "",
    platform: current?.platform || "android",
    downloadLink: current?.download_link || "",
    isActive: current?.is_active ?? true,
    isDevelopment: current?.is_development ?? true,
    sortOrder: current?.sort_order ?? 0,
    apkUrl: current?.apk_url || "",
    apkFile: null as File | null,
  });

  const updateSaved = (next: Partial<typeof editor>) => {
    setEditor((prev) => ({ ...prev, ...next }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editor.title);
      formData.append("description", editor.description || "");
      formData.append("version", editor.version || "");
      formData.append("platform", editor.platform || "android");
      formData.append("download_link", editor.downloadLink || "");
      formData.append("is_active", editor.isActive ? "1" : "0");
      formData.append("is_development", editor.isDevelopment ? "1" : "0");
      formData.append("sort_order", String(editor.sortOrder || 0));

      if (editor.apkFile) {
        formData.append("apk_file", editor.apkFile);
      }

      const url = isNew ? `${API_BASE}/admin/download-apps` : `${API_BASE}/admin/download-apps/${editorId}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        logger.error("Gagal simpan aplikasi", await res.text());
        return;
      }

      toast({ title: "Berhasil", message: isNew ? "Aplikasi berhasil ditambahkan" : "Aplikasi diperbarui", variant: "success" });
      await fetchApiDownloadApps();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-download");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      logger.error("Gagal simpan aplikasi", e);
    }
  };

  const saved = editor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200"
            onClick={() => {
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-download");
                next.set("view", "list");
                next.delete("id");
                return next;
              });
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah / Edit Aplikasi Download</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
            onClick={handleSave}
            disabled={!saved.title.trim()}
          >
            Simpan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-sm border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Judul Aplikasi</p>
              <Input
                value={saved.title}
                onChange={(e) => updateSaved({ title: e.target.value })}
                className="rounded-sm border-gray-200"
                placeholder="Judul aplikasi"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500">Versi</p>
                <Input
                  value={saved.version}
                  onChange={(e) => updateSaved({ version: e.target.value })}
                  className="rounded-sm border-gray-200"
                  placeholder="v1.0.0"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500">Platform</p>
                <select
                  value={saved.platform}
                  onChange={(e) => updateSaved({ platform: e.target.value })}
                  className="w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a24a] outline-none bg-white"
                >
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Link Download Eksternal (Opsional)</p>
              <Input
                value={saved.downloadLink}
                onChange={(e) => updateSaved({ downloadLink: e.target.value })}
                className="rounded-sm border-gray-200"
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Deskripsi</p>
              <textarea
                value={saved.description}
                onChange={(e) => updateSaved({ description: e.target.value })}
                className="w-full h-24 p-3 rounded-sm border border-gray-200 text-sm outline-none focus:border-[#c9a24a] resize-none"
                placeholder="Deskripsi singkat aplikasi..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">File APK / ZIP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept=".apk,.zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    updateSaved({ apkUrl: URL.createObjectURL(file), apkFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[4/3] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.apkUrl ? (
                    <div className="text-center px-4">
                      <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 truncate max-w-[160px]">
                        {saved.apkFile ? saved.apkFile.name : saved.apkUrl.split("/").pop()}
                      </p>
                      {saved.apkFile && (
                        <p className="text-xs text-emerald-600">{(saved.apkFile.size / 1048576).toFixed(1)} MB</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Klik untuk upload APK</p>
                      <p className="text-xs text-emerald-700/70">APK atau ZIP (Maks. 100MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
              {saved.apkUrl && !saved.apkFile && (
                <div className="text-xs text-gray-500 text-center">
                  File: {saved.apkUrl.split("/").pop()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Aktif</label>
                <input
                  type="checkbox"
                  checked={saved.isActive}
                  onChange={(e) => updateSaved({ isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Versi Pengembangan (Dev)</label>
                <input
                  type="checkbox"
                  checked={saved.isDevelopment}
                  onChange={(e) => updateSaved({ isDevelopment: e.target.checked })}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Urutan (Sort Order)</label>
                <Input
                  type="number"
                  value={saved.sortOrder}
                  onChange={(e) => updateSaved({ sortOrder: Number(e.target.value) })}
                  className="rounded-sm border-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ClinicDashboardPage() {
  const session = getSession()!;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const INTEREST_OPTIONS = [
    "Dental Whitening",
    "Scaling",
    "Tambal Gigi",
    "Cabut Gigi",
    "Root Canal Treatments",
    "Pediatric Dentistry",
    "Dental Braces",
    "Veneer",
    "Implant",
    "Konsultasi",
  ];
  const activeTab = searchParams.get("tab") || "dashboard";
  const contentView = searchParams.get("view") || "posts";
  const editorId = searchParams.get("id");

  const summary = useMemo(
    () => getSummaryForRole((session?.role || "clinic") as any),
    [session?.role]
  );
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState<AdminDoctorScheduleItem[]>([]);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const cityOptions = useMemo(() => {
    if (!editingUser?.province) return [] as string[];
    return getCitiesByProvince(editingUser.province);
  }, [editingUser?.province]);

  const districtOptions = useMemo(() => {
    if (!editingUser?.city) return [] as string[];
    return getDistrictsByCity(editingUser.city);
  }, [editingUser?.city]);

  const consumptionOptions: MultiSelectOption[] = [
    { value: "coffee_tea", label: "Konsumsi Kopi/Teh (Sering)" },
    { value: "smoker", label: "Perokok" },
  ];

  const complaintOptions: MultiSelectOption[] = [
    { value: "tooth_sensitive", label: "Gigi sensitif" },
    { value: "tooth_yellow", label: "Gigi kuning" },
    { value: "bad_breath", label: "Bau mulut" },
    { value: "bleeding_gums", label: "Gusi berdarah" },
    { value: "cavities", label: "Gigi berlubang" },
    { value: "misaligned_teeth", label: "Gigi tidak rapi" },
    { value: "braces_issue", label: "Masalah behel" },
    { value: "broken_tooth", label: "Gigi patah" },
    { value: "missing_teeth", label: "Gigi ompong" },
    { value: "jaw_pain", label: "Nyeri rahang" },
    { value: "no_special_complaint", label: "Tidak ada keluhan khusus" },
  ];

  const desiredServiceOptions: MultiSelectOption[] = [
    { value: "dental_whitening", label: "Dental Whitening" },
    { value: "veneers", label: "Veneers" },
    { value: "invisalign", label: "Invisalign" },
    { value: "orthodontics", label: "Behel / Orthodontics" },
    { value: "scaling_cleaning", label: "Scaling & Cleaning" },
    { value: "dental_spa", label: "Dental Spa" },
    { value: "dental_implant", label: "Implan Gigi" },
    { value: "smile_makeover", label: "Smile Makeover" },
    { value: "gum_treatment", label: "Perawatan Gusi" },
    { value: "tooth_filling", label: "Tambal Gigi" },
    { value: "tooth_extraction", label: "Cabut Gigi" },
    { value: "pediatric_dentistry", label: "Perawatan Anak" },
    { value: "aesthetic_consultation", label: "Konsultasi Estetik Gigi" },
  ];

  const currentConditionOptions: MultiSelectOption[] = [
    { value: "wearing_braces", label: "Sedang menggunakan behel" },
    { value: "had_veneers", label: "Pernah veneer" },
    { value: "had_bleaching", label: "Pernah bleaching" },
    { value: "has_implant", label: "Memiliki implan gigi" },
    { value: "none", label: "Tidak ada" },
  ];

  const lastVisitOptions: Array<{ value: string; label: string }> = [
    { value: "lt_6m", label: "Kurang dari 6 bulan" },
    { value: "6_12m", label: "6–12 bulan lalu" },
    { value: "gt_1y", label: "Lebih dari 1 tahun" },
    { value: "very_long", label: "Sudah sangat lama" },
    { value: "never", label: "Belum pernah" },
  ];

  const lifestyleOptions: MultiSelectOption[] = [
    { value: "beauty_skincare", label: "Beauty & Skincare" },
    { value: "fitness_gym", label: "Fitness / Gym" },
    { value: "healthy_lifestyle", label: "Healthy Lifestyle" },
    { value: "fashion", label: "Fashion" },
    { value: "coffee_cafe", label: "Coffee & Cafe" },
    { value: "traveling", label: "Traveling" },
    { value: "parenting", label: "Parenting" },
    { value: "business_career", label: "Business & Professional Career" },
    { value: "luxury_lifestyle", label: "Luxury Lifestyle" },
    { value: "social_media_content", label: "Social Media & Content" },
    { value: "wellness_selfcare", label: "Wellness & Self Care" },
  ];

  const treatmentGoalOptions: MultiSelectOption[] = [
    { value: "confidence_smile", label: "Ingin senyum lebih percaya diri" },
    { value: "more_attractive", label: "Ingin penampilan lebih menarik" },
    { value: "routine_health", label: "Menjaga kesehatan gigi rutin" },
    { value: "relieve_pain", label: "Mengatasi rasa sakit" },
    { value: "wedding_event", label: "Persiapan wedding / event" },
    { value: "professional_look", label: "Mendukung penampilan profesional" },
    { value: "camera_ready", label: "Ingin tampil lebih estetik di kamera / media sosial" },
  ];

  const communicationOptions: MultiSelectOption[] = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Telepon" },
  ];

  const toLabel = (value: string, options: Array<{ value: string; label: string }>) => {
    const match = options.find((o) => o.value === value);
    return match?.label ?? value;
  };

  const toLabels = (values: unknown, options: Array<{ value: string; label: string }>) => {
    const arr = Array.isArray(values) ? (values as string[]) : [];
    return arr.map((v) => toLabel(v, options));
  };

  // API-backed content states
  const [apiPosts, setApiPosts] = useState<any[]>([]);
  const [apiPopups, setApiPopups] = useState<any[]>([]);
  const [apiGalleryItems, setApiGalleryItems] = useState<any[]>([]);
  const [apiTestimonials, setApiTestimonials] = useState<any[]>([]);
  const [apiPromos, setApiPromos] = useState<any[]>([]);
  const [apiDownloadApps, setApiDownloadApps] = useState<any[]>([]);
  const [_loadingContent, setLoadingContent] = useState(false);

  // Promo search and filter states
  const [promoSearch, setPromoSearch] = useState("");
  const [promoCategoryFilter, setPromoCategoryFilter] = useState("Semua");
  const [promoStatusFilter, setPromoStatusFilter] = useState("Semua");

  const token = localStorage.getItem("apident:token");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      toast({ title: "Authentication Required", message: "Please login to access admin dashboard", variant: "error" });
      navigate("/klinik", { replace: true });
    }
  }, [token, navigate]);

  // Reservasi state
  type ReservationStatus = "Baru" | "Dikonfirmasi" | "Selesai" | "Dibatalkan";
  type PaymentStatus = "Belum Bayar" | "Sudah Bayar" | "Bayar DP" | "Uang Dikembalikan" | "Dibatalkan";
  interface Reservation {
    id: string;
    name: string;
    phone: string;
    date: string;
    doctor: string;
    complaint: string;
    status: ReservationStatus;
    paymentStatus?: PaymentStatus;
    createdAt: string;
    notes?: string;
  }

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationFilter, setReservationFilter] = useState<ReservationStatus | "Semua">("Semua");
  const [reservationSearch, setReservationSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<PaymentStatus | "">("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Clinic Settings state
  interface ClinicSettingItem { id: number; key: string; value: string | null; type: string; label: string | null; description: string | null; }
  const [clinicSettings, setClinicSettings] = useState<ClinicSettingItem[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettingKey, setSavingSettingKey] = useState<string | null>(null);
  const [settingsDirty, setSettingsDirty] = useState<Record<string, string>>({});

  const fetchClinicSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/admin/clinic-settings`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setClinicSettings(data.settings || []);
      }
    } catch (e) {
      logger.error("Gagal fetch clinic settings", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveClinicSetting = async (key: string) => {
    const newValue = settingsDirty[key];
    if (newValue === undefined) return;
    setSavingSettingKey(key);
    try {
      const res = await fetch(`${API_BASE}/admin/clinic-settings/${key}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });
      if (res.ok) {
        toast.success("Setting berhasil disimpan!");
        setClinicSettings((prev) => prev.map((s) => s.key === key ? { ...s, value: newValue } : s));
        setSettingsDirty((prev) => { const next = { ...prev }; delete next[key]; return next; });
      } else {
        toast.error("Gagal menyimpan setting.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSavingSettingKey(null);
    }
  };

  const getEffectivePaymentStatus = (reservation: Reservation): PaymentStatus => {
    if (reservation.status !== "Selesai") return "Belum Bayar";
    return reservation.paymentStatus || "Belum Bayar";
  };

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const status = reservationFilter !== "Semua" ? reservationFilter : "";
      const qs = new URLSearchParams();
      if (reservationSearch.trim()) qs.set("search", reservationSearch.trim());
      if (status) qs.set("status", status);
      const url = `${API_BASE}/admin/reservations${qs.toString() ? `?${qs.toString()}` : ""}`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      if (!res.ok) {
        logger.error("Gagal fetch reservations", await res.text());
        return;
      }

      const data = (await res.json()) as any[];
      const mapped: Reservation[] = (Array.isArray(data) ? data : []).map((r) => ({
        id: String(r.id),
        name: r.name || "-",
        phone: r.phone || "-",
        date: r.date || "-",
        doctor: r.doctor || "-",
        complaint: r.complaint || "-",
        status: (r.status as ReservationStatus) || "Baru",
        paymentStatus: (r.paymentStatus as PaymentStatus) || "Belum Bayar",
        createdAt: r.createdAt || new Date().toISOString(),
        notes: r.notes || undefined,
      }));
      setReservations(mapped);
    } catch (e) {
      logger.error("Gagal fetch reservations", e);
    } finally {
      setLoadingReservations(false);
    }
  };

  const [messageFilter, setMessageFilter] = useState<MessageCategory | "Semua">("Semua");
  const [messageSearch, setMessageSearch] = useState("");

  const fetchComplaints = async () => {
    setComplaintLoading(true);
    try {
      const res = await getAllComplaints({ search: messageSearch });
      setComplaints(res.data);
    } catch (err: any) {
      toast({ title: "Gagal", message: "Gagal memuat pengaduan", variant: "error" });
    } finally {
      setComplaintLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
    if (activeTab === "doctors") {
      fetchDoctors();
      fetchDoctorSchedules();
    }
    if (activeTab === "content-blog") {
      fetchApiPosts();
    }
    if (activeTab === "content-popup") {
      fetchApiPopups();
    }
    if (activeTab === "content-gallery") {
      fetchApiGallery();
    }
    if (activeTab === "content-testimonials") {
      fetchApiTestimonials();
    }
    if (activeTab === "content-promo") {
      fetchApiPromos();
    }
    if (activeTab === "content-download") {
      fetchApiDownloadApps();
    }
    if (activeTab === "branches") {
      fetchBranches();
    }
    if (activeTab === "reservasi") {
      void fetchReservations();
    }
    if (activeTab === "pengaduan") {
      fetchComplaints();
    }
    if (activeTab === "settings") {
      void fetchClinicSettings();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "pengaduan") {
      const timer = setTimeout(() => fetchComplaints(), 500);
      return () => clearTimeout(timer);
    }
  }, [messageSearch]);

  const fetchApiPosts = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API_BASE}/admin/posts`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setApiPosts(Array.isArray(data) ? data : []);
      } else {
        setApiPosts([]);
      }
    } catch (e) {
      logger.error("Gagal fetch posts", e);
      setApiPosts([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchApiPopups = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API_BASE}/admin/popups`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setApiPopups(data);
        if (data.length > 0) {
          const p = data[0];
          setPopupPromo({
            title: p.title || "",
            headline: p.headline || "",
            message: p.message || "",
            buttonLabel: p.button_label || "",
            imageUrl: p.image_url || "",
            imageFile: null,
            enabled: !!p.enabled,
          });
        }
      }
    } catch (e) {
      logger.error("Gagal fetch popups", e);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchApiGallery = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API_BASE}/admin/gallery-items`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) setApiGalleryItems(await res.json());
    } catch (e) {
      logger.error("Gagal fetch gallery", e);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchApiTestimonials = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) setApiTestimonials(await res.json());
    } catch (e) {
      logger.error("Gagal fetch testimonials", e);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchApiPromos = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API_BASE}/admin/promos`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) setApiPromos(await res.json());
    } catch (e) {
      logger.error("Gagal fetch promos", e);
    } finally {
      setLoadingContent(false);
    }
  };

  const togglePromoStatus = async (promo: any) => {
    try {
      const formData = new FormData();
      formData.append("is_active", promo.is_active ? "0" : "1");
      formData.append("_method", "PUT");

      const res = await fetch(`${API_BASE}/admin/promos/${promo.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast({
          title: "Status Diperbarui",
          message: `Promo "${promo.title}" sekarang ${!promo.is_active ? "Aktif" : "Non-aktif"}`,
          variant: "success",
        });
        await fetchApiPromos();
      } else {
        toast({ title: "Gagal", message: "Gagal mengubah status promo", variant: "error" });
      }
    } catch (e) {
      logger.error("Gagal toggle status promo", e);
    }
  };

  const fetchApiDownloadApps = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API_BASE}/admin/download-apps`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      if (res.ok) setApiDownloadApps(await res.json());
    } catch (e) {
      logger.error("Gagal fetch download apps", e);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("apident:token");
      if (!token) {
        logger.error("No authentication token found");
        return;
      }
      const response = await fetch(`${API_BASE}/admin/users`, {
        cache: "no-store",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401 || response.status === 403) {
        logger.error("Authentication failed");
        toast({ title: "Authentication Error", message: "Please login again", variant: "error" });
        navigate("/klinik", { replace: true });
      }
    } catch (error) {
      logger.error("Gagal mengambil data user", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const token = localStorage.getItem("apident:token");
      if (!token) {
        logger.error("No authentication token found");
        return;
      }
      const response = await fetch(`${API_BASE}/admin/doctors`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else if (response.status === 401 || response.status === 403) {
        logger.error("Authentication failed");
        toast({ title: "Authentication Error", message: "Please login again", variant: "error" });
        navigate("/klinik", { replace: true });
      }
    } catch (error) {
      logger.error("Gagal mengambil data dokter", error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchDoctorSchedules = async () => {
    try {
      const items = await getAdminDoctorSchedules();
      setDoctorSchedules(items);
    } catch (error) {
      logger.error("Gagal mengambil jadwal dokter", error);
    }
  };

  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await apiClient.get<any[]>("/admin/branches");
      setBranches(res || []);
    } catch (error) {
      logger.error("Gagal mengambil data cabang klinik", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    try {
      if (editingBranch.id) {
        await apiClient.put(`/admin/branches/${editingBranch.id}`, editingBranch);
        toast({ title: "Berhasil", message: "Cabang klinik diperbarui", variant: "success" });
      } else {
        await apiClient.post("/admin/branches", editingBranch);
        toast({ title: "Berhasil", message: "Cabang klinik baru ditambahkan", variant: "success" });
      }
      setShowBranchModal(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (err: any) {
      toast({ title: "Gagal", message: err?.message || "Gagal menyimpan cabang klinik", variant: "error" });
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus cabang klinik ini?")) return;
    try {
      await apiClient.delete(`/admin/branches/${id}`);
      toast({ title: "Berhasil", message: "Cabang klinik dihapus", variant: "success" });
      fetchBranches();
    } catch (err: any) {
      toast({ title: "Gagal", message: err?.message || "Gagal menghapus cabang klinik", variant: "error" });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || isUpdatingUser) return;

    try {
      setIsUpdatingUser(true);
      const res = await fetch(`${API_BASE}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          whatsapp: editingUser.phone,
          membership_level: editingUser.membership_level,
          birthDate: editingUser.birthDate,
          gender: editingUser.gender,
          bloodType: editingUser.bloodType,
          job: editingUser.job,
          address: editingUser.address,
          province: editingUser.province,
          city: editingUser.city,
          district: editingUser.district,
          postalCode: editingUser.postalCode,
          interests: editingUser.interests,
          consumptionHabits: editingUser.consumptionHabits,
          isCoffeeDrinker: editingUser.isCoffeeDrinker,
          isSmoker: editingUser.isSmoker,
          sourceInfo: editingUser.sourceInfo,
          insuranceProvider: editingUser.insuranceProvider,
          dentalComplaints: editingUser.dentalComplaints,
          desiredServices: editingUser.desiredServices,
          currentDentalConditions: editingUser.currentDentalConditions,
          lastDentalVisit: editingUser.lastDentalVisit,
          lifestyleInterests: editingUser.lifestyleInterests,
          treatmentGoals: editingUser.treatmentGoals,
          preferredCommunicationChannels: editingUser.preferredCommunicationChannels,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate user");

      toast({
        title: "Berhasil",
        message: "User berhasil diupdate",
        variant: "success",
      });
      setShowEditUserModal(false);
      setResetPasswordValue("");
      fetchUsers();
    } catch (e: any) {
      toast({
        title: "Gagal",
        message: e.message || "Terjadi kesalahan",
        variant: "error",
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser?.id) return;
    if (!resetPasswordValue.trim()) {
      toast({
        title: "Gagal",
        message: "Password baru tidak boleh kosong",
        variant: "error",
      });
      return;
    }

    try {
      setIsResettingPassword(true);
      const res = await fetch(`${API_BASE}/admin/users/${editingUser.id}/reset-password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: resetPasswordValue }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = err?.message || (err?.errors ? JSON.stringify(err.errors) : "Gagal reset password");
        throw new Error(msg);
      }

      toast({
        title: "Berhasil",
        message: "Password pengguna berhasil direset",
        variant: "success",
      });
      setResetPasswordValue("");
    } catch (e: any) {
      toast({
        title: "Gagal",
        message: e.message || "Gagal reset password",
        variant: "error",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingUser(userId);
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) throw new Error("Gagal menghapus user");

      toast({
        title: "Berhasil",
        message: "User berhasil dihapus",
        variant: "success",
      });
      setUserToDelete(null);
      fetchUsers();
    } catch (e: any) {
      toast({
        title: "Gagal",
        message: e.message || "Terjadi kesalahan",
        variant: "error",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "All">("All");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const [popupPromo, setPopupPromo] = useState({
    title: "",
    headline: "",
    message: "",
    buttonLabel: "",
    imageUrl: "",
    imageFile: null as File | null,
    enabled: false,
  });

  const [_galleryItems] = useState<{ id: string; title: string; imageUrl: string; category: string }[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_001",
      subject: "Pertanyaan tentang jadwal dokter",
      content: "Apakah dokter Andi tersedia di hari Sabtu? Saya ingin melakukan konsultasi untuk perawatan gigi berlubang.",
      category: "Konsultasi",
      status: "Baru",
      sender: { id: "AESPI_001", name: "Dina Prameswari", email: "user@demo.com", role: "user" },
      recipient: { id: "c_001", name: "Admin Klinik", email: "clinic@demo.com", role: "clinic" },
      createdAt: "2026-04-11T10:30:00",
    },
    {
      id: "m_002",
      subject: "Komplain pelayanan",
      content: "Saya ingin mengajukan pengaduan mengenai waktu tunggu yang terlalu lama saat kunjungan kemarin.",
      category: "Pengaduan",
      status: "Dibaca",
      sender: { id: "u_002", name: "Budi Santoso", email: "budi@demo.com", role: "user" },
      recipient: { id: "c_001", name: "Admin Klinik", email: "clinic@demo.com", role: "clinic" },
      createdAt: "2026-04-10T14:20:00",
    },
    {
      id: "m_003",
      subject: "Konfirmasi reservasi",
      content: "Terima kasih atas konfirmasi reservasi saya. Saya akan datang tepat waktu.",
      category: "Reservasi",
      status: "Dibalas",
      sender: { id: "u_003", name: "Ani Wijaya", email: "ani@demo.com", role: "user" },
      recipient: { id: "c_001", name: "Admin Klinik", email: "clinic@demo.com", role: "clinic" },
      createdAt: "2026-04-09T09:15:00",
    },
  ]);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    category: "Umum" as MessageCategory,
  });

  // Konsultasi state (API)
  const [consultationSearch, setConsultationSearch] = useState("");
  const [consultationStatus, setConsultationStatus] = useState<ConsultationItem["status"] | "Semua">("Semua");
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [_consultLoading, setConsultLoading] = useState(false);
  const selectedConsultation = useMemo(
    () => consultations.find((c) => c.id === selectedConsultationId),
    [consultations, selectedConsultationId]
  );

  // Complaint state
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId) || null;
  const [adminResponseText, setAdminResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const [pendingConsultationStatus, setPendingConsultationStatus] = useState<"Selesai" | "Menunggu" | "Dijadwalkan" | "Dibuka" | "Ditolak" | null>(null);

  // Consultation detail chat state
  const [consultationDetail, setConsultationDetail] = useState<Consultation | null>(null);
  const [consultationMessages, setConsultationMessages] = useState<ConsultationMessage[]>([]);
  const [consultationMeetings, setConsultationMeetings] = useState<ConsultationMeeting[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferDoctorId, setTransferDoctorId] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [doctorsAvailability, setDoctorsAvailability] = useState<DoctorAvailabilityItem[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState("");

  const openTransferDialog = async () => {
    setTransferDoctorId("");
    setDoctorsError("");
    setTransferOpen(true);
    setDoctorsLoading(true);
    try {
      // Always refetch: doctors can be added or activated while the admin
      // dashboard is already open.
      setDoctorsAvailability(await getDoctorsAvailability());
    } catch (err: any) {
      logger.error("Gagal memuat dokter", err);
      setDoctorsAvailability([]);
      setDoctorsError(err?.message || "Daftar dokter tidak dapat dimuat.");
    } finally {
      setDoctorsLoading(false);
    }
  };

  const loadConsultationDetail = async (id: string, silent = false) => {
    if (!silent) setDetailLoading(true);
    try {
      const detail = await getConsultationDetail(id);
      setConsultationDetail(detail);
      setConsultationMessages(detail.messages ?? []);
      setConsultationMeetings(detail.meetings ?? []);
      const unread = (detail.messages ?? []).filter((m) => m.senderRole === "patient" && !m.readAt);
      if (unread.length > 0) {
        markAdminConsultationRead(id).catch(() => {});
      }
      setPendingConsultationStatus(detail.status);
    } catch (err) {
      logger.error("Gagal memuat detail konsultasi", err);
    } finally {
      if (!silent) setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedConsultationId) {
      setConsultationDetail(null);
      setConsultationMessages([]);
      setConsultationMeetings([]);
      return;
    }
    loadConsultationDetail(selectedConsultationId);
  }, [selectedConsultationId]);

  // The admin sees the same message thread as the patient, guest, and doctor.
  // Refresh only the open detail so the rest of this large dashboard stays stable.
  useEffect(() => {
    if (!selectedConsultationId) return;
    const timer = window.setInterval(() => {
      loadConsultationDetail(selectedConsultationId, true);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [selectedConsultationId]);

  useEffect(() => {
    if (activeTab === "konsultasi" || activeTab === "dashboard") {
      setConsultLoading(true);
      const params =
        activeTab === "konsultasi"
          ? { search: consultationSearch, status: consultationStatus }
          : undefined;

      getAllConsultations(params)
        .then((data) => setConsultations(data))
        .catch((err) => {
          logger.error(err);
          toast({ title: "Gagal memuat", message: "Tidak bisa memuat daftar konsultasi.", variant: "error" });
        })
        .finally(() => setConsultLoading(false));
    }
  }, [activeTab, consultationSearch, consultationStatus]);

  useEffect(() => {
    if (!selectedConsultation) {
      setPendingConsultationStatus(null);
      return;
    }
    setPendingConsultationStatus(selectedConsultation.status);
  }, [selectedConsultationId]);

  useEffect(() => {
    if (selectedComplaint) {
      setAdminResponseText(selectedComplaint.adminResponse || "");
    }
  }, [selectedComplaintId]);

  useEffect(() => {
    if (!selectedReservation) return;
    const updated = reservations.find((r) => r.id === selectedReservation.id) || null;
    if (!updated) {
      setSelectedReservation(null);
      return;
    }
    if (updated !== selectedReservation) {
      setSelectedReservation(updated);
    }
  }, [reservations, selectedReservation]);

  const stats = [
    {
      title: "Total Pengguna",
      value: summary.cards[0]?.value || 0,
      subtitle: "Pengguna terdaftar",
      trend: "up" as const,
      trendValue: "Bulan ini",
      icon: Users,
      variant: "green" as const,
    },
    {
      title: "Artikel",
      value: summary.cards[1]?.value || 0,
      subtitle: "Konten artikel",
      trend: "neutral" as const,
      trendValue: "Tersedia",
      icon: FileText,
    },
    {
      title: "Jadwal Dokter",
      value: doctorSchedules.length,
      subtitle: "Jadwal aktif",
      trend: "up" as const,
      trendValue: "Update harian",
      icon: Calendar,
    },
    {
      title: "Pengunjung",
      value: summary.cards[2]?.value || 0,
      subtitle: "Total pengunjung",
      trend: "up" as const,
      trendValue: "Minggu ini",
      icon: BarChart3,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "konsultasi": {
        const userNameById = (userId: string) => {
          const u = users.find((x) => x.id === userId);
          return u?.name || userId;
        };

        const filtered = consultations
          .filter((c) => {
            const matchesStatus = consultationStatus === "Semua" || c.status === consultationStatus;
            const q = consultationSearch.trim().toLowerCase();
            const userName = (c.user?.name || c.participantName || userNameById(c.userId)).toLowerCase();
            const matchesSearch =
              q === "" ||
              c.topic?.toLowerCase().includes(q) ||
              c.doctorName?.toLowerCase().includes(q) ||
              c.userId?.toLowerCase().includes(q) ||
              userName.includes(q) ||
              c.chiefComplaint?.toLowerCase().includes(q) ||
              c.participantName?.toLowerCase().includes(q) ||
              c.guestPhone?.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
          })
          .sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));

        const countByStatus = (items: any[]) =>
          items.reduce(
            (acc, c) => {
              acc[c.status] = (acc[c.status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

        const totalCounts = countByStatus(consultations);

        const getStatusColor = (status: "Selesai" | "Menunggu" | "Dijadwalkan" | "Dibuka" | "Ditolak") => {
          switch (status) {
            case "Selesai":
              return "bg-emerald-100 text-emerald-700 border border-emerald-200";
            case "Dijadwalkan":
              return "bg-[#e8d4a2]/30 text-[#8a6b2b] border border-[#e8d4a2]/40";
            case "Dibuka":
              return "bg-violet-100 text-violet-700 border border-violet-200";
            case "Ditolak":
              return "bg-red-100 text-red-600 border border-red-200";
            case "Menunggu":
            default:
              return "bg-amber-100 text-amber-700 border border-amber-200";
          }
        };

        if (selectedConsultation) {
          const saveConsultationStatus = async () => {
            if (!pendingConsultationStatus || pendingConsultationStatus === selectedConsultation.status) return;
            try {
              const updated = await updateConsultationStatus(selectedConsultation.id, pendingConsultationStatus);
              setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            } catch (err: any) {
              toast({ title: "Gagal", message: err.message || "Tidak bisa memperbarui status.", variant: "error" });
            }
          };

          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedConsultationId(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Detail Konsultasi</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">ID: {selectedConsultation.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedConsultation.type === "quick" && selectedConsultation.status === "Menunggu" && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            setActionBusy(true);
                            try {
                              const updated = await acceptConsultation(selectedConsultation.id);
                              setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                              setSelectedConsultationId(null);
                              toast({ title: "Berhasil", message: "Konsultasi diterima dan sedang ditangani", variant: "success" });
                            } catch (err: any) {
                              toast({ title: "Gagal", message: err?.message || "Tidak bisa menerima konsultasi", variant: "error" });
                            } finally {
                              setActionBusy(false);
                            }
                          }}
                          disabled={actionBusy}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Terima
                        </Button>
                      )}
                      {selectedConsultation.type !== "quick" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionBusy}
                          onClick={openTransferDialog}
                          className="rounded-sm border-gray-200"
                        >
                          <Users className="w-4 h-4" />
                          Teruskan ke Dokter
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionBusy}
                        onClick={async () => {
                          setRejectOpen(true);
                        }}
                        className="rounded-sm border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        Tolak
                      </Button>
                      {!["Selesai", "Ditolak"].includes(selectedConsultation.status) && (
                        <Button
                          size="sm"
                          disabled={actionBusy}
                          onClick={async () => {
                            setActionBusy(true);
                            try {
                              const updated = await closeConsultation(selectedConsultation.id);
                              setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                              setSelectedConsultationId(null);
                              toast({ title: "Berhasil", message: "Konsultasi ditutup", variant: "success" });
                            } catch (err: any) {
                              toast({ title: "Gagal", message: err?.message || "Tidak bisa menutup konsultasi", variant: "error" });
                            } finally {
                              setActionBusy(false);
                            }
                          }}
                          className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Tutup Konsultasi
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Ubah Status Konsultasi</p>
                      <select
                        value={pendingConsultationStatus || selectedConsultation.status}
                        onChange={(e) => setPendingConsultationStatus(e.target.value as "Selesai" | "Menunggu" | "Dijadwalkan" | "Dibuka" | "Ditolak")}
                        className="mt-2 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none bg-white"
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Dijadwalkan">Dijadwalkan</option>
                        <option value="Dibuka">Sedang Ditangani</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingConsultationStatus(selectedConsultation.status)}
                          className="rounded-sm border-gray-200"
                        >
                          Batal
                        </Button>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold ${getStatusColor(selectedConsultation.status)}`}
                          >
                            {selectedConsultation.status}
                          </span>
                          <Button
                            size="sm"
                            onClick={saveConsultationStatus}
                            disabled={!pendingConsultationStatus || pendingConsultationStatus === selectedConsultation.status}
                            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm disabled:opacity-50"
                          >
                            Simpan
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Klik Simpan untuk menyimpan perubahan status.</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Tipe Konsultasi</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        Konsultasi Instan
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Pengguna</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedConsultation.user?.name || selectedConsultation.participantName || userNameById(selectedConsultation.userId)}
                      </p>
                      {selectedConsultation.isGuest ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Tamu • {(selectedConsultation as any).guestPhone || "-"}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">{selectedConsultation.user?.email}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Dokter</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedConsultation.doctorName}</p>
                    </div>

                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Tanggal</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedConsultation.date}</p>
                    </div>

                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Topik</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedConsultation.topic}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Kontak</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{(selectedConsultation as any).preferredContact || "WhatsApp/Telepon"}</p>
                      <p className="text-xs text-gray-600 mt-1">{(selectedConsultation as any).contactNumber || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Kategori</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{(selectedConsultation as any).category || "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Durasi Keluhan</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{(selectedConsultation as any).duration || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Skala Nyeri</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {(selectedConsultation as any).painScale != null ? `${(selectedConsultation as any).painScale} / 10` : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-sm p-4">
                    <p className="text-xs text-gray-500">Keluhan Utama</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{(selectedConsultation as any).chiefComplaint || "-"}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Alergi</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{(selectedConsultation as any).allergies || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Obat yang Dikonsumsi</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{(selectedConsultation as any).medications || "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Perawatan Sebelumnya</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{(selectedConsultation as any).priorTreatment || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-sm p-4">
                      <p className="text-xs text-gray-500">Harapan</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{(selectedConsultation as any).expectations || "-"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-sm p-4">
                    <p className="text-xs text-gray-500">Catatan Tambahan</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{(selectedConsultation as any).notes || "-"}</p>
                  </div>

                  <div className="bg-[#c9a24a]/5 border border-[#c9a24a]/15 rounded-sm p-4">
                    <p className="text-xs text-gray-500 mb-2">Lampiran</p>
                    {!(selectedConsultation as any).attachments || (selectedConsultation as any).attachments.length === 0 ? (
                      <p className="text-sm text-gray-700">-</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(selectedConsultation as any).attachments.map((a: any, idx: number) => {
                          const url = typeof a === "string" ? a : a?.url || a?.path || "";
                          const name = typeof a === "string" ? `Lampiran ${idx + 1}` : a?.name || `Lampiran ${idx + 1}`;
                          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|heic|heif)$/i.test(url);
                          return (
                            <div key={`${name}_${idx}`} className="rounded-sm border border-gray-200 bg-white p-2">
                              {isImage ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" download>
                                  <img
                                    src={url}
                                    alt={name}
                                    className="w-full h-24 object-cover rounded-sm"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                </a>
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-sm text-xs text-gray-500">
                                  File
                                </div>
                              )}
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="block mt-2 text-xs text-[#a8843a] hover:underline truncate"
                                title={name}
                              >
                                {name}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Chat panel */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#a8843a]" />
                        <h3 className="text-sm font-bold text-gray-900">Ruang Chat Konsultasi</h3>
                      </div>
                      {consultationDetail?.status && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold ${getStatusColor(consultationDetail.status)}`}>
                          {consultationDetail.status}
                        </span>
                      )}
                    </div>
                    <div className="h-[460px]">
                      <ChatWindow
                        messages={consultationMessages}
                        loading={detailLoading}
                        disabled={["Selesai", "Ditolak"].includes(consultationDetail?.status || "")}
                        currentRole="admin"
                        onSend={async (body) => {
                          try {
                            const message = await sendAdminConsultationMessage(selectedConsultation.id, body);
                            setConsultationMessages((prev) => [...prev, message]);
                          } catch (err: any) {
                            toast({ title: "Gagal", message: err?.message || "Tidak bisa mengirim pesan", variant: "error" });
                          }
                        }}
                        emptyStateTitle="Ruang chat siap digunakan"
                        emptyStateDescription="Balas pertanyaan pasien atau tamu melalui ruang chat ini."
                      />
                    </div>
                        {consultationMeetings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Link Meeting Terlampir:</p>
                        <div className="flex flex-wrap gap-2">
                          {consultationMeetings.map((m) => (
                            <a
                              key={m.id}
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#c9a24a]/10 text-[#8a6b2b] text-xs font-semibold border border-[#c9a24a]/20 hover:bg-[#c9a24a]/20"
                            >
                              <Video className="w-3.5 h-3.5" />
                              {m.title || m.provider}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transfer modal */}
              {transferOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 sm:pt-24 overflow-y-auto">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Teruskan ke Dokter</h3>
                      <button onClick={() => setTransferOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Pilih dokter yang akan menangani konsultasi ini.
                    </p>
                    <select
                      value={transferDoctorId}
                      onChange={(e) => setTransferDoctorId(e.target.value)}
                      disabled={doctorsLoading || doctorsAvailability.length === 0}
                      className="w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none bg-white"
                    >
                      <option value="">{doctorsLoading ? "Memuat dokter..." : "Pilih dokter..."}</option>
                      {doctorsAvailability.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}{d.specialization ? ` — ${d.specialization}` : ""}
                        </option>
                      ))}
                    </select>
                    {doctorsLoading && (
                      <p className="text-xs text-gray-400 mt-2">Memuat daftar dokter...</p>
                    )}
                    {doctorsError && (
                      <p className="text-xs text-red-600 mt-2">{doctorsError}</p>
                    )}
                    {!doctorsLoading && !doctorsError && doctorsAvailability.length === 0 && (
                      <p className="text-xs text-amber-700 mt-2">Belum ada akun dokter yang dapat dipilih.</p>
                    )}
                    {transferDoctorId && (
                      <p className="text-xs text-gray-500 mt-2">
                        Konsultasi akan langsung diteruskan ke dokter terpilih dan muncul di daftar konsultasinya.
                      </p>
                    )}
                    <div className="flex justify-end gap-2 mt-5">
                      <Button variant="outline" size="sm" onClick={() => setTransferOpen(false)} className="rounded-sm border-gray-200">
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        disabled={!transferDoctorId || actionBusy}
                        onClick={async () => {
                          setActionBusy(true);
                          try {
                            const updated = await transferConsultation(selectedConsultation.id, transferDoctorId);
                            setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                            setConsultationDetail((prev) => prev ? { ...prev, ...updated } : updated);
                            setTransferOpen(false);
                            setTransferDoctorId("");
                            toast({ title: "Berhasil", message: "Konsultasi diteruskan ke dokter", variant: "success" });
                          } catch (err: any) {
                            toast({ title: "Gagal", message: err?.message || "Tidak bisa meneruskan konsultasi", variant: "error" });
                          } finally {
                            setActionBusy(false);
                          }
                        }}
                        className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm"
                      >
                        Teruskan
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reject modal */}
              {rejectOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Tolak Konsultasi</h3>
                      <button onClick={() => setRejectOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Alasan penolakan (opsional).</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Contoh: Jadwal klinik penuh..."
                      className="w-full min-h-[100px] rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none bg-white"
                    />
                    <div className="flex justify-end gap-2 mt-5">
                      <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)} className="rounded-sm border-gray-200">
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionBusy}
                        onClick={async () => {
                          setActionBusy(true);
                          try {
                            const updated = await rejectConsultation(selectedConsultation.id, rejectReason || undefined);
                            setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                            setRejectOpen(false);
                            setRejectReason("");
                            setSelectedConsultationId(null);
                            toast({ title: "Berhasil", message: "Konsultasi ditolak", variant: "success" });
                          } catch (err: any) {
                            toast({ title: "Gagal", message: err?.message || "Tidak bisa menolak konsultasi", variant: "error" });
                          } finally {
                            setActionBusy(false);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-sm"
                      >
                        Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        const TableBlock = (props: { title: string; subtitle: string; items: typeof filtered }) => (
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{props.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{props.subtitle}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-gray-100 text-gray-700">
                  {props.items.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Tanggal</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm hidden sm:table-cell">Pengguna</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-gray-400 text-center py-8 text-base">
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    props.items.map((c) => (
                      <TableRow key={c.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium text-sm sm:text-base">{c.date}</TableCell>
                        <TableCell className="whitespace-normal text-gray-600 text-sm sm:text-base hidden sm:table-cell">
                          {c.user?.name || c.participantName || userNameById(c.userId)}
                          {c.isGuest && <span className="block text-[11px] text-gray-400">{c.guestPhone || "Tamu"}</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold ${getStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConsultationId(c.id)}
                            className="text-[#a8843a] hover:text-[#9a7630] hover:bg-[#c9a24a]/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

        const waitingCount = totalCounts.Menunggu || 0;
        const activeCount = totalCounts.Dibuka || 0;
        const completedCount = totalCounts.Selesai || 0;

        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Konsultasi Instan</h2>
              <p className="text-sm text-[#8A7B6B] mt-1">Pantau dan kelola konsultasi instan dari pengguna.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total Konsultasi</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{consultations.length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Menunggu</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">{waitingCount}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Sedang Ditangani</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">{activeCount}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Selesai</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{completedCount}</p>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A]" />
                <Input
                  placeholder="Cari nama pengguna, dokter, topik..."
                  value={consultationSearch}
                  onChange={(e) => setConsultationSearch(e.target.value)}
                  className="pl-10 rounded-xl border-[#E8D4A2]/40 bg-[#FDF8F0] focus:bg-white focus:border-[#C9A24A] focus:ring-[#C9A24A]/20"
                />
              </div>
              <div className="relative">
                <select
                  value={consultationStatus}
                  onChange={(e) => setConsultationStatus(e.target.value as any)}
                  className="appearance-none rounded-xl border border-[#E8D4A2]/40 bg-[#FDF8F0] px-4 py-2.5 pr-10 text-sm text-[#4A3F35] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Dibuka">Sedang Ditangani</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A] pointer-events-none" />
              </div>
            </div>

            {/* Single Consultation Table */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#F0E6D3] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#4A3F35]">Daftar Konsultasi Instan</h3>
                  <p className="text-sm text-[#8A7B6B] mt-1">Kelola sesi konsultasi chat pengguna</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5E6C8] text-[#8A6B2B]">
                  {filtered.length} Konsultasi
                </span>
              </div>
              <div className="overflow-x-auto">
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium text-sm">Tidak ada data konsultasi</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/60">
                        <th className="text-left py-3.5 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Pengguna</th>
                        <th className="text-left py-3.5 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Topik / Keluhan</th>
                        <th className="text-left py-3.5 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Dokter</th>
                        <th className="text-left py-3.5 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                        <th className="text-right py-3.5 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8] text-xs text-[#4A3F35]">
                      {filtered.map((c: any) => (
                        <tr key={c.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-[#4A3F35]">
                            {c.participantName || c.user?.name || userNameById(c.userId)}
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{c.topic || "Konsultasi"}</p>
                            <p className="text-[10px] text-[#B8A99A] truncate max-w-[200px]">{c.chiefComplaint}</p>
                          </td>
                          <td className="py-3.5 px-5 hidden sm:table-cell text-[#8A7B6B]">
                            {c.doctorName || "-"}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedConsultationId(c.id)}
                              className="text-[#B8943F] hover:text-[#9a7630] hover:bg-[#F5E6C8] h-8 w-8 p-0 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "reservasi": {
        const filteredReservations = reservations.filter((r) => {
          const matchesStatus = reservationFilter === "Semua" || r.status === reservationFilter;
          const matchesSearch =
            reservationSearch === "" ||
            r.name.toLowerCase().includes(reservationSearch.toLowerCase()) ||
            r.phone.includes(reservationSearch) ||
            r.complaint.toLowerCase().includes(reservationSearch.toLowerCase());
          return matchesStatus && matchesSearch;
        });

        const countByStatus = (items: typeof reservations) =>
          items.reduce(
            (acc, r) => {
              acc[r.status] = (acc[r.status] || 0) + 1;
              return acc;
            },
            {} as Record<ReservationStatus, number>
          );

        const totalCounts = countByStatus(reservations);

        const getStatusColor = (status: ReservationStatus) => {
          switch (status) {
            case "Baru":
              return "bg-[#c9a24a] text-white";
            case "Dikonfirmasi":
              return "bg-blue-500 text-white";
            case "Selesai":
              return "bg-green-500 text-white";
            case "Dibatalkan":
              return "bg-red-500 text-white";
            default:
              return "bg-gray-200 text-gray-700";
          }
        };

        const getPaymentStatusColor = (paymentStatus?: PaymentStatus) => {
          switch (paymentStatus) {
            case "Belum Bayar":
              return "bg-amber-100 text-amber-700 border border-amber-200";
            case "Sudah Bayar":
              return "bg-emerald-100 text-emerald-700 border border-emerald-200";
            case "Bayar DP":
              return "bg-sky-100 text-sky-700 border border-sky-200";
            case "Uang Dikembalikan":
              return "bg-violet-100 text-violet-700 border border-violet-200";
            case "Dibatalkan":
              return "bg-red-100 text-red-700 border border-red-200";
            default:
              return "bg-gray-100 text-gray-600 border border-gray-200";
          }
        };

        if (selectedReservation) {
          const waNumber = selectedReservation.phone.replace(/^0/, "62").replace(/\D/g, "");

          const openWa = (message: string) => {
            const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank", "noopener,noreferrer");
          };

          const updateReservationStatus = async (nextStatus: ReservationStatus) => {
            setIsUpdating(true);
            try {
              const res = await fetch(
                `${API_BASE}/admin/reservations/${selectedReservation.id}`,
                {
                  method: "PUT",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                  },
                  body: JSON.stringify({ status: nextStatus }),
                }
              );

              if (!res.ok) {
                const err = await res.json();
                logger.error("Gagal update reservation", err);
                toast({
                  title: "Gagal",
                  message: err.message || "Gagal memperbarui status reservasi.",
                  variant: "error",
                });
                return false;
              }

              const updated = (await res.json()) as any;
              setReservations((prev) =>
                prev.map((r) => (r.id === selectedReservation.id ? { ...r, status: updated.status ?? nextStatus } : r))
              );
              setSelectedReservation((prev) => (prev ? { ...prev, status: updated.status ?? nextStatus } : prev));
              toast({
                title: "Berhasil",
                message: "Status reservasi diperbarui.",
                variant: "success",
              });
              void fetchReservations();
              return true;
            } catch (e) {
              logger.error("Gagal update reservation", e);
              toast({
                title: "Gagal",
                message: "Gagal memperbarui status reservasi.",
                variant: "error",
              });
              return false;
            } finally {
              setIsUpdating(false);
            }
          };

          const confirmAction = () => {
            void (async () => {
              const ok = await updateReservationStatus("Dikonfirmasi");
              if (!ok) return;
              openWa(
                `Halo ${selectedReservation.name},\n\nReservasi jadwal perawatan klinik Anda untuk *${(selectedReservation as any).treatment_interest || selectedReservation.complaint}* pada tanggal *${selectedReservation.date}* telah *DIKONFIRMASI*.\n\nMohon datang tepat waktu di klinik. Terima kasih telah memilih Aesthetic Pondok Indah Dental Clinic.`
              );
            })();
          };

          const completeAction = () => {
            void (async () => {
              const ok = await updateReservationStatus("Selesai");
              if (!ok) return;
              openWa(
                `Halo ${selectedReservation.name},\n\nTerima kasih telah melakukan perawatan di Aesthetic Pondok Indah Dental Clinic.\n\nJika ada keluhan pasca tindakan medis atau ingin periksa ulang, silakan hubungi kami kapan saja. Senang bisa melayani Anda!`
              );
            })();
          };

          const cancelAction = () => {
            void (async () => {
              const ok = await updateReservationStatus("Dibatalkan");
              if (!ok) return;
              openWa(
                `Halo ${selectedReservation.name},\n\nMohon maaf, reservasi jadwal perawatan klinik Anda untuk *${(selectedReservation as any).treatment_interest || selectedReservation.complaint}* pada tanggal *${selectedReservation.date}* *DIBATALKAN*.\n\nSilakan hubungi kami untuk reschedule jadwal periksa atau informasi lebih lanjut. Terima kasih atas pengertiannya.`
              );
            })();
          };

          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedReservation(null)}
                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Reservasi
              </Button>

              <Card className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="pb-5 bg-gradient-to-br from-[#c9a24a]/8 to-transparent">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-[#a8843a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${getStatusColor(selectedReservation.status)}`}>
                          {selectedReservation.status}
                        </span>
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedReservation.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">{selectedReservation.phone}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/70 rounded-lg p-3.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-3.5 h-3.5 text-[#a8843a]" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nomor HP</h4>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.phone}</p>
                    </div>
                    <div className="bg-gray-50/70 rounded-lg p-3.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-[#a8843a]" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</h4>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.date}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/70 rounded-lg p-3.5">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#a8843a]" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Keluhan</h4>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.complaint}</p>
                    </div>
                    <div className="bg-gray-50/70 rounded-lg p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-3.5 h-3.5 text-[#a8843a]" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Pembayaran</h4>
                      </div>
                      {selectedReservation.status === "Selesai" ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <select
                            value={editingPaymentStatus}
                            onChange={(e) => setEditingPaymentStatus(e.target.value as PaymentStatus)}
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
                          >
                            <option value="Belum Bayar">Belum Bayar</option>
                            <option value="Sudah Bayar">Sudah Bayar</option>
                            <option value="Bayar DP">Bayar DP</option>
                            <option value="Uang Dikembalikan">Uang Dikembalikan</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                          </select>
                          <Button
                            size="sm"
                            disabled={isUpdating || editingPaymentStatus === getEffectivePaymentStatus(selectedReservation)}
                            onClick={() => {
                              void (async () => {
                                const newPaymentStatus = editingPaymentStatus as PaymentStatus;
                                setIsUpdating(true);
                                try {
                                  const res = await fetch(
                                    `${API_BASE}/admin/reservations/${selectedReservation.id}`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Authorization": `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                        "Accept": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: selectedReservation.status,
                                        paymentStatus: newPaymentStatus,
                                      }),
                                    }
                                  );

                                  if (!res.ok) {
                                    const err = await res.json();
                                    logger.error("Gagal update payment status", err);
                                    toast({
                                      title: "Gagal",
                                      message: err.message || "Gagal memperbarui status pembayaran.",
                                      variant: "error",
                                    });
                                    return;
                                  }

                                  const updated = (await res.json()) as any;
                                  setReservations((prev) =>
                                    prev.map((r) =>
                                      r.id === selectedReservation.id
                                        ? { ...r, paymentStatus: updated.paymentStatus ?? newPaymentStatus }
                                        : r
                                    )
                                  );
                                  setSelectedReservation((prev) =>
                                    prev ? { ...prev, paymentStatus: updated.paymentStatus ?? newPaymentStatus } : prev
                                  );
                                  toast({
                                    title: "Berhasil",
                                    message: "Status pembayaran diperbarui.",
                                    variant: "success",
                                  });
                                  void fetchReservations();
                                } catch (e) {
                                  logger.error("Gagal update payment status", e);
                                  toast({
                                    title: "Gagal",
                                    message: "Gagal memperbarui status pembayaran.",
                                    variant: "error",
                                  });
                                } finally {
                                  setIsUpdating(false);
                                }
                              })();
                            }}
                            className="bg-[#c9a24a] hover:bg-[#b8923f] text-white rounded-lg font-semibold text-sm"
                          >
                            {isUpdating ? "..." : "Simpan"}
                          </Button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getPaymentStatusColor(
                            getEffectivePaymentStatus(selectedReservation)
                          )}`}
                        >
                          {getEffectivePaymentStatus(selectedReservation)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
                    {selectedReservation.status === "Baru" && (
                      <Button
                        onClick={confirmAction}
                        disabled={isUpdating}
                        className="w-full sm:w-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-semibold shadow-sm shadow-blue-500/20 transition-all"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isUpdating ? "Memproses..." : "Konfirmasi via WhatsApp"}
                      </Button>
                    )}
                    {selectedReservation.status === "Dikonfirmasi" && (
                      <Button
                        onClick={completeAction}
                        disabled={isUpdating}
                        className="w-full sm:w-auto bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl font-semibold shadow-sm shadow-green-500/20 transition-all"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isUpdating ? "Memproses..." : "Tandai Selesai"}
                      </Button>
                    )}
                    {(selectedReservation.status === "Baru" || selectedReservation.status === "Dikonfirmasi") && (
                      <Button
                        variant="outline"
                        onClick={cancelAction}
                        disabled={isUpdating}
                        className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-semibold transition-all"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isUpdating ? "..." : "Batalkan"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Kelola Reservasi Perawatan Klinik</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Kelola reservasi jadwal periksa & tindakan medis pasien di lokasi klinik</p>
              </div>
            </div>

            {/* Modern Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total Reservasi</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{reservations.length}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-[#F5E6C8] text-[#8A6B2B]">
                    Baru: {totalCounts.Baru || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
                    Dikonfirmasi: {totalCounts.Dikonfirmasi || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                    Selesai: {totalCounts.Selesai || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">
                    Dibatalkan: {totalCounts.Dibatalkan || 0}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Reservasi Aktif</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{(totalCounts.Baru || 0) + (totalCounts.Dikonfirmasi || 0)}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-[#F5E6C8] text-[#8A6B2B]">
                    Baru: {totalCounts.Baru || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
                    Dikonfirmasi: {totalCounts.Dikonfirmasi || 0}
                  </span>
                </div>
                <p className="text-xs text-[#B8A99A] mt-2">Belum selesai / belum dibatalkan.</p>
              </div>

              <div className="bg-gradient-to-br from-[#FDF8F0] to-[#F5E9D8] rounded-2xl border border-[#E8D4A2]/40 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Reservasi Selesai</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{totalCounts.Selesai || 0}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                    Selesai: {totalCounts.Selesai || 0}
                  </span>
                </div>
                <p className="text-xs text-[#8A7B6B] mt-2">Pembayaran bisa diedit hanya jika selesai.</p>
              </div>
            </div>

            {/* Modern Table Section */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              {/* Table Header with Search & Filter */}
              <div className="p-5 pb-4 border-b border-[#F0E6D3]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A]" />
                    <Input
                      placeholder="Cari nama, nomor HP, atau keluhan..."
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                      className="pl-10 rounded-xl border-[#E8D4A2]/40 bg-[#FDF8F0] focus:bg-white focus:border-[#C9A24A] focus:ring-[#C9A24A]/20"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={reservationFilter}
                      onChange={(e) => setReservationFilter(e.target.value as ReservationStatus | "Semua")}
                      className="appearance-none rounded-xl border border-[#E8D4A2]/40 bg-[#FDF8F0] px-4 py-2.5 pr-10 text-sm text-[#4A3F35] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 outline-none cursor-pointer"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Baru">Baru</option>
                      <option value="Dikonfirmasi">Dikonfirmasi</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {loadingReservations ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Memuat reservasi...</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Mohon tunggu sebentar</p>
                  </div>
                ) : filteredReservations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Belum ada reservasi</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Reservasi dari pengguna akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3]">
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Reservasi</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Nomor HP</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Tanggal</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden md:table-cell">Keluhan</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden lg:table-cell">Pembayaran</th>
                        <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((r) => (
                        <tr key={r.id} className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F5E6C8] flex items-center justify-center shrink-0">
                                <MessageSquare className="w-4 h-4 text-[#B8943F]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#4A3F35]">{r.name}</p>
                                <p className="text-xs text-[#B8A99A]">ID: #{r.id.slice(-4)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-[#B8A99A]" />
                              <span className="text-sm text-[#4A3F35]">{r.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#B8A99A]" />
                              <span className="text-sm text-[#4A3F35]">{r.date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 hidden md:table-cell">
                            <span className="text-sm text-[#4A3F35]">{r.complaint}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              r.status === "Baru"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : r.status === "Dikonfirmasi"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : r.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 hidden lg:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(getEffectivePaymentStatus(r))}`}>
                              {getEffectivePaymentStatus(r)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReservation(r)}
                              className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:text-[#8A6B2B] hover:bg-[#F5E6C8] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "branches": {
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0E6D3] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Kelola Cabang & Lokasi Praktik Klinik</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Daftar cabang resmi tempat praktik yang digunakan dokter & sistem reservasi</p>
              </div>
              <Button
                onClick={() => {
                  setEditingBranch({ name: "", code: "", address: "", phone: "", status: "active" });
                  setShowBranchModal(true);
                }}
                className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white font-bold rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah Cabang Klinik
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingBranches ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#8A7B6B]">Memuat daftar cabang klinik...</p>
                  </div>
                ) : branches.length === 0 ? (
                  <div className="text-center py-12 text-[#B8A99A]">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Belum Ada Cabang Klinik</p>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/60 font-bold text-[#8A7B6B] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Nama Cabang</th>
                        <th className="py-3.5 px-4">Kode</th>
                        <th className="py-3.5 px-4">Alamat Lengkap</th>
                        <th className="py-3.5 px-4">Telepon</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8] text-[#4A3F35]">
                      {branches.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FDF8F0]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{b.name}</td>
                          <td className="py-3.5 px-4 font-mono text-gray-500">{b.code || "-"}</td>
                          <td className="py-3.5 px-4 max-w-xs">{b.address || "-"}</td>
                          <td className="py-3.5 px-4">{b.phone || "-"}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${b.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                              {b.status === "active" ? "Aktif" : "Non-Aktif"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingBranch(b);
                                  setShowBranchModal(true);
                                }}
                                className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:bg-[#F5E6C8]"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBranch(b.id)}
                                className="w-8 h-8 p-0 rounded-full text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Add/Edit Branch */}
            {showBranchModal && editingBranch && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#4A3F35]/50 backdrop-blur-xs animate-in fade-in">
                <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden border-0">
                  <CardHeader className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white p-4">
                    <CardTitle className="text-base font-bold">
                      {editingBranch.id ? "Edit Cabang Klinik" : "Tambah Cabang Klinik Baru"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <form onSubmit={handleSaveBranch} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Nama Cabang Klinik</label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#C9A24A]"
                          placeholder="Contoh: Aesthetic Clinic Senayan Branch"
                          value={editingBranch.name}
                          onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Kode Cabang (Opsional)</label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#C9A24A]"
                          placeholder="Contoh: API-SN"
                          value={editingBranch.code || ""}
                          onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Alamat Lengkap</label>
                        <textarea
                          className="w-full h-20 p-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#C9A24A] resize-none"
                          placeholder="Alamat lengkap cabang..."
                          value={editingBranch.address || ""}
                          onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">No. Telepon / Kontak</label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#C9A24A]"
                          placeholder="Contoh: 021-5725000"
                          value={editingBranch.phone || ""}
                          onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Status Cabang</label>
                        <select
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#C9A24A] bg-white"
                          value={editingBranch.status}
                          onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value })}
                        >
                          <option value="active">Aktif</option>
                          <option value="inactive">Non-Aktif</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBranchModal(false)}
                          className="rounded-lg h-9 text-xs"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-lg h-9 text-xs font-bold"
                        >
                          Simpan
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      }

      case "users": {
        const userView = searchParams.get("view") || "list";
        const selectedUserId = searchParams.get("id");
        
        // Filter only users with role "user" or "patient"
        const regularUsers = users.filter(u => u.role === "user" || u.role === "patient");
        const selectedUser = regularUsers.find(u => String(u.id) === String(selectedUserId));

        const navigateToUserProfile = (userId: string) => {
          setSearchParams({ tab: "users", view: "profile", id: userId });
        };

        const navigateToUsersList = () => {
          setSearchParams({ tab: "users" });
        };

        // User Profile View
        if (userView === "profile" && selectedUser) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={navigateToUsersList}
                  className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali ke Daftar Pengguna
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9 gap-2"
                    onClick={() => {
                      setEditingUser({ ...selectedUser });
                      setShowEditUserModal(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit User
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-lg h-9 gap-2 bg-red-600 hover:bg-red-700 text-white"
                    disabled={!!deletingUser && deletingUser === selectedUser.id}
                    onClick={() => setUserToDelete({ id: selectedUser.id, name: selectedUser.name })}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    {deletingUser === selectedUser.id ? "Menghapus..." : "Hapus Akun"}
                  </Button>
                </div>
              </div>
              
              <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] relative">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                <CardContent className="relative px-6 pb-6 pt-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 sm:-mt-12">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white">
                        <User className="w-10 h-10" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left pb-1">
                      <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 bg-[#c9a24a]/10 text-[#a8843a] rounded-full text-xs font-medium">
                          Pengguna
                        </span>
                        {isMember(selectedUser) ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TIER_PRESENTATION[tierOf(selectedUser)].badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${TIER_PRESENTATION[tierOf(selectedUser)].dot}`} />
                            Member {TIER_PRESENTATION[tierOf(selectedUser)].label}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Status Membership */}
                  <div className="mt-6 rounded-2xl border border-gray-100 overflow-hidden">
                    <div className={`h-1.5 bg-gradient-to-r ${TIER_PRESENTATION[tierOf(selectedUser)].bar}`} />
                    <div className="px-5 py-4 bg-gradient-to-br from-[#FDF8F0] to-white">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            <Crown className={`w-5 h-5 ${isMember(selectedUser) ? "text-[#c9a24a]" : "text-gray-300"}`} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status Member</p>
                            <p className="text-sm font-bold text-gray-900">
                              Member {TIER_PRESENTATION[tierOf(selectedUser)].label}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Poin</p>
                            <p className="text-sm font-bold text-gray-900">{selectedUser.membership_points ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Mulai</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {selectedUser.membership_started_at ? new Date(selectedUser.membership_started_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Berakhir</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {selectedUser.membership_expires_at ? new Date(selectedUser.membership_expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informasi Dasar */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#c9a24a]" /> Informasi Dasar
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <InfoItem icon={<Phone className="w-4 h-4" />} label="Nomor WhatsApp" value={selectedUser.phone} />
                      <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={selectedUser.email} />
                      <InfoItem icon={<Calendar className="w-4 h-4" />} label="Tanggal Lahir" value={selectedUser.birthDate || "-"} />
                      <InfoItem icon={<User className="w-4 h-4" />} label="Jenis Kelamin" value={selectedUser.gender || "-"} />
                      <InfoItem icon={<Droplets className="w-4 h-4" />} label="Golongan Darah" value={selectedUser.bloodType || "-"} />
                      <InfoItem icon={<Briefcase className="w-4 h-4" />} label="Pekerjaan" value={selectedUser.job || "-"} />
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#c9a24a]" /> Alamat & Lokasi
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <InfoItem icon={<MapPin className="w-4 h-4" />} label="Alamat Lengkap" value={selectedUser.address || "-"} />
                      <InfoItem icon={<MapPin className="w-4 h-4" />} label="Provinsi" value={selectedUser.province || "-"} />
                      <InfoItem icon={<MapPin className="w-4 h-4" />} label="Kota / Kabupaten" value={selectedUser.city || "-"} />
                      <InfoItem icon={<MapPin className="w-4 h-4" />} label="Kecamatan" value={selectedUser.district || "-"} />
                    </div>
                  </div>

                  {/* Gaya Hidup & Segmentasi */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#c9a24a]" /> Gaya Hidup & Segmentasi
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <InfoItem icon={<Coffee className="w-4 h-4" />} label="Konsumsi Kopi/Teh" value={selectedUser.isCoffeeDrinker ? "Sering" : "Tidak"} />
                      <InfoItem icon={<Cigarette className="w-4 h-4" />} label="Perokok" value={selectedUser.isSmoker ? "Ya" : "Tidak"} />
                      <InfoItem icon={<Info className="w-4 h-4" />} label="Tahu Klinik Dari" value={selectedUser.sourceInfo || "-"} />
                      <InfoItem icon={<Shield className="w-4 h-4" />} label="Asuransi" value={selectedUser.insuranceProvider || "-"} />
                      <InfoItem
                        icon={<Info className="w-4 h-4" />}
                        label="Kunjungan Terakhir"
                        value={selectedUser.lastDentalVisit ? toLabel(selectedUser.lastDentalVisit, lastVisitOptions) : "-"}
                      />
                    </div>
                    
                    {/* Layanan yang Diminati */}
                    {selectedUser.interests && selectedUser.interests.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">Layanan yang Diminati</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.interests.map((interest: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-[#c9a24a]/10 text-[#a8843a] rounded-full text-xs font-medium">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(Array.isArray(selectedUser.dentalComplaints) && selectedUser.dentalComplaints.length > 0) ||
                    (Array.isArray(selectedUser.desiredServices) && selectedUser.desiredServices.length > 0) ||
                    (Array.isArray(selectedUser.currentDentalConditions) && selectedUser.currentDentalConditions.length > 0) ||
                    (Array.isArray(selectedUser.lifestyleInterests) && selectedUser.lifestyleInterests.length > 0) ||
                    (Array.isArray(selectedUser.treatmentGoals) && selectedUser.treatmentGoals.length > 0) ||
                    (Array.isArray(selectedUser.preferredCommunicationChannels) && selectedUser.preferredCommunicationChannels.length > 0) ? (
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-semibold">Keluhan Gigi</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {toLabels(selectedUser.dentalComplaints, complaintOptions).length ? (
                              toLabels(selectedUser.dentalComplaints, complaintOptions).map((x, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-semibold">Layanan Diminati (Segmentasi)</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {toLabels(selectedUser.desiredServices, desiredServiceOptions).length ? (
                              toLabels(selectedUser.desiredServices, desiredServiceOptions).map((x, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-semibold">Kondisi Gigi Saat Ini</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {toLabels(selectedUser.currentDentalConditions, currentConditionOptions).length ? (
                              toLabels(selectedUser.currentDentalConditions, currentConditionOptions).map((x, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-semibold">Minat & Lifestyle</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {toLabels(selectedUser.lifestyleInterests, lifestyleOptions).length ? (
                              toLabels(selectedUser.lifestyleInterests, lifestyleOptions).map((x, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-semibold">Tujuan Perawatan</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {toLabels(selectedUser.treatmentGoals, treatmentGoalOptions).length ? (
                              toLabels(selectedUser.treatmentGoals, treatmentGoalOptions).map((x, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-semibold">Channel Favorit</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {toLabels(selectedUser.preferredCommunicationChannels, communicationOptions).length ? (
                              toLabels(selectedUser.preferredCommunicationChannels, communicationOptions).map((x, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* ID & Metadata */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoItem icon={<Info className="w-4 h-4" />} label="Member ID" value={generateMemberId(selectedUser.id)} />
                      <InfoItem icon={<Calendar className="w-4 h-4" />} label="Bergabung" value={selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('id-ID') : "-"} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit User Modal (harus ada juga di Profile View) */}
              {showEditUserModal && editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                  <Card className="w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden border-0">
                    <CardHeader className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white p-4">
                      <CardTitle className="text-lg font-bold">Edit Informasi Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 max-h-[75vh] overflow-y-auto">
                      <form onSubmit={handleUpdateUser} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Nama Lengkap</label>
                            <input
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Email</label>
                            <input
                              type="email"
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.email || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Nomor WhatsApp</label>
                            <input
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.phone || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Membership Level</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.membership_level || "bronze"}
                              onChange={(e) => setEditingUser({ ...editingUser, membership_level: e.target.value })}
                            >
                              <option value="bronze">Bronze (Gratis)</option>
                              <option value="gold">Gold (Berbayar)</option>
                              <option value="platinum">Platinum (Berbayar)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Tanggal Lahir</label>
                            <input
                              type="date"
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.birthDate || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, birthDate: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Jenis Kelamin</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.gender || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                            >
                              <option value="">Pilih Jenis Kelamin</option>
                              {GENDER_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Golongan Darah</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.bloodType || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, bloodType: e.target.value })}
                            >
                              <option value="">Pilih Golongan Darah</option>
                              {BLOOD_TYPE_OPTIONS.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Pekerjaan</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.job || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, job: e.target.value })}
                            >
                              <option value="">Pilih Pekerjaan</option>
                              {JOB_OPTIONS.map((j) => (
                                <option key={j} value={j}>
                                  {j}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Provinsi</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.province || ""}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  province: e.target.value,
                                  city: "",
                                  district: "",
                                })
                              }
                            >
                              <option value="">Pilih Provinsi</option>
                              {PROVINCES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Kota / Kabupaten</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.city || ""}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  city: e.target.value,
                                  district: "",
                                })
                              }
                              disabled={!editingUser.province}
                            >
                              <option value="">{editingUser.province ? "Pilih Kota/Kab" : "Pilih Provinsi dulu"}</option>
                              {[
                                ...(editingUser.city && !cityOptions.includes(editingUser.city) ? [editingUser.city] : []),
                                ...cityOptions,
                              ].map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Kecamatan</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.district || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                              disabled={!editingUser.city}
                            >
                              <option value="">{editingUser.city ? "Pilih Kecamatan" : "Pilih Kota dulu"}</option>
                              {[
                                ...(editingUser.district && !districtOptions.includes(editingUser.district) ? [editingUser.district] : []),
                                ...districtOptions,
                              ].map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>

                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Alamat Lengkap</label>
                          <textarea
                            className="w-full h-20 p-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] resize-none"
                            value={editingUser.address || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Informasi (Tahu klinik dari?)</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.sourceInfo || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, sourceInfo: e.target.value })}
                            >
                              <option value="">Pilih Sumber</option>
                              <option value="instagram">Instagram</option>
                              <option value="tiktok">TikTok</option>
                              <option value="google">Google Maps/Search</option>
                              <option value="friends">Teman/Keluarga</option>
                              <option value="ads">Iklan Berbayar</option>
                              <option value="other">Lainnya</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Asuransi</label>
                            <input
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.insuranceProvider || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, insuranceProvider: e.target.value })}
                              placeholder="Asuransi (opsional)"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Kunjungan Terakhir ke Dokter Gigi</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.lastDentalVisit || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, lastDentalVisit: e.target.value })}
                            >
                              <option value="">-</option>
                              {lastVisitOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Kebiasaan Konsumsi</label>
                            <MultiSelect
                              options={consumptionOptions}
                              value={Array.isArray(editingUser.consumptionHabits) ? editingUser.consumptionHabits : []}
                              onChange={(next) => {
                                setEditingUser({
                                  ...editingUser,
                                  consumptionHabits: next,
                                  isCoffeeDrinker: Array.isArray(next) && next.includes("coffee_tea"),
                                  isSmoker: Array.isArray(next) && next.includes("smoker"),
                                });
                              }}
                              placeholder="Pilih kebiasaan"
                              searchPlaceholder="Cari..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700">Layanan yang Diminati</label>
                          <MultiSelect
                            options={INTEREST_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                            value={Array.isArray(editingUser.interests) ? editingUser.interests : []}
                            onChange={(next) => setEditingUser({ ...editingUser, interests: next })}
                            placeholder="Pilih layanan"
                            searchPlaceholder="Cari layanan..."
                          />
                        </div>

                        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Keluhan Gigi</label>
                            <MultiSelect
                              options={complaintOptions}
                              value={Array.isArray(editingUser.dentalComplaints) ? editingUser.dentalComplaints : []}
                              onChange={(next) => {
                                const arr = Array.isArray(next) ? next : [];
                                if (arr.includes("no_special_complaint")) {
                                  setEditingUser({ ...editingUser, dentalComplaints: ["no_special_complaint"] });
                                  return;
                                }
                                setEditingUser({
                                  ...editingUser,
                                  dentalComplaints: arr.filter((x) => x !== "no_special_complaint"),
                                });
                              }}
                              placeholder="Pilih keluhan"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Layanan yang Diminati (Segmentasi)</label>
                            <MultiSelect
                              options={desiredServiceOptions}
                              value={Array.isArray(editingUser.desiredServices) ? editingUser.desiredServices : []}
                              onChange={(next) => setEditingUser({ ...editingUser, desiredServices: next })}
                              placeholder="Pilih layanan"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Kondisi Gigi Saat Ini</label>
                            <MultiSelect
                              options={currentConditionOptions}
                              value={Array.isArray(editingUser.currentDentalConditions) ? editingUser.currentDentalConditions : []}
                              onChange={(next) => setEditingUser({ ...editingUser, currentDentalConditions: next })}
                              placeholder="Pilih kondisi"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Minat & Lifestyle</label>
                            <MultiSelect
                              options={lifestyleOptions}
                              value={Array.isArray(editingUser.lifestyleInterests) ? editingUser.lifestyleInterests : []}
                              onChange={(next) => setEditingUser({ ...editingUser, lifestyleInterests: next })}
                              placeholder="Pilih minat"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Tujuan Perawatan</label>
                            <MultiSelect
                              options={treatmentGoalOptions}
                              value={Array.isArray(editingUser.treatmentGoals) ? editingUser.treatmentGoals : []}
                              onChange={(next) => setEditingUser({ ...editingUser, treatmentGoals: next })}
                              placeholder="Pilih tujuan"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Channel Favorit</label>
                            <MultiSelect
                              options={communicationOptions}
                              value={Array.isArray(editingUser.preferredCommunicationChannels) ? editingUser.preferredCommunicationChannels : []}
                              onChange={(next) => setEditingUser({ ...editingUser, preferredCommunicationChannels: next })}
                              placeholder="Pilih channel"
                              searchPlaceholder="Cari..."
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2">
                          <label className="text-xs font-bold text-gray-700">Reset Sandi Pengguna</label>
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                            <input
                              type="password"
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={resetPasswordValue}
                              onChange={(e) => setResetPasswordValue(e.target.value)}
                              placeholder="Masukkan password baru"
                            />
                            <Button
                              type="button"
                              onClick={handleResetPassword}
                              disabled={isResettingPassword}
                              className="rounded-lg h-10 px-5 font-bold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isResettingPassword ? "Mereset..." : "Reset Sandi"}
                            </Button>
                          </div>
                          <p className="text-[11px] text-gray-500">Minimal 6 karakter. Setelah direset, pengguna bisa login memakai sandi baru.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              setShowEditUserModal(false);
                              setResetPasswordValue("");
                            }}
                            className="rounded-lg h-10 px-6 font-semibold"
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            disabled={isUpdatingUser}
                            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-lg h-10 px-6 font-bold shadow-lg disabled:opacity-50"
                          >
                            {isUpdatingUser ? "Menyimpan..." : "Simpan Perubahan"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Styled Confirmation Dialog (harus ada juga di Profile View) */}
              <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                  <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-center text-gray-900 font-bold">Hapus Akun</AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-gray-500">
                      Apakah Anda yakin ingin menghapus akun <span className="font-bold text-gray-900">{userToDelete?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="sm:justify-center gap-3 pt-2">
                    <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 font-semibold px-6 hover:bg-gray-50">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-lg shadow-red-200"
                    >
                      {deletingUser ? "Menghapus..." : "Ya, Hapus Akun"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        }

        // Default Users List View
        const domicileCounts = regularUsers.reduce<Record<string, number>>((acc, u) => {
          const d = u.domicile || "Tidak diketahui";
          acc[d] = (acc[d] || 0) + 1;
          return acc;
        }, {});
        const domicileLabels = Object.keys(domicileCounts).sort((a, b) => domicileCounts[b] - domicileCounts[a]);
        const domicileValues = domicileLabels.map((l) => domicileCounts[l]);
        const maxDomicile = Math.max(...domicileValues, 1);

        // Calculate member counts
        const bronzeCount = regularUsers.filter(u => tierOf(u) === 'bronze').length;
        const paidMemberCount = regularUsers.length - bronzeCount;

        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Pengguna</h2>
              <p className="text-sm text-[#8A7B6B] mt-1">Kelola database pengguna klinik dan lihat statistik domisili.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total Pengguna</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{regularUsers.length}</p>
              </div>

              <div className="bg-gradient-to-br from-[#FDF8F0] to-[#F5E9D8] rounded-2xl border border-[#E8D4A2]/40 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Member Berbayar</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{paidMemberCount}</p>
                <p className="text-xs text-[#B8A99A] mt-1">Gold & Platinum</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Member Bronze</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{bronzeCount}</p>
                <p className="text-xs text-[#B8A99A] mt-1">Gratis & otomatis</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Domisili Terbanyak</p>
                </div>
                <p className="text-2xl font-bold text-[#4A3F35]">{domicileLabels[0] ?? "-"}</p>
                <p className="text-xs text-[#B8A99A] mt-1">{domicileValues[0] ?? 0} pengguna</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Variasi Domisili</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{domicileLabels.length}</p>
                <p className="text-xs text-[#B8A99A] mt-1">wilayah berbeda</p>
              </div>
            </div>

            {/* Domisili Distribution */}
            {domicileLabels.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-[#B8943F]" />
                  Distribusi Pengguna berdasarkan Domisili
                </h3>
                <div className="space-y-3">
                  {domicileLabels.map((label, i) => {
                    const v = domicileValues[i] ?? 0;
                    const pct = Math.min((v / maxDomicile) * 100, 100);
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-28 sm:w-32 text-xs text-[#8A7B6B] flex-shrink-0 truncate">{label}</div>
                        <div className="flex-1 h-7 bg-[#FDF8F0] rounded-lg overflow-hidden relative">
                          <div
                            className="h-full rounded-lg transition-all duration-500 ease-out flex items-center px-2"
                            style={{ width: `${pct}%`, backgroundColor: "#C9A24A", opacity: 0.85 }}
                          >
                            {pct > 15 && <span className="text-[10px] text-white font-medium">{v}</span>}
                          </div>
                          {pct <= 15 && (
                            <span className="absolute left-[calc(var(--pct)+4px)] top-1/2 -translate-y-1/2 text-[10px] text-[#8A7B6B] font-medium" style={{ "--pct": `${pct}%` } as React.CSSProperties}>
                              {v}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#F0E6D3]">
                <h3 className="text-lg font-bold text-[#4A3F35]">Database Pengguna</h3>
              </div>
              <div className="overflow-x-auto">
                {loadingUsers ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Users className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Memuat data pengguna...</p>
                  </div>
                ) : regularUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Users className="w-7 h-7 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Belum ada pengguna</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Pengguna terdaftar akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3]">
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Pengguna</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Domisili</th>
                        <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8]">
                      {regularUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white">
                                <User className="w-5 h-5" strokeWidth={1.75} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#4A3F35]">{u.name}</p>
                                <p className="text-xs text-[#B8A99A]">{u.email || u.phone || 'Tanpa kontak'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            {isMember(u) ? (
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${TIER_PRESENTATION[tierOf(u)].badge}`}>
                                  Member {TIER_PRESENTATION[tierOf(u)].label}
                                </span>
                                {typeof u.membership_points === "number" && u.membership_points > 0 && (
                                  <span className="text-[11px] text-[#B8A99A] font-medium">{u.membership_points} pts</span>
                                )}
                              </div>
                            ) : null}
                          </td>
                          <td className="py-4 px-5 hidden sm:table-cell">
                            <span className="text-sm text-[#4A3F35]">{u.domicile || u.city || '-'}</span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateToUserProfile(u.id)}
                                className="text-[#B8943F] hover:text-[#9a7630] hover:bg-[#F5E6C8] h-8 w-8 p-0 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deletingUser === u.id}
                                onClick={() => setUserToDelete({ id: u.id, name: u.name })}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

              {/* Edit User Modal */}
              {showEditUserModal && editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                  <Card className="w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden border-0">
                    <CardHeader className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white p-4">
                      <CardTitle className="text-lg font-bold">Edit Informasi Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 max-h-[75vh] overflow-y-auto">
                      <form onSubmit={handleUpdateUser} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Nama Lengkap</label>
                            <input
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Email</label>
                            <input
                              type="email"
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.email || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Nomor WhatsApp</label>
                            <input
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.phone || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Membership Level</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.membership_level || "bronze"}
                              onChange={(e) => setEditingUser({ ...editingUser, membership_level: e.target.value })}
                            >
                              <option value="bronze">Bronze (Gratis)</option>
                              <option value="gold">Gold (Berbayar)</option>
                              <option value="platinum">Platinum (Berbayar)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Tanggal Lahir</label>
                            <input
                              type="date"
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.birthDate || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, birthDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Jenis Kelamin</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.gender || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                            >
                              <option value="">Pilih Jenis Kelamin</option>
                              {GENDER_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Golongan Darah</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.bloodType || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, bloodType: e.target.value })}
                            >
                              <option value="">Pilih Golongan Darah</option>
                              {BLOOD_TYPE_OPTIONS.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Pekerjaan</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.job || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, job: e.target.value })}
                            >
                              <option value="">Pilih Pekerjaan</option>
                              {JOB_OPTIONS.map((j) => (
                                <option key={j} value={j}>
                                  {j}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Provinsi</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.province || ""}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  province: e.target.value,
                                  city: "",
                                  district: "",
                                })
                              }
                            >
                              <option value="">Pilih Provinsi</option>
                              {PROVINCES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Kota / Kabupaten</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.city || ""}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  city: e.target.value,
                                  district: "",
                                })
                              }
                              disabled={!editingUser.province}
                            >
                              <option value="">{editingUser.province ? "Pilih Kota/Kab" : "Pilih Provinsi dulu"}</option>
                              {[
                                ...(editingUser.city && !cityOptions.includes(editingUser.city) ? [editingUser.city] : []),
                                ...cityOptions,
                              ].map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Kecamatan</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.district || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                              disabled={!editingUser.city}
                            >
                              <option value="">{editingUser.city ? "Pilih Kecamatan" : "Pilih Kota dulu"}</option>
                              {[
                                ...(editingUser.district && !districtOptions.includes(editingUser.district) ? [editingUser.district] : []),
                                ...districtOptions,
                              ].map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Alamat Lengkap</label>
                          <textarea
                            className="w-full h-20 p-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] resize-none"
                            value={editingUser.address || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Informasi (Tahu klinik dari?)</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.sourceInfo || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, sourceInfo: e.target.value })}
                            >
                              <option value="">Pilih Sumber</option>
                              <option value="instagram">Instagram</option>
                              <option value="tiktok">TikTok</option>
                              <option value="google">Google Maps/Search</option>
                              <option value="friends">Teman/Keluarga</option>
                              <option value="ads">Iklan Berbayar</option>
                              <option value="other">Lainnya</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Asuransi</label>
                            <input
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={editingUser.insuranceProvider || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, insuranceProvider: e.target.value })}
                              placeholder="Asuransi (opsional)"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Kunjungan Terakhir ke Dokter Gigi</label>
                            <select
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] bg-white"
                              value={editingUser.lastDentalVisit || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, lastDentalVisit: e.target.value })}
                            >
                              <option value="">-</option>
                              {lastVisitOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Kebiasaan Konsumsi</label>
                            <MultiSelect
                              options={consumptionOptions}
                              value={Array.isArray(editingUser.consumptionHabits) ? editingUser.consumptionHabits : []}
                              onChange={(next) => {
                                setEditingUser({
                                  ...editingUser,
                                  consumptionHabits: next,
                                  isCoffeeDrinker: Array.isArray(next) && next.includes("coffee_tea"),
                                  isSmoker: Array.isArray(next) && next.includes("smoker"),
                                });
                              }}
                              placeholder="Pilih kebiasaan"
                              searchPlaceholder="Cari..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700">Layanan yang Diminati</label>
                          <MultiSelect
                            options={INTEREST_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                            value={Array.isArray(editingUser.interests) ? editingUser.interests : []}
                            onChange={(next) => setEditingUser({ ...editingUser, interests: next })}
                            placeholder="Pilih layanan"
                            searchPlaceholder="Cari layanan..."
                          />
                        </div>

                        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Keluhan Gigi</label>
                            <MultiSelect
                              options={complaintOptions}
                              value={Array.isArray(editingUser.dentalComplaints) ? editingUser.dentalComplaints : []}
                              onChange={(next) => {
                                const arr = Array.isArray(next) ? next : [];
                                if (arr.includes("no_special_complaint")) {
                                  setEditingUser({ ...editingUser, dentalComplaints: ["no_special_complaint"] });
                                  return;
                                }
                                setEditingUser({
                                  ...editingUser,
                                  dentalComplaints: arr.filter((x) => x !== "no_special_complaint"),
                                });
                              }}
                              placeholder="Pilih keluhan"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Layanan yang Diminati (Segmentasi)</label>
                            <MultiSelect
                              options={desiredServiceOptions}
                              value={Array.isArray(editingUser.desiredServices) ? editingUser.desiredServices : []}
                              onChange={(next) => setEditingUser({ ...editingUser, desiredServices: next })}
                              placeholder="Pilih layanan"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Kondisi Gigi Saat Ini</label>
                            <MultiSelect
                              options={currentConditionOptions}
                              value={Array.isArray(editingUser.currentDentalConditions) ? editingUser.currentDentalConditions : []}
                              onChange={(next) => setEditingUser({ ...editingUser, currentDentalConditions: next })}
                              placeholder="Pilih kondisi"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Minat & Lifestyle</label>
                            <MultiSelect
                              options={lifestyleOptions}
                              value={Array.isArray(editingUser.lifestyleInterests) ? editingUser.lifestyleInterests : []}
                              onChange={(next) => setEditingUser({ ...editingUser, lifestyleInterests: next })}
                              placeholder="Pilih minat"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Tujuan Perawatan</label>
                            <MultiSelect
                              options={treatmentGoalOptions}
                              value={Array.isArray(editingUser.treatmentGoals) ? editingUser.treatmentGoals : []}
                              onChange={(next) => setEditingUser({ ...editingUser, treatmentGoals: next })}
                              placeholder="Pilih tujuan"
                              searchPlaceholder="Cari..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Channel Favorit</label>
                            <MultiSelect
                              options={communicationOptions}
                              value={Array.isArray(editingUser.preferredCommunicationChannels) ? editingUser.preferredCommunicationChannels : []}
                              onChange={(next) => setEditingUser({ ...editingUser, preferredCommunicationChannels: next })}
                              placeholder="Pilih channel"
                              searchPlaceholder="Cari..."
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2">
                          <label className="text-xs font-bold text-gray-700">Reset Sandi Pengguna</label>
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                            <input
                              type="password"
                              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a]"
                              value={resetPasswordValue}
                              onChange={(e) => setResetPasswordValue(e.target.value)}
                              placeholder="Masukkan password baru"
                            />
                            <Button
                              type="button"
                              onClick={handleResetPassword}
                              disabled={isResettingPassword}
                              className="rounded-lg h-10 px-5 font-bold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isResettingPassword ? "Mereset..." : "Reset Sandi"}
                            </Button>
                          </div>
                          <p className="text-[11px] text-gray-500">Minimal 6 karakter. Setelah direset, pengguna bisa login memakai sandi baru.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              setShowEditUserModal(false);
                              setResetPasswordValue("");
                            }}
                            className="rounded-lg h-10 px-6 font-semibold"
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            disabled={isUpdatingUser}
                            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-lg h-10 px-6 font-bold shadow-lg disabled:opacity-50"
                          >
                            {isUpdatingUser ? "Menyimpan..." : "Simpan Perubahan"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Styled Confirmation Dialog */}
              <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                  <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-center text-gray-900 font-bold">Hapus Akun</AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-gray-500">
                      Apakah Anda yakin ingin menghapus akun <span className="font-bold text-gray-900">{userToDelete?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="sm:justify-center gap-3 pt-2">
                    <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 font-semibold px-6 hover:bg-gray-50">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-lg shadow-red-200"
                    >
                      {deletingUser ? "Menghapus..." : "Ya, Hapus Akun"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
      }

      case "content-blog": {
        const contentView = searchParams.get("view") || "posts";
        const editorId = searchParams.get("id");
        if (contentView === "editor") {
          const currentPost = editorId ? apiPosts.find((p) => String(p.id) === editorId) : undefined;
          return (
            <BlogEditorPanel
              editorId={editorId}
              apiPost={currentPost}
              sessionName={session.name}
              token={token}
              onBack={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("tab", "content-blog");
                  next.set("view", "posts");
                  next.delete("id");
                  return next;
                })
              }
              onSaved={() => {
                fetchApiPosts();
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("tab", "content-blog");
                  next.set("view", "posts");
                  next.delete("id");
                  return next;
                });
              }}
            />
          );
        }

        if (contentView === "posts") {
          const displayPosts = apiPosts;
          const isPublishedPost = (status?: string) => {
            if (!status) return true;
            return status.toLowerCase() === "published";
          };

          const filtered = displayPosts
            .filter((p) => (filterStatus === "All" ? true : filterStatus === "Published" ? isPublishedPost(p.status) : !isPublishedPost(p.status)))
            .filter((p) => (filterCategory === "Semua" ? true : p.category === filterCategory))
            .filter((p) => {
              const q = search.trim().toLowerCase();
              if (!q) return true;
              return (
                (p.title || "").toLowerCase().includes(q) ||
                (p.slug || "").toLowerCase().includes(q) ||
                (p.category || "").toLowerCase().includes(q)
              );
            });

          // Calculate stats
          const publishedCount = displayPosts.filter((p) => isPublishedPost(p.status)).length;
          const draftCount = displayPosts.filter((p) => !isPublishedPost(p.status)).length;
          const categoriesUsed = new Set(displayPosts.map((p) => p.category).filter(Boolean)).size;

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Artikel</h2>
                  <p className="text-sm text-[#8A7B6B] mt-1">Kelola artikel untuk halaman Blog klinik.</p>
                </div>
                <Button
                  className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", "content-blog");
                      next.set("view", "editor");
                      next.delete("id");
                      return next;
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Artikel Baru
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#B8943F]" />
                    </div>
                    <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total Artikel</p>
                  </div>
                  <p className="text-3xl font-bold text-[#4A3F35]">{displayPosts.length}</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                      <Eye className="w-5 h-5 text-[#B8943F]" />
                    </div>
                    <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Dipublikasikan</p>
                  </div>
                  <p className="text-3xl font-bold text-[#4A3F35]">{publishedCount}</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                      <Tag className="w-5 h-5 text-[#B8943F]" />
                    </div>
                    <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Kategori</p>
                  </div>
                  <p className="text-3xl font-bold text-[#4A3F35]">{categoriesUsed}</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFilterStatus("All")}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filterStatus === "All"
                          ? "bg-[#C9A24A] text-white"
                          : "bg-[#FDF8F0] text-[#8A7B6B] hover:bg-[#F0E6D3]"
                      }`}
                    >
                      Semua ({displayPosts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("Published")}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filterStatus === "Published"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      Publis ({publishedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("Draft")}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filterStatus === "Draft"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Draft ({draftCount})
                    </button>

                    <div className="h-6 w-px bg-[#F0E6D3] hidden sm:block" />

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#8A7B6B]">Kategori</span>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="h-9 rounded-xl border border-[#F0E6D3] bg-white px-3 text-sm text-[#4A3F35] outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
                      >
                        {["Semua", "Estetika", "Tips", "Ortodonti", "Anak", "Restoratif", "Informasi"].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="w-full md:w-80">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A]" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari artikel..."
                        className="pl-10 rounded-xl border-[#F0E6D3] focus-visible:ring-[#C9A24A]/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Table */}
              <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-[#B8A99A]" />
                      </div>
                      <p className="text-[#4A3F35] font-medium">Tidak ada artikel</p>
                      <p className="text-sm text-[#B8A99A] mt-1">Coba ubah filter atau cari kata kunci lain</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#F0E6D3]">
                          <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Artikel</th>
                          <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                          <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden md:table-cell">Tanggal</th>
                          <th className="text-center py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                          <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5F0E8]">
                        {filtered.map((p: any) => (
                          <tr key={p.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-10 rounded-lg bg-[#FDF8F0] overflow-hidden border border-[#F0E6D3] flex-shrink-0">
                                  <img src={p.cover_image_url || p.featuredImage || "/blog/placeholder.jpg"} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    className="text-left text-sm font-semibold text-[#4A3F35] hover:text-[#B8943F] transition-colors truncate block max-w-xs"
                                    onClick={() => {
                                      setSearchParams((prev) => {
                                        const next = new URLSearchParams(prev);
                                        next.set("tab", "content-blog");
                                        next.set("view", "editor");
                                        next.set("id", String(p.id));
                                        return next;
                                      });
                                    }}
                                  >
                                    {p.title}
                                  </button>
                                  <p className="text-xs text-[#B8A99A] truncate">{p.slug || p.category || "-"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 hidden sm:table-cell">
                              <span className="text-sm text-[#4A3F35]">{p.category || "-"}</span>
                            </td>
                            <td className="py-4 px-5 hidden md:table-cell">
                              <span className="text-sm text-[#8A7B6B]">{p.published_at ? new Date(p.published_at).toLocaleDateString("id-ID") : p.date || "-"}</span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                isPublishedPost(p.status)
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                              }`}>
                                {isPublishedPost(p.status) ? "Publis" : "Draft"}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#B8943F] hover:text-[#9a7630] hover:bg-[#F5E6C8] h-8 w-8 p-0 rounded-lg"
                                  onClick={() => {
                                    setSearchParams((prev) => {
                                      const next = new URLSearchParams(prev);
                                      next.set("tab", "content-blog");
                                      next.set("view", "editor");
                                      next.set("id", String(p.id));
                                      return next;
                                    });
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                                  onClick={async () => {
                                    const ok = window.confirm(`Hapus artikel "${p.title}"?`);
                                    if (!ok) return;
                                    if (apiPosts.length > 0) {
                                      try {
                                        const res = await fetch(`${API_BASE}/admin/posts/${p.id}`, {
                                          method: "DELETE",
                                          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
                                        });
                                        if (res.ok) {
                                          toast({ title: "Berhasil", message: "Artikel dihapus", variant: "success" });
                                          await fetchApiPosts();
                                        }
                                      } catch (e) { logger.error("Gagal hapus artikel", e); }
                                    } else {
                                      setPosts((prev) => prev.filter((x) => x.id !== p.id));
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0E6D3]">
                  <span className="text-sm text-[#8A7B6B]">
                    {filtered.length} artikel
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-[#F0E6D3] text-[#8A7B6B]" disabled>
                      Sebelumnya
                    </Button>
                    <Button variant="outline" className="rounded-xl border-[#F0E6D3] text-[#8A7B6B]" disabled>
                      Selanjutnya
                    </Button>
                  </div>
                </div>
      </div>
    </div>
  );
}

function DownloadAppEditor({ current, editorId, token, fetchApiDownloadApps, setSearchParams }: any) {
  const isNew = !editorId;

  const [editor, setEditor] = useState({
    title: current?.title || "",
    description: current?.description || "",
    version: current?.version || "",
    platform: current?.platform || "android",
    downloadLink: current?.download_link || "",
    isActive: current?.is_active ?? true,
    isDevelopment: current?.is_development ?? true,
    sortOrder: current?.sort_order ?? 0,
    apkUrl: current?.apk_url || "",
    apkFile: null as File | null,
  });

  useEffect(() => {
    if (current) {
      setEditor({
        title: current.title || "",
        description: current.description || "",
        version: current.version || "",
        platform: current.platform || "android",
        downloadLink: current.download_link || "",
        isActive: current.is_active ?? true,
        isDevelopment: current.is_development ?? true,
        sortOrder: current.sort_order ?? 0,
        apkUrl: current.apk_url || "",
        apkFile: null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof editor>) => {
    setEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editor.title);
      formData.append("description", editor.description);
      formData.append("version", editor.version);
      formData.append("platform", editor.platform);
      formData.append("download_link", editor.downloadLink);
      formData.append("is_active", editor.isActive ? "1" : "0");
      formData.append("is_development", editor.isDevelopment ? "1" : "0");
      formData.append("sort_order", String(editor.sortOrder));
      if (editor.apkFile) {
        formData.append("apk_file", editor.apkFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/download-apps`
        : `${API_BASE}/admin/download-apps/${editorId}`;

      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        logger.error("Gagal simpan download app", await res.text());
        return;
      }

      toast({
        title: "Berhasil",
        message: isNew ? "Aplikasi berhasil ditambahkan" : "Aplikasi diperbarui",
        variant: "success",
      });
      await fetchApiDownloadApps();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-download");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      logger.error("Gagal simpan download app", e);
    }
  };

  const saved = editor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200 h-9 text-xs"
            onClick={() =>
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-download");
                next.set("view", "list");
                next.delete("id");
                return next;
              })
            }
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? "Tambah Aplikasi" : "Edit Aplikasi"}
          </h2>
        </div>
        <Button
          className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm h-9"
          onClick={handleSave}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isNew ? "Tambah Aplikasi" : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Informasi Aplikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Judul Aplikasi</label>
                <Input
                  value={saved.title}
                  onChange={(e) => updateSaved({ title: e.target.value })}
                  placeholder="Aesthetic Pondok Indah"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Deskripsi</label>
                <textarea
                  className="w-full h-20 p-3 rounded-sm border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] resize-none"
                  value={saved.description}
                  onChange={(e) => updateSaved({ description: e.target.value })}
                  placeholder="Deskripsi aplikasi..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Versi</label>
                  <Input
                    value={saved.version}
                    onChange={(e) => updateSaved({ version: e.target.value })}
                    placeholder="1.0.0"
                    className="rounded-sm border-gray-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Platform</label>
                  <select
                    value={saved.platform}
                    onChange={(e) => updateSaved({ platform: e.target.value })}
                    className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="android,ios">Android & iOS</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Link Download Eksternal</label>
                <Input
                  value={saved.downloadLink}
                  onChange={(e) => updateSaved({ downloadLink: e.target.value })}
                  placeholder="https://play.google.com/store/apps/..."
                  className="rounded-sm border-gray-200"
                />
                <p className="text-xs text-gray-400">Opsional. Isi jika aplikasi tersedia di Google Play / App Store.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">File APK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept=".apk,.zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    updateSaved({ apkUrl: URL.createObjectURL(file), apkFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[4/3] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.apkUrl ? (
                    <div className="text-center px-4">
                      <Download className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="mt-2 text-xs font-semibold text-emerald-700">{saved.apkFile?.name || "APK tersedia"}</p>
                      {saved.apkFile && (
                        <p className="text-xs text-emerald-600">{(saved.apkFile.size / 1048576).toFixed(1)} MB</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Klik untuk upload APK</p>
                      <p className="text-xs text-emerald-700/70">APK atau ZIP (Maks. 100MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
              {saved.apkUrl && !saved.apkFile && (
                <div className="text-xs text-gray-500 text-center">
                  File: {saved.apkUrl.split("/").pop()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Aktif</label>
                <input
                  type="checkbox"
                  checked={saved.isActive}
                  onChange={(e) => updateSaved({ isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Mode Development</label>
                <input
                  type="checkbox"
                  checked={saved.isDevelopment}
                  onChange={(e) => updateSaved({ isDevelopment: e.target.checked })}
                  className="rounded border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Urutan</label>
                <Input
                  type="number"
                  min={0}
                  value={saved.sortOrder}
                  onChange={(e) => updateSaved({ sortOrder: Number(e.target.value) })}
                  className="rounded-sm border-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-[#c9a24a]/15 rounded-sm flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#c9a24a]" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Artikel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Kelola konten artikel, tambah, edit, atau hapus artikel untuk informasi pasien.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm text-sm h-10"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", "content-blog");
                      next.set("view", "posts");
                      next.delete("id");
                      return next;
                    });
                  }}
                >
                  Kelola Artikel
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-[#c9a24a]/10 rounded-sm flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#a8843a]" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Cerita</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Update konten halaman cerita dan testimoni dari pasien.</p>
                <Button
                  variant="outline"
                  className="w-full rounded-sm border-gray-200 text-sm h-10"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", "content-testimonials");
                      next.delete("view");
                      next.delete("id");
                      return next;
                    });
                  }}
                >
                  Kelola Testimoni
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      case "content-popup": {
        return (
          <PopupPage
            token={token || ""}
            apiPopups={apiPopups}
            fetchApiPopups={fetchApiPopups}
          />
        );
      }

      case "content-gallery": {
        if (contentView === "editor") {
          const current = editorId ? apiGalleryItems.find((g) => String(g.id) === editorId) : undefined;
          return (
            <GalleryEditor 
              current={current} 
              editorId={editorId} 
              token={token} 
              fetchApiGallery={fetchApiGallery} 
              setSearchParams={setSearchParams} 
            />
          );
        }

        return (
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Galeri</CardTitle>
                <p className="text-sm text-gray-500">Manajemen galeri</p>
              </div>
              <Button
                className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-sm h-9"
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("tab", "content-gallery");
                    next.set("view", "editor");
                    next.delete("id");
                    return next;
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Gambar</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Judul</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Kategori</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs sm:text-sm text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiGalleryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-gray-400 text-center py-8 text-base">Belum ada gambar.</TableCell>
                    </TableRow>
                  ) : (
                    apiGalleryItems.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="w-16 h-12 rounded-sm bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                            {(item.image_url || item.imageUrl) ? <img src={item.image_url || item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <Image className="w-4 h-4 text-gray-400" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm sm:text-base">{item.title}</TableCell>
                        <TableCell className="text-sm sm:text-base">{item.category}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="rounded-sm border-gray-200 h-9 text-xs"
                            onClick={() => {
                              setSearchParams((prev) => {
                                const next = new URLSearchParams(prev);
                                next.set("tab", "content-gallery");
                                next.set("view", "editor");
                                next.set("id", String(item.id));
                                return next;
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-sm border-gray-200 h-9 text-xs ml-2"
                            onClick={async () => {
                              const ok = window.confirm(`Hapus galeri "${item.title}"?`);
                              if (!ok) return;
                              if (apiGalleryItems.length > 0) {
                                try {
                                  const res = await fetch(`${API_BASE}/admin/gallery-items/${item.id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
                                  });
                                  if (res.ok) {
                                    toast({ title: "Berhasil", message: "Galeri dihapus", variant: "success" });
                                    await fetchApiGallery();
                                  }
                                } catch (e) { logger.error("Gagal hapus galeri", e); }
                              } else {
                                setApiGalleryItems((prev: any[]) => prev.filter((g: any) => g.id !== item.id));
                              }
                            }}
                          >
                            Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      }

      case "content-testimonials": {
        if (contentView === "editor") {
          const current = editorId ? apiTestimonials.find((t) => String(t.id) === editorId) : undefined;
          return (
            <TestimonialEditor
              current={current}
              editorId={editorId}
              token={token}
              fetchApiTestimonials={fetchApiTestimonials}
              setSearchParams={setSearchParams}
            />
          );
        }

        return (
          <div className="space-y-4">
            <Card className="rounded-sm border-0 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Testimoni Pasien</CardTitle>
                  <p className="text-sm text-gray-500">Kelola testimoni pasien</p>
                </div>
                <Button
                  className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm h-9"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", "content-testimonials");
                      next.set("view", "editor");
                      next.delete("id");
                      return next;
                    });
                  }}
                >
                  Tambah
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Nama</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Rating</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Pesan</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs sm:text-sm text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiTestimonials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-gray-400 text-center py-8 text-base">Belum ada testimoni.</TableCell>
                      </TableRow>
                    ) : (
                      apiTestimonials.map((t: any) => (
                        <TableRow key={t.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium text-sm sm:text-base">{t.name}</TableCell>
                          <TableCell className="text-sm sm:text-base">{t.rating}/5</TableCell>
                          <TableCell className="text-sm sm:text-base max-w-[360px]"><p className="line-clamp-2 text-gray-700">{t.quote || t.message}</p></TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#c9a24a] hover:bg-[#c9a24a]/10"
                              onClick={() => {
                                setSearchParams((prev) => {
                                  const next = new URLSearchParams(prev);
                                  next.set("tab", "content-testimonials");
                                  next.set("view", "editor");
                                  next.set("id", t.id);
                                  return next;
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={async () => {
                                const ok = window.confirm(`Hapus testimoni dari \"${t.name}\"?`);
                                if (!ok) return;
                                try {
                                  const res = await fetch(`${API_BASE}/admin/testimonials/${t.id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${token}` },
                                  });
                                  if (res.ok) {
                                    toast({ title: "Berhasil", message: "Testimoni dihapus", variant: "success" });
                                    await fetchApiTestimonials();
                                  }
                                } catch (e) { logger.error("Gagal hapus testimoni", e); }
                              }}
                            >
                              Hapus
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      }

      case "content-promo": {
        if (contentView === "editor") {
          const currentPromo = editorId ? apiPromos.find((p) => String(p.id) === editorId) : undefined;
          return (
            <PromoEditor
              current={currentPromo}
              editorId={editorId}
              token={token}
              fetchApiPromos={fetchApiPromos}
              setSearchParams={setSearchParams}
            />
          );
        }

        const filteredPromos = apiPromos.filter((p: any) => {
          const matchSearch = !promoSearch || p.title?.toLowerCase().includes(promoSearch.toLowerCase()) || p.description?.toLowerCase().includes(promoSearch.toLowerCase());
          const matchCategory = promoCategoryFilter === "Semua" || p.category?.toLowerCase() === promoCategoryFilter.toLowerCase();
          const matchStatus = promoStatusFilter === "Semua" || (promoStatusFilter === "Aktif" ? p.is_active : !p.is_active);
          return matchSearch && matchCategory && matchStatus;
        });

        const activeCount = apiPromos.filter((p: any) => p.is_active).length;
        const inactiveCount = apiPromos.filter((p: any) => !p.is_active).length;

        return (
          <div className="space-y-5">
            {/* Header & Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#F0E6D3] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#8A7B6B] font-medium">Total Promo</p>
                  <p className="text-2xl font-bold text-[#4A3F35] mt-0.5">{apiPromos.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3] flex items-center justify-center text-[#B8943F]">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#F0E6D3] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Promo Aktif</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-0.5">{activeCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#F0E6D3] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Promo Non-aktif</p>
                  <p className="text-2xl font-bold text-gray-600 mt-0.5">{inactiveCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Main Table Card */}
            <Card className="rounded-2xl border border-[#F0E6D3] shadow-sm bg-white overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0E6D3] p-5">
                <div>
                  <CardTitle className="text-lg font-bold text-[#4A3F35]">Daftar All Promo</CardTitle>
                  <p className="text-xs text-[#8A7B6B] mt-0.5">Kelola seluruh promo penawaran klinik, status aktif, dan periode promo.</p>
                </div>
                <Button
                  className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 h-10"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", "content-promo");
                      next.set("view", "editor");
                      next.delete("id");
                      return next;
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Promo Baru
                </Button>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#F0E6D3]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={promoSearch}
                      onChange={(e) => setPromoSearch(e.target.value)}
                      placeholder="Cari promo berdasarkan judul..."
                      className="pl-9 bg-white border-[#F0E6D3] rounded-xl text-xs h-9 focus-visible:ring-[#C9A24A]/30"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={promoCategoryFilter}
                      onChange={(e) => setPromoCategoryFilter(e.target.value)}
                      className="h-9 rounded-xl border border-[#F0E6D3] bg-white px-3 text-xs text-[#4A3F35] outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                    <select
                      value={promoStatusFilter}
                      onChange={(e) => setPromoStatusFilter(e.target.value)}
                      className="h-9 rounded-xl border border-[#F0E6D3] bg-white px-3 text-xs text-[#4A3F35] outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Aktif">Status: Aktif</option>
                      <option value="Non-aktif">Status: Non-aktif</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-[#F0E6D3]">
                  <Table>
                    <TableHeader className="bg-[#FAF8F5]">
                      <TableRow className="hover:bg-transparent border-b border-[#F0E6D3]">
                        <TableHead className="text-[#4A3F35] font-bold text-xs">Gambar</TableHead>
                        <TableHead className="text-[#4A3F35] font-bold text-xs">Judul & Slug</TableHead>
                        <TableHead className="text-[#4A3F35] font-bold text-xs">Kategori</TableHead>
                        <TableHead className="text-[#4A3F35] font-bold text-xs">Status (Quick Switch)</TableHead>
                        <TableHead className="text-[#4A3F35] font-bold text-xs">Periode</TableHead>
                        <TableHead className="text-[#4A3F35] font-bold text-xs text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPromos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-gray-400 text-center py-10 text-sm">
                            {apiPromos.length === 0 ? "Belum ada promo terdaftar. Klik 'Tambah Promo Baru' untuk membuat." : "Tidak ada promo yang cocok dengan pencarian / filter."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPromos.map((p: any) => {
                          const cat = (p.category || "Bronze").toLowerCase();
                          let catBg = "bg-amber-100 text-amber-800 border-amber-200";
                          if (cat === "gold") catBg = "bg-[#C59E3F]/15 text-[#A37E28] border-[#C59E3F]/30";
                          if (cat === "platinum") catBg = "bg-slate-100 text-slate-700 border-slate-300";
                          if (cat === "diamond") catBg = "bg-cyan-100 text-cyan-800 border-cyan-200";

                          return (
                            <TableRow key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors border-b border-gray-100">
                              <TableCell>
                                <div className="w-14 h-11 rounded-lg bg-[#FAF8F5] overflow-hidden border border-[#F0E6D3] flex items-center justify-center relative">
                                  {getStorageUrl(p.image_url || p.image_path) ? (
                                    <img
                                      src={getStorageUrl(p.image_url || p.image_path)!}
                                      alt={p.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (sibling) sibling.style.display = "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-full h-full flex items-center justify-center bg-[#FAF8F5] text-[#B8943F]"
                                    style={{ display: getStorageUrl(p.image_url || p.image_path) ? "none" : "flex" }}
                                  >
                                    <Tag className="w-4 h-4 text-[#B8943F]/70" />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <button
                                    type="button"
                                    className="text-left font-bold text-sm text-[#4A3F35] hover:text-[#C9A24A] transition-colors"
                                    onClick={() => {
                                      setSearchParams((prev) => {
                                        const next = new URLSearchParams(prev);
                                        next.set("tab", "content-promo");
                                        next.set("view", "editor");
                                        next.set("id", String(p.id));
                                        return next;
                                      });
                                    }}
                                  >
                                    {p.title}
                                  </button>
                                  <p className="text-[11px] text-gray-400 font-mono">/{p.slug}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catBg}`}>
                                  {p.category || "Bronze"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => togglePromoStatus(p)}
                                    title="Klik untuk mengubah status aktif/non-aktif promo"
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${p.is_active ? "bg-emerald-500" : "bg-red-500"}`}
                                  >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                                  </button>
                                  <span className={`text-xs font-semibold ${p.is_active ? "text-emerald-700" : "text-red-600"}`}>
                                    {p.is_active ? "Aktif" : "Non-aktif"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-gray-600">
                                {p.starts_at ? new Date(p.starts_at).toLocaleDateString("id-ID") : "-"} s/d {p.ends_at ? new Date(p.ends_at).toLocaleDateString("id-ID") : "-"}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <Button
                                  variant="outline"
                                  className="rounded-lg border-[#F0E6D3] h-8 text-xs text-[#4A3F35] hover:bg-[#FAF8F5] mr-2"
                                  onClick={() => {
                                    setSearchParams((prev) => {
                                      const next = new URLSearchParams(prev);
                                      next.set("tab", "content-promo");
                                      next.set("view", "editor");
                                      next.set("id", String(p.id));
                                      return next;
                                    });
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs"
                                  onClick={async () => {
                                    const ok = window.confirm(`Hapus promo "${p.title}"?`);
                                    if (!ok) return;
                                    try {
                                      const res = await fetch(`${API_BASE}/admin/promos/${p.id}`, {
                                        method: "DELETE",
                                        headers: { "Authorization": `Bearer ${token}` },
                                      });
                                      if (res.ok) {
                                        toast({ title: "Berhasil", message: "Promo berhasil dihapus", variant: "success" });
                                        await fetchApiPromos();
                                      }
                                    } catch (e) { logger.error("Gagal hapus promo", e); }
                                  }}
                                >
                                  Hapus
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      case "content-download": {
        if (contentView === "editor") {
          const currentApp = editorId ? apiDownloadApps.find((p: any) => String(p.id) === editorId) : undefined;
          return (
            <DownloadAppEditor
              current={currentApp}
              editorId={editorId}
              token={token}
              fetchApiDownloadApps={fetchApiDownloadApps}
              setSearchParams={setSearchParams}
            />
          );
        }

        return (
          <div className="space-y-4">
            <Card className="rounded-sm border-0 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Download Aplikasi</CardTitle>
                  <p className="text-sm text-gray-500">Kelola aplikasi download untuk halaman Download</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
                    onClick={() => {
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("tab", "content-download");
                        next.set("view", "editor");
                        next.delete("id");
                        return next;
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah App
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Judul</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Versi</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Platform</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiDownloadApps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-gray-400 text-center py-8 text-base">
                            Belum ada aplikasi download.
                          </TableCell>
                        </TableRow>
                      ) : (
                        apiDownloadApps.map((p: any) => (
                          <TableRow key={p.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium text-sm sm:text-base">
                              <button
                                type="button"
                                className="text-left hover:text-[#a8843a]"
                                onClick={() => {
                                  setSearchParams((prev) => {
                                    const next = new URLSearchParams(prev);
                                    next.set("tab", "content-download");
                                    next.set("view", "editor");
                                    next.set("id", String(p.id));
                                    return next;
                                  });
                                }}
                              >
                                {p.title}
                              </button>
                            </TableCell>
                            <TableCell className="text-sm sm:text-base">{p.version || "-"}</TableCell>
                            <TableCell className="text-sm sm:text-base">{p.platform || "-"}</TableCell>
                            <TableCell className="text-sm sm:text-base">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                {p.is_development ? "Development" : p.is_active ? "Rilis" : "Nonaktif"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button
                                variant="outline"
                                className="rounded-sm border-gray-200 h-9 text-xs mr-2"
                                onClick={() => {
                                  setSearchParams((prev) => {
                                    const next = new URLSearchParams(prev);
                                    next.set("tab", "content-download");
                                    next.set("view", "editor");
                                    next.set("id", String(p.id));
                                    return next;
                                  });
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={async () => {
                                  const ok = window.confirm(`Hapus "${p.title}"?`);
                                  if (!ok) return;
                                  try {
                                    const res = await fetch(`${API_BASE}/admin/download-apps/${p.id}`, {
                                      method: "DELETE",
                                      headers: { "Authorization": `Bearer ${token}` },
                                    });
                                    if (res.ok) {
                                      toast({ title: "Berhasil", message: "Aplikasi dihapus", variant: "success" });
                                      await fetchApiDownloadApps();
                                    }
                                  } catch (e) { logger.error("Gagal hapus download app", e); }
                                }}
                              >
                                Hapus
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      case "doctors": {
        const doctorView = searchParams.get("view") || "list";
        const selectedDoctorId = searchParams.get("id");
        
        const doctorUsers = doctors;
        const selectedDoctor = doctorUsers.find(d => String(d.id) === String(selectedDoctorId));
        
        // Calculate stats for each doctor
        const getDoctorStats = (doctorId: string) => {
          const items = doctorSchedules.filter((s) => String(s.doctorId) === String(doctorId));
          const totalSchedules = items.length;
          const totalSlots = items.reduce((sum, s) => sum + s.slotsLeft, 0);
          return { totalSchedules, totalSlots, doctorSchedules: items };
        };

        const navigateToDoctorView = (view: string, doctorId: string) => {
          setSearchParams({ tab: "doctors", view, id: doctorId });
        };

        const navigateToDoctorsList = () => {
          setSearchParams({ tab: "doctors" });
        };

        // Doctor Profile View
        if (doctorView === "profile" && selectedDoctor) {
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={navigateToDoctorsList}
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Dokter
              </Button>
              
              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Profil Dokter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-sm bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white font-semibold text-2xl">
                      {selectedDoctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                      <p className="text-sm text-gray-500">{selectedDoctor.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-sm">
                      <p className="text-sm text-gray-500 mb-1">Nomor Telepon</p>
                      <p className="font-medium text-gray-900">{selectedDoctor.phone}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-sm">
                      <p className="text-sm text-gray-500 mb-1">Domisili</p>
                      <p className="font-medium text-gray-900">{selectedDoctor.domicile}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-sm">
                      <p className="text-sm text-gray-500 mb-1">Role</p>
                      <span className="inline-flex items-center px-2.5 py-1 bg-[#c9a24a]/15 text-[#8a6b2b] rounded-sm text-sm font-medium">
                        Dokter
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-sm">
                      <p className="text-sm text-gray-500 mb-1">ID Dokter</p>
                      <p className="font-medium text-gray-900 font-mono text-sm">{selectedDoctor.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        // Doctor Schedule View
        if (doctorView === "schedule" && selectedDoctor) {
          const stats = getDoctorStats(selectedDoctor.id);
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={navigateToDoctorsList}
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Dokter
              </Button>
              
              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Jadwal Praktik - {selectedDoctor.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Total {stats.totalSchedules} jadwal dengan {stats.totalSlots} slot tersedia</p>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Tanggal</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Waktu</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Lokasi</TableHead>
                        <TableHead className="text-gray-500 font-medium text-xs sm:text-sm">Slot Tersedia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.doctorSchedules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-gray-400 text-center py-8 text-base">
                            Belum ada jadwal untuk dokter ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        stats.doctorSchedules.map((schedule) => (
                          <TableRow key={schedule.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium text-sm sm:text-base">{schedule.date}</TableCell>
                            <TableCell className="text-sm sm:text-base">{schedule.timeRange}</TableCell>
                            <TableCell className="text-sm sm:text-base">{schedule.location}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 bg-[#c9a24a]/15 text-[#8a6b2b] rounded-sm text-xs sm:text-sm font-medium">
                                {schedule.slotsLeft} slot
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          );
        }

        // Doctor Analysis View
        if (doctorView === "analysis" && selectedDoctor) {
          const doctorConsultations = consultations.filter(
            (c: ConsultationItem) => String((c as any).doctorId) === String(selectedDoctor.id)
          );
          const totalConsultations = doctorConsultations.length;
          const completedConsultations = doctorConsultations.filter((c: ConsultationItem) => c.status === "Selesai").length;
          const pendingConsultations = doctorConsultations.filter((c: ConsultationItem) => c.status !== "Selesai").length;
          
          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={navigateToDoctorsList}
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Dokter
              </Button>
              
              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Analisis Performa - {selectedDoctor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#f8f4ed] to-[#e8d4a2]/25 rounded-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Konsultasi</p>
                      <p className="text-2xl font-bold text-gray-900">{totalConsultations}</p>
                      <p className="text-xs text-gray-500 mt-1">Selama ini</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-sm">
                      <p className="text-sm text-green-700 mb-1">Konsultasi Selesai</p>
                      <p className="text-2xl font-bold text-green-800">{completedConsultations}</p>
                      <p className="text-xs text-green-600 mt-1">Berhasil ditangani</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-sm">
                      <p className="text-sm text-yellow-700 mb-1">Konsultasi Menunggu</p>
                      <p className="text-2xl font-bold text-yellow-800">{pendingConsultations}</p>
                      <p className="text-xs text-yellow-600 mt-1">Dalam antrian</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        // Default Doctors List View
        // Calculate total stats
        const totalSchedulesAll = doctorSchedules.length;
        const totalSlotsAll = doctorSchedules.reduce((sum, s) => sum + s.slotsLeft, 0);

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Dokter</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Kelola dokter dan jadwal praktik klinik.</p>
              </div>
              <Button
                onClick={() => navigate("/dashboard/clinic/doctor/new")}
                className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl text-sm h-10 shadow-md shadow-[#C9A24A]/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Dokter
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total Dokter</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{doctorUsers.length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total Jadwal</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{totalSchedulesAll}</p>
              </div>

              <div className="bg-gradient-to-br from-[#FDF8F0] to-[#F5E9D8] rounded-2xl border border-[#E8D4A2]/40 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Slot Tersedia</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{totalSlotsAll}</p>
              </div>
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingDoctors ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="w-7 h-7 text-[#C9A24A] animate-spin" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Memuat data dokter...</p>
                  </div>
                ) : doctorUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-7 h-7 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Belum ada dokter</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Dokter terdaftar akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3]">
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Dokter</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Telepon</th>
                        <th className="text-center py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Jadwal</th>
                        <th className="text-center py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Slot</th>
                        <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8]">
                      {doctorUsers.map((doctor) => {
                        const stats = getDoctorStats(doctor.id);
                        return (
                          <tr key={doctor.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-semibold">
                                  {doctor.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-sm font-semibold text-[#4A3F35]">{doctor.name}</p>
                              </div>
                            </td>
                            <td className="py-4 px-5 hidden sm:table-cell">
                              <span className="text-sm text-[#4A3F35]">{doctor.phone}</span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                {stats.totalSchedules}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5E6C8] text-[#8A6B2B] border border-[#E8D4A2]/40">
                                {stats.totalSlots} slot
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateToDoctorView("profile", doctor.id)}
                                  className="text-[#B8943F] hover:text-[#9a7630] hover:bg-[#F5E6C8] h-8 w-8 p-0 rounded-lg"
                                  title="Profil"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateToDoctorView("schedule", doctor.id)}
                                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 rounded-lg"
                                  title="Jadwal"
                                >
                                  <Calendar className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateToDoctorView("analysis", doctor.id)}
                                  className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 h-8 w-8 p-0 rounded-lg"
                                  title="Analisis"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/clinic/doctor/edit/${doctor.id}`)}
                                  className="text-gray-500 hover:text-gray-600 hover:bg-gray-100 h-8 w-8 p-0 rounded-lg"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "analytics":
        // Redirect analytics tab to dashboard (now showing analytics content)
        return <AnalyticsDashboard />;

      case "pengaduan": {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "processing": return "bg-yellow-100 text-yellow-700";
            case "resolved": return "bg-green-100 text-green-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "pending": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
          }
        };

        const getStatusLabel = (status: string) => {
          switch (status) {
            case "processing": return "Diproses";
            case "resolved": return "Selesai";
            case "rejected": return "Ditolak";
            case "pending": return "Menunggu";
            default: return status;
          }
        };

        if (selectedComplaint) {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedComplaintId(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali ke Daftar Pengaduan
                </Button>
              </div>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-700">
                          {selectedComplaint.category}
                        </span>
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                          {getStatusLabel(selectedComplaint.status)}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900">{selectedComplaint.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Dari: {selectedComplaint.user?.name} ({selectedComplaint.user?.email})
                      </p>
                      <p className="text-xs text-gray-400">{selectedComplaint.date}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-sm">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Tanggapan Admin</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Update Status</label>
                        <select
                          value={selectedComplaint.status}
                          onChange={async (e) => {
                            try {
                              const updated = await updateComplaintStatus(selectedComplaint.id, { 
                                status: e.target.value as ApiComplaintStatus 
                              });
                              setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
                              toast({ title: "Berhasil", message: "Status diperbarui", variant: "success" });
                            } catch (err: any) {
                              toast({ title: "Gagal", message: "Gagal update status", variant: "error" });
                            }
                          }}
                          className="w-full rounded-sm border border-gray-200 p-2 text-sm focus:ring-1 focus:ring-[#c9a24a] outline-none"
                        >
                          <option value="pending">Menunggu</option>
                          <option value="processing">Diproses</option>
                          <option value="resolved">Selesai</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Isi Tanggapan</label>
                      <textarea
                        className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                        rows={4}
                        value={adminResponseText}
                        onChange={(e) => setAdminResponseText(e.target.value)}
                        placeholder="Tulis tanggapan atau solusi di sini..."
                      />
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button
                        disabled={isSubmittingResponse}
                        onClick={async () => {
                          setIsSubmittingResponse(true);
                          try {
                            const updated = await updateComplaintStatus(selectedComplaint.id, { 
                              admin_response: adminResponseText,
                              status: selectedComplaint.status === 'pending' ? 'processing' : selectedComplaint.status
                            });
                            setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
                            toast({ title: "Berhasil", message: "Tanggapan berhasil dikirim!", variant: "success" });
                            setSelectedComplaintId(null);
                          } catch (err: any) {
                            toast({ title: "Gagal", message: "Gagal mengirim tanggapan", variant: "error" });
                          } finally {
                            setIsSubmittingResponse(false);
                          }
                        }}
                        className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmittingResponse ? "Mengirim..." : "Simpan Tanggapan"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        // Calculate counts
        const pendingCount = complaints.filter(c => c.status === 'pending').length;
        const processingCount = complaints.filter(c => c.status === 'processing').length;
        const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
        const rejectedCount = complaints.filter(c => c.status === 'rejected').length;

        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Pengaduan</h2>
              <p className="text-sm text-[#8A7B6B] mt-1">Kelola pengaduan yang masuk dari pengguna klinik.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                    <Inbox className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Total</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{complaints.length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Menunggu</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{pendingCount}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Diproses</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{processingCount}</p>
              </div>

              <div className="bg-gradient-to-br from-[#FDF8F0] to-[#F5E9D8] rounded-2xl border border-[#E8D4A2]/40 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Selesai</p>
                </div>
                <p className="text-3xl font-bold text-[#4A3F35]">{resolvedCount}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A99A]" />
              <Input
                placeholder="Cari pengaduan (judul, deskripsi, atau nama user)..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="pl-10 rounded-xl border-[#E8D4A2]/40 bg-[#FDF8F0] focus:bg-white focus:border-[#C9A24A] focus:ring-[#C9A24A]/20"
              />
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              {complaintLoading ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                  </div>
                  <p className="text-[#4A3F35] font-medium">Memuat pengaduan...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-7 h-7 text-[#B8A99A]" />
                  </div>
                  <p className="text-[#4A3F35] font-medium">Belum ada pengaduan</p>
                  <p className="text-sm text-[#B8A99A] mt-1">Pengaduan dari pengguna akan muncul di sini</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F5F0E8]">
                  {complaints.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedComplaintId(item.id)}
                      className="p-5 hover:bg-[#FDF8F0]/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                {item.category}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                item.status === 'resolved' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : item.status === 'processing'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : item.status === 'rejected'
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {getStatusLabel(item.status)}
                              </span>
                            </div>
                            <h4 className="font-semibold text-[#4A3F35] text-sm">{item.title}</h4>
                            <p className="text-sm text-[#8A7B6B] truncate mt-1">{item.description}</p>
                            <p className="text-xs text-[#B8A99A] mt-2">
                              Dari: {item.user?.name} • {item.date}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm("Hapus pengaduan ini?")) {
                              try {
                                await deleteComplaint(item.id);
                                setComplaints(prev => prev.filter(c => c.id !== item.id));
                                toast({ title: "Berhasil", message: "Pengaduan dihapus", variant: "success" });
                              } catch (err: any) {
                                toast({ title: "Gagal", message: "Gagal menghapus", variant: "error" });
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case "messages": {
        const filteredMessages = messages.filter((m) => {
          const matchesCategory = messageFilter === "Semua" || m.category === messageFilter;
          const matchesSearch =
            m.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
            m.content.toLowerCase().includes(messageSearch.toLowerCase()) ||
            m.sender.name.toLowerCase().includes(messageSearch.toLowerCase());
          return matchesCategory && matchesSearch;
        });

        const getCategoryColor = (cat: MessageCategory) => {
          switch (cat) {
            case "Konsultasi":
              return "bg-blue-100 text-blue-700";
            case "Pengaduan":
              return "bg-red-100 text-red-700";
            case "Reservasi":
              return "bg-green-100 text-green-700";
            case "Umum":
              return "bg-gray-100 text-gray-700";
            case "Lainnya":
              return "bg-purple-100 text-purple-700";
            default:
              return "bg-gray-100 text-gray-700";
          }
        };

        const getStatusColor = (status: MessageStatus) => {
          switch (status) {
            case "Baru":
              return "bg-[#c9a24a] text-white";
            case "Dibaca":
              return "bg-gray-200 text-gray-700";
            case "Dibalas":
              return "bg-green-500 text-white";
            default:
              return "bg-gray-200 text-gray-700";
          }
        };

        if (selectedMessage) {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali ke Daftar Pesan
                </Button>
              </div>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getCategoryColor(selectedMessage.category)}`}>
                          {selectedMessage.category}
                        </span>
                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                          {selectedMessage.status}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900">{selectedMessage.subject}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Dari: {selectedMessage.sender.name} ({selectedMessage.sender.email})
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(selectedMessage.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-sm">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Balas Pesan</h4>
                    <textarea
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                      rows={4}
                      placeholder="Tulis balasan Anda di sini..."
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={() => {
                          toast({ title: "Berhasil", message: "Pesan berhasil dibalas!", variant: "success" });
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === selectedMessage.id ? { ...m, status: "Dibalas" } : m
                            )
                          );
                          setSelectedMessage(null);
                        }}
                        className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Balasan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        if (newMessageOpen) {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setNewMessageOpen(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali ke Daftar Pesan
                </Button>
              </div>

              <Card className="rounded-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-sm bg-[#c9a24a]/10 flex items-center justify-center">
                      <Send className="w-5 h-5 text-[#a8843a]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Kirim Pesan Baru</CardTitle>
                      <p className="text-sm text-gray-500">Kirim pesan ke Admin Klinik</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kategori Pesan</label>
                    <select
                      value={newMessage.category}
                      onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value as MessageCategory })}
                      className="w-full rounded-sm border border-gray-200 p-2.5 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                    >
                      <option value="Umum">Umum</option>
                      <option value="Konsultasi">Konsultasi</option>
                      <option value="Pengaduan">Pengaduan</option>
                      <option value="Reservasi">Reservasi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Subjek</label>
                    <Input
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      placeholder="Masukkan subjek pesan"
                      className="rounded-sm border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Isi Pesan</label>
                    <textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      rows={6}
                      placeholder="Tulis pesan Anda di sini..."
                      className="w-full rounded-sm border border-gray-200 p-3 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setNewMessageOpen(false)}
                      className="rounded-sm border-gray-200"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={() => {
                        const message: Message = {
                          id: `m_${Date.now()}`,
                          subject: newMessage.subject,
                          content: newMessage.content,
                          category: newMessage.category,
                          status: "Baru",
                          sender: { id: session.id, name: session.name, email: session.email, role: session.role },
                          recipient: { id: "c_001", name: "Admin Klinik", email: "clinic@demo.com", role: "clinic" },
                          createdAt: new Date().toISOString(),
                        };
                        setMessages([message, ...messages]);
                        setNewMessage({ subject: "", content: "", category: "Umum" });
                        setNewMessageOpen(false);
                        toast({ title: "Terkirim", message: "Pesan berhasil dikirim!", variant: "success" });
                      }}
                      disabled={!newMessage.subject || !newMessage.content}
                      className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Pesan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pesan</h2>
                <p className="text-sm text-gray-500">Kelola pesan dan komunikasi dengan pengguna</p>
              </div>
              <Button
                onClick={() => setNewMessageOpen(true)}
                className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Kirim Pesan Baru
              </Button>
            </div>

            <Card className="rounded-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Cari pesan..."
                      value={messageSearch}
                      onChange={(e) => setMessageSearch(e.target.value)}
                      className="pl-10 rounded-sm border-gray-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={messageFilter}
                      onChange={(e) => setMessageFilter(e.target.value as MessageCategory | "Semua")}
                      className="rounded-sm border border-gray-200 p-2 text-sm focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] outline-none"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Umum">Umum</option>
                      <option value="Konsultasi">Konsultasi</option>
                      <option value="Pengaduan">Pengaduan</option>
                      <option value="Reservasi">Reservasi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Tidak ada pesan yang ditemukan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (message.status === "Baru") {
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === message.id ? { ...m, status: "Dibaca" } : m
                              )
                            );
                          }
                        }}
                        className="p-4 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-sm bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-5 h-5 text-[#a8843a]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${getCategoryColor(message.category)}`}>
                                  {message.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${getStatusColor(message.status)}`}>
                                  {message.status}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">{message.subject}</h4>
                              <p className="text-sm text-gray-500 truncate">{message.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Dari: {message.sender.name} •{" "}
                                {new Date(message.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMessages((prev) => prev.filter((m) => m.id !== message.id));
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }

      case "settings": {
        const settingLabels: Record<string, { label: string; desc: string; type: string }> = {
          booking_terms: {
            label: "Syarat & Ketentuan Reservasi Tamu",
            desc: "Teks ini akan ditampilkan kepada tamu sebelum mereka dapat mengirim permintaan reservasi. Setiap baris menjadi satu poin syarat.",
            type: "textarea",
          },
          booking_whatsapp_number: {
            label: "Nomor WhatsApp Klinik (Booking)",
            desc: "Nomor WhatsApp yang menerima pesan booking dari tamu. Format: 62xxx tanpa tanda + atau spasi.",
            type: "text",
          },
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#c9a24a]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pengaturan Klinik</h2>
                <p className="text-xs text-gray-500">Kelola konfigurasi sistem klinik yang dapat diubah secara dinamis.</p>
              </div>
            </div>

            {loadingSettings ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#c9a24a]" />
              </div>
            ) : (
              <div className="space-y-4">
                {clinicSettings.map((setting) => {
                  const meta = settingLabels[setting.key] || { label: setting.label || setting.key, desc: setting.description || "", type: setting.type || "text" };
                  const currentVal = settingsDirty[setting.key] !== undefined ? settingsDirty[setting.key] : (setting.value || "");
                  const isDirty = settingsDirty[setting.key] !== undefined;

                  return (
                    <Card key={setting.key} className="rounded-2xl border-gray-100 shadow-sm">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <ScrollText className="w-4 h-4 text-[#c9a24a] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{meta.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{meta.desc}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0">{setting.key}</span>
                        </div>

                        {meta.type === "textarea" ? (
                          <textarea
                            rows={8}
                            value={currentVal}
                            onChange={(e) => setSettingsDirty((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                            placeholder="Masukkan teks syarat dan ketentuan..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#c9a24a] font-mono resize-y leading-relaxed text-gray-900"
                          />
                        ) : (
                          <Input
                            value={currentVal}
                            onChange={(e) => setSettingsDirty((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                            placeholder={`Masukkan ${meta.label.toLowerCase()}...`}
                            className="h-11 rounded-xl text-xs"
                          />
                        )}

                        <div className="flex justify-end">
                          <Button
                            disabled={!isDirty || savingSettingKey === setting.key}
                            onClick={() => saveClinicSetting(setting.key)}
                            className={`h-9 px-5 rounded-xl text-xs font-bold transition-all ${
                              isDirty
                                ? "bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {savingSettingKey === setting.key ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...</>
                            ) : (
                              <><Save className="w-3.5 h-3.5 mr-1.5" /> Simpan Perubahan</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      default: {
        return (
          <div className="space-y-8">
            {/* Top Section: Welcome + Stats */}
            <DesktopClinicHome
              session={session}
              stats={stats}
              users={users}
              doctorSchedules={doctorSchedules}
              consultations={consultations}
              complaints={complaints}
            />
            {/* Bottom Section: Analytics */}
            <AnalyticsDashboard />
          </div>
        );
      }
    }
  };

  if (!session) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout role="clinic">
      {renderContent()}
    </DashboardLayout>
  );
}

function GalleryEditor({ current, editorId, token, fetchApiGallery, setSearchParams }: any) {
  const isNew = !editorId;

  const [galleryEditor, setGalleryEditor] = useState({
    title: current?.title || "",
    imageUrl: current?.image_url || "",
    imageFile: null as File | null,
    category: current?.category || "Fasilitas",
  });

  useEffect(() => {
    if (current) {
      setGalleryEditor({
        title: current.title || "",
        imageUrl: current.image_url || "",
        imageFile: null,
        category: current.category || "Fasilitas",
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof galleryEditor>) => {
    setGalleryEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleGallerySave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", galleryEditor.title);
      formData.append("category", galleryEditor.category);
      if (galleryEditor.imageFile) {
        formData.append("image", galleryEditor.imageFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/gallery-items`
        : `${API_BASE}/admin/gallery-items/${editorId}`;
      
      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        logger.error("Gagal simpan galeri", await res.text());
        return;
      }

      toast({ title: "Berhasil", message: isNew ? "Galeri berhasil ditambahkan" : "Galeri diperbarui", variant: "success" });
      await fetchApiGallery();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-gallery");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      logger.error("Gagal simpan galeri", e);
    }
  };

  const saved = galleryEditor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200"
            onClick={() => {
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-gallery");
                next.set("view", "list");
                next.delete("id");
                return next;
              });
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah / Edit Galeri</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
            onClick={handleGallerySave}
            disabled={!saved.title.trim() || (!saved.imageUrl && !saved.imageFile)}
          >
            Simpan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-sm border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Judul</p>
              <Input
                value={saved.title}
                onChange={(e) => updateSaved({ title: e.target.value })}
                className="rounded-sm border-gray-200"
                placeholder="Judul galeri"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Upload Gambar</p>
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    updateSaved({ imageUrl: url, imageFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[16/9] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.imageUrl ? (
                    <img src={saved.imageUrl} alt={saved.title || "preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 text-xl">↑</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-emerald-700">Klik untuk mengunggah gambar</p>
                      <p className="text-xs text-emerald-700/80">PNG, JPG, WEBP (Maks. 2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                value={saved.category}
                onChange={(e) => updateSaved({ category: e.target.value })}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              >
                {[
                  "Semua",
                  "Klien Kami",
                  "Tindakan Perawatan",
                  "Solusi Dental",
                  "Fasilitas",
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PromoEditor({ current, editorId, token, fetchApiPromos, setSearchParams }: any) {
  const isNew = !editorId;

  const [promoEditor, setPromoEditor] = useState({
    title: current?.title || "",
    slug: current?.slug || "",
    description: current?.description || "",
    contentHtml: current?.content_html || "",
    category: current?.category || "Bronze",
    buttonLabel: current?.button_label || "Hubungi Admin",
    contactWhatsapp: current?.contact_whatsapp || "",
    isActive: current?.is_active ?? true,
    startsAt: current?.starts_at ? current.starts_at.slice(0, 10) : "",
    endsAt: current?.ends_at ? current.ends_at.slice(0, 10) : "",
    sortOrder: current?.sort_order ?? 0,
    imageUrl: getStorageUrl(current?.image_url || current?.image_path) || "",
    imageFile: null as File | null,
  });

  useEffect(() => {
    if (current) {
      setPromoEditor({
        title: current.title || "",
        slug: current.slug || "",
        description: current.description || "",
        contentHtml: current.content_html || "",
        category: current.category || "Bronze",
        buttonLabel: current.button_label || "Hubungi Admin",
        contactWhatsapp: current.contact_whatsapp || "",
        isActive: current.is_active ?? true,
        startsAt: current.starts_at ? current.starts_at.slice(0, 10) : "",
        endsAt: current.ends_at ? current.ends_at.slice(0, 10) : "",
        sortOrder: current.sort_order ?? 0,
        imageUrl: getStorageUrl(current.image_url || current.image_path) || "",
        imageFile: null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof promoEditor>) => {
    setPromoEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", promoEditor.title);
      formData.append("slug", promoEditor.slug || promoEditor.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
      formData.append("description", promoEditor.description);
      formData.append("content_html", promoEditor.contentHtml);
      formData.append("category", promoEditor.category);
      formData.append("button_label", promoEditor.buttonLabel);
      formData.append("contact_whatsapp", promoEditor.contactWhatsapp);
      formData.append("is_active", promoEditor.isActive ? "1" : "0");
      if (promoEditor.startsAt) formData.append("starts_at", promoEditor.startsAt);
      if (promoEditor.endsAt) formData.append("ends_at", promoEditor.endsAt);
      formData.append("sort_order", String(promoEditor.sortOrder));
      if (promoEditor.imageFile) {
        formData.append("image", promoEditor.imageFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/promos`
        : `${API_BASE}/admin/promos/${editorId}`;

      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        logger.error("Gagal simpan promo", await res.text());
        return;
      }

      toast({
        title: "Berhasil",
        message: isNew ? "Promo berhasil ditambahkan" : "Promo diperbarui",
        variant: "success",
      });
      await fetchApiPromos();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-promo");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      logger.error("Gagal simpan promo", e);
    }
  };

  const saved = promoEditor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200 h-9 text-xs"
            onClick={() =>
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-promo");
                next.set("view", "list");
                next.delete("id");
                return next;
              })
            }
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? "Tambah Promo" : "Edit Promo"}
          </h2>
        </div>
        <Button
          className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm h-9"
          onClick={handleSave}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isNew ? "Tambah Promo" : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Informasi Promo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Judul Promo</label>
                <Input
                  value={saved.title}
                  onChange={(e) => updateSaved({ title: e.target.value })}
                  placeholder="Masukkan judul promo"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Slug</label>
                <Input
                  value={saved.slug}
                  onChange={(e) => updateSaved({ slug: e.target.value })}
                  placeholder="auto-generated-slug"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Deskripsi Singkat</label>
                <textarea
                  className="w-full h-20 p-3 rounded-sm border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] resize-none"
                  value={saved.description}
                  onChange={(e) => updateSaved({ description: e.target.value })}
                  placeholder="Deskripsi singkat promo..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Konten Lengkap</label>
                <WpEditor
                  value={saved.contentHtml}
                  onChange={(html) => updateSaved({ contentHtml: html })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Label Button</label>
                <Input
                  value={saved.buttonLabel}
                  onChange={(e) => updateSaved({ buttonLabel: e.target.value })}
                  placeholder="Hubungi Admin"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Kategori Promo</label>
                <select
                  value={saved.category}
                  onChange={(e) => updateSaved({ category: e.target.value })}
                  className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
                >
                  {["Bronze", "Gold", "Platinum"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Nomor WhatsApp</label>
                <Input
                  value={saved.contactWhatsapp}
                  onChange={(e) => updateSaved({ contactWhatsapp: e.target.value })}
                  placeholder="+6281234567890"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Urutan</label>
                <Input
                  type="number"
                  value={saved.sortOrder}
                  onChange={(e) => updateSaved({ sortOrder: Number(e.target.value) })}
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3]">
                <div>
                  <label className="text-xs font-bold text-[#4A3F35] block">Status Promo</label>
                  <span className="text-[11px] text-[#8A7B6B]">
                    {saved.isActive ? "🟢 Promo Aktif & Tampil di Publik" : "🔴 Promo Non-aktif (Disembunyikan)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSaved({ isActive: !saved.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${saved.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${saved.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={saved.startsAt}
                  onChange={(e) => updateSaved({ startsAt: e.target.value })}
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Tanggal Berakhir</label>
                <Input
                  type="date"
                  value={saved.endsAt}
                  onChange={(e) => updateSaved({ endsAt: e.target.value })}
                  className="rounded-sm border-gray-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Gambar Promo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    updateSaved({ imageUrl: url, imageFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[16/9] rounded-sm border border-dashed border-[#c9a24a]/40 bg-[#c9a24a]/5 overflow-hidden flex items-center justify-center relative">
                  {saved.imageUrl ? (
                    <img src={saved.imageUrl} alt={saved.title || "preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-10 h-10 rounded-full bg-[#c9a24a]/10 flex items-center justify-center">
                        <Image className="w-5 h-5 text-[#a8843a]" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#a8843a]">Klik untuk mengunggah gambar</p>
                      <p className="text-xs text-[#a8843a]/70">PNG, JPG, WEBP (Maks. 2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
