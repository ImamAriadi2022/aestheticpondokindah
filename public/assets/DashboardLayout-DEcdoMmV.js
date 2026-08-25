import{c as ae,x as te,a1 as F,r as c,n as T,q as K,j as e,b as I,a as u,U as W,u as se,o as re,D as ne,E as oe}from"./index-CRiyKpA1.js";import{c as B,S as G,L as q,N as le,A as ie,U as de,D as ce,a as be}from"./NewMobileDashboardLayout-CmSjzXRD.js";import{C as P}from"./message-square-Bg_fXa5t.js";import{U as O}from"./users-CQMdCWLw.js";import{F as Q}from"./file-text-kS6OXD5W.js";import{D as H}from"./download-CwnVToHN.js";import{C as xe}from"./chevron-down-j9z5QGFw.js";const ue=[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7",key:"ztvudi"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",key:"1b2hhj"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4",key:"2ebpfo"}],["path",{d:"M2 7h20",key:"1fcdvo"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7",key:"6c3vgh"}]],he=ae("store",ue),pe=[{label:"Edit Beranda",href:"/dashboard/clinic?tab=etalase-beranda"},{label:"Edit Tentang",href:"/dashboard/clinic?tab=etalase-tentang"}],me=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Daftar Aplikasi Mobile",href:"/dashboard/clinic?tab=content-download"}],fe=[{label:"Booking",href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",href:"/dashboard/clinic?tab=konsultasi"},{label:"Pengaduan",href:"/dashboard/clinic?tab=pengaduan"}],ge=[{label:"Pengguna",href:"/dashboard/clinic?tab=users"},{label:"Dokter",href:"/dashboard/clinic?tab=doctors"},{label:"Membership",href:"/dashboard/clinic/membership"}],ve={root:{[F.USER]:[{label:"Dashboard",icon:B,href:"/dashboard/user"},{label:"Konsultasi",icon:P,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:te,href:"/dashboard/user?tab=pengaduan"}],[F.CLINIC]:[{label:"Dashboard",icon:B,href:"/dashboard/clinic"},{label:"Etalase",icon:he,href:"/dashboard/clinic?tab=etalase-beranda",submenu:pe},{label:"Sistem Booking",icon:P,href:"/dashboard/clinic?tab=reservasi",submenu:fe},{label:"Konten",icon:Q,href:"/dashboard/clinic?tab=content-blog",submenu:me},{label:"Kelola Pengguna",icon:O,href:"/dashboard/clinic?tab=users",submenu:ge}],[F.DOCTOR]:[{label:"Dashboard",icon:B,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:P,href:"/dashboard/doctor?tab=jadwal"},{label:"Daftar Pasien",icon:O,href:"/dashboard/doctor?tab=reservasi"}]}};function J(f){return ve.root[f]??[]}function Ae({onLogout:f}){const[s,g]=c.useState(!1),[m,A]=c.useState(!1),n=c.useRef(null),C=c.useRef(null),E=T(),r=K();c.useEffect(()=>{const o=b=>{n.current&&!n.current.contains(b.target)&&C.current&&!C.current.contains(b.target)&&A(!1)};return document.addEventListener("mousedown",o),()=>document.removeEventListener("mousedown",o)},[]);const w=()=>{g(o=>!o),A(!1)},d=()=>{g(!1),A(!1)},N=o=>{const b=E.pathname,h=new URLSearchParams(E.search).get("tab"),[v,_]=o.split("?");if(b!==v)return!1;const a=_?new URLSearchParams(_).get("tab"):null;return a?h===a:!h},D=J("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${s?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:w,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${s?"rotate-180":"rotate-0"}
            `,"aria-label":s?"Tutup sidebar":"Buka sidebar",children:e.jsx(I,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:D.map(o=>{const b=N(o.href);return e.jsxs(u,{to:o.href,onClick:d,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${b?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${s?"px-3 gap-3":"justify-center px-0"}
                `,children:[b&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${b?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(o.icon,{className:"w-[18px] h-[18px]",strokeWidth:b?2.5:2}),o.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${b?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${s?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:o.label}),!s&&e.jsxs("div",{className:`
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
                  `,children:[o.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},o.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:C,onClick:()=>A(o=>!o),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${m?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
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
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:r?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!s&&!m&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:r?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),m&&e.jsxs("div",{ref:n,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[r?.avatar?e.jsx("img",{src:r.avatar.includes("storage/data:image")?r.avatar.substring(r.avatar.indexOf("data:image")):r.avatar,alt:r?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(r?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:r?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:r?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(u,{to:"/profile",onClick:d,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(W,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(u,{to:"/settings",onClick:d,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(G,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(u,{to:"/download",onClick:d,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(H,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{A(!1),f()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(q,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function Ce(){const[f,s]=c.useState(!1);return c.useEffect(()=>{const g=window.matchMedia("(max-width: 767px)"),m=()=>s(g.matches);return m(),g.addEventListener("change",m),()=>g.removeEventListener("change",m)},[]),f}function Be({children:f,role:s,consultationsCount:g=0,activeTreatmentsCount:m=0,availableDoctorsCount:A=0}){const[n,C]=c.useState(!1),[E,r]=c.useState(null),[w,d]=c.useState(!1),N=c.useRef(null),D=c.useRef(null),o=c.useRef(null);c.useEffect(()=>{const t=x=>{const j=x.target;N.current&&!N.current.contains(j)&&(r(null),d(!1))};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const b=()=>{C(t=>!t),r(null),d(!1)},h=()=>{C(!1),r(null),d(!1)},v=T(),_=se(),a=K(),V=(()=>{if(!a)return 0;const t=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],x=t.filter(i=>!!(a[i]||a[i.replace(/([A-Z])/g,"_$1").toLowerCase()]||a[i==="phone"?"whatsapp":i]||a[i==="bloodType"?"blood_type":i]||a[i==="address"?"address_line":i])),p=(a.interests||[]).length>0?1:0;return Math.round((x.length+p)/(t.length+1)*100)})()>=100,Z=Array.isArray(a?.dentalComplaints)&&a?.dentalComplaints?.length>0&&Array.isArray(a?.desiredServices)&&a?.desiredServices?.length>0,L=a?.membership_level||"bronze",$={bronze:{label:"Basic Member",shortLabel:"Basic",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Premium Member",shortLabel:"Premium",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Priority Member",shortLabel:"Priority",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},X=$[L]||$.bronze;a?.membership_status==="active"||a?.membershipStatus==="active"||a?.membership_status==="member"||a?.membershipStatus;const M=s==="clinic"?"Admin Klinik":s==="doctor"?"Dokter Klinik":s==="user"?X.label:"Client Klinik";c.useEffect(()=>{re()},[v.pathname,v.search]);const Y=J(s),U=()=>{ne(),oe(),_("/login")},S=t=>{const x=v.pathname,j=new URLSearchParams(v.search).get("tab"),[p,i]=t.split("?");if(x!==p)return!1;const l=i?new URLSearchParams(i).get("tab"):null;return l?j===l:!j},y=new URLSearchParams(v.search).get("tab")||"dashboard",z=v.pathname,R=["/membership","/settings","/help","/profile"],ee=s==="user"&&(y==="reservasi"||y==="konsultasi"||y==="pengaduan")||s==="doctor"&&y!=="dashboard"||s==="clinic"||R.some(t=>z.startsWith(t));return(s==="user"||s==="clinic")&&y==="dashboard"&&R.some(t=>z.startsWith(t)),Ce()?e.jsx(le,{role:s,children:f}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[s==="user"?e.jsx(ie,{userName:a?.name||"User",onLogout:U}):s==="doctor"?e.jsx(Ae,{onLogout:U}):e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{ref:N,className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${n?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:b,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${n?"rotate-180":"rotate-0"}
                `,"aria-label":n?"Tutup sidebar":"Buka sidebar",children:e.jsx(I,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:Y.map(t=>{const x=S(t.href);if(s==="clinic"&&!!t.submenu?.length){const p=t.submenu.some(l=>S(l.href)),i=E===t.label;return e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{r(l=>l===t.label?null:t.label),d(!1)},className:`
                          group relative flex items-center
                          h-12 rounded-2xl w-full
                          transition-all duration-300
                          ${p?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                          ${n?"px-3 gap-3":"justify-center px-0"}
                        `,children:[p&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                          flex items-center justify-center w-9 h-9 rounded-xl
                          transition-all duration-300
                          ${p?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                        `,children:e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:p?2.5:2})}),n&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                              flex-1 text-sm font-medium tracking-wide text-left
                              transition-all duration-300
                              ${p?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                            `,children:t.label}),e.jsx(xe,{className:`
                              w-4 h-4 transition-transform duration-300
                              ${p?"text-white":"text-[#A89F91]"}
                              ${i?"rotate-180":""}
                            `})]}),!n&&!i&&e.jsxs("div",{className:`
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
                          `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),!n&&i&&e.jsxs("div",{className:`
                            absolute left-full top-0 ml-3.5 z-50 min-w-[200px]
                            bg-[#1a1612] backdrop-blur-md
                            border-2 border-[#C9A24A]/50 rounded-2xl
                            shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                            p-2.5 flex flex-col gap-1
                            animate-in fade-in zoom-in-95 duration-150
                          `,children:[e.jsx("div",{className:"absolute -left-[7px] top-6 -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1612] border-l-2 border-b-2 border-[#C9A24A]/50 rotate-45 pointer-events-none"}),e.jsxs("div",{className:"px-3 py-1.5 border-b border-[#C9A24A]/20 flex items-center justify-between mb-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-[#E8C547] uppercase tracking-wider",children:t.label}),e.jsxs("span",{className:"text-[10px] text-[#A89F91] font-medium",children:[t.submenu?.length," Menu"]})]}),t.submenu?.map(l=>{const k=S(l.href);return e.jsxs(u,{to:l.href,onClick:()=>{r(null),h()},className:`
                                  flex items-center py-2 px-3 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${k?"bg-gradient-to-r from-[#C9A24A]/30 to-[#B8943F]/30 text-[#E8C547] font-bold border border-[#C9A24A]/40 shadow-inner":"text-[#D4C5B0] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2.5 ${k?"bg-[#E8C547]":"bg-[#A89F91]"}`}),l.label]},l.label)})]}),n&&i&&e.jsx("div",{className:"pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#C9A24A]/40 ml-6 mt-1 animate-in fade-in slide-in-from-top-1 duration-200",children:t.submenu?.map(l=>{const k=S(l.href);return e.jsxs(u,{to:l.href,onClick:()=>{r(null),h()},className:`
                                  flex items-center py-2 px-2.5 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${k?"bg-[#C9A24A]/30 text-[#E8C547] font-bold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2 ${k?"bg-[#E8C547]":"bg-[#A89F91]"}`}),l.label]},l.label)})})]},t.label)}return e.jsxs(u,{to:t.href,onClick:h,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${x?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${n?"px-3 gap-3":"justify-center px-0"}
                    `,children:[x&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${x?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(t.icon,{className:"w-[18px] h-[18px]",strokeWidth:x?2.5:2}),t.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${x?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${n?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:t.label}),!n&&e.jsxs("div",{className:`
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
                      `,children:[t.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},t.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:o,onClick:()=>d(t=>!t),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${w?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                    ${n?"px-3 gap-3":"justify-center px-0"}
                  `,children:[e.jsxs("div",{className:"relative",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      `,children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                    overflow-hidden transition-all duration-500
                    ${n?"w-auto opacity-100":"w-0 opacity-0"}
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!n&&!w&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:a?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),w&&e.jsxs("div",{ref:D,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[a?.avatar?e.jsx("img",{src:a.avatar.includes("storage/data:image")?a.avatar.substring(a.avatar.indexOf("data:image")):a.avatar,alt:a?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(a?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:a?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:a?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[s==="clinic"&&e.jsxs(u,{to:"/dashboard/clinic?tab=settings",onClick:()=>{d(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#E8C547] bg-[#C9A24A]/20 hover:bg-[#C9A24A]/30 transition-all mb-1 border border-[#C9A24A]/30",children:[e.jsx(Q,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan Klinik"]}),e.jsxs(u,{to:"/profile",onClick:()=>{d(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(W,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(u,{to:"/settings",onClick:()=>{d(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(G,{className:"w-4 h-4 text-[#C9A24A]"}),"Preferensi"]}),e.jsxs(u,{to:s==="clinic"?"/dashboard/clinic?tab=content-download":"/download",onClick:()=>{d(!1),h()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[s==="clinic"?e.jsx(de,{className:"w-4 h-4 text-[#C9A24A]"}):e.jsx(H,{className:"w-4 h-4 text-[#C9A24A]"}),s==="clinic"?"Upload Aplikasi":"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{d(!1),U()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(q,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})}),e.jsxs("div",{className:"flex-1 min-w-0 flex flex-col",children:[e.jsx(ce,{role:s,navbarLabel:M}),e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:f}),!ee&&e.jsx(be,{session:a,navbarLabel:M,role:s,consultationsCount:g,activeTreatmentsCount:m,availableDoctorsCount:A})]})]})]})}export{Be as D};
