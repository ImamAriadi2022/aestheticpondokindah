import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { submitPublicReservation } from "@/react-app/lib/reservationApi";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import { createBookingRequestDemo, getDemoBranches } from "@/react-app/lib/bookingDemo";

export default function BookingNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const branches = useMemo(() => getDemoBranches(), []);

  const preselectedBranchId = searchParams.get("branch");
  const preselectedDoctor = searchParams.get("doctor");
  const preselectedDate = searchParams.get("date");
  const preselectedSlot = searchParams.get("slot");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    branchId: preselectedBranchId ?? branches[0]?.id ?? "",
    preferredDate: preselectedDate ?? today,
    patientName: "",
    phone: "",
    note: preselectedDoctor
      ? `Jadwal Dokter: ${preselectedDoctor}${preselectedSlot ? ` (${preselectedSlot})` : ""}`
      : "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.branchId) return "Cabang wajib dipilih.";
    if (!form.preferredDate) return "Tanggal wajib diisi.";
    if (form.preferredDate < today) return "Tanggal reservasi tidak boleh di masa lalu.";
    if (!form.patientName || form.patientName.trim().length < 2) return "Nama pasien minimal 2 karakter.";
    if (!form.phone || !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) return "Format nomor WhatsApp/Telepon tidak valid.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit to Laravel Backend Database
      const apiRes = await submitPublicReservation({
        name: form.patientName.trim(),
        phone: form.phone.trim(),
        complaint: form.note || "Booking Baru",
        date: form.preferredDate,
        source: "booking_new_page",
      });

      // 2. Persist in Guest Local Session for Status View
      const demoRes = createBookingRequestDemo({
        branchId: form.branchId,
        preferredDate: form.preferredDate,
        preferredStartTime: preselectedSlot ? preselectedSlot.split("-")[0] : "09:00",
        preferredEndTime: preselectedSlot ? preselectedSlot.split("-")[1] : "11:00",
        patientName: form.patientName.trim(),
        phone: form.phone.trim(),
        note: form.note,
      });

      const highlightId = demoRes.ok ? demoRes.request.id : apiRes?.id || "";
      navigate(`/booking/status?highlight=${encodeURIComponent(highlightId)}`);
    } catch (e) {
      setError("Gagal mengirim permintaan reservasi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-brand-charcoal">Buat Booking</CardTitle>
                  <p className="text-sm text-brand-warm-gray font-body mt-1">
                    Pilih cabang, tentukan tanggal. Tim kami akan mengirim jadwal final untuk Anda setujui.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cabang</Label>
                        <Select
                          value={form.branchId}
                          onValueChange={(value) => setForm((p) => ({ ...p, branchId: value }))}
                          required
                        >
                          <SelectTrigger className="h-12 rounded-xl font-body">
                            <SelectValue placeholder="Pilih cabang" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredDate">Tanggal</Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          min={today}
                          className="h-12 rounded-xl font-body"
                          value={form.preferredDate}
                          onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="patientName">Nama</Label>
                        <Input
                          id="patientName"
                          className="h-12 rounded-xl font-body"
                          value={form.patientName}
                          onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp / Telepon</Label>
                        <Input
                          id="phone"
                          className="h-12 rounded-xl font-body"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note">Catatan (opsional)</Label>
                      <Input
                        id="note"
                        className="h-12 rounded-xl font-body"
                        value={form.note}
                        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                        placeholder="Contoh: sakit gigi kanan atas, sudah 2 hari"
                      />
                    </div>

                    {error && (
                      <div className="text-xs text-red-600 font-body" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-body"
                        onClick={() => navigate("/booking/status")}
                      >
                        Lihat Status Booking
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body"
                        disabled={submitting}
                      >
                        {submitting ? "Mengirim..." : "Kirim Permintaan"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
