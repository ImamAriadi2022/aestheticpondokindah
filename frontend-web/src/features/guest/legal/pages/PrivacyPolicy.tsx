import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Shield, Lock, FileText, User, Eye, Cookie, Server, Phone, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                <Shield className="w-8 h-8 text-brand-gold" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Kebijakan
                <span className="text-gradient-gold"> Privasi</span>
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
                    Aesthetic Pondok Indah Dental Clinic ("kami", "klinik", "AEPI Dental") berkomitmen untuk melindungi privasi dan keamanan informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat Anda menggunakan website dan layanan kami.
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                  {/* Section 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Informasi yang Kami Kumpulkan</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Kami mengumpulkan informasi berikut untuk menyediakan layanan dental yang optimal:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li><strong>Informasi Pribadi:</strong> Nama lengkap, tanggal lahir, alamat, nomor telepon, email, dan nomor identitas (KTP/Paspor/KK)</li>
                        <li><strong>Informasi Kesehatan:</strong> Riwayat medis, alergi, kondisi gigi, hasil pemeriksaan, foto rontgen, dan resep obat</li>
                        <li><strong>Informasi Pembayaran:</strong> Detail transaksi, metode pembayaran, dan riwayat kunjungan</li>
                        <li><strong>Informasi Teknis:</strong> Alamat IP, jenis browser, perangkat, dan data navigasi website</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Penggunaan Informasi</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Informasi Anda digunakan untuk tujuan berikut:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Memberikan layanan perawatan gigi dan konsultasi</li>
                        <li>Mengelola janji temu dan penjadwalan kunjungan</li>
                        <li>Menyusun dan memelihara rekam medis pasien</li>
                        <li>Mengirimkan pengingat janji temu dan informasi kesehatan gigi</li>
                        <li>Memproses pembayaran dan klaim asuransi</li>
                        <li>Meningkatkan kualitas layanan dan pengalaman pengguna</li>
                        <li>Memenuhi kewajiban hukum dan regulasi kesehatan</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Perlindungan Data</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Kami menerapkan langkah-langkah keamanan ketat untuk melindungi informasi Anda:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Enkripsi data sensitif saat penyimpanan dan transmisi</li>
                        <li>Sistem otentikasi multi-faktor untuk akses akun</li>
                        <li>Audit keamanan berkala dan pemantauan sistem</li>
                        <li>Pembatasan akses data hanya untuk staf yang berwenang</li>
                        <li>Backup data terenkripsi di server yang aman</li>
                        <li>Kebijakan keamanan fisik untuk catatan kertas</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Cookie className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Cookie dan Teknologi Pelacakan</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Website kami menggunakan cookie untuk:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Mengingat preferensi login dan pengaturan Anda</li>
                        <li>Menyimpan item di keranjang pemesanan</li>
                        <li>Menganalisis penggunaan website untuk perbaikan</li>
                        <li>Menampilkan konten yang relevan dengan lokasi Anda</li>
                      </ul>
                      <p className="text-brand-warm-gray font-body mt-3">
                        Anda dapat mengelola preferensi cookie melalui pengaturan browser Anda. Menonaktifkan cookie mungkin memengaruhi fungsionalitas website.
                      </p>
                    </div>
                  </div>

                  {/* Section 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Server className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Penyimpanan dan Retensi Data</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Informasi Anda disimpan di server yang terletak di Indonesia dengan standar keamanan industri. Kami menyimpan data pribadi:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li><strong>Rekam medis:</strong> Minimum 5 tahun set kunjungan terakhir (sesuai regulasi Kemenkes)</li>
                        <li><strong>Data akun:</strong> Selama akun aktif atau hingga permintaan penghapusan</li>
                        <li><strong>Data transaksi:</strong> Minimum 10 tahun untuk keperluan perpajakan</li>
                        <li><strong>Data log:</strong> 2 tahun untuk keamanan sistem</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 6 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Hak Anda</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Anda memiliki hak untuk:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li>Mengakses dan memperoleh salinan data pribadi Anda</li>
                        <li>Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                        <li>Meminta penghapusan data (dengan ketentuan hukum yang berlaku)</li>
                        <li>Membatasi atau menolak penggunaan data tertentu</li>
                        <li>Mengajukan keberatan terhadap pemrosesan data</li>
                        <li>Menerima data dalam format yang dapat dibaca mesin (portabilitas data)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 7 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold-light rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-charcoal mb-3">Pembagian Informasi dengan Pihak Ketiga</h2>
                      <p className="text-brand-warm-gray font-body mb-3">
                        Kami tidak menjual informasi pribadi Anda. Kami hanya membagikan data dengan:
                      </p>
                      <ul className="space-y-2 text-brand-warm-gray font-body list-decimal list-inside">
                        <li><strong>Penyedia layanan:</strong> Perusahaan IT, pembayaran, dan asuransi yang terikat kerahasiaan</li>
                        <li><strong>Profesional kesehatan:</strong> Dokter spesialis lain dengan persetujuan Anda</li>
                        <li><strong>Otoritas hukum:</strong> Ketika diwajibkan oleh hukum atau perintah pengadilan</li>
                        <li><strong>Laboratorium:</strong> Untuk analisis dan pembuatan prostesis gigi</li>
                      </ul>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="bg-gradient-gold rounded-2xl p-6 sm:p-8 text-white mt-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                      <Mail className="w-6 h-6" />
                      Hubungi Kami
                    </h2>
                    <p className="text-white/90 font-body mb-4">
                      Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini, silakan hubungi kami:
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
                      Dengan menggunakan layanan kami, Anda menyetujui Kebijakan Privasi ini. Kami dapat memperbarui kebijakan ini sewaktu-waktu, dan perubahan akan diberitahukan melalui website atau email.
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
