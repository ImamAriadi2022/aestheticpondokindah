import{c as w,A as z,r as c,j as e,B as h,X as D,C as A,U,S as M}from"./index-C5Cvc0WB.js";import{D as P,a as E,b as T,f as B}from"./dialog-DfBgxf_H.js";import{F}from"./file-text-C0A1p_Gt.js";import{B as _}from"./building-2-FJ4c_CuD.js";import{S}from"./shield-check-DlXYIijE.js";import{S as W}from"./sparkles-DP0B7BzT.js";import{C as J}from"./message-square-J_liSmHg.js";import{C as O}from"./clock-PZKWk3Ri.js";const H=[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]],se=w("message-circle",H);const G=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],N=w("printer",G);const V=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],ie=w("rotate-ccw",V);async function K(){const n=await fetch(`${z}/public/settings`,{headers:{Accept:"application/json"}});return n.ok?n.json():{}}function ne({isOpen:n,onClose:l,onAccept:m,showAcceptButton:r=!1}){const[j,p]=c.useState(null),[i,g]=c.useState(null),[b,x]=c.useState(!1);c.useEffect(()=>{n&&(x(!0),K().then(t=>{t.pdf_terms_and_conditions&&g(t.pdf_terms_and_conditions),t.booking_terms&&t.booking_terms.trim().length>0&&p(t.booking_terms)}).catch(()=>{}).finally(()=>x(!1)))},[n]);const d=()=>{const t=document.createElement("iframe");t.style.position="fixed",t.style.right="0",t.style.bottom="0",t.style.width="0",t.style.height="0",t.style.border="0",document.body.appendChild(t);const o=t.contentWindow?.document;if(!o){window.print();return}const v=i?.kop?.logoWidth||75,a=i?.kop?.logoHeight||75,y=i?.sections&&i.sections.length>0?i.sections.map(u=>`
          <div class="section-title">${u.title}</div>
          <p>${u.content}</p>
        `).join(""):`
          <div class="section-title">1. Ketentuan Umum & Pendaftaran Layanan</div>
          <p>Seluruh reservasi konsultasi dan tindakan medis gigi di Aesthetic Pondok Indah Dental Clinic wajib didaftarkan melalui platform resmi klinik.</p>
          <div class="section-title">2. Ketentuan Penjadwalan, Kedatangan & Reschedule</div>
          <p>Pasien diharapkan hadir di klinik minimal 10 menit sebelum waktu janji temu yang telah dikonfirmasi.</p>
          <div class="section-title">3. Standar Pelayanan Medis & Keselamatan Pasien</div>
          <p>Seluruh tindakan perawatan gigi dan estetik dilakukan oleh dokter gigi spesialis berizin praktik resmi.</p>
          <div class="section-title">4. Kebijakan Pembayaran & Garansi Layanan</div>
          <p>Biaya tindakan disesuaikan dengan jenis perawatan dan bahan medis yang disetujui pasien sebelum tindakan.</p>
        `,k=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${i?.docTitle||"Syarat dan Ketentuan Layanan Pasien"} - Aesthetic Pondok Indah</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 16mm 14mm;
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
              gap: 16px;
              padding-bottom: 10px;
              margin-bottom: 14px;
              border-bottom: 3px double #111;
            }
            .kop-logo { flex-shrink: 0; }
            .kop-logo img { width: ${v}px; height: ${a}px; object-fit: contain; }
            .kop-details { text-align: center; flex: 1; }
            .kop-title { font-size: 13.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
            .kop-contact { font-size: 8.5pt; font-weight: 500; color: #222; margin-bottom: 2px; }
            .kop-contact a { color: #0056b3; text-decoration: underline; }
            .kop-address { font-size: 8pt; color: #333; line-height: 1.3; }

            .doc-header {
              text-align: center;
              margin-bottom: 14px;
            }
            .doc-title {
              font-size: 11pt;
              font-weight: 800;
              color: #111;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-sub {
              font-size: 8.5pt;
              color: #555;
              font-style: italic;
              margin-top: 1px;
            }
            .section-title {
              font-size: 9.5pt;
              font-weight: 700;
              color: #111;
              margin: 10px 0 2px 0;
            }
            p {
              margin: 0 0 6px 0;
              text-align: justify;
              color: #333;
              font-size: 8.8pt;
              line-height: 1.4;
            }
            .footer-info {
              margin-top: 20px;
              border-top: 1px dashed #bbb;
              padding-top: 8px;
              font-size: 7.5pt;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            ${i?.kop?.logoUrl?`<div class="kop-logo"><img src="${i.kop.logoUrl}" alt="Logo" /></div>`:""}
            <div class="kop-details">
              <div class="kop-title">${i?.kop?.clinicName||"PT NAVENA INTERNATIONAL GROUP"}</div>
              <div class="kop-contact">Phone: ${i?.kop?.phone||"+62 21 555 1900"} &nbsp; E-mail: <a>${i?.kop?.email||"navenainternationalgroup@gmail.com"}</a></div>
              <div class="kop-address">${i?.kop?.address||"Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan"}</div>
            </div>
          </div>

          <div class="doc-header">
            <div class="doc-title">${i?.docTitle||"SYARAT DAN KETENTUAN LAYANAN & PERAWATAN GIGI"}</div>
            <div class="doc-sub">${i?.docSubtitle||"Pedoman Resmi Pasien Aesthetic Pondok Indah"} (${i?.docVersion||"Versi 2.4 - Berlaku Resmi 2026"})</div>
          </div>

          ${y}

          <div class="footer-info">
            ${i?.footerNote||"Dokumen ini sah dan diterbitkan secara digital oleh Aesthetic Pondok Indah Dental Clinic."}<br/>
            Dicetak pada: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB
          </div>
        </body>
      </html>
    `;o.open(),o.write(k),o.close(),setTimeout(()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(t)},1e3)},350)};return e.jsx(P,{open:n,onOpenChange:t=>!t&&l(),children:e.jsxs(E,{className:"w-[95vw] max-w-4xl lg:max-w-4xl xl:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8] rounded-t-3xl shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner",children:e.jsx(F,{className:"w-5 h-5 text-[#8C6B1C]"})}),e.jsxs("div",{children:[e.jsx(T,{className:"text-base sm:text-lg font-bold text-[#2C2416]",children:"Dokumen Syarat & Ketentuan Layanan Pasien"}),e.jsx(B,{className:"text-xs text-[#8C8272]",children:"Kebijakan operasional, aturan penjadwalan, tata tertib, dan perlindungan privasi klinik."})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(h,{type:"button",onClick:d,className:"h-9 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer",children:[e.jsx(N,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Cetak / Simpan PDF"})]}),e.jsx("button",{onClick:l,className:"w-8 h-8 rounded-full bg-[#F5ECE0] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors cursor-pointer",children:e.jsx(D,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EDE5D6]/30",children:e.jsxs("div",{className:"max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-[#E0D7C4] text-[#2C2416] space-y-6",children:[e.jsxs("div",{className:"border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 text-[#8C6B1C]",children:[e.jsx(_,{className:"w-5 h-5"}),e.jsx("h1",{className:"text-lg sm:text-xl font-black uppercase tracking-wider",children:"Aesthetic Pondok Indah"})]}),e.jsx("p",{className:"text-xs sm:text-sm font-bold text-[#4A3F35]",children:"DENTAL CLINIC & IMPLANT CENTER"}),e.jsxs("p",{className:"text-[11px] text-[#7A6E60] leading-relaxed",children:["Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",e.jsx("br",{}),"Telepon: (021) 765-4321 | WhatsApp Layanan: 0812-3456-7890 | Website: https://aestheticpondokindah.web.id"]})]}),e.jsxs("div",{className:"text-center space-y-1 py-1 bg-[#FAF8F5] rounded-xl border border-[#EDE5D6] p-3",children:[e.jsx("h2",{className:"text-sm sm:text-base font-extrabold uppercase text-[#2C2416] tracking-wide",children:"Syarat dan Ketentuan Layanan Pasien"}),e.jsx("p",{className:"text-[11px] text-[#8C6B1C] font-semibold",children:"DOKUMEN KEBIJAKAN OPERASIONAL & PERJANJIAN LAYANAN KLINIK"})]}),e.jsxs("div",{className:"space-y-4 text-xs sm:text-sm leading-relaxed text-[#3D332A]",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"1. Ketentuan Umum & Pendaftaran Layanan"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Seluruh reservasi konsultasi dan tindakan medis gigi di Aesthetic Pondok Indah Dental Clinic wajib didaftarkan melalui platform reservasi resmi klinik atau bagian resepsionis."}),e.jsx("li",{children:"Pasien atau wali sah wajib memberikan data identitas diri, nomor kontak aktif, serta riwayat medis yang akurat dan dapat dipertanggungjawabkan."}),e.jsx("li",{children:"Klinik berhak memverifikasi identitas pasien saat kedatangan untuk keperluan administrasi dan rekam medis elektronik."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"2. Ketentuan Penjadwalan, Kedatangan & Reschedule"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Pasien diharapkan hadir di klinik minimal 15 (lima belas) menit sebelum estimasi jam tindakan untuk proses registrasi dan pengecekan awal."}),e.jsx("li",{children:"Keterlambatan lebih dari 20 menit dari waktu jadwal yang telah dikonfirmasi dapat mengakibatkan penyesuaian durasi perawatan atau penjadwalan ulang (*reschedule*) demi kenyamanan antrean pasien berikutnya."}),e.jsx("li",{children:"Permohonan perubahan jadwal (*reschedule*) dapat dilakukan maksimal 4 (empat) jam sebelum jadwal tindakan melalui sistem atau staf klinik."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"3. Tata Tertib & Prosedur Medis Klinik"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Sebelum tindakan medis dilakukan, dokter gigi yang bertugas akan melakukan pemeriksaan klinis dan menjelaskan rencana perawatan, indikasi, serta estimasi biaya."}),e.jsxs("li",{children:["Tindakan medis invasif, bedah minor, restorasi lanjutan, dan estetik memerlukan penandatanganan ",e.jsx("strong",{children:"Surat Pernyataan dan Persetujuan Pasien (Informed Consent)"})," yang sah."]}),e.jsx("li",{children:"Pasien wajib mematuhi seluruh instruksi pra-tindakan dan pasca-tindakan yang diberikan oleh dokter gigi demi efektivitas dan keamanan hasil perawatan."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"4. Kebijakan Pembayaran & Jaminan Layanan"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Pembayaran tagihan tindakan dapat dilakukan secara tunai, kartu debit/kredit, transfer bank, maupun metode pembayaran digital resmi yang disediakan klinik."}),e.jsx("li",{children:"Setiap perawatan bergaransi (seperti pemasangan veneer porselen atau implan tertentu) tunduk pada syarat kontrol berkala sesuai rekomendasi dokter penanggung jawab."})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h3",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1",children:"5. Kerahasiaan Data Pribadi & Rekam Medis"}),e.jsxs("ol",{className:"list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs",children:[e.jsx("li",{children:"Aesthetic Pondok Indah menjamin kerahasiaan data pribadi dan rekam medis pasien sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia."}),e.jsx("li",{children:"Dokumentasi klinis (foto gigi intraoral/ekstraoral dan rontgen panoramic) digunakan secara ketat untuk kepentingan diagnosis medis dan rekam jejak kesehatan gigi pasien."})]})]})]}),e.jsxs("div",{className:"pt-4 border-t border-[#E8DFC8] text-center text-[11px] text-[#7A6E60] space-y-1",children:[e.jsx("p",{className:"font-semibold text-[#8C6B1C]",children:"Aesthetic Pondok Indah Dental Clinic — Standar Pelayanan & Keselamatan Pasien Terakreditasi"}),e.jsx("p",{children:"Dokumen ini merupakan standar resmi syarat & ketentuan layanan klinik yang berlaku mengikat bagi seluruh pasien terdaftar."})]})]})}),e.jsxs("div",{className:"px-6 py-4 bg-white border-t border-[#E8DFC8] rounded-b-3xl flex items-center justify-between gap-3 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs text-[#8C8272]",children:[e.jsx(S,{className:"w-4 h-4 text-emerald-600 shrink-0"}),e.jsx("span",{children:"Dokumen Syarat & Ketentuan Resmi Terverifikasi"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{type:"button",variant:"outline",onClick:l,className:"h-9 px-4 rounded-xl border-[#D9D0BC] text-[#4A3F35] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer",children:"Tutup"}),r&&m&&e.jsxs(h,{type:"button",onClick:()=>{m(),l()},className:"h-9 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer",children:[e.jsx(A,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Saya Menyetujui Syarat & Ketentuan"})]})]})]})]})})}function re({isOpen:n,onClose:l,bookingCode:m,patientName:r,patientPhone:j,isGuest:p,serviceName:i,doctorName:g,dateStr:b,timeStr:x,signatureData:d,acceptedAt:t}){const[o,v]=c.useState(null),[a,y]=c.useState(null);if(c.useEffect(()=>{n&&K().then(s=>{s.pdf_informed_consent&&y(s.pdf_informed_consent),s.booking_terms&&s.booking_terms.trim().length>0&&v(s.booking_terms)}).catch(()=>{})},[n]),!n)return null;const k=t?new Date(t).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}):`${b}, ${x}`,u=()=>{const s=document.createElement("iframe");s.style.position="fixed",s.style.right="0",s.style.bottom="0",s.style.width="0",s.style.height="0",s.style.border="0",document.body.appendChild(s);const f=s.contentWindow?.document;if(!f){window.print();return}const I=a?.kop?.logoWidth||75,$=a?.kop?.logoHeight||75,R=a?.clausuls&&a.clausuls.length>0?a.clausuls.map(C=>`
          <div class="section-title">${C.title}</div>
          <p>${C.content}</p>
        `).join(""):`
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
        `,L=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${a?.docTitle||"Surat Persetujuan Tindakan Medis"} - ${r}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 16mm 14mm;
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
              gap: 16px;
              padding-bottom: 10px;
              margin-bottom: 14px;
              border-bottom: 3px double #111;
            }
            .kop-logo { flex-shrink: 0; }
            .kop-logo img { width: ${I}px; height: ${$}px; object-fit: contain; }
            .kop-details { text-align: center; flex: 1; }
            .kop-title { font-size: 13.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
            .kop-contact { font-size: 8.5pt; font-weight: 500; color: #222; margin-bottom: 2px; }
            .kop-contact a { color: #0056b3; text-decoration: underline; }
            .kop-address { font-size: 8pt; color: #333; line-height: 1.3; }

            .doc-header {
              text-align: center;
              margin-bottom: 14px;
            }
            .doc-title {
              font-size: 11pt;
              font-weight: 800;
              color: #111;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-ref {
              font-size: 8.5pt;
              color: #555;
              margin-top: 1px;
            }
            .meta-box {
              background: #faf8f5;
              border: 1px solid #eadbbd;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 12px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
              font-size: 8.5pt;
            }
            .meta-item {
              display: flex;
              gap: 6px;
            }
            .meta-label {
              font-weight: 600;
              color: #6b5e4f;
              min-width: 95px;
            }
            .meta-value {
              font-weight: 700;
              color: #2c2416;
            }
            .section-title {
              font-size: 9.5pt;
              font-weight: 700;
              color: #111;
              margin: 10px 0 2px 0;
            }
            p {
              margin: 0 0 6px 0;
              text-align: justify;
              color: #333;
              font-size: 8.8pt;
              line-height: 1.4;
            }
            .custom-statement {
              margin: 14px 0;
              padding: 8px 12px;
              background: #fafafa;
              border-left: 3px solid #111;
              font-size: 8.5pt;
              font-style: italic;
            }
            .footer-grid {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 10px;
            }
            .seal-box {
              font-size: 8pt;
              color: #555;
            }
            .seal-badge {
              display: inline-block;
              padding: 2px 6px;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              color: #065f46;
              border-radius: 4px;
              font-weight: bold;
              font-size: 7.5pt;
              margin-bottom: 4px;
            }
            .signature-box {
              width: 220px;
              border: 1px solid #e0d7c4;
              border-radius: 6px;
              padding: 8px;
              text-align: center;
              background: #fff;
            }
            .signature-box img {
              max-height: 55px;
              max-width: 170px;
              object-fit: contain;
              display: block;
              margin: 4px auto;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            ${a?.kop?.logoUrl?`<div class="kop-logo"><img src="${a.kop.logoUrl}" alt="Logo" /></div>`:""}
            <div class="kop-details">
              <div class="kop-title">${a?.kop?.clinicName||"PT NAVENA INTERNATIONAL GROUP"}</div>
              <div class="kop-contact">Phone: ${a?.kop?.phone||"+62 21 555 1900"} &nbsp; E-mail: <a>${a?.kop?.email||"navenainternationalgroup@gmail.com"}</a></div>
              <div class="kop-address">${a?.kop?.address||"Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan"}</div>
            </div>
          </div>

          <div class="doc-header">
            <div class="doc-title">${a?.docTitle||"SURAT PERSETUJUAN TINDAKAN KEDOKTERAN GIGI (INFORMED CONSENT)"}</div>
            <div class="doc-ref">Nomor Dokumen: SK-CONSENT-${m} • Lembar Informed Consent Resmi</div>
          </div>

          <div class="meta-box">
            <div>
              <div class="meta-item"><span class="meta-label">Nama Pasien:</span> <span class="meta-value">${r}</span> (${p?"Guest":"Member"})</div>
              <div class="meta-item"><span class="meta-label">No. Telepon/WA:</span> <span class="meta-value">${j||"-"}</span></div>
              <div class="meta-item"><span class="meta-label">Layanan Tindakan:</span> <span class="meta-value">${i}</span></div>
            </div>
            <div>
              <div class="meta-item"><span class="meta-label">Dokter Bertugas:</span> <span class="meta-value">${g}</span></div>
              <div class="meta-item"><span class="meta-label">Jadwal Praktik:</span> <span class="meta-value">${b} • ${x}</span></div>
              <div class="meta-item"><span class="meta-label">Waktu Disetujui:</span> <span class="meta-value">${k}</span></div>
            </div>
          </div>

          ${R}

          <div class="custom-statement">${a?.closingStatement||"Demikian surat persetujuan tindakan medis ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya."}</div>

          <div class="footer-grid">
            <div class="seal-box">
              <span class="seal-badge">✓ Dokumen Digital Tersertifikasi & Sah Secara Medikolegal</span><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan<br/>
              <span style="font-size: 7.5pt; color: #888;">Dicetak pada: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB</span>
            </div>

            <div class="signature-box">
              <div style="font-size: 7.5pt; font-weight: 700; color: #8C6B1C; margin-bottom: 2px; text-transform: uppercase;">
                Tanda Tangan Pasien / Wali
              </div>
              ${d?`
                <img src="${d}" alt="Tanda Tangan ${r}" />
              `:`
                <div style="font-size: 8pt; font-weight: 700; color: #047857; padding: 10px 0;">✓ Disetujui Secara Digital</div>
              `}
              <div style="font-size: 8.5pt; font-weight: 700; text-decoration: underline; margin-top: 2px;">${r}</div>
              <div style="font-size: 7.5pt; color: #666;">${p?"Guest User":"Pasien Terdaftar"}</div>
            </div>
          </div>
        </body>
      </html>
    `;f.open(),f.write(L),f.close(),setTimeout(()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(()=>{document.body.contains(s)&&document.body.removeChild(s)},1500)},300)};return e.jsx(P,{open:n,onOpenChange:s=>!s&&l(),children:e.jsxs(E,{showCloseButton:!1,className:"w-[95vw] max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-white border border-[#EADBBD] shadow-2xl overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5] shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-xs",children:e.jsx(F,{className:"w-5 h-5 text-[#8C6B1C]"})}),e.jsxs("div",{children:[e.jsx(T,{className:"text-base sm:text-lg font-bold font-display text-[#2C2416]",children:"Dokumen Persetujuan & Kebijakan Reservasi"}),e.jsxs(B,{className:"text-xs text-[#7C7365] mt-0.5",children:["Surat Informed Consent Resmi Pasien #",m]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(h,{type:"button",onClick:u,variant:"outline",className:"h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer",title:"Cetak Dokumen Resmi",children:[e.jsx(N,{className:"w-4 h-4"}),e.jsx("span",{children:"Cetak / Simpan PDF"})]}),e.jsx("button",{type:"button",onClick:l,className:"w-9 h-9 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs cursor-pointer",title:"Tutup",children:e.jsx(D,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FAF8F5]",children:e.jsxs("div",{className:"bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#2C2416]",children:[e.jsxs("div",{className:"flex items-center justify-center gap-4 pb-3 text-center border-b-2",style:{borderBottom:"3px double #111"},children:[a?.kop?.logoUrl?e.jsx("div",{className:"flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg p-1 bg-white shadow-2xs overflow-hidden",style:{width:`${a.kop.logoWidth||75}px`,height:`${a.kop.logoHeight||75}px`},children:e.jsx("img",{src:a.kop.logoUrl,alt:"Logo",className:"w-full h-full object-contain"})}):null,e.jsxs("div",{className:"flex-1 text-center",children:[e.jsx("h2",{className:"text-sm sm:text-base font-black text-black tracking-wide uppercase",children:a?.kop?.clinicName||"PT NAVENA INTERNATIONAL GROUP"}),e.jsxs("p",{className:"text-[10px] sm:text-xs text-gray-800 font-medium mt-0.5",children:["Phone: ",a?.kop?.phone||"+62 21 555 1900","   E-mail: ",e.jsx("span",{className:"text-blue-600 underline",children:a?.kop?.email||"navenainternationalgroup@gmail.com"})]}),e.jsx("p",{className:"text-[9px] sm:text-[10px] text-gray-600 mt-0.5 leading-tight",children:a?.kop?.address||"Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan, Provinsi DKI Jakarta, 12310"})]})]}),e.jsxs("div",{className:"text-center space-y-1",children:[e.jsx("h3",{className:"text-base sm:text-lg font-bold font-display tracking-tight text-[#2C2416]",children:"SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK"}),e.jsxs("div",{className:"text-[11px] text-[#8C8272] pt-0.5 flex items-center justify-center gap-3",children:[e.jsxs("span",{children:["Ref. Dokumen: ",e.jsxs("strong",{className:"font-mono font-semibold",children:["SK-CONSENT-",m]})]}),e.jsx("span",{children:"•"}),e.jsxs("span",{children:["Status: ",e.jsx("strong",{className:"text-emerald-700",children:"Tersertifikasi Digital"})]})]})]}),e.jsxs("div",{className:"bg-[#FAF8F5] border border-[#EADBBD] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(U,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Nama Pasien:"}),e.jsx("strong",{className:"text-[#2C2416]",children:r}),e.jsx("span",{className:"text-[10px] px-1.5 py-0.5 bg-white rounded border border-[#D9D0BC] text-[#8C6B1C] font-semibold",children:p?"Guest User":"Pasien Terdaftar"})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx("span",{children:"No. Telepon / WhatsApp:"}),e.jsx("strong",{className:"text-[#2C2416]",children:j||"-"})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(W,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Layanan yang Dipilih:"}),e.jsx("strong",{className:"text-[#2C2416]",children:i})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(M,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Dokter Spesialis:"}),e.jsx("strong",{className:"text-[#2C2416]",children:g})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(J,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Tanggal & Jam Praktik:"}),e.jsxs("strong",{className:"text-[#2C2416]",children:[b," • ",x]})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[#6B5E4F]",children:[e.jsx(O,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),e.jsx("span",{children:"Waktu Persetujuan:"}),e.jsx("span",{className:"text-[#2C2416]",children:k})]})]})]}),o&&e.jsxs("div",{className:"space-y-2 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4",children:[e.jsx("div",{className:"font-bold text-[#8C6B1C] text-xs uppercase tracking-wider",children:"Ketentuan Khusus Operasional:"}),e.jsx("div",{className:"bg-[#FAF9F6] p-3 rounded-lg border border-[#EDE5D6]",children:o})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#443E33] leading-relaxed",children:[e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"1. Ketentuan Kedatangan & Registrasi Pasien"}),e.jsxs("p",{className:"text-xs text-[#555]",children:["Pasien diwajibkan hadir di klinik sekurang-kurangnya ",e.jsx("strong",{children:"15 (lima belas) menit"})," sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal."]})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"2. Kebijakan Keterlambatan & Penjadwalan Ulang"}),e.jsxs("p",{className:"text-xs text-[#555]",children:["Apabila pasien mengalami keterlambatan lebih dari 15 menit dari jadwal tanpa pemberitahuan, antrean dialihkan. Penjadwalan ulang (reschedule) bebas biaya dilakukan selambatnya ",e.jsx("strong",{children:"1 x 24 jam"})," sebelum jadwal."]})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"3. Persetujuan Tindakan Medis (Informed Consent)"}),e.jsx("p",{className:"text-xs text-[#555]",children:"Dengan membubuhkan tanda tangan digital pada lembar ini, pasien memberikan persetujuan kepada dokter gigi spesialis untuk pemeriksaan klinis, diagnostik rontgen bila diperlukan, dan perawatan yang disepakati."})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"4. Kerahasiaan Rekam Medis & Privasi Pasien"}),e.jsx("p",{className:"text-xs text-[#555]",children:"Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai regulasi hukum kesehatan Republik Indonesia."})]})]}),e.jsxs("div",{className:"space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6] text-xs sm:text-sm text-[#443E33]",children:[e.jsx("h4",{className:"font-bold text-[#2C2416]",children:"5. Pembayaran & Kebijakan Pembatalan"}),e.jsx("p",{className:"text-xs text-[#555]",children:"Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer kasir klinik. Pembatalan sepihak hari H tanpa alasan medis darurat dapat memengaruhi kuota prioritas booking berikutnya."})]}),e.jsxs("div",{className:"pt-4 border-t-2 border-[#2C2416] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end",children:[e.jsxs("div",{className:"space-y-2 text-xs text-[#6B5E4F]",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-emerald-700 font-bold",children:[e.jsx(S,{className:"w-4 h-4 text-emerald-600"}),e.jsx("span",{children:"Lembar Persetujuan Sah Secara Medikolegal"})]}),e.jsx("p",{className:"text-[11px] text-[#7C7365] leading-relaxed",children:"Tanda tangan digital ini terekam melalui kanvas biometrik terenkripsi dan disimpan permanen pada sistem basis data rekam medis klinik."}),e.jsxs("div",{className:"text-[10px] text-[#8C8272] pt-1",children:["Dicetak pada: ",new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})," WIB"]})]}),e.jsxs("div",{className:"border border-[#D9D0BC] rounded-2xl p-4 bg-[#FAF8F5] text-center space-y-2",children:[e.jsx("p",{className:"text-[11px] font-semibold text-[#8C6B1C] uppercase tracking-wider",children:"Tanda Tangan Pasien / Wali Sah"}),e.jsx("div",{className:"w-full h-24 bg-white border border-[#D9D0BC] rounded-xl flex items-center justify-center p-2 shadow-inner overflow-hidden",children:d&&d.trim().length>10?e.jsx("img",{src:d,alt:`Tanda Tangan ${r}`,className:"max-h-full max-w-full object-contain filter contrast-125"}):e.jsxs("span",{className:"text-xs text-emerald-700 font-semibold flex items-center gap-1",children:[e.jsx(A,{className:"w-3.5 h-3.5"})," Disetujui Secara Digital"]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold text-[#2C2416] underline underline-offset-4",children:r}),e.jsx("p",{className:"text-[10px] text-[#7C7365] mt-0.5",children:p?"Pengunjung / Pasien Guest":"Member Terdaftar"})]})]})]})]})}),e.jsxs("div",{className:"p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3 shrink-0",children:[e.jsx(h,{type:"button",variant:"outline",onClick:l,className:"h-10 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer",children:"Tutup"}),e.jsxs(h,{type:"button",onClick:u,className:"h-10 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer",children:[e.jsx(N,{className:"w-4 h-4"}),e.jsx("span",{children:"Cetak / Unduh PDF"})]})]})]})})}export{se as M,N as P,re as R,ne as T,ie as a,K as g};
