import { API_BASE } from "@/core/api/apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token");
}

export async function changeDoctorPassword(oldPassword: string, newPassword: string): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/user/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      current_password: oldPassword,
      password: newPassword,
      password_confirmation: newPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
}

export async function updateDoctorNotificationSettings(settings: Record<string, boolean>): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/user/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ preferences: settings }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
}
