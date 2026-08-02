import { API_BASE } from "@/core/api/apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token");
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

export type AnalyticsSummaryResponse = {
  from: string;
  to: string;
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
  booking_status: { status: string; count: number }[];
  top_pages: { page: string; views: number }[];
};

export async function trackVisit(input: {
  landingPage: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) {
  const visitorIdKey = "apident:visitorId";
  let visitorId = localStorage.getItem(visitorIdKey);
  if (!visitorId) {
    visitorId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);
    localStorage.setItem(visitorIdKey, visitorId);
  }

  await fetch(`${API_BASE}/public/analytics/visit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      visitorId,
      landingPage: input.landingPage,
      referrer: input.referrer ?? document.referrer ?? null,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
    }),
  });
}

export async function getAnalyticsSummary(from: string, to: string): Promise<AnalyticsSummaryResponse> {
  const url = new URL(`${API_BASE}/admin/analytics/summary`);
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
