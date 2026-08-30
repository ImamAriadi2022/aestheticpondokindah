import React, { useState, useEffect, useMemo } from "react";
import { getSession } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Search,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Clock,
  Droplets,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { fetchPublicFaqs, type FAQItem } from "../services/helpService";

export default function HelpPage() {
  const session = getSession();
  const role = session?.role as string | undefined;

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    fetchPublicFaqs()
      .then((data) => setFaqs(data))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchSearch =
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "Semua" || faq.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [faqs, search, selectedCategory]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqContent = (
    <div className="space-y-8 max-w-4xl mx-auto py-2 sm:py-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#FAF5EA] via-[#FDFBF7] to-white border border-[#EADBBD] p-6 sm:p-8 shadow-sm overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C9A24A]/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#C9A24A]/15 to-[#B8943F]/15 border border-[#C9A24A]/30 text-[#8C6B1C] text-xs font-extrabold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#C9A24A]" />
            Frequently Asked Questions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D332A] tracking-tight">
            Pusat Bantuan & FAQ
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed max-w-2xl">
            Temukan jawaban cepat seputar proses reservasi jadwal, persiapan perawatan gigi, sistem membership, loyalty poin, serta ketentuan operasional Aesthetic Pondok Indah Dental Clinic.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7B6B]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ketik kata kunci pertanyaan Anda (misal: reservasi, behel, membership)..."
                className="pl-11 h-12 rounded-2xl border-[#D9D0BC] bg-white text-xs sm:text-sm focus-visible:ring-[#C9A24A] text-[#3D332A] placeholder:text-[#9E9080] shadow-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white shadow-xs"
                  : "bg-white text-[#6B5E4F] border border-[#EADBBD] hover:bg-[#FAF5EA]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-extrabold text-[#3D332A] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C9A24A]" /> Daftar Pertanyaan ({filteredFaqs.length})
          </h2>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-[#8C6B1C] hover:underline cursor-pointer"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-[#EADBBD] p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-[#C9A24A] animate-spin" />
            <p className="text-xs text-[#7A6E60]">Memuat daftar pertanyaan FAQ...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EADBBD] p-10 text-center space-y-3 shadow-xs">
            <HelpCircle className="w-10 h-10 text-[#C9A24A]/50 mx-auto" />
            <p className="text-sm font-bold text-[#3D332A]">Pertanyaan Tidak Ditemukan</p>
            <p className="text-xs text-[#7A6E60] max-w-md mx-auto">
              Tidak ada pertanyaan yang sesuai dengan kata kunci "{search}". Silakan hubungi tim Customer Care kami melalui WhatsApp jika Anda membutuhkan bantuan lebih lanjut.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#EADBBD] shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                >
                  <div className="flex items-start gap-3 pr-3">
                    <span className="w-6 h-6 rounded-lg bg-[#FAF5EA] border border-[#EADBBD] text-[#8C6B1C] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#3D332A] leading-snug">
                        {faq.q}
                      </p>
                      {faq.category && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#8C6B1C] bg-[#FAF5EA] px-2 py-0.5 rounded-md border border-[#EADBBD]">
                          {faq.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#FAF8F5] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5C5042] leading-relaxed border-t border-[#F0E6D3] bg-[#FAFBF9]/40">
                    <div className="flex items-start gap-3 pt-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        A
                      </span>
                      <p className="flex-1 text-xs sm:text-sm text-[#4A3F35] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direct Contact Support Card */}
      <div className="bg-gradient-to-r from-[#2C2416] via-[#3D332A] to-[#2C2416] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A24A]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row gap-6 items-center justify-between text-center lg:text-left">
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Belum Menemukan Jawaban yang Anda Cari?
            </h3>
            <p className="text-xs text-[#D9D0BC] max-w-lg leading-relaxed">
              Tim Customer Care Aesthetic Pondok Indah siap memberikan panduan dan bantuan langsung setiap hari pukul 09:00 - 20:00 WIB.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <a href="https://wa.me/6281990114949" target="_blank" rel="noreferrer">
                <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer flex items-center gap-2">
                  <Droplets className="w-4 h-4" /> Hubungi WhatsApp
                </Button>
              </a>
              <a href="mailto:aesthetic.pondokindah@gmail.com">
                <Button variant="outline" className="h-10 px-5 rounded-xl border-[#EADBBD]/30 bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Kirim Email
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[130px] text-center">
              <Phone className="w-4 h-4 text-[#C9A24A] mb-1.5 mx-auto" />
              <p className="text-[9px] text-[#D9D0BC] font-bold uppercase tracking-wider mb-0.5">WhatsApp / CS</p>
              <p className="font-bold text-xs text-white">+62 819-9011-4949</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[130px] text-center">
              <Clock className="w-4 h-4 text-[#C9A24A] mb-1.5 mx-auto" />
              <p className="text-[9px] text-[#D9D0BC] font-bold uppercase tracking-wider mb-0.5">Jam Praktik</p>
              <p className="font-bold text-xs text-white">09:00 - 20:00 WIB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 1. Logged in as Admin
  if (role === "clinic_admin" || role === "developer" || role === "admin") {
    return <DashboardLayout role="clinic">{faqContent}</DashboardLayout>;
  }

  // 2. Logged in as Doctor
  if (role === "doctor") {
    return <DashboardLayout role="doctor">{faqContent}</DashboardLayout>;
  }

  // 3. Logged in as Patient / User Member
  if (role === "patient" || role === "user") {
    return <DashboardLayout role="user">{faqContent}</DashboardLayout>;
  }

  // 4. Public Visitor
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {faqContent}
      </main>
      <Footer />
    </div>
  );
}
