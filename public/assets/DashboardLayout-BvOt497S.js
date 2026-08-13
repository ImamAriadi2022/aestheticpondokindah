import{o as I,J as B,r as i,h as q,m as G,j as e,a as b,U as J,u as ne,i as oe,p as le,q as ie}from"./index-8Hhk7MCO.js";import{b as U,S as $,L as Q,N as de,A as ce,D as xe}from"./NewMobileDashboardLayout-COC5rKz-.js";import{C as L,M as be}from"./message-square-DfWAKbit.js";import{U as W}from"./users-Xg9-2R5b.js";import{F as ue}from"./file-text-DEmIiBHE.js";import{S as he}from"./stethoscope-DmRJEpv5.js";import{C as H}from"./chevron-right-BjnGE2ij.js";import{P as Z}from"./pencil-BpsWLaVI.js";import{D as V}from"./download-CSd5eNHs.js";import{C as pe}from"./chevron-down-CjEO9_g4.js";const me=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Download App",href:"/dashboard/clinic?tab=content-download"}],fe=[{label:"Reservasi",href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",href:"/dashboard/clinic?tab=konsultasi"}],ge=[{label:"Daftar Pengguna",href:"/dashboard/clinic?tab=users"},{label:"Membership",href:"/dashboard/clinic/membership"}],ve={root:{[B.USER]:[{label:"Dashboard",icon:U,href:"/dashboard/user"},{label:"Konsultasi",icon:L,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:I,href:"/dashboard/user?tab=pengaduan"}],[B.CLINIC]:[{label:"Dashboard",icon:U,href:"/dashboard/clinic"},{label:"Sistem Booking",icon:L,href:"/dashboard/clinic?tab=reservasi",submenu:fe},{label:"Pengaduan",icon:I,href:"/dashboard/clinic?tab=pengaduan"},{label:"Konten",icon:ue,href:"/dashboard/clinic?tab=content-blog",submenu:me},{label:"Kelola Pengguna",icon:W,href:"/dashboard/clinic?tab=users",submenu:ge},{label:"Dokter",icon:he,href:"/dashboard/clinic?tab=doctors"},{label:"Pengaturan",icon:$,href:"/dashboard/clinic?tab=settings"}],[B.DOCTOR]:[{label:"Dashboard",icon:U,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:L,href:"/dashboard/doctor?tab=jadwal"},{label:"Reservasi Pasien",icon:W,href:"/dashboard/doctor?tab=reservasi"},{label:"Konsultasi Online",icon:be,href:"/dashboard/doctor?tab=konsultasi"}]}};function X(p){return ve.root[p]??[]}function Ce({onLogout:p}){const[s,m]=i.useState(!1),[u,f]=i.useState(!1),l=i.useRef(null),C=i.useRef(null),A=q(),r=G();i.useEffect(()=>{const n=o=>{l.current&&!l.current.contains(o.target)&&C.current&&!C.current.contains(o.target)&&f(!1)};return document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[]);const k=()=>{m(n=>!n),f(!1)},g=()=>{m(!1),f(!1)},E=n=>{const o=A.pathname,j=new URLSearchParams(A.search).get("tab"),[N,_]=n.split("?");if(o!==N)return!1;const h=_?new URLSearchParams(_).get("tab"):null;return h?j===h:!j},D=X("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${s?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:k,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${s?"rotate-180":"rotate-0"}
            `,"aria-label":s?"Tutup sidebar":"Buka sidebar",children:e.jsx(H,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:D.map(n=>{const o=E(n.href);return e.jsxs(b,{to:n.href,onClick:g,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${o?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${s?"px-3 gap-3":"justify-center px-0"}
                `,children:[o&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${o?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(n.icon,{className:"w-[18px] h-[18px]",strokeWidth:o?2.5:2}),n.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${o?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${s?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:n.label}),!s&&e.jsxs("div",{className:`
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
                  `,children:[n.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},n.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:C,onClick:()=>f(n=>!n),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${u?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${s?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[r?.avatar?e.jsx("img",{src:r.avatar.includes("storage/data:image")?r.avatar.substring(r.avatar.indexOf("data:image")):r.avatar,alt:r?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50 shrink-0
                  `,children:(r?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${s?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:r?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!s&&!u&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:r?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),u&&e.jsxs("div",{ref:l,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[r?.avatar?e.jsx("img",{src:r.avatar.includes("storage/data:image")?r.avatar.substring(r.avatar.indexOf("data:image")):r.avatar,alt:r?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(r?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:r?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:r?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(b,{to:"/profile",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(b,{to:"/profile/edit",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(Z,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil (Foto)"]}),e.jsxs(b,{to:"/settings",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx($,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(b,{to:"/download",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(V,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{f(!1),p()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(Q,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function Ae(){const[p,s]=i.useState(!1);return i.useEffect(()=>{const m=window.matchMedia("(max-width: 767px)"),u=()=>s(m.matches);return u(),m.addEventListener("change",u),()=>m.removeEventListener("change",u)},[]),p}function $e({children:p,role:s,consultationsCount:m=0,activeTreatmentsCount:u=0,availableDoctorsCount:f=0}){const[l,C]=i.useState(!1),[A,r]=i.useState(!1),[k,g]=i.useState([]),[E,D]=i.useState({top:0,left:0}),[n,o]=i.useState(!1),j=i.useRef(null),N=i.useRef(null);i.useEffect(()=>{const t=c=>{j.current&&!j.current.contains(c.target)&&N.current&&!N.current.contains(c.target)&&o(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const _=()=>{C(t=>!t),r(!1),o(!1)},h=()=>{C(!1),r(!1),o(!1)},w=q(),M=ne(),a=G(),Y=(()=>{if(!a)return 0;const t=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],c=t.filter(d=>!!(a[d]||a[d.replace(/([A-Z])/g,"_$1").toLowerCase()]||a[d==="phone"?"whatsapp":d]||a[d==="bloodType"?"blood_type":d]||a[d==="address"?"address_line":d])),x=(a.interests||[]).length>0?1:0;return Math.round((c.length+x)/(t.length+1)*100)})()>=100,ee=Array.isArray(a?.dentalComplaints)&&a?.dentalComplaints?.length>0&&Array.isArray(a?.desiredServices)&&a?.desiredServices?.length>0,R=a?.membership_level||"bronze",z={bronze:{label:"Basic Member",shortLabel:"Basic",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Premium Member",shortLabel:"Premium",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Priority Member",shortLabel:"Priority",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},te=z[R]||z.bronze;a?.membership_status==="active"||a?.membershipStatus==="active"||a?.membership_status==="member"||a?.membershipStatus;const ae=s==="clinic"?"Admin Klinik":s==="doctor"?"Dokter Klinik":s==="user"?te.label:"Client Klinik";i.useEffect(()=>{oe()},[w.pathname,w.search]);const se=X(s),P=()=>{le(),ie(),M("/login")},F=t=>{const c=w.pathname,S=new URLSearchParams(w.search).get("tab"),[x,d]=t.split("?");if(c!==x)return!1;const v=d?new URLSearchParams(d).get("tab"):null;return v?S===v:!S},y=new URLSearchParams(w.search).get("tab")||"dashboard",O=w.pathname,K=["/membership","/settings","/help","/profile"],re=s==="user"&&(y==="reservasi"||y==="konsultasi"||y==="pengaduan")||s==="doctor"&&y!=="dashboard"||s==="clinic"||K.some(t=>O.startsWith(t));return(s==="user"||s==="clinic")&&y==="dashboard"&&K.some(t=>O.startsWith(t)),Ae()?e.jsx(de,{role:s,children:p}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[s==="user"?e.jsx(ce,{userName:a?.name||"User",onLogout:P}):s==="doctor"?e.jsx(Ce,{onLogout:P}):e.jsxs("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:[e.jsxs("aside",{className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${l?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:_,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${l?"rotate-180":"rotate-0"}
                `,"aria-label":l?"Tutup sidebar":"Buka sidebar",children:e.jsx(H,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:se.map(t=>{const c=F(t.href);if(s==="clinic"&&!!t.submenu?.length){const x=t.submenu.some(d=>F(d.href));return e.jsxs("button",{type:"button",onClick:d=>{const v=!A||k!==t.submenu;if(v){const T=d.currentTarget.getBoundingClientRect();D({top:T.top,left:T.right+12})}v&&!x&&M(t.href),g(t.submenu||[]),r(v)},className:`
                        group relative flex items-center
                        h-12 rounded-2xl w-full
                        transition-all duration-300
                        ${x?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                        ${l?"px-3 gap-3":"justify-center px-0"}
                      `,children:[x&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                        flex items-center justify-center w-9 h-9 rounded-xl
                        transition-all duration-300
                        ${x?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                      `,children:e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:x?2.5:2})}),l&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                            flex-1 text-sm font-medium tracking-wide text-left
                            transition-all duration-300
                            ${x?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                          `,children:t.label}),e.jsx(pe,{className:`
                            w-4 h-4 transition-transform duration-300
                            ${x?"text-white":"text-[#A89F91]"}
                            ${A?"rotate-180":""}
                          `})]}),!l&&e.jsxs("div",{className:`
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
                        `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)}return e.jsxs(b,{to:t.href,onClick:h,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${c?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${l?"px-3 gap-3":"justify-center px-0"}
                    `,children:[c&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${c?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:c?2.5:2}),t.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${c?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${l?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:t.label}),!l&&e.jsxs("div",{className:`
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
                      `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:N,onClick:()=>o(t=>!t),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${n?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                    ${l?"px-3 gap-3":"justify-center px-0"}
                  `,children:[e.jsxs("div",{className:"relative",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      `,children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                    overflow-hidden transition-all duration-500
                    ${l?"w-auto opacity-100":"w-0 opacity-0"}
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!l&&!n&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),n&&e.jsxs("div",{ref:j,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:a?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:a?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(b,{to:"/profile",onClick:()=>{o(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(b,{to:"/profile/edit",onClick:()=>{o(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(Z,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil (Foto)"]}),e.jsxs(b,{to:"/settings",onClick:()=>{o(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx($,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(b,{to:"/download",onClick:()=>{o(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(V,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{o(!1),P()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(Q,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]}),A&&e.jsx("div",{className:"fixed z-[60] bg-[#1a1612] border border-[#C9A24A]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 min-w-[180px] pointer-events-auto flex flex-col gap-1",style:{top:E.top,left:E.left},children:k?.map(t=>{const c=F(t.href);return e.jsxs(b,{to:t.href,onClick:h,className:`
                      flex items-center py-2.5 px-3 rounded-xl text-sm
                      transition-all duration-200
                      ${c?"bg-[#C9A24A]/30 text-[#E8C547] font-semibold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                    `,children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full mr-2.5 bg-current"}),t.label]},t.label)})})]}),e.jsx("div",{className:"flex-1 min-w-0 flex flex-col",children:e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:p}),!re&&e.jsx(xe,{session:a,navbarLabel:ae,role:s,consultationsCount:m,activeTreatmentsCount:u,availableDoctorsCount:f})]})})]})}export{$e as D};
