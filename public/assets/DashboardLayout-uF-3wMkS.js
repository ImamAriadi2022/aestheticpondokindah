import{p as xe,a1 as R,r as x,f as X,h as Y,j as e,b as ee,a as h,u as be,s as ue,k as pe,P as he,x as me,y as fe}from"./index-DnWXWq6Q.js";import{d as O,S as G,u as te,N as ge,A as ve,U as we,D as Ae,b as je}from"./NewMobileDashboardLayout-4IX_wUlJ.js";import{F as W}from"./file-text-CWOyqxcB.js";import{C as K}from"./calendar-D4pr9mPW.js";import{U as Z}from"./users-U-Q86L6J.js";import{B as I}from"./map-pin-C4-pKkwe.js";import{C as ae}from"./chevron-down-CH6G0rQ-.js";import{U as se}from"./user-CytSPIdO.js";import{D as re}from"./download-CYwT700q.js";import{L as ne}from"./log-out-C4H3TKer.js";const Ce=[{label:"Pengaturan Umum",href:"/dashboard/clinic?tab=settings&sub=general"},{label:"Pengaturan Beranda",href:"/dashboard/clinic?tab=etalase-beranda"},{label:"Pengaturan Tentang",href:"/dashboard/clinic?tab=etalase-tentang"}],Ne=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Daftar Aplikasi Mobile",href:"/dashboard/clinic?tab=content-download"}],ke=[{label:"Booking",href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",href:"/dashboard/clinic?tab=konsultasi"},{label:"Pengaduan",href:"/dashboard/clinic?tab=pengaduan"}],ye=[{label:"Pengguna",href:"/dashboard/clinic?tab=users"},{label:"Dokter",href:"/dashboard/clinic?tab=doctors"},{label:"Membership",href:"/dashboard/clinic/membership"}],Ee={root:{[R.USER]:[{label:"Dashboard",icon:O,href:"/dashboard/user"},{label:"Konsultasi",icon:K,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:xe,href:"/dashboard/user?tab=pengaduan"},{label:"Panduan Pasien",icon:I,href:"/dashboard/user?tab=panduan"}],[R.CLINIC]:[{label:"Dashboard",icon:O,href:"/dashboard/clinic"},{label:"Sistem Booking",icon:K,href:"/dashboard/clinic?tab=reservasi",submenu:ke},{label:"Konten",icon:W,href:"/dashboard/clinic?tab=content-blog",submenu:Ne},{label:"Kelola Pengguna",icon:Z,href:"/dashboard/clinic?tab=users",submenu:ye},{label:"Pengaturan",icon:G,href:"/dashboard/clinic?tab=settings",submenu:Ce},{label:"Panduan Admin",icon:I,href:"/dashboard/clinic?tab=panduan"}],[R.DOCTOR]:[{label:"Dashboard",icon:O,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:K,href:"/dashboard/doctor?tab=jadwal"},{label:"Daftar Pasien",icon:Z,href:"/dashboard/doctor?tab=reservasi"},{label:"Panduan Dokter",icon:I,href:"/dashboard/doctor?tab=panduan"}],[R.DEVELOPER]:[{label:"REST API Docs",icon:W,href:"/docs-api"}]}};function oe(A){return Ee.root[A]??[]}function _e({onLogout:A}){const[r,j]=x.useState(!1),[y,S]=x.useState(null),[i,v]=x.useState(!1),D=x.useRef(null),C=x.useRef(null),P=x.useRef(null),p=X(),l=Y(),L=te("doctor"),g=t=>{const o=t.label.toLowerCase();return o.includes("pasien")||o.includes("reservasi")?L.booking:o.includes("konsultasi")?L.konsultasi:t.badge||0};x.useEffect(()=>{const t=o=>{const E=o.target;D.current&&!D.current.contains(E)&&(v(!1),S(null))};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const f=()=>{j(t=>!t),S(null),v(!1)},w=()=>{j(!1),S(null),v(!1)},F=t=>{const o=p.pathname,E=new URLSearchParams(p.search).get("tab"),[a,N]=t.split("?");if(o!==a)return!1;const b=N?new URLSearchParams(N).get("tab"):null;return b?E===b:!E},M=oe("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{ref:D,className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${r?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:f,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${r?"rotate-180":"rotate-0"}
            `,"aria-label":r?"Tutup sidebar":"Buka sidebar",children:e.jsx(ee,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:M.map(t=>{const o=F(t.href);if(!!t.submenu?.length){const a=t.submenu.some(b=>F(b.href)),N=y===t.label;return e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{S(b=>b===t.label?null:t.label),v(!1)},className:`
                      group relative flex items-center
                      h-12 rounded-2xl w-full
                      transition-all duration-300
                      ${a?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${r?"px-3 gap-3":"justify-center px-0"}
                    `,children:[a&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300
                      ${a?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:a?2.5:2})}),r&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                          flex-1 text-sm font-medium tracking-wide text-left
                          transition-all duration-300
                          ${a?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                        `,children:t.label}),e.jsx(ae,{className:`
                          w-4 h-4 transition-transform duration-300
                          ${a?"text-white":"text-[#A89F91]"}
                          ${N?"rotate-180":""}
                        `})]}),!r&&!N&&e.jsxs("div",{className:`
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
                      `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),!r&&N&&e.jsxs("div",{className:`
                        absolute left-full top-0 ml-3.5 z-50 min-w-[200px]
                        bg-[#1a1612] backdrop-blur-md
                        border-2 border-[#C9A24A]/50 rounded-2xl
                        shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                        p-2.5 flex flex-col gap-1
                        animate-in fade-in zoom-in-95 duration-150
                      `,children:[e.jsx("div",{className:"absolute -left-[7px] top-6 -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1612] border-l-2 border-b-2 border-[#C9A24A]/50 rotate-45 pointer-events-none"}),e.jsxs("div",{className:"px-3 py-1.5 border-b border-[#C9A24A]/20 flex items-center justify-between mb-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-[#E8C547] uppercase tracking-wider",children:t.label}),e.jsxs("span",{className:"text-[10px] text-[#A89F91] font-medium",children:[t.submenu?.length," Menu"]})]}),t.submenu?.map(b=>{const _=F(b.href);return e.jsxs(h,{to:b.href,onClick:w,className:`
                              flex items-center py-2 px-3 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${_?"bg-gradient-to-r from-[#C9A24A]/30 to-[#B8943F]/30 text-[#E8C547] font-bold border border-[#C9A24A]/40 shadow-inner":"text-[#D4C5B0] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                            `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2.5 ${_?"bg-[#E8C547]":"bg-[#A89F91]"}`}),b.label]},b.label)})]}),r&&N&&e.jsx("div",{className:"pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#C9A24A]/40 ml-6 mt-1 animate-in fade-in slide-in-from-top-1 duration-200",children:t.submenu?.map(b=>{const _=F(b.href);return e.jsxs(h,{to:b.href,onClick:w,className:`
                              flex items-center py-2 px-2.5 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${_?"bg-[#C9A24A]/30 text-[#E8C547] font-bold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                            `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2 ${_?"bg-[#E8C547]":"bg-[#A89F91]"}`}),b.label]},b.label)})})]},t.label)}return e.jsxs(h,{to:t.href,onClick:w,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${o?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${r?"px-3 gap-3":"justify-center px-0"}
                `,children:[o&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${o?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:o?2.5:2}),g(t)>0&&e.jsx("span",{className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1612] shadow-xs",children:g(t)>99?"99+":g(t)})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide truncate
                  transition-all duration-500
                  ${o?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${r?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:t.label}),r&&g(t)>0&&e.jsx("span",{className:"ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:g(t)>99?"99+":g(t)}),!r&&e.jsxs("div",{className:`
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
                  `,children:[t.label,g(t)>0&&` (${g(t)})`,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:P,onClick:()=>v(t=>!t),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${i?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${r?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[l?.avatar?e.jsx("img",{src:l.avatar.includes("storage/data:image")?l.avatar.substring(l.avatar.indexOf("data:image")):l.avatar,alt:l?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50 shrink-0
                  `,children:(l?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${r?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:l?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!r&&!i&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:l?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),i&&e.jsxs("div",{ref:C,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[l?.avatar?e.jsx("img",{src:l.avatar.includes("storage/data:image")?l.avatar.substring(l.avatar.indexOf("data:image")):l.avatar,alt:l?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(l?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:l?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:l?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(h,{to:"/profile",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(se,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(h,{to:"/settings",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(G,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(h,{to:"/download",onClick:w,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(re,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{v(!1),A()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(ne,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function Be(){const[A,r]=x.useState(!1);return x.useEffect(()=>{const j=window.matchMedia("(max-width: 767px)"),y=()=>r(j.matches);return y(),j.addEventListener("change",y),()=>j.removeEventListener("change",y)},[]),A}function Ke({children:A,role:r,consultationsCount:j=0,activeTreatmentsCount:y=0,availableDoctorsCount:S=0}){const[i,v]=x.useState(!1),[D,C]=x.useState(null),[P,p]=x.useState(!1),l=x.useRef(null),L=x.useRef(null),g=x.useRef(null),f=te(r),w=(s,d)=>{const m=s.toLowerCase(),n=d.toLowerCase();return m.includes("booking")||m.includes("reservasi")||n.includes("reservasi")||n.includes("booking")?f.booking:m.includes("konsultasi")||n.includes("konsultasi")?f.konsultasi:m.includes("pengaduan")||n.includes("pengaduan")?f.pengaduan:0},F=s=>{const d=s.label.toLowerCase();return d.includes("sistem booking")||d.includes("booking")?f.booking+f.konsultasi+f.pengaduan:d.includes("konsultasi")?f.konsultasi:d.includes("pengaduan")?f.pengaduan:d.includes("daftar pasien")||d.includes("reservasi")?f.booking:s.badge||0};x.useEffect(()=>{const s=d=>{const m=d.target;l.current&&!l.current.contains(m)&&(C(null),p(!1))};return document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[]);const M=()=>{v(s=>!s),C(null),p(!1)},t=()=>{v(!1),C(null),p(!1)},o=X(),E=be();x.useEffect(()=>{ue()},[o.pathname,o.search]);const a=Y(),_=(()=>{if(!a)return 0;const s=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],d=s.filter(c=>!!(a[c]||a[c.replace(/([A-Z])/g,"_$1").toLowerCase()]||a[c==="phone"?"whatsapp":c]||a[c==="bloodType"?"blood_type":c]||a[c==="address"?"address_line":c])),n=(a.interests||[]).length>0?1:0;return Math.round((d.length+n)/(s.length+1)*100)})()>=100,le=Array.isArray(a?.dentalComplaints)&&a?.dentalComplaints?.length>0&&Array.isArray(a?.desiredServices)&&a?.desiredServices?.length>0,Q=a?.membership_level||"bronze",q={bronze:{label:"Bronze Member",shortLabel:"Bronze",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Gold Member",shortLabel:"Gold",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Platinum Member",shortLabel:"Platinum",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},ie=q[Q]||q.bronze;a?.membership_status==="active"||a?.membershipStatus==="active"||a?.membership_status==="member"||a?.membershipStatus;const H=r==="clinic"?"Admin Klinik":r==="doctor"?"Dokter Klinik":r==="user"?ie.label:"Client Klinik";x.useEffect(()=>{pe()},[o.pathname,o.search]);const de=oe(r),T=()=>{me(),fe(),E("/login")},z=s=>{const d=o.pathname,m=new URLSearchParams(o.search).get("tab"),[n,c]=s.split("?");if(d!==n)return!1;const k=c?new URLSearchParams(c).get("tab"):null;return k?m===k:!m},$=new URLSearchParams(o.search).get("tab")||"dashboard",J=o.pathname,V=["/membership","/settings","/help","/profile"],ce=r==="user"&&($==="reservasi"||$==="konsultasi"||$==="pengaduan")||r==="doctor"&&$!=="dashboard"||r==="clinic"||V.some(s=>J.startsWith(s));return(r==="user"||r==="clinic")&&$==="dashboard"&&V.some(s=>J.startsWith(s)),Be()?e.jsx(ge,{role:r,children:A}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[r==="user"?e.jsx(ve,{userName:a?.name||"User",onLogout:T}):r==="doctor"?e.jsx(_e,{onLogout:T}):e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{ref:l,className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${i?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:M,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${i?"rotate-180":"rotate-0"}
                `,"aria-label":i?"Tutup sidebar":"Buka sidebar",children:e.jsx(ee,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:de.map(s=>{const d=z(s.href),m=r==="clinic"&&!!s.submenu?.length,n=F(s);if(m){const c=s.submenu.some(u=>z(u.href)),k=D===s.label;return e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{C(u=>u===s.label?null:s.label),p(!1)},className:`
                          group relative flex items-center
                          h-12 rounded-2xl w-full
                          transition-all duration-300
                          ${c?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                          ${i?"px-3 gap-3":"justify-center px-0"}
                        `,children:[c&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                          flex items-center justify-center w-9 h-9 rounded-xl
                          transition-all duration-300 relative
                          ${c?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                        `,children:[e.jsx(s.icon,{className:"w-[18px] h-[18px]",strokeWidth:c?2.5:2}),!i&&n>0&&e.jsx("span",{className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1612] shadow-xs animate-in zoom-in-50",children:n>99?"99+":n})]}),i&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                              flex-1 text-sm font-medium tracking-wide text-left truncate
                              transition-all duration-300
                              ${c?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                            `,children:s.label}),n>0&&e.jsx("span",{className:"mr-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:n>99?"99+":n}),e.jsx(ae,{className:`
                              w-4 h-4 transition-transform duration-300 shrink-0
                              ${c?"text-white":"text-[#A89F91]"}
                              ${k?"rotate-180":""}
                            `})]}),!i&&!k&&e.jsxs("div",{className:`
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
                          `,children:[s.label,n>0&&` (${n})`,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),!i&&k&&e.jsxs("div",{className:`
                            absolute left-full top-0 ml-3.5 z-50 min-w-[220px] w-max max-w-[260px]
                            bg-[#1a1612] backdrop-blur-md
                            border-2 border-[#C9A24A]/50 rounded-2xl
                            shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                            p-2.5 flex flex-col gap-1
                            animate-in fade-in zoom-in-95 duration-150
                          `,children:[e.jsx("div",{className:"absolute -left-[7px] top-6 -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1612] border-l-2 border-b-2 border-[#C9A24A]/50 rotate-45 pointer-events-none"}),e.jsxs("div",{className:"px-3 py-1.5 border-b border-[#C9A24A]/20 flex items-center justify-between gap-3 mb-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-[#E8C547] uppercase tracking-wider whitespace-nowrap",children:s.label}),e.jsxs("span",{className:"text-[10px] text-[#A89F91] font-semibold whitespace-nowrap shrink-0",children:[s.submenu?.length," Menu"]})]}),s.submenu?.map(u=>{const U=z(u.href),B=w(u.label,u.href);return e.jsxs(h,{to:u.href,onClick:()=>{C(null),t()},className:`
                                  flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${U?"bg-gradient-to-r from-[#C9A24A]/30 to-[#B8943F]/30 text-[#E8C547] font-bold border border-[#C9A24A]/40 shadow-inner":"text-[#D4C5B0] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsxs("div",{className:"flex items-center min-w-0",children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 ${U?"bg-[#E8C547]":"bg-[#A89F91]"}`}),e.jsx("span",{className:"truncate",children:u.label})]}),B>0&&e.jsx("span",{className:"ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:B>99?"99+":B})]},u.label)})]}),i&&k&&e.jsx("div",{className:"pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#C9A24A]/40 ml-6 mt-1 animate-in fade-in slide-in-from-top-1 duration-200",children:s.submenu?.map(u=>{const U=z(u.href),B=w(u.label,u.href);return e.jsxs(h,{to:u.href,onClick:()=>{C(null),t()},className:`
                                  flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${U?"bg-[#C9A24A]/30 text-[#E8C547] font-bold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsxs("div",{className:"flex items-center min-w-0",children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${U?"bg-[#E8C547]":"bg-[#A89F91]"}`}),e.jsx("span",{className:"truncate",children:u.label})]}),B>0&&e.jsx("span",{className:"ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:B>99?"99+":B})]},u.label)})})]},s.label)}return e.jsxs(h,{to:s.href,onClick:t,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${d?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${i?"px-3 gap-3":"justify-center px-0"}
                    `,children:[d&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${d?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(s.icon,{className:"w-[18px] h-[18px]",strokeWidth:d?2.5:2}),n>0&&e.jsx("span",{className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1612] shadow-xs",children:n>99?"99+":n})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide truncate
                      transition-all duration-500
                      ${d?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${i?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:s.label}),i&&n>0&&e.jsx("span",{className:"ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:n>99?"99+":n}),!i&&e.jsxs("div",{className:`
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
                      `,children:[s.label,n>0&&` (${n})`,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},s.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:g,onClick:()=>p(s=>!s),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${P?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                    ${i?"px-3 gap-3":"justify-center px-0"}
                  `,children:[e.jsxs("div",{className:"relative",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      `,children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                    overflow-hidden transition-all duration-500
                    ${i?"w-auto opacity-100":"w-0 opacity-0"}
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!i&&!P&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),P&&e.jsxs("div",{ref:L,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:a?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:a?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[r==="clinic"&&e.jsxs(h,{to:"/dashboard/clinic?tab=settings",onClick:()=>{p(!1),t()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#E8C547] bg-[#C9A24A]/20 hover:bg-[#C9A24A]/30 transition-all mb-1 border border-[#C9A24A]/30",children:[e.jsx(W,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan Klinik"]}),e.jsxs(h,{to:"/profile",onClick:()=>{p(!1),t()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(se,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(h,{to:"/settings",onClick:()=>{p(!1),t()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(G,{className:"w-4 h-4 text-[#C9A24A]"}),"Preferensi"]}),e.jsxs(h,{to:r==="clinic"?"/dashboard/clinic?tab=content-download":"/download",onClick:()=>{p(!1),t()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[r==="clinic"?e.jsx(we,{className:"w-4 h-4 text-[#C9A24A]"}):e.jsx(re,{className:"w-4 h-4 text-[#C9A24A]"}),r==="clinic"?"Upload Aplikasi":"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{p(!1),T()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(ne,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})}),e.jsxs("div",{className:"flex-1 min-w-0 flex flex-col",children:[e.jsx(Ae,{role:r,navbarLabel:H}),e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:e.jsx(he,{transitionKey:o.pathname+o.search,children:A})}),!ce&&e.jsx(je,{session:a,navbarLabel:H,role:r,consultationsCount:j,activeTreatmentsCount:y,availableDoctorsCount:S})]})]})]})}export{Ke as D};
