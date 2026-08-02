import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { FileText, Scale, CheckCircle, AlertTriangle, Calendar, CreditCard, UserX, Gavel, MessageCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        {/* Hero Section */}
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gold/10 rounded-2xl mb-6">
                <Scale className="w-8 h-8 text-brand-gold" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Syarat dan
                <span className="text-gradient-gold"> Ketentuan</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                Terakhir diperbarui: 12 April 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                {/* Introduction */}
                <div className="bg-brand-cream rounded-2xl p-6 sm:p-8 mb-8">
                  <p className="text-brand-warm-gray font-body leading-relaxed">
                    Selamat datang di Aesthetic Pondok Indah Dental Clinic ("AEPI Dental", "kami", "klinik"). Dengan mengakses dan menggunakan website serta layanan kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Mohon baca dengan cermat sebelum menggunakan layanan kami.
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                  {/* Section 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Penerimaan Syarat</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Dengan mengakses website dan menggunakan layanan AEPI Dental, Anda menyatakan bahwa:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Anda telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini</li>
                        <li>Anda berusia minimal 18 tahun atau memiliki izin dari wali hukum</li>
                        <li>Informasi yang Anda berikan akurat dan lengkap</li>
                        <li>Anda akan menggunakan layanan hanya untuk tujuan yang sah</li>
                        <li>Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda</li>
                      </ul>
                      <p className="text-brand-warm-gray font-body mt-3">
                        Jika Anda tidak menyetujui syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.
                      </p>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Deskripsi Layanan</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        AEPI Dental menyediakan layanan kesehatan gigi berikut:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Konsultasi dan pemeriksaan gigi oleh dokter profesional</li>
                        <li>Perawatan gigi estetika (veneer, whitening, dll)</li>
                        <li>Perawatan ortodonti (Invisalign, behel)</li>
                        <li>Implan gigi dan bedah mulut</li>
                        <li>Perawatan gigi anak (pediatric dentistry)</li>
                        <li>Emergency dental services</li>
                        <li>Reservasi dan penjadwalan online</li>
                        <li>Edukasi kesehatan gigi melalui blog dan konten digital</li>
                      </ul>
                      <p className="text-brand-warm-gray font-body mt-3">
                        Semua layanan dilaksanakan oleh tenaga medis yang berlisensi dan berpengalaman sesuai standar profesional Indonesia.
                      </p>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Reservasi dan Janji Temu</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Ketentuan untuk booking dan janji temu:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Reservasi dapat dilakukan melalui website, WhatsApp, atau telepon</li>
                        <li>Konfirmasi janji temu akan dikirim melalui WhatsApp atau email</li>
                        <li>Harap tiba 15 menit sebelum jadwal yang ditentukan</li>
                        <li>Reschedule dapat dilakukan minimal 24 jam sebelum jadwal</li>
                        <li>Pembatalan tanpa pemberitahuan dapat dikenakan biaya administrasi</li>
                        <li>Keterlambatan lebih dari 15 menit dapat mengakibatkan reschedule otomatis</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Pembayaran dan Biaya</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Ketentuan mengenai pembayaran:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Harga yang tercantum dapat berubah tanpa pemberitahuan sebelumnya</li>
                        <li>Metode pembayaran: Tunai, Transfer Bank, Kartu Kredit/Debit, E-wallet, QRIS</li>
                        <li>DP (Uang Muka) mungkin diperlukan untuk perawatan tertentu</li>
                        <li>Klaim asuransi kesehatan tergantung pada ketentuan polis masing-masing</li>
                        <li>Biaya konsultasi dapat dikreditkan ke biaya perawatan jika dilanjutkan</li>
                        <li>Refund untuk pembayaran yang sudah dilakukan mengikuti kebijakan klinik</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Kewajiban Pasien</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Sebagai pasien, Anda wajib:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Memberikan informasi medis yang lengkap dan jujur</li>
                        <li>Menginformasikan alergi, kondisi kesehatan, dan obat yang sedang dikonsumsi</li>
                        <li>Mengikuti instruksi dokter dan staf medis</li>
                        <li>Mematuhi protokol kesehatan dan keamanan di klinik</li>
                        <li>Tidak merekam foto/video selama prosedur medis tanpa izin</li>
                        <li>Menjaga ketertiban dan menghormati pasien lain</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 6 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Batasan Tanggung Jawab</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        AEPI Dental tidak bertanggung jawab atas:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Hasil perawatan yang tidak sesuai ekspektasi jika telah dijelaskan risikonya</li>
                        <li>Komplikasi akibat penyakit sistemik yang tidak diungkapkan pasien</li>
                        <li>Kerugian akibat penggunaan website yang tidak sesuai ketentuan</li>
                        <li>Force majeure (bencana alam, kecelakaan, peristiwa di luar kendali)</li>
                        <li>Penyalahgunaan informasi atau resep obat oleh pihak ketiga</li>
                      </ul>
                      <p className="text-brand-warm-gray font-body mt-3">
                        Tanggung jawab maksimal kami terbatas pada nilai pembayaran untuk layanan yang bersangkutan.
                      </p>
                    </div>
                  </div>

                  {/* Section 7 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <UserX className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Penghentian Layanan</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Kami berhak menangguhkan atau menghentikan layanan untuk pasien yang:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Memberikan informasi palsu atau menipu staf medis</li>
                        <li>Bersikap kasar, mengancam, atau melecehkan staf/pasien lain</li>
                        <li>Tidak membayar tagihan setelah peringatan tertulis</li>
                        <li>Melanggar kebijakan klinik secara berulang</li>
                        <li>Menyalahgunakan layanan emergency untuk tujuan non-medis</li>
                      </ul>
                      <p className="text-brand-warm-gray font-body mt-3">
                        Keputusan penghentian dapat diappeal dengan mengajukan permohonan tertulis kepada manajemen klinik.
                      </p>
                    </div>
                  </div>

                  {/* Section 8 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Hak Kekayaan Intelektual</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Semua konten di website AEPI Dental dilindungi hak cipta:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Logo, merek dagang, dan branding adalah milik AEPI Dental</li>
                        <li>Artikel, foto, dan video tidak boleh disalin tanpa izin</li>
                        <li>Desain website dan elemen grafis dilindungi undang-undang</li>
                        <li>Pelanggaran hak kekayaan intelektual akan ditindaklanjuti secara hukum</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 9 - Changes */}
                  <div className="bg-brand-cream rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-brand-charcoal mb-3">Perubahan Syarat dan Ketentuan</h2>
                    <p className="text-brand-warm-gray font-body">
                      AEPI Dental berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan diumumkan di website dengan tanggal revisi terbaru. Penggunaan berkelanjutan atas layanan kami setelah perubahan berarti Anda menerima syarat yang diperbarui.
                    </p>
                  </div>

                  {/* Contact Section */}
                  <div className="bg-gradient-gold rounded-2xl p-6 sm:p-8 text-white mt-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                      <MessageCircle className="w-6 h-6" />
                      Hubungi Kami
                    </h2>
                    <p className="text-white/90 font-body mb-4">
                      Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:
                    </p>
                    <div className="space-y-2 text-white/90 font-body">
                      <p><strong>Aesthetic Pondok Indah Dental Clinic</strong></p>
                      <p>Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama</p>
                      <p>Kota Jakarta Selatan, DKI Jakarta 12310</p>
                      <p>Email: info@aestheticpondokindah.com</p>
                      <p>Telepon: 021-7695948</p>
                      <p>WhatsApp: +62 819-9011-4949</p>
                    </div>
                    <p className="text-white/80 font-body text-sm mt-6 pt-6 border-t border-white/20">
                      Dengan menggunakan layanan AEPI Dental, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan di atas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
