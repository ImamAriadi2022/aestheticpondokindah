import { API_BASE } from "@/core/api/apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token") || localStorage.getItem("auth_token");
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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || data.errors?.current_password?.[0] || data.errors?.password?.[0] || "Gagal mengubah password.";
    throw new Error(errorMsg);
  }
  return data;
}

export async function changeDoctorEmail(newEmail: string): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/user/email`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ email: newEmail }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || data.errors?.email?.[0] || "Gagal mengubah email.";
    throw new Error(errorMsg);
  }
  return data;
}

export async function logoutAllDoctorDevices(): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/logout-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || "Gagal mengakhiri semua sesi.";
    throw new Error(errorMsg);
  }
  return data;
}

export async function deleteDoctorAccount(): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/user/account`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || "Gagal menghapus akun.";
    throw new Error(errorMsg);
  }
  return data;
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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || "Gagal memperbarui preferensi.";
    throw new Error(errorMsg);
  }
  return data;
}

