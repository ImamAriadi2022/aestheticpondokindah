import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Card, CardContent } from "@/react-app/components/ui/card";
import DashboardLayout from "@/react-app/components/dashboard/DashboardLayout";
import { 
  Search, 
  Book, 
  Video, 
  MessageSquare, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Droplets,
  Mail,
  Clock,
  Phone
} from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "Bagaimana cara melakukan reservasi?",
      a: "Anda dapat melakukan reservasi melalui menu 'Reservasi' di dashboard atau menghubungi nomor WhatsApp kami."
    },
    {
      q: "Apakah ada biaya pembatalan?",
      a: "Tidak ada biaya pembatalan jika dilakukan minimal 24 jam sebelum jadwal konsultasi."
    },
    {
      q: "Apa keuntungan menjadi member?",
      a: "Member mendapatkan potongan harga khusus, prioritas reservasi, dan poin reward setiap transaksi."
    }
  ];

  return (
    <DashboardLayout role="user">
      <div className="w-full px-0 sm:px-2">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white shadow-md mx-auto mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Pusat Bantuan</h1>
          <p className="text-xs text-gray-500 font-medium max-w-md mx-auto leading-relaxed">Temukan jawaban atas pertanyaan Anda atau hubungi tim support kami.</p>
          
          <div className="max-w-xl mx-auto mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Cari bantuan..." 
              className="h-12 pl-11 pr-4 rounded-xl border-gray-100 shadow-lg shadow-gray-200/30 bg-white text-sm font-medium focus:ring-[#c9a24a] transition-all"
            />
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="rounded-xl border-0 shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center group-hover:bg-[#c9a24a] transition-colors">
                  <Video className="w-5 h-5 text-[#a8843a] group-hover:text-white" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#c9a24a] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight mb-1">Tutorial Dasar</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">Pelajari cara penggunaan dashboard dalam video singkat.</p>
              <div className="flex items-center text-[#a8843a] font-bold text-[10px] uppercase tracking-wider group-hover:gap-1.5 transition-all">
                Tonton <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Book className="w-5 h-5 text-blue-500 group-hover:text-white" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight mb-1">Panduan Pengguna</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">Dokumen lengkap cara penggunaan sistem membership.</p>
              <div className="flex items-center text-blue-500 font-bold text-[10px] uppercase tracking-wider group-hover:gap-1.5 transition-all">
                Baca PDF <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#a8843a]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-xl border border-gray-50 shadow-sm overflow-hidden transition-all">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-bold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center transition-transform group-open:rotate-180">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
                  </div>
                </summary>
                <div className="px-4 pb-4 text-gray-500 font-medium text-xs leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a24a]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative flex flex-col lg:flex-row gap-8 items-center text-center lg:text-left">
            <div className="flex-1">
              <h2 className="text-xl font-bold tracking-tight mb-2">Masih butuh bantuan?</h2>
              <p className="text-xs text-gray-400 font-medium mb-6">Tim kami siap membantu Anda setiap hari pukul 09:00 - 21:00 WIB.</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Button className="bg-[#c9a24a] hover:bg-[#a8843a] text-white h-10 px-6 rounded-lg font-bold text-xs flex items-center gap-2">
                  <Droplets className="w-4 h-4" /> WhatsApp
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 px-6 rounded-lg font-bold text-xs flex items-center gap-2 backdrop-blur-md">
                  <Mail className="w-4 h-4" /> Email
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm min-w-[120px]">
                <Phone className="w-4 h-4 text-[#c9a24a] mb-2 mx-auto lg:mx-0" />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Telepon</p>
                <p className="font-bold text-xs">(021) 1234 5678</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm min-w-[120px]">
                <Clock className="w-4 h-4 text-[#c9a24a] mb-2 mx-auto lg:mx-0" />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Jam Kerja</p>
                <p className="font-bold text-xs">09:00 - 21:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
