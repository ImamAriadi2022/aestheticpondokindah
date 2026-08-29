import{c as L,A as na,r as i,j as a,B as C,X as F}from"./index-D2fJ__1Z.js";import{r as U,F as V}from"./index-B9-uBv5n.js";import{C as X}from"./check-D3bXu42u.js";const sa=[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]],ua=L("message-circle",sa);const ia=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],Y=L("printer",ia);const ra=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],ma=L("rotate-ccw",ra);async function q(){const d=await fetch(`${na}/public/settings`,{headers:{Accept:"application/json"}});return d.ok?d.json():{}}function ga({isOpen:d,onClose:m,onAccept:w,initialName:r="",initialEmail:g="",initialPhone:b="",initialSignature:Z,isAgreed:p=!1,showAcceptButton:I=!0}){const[B,D]=i.useState(null),[l,N]=i.useState(null),[x,y]=i.useState(r),[E,A]=i.useState(p),[K,h]=i.useState(null);i.useEffect(()=>{r&&y(r),A(p)},[r,p]),i.useEffect(()=>{d&&(h(null),q().then(t=>{t.pdf_terms_and_conditions&&N(t.pdf_terms_and_conditions),t.booking_terms&&t.booking_terms.trim().length>0&&D(t.booking_terms)}).catch(()=>{}))},[d]);const f=()=>{if(!E){h("Harap centang kotak persetujuan Syarat dan Ketentuan.");return}if(!x.trim()){h("Harap lengkapi nama Anda.");return}w&&w(x.trim()),m()},P=()=>{const t=document.createElement("iframe");t.style.position="fixed",t.style.right="0",t.style.bottom="0",t.style.width="0",t.style.height="0",t.style.border="0",document.body.appendChild(t);const k=t.contentWindow?.document;if(!k){window.print();return}const _=`
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
              flex-shrink: 0;
            }
            .kop-details {
              text-align: center;
            }
            .kop-title {
              font-size: 12.5pt;
              font-weight: 900;
              color: #000;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin: 0;
            }
            .kop-sub {
              font-size: 8.5pt;
              font-weight: 700;
              color: #222;
              margin: 2px 0 0 0;
            }
            .kop-address {
              font-size: 7.5pt;
              color: #333;
              margin-top: 3px;
              line-height: 1.3;
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
            <img src="/logo/logo.webp" class="kop-logo" alt="Logo" />
            <div class="kop-details">
              <div class="kop-title">Aesthetic Pondok Indah Dental Clinic</div>
              <div class="kop-sub">PT NAVENA INTERNATIONAL GROUP</div>
              <div class="kop-address">
                Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br/>
                Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890 | Email: info@aestheticpondokindah.id
              </div>
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
                <div class="sig-name">${x||"Pasien"}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;k.open(),k.write(_),k.close(),setTimeout(()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},1500)},350)};return d?U.createPortal(a.jsx("div",{className:"fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",onClick:t=>{t.target===t.currentTarget&&m()},children:a.jsxs("div",{className:"relative w-full max-w-3xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left overflow-hidden animate-in zoom-in-95 duration-200 my-auto",onClick:t=>t.stopPropagation(),children:[a.jsxs("div",{className:"flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0",children:[a.jsxs("div",{className:"flex items-center gap-2.5",children:[a.jsx("div",{className:"w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200",children:a.jsx(V,{className:"w-4 h-4"})}),a.jsxs("div",{children:[a.jsx("h3",{className:"text-base sm:text-lg font-bold text-black leading-tight",children:"Syarat dan Ketentuan"}),a.jsx("p",{className:"text-[11px] text-gray-500",children:"Dokumen Resmi Syarat dan Ketentuan Layanan Pasien"})]})]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx(C,{type:"button",variant:"outline",size:"icon",onClick:P,className:"h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100 shadow-xs cursor-pointer",title:"Cetak / Simpan Dokumen",children:a.jsx(Y,{className:"w-4 h-4"})}),a.jsx("button",{type:"button",onClick:m,className:"w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-xs cursor-pointer",title:"Tutup",children:a.jsx(F,{className:"w-4 h-4"})})]})]}),a.jsx("div",{className:"flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5]",children:a.jsxs("div",{className:"max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans",children:[a.jsxs("div",{className:"border-b-2 border-black pb-4 text-center space-y-1",style:{borderBottom:"3px double #000"},children:[a.jsxs("div",{className:"flex items-center justify-center gap-3",children:[a.jsx("img",{src:"/logo/logo.webp",alt:"Aesthetic Pondok Indah",className:"h-12 w-auto object-contain shrink-0",onError:t=>{t.currentTarget.style.display="none"}}),a.jsxs("div",{className:"text-left",children:[a.jsx("h1",{className:"text-base sm:text-lg font-black text-black tracking-wider uppercase leading-tight",children:"AESTHETIC PONDOK INDAH DENTAL CLINIC"}),a.jsx("p",{className:"text-[11px] font-bold text-gray-800",children:"PT NAVENA INTERNATIONAL GROUP"})]})]}),a.jsxs("p",{className:"text-[10px] text-gray-700 leading-snug pt-1",children:["Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",a.jsx("br",{}),"Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890 | Email: info@aestheticpondokindah.id"]})]}),a.jsxs("div",{className:"text-center space-y-0.5 pt-1",children:[a.jsx("h2",{className:"text-xl sm:text-2xl font-bold text-black tracking-tight",children:"Syarat dan Ketentuan"}),a.jsx("p",{className:"text-xs text-gray-600",children:"Harap baca dan berikan tanda centang persetujuan Anda di bawah ini"})]}),a.jsxs("div",{className:"space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left",children:[a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"1. Penerimaan Persyaratan"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh mengakses atau menggunakan layanan kami."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"2. Deskripsi Layanan"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Layanan kami meliputi pemeriksaan klinis, konsultasi medis, dan tindakan perawatan gigi estetik maupun spesialis. Kami berhak mengubah, menangguhkan, atau menghentikan setiap aspek layanan kami kapan saja, dengan atau tanpa pemberitahuan."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"3. Akun Pengguna"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda mungkin diminta membuat akun atau melengkapi data identitas untuk mengakses fitur layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan data serta membatasi akses ke akun Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di akun Anda."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"4. Perilaku Pengguna"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda setuju untuk tidak menggunakan layanan kami untuk tujuan yang melanggar hukum atau dengan cara apa pun yang melanggar Persyaratan dan Ketentuan ini. Anda juga setuju untuk tidak:"}),a.jsxs("ul",{className:"list-disc pl-5 space-y-0.5 text-xs sm:text-[13px] text-gray-800 pt-0.5",children:[a.jsx("li",{children:"Mengganggu, menyalahgunakan, atau menyakiti pengguna atau staf medis lain"}),a.jsx("li",{children:"Melanggar hak pihak ketiga"}),a.jsx("li",{children:"Mengganggu atau mengacaukan pengoperasian sistem dan layanan klinik"}),a.jsx("li",{children:"Menggunakan layanan kami untuk tujuan komersial tanpa persetujuan tertulis kami sebelumnya"})]})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"5. Hak Kekayaan Intelektual"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Semua konten dan materi yang tersedia di layanan kami, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, rekam medis digital, dan perangkat lunak, adalah milik Aesthetic Pondok Indah atau pemberi lisensinya dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"6. Batasan Tanggung Jawab"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Sejauh diizinkan oleh hukum, Aesthetic Pondok Indah tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"7. Ganti Rugi"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda setuju untuk mengganti kerugian dan membebaskan Aesthetic Pondok Indah, afiliasinya, pejabatnya, direkturnya, karyawannya, dan agennya dari dan terhadap segala tuntutan, kewajiban, kerusakan, kerugian, atau biaya yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"8. Hukum yang Mengatur"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Syarat dan Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan ketentuan konflik hukumnya."})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"9. Perubahan Syarat dan Ketentuan"}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Kami berhak memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan layanan kami secara terus-menerus setelah perubahan tersebut merupakan bentuk penerimaan Anda terhadap Syarat dan Ketentuan yang baru."})]})]}),a.jsxs("div",{className:"pt-6 border-t-2 border-gray-300 space-y-4",children:[a.jsxs("label",{className:"flex items-start gap-2.5 cursor-pointer select-none bg-gray-50/80 p-3.5 rounded-xl border border-gray-200",children:[a.jsx("input",{type:"checkbox",checked:E,onChange:t=>{A(t.target.checked),h(null)},className:"mt-0.5 w-4 h-4 rounded border-gray-400 text-black focus:ring-black cursor-pointer"}),a.jsxs("span",{className:"text-xs sm:text-sm text-gray-900 leading-snug",children:["Saya telah membaca, memahami, dan menyetujui seluruh ",a.jsx("strong",{className:"underline",children:"Syarat dan Ketentuan Layanan Pasien"})," klinik Aesthetic Pondok Indah di atas. ",a.jsx("span",{className:"text-red-500",children:"*"})]})]}),a.jsxs("div",{className:"space-y-1",children:[a.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Nama Lengkap Pasien ",a.jsx("span",{className:"text-red-500",children:"*"})]}),a.jsx("input",{type:"text",value:x,onChange:t=>y(t.target.value),placeholder:"Masukkan nama lengkap Anda",className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"})]}),K&&a.jsx("div",{className:"p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium",children:K}),a.jsx("div",{className:"pt-2",children:a.jsxs(C,{type:"button",onClick:f,className:"w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer",children:[a.jsx(X,{className:"w-4 h-4 stroke-[3]"}),a.jsx("span",{children:"Saya Menyetujui Syarat & Ketentuan"})]})})]})]})})]})}),document.body):null}function xa({isOpen:d,onClose:m,bookingCode:w="API-REG",patientName:r="Pasien",patientPhone:g="",patientEmail:b="",isGuest:Z=!1,serviceName:p="Pemeriksaan & Konsultasi Gigi",doctorName:I="Dokter Spesialis Gigi",dateStr:B="Hari Ini",timeStr:D="10:00",signatureData:l=null,acceptedAt:N,onSaveSignature:x,onAccept:y}){const[E,A]=i.useState(null),[K,h]=i.useState(null),[f,P]=i.useState(r),[t,k]=i.useState(g||b),[_,la]=i.useState(!1),[H,T]=i.useState(null),o=i.useRef(null),[M,W]=i.useState(!1),[j,S]=i.useState(!!l),[v,$]=i.useState(l||null);if(i.useEffect(()=>{r&&P(r),(g||b)&&k(g||b),l&&($(l),S(!0))},[r,g,b,l]),i.useEffect(()=>{if(d){T(null),q().then(n=>{n.pdf_informed_consent&&h(n.pdf_informed_consent),n.booking_terms&&n.booking_terms.trim().length>0&&A(n.booking_terms)}).catch(()=>{});const e=setTimeout(()=>{const n=o.current;if(!n)return;const s=n.getContext("2d");if(!s)return;const c=n.getBoundingClientRect(),u=window.devicePixelRatio||1;if(n.width=c.width*u,n.height=c.height*u,s.scale(u,u),s.strokeStyle="#111111",s.lineWidth=2.5,s.lineCap="round",s.lineJoin="round",l){const R=new Image;R.onload=()=>{s.drawImage(R,0,0,c.width,c.height),S(!0)},R.src=l}},120);return()=>clearTimeout(e)}},[d,l]),!d)return null;const Q=N?new Date(N).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}):`${B}, ${D}`,G=e=>{const n=o.current;if(!n)return{x:0,y:0};const s=n.getBoundingClientRect();return"touches"in e&&e.touches.length>0?{x:e.touches[0].clientX-s.left,y:e.touches[0].clientY-s.top}:"clientX"in e?{x:e.clientX-s.left,y:e.clientY-s.top}:{x:0,y:0}},J=e=>{e.preventDefault();const n=o.current;if(!n)return;const s=n.getContext("2d");if(!s)return;s.strokeStyle="#111111",s.lineWidth=2.5,s.lineCap="round",s.lineJoin="round";const{x:c,y:u}=G(e);s.beginPath(),s.moveTo(c,u),W(!0),T(null)},O=e=>{if(!M)return;e.preventDefault();const n=o.current;if(!n)return;const s=n.getContext("2d");if(!s)return;const{x:c,y:u}=G(e);s.lineTo(c,u),s.stroke(),S(!0)},z=()=>{M&&W(!1)},aa=()=>{const e=o.current;if(!e)return;const n=e.getContext("2d");if(!n)return;const s=e.getBoundingClientRect();n.clearRect(0,0,s.width,s.height),S(!1),$(null)},ea=()=>{if(!f.trim()){T("Harap lengkapi nama pasien / wali sah.");return}if(!j&&!v){T("Harap bubuhkan tanda tangan digital Anda pada area tanda tangan.");return}let e;o.current&&j?e=o.current.toDataURL("image/png"):v&&(e=v),x&&e&&x(e),y&&e&&y(e),m()},ta=()=>{const e=document.createElement("iframe");e.style.position="fixed",e.style.right="0",e.style.bottom="0",e.style.width="0",e.style.height="0",e.style.border="0",document.body.appendChild(e);const n=e.contentWindow?.document;if(!n){window.print();return}const s=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Surat Persetujuan Pasien (Informed Consent) - Aesthetic Pondok Indah</title>
          <style>
            @page { size: letter portrait; margin: 15mm 15mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #111; line-height: 1.5; margin: 0; padding: 0; font-size: 9.5pt; background: #fff; }
            .kop-header { display: flex; align-items: center; justify-content: center; gap: 14px; padding-bottom: 10px; margin-bottom: 14px; border-bottom: 3px double #000; text-align: center; }
            .kop-logo { width: 50px; height: 50px; object-fit: contain; flex-shrink: 0; }
            .kop-details { text-align: center; }
            .kop-title { font-size: 12.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
            .kop-sub { font-size: 8.5pt; font-weight: 700; color: #222; margin: 2px 0 0 0; }
            .kop-address { font-size: 7.5pt; color: #333; margin-top: 3px; line-height: 1.3; }
            .doc-header { text-align: center; margin-bottom: 16px; }
            .doc-title { font-size: 12pt; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
            .doc-sub { font-size: 8.5pt; color: #555; margin-top: 4px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 8.5pt; border: 1px solid #333; }
            .meta-table td { padding: 5px 8px; border: 1px solid #333; }
            .clause { margin-bottom: 11px; }
            .clause-title { font-size: 9.5pt; font-weight: 700; color: #000; margin-bottom: 3px; }
            .clause-text { font-size: 9pt; color: #222; line-height: 1.45; text-align: justify; margin: 0; }
            .signature-section { margin-top: 24px; padding-top: 14px; border-top: 1px solid #ccc; }
            .sig-row { display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-box { text-align: center; width: 220px; }
            .sig-img { max-height: 60px; max-width: 180px; object-fit: contain; margin: 6px auto; display: block; }
            .sig-name { font-weight: 700; text-decoration: underline; margin-top: 6px; font-size: 9pt; }
          </style>
        </head>
        <body>
          <div class="kop-header">
            <div class="kop-details">
              <div class="kop-title">Aesthetic Pondok Indah Dental Clinic</div>
              <div class="kop-sub">PT NAVENA INTERNATIONAL GROUP</div>
              <div class="kop-address">
                Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br/>
                Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890
              </div>
            </div>
          </div>
          <div class="doc-header">
            <h1 class="doc-title">Surat Pernyataan & Persetujuan Pasien (Informed Consent)</h1>
            <div class="doc-sub">No. Registrasi: API-CONSENT-${w}</div>
          </div>
          <table class="meta-table">
            <tr>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Nama Pasien</td>
              <td style="width: 30%;">${r}</td>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Layanan</td>
              <td style="width: 30%;">${p}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #f8f8f8;">No. WhatsApp</td>
              <td>${g||"-"}</td>
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
          <div class="signature-section">
            <div class="sig-row">
              <div style="font-size: 8.5pt; color: #444;">
                Status: <strong>✓ Disetujui Secara Digital</strong><br/>
                Waktu: ${Q}
              </div>
              <div class="sig-box">
                <div style="font-size: 8pt; font-weight: bold; color: #222;">Tanda Tangan Pasien:</div>
                ${j?`<img src="${o.current?.toDataURL("image/png")}" class="sig-img" alt="Tanda Tangan" />`:l?`<img src="${l}" class="sig-img" alt="Tanda Tangan" />`:'<div style="height: 45px;"></div>'}
                <div class="sig-name">${f||r}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;n.write(s),n.close(),setTimeout(()=>{e.contentWindow?.focus(),e.contentWindow?.print(),setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},1500)},350)};return U.createPortal(a.jsx("div",{className:"fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",onClick:e=>{e.target===e.currentTarget&&m()},children:a.jsxs("div",{className:"relative w-full max-w-3xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left overflow-hidden animate-in zoom-in-95 duration-200 my-auto",onClick:e=>e.stopPropagation(),children:[a.jsxs("div",{className:"flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0",children:[a.jsxs("div",{className:"flex items-center gap-2.5",children:[a.jsx("div",{className:"w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200",children:a.jsx(V,{className:"w-4 h-4"})}),a.jsxs("div",{children:[a.jsx("h3",{className:"text-base sm:text-lg font-bold text-black leading-tight",children:"Surat Persetujuan Pasien (Informed Consent)"}),a.jsx("p",{className:"text-[11px] text-gray-500",children:"Persetujuan Tindakan Medis & Anamnesis Pasien"})]})]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx(C,{type:"button",variant:"outline",size:"icon",onClick:ta,className:"h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100 shadow-xs cursor-pointer",title:"Cetak Dokumen",children:a.jsx(Y,{className:"w-4 h-4"})}),a.jsx("button",{type:"button",onClick:m,className:"w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-xs cursor-pointer",title:"Tutup",children:a.jsx(F,{className:"w-4 h-4"})})]})]}),a.jsx("div",{className:"flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5]",children:a.jsxs("div",{className:"max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans",children:[a.jsxs("div",{className:"border-b-2 border-black pb-4 text-center space-y-1",style:{borderBottom:"3px double #000"},children:[a.jsxs("div",{className:"flex items-center justify-center gap-3",children:[a.jsx("img",{src:"/logo/logo.webp",alt:"Aesthetic Pondok Indah",className:"h-12 w-auto object-contain shrink-0",onError:e=>{e.currentTarget.style.display="none"}}),a.jsxs("div",{className:"text-left",children:[a.jsx("h1",{className:"text-base sm:text-lg font-black text-black tracking-wider uppercase leading-tight",children:"AESTHETIC PONDOK INDAH DENTAL CLINIC"}),a.jsx("p",{className:"text-[11px] font-bold text-gray-800",children:"PT NAVENA INTERNATIONAL GROUP"})]})]}),a.jsxs("p",{className:"text-[10px] text-gray-700 leading-snug pt-1",children:["Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",a.jsx("br",{}),"Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890 | Email: info@aestheticpondokindah.id"]})]}),a.jsx("div",{className:"text-center space-y-0.5 pt-1",children:a.jsx("h2",{className:"text-lg font-bold text-black uppercase",children:"Surat Pernyataan & Persetujuan Pasien (Informed Consent)"})}),a.jsx("div",{className:"border border-gray-300 rounded-lg overflow-hidden text-xs",children:a.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-300",children:[a.jsxs("div",{className:"p-3 space-y-1 bg-gray-50/50",children:[a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"Nama:"})," ",r]}),a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"No. WA:"})," ",g||"-"]})]}),a.jsxs("div",{className:"p-3 space-y-1 bg-gray-50/50",children:[a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"Layanan:"})," ",p]}),a.jsxs("p",{children:[a.jsx("strong",{className:"text-black",children:"Dokter:"})," ",I]})]})]})}),a.jsx("div",{className:"space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left",children:[{title:"1. Persetujuan Pemeriksaan & Tindakan Medis Gigi",text:"Saya memberikan persetujuan penuh kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan fisik rongga mulut, diagnostik klinis, serta tindakan perawatan gigi sesuai prosedur medis yang disepakati."},{title:"2. Keterbukaan Riwayat Kesehatan & Anamnesis",text:"Saya menyatakan telah memberikan informasi riwayat kesehatan, penyakit bawaan, alergi obat, atau kondisi kesehatan yang sebenarnya."},{title:"3. Ketentuan Penjadwalan & Waktu Kedatangan",text:"Saya memahami kewajiban hadir di klinik minimal 15 (lima belas) menit sebelum waktu reservasi. Keterlambatan lebih dari 15 menit dapat mengakibatkan penyesuaian durasi atau penjadwalan ulang."},{title:"4. Kerahasiaan Data & Rekam Medis Elektronik",text:"Seluruh data rekam medis dan hasil rontgen dilindungi kerahasiaannya sesuai peraturan perundang-undangan kesehatan RI."},{title:"5. Kebijakan Pembayaran & Pembatalan",text:"Saya bersedia menyelesaikan kewajiban pembayaran tindakan sesuai tarif resmi yang disetujui sebelum tindakan dilakukan."}].map((e,n)=>a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:e.title}),a.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:e.text})]},n))}),a.jsxs("div",{className:"pt-6 border-t-2 border-gray-300 space-y-4",children:[a.jsxs("div",{className:"space-y-1",children:[a.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Nama Pasien / Wali Sah ",a.jsx("span",{className:"text-red-500",children:"*"})]}),a.jsx("input",{type:"text",value:f,onChange:e=>P(e.target.value),placeholder:"Masukkan nama lengkap pasien / wali sah",className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsxs("div",{className:"flex items-center justify-between",children:[a.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Tanda Tangan Digital Pasien ",a.jsx("span",{className:"text-red-500",children:"*"})]}),(j||v)&&a.jsx("button",{type:"button",onClick:aa,className:"text-[11px] font-semibold text-gray-500 hover:text-red-600 underline cursor-pointer",children:"Clear / Ganti Tanda Tangan"})]}),a.jsxs("div",{className:"relative border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs",children:[!j&&!M&&!v&&a.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs",children:a.jsx("span",{children:"Sign Here (Goreskan tanda tangan Anda di sini)"})}),a.jsx("canvas",{ref:o,onMouseDown:J,onMouseMove:O,onMouseUp:z,onMouseLeave:z,onTouchStart:J,onTouchMove:O,onTouchEnd:z,className:"w-full h-32 cursor-crosshair touch-none"})]})]}),H&&a.jsx("div",{className:"p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium",children:H}),a.jsxs(C,{type:"button",onClick:ea,className:"w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer",children:[a.jsx(X,{className:"w-4 h-4 stroke-[3]"}),a.jsx("span",{children:"Kirim & Simpan Tanda Tangan"})]})]})]})})]})}),document.body)}export{ua as M,Y as P,xa as R,ga as T,ma as a,q as g};
