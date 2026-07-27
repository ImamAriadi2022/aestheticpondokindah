import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { CreditCard, Calendar, Download } from "lucide-react";

export default function RightPanel() {
  return (
    <div className="space-y-6">
      {/* My Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4 flex items-center justify-between">
          <CardTitle className="text-base font-bold">Kartu Membership</CardTitle>
          <Button variant="ghost" size="xs" className="text-[#377DFF] hover:bg-[#377DFF]/10 px-2 py-1 rounded-full text-xs">
            Ganti
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-[#377DFF] to-[#0E4BFF] text-white p-5 flex flex-col gap-6 shadow-lg">
            <div className="text-sm">AP Dental Digital Card</div>
            <div className="flex justify-between text-lg font-semibold tracking-widest">
              <span>****</span><span>****</span><span>****</span><span>4728</span>
            </div>
            <div className="flex justify-between text-xs opacity-80">
              <span>12/28</span>
              <span>ROBIN</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className="text-2xl font-bold text-gray-900">Rp12.580.400</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Masa aktif</p>
              <p className="text-sm font-semibold">12/2026</p>
            </div>
            <CreditCard className="w-10 h-10 opacity-70" />
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-white border-white/30 hover:bg-white/10">
            Upgrade
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Appointment */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Janji Mendatang</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-[#377DFF]" />
            <div>
              <p className="font-semibold text-gray-900">Perawatan Scaling</p>
              <p className="text-xs text-gray-500">Selasa, 23 Mei 2026 - 10:00</p>
            </div>
          </div>
          <Button size="sm" className="w-full rounded-full bg-[#377DFF] hover:bg-[#0E4BFF] text-white text-sm">
            Detail
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100 text-sm">
          {[
            { name: "Hasil Rontgen.pdf", size: "234kb" },
            { name: "Invoice_2025-05.pdf", size: "78kb" },
          ].map((f) => (
            <div key={f.name} className="flex items-center justify-between px-6 py-3">
              <span className="truncate text-gray-700 flex-1 mr-2">{f.name}</span>
              <span className="text-xs text-gray-400">{f.size}</span>
              <Button variant="ghost" size="icon" className="text-[#377DFF] hover:bg-[#377DFF]/10">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
