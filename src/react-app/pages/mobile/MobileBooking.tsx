import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import NewMobileDashboardLayout from "@/react-app/components/dashboard/NewMobileDashboardLayout";
import { ArrowRight, Check, Search } from "lucide-react";
import { services as allServices } from "@/react-app/pages/Services";

export default function MobileBookingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const bookingServices = useMemo(() => {
    return allServices.map((s) => ({
      id: s.id,
      label: s.title,
      description: s.intro,
      image: s.image,
    }));
  }, []);

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    // Navigate to doctor selection after a brief delay
    setTimeout(() => {
      navigate(`/dashboard/user?tab=booking&step=dokter&service=${serviceId}`);
    }, 200);
  };

  return (
    <NewMobileDashboardLayout role="user" hideBottomNav>
      {/* Progress Steps */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#c9a24a] text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="text-xs font-medium text-[#c9a24a]">Layanan</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-xs font-medium text-gray-400">Dokter</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-xs font-medium text-gray-400">Jadwal</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              4
            </div>
            <span className="text-xs font-medium text-gray-400">Konfirmasi</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Pilih Layanan</h1>
          <p className="text-sm text-gray-500">
            Pilih layanan yang Anda butuhkan untuk booking janji temu
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari layanan (mis. Whitening, Implants)"
            className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
          />
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {bookingServices
            .filter((s) => !query || s.label.toLowerCase().includes(query.toLowerCase()))
            .map((service) => {
            const isSelected = selectedService === service.id;
            
            return (
              <div
                key={service.id}
                onClick={() => handleSelectService(service.id)}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  isSelected 
                    ? "border-[#c9a24a] bg-[#c9a24a]/5" 
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#FFF8F0] border border-[#F2E6CC] flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={service.image} alt={service.label} className="w-full h-full object-contain p-2" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{service.label}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{service.description}</p>
                    <span className="text-xs text-[#c9a24a] font-semibold">Pilih Layanan</span>
                  </div>
                  
                  {isSelected && (
                    <div className="w-6 h-6 bg-[#c9a24a] rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </NewMobileDashboardLayout>
  );
}
