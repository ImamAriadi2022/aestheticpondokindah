import{c as v,f as y,r as g,j as e,L as a,U as k}from"./index-DxdTtRz7.js";import{C as u}from"./chevron-right-CiQptHMT.js";import{C as w}from"./credit-card-DbBg4qj7.js";import{C as E}from"./map-pin-BKbCphsY.js";import{M as F}from"./message-square-Cv72ygKk.js";import{C as _}from"./circle-alert-CimteysJ.js";import{C as D,S as B,L as P}from"./settings-CBCAqe20.js";import{C as j}from"./calendar-days-BRlvKRVO.js";import{S}from"./stethoscope-C6cQJcDY.js";import{P as U}from"./pen-line-C-A5JCGh.js";import{A as L}from"./award-D3cVR93e.js";import{S as M}from"./star-BpPqbpN8.js";import{C as $}from"./shield-DbDmWouJ.js";const R=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],z=v("layout-dashboard",R);const T=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],W=v("trending-up",T);function se({userName:n,onLogout:c}){const r=y(),[t,m]=g.useState(!1),[N,A]=g.useState(!1),i=()=>{m(s=>!s)},x=()=>{m(!1)},h=[{label:"Dashboard",href:"/dashboard/user",icon:z},{label:"Membership",href:"/membership",icon:w},{label:"Reservasi",href:"/dashboard/user?tab=reservasi",icon:E},{label:"Konsultasi",href:"/dashboard/user?tab=konsultasi",icon:F},{label:"Pengaduan",href:"/dashboard/user?tab=pengaduan",icon:_},{label:"Bantuan",href:"/help",icon:D}],l=s=>{const[o,p]=s.split("?");if(r.pathname!==o)return!1;const b=new URLSearchParams(p||"").get("tab"),C=r.search.startsWith("?")?r.search.slice(1):r.search,f=new URLSearchParams(C).get("tab")||"dashboard";return b?b===f:f==="dashboard"};return e.jsx("div",{className:"sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0",children:e.jsxs("aside",{className:`
          pointer-events-auto flex flex-col h-full
          bg-[#1a1612]
          border-2 border-[#C9A24A]/50
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          transition-all duration-300
          overflow-hidden
          ${t?"w-[240px]":"w-[72px]"}
        `,children:[e.jsx("div",{className:"absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none"}),e.jsx("div",{className:"absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none"}),e.jsx("div",{className:"relative z-10 flex items-center justify-center h-16 px-4",children:e.jsx("button",{onClick:i,className:`
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-[#2a2319] hover:bg-[#3a3126]
              text-[#E8C547]
              transition-all duration-300 ease-out
              hover:scale-110 active:scale-95
              border border-[#C9A24A]/40
              ${t?"rotate-180":"rotate-0"}
            `,"aria-label":t?"Tutup sidebar":"Buka sidebar",children:e.jsx(u,{className:"w-5 h-5",strokeWidth:2.5})})}),e.jsx("div",{className:"mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsx("nav",{className:"relative z-10 flex-1 flex flex-col gap-2 px-3 py-4",children:h.map(({label:s,href:o,icon:p})=>{const d=l(o);return e.jsxs(a,{to:o,onClick:x,className:`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${d?"bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]":"hover:bg-[#2a2319]"}
                  ${t?"px-3 gap-3":"justify-center px-0"}
                `,children:[d&&e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10"}),e.jsx("div",{className:`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl
                  transition-all duration-300
                  ${d?"bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner":"bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"}
                `,children:e.jsx(p,{className:"w-[18px] h-[18px]",strokeWidth:d?2.5:2})}),e.jsx("span",{className:`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${d?"text-white":"text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${t?"opacity-100 w-auto":"opacity-0 w-0"}
                `,children:s}),!t&&e.jsxs("div",{className:`
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
                  `,children:[s,e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]},s)})}),e.jsxs("div",{className:"relative z-10 flex flex-col gap-2 px-3 pb-4",children:[e.jsx("div",{className:"mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent"}),e.jsxs(a,{to:"/settings",onClick:x,className:`
              group relative flex items-center
              h-12 rounded-2xl
              hover:bg-[#2a2319]
              transition-all duration-300
              ${t?"px-3 gap-3":"justify-center px-0"}
            `,children:[e.jsx("div",{className:`
              flex items-center justify-center
              w-9 h-9 rounded-xl
              bg-[#2a2319] text-[#A89F91]
              group-hover:bg-[#3a3126] group-hover:text-[#E8C547]
              transition-all duration-300
            `,children:e.jsx(B,{className:"w-[18px] h-[18px]",strokeWidth:2})}),e.jsx("span",{className:`
              text-sm font-medium text-[#D4C5B0] group-hover:text-[#E8C547]
              transition-all duration-500
              ${t?"opacity-100 w-auto":"opacity-0 w-0"}
            `,children:"Settings"}),!t&&e.jsxs("div",{className:`
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
              `,children:["Settings",e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]}),e.jsxs("div",{className:`
            group relative flex items-center
            h-14 rounded-2xl
            hover:bg-[#2a2319]
            transition-all duration-300 cursor-pointer
            ${t?"px-3 gap-3":"justify-center px-0"}
          `,children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:`
                w-10 h-10 rounded-full
                bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                flex items-center justify-center
                text-[#1a1612] font-semibold text-sm
                shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                ring-2 ring-[#C9A24A]/50
              `,children:n?n.charAt(0).toUpperCase():"U"}),e.jsx("div",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]"})]}),e.jsxs("div",{className:`
              overflow-hidden transition-all duration-500
              ${t?"w-auto opacity-100":"w-0 opacity-0"}
            `,children:[e.jsx("p",{className:"text-sm font-semibold text-[#E8C547] whitespace-nowrap",children:n||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91] whitespace-nowrap",children:"Pasien"})]}),t&&e.jsx("button",{onClick:c,className:`
                  ml-auto p-2 rounded-lg
                  text-[#A89F91] hover:text-rose-400
                  hover:bg-rose-500/10
                  transition-all duration-200
                `,title:"Logout",children:e.jsx(P,{className:"w-4 h-4"})}),!t&&e.jsxs("div",{className:`
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
              `,children:[e.jsx("p",{className:"font-semibold",children:n||"User"}),e.jsx("p",{className:"text-xs text-[#A89F91]",children:"Pasien"}),e.jsx("div",{className:"absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45"})]})]})]})]})})}function ae({session:n,navbarLabel:c,role:r,recentActivity:t=[],consultationsCount:m=0,activeTreatmentsCount:N=0,availableDoctorsCount:A=0}){const i=n?.name||"User",x=(i[0]||"U").toUpperCase(),h=()=>r==="doctor"?"Dokter":r==="clinic"?"Admin":"Member";return r==="user"?e.jsxs("aside",{className:"w-[320px] min-w-[320px] bg-white p-4 pl-3 hidden lg:flex flex-col gap-5 overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-center gap-4 pb-4 border-b border-gray-100",children:[e.jsxs(a,{to:"/dashboard/user?tab=reservasi",className:"flex flex-col items-center gap-2",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center border border-[#C9A24A]/20 hover:bg-[#F5E9D8] transition-colors cursor-pointer",children:e.jsx(j,{className:"w-5 h-5 text-[#C9A24A]"})}),e.jsx("span",{className:"text-xs text-[#5C4A32] font-medium",children:"Reservasi"})]}),e.jsxs(a,{to:"/services",className:"flex flex-col items-center gap-2",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center border border-[#C9A24A]/20 hover:bg-[#F5E9D8] transition-colors cursor-pointer",children:e.jsx(S,{className:"w-5 h-5 text-[#C9A24A]"})}),e.jsx("span",{className:"text-xs text-[#5C4A32] font-medium",children:"Layanan"})]}),e.jsxs(a,{to:"/doctors",className:"flex flex-col items-center gap-2",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center border border-[#C9A24A]/20 hover:bg-[#F5E9D8] transition-colors cursor-pointer",children:e.jsx(k,{className:"w-5 h-5 text-[#C9A24A]"})}),e.jsx("span",{className:"text-xs text-[#5C4A32] font-medium",children:"Dokter"})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-[#3D3428] to-[#2A241C] rounded-2xl p-5 text-white shadow-lg",children:[e.jsxs("div",{className:"flex items-center gap-4 mb-4",children:[e.jsx("div",{className:"w-14 h-14 rounded-full bg-gradient-to-br from-[#E8C547] to-[#C9A24A] flex items-center justify-center text-white text-xl font-bold shadow-lg",children:i[0]?.toUpperCase()||"R"}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-white",children:i}),e.jsx("span",{className:"text-xs text-[#C9A24A]",children:"Bronze Member"})]})]}),e.jsxs("div",{className:"mb-5",children:[e.jsxs("div",{className:"flex justify-between text-xs text-white/70 mb-1",children:[e.jsx("span",{children:"Progress Kelengkapan Profil"}),e.jsx("span",{children:"85%"})]}),e.jsx("div",{className:"h-2 bg-white/10 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full w-[85%] bg-gradient-to-r from-[#E8C547] to-[#C9A24A] rounded-full"})})]}),e.jsx(a,{to:"/settings",children:e.jsxs("button",{className:"w-full py-3 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] rounded-xl font-medium text-sm text-white transition-all flex items-center justify-center gap-2 group",children:[e.jsx(U,{className:"w-4 h-4"}),"Edit Profil"]})})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("h4",{className:"text-[#5C4A32] font-bold flex items-center gap-2 text-sm",children:[e.jsx(L,{className:"w-4 h-4 text-[#C9A24A]"}),"Membership"]}),e.jsxs(a,{to:"/membership",className:"text-xs text-[#8B7355] hover:text-[#C9A24A] flex items-center gap-1 transition-colors",children:["Detail",e.jsx(u,{className:"w-3 h-3"})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-[#C9A24A] to-[#B8943F] rounded-2xl p-5 text-white",children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-white/80 mb-1",children:"Level Membership"}),e.jsx("p",{className:"text-lg font-bold text-white tracking-wide",children:"BRONZE MEMBER"})]}),e.jsx("div",{className:"w-10 h-10 rounded-full bg-white/20 flex items-center justify-center",children:e.jsx(M,{className:"w-5 h-5 text-white"})})]}),e.jsxs("div",{className:"space-y-2 mb-4",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsx("span",{className:"text-white/80",children:"Diskon perawatan"}),e.jsx("span",{className:"font-semibold text-white",children:"10%"})]}),e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsx("span",{className:"text-white/80",children:"Prioritas booking"}),e.jsx("span",{className:"font-semibold text-white",children:"Standar"})]})]}),e.jsxs("div",{className:"flex items-center justify-between pt-3 border-t border-white/20",children:[e.jsx("span",{className:"text-xs text-white/70",children:"Berlaku hingga"}),e.jsx("span",{className:"text-xs font-semibold text-white",children:"31 Des 2024"})]})]})]})]}):e.jsxs("aside",{className:"w-[280px] min-w-[280px] bg-white border-l border-gray-100 p-5 hidden lg:flex flex-col gap-6 overflow-y-auto",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#E8C547] to-[#C9A24A] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#C9A24A]/30 mb-3",title:`Profile: ${c}`,children:x}),e.jsx("h3",{className:"text-sm font-bold text-gray-900",children:i}),e.jsx("p",{className:"text-xs text-gray-500",children:c}),e.jsxs(a,{to:"/settings",className:"mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#C9A24A] hover:underline",children:["Edit Profil ",e.jsx(u,{className:"w-3 h-3"})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-[#E8C547]/10 to-[#C9A24A]/10 rounded-2xl p-4",children:[e.jsx("p",{className:"text-xs text-gray-500 mb-1",children:"Status Akun"}),e.jsx("p",{className:"text-sm font-bold text-gray-900",children:h()}),e.jsxs("div",{className:"flex items-center gap-1 mt-2",children:[e.jsx(W,{className:"w-3.5 h-3.5 text-[#C9A24A]"}),e.jsx("span",{className:"text-xs text-[#B8943F] font-medium",children:"Aktif"})]})]}),e.jsxs("div",{className:"rounded-2xl overflow-hidden bg-gradient-to-br from-[#C9A24A] to-[#B8943F] text-white shadow-lg p-6 space-y-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm opacity-80",children:"Membership"}),e.jsx("p",{className:"text-2xl font-bold",children:"PRO"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs opacity-80",children:"Masa aktif"}),e.jsx("p",{className:"text-sm font-semibold",children:"12/2026"})]}),e.jsx(w,{className:"w-10 h-10 opacity-70"})]}),e.jsx("button",{className:"w-full py-2 bg-white/20 rounded-full text-xs font-semibold hover:bg-white/30 transition",children:"Upgrade"})]}),t.length>0&&e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsx("h4",{className:"text-sm font-bold text-gray-900",children:"Aktivitas Terbaru"}),e.jsx(a,{to:"#",className:"text-[10px] font-medium text-[#C9A24A]",children:"Lihat Semua"})]}),e.jsx("div",{className:"space-y-3",children:t.slice(0,4).map((l,s)=>{const o=l.icon||j;return e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-[#E8C547]/20 flex items-center justify-center shrink-0",children:e.jsx(o,{className:"w-4 h-4 text-[#C9A24A]"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-semibold text-gray-900 truncate",children:l.title}),e.jsx("p",{className:"text-[10px] text-gray-500",children:l.subtitle})]}),e.jsxs("div",{className:"flex items-center gap-1 text-[10px] text-gray-400 shrink-0",children:[e.jsx($,{className:"w-3 h-3"}),e.jsx("span",{children:l.time})]})]},s)})})]}),e.jsxs("div",{className:"mt-auto bg-gray-50 rounded-2xl p-4",children:[e.jsx("p",{className:"text-xs font-bold text-gray-900 mb-1",children:"Butuh Bantuan?"}),e.jsx("p",{className:"text-[10px] text-gray-500 mb-2",children:"Hubungi admin klinik kapan saja."}),e.jsx("a",{href:"https://wa.me/6281990114949",target:"_blank",rel:"noopener noreferrer",className:"block w-full py-2 bg-[#3b82f6] text-white text-xs font-semibold rounded-xl text-center hover:bg-[#2563eb] transition-colors",children:"Chat Admin"})]})]})}export{se as A,ae as D,z as L,W as T};
