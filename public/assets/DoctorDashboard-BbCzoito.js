import{j as e}from"./vendor-radix-B35KjGE2.js";import{a as c,N as oe}from"./vendor-router-D-FOUPmb.js";import{D as ie}from"./DashboardLayout-BRwwf5f9.js";import{b as de,d as V,o as W,P as ce,a as xe,S as me,s as R}from"./index-xRVOxD_6.js";import{L as pe,T as he,a as ue,b as _,c as f,d as be,e as y}from"./table-C1-xC5Zp.js";import{B as z}from"./button-IZ1i32bg.js";import{u as ge}from"./NewMobileDashboardLayout-CDlS8ndz.js";import{A as fe}from"./arrow-left-CA-z-iox.js";import{B as ye}from"./building-2-DXwLiZBk.js";import{U as M}from"./user-DEe7wKjJ.js";import{P as Ce}from"./phone-DcNJwl89.js";import{C as H}from"./calendar-days-DCJq0k-8.js";import{C as v}from"./calendar-DgJk9CNP.js";import{C as J}from"./shield-XGbV-qiu.js";import{C as De}from"./chevron-left-CPtk9YmN.js";import{F as je}from"./file-spreadsheet-CCGXD3p6.js";import{F as Ne}from"./file-text-BUmOnl_K.js";import{S as we}from"./sparkles-BGHShey1.js";import{E as Se}from"./eye-fnjjrK12.js";import"./users-Cy4v2Jw6.js";import"./map-pin-1DZaFKoJ.js";import"./chevron-down-BnRNntDn.js";import"./download-Q8zVkAch.js";import"./vendor-charts-gEYhEoyc.js";import"./vendor-editor-BG8_JKhV.js";import"./message-square-D-J2Y2xJ.js";import"./check-DAPE6OoI.js";import"./log-out-Bsxn6Tst.js";import"./award-CB88oY3E.js";import"./star-BstMcank.js";import"./check-check--wDBMPuv.js";import"./trash-2-viCR9ale.js";import"./message-square-text-Ce46CMW4.js";async function Be(){try{return(await de.get("/doctor/queue")).queue||[]}catch{return[]}}const E="apig_doctor_cached_patients",O=["Min","Sen","Sel","Rab","Kam","Jum","Sab"],K=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];function Ae(m){const b=(m||"").toLowerCase();return b==="selesai"||b==="completed"?{bg:"bg-purple-50 text-purple-700 border-purple-200",dot:"bg-purple-500",label:"Selesai"}:b==="dikonfirmasi"||b==="confirmed"||b==="dalam konsultasi"?{bg:"bg-emerald-50 text-emerald-700 border-emerald-200",dot:"bg-emerald-500",label:"Dikonfirmasi"}:b==="dibatalkan"||b==="cancelled"?{bg:"bg-red-50 text-red-700 border-red-200",dot:"bg-red-500",label:"Batal"}:{bg:"bg-amber-50 text-amber-700 border-amber-200",dot:"bg-amber-500",label:"Menunggu"}}function Fe(m){return m?m.toLowerCase().replace(/^(drg\.|dr\.|drg|dr)\s*/i,"").trim():""}function ke({onRefresh:m}){const d=V()?.name||"",T=Fe(d),[j,B]=c.useState(()=>{try{const t=localStorage.getItem(E);return t?JSON.parse(t):[]}catch{return[]}}),[l,P]=c.useState(null),A=c.useRef(!1),C=c.useCallback((t,s)=>{if(!t||!s)return!1;const a=t.toLowerCase().replace(/drg\.?|dr\.?|sp\.[a-z]+|\(.*?\)|,/gi,"").trim(),n=s.toLowerCase().replace(/drg\.?|dr\.?|sp\.[a-z]+|\(.*?\)|,/gi,"").trim();return t.trim().toLowerCase()===s.trim().toLowerCase()||a.length>2&&n.length>2&&(a.includes(n)||n.includes(a))},[]),F=c.useCallback(async()=>{if(!A.current){A.current=!0;try{const t=await Be();if(Array.isArray(t)&&t.length>0){B(t);try{localStorage.setItem(E,JSON.stringify(t))}catch{}}else{const s=await W();if(Array.isArray(s)&&s.length>0){const a=s.filter(n=>C(n.doctor||n.doctor_name||n.doctorName,d));if(a.length>0){B(a);try{localStorage.setItem(E,JSON.stringify(a))}catch{}}}}m&&m()}catch{}finally{A.current=!1}}},[m,d,C]);c.useEffect(()=>{j.length===0&&W().then(t=>{if(Array.isArray(t)&&t.length>0){const s=t.filter(a=>C(a.doctor||a.doctor_name||a.doctorName,d));s.length>0&&B(s)}}).catch(()=>{}),F()},[F,d,C,j.length]),ge(()=>F());const[k,L]=c.useState(()=>{const t=new Date,s=t.getDay(),a=t.getDate()-s+(s===0?-6:1),n=new Date(t.setDate(a));return n.setHours(0,0,0,0),n}),$=()=>{const t=new Date,s=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),n=String(t.getDate()).padStart(2,"0");return`${s}-${a}-${n}`},[x,N]=c.useState(()=>$()),h=c.useMemo(()=>{const t=[];for(let s=0;s<6;s++){const a=new Date(k);a.setDate(k.getDate()+s);const n=a.getFullYear(),r=String(a.getMonth()+1).padStart(2,"0"),o=String(a.getDate()).padStart(2,"0"),i=`${n}-${r}-${o}`;t.push({date:a,isoDate:i,dayName:O[a.getDay()],dayNumber:a.getDate(),monthName:K[a.getMonth()]})}return t},[k]),D=c.useMemo(()=>{const t=[],s=new Set;return Array.isArray(j)&&j.forEach(a=>{const n=a.doctor||a.doctor_name||a.doctorName||d;if(C(n,d)||!T){const r={id:a.id,code:a.code||`RSV-${String(a.id).padStart(6,"0")}`,name:a.patient_name||a.name||"Pasien",phone:a.patient_phone||a.phone||"",treatment_interest:a.treatment_interest||"Pemeriksaan Gigi",doctor:n,date:a.date,preferred_time:a.preferred_time||"10:00 WIB",branch_name:a.branch_name||"Aesthetic Pondok Indah Main Branch",status:a.status||"Dikonfirmasi",complaint:a.complaint||"",createdAt:a.created_at||a.createdAt};s.has(r.code)||(s.add(r.code),t.push(r))}}),t},[j,T,d,C]),w=c.useMemo(()=>{const t=new Map;return D.forEach(s=>{if(!s.date)return;const a=String(s.date).split("T")[0],n=t.get(a)||[];n.push(s),t.set(a,n)}),t},[D]),G=()=>{L(t=>{const s=new Date(t);return s.setDate(s.getDate()-7),s}),N(null)},U=()=>{L(t=>{const s=new Date(t);return s.setDate(s.getDate()+7),s}),N(null)},I=c.useMemo(()=>{if(!h||h.length===0)return"";const t=h[0],s=h[h.length-1];return!t||!s?"":`${t.dayNumber} ${t.monthName.slice(0,3)} – ${s.dayNumber} ${s.monthName.slice(0,3)} ${s.date.getFullYear()}`},[h]),p=c.useMemo(()=>{let t=[];return x?t=w.get(x)||[]:h.forEach(s=>{const a=w.get(s.isoDate)||[];t.push(...a)}),t},[x,h,w]),Y=D.length,X=D.filter(t=>t.status==="Baru"||t.status==="pending").length,q=D.filter(t=>t.status==="Dikonfirmasi"||t.status==="confirmed"||t.status==="Dalam Konsultasi").length,Q=D.filter(t=>t.status==="Selesai"||t.status==="completed").length,Z=t=>{P(t),R()},ee=()=>{P(null),R()},te=()=>{if(p.length===0)return;const t=x||`Minggu_${I.replace(/[\s–-]+/g,"_")}`,s=p.map((i,u)=>`
        <Row>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${u+1}</Data></Cell>
          <Cell ss:StyleID="CellBold"><Data ss:Type="String">${i.code||`RSV-${i.id}`}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${i.name||"-"}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${i.treatment_interest||"-"}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${i.doctor||d}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${i.date||"-"}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${i.preferred_time||"-"}</Data></Cell>
          <Cell ss:StyleID="CellStatus"><Data ss:Type="String">${i.status||"Menunggu"}</Data></Cell>
        </Row>`).join(""),a=`<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#2C2416"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#2C2416" ss:Bold="1"/>
   <Interior ss:Color="#FAF4E8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#8C6B1C" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CellText">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#2C2416"/>
  </Style>
  <Style ss:ID="CellBold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#8C6B1C" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#4A3F35"/>
  </Style>
  <Style ss:ID="CellStatus">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#2C2416" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rekap Jadwal Praktik">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="35"/>
   <Column ss:Width="105"/>
   <Column ss:Width="160"/>
   <Column ss:Width="200"/>
   <Column ss:Width="180"/>
   <Column ss:Width="95"/>
   <Column ss:Width="85"/>
   <Column ss:Width="105"/>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="7" ss:StyleID="TitleStyle"><Data ss:Type="String">Aesthetic Pondok Indah Dental Clinic - Jadwal Praktik Dokter (${d})</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Kode Booking</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nama Pasien</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Layanan / Tindakan</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dokter Pemeriksa</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tanggal</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Waktu</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${s}
  </Table>
 </Worksheet>
</Workbook>`,n=new Blob([a],{type:"application/vnd.ms-excel;charset=utf-8"}),r=URL.createObjectURL(n),o=document.createElement("a");o.href=r,o.download=`Jadwal_Praktik_Dokter_${d.replace(/[^a-zA-Z0-9]/g,"_")}_${t}.xls`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(r)},se=()=>{if(p.length===0)return;const t=x||`Minggu (${I})`,s=document.createElement("iframe");s.style.position="fixed",s.style.right="0",s.style.bottom="0",s.style.width="0",s.style.height="0",s.style.border="none",document.body.appendChild(s);const a=s.contentWindow?.document;if(!a)return;const n=p.map((r,o)=>{const i=(r.status||"").toLowerCase();let u="#fef3c7",g="#92400e";return i.includes("selesai")?(u="#f3e8ff",g="#6b21a8"):i.includes("konfirmasi")?(u="#d1fae5",g="#065f46"):i.includes("batal")&&(u="#fee2e2",g="#991b1b"),`
          <tr style="border-bottom: 1px solid #e5e7eb; ${o%2===1?"background: #fafaf9;":""}">
            <td style="padding: 8px 6px; text-align: center; color: #57534e; font-size: 10px;">${o+1}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10.5px;">${r.code||`RSV-${r.id}`}</td>
            <td style="padding: 8px 6px; color: #1c1917; font-size: 10.5px;">${r.name||"-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px;">${r.treatment_interest||"-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px;">${r.doctor||d}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px;">${r.date||"-"}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px;">${r.preferred_time||"-"}</td>
            <td style="padding: 8px 6px; text-align: center; white-space: nowrap;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; background: ${u}; color: ${g};">
                ${r.status||"Menunggu"}
              </span>
            </td>
          </tr>
        `}).join("");a.open(),a.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page { size: A4 landscape; margin: 10mm 12mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
            body { color: #1c1917; background: #fff; line-height: 1.4; font-size: 11px; }
            .header-box { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 1.5px solid #8c6b1c; margin-bottom: 12px; }
            .clinic-name { font-size: 15px; font-weight: bold; color: #1c1917; }
            .clinic-desc { font-size: 10.5px; color: #57534e; margin-top: 2px; }
            .doc-heading { text-align: right; }
            .doc-heading h2 { font-size: 13.5px; font-weight: bold; color: #8c6b1c; text-transform: uppercase; }
            .meta-strip { display: flex; justify-content: space-between; background: #f7f4ec; border: 1px solid #e7decb; padding: 6px 10px; border-radius: 6px; margin-bottom: 10px; font-size: 10px; color: #44403c; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5ece0; border-bottom: 1.5px solid #d9cdb8; padding: 7px 6px; text-align: left; font-size: 10.5px; font-weight: bold; color: #2c2416; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="clinic-name">AESTHETIC PONDOK INDAH DENTAL CLINIC</div>
              <div class="clinic-desc">Laporan Resmi Daftar Janji Temu Dokter</div>
            </div>
            <div class="doc-heading">
              <h2>Jadwal Praktik & Appointment</h2>
              <p>${d}</p>
            </div>
          </div>
          <div class="meta-strip">
            <span>Periode: ${t}</span>
            <span>Total Pasien: ${p.length}</span>
            <span>Waktu Cetak: ${new Date().toLocaleDateString("id-ID")}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 32px; text-align: center;">No</th>
                <th style="width: 110px;">Kode</th>
                <th style="width: 140px;">Nama Pasien</th>
                <th>Layanan / Tindakan</th>
                <th style="width: 190px;">Dokter Spesialis</th>
                <th style="width: 85px;">Jadwal</th>
                <th style="width: 80px;">Waktu</th>
                <th style="width: 95px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${n}
            </tbody>
          </table>
        </body>
      </html>
    `),a.close(),setTimeout(()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(()=>{document.body.contains(s)&&document.body.removeChild(s)},1500)},300)};return e.jsx("div",{className:"space-y-5 text-left",children:e.jsx(ce,{transitionKey:l?`detail_${l.id}`:"list",children:l?e.jsxs("div",{className:"space-y-6 text-left animate-in fade-in duration-150",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-[#EADBBD] shadow-xs",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-bold text-[#4A3F35]",children:"Detail Data Pasien"}),e.jsxs("span",{className:"font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8C6B1C]/10 text-[#8C6B1C] border border-[#8C6B1C]/20",children:["#",l.code||`RSV-${l.id}`]})]}),e.jsx("p",{className:"hidden sm:block text-xs text-[#8A7B6B] mt-0.5",children:"Informasi reservasi janji temu klinik Aesthetic Pondok Indah"})]}),e.jsx("div",{className:"flex items-center gap-2 shrink-0",children:e.jsx(z,{type:"button",variant:"outline",size:"icon",onClick:ee,title:"Kembali ke Jadwal",className:"rounded-xl h-9 w-9 border-[#EADBBD] text-[#4A3F35] hover:bg-[#FAF8F5] cursor-pointer",children:e.jsx(fe,{className:"w-4 h-4"})})})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF5EA]/80 border border-[#EADBBD]",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ye,{className:"w-4 h-4 text-[#8C6B1C]"}),e.jsx("span",{className:"text-xs text-[#8A7B6B]",children:"Cabang:"}),e.jsx("span",{className:"text-xs font-bold text-[#4A3F35]",children:l.branch_name||"Aesthetic Pondok Indah Main Branch"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-[#8A7B6B]",children:"Status:"}),e.jsx("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${l.status==="Selesai"?"bg-emerald-100 text-emerald-800 border border-emerald-300":l.status==="Dikonfirmasi"||l.status==="Dalam Konsultasi"?"bg-blue-100 text-blue-800 border border-blue-300":"bg-amber-100 text-amber-800 border border-amber-300"}`,children:l.status||"Menunggu"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs",children:[e.jsx(M,{className:"w-4 h-4"}),e.jsx("span",{children:"Data Pasien"})]}),e.jsxs("div",{className:"space-y-3 text-xs",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Nama Lengkap"}),e.jsx("span",{className:"font-bold text-[#4A3F35] text-sm truncate block mt-0.5",children:l.patient_name||l.name||"-"})]}),l.phone&&e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"No. Telepon / WhatsApp"}),e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5",children:[e.jsx(Ce,{className:"w-3.5 h-3.5 text-[#C9A24A]"}),e.jsx("span",{children:l.phone})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Dokter Pemeriksa"}),e.jsx("span",{className:"font-semibold text-[#8C6B1C] text-xs block mt-0.5",children:l.doctor||d})]})]})]}),e.jsxs("div",{className:"p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs",children:[e.jsx(H,{className:"w-4 h-4"}),e.jsx("span",{children:"Jadwal & Layanan"})]}),e.jsxs("div",{className:"space-y-3 text-xs",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Tanggal Periksa"}),e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5",children:[e.jsx(v,{className:"w-4 h-4 text-[#C9A24A]"}),e.jsx("span",{children:l.date||"-"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Jam Praktik"}),e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-[#8C6B1C] mt-0.5",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),e.jsxs("span",{children:[String(l.preferred_time||"Sesuai Jadwal").replace(/\s*WIB\s*$/i,"")," WIB"]})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Perawatan yang Dipilih"}),e.jsx("span",{className:"font-semibold text-[#4A3F35] block text-xs mt-0.5",children:l.treatment_interest||"Pemeriksaan Dokter Gigi"})]})]})]})]})]})]}):e.jsxs("div",{className:"space-y-5 animate-in fade-in duration-200",children:[e.jsxs("div",{className:"bg-white rounded-3xl border border-[#F0E6D3] p-5 sm:p-6 shadow-xs space-y-5",children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 pb-3 border-b border-[#F7EFE2]",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx(H,{className:"w-5 h-5 text-[#8C6B1C]"}),e.jsx("div",{children:e.jsx("h3",{className:"text-base font-bold text-[#3D332A]",children:"Kalender Appointment"})})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{type:"button",onClick:G,className:"w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8DFC8] hover:bg-[#FAF4E8] text-[#5C4D3C] transition-all cursor-pointer",title:"Minggu Sebelumnya",children:e.jsx(De,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:U,className:"w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8DFC8] hover:bg-[#FAF4E8] text-[#5C4D3C] transition-all cursor-pointer",title:"Minggu Berikutnya",children:e.jsx(xe,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"grid grid-cols-6 gap-1 sm:gap-2.5",children:h.map(t=>{const a=(w.get(t.isoDate)||[]).length,n=x===t.isoDate,r=$()===t.isoDate;return e.jsxs("div",{onClick:()=>N(o=>o===t.isoDate?null:t.isoDate),className:`rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border transition-all cursor-pointer text-center sm:text-left flex flex-col justify-center sm:justify-between min-h-[58px] sm:min-h-[105px] ${n?"bg-[#FAF4E8] border-[#C9A24A] shadow-xs ring-2 ring-[#C9A24A]/20":r?"bg-white border-[#B8943F]/60 shadow-2xs hover:border-[#B8943F]":"bg-white border-[#F0E6D3] hover:border-[#D9CDB8] hover:bg-[#FCFAF7]"}`,children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-center sm:justify-between",children:[e.jsx("span",{className:`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${n||r?"text-[#8C6B1C]":"text-[#8A7B6B]"}`,children:t.dayName}),r&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#B8943F] hidden sm:inline-block",title:"Hari ini"})]}),e.jsx("div",{className:"text-sm sm:text-xl font-bold text-[#3D332A] mt-0.5",children:t.dayNumber})]}),e.jsxs("div",{className:"hidden sm:flex mt-2 pt-2 border-t border-[#F5ECE0] items-center justify-between text-[11px]",children:[e.jsx("span",{className:"text-[#8A7B6B] font-medium",children:"Janji:"}),a>0?e.jsx("span",{className:"w-5 h-5 flex items-center justify-center rounded-full bg-[#EF4444] text-white text-[10px] font-bold shadow-xs",children:a}):e.jsx("span",{className:"text-[#B8A99A] font-medium px-1",children:"0"})]})]},t.isoDate)})}),e.jsxs("div",{className:"pt-2 space-y-3",children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(pe,{className:"w-4 h-4 text-[#8C6B1C] shrink-0"}),e.jsx("h4",{className:"text-xs font-bold text-[#3D332A] uppercase tracking-wider",children:x?`BOOKING TERJADWAL: ${x}`:"BOOKING TERJADWAL MINGGU INI"})]}),e.jsxs("div",{className:"flex items-center gap-2.5 pt-0.5",children:[e.jsxs("span",{className:"text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF4E8] text-[#8C6B1C] border border-[#E8DFC8]",children:[p.length," Pasien"]}),x&&e.jsx("button",{type:"button",onClick:()=>N(null),className:"text-xs font-semibold text-[#8C6B1C] underline underline-offset-2 hover:text-[#735716] cursor-pointer",children:"Tampilkan Semua Hari"})]})]}),!x&&e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("button",{type:"button",onClick:te,disabled:p.length===0,className:"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50",title:"Export data ke format Spreadsheet (Excel)",children:[e.jsx(je,{className:"w-3.5 h-3.5 text-emerald-600"}),e.jsx("span",{children:"Export XLSX"})]}),e.jsxs("button",{type:"button",onClick:se,disabled:p.length===0,className:"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50",title:"Cetak atau simpan sebagai dokumen PDF resmi",children:[e.jsx(Ne,{className:"w-3.5 h-3.5 text-red-600"}),e.jsx("span",{children:"Export PDF"})]})]})]}),p.length===0?e.jsxs("div",{className:"py-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8DFC8] text-[#8A7B6B]",children:[e.jsx(v,{className:"w-7 h-7 mx-auto mb-1.5 opacity-40 text-[#8C6B1C]"}),e.jsx("p",{className:"text-xs font-medium",children:"Tidak ada booking janji temu pada periode ini."})]}):e.jsx("div",{className:"bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-2xs",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(he,{children:[e.jsx(ue,{children:e.jsxs(_,{className:"bg-[#FAF8F5] border-b border-[#F0E6D3]",children:[e.jsx(f,{className:"font-bold text-[#3D332A] py-3.5 pl-3 sm:pl-5 text-xs",children:"Nama"}),e.jsx(f,{className:"hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs",children:"Layanan"}),e.jsx(f,{className:"hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs",children:"Dokter"}),e.jsx(f,{className:"hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs",children:"Jadwal"}),e.jsx(f,{className:"hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs",children:"Waktu"}),e.jsx(f,{className:"hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs",children:"Status"}),e.jsx(f,{className:"font-bold text-[#3D332A] py-3.5 pr-3 sm:pr-5 text-right text-xs",children:"Aksi"})]})}),e.jsx(be,{children:p.map(t=>{const s=Ae(t.status),a=t.name||"Pasien",n=t.treatment_interest||"Pemeriksaan Gigi",r=t.doctor||d,o=t.date?String(t.date).split("T")[0]:"-",i=t.preferred_time||"10:00 WIB";let u="-",g=o;if(o!=="-"){const S=new Date(o),ae=S.getDay();u=O[ae]||"";const ne=S.getDate(),re=K[S.getMonth()]?.slice(0,3)||"",le=S.getFullYear();g=`${ne} ${re} ${le}`}return e.jsxs(_,{className:"hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]",children:[e.jsx(y,{className:"py-3.5 pl-3 sm:pl-5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-bold text-[#3D332A]",children:[e.jsx(M,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsx("span",{children:a})]})}),e.jsx(y,{className:"hidden md:table-cell py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#3D332A] max-w-[200px] truncate",children:[e.jsx(we,{className:"w-3.5 h-3.5 text-[#C9A24A] shrink-0"}),e.jsx("span",{className:"truncate",children:n})]})}),e.jsx(y,{className:"hidden md:table-cell py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-[#5C4D3C] max-w-[190px] truncate",children:[e.jsx(me,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsx("span",{className:"truncate font-medium",children:r})]})}),e.jsx(y,{className:"hidden md:table-cell py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#3D332A]",children:[e.jsx(v,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsxs("span",{children:[u,", ",g]})]})}),e.jsx(y,{className:"hidden md:table-cell py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-medium text-[#5C4D3C]",children:[e.jsx(J,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsx("span",{children:i})]})}),e.jsx(y,{className:"hidden md:table-cell py-3.5",children:e.jsxs("span",{className:`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg}`,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full ${s.dot}`}),s.label]})}),e.jsx(y,{className:"py-3.5 pr-3 sm:pr-5 text-right",children:e.jsx(z,{size:"sm",onClick:()=>Z(t),className:"h-7 w-7 p-0 bg-[#FAF4E8] hover:bg-[#F5E6C8] text-[#8A6B2B] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer",title:"Lihat Detail Pasien",children:e.jsx(Se,{className:"w-3.5 h-3.5"})})})]},t.id)})})]})})})]})]}),e.jsxs("div",{className:"grid grid-cols-4 gap-2 sm:gap-3",children:[e.jsxs("div",{className:"bg-white rounded-2xl py-3 px-1.5 sm:py-3.5 sm:px-2 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#8C6B1C] flex items-center justify-center mb-1.5",children:e.jsx("span",{className:"text-xs sm:text-sm font-bold text-[#3D332A]",children:Y})}),e.jsx("span",{className:"text-[10px] sm:text-xs font-semibold text-[#4A3F35] leading-tight text-center",children:"Total Reservasi"})]}),e.jsxs("div",{className:"bg-white rounded-2xl py-3 px-1.5 sm:py-3.5 sm:px-2 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#E5A024] flex items-center justify-center mb-1.5",children:e.jsx("span",{className:"text-xs sm:text-sm font-bold text-[#3D332A]",children:X})}),e.jsx("span",{className:"text-[10px] sm:text-xs font-semibold text-[#4A3F35] leading-tight text-center",children:"Perlu Konfirmasi"})]}),e.jsxs("div",{className:"bg-white rounded-2xl py-3 px-1.5 sm:py-3.5 sm:px-2 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#10B981] flex items-center justify-center mb-1.5",children:e.jsx("span",{className:"text-xs sm:text-sm font-bold text-[#3D332A]",children:q})}),e.jsx("span",{className:"text-[10px] sm:text-xs font-semibold text-[#4A3F35] leading-tight text-center",children:"Dikonfirmasi"})]}),e.jsxs("div",{className:"bg-white rounded-2xl py-3 px-1.5 sm:py-3.5 sm:px-2 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center mb-1.5",children:e.jsx("span",{className:"text-xs sm:text-sm font-bold text-[#3D332A]",children:Q})}),e.jsx("span",{className:"text-[10px] sm:text-xs font-semibold text-[#4A3F35] leading-tight text-center",children:"Selesai Dirawat"})]})]})]})})})}function dt(){return V()?e.jsx(ie,{role:"doctor",children:e.jsx(ke,{})}):e.jsx(oe,{to:"/login",replace:!0})}export{dt as default};
