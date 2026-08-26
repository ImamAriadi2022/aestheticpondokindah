import{c as re,x as ne,a3 as P,r as d,n as G,q,j as e,b as Q,a as x,U as H,u as oe,o as le,D as ie,E as de}from"./index-Bz19Q9Pa.js";import{L as M,S as J,N as ce,A as be,U as xe,D as ue,a as pe}from"./NewMobileDashboardLayout-ChA-FWd6.js";import{C as z}from"./message-square-DgiqNUYJ.js";import{U as W}from"./users-TwvTqmHw.js";import{F as V}from"./file-text-CzkS3pp7.js";import{C as Z}from"./chevron-down-DS6synj6.js";import{D as X}from"./download-Cn4zyTqm.js";import{L as Y}from"./log-out-CO0vpkYj.js";const he=[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7",key:"ztvudi"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",key:"1b2hhj"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4",key:"2ebpfo"}],["path",{d:"M2 7h20",key:"1fcdvo"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7",key:"6c3vgh"}]],me=re("store",he),fe=[{label:"Edit Beranda",href:"/dashboard/clinic?tab=etalase-beranda"},{label:"Edit Tentang",href:"/dashboard/clinic?tab=etalase-tentang"}],ge=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Daftar Aplikasi Mobile",href:"/dashboard/clinic?tab=content-download"}],ve=[{label:"Booking",href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",href:"/dashboard/clinic?tab=konsultasi"},{label:"Pengaduan",href:"/dashboard/clinic?tab=pengaduan"}],Ae=[{label:"Pengguna",href:"/dashboard/clinic?tab=users"},{label:"Dokter",href:"/dashboard/clinic?tab=doctors"},{label:"Membership",href:"/dashboard/clinic/membership"}],Ce={root:{[P.USER]:[{label:"Dashboard",icon:M,href:"/dashboard/user"},{label:"Konsultasi",icon:z,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:ne,href:"/dashboard/user?tab=pengaduan"}],[P.CLINIC]:[{label:"Dashboard",icon:M,href:"/dashboard/clinic"},{label:"Etalase",icon:me,href:"/dashboard/clinic?tab=etalase-beranda",submenu:fe},{label:"Sistem Booking",icon:z,href:"/dashboard/clinic?tab=reservasi",submenu:ve},{label:"Konten",icon:V,href:"/dashboard/clinic?tab=content-blog",submenu:ge},{label:"Kelola Pengguna",icon:W,href:"/dashboard/clinic?tab=users",submenu:Ae}],[P.DOCTOR]:[{label:"Dashboard",icon:M,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:z,href:"/dashboard/doctor?tab=jadwal"},{label:"Daftar Pasien",icon:W,href:"/dashboard/doctor?tab=reservasi"}]}};function ee(v){return Ce.root[v]??[]}function je({onLogout:v}){const[t,A]=d.useState(!1),[N,k]=d.useState(null),[o,m]=d.useState(!1),S=d.useRef(null),C=d.useRef(null),F=d.useRef(null),b=G(),n=q();d.useEffect(()=>{const s=u=>{const a=u.target;S.current&&!S.current.contains(a)&&(m(!1),k(null))};return document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[]);const $=()=>{A(s=>!s),k(null),m(!1)},j=()=>{A(!1),k(null),m(!1)},E=s=>{const u=b.pathname,a=new URLSearchParams(b.search).get("tab"),[g,w]=s.split("?");if(u!==g)return!1;const l=w?new URLSearchParams(w).get("tab"):null;return l?a===l:!a},f=ee("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{ref:S,className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${t?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:$,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${t?"rotate-180":"rotate-0"}
            `,"aria-label":t?"Tutup sidebar":"Buka sidebar",children:e.jsx(Q,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:f.map(s=>{const u=E(s.href);if(!!s.submenu?.length){const g=s.submenu.some(l=>E(l.href)),w=N===s.label;return e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{k(l=>l===s.label?null:s.label),m(!1)},className:`
                      group relative flex items-center
                      h-12 rounded-2xl w-full
                      transition-all duration-300
                      ${g?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${t?"px-3 gap-3":"justify-center px-0"}
                    `,children:[g&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300
                      ${g?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:e.jsx(s.icon,{className:"w-[18px] h-[18px]",strokeWidth:g?2.5:2})}),t&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                          flex-1 text-sm font-medium tracking-wide text-left
                          transition-all duration-300
                          ${g?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                        `,children:s.label}),e.jsx(Z,{className:`
                          w-4 h-4 transition-transform duration-300
                          ${g?"text-white":"text-[#A89F91]"}
                          ${w?"rotate-180":""}
                        `})]}),!t&&!w&&e.jsxs("div",{className:`
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
                      `,children:[s.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),!t&&w&&e.jsxs("div",{className:`
                        absolute left-full top-0 ml-3.5 z-50 min-w-[200px]
                        bg-[#1a1612] backdrop-blur-md
                        border-2 border-[#C9A24A]/50 rounded-2xl
                        shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                        p-2.5 flex flex-col gap-1
                        animate-in fade-in zoom-in-95 duration-150
                      `,children:[e.jsx("div",{className:"absolute -left-[7px] top-6 -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1612] border-l-2 border-b-2 border-[#C9A24A]/50 rotate-45 pointer-events-none"}),e.jsxs("div",{className:"px-3 py-1.5 border-b border-[#C9A24A]/20 flex items-center justify-between mb-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-[#E8C547] uppercase tracking-wider",children:s.label}),e.jsxs("span",{className:"text-[10px] text-[#A89F91] font-medium",children:[s.submenu?.length," Menu"]})]}),s.submenu?.map(l=>{const y=E(l.href);return e.jsxs(x,{to:l.href,onClick:j,className:`
                              flex items-center py-2 px-3 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${y?"bg-gradient-to-r from-[#C9A24A]/30 to-[#B8943F]/30 text-[#E8C547] font-bold border border-[#C9A24A]/40 shadow-inner":"text-[#D4C5B0] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                            `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2.5 ${y?"bg-[#E8C547]":"bg-[#A89F91]"}`}),l.label]},l.label)})]}),t&&w&&e.jsx("div",{className:"pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#C9A24A]/40 ml-6 mt-1 animate-in fade-in slide-in-from-top-1 duration-200",children:s.submenu?.map(l=>{const y=E(l.href);return e.jsxs(x,{to:l.href,onClick:j,className:`
                              flex items-center py-2 px-2.5 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${y?"bg-[#C9A24A]/30 text-[#E8C547] font-bold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                            `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2 ${y?"bg-[#E8C547]":"bg-[#A89F91]"}`}),l.label]},l.label)})})]},s.label)}return e.jsxs(x,{to:s.href,onClick:j,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${u?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${t?"px-3 gap-3":"justify-center px-0"}
                `,children:[u&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${u?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(s.icon,{className:"w-[18px] h-[18px]",strokeWidth:u?2.5:2}),s.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${u?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${t?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:s.label}),!t&&e.jsxs("div",{className:`
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
                  `,children:[s.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},s.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:F,onClick:()=>m(s=>!s),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${o?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${t?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[n?.avatar?e.jsx("img",{src:n.avatar.includes("storage/data:image")?n.avatar.substring(n.avatar.indexOf("data:image")):n.avatar,alt:n?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50 shrink-0
                  `,children:(n?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${t?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:n?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!t&&!o&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:n?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),o&&e.jsxs("div",{ref:C,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[n?.avatar?e.jsx("img",{src:n.avatar.includes("storage/data:image")?n.avatar.substring(n.avatar.indexOf("data:image")):n.avatar,alt:n?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(n?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:n?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:n?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(x,{to:"/profile",onClick:j,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(H,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(x,{to:"/settings",onClick:j,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(x,{to:"/download",onClick:j,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(X,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{m(!1),v()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(Y,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function we(){const[v,t]=d.useState(!1);return d.useEffect(()=>{const A=window.matchMedia("(max-width: 767px)"),N=()=>t(A.matches);return N(),A.addEventListener("change",N),()=>A.removeEventListener("change",N)},[]),v}function $e({children:v,role:t,consultationsCount:A=0,activeTreatmentsCount:N=0,availableDoctorsCount:k=0}){const[o,m]=d.useState(!1),[S,C]=d.useState(null),[F,b]=d.useState(!1),n=d.useRef(null),$=d.useRef(null),j=d.useRef(null);d.useEffect(()=>{const r=p=>{const _=p.target;n.current&&!n.current.contains(_)&&(C(null),b(!1))};return document.addEventListener("mousedown",r),()=>document.removeEventListener("mousedown",r)},[]);const E=()=>{m(r=>!r),C(null),b(!1)},f=()=>{m(!1),C(null),b(!1)},s=G(),u=oe(),a=q(),l=(()=>{if(!a)return 0;const r=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],p=r.filter(c=>!!(a[c]||a[c.replace(/([A-Z])/g,"_$1").toLowerCase()]||a[c==="phone"?"whatsapp":c]||a[c==="bloodType"?"blood_type":c]||a[c==="address"?"address_line":c])),h=(a.interests||[]).length>0?1:0;return Math.round((p.length+h)/(r.length+1)*100)})()>=100,y=Array.isArray(a?.dentalComplaints)&&a?.dentalComplaints?.length>0&&Array.isArray(a?.desiredServices)&&a?.desiredServices?.length>0,R=a?.membership_level||"bronze",O={bronze:{label:"Basic Member",shortLabel:"Basic",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Premium Member",shortLabel:"Premium",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Priority Member",shortLabel:"Priority",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},ae=O[R]||O.bronze;a?.membership_status==="active"||a?.membershipStatus==="active"||a?.membership_status==="member"||a?.membershipStatus;const T=t==="clinic"?"Admin Klinik":t==="doctor"?"Dokter Klinik":t==="user"?ae.label:"Client Klinik";d.useEffect(()=>{le()},[s.pathname,s.search]);const te=ee(t),L=()=>{ie(),de(),u("/login")},U=r=>{const p=s.pathname,_=new URLSearchParams(s.search).get("tab"),[h,c]=r.split("?");if(p!==h)return!1;const i=c?new URLSearchParams(c).get("tab"):null;return i?_===i:!_},D=new URLSearchParams(s.search).get("tab")||"dashboard",K=s.pathname,I=["/membership","/settings","/help","/profile"],se=t==="user"&&(D==="reservasi"||D==="konsultasi"||D==="pengaduan")||t==="doctor"&&D!=="dashboard"||t==="clinic"||I.some(r=>K.startsWith(r));return(t==="user"||t==="clinic")&&D==="dashboard"&&I.some(r=>K.startsWith(r)),we()?e.jsx(ce,{role:t,children:v}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[t==="user"?e.jsx(be,{userName:a?.name||"User",onLogout:L}):t==="doctor"?e.jsx(je,{onLogout:L}):e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{ref:n,className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${o?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:E,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${o?"rotate-180":"rotate-0"}
                `,"aria-label":o?"Tutup sidebar":"Buka sidebar",children:e.jsx(Q,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:te.map(r=>{const p=U(r.href);if(t==="clinic"&&!!r.submenu?.length){const h=r.submenu.some(i=>U(i.href)),c=S===r.label;return e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{C(i=>i===r.label?null:r.label),b(!1)},className:`
                          group relative flex items-center
                          h-12 rounded-2xl w-full
                          transition-all duration-300
                          ${h?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                          ${o?"px-3 gap-3":"justify-center px-0"}
                        `,children:[h&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                          flex items-center justify-center w-9 h-9 rounded-xl
                          transition-all duration-300
                          ${h?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                        `,children:e.jsx(r.icon,{className:"w-[18px] h-[18px]",strokeWidth:h?2.5:2})}),o&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                              flex-1 text-sm font-medium tracking-wide text-left
                              transition-all duration-300
                              ${h?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                            `,children:r.label}),e.jsx(Z,{className:`
                              w-4 h-4 transition-transform duration-300
                              ${h?"text-white":"text-[#A89F91]"}
                              ${c?"rotate-180":""}
                            `})]}),!o&&!c&&e.jsxs("div",{className:`
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
                          `,children:[r.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),!o&&c&&e.jsxs("div",{className:`
                            absolute left-full top-0 ml-3.5 z-50 min-w-[220px] w-max max-w-[260px]
                            bg-[#1a1612] backdrop-blur-md
                            border-2 border-[#C9A24A]/50 rounded-2xl
                            shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                            p-2.5 flex flex-col gap-1
                            animate-in fade-in zoom-in-95 duration-150
                          `,children:[e.jsx("div",{className:"absolute -left-[7px] top-6 -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1612] border-l-2 border-b-2 border-[#C9A24A]/50 rotate-45 pointer-events-none"}),e.jsxs("div",{className:"px-3 py-1.5 border-b border-[#C9A24A]/20 flex items-center justify-between gap-3 mb-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-[#E8C547] uppercase tracking-wider whitespace-nowrap",children:r.label}),e.jsxs("span",{className:"text-[10px] text-[#A89F91] font-semibold whitespace-nowrap shrink-0",children:[r.submenu?.length," Menu"]})]}),r.submenu?.map(i=>{const B=U(i.href);return e.jsxs(x,{to:i.href,onClick:()=>{C(null),f()},className:`
                                  flex items-center py-2 px-3 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${B?"bg-gradient-to-r from-[#C9A24A]/30 to-[#B8943F]/30 text-[#E8C547] font-bold border border-[#C9A24A]/40 shadow-inner":"text-[#D4C5B0] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2.5 ${B?"bg-[#E8C547]":"bg-[#A89F91]"}`}),i.label]},i.label)})]}),o&&c&&e.jsx("div",{className:"pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#C9A24A]/40 ml-6 mt-1 animate-in fade-in slide-in-from-top-1 duration-200",children:r.submenu?.map(i=>{const B=U(i.href);return e.jsxs(x,{to:i.href,onClick:()=>{C(null),f()},className:`
                                  flex items-center py-2 px-2.5 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${B?"bg-[#C9A24A]/30 text-[#E8C547] font-bold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2 ${B?"bg-[#E8C547]":"bg-[#A89F91]"}`}),i.label]},i.label)})})]},r.label)}return e.jsxs(x,{to:r.href,onClick:f,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${p?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${o?"px-3 gap-3":"justify-center px-0"}
                    `,children:[p&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${p?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(r.icon,{className:"w-[18px] h-[18px]",strokeWidth:p?2.5:2}),r.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${p?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${o?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:r.label}),!o&&e.jsxs("div",{className:`
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
                      `,children:[r.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},r.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:j,onClick:()=>b(r=>!r),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${F?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
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
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!o&&!F&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),F&&e.jsxs("div",{ref:$,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:a?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:a?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[t==="clinic"&&e.jsxs(x,{to:"/dashboard/clinic?tab=settings",onClick:()=>{b(!1),f()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#E8C547] bg-[#C9A24A]/20 hover:bg-[#C9A24A]/30 transition-all mb-1 border border-[#C9A24A]/30",children:[e.jsx(V,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan Klinik"]}),e.jsxs(x,{to:"/profile",onClick:()=>{b(!1),f()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(H,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(x,{to:"/settings",onClick:()=>{b(!1),f()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Preferensi"]}),e.jsxs(x,{to:t==="clinic"?"/dashboard/clinic?tab=content-download":"/download",onClick:()=>{b(!1),f()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[t==="clinic"?e.jsx(xe,{className:"w-4 h-4 text-[#C9A24A]"}):e.jsx(X,{className:"w-4 h-4 text-[#C9A24A]"}),t==="clinic"?"Upload Aplikasi":"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{b(!1),L()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(Y,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})}),e.jsxs("div",{className:"flex-1 min-w-0 flex flex-col",children:[e.jsx(ue,{role:t,navbarLabel:T}),e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:v}),!se&&e.jsx(pe,{session:a,navbarLabel:T,role:t,consultationsCount:A,activeTreatmentsCount:N,availableDoctorsCount:k})]})]})]})}export{$e as D};
