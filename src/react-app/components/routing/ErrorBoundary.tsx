import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/react-app/lib/logger";

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
    logger.error("Unhandled UI error", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Terjadi kesalahan pada halaman</div>
            <div className="mt-2 text-gray-600">
              Silakan reload. Jika masih terjadi, cek Console/Network untuk detailnya.
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button className="px-3 py-2 rounded bg-black text-white" onClick={this.handleReload}>
                Reload
              </button>
              <a className="px-3 py-2 rounded border border-gray-300" href="/">
                Ke Beranda
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
