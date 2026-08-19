import{c as E,r as l,j as e,X as A,B as p}from"./index-B8ByqWGG.js";import{P as y,R as S}from"./rotate-ccw-CdYBy4kI.js";import{C as T}from"./check-seBBbAcA.js";import{g as K,P as R}from"./clinicSettingsApi-DFXR_N9n.js";import{F as M}from"./file-text-XE-3nhKQ.js";import{B as I}from"./message-circle-z7NxuZH6.js";import{S as z}from"./shield-check-BljiJAxT.js";const L=[["path",{d:"M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18",key:"16swn3"}],["path",{d:"M21 15.5V6a2 2 0 0 0-2-2H9.5",key:"yhw86o"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h7",key:"1wap6i"}],["path",{d:"M21 10h-5.5",key:"quycpq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],G=E("calendar-off",L);const U=[["path",{d:"m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21",key:"182aya"}],["path",{d:"M22 21H7",key:"t4ddhn"}],["path",{d:"m5 11 9 9",key:"1mo9qw"}]],H=E("eraser",U);function Y({isOpen:c,onClose:m,onSaveSignature:g,initialSignature:x,patientName:f="Pasien Aesthetic Pondok Indah"}){const i=l.useRef(null),[h,b]=l.useState(!1),[n,r]=l.useState(!1),[u,v]=l.useState("pen"),C="#1A1A1A",k=3;l.useEffect(()=>{if(!c)return;const t=setTimeout(()=>{const s=i.current;if(!s)return;const a=s.getContext("2d");if(!a)return;const o=s.getBoundingClientRect(),d=window.devicePixelRatio||1;if(s.width=o.width*d,s.height=o.height*d,a.scale(d,d),a.strokeStyle=C,a.lineWidth=k,a.lineCap="round",a.lineJoin="round",x){const w=new Image;w.onload=()=>{a.drawImage(w,0,0,o.width,o.height),r(!0)},w.src=x}},100);return()=>clearTimeout(t)},[c]);const N=t=>{const s=i.current;if(!s)return{x:0,y:0};const a=s.getBoundingClientRect();return"touches"in t&&t.touches.length>0?{x:t.touches[0].clientX-a.left,y:t.touches[0].clientY-a.top}:"clientX"in t?{x:t.clientX-a.left,y:t.clientY-a.top}:{x:0,y:0}},D=t=>{t.preventDefault();const s=i.current;if(!s)return;const a=s.getContext("2d");if(!a)return;a.strokeStyle=u==="eraser"?"#FAF8F5":C,a.lineWidth=u==="eraser"?k*4:k,a.lineCap="round",a.lineJoin="round";const{x:o,y:d}=N(t);a.beginPath(),a.moveTo(o,d),b(!0)},F=t=>{if(!h)return;t.preventDefault();const s=i.current;if(!s)return;const a=s.getContext("2d");if(!a)return;const{x:o,y:d}=N(t);a.lineTo(o,d),a.stroke(),r(!0)},j=()=>{h&&b(!1)},P=()=>{const t=i.current;if(!t)return;const s=t.getContext("2d");if(!s)return;const a=t.getBoundingClientRect();s.clearRect(0,0,a.width,a.height),r(!1)},B=()=>{const t=i.current;if(!t||!n)return;const s=t.toDataURL("image/png");g(s),m()};return c?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",children:e.jsxs("div",{className:"relative w-full max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left my-auto",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-2xs",children:e.jsx(y,{className:"w-4.5 h-4.5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base sm:text-lg font-bold font-display text-[#2C2416]",children:"Tanda Tangan Digital Pasien *"}),e.jsx("p",{className:"text-xs text-[#7C7365]",children:"Goreskan tanda tangan persetujuan resmi Anda pada canvas di bawah"})]})]}),e.jsx("button",{type:"button",onClick:m,className:"w-9 h-9 rounded-xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all shadow-2xs cursor-pointer",title:"Tutup",children:e.jsx(A,{className:"w-4 h-4"})})]}),e.jsxs("div",{className:"p-5 sm:p-6 space-y-4 overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-2.5 sm:px-3.5",children:[e.jsxs("div",{className:"flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#D9D0BC] shadow-2xs",children:[e.jsxs("button",{type:"button",onClick:()=>v("pen"),className:`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${u==="pen"?"bg-[#2C2416] text-white shadow-xs":"text-[#5C5546] hover:bg-[#FAF8F5]"}`,children:[e.jsx(y,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Pulpen"})]}),e.jsxs("button",{type:"button",onClick:()=>v("eraser"),className:`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${u==="eraser"?"bg-rose-600 text-white shadow-xs":"text-[#5C5546] hover:bg-[#FAF8F5]"}`,children:[e.jsx(H,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Penghapus"})]})]}),e.jsxs("button",{type:"button",onClick:P,className:"px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer",children:[e.jsx(S,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Hapus Canvas"})]})]}),e.jsxs("div",{className:"relative w-full h-64 sm:h-72 bg-[#FAF8F5] border-2 border-dashed border-[#D9D0BC] hover:border-[#8C6B1C] rounded-3xl overflow-hidden shadow-inner transition-all focus-within:border-[#8C6B1C]",children:[e.jsx("canvas",{ref:i,className:"w-full h-full touch-none cursor-crosshair",onMouseDown:D,onMouseMove:F,onMouseUp:j,onMouseLeave:j,onTouchStart:D,onTouchMove:F,onTouchEnd:j}),!n&&e.jsxs("div",{className:"absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4",children:[e.jsx("div",{className:"w-14 h-14 rounded-2xl bg-[#EFE9DC] flex items-center justify-center text-[#8C6B1C] mb-2.5 shadow-inner",children:e.jsx(y,{className:"w-7 h-7 stroke-[1.75]"})}),e.jsx("p",{className:"text-sm sm:text-base font-bold text-[#2C2416]",children:"Gunakan Mouse atau Layar Sentuh di Sini"}),e.jsx("p",{className:"text-xs text-[#7C7365] mt-0.5",children:"Tanda tangan otomatis tersimpan dengan tinta resmi hitam"})]})]}),e.jsxs("div",{className:"bg-[#FAF5EA] border border-[#EADBBD] rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm",children:[e.jsx("span",{className:"text-[#7C7365] font-medium",children:"Nama Tertanda:"}),e.jsx("span",{className:"font-bold text-[#2C2416]",children:f})]})]}),e.jsxs("div",{className:"p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3",children:[e.jsx(p,{type:"button",variant:"outline",onClick:m,className:"h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold cursor-pointer",children:"Batal"}),e.jsxs(p,{type:"button",disabled:!n,onClick:B,className:"h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50",children:[e.jsx(T,{className:"w-4 h-4 stroke-[3]"}),e.jsx("span",{children:"Simpan Tanda Tangan"})]})]})]})}):null}function O({isOpen:c,onClose:m,onAccept:g}){const[x,f]=l.useState(null),[i,h]=l.useState(!1);if(l.useEffect(()=>{c&&(h(!0),K().then(n=>{n.booking_terms&&n.booking_terms.trim().length>0&&f(n.booking_terms)}).catch(()=>{}).finally(()=>h(!1)))},[c]),!c)return null;const b=()=>{const n=document.createElement("iframe");n.style.position="fixed",n.style.right="0",n.style.bottom="0",n.style.width="0",n.style.height="0",n.style.border="0",document.body.appendChild(n);const r=n.contentWindow?.document;if(!r){window.print();return}const u=`
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

          ${x?`
            <div class="custom-terms">
              <strong>Ketentuan Khusus Operasional Klinik:</strong><br/>
              ${x}
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
    `;r.open(),r.write(u),r.close(),setTimeout(()=>{n.contentWindow?.focus(),n.contentWindow?.print(),setTimeout(()=>{document.body.contains(n)&&document.body.removeChild(n)},1500)},300)};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200",children:e.jsxs("div",{className:"relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left my-auto",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-2xs",children:e.jsx(M,{className:"w-4.5 h-4.5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base sm:text-lg font-bold font-display text-[#2C2416]",children:"Syarat & Ketentuan Reservasi"}),e.jsx("p",{className:"text-xs text-[#7C7365]",children:"Dokumen Resmi Informed Consent & Kebijakan Klinik"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(p,{type:"button",variant:"outline",onClick:b,className:"h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer",title:"Cetak / Simpan PDF Resmi",children:[e.jsx(R,{className:"w-3.5 h-3.5"}),e.jsx("span",{className:"hidden sm:inline",children:"Cetak PDF"})]}),e.jsx("button",{type:"button",onClick:m,className:"w-9 h-9 rounded-xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all shadow-2xs cursor-pointer",title:"Tutup",children:e.jsx(A,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FAF8F5]",children:e.jsxs("div",{className:"bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#2C2416]",children:[e.jsxs("div",{className:"border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 text-[#8C6B1C] font-bold text-xs uppercase tracking-widest",children:[e.jsx(I,{className:"w-4 h-4"}),e.jsx("span",{children:"Aesthetic Pondok Indah Dental Clinic"})]}),e.jsx("h2",{className:"text-lg sm:text-xl font-bold font-display tracking-tight text-[#2C2416]",children:"SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK"}),e.jsx("p",{className:"text-xs text-[#7C7365]",children:"Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310 • Telp: (021) 765-4321 • WhatsApp: +62 811-9876-5432"}),e.jsxs("div",{className:"text-[11px] text-[#8C8272] pt-1",children:["Ref. Dokumen: ",e.jsx("span",{className:"font-mono font-semibold",children:"SK-CONSENT-2026/REV-03"})]})]}),x?e.jsxs("div",{className:"space-y-3 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4",children:[e.jsx("div",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wider",children:"Ketentuan Khusus Operasional:"}),x]}):null,e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#443E33] leading-relaxed",children:[e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"1. Ketentuan Kedatangan & Registrasi Pasien"}),e.jsxs("p",{children:["Pasien diwajibkan hadir di klinik sekurang-kurangnya ",e.jsx("strong",{children:"15 menit"})," sebelum waktu jadwal reservasi yang telah disepakati untuk verifikasi identitas dan registrasi ulang."]})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"2. Kebijakan Keterlambatan & Penjadwalan Ulang"}),e.jsxs("p",{children:["Keterlambatan lebih dari 15 menit tanpa konfirmasi dapat menyebabkan antrean dialihkan. Penjadwalan ulang bebas biaya maksimal ",e.jsx("strong",{children:"1 x 24 jam"})," sebelum jadwal tindakan."]})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"3. Persetujuan Tindakan Medis"}),e.jsx("p",{children:"Pasien memberikan wewenang kepada dokter spesialis untuk melakukan pemeriksaan klinis, diagnostik rontgen jika diperlukan, serta prosedur perawatan yang disepakati."})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"4. Kerahasiaan Rekam Medis & Privasi Pasien"}),e.jsx("p",{children:"Seluruh data rekam medis elektronik dan riwayat kesehatan pasien dilindungi kerahasiaannya sesuai regulasi perundang-undangan kesehatan Republik Indonesia."})]})]}),e.jsxs("div",{className:"space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6] text-xs sm:text-sm text-[#443E33]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"5. Pembayaran & Kebijakan Pembatalan"}),e.jsx("p",{children:"Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer bank resmi kasir klinik. Pembatalan sepihak hari H tanpa alasan darurat dapat memengaruhi kuota booking prioritas."})]}),e.jsxs("div",{className:"pt-4 border-t border-[#EDE5D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C7365]",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-emerald-700 font-semibold",children:[e.jsx(z,{className:"w-4 h-4"}),e.jsx("span",{children:"Dokumen Digital Tersertifikasi & Sah Secara Hukum Medikolegal"})]}),e.jsx("span",{className:"text-[#A0988A]",children:"Terakhir diperbarui: Agustus 2026"})]})]})}),e.jsxs("div",{className:"p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3",children:[e.jsx(p,{type:"button",variant:"outline",onClick:m,className:"h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold cursor-pointer",children:"Tutup"}),e.jsx(p,{type:"button",onClick:()=>{g(),m()},className:"h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer",children:"Saya Telah Membaca & Setuju"})]})]})})}export{G as C,Y as D,O as T};
