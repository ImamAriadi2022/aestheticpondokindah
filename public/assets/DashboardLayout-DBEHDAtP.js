import{o as O,J as S,r as l,h as I,m as W,j as e,a as b,U as q,u as oe,i as le,p as ie,q as de}from"./index-DOmv3VfZ.js";import{b as F,C as ce,S as J,L as Q,N as xe,A as be,D as ue}from"./NewMobileDashboardLayout-BY_m6qKA.js";import{C as B,M as T}from"./message-square-D82MQ2ad.js";import{U as K}from"./users-j0G6XAnd.js";import{F as he}from"./file-text-CWGZ6J_h.js";import{S as pe}from"./stethoscope-CvNPG7Kx.js";import{C as G}from"./chevron-right-DLSoPtyg.js";import{P as H}from"./pencil-CnI_0Dgo.js";import{D as Z}from"./download-DYIB5ArL.js";import{C as me}from"./chevron-down-DauvlXkQ.js";const V=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Download App",href:"/dashboard/clinic?tab=content-download"}],fe={root:{[S.USER]:[{label:"Dashboard",icon:F,href:"/dashboard/user"},{label:"Konsultasi",icon:B,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:O,href:"/dashboard/user?tab=pengaduan"}],[S.CLINIC]:[{label:"Dashboard",icon:F,href:"/dashboard/clinic"},{label:"Reservasi",icon:B,href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",icon:T,href:"/dashboard/clinic?tab=konsultasi"},{label:"Pengaduan",icon:O,href:"/dashboard/clinic?tab=pengaduan"},{label:"Konten",icon:he,href:"/dashboard/clinic?tab=content-blog",submenu:V},{label:"Pengguna",icon:K,href:"/dashboard/clinic?tab=users"},{label:"Membership",icon:ce,href:"/dashboard/clinic/membership"},{label:"Dokter",icon:pe,href:"/dashboard/clinic?tab=doctors"}],[S.DOCTOR]:[{label:"Dashboard",icon:F,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:B,href:"/dashboard/doctor?tab=jadwal"},{label:"Reservasi Pasien",icon:K,href:"/dashboard/doctor?tab=reservasi"},{label:"Konsultasi Online",icon:T,href:"/dashboard/doctor?tab=konsultasi"}]}};function X(m){return fe.root[m]??[]}function ge({onLogout:m}){const[s,f]=l.useState(!1),[h,v]=l.useState(!1),o=l.useRef(null),C=l.useRef(null),A=I(),n=W();l.useEffect(()=>{const r=d=>{o.current&&!o.current.contains(d.target)&&C.current&&!C.current.contains(d.target)&&v(!1)};return document.addEventListener("mousedown",r),()=>document.removeEventListener("mousedown",r)},[]);const N=()=>{f(r=>!r),v(!1)},g=()=>{f(!1),v(!1)},_=r=>{const d=A.pathname,j=new URLSearchParams(A.search).get("tab"),[D,p]=r.split("?");if(d!==D)return!1;const u=p?new URLSearchParams(p).get("tab"):null;return u?j===u:!j},y=X("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${s?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:N,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${s?"rotate-180":"rotate-0"}
            `,"aria-label":s?"Tutup sidebar":"Buka sidebar",children:e.jsx(G,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:y.map(r=>{const d=_(r.href);return e.jsxs(b,{to:r.href,onClick:g,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${d?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${s?"px-3 gap-3":"justify-center px-0"}
                `,children:[d&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${d?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(r.icon,{className:"w-[18px] h-[18px]",strokeWidth:d?2.5:2}),r.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${d?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${s?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:r.label}),!s&&e.jsxs("div",{className:`
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
                  `,children:[r.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},r.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:C,onClick:()=>v(r=>!r),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${h?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${s?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[n?.avatar?e.jsx("img",{src:n.avatar.includes("storage/data:image")?n.avatar.substring(n.avatar.indexOf("data:image")):n.avatar,alt:n?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50 shrink-0
                  `,children:(n?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${s?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:n?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!s&&!h&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:n?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),h&&e.jsxs("div",{ref:o,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[n?.avatar?e.jsx("img",{src:n.avatar.includes("storage/data:image")?n.avatar.substring(n.avatar.indexOf("data:image")):n.avatar,alt:n?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(n?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:n?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:n?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(b,{to:"/profile",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(q,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(b,{to:"/profile/edit",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(H,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil (Foto)"]}),e.jsxs(b,{to:"/settings",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(b,{to:"/download",onClick:g,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(Z,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{v(!1),m()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(Q,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function ve(){const[m,s]=l.useState(!1);return l.useEffect(()=>{const f=window.matchMedia("(max-width: 767px)"),h=()=>s(f.matches);return h(),f.addEventListener("change",h),()=>f.removeEventListener("change",h)},[]),m}function Le({children:m,role:s,consultationsCount:f=0,activeTreatmentsCount:h=0,availableDoctorsCount:v=0}){const[o,C]=l.useState(!1),[A,n]=l.useState(!1),N=l.useRef(null),[g,_]=l.useState({top:0,left:0}),[y,r]=l.useState(!1),d=l.useRef(null),j=l.useRef(null);l.useEffect(()=>{const t=c=>{d.current&&!d.current.contains(c.target)&&j.current&&!j.current.contains(c.target)&&r(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const D=()=>{C(t=>!t),n(!1),r(!1)},p=()=>{C(!1),n(!1),r(!1)},u=I(),L=oe(),a=W(),Y=(()=>{if(!a)return 0;const t=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],c=t.filter(i=>!!(a[i]||a[i.replace(/([A-Z])/g,"_$1").toLowerCase()]||a[i==="phone"?"whatsapp":i]||a[i==="bloodType"?"blood_type":i]||a[i==="address"?"address_line":i])),x=(a.interests||[]).length>0?1:0;return Math.round((c.length+x)/(t.length+1)*100)})()>=100,ee=Array.isArray(a?.dentalComplaints)&&a?.dentalComplaints?.length>0&&Array.isArray(a?.desiredServices)&&a?.desiredServices?.length>0,U=a?.membership_level||"bronze",$={bronze:{label:"Basic Member",shortLabel:"Basic",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Premium Member",shortLabel:"Premium",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Priority Member",shortLabel:"Priority",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},te=$[U]||$.bronze;a?.membership_status==="active"||a?.membershipStatus==="active"||a?.membership_status==="member"||a?.membershipStatus;const ae=s==="clinic"?"Admin Klinik":s==="doctor"?"Dokter Klinik":s==="user"?te.label:"Client Klinik";l.useEffect(()=>{le()},[u.pathname,u.search]);const se=X(s),P=()=>{ie(),de(),L("/login")},R=t=>{const c=u.pathname,E=new URLSearchParams(u.search).get("tab"),[x,i]=t.split("?");if(c!==x)return!1;const w=i?new URLSearchParams(i).get("tab"):null;return w?E===w:!E},re=()=>{if(s!=="clinic")return!1;const t=new URLSearchParams(u.search).get("tab")||"dashboard";return t==="content"||t.startsWith("content-")},k=new URLSearchParams(u.search).get("tab")||"dashboard",z=u.pathname,M=["/membership","/settings","/help","/profile"],ne=s==="user"&&(k==="reservasi"||k==="konsultasi"||k==="pengaduan")||s==="doctor"&&k!=="dashboard"||s==="clinic"||M.some(t=>z.startsWith(t));return(s==="user"||s==="clinic")&&k==="dashboard"&&M.some(t=>z.startsWith(t)),ve()?e.jsx(xe,{role:s,children:m}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[s==="user"?e.jsx(be,{userName:a?.name||"User",onLogout:P}):s==="doctor"?e.jsx(ge,{onLogout:P}):e.jsxs("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:[e.jsxs("aside",{className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${o?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:D,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${o?"rotate-180":"rotate-0"}
                `,"aria-label":o?"Tutup sidebar":"Buka sidebar",children:e.jsx(G,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:se.map(t=>{const c=R(t.href);if(s==="clinic"&&t.label==="Konten"){const x=re();return e.jsxs("button",{ref:N,type:"button",onClick:()=>{const i=!A;if(i&&N.current){const w=N.current.getBoundingClientRect();_({top:w.top,left:w.right+12})}i&&!x&&L(t.href),n(i)},className:`
                        group relative flex items-center
                        h-12 rounded-2xl w-full
                        transition-all duration-300
                        ${x?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                        ${o?"px-3 gap-3":"justify-center px-0"}
                      `,children:[x&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                        flex items-center justify-center w-9 h-9 rounded-xl
                        transition-all duration-300
                        ${x?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                      `,children:e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:x?2.5:2})}),o&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                            flex-1 text-sm font-medium tracking-wide text-left
                            transition-all duration-300
                            ${x?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                          `,children:t.label}),e.jsx(me,{className:`
                            w-4 h-4 transition-transform duration-300
                            ${x?"text-white":"text-[#A89F91]"}
                            ${A?"rotate-180":""}
                          `})]}),!o&&e.jsxs("div",{className:`
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
                        `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)}return e.jsxs(b,{to:t.href,onClick:p,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${c?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${o?"px-3 gap-3":"justify-center px-0"}
                    `,children:[c&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${c?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:c?2.5:2}),t.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${c?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${o?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:t.label}),!o&&e.jsxs("div",{className:`
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
                      `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:j,onClick:()=>r(t=>!t),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${y?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                    ${o?"px-3 gap-3":"justify-center px-0"}
                  `,children:[e.jsxs("div",{className:"relative",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      `,children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                    overflow-hidden transition-all duration-500
                    ${o?"w-auto opacity-100":"w-0 opacity-0"}
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!o&&!y&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),y&&e.jsxs("div",{ref:d,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:a?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:a?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(b,{to:"/profile",onClick:()=>{r(!1),p()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(q,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(b,{to:"/profile/edit",onClick:()=>{r(!1),p()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(H,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil (Foto)"]}),e.jsxs(b,{to:"/settings",onClick:()=>{r(!1),p()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(b,{to:"/download",onClick:()=>{r(!1),p()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(Z,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{r(!1),P()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(Q,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]}),A&&e.jsx("div",{className:"fixed z-[60] bg-[#1a1612] border border-[#C9A24A]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 min-w-[180px] pointer-events-auto flex flex-col gap-1",style:{top:g.top,left:g.left},children:V?.map(t=>{const c=R(t.href);return e.jsxs(b,{to:t.href,onClick:p,className:`
                      flex items-center py-2.5 px-3 rounded-xl text-sm
                      transition-all duration-200
                      ${c?"bg-[#C9A24A]/30 text-[#E8C547] font-semibold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                    `,children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full mr-2.5 bg-current"}),t.label]},t.label)})})]}),e.jsx("div",{className:"flex-1 min-w-0 flex flex-col",children:e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:m}),!ne&&e.jsx(ue,{session:a,navbarLabel:ae,role:s,consultationsCount:f,activeTreatmentsCount:h,availableDoctorsCount:v})]})})]})}export{Le as D};
