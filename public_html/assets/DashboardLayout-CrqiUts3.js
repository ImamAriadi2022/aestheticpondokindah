import{m as G,J as L,f as M,u as ee,r as i,i as $,j as e,L as c,U as z,p as te,q as ae,H as B,t as pe}from"./index-e-Ey1v3X.js";import{L as F,A as fe,D as ge}from"./DashboardRightPanel-DuM5mYsG.js";import{C as S,M as se}from"./map-pin-RpyyZv0q.js";import{C as re}from"./chevron-down-CivoIbFB.js";import{C as ve,B as je,S as K,L as O,M as V,b as U}from"./settings-BltEnI39.js";import{P as T}from"./pencil-CT0pNZq9.js";import{D as I}from"./download-BeZsi4k_.js";import{C as R}from"./calendar-days-DNuW0kVy.js";import{S as ne}from"./stethoscope-BQh1Bggv.js";import{U as X}from"./users-q1JNcYzC.js";import{M as Y}from"./message-square-CTFul8M3.js";import{F as we}from"./file-text-B4zOYERz.js";import{C as oe}from"./chevron-right-CEE3gUsC.js";const le=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Download App",href:"/dashboard/clinic?tab=content-download"}],Ne={root:{[L.USER]:[{label:"Dashboard",icon:F,href:"/dashboard/user"},{label:"Konsultasi",icon:S,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:G,href:"/dashboard/user?tab=pengaduan"}],[L.CLINIC]:[{label:"Dashboard",icon:F,href:"/dashboard/clinic"},{label:"Reservasi",icon:S,href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",icon:Y,href:"/dashboard/clinic?tab=konsultasi"},{label:"Pengaduan",icon:G,href:"/dashboard/clinic?tab=pengaduan"},{label:"Konten",icon:we,href:"/dashboard/clinic?tab=content-blog",submenu:le},{label:"Pengguna",icon:X,href:"/dashboard/clinic?tab=users"},{label:"Membership",icon:ve,href:"/dashboard/clinic/membership"},{label:"Dokter",icon:ne,href:"/dashboard/clinic?tab=doctors"},{label:"Cabang Klinik",icon:se,href:"/dashboard/clinic?tab=branches"}],[L.DOCTOR]:[{label:"Dashboard",icon:F,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:S,href:"/dashboard/doctor?tab=jadwal"},{label:"Reservasi Pasien",icon:X,href:"/dashboard/doctor?tab=reservasi"},{label:"Konsultasi Online",icon:Y,href:"/dashboard/doctor?tab=konsultasi"}]}};function ie(g){return Ne.root[g]??[]}function Ce({children:g,role:r}){const h=M(),p=ee(),[v,n]=i.useState(!1),j=i.useRef(null),d=$();d?.membership_status==="active"||d?.membershipStatus==="active"||d?.membership_status==="member"||d?.membershipStatus;const o=()=>{if(r==="clinic")return"Admin Klinik";if(r==="doctor")return"Dokter Klinik";if(r==="user"){const t=d?.membership_level;return t==="gold"?"Premium Member":t==="platinum"?"Priority Member":"Basic Member"}return"Client Klinik"};i.useEffect(()=>{n(!1)},[h.pathname,h.search]),i.useEffect(()=>{const t=l=>{j.current&&!j.current.contains(l.target)&&n(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const w=(()=>{switch(r){case"user":return[{label:"Beranda",icon:B,href:"/dashboard/user"},{label:"Reservasi",icon:R,href:"/dashboard/user?tab=reservasi"},{label:"Konsultasi",icon:V,href:"/dashboard/user?tab=konsultasi"},{label:"Profil",icon:U,href:"/settings"}];case"clinic":return[{label:"Beranda",icon:B,href:"/dashboard/clinic"},{label:"Reservasi",icon:R,href:"/dashboard/clinic?tab=reservasi"},{label:"Dokter",icon:ne,href:"/dashboard/clinic?tab=doctors"},{label:"Profil",icon:U,href:"/settings"}];case"doctor":return[{label:"Beranda",icon:B,href:"/dashboard/doctor"},{label:"Jadwal",icon:R,href:"/dashboard/doctor?tab=jadwal"},{label:"Reservasi",icon:S,href:"/dashboard/doctor?tab=reservasi"},{label:"Konsultasi",icon:V,href:"/dashboard/doctor?tab=konsultasi"},{label:"Profil",icon:U,href:"/settings"}];default:return[]}})(),k=t=>{const l=h.pathname,N=new URLSearchParams(h.search).get("tab"),[E,u]=t.split("?");if(l!==E)return!1;const m=u?new URLSearchParams(u).get("tab"):null;return m?N===m:!N},C=()=>{te(),ae(),p("/login")};return e.jsxs("div",{className:"min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto relative shadow-2xl pb-20",children:[e.jsx("header",{className:"sticky top-0 z-30 bg-white",children:e.jsxs("div",{className:"flex items-center justify-between px-4 py-3",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-1 text-xs text-gray-500",children:[e.jsx(se,{className:"w-3 h-3 text-[#c9a24a]"}),e.jsx("span",{className:"truncate",children:"Aesthetic Pondok Indah"}),e.jsx(re,{className:"w-3 h-3"})]}),e.jsxs("h1",{className:"text-sm font-bold text-gray-900 truncate",children:["Halo, ",d?.name?.split(" ")[0]||"Pengguna","!"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",className:"relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center","aria-label":"Notifikasi",children:[e.jsx(je,{className:"w-4 h-4 text-gray-700"}),e.jsx("span",{className:"absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"})]}),e.jsxs("div",{className:"relative",ref:j,children:[e.jsx("button",{type:"button",onClick:()=>n(!v),className:"w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white font-bold text-xs",children:(d?.name||"U")[0].toUpperCase()}),v&&e.jsxs("div",{className:"absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 py-3 z-50",children:[e.jsxs("div",{className:"px-4 py-3 border-b border-gray-100 mb-1",children:[e.jsx("p",{className:"text-sm font-semibold text-gray-900",children:d?.name||"User"}),e.jsx("p",{className:"text-xs text-gray-500",children:o()})]}),e.jsxs(c,{to:"/profile",onClick:()=>n(!1),className:"flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors",children:[e.jsx(z,{className:"w-4 h-4 text-gray-500"}),"Detail Profil"]}),e.jsxs(c,{to:"/profile/edit",onClick:()=>n(!1),className:"flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors",children:[e.jsx(T,{className:"w-4 h-4 text-gray-500"}),"Edit Profil (Foto)"]}),e.jsxs(c,{to:"/settings",onClick:()=>n(!1),className:"flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors",children:[e.jsx(K,{className:"w-4 h-4 text-gray-500"}),"Pengaturan"]}),e.jsxs(c,{to:"/download",onClick:()=>n(!1),className:"flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors",children:[e.jsx(I,{className:"w-4 h-4 text-gray-500"}),"Download Aplikasi"]}),e.jsx("div",{className:"border-t border-gray-100 my-2 mx-3"}),e.jsxs("button",{onClick:()=>{n(!1),C()},className:"flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl mx-1 transition-colors w-full",children:[e.jsx(O,{className:"w-4 h-4"}),"Keluar Sesi"]})]})]})]})]})}),e.jsx("main",{className:"flex-1 overflow-y-auto pt-4 pb-20 px-4 scrollbar-hide",children:g}),e.jsx("nav",{className:"fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto",children:e.jsx("div",{className:"relative",children:e.jsxs("div",{className:"bg-slate-900 rounded-t-[32px] shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.4)]",children:[e.jsx("div",{className:"absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"}),e.jsx("div",{className:"flex items-end justify-around px-2 pb-3 pt-2",children:w.map(t=>{const l=k(t.href);return e.jsxs(c,{to:t.href,className:"relative flex flex-col items-center group w-16",children:[l&&e.jsx("div",{className:"absolute -top-7 left-1/2 -translate-x-1/2",children:e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl"}),e.jsxs("div",{className:"relative w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center",children:[e.jsx("svg",{className:"absolute -left-4 top-4 w-4 h-8 text-slate-900",viewBox:"0 0 16 32",fill:"currentColor",preserveAspectRatio:"none",children:e.jsx("path",{d:"M16 0 C4 8, 0 16, 0 32 L16 32 Z"})}),e.jsx("svg",{className:"absolute -right-4 top-4 w-4 h-8 text-slate-900",viewBox:"0 0 16 32",fill:"currentColor",preserveAspectRatio:"none",children:e.jsx("path",{d:"M0 0 C12 8, 16 16, 16 32 L0 32 Z"})}),e.jsx("div",{className:"w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-slate-900",children:e.jsx(t.icon,{className:"w-6 h-6 text-white",strokeWidth:2})})]})]})}),!l&&e.jsxs("div",{className:"flex flex-col items-center gap-1.5 py-2 px-3 transition-all duration-300",children:[e.jsxs("div",{className:"relative",children:[e.jsx(t.icon,{className:"w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors duration-300",strokeWidth:1.5}),t.badge&&e.jsx("span",{className:"absolute -top-1 -right-2 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-slate-900 shadow-sm",children:t.badge>9?"9+":t.badge})]}),e.jsx("span",{className:"text-[10px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors duration-300 tracking-wide",children:t.label})]}),l&&e.jsx("div",{className:"flex flex-col items-center mt-9",children:e.jsx("span",{className:"text-[10px] font-semibold text-emerald-400 tracking-wide",children:t.label})})]},t.label)})}),e.jsx("div",{className:"h-[env(safe-area-inset-bottom)] bg-slate-900"})]})})})]})}function Ae({onLogout:g}){const[r,h]=i.useState(!1),[p,v]=i.useState(!1),n=i.useRef(null),j=i.useRef(null),d=M(),o=$();i.useEffect(()=>{const t=l=>{n.current&&!n.current.contains(l.target)&&j.current&&!j.current.contains(l.target)&&v(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const A=()=>{h(t=>!t),v(!1)},w=()=>{h(!1),v(!1)},k=t=>{const l=d.pathname,N=new URLSearchParams(d.search).get("tab"),[E,u]=t.split("?");if(l!==E)return!1;const m=u?new URLSearchParams(u).get("tab"):null;return m?N===m:!N},C=ie("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${r?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:A,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${r?"rotate-180":"rotate-0"}
            `,"aria-label":r?"Tutup sidebar":"Buka sidebar",children:e.jsx(oe,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:C.map(t=>{const l=k(t.href);return e.jsxs(c,{to:t.href,onClick:w,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${l?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${r?"px-3 gap-3":"justify-center px-0"}
                `,children:[l&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${l?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:l?2.5:2}),t.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${l?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${r?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:t.label}),!r&&e.jsxs("div",{className:`
                    absolute left-full ml-3 px-3 py-1.5
                    bg-[#1a1612] backdrop-blur-sm
                    border border-[#C9A24A]/40 rounded-lg
                    text-xs text-[#E8C547] font-medium
                    whitespace-nowrap
                    opacity-0 invisible
                    group-hover:opacity-100 group-hover:visible
                    transition-all duration-200
                    shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                    z-50
                  `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:j,onClick:()=>v(t=>!t),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${p?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${r?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[o?.avatar?e.jsx("img",{src:o.avatar.includes("storage/data:image")?o.avatar.substring(o.avatar.indexOf("data:image")):o.avatar,alt:o?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50 shrink-0
                  `,children:(o?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${r?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:o?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!r&&!p&&e.jsxs("div",{className:`
                  absolute left-full ml-3 px-3 py-2
                  bg-[#1a1612] backdrop-blur-sm
                  border border-[#C9A24A]/40 rounded-lg
                  text-sm text-[#E8C547] font-medium
                  whitespace-nowrap
                  opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                  z-50
                `,children:[e.jsx("p",{className:"font-semibold",children:o?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),p&&e.jsxs("div",{ref:n,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[o?.avatar?e.jsx("img",{src:o.avatar.includes("storage/data:image")?o.avatar.substring(o.avatar.indexOf("data:image")):o.avatar,alt:o?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(o?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:o?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:o?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(c,{to:"/profile",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(z,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(c,{to:"/profile/edit",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(T,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil (Foto)"]}),e.jsxs(c,{to:"/settings",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(K,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(c,{to:"/download",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(I,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{v(!1),g()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(O,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function ye(){const[g,r]=i.useState(!1);return i.useEffect(()=>{const h=window.matchMedia("(max-width: 767px)"),p=()=>r(h.matches);return p(),h.addEventListener("change",p),()=>h.removeEventListener("change",p)},[]),g}function Ie({children:g,role:r,consultationsCount:h=0,activeTreatmentsCount:p=0,availableDoctorsCount:v=0}){const[n,j]=i.useState(!1),[d,o]=i.useState(!1),A=i.useRef(null),[w,k]=i.useState({top:0,left:0}),[C,t]=i.useState(!1),l=i.useRef(null),N=i.useRef(null);i.useEffect(()=>{const a=b=>{l.current&&!l.current.contains(b.target)&&N.current&&!N.current.contains(b.target)&&t(!1)};return document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[]);const E=()=>{j(a=>!a),o(!1),t(!1)},u=()=>{j(!1),o(!1),t(!1)},m=M(),W=ee(),s=$(),ce=(()=>{if(!s)return 0;const a=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],b=a.filter(x=>!!(s[x]||s[x.replace(/([A-Z])/g,"_$1").toLowerCase()]||s[x==="phone"?"whatsapp":x]||s[x==="bloodType"?"blood_type":x]||s[x==="address"?"address_line":x])),f=(s.interests||[]).length>0?1:0;return Math.round((b.length+f)/(a.length+1)*100)})()>=100,de=Array.isArray(s?.dentalComplaints)&&s?.dentalComplaints?.length>0&&Array.isArray(s?.desiredServices)&&s?.desiredServices?.length>0,q=s?.membership_level||"bronze",H={bronze:{label:"Basic Member",shortLabel:"Basic",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Premium Member",shortLabel:"Premium",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Priority Member",shortLabel:"Priority",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},xe=H[q]||H.bronze;s?.membership_status==="active"||s?.membershipStatus==="active"||s?.membership_status==="member"||s?.membershipStatus;const be=r==="clinic"?"Admin Klinik":r==="doctor"?"Dokter Klinik":r==="user"?xe.label:"Client Klinik";i.useEffect(()=>{pe()},[m.pathname,m.search]);const he=ie(r),D=()=>{te(),ae(),W("/login")},J=a=>{const b=m.pathname,P=new URLSearchParams(m.search).get("tab"),[f,x]=a.split("?");if(b!==f)return!1;const y=x?new URLSearchParams(x).get("tab"):null;return y?P===y:!P},me=()=>{if(r!=="clinic")return!1;const a=new URLSearchParams(m.search).get("tab")||"dashboard";return a==="content"||a.startsWith("content-")},_=new URLSearchParams(m.search).get("tab")||"dashboard",Q=m.pathname,Z=["/membership","/settings","/help","/profile"],ue=r==="user"&&(_==="reservasi"||_==="konsultasi"||_==="pengaduan")||r==="doctor"&&_!=="dashboard"||r==="clinic"||Z.some(a=>Q.startsWith(a));return(r==="user"||r==="clinic")&&_==="dashboard"&&Z.some(a=>Q.startsWith(a)),ye()?e.jsx(Ce,{role:r,children:g}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[r==="user"?e.jsx(fe,{userName:s?.name||"User",onLogout:D}):r==="doctor"?e.jsx(Ae,{onLogout:D}):e.jsxs("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:[e.jsxs("aside",{className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${n?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:E,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${n?"rotate-180":"rotate-0"}
                `,"aria-label":n?"Tutup sidebar":"Buka sidebar",children:e.jsx(oe,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:he.map(a=>{const b=J(a.href);if(r==="clinic"&&a.label==="Konten"){const f=me();return e.jsxs("button",{ref:A,type:"button",onClick:()=>{const x=!d;if(x&&A.current){const y=A.current.getBoundingClientRect();k({top:y.top,left:y.right+12})}x&&!f&&W(a.href),o(x)},className:`
                        group relative flex items-center
                        h-12 rounded-2xl w-full
                        transition-all duration-300
                        ${f?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                        ${n?"px-3 gap-3":"justify-center px-0"}
                      `,children:[f&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                        flex items-center justify-center w-9 h-9 rounded-xl
                        transition-all duration-300
                        ${f?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                      `,children:e.jsx(a.icon,{className:"w-[18px] h-[18px]",strokeWidth:f?2.5:2})}),n&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                            flex-1 text-sm font-medium tracking-wide text-left
                            transition-all duration-300
                            ${f?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                          `,children:a.label}),e.jsx(re,{className:`
                            w-4 h-4 transition-transform duration-300
                            ${f?"text-white":"text-[#A89F91]"}
                            ${d?"rotate-180":""}
                          `})]}),!n&&e.jsxs("div",{className:`
                          absolute left-full ml-3 px-3 py-1.5
                          bg-[#1a1612] backdrop-blur-sm
                          border border-[#C9A24A]/40 rounded-lg
                          text-xs text-[#E8C547] font-medium
                          whitespace-nowrap
                          opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible
                          transition-all duration-200
                          shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                          z-50
                        `,children:[a.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},a.label)}return e.jsxs(c,{to:a.href,onClick:u,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${b?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${n?"px-3 gap-3":"justify-center px-0"}
                    `,children:[b&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${b?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(a.icon,{className:"w-[18px] h-[18px]",strokeWidth:b?2.5:2}),a.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${b?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${n?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:a.label}),!n&&e.jsxs("div",{className:`
                        absolute left-full ml-3 px-3 py-1.5
                        bg-[#1a1612] backdrop-blur-sm
                        border border-[#C9A24A]/40 rounded-lg
                        text-xs text-[#E8C547] font-medium
                        whitespace-nowrap
                        opacity-0 invisible
                        group-hover:opacity-100 group-hover:visible
                        transition-all duration-200
                        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                        z-50
                      `,children:[a.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},a.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:N,onClick:()=>t(a=>!a),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${C?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                    ${n?"px-3 gap-3":"justify-center px-0"}
                  `,children:[e.jsxs("div",{className:"relative",children:[s?.avatar?e.jsx("img",{src:s.avatar.includes("storage/data:image")?s.avatar.substring(s.avatar.indexOf("data:image")):s.avatar,alt:s?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      `,children:(s?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                    overflow-hidden transition-all duration-500
                    ${n?"w-auto opacity-100":"w-0 opacity-0"}
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:s?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!n&&!C&&e.jsxs("div",{className:`
                      absolute left-full ml-3 px-3 py-2
                      bg-[#1a1612] backdrop-blur-sm
                      border border-[#C9A24A]/40 rounded-lg
                      text-sm text-[#E8C547] font-medium
                      whitespace-nowrap
                      opacity-0 invisible
                      group-hover:opacity-100 group-hover:visible
                      transition-all duration-200
                      shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                      z-50
                    `,children:[e.jsx("p",{className:"font-semibold",children:s?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),C&&e.jsxs("div",{ref:l,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[s?.avatar?e.jsx("img",{src:s.avatar.includes("storage/data:image")?s.avatar.substring(s.avatar.indexOf("data:image")):s.avatar,alt:s?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(s?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:s?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:s?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(c,{to:"/profile",onClick:()=>{t(!1),u()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(z,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(c,{to:"/profile/edit",onClick:()=>{t(!1),u()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(T,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil (Foto)"]}),e.jsxs(c,{to:"/settings",onClick:()=>{t(!1),u()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(K,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(c,{to:"/download",onClick:()=>{t(!1),u()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(I,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{t(!1),D()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(O,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]}),d&&e.jsx("div",{className:"fixed z-[60] bg-[#1a1612] border border-[#C9A24A]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 min-w-[180px] pointer-events-auto flex flex-col gap-1",style:{top:w.top,left:w.left},children:le?.map(a=>{const b=J(a.href);return e.jsxs(c,{to:a.href,onClick:u,className:`
                      flex items-center py-2.5 px-3 rounded-xl text-sm
                      transition-all duration-200
                      ${b?"bg-[#C9A24A]/30 text-[#E8C547] font-semibold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                    `,children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full mr-2.5 bg-current"}),a.label]},a.label)})})]}),e.jsx("div",{className:"flex-1 min-w-0 flex flex-col",children:e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:g}),!ue&&e.jsx(ge,{session:s,navbarLabel:be,role:r,consultationsCount:h,activeTreatmentsCount:p,availableDoctorsCount:v})]})})]})}export{Ie as D};
