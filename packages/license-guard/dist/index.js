"use strict";var y=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var D=Object.prototype.hasOwnProperty;var k=(e,t)=>{for(var i in t)y(e,i,{get:t[i],enumerable:!0})},A=(e,t,i,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of w(t))!D.call(e,a)&&a!==i&&y(e,a,{get:()=>t[a],enumerable:!(o=S(t,a))||o.enumerable});return e};var T=e=>A(y({},"__esModule",{value:!0}),e);var L={};k(L,{decodeLicensePayload:()=>h,encodeLicensePayload:()=>P,guardMiddleware:()=>I,initGuard:()=>M});module.exports=T(L);var b="https://license-tau-nine.vercel.app",g="_lg_guard_state",p="__license_guard_lock_overlay__";function P(e){let t=JSON.stringify(e),o=(typeof Buffer<"u"?Buffer.from(t,"utf-8").toString("base64"):btoa(unescape(encodeURIComponent(t)))).split("").map((r,n)=>String.fromCharCode(r.charCodeAt(0)^n%5+1)).join("");return"LGK_"+(typeof Buffer<"u"?Buffer.from(o,"binary").toString("base64"):btoa(o))}function h(e){try{let t=e.startsWith("LGK_")?e.slice(4):e,o=(typeof atob=="function"?atob(t):Buffer.from(t,"base64").toString("binary")).split("").map((r,n)=>String.fromCharCode(r.charCodeAt(0)^n%5+1)).join(""),a=typeof atob=="function"?decodeURIComponent(escape(atob(o))):Buffer.from(o,"base64").toString("utf-8");return JSON.parse(a)}catch{return{apiKey:e,endpoint:b}}}function E(e,t,i){if(typeof document>"u"||document.getElementById(p))return;let o=document.createElement("div");o.id=p,o.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","display: flex !important","flex-direction: column !important","align-items: center !important","justify-content: center !important","padding: 32px 20px !important","box-sizing: border-box !important","overflow-y: auto !important",'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',"color: #09090b !important"].join(";");let a=e==="TAMPERED"?"Domain Mismatch / Modifikasi Tidak Sah":"Lisensi Dinonaktifkan oleh Administrator";o.innerHTML=`
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
            ${t}
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
            ${a}
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
  `,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden";let r=()=>{document.body&&!document.getElementById(p)&&document.body.appendChild(o)};document.body?r():document.addEventListener("DOMContentLoaded",r)}function C(){if(typeof document>"u")return;let e=document.getElementById(p);e&&e.parentNode&&e.parentNode.removeChild(e),document.documentElement.style.overflow="",document.body.style.overflow=""}function v(e){let t=e?new Date(e):new Date,i=o=>o<10?"0"+o:String(o);return`${i(t.getDate())}/${i(t.getMonth()+1)}/${t.getFullYear()} ${i(t.getHours())}:${i(t.getMinutes())}:${i(t.getSeconds())}`}var c=null,x=!1;function M(e={}){if(typeof window>"u"||x)return;x=!0;let t=e.apiKey||"",i=e.endpoint||b;if(e.key){let s=h(e.key);t=s.apiKey||t,i=s.endpoint||i}if(!t){console.warn("[@masdannn/license-guard] No license key provided.");return}let o=i.replace(/\/$/,""),a=(e.interval||300)*1e3,r=window.location.hostname||"localhost",n={valid:!0,status:"ACTIVE",lastCheck:0,suspendedAt:null};try{let s=localStorage.getItem(g);s&&(n=JSON.parse(s))}catch{}let l=s=>{n.valid=!1,n.status=s,n.suspendedAt||(n.suspendedAt=Date.now());try{localStorage.setItem(g,JSON.stringify(n))}catch{}if(e.redirect){window.location.href=e.redirect;return}E(s,window.location.href,v(n.suspendedAt)),c||(c=setInterval(u,3e3))},f=()=>{n.valid=!0,n.status="ACTIVE",n.suspendedAt=null;try{localStorage.setItem(g,JSON.stringify(n))}catch{}c&&(clearInterval(c),c=null),C()};async function u(){try{let s=await fetch(`${o}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:t,domain:r})});if(s.status===200){let d=await s.json();if(d.valid&&d.status==="ACTIVE")n.lastCheck=Date.now(),f();else{let m=d.status==="TAMPERED"?"TAMPERED":"SUSPENDED";l(m)}}else if(s.status===403||s.status===401){let d="SUSPENDED";try{let m=await s.json();m.status&&(d=m.status)}catch{}l(d)}}catch{n.valid||l(n.status==="TAMPERED"?"TAMPERED":"SUSPENDED")}}(!n.valid||n.status==="SUSPENDED"||n.status==="TAMPERED")&&l(n.status==="TAMPERED"?"TAMPERED":"SUSPENDED"),u(),setInterval(u,a),window.addEventListener("focus",()=>{Date.now()-(n.lastCheck||0)>5e3&&u()}),typeof window<"u"&&window.MutationObserver&&new MutationObserver(()=>{!n.valid&&!document.getElementById(p)&&document.body&&E(n.status,window.location.href,v(n.suspendedAt))}).observe(document.documentElement,{childList:!0,subtree:!0})}function I(e){let t=e.apiKey||"",i=e.endpoint||b;if(e.key){let a=h(e.key);t=a.apiKey||t,i=a.endpoint||i}let o=e.domain||"localhost";return async function(a,r,n){try{let f=await(await fetch(`${i.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:t,domain:o})})).json();if((!f.valid||f.status!=="ACTIVE")&&r.status)return r.status(403).send("<h1>403 Forbidden \u2014 License Suspended</h1>");n&&n()}catch{n&&n()}}}0&&(module.exports={decodeLicensePayload,encodeLicensePayload,guardMiddleware,initGuard});
