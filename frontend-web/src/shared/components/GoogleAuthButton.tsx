import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { API_BASE } from "@/core/api/apiConfig";
import { getDefaultDashboardPath } from "@/core/auth/services/session";
import { touchSessionLastActive } from "@/core/auth/services/sessionTtl";
import { toast } from "@/shared/ui/toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (notification?: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
          initCodeClient?: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  mode?: "login" | "register" | "link";
  className?: string;
  onSuccess?: (user: any) => void;
  onError?: (err: string) => void;
  disabled?: boolean;
}

export default function GoogleAuthButton({
  mode = "login",
  className = "",
  onSuccess,
  onError,
  disabled = false,
}: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const tokenClientRef = useRef<any>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = "google-gsi-client-script";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize GIS Token Client
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.oauth2) return;

    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            setLoading(false);
            const errMsg = tokenResponse.error_description || "Autentikasi Google dibatalkan.";
            onError?.(errMsg);
            toast({ title: "Gagal", message: errMsg, variant: "error" });
            return;
          }

          if (tokenResponse.access_token) {
            await handleGoogleBackendAuth({ access_token: tokenResponse.access_token });
          }
        },
        error_callback: (err: any) => {
          setLoading(false);
          const errMsg = err?.message || "Terjadi kendala saat membuka Google Login.";
          onError?.(errMsg);
          toast({ title: "Gagal", message: errMsg, variant: "error" });
        },
      });
    } catch (e) {
      console.warn("GIS token client init error:", e);
    }
  }, [scriptLoaded, clientId, mode]);

  const handleGoogleBackendAuth = async (payload: { credential?: string; access_token?: string }) => {
    try {
      setLoading(true);

      if (mode === "link") {
        // Link to existing logged in account
        const token = localStorage.getItem("apident:token");
        if (!token) {
          throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
        }

        const res = await fetch(`${API_BASE}/auth/google/link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Gagal menghubungkan akun Google.");
        }

        // Update local session
        if (data.user) {
          localStorage.setItem("apident:user", JSON.stringify(data.user));
        }

        toast({
          title: "Berhasil",
          message: data.message || "Akun Google berhasil dihubungkan.",
          variant: "success",
        });

        onSuccess?.(data.user);
      } else {
        // Login or Register
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...payload,
            mode: mode,
            device_name: "web_browser",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || (mode === "register" ? "Gagal mendaftar dengan Google." : "Gagal masuk dengan Google."));
        }

        localStorage.setItem("apident:token", data.token);
        localStorage.setItem("apident:user", JSON.stringify(data.user));
        touchSessionLastActive();

        const dest = getDefaultDashboardPath(data.user?.role) || "/dashboard/user";

        toast({
          title: "Berhasil",
          message: data.message || (mode === "register" ? "Pendaftaran berhasil! Mengalihkan..." : "Login berhasil! Mengalihkan..."),
          variant: "success",
        });

        if (onSuccess) {
          onSuccess(data.user);
        } else {
          setTimeout(() => {
            window.location.assign(dest);
          }, 300);
        }
      }
    } catch (err: any) {
      const msg = err.message || "Terjadi kesalahan saat memproses autentikasi Google.";
      onError?.(msg);
      toast({
        title: "Gagal Autentikasi",
        message: msg,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (disabled || loading) return;

    setLoading(true);

    if (tokenClientRef.current) {
      try {
        // Request token directly via Google popup
        tokenClientRef.current.requestAccessToken();
        return;
      } catch (err) {
        console.warn("Token client request error:", err);
      }
    }

    // Fallback: standard OAuth2 popup
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent("email profile openid");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${scope}&prompt=select_account`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no`
    );

    if (!popup) {
      setLoading(false);
      const msg = "Popup diblokir oleh browser. Izinkan popup untuk login dengan Google.";
      onError?.(msg);
      toast({ title: "Popup Terblokir", message: msg, variant: "warning" });
      return;
    }

    // Listen for access_token in popup hash
    const checkPopup = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          setLoading(false);
          return;
        }

        if (popup.location?.href && popup.location.href.startsWith(window.location.origin)) {
          const hash = popup.location.hash;
          popup.close();
          clearInterval(checkPopup);

          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get("access_token");
            if (accessToken) {
              handleGoogleBackendAuth({ access_token: accessToken });
              return;
            }
          }
          setLoading(false);
        }
      } catch {
        // Cross-origin before redirect - keep polling
      }
    }, 500);
  };

  const getLabel = () => {
    if (loading) {
      if (mode === "link") return "Menghubungkan Akun Google...";
      if (mode === "register") return "Mendaftarkan Akun Google...";
      return "Masuk dengan Google...";
    }
    if (mode === "link") return "Hubungkan dengan Akun Google";
    if (mode === "register") return "Daftar dengan Google";
    return "Masuk dengan Google";
  };

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-[#FAF8F5] active:bg-[#F5EFE6] text-[#2C2416] font-semibold text-xs sm:text-sm rounded-xl border border-[#E8DFC8] hover:border-[#C9A24A]/60 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.99] ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-[#8C6B1C] animate-spin shrink-0" />
      ) : (
        /* Official Google 'G' Vector Icon */
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      )}
      <span>{getLabel()}</span>
    </button>
  );
}