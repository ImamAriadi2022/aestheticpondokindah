import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  RefreshCw,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Search,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  MousePointerClick,
} from "lucide-react";
import {
  getAnalyticsOverview,
  type AnalyticsOverviewResponse,
} from "@/core/api/analyticsApi";

type PresetKey = "7d" | "30d" | "this_month" | "custom";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  tiktok: "#18181B",
  facebook: "#1877F2",
  google: "#EA4335",
  whatsapp: "#25D366",
  youtube: "#DC2626",
  direct: "#C59E3F",
  newsletter: "#8B5CF6",
  linkedin: "#0A66C2",
  other: "#64748B",
};

const FALLBACK_COLORS = [
  "#0EA5E9",
  "#F59E0B",
  "#14B8A6",
  "#EC4899",
  "#6366F1",
  "#84CC16",
];

function getPlatformColor(source: string, index = 0): string {
  const key = (source || "direct").toLowerCase().trim();
  return PLATFORM_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function formatChannelName(source: string): string {
  const key = (source || "direct").toLowerCase().trim();
  const map: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    google: "Google",
    whatsapp: "WhatsApp",
    youtube: "YouTube",
    direct: "Direct",
    newsletter: "Newsletter",
    linkedin: "LinkedIn",
    other: "Other",
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getPresetRange(preset: Exclude<PresetKey, "custom">): { start: string; end: string } {
  const today = new Date();
  const end = toIsoDate(today);

  if (preset === "7d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: toIsoDate(start), end };
  }

  if (preset === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toIsoDate(start), end };
  }

  // Default: 30d
  const start = new Date(today);
  start.setDate(start.getDate() - 29);
  return { start: toIsoDate(start), end };
}

function formatShortDateId(isoDate: string): string {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return isoDate;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(dt.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(dt);
}

function formatFullDateId(isoDate: string): string {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return isoDate;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(dt.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dt);
}

const TARGET_PAGES = [
  { label: "Beranda (/)", value: "/" },
  { label: "Layanan (/layanan)", value: "/layanan" },
  { label: "Promo (/promo)", value: "/promo" },
  { label: "Dokter (/doctors)", value: "/doctors" },
  { label: "Booking (/booking)", value: "/booking" },
  { label: "Cerita / Blog (/cerita)", value: "/cerita" },
  { label: "Tentang Kami (/about)", value: "/about" },
];

const SOURCE_OPTIONS = [
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
  { label: "Facebook", value: "facebook" },
  { label: "Google", value: "google" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "YouTube", value: "youtube" },
  { label: "Newsletter / Email", value: "newsletter" },
];

const MEDIUM_OPTIONS = [
  { label: "Social (Post / Reels)", value: "social" },
  { label: "Bio Link", value: "bio" },
  { label: "Ads / Paid", value: "ads" },
  { label: "CPC (Google Ads)", value: "cpc" },
  { label: "Story", value: "story" },
  { label: "Share / Broadcast", value: "share" },
  { label: "Email", value: "email" },
];

export default function TrafficUtmAnalyticsSection() {
  const initialRange = useMemo(() => getPresetRange("30d"), []);
  const [preset, setPreset] = useState<PresetKey>("30d");
  const [startDate, setStartDate] = useState<string>(initialRange.start);
  const [endDate, setEndDate] = useState<string>(initialRange.end);

  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tableQuery, setTableQuery] = useState<string>("");

  // UTM Link Builder states
  const [builderPath, setBuilderPath] = useState<string>("/");
  const [builderSource, setBuilderSource] = useState<string>("instagram");
  const [builderMedium, setBuilderMedium] = useState<string>("social");
  const [builderCampaign, setBuilderCampaign] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchOverview = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsOverview(from, to);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data analitik trafik.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      fetchOverview(startDate, endDate);
    }
  }, [startDate, endDate, fetchOverview]);

  const handleSelectPreset = (nextPreset: PresetKey) => {
    setPreset(nextPreset);
    if (nextPreset !== "custom") {
      const next = getPresetRange(nextPreset);
      setStartDate(next.start);
      setEndDate(next.end);
    }
  };

  // Channel pie data with colors
  const channelData = useMemo(() => {
    const items = data?.top_channels ?? [];
    return items.map((ch, idx) => ({
      ...ch,
      label: ch.label || formatChannelName(ch.source),
      color: getPlatformColor(ch.source, idx),
    }));
  }, [data]);

  // Daily trend chart data
  const trendData = useMemo(() => {
    return (data?.daily_trend ?? []).map((item) => ({
      ...item,
      shortDate: formatShortDateId(item.date),
      fullDate: formatFullDateId(item.date),
    }));
  }, [data]);

  // Filtered UTM breakdown rows
  const filteredDetails = useMemo(() => {
    const rows = data?.details ?? [];
    const q = tableQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.utm_source || "").toLowerCase().includes(q) ||
        (r.utm_medium || "").toLowerCase().includes(q) ||
        (r.utm_campaign || "").toLowerCase().includes(q)
    );
  }, [data, tableQuery]);

  // Generated UTM URL
  const generatedUtmUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" &&
      window.location.origin &&
      !window.location.origin.includes("localhost")
        ? window.location.origin
        : "https://aestheticpondokindah.com";

    const cleanPath = builderPath.startsWith("/") ? builderPath : `/${builderPath}`;
    const url = new URL(`${origin}${cleanPath}`);
    if (builderSource.trim()) {
      url.searchParams.set("utm_source", builderSource.trim().toLowerCase());
    }
    if (builderMedium.trim()) {
      url.searchParams.set("utm_medium", builderMedium.trim().toLowerCase());
    }
    const cleanCampaign = builderCampaign
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");
    if (cleanCampaign) {
      url.searchParams.set("utm_campaign", cleanCampaign);
    }
    return url.toString();
  }, [builderPath, builderSource, builderMedium, builderCampaign]);

  const handleCopyUtmUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUtmUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = generatedUtmUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const topChannel = channelData[0] ?? null;
  const growthPct = data?.previous_period?.growth_percentage ?? 0;
  const isPositiveGrowth = growthPct >= 0;

  return (
    <section className="space-y-5" aria-label="Traffic dan UTM Analytics">
      {/* Header & Date Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2C2416]">
              Traffic &amp; UTM Analytics
            </h3>
            <p className="text-xs text-[#7A6E60] mt-0.5">
              Acquisition Overview &mdash; Pelacakan sumber pengunjung otomatis berdasarkan parameter UTM &amp; referrer
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={preset}
                onChange={(e) => handleSelectPreset(e.target.value as PresetKey)}
                className="h-9 pl-3 pr-8 rounded-xl bg-[#FAF8F5] text-xs font-semibold text-[#2C2416] border border-[#D9D0BC] shadow-sm hover:border-[#C59E3F] focus:outline-none focus:ring-2 focus:ring-[#C59E3F]/30 cursor-pointer appearance-none transition-all"
                aria-label="Pilih rentang waktu"
              >
                <option value="7d">7 Hari Terakhir</option>
                <option value="30d">30 Hari Terakhir</option>
                <option value="this_month">Bulan Ini</option>
                <option value="custom">Custom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#7A6E60]">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {preset === "custom" && (
              <div className="flex flex-wrap items-center gap-2 bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#D9D0BC]">
                <div className="flex items-center gap-1.5 text-xs text-[#5C5546]">
                  <span className="text-[11px] font-medium text-[#7A6E60]">Dari</span>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-7 px-2 rounded-lg border border-[#D9D0BC] bg-white text-xs text-[#2C2416] focus:outline-none focus:ring-1 focus:ring-[#C59E3F]"
                  />
                </div>
                <span className="text-xs text-[#9A8B7A]">&ndash;</span>
                <div className="flex items-center gap-1.5 text-xs text-[#5C5546]">
                  <span className="text-[11px] font-medium text-[#7A6E60]">Sampai</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={toIsoDate(new Date())}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-7 px-2 rounded-lg border border-[#D9D0BC] bg-white text-xs text-[#2C2416] focus:outline-none focus:ring-1 focus:ring-[#C59E3F]"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => fetchOverview(startDate, endDate)}
              disabled={loading}
              className="p-2 rounded-xl bg-[#FAF8F5] text-[#5C5546] border border-[#E6DECB] hover:bg-[#F3EBD9] transition-all disabled:opacity-50"
              title="Muat ulang data analitik"
              aria-label="Muat ulang data analitik"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Custom Date Pickers + Active Period Display */}
        <div className="mt-4 pt-3.5 border-t border-[#F3ECE0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#7A6E60]">
            <Calendar className="w-3.5 h-3.5 text-[#A37E28]" />
            <span>
              Periode:{" "}
              <strong className="text-[#2C2416]">
                {formatShortDateId(startDate)} &ndash; {formatShortDateId(endDate)}
              </strong>
            </span>
          </div>

          {data && (
            <div className="text-[11px] text-[#8A7B6B]">
              Periode pembanding:{" "}
              <span className="font-medium text-[#5C5546]">
                {formatShortDateId(data.previous_period.start_date)} &ndash;{" "}
                {formatShortDateId(data.previous_period.end_date)} (
                {data.previous_period.total_visits.toLocaleString("id-ID")} klik)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => fetchOverview(startDate, endDate)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors self-start sm:self-auto"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A7B6B]">
              Total Kunjungan
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4E8] flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 text-[#A37E28]" />
            </div>
          </div>
          {loading && !data ? (
            <div className="h-7 w-20 bg-[#F3ECE0] animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl font-bold text-[#2C2416]">
              {(data?.total_visits ?? 0).toLocaleString("id-ID")}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                isPositiveGrowth
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositiveGrowth ? "+" : ""}
              {growthPct}%
            </span>
            <span className="text-[10px] text-[#9A8B7A]">vs periode lalu</span>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A7B6B]">
              Sesi Unik
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4E8] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#A37E28]" />
            </div>
          </div>
          {loading && !data ? (
            <div className="h-7 w-20 bg-[#F3ECE0] animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl font-bold text-[#2C2416]">
              {(data?.unique_visitors ?? 0).toLocaleString("id-ID")}
            </p>
          )}
          <p className="text-[10px] text-[#9A8B7A] mt-1.5">
            Bebas duplikasi refresh sesi
          </p>
        </div>

        {/* Top Channel */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A7B6B]">
              Sumber Teratas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4E8] flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#A37E28]" />
            </div>
          </div>
          {loading && !data ? (
            <div className="h-7 w-24 bg-[#F3ECE0] animate-pulse rounded-lg" />
          ) : topChannel ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: topChannel.color }}
                />
                <p className="text-lg sm:text-xl font-bold text-[#2C2416] truncate">
                  {topChannel.label}
                </p>
              </div>
              <p className="text-[10px] text-[#9A8B7A] mt-1.5">
                {topChannel.percentage}% ({topChannel.count.toLocaleString("id-ID")} klik)
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-[#9A8B7A]">&mdash;</p>
              <p className="text-[10px] text-[#9A8B7A] mt-1.5">Belum ada data trafik</p>
            </>
          )}
        </div>

        {/* Booking Conversion */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A7B6B]">
              Konversi Booking
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4E8] flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#A37E28]" />
            </div>
          </div>
          {loading && !data ? (
            <div className="h-7 w-16 bg-[#F3ECE0] animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl font-bold text-[#2C2416]">
              {(data?.conversion_rate ?? 0).toFixed(1)}%
            </p>
          )}
          <p className="text-[10px] text-[#9A8B7A] mt-1.5">
            {(data?.total_reservations ?? 0).toLocaleString("id-ID")} reservasi di periode ini
          </p>
        </div>
      </div>

      {/* Main Charts Row: Visitors Trend (Area) + Top Channels (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visitors Trend Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#2C2416] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#A37E28]" />
                Visitors Trend (Harian)
              </h4>
              <p className="text-[11px] text-[#8A7B6B] mt-0.5">
                Jumlah kunjungan &amp; klik masuk per hari
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF4E8] text-[#8A6B2B]">
              {trendData.length} hari
            </span>
          </div>

          {loading && !data ? (
            <div className="h-64 w-full bg-[#FAF8F5] animate-pulse rounded-xl" />
          ) : trendData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#9A8B7A] text-xs">
              Belum ada data tren pengunjung pada periode ini.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="goldTrafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C59E3F" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#C59E3F" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D3" vertical={false} />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 11, fill: "#8A7B6B" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E6DECB" }}
                    minTickGap={22}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#8A7B6B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload as { fullDate: string; count: number };
                      return (
                        <div className="bg-[#2C2416] text-white px-3 py-2 rounded-xl shadow-lg border border-[#C59E3F]/30 text-xs">
                          <p className="text-[#E8D4A2] font-medium">{item.fullDate}</p>
                          <p className="font-bold text-sm mt-0.5">
                            {item.count.toLocaleString("id-ID")} pengunjung
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#C59E3F"
                    strokeWidth={2.5}
                    fill="url(#goldTrafficGradient)"
                    activeDot={{ r: 5, fill: "#A37E28", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Channels Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-bold text-[#2C2416] flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#A37E28]" />
              Top Channels
            </h4>
            <p className="text-[11px] text-[#8A7B6B] mt-0.5">
              Proporsi sumber trafik (Instagram, TikTok, Facebook, Google, Direct)
            </p>
          </div>

          {loading && !data ? (
            <div className="h-64 w-full bg-[#FAF8F5] animate-pulse rounded-xl" />
          ) : channelData.length === 0 ? (
            <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center text-center text-[#9A8B7A] px-4">
              <Globe className="w-10 h-10 opacity-30 mb-2" />
              <p className="text-xs font-medium">Belum ada data channel tercatat.</p>
              <p className="text-[11px] mt-1">
                Coba buka website dengan parameter UTM atau gunakan UTM Link Builder di bawah.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
              <div className="relative w-48 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={80}
                      paddingAngle={2.5}
                      stroke="none"
                    >
                      {channelData.map((entry) => (
                        <Cell key={entry.source} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const ch = payload[0].payload as (typeof channelData)[number];
                        return (
                          <div className="bg-[#2C2416] text-white px-3 py-2 rounded-xl shadow-lg text-xs">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: ch.color }}
                              />
                              <span className="font-semibold">{ch.label}</span>
                            </div>
                            <p className="mt-0.5 text-[#E8D4A2]">
                              {ch.count.toLocaleString("id-ID")} klik ({ch.percentage}%)
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-[#2C2416]">
                    {(data?.total_visits ?? 0).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] font-medium text-[#8A7B6B]">Total Klik</span>
                </div>
              </div>

              {/* Clean Platform Legend */}
              <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1">
                {channelData.map((ch) => (
                  <div
                    key={ch.source}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3]/70 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ch.color }}
                      />
                      <span className="font-semibold text-[#2C2416] truncate">{ch.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[#7A6E60]">
                        {ch.count.toLocaleString("id-ID")}
                      </span>
                      <span className="font-bold text-[#2C2416] w-11 text-right">
                        {ch.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: UTM Breakdown Table + UTM Link Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* UTM Breakdown Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#2C2416]">
                UTM Breakdown Table
              </h4>
              <p className="text-[11px] text-[#8A7B6B] mt-0.5">
                Rincian performa berdasarkan kombinasi Source, Medium, dan Campaign
              </p>
            </div>
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-[#9A8B7A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableQuery}
                onChange={(e) => setTableQuery(e.target.value)}
                placeholder="Cari source / campaign..."
                className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#D9D0BC] bg-[#FAF8F5] text-xs text-[#2C2416] placeholder:text-[#9A8B7A] focus:outline-none focus:ring-2 focus:ring-[#C59E3F]"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b border-[#F0E6D3] text-[11px] font-semibold uppercase tracking-wide text-[#8A7B6B]">
                  <th className="py-2.5 px-3">Sumber</th>
                  <th className="py-2.5 px-3">Medium</th>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3 text-right">Pengunjung / Klik</th>
                  <th className="py-2.5 px-3 text-right w-32">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6EFE2] text-xs">
                {loading && !data ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9A8B7A]">
                      Memuat rincian UTM...
                    </td>
                  </tr>
                ) : filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9A8B7A]">
                      {tableQuery
                        ? "Tidak ditemukan data UTM yang cocok dengan pencarian."
                        : "Belum ada kunjungan UTM tercatat pada rentang tanggal ini."}
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((row, idx) => {
                    const color = getPlatformColor(row.utm_source, idx);
                    return (
                      <tr
                        key={`${row.utm_source}-${row.utm_medium ?? "none"}-${row.utm_campaign ?? "none"}-${idx}`}
                        className="hover:bg-[#FDF8F0] transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#2C2416]">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {formatChannelName(row.utm_source)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#5C5546]">
                          {row.utm_medium ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#FAF4E8] text-[#8A6B2B] font-medium">
                              {row.utm_medium}
                            </span>
                          ) : (
                            <span className="text-[#B8A99A]">&mdash;</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#5C5546] max-w-[160px] truncate">
                          {row.utm_campaign || <span className="text-[#B8A99A]">&mdash;</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#2C2416]">
                          {row.count.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-14 h-1.5 bg-[#F0E6D3] rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(row.percentage, 100)}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                            <span className="font-semibold text-[#2C2416] w-10 text-right">
                              {row.percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* UTM Link Builder Mini Widget */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF4E8] rounded-2xl border border-[#EADBBD] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C59E3F] to-[#A37E28] flex items-center justify-center text-white shadow-sm">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2C2416]">
                  UTM Link Builder
                </h4>
                <p className="text-[11px] text-[#7A6E60]">
                  Buat link promosi siap pakai untuk bio IG, TikTok, atau iklan
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {/* Target Page */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5C5546] mb-1">
                  Halaman Tujuan
                </label>
                <select
                  value={builderPath}
                  onChange={(e) => setBuilderPath(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#D9D0BC] bg-white text-xs text-[#2C2416] focus:outline-none focus:ring-2 focus:ring-[#C59E3F]"
                >
                  {TARGET_PAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source & Medium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5546] mb-1">
                    Source (<code className="text-[#A37E28]">utm_source</code>)
                  </label>
                  <select
                    value={builderSource}
                    onChange={(e) => setBuilderSource(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[#D9D0BC] bg-white text-xs text-[#2C2416] focus:outline-none focus:ring-2 focus:ring-[#C59E3F]"
                  >
                    {SOURCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5546] mb-1">
                    Medium (<code className="text-[#A37E28]">utm_medium</code>)
                  </label>
                  <select
                    value={builderMedium}
                    onChange={(e) => setBuilderMedium(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[#D9D0BC] bg-white text-xs text-[#2C2416] focus:outline-none focus:ring-2 focus:ring-[#C59E3F]"
                  >
                    {MEDIUM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5C5546] mb-1">
                  Campaign (<code className="text-[#A37E28]">utm_campaign</code> &mdash; opsional)
                </label>
                <input
                  type="text"
                  value={builderCampaign}
                  onChange={(e) => setBuilderCampaign(e.target.value)}
                  placeholder="Contoh: promo_veneer_november"
                  className="w-full h-9 px-3 rounded-xl border border-[#D9D0BC] bg-white text-xs text-[#2C2416] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#C59E3F]"
                />
              </div>
            </div>
          </div>

          {/* Generated URL Preview & Actions */}
          <div className="mt-4 pt-4 border-t border-[#EADBBD]">
            <p className="text-[11px] font-semibold text-[#5C5546] mb-1.5">
              URL Siap Bagikan:
            </p>
            <div className="p-2.5 rounded-xl bg-white border border-[#D9D0BC] text-[11px] font-mono text-[#2C2416] break-all select-all">
              {generatedUtmUrl}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleCopyUtmUrl}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold transition-all ${
                  copied
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gradient-to-r from-[#C59E3F] to-[#A37E28] text-white hover:opacity-95 shadow-sm"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Link Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>
              <a
                href={generatedUtmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl border border-[#D9D0BC] bg-white text-[#5C5546] hover:bg-[#FAF4E8] text-xs font-semibold transition-colors"
                title="Buka link di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Tes
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
