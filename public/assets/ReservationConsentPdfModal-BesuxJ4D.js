import{c as oa,r as i,j as a,X as Z}from"./index-PVO3pY4G.js";import{r as aa}from"./index-DIYzJ-Xe.js";import{B as P}from"./button-BDJ9looh.js";import{g as ea}from"./clinicSettingsApi-BKjtXptD.js";import{F as ta}from"./file-text-4hbxFoYQ.js";import{P as na}from"./printer-rj82CcAU.js";import{C as G}from"./check-CNoFpfu4.js";const ca=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],ba=oa("rotate-ccw",ca);function ya({isOpen:p,onClose:u,onAccept:S,initialName:d="",initialEmail:h="",initialPhone:A="",initialSignature:sa,isAgreed:f=!1,showAcceptButton:I=!0,readOnly:H}){const W=H||!S||!I,[r,j]=i.useState(null),[U,T]=i.useState(null),[g,D]=i.useState(d),[J,z]=i.useState(f),[_,v]=i.useState(null);i.useEffect(()=>{d&&D(d),z(f)},[d,f]),i.useEffect(()=>{p&&(v(null),ea().then(s=>{s.pdf_terms_and_conditions&&T(s.pdf_terms_and_conditions),s.booking_terms&&s.booking_terms.trim().length>0&&j(s.booking_terms)}).catch(()=>{}))},[p]);const w=()=>{if(!J){v("Harap centang kotak persetujuan Syarat dan Ketentuan.");return}if(!g.trim()){v("Harap lengkapi nama Anda.");return}S&&S(g.trim()),u()},R=()=>{const s=document.createElement("iframe");s.style.position="fixed",s.style.right="0",s.style.bottom="0",s.style.width="0",s.style.height="0",s.style.border="0",document.body.appendChild(s);const k=s.contentWindow?.document;if(!k){window.print();return}const X=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Syarat dan Ketentuan - Aesthetic Pondok Indah</title>
          <style>
            @page {
              size: letter portrait;
              margin: 15mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
              color: #111;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              font-size: 9.5pt;
              background: #fff;
            }
            .kop-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 14px;
              padding-bottom: 10px;
              margin-bottom: 14px;
              border-bottom: 3px double #000;
              text-align: center;
            }
            .kop-logo {
              width: 50px;
              height: 50px;
              object-fit: contain;
            .kop-header {
              text-align: center;
              border-bottom: 2.5px solid #000;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .kop-logo {
              height: 48px;
              width: auto;
              margin: 0 auto 6px auto;
              display: block;
            }
            .kop-title {
              font-size: 13pt;
              font-weight: 800;
              color: #000;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin: 0;
            }
            .kop-address {
              font-size: 7.5pt;
              color: #333;
              margin-top: 4px;
              line-height: 1.35;
            }
            .doc-header {
              text-align: center;
              margin-bottom: 16px;
            }
            .doc-title {
              font-size: 13pt;
              font-weight: 800;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .doc-sub {
              font-size: 8.5pt;
              color: #555;
              margin-top: 4px;
            }
            .clause {
              margin-bottom: 12px;
            }
            .clause-title {
              font-size: 9.5pt;
              font-weight: 700;
              color: #000;
              margin-bottom: 3px;
            }
            .clause-text {
              font-size: 9pt;
              color: #222;
              line-height: 1.45;
              text-align: justify;
              margin: 0;
            }
            .clause-list {
              margin: 4px 0 0 0;
              padding-left: 18px;
              font-size: 9pt;
              color: #222;
            }
            .clause-list li {
              margin-bottom: 2px;
            }
            .signature-section {
              margin-top: 24px;
              padding-top: 14px;
              border-top: 1px solid #ccc;
            }
            .sig-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .sig-name {
              font-weight: 700;
              text-decoration: underline;
              margin-top: 6px;
              font-size: 9pt;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            <img src="/logo/logo-vertikal.webp" class="kop-logo" alt="Logo" />
            <div class="kop-title">Aesthetic Pondok Indah</div>
            <div class="kop-address">
              Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310<br/>
              Telepon: 021-7695948 | WhatsApp: 0812-3456-7890 | Email: aesthetic.pondokindah@gmail.com
            </div>
          </div>

          <div class="doc-header">
            <h1 class="doc-title">Syarat dan Ketentuan</h1>
            <div class="doc-sub">Harap baca dan kirim konfirmasi persetujuan Anda di bawah...</div>
          </div>

          <div class="clause">
            <div class="clause-title">1. Penerimaan Persyaratan</div>
            <p class="clause-text">Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh mengakses atau menggunakan layanan kami.</p>
          </div>

          <div class="clause">
            <div class="clause-title">2. Deskripsi Layanan</div>
            <p class="clause-text">Layanan kami meliputi pemeriksaan klinis, konsultasi medis, dan tindakan perawatan gigi estetik maupun spesialis. Kami berhak mengubah, menangguhkan, atau menghentikan setiap aspek layanan kami kapan saja, dengan atau tanpa pemberitahuan.</p>
          </div>

          <div class="clause">
            <div class="clause-title">3. Akun Pengguna</div>
            <p class="clause-text">Anda mungkin diminta membuat akun atau melengkapi data identitas untuk mengakses fitur layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan data serta membatasi akses ke akun Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di akun Anda.</p>
          </div>

          <div class="clause">
            <div class="clause-title">4. Perilaku Pengguna</div>
            <p class="clause-text">Anda setuju untuk tidak menggunakan layanan kami untuk tujuan yang melanggar hukum atau dengan cara apa pun yang melanggar Persyaratan dan Ketentuan ini. Anda juga setuju untuk tidak:</p>
            <ul class="clause-list">
              <li>Mengganggu, menyalahgunakan, atau menyakiti pengguna atau staf medis lain</li>
              <li>Melanggar hak pihak ketiga</li>
              <li>Mengganggu atau mengacaukan pengoperasian sistem dan layanan klinik</li>
              <li>Menggunakan layanan kami untuk tujuan komersial tanpa persetujuan tertulis kami sebelumnya</li>
            </ul>
          </div>

          <div class="clause">
            <div class="clause-title">5. Hak Kekayaan Intelektual</div>
            <p class="clause-text">Semua konten dan materi yang tersedia di layanan kami, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, rekam medis digital, dan perangkat lunak, adalah milik Aesthetic Pondok Indah atau pemberi lisensinya dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya.</p>
          </div>

          <div class="clause">
            <div class="clause-title">6. Batasan Tanggung Jawab</div>
            <p class="clause-text">Sejauh diizinkan oleh hukum, Aesthetic Pondok Indah tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami.</p>
          </div>

          <div class="clause">
            <div class="clause-title">7. Ganti Rugi</div>
            <p class="clause-text">Anda setuju untuk mengganti kerugian dan membebaskan Aesthetic Pondok Indah, afiliasinya, pejabatnya, direkturnya, karyawannya, dan agennya dari dan terhadap segala tuntutan, kewajiban, kerusakan, kerugian, atau biaya yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami.</p>
          </div>

          <div class="clause">
            <div class="clause-title">8. Hukum yang Mengatur</div>
            <p class="clause-text">Syarat dan Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan ketentuan konflik hukumnya.</p>
          </div>

          <div class="clause">
            <div class="clause-title">9. Perubahan Syarat dan Ketentuan</div>
            <p class="clause-text">Kami berhak memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan layanan kami secara terus-menerus setelah perubahan tersebut merupakan bentuk penerimaan Anda terhadap Syarat dan Ketentuan yang baru.</p>
          </div>

          <div class="signature-section">
            <div class="sig-row">
              <div style="font-size: 8.5pt; color: #444;">
                Status: <strong>✓ Disetujui Secara Digital (Ceklis Persetujuan Pasien)</strong><br/>
                Waktu: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB
              </div>
              <div style="text-align: right;">
                <div style="font-size: 8pt; color: #555;">Disetujui oleh:</div>
                <div class="sig-name">${g||"Pasien"}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;k.open(),k.write(X),k.close();const M=Array.from(k.querySelectorAll("img"));let C=!1;const x=()=>{C||(C=!0,setTimeout(()=>{try{s.contentWindow?.focus(),s.contentWindow?.print()}catch{window.print()}setTimeout(()=>{document.body.contains(s)&&document.body.removeChild(s)},3e3)},200))};if(M.length===0)x();else{let l=0;const b=()=>{l++,l>=M.length&&x()};M.forEach(y=>{y.complete&&y.naturalHeight!==0?b():(y.onload=b,y.onerror=b)}),setTimeout(()=>{x()},1200)}};return p?aa.createPortal(a.jsx("div",{className:"fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",onClick:s=>{s.target===s.currentTarget&&u()},children:a.jsxs("div",{className:"relative w-full max-w-3xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left overflow-hidden animate-in zoom-in-95 duration-200 my-auto",onClick:s=>s.stopPropagation(),children:[a.jsxs("div",{className:"flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0",children:[a.jsxs("div",{className:"flex items-center gap-2.5",children:[a.jsx("div",{className:"w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200",children:a.jsx(ta,{className:"w-4 h-4"})}),a.jsxs("div",{children:[a.jsx("h3",{className:"text-base sm:text-lg font-bold text-black leading-tight",children:"Syarat dan Ketentuan"}),a.jsx("p",{className:"text-[11px] text-gray-500",children:"Dokumen Resmi Syarat dan Ketentuan Layanan Pasien"})]})]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx(P,{type:"button",variant:"outline",size:"icon",onClick:R,className:"h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100 shadow-xs cursor-pointer",title:"Cetak / Simpan Dokumen",children:a.jsx(na,{className:"w-4 h-4"})}),a.jsx("button",{type:"button",onClick:u,className:"w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-xs cursor-pointer",title:"Tutup",children:a.jsx(Z,{className:"w-4 h-4"})})]})]}),a.jsx("div",{className:"flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5] overscroll-contain",children:a.jsxs("div",{className:"max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans",children:[a.jsxs("div",{className:"border-b-2 border-black pb-3.5 text-center space-y-1",style:{borderBottom:"3px double #000"},children:[a.jsx("img",{src:"/logo/logo-vertikal.webp",alt:"Aesthetic Pondok Indah",className:"h-14 sm:h-16 w-auto object-contain mx-auto mb-1",onError:s=>{s.currentTarget.src="/logo/Logo-vertikal.png"}}),a.jsx("h1",{className:"text-base sm:text-lg font-bold text-black tracking-wider uppercase leading-tight",children:"Aesthetic Pondok Indah"}),a.jsxs("p",{className:"text-[10px] text-gray-700 leading-snug pt-0.5",children:["Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310",a.jsx("br",{}),"Telepon: 021-7695948 | WhatsApp: 0812-3456-7890 | Email: aesthetic.pondokindah@gmail.com"]})]}),a.jsxs("div",{className:"text-center space-y-0.5 pt-1",children:[a.jsx("h2",{className:"text-xl sm:text-2xl font-bold text-black tracking-tight",children:"Syarat dan Ketentuan"}),a.jsx("p",{className:"text-xs text-gray-600",children:"Harap baca dan berikan tanda centang persetujuan Anda di bawah ini"})]}),a.jsxs("div",{className:"space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left",children:[a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"1. Penerimaan Persyaratan"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh mengakses atau menggunakan layanan kami."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"2. Deskripsi Layanan"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Layanan kami meliputi pemeriksaan klinis, konsultasi medis, dan tindakan perawatan gigi estetik maupun spesialis. Kami berhak mengubah, menangguhkan, atau menghentikan setiap aspek layanan kami kapan saja, dengan atau tanpa pemberitahuan."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"3. Akun Pengguna"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda mungkin diminta membuat akun atau melengkapi data identitas untuk mengakses fitur layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan data serta membatasi akses ke akun Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di akun Anda."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"4. Perilaku Pengguna"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda setuju untuk tidak menggunakan layanan kami untuk tujuan yang melanggar hukum atau dengan cara apa pun yang melanggar Persyaratan dan Ketentuan ini. Anda juga setuju untuk tidak:"}),a.jsxs("ul",{className:"list-disc pl-5 space-y-0.5 text-xs sm:text-[13px] text-gray-800 pt-0.5",children:[a.jsx("li",{children:"Mengganggu, menyalahgunakan, atau menyakiti pengguna atau staf medis lain"}),a.jsx("li",{children:"Melanggar hak pihak ketiga"}),a.jsx("li",{children:"Mengganggu atau mengacaukan pengoperasian sistem dan layanan klinik"}),a.jsx("li",{children:"Menggunakan layanan kami untuk tujuan komersial tanpa persetujuan tertulis kami sebelumnya"})]})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"5. Hak Kekayaan Intelektual"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Semua konten dan materi yang tersedia di layanan kami, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, rekam medis digital, dan perangkat lunak, adalah milik Aesthetic Pondok Indah atau pemberi lisensinya dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"6. Batasan Tanggung Jawab"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Sejauh diizinkan oleh hukum, Aesthetic Pondok Indah tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"7. Ganti Rugi"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda setuju untuk mengganti kerugian dan membebaskan Aesthetic Pondok Indah, afiliasinya, pejabatnya, direkturnya, karyawannya, dan agennya dari dan terhadap segala tuntutan, kewajiban, kerusakan, kerugian, atau biaya yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"8. Hukum yang Mengatur"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Syarat dan Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan ketentuan konflik hukumnya."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"9. Perubahan Syarat dan Ketentuan"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Kami berhak memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan layanan kami secara terus-menerus setelah perubahan tersebut merupakan bentuk penerimaan Anda terhadap Syarat dan Ketentuan yang baru."})]})]}),a.jsx("div",{className:"pt-6 border-t-2 border-gray-300 space-y-4",children:W?a.jsxs("div",{className:"space-y-4",children:[a.jsxs("div",{className:"p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between",children:[a.jsxs("div",{children:[a.jsx("span",{className:"text-[10px] font-bold text-gray-500 uppercase tracking-wider block",children:"Status Persetujuan Ketentuan"}),a.jsxs("p",{className:"text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5",children:[a.jsx(G,{className:"w-4 h-4 text-emerald-600 stroke-[3]"}),a.jsx("span",{children:"Syarat & Ketentuan Layanan Telah Disetujui"})]})]}),a.jsx("span",{className:"text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200",children:"✓ Terverifikasi"})]}),a.jsx("div",{className:"pt-2",children:a.jsx(P,{type:"button",onClick:u,className:"w-full h-11 rounded-xl bg-[#2C2416] hover:bg-[#443823] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95",children:a.jsx("span",{children:"Tutup"})})})]}):a.jsxs(a.Fragment,{children:[a.jsxs("label",{className:"flex items-start gap-2.5 cursor-pointer select-none bg-gray-50/80 p-3.5 rounded-xl border border-gray-200",children:[a.jsx("input",{type:"checkbox",checked:J,onChange:s=>{z(s.target.checked),v(null)},className:"mt-0.5 w-4 h-4 rounded border-gray-400 text-black focus:ring-black cursor-pointer"}),a.jsxs("span",{className:"text-xs sm:text-sm text-gray-900 leading-snug",children:["Saya telah membaca, memahami, dan menyetujui seluruh ",a.jsx("strong",{className:"underline",children:"Syarat dan Ketentuan Layanan Pasien"})," klinik Aesthetic Pondok Indah di atas. ",a.jsx("span",{className:"text-red-500",children:"*"})]})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Nama Lengkap Pasien ",a.jsx("span",{className:"text-red-500",children:"*"})]}),a.jsx("input",{type:"text",value:g,onChange:s=>D(s.target.value),placeholder:"Masukkan nama lengkap Anda",className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"})]}),_&&a.jsx("div",{className:"p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium",children:_}),a.jsx("div",{className:"pt-2",children:a.jsxs(P,{type:"button",onClick:w,className:"w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95",children:[a.jsx(G,{className:"w-4 h-4 stroke-[3]"}),a.jsx("span",{children:"Saya Menyetujui Syarat & Ketentuan"})]})})]})})]})})]})}),document.body):null}function fa({isOpen:p,onClose:u,bookingCode:S="API-REG",patientName:d="Pasien",patientPhone:h="",patientEmail:A="",isGuest:sa=!1,serviceName:f="Pemeriksaan & Konsultasi Gigi",doctorName:I="Dokter Spesialis Gigi",dateStr:H="Hari Ini",timeStr:W="10:00",signatureData:r=null,acceptedAt:j,readOnly:U,onSaveSignature:T,onAccept:g}){const D=U||!g&&!T||!!r,[J,z]=i.useState(null),[_,v]=i.useState(null),[w,R]=i.useState(d),[s,k]=i.useState(h||A),[X,M]=i.useState(!1),[C,x]=i.useState(null),l=i.useRef(null),[b,y]=i.useState(!1),[K,E]=i.useState(!!r),[m,Y]=i.useState(r||null);if(i.useEffect(()=>{d&&R(d),(h||A)&&k(h||A),r&&(Y(r),E(!0))},[d,h,A,r]),i.useEffect(()=>{if(p){x(null),ea().then(n=>{n.pdf_informed_consent&&v(n.pdf_informed_consent),n.booking_terms&&n.booking_terms.trim().length>0&&z(n.booking_terms)}).catch(()=>{});const e=setTimeout(()=>{const n=l.current;if(!n)return;const t=n.getContext("2d");if(!t)return;const c=n.getBoundingClientRect(),o=window.devicePixelRatio||1;if(n.width=c.width*o,n.height=c.height*o,t.scale(o,o),t.strokeStyle="#111111",t.lineWidth=2.5,t.lineCap="round",t.lineJoin="round",r){const N=new Image;N.onload=()=>{t.drawImage(N,0,0,c.width,c.height),E(!0)},N.src=r}},120);return()=>clearTimeout(e)}},[p,r]),!p)return null;const ia=j?new Date(j).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}):`${H}, ${W}`,q=e=>{const n=l.current;if(!n)return{x:0,y:0};const t=n.getBoundingClientRect();return"touches"in e&&e.touches.length>0?{x:e.touches[0].clientX-t.left,y:e.touches[0].clientY-t.top}:"clientX"in e?{x:e.clientX-t.left,y:e.clientY-t.top}:{x:0,y:0}},O=e=>{e.preventDefault();const n=l.current;if(!n)return;const t=n.getContext("2d");if(!t)return;t.strokeStyle="#111111",t.lineWidth=2.5,t.lineCap="round",t.lineJoin="round";const{x:c,y:o}=q(e);t.beginPath(),t.moveTo(c,o),y(!0),x(null)},Q=e=>{if(!b)return;e.preventDefault();const n=l.current;if(!n)return;const t=n.getContext("2d");if(!t)return;const{x:c,y:o}=q(e);t.lineTo(c,o),t.stroke(),E(!0)},B=()=>{b&&y(!1)},ra=()=>{const e=l.current;if(!e)return;const n=e.getContext("2d");if(!n)return;const t=e.getBoundingClientRect();n.clearRect(0,0,t.width,t.height),E(!1),Y(null)},la=()=>{if(!w.trim()){x("Harap lengkapi nama pasien / wali sah.");return}if(!K&&!m){x("Harap bubuhkan tanda tangan digital Anda pada area tanda tangan di dalam dokumen.");return}let e;l.current&&K?e=l.current.toDataURL("image/png"):m&&(e=m),T&&e&&T(e),g&&e&&g(e),u()},da=()=>{const e=document.createElement("iframe");e.style.position="fixed",e.style.right="0",e.style.bottom="0",e.style.width="0",e.style.height="0",e.style.border="0",document.body.appendChild(e);const n=e.contentWindow?.document;if(!n){window.print();return}let t="";if(l.current&&K&&typeof l.current.toDataURL=="function")try{t=l.current.toDataURL("image/png")}catch{t=m||r||""}else t=m||r||"";const c=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Surat Persetujuan Pasien (Informed Consent) - Aesthetic Pondok Indah</title>
          <style>
            @page { size: letter portrait; margin: 12mm 14mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #111; line-height: 1.45; margin: 0; padding: 0; font-size: 9pt; background: #fff; }
            .kop-header { text-align: center; border-bottom: 2.5px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
            .kop-logo { height: 48px; width: auto; margin: 0 auto 6px auto; display: block; object-fit: contain; }
            .kop-title { font-size: 13pt; font-weight: 800; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
            .kop-address { font-size: 7.5pt; color: #333; margin-top: 4px; line-height: 1.35; }
            .doc-header { text-align: center; margin-bottom: 14px; }
            .doc-title { font-size: 11.5pt; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
            .doc-sub { font-size: 8.5pt; color: #555; margin-top: 3px; font-weight: 600; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8.5pt; border: 1px solid #333; }
            .meta-table td { padding: 4.5px 8px; border: 1px solid #333; }
            .clause { margin-bottom: 9px; }
            .clause-title { font-size: 9pt; font-weight: 700; color: #000; margin-bottom: 2px; }
            .clause-text { font-size: 8.5pt; color: #222; line-height: 1.4; text-align: justify; margin: 0; }
            .signature-section { margin-top: 18px; padding-top: 12px; border-top: 1px solid #ccc; }
            .sig-row { display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-box { text-align: center; width: 220px; }
            .sig-img { max-height: 65px; max-width: 180px; width: auto; height: auto; object-fit: contain; margin: 4px auto; display: block; background: transparent; }
            .sig-name { font-weight: 700; text-decoration: underline; margin-top: 4px; font-size: 9pt; color: #000; }
          </style>
        </head>
        <body>
          <div class="kop-header">
            <img src="/logo/logo-vertikal.webp" class="kop-logo" alt="Logo Aesthetic Pondok Indah" onerror="this.src='/logo/Logo-vertikal.png'" />
            <div class="kop-title">Aesthetic Pondok Indah</div>
            <div class="kop-address">
              Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310<br/>
              Telepon: 021-7695948 | WhatsApp: 0812-3456-7890 | Email: aesthetic.pondokindah@gmail.com
            </div>
          </div>
          <div class="doc-header">
            <h1 class="doc-title">Surat Pernyataan & Persetujuan Pasien (Informed Consent)</h1>
            <div class="doc-sub">No. Registrasi: API-CONSENT-${S}</div>
          </div>
          <table class="meta-table">
            <tr>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Nama Pasien</td>
              <td style="width: 30%; font-weight: 600;">${d}</td>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Layanan</td>
              <td style="width: 30%; font-weight: 600;">${f}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #f8f8f8;">No. WhatsApp</td>
              <td>${h||"-"}</td>
              <td style="font-weight: bold; background: #f8f8f8;">Dokter</td>
              <td>${I}</td>
            </tr>
          </table>
          <div class="clause">
            <div class="clause-title">1. Persetujuan Pemeriksaan & Tindakan Medis Gigi</div>
            <p class="clause-text">Saya memberikan persetujuan penuh kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan fisik rongga mulut, diagnostik klinis, serta tindakan perawatan gigi sesuai prosedur medis.</p>
          </div>
          <div class="clause">
            <div class="clause-title">2. Keterbukaan Riwayat Kesehatan & Anamnesis</div>
            <p class="clause-text">Saya menyatakan telah memberikan informasi riwayat kesehatan, penyakit bawaan, alergi obat, atau kondisi kesehatan yang sebenarnya.</p>
          </div>
          <div class="clause">
            <div class="clause-title">3. Kerahasiaan Data & Rekam Medis Elektronik</div>
            <p class="clause-text">Seluruh data rekam medis, dokumentasi intraoral, dan hasil rontgen dilindungi kerahasiaannya sesuai peraturan perundang-undangan kesehatan RI.</p>
          </div>
          <div class="clause">
            <div class="clause-title">4. Kebijakan Pembayaran & Pembatalan</div>
            <p class="clause-text">Saya bersedia menyelesaikan kewajiban pembayaran tindakan sesuai tarif resmi yang disetujui sebelum tindakan dilakukan.</p>
          </div>
          <div class="signature-section">
            <div class="sig-row">
              <div style="font-size: 8.5pt; color: #444; line-height: 1.45;">
                Status: <strong style="color: #047857;">✓ Disetujui Secara Digital</strong><br/>
                Waktu: ${ia}
              </div>
              <div class="sig-box">
                <div style="font-size: 8pt; font-weight: bold; color: #222;">Tanda Tangan Pasien:</div>
                ${t?`<img src="${t}" class="sig-img" alt="Tanda Tangan Pasien" />`:'<div style="height: 45px; border-bottom: 1px dashed #bbb; width: 140px; margin: 6px auto;"></div>'}
                <div class="sig-name">${w||d}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;n.open(),n.write(c),n.close();const o=Array.from(n.querySelectorAll("img"));let N=!1;const F=()=>{N||(N=!0,setTimeout(()=>{try{e.contentWindow?.focus(),e.contentWindow?.print()}catch{window.print()}setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},3e3)},200))};if(o.length===0)F();else{let V=0;const $=()=>{V++,V>=o.length&&F()};o.forEach(L=>{L.complete&&L.naturalHeight!==0?$():(L.onload=$,L.onerror=$)}),setTimeout(()=>{F()},1200)}};return aa.createPortal(a.jsx("div",{className:"fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",onClick:e=>{e.target===e.currentTarget&&u()},children:a.jsxs("div",{className:"relative w-full max-w-3xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left overflow-hidden animate-in zoom-in-95 duration-200 my-auto",onClick:e=>e.stopPropagation(),children:[a.jsxs("div",{className:"flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0",children:[a.jsxs("div",{className:"flex items-center gap-2.5",children:[a.jsx("div",{className:"w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200",children:a.jsx(ta,{className:"w-4 h-4"})}),a.jsxs("div",{children:[a.jsx("h3",{className:"text-base sm:text-lg font-bold text-black leading-tight",children:"Surat Persetujuan Pasien (Informed Consent)"}),a.jsx("p",{className:"text-[11px] text-gray-500",children:"Persetujuan Tindakan Medis & Anamnesis Pasien"})]})]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx(P,{type:"button",variant:"outline",size:"icon",onClick:da,className:"h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100 shadow-xs cursor-pointer",title:"Cetak Dokumen",children:a.jsx(na,{className:"w-4 h-4"})}),a.jsx("button",{type:"button",onClick:u,className:"w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-xs cursor-pointer",title:"Tutup",children:a.jsx(Z,{className:"w-4 h-4"})})]})]}),a.jsx("div",{className:"flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5] overscroll-contain",children:a.jsxs("div",{className:"max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans",children:[a.jsxs("div",{className:"border-b-2 border-black pb-3.5 text-center space-y-1",style:{borderBottom:"3px double #000"},children:[a.jsx("img",{src:"/logo/logo-vertikal.webp",alt:"Aesthetic Pondok Indah",className:"h-14 sm:h-16 w-auto object-contain mx-auto mb-1",onError:e=>{e.currentTarget.src="/logo/Logo-vertikal.png"}}),a.jsx("h1",{className:"text-base sm:text-lg font-bold text-black tracking-wider uppercase leading-tight",children:"Aesthetic Pondok Indah"}),a.jsxs("p",{className:"text-[10px] text-gray-700 leading-snug pt-0.5",children:["Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310",a.jsx("br",{}),"Telepon: 021-7695948 | WhatsApp: 0812-3456-7890 | Email: aesthetic.pondokindah@gmail.com"]})]}),a.jsx("div",{className:"text-center space-y-0.5 pt-1",children:a.jsx("h2",{className:"text-lg font-bold text-black uppercase",children:"Surat Pernyataan & Persetujuan Pasien (Informed Consent)"})}),a.jsx("div",{className:"border border-gray-300 rounded-lg overflow-hidden text-xs",children:a.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-300",children:[a.jsxs("div",{className:"p-3 space-y-1 bg-gray-50/50",children:[a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"Nama:"})," ",d]}),a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"No. WA:"})," ",h||"-"]})]}),a.jsxs("div",{className:"p-3 space-y-1 bg-gray-50/50",children:[a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"Layanan:"})," ",f]}),a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"Dokter:"})," ",I]})]})]})}),a.jsx("div",{className:"space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left",children:[{title:"1. Persetujuan Pemeriksaan & Tindakan Medis Gigi",text:"Saya memberikan persetujuan penuh kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan fisik rongga mulut, diagnostik klinis, serta tindakan perawatan gigi sesuai prosedur medis yang disepakati."},{title:"2. Keterbukaan Riwayat Kesehatan & Anamnesis",text:"Saya menyatakan telah memberikan informasi riwayat kesehatan, penyakit bawaan, alergi obat, atau kondisi kesehatan yang sebenarnya."},{title:"3. Ketentuan Penjadwalan & Waktu Kedatangan",text:"Saya memahami kewajiban hadir di klinik minimal 15 (lima belas) menit sebelum waktu reservasi. Keterlambatan lebih dari 15 menit dapat mengakibatkan penyesuaian durasi atau penjadwalan ulang."},{title:"4. Kerahasiaan Data & Rekam Medis Elektronik",text:"Seluruh data rekam medis dan hasil rontgen dilindungi kerahasiaannya sesuai peraturan perundang-undangan kesehatan RI."},{title:"5. Kebijakan Pembayaran & Pembatalan",text:"Saya bersedia menyelesaikan kewajiban pembayaran tindakan sesuai tarif resmi yang disetujui sebelum tindakan dilakukan."}].map((e,n)=>a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:e.title}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:e.text})]},n))}),a.jsx("div",{className:"pt-6 border-t-2 border-gray-300 space-y-4",children:D?a.jsxs("div",{className:"space-y-4",children:[a.jsxs("div",{className:"p-3 bg-gray-50 rounded-xl border border-gray-200",children:[a.jsx("span",{className:"text-[10px] font-bold text-gray-500 uppercase tracking-wider block",children:"Nama Pasien / Penandatangan Sah"}),a.jsx("p",{className:"text-sm font-bold text-black mt-0.5",children:w||d})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsxs("div",{className:"flex items-center justify-between",children:[a.jsx("span",{className:"text-xs font-bold text-gray-800",children:"Tanda Tangan Digital Pasien (Terverifikasi)"}),a.jsx("span",{className:"text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200",children:"✓ Sah & Tersimpan"})]}),a.jsx("div",{className:"border border-gray-300 rounded-xl bg-white p-3 flex items-center justify-center min-h-[90px] shadow-2xs",children:m||r?a.jsx("img",{src:m||r||"",alt:"Tanda Tangan Digital Pasien",className:"max-h-20 w-auto object-contain"}):a.jsx("span",{className:"text-xs text-gray-400 italic",children:"Tanda tangan digital telah tercatat dalam sistem riwayat reservasi."})}),j&&a.jsxs("p",{className:"text-[10px] text-gray-500 text-right",children:["Tercatat pada: ",new Date(j).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})," WIB"]})]}),a.jsx("div",{className:"pt-2",children:a.jsx(P,{type:"button",onClick:u,className:"w-full h-11 rounded-xl bg-[#2C2416] hover:bg-[#443823] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95",children:a.jsx("span",{children:"Tutup"})})})]}):a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:"space-y-1",children:[a.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Nama Pasien / Wali Sah ",a.jsx("span",{className:"text-red-500",children:"*"})]}),a.jsx("input",{type:"text",value:w,onChange:e=>R(e.target.value),placeholder:"Masukkan nama lengkap pasien / wali sah",className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsxs("div",{className:"flex items-center justify-between",children:[a.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Tanda Tangan Digital Pasien ",a.jsx("span",{className:"text-red-500",children:"*"})]}),(K||m)&&a.jsx("button",{type:"button",onClick:ra,className:"text-[11px] font-semibold text-gray-500 hover:text-red-600 underline cursor-pointer",children:"Clear / Ganti Tanda Tangan"})]}),a.jsxs("div",{className:"relative border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs",children:[!K&&!b&&!m&&a.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs",children:a.jsx("span",{children:"Sign Here (Goreskan tanda tangan Anda di sini)"})}),a.jsx("canvas",{ref:l,onMouseDown:O,onMouseMove:Q,onMouseUp:B,onMouseLeave:B,onTouchStart:O,onTouchMove:Q,onTouchEnd:B,className:"w-full h-32 cursor-crosshair touch-none"})]})]}),C&&a.jsx("div",{className:"p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium",children:C}),a.jsxs(P,{type:"button",onClick:la,className:"w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95",children:[a.jsx(G,{className:"w-4 h-4 stroke-[3]"}),a.jsx("span",{children:"Simpan & Terapkan Tanda Tangan"})]})]})})]})})]})}),document.body)}export{ba as R,ya as T,fa as a};
