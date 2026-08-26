var g="https://license-tau-nine.vercel.app",y="_lg_guard_state",p="__license_guard_lock_overlay__";function v(e){try{let n=e.startsWith("LGK_")?e.slice(4):e,i=decodeURIComponent(atob(n).split("").map((o,s)=>String.fromCharCode(o.charCodeAt(0)^s%7+3)).join(""));return JSON.parse(i)}catch{return{apiKey:e,endpoint:g}}}function D(e){let i=JSON.stringify(e).split("").map((o,s)=>String.fromCharCode(o.charCodeAt(0)^s%7+3)).join("");return"LGK_"+btoa(encodeURIComponent(i))}function h(e,n,i){if(typeof document>"u"||document.getElementById(p))return;let o=document.createElement("div");o.id=p,o.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","display: flex !important","flex-direction: column !important","align-items: center !important","justify-content: center !important","padding: 32px 20px !important","box-sizing: border-box !important","overflow-y: auto !important",'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',"color: #09090b !important"].join(";");let s=e==="TAMPERED"?"Domain Mismatch / Modifikasi Tidak Sah":"Lisensi Dinonaktifkan oleh Administrator";o.innerHTML=`
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
            ${i}
          </span>
        </div>

        <div style="padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Status Lisensi:</span>
          <span style="color:#ef4444;font-size:13px;font-weight:700;">
            ${s}
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
  `,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden";let r=()=>{document.body&&!document.getElementById(p)&&document.body.appendChild(o)};document.body?r():document.addEventListener("DOMContentLoaded",r)}function x(){if(typeof document>"u")return;let e=document.getElementById(p);e&&e.parentNode&&e.parentNode.removeChild(e),document.documentElement.style.overflow="",document.body.style.overflow=""}function b(e){let n=e?new Date(e):new Date,i=o=>o<10?"0"+o:String(o);return`${i(n.getDate())}/${i(n.getMonth()+1)}/${n.getFullYear()} ${i(n.getHours())}:${i(n.getMinutes())}:${i(n.getSeconds())}`}var c=null,E=!1;function k(e={}){if(typeof window>"u"||E)return;E=!0;let n=e.apiKey||"",i=e.endpoint||g;if(e.key){let a=v(e.key);n=a.apiKey||n,i=a.endpoint||i}if(!n){console.warn("[@masdannn/license-guard] No license key provided.");return}let o=i.replace(/\/$/,""),s=(e.interval||300)*1e3,r=window.location.hostname||"localhost",t={valid:!0,status:"ACTIVE",lastCheck:0,suspendedAt:null};try{let a=localStorage.getItem(y);a&&(t=JSON.parse(a))}catch{}let l=a=>{t.valid=!1,t.status=a,t.suspendedAt||(t.suspendedAt=Date.now());try{localStorage.setItem(y,JSON.stringify(t))}catch{}if(e.redirect){window.location.href=e.redirect;return}h(a,window.location.href,b(t.suspendedAt)),c||(c=setInterval(f,4e3))},u=()=>{t.valid=!0,t.status="ACTIVE",t.suspendedAt=null;try{localStorage.setItem(y,JSON.stringify(t))}catch{}c&&(clearInterval(c),c=null),x()};async function f(){try{let a=await fetch(`${o}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:n,domain:r})});if(a.status===200){let d=await a.json();if(d.valid&&d.status==="ACTIVE")t.lastCheck=Date.now(),u();else{let m=d.status==="TAMPERED"?"TAMPERED":"SUSPENDED";l(m)}}else if(a.status===403||a.status===401){let d="SUSPENDED";try{let m=await a.json();m.status&&(d=m.status)}catch{}l(d)}}catch{t.valid||l(t.status==="TAMPERED"?"TAMPERED":"SUSPENDED")}}(!t.valid||t.status==="SUSPENDED"||t.status==="TAMPERED")&&l(t.status==="TAMPERED"?"TAMPERED":"SUSPENDED"),f(),setInterval(f,s),window.addEventListener("focus",()=>{Date.now()-(t.lastCheck||0)>8e3&&f()}),typeof window<"u"&&window.MutationObserver&&new MutationObserver(()=>{!t.valid&&!document.getElementById(p)&&document.body&&h(t.status,window.location.href,b(t.suspendedAt))}).observe(document.documentElement,{childList:!0,subtree:!0})}function A(e){let n=e.apiKey||"",i=e.endpoint||g;if(e.key){let s=v(e.key);n=s.apiKey||n,i=s.endpoint||i}let o=e.domain||"localhost";return async function(s,r,t){try{let u=await(await fetch(`${i.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:n,domain:o})})).json();if((!u.valid||u.status!=="ACTIVE")&&r.status)return r.status(403).send("<h1>403 Forbidden \u2014 License Suspended</h1>");t&&t()}catch{t&&t()}}}export{v as a,D as b,k as c,A as d};
