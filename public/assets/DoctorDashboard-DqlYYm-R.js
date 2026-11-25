import{j as e}from"./vendor-radix-B35KjGE2.js";import{a as x,N as le}from"./vendor-router-D-FOUPmb.js";import{D as ie}from"./DashboardLayout-C1ER1wAP.js";import{b as de,d as O,P as ce,a as xe,S as me,s as $}from"./index-C3DRhkb7.js";import{D as L,L as pe,T as he,a as ue,b as I,c as g,d as be,e as C}from"./dummyReservations-Bd-ibcQ_.js";import{B as W}from"./button-IZ1i32bg.js";import{u as fe}from"./NewMobileDashboardLayout-BrDrZpvj.js";import{B as ge}from"./building-2-DMVMBGW3.js";import{U as R}from"./user-D8Ymu51c.js";import{P as Ce}from"./phone-B24kCqvT.js";import{C as _}from"./calendar-days-BlsiMLrO.js";import{C as k}from"./calendar-GpQ5R4ID.js";import{C as M}from"./shield-GP1MNw28.js";import{C as ye}from"./chevron-left-CLmCdv2i.js";import{F as De}from"./file-spreadsheet-DNkUY5fN.js";import{F as je}from"./file-text-BdLWstKt.js";import{S as Ne}from"./sparkles-BL741W2T.js";import{E as Se}from"./eye-QTLdM_4_.js";import"./users-DqhFer1-.js";import"./map-pin-BmhBI_TC.js";import"./chevron-down-PnzZ4gYc.js";import"./download-BKeRuIDz.js";import"./log-out-B1ywHxjw.js";import"./vendor-charts-gEYhEoyc.js";import"./vendor-editor-BG8_JKhV.js";import"./message-square-gp3WbKHW.js";import"./check-DW_BQmFh.js";import"./award-DzdVeUkF.js";import"./star-BGIfUuyu.js";import"./check-check-B4373H3r.js";import"./trash-2-DLWXVqfi.js";import"./tag-BPXmdOQb.js";import"./message-square-text-DSpPqHS3.js";async function we(){try{return(await de.get("/doctor/queue")).queue||[]}catch{return[]}}const z="apig_doctor_cached_patients",H=["Min","Sen","Sel","Rab","Kam","Jum","Sab"],J=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];function Be(m){const b=(m||"").toLowerCase();return b==="selesai"||b==="completed"?{bg:"bg-purple-50 text-purple-700 border-purple-200",dot:"bg-purple-500",label:"Selesai"}:b==="dikonfirmasi"||b==="confirmed"||b==="dalam konsultasi"?{bg:"bg-emerald-50 text-emerald-700 border-emerald-200",dot:"bg-emerald-500",label:"Dikonfirmasi"}:b==="dibatalkan"||b==="cancelled"?{bg:"bg-red-50 text-red-700 border-red-200",dot:"bg-red-500",label:"Batal"}:{bg:"bg-amber-50 text-amber-700 border-amber-200",dot:"bg-amber-500",label:"Menunggu"}}function K(m){return m?m.toLowerCase().replace(/^(drg\.|dr\.|drg|dr)\s*/i,"").trim():""}function Fe({onRefresh:m}){const d=O()?.name||"",D=K(d),[w,V]=x.useState(()=>{try{const t=localStorage.getItem(z);return t?JSON.parse(t):[]}catch{return[]}}),[n,v]=x.useState(null),B=x.useRef(!1),F=x.useCallback(async()=>{if(!B.current){B.current=!0;try{const t=await we();if(Array.isArray(t)){V(t);try{localStorage.setItem(z,JSON.stringify(t))}catch{}}m&&m()}catch{}finally{B.current=!1}}},[m]);x.useEffect(()=>{F()},[F]),fe(()=>F());const[A,E]=x.useState(()=>{const t=new Date,a=t.getDay(),s=t.getDate()-a+(a===0?-6:1),r=new Date(t.setDate(s));return r.setHours(0,0,0,0),r}),T=()=>{const t=new Date,a=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${a}-${s}-${r}`},[c,j]=x.useState(()=>T()),h=x.useMemo(()=>{const t=[];for(let a=0;a<6;a++){const s=new Date(A);s.setDate(A.getDate()+a);const r=s.getFullYear(),o=String(s.getMonth()+1).padStart(2,"0"),l=String(s.getDate()).padStart(2,"0"),i=`${r}-${o}-${l}`;t.push({date:s,isoDate:i,dayName:H[s.getDay()],dayNumber:s.getDate(),monthName:J[s.getMonth()]})}return t},[A]),y=x.useMemo(()=>{const t=[],a=new Set;return Array.isArray(w)&&w.forEach(s=>{const r={id:s.id,code:s.code||`RSV-${String(s.id).padStart(6,"0")}`,name:s.patient_name||s.name||"Pasien",phone:s.patient_phone||s.phone||"",treatment_interest:s.treatment_interest||"Pemeriksaan Gigi",doctor:s.doctor||d,date:s.date,preferred_time:s.preferred_time||"10:00 WIB",branch_name:s.branch_name||"Aesthetic Pondok Indah Main Branch",status:s.status||"Dikonfirmasi",complaint:s.complaint||"",createdAt:s.created_at||s.createdAt};a.has(r.code)||(a.add(r.code),t.push(r))}),L.forEach(s=>{const r=K(s.doctor);(!D||r.includes(D)||D.includes(r))&&!a.has(s.code)&&(a.add(s.code),t.push({...s,doctor:d||s.doctor}))}),t.length===0&&L.slice(0,3).forEach(s=>{a.has(s.code)||(a.add(s.code),t.push({...s,doctor:d||s.doctor}))}),t},[w,D,d]),N=x.useMemo(()=>{const t=new Map;return y.forEach(a=>{if(!a.date)return;const s=String(a.date).split("T")[0],r=t.get(s)||[];r.push(a),t.set(s,r)}),t},[y]),U=()=>{E(t=>{const a=new Date(t);return a.setDate(a.getDate()-7),a}),j(null)},Y=()=>{E(t=>{const a=new Date(t);return a.setDate(a.getDate()+7),a}),j(null)},P=x.useMemo(()=>{if(!h||h.length===0)return"";const t=h[0],a=h[h.length-1];return!t||!a?"":`${t.dayNumber} ${t.monthName.slice(0,3)} – ${a.dayNumber} ${a.monthName.slice(0,3)} ${a.date.getFullYear()}`},[h]),p=x.useMemo(()=>{let t=[];return c?t=N.get(c)||[]:h.forEach(a=>{const s=N.get(a.isoDate)||[];t.push(...s)}),t},[c,h,N]),G=y.length,X=y.filter(t=>t.status==="Baru"||t.status==="pending").length,q=y.filter(t=>t.status==="Dikonfirmasi"||t.status==="confirmed"||t.status==="Dalam Konsultasi").length,Q=y.filter(t=>t.status==="Selesai"||t.status==="completed").length,Z=t=>{v(t),$()},ee=()=>{v(null),$()},te=()=>{if(p.length===0)return;const t=c||`Minggu_${P.replace(/[\s–-]+/g,"_")}`,a=p.map((i,u)=>`
        <Row>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${u+1}</Data></Cell>
          <Cell ss:StyleID="CellBold"><Data ss:Type="String">${i.code||`RSV-${i.id}`}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${i.name||"-"}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${i.treatment_interest||"-"}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${i.doctor||d}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${i.date||"-"}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${i.preferred_time||"-"}</Data></Cell>
          <Cell ss:StyleID="CellStatus"><Data ss:Type="String">${i.status||"Menunggu"}</Data></Cell>
        </Row>`).join(""),s=`<?xml version="1.0" encoding="UTF-8"?>
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
   ${a}
  </Table>
 </Worksheet>
</Workbook>`,r=new Blob([s],{type:"application/vnd.ms-excel;charset=utf-8"}),o=URL.createObjectURL(r),l=document.createElement("a");l.href=o,l.download=`Jadwal_Praktik_Dokter_${d.replace(/[^a-zA-Z0-9]/g,"_")}_${t}.xls`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(o)},se=()=>{if(p.length===0)return;const t=c||`Minggu (${P})`,a=document.createElement("iframe");a.style.position="fixed",a.style.right="0",a.style.bottom="0",a.style.width="0",a.style.height="0",a.style.border="none",document.body.appendChild(a);const s=a.contentWindow?.document;if(!s)return;const r=p.map((o,l)=>{const i=(o.status||"").toLowerCase();let u="#fef3c7",f="#92400e";return i.includes("selesai")?(u="#f3e8ff",f="#6b21a8"):i.includes("konfirmasi")?(u="#d1fae5",f="#065f46"):i.includes("batal")&&(u="#fee2e2",f="#991b1b"),`
          <tr style="border-bottom: 1px solid #e5e7eb; ${l%2===1?"background: #fafaf9;":""}">
            <td style="padding: 8px 6px; text-align: center; color: #57534e; font-size: 10px;">${l+1}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10.5px;">${o.code||`RSV-${o.id}`}</td>
            <td style="padding: 8px 6px; color: #1c1917; font-size: 10.5px;">${o.name||"-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px;">${o.treatment_interest||"-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px;">${o.doctor||d}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px;">${o.date||"-"}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px;">${o.preferred_time||"-"}</td>
            <td style="padding: 8px 6px; text-align: center; white-space: nowrap;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; background: ${u}; color: ${f};">
                ${o.status||"Menunggu"}
              </span>
            </td>
          </tr>
        `}).join("");s.open(),s.write(`
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
              ${r}
            </tbody>
          </table>
        </body>
      </html>
    `),s.close(),setTimeout(()=>{a.contentWindow?.focus(),a.contentWindow?.print(),setTimeout(()=>{document.body.contains(a)&&document.body.removeChild(a)},1500)},300)};return e.jsx("div",{className:"space-y-5 text-left",children:e.jsx(ce,{transitionKey:n?`detail_${n.id}`:"list",children:n?e.jsxs("div",{className:"space-y-6 text-left animate-in fade-in duration-150",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-[#EADBBD] shadow-xs",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-bold text-[#4A3F35]",children:"Detail Data Pasien"}),e.jsxs("span",{className:"font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8C6B1C]/10 text-[#8C6B1C] border border-[#8C6B1C]/20",children:["#",n.code||`RSV-${n.id}`]})]}),e.jsx("p",{className:"text-xs text-[#8A7B6B] mt-0.5",children:"Informasi reservasi janji temu klinik Aesthetic Pondok Indah"})]}),e.jsx("div",{className:"flex items-center gap-2 shrink-0",children:e.jsx(W,{type:"button",variant:"outline",onClick:ee,className:"rounded-xl text-xs font-bold px-4 py-2 h-9 border-[#EADBBD] text-[#4A3F35] hover:bg-[#FAF8F5] cursor-pointer",children:"← Kembali ke Jadwal"})})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF5EA]/80 border border-[#EADBBD]",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ge,{className:"w-4 h-4 text-[#8C6B1C]"}),e.jsx("span",{className:"text-xs text-[#8A7B6B]",children:"Cabang:"}),e.jsx("span",{className:"text-xs font-bold text-[#4A3F35]",children:n.branch_name||"Aesthetic Pondok Indah Main Branch"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-[#8A7B6B]",children:"Status:"}),e.jsx("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${n.status==="Selesai"?"bg-emerald-100 text-emerald-800 border border-emerald-300":n.status==="Dikonfirmasi"||n.status==="Dalam Konsultasi"?"bg-blue-100 text-blue-800 border border-blue-300":"bg-amber-100 text-amber-800 border border-amber-300"}`,children:n.status||"Menunggu"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs",children:[e.jsx(R,{className:"w-4 h-4"}),e.jsx("span",{children:"Data Pasien"})]}),e.jsxs("div",{className:"space-y-3 text-xs",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Nama Lengkap"}),e.jsx("span",{className:"font-bold text-[#4A3F35] text-sm truncate block mt-0.5",children:n.patient_name||n.name||"-"})]}),n.phone&&e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"No. Telepon / WhatsApp"}),e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5",children:[e.jsx(Ce,{className:"w-3.5 h-3.5 text-[#C9A24A]"}),e.jsx("span",{children:n.phone})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Dokter Pemeriksa"}),e.jsx("span",{className:"font-semibold text-[#8C6B1C] text-xs block mt-0.5",children:n.doctor||d})]})]})]}),e.jsxs("div",{className:"p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs",children:[e.jsx(_,{className:"w-4 h-4"}),e.jsx("span",{children:"Jadwal & Layanan"})]}),e.jsxs("div",{className:"space-y-3 text-xs",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Tanggal Periksa"}),e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5",children:[e.jsx(k,{className:"w-4 h-4 text-[#C9A24A]"}),e.jsx("span",{children:n.date||"-"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Jam Praktik"}),e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-[#8C6B1C] mt-0.5",children:[e.jsx(M,{className:"w-4 h-4 text-[#C9A24A]"}),e.jsxs("span",{children:[String(n.preferred_time||"Sesuai Jadwal").replace(/\s*WIB\s*$/i,"")," WIB"]})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[#8A7B6B] block text-[11px]",children:"Perawatan yang Dipilih"}),e.jsx("span",{className:"font-semibold text-[#4A3F35] block text-xs mt-0.5",children:n.treatment_interest||"Pemeriksaan Dokter Gigi"})]})]})]})]})]})]}):e.jsxs("div",{className:"space-y-5 animate-in fade-in duration-200",children:[e.jsxs("div",{className:"bg-white rounded-3xl border border-[#F0E6D3] p-5 sm:p-6 shadow-xs space-y-5",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7EFE2]",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx(_,{className:"w-5 h-5 text-[#8C6B1C]"}),e.jsx("div",{children:e.jsx("h3",{className:"text-base font-bold text-[#3D332A]",children:"Kalender Appointment"})})]}),e.jsxs("div",{className:"flex items-center gap-2 self-end sm:self-auto",children:[e.jsx("button",{type:"button",onClick:U,className:"w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8DFC8] hover:bg-[#FAF4E8] text-[#5C4D3C] transition-all cursor-pointer",title:"Minggu Sebelumnya",children:e.jsx(ye,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:Y,className:"w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8DFC8] hover:bg-[#FAF4E8] text-[#5C4D3C] transition-all cursor-pointer",title:"Minggu Berikutnya",children:e.jsx(xe,{className:"w-4 h-4"})})]})]}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5",children:h.map(t=>{const s=(N.get(t.isoDate)||[]).length,r=c===t.isoDate,o=T()===t.isoDate;return e.jsxs("div",{onClick:()=>j(l=>l===t.isoDate?null:t.isoDate),className:`rounded-2xl p-3 border transition-all cursor-pointer text-left flex flex-col justify-between min-h-[105px] ${r?"bg-[#FAF4E8] border-[#C9A24A] shadow-xs ring-2 ring-[#C9A24A]/20":o?"bg-white border-[#B8943F]/60 shadow-2xs hover:border-[#B8943F]":"bg-white border-[#F0E6D3] hover:border-[#D9CDB8] hover:bg-[#FCFAF7]"}`,children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:`text-[11px] font-bold uppercase tracking-wider ${r||o?"text-[#8C6B1C]":"text-[#8A7B6B]"}`,children:t.dayName}),o&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#B8943F]",title:"Hari ini"})]}),e.jsx("div",{className:"text-xl font-bold text-[#3D332A] mt-0.5",children:t.dayNumber})]}),e.jsxs("div",{className:"mt-2 pt-2 border-t border-[#F5ECE0] flex items-center justify-between text-[11px]",children:[e.jsx("span",{className:"text-[#8A7B6B] font-medium",children:"Janji:"}),e.jsx("span",{className:`font-bold px-1.5 py-0.5 rounded-md ${s>0?"bg-[#FAF4E8] text-[#8C6B1C] border border-[#E8DFC8]":"text-[#B8A99A]"}`,children:s})]})]},t.isoDate)})}),e.jsxs("div",{className:"pt-2 space-y-3",children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsx(pe,{className:"w-4 h-4 text-[#8C6B1C]"}),e.jsx("h4",{className:"text-xs font-bold text-[#3D332A] uppercase tracking-wider",children:c?`BOOKING TERJADWAL: ${c}`:"BOOKING TERJADWAL MINGGU INI"}),e.jsxs("span",{className:"text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF4E8] text-[#8C6B1C] border border-[#E8DFC8]",children:[p.length," Pasien"]}),c&&e.jsx("button",{type:"button",onClick:()=>j(null),className:"text-xs font-semibold text-[#8C6B1C] hover:underline cursor-pointer ml-1",children:"Tampilkan Semua Hari"})]}),!c&&e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("button",{type:"button",onClick:te,disabled:p.length===0,className:"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50",title:"Export data ke format Spreadsheet (Excel)",children:[e.jsx(De,{className:"w-3.5 h-3.5 text-emerald-600"}),e.jsx("span",{children:"Export XLSX"})]}),e.jsxs("button",{type:"button",onClick:se,disabled:p.length===0,className:"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50",title:"Cetak atau simpan sebagai dokumen PDF resmi",children:[e.jsx(je,{className:"w-3.5 h-3.5 text-red-600"}),e.jsx("span",{children:"Export PDF"})]})]})]}),p.length===0?e.jsxs("div",{className:"py-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8DFC8] text-[#8A7B6B]",children:[e.jsx(k,{className:"w-7 h-7 mx-auto mb-1.5 opacity-40 text-[#8C6B1C]"}),e.jsx("p",{className:"text-xs font-medium",children:"Tidak ada booking janji temu pada periode ini."})]}):e.jsx("div",{className:"bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-2xs",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(he,{children:[e.jsx(ue,{children:e.jsxs(I,{className:"bg-[#FAF8F5] border-b border-[#F0E6D3]",children:[e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 pl-5 text-xs",children:"Nama"}),e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 text-xs",children:"Layanan"}),e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 text-xs",children:"Dokter"}),e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 text-xs",children:"Jadwal"}),e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 text-xs",children:"Waktu"}),e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 text-xs",children:"Status"}),e.jsx(g,{className:"font-bold text-[#3D332A] py-3.5 pr-5 text-right text-xs",children:"Aksi"})]})}),e.jsx(be,{children:p.map(t=>{const a=Be(t.status),s=t.name||"Pasien",r=t.treatment_interest||"Pemeriksaan Gigi",o=t.doctor||d,l=t.date?String(t.date).split("T")[0]:"-",i=t.preferred_time||"10:00 WIB";let u="-",f=l;if(l!=="-"){const S=new Date(l),ae=S.getDay();u=H[ae]||"";const re=S.getDate(),oe=J[S.getMonth()]?.slice(0,3)||"",ne=S.getFullYear();f=`${re} ${oe} ${ne}`}return e.jsxs(I,{className:"hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]",children:[e.jsx(C,{className:"py-3.5 pl-5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-bold text-[#3D332A]",children:[e.jsx(R,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsx("span",{children:s})]})}),e.jsx(C,{className:"py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#3D332A] max-w-[200px] truncate",children:[e.jsx(Ne,{className:"w-3.5 h-3.5 text-[#C9A24A] shrink-0"}),e.jsx("span",{className:"truncate",children:r})]})}),e.jsx(C,{className:"py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-[#5C4D3C] max-w-[190px] truncate",children:[e.jsx(me,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsx("span",{className:"truncate font-medium",children:o})]})}),e.jsx(C,{className:"py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-semibold text-[#3D332A]",children:[e.jsx(k,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsxs("span",{children:[u,", ",f]})]})}),e.jsx(C,{className:"py-3.5",children:e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-medium text-[#5C4D3C]",children:[e.jsx(M,{className:"w-3.5 h-3.5 text-[#B8943F] shrink-0"}),e.jsx("span",{children:i})]})}),e.jsx(C,{className:"py-3.5",children:e.jsxs("span",{className:`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${a.bg}`,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full ${a.dot}`}),a.label]})}),e.jsx(C,{className:"py-3.5 pr-5 text-right",children:e.jsx(W,{size:"sm",onClick:()=>Z(t),className:"h-7 w-7 p-0 bg-[#FAF4E8] hover:bg-[#F5E6C8] text-[#8A6B2B] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer",title:"Lihat Detail Pasien",children:e.jsx(Se,{className:"w-3.5 h-3.5"})})})]},t.id)})})]})})})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[e.jsxs("div",{className:"bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-10 h-10 rounded-full border-2 border-[#8C6B1C] flex items-center justify-center mb-2",children:e.jsx("span",{className:"text-sm font-bold text-[#3D332A]",children:G})}),e.jsx("span",{className:"text-xs font-semibold text-[#4A3F35]",children:"Total Reservasi"})]}),e.jsxs("div",{className:"bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-10 h-10 rounded-full border-2 border-[#E5A024] flex items-center justify-center mb-2",children:e.jsx("span",{className:"text-sm font-bold text-[#3D332A]",children:X})}),e.jsx("span",{className:"text-xs font-semibold text-[#4A3F35]",children:"Perlu Konfirmasi"})]}),e.jsxs("div",{className:"bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-10 h-10 rounded-full border-2 border-[#10B981] flex items-center justify-center mb-2",children:e.jsx("span",{className:"text-sm font-bold text-[#3D332A]",children:q})}),e.jsx("span",{className:"text-xs font-semibold text-[#4A3F35]",children:"Dikonfirmasi"})]}),e.jsxs("div",{className:"bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center",children:[e.jsx("div",{className:"w-10 h-10 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center mb-2",children:e.jsx("span",{className:"text-sm font-bold text-[#3D332A]",children:Q})}),e.jsx("span",{className:"text-xs font-semibold text-[#4A3F35]",children:"Selesai Dirawat"})]})]})]})})})}function lt(){return O()?e.jsx(ie,{role:"doctor",children:e.jsx(Fe,{})}):e.jsx(le,{to:"/login",replace:!0})}export{lt as default};
