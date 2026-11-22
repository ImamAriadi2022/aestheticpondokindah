import { API_BASE } from "@/core/api/apiConfig";
import { getSession } from "@/core/auth/services/session";

function getToken(): string | null {
  const session = getSession();
  return (
    (session as any)?.token ||
    localStorage.getItem("apident:token") ||
    localStorage.getItem("auth_token") ||
    null
  );
}

function adminHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type TrafficSourceItem = { label: string; value: number };

export type TopChannelItem = {
  source: string;
  label: string;
  count: number;
  percentage: number;
};

export type DailyTrendItem = {
  date: string;
  count: number;
};

export type UtmDetailItem = {
  utm_source: string;
  utm_medium: string | null;
  utm_campaign: string | null;
  count: number;
  percentage: number;
};

export type AnalyticsOverviewResponse = {
  start_date: string;
  end_date: string;
  total_visits: number;
  unique_visitors: number;
  total_reservations: number;
  conversion_rate: number;
  previous_period: {
    start_date: string;
    end_date: string;
    total_visits: number;
    growth_percentage: number;
  };
  top_channels: TopChannelItem[];
  daily_trend: DailyTrendItem[];
  details: UtmDetailItem[];
  top_pages: { page: string; views: number }[];
  booking_status: { status: string; count: number }[];
};

export type AnalyticsSummaryResponse = {
  from: string;
  to: string;
  total_visitors?: number;
  total_visits?: number;
  daily: {
    labels: string[];
    visitors: number[];
  };
  sources: TrafficSourceItem[];
  totals: {
    visitors: number;
    visits: number;
    bookings: number;
  };
  top_channels?: TopChannelItem[];
  daily_trend?: DailyTrendItem[];
  details?: UtmDetailItem[];
  booking_status?: { status: string; count: number }[];
  top_pages?: { page: string; views: number }[];
  previous_period?: {
    start_date: string;
    end_date: string;
    total_visits: number;
    growth_percentage: number;
  };
};

const VISITOR_ID_KEY = "apident:visitorId";
const SESSION_ID_KEY = "apident:utm_session_id";
const TRACKED_SIG_KEY = "apident:utm_tracked_sig";

function generateClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeUtmToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();
  return cleaned === "" ? null : cleaned;
}

function canonicalizeSource(source: string): string {
  switch (source) {
    case "ig":
    case "insta":
    case "l.instagram.com":
    case "instagram.com":
      return "instagram";
    case "fb":
    case "m.facebook.com":
    case "l.facebook.com":
    case "facebook.com":
      return "facebook";
    case "tt":
    case "tiktok.com":
    case "vm.tiktok.com":
      return "tiktok";
    case "wa":
    case "wa.me":
    case "whatsapp.com":
      return "whatsapp";
    case "yt":
    case "youtu.be":
    case "youtube.com":
      return "youtube";
    case "google.com":
    case "google.co.id":
      return "google";
    default:
      return source;
  }
}

export function detectSourceFromReferrer(referrer: string | null | undefined): string | null {
  if (!referrer || !referrer.trim()) return null;

  try {
    const refUrl = new URL(referrer);
    const refHost = refUrl.hostname.toLowerCase();
    const currentHost = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

    // Ignore internal navigation within the clinic domain itself
    if (
      !refHost ||
      refHost === currentHost ||
      refHost.includes("aestheticpondokindah.com")
    ) {
      return null;
    }

    const refLower = referrer.toLowerCase();
    if (refHost.includes("google")) return "google";
    if (refHost.includes("instagram") || refLower.includes("l.instagram")) return "instagram";
    if (refHost.includes("facebook") || refHost.includes("fb.com") || refHost.includes("fb.me")) return "facebook";
    if (refHost.includes("tiktok")) return "tiktok";
    if (refHost.includes("whatsapp") || refHost.includes("wa.me")) return "whatsapp";
    if (refHost.includes("youtube") || refHost.includes("youtu.be")) return "youtube";

    return "other";
  } catch {
    return null;
  }
}

export async function trackVisit(input: {
  landingPage: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): Promise<void> {
  if (typeof window === "undefined") return;

  const rawUtmSource = normalizeUtmToken(input.utmSource);
  const utmMedium = normalizeUtmToken(input.utmMedium);
  const utmCampaign = normalizeUtmToken(input.utmCampaign);
  const hasExplicitUtm = Boolean(rawUtmSource || utmMedium || utmCampaign);

  const referrer = input.referrer ?? document.referrer ?? null;

  let utmSource = rawUtmSource ? canonicalizeSource(rawUtmSource) : null;
  if (!utmSource) {
    utmSource = detectSourceFromReferrer(referrer) ?? "direct";
  }

  const attributionSignature = `${utmSource}|${utmMedium ?? ""}|${utmCampaign ?? ""}`;

  try {
    const previousSignature = sessionStorage.getItem(TRACKED_SIG_KEY);

    // Avoid duplicate hits during the same session on page refresh or SPA route changes,
    // while still recording if the visitor enters via a brand-new UTM campaign link.
    if (previousSignature !== null) {
      if (!hasExplicitUtm || previousSignature === attributionSignature) {
        return;
      }
    }

    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateClientId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateClientId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    // Mark tracked before fetch so React StrictMode double-effects never duplicate requests
    sessionStorage.setItem(TRACKED_SIG_KEY, attributionSignature);

    const res = await fetch(`${API_BASE}/analytics/track`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        landing_path: input.landingPage || "/",
        session_id: sessionId,
        visitor_id: visitorId,
        referrer: referrer || null,
      }),
    });

    // If the network/server failed, clear signature so next page load can retry
    if (!res.ok) {
      sessionStorage.removeItem(TRACKED_SIG_KEY);
    }
  } catch {
    try {
      sessionStorage.removeItem(TRACKED_SIG_KEY);
    } catch {
      // Ignore storage restrictions
    }
  }
}

export async function getAnalyticsOverview(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsOverviewResponse> {
  const url = new URL(`${API_BASE}/admin/analytics/overview`, window.location.origin);
  if (startDate) url.searchParams.set("start_date", startDate);
  if (endDate) url.searchParams.set("end_date", endDate);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: adminHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Gagal memuat data analitik (${res.status})`);
  }

  return (await res.json()) as AnalyticsOverviewResponse;
}

export async function getAnalyticsSummary(from: string, to: string): Promise<AnalyticsSummaryResponse> {
  const url = new URL(`${API_BASE}/admin/analytics/summary`, window.location.origin);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: adminHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed (${res.status})`);
  }

  return (await res.json()) as AnalyticsSummaryResponse;
}
