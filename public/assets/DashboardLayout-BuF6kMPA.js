import{c as le,w as G,S as Q,V as R,p as $,u as V,r as o,W as de,j as e,E as F,Y as H,X as ce,C as xe,n as X,b as Y,a as w,U as Z,o as ue,y as be,z as he}from"./index-B7lEt7Hb.js";import{b as M,S as z,L as ee,N as me,A as pe,U as fe,D as ge}from"./NewMobileDashboardLayout-MmI4htvc.js";import{T as ve}from"./trash-2-CNL9pzUq.js";import{C as P}from"./message-square-QO0Vd8ZQ.js";import{C as je}from"./shield-EldbYAPQ.js";import{F as we,E as Ce}from"./file-text-D38GUROU.js";import{U as J}from"./users-Bld_-bLh.js";import{D as te}from"./download-CD5WPZis.js";import{C as Ne}from"./chevron-down-DY88jOkV.js";const Ae=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],ke=le("volume-2",Ae),ye=[{label:"Blog",href:"/dashboard/clinic?tab=content-blog"},{label:"Promo",href:"/dashboard/clinic?tab=content-promo"},{label:"Pop Up",href:"/dashboard/clinic?tab=content-popup"},{label:"Galeri",href:"/dashboard/clinic?tab=content-gallery"},{label:"Testimoni",href:"/dashboard/clinic?tab=content-testimonials"},{label:"Daftar Aplikasi Mobile",href:"/dashboard/clinic?tab=content-download"}],Ee=[{label:"Reservasi",href:"/dashboard/clinic?tab=reservasi"},{label:"Konsultasi",href:"/dashboard/clinic?tab=konsultasi"}],_e=[{label:"Daftar Pengguna",href:"/dashboard/clinic?tab=users"},{label:"Membership",href:"/dashboard/clinic/membership"}],Se={root:{[R.USER]:[{label:"Dashboard",icon:M,href:"/dashboard/user"},{label:"Konsultasi",icon:P,href:"/dashboard/user?tab=konsultasi"},{label:"Pengaduan",icon:G,href:"/dashboard/user?tab=pengaduan"}],[R.CLINIC]:[{label:"Dashboard",icon:M,href:"/dashboard/clinic"},{label:"Sistem Booking",icon:P,href:"/dashboard/clinic?tab=reservasi",submenu:Ee},{label:"Pengaduan",icon:G,href:"/dashboard/clinic?tab=pengaduan"},{label:"Konten",icon:we,href:"/dashboard/clinic?tab=content-blog",submenu:ye},{label:"Kelola Pengguna",icon:J,href:"/dashboard/clinic?tab=users",submenu:_e},{label:"Dokter",icon:Q,href:"/dashboard/clinic?tab=doctors"},{label:"Pengaturan Klinik",icon:z,href:"/dashboard/clinic?tab=settings"}],[R.DOCTOR]:[{label:"Dashboard",icon:M,href:"/dashboard/doctor"},{label:"Jadwal Praktik",icon:P,href:"/dashboard/doctor?tab=jadwal"},{label:"Daftar Pasien",icon:J,href:"/dashboard/doctor?tab=reservasi"}]}};function ae(x){return Se.root[x]??[]}function De({role:x,navbarLabel:r}){$();const c=V(),[p,g]=o.useState(typeof window<"u"&&"Notification"in window?Notification.permission:"default"),[l,j]=o.useState(()=>{try{const a=localStorage.getItem("apig_recent_push_notifications");return a?JSON.parse(a):[]}catch{return[]}}),[v,n]=o.useState(()=>{try{return Number(localStorage.getItem("apig_push_unread_count")||0)}catch{return 0}}),[C,m]=o.useState(!1),[_,D]=o.useState(!0),i=o.useRef(null);o.useEffect(()=>{const a=de(b=>{j(E=>{const t=[{...b,id:b.id||`notif_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,dateStr:b.dateStr||new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})},...E.slice(0,49)];try{localStorage.setItem("apig_recent_push_notifications",JSON.stringify(t))}catch{}return t}),n(E=>{const t=E+1;try{localStorage.setItem("apig_push_unread_count",String(t))}catch{}return t})});return()=>a()},[]),o.useEffect(()=>{typeof window<"u"&&"Notification"in window&&g(Notification.permission)},[]),o.useEffect(()=>{const a=b=>{i.current&&!i.current.contains(b.target)&&m(!1)};return document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[]);const d=async()=>{if(typeof window<"u"&&"Notification"in window)try{const a=await Notification.requestPermission();g(a),a==="granted"&&(H("confirmed"),new Notification("🔔 Notifikasi Berhasil Diaktifkan",{body:"Anda akan menerima notifikasi instan untuk setiap reservasi baru dan update status pasien.",icon:"/logo/logo.png"}))}catch(a){console.warn("Failed to request permission:",a)}},N=()=>{j([]),n(0),localStorage.removeItem("apig_recent_push_notifications"),localStorage.setItem("apig_push_unread_count","0")},A=()=>{n(0),localStorage.setItem("apig_push_unread_count","0")},y=a=>{m(!1),a.onClick?a.onClick():a.url?c(a.url.replace(/^#/,"")):c(x==="clinic"?"/dashboard/clinic?tab=reservasi":x==="doctor"?"/dashboard/doctor?tab=reservasi":"/dashboard/user?tab=reservasi")};return e.jsxs("header",{className:"sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8DFC8] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-8 h-8 rounded-xl bg-gradient-to-br from-[#8C6B1C] to-[#C9A24A] flex items-center justify-center text-white font-bold text-sm shadow-xs",children:"A"}),e.jsxs("div",{children:[e.jsxs("h1",{className:"text-xs sm:text-sm font-bold text-[#2C2416] flex items-center gap-1.5 leading-tight",children:[e.jsx("span",{children:"Aesthetic Pondok Indah"}),e.jsx("span",{className:"hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]",children:x==="clinic"?"Admin Klinik":x==="doctor"?"Dokter Spesialis":"Pasien Member"})]}),e.jsx("p",{className:"text-[10px] text-[#8C8272] hidden sm:block",children:r||"Sistem Manajemen Klinik & Reservasi Terpadu"})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-2xs",children:[e.jsxs("span",{className:"relative flex h-2 w-2",children:[e.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"}),e.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-emerald-500"})]}),e.jsx("span",{className:"hidden md:inline",children:"Realtime Aktif (1s)"})]})]}),e.jsxs("div",{className:"flex items-center gap-2 sm:gap-3",ref:i,children:[p!=="granted"&&e.jsxs("button",{type:"button",onClick:d,className:"flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer animate-pulse",title:"Klik untuk mengaktifkan notifikasi popup desktop & suara",children:[e.jsx(F,{className:"w-3.5 h-3.5"}),e.jsx("span",{className:"hidden sm:inline",children:"Izinkan Notifikasi Push"}),e.jsx("span",{className:"sm:hidden",children:"Notif ON"})]}),e.jsx("button",{type:"button",onClick:()=>{H("new_booking")},className:"w-9 h-9 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] hover:bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center transition-colors cursor-pointer",title:"Uji Suara Notifikasi (Chime Sound)",children:e.jsx(ke,{className:"w-4 h-4"})}),e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{m(a=>!a),C||A()},className:`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${C?"bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-md":"bg-white border-[#D9D0BC] hover:border-[#8C6B1C] text-[#3D332A] shadow-xs"}`,title:"Pusat Notifikasi Realtime",children:[e.jsx(F,{className:"w-4 h-4"}),v>0&&e.jsx("span",{className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs animate-bounce",children:v>99?"99+":v})]}),C&&e.jsxs("div",{className:"absolute right-0 mt-2 w-[92vw] sm:w-96 max-w-sm bg-white rounded-3xl border border-[#E8DFC8] shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-200 text-left",children:[e.jsxs("div",{className:"px-4 py-3.5 bg-[#FAF8F5] border-b border-[#EDE5D6] flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(F,{className:"w-4 h-4 text-[#8C6B1C]"}),e.jsx("h3",{className:"text-xs font-bold text-[#2C2416]",children:"Pusat Notifikasi Realtime"}),e.jsx("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EADBBD] text-[#5C4510]",children:l.length})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[l.length>0&&e.jsxs("button",{type:"button",onClick:N,className:"text-[10px] text-rose-600 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1",title:"Bersihkan Semua",children:[e.jsx(ve,{className:"w-3 h-3"}),e.jsx("span",{children:"Hapus"})]}),e.jsx("button",{type:"button",onClick:()=>m(!1),className:"w-6 h-6 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer ml-1",children:e.jsx(ce,{className:"w-3.5 h-3.5"})})]})]}),e.jsx("div",{className:"max-h-[380px] overflow-y-auto divide-y divide-[#F5EFE6]",children:l.length===0?e.jsxs("div",{className:"p-8 text-center space-y-2 text-[#8C8272]",children:[e.jsx("div",{className:"w-12 h-12 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mx-auto",children:e.jsx(F,{className:"w-6 h-6 opacity-60"})}),e.jsx("p",{className:"text-xs font-semibold text-[#3D332A]",children:"Belum Ada Notifikasi Baru"}),e.jsx("p",{className:"text-[11px] leading-relaxed",children:"Setiap ada booking dari Guest, Pasien, atau konfirmasi dokter, notifikasi akan otomatis muncul di sini secara realtime."})]}):l.map((a,b)=>e.jsxs("div",{onClick:()=>y(a),className:"p-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-start gap-3 group",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0 shadow-2xs group-hover:scale-105 transition-transform mt-0.5",children:a.type==="reservation_confirmed"?e.jsx(xe,{className:"w-4 h-4 text-emerald-600"}):a.type==="doctor_assigned"?e.jsx(Q,{className:"w-4 h-4 text-[#8C6B1C]"}):e.jsx(P,{className:"w-4 h-4 text-[#8C6B1C]"})}),e.jsxs("div",{className:"flex-1 min-w-0 space-y-0.5",children:[e.jsxs("div",{className:"flex items-center justify-between gap-1",children:[e.jsx("span",{className:"text-[10px] font-bold text-[#8C6B1C] truncate",children:a.sender||"Sistem Reservasi"}),e.jsxs("span",{className:"text-[9px] text-[#A0988A] shrink-0 flex items-center gap-0.5",children:[e.jsx(je,{className:"w-2.5 h-2.5"}),a.dateStr||"Baru saja"]})]}),e.jsx("p",{className:"text-xs font-bold text-[#2C2416] line-clamp-1 group-hover:text-[#8C6B1C]",children:a.title}),e.jsx("p",{className:"text-[11px] text-[#5C5546] line-clamp-2 leading-relaxed",children:a.message}),a.bookingCode&&e.jsx("span",{className:"inline-block text-[9px] font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2 py-0.5 rounded-md border border-[#EADBBD] mt-1",children:a.bookingCode})]})]},a.id||b))}),e.jsx("div",{className:"p-3 bg-[#FAF8F5] border-t border-[#EDE5D6] text-center",children:e.jsxs("button",{type:"button",onClick:()=>{m(!1),c(x==="clinic"?"/dashboard/clinic?tab=reservasi":x==="doctor"?"/dashboard/doctor?tab=reservasi":"/dashboard/user?tab=reservasi")},className:"text-xs font-bold text-[#8C6B1C] hover:underline inline-flex items-center gap-1 cursor-pointer",children:[e.jsx("span",{children:"Buka Semua Data Reservasi"}),e.jsx(Ce,{className:"w-3 h-3"})]})})]})]})]})]})}function Be({onLogout:x}){const[r,c]=o.useState(!1),[p,g]=o.useState(!1),l=o.useRef(null),j=o.useRef(null),v=X(),n=$();o.useEffect(()=>{const i=d=>{l.current&&!l.current.contains(d.target)&&j.current&&!j.current.contains(d.target)&&g(!1)};return document.addEventListener("mousedown",i),()=>document.removeEventListener("mousedown",i)},[]);const C=()=>{c(i=>!i),g(!1)},m=()=>{c(!1),g(!1)},_=i=>{const d=v.pathname,N=new URLSearchParams(v.search).get("tab"),[A,y]=i.split("?");if(d!==A)return!1;const a=y?new URLSearchParams(y).get("tab"):null;return a?N===a:!N},D=ae("doctor");return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${r?"w-[260px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:C,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${r?"rotate-180":"rotate-0"}
            `,"aria-label":r?"Tutup sidebar":"Buka sidebar",children:e.jsx(Y,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:D.map(i=>{const d=_(i.href);return e.jsxs(w,{to:i.href,onClick:m,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${d?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${r?"px-3 gap-3":"justify-center px-0"}
                `,children:[d&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                  flex items-center justify-center w-9 h-9 rounded-xl
                  transition-all duration-300 relative
                  ${d?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:[e.jsx(i.icon,{className:"w-[18px] h-[18px]",strokeWidth:d?2.5:2}),i.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${d?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${r?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:i.label}),!r&&e.jsxs("div",{className:`
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
                  `,children:[i.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},i.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:j,onClick:()=>g(i=>!i),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${p?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${r?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[n?.avatar?e.jsx("img",{src:n.avatar.includes("storage/data:image")?n.avatar.substring(n.avatar.indexOf("data:image")):n.avatar,alt:n?.name||"User",className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50 shrink-0
                  `,children:(n?.name||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${r?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:n?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Dokter Spesialis"})]}),!r&&!p&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:n?.name||"Dokter Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Dokter Spesialis"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),p&&e.jsxs("div",{ref:l,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[n?.avatar?e.jsx("img",{src:n.avatar.includes("storage/data:image")?n.avatar.substring(n.avatar.indexOf("data:image")):n.avatar,alt:n?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(n?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:n?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:n?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(w,{to:"/profile",onClick:m,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(Z,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(w,{to:"/settings",onClick:m,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(z,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(w,{to:"/download",onClick:m,className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(te,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{g(!1),x()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(ee,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function Fe(){const[x,r]=o.useState(!1);return o.useEffect(()=>{const c=window.matchMedia("(max-width: 767px)"),p=()=>r(c.matches);return p(),c.addEventListener("change",p),()=>c.removeEventListener("change",p)},[]),x}function Ge({children:x,role:r,consultationsCount:c=0,activeTreatmentsCount:p=0,availableDoctorsCount:g=0}){const[l,j]=o.useState(!1),[v,n]=o.useState(!1),[C,m]=o.useState([]),[_,D]=o.useState({top:0,left:0}),[i,d]=o.useState(!1),N=o.useRef(null),A=o.useRef(null);o.useEffect(()=>{const s=h=>{N.current&&!N.current.contains(h.target)&&A.current&&!A.current.contains(h.target)&&d(!1)};return document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[]);const y=()=>{j(s=>!s),n(!1),d(!1)},a=()=>{j(!1),n(!1),d(!1)},b=X(),E=V(),t=$(),se=(()=>{if(!t)return 0;const s=["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"],h=s.filter(u=>!!(t[u]||t[u.replace(/([A-Z])/g,"_$1").toLowerCase()]||t[u==="phone"?"whatsapp":u]||t[u==="bloodType"?"blood_type":u]||t[u==="address"?"address_line":u])),f=(t.interests||[]).length>0?1:0;return Math.round((h.length+f)/(s.length+1)*100)})()>=100,re=Array.isArray(t?.dentalComplaints)&&t?.dentalComplaints?.length>0&&Array.isArray(t?.desiredServices)&&t?.desiredServices?.length>0,O=t?.membership_level||"bronze",T={bronze:{label:"Basic Member",shortLabel:"Basic",gradient:"from-[#CD7F32] to-[#A0522D]"},gold:{label:"Premium Member",shortLabel:"Premium",gradient:"from-[#c9a24a] to-[#a8843a]"},platinum:{label:"Priority Member",shortLabel:"Priority",gradient:"from-[#8B9DAF] to-[#6B7D8F]"}},ne=T[O]||T.bronze;t?.membership_status==="active"||t?.membershipStatus==="active"||t?.membership_status==="member"||t?.membershipStatus;const I=r==="clinic"?"Admin Klinik":r==="doctor"?"Dokter Klinik":r==="user"?ne.label:"Client Klinik";o.useEffect(()=>{ue()},[b.pathname,b.search]);const oe=ae(r),U=()=>{be(),he(),E("/login")},L=s=>{const h=b.pathname,B=new URLSearchParams(b.search).get("tab"),[f,u]=s.split("?");if(h!==f)return!1;const k=u?new URLSearchParams(u).get("tab"):null;return k?B===k:!B},S=new URLSearchParams(b.search).get("tab")||"dashboard",K=b.pathname,W=["/membership","/settings","/help","/profile"],ie=r==="user"&&(S==="reservasi"||S==="konsultasi"||S==="pengaduan")||r==="doctor"&&S!=="dashboard"||r==="clinic"||W.some(s=>K.startsWith(s));return(r==="user"||r==="clinic")&&S==="dashboard"&&W.some(s=>K.startsWith(s)),Fe()?e.jsx(me,{role:r,children:x}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start",children:[r==="user"?e.jsx(pe,{userName:t?.name||"User",onLogout:U}):r==="doctor"?e.jsx(Be,{onLogout:U}):e.jsxs("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:[e.jsxs("aside",{className:`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${l?"w-[260px]":"w-[72px]"}
            `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:y,className:`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${l?"rotate-180":"rotate-0"}
                `,"aria-label":l?"Tutup sidebar":"Buka sidebar",children:e.jsx(Y,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:oe.map(s=>{const h=L(s.href);if(r==="clinic"&&!!s.submenu?.length){const f=s.submenu.some(u=>L(u.href));return e.jsxs("button",{type:"button",onClick:u=>{const k=!v||C!==s.submenu;if(k){const q=u.currentTarget.getBoundingClientRect();D({top:q.top,left:q.right+12})}k&&!f&&E(s.href),m(s.submenu||[]),n(k)},className:`
                        group relative flex items-center
                        h-12 rounded-2xl w-full
                        transition-all duration-300
                        ${f?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                        ${l?"px-3 gap-3":"justify-center px-0"}
                      `,children:[f&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                        flex items-center justify-center w-9 h-9 rounded-xl
                        transition-all duration-300
                        ${f?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                      `,children:e.jsx(s.icon,{className:"w-[18px] h-[18px]",strokeWidth:f?2.5:2})}),l&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
                            flex-1 text-sm font-medium tracking-wide text-left
                            transition-all duration-300
                            ${f?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                          `,children:s.label}),e.jsx(Ne,{className:`
                            w-4 h-4 transition-transform duration-300
                            ${f?"text-white":"text-[#A89F91]"}
                            ${v?"rotate-180":""}
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
                        `,children:[s.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},s.label)}return e.jsxs(w,{to:s.href,onClick:a,className:`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${h?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                      ${l?"px-3 gap-3":"justify-center px-0"}
                    `,children:[h&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsxs("div",{className:`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${h?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                    `,children:[e.jsx(s.icon,{className:"w-[18px] h-[18px]",strokeWidth:h?2.5:2}),s.badge&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]"})]}),e.jsx("span",{className:`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${h?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${l?"opacity-100 w-auto":"opacity-0 w-0"}
                    `,children:s.label}),!l&&e.jsxs("div",{className:`
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
                      `,children:[s.label,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},s.label)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:A,onClick:()=>d(s=>!s),className:`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${i?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
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
                  `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:t?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Admin Klinik"})]}),!l&&!i&&e.jsxs("div",{className:`
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
                    `,children:[e.jsx("p",{className:"font-semibold",children:t?.name||"Admin Klinik"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Admin Klinik"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),i&&e.jsxs("div",{ref:N,className:`
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[t?.avatar?e.jsx("img",{src:t.avatar.includes("storage/data:image")?t.avatar.substring(t.avatar.indexOf("data:image")):t.avatar,alt:t?.name||"User",className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:(t?.name||"U").charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:t?.name||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:t?.email||""})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(w,{to:"/profile",onClick:()=>{d(!1),a()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(Z,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(w,{to:"/settings",onClick:()=>{d(!1),a()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(z,{className:"w-4 h-4 text-[#C9A24A]"}),"Preferensi"]}),e.jsxs(w,{to:r==="clinic"?"/dashboard/clinic?tab=content-download":"/download",onClick:()=>{d(!1),a()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[r==="clinic"?e.jsx(fe,{className:"w-4 h-4 text-[#C9A24A]"}):e.jsx(te,{className:"w-4 h-4 text-[#C9A24A]"}),r==="clinic"?"Upload Aplikasi":"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{d(!1),U()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(ee,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]}),v&&e.jsx("div",{className:"fixed z-[60] bg-[#1a1612] border border-[#C9A24A]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 min-w-[180px] pointer-events-auto flex flex-col gap-1",style:{top:_.top,left:_.left},children:C?.map(s=>{const h=L(s.href);return e.jsxs(w,{to:s.href,onClick:a,className:`
                      flex items-center py-2.5 px-3 rounded-xl text-sm
                      transition-all duration-200
                      ${h?"bg-[#C9A24A]/30 text-[#E8C547] font-semibold":"text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"}
                    `,children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full mr-2.5 bg-current"}),s.label]},s.label)})})]}),e.jsxs("div",{className:"flex-1 min-w-0 flex flex-col",children:[e.jsx(De,{role:r,navbarLabel:I}),e.jsxs("div",{className:"flex-1 flex min-h-0 bg-gray-50/50",children:[e.jsx("main",{className:"flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300",children:x}),!ie&&e.jsx(ge,{session:t,navbarLabel:I,role:r,consultationsCount:c,activeTreatmentsCount:p,availableDoctorsCount:g})]})]})]})}export{Ge as D};
