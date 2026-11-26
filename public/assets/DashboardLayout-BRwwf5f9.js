import{j as e}from"./vendor-radix-B35KjGE2.js";import{a as c,u as Y,c as ee,L as f}from"./vendor-router-D-FOUPmb.js";import{i as ae,J as k,s as te,d as se,f as ne,a as re,P as oe,m as le,n as ie}from"./index-xRVOxD_6.js";import{L as _,S as R,c as de,N as ce,A as be,U as ue,G as xe,D as he,b as me}from"./NewMobileDashboardLayout-CDlS8ndz.js";import{F as M}from"./file-text-BUmOnl_K.js";import{C as $}from"./calendar-DgJk9CNP.js";import{U as pe}from"./users-Cy4v2Jw6.js";import{B as T}from"./map-pin-1DZaFKoJ.js";import{C as fe}from"./chevron-down-BnRNntDn.js";import{U as ge}from"./user-DEe7wKjJ.js";import{D as ve}from"./download-Q8zVkAch.js";const we=[{label:"Pengaturan Umum",href:"/dashboard/clinic?tab=settings&sub=general"},{label:"Pengaturan Beranda",href:"/dashboard/clinic?tab=etalase-beranda"},{label:"Pengaturan Tentang",href:"/dashboard/clinic?tab=etalase-tentang"}],Ae=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Daftar Aplikasi Mobile",href:"/dashboard/clinic?tab=content-download"}],je=[{label:"Booking",href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",href:"/dashboard/clinic?tab=konsultasi"},{label:"Pengaduan",href:"/dashboard/clinic?tab=pengaduan"},{label:"Layanan",href:"/dashboard/clinic?tab=treatments"}],Ce=[{label:"Pengguna",href:"/dashboard/clinic?tab=users"},{label:"Dokter",href:"/dashboard/clinic?tab=doctors"},{label:"Membership",href:"/dashboard/clinic/membership"}],Ne={root:{[k.USER]:[{label:"Dashboard",icon:_,href:"/dashboard/user"},{label:"Konsultasi",icon:$,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:ae,href:"/dashboard/user?tab=pengaduan"},{label:"Panduan Pasien",icon:T,href:"/dashboard/user?tab=panduan"}],[k.CLINIC]:[{label:"Dashboard",icon:_,href:"/dashboard/clinic"},{label:"Sistem Booking",icon:$,href:"/dashboard/clinic?tab=reservasi",submenu:je},{label:"Konten",icon:M,href:"/dashboard/clinic?tab=content-blog",submenu:Ae},{label:"Kelola Pengguna",icon:pe,href:"/dashboard/clinic?tab=users",submenu:Ce},{label:"Pengaturan",icon:R,href:"/dashboard/clinic?tab=settings",submenu:we},{label:"Panduan Admin",icon:T,href:"/dashboard/clinic?tab=panduan"}],[k.DOCTOR]:[{label:"Dashboard",icon:_,href:"/dashboard/doctor"}],[k.DEVELOPER]:[{label:"REST API Docs",icon:M,href:"/docs-api"}]}};function ke(g){return Ne.root[g]??[]}function ye(){const[g,n]=c.useState(!1);return c.useEffect(()=>{const w=window.matchMedia("(max-width: 767px)"),A=()=>n(w.matches);return A(),w.addEventListener("change",A),()=>w.removeEventListener("change",A)},[]),g}function Ke({children:g,role:n,consultationsCount:w=0,activeTreatmentsCount:A=0,availableDoctorsCount:z=0}){const[l,B]=c.useState(!1),[O,v]=c.useState(null),[y,u]=c.useState(!1),E=c.useRef(null),K=c.useRef(null),I=c.useRef(null),h=de(n),S=(a,r)=>{const d=a.toLowerCase(),s=r.toLowerCase();return d.includes("booking")||d.includes("reservasi")||s.includes("reservasi")||s.includes("booking")?h.booking:d.includes("konsultasi")||s.includes("konsultasi")?h.konsultasi:d.includes("pengaduan")||s.includes("pengaduan")?h.pengaduan:0},G=a=>{const r=a.label.toLowerCase();return r.includes("sistem booking")||r.includes("booking")?h.booking:r.includes("konsultasi")?h.konsultasi:r.includes("pengaduan")?h.pengaduan:r.includes("daftar pasien")||r.includes("reservasi")?h.booking:a.badge||0};c.useEffect(()=>{const a=r=>{const d=r.target;E.current&&!E.current.contains(d)&&(v(null),u(!1))};return document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[]);const W=()=>{B(a=>!a),v(null),u(!1)},m=()=>{B(!1),v(null),u(!1)},b=Y(),q=ee();c.useEffect(()=>{te()},[b.pathname,b.search]);const t=se(),H=(()=>{if(!t)return 0;const a=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],r=a.filter(o=>!!(t[o]||t[o.replace(/([A-Z])/g,"_$1").toLowerCase()]||t[o==="phone"?"whatsapp":o]||t[o==="bloodType"?"blood_type":o]||t[o==="address"?"address_line":o])),s=(t.interests||[]).length>0?1:0;return Math.round((r.length+s)/(a.length+1)*100)})()>=100,J=Array.isArray(t?.dentalComplaints)&&t?.dentalComplaints?.length>0&&Array.isArray(t?.desiredServices)&&t?.desiredServices?.length>0,P=t?.membership_level||"bronze",D={bronze:{label:"Bronze Member",shortLabel:"Bronze",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Gold Member",shortLabel:"Gold",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Platinum Member",shortLabel:"Platinum",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},Q=D[P]||D.bronze;t?.membership_status==="active"||t?.membershipStatus==="active"||t?.membership_status==="member"||t?.membershipStatus;const L=n==="clinic"?"Admin Klinik":n==="doctor"?"Dokter Klinik":n==="user"?Q.label:"Client Klinik";c.useEffect(()=>{ne()},[b.pathname,b.search]);const V=ke(n),Z=()=>{le(),ie(),q("/login")},N=a=>{const r=b.pathname,d=new URLSearchParams(b.search).get("tab"),[s,o]=a.split("?");if(r!==s)return!1;const x=o?new URLSearchParams(o).get("tab"):null;return x?d===x:!d},j=new URLSearchParams(b.search).get("tab")||"dashboard",U=b.pathname,F=["/membership","/settings","/help","/profile"],X=n==="user"&&(j==="reservasi"||j==="konsultasi"||j==="pengaduan")||n==="doctor"&&j!=="dashboard"||n==="clinic"||F.some(a=>U.startsWith(a));return(n==="user"||n==="clinic")&&j==="dashboard"&&F.some(a=>U.startsWith(a)),ye()?e.jsx(ce,{role:n,children:g}):e.jsxs("div",{className:"min-h-screen bg-white flex",children:[n==="user"?e.jsx(be,{userName:t?.name||"User",onLogout:Z}):n==="doctor"?null:e.jsx("div",{className:"fixed top-4 left-2 h-[calc(100vh-32px)] z-[100] pointer-events-auto flex-shrink-0",children:e.jsxs("aside",{ref:E,className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${l?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:W,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${l?"rotate-180":"rotate-0"}
                `,"aria-label":l?"Tutup sidebar":"Buka sidebar",children:e.jsx(re,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:V.map(a=>{const r=N(a.href),d=n==="clinic"&&!!a.submenu?.length,s=G(a);if(d){const o=a.submenu.some(i=>N(i.href)),x=O===a.label;return e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{v(i=>i===a.label?null:a.label),u(!1)},className:`
                          group relative flex items-center
                          h-12 rounded-2xl w-full
                          transition-all duration-300
                          ${o?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                          ${l?"px-3 gap-3":"justify-center px-0"}
                        `,children:[o&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                          flex items-center justify-center w-9 h-9 rounded-xl
                          transition-all duration-300 relative
                          ${o?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                        `,children:[e.jsx(a.icon,{className:"w-[18px] h-[18px]",strokeWidth:o?2.5:2}),!l&&s>0&&e.jsx("span",{className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1612] shadow-xs animate-in zoom-in-50",children:s>99?"99+":s})]}),l&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                              flex-1 text-sm font-medium tracking-wide text-left truncate
                              transition-all duration-300
                              ${o?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                            `,children:a.label}),s>0&&e.jsx("span",{className:"mr-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:s>99?"99+":s}),e.jsx(fe,{className:`
                              w-4 h-4 transition-transform duration-300 shrink-0
                              ${o?"text-white":"text-[#A89F91]"}
                              ${x?"rotate-180":""}
                            `})]}),!l&&!x&&e.jsxs("div",{className:`
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
                          `,children:[a.label,s>0&&` (${s})`,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),!l&&x&&e.jsxs("div",{className:`
                            absolute left-full top-0 ml-3.5 z-50 min-w-[220px] w-max max-w-[260px]
                            bg-[#1a1612] backdrop-blur-md
                            border-2 border-[#C9A24A]/50 rounded-2xl
                            shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                            p-2.5 flex flex-col gap-1
                            animate-in fade-in zoom-in-95 duration-150
                          `,children:[e.jsx("div",{className:"absolute -left-[7px] top-6 -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1612] border-l-2 border-b-2 border-[#C9A24A]/50 rotate-45 pointer-events-none"}),e.jsxs("div",{className:"px-3 py-1.5 border-b border-[#C9A24A]/20 flex items-center justify-between gap-3 mb-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-[#E8C547] uppercase tracking-wider whitespace-nowrap",children:a.label}),e.jsxs("span",{className:"text-[10px] text-[#A89F91] font-semibold whitespace-nowrap shrink-0",children:[a.submenu?.length," Menu"]})]}),a.submenu?.map(i=>{const C=N(i.href),p=S(i.label,i.href);return e.jsxs(f,{to:i.href,onClick:()=>{v(null),m()},className:`
                                  flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${C?"bg-gradient-to-r from-[#C9A24A]/30 to-[#B8943F]/30 text-[#E8C547] font-bold border border-[#C9A24A]/40 shadow-inner":"text-[#D4C5B0] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsxs("div",{className:"flex items-center min-w-0",children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 ${C?"bg-[#E8C547]":"bg-[#A89F91]"}`}),e.jsx("span",{className:"truncate",children:i.label})]}),p>0&&e.jsx("span",{className:"ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:p>99?"99+":p})]},i.label)})]}),l&&x&&e.jsx("div",{className:"pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#C9A24A]/40 ml-6 mt-1 animate-in fade-in slide-in-from-top-1 duration-200",children:a.submenu?.map(i=>{const C=N(i.href),p=S(i.label,i.href);return e.jsxs(f,{to:i.href,onClick:()=>{v(null),m()},className:`
                                  flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${C?"bg-[#C9A24A]/30 text-[#E8C547] font-bold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                                `,children:[e.jsxs("div",{className:"flex items-center min-w-0",children:[e.jsx("span",{className:`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${C?"bg-[#E8C547]":"bg-[#A89F91]"}`}),e.jsx("span",{className:"truncate",children:i.label})]}),p>0&&e.jsx("span",{className:"ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:p>99?"99+":p})]},i.label)})})]},a.label)}return e.jsxs(f,{to:a.href,onClick:m,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${r?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${l?"px-3 gap-3":"justify-center px-0"}
                    `,children:[r&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${r?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(a.icon,{className:"w-[18px] h-[18px]",strokeWidth:r?2.5:2}),s>0&&e.jsx("span",{className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1612] shadow-xs",children:s>99?"99+":s})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide truncate
                      transition-all duration-500
                      ${r?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${l?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:a.label}),l&&s>0&&e.jsx("span",{className:"ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs",children:s>99?"99+":s}),!l&&e.jsxs("div",{className:`
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
                      `,children:[a.label,s>0&&` (${s})`,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},a.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:I,onClick:()=>u(a=>!a),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${y?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                    ${l?"px-3 gap-3":"justify-center px-0"}
                  `,children:[e.jsxs("div",{className:"relative",children:[t?.avatar?e.jsx("img",{src:t.avatar.includes("storage/data:image")?t.avatar.substring(t.avatar.indexOf("data:image")):t.avatar,alt:t?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      `,children:(t?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                    overflow-hidden transition-all duration-500
                    ${l?"w-auto opacity-100":"w-0 opacity-0"}
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:t?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!l&&!y&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:t?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),y&&e.jsxs("div",{ref:K,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[t?.avatar?e.jsx("img",{src:t.avatar.includes("storage/data:image")?t.avatar.substring(t.avatar.indexOf("data:image")):t.avatar,alt:t?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(t?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:t?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:t?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(f,{to:"/profile",onClick:()=>{u(!1),m()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(ge,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(f,{to:"/settings",onClick:()=>{u(!1),m()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(R,{className:"w-4 h-4 text-[#C9A24A]"}),"Preferensi"]}),e.jsxs(f,{to:n==="clinic"?"/dashboard/clinic?tab=content-download":"/download",onClick:()=>{u(!1),m()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[n==="clinic"?e.jsx(ue,{className:"w-4 h-4 text-[#C9A24A]"}):e.jsx(ve,{className:"w-4 h-4 text-[#C9A24A]"}),n==="clinic"?"Upload Aplikasi":"Download Aplikasi"]}),e.jsxs(f,{to:"/",onClick:()=>{u(!1),m()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(xe,{className:"w-4 h-4 text-[#C9A24A]"}),"Web Publik"]})]})]})]})]})]})}),e.jsxs("div",{className:`flex-1 min-w-0 flex flex-col transition-all duration-300 ${n==="clinic"?l?"pl-[276px]":"pl-[88px]":""}`,children:[e.jsx(he,{role:n,navbarLabel:L}),e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:e.jsx(oe,{transitionKey:b.pathname+b.search,children:g})}),!X&&e.jsx(me,{session:t,navbarLabel:L,role:n,consultationsCount:w,activeTreatmentsCount:A,availableDoctorsCount:z})]})]})]})}export{Ke as D};
