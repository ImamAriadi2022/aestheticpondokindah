import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/core/utils/logger";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary", "Unhandled UI Rendering Error", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  private handleResetSession = () => {
    localStorage.removeItem("apident:user");
    localStorage.removeItem("apident:token");
    localStorage.removeItem("auth_token");
    this.setState({ hasError: false });
    window.location.href = "/#/login";
  };

  render() {
    if (this.state.hasError) {
      const errMsg =
        this.state.error instanceof Error
          ? this.state.error.message
          : typeof this.state.error === "string"
          ? this.state.error
          : null;

      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#C59E3F]/30 p-8 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-[#F4EFE4] flex items-center justify-center text-[#C59E3F] mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold text-[#2C2416] mb-2">
              Terjadi Kesalahan Tampilan
            </h2>
            <p className="text-xs text-[#5C5546] leading-relaxed mb-4">
              Aplikasi mengalami kendala saat memuat komponen ini. Silakan muat ulang halaman untuk melanjutkan.
            </p>

            {errMsg && (
              <div className="mb-6 p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-[11px] text-red-700 font-mono text-left overflow-x-auto max-h-24">
                {errMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C59E3F] to-[#A37E28] text-white font-semibold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
              </button>
              <a
                href="/#/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#E6DECB] text-[#2C2416] font-semibold text-xs hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Ke Beranda
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E6DECB]/50">
              <button
                onClick={this.handleResetSession}
                className="text-[11px] text-[#A89F91] hover:text-[#C59E3F] underline transition-colors"
              >
                Login Ulang (Reset Sesi)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
