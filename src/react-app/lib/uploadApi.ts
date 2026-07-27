import { API_BASE } from "./apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token");
}

export async function uploadFile(file: File): Promise<{ url: string; name: string; size: number }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal mengunggah file");
  }

  return res.json();
}
