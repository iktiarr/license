var g="https://license-tau-nine.vercel.app",y="_lg_guard_state",p="__license_guard_lock_overlay__";function D(t){let n=JSON.stringify(t),i=(typeof Buffer<"u"?Buffer.from(n,"utf-8").toString("base64"):btoa(unescape(encodeURIComponent(n)))).split("").map((s,e)=>String.fromCharCode(s.charCodeAt(0)^e%5+1)).join("");return"LGK_"+(typeof Buffer<"u"?Buffer.from(i,"binary").toString("base64"):btoa(i))}function v(t){try{let n=t.startsWith("LGK_")?t.slice(4):t,i=(typeof atob=="function"?atob(n):Buffer.from(n,"base64").toString("binary")).split("").map((s,e)=>String.fromCharCode(s.charCodeAt(0)^e%5+1)).join(""),r=typeof atob=="function"?decodeURIComponent(escape(atob(i))):Buffer.from(i,"base64").toString("utf-8");return JSON.parse(r)}catch{return{apiKey:t,endpoint:g}}}function b(t,n,o){if(typeof document>"u"||document.getElementById(p))return;let i=document.createElement("div");i.id=p,i.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","display: flex !important","flex-direction: column !important","align-items: center !important","justify-content: center !important","padding: 32px 20px !important","box-sizing: border-box !important","overflow-y: auto !important",'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',"color: #09090b !important"].join(";");let r=t==="TAMPERED"?"Domain Mismatch / Modifikasi Tidak Sah":"Lisensi Dinonaktifkan oleh Administrator";i.innerHTML=`
    <div style="max-width:640px;width:100%;margin:auto;text-align:center;animation:lgFade 0.3s ease-out;">
      <div style="width:90px;height:90px;margin:0 auto 20px;background:#fef2f2;border:2px solid #fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <h1 style="margin:0 0 12px;font-size:32px;font-weight:800;letter-spacing:-0.03em;color:#09090b;line-height:1.2;">
        Halaman Ditangguhkan
      </h1>

      <p style="margin:0 auto 28px;font-size:15px;line-height:1.6;color:#52525b;max-width:520px;">
        Akses ke halaman ini sementara ditangguhkan. Silakan hubungi pengelola atau administrator sistem untuk mengaktifkan kembali lisensi Anda.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;text-align:left;font-size:13px;line-height:1.6;margin-bottom:28px;">
        <div style="padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
          <div style="color:#64748b;font-size:12px;font-weight:600;margin-bottom:4px;">Target URL:</div>
          <div style="color:#09090b;font-family:ui-monospace,SFMono-Regular,monospace;font-size:13px;font-weight:600;word-break:break-all;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;">
            ${n}
          </div>
        </div>

        <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Waktu Penangguhan:</span>
          <span style="color:#09090b;font-family:ui-monospace,SFMono-Regular,monospace;font-size:13px;font-weight:700;">
            ${o}
          </span>
        </div>

        <div style="padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Status Lisensi:</span>
          <span style="color:#ef4444;font-size:13px;font-weight:700;">
            ${r}
          </span>
        </div>
      </div>

      <div style="font-size:12px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;"></span>
        <span>Protected by Centralized License Guard</span>
      </div>
    </div>
    <style>
      @keyframes lgFade{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
    </style>
  `,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden";let s=()=>{document.body&&!document.getElementById(p)&&document.body.appendChild(i)};document.body?s():document.addEventListener("DOMContentLoaded",s)}function x(){if(typeof document>"u")return;let t=document.getElementById(p);t&&t.parentNode&&t.parentNode.removeChild(t),document.documentElement.style.overflow="",document.body.style.overflow=""}function h(t){let n=t?new Date(t):new Date,o=i=>i<10?"0"+i:String(i);return`${o(n.getDate())}/${o(n.getMonth()+1)}/${n.getFullYear()} ${o(n.getHours())}:${o(n.getMinutes())}:${o(n.getSeconds())}`}var c=null,E=!1;function k(t={}){if(typeof window>"u"||E)return;E=!0;let n=t.apiKey||"",o=t.endpoint||g;if(t.key){let a=v(t.key);n=a.apiKey||n,o=a.endpoint||o}if(!n){console.warn("[@masdannn/license-guard] No license key provided.");return}let i=o.replace(/\/$/,""),r=(t.interval||300)*1e3,s=window.location.hostname||"localhost",e={valid:!0,status:"ACTIVE",lastCheck:0,suspendedAt:null};try{let a=localStorage.getItem(y);a&&(e=JSON.parse(a))}catch{}let l=a=>{e.valid=!1,e.status=a,e.suspendedAt||(e.suspendedAt=Date.now());try{localStorage.setItem(y,JSON.stringify(e))}catch{}if(t.redirect){window.location.href=t.redirect;return}b(a,window.location.href,h(e.suspendedAt)),c||(c=setInterval(u,3e3))},f=()=>{e.valid=!0,e.status="ACTIVE",e.suspendedAt=null;try{localStorage.setItem(y,JSON.stringify(e))}catch{}c&&(clearInterval(c),c=null),x()};async function u(){try{let a=await fetch(`${i}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:n,domain:s})});if(a.status===200){let d=await a.json();if(d.valid&&d.status==="ACTIVE")e.lastCheck=Date.now(),f();else{let m=d.status==="TAMPERED"?"TAMPERED":"SUSPENDED";l(m)}}else if(a.status===403||a.status===401){let d="SUSPENDED";try{let m=await a.json();m.status&&(d=m.status)}catch{}l(d)}}catch{e.valid||l(e.status==="TAMPERED"?"TAMPERED":"SUSPENDED")}}(!e.valid||e.status==="SUSPENDED"||e.status==="TAMPERED")&&l(e.status==="TAMPERED"?"TAMPERED":"SUSPENDED"),u(),setInterval(u,r),window.addEventListener("focus",()=>{Date.now()-(e.lastCheck||0)>5e3&&u()}),typeof window<"u"&&window.MutationObserver&&new MutationObserver(()=>{!e.valid&&!document.getElementById(p)&&document.body&&b(e.status,window.location.href,h(e.suspendedAt))}).observe(document.documentElement,{childList:!0,subtree:!0})}function A(t){let n=t.apiKey||"",o=t.endpoint||g;if(t.key){let r=v(t.key);n=r.apiKey||n,o=r.endpoint||o}let i=t.domain||"localhost";return async function(r,s,e){try{let f=await(await fetch(`${o.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:n,domain:i})})).json();if((!f.valid||f.status!=="ACTIVE")&&s.status)return s.status(403).send("<h1>403 Forbidden \u2014 License Suspended</h1>");e&&e()}catch{e&&e()}}}export{D as a,v as b,k as c,A as d};
