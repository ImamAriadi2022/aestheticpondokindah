import { API_BASE } from "@/core/api/apiConfig";

export interface DoctorProfileData {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  specialization?: string;
  strNumber?: string;
  str_number?: string;
  sipNumber?: string;
  sip_number?: string;
  education?: string;
  experienceYears?: number | string;
  experience_years?: number | string;
  primaryBranch?: string;
  primary_branch?: string;
  consultationFee?: number;
  consultation_fee?: number;
  bio?: string;
}

function getToken(): string | null {
  return localStorage.getItem("apident:token");
}

export async function getDoctorProfile(): Promise<DoctorProfileData | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateDoctorProfile(data: Partial<DoctorProfileData>): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
}
