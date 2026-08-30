import{c as B,r as o,j as e,B as D}from"./index-DYNYWso_.js";import{H as E,F}from"./Footer-CNsEhADH.js";import{g as S}from"./clinicSettingsApi-CtsHgLwz.js";import{g as P}from"./clinicSettingsService-CCNPHdux.js";import{C as $}from"./clock-CnpMvojl.js";import{S as f}from"./shield-check-CLNn9wIC.js";import{F as T}from"./index-DFUxs5e1.js";import{P as _,M as u}from"./ReservationConsentPdfModal-D8-PobDM.js";import{B as z}from"./building-2-BH2j8F4W.js";import"./dialog-C1l5blGs.js";import"./index-BUOqf_qA.js";import"./index-C2PCWxkg.js";import"./index-qohswvaI.js";import"./label-CSNLtlcH.js";import"./file-check-BDqtlPp2.js";import"./pen-tool-B2683jkd.js";import"./external-link-D06OWYqH.js";import"./mail-BgD-5Pb8.js";import"./message-square-KbTWbSff.js";import"./map-pin-ByvB46jR.js";import"./shield-C-WKklWR.js";import"./check-BK6AVaQD.js";const K=[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]],I=B("scale",K);function oe(){const[s,j]=o.useState(null),[a,y]=o.useState(null),[N,k]=o.useState(!0);o.useEffect(()=>{S().then(t=>{t.pdf_terms_and_conditions&&j(t.pdf_terms_and_conditions),t.clinic_general_info&&y(t.clinic_general_info)}).catch(()=>{}).finally(()=>k(!1))},[]);const i=s?.docTitle||"Syarat dan Ketentuan Layanan",c=s?.docSubtitle||"Ketentuan Reservasi, Standar Pelayanan Medis & Kebijakan Pasien",l=s?.docVersion||"REV-2026.04",x=P(s),m=s?.footerNote||"Dengan menggunakan layanan Aesthetic Pondok Indah Dental Clinic, pasien dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum.",n=a?.clinicName||s?.kop?.clinicName||"Aesthetic Pondok Indah Dental Clinic",p=a?.address||s?.kop?.address||"Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310",h=a?.phone||s?.kop?.phone||"021-7695948",g=a?.email||s?.kop?.email||"info@aestheticpondokindah.com",d=a?.whatsappNumber||"+62 819-9011-4949",w=()=>{const t=document.createElement("iframe");t.style.position="fixed",t.style.right="0",t.style.bottom="0",t.style.width="0",t.style.height="0",t.style.border="0",document.body.appendChild(t);const r=t.contentWindow?.document;if(!r){window.print();return}const v=s?.kop?.logoWidth||75,A=s?.kop?.logoHeight||75,b=s?.baseFontSize||"9.5pt",C=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${i} - ${n}</title>
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
              font-size: ${b};
              line-height: 1.55;
              color: #2D2821;
              background: #fff;
              margin: 0;
              padding: 0;
            }
            .kop-container {
              display: flex;
              align-items: center;
              gap: 16px;
              border-bottom: 2.5px solid #8C6B1C;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .kop-logo {
              width: ${v}px;
              height: ${A}px;
              object-fit: contain;
              flex-shrink: 0;
            }
            .kop-text h1 {
              font-size: 14pt;
              font-weight: 800;
              color: #8C6B1C;
              margin: 0 0 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .kop-text p {
              margin: 1px 0;
              font-size: 8.5pt;
              color: #555;
            }
            .doc-header {
              text-align: center;
              margin: 16px 0 18px;
            }
            .doc-header h2 {
              font-size: 13pt;
              font-weight: 800;
              color: #1a1612;
              margin: 0 0 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-header .doc-meta {
              font-size: 8.5pt;
              color: #777;
              font-weight: 600;
            }
            .terms-body h3 {
              font-size: 10.5pt;
              font-weight: 700;
              color: #8C6B1C;
              margin: 14px 0 4px;
            }
            .terms-body p {
              margin: 0 0 8px;
              font-size: ${b};
              text-align: justify;
            }
            .terms-body ul, .terms-body ol {
              margin: 4px 0 8px 18px;
              padding: 0;
            }
            .terms-body li {
              margin-bottom: 4px;
            }
            .footer-note {
              margin-top: 24px;
              padding: 10px 14px;
              background: #FAF8F5;
              border-left: 3.5px solid #C9A24A;
              border-radius: 4px;
              font-size: 8pt;
              color: #555;
              font-style: italic;
            }
            .signature-box {
              margin-top: 28px;
              display: flex;
              justify-content: flex-end;
            }
            .sign-col {
              text-align: center;
              width: 220px;
              font-size: 8.5pt;
            }
            .sign-line {
              margin-top: 55px;
              border-top: 1px solid #333;
              padding-top: 3px;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            <img src="/logo/logo-vertikal.webp" class="kop-logo" alt="Logo" />
            <div class="kop-text">
              <h1>${n}</h1>
              <p>${p}</p>
              <p>Telp: ${h} | Email: ${g} | WhatsApp: ${d}</p>
            </div>
          </div>

          <div class="doc-header">
            <h2>${i}</h2>
            <div class="doc-meta">${c} &bull; No: ${l}</div>
          </div>

          <div class="terms-body">
            ${x}
          </div>

          <div class="footer-note">
            <strong>Catatan Hukum:</strong> ${m}
          </div>

          <div class="signature-box">
            <div class="sign-col">
              <div>Jakarta, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div>
              <div>Manajemen Pelayanan Klinik</div>
              <div class="sign-line">${n}</div>
            </div>
          </div>
        </body>
      </html>
    `;r.open(),r.write(C),r.close(),setTimeout(()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(t)},2e3)},500)};return e.jsxs("div",{className:"min-h-screen bg-[#FAF8F5]",children:[e.jsx(E,{}),e.jsxs("main",{className:"pb-24 lg:pb-0",children:[e.jsxs("section",{className:"relative py-12 sm:py-16 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F3EAD8] border-b border-[#EADBBD]/80 overflow-hidden",children:[e.jsxs("div",{className:"absolute inset-0 pointer-events-none",children:[e.jsx("div",{className:"absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#C9A24A]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"}),e.jsx("div",{className:"absolute bottom-0 left-0 w-64 h-64 bg-[#8C6B1C]/5 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4"})]}),e.jsx("div",{className:"container mx-auto px-4 relative z-10",children:e.jsxs("div",{className:"max-w-3xl mx-auto text-center space-y-4",children:[e.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#EADBBD] shadow-xs text-xs font-bold text-[#8C6B1C] uppercase tracking-wider",children:[e.jsx(I,{className:"w-3.5 h-3.5 text-[#C9A24A]"}),"Dokumen Resmi Klinik"]}),e.jsx("h1",{className:"text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#2D2821] tracking-tight",children:i}),e.jsx("p",{className:"text-xs sm:text-sm md:text-base text-[#6B5E4E] leading-relaxed max-w-2xl mx-auto",children:c}),e.jsxs("div",{className:"pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#8A7B6B]",children:[e.jsxs("span",{className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#EADBBD]",children:[e.jsx($,{className:"w-3.5 h-3.5 text-[#8C6B1C]"}),"Versi Dokumen: ",e.jsx("strong",{className:"text-[#4A3F35]",children:l})]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#EADBBD]",children:[e.jsx(f,{className:"w-3.5 h-3.5 text-emerald-600"}),"Status: ",e.jsx("strong",{className:"text-emerald-700 font-semibold",children:"Berlaku Resmi"})]})]})]})})]}),e.jsx("section",{className:"py-10 sm:py-16",children:e.jsxs("div",{className:"container mx-auto px-4 max-w-4xl",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs text-[#7A6E60]",children:[e.jsx(T,{className:"w-4 h-4 text-[#8C6B1C]"}),e.jsx("span",{children:"Format Resmi Syarat dan Ketentuan Pasien"})]}),e.jsxs(D,{onClick:w,className:"bg-white hover:bg-[#F5ECE0] text-[#8C6B1C] border border-[#EADBBD] shadow-xs rounded-xl text-xs font-bold h-9 px-4 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer",children:[e.jsx(_,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Cetak / Simpan PDF"})]})]}),e.jsxs("div",{className:"bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-md border border-[#E8DFC8] relative overflow-hidden",children:[e.jsxs("div",{className:"text-center pb-6 border-b-2 border-[#8C6B1C] mb-8 space-y-1",children:[e.jsx("img",{src:"/logo/logo-vertikal.webp",alt:"Logo",className:"h-16 w-auto object-contain mx-auto mb-1.5",onError:t=>{t.currentTarget.src="/logo/Logo-vertikal.png"}}),e.jsx("h2",{className:"text-base sm:text-lg md:text-xl font-extrabold text-[#8C6B1C] tracking-wide uppercase",children:n}),e.jsx("p",{className:"text-xs text-[#6B5E4E] mt-1 leading-relaxed",children:p}),e.jsxs("p",{className:"text-[11px] text-[#8A7B6B] mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5",children:[e.jsxs("span",{children:["Telp: ",h]}),e.jsxs("span",{children:["Email: ",g]}),e.jsxs("span",{children:["WhatsApp: ",d]})]})]}),e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("span",{className:"text-[10px] font-bold tracking-[0.2em] text-[#8C6B1C] uppercase block mb-1",children:"SURAT PERNYATAAN & KETENTUAN LAYANAN"}),e.jsx("h3",{className:"text-lg sm:text-xl md:text-2xl font-black text-[#2D2821]",children:i}),e.jsxs("p",{className:"text-xs text-[#7A6E60] mt-1",children:["Nomor Arsip / Versi: ",l]})]}),N?e.jsx("div",{className:"py-12 text-center text-sm text-[#7A6E60] font-medium",children:"Memuat data syarat dan ketentuan resmi..."}):e.jsx("div",{className:"terms-rendered-content text-[#3A332A] text-xs sm:text-sm leading-relaxed space-y-4",dangerouslySetInnerHTML:{__html:x}}),e.jsxs("div",{className:"mt-10 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-l-4 border-[#C9A24A] border border-[#E8DFC8] flex items-start gap-3",children:[e.jsx(f,{className:"w-5 h-5 text-[#8C6B1C] shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-xs font-bold text-[#8C6B1C] uppercase tracking-wide mb-0.5",children:"Pernyataan Persetujuan Pasien"}),e.jsx("p",{className:"text-[11px] sm:text-xs text-[#6B5E4E] leading-relaxed",children:m})]})]}),e.jsxs("div",{className:"mt-10 pt-6 border-t border-[#F0E6D3] flex flex-col sm:flex-row items-center sm:justify-between gap-6",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0",children:e.jsx(z,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-[#8A7B6B] block",children:"Diterbitkan Oleh"}),e.jsxs("span",{className:"text-xs font-bold text-[#2D2821]",children:["Manajemen ",n]})]})]}),e.jsxs("div",{className:"text-center sm:text-right",children:[e.jsx("span",{className:"text-[11px] text-[#8A7B6B] block",children:"Disahkan di Jakarta"}),e.jsx("span",{className:"text-xs font-semibold text-[#8C6B1C]",children:"Dokumen Sah Sistem Elektronik"})]})]})]}),e.jsxs("div",{className:"mt-8 p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EA] border border-[#EADBBD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4",children:[e.jsxs("div",{className:"flex items-center gap-4 text-center sm:text-left",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0 shadow-xs",children:e.jsx(u,{className:"w-6 h-6"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm font-bold text-[#2D2821]",children:"Memiliki Pertanyaan Seputar Syarat Layanan?"}),e.jsx("p",{className:"text-xs text-[#7A6E60] mt-0.5",children:"Tim administrasi dan customer service kami siap membantu Anda."})]})]}),e.jsxs("a",{href:`https://wa.me/${d.replace(/[^0-9]/g,"")}?text=${encodeURIComponent("Halo Admin Aesthetic Pondok Indah, saya ingin menanyakan perihal syarat dan ketentuan layanan klinik.")}`,target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer",children:[e.jsx(u,{className:"w-4 h-4"}),e.jsx("span",{children:"Konsultasi via WhatsApp"})]})]})]})})]}),e.jsx(F,{})]})}export{oe as default};
