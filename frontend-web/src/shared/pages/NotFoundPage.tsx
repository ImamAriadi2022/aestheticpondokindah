import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-[#C9A24A]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-gray-500">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-[#C9A24A] text-white text-sm font-semibold rounded-xl hover:bg-[#B8943F] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
