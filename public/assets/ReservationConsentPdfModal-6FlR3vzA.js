import{c as v,A as K,r as p,j as e,B as o,X as y,C as N,U as S,S as R}from"./index-CrMu671z.js";import{D as w,a as C,b as A,e as D}from"./dialog-DXKlD1LN.js";import{F as E}from"./file-text-C-M8ary7.js";import{B as P}from"./building-2-Dlc5BBcY.js";import{S as B}from"./shield-check-YLZXhXMR.js";import{S as L}from"./sparkles-B6nAHsUP.js";import{C as M}from"./message-square-CzJxOzGz.js";import{C as z}from"./shield-Cs6QSAtG.js";const $=[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]],V=v("message-circle",$);const J=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],g=v("printer",J);async function T(){const i=await fetch(`${K}/public/settings`,{headers:{Accept:"application/json"}});return i.ok?i.json():{}}function X({isOpen:i,onClose:n,onAccept:d,showAcceptButton:r=!1}){const[b,l]=p.useState(null),[k,c]=p.useState(!1);p.useEffect(()=>{i&&(c(!0),T().then(a=>{a.booking_terms&&a.booking_terms.trim().length>0&&l(a.booking_terms)}).catch(()=>{}).finally(()=>c(!1)))},[i]);const m=()=>{const a=document.createElement("iframe");a.style.position="fixed",a.style.right="0",a.style.bottom="0",a.style.width="0",a.style.height="0",a.style.border="0",document.body.appendChild(a);const s=a.contentWindow?.document;if(!s){window.print();return}const x=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Syarat dan Ketentuan Layanan Pasien - Aesthetic Pondok Indah</title>
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
              line-height: 1.6;
              margin: 0;
              padding: 0;
              font-size: 10pt;
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
            .doc-number {
              font-size: 8.5pt;
              color: #666;
            }
            .section {
              margin-bottom: 14px;
            }
            .section-title {
              font-weight: 700;
              font-size: 10.5pt;
              color: #8C6B1C;
              border-bottom: 1px solid #E8DFC8;
              padding-bottom: 3px;
              margin-bottom: 6px;
            }
            .section p, .section li {
              font-size: 9.5pt;
              color: #333;
              margin: 4px 0;
              text-align: justify;
            }
            ol {
              padding-left: 18px;
              margin: 4px 0;
            }
            .footer-info {
              margin-top: 24px;
              border-top: 1px dashed #ccc;
              padding-top: 10px;
              font-size: 8pt;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="letterhead-title">AESTHETIC PONDOK INDAH</div>
            <div class="letterhead-subtitle">DENTAL CLINIC & IMPLANT CENTER</div>
            <div class="letterhead-contact">
              Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br/>
              Telepon: (021) 765-4321 | WhatsApp Layanan Pasien: 0812-3456-7890 | Website: https://aestheticpondokindah.web.id
            </div>
          </div>

          <div class="doc-header">
            <div class="doc-title">SYARAT DAN KETENTUAN LAYANAN PASIEN</div>
            <div class="doc-number">DOKUMEN KEBIJAKAN OPERASIONAL & PERJANJIAN LAYANAN KLINIK</div>
          </div>

          <div class="section">
            <div class="section-title">1. KETENTUAN UMUM & PENDAFTARAN LAYANAN</div>
            <ol>
              <li>Seluruh reservasi konsultasi dan tindakan medis gigi di Aesthetic Pondok Indah Dental Clinic wajib didaftarkan melalui platform reservasi resmi klinik atau bagian resepsionis.</li>
              <li>Pasien atau wali sah wajib memberikan data identitas diri, nomor kontak aktif, serta riwayat medis yang akurat dan dapat dipertanggungjawabkan.</li>
              <li>Klinik berhak memverifikasi identitas pasien saat kedatangan untuk keperluan administrasi dan rekam medis elektronik.</li>
            </ol>
          </div>

          <div class="section">
            <div class="section-title">2. KETENTUAN PENJADWALAN, KEDATANGAN & RESCHEDULE</div>
            <ol>
              <li>Pasien diharapkan hadir di klinik minimal 15 (lima belas) menit sebelum estimasi jam tindakan untuk proses registrasi dan pengecekan awal.</li>
              <li>Keterlambatan lebih dari 20 menit dari waktu jadwal yang telah dikonfirmasi dapat mengakibatkan penyesuaian durasi perawatan atau penjadwalan ulang (*reschedule*) demi kenyamanan antrean pasien berikutnya.</li>
              <li>Permohonan perubahan jadwal (*reschedule*) dapat dilakukan maksimal 4 (empat) jam sebelum jadwal tindakan melalui sistem atau staf klinik.</li>
            </ol>
          </div>

          <div class="section">
            <div class="section-title">3. TATA TERTIB & PROSEDUR MEDIS KLINIK</div>
            <ol>
              <li>Sebelum tindakan medis dilakukan, dokter gigi yang bertugas akan melakukan pemeriksaan klinis dan menjelaskan rencana perawatan, indikasi, serta estimasi biaya.</li>
              <li>Tindakan medis invasif, bedah minor, restorasi lanjutan, dan estetik memerlukan penandatanganan <strong>Surat Pernyataan dan Persetujuan Pasien (Informed Consent)</strong> yang sah.</li>
              <li>Pasien wajib mematuhi seluruh instruksi pra-tindakan dan pasca-tindakan yang diberikan oleh dokter gigi demi efektivitas dan keamanan hasil perawatan.</li>
            </ol>
          </div>

          <div class="section">
            <div class="section-title">4. KEBIJAKAN PEMBAYARAN & JAMINAN LAYANAN</div>
            <ol>
              <li>Pembayaran tagihan tindakan dapat dilakukan secara tunai, kartu debit/kredit, transfer bank, maupun metode pembayaran digital resmi yang disediakan klinik.</li>
              <li>Setiap perawatan bergaransi (seperti pemasangan veneer porselen atau implan tertentu) tunduk pada syarat kontrol berkala sesuai rekomendasi dokter penanggung jawab.</li>
            </ol>
          </div>

          <div class="section">
            <div class="section-title">5. KERAHASIAAN DATA PRIBADI & REKAM MEDIS</div>
            <ol>
              <li>Aesthetic Pondok Indah menjamin kerahasiaan data pribadi dan rekam medis pasien sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia.</li>
              <li>Dokumentasi klinis (foto gigi intraoral/ekstraoral dan rontgen panoramic) digunakan secara ketat untuk kepentingan diagnosis medis dan rekam jejak kesehatan gigi pasien.</li>
            </ol>
          </div>

          <div class="footer-info">
            Dokumen Syarat dan Ketentuan Layanan Pasien ini berlaku secara resmi di seluruh unit layanan Aesthetic Pondok Indah Dental Clinic.<br/>
            Dicetak secara elektronik pada: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} | Dokumen Resmi Sistem Reservasi Terpadu
          </div>
        </body>
      </html>
    `;s.open(),s.write(x),s.close(),setTimeout(()=>{a.contentWindow?.focus(),a.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(a)},1e3)},350)};return e.jsx(w,{open:i,onOpenChange:a=>!a&&n(),children:e.jsxs(C,{className:"w-[95vw] max-w-4xl lg:max-w-4xl xl:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8] rounded-t-3xl shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner",children:e.jsx(E,{className:"w-5 h-5 text-[#8C6B1C]"})}),e.jsxs("div",{children:[e.jsx(A,{className:"text-base sm:text-lg font-bold text-[#2C2416]",children:"Dokumen Syarat & Ketentuan Layanan Pasien"}),e.jsx(D,{className:"text-xs text-[#8C8272]",children:"Kebijakan operasional, aturan penjadwalan, tata tertib, dan perlindungan privasi klinik."})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(o,{type:"button",onClick:m,className:"h-9 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer",children:[e.jsx(g,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Cetak / Simpan PDF"})]}),e.jsx("button",{onClick:n,className:"w-8 h-8 rounded-full bg-[#F5ECE0] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors cursor-pointer",children:e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EDE5D6]/30",children:e.jsxs("div",{className:"max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-[#E0D7C4] text-[#2C2416] space-y-6",children:[e.jsxs("div",{className:"border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 text-[#8C6B1C]",children:[e.jsx(P,{className:"w-5 h-5"}),e.jsx("h1",{className:"text-lg sm:text-xl font-black uppercase tracking-wider",children:"Aesthetic Pondok Indah"})]}),e.jsx("p",{className:"text-xs sm:text-sm font-bold text-[#4A3F35]",children:"DENTAL CLINIC & IMPLANT CENTER"}),e.jsxs("p",{className:"text-[11px] text-[#7A6E60] leading-relaxed",children:["Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",e.jsx("br",{}),"Telepon: (021) 765-4321 | WhatsApp Layanan: 0812-3456-7890 | Website: https://aestheticpondokindah.web.id"]})]}),e.jsxs("div",{className:"text-center space-y-1 py-1 bg-[#FAF8F5] rounded-xl border border-[#EDE5D6] p-3",children:[e.jsx("h2",{className:"text-sm sm:text-base font-extrabold uppercase text-[#2C2416] tracking-wide",children:"Syarat dan Ketentuan Layanan Pasien"}),e.jsx("p",{className:"text-[11px] text-[#8C6B1C] font-semibold",children:"DOKUMEN KEBIJAKAN OPERASIONAL & PERJANJIAN LAYANAN KLINIK"})]}),e.jsxs("div",{className:"space-y-4 text-xs sm:text-sm leading-relaxed text-[#3D332A]",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"1. Ketentuan Umum & Pendaftaran Layanan"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Seluruh reservasi konsultasi dan tindakan medis gigi di Aesthetic Pondok Indah Dental Clinic wajib didaftarkan melalui platform reservasi resmi klinik atau bagian resepsionis."}),e.jsx("li",{children:"Pasien atau wali sah wajib memberikan data identitas diri, nomor kontak aktif, serta riwayat medis yang akurat dan dapat dipertanggungjawabkan."}),e.jsx("li",{children:"Klinik berhak memverifikasi identitas pasien saat kedatangan untuk keperluan administrasi dan rekam medis elektronik."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"2. Ketentuan Penjadwalan, Kedatangan & Reschedule"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Pasien diharapkan hadir di klinik minimal 15 (lima belas) menit sebelum estimasi jam tindakan untuk proses registrasi dan pengecekan awal."}),e.jsx("li",{children:"Keterlambatan lebih dari 20 menit dari waktu jadwal yang telah dikonfirmasi dapat mengakibatkan penyesuaian durasi perawatan atau penjadwalan ulang (*reschedule*) demi kenyamanan antrean pasien berikutnya."}),e.jsx("li",{children:"Permohonan perubahan jadwal (*reschedule*) dapat dilakukan maksimal 4 (empat) jam sebelum jadwal tindakan melalui sistem atau staf klinik."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"3. Tata Tertib & Prosedur Medis Klinik"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Sebelum tindakan medis dilakukan, dokter gigi yang bertugas akan melakukan pemeriksaan klinis dan menjelaskan rencana perawatan, indikasi, serta estimasi biaya."}),e.jsxs("li",{children:["Tindakan medis invasif, bedah minor, restorasi lanjutan, dan estetik memerlukan penandatanganan ",e.jsx("strong",{children:"Surat Pernyataan dan Persetujuan Pasien (Informed Consent)"})," yang sah."]}),e.jsx("li",{children:"Pasien wajib mematuhi seluruh instruksi pra-tindakan dan pasca-tindakan yang diberikan oleh dokter gigi demi efektivitas dan keamanan hasil perawatan."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"4. Kebijakan Pembayaran & Jaminan Layanan"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Pembayaran tagihan tindakan dapat dilakukan secara tunai, kartu debit/kredit, transfer bank, maupun metode pembayaran digital resmi yang disediakan klinik."}),e.jsx("li",{children:"Setiap perawatan bergaransi (seperti pemasangan veneer porselen atau implan tertentu) tunduk pada syarat kontrol berkala sesuai rekomendasi dokter penanggung jawab."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"5. Kerahasiaan Data Pribadi & Rekam Medis"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Aesthetic Pondok Indah menjamin kerahasiaan data pribadi dan rekam medis pasien sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia."}),e.jsx("li",{children:"Dokumentasi klinis (foto gigi intraoral/ekstraoral dan rontgen panoramic) digunakan secara ketat untuk kepentingan diagnosis medis dan rekam jejak kesehatan gigi pasien."})]})]})]}),e.jsxs("div",{className:"pt-4 border-t border-[#E8DFC8] text-center text-[11px] text-[#7A6E60] space-y-1",children:[e.jsx("p",{className:"font-semibold text-[#8C6B1C]",children:"Aesthetic Pondok Indah Dental Clinic — Standar Pelayanan & Keselamatan Pasien Terakreditasi"}),e.jsx("p",{children:"Dokumen ini merupakan standar resmi syarat & ketentuan layanan klinik yang berlaku mengikat bagi seluruh pasien terdaftar."})]})]})}),e.jsxs("div",{className:"px-6 py-4 bg-white border-t border-[#E8DFC8] rounded-b-3xl flex items-center justify-between gap-3 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs text-[#8C8272]",children:[e.jsx(B,{className:"w-4 h-4 text-emerald-600 shrink-0"}),e.jsx("span",{children:"Dokumen Syarat & Ketentuan Resmi Terverifikasi"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(o,{type:"button",variant:"outline",onClick:n,className:"h-9 px-4 rounded-xl border-[#D9D0BC] text-[#4A3F35] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer",children:"Tutup"}),r&&d&&e.jsxs(o,{type:"button",onClick:()=>{d(),n()},className:"h-9 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer",children:[e.jsx(N,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Saya Menyetujui Syarat & Ketentuan"})]})]})]})]})})}function Z({isOpen:i,onClose:n,bookingCode:d,patientName:r,patientPhone:b,isGuest:l,serviceName:k,doctorName:c,dateStr:m,timeStr:a,signatureData:s,acceptedAt:x}){const[h,F]=p.useState(null);if(p.useEffect(()=>{i&&T().then(t=>{t.booking_terms&&t.booking_terms.trim().length>0&&F(t.booking_terms)}).catch(()=>{})},[i]),!i)return null;const j=x?new Date(x).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}):`${m}, ${a}`,f=()=>{const t=document.createElement("iframe");t.style.position="fixed",t.style.right="0",t.style.bottom="0",t.style.width="0",t.style.height="0",t.style.border="0",document.body.appendChild(t);const u=t.contentWindow?.document;if(!u){window.print();return}const I=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Surat Persetujuan Tindakan Medis - ${d}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 16mm 14mm 16mm 14mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
              color: #1a1a1a;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              font-size: 10pt;
              background: #fff;
            }
            .letterhead {
              border-bottom: 2.5px solid #8C6B1C;
              padding-bottom: 10px;
              margin-bottom: 14px;
              text-align: center;
            }
            .letterhead-title {
              font-size: 15pt;
              font-weight: 800;
              color: #8C6B1C;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .letterhead-subtitle {
              font-size: 10.5pt;
              font-weight: 700;
              color: #2C2416;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            .letterhead-contact {
              font-size: 8.5pt;
              color: #555;
              line-height: 1.35;
            }
            .doc-header {
              text-align: center;
              margin-bottom: 14px;
            }
            .doc-title {
              font-size: 11.5pt;
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
            .meta-box {
              background: #faf8f5;
              border: 1px solid #eadbbd;
              border-radius: 8px;
              padding: 10px 14px;
              margin-bottom: 14px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 9pt;
            }
            .meta-item {
              margin-bottom: 3px;
            }
            .meta-label {
              color: #666;
              font-weight: 600;
            }
            .meta-value {
              font-weight: 700;
              color: #2c2416;
            }
            .section-title {
              font-weight: 700;
              font-size: 9.5pt;
              margin-top: 10px;
              margin-bottom: 2px;
              color: #111;
            }
            p {
              margin: 0 0 6px 0;
              text-align: justify;
              font-size: 9pt;
              color: #333;
            }
            .custom-terms {
              background: #faf8f5;
              border: 1px solid #eadbbd;
              border-radius: 6px;
              padding: 8px 12px;
              margin: 10px 0;
              font-size: 8.5pt;
              white-space: pre-line;
            }
            .footer-grid {
              margin-top: 16px;
              padding-top: 10px;
              border-top: 1.5px solid #2C2416;
              display: grid;
              grid-template-columns: 1fr 200px;
              gap: 16px;
              align-items: end;
            }
            .seal-box {
              font-size: 8.5pt;
              color: #555;
            }
            .seal-badge {
              font-weight: 700;
              color: #047857;
            }
            .signature-box {
              border: 1px solid #d9d0bc;
              border-radius: 8px;
              padding: 8px;
              background: #faf8f5;
              text-align: center;
            }
            .signature-box img {
              max-height: 55px;
              max-width: 100%;
              object-contain: contain;
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
            <div class="doc-title">Surat Persetujuan Tindakan Medis & Kebijakan Reservasi</div>
            <div class="doc-ref">Nomor Dokumen: SK-CONSENT-${d} • Lembar Informed Consent Resmi</div>
          </div>

          <div class="meta-box">
            <div>
              <div class="meta-item"><span class="meta-label">Nama Pasien:</span> <span class="meta-value">${r}</span> (${l?"Guest":"Member"})</div>
              <div class="meta-item"><span class="meta-label">No. Telepon/WA:</span> <span class="meta-value">${b||"-"}</span></div>
              <div class="meta-item"><span class="meta-label">Layanan Tindakan:</span> <span class="meta-value">${k}</span></div>
            </div>
            <div>
              <div class="meta-item"><span class="meta-label">Dokter Bertugas:</span> <span class="meta-value">${c}</span></div>
              <div class="meta-item"><span class="meta-label">Jadwal Praktik:</span> <span class="meta-value">${m} • ${a}</span></div>
              <div class="meta-item"><span class="meta-label">Waktu Disetujui:</span> <span class="meta-value">${j}</span></div>
            </div>
          </div>

          ${h?`
            <div class="custom-terms">
              <strong>Ketentuan Khusus Operasional Klinik:</strong><br/>
              ${h}
            </div>
          `:""}

          <div class="section-title">1. Ketentuan Kedatangan & Registrasi Pasien</div>
          <p>Pasien diwajibkan hadir di klinik sekurang-kurangnya 15 (lima belas) menit sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.</p>

          <div class="section-title">2. Kebijakan Keterlambatan & Penjadwalan Ulang (Reschedule)</div>
          <p>Apabila pasien mengalami keterlambatan lebih dari 15 menit tanpa pemberitahuan sebelumnya, pihak klinik berhak mengalihkan antrean demi kelancaran operasional. Penjadwalan ulang dapat dilakukan bebas biaya dengan menghubungi petugas administrasi selambat-lambatnya 1 x 24 jam sebelum jadwal tindakan.</p>

          <div class="section-title">3. Persetujuan Tindakan Medis (Informed Consent)</div>
          <p>Dengan menyetujui dan menandatangani lembar ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis, tindakan diagnostik (termasuk foto rontgen gigi bila diperlukan), serta prosedur perawatan yang telah dijelaskan manfaat dan risikonya.</p>

          <div class="section-title">4. Kerahasiaan Rekam Medis & Privasi Pasien</div>
          <p>Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai dengan regulasi perundang-undangan kesehatan Republik Indonesia.</p>

          <div class="section-title">5. Pembayaran & Kebijakan Pembatalan</div>
          <p>Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer bank kasir klinik. Pembatalan sepihak saat hari H tanpa alasan darurat medis dapat memengaruhi kuota prioritas reservasi berikutnya.</p>

          <div class="footer-grid">
            <div class="seal-box">
              <span class="seal-badge">✓ Dokumen Digital Tersertifikasi & Sah Secara Medikolegal</span><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan<br/>
              <span style="font-size: 8pt; color: #888;">Dicetak pada: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB</span>
            </div>

            <div class="signature-box">
              <div style="font-size: 8pt; font-weight: 700; color: #8C6B1C; margin-bottom: 4px; text-transform: uppercase;">
                Tanda Tangan Pasien
              </div>
              ${s?`
                <img src="${s}" alt="Tanda Tangan ${r}" />
              `:`
                <div style="font-size: 8pt; font-weight: 700; color: #047857; padding: 12px 0;">✓ Disetujui Digital</div>
              `}
              <div style="font-size: 8.5pt; font-weight: 700; text-decoration: underline; margin-top: 4px;">${r}</div>
              <div style="font-size: 7.5pt; color: #666;">${l?"Guest User":"Pasien Terdaftar"}</div>
            </div>
          </div>
        </body>
      </html>
    `;u.open(),u.write(I),u.close(),setTimeout(()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},1500)},300)};return e.jsx(w,{open:i,onOpenChange:t=>!t&&n(),children:e.jsxs(C,{showCloseButton:!1,className:"w-[95vw] max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-white border border-[#EADBBD] shadow-2xl overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5] shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-xs",children:e.jsx(E,{className:"w-5 h-5 text-[#8C6B1C]"})}),e.jsxs("div",{children:[e.jsx(A,{className:"text-base sm:text-lg font-bold font-display text-[#2C2416]",children:"Dokumen Persetujuan & Kebijakan Reservasi"}),e.jsxs(D,{className:"text-xs text-[#7C7365] mt-0.5",children:["Surat Informed Consent Resmi Pasien #",d]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(o,{type:"button",onClick:f,variant:"outline",className:"h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer",title:"Cetak Dokumen Resmi",children:[e.jsx(g,{className:"w-4 h-4"}),e.jsx("span",{children:"Cetak / Simpan PDF"})]}),e.jsx("button",{type:"button",onClick:n,className:"w-9 h-9 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs cursor-pointer",title:"Tutup",children:e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FAF8F5]",children:e.jsxs("div",{className:"bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#2C2416]",children:[e.jsxs("div",{className:"border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 text-[#8C6B1C] font-bold text-xs uppercase tracking-widest",children:[e.jsx(P,{className:"w-4 h-4"}),e.jsx("span",{children:"Aesthetic Pondok Indah Dental Clinic"})]}),e.jsx("h2",{className:"text-lg sm:text-xl font-bold font-display tracking-tight text-[#2C2416]",children:"SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK"}),e.jsx("p",{className:"text-xs text-[#7C7365]",children:"Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310 • Telp: (021) 765-4321 • WhatsApp: +62 811-9876-5432"}),e.jsxs("div",{className:"text-[11px] text-[#8C8272] pt-1 flex items-center justify-center gap-4",children:[e.jsxs("span",{children:["Ref. Dokumen: ",e.jsxs("strong",{className:"font-mono font-semibold",children:["SK-CONSENT-",d]})]}),e.jsx("span",{children:"•"}),e.jsxs("span",{children:["Status: ",e.jsx("strong",{className:"text-emerald-700",children:"Tersertifikasi Digital"})]})]})]}),e.jsxs("div",{className:"bg-[#FAF8F5] border border-[#EADBBD] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(S,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Nama Pasien:"}),e.jsx("strong",{className:"text-[#2C2416]",children:r}),e.jsx("span",{className:"text-[10px] px-1.5 py-0.5 bg-white rounded border border-[#D9D0BC] text-[#8C6B1C] font-semibold",children:l?"Guest User":"Pasien Terdaftar"})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx("span",{children:"No. Telepon / WhatsApp:"}),e.jsx("strong",{className:"text-[#2C2416]",children:b||"-"})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(L,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Layanan yang Dipilih:"}),e.jsx("strong",{className:"text-[#2C2416]",children:k})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(R,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Dokter Spesialis:"}),e.jsx("strong",{className:"text-[#2C2416]",children:c})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(M,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Tanggal & Jam Praktik:"}),e.jsxs("strong",{className:"text-[#2C2416]",children:[m," • ",a]})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(z,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Waktu Persetujuan:"}),e.jsx("span",{className:"text-[#2C2416]",children:j})]})]})]}),h&&e.jsxs("div",{className:"space-y-2 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4",children:[e.jsx("div",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wider",children:"Ketentuan Khusus Operasional:"}),e.jsx("div",{className:"bg-[#FAF9F6] p-3 rounded-lg border border-[#EDE5D6]",children:h})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#443E33] leading-relaxed",children:[e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"1. Ketentuan Kedatangan & Registrasi Pasien"}),e.jsxs("p",{className:"text-xs text-[#555]",children:["Pasien diwajibkan hadir di klinik sekurang-kurangnya ",e.jsx("strong",{children:"15 (lima belas) menit"})," sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal."]})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"2. Kebijakan Keterlambatan & Penjadwalan Ulang"}),e.jsxs("p",{className:"text-xs text-[#555]",children:["Apabila pasien mengalami keterlambatan lebih dari 15 menit dari jadwal tanpa pemberitahuan, antrean dialihkan. Penjadwalan ulang (reschedule) bebas biaya dilakukan selambatnya ",e.jsx("strong",{children:"1 x 24 jam"})," sebelum jadwal."]})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"3. Persetujuan Tindakan Medis (Informed Consent)"}),e.jsx("p",{className:"text-xs text-[#555]",children:"Dengan membubuhkan tanda tangan digital pada lembar ini, pasien memberikan persetujuan kepada dokter gigi spesialis untuk pemeriksaan klinis, diagnostik rontgen bila diperlukan, dan perawatan yang disepakati."})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"4. Kerahasiaan Rekam Medis & Privasi Pasien"}),e.jsx("p",{className:"text-xs text-[#555]",children:"Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai regulasi hukum kesehatan Republik Indonesia."})]})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6] text-xs sm:text-sm text-[#443E33]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"5. Pembayaran & Kebijakan Pembatalan"}),e.jsx("p",{className:"text-xs text-[#555]",children:"Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer kasir klinik. Pembatalan sepihak hari H tanpa alasan medis darurat dapat memengaruhi kuota prioritas booking berikutnya."})]}),e.jsxs("div",{className:"pt-4 border-t-2 border-[#2C2416] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end",children:[e.jsxs("div",{className:"space-y-2 text-xs text-[#6B5E4F]",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-emerald-700 font-bold",children:[e.jsx(B,{className:"w-4 h-4 text-emerald-600"}),e.jsx("span",{children:"Lembar Persetujuan Sah Secara Medikolegal"})]}),e.jsx("p",{className:"text-[11px] text-[#7C7365] leading-relaxed",children:"Tanda tangan digital ini terekam melalui kanvas biometrik terenkripsi dan disimpan permanen pada sistem basis data rekam medis klinik."}),e.jsxs("div",{className:"text-[10px] text-[#8C8272] pt-1",children:["Dicetak pada: ",new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})," WIB"]})]}),e.jsxs("div",{className:"border border-[#D9D0BC] rounded-2xl p-4 bg-[#FAF8F5] text-center space-y-2",children:[e.jsx("p",{className:"text-[11px] font-semibold text-[#8C6B1C] uppercase tracking-wider",children:"Tanda Tangan Pasien / Wali Sah"}),e.jsx("div",{className:"w-full h-24 bg-white border border-[#D9D0BC] rounded-xl flex items-center justify-center p-2 shadow-inner",children:s?e.jsx("img",{src:s,alt:`Tanda Tangan ${r}`,className:"max-h-full max-w-full object-contain"}):e.jsxs("span",{className:"text-xs text-emerald-700 font-semibold flex items-center gap-1",children:[e.jsx(N,{className:"w-3.5 h-3.5"})," Disetujui Secara Digital"]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold text-[#2C2416] underline underline-offset-4",children:r}),e.jsx("p",{className:"text-[10px] text-[#7C7365] mt-0.5",children:l?"Pengunjung / Pasien Guest":"Member Terdaftar"})]})]})]})]})}),e.jsxs("div",{className:"p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3 shrink-0",children:[e.jsx(o,{type:"button",variant:"outline",onClick:n,className:"h-10 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer",children:"Tutup"}),e.jsxs(o,{type:"button",onClick:f,className:"h-10 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer",children:[e.jsx(g,{className:"w-4 h-4"}),e.jsx("span",{children:"Cetak / Unduh PDF"})]})]})]})})}export{V as M,g as P,Z as R,X as T,T as g};
