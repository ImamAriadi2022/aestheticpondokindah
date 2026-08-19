import{c as E,r as i,j as e,X as A,B as p}from"./index-Dy7R4qyH.js";import{P as C,R as M}from"./rotate-ccw-BNbpsHkN.js";import{S as z}from"./sparkles-WfVY5az-.js";import{C as I}from"./check-Cs-xQsIm.js";import{g as L,P as H,B as U}from"./clinicSettingsApi-BWly7EQF.js";import{F as J}from"./file-text-CJa-f4Ck.js";import{S as $}from"./shield-check-BgoObhvq.js";const W=[["path",{d:"M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18",key:"16swn3"}],["path",{d:"M21 15.5V6a2 2 0 0 0-2-2H9.5",key:"yhw86o"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h7",key:"1wap6i"}],["path",{d:"M21 10h-5.5",key:"quycpq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],ee=E("calendar-off",W);const _=[["path",{d:"m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21",key:"182aya"}],["path",{d:"M22 21H7",key:"t4ddhn"}],["path",{d:"m5 11 9 9",key:"1mo9qw"}]],G=E("eraser",_);function ae({isOpen:x,onClose:m,onSaveSignature:f,initialSignature:u,patientName:k="Pasien Aesthetic Pondok Indah"}){const r=i.useRef(null),[h,b]=i.useState(!1),[s,l]=i.useState(!1),[o,j]=i.useState("pen"),[y,B]=i.useState("#2C2416"),[g,P]=i.useState(3),S=[{name:"Charcoal",hex:"#2C2416"},{name:"Gold",hex:"#8C6B1C"},{name:"Deep Navy",hex:"#1E3A8A"},{name:"Royal Blue",hex:"#2563EB"}],T=[{label:"Halus",size:2},{label:"Sedang",size:4},{label:"Tebal",size:7},{label:"Kuas",size:11}];i.useEffect(()=>{if(!x)return;const a=setTimeout(()=>{const n=r.current;if(!n)return;const t=n.getContext("2d");if(!t)return;const d=n.getBoundingClientRect(),c=window.devicePixelRatio||1;if(n.width=d.width*c,n.height=d.height*c,t.scale(c,c),t.strokeStyle=y,t.lineWidth=g,t.lineCap="round",t.lineJoin="round",u){const w=new Image;w.onload=()=>{t.drawImage(w,0,0,d.width,d.height),l(!0)},w.src=u}},100);return()=>clearTimeout(a)},[x]);const N=a=>{const n=r.current;if(!n)return{x:0,y:0};const t=n.getBoundingClientRect();return"touches"in a&&a.touches.length>0?{x:a.touches[0].clientX-t.left,y:a.touches[0].clientY-t.top}:"clientX"in a?{x:a.clientX-t.left,y:a.clientY-t.top}:{x:0,y:0}},D=a=>{a.preventDefault();const n=r.current;if(!n)return;const t=n.getContext("2d");if(!t)return;t.strokeStyle=o==="eraser"?"#FFFFFF":y,t.lineWidth=o==="eraser"?g*3:g,t.lineCap="round",t.lineJoin="round";const{x:d,y:c}=N(a);t.beginPath(),t.moveTo(d,c),b(!0)},F=a=>{if(!h)return;a.preventDefault();const n=r.current;if(!n)return;const t=n.getContext("2d");if(!t)return;const{x:d,y:c}=N(a);t.lineTo(d,c),t.stroke(),l(!0)},v=()=>{h&&b(!1)},K=()=>{const a=r.current;if(!a)return;const n=a.getContext("2d");if(!n)return;const t=a.getBoundingClientRect();n.clearRect(0,0,t.width,t.height),l(!1)},R=()=>{const a=r.current;if(!a||!s)return;const n=a.toDataURL("image/png");f(n),m()};return x?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",children:e.jsxs("div",{className:"relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left my-auto",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD]",children:e.jsx(C,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base sm:text-lg font-bold font-display text-[#2C2416]",children:"Tanda Tangan Digital Pasien *"}),e.jsx("p",{className:"text-[11px] text-[#7C7365]",children:"Goreskan tanda tangan persetujuan resmi Anda"})]})]}),e.jsx("button",{type:"button",onClick:m,className:"w-8 h-8 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all",title:"Tutup",children:e.jsx(A,{className:"w-4 h-4"})})]}),e.jsxs("div",{className:"p-4 sm:p-5 space-y-3.5 overflow-y-auto",children:[e.jsxs("div",{className:"bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-3 space-y-2.5",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D9D0BC]",children:[e.jsxs("button",{type:"button",onClick:()=>j("pen"),className:`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${o==="pen"?"bg-[#8C6B1C] text-white shadow-xs":"text-[#5C5546] hover:bg-[#FAF8F5]"}`,children:[e.jsx(C,{className:"w-3 h-3"}),e.jsx("span",{children:"Pulpen"})]}),e.jsxs("button",{type:"button",onClick:()=>j("brush"),className:`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${o==="brush"?"bg-[#8C6B1C] text-white shadow-xs":"text-[#5C5546] hover:bg-[#FAF8F5]"}`,children:[e.jsx(z,{className:"w-3 h-3"}),e.jsx("span",{children:"Kuas"})]}),e.jsxs("button",{type:"button",onClick:()=>j("eraser"),className:`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${o==="eraser"?"bg-rose-600 text-white shadow-xs":"text-[#5C5546] hover:bg-[#FAF8F5]"}`,children:[e.jsx(G,{className:"w-3 h-3"}),e.jsx("span",{children:"Penghapus"})]})]}),e.jsxs("button",{type:"button",onClick:K,className:"px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs",children:[e.jsx(M,{className:"w-3 h-3"}),e.jsx("span",{children:"Hapus Canvas"})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#EDE5D6]",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-medium text-[#8C8272]",children:"Ketebalan:"}),e.jsx("div",{className:"flex items-center gap-1",children:T.map(a=>e.jsx("button",{type:"button",onClick:()=>P(a.size),className:`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${g===a.size?"bg-[#2C2416] text-white":"bg-white text-[#5C5546] border border-[#D9D0BC] hover:border-[#8C6B1C]"}`,children:a.label},a.size))})]}),o!=="eraser"&&e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-medium text-[#8C8272]",children:"Tinta:"}),e.jsx("div",{className:"flex items-center gap-1",children:S.map(a=>e.jsx("button",{type:"button",onClick:()=>B(a.hex),className:`w-6 h-6 rounded-full border-2 transition-all ${y===a.hex?"ring-2 ring-[#8C6B1C] scale-110":"border-white hover:scale-105"}`,style:{backgroundColor:a.hex},title:a.name},a.hex))})]})]})]}),e.jsxs("div",{className:"relative w-full h-56 sm:h-64 bg-[#FAF8F5] border-2 border-dashed border-[#D9D0BC] rounded-3xl overflow-hidden shadow-inner focus-within:border-[#8C6B1C]",children:[e.jsx("canvas",{ref:r,className:"w-full h-full touch-none cursor-crosshair",onMouseDown:D,onMouseMove:F,onMouseUp:v,onMouseLeave:v,onTouchStart:D,onTouchMove:F,onTouchEnd:v}),!s&&e.jsxs("div",{className:"absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4",children:[e.jsx("div",{className:"w-12 h-12 rounded-full bg-[#EFE9DC] flex items-center justify-center text-[#8C6B1C] mb-2 shadow-inner",children:e.jsx(C,{className:"w-6 h-6 stroke-[1.75]"})}),e.jsx("p",{className:"text-xs sm:text-sm font-semibold text-[#5C5546]",children:"Gunakan Mouse atau Layar Sentuh di Sini"}),e.jsx("p",{className:"text-[11px] text-[#A0988A] mt-0.5",children:"Pilih mode Kuas / Pulpen di atas untuk menyesuaikan goresan"})]})]}),e.jsxs("div",{className:"bg-[#FAF5EA] border border-[#EADBBD] rounded-xl p-2.5 flex items-center justify-between text-xs",children:[e.jsx("span",{className:"text-[#7C7365]",children:"Nama Tertanda:"}),e.jsx("span",{className:"font-bold text-[#2C2416]",children:k})]})]}),e.jsxs("div",{className:"p-4 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-2.5",children:[e.jsx(p,{type:"button",variant:"outline",onClick:m,className:"h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold",children:"Batal"}),e.jsxs(p,{type:"button",disabled:!s,onClick:R,className:"h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5",children:[e.jsx(I,{className:"w-4 h-4 stroke-[3]"}),e.jsx("span",{children:"Simpan Tanda Tangan"})]})]})]})}):null}function te({isOpen:x,onClose:m,onAccept:f}){const[u,k]=i.useState(null),[r,h]=i.useState(!1);if(i.useEffect(()=>{x&&(h(!0),L().then(s=>{s.booking_terms&&s.booking_terms.trim().length>0&&k(s.booking_terms)}).catch(()=>{}).finally(()=>h(!1)))},[x]),!x)return null;const b=()=>{const s=document.createElement("iframe");s.style.position="fixed",s.style.right="0",s.style.bottom="0",s.style.width="0",s.style.height="0",s.style.border="0",document.body.appendChild(s);const l=s.contentWindow?.document;if(!l){window.print();return}const o=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Surat Persetujuan Tindakan Medis - Aesthetic Pondok Indah</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 18mm 16mm 18mm 16mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
              color: #1a1a1a;
              line-height: 1.55;
              margin: 0;
              padding: 0;
              font-size: 10.5pt;
              background: #fff;
            }
            .letterhead {
              border-bottom: 2.5px solid #8C6B1C;
              padding-bottom: 12px;
              margin-bottom: 18px;
              text-align: center;
            }
            .letterhead-title {
              font-size: 16pt;
              font-weight: 800;
              color: #8C6B1C;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .letterhead-subtitle {
              font-size: 11pt;
              font-weight: 700;
              color: #2C2416;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .letterhead-contact {
              font-size: 8.5pt;
              color: #555;
              line-height: 1.35;
            }
            .doc-header {
              text-align: center;
              margin-bottom: 18px;
            }
            .doc-title {
              font-size: 12pt;
              font-weight: 800;
              text-transform: uppercase;
              color: #111;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            .doc-ref {
              font-size: 8.5pt;
              color: #777;
              font-family: monospace;
            }
            .section-title {
              font-weight: 700;
              font-size: 10pt;
              margin-top: 12px;
              margin-bottom: 3px;
              color: #111;
            }
            p {
              margin: 0 0 8px 0;
              text-align: justify;
              font-size: 9.5pt;
              color: #333;
            }
            .custom-terms {
              background: #faf8f5;
              border: 1px solid #eadbbd;
              border-radius: 6px;
              padding: 10px 14px;
              margin: 12px 0;
              font-size: 9pt;
              white-space: pre-line;
            }
            .footer-sign {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px dashed #bbb;
              display: flex;
              justify-content: space-between;
              font-size: 8.5pt;
              color: #555;
            }
            .seal-badge {
              font-weight: 700;
              color: #047857;
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="letterhead-title">Aesthetic Pondok Indah</div>
            <div class="letterhead-subtitle">Klinik Gigi & Estetika Medis</div>
            <div class="letterhead-contact">
              Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br/>
              Telepon: (021) 765-4321 • WhatsApp: +62 811-9876-5432 • Web: aestheticpondokindah.com
            </div>
          </div>

          <div class="doc-header">
            <div class="doc-title">Surat Persetujuan Tindakan Medis & Ketentuan Layanan</div>
            <div class="doc-ref">Nomor Dokumen: SK-CONSENT-2026/REV-03 • Lembar Informed Consent Resmi</div>
          </div>

          ${u?`
            <div class="custom-terms">
              <strong>Ketentuan Khusus Operasional Klinik:</strong><br/>
              ${u}
            </div>
          `:""}

          <div class="section-title">1. Ketentuan Kedatangan & Registrasi Pasien</div>
          <p>Pasien diwajibkan hadir di klinik sekurang-kurangnya 15 menit sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.</p>

          <div class="section-title">2. Kebijakan Keterlambatan & Penjadwalan Ulang</div>
          <p>Apabila pasien mengalami keterlambatan lebih dari 15 menit dari jadwal yang telah ditentukan tanpa pemberitahuan sebelumnya, pihak klinik berhak mengalihkan antrean kepada pasien berikutnya atau menjadwalkan ulang demi kenyamanan bersama. Permintaan perubahan jadwal dapat dilakukan bebas biaya dengan menghubungi petugas administrasi selambat-lambatnya 1 x 24 jam sebelum jadwal tindakan.</p>

          <div class="section-title">3. Persetujuan Tindakan Medis</div>
          <p>Dengan menyetujui dan menandatangani lembar persetujuan ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis, tindakan diagnostik (termasuk foto rontgen gigi bila diperlukan), serta prosedur perawatan yang telah dijelaskan manfaat dan risikonya.</p>

          <div class="section-title">4. Kerahasiaan Rekam Medis & Privasi Pasien</div>
          <p>Seluruh data rekam medis elektronik, riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia.</p>

          <div class="section-title">5. Pembayaran & Kebijakan Pembatalan</div>
          <p>Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer perbankan yang telah diverifikasi oleh kasir klinik. Pembatalan sepihak saat hari H tanpa alasan medis darurat dapat memengaruhi kuota prioritas booking berikutnya.</p>

          <div class="footer-sign">
            <div>
              <span class="seal-badge">✓ Dokumen Digital Tersertifikasi & Sah Secara Hukum Medikolegal</span><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan
            </div>
            <div style="text-align: right;">
              Dicetak pada: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}<br/>
              Status: Disetujui Pasien
            </div>
          </div>
        </body>
      </html>
    `;l.open(),l.write(o),l.close(),setTimeout(()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(()=>{document.body.contains(s)&&document.body.removeChild(s)},1500)},300)};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",children:e.jsxs("div",{className:"relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left my-auto",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-2xs",children:e.jsx(J,{className:"w-4.5 h-4.5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base sm:text-lg font-bold font-display text-[#2C2416]",children:"Syarat & Ketentuan Reservasi"}),e.jsx("p",{className:"text-xs text-[#7C7365]",children:"Dokumen Resmi Informed Consent & Kebijakan Klinik"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(p,{type:"button",variant:"outline",onClick:b,className:"h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer",title:"Cetak / Simpan PDF Resmi",children:[e.jsx(H,{className:"w-3.5 h-3.5"}),e.jsx("span",{className:"hidden sm:inline",children:"Cetak PDF"})]}),e.jsx("button",{type:"button",onClick:m,className:"w-9 h-9 rounded-xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all shadow-2xs cursor-pointer",title:"Tutup",children:e.jsx(A,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FAF8F5]",children:e.jsxs("div",{className:"bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#2C2416]",children:[e.jsxs("div",{className:"border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 text-[#8C6B1C] font-bold text-xs uppercase tracking-widest",children:[e.jsx(U,{className:"w-4 h-4"}),e.jsx("span",{children:"Aesthetic Pondok Indah Dental Clinic"})]}),e.jsx("h2",{className:"text-lg sm:text-xl font-bold font-display tracking-tight text-[#2C2416]",children:"SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK"}),e.jsx("p",{className:"text-xs text-[#7C7365]",children:"Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310 • Telp: (021) 765-4321 • WhatsApp: +62 811-9876-5432"}),e.jsxs("div",{className:"text-[11px] text-[#8C8272] pt-1",children:["Ref. Dokumen: ",e.jsx("span",{className:"font-mono font-semibold",children:"SK-CONSENT-2026/REV-03"})]})]}),u?e.jsxs("div",{className:"space-y-3 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4",children:[e.jsx("div",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wider",children:"Ketentuan Khusus Operasional:"}),u]}):null,e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#443E33] leading-relaxed",children:[e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"1. Ketentuan Kedatangan & Registrasi Pasien"}),e.jsxs("p",{children:["Pasien diwajibkan hadir di klinik sekurang-kurangnya ",e.jsx("strong",{children:"15 menit"})," sebelum waktu jadwal reservasi yang telah disepakati untuk verifikasi identitas dan registrasi ulang."]})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"2. Kebijakan Keterlambatan & Penjadwalan Ulang"}),e.jsxs("p",{children:["Keterlambatan lebih dari 15 menit tanpa konfirmasi dapat menyebabkan antrean dialihkan. Penjadwalan ulang bebas biaya maksimal ",e.jsx("strong",{children:"1 x 24 jam"})," sebelum jadwal tindakan."]})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"3. Persetujuan Tindakan Medis"}),e.jsx("p",{children:"Pasien memberikan wewenang kepada dokter spesialis untuk melakukan pemeriksaan klinis, diagnostik rontgen jika diperlukan, serta prosedur perawatan yang disepakati."})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"4. Kerahasiaan Rekam Medis & Privasi Pasien"}),e.jsx("p",{children:"Seluruh data rekam medis elektronik dan riwayat kesehatan pasien dilindungi kerahasiaannya sesuai regulasi perundang-undangan kesehatan Republik Indonesia."})]})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6] text-xs sm:text-sm text-[#443E33]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"5. Pembayaran & Kebijakan Pembatalan"}),e.jsx("p",{children:"Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer bank resmi kasir klinik. Pembatalan sepihak hari H tanpa alasan darurat dapat memengaruhi kuota booking prioritas."})]}),e.jsxs("div",{className:"pt-4 border-t border-[#EDE5D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C7365]",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-emerald-700 font-semibold",children:[e.jsx($,{className:"w-4 h-4"}),e.jsx("span",{children:"Dokumen Digital Tersertifikasi & Sah Secara Hukum Medikolegal"})]}),e.jsx("span",{className:"text-[#A0988A]",children:"Terakhir diperbarui: Agustus 2026"})]})]})}),e.jsxs("div",{className:"p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3",children:[e.jsx(p,{type:"button",variant:"outline",onClick:m,className:"h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold cursor-pointer",children:"Tutup"}),e.jsx(p,{type:"button",onClick:()=>{f(),m()},className:"h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer",children:"Saya Telah Membaca & Setuju"})]})]})})}export{ee as C,ae as D,te as T};
