import{c as _,f as S,i as F,r as c,m as M,j as e,L as x,U as $,A as L}from"./index-DQj7Vot6.js";import{a as R,S as O,L as z}from"./settings-DOYANOL4.js";import{C as P}from"./chevron-right-DnvX0I-X.js";import{C as I}from"./credit-card-DSlu5XqQ.js";import{C as T}from"./map-pin-C_C3YKxD.js";import{M as U}from"./message-square-salATERv.js";import{C as K}from"./chevron-down-C3rqOjeU.js";import{P as W}from"./pencil-CsUgxxHC.js";import{D as q}from"./download-eeW-XM49.js";import{P as H}from"./pen-line-B7TWBjO3.js";import{A as J}from"./award-B63AuLtq.js";import{S as G}from"./star-CmS-uIqh.js";import{S as Q}from"./sparkles-D_-esdQ0.js";const V=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],Z=_("layout-dashboard",V);const X=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m4.93 4.93 4.24 4.24",key:"1ymg45"}],["path",{d:"m14.83 9.17 4.24-4.24",key:"1cb5xl"}],["path",{d:"m14.83 14.83 4.24 4.24",key:"q42g0n"}],["path",{d:"m9.17 14.83-4.24 4.24",key:"bqpfvv"}],["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}]],Y=_("life-buoy",X);function pe({userName:s,onLogout:N}){const u=S(),t=F(),[r,w]=c.useState(()=>{try{const a=localStorage.getItem("apident:sidebar_expanded");return a!==null?JSON.parse(a):!1}catch{return!1}}),[m,i]=c.useState(!1),[g,C]=c.useState(!1),A=c.useRef(null),b=c.useRef(null),y=()=>{w(a=>{const o=!a;try{localStorage.setItem("apident:sidebar_expanded",JSON.stringify(o))}catch{}return o}),i(!1)},l=()=>{i(!1)};c.useEffect(()=>{const a=o=>{A.current&&!A.current.contains(o.target)&&b.current&&!b.current.contains(o.target)&&i(!1)};return document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[]);const n=[{label:"Dashboard",href:"/dashboard/user",icon:Z},{label:"Membership",href:"/membership",icon:I},{label:"Reservasi",href:"/dashboard/user?tab=reservasi",icon:T},{label:"Konsultasi",href:"/dashboard/user?tab=konsultasi",icon:U}],d=[{label:"Pusat Bantuan (FAQ)",href:"/help",icon:R},{label:"Pengaduan & Masukan",href:"/dashboard/user?tab=pengaduan",icon:M}],h=a=>{const[o,j]=a.split("?");if(u.pathname!==o)return!1;const k=new URLSearchParams(j||"").get("tab"),B=u.search.startsWith("?")?u.search.slice(1):u.search,E=new URLSearchParams(B).get("tab")||"dashboard";return k?k===E:E==="dashboard"},v=d.some(a=>h(a.href)),p=s||t?.name||"Pengguna",D=t?.email||"user@aestheticpondokindah.local";return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-visible relative
          ${r?"w-[240px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:y,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${r?"rotate-180":"rotate-0"}
            `,"aria-label":r?"Tutup sidebar":"Buka sidebar",children:e.jsx(P,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4 overflow-y-auto overflow-x-hidden",children:[n.map(({label:a,href:o,icon:j})=>{const f=h(o);return e.jsxs(x,{to:o,onClick:l,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${f?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${r?"px-3 gap-3":"justify-center px-0"}
                `,children:[f&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl
                  transition-all duration-300
                  ${f?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:e.jsx(j,{className:"w-[18px] h-[18px]",strokeWidth:f?2.5:2})}),e.jsx("span",{className:`
                  text-sm font-medium transition-all duration-500
                  ${f?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${r?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:a}),!r&&e.jsxs("div",{className:`
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
                  `,children:[a,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},a)}),e.jsxs("div",{className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>{r||w(!0),C(a=>!a)},className:`
                w-full group relative flex items-center justify-between
                h-12 rounded-2xl
                transition-all duration-300 ease-out cursor-pointer
                ${v?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)] text-white":"hover:bg-[#2a2319] text-[#D4C5B0]"}
                ${r?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("div",{className:`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl shrink-0
                  transition-all duration-300
                  ${v?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:e.jsx(Y,{className:"w-[18px] h-[18px]",strokeWidth:v?2.5:2})}),e.jsx("span",{className:`
                  text-sm font-medium transition-all duration-500 truncate
                  ${v?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${r?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:"Bantuan & Pengaduan"})]}),r&&e.jsx(K,{className:`w-4 h-4 text-[#A89F91] transition-transform duration-300 shrink-0 ${g?"rotate-180 text-[#E8C547]":""}`}),!r&&e.jsxs("div",{className:`
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
                `,children:["Bantuan & Pengaduan",e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),r&&(g||v)&&e.jsx("div",{className:"ml-4 mt-1 pl-3 border-l-2 border-[#C9A24A]/30 space-y-1 py-1",children:d.map(a=>{const o=h(a.href),j=a.icon;return e.jsxs(x,{to:a.href,onClick:l,className:`
                        flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${o?"bg-[#C9A24A]/30 text-[#E8C547] border border-[#C9A24A]/40":"text-[#A89F91] hover:text-[#E8C547] hover:bg-[#2a2319]"}
                      `,children:[e.jsx(j,{className:"w-3.5 h-3.5 shrink-0"}),e.jsx("span",{className:"truncate",children:a.label})]},a.label)})})]})]}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{ref:b,onClick:()=>i(a=>!a),className:`
                group flex items-center
                h-14 rounded-2xl
                hover:bg-[#2a2319]
                transition-all duration-300 cursor-pointer
                ${m?"bg-[#2a2319] ring-1 ring-[#C9A24A]/50":""}
                ${r?"px-3 gap-3":"justify-center px-0"}
              `,children:[e.jsxs("div",{className:"relative",children:[t?.avatar?e.jsx("img",{src:t.avatar.includes("storage/data:image")?t.avatar.substring(t.avatar.indexOf("data:image")):t.avatar,alt:p,className:"w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50"}):e.jsx("div",{className:`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50
                  `,children:p.charAt(0).toUpperCase()}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
                overflow-hidden transition-all duration-500
                ${r?"w-auto opacity-100":"w-0 opacity-0"}
              `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:p}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Pasien"})]}),!r&&!m&&e.jsxs("div",{className:`
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
                `,children:[e.jsx("p",{className:"font-semibold",children:p}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Pasien"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),m&&e.jsxs("div",{ref:A,className:`
                  absolute left-full bottom-0 ml-3 w-64
                  bg-[#1a1612] backdrop-blur-md
                  border-2 border-[#C9A24A]/50 rounded-2xl
                  shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                  p-4 z-50
                  transition-all duration-200 ease-out
                `,children:[e.jsxs("div",{className:"flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20",children:[t?.avatar?e.jsx("img",{src:t.avatar.includes("storage/data:image")?t.avatar.substring(t.avatar.indexOf("data:image")):t.avatar,alt:p,className:"w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"}):e.jsx("div",{className:"w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0",children:p.charAt(0).toUpperCase()}),e.jsxs("div",{className:"overflow-hidden min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-[#E8C547] truncate",children:p}),e.jsx("p",{className:"text-xs text-[#A89F91] truncate",children:D})]})]}),e.jsxs("div",{className:"pt-2 space-y-1",children:[e.jsxs(x,{to:"/profile",onClick:()=>{i(!1),l()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx($,{className:"w-4 h-4 text-[#C9A24A]"}),"Detail Profil"]}),e.jsxs(x,{to:"/profile/edit",onClick:()=>{i(!1),l()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(W,{className:"w-4 h-4 text-[#C9A24A]"}),"Edit Profil"]}),e.jsxs(x,{to:"/settings",onClick:()=>{i(!1),l()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(O,{className:"w-4 h-4 text-[#C9A24A]"}),"Pengaturan"]}),e.jsxs(x,{to:"/download",onClick:()=>{i(!1),l()},className:"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all",children:[e.jsx(q,{className:"w-4 h-4 text-[#C9A24A]"}),"Download Aplikasi"]}),e.jsxs("button",{onClick:()=>{i(!1),N&&N()},className:"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2",children:[e.jsx(z,{className:"w-4 h-4 text-rose-400"}),"Keluar Sesi"]})]})]})]})]})]})})}function ue({session:s,navbarLabel:N,role:u}){const[t,r]=c.useState(null),w=n=>n?n.includes("storage/data:image")?n.substring(n.indexOf("data:image")):n:"";c.useEffect(()=>{const n=localStorage.getItem("apident:token");n&&fetch(`${L}/user/profile`,{headers:{Authorization:`Bearer ${n}`,Accept:"application/json"}}).then(d=>d.ok?d.json():null).then(d=>{d&&r(d)}).catch(()=>{})},[]);const m=t?.name||s?.name||"Pengguna",i=w(t?.avatar||s?.avatar),g=(t?.membership_level||s?.membership_level||"bronze").toLowerCase(),C=t?.membership_points??s?.membership_points??0,b=(()=>{const n=[t?.name||s?.name,t?.email||s?.email,t?.phone||t?.whatsapp||s?.whatsapp||s?.phone,t?.gender||s?.gender,t?.birthDate||s?.birthDate,t?.bloodType||s?.blood_type,t?.job||s?.job,t?.address||s?.address_line,t?.province||s?.province,t?.city||s?.city],d=n.filter(h=>h&&h!=="-"&&h!=="").length;return Math.round(d/n.length*100)})(),l=(n=>{switch(n){case"diamond":return{title:"DIAMOND MEMBER",discount:"40%",priority:"VIP Fast Track",gradient:"from-[#0EA5E9] to-[#0369A1]"};case"platinum":return{title:"PLATINUM MEMBER",discount:"30%",priority:"Prioritas Utama",gradient:"from-[#64748B] to-[#334155]"};case"gold":return{title:"GOLD MEMBER",discount:"20%",priority:"Tinggi",gradient:"from-[#D4AF37] to-[#AA7C11]"};default:return{title:"BRONZE MEMBER",discount:"10%",priority:"Standar",gradient:"from-[#C9A24A] to-[#B8943F]"}}})(g);return u==="user"?e.jsxs("aside",{className:"w-[320px] min-w-[320px] bg-white p-4 pl-3 hidden lg:flex flex-col gap-5 overflow-y-auto",children:[e.jsxs("div",{className:"bg-gradient-to-br from-[#3D3428] to-[#2A241C] rounded-2xl p-5 text-white shadow-lg",children:[e.jsxs("div",{className:"flex items-center gap-4 mb-4",children:[i?e.jsx("img",{src:i,alt:m,className:"w-14 h-14 rounded-full object-cover shadow-lg border-2 border-[#E8C547]"}):e.jsx("div",{className:"w-14 h-14 rounded-full bg-gradient-to-br from-[#E8C547] to-[#C9A24A] flex items-center justify-center text-white text-xl font-bold shadow-lg",children:m[0]?.toUpperCase()||"U"}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-white text-base truncate max-w-[170px]",children:m}),e.jsxs("span",{className:"text-xs font-semibold text-[#E8C547] capitalize",children:[g," Member"]})]})]}),e.jsxs("div",{className:"mb-5",children:[e.jsxs("div",{className:"flex justify-between text-xs text-white/80 mb-1",children:[e.jsx("span",{children:"Progress Kelengkapan Profil"}),e.jsxs("span",{className:"font-bold text-[#E8C547]",children:[b,"%"]})]}),e.jsx("div",{className:"h-2 bg-white/10 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-gradient-to-r from-[#E8C547] to-[#C9A24A] rounded-full transition-all duration-500",style:{width:`${b}%`}})})]}),e.jsx(x,{to:"/profile/edit",children:e.jsxs("button",{className:"w-full py-3 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 group shadow-md cursor-pointer",children:[e.jsx(H,{className:"w-4 h-4"}),"Edit Profil"]})})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("h4",{className:"text-[#5C4A32] font-bold flex items-center gap-2 text-sm",children:[e.jsx(J,{className:"w-4 h-4 text-[#C9A24A]"}),"Membership"]}),e.jsxs(x,{to:"/membership",className:"text-xs font-semibold text-[#8B7355] hover:text-[#C9A24A] flex items-center gap-1 transition-colors",children:["Detail",e.jsx(P,{className:"w-3 h-3"})]})]}),e.jsxs("div",{className:`bg-gradient-to-br ${l.gradient} rounded-2xl p-5 text-white shadow-md`,children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-white/80 mb-1",children:"Level Membership"}),e.jsx("p",{className:"text-lg font-bold text-white tracking-wide",children:l.title})]}),e.jsx("div",{className:"w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0",children:e.jsx(G,{className:"w-5 h-5 text-white"})})]}),e.jsxs("div",{className:"space-y-2 mb-4",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsx("span",{className:"text-white/80",children:"Diskon perawatan"}),e.jsx("span",{className:"font-semibold text-white",children:l.discount})]}),e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsx("span",{className:"text-white/80",children:"Prioritas booking"}),e.jsx("span",{className:"font-semibold text-white",children:l.priority})]}),e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsx("span",{className:"text-white/80",children:"Total Poin"}),e.jsxs("span",{className:"font-bold text-emerald-300 flex items-center gap-1",children:[e.jsx(Q,{className:"w-3 h-3"}),C.toLocaleString("id-ID")," Pts"]})]})]}),e.jsxs("div",{className:"flex items-center justify-between pt-3 border-t border-white/20",children:[e.jsx("span",{className:"text-xs text-white/80",children:"Status Keanggotaan"}),e.jsx("span",{className:"text-xs font-bold text-white",children:"Aktif"})]})]})]})]}):null}export{pe as A,ue as D,Z as L};
