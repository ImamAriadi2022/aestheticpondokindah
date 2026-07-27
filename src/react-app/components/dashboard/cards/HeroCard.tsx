import { Button } from "@/react-app/components/ui/button";

export default function HeroCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#377DFF] to-[#0E4BFF] p-8 relative overflow-hidden text-white flex items-center justify-between shadow-lg">
      <div className="max-w-[60%]">
        <h2 className="text-2xl font-bold leading-snug mb-2">Mudah Kelola Janji Temu Gigi Anda</h2>
        <p className="text-sm opacity-90 mb-6">Lihat dan atur riwayat serta jadwal perawatan gigi Anda di sini.</p>
        <Button className="bg-white text-[#0E4BFF] font-semibold rounded-full px-6 py-2 text-sm hover:bg-blue-50">Buat Janji</Button>
      </div>
      <img src="https://images.unsplash.com/photo-1588776814546-f8b94d117315?auto=format&fit=crop&w=400&q=60" alt="Dental Hero" className="w-40 lg:w-52 rounded-xl drop-shadow-2xl" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
    </div>
  );
}
