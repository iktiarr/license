var h="https://license-tau-nine.vercel.app",m="_lg_guard_state_v2",p="__license_guard_lock_overlay__";function A(t){let n=JSON.stringify(t),i=(typeof Buffer<"u"?Buffer.from(n,"utf-8").toString("base64"):btoa(unescape(encodeURIComponent(n)))).split("").map((r,e)=>String.fromCharCode(r.charCodeAt(0)^e%5+1)).join("");return"LGK_"+(typeof Buffer<"u"?Buffer.from(i,"binary").toString("base64"):btoa(i))}function v(t){try{let n=t.startsWith("LGK_")?t.slice(4):t,i=(typeof atob=="function"?atob(n):Buffer.from(n,"base64").toString("binary")).split("").map((r,e)=>String.fromCharCode(r.charCodeAt(0)^e%5+1)).join(""),a=typeof atob=="function"?decodeURIComponent(escape(atob(i))):Buffer.from(i,"base64").toString("utf-8");return JSON.parse(a)}catch{return{apiKey:t,endpoint:h}}}function x(t,n){let o="EBP_SALT_masdannn_guard_98f4",i=0,a=`${t}:${n}:${o}`;for(let d=0;d<a.length;d++)i=(i<<5)-i+a.charCodeAt(d),i|=0;let r=Math.abs(i).toString(16).toUpperCase().padStart(8,"0"),e=Math.abs(i^1515870810).toString(16).toUpperCase().padStart(8,"0");return`EBP-${r}${e}`}function P(t,n,o){if(!t||!t.startsWith("EBP-"))return!1;let i=x(n,o);return t.toUpperCase()===i.toUpperCase()}function g(t,n,o,i){if(typeof document>"u")return;let a=document.getElementById(p);if(a)return;if(a=document.createElement("div"),a.id=p,i&&i.trim()){a.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","margin: 0 !important","padding: 0 !important","overflow: auto !important","pointer-events: auto !important"].join(";"),a.innerHTML=i,document.body.appendChild(a);return}a.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","display: flex !important","flex-direction: column !important","align-items: center !important","justify-content: center !important","padding: 32px 20px !important","box-sizing: border-box !important","overflow-y: auto !important",'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',"color: #09090b !important","pointer-events: auto !important"].join(";");let r=t==="TAMPERED"?"Akses Dibatasi: Modifikasi Tidak Sah":"Akses Halaman Ditangguhkan",e=t==="TAMPERED"?"Domain Mismatch / File Lisensi Dimodifikasi":"Lisensi Dinonaktifkan oleh Administrator";a.innerHTML=`
    <div style="max-width:620px;width:100%;margin:auto;text-align:center;animation:lgFade 0.3s ease-out;">
      <div style="width:84px;height:84px;margin:0 auto 20px;background:#fef2f2;border:2px solid #fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;letter-spacing:-0.03em;color:#09090b;line-height:1.25;">
        ${r}
      </h1>

      <p style="margin:0 auto 24px;font-size:14px;line-height:1.6;color:#52525b;max-width:480px;">
        Akses ke website ini sementara ditangguhkan oleh pengelola lisensi. Website akan aktif kembali secara otomatis begitu lisensi dipulihkan di dashboard admin.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;text-align:left;font-size:13px;line-height:1.6;margin-bottom:24px;">
        <div style="padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
          <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Domain Terdeteksi:</div>
          <div style="color:#09090b;font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;font-weight:600;word-break:break-all;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:7px 10px;">
            ${n}
          </div>
        </div>

        <div style="padding:9px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Waktu Penangguhan:</span>
          <span style="color:#09090b;font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;font-weight:700;">
            ${o}
          </span>
        </div>

        <div style="padding-top:9px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Status Lisensi:</span>
          <span style="color:#ef4444;font-size:12px;font-weight:700;">
            ${e}
          </span>
        </div>
      </div>

      <div style="font-size:11px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;animation:lgPulse 1.5s infinite;"></span>
        <span>Centralized License Guard v2.0 &bull; Auto-Sync Active</span>
      </div>
    </div>
    <style>
      @keyframes lgFade{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
      @keyframes lgPulse{0%,100%{opacity:1}50%{opacity:0.3}}
    </style>
  `,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden";let d=()=>{document.body&&!document.getElementById(p)&&document.body.appendChild(a)};document.body?d():document.addEventListener("DOMContentLoaded",d)}function b(){if(typeof document>"u")return;let t=document.getElementById(p);if(t&&t.parentNode&&t.parentNode.removeChild(t),document.documentElement.style.overflow="",document.body.style.overflow="",typeof window<"u"&&typeof window.dispatchEvent=="function")try{window.dispatchEvent(new CustomEvent("license-guard:unlocked",{detail:{unlocked:!0}}))}catch{}}function y(t){let n=t?new Date(t):new Date,o=i=>i<10?"0"+i:String(i);return`${o(n.getDate())}/${o(n.getMonth()+1)}/${n.getFullYear()} ${o(n.getHours())}:${o(n.getMinutes())}:${o(n.getSeconds())}`}var c=null,w=!1;function S(t={}){if(typeof window>"u"||w)return;w=!0;try{if(localStorage.getItem("_lg_emergency_bypass")==="true"){b();return}}catch{}let n=t.apiKey||"",o=t.endpoint||h;if(t.key){let s=v(t.key);n=s.apiKey||n,o=s.endpoint||o}if(!n){console.warn("[@masdannn/license-guard] License configuration key is missing or corrupted."),g("TAMPERED",window.location.href,y(Date.now())),k(o,"License key missing or stripped from source code");return}let i=o.replace(/\/$/,""),a=(t.interval||300)*1e3,r=window.location.hostname||"localhost",e={valid:!0,status:"ACTIVE",lastCheck:0,suspendedAt:null};try{let s=localStorage.getItem(m);s&&(e=JSON.parse(s))}catch{}let d=(s,l)=>{e.valid=!1,e.status=s,e.suspendedAt||(e.suspendedAt=Date.now());try{localStorage.setItem(m,JSON.stringify(e))}catch{}if(t.redirect){window.location.href=t.redirect;return}g(s,window.location.href,y(e.suspendedAt),l),c||(c=setInterval(u,3e3))},f=()=>{e.valid=!0,e.status="ACTIVE",e.suspendedAt=null;try{localStorage.setItem(m,JSON.stringify(e))}catch{}c&&(clearInterval(c),c=null),b()};async function u(){try{let s=await fetch(`${i}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:n,domain:r})});if(s.status===200){let l=await s.json();if(e.lastCheck=Date.now(),l.valid&&l.status==="ACTIVE")f();else{let E=l.status==="TAMPERED"?"TAMPERED":"SUSPENDED";d(E,l.customHtml)}}else if(s.status===403||s.status===401){let l=await s.json();e.lastCheck=Date.now(),d(l.status||"SUSPENDED",l.customHtml)}}catch{e.valid||d(e.status==="TAMPERED"?"TAMPERED":"SUSPENDED")}}(!e.valid||e.status==="SUSPENDED"||e.status==="TAMPERED")&&d(e.status==="TAMPERED"?"TAMPERED":"SUSPENDED"),u(),setInterval(u,a),window.addEventListener("focus",()=>{Date.now()-(e.lastCheck||0)>5e3&&u()}),typeof window<"u"&&window.MutationObserver&&new MutationObserver(()=>{!e.valid&&!document.getElementById(p)&&document.body&&g(e.status,window.location.href,y(e.suspendedAt))}).observe(document.documentElement,{childList:!0,subtree:!0})}async function k(t,n){try{let o=typeof window<"u"?window.location.hostname:"unknown";await fetch(`${t.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:"TAMPER_REPORT",domain:o,tamperReason:n})})}catch{}}function C(t){let n=t.apiKey||"",o=t.endpoint||h;if(t.key){let a=v(t.key);n=a.apiKey||n,o=a.endpoint||o}let i=t.domain||"localhost";return async function(a,r,e){try{let f=await(await fetch(`${o.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:n,domain:i})})).json();if((!f.valid||f.status!=="ACTIVE")&&r.status)return r.status(403).send("<h1>403 Forbidden \u2014 License Suspended</h1>");e&&e()}catch{e&&e()}}}function M({key:t}){return typeof window<"u"&&S({key:t}),null}export{A as a,v as b,x as c,P as d,S as e,C as f,M as g};
