import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  MousePointer,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { getAnalyticsSummary, type AnalyticsSummaryResponse } from "@/react-app/lib/analyticsApi";

type RangeKey = "1d" | "3d" | "7d" | "14d" | "30d" | "1y";

const rangeLabels: Record<RangeKey, string> = {
  "1d": "1 Hari",
  "3d": "3 Hari",
  "7d": "1 Minggu",
  "14d": "2 Minggu",
  "30d": "1 Bulan",
  "1y": "1 Tahun",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 183; // ~6 bulan

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function diffDaysInclusive(from: Date, to: Date) {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.floor((b - a) / MS_PER_DAY) + 1;
}

function clampRangeToMaxDays(from: Date, to: Date) {
  const fromD = startOfDay(from);
  const toD = startOfDay(to);
  if (toD.getTime() < fromD.getTime()) return { from: fromD, to: fromD };
  const days = diffDaysInclusive(fromD, toD);
  if (days <= MAX_RANGE_DAYS) return { from: fromD, to: toD };
  return { from: fromD, to: addDays(fromD, MAX_RANGE_DAYS - 1) };
}

function rangeKeyToDays(key: RangeKey) {
  return key === "1d" ? 1 : key === "3d" ? 3 : key === "7d" ? 7 : key === "14d" ? 14 : key === "30d" ? 30 : 365;
}

function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDmy(d: Date) {
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = String(d.getFullYear());
  return `${day}/${m}/${y}`;
}

function parseDateDmy(v: string) {
  const parts = v.trim().split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;
  if (yyyy < 1900 || yyyy > 2100) return null;
  const dt = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getFullYear() !== yyyy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null;
  return dt;
}

function normalizeDmyInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  const out = [d, m, y].filter(Boolean).join("/");
  return out;
}

function parseDateInputValue(v: string) {
  const [y, m, d] = v.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatDateId(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

function useAnalyticsData(from: Date, to: Date) {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fromStr = toDateInputValue(from);
      const toStr = toDateInputValue(to);
      const response = await getAnalyticsSummary(fromStr, toStr);
      setData(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processed = useMemo(() => {
    if (!data) return null;

    const visitors = data.totals.visitors;
    const bookings = data.totals.bookings;
    const conversionRate = ((bookings / Math.max(visitors, 1)) * 100);

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const dailyLabels = data.daily.labels.map((dateStr) => {
      const d = new Date(dateStr);
      return `${dayNames[d.getDay()]} ${d.getDate()}`;
    });
    const dailyVisitors = data.daily.visitors;

    const sourceColors: Record<string, string> = {
      google: "#c9a24a",
      instagram: "#e8c567",
      direct: "#f0daa0",
      whatsapp: "#a8843a",
      facebook: "#d4b87a",
      tiktok: "#c9a24a",
      search: "#c9a24a",
      social: "#e8c567",
      referral: "#f0daa0",
      unknown: "#d4b87a",
    };
    const trafficSources = data.sources.map((s) => ({
      label: s.label.charAt(0).toUpperCase() + s.label.slice(1),
      value: s.value,
      color: sourceColors[s.label.toLowerCase()] || "#c9a24a",
    }));

    const topPages = data.top_pages;

    const bookingStatus = data.booking_status.map((item, index) => ({ ...item, color: ["bg-[#c9a24a]", "bg-blue-500", "bg-green-500", "bg-red-500"][index % 4] }));

    return {
      visitors,
      bookings,
      conversionRate,
      dailyLabels,
      dailyVisitors,
      trafficSources,
      topPages,
      regionData: [] as { region: string; visitors: number; consultations: number }[],
      bookingStatus,
    };
  }, [data, from, to]);

  return { data: processed, loading, error, refetch: fetchData };
}

function DonutChart({ data, size = 140 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
          {data.map((d, i) => {
            const pct = total <= 0 ? 0 : d.value / total;
            const dash = c * pct;
            const el = (
              <circle
                key={i}
                r={r}
                cx={0}
                cy={0}
                fill="none"
                stroke={d.color}
                strokeWidth={12}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return el;
          })}
        </g>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-medium text-gray-900 ml-auto">
              {total <= 0 ? "0%" : `${Math.round((d.value / total) * 100)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ labels, values, max, barColor = "#c9a24a" }: { labels: string[]; values: number[]; max: number; barColor?: string }) {
  return (
    <div className="space-y-3">
      {labels.map((label, i) => {
        const v = values[i] ?? 0;
        const pct = max <= 0 ? 0 : Math.min((v / max) * 100, 100);
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-20 sm:w-24 text-xs text-gray-500 flex-shrink-0 truncate">{label}</div>
            <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-500 ease-out flex items-center px-2"
                style={{ width: `${pct}%`, backgroundColor: barColor, opacity: 0.85 }}
              >
                {pct > 15 && <span className="text-[10px] text-white font-medium">{v.toLocaleString("id-ID")}</span>}
              </div>
              {pct <= 15 && (
                <span className="absolute left-[calc(var(--pct)+4px)] top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium" style={{ "--pct": `${pct}%` } as React.CSSProperties}>
                  {v.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, trend }: { icon: React.ElementType; label: string; value: string; subtext?: string; trend?: "up" | "down" | "neutral" }) {
  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#a8843a]" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend === "up" ? "+12.5%" : "-4.2%"} vs periode lalu</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const now = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => startOfDay(now), [now]);
  const defaultFrom = useMemo(() => addDays(defaultTo, -(rangeKeyToDays("30d") - 1)), [defaultTo]);
  const [fromDate, setFromDate] = useState<Date>(defaultFrom);
  const [toDate, setToDate] = useState<Date>(defaultTo);
  const [rangeError, setRangeError] = useState<string>("");
  const [fromText, setFromText] = useState<string>(formatDateDmy(defaultFrom));
  const [toText, setToText] = useState<string>(formatDateDmy(defaultTo));
  const [chartOffset, setChartOffset] = useState(0);

  useEffect(() => {
    const desiredDays = rangeKeyToDays(range);
    const proposedTo = startOfDay(new Date());
    const proposedFrom = addDays(proposedTo, -(desiredDays - 1));
    const clamped = clampRangeToMaxDays(proposedFrom, proposedTo);
    setFromDate(clamped.from);
    setToDate(clamped.to);
    setFromText(formatDateDmy(clamped.from));
    setToText(formatDateDmy(clamped.to));
    setRangeError("");
  }, [range]);

  useEffect(() => {
    setFromText(formatDateDmy(fromDate));
  }, [fromDate]);

  useEffect(() => {
    setToText(formatDateDmy(toDate));
  }, [toDate]);

  useEffect(() => {
    setChartOffset(0);
  }, [fromDate, toDate]);

  const { data: analyticsData, loading, error, refetch } = useAnalyticsData(fromDate, toDate);

  const handleDownload = () => {
    const before = document.body.className;
    document.body.classList.add("printing-analytics");
    setTimeout(() => {
      window.print();
      document.body.className = before;
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Memuat data analitik...</div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500">{error || "Gagal memuat data"}</div>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
          Coba Lagi
        </Button>
      </div>
    );
  }

  const maxDailyVisitors = Math.max(...analyticsData.dailyVisitors, 1);
  const maxTopPageViews = Math.max(...analyticsData.topPages.map((p) => p.views), 1);

  // 7-day window for Kunjungan Website chart
  const VISIBLE_DAYS = 7;
  const totalDailyDays = analyticsData.dailyLabels.length;
  const maxChartOffset = Math.max(0, totalDailyDays - VISIBLE_DAYS);
  const effectiveOffset = Math.min(chartOffset, maxChartOffset);
  const visibleLabels = analyticsData.dailyLabels.slice(effectiveOffset, effectiveOffset + VISIBLE_DAYS);
  const visibleVisitors = analyticsData.dailyVisitors.slice(effectiveOffset, effectiveOffset + VISIBLE_DAYS);
  const visibleFrom = addDays(fromDate, effectiveOffset);
  const visibleTo = addDays(fromDate, effectiveOffset + VISIBLE_DAYS - 1);
  const canChartPrev = effectiveOffset > 0;
  const canChartNext = effectiveOffset < maxChartOffset;
  const visibleVisitorsTotal = visibleVisitors.reduce((s, v) => s + (v ?? 0), 0);

  return (
    <div className="space-y-6" id="analytics-report">
      <style>{`
        @media print {
          body.printing-analytics * { visibility: hidden !important; }
          body.printing-analytics #analytics-report,
          body.printing-analytics #analytics-report * { visibility: visible !important; }
          body.printing-analytics #analytics-report { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
          body.printing-analytics .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analitik Website</h2>
          <p className="text-sm text-gray-500 mt-0.5">Pantau performa website & konversi booking</p>
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 no-print"
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan PDF
        </Button>
      </div>

      {/* Range Filter */}
      <div className="space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">Periode</div>
              <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
                <SelectTrigger className="h-10 w-[170px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(rangeLabels) as RangeKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {rangeLabels[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">Dari tanggal</div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={fromText}
                  onChange={(e) => {
                    const next = normalizeDmyInput(e.target.value);
                    setFromText(next);
                    const parsed = parseDateDmy(next);
                    if (!parsed) return;
                    const clamped = clampRangeToMaxDays(parsed, toDate);
                    setFromDate(clamped.from);
                    setToDate(clamped.to);
                    setRangeError(clamped.to.getTime() !== startOfDay(toDate).getTime() ? `Maksimal rentang data 6 bulan. Tanggal akhir otomatis disesuaikan.` : "");
                  }}
                  onBlur={() => {
                    const parsed = parseDateDmy(fromText);
                    if (!parsed) {
                      setFromText(formatDateDmy(fromDate));
                      return;
                    }
                    const clamped = clampRangeToMaxDays(parsed, toDate);
                    setFromDate(clamped.from);
                    setToDate(clamped.to);
                    setFromText(formatDateDmy(clamped.from));
                    setToText(formatDateDmy(clamped.to));
                    setRangeError(clamped.to.getTime() !== startOfDay(toDate).getTime() ? `Maksimal rentang data 6 bulan. Tanggal akhir otomatis disesuaikan.` : "");
                  }}
                  className="h-10 w-[140px] rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-700"
                />

                <input
                  type="date"
                  value={toDateInputValue(fromDate)}
                  max={toDateInputValue(toDate)}
                  onChange={(e) => {
                    const v = parseDateInputValue(e.target.value);
                    if (!v) return;
                    const clamped = clampRangeToMaxDays(v, toDate);
                    setFromDate(clamped.from);
                    setToDate(clamped.to);
                    setRangeError(clamped.to.getTime() !== startOfDay(toDate).getTime() ? `Maksimal rentang data 6 bulan. Tanggal akhir otomatis disesuaikan.` : "");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 cursor-pointer"
                  aria-label="Pilih tanggal mulai"
                />

                <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500">Sampai tanggal</div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={toText}
                  onChange={(e) => {
                    const next = normalizeDmyInput(e.target.value);
                    setToText(next);
                    const parsed = parseDateDmy(next);
                    if (!parsed) return;
                    const clamped = clampRangeToMaxDays(fromDate, parsed);
                    setFromDate(clamped.from);
                    setToDate(clamped.to);
                    setRangeError(clamped.to.getTime() !== startOfDay(parsed).getTime() ? `Maksimal rentang data 6 bulan. Tanggal akhir otomatis disesuaikan.` : "");
                  }}
                  onBlur={() => {
                    const parsed = parseDateDmy(toText);
                    if (!parsed) {
                      setToText(formatDateDmy(toDate));
                      return;
                    }
                    const clamped = clampRangeToMaxDays(fromDate, parsed);
                    setFromDate(clamped.from);
                    setToDate(clamped.to);
                    setFromText(formatDateDmy(clamped.from));
                    setToText(formatDateDmy(clamped.to));
                    setRangeError(clamped.to.getTime() !== startOfDay(parsed).getTime() ? `Maksimal rentang data 6 bulan. Tanggal akhir otomatis disesuaikan.` : "");
                  }}
                  className="h-10 w-[140px] rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-700"
                />

                <input
                  type="date"
                  value={toDateInputValue(toDate)}
                  min={toDateInputValue(fromDate)}
                  max={toDateInputValue(endOfDay(new Date()))}
                  onChange={(e) => {
                    const v = parseDateInputValue(e.target.value);
                    if (!v) return;
                    const clamped = clampRangeToMaxDays(fromDate, v);
                    setFromDate(clamped.from);
                    setToDate(clamped.to);
                    setRangeError(clamped.to.getTime() !== startOfDay(v).getTime() ? `Maksimal rentang data 6 bulan. Tanggal akhir otomatis disesuaikan.` : "");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 cursor-pointer"
                  aria-label="Pilih tanggal akhir"
                />

                <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-[#a8843a]" />
            <span>
              {formatDateId(fromDate)} - {formatDateId(toDate)}
            </span>
            <span className="text-gray-400">({diffDaysInclusive(fromDate, toDate)} hari)</span>
          </div>
        </div>

        {rangeError && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{rangeError}</div>}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Globe}
          label="Total Pengunjung"
          value={analyticsData.visitors.toLocaleString("id-ID")}
          subtext={`${analyticsData.visitors.toLocaleString("id-ID")} pengunjung unik`}
          trend="up"
        />
        <StatCard
          icon={Calendar}
          label="Total Booking"
          value={analyticsData.bookings.toLocaleString("id-ID")}
          subtext={`Dari ${analyticsData.visitors.toLocaleString("id-ID")} kunjungan`}
          trend="up"
        />
        <StatCard
          icon={MousePointer}
          label="Konversi Rate"
          value={`${analyticsData.conversionRate.toFixed(1)}%`}
          subtext={`Target: 5.0%`}
          trend={analyticsData.conversionRate >= 4.5 ? "up" : "down"}
        />
        <StatCard
          icon={Clock}
          label="Total Kunjungan"
          value={analyticsData.dailyVisitors.reduce((total, value) => total + value, 0).toLocaleString("id-ID")}
          subtext={`Terekam oleh backend`}
          trend="up"
        />
      </div>

      {/* Charts Row 1 — Kunjungan Website & Sumber Trafik */}
      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#a8843a]" />
              Kunjungan Website & Sumber Trafik
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                onClick={() => setChartOffset((o) => Math.max(0, o - VISIBLE_DAYS))}
                disabled={!canChartPrev}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </Button>
              <span className="text-[11px] text-gray-500 min-w-[90px] text-center hidden sm:inline-block">
                {formatDateDmy(visibleFrom)} - {formatDateDmy(visibleTo)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                onClick={() => setChartOffset((o) => Math.min(maxChartOffset, o + VISIBLE_DAYS))}
                disabled={!canChartNext}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-3">
              <div className="h-48 sm:h-56 flex items-end gap-2 sm:gap-3 px-2">
                {visibleLabels.map((label, i) => {
                  const v = visibleVisitors[i] ?? 0;
                  const pct = maxDailyVisitors <= 0 ? 0 : (v / maxDailyVisitors) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                      <div className="text-xs font-semibold text-gray-700">{v.toLocaleString("id-ID")}</div>
                      <div className="w-full flex items-end justify-center h-36 sm:h-44">
                        <div
                          className="w-5 sm:w-7 rounded-t-lg bg-[#c9a24a]/80 transition-all duration-500 hover:bg-[#a8843a] cursor-pointer"
                          style={{ height: `${pct}%` }}
                          title={`${label}: ${v.toLocaleString("id-ID")} pengunjung`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 truncate w-full text-center whitespace-pre-line">{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#c9a24a]/80" />
                  <span className="text-gray-600">Pengunjung Website</span>
                </div>
                <div className="ml-auto text-xs text-gray-600 font-medium">
                  Total {Math.min(VISIBLE_DAYS, totalDailyDays)} hari: {visibleVisitorsTotal.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-[#a8843a]" />
                <span className="text-sm font-semibold text-gray-900">Sumber Trafik</span>
              </div>
              <DonutChart data={analyticsData.trafficSources} size={130} />
              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                {analyticsData.trafficSources.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-base font-bold text-gray-900">{s.value.toLocaleString("id-ID")}</p>
                    <p className="text-[11px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UTM Link Reference */}
      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#a8843a]" />
            Keterangan Link UTM untuk Tracking Sumber Trafik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 mb-3">
            Gunakan link berikut saat membagikan konten di media sosial untuk melacak sumber trafik:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Instagram</p>
                <code className="text-[10px] text-gray-500 truncate block">?utm_source=instagram&utm_medium=social</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Facebook</p>
                <code className="text-[10px] text-gray-500 truncate block">?utm_source=facebook&utm_medium=social</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-black" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">TikTok</p>
                <code className="text-[10px] text-gray-500 truncate block">?utm_source=tiktok&utm_medium=social</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">WhatsApp</p>
                <code className="text-[10px] text-gray-500 truncate block">?utm_source=whatsapp&utm_medium=share</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Google Ads</p>
                <code className="text-[10px] text-gray-500 truncate block">?utm_source=google&utm_medium=cpc</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#c9a24a]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Email Marketing</p>
                <code className="text-[10px] text-gray-500 truncate block">?utm_source=newsletter&utm_medium=email</code>
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-[11px] text-amber-800">
              <strong>Contoh lengkap:</strong> https://aestheticpondokindah.com/layanan?utm_source=instagram&utm_medium=social&utm_campaign=promo_mei
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#a8843a]" />
              Status Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.bookingStatus.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${b.color}`} />
                  <span className="text-sm text-gray-600 w-28">{b.status}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg ${b.color} opacity-80`}
                      style={{ width: `${(b.count / Math.max(analyticsData.bookings, 1)) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-gray-700">
                      {b.count.toLocaleString("id-ID")} ({Math.round((b.count / Math.max(analyticsData.bookings, 1)) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.bookings.toLocaleString("id-ID")}</p>
              <p className="text-xs text-gray-500">Total Booking</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-[#a8843a]" />
              Halaman Populer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              labels={analyticsData.topPages.map((p) => p.page)}
              values={analyticsData.topPages.map((p) => p.views)}
              max={maxTopPageViews}
            />
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#a8843a]" />
              Asal Daerah Pengunjung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.regionData.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 sm:w-32 truncate">{r.region}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-[#c9a24a] opacity-80"
                      style={{ width: `${(r.visitors / Math.max(analyticsData.visitors, 1)) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-gray-700">
                      {r.visitors.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{r.consultations}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center pt-2">
        Data dummy — akan dihubungkan dengan backend untuk analisis real-time
      </p>
    </div>
  );
}
