import{c as X,A as re,r as l,j as e,B as H,X as V}from"./index-51d8yj59.js";import{D as q,a as Z,b as Q,f as le}from"./dialog-CaMTkxMV.js";import{F as ee}from"./file-text-CYhctRRk.js";import{C as ae}from"./check-Bnz5WKaY.js";const de=[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]],pe=X("message-circle",de);const oe=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],te=X("printer",oe);const ce=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],he=X("rotate-ccw",ce);async function ne(){const m=await fetch(`${re}/public/settings`,{headers:{Accept:"application/json"}});return m.ok?m.json():{}}function ke({isOpen:m,onClose:j,onAccept:R,initialName:o="",initialEmail:x="",initialPhone:b="",initialSignature:S=null,showAcceptButton:_=!0}){const[W,$]=l.useState(null),[Y,d]=l.useState(null),[J,C]=l.useState(!1),[v,O]=l.useState(o),[G,U]=l.useState(x||b),[L,I]=l.useState(!1),[D,N]=l.useState(null),c=l.useRef(null),[A,z]=l.useState(!1),[w,h]=l.useState(!!S);l.useEffect(()=>{o&&O(o),(x||b)&&U(x||b)},[o,x,b]),l.useEffect(()=>{if(m){C(!0),N(null),ne().then(s=>{s.pdf_terms_and_conditions&&d(s.pdf_terms_and_conditions),s.booking_terms&&s.booking_terms.trim().length>0&&$(s.booking_terms)}).catch(()=>{}).finally(()=>C(!1));const t=setTimeout(()=>{const s=c.current;if(!s)return;const n=s.getContext("2d");if(!n)return;const p=s.getBoundingClientRect(),g=window.devicePixelRatio||1;if(s.width=p.width*g,s.height=p.height*g,n.scale(g,g),n.strokeStyle="#111111",n.lineWidth=2.5,n.lineCap="round",n.lineJoin="round",S){const E=new Image;E.onload=()=>{n.drawImage(E,0,0,p.width,p.height),h(!0)},E.src=S}},120);return()=>clearTimeout(t)}},[m,S]);const u=t=>{const s=c.current;if(!s)return{x:0,y:0};const n=s.getBoundingClientRect();return"touches"in t&&t.touches.length>0?{x:t.touches[0].clientX-n.left,y:t.touches[0].clientY-n.top}:"clientX"in t?{x:t.clientX-n.left,y:t.clientY-n.top}:{x:0,y:0}},P=t=>{t.preventDefault();const s=c.current;if(!s)return;const n=s.getContext("2d");if(!n)return;n.strokeStyle="#111111",n.lineWidth=2.5,n.lineCap="round",n.lineJoin="round";const{x:p,y:g}=u(t);n.beginPath(),n.moveTo(p,g),z(!0),N(null)},M=t=>{if(!A)return;t.preventDefault();const s=c.current;if(!s)return;const n=s.getContext("2d");if(!n)return;const{x:p,y:g}=u(t);n.lineTo(p,g),n.stroke(),h(!0)},k=()=>{A&&z(!1)},T=()=>{const t=c.current;if(!t)return;const s=t.getContext("2d");if(!s)return;const n=t.getBoundingClientRect();s.clearRect(0,0,n.width,n.height),h(!1)},K=()=>{if(!L){N("Harap centang persetujuan Syarat dan Ketentuan.");return}if(!v.trim()){N("Harap lengkapi nama Anda.");return}let t;c.current&&w&&(t=c.current.toDataURL("image/png")),R&&R(t,v.trim()),j()},B=()=>{const t=document.createElement("iframe");t.style.position="fixed",t.style.right="0",t.style.bottom="0",t.style.width="0",t.style.height="0",t.style.border="0",document.body.appendChild(t);const s=t.contentWindow?.document;if(!s){window.print();return}const n=`
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
            .sig-box {
              text-align: center;
              width: 220px;
            }
            .sig-img {
              max-height: 60px;
              max-width: 180px;
              object-fit: contain;
              margin: 6px auto;
              display: block;
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
            <div class="doc-sub">Harap baca dan kirim tanggapan Anda di bawah...</div>
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
                Status: <strong>✓ Disetujui Secara Digital</strong><br/>
                Waktu: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB
              </div>
              <div class="sig-box">
                <div style="font-size: 8pt; font-weight: bold; color: #222;">Tanda Tangan Pasien:</div>
                ${c.current&&w?`<img src="${c.current.toDataURL("image/png")}" class="sig-img" alt="Tanda Tangan" />`:'<div style="height: 45px;"></div>'}
                <div class="sig-name">${v||"Pasien"}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;s.open(),s.write(n),s.close(),setTimeout(()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},1500)},350)};return e.jsx(q,{open:m,onOpenChange:t=>!t&&j(),children:e.jsxs(Z,{className:"w-[95vw] max-w-3xl lg:max-w-3xl xl:max-w-4xl max-h-[94vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200",children:e.jsx(ee,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx(Q,{className:"text-base sm:text-lg font-bold text-black leading-tight",children:"Syarat dan Ketentuan"}),e.jsx(le,{className:"sr-only",children:"Syarat dan Ketentuan Layanan Pasien"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(H,{type:"button",variant:"outline",size:"icon",onClick:B,className:"h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100 shadow-xs cursor-pointer",title:"Cetak / Simpan Dokumen",children:e.jsx(te,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:j,className:"w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-xs cursor-pointer",title:"Tutup",children:e.jsx(V,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5]",children:e.jsxs("div",{className:"max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans",children:[e.jsxs("div",{className:"border-b-2 border-black pb-4 text-center space-y-1",style:{borderBottom:"3px double #000"},children:[e.jsxs("div",{className:"flex items-center justify-center gap-3",children:[e.jsx("img",{src:"/logo/logo.webp",alt:"Aesthetic Pondok Indah",className:"h-12 w-auto object-contain shrink-0",onError:t=>{t.currentTarget.style.display="none"}}),e.jsxs("div",{className:"text-left",children:[e.jsx("h1",{className:"text-base sm:text-lg font-black text-black tracking-wider uppercase leading-tight",children:"AESTHETIC PONDOK INDAH DENTAL CLINIC"}),e.jsx("p",{className:"text-[11px] font-bold text-gray-800",children:"PT NAVENA INTERNATIONAL GROUP"})]})]}),e.jsxs("p",{className:"text-[10px] text-gray-700 leading-snug pt-1",children:["Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",e.jsx("br",{}),"Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890 | Email: info@aestheticpondokindah.id"]})]}),e.jsxs("div",{className:"text-center space-y-0.5 pt-1",children:[e.jsx("h2",{className:"text-xl sm:text-2xl font-bold text-black tracking-tight",children:"Syarat dan Ketentuan"}),e.jsx("p",{className:"text-xs text-gray-600",children:"Harap baca dan kirim tanggapan Anda di bawah..."})]}),e.jsxs("div",{className:"space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"1. Penerimaan Persyaratan"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh mengakses atau menggunakan layanan kami."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"2. Deskripsi Layanan"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Layanan kami meliputi pemeriksaan klinis, konsultasi medis, dan tindakan perawatan gigi estetik maupun spesialis. Kami berhak mengubah, menangguhkan, atau menghentikan setiap aspek layanan kami kapan saja, dengan atau tanpa pemberitahuan."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"3. Akun Pengguna"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda mungkin diminta membuat akun atau melengkapi data identitas untuk mengakses fitur layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan data serta membatasi akses ke akun Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di akun Anda."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"4. Perilaku Pengguna"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda setuju untuk tidak menggunakan layanan kami untuk tujuan yang melanggar hukum atau dengan cara apa pun yang melanggar Persyaratan dan Ketentuan ini. Anda juga setuju untuk tidak:"}),e.jsxs("ul",{className:"list-disc pl-5 space-y-0.5 text-xs sm:text-[13px] text-gray-800 pt-0.5",children:[e.jsx("li",{children:"Mengganggu, menyalahgunakan, atau menyakiti pengguna atau staf medis lain"}),e.jsx("li",{children:"Melanggar hak pihak ketiga"}),e.jsx("li",{children:"Mengganggu atau mengacaukan pengoperasian sistem dan layanan klinik"}),e.jsx("li",{children:"Menggunakan layanan kami untuk tujuan komersial tanpa persetujuan tertulis kami sebelumnya"})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"5. Hak Kekayaan Intelektual"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Semua konten dan materi yang tersedia di layanan kami, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, rekam medis digital, dan perangkat lunak, adalah milik Aesthetic Pondok Indah atau pemberi lisensinya dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"6. Batasan Tanggung Jawab"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Sejauh diizinkan oleh hukum, Aesthetic Pondok Indah tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"7. Ganti Rugi"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Anda setuju untuk mengganti kerugian dan membebaskan Aesthetic Pondok Indah, afiliasinya, pejabatnya, direkturnya, karyawannya, dan agennya dari dan terhadap segala tuntutan, kewajiban, kerusakan, kerugian, atau biaya yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"8. Hukum yang Mengatur"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Syarat dan Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan ketentuan konflik hukumnya."})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:"9. Perubahan Syarat dan Ketentuan"}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:"Kami berhak memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan layanan kami secara terus-menerus setelah perubahan tersebut merupakan bentuk penerimaan Anda terhadap Syarat dan Ketentuan yang baru."})]})]}),e.jsxs("div",{className:"pt-6 border-t-2 border-gray-300 space-y-4",children:[e.jsxs("label",{className:"flex items-start gap-2.5 cursor-pointer select-none",children:[e.jsx("input",{type:"checkbox",checked:L,onChange:t=>{I(t.target.checked),N(null)},className:"mt-0.5 w-4 h-4 rounded border-gray-400 text-black focus:ring-black cursor-pointer"}),e.jsxs("span",{className:"text-xs sm:text-sm text-gray-900 leading-snug",children:["Saya setuju dengan ",e.jsx("strong",{className:"underline",children:"terms & conditions"}),". ",e.jsx("span",{className:"text-red-500",children:"*"})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Nama Lengkap ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"text",value:v,onChange:t=>O(t.target.value),placeholder:"Masukkan nama lengkap Anda",className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-xs font-bold text-gray-800",children:"Email / No. WhatsApp"}),e.jsx("input",{type:"text",value:G,onChange:t=>U(t.target.value),placeholder:"contoh@email.com atau 081234567890",className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"block text-xs font-bold text-gray-800",children:["Tanda Tangan ",e.jsx("span",{className:"text-red-500",children:"*"})]}),w&&e.jsx("button",{type:"button",onClick:T,className:"text-[11px] font-semibold text-gray-500 hover:text-red-600 underline cursor-pointer",children:"Clear / Hapus"})]}),e.jsxs("div",{className:"relative border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs",children:[!w&&!A&&e.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs",children:e.jsx("span",{children:"Sign Here (Goreskan tanda tangan Anda di sini)"})}),e.jsx("canvas",{ref:c,onMouseDown:P,onMouseMove:M,onMouseUp:k,onMouseLeave:k,onTouchStart:P,onTouchMove:M,onTouchEnd:k,className:"w-full h-32 cursor-crosshair touch-none"})]})]}),D&&e.jsx("div",{className:"p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium",children:D}),e.jsx("div",{className:"pt-2",children:e.jsxs(H,{type:"button",onClick:K,className:"w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer",children:[e.jsx(ae,{className:"w-4 h-4 stroke-[3]"}),e.jsx("span",{children:"Kirim Persetujuan"})]})})]})]})})]})})}function be({isOpen:m,onClose:j,bookingCode:R="API-REG",patientName:o="Pasien",patientPhone:x="",patientEmail:b="",isGuest:S=!1,serviceName:_="Pemeriksaan & Konsultasi Gigi",doctorName:W="Dokter Spesialis Gigi",dateStr:$="Hari Ini",timeStr:Y="10:00",signatureData:d=null,acceptedAt:J,onSaveSignature:C,onAccept:v}){const[O,G]=l.useState(null),[U,L]=l.useState(null),[I,D]=l.useState(o),[N,c]=l.useState(x||b),[A,z]=l.useState(!1),[w,h]=l.useState(null),u=l.useRef(null),[P,M]=l.useState(!1),[k,T]=l.useState(!!d),[K,B]=l.useState(d||null);if(l.useEffect(()=>{o&&D(o),(x||b)&&c(x||b),d&&(B(d),T(!0))},[o,x,b,d]),l.useEffect(()=>{if(m){h(null),ne().then(i=>{i.pdf_informed_consent&&L(i.pdf_informed_consent),i.booking_terms&&i.booking_terms.trim().length>0&&G(i.booking_terms)}).catch(()=>{});const a=setTimeout(()=>{const i=u.current;if(!i)return;const r=i.getContext("2d");if(!r)return;const y=i.getBoundingClientRect(),f=window.devicePixelRatio||1;if(i.width=y.width*f,i.height=y.height*f,r.scale(f,f),r.strokeStyle="#111111",r.lineWidth=2.5,r.lineCap="round",r.lineJoin="round",d){const F=new Image;F.onload=()=>{r.drawImage(F,0,0,y.width,y.height),T(!0)},F.src=d}},120);return()=>clearTimeout(a)}},[m,d]),!m)return null;const t=J?new Date(J).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}):`${$}, ${Y}`,s=a=>{const i=u.current;if(!i)return{x:0,y:0};const r=i.getBoundingClientRect();return"touches"in a&&a.touches.length>0?{x:a.touches[0].clientX-r.left,y:a.touches[0].clientY-r.top}:"clientX"in a?{x:a.clientX-r.left,y:a.clientY-r.top}:{x:0,y:0}},n=a=>{a.preventDefault();const i=u.current;if(!i)return;const r=i.getContext("2d");if(!r)return;r.strokeStyle="#111111",r.lineWidth=2.5,r.lineCap="round",r.lineJoin="round";const{x:y,y:f}=s(a);r.beginPath(),r.moveTo(y,f),M(!0),h(null)},p=a=>{if(!P)return;a.preventDefault();const i=u.current;if(!i)return;const r=i.getContext("2d");if(!r)return;const{x:y,y:f}=s(a);r.lineTo(y,f),r.stroke(),T(!0)},g=()=>{P&&M(!1)},E=()=>{const a=u.current;if(!a)return;const i=a.getContext("2d");if(!i)return;const r=a.getBoundingClientRect();i.clearRect(0,0,r.width,r.height),T(!1),B(null)},se=()=>{if(!A&&!d&&!k){h("Harap centang persetujuan Surat Pernyataan dan Persetujuan.");return}if(!I.trim()){h("Harap lengkapi nama Anda.");return}if(!k&&!K){h("Harap bubuhkan tanda tangan Anda.");return}let a;u.current&&k?a=u.current.toDataURL("image/png"):K&&(a=K),C&&a&&C(a),v&&a&&v(a),j()},ie=()=>{const a=document.createElement("iframe");a.style.position="fixed",a.style.right="0",a.style.bottom="0",a.style.width="0",a.style.height="0",a.style.border="0",document.body.appendChild(a);const i=a.contentWindow?.document;if(!i){window.print();return}const r=`
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
            <div class="doc-sub">No. Registrasi: API-CONSENT-${R}</div>
          </div>
          <table class="meta-table">
            <tr>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Nama Pasien</td>
              <td style="width: 30%;">${o}</td>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Layanan</td>
              <td style="width: 30%;">${_}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #f8f8f8;">No. WhatsApp</td>
              <td>${x||"-"}</td>
              <td style="font-weight: bold; background: #f8f8f8;">Dokter</td>
              <td>${W}</td>
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
                Waktu: ${t}
              </div>
              <div class="sig-box">
                <div style="font-size: 8pt; font-weight: bold; color: #222;">Tanda Tangan Pasien:</div>
                ${k?`<img src="${u.current?.toDataURL("image/png")}" class="sig-img" alt="Tanda Tangan" />`:d?`<img src="${d}" class="sig-img" alt="Tanda Tangan" />`:'<div style="height: 45px;"></div>'}
                <div class="sig-name">${I||o}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;i.write(r),i.close(),setTimeout(()=>{a.contentWindow?.focus(),a.contentWindow?.print(),setTimeout(()=>{document.body.contains(a)&&document.body.removeChild(a)},1500)},350)};return e.jsx(q,{open:m,onOpenChange:a=>!a&&j(),children:e.jsxs(Z,{className:"w-[95vw] max-w-3xl max-h-[94vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200",children:e.jsx(ee,{className:"w-4 h-4"})}),e.jsx("div",{children:e.jsx(Q,{className:"text-base sm:text-lg font-bold text-black leading-tight",children:"Surat Persetujuan Pasien (Informed Consent)"})})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(H,{type:"button",variant:"outline",size:"icon",onClick:ie,className:"h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100",children:e.jsx(te,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:j,className:"w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100",children:e.jsx(V,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5]",children:e.jsxs("div",{className:"max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans",children:[e.jsxs("div",{className:"border-b-2 border-black pb-4 text-center space-y-1",style:{borderBottom:"3px double #000"},children:[e.jsxs("div",{className:"flex items-center justify-center gap-3",children:[e.jsx("img",{src:"/logo/logo.webp",alt:"Aesthetic Pondok Indah",className:"h-12 w-auto object-contain shrink-0",onError:a=>{a.currentTarget.style.display="none"}}),e.jsxs("div",{className:"text-left",children:[e.jsx("h1",{className:"text-base sm:text-lg font-black text-black tracking-wider uppercase leading-tight",children:"AESTHETIC PONDOK INDAH DENTAL CLINIC"}),e.jsx("p",{className:"text-[11px] font-bold text-gray-800",children:"PT NAVENA INTERNATIONAL GROUP"})]})]}),e.jsxs("p",{className:"text-[10px] text-gray-700 leading-snug pt-1",children:["Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",e.jsx("br",{}),"Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890 | Email: info@aestheticpondokindah.id"]})]}),e.jsx("div",{className:"text-center space-y-0.5 pt-1",children:e.jsx("h2",{className:"text-lg font-bold text-black uppercase",children:"Surat Pernyataan & Persetujuan Pasien (Informed Consent)"})}),e.jsx("div",{className:"border border-gray-300 rounded-lg overflow-hidden text-xs",children:e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-300",children:[e.jsxs("div",{className:"p-3 space-y-1 bg-gray-50/50",children:[e.jsxs("p",{children:[e.jsx("strong",{className:"text-black",children:"Nama:"})," ",o]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-black",children:"No. WA:"})," ",x||"-"]})]}),e.jsxs("div",{className:"p-3 space-y-1 bg-gray-50/50",children:[e.jsxs("p",{children:[e.jsx("strong",{className:"text-black",children:"Layanan:"})," ",_]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-black",children:"Dokter:"})," ",W]})]})]})}),e.jsx("div",{className:"space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left",children:[{title:"1. Persetujuan Pemeriksaan & Tindakan Medis Gigi",text:"Saya memberikan persetujuan penuh kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan fisik rongga mulut, diagnostik klinis, serta tindakan perawatan gigi sesuai prosedur medis yang disepakati."},{title:"2. Keterbukaan Riwayat Kesehatan & Anamnesis",text:"Saya menyatakan telah memberikan informasi riwayat kesehatan, penyakit bawaan, alergi obat, atau kondisi kesehatan yang sebenarnya."},{title:"3. Ketentuan Penjadwalan & Waktu Kedatangan",text:"Saya memahami kewajiban hadir di klinik minimal 15 (lima belas) menit sebelum waktu reservasi. Keterlambatan lebih dari 15 menit dapat mengakibatkan penyesuaian durasi atau penjadwalan ulang."},{title:"4. Kerahasiaan Data & Rekam Medis Elektronik",text:"Seluruh data rekam medis dan hasil rontgen dilindungi kerahasiaannya sesuai peraturan perundang-undangan kesehatan RI."},{title:"5. Kebijakan Pembayaran & Pembatalan",text:"Saya bersedia menyelesaikan kewajiban pembayaran tindakan sesuai tarif resmi yang disetujui sebelum tindakan dilakukan."}].map((a,i)=>e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-bold text-black text-xs sm:text-sm",children:a.title}),e.jsx("p",{className:"text-xs sm:text-[13px] text-gray-800 text-justify",children:a.text})]},i))}),e.jsxs("div",{className:"pt-6 border-t-2 border-gray-300 space-y-4",children:[e.jsxs("label",{className:"flex items-start gap-2.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:A,onChange:a=>{z(a.target.checked),h(null)},className:"mt-0.5 w-4 h-4 rounded border-gray-400 text-black focus:ring-black"}),e.jsxs("span",{className:"text-xs sm:text-sm text-gray-900 leading-snug",children:["Saya telah membaca dan menyetujui seluruh isi ",e.jsx("strong",{className:"underline",children:"Surat Pernyataan & Persetujuan Pasien (Informed Consent)"})," di atas."]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-xs font-bold text-gray-800",children:"Nama Pasien / Wali Sah *"}),e.jsx("input",{type:"text",value:I,onChange:a=>D(a.target.value),className:"w-full h-10 px-3.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-black"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"block text-xs font-bold text-gray-800",children:"Tanda Tangan Digital Pasien *"}),k&&e.jsx("button",{type:"button",onClick:E,className:"text-[11px] font-semibold text-gray-500 hover:text-red-600 underline",children:"Ganti Tanda Tangan"})]}),e.jsxs("div",{className:"relative border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs",children:[!k&&!P&&e.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs",children:"Sign Here"}),e.jsx("canvas",{ref:u,onMouseDown:n,onMouseMove:p,onMouseUp:g,onMouseLeave:g,onTouchStart:n,onTouchMove:p,onTouchEnd:g,className:"w-full h-32 cursor-crosshair touch-none"})]})]}),w&&e.jsx("div",{className:"p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium",children:w}),e.jsxs(H,{type:"button",onClick:se,className:"w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm",children:[e.jsx(ae,{className:"w-4 h-4 mr-2"})," Kirim & Simpan Persetujuan"]})]})]})})]})})}export{pe as M,te as P,be as R,ke as T,he as a,ne as g};
