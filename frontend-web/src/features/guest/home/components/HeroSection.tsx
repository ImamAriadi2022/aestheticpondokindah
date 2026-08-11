import { useEffect, useState } from "react";
import { buildGuestBookingWhatsAppUrl, submitPublicReservation, WA_NUMBER } from "@/features/guest/reservation/services/reservationApi";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";
import GuestBookingTermsDialog from "@/features/guest/reservation/components/GuestBookingTermsDialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { CalendarDays, Phone, User, MessageSquare, Loader2, Clock } from "lucide-react";

export default function HeroSection() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [appointment, setAppointment] = useState({
    fullName: "",
    phone: "",
    complaint: "",
    date: todayStr,
    time: "10:00",
  });

  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [bookingTerms, setBookingTerms] = useState<string>();
  const [bookingWhatsappNumber, setBookingWhatsappNumber] = useState(WA_NUMBER);

  useEffect(() => {
    getPublicClinicSettings().then((settings) => {
      setBookingTerms(settings.booking_terms);
      if (settings.booking_whatsapp_number) setBookingWhatsappNumber(settings.booking_whatsapp_number);
    }).catch(() => {});
  }, []);

  const submitHeroBooking = async (source: string) => {
    if (submitting) return;

    if (!appointment.fullName.trim() || !appointment.phone.trim()) {
      toast({
        title: "Form Belum Lengkap",
        message: "Mohon isi Nama Lengkap dan Nomor WhatsApp Anda.",
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);
    const res = await submitPublicReservation({
      name: appointment.fullName.trim(),
      phone: appointment.phone.trim(),
      complaint: appointment.complaint,
      date: appointment.date,
      preferred_time: appointment.time,
      source,
    });

    if (res) {
      toast({
        title: "Reservasi Berhasil",
        message: `Reservasi ${res.code || ""} berhasil dikirim! Tim kami akan segera menghubungi Anda.`,
        variant: "success",
      });
      setAppointment({ fullName: "", phone: "", complaint: "", date: todayStr, time: "10:00" });
      setMobileBookingOpen(false);
      window.location.assign(buildGuestBookingWhatsAppUrl({
        name: appointment.fullName.trim(),
        phone: appointment.phone.trim(),
        complaint: appointment.complaint,
        date: appointment.date,
        waNumber: bookingWhatsappNumber,
      }));
    } else {
      toast({
        title: "Gagal Mengirim",
        message: "Terjadi kendala saat mengirim reservasi. Silakan coba beberapa saat lagi.",
        variant: "error",
      });
    }
    setSubmitting(false);
  };

  const handleHeroSubmit = (e: React.FormEvent, source: string) => {
    e.preventDefault();
    if (!appointment.fullName.trim() || !appointment.phone.trim()) {
      toast({ title: "Form Belum Lengkap", message: "Mohon isi Nama Lengkap dan Nomor WhatsApp Anda.", variant: "warning" });
      return;
    }
    setTermsOpen(true);
  };

  const complaints = [
    { value: "", label: "Pilih keluhan" },
    { value: "konsultasi-umum", label: "Konsultasi Umum" },
    { value: "veneer", label: "Veneer" },
    { value: "smile-design", label: "Smile Design" },
    { value: "bleaching", label: "Bleaching" },
    { value: "scaling", label: "Scaling" },
    { value: "orthodonti", label: "Orthodonti / Behel" },
    { value: "implan-gigi", label: "Implan Gigi" },
    { value: "lainnya", label: "Lainnya" },
  ];

  return (
    <section className="relative bg-background">
      <div className="container mx-auto px-3 sm:px-4 pt-0 lg:pt-2 pb-20 sm:pb-24 lg:pb-16">
        <div className="relative rounded-2xl sm:rounded-[2rem] bg-background shadow-2xl shadow-black/5 overflow-hidden">
          <div className="relative grid lg:grid-cols-2 gap-6 lg:gap-10 items-start px-3 sm:px-4 lg:px-16 pt-4 lg:pt-8 pb-28 sm:pb-32 lg:pb-32">
            <div className="space-y-4 lg:-mt-1">
              <div className="text-xs lg:text-[1.25rem] font-semibold tracking-wide text-brand-warm-gray font-body">
                Aesthetic Pondok Indah Dental Clinic
              </div>

              <h1 className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4.25rem] font-bold text-brand-charcoal leading-[1.1] sm:leading-[1.03] tracking-tight">
                The solution to
                <span className="block">brighten your</span>
                <span className="block text-gradient-gold">smile</span>
              </h1>

              <div className="lg:hidden rounded-xl bg-background/70 border border-border p-4 shadow-lg shadow-black/5">
                <div className="text-xs font-semibold text-brand-charcoal">Our Services Include:</div>
                <div className="mt-2 space-y-1.5">
                  {[
                    "Aesthetic Dentistry Consultation",
                    "Pre-Veneer",
                    "Smile Design",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                      <div className="text-xs text-brand-warm-gray font-body">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 lg:-mt-1">
                <div className="text-base sm:text-lg font-semibold text-brand-charcoal">
                  Smile Confidently with Veneers!
                </div>
                <div className="text-sm sm:text-base text-brand-warm-gray font-body">
                  Professional and Trusted Aesthetic Dentistry
                </div>
                <div className="inline-flex rounded-lg sm:rounded-xl bg-brand-gold-light px-3 sm:px-5 py-2 text-xs sm:text-base font-semibold text-brand-charcoal font-body">
                  Get 10% Off When You Consult for Veneers This Month!
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 pt-2">
                <div className="flex -space-x-2">
                  {[
                    "/testi/DEBBY-2-scaled.jpg",
                    "/testi/MARSHANDA-scaled.jpg",
                    "/testi/MAZAYA-scaled.jpg",
                  ].map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt="Customer"
                      className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-sm sm:text-base font-semibold text-brand-charcoal">180+</span>
                    <span className="text-[10px] sm:text-xs text-brand-warm-gray font-body">Satisfied Customer</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block -mt-16">
              <div
                className="absolute right-10 -top-6 w-[420px] h-[420px] rounded-[3rem] bg-brand-gold/15"
                style={{ clipPath: "ellipse(55% 55% at 62% 45%)" }}
              />
              <div className="absolute right-24 top-4 w-[360px] h-[360px] rounded-full bg-gradient-gold opacity-15" />

              <div className="relative z-10 flex justify-end">
                <div className="relative w-[500px] h-[520px]">
                  <div
                    className="absolute inset-0"
                    style={{
                      maskImage:
                        "radial-gradient(closest-side, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage:
                        "radial-gradient(closest-side, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)",
                    }}
                  >
                    <img
                      src="/hero/foto-dokter.png"
                      alt="Doctor"
                      className="w-full h-full object-contain object-bottom drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                    />
                  </div>

                  <div className="absolute bottom-10 right-6 w-[340px] rounded-2xl bg-background/85 backdrop-blur border border-border p-5 shadow-xl shadow-black/10">
                    <div className="text-sm font-semibold text-brand-charcoal">Our Services Include:</div>
                    <div className="mt-3 space-y-2">
                      {[
                        "Aesthetic Dentistry Consultation",
                        "Pre-Veneer",
                        "Smile Design",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="mt-1 w-2 h-2 rounded-full bg-brand-gold" />
                          <div className="text-sm text-brand-warm-gray font-body">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-8 right-8 bottom-4 lg:bottom-0 lg:left-14 lg:right-14 z-16 hidden lg:block">
            <div className="rounded-3xl bg-background p-2 shadow-xl shadow-black/10">
              <div className="rounded-2xl bg-background border border-border">
                <form
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1.2fr_auto] gap-4 p-5"
                  onSubmit={(e) => handleHeroSubmit(e, "hero_desktop")}
                >
                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Nama
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <Input
                        type="text"
                        value={appointment.fullName}
                        onChange={(e) =>
                          setAppointment({ ...appointment, fullName: e.target.value })
                        }
                        placeholder="Nama lengkap"
                        className="h-11 font-body pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Nomor HP
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <Input
                        type="tel"
                        value={appointment.phone}
                        onChange={(e) => setAppointment({ ...appointment, phone: e.target.value })}
                        placeholder="Nomor WhatsApp"
                        className="h-11 font-body pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Keluhan
                    </label>
                    <div className="relative">
                      <MessageSquare className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <select
                        value={appointment.complaint}
                        onChange={(e) =>
                          setAppointment({ ...appointment, complaint: e.target.value })
                        }
                        className="bg-background border border-border h-11 rounded-xl px-3 py-2 text-base transition-colors md:text-sm w-full min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 font-body pl-9"
                        required
                      >
                        {complaints.map((c) => (
                          <option key={c.value} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Pilih Tanggal
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <Input
                        type="date"
                        min={todayStr}
                        value={appointment.date}
                        onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                        className="h-11 font-body pl-9 text-xs"
                        required
                      />
                    </div>
                  </div>


                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-11 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-gold/20 font-body px-8 min-w-[120px]"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Book now"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
            <div className="mx-auto max-w-md">
              <button
                type="button"
                className="w-full rounded-xl bg-background/95 backdrop-blur border border-border shadow-lg shadow-black/10 px-3 py-2.5 flex items-center justify-between gap-2"
                onClick={() => setMobileBookingOpen(true)}
              >
                <div className="min-w-0 text-left">
                  <div className="text-xs font-semibold text-brand-charcoal">Booking Konsultasi</div>
                  <div className="text-[10px] text-brand-warm-gray font-body truncate">
                    Isi data singkat, lanjut ke WhatsApp
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center justify-center rounded-lg bg-gradient-gold text-white font-semibold text-xs h-8 px-3 font-body">
                    Book
                  </span>
                </div>
              </button>
            </div>
          </div>

          <Dialog open={mobileBookingOpen} onOpenChange={setMobileBookingOpen}>
            <DialogContent
              className="lg:hidden top-auto bottom-0 left-1/2 -translate-x-1/2 -translate-y-0 w-full max-w-md rounded-b-none rounded-t-3xl p-0 gap-0 overflow-hidden"
              showCloseButton
            >
              <div className="p-5">
                <DialogTitle asChild>
                  <div className="text-base font-semibold text-brand-charcoal">Booking Konsultasi</div>
                </DialogTitle>
                <div className="text-xs text-brand-warm-gray font-body mt-1">
                  Data kamu akan dikirim ke WhatsApp.
                </div>
              </div>
              <div className="px-5 pb-5 max-h-[70vh] overflow-y-auto">
                <form
                  className="grid grid-cols-1 gap-4"
                  onSubmit={(e) => handleHeroSubmit(e, "hero_mobile")}
                >
                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Nama
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <Input
                        type="text"
                        value={appointment.fullName}
                        onChange={(e) =>
                          setAppointment({ ...appointment, fullName: e.target.value })
                        }
                        placeholder="Nama lengkap"
                        className="h-11 text-sm font-body pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Nomor HP
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <Input
                        type="tel"
                        value={appointment.phone}
                        onChange={(e) => setAppointment({ ...appointment, phone: e.target.value })}
                        placeholder="Nomor WhatsApp"
                        className="h-11 text-sm font-body pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Keluhan
                    </label>
                    <div className="relative">
                      <MessageSquare className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <select
                        value={appointment.complaint}
                        onChange={(e) => setAppointment({ ...appointment, complaint: e.target.value })}
                        className="bg-background border border-border h-11 rounded-xl px-3 py-2 text-sm transition-colors w-full min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 font-body pl-9"
                        required
                      >
                        {complaints.map((c) => (
                          <option key={c.value} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-warm-gray mb-2 font-body">
                      Pilih Tanggal
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-warm-gray" />
                      <Input
                        type="date"
                        min={todayStr}
                        value={appointment.date}
                        onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                        className="h-11 text-sm font-body pl-9"
                        required
                      />
                    </div>
                  </div>


                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-gold/20 font-body"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Book now"}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
          <GuestBookingTermsDialog
            open={termsOpen}
            onOpenChange={setTermsOpen}
            terms={bookingTerms}
            onConfirm={() => void submitHeroBooking(mobileBookingOpen ? "hero_mobile" : "hero_desktop")}
          />
        </div>
      </div>
    </section>
  );
}
