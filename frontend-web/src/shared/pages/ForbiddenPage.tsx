import { Link, useNavigate } from "react-router";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-[#C9A24A]">403</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-gray-500">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Kembali
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#C9A24A] text-white text-sm font-semibold rounded-xl hover:bg-[#B8943F] transition-colors"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
