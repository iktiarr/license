"use strict";var m=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var A=Object.prototype.hasOwnProperty;var P=(t,e)=>{for(var i in e)m(t,i,{get:e[i],enumerable:!0})},C=(t,e,i,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of T(e))!A.call(t,a)&&a!==i&&m(t,a,{get:()=>e[a],enumerable:!(o=D(e,a))||o.enumerable});return t};var M=t=>C(m({},"__esModule",{value:!0}),t);var $={};P($,{LicenseGuard:()=>N,decodeLicensePayload:()=>w,encodeLicensePayload:()=>L,generateEmergencyBypassToken:()=>x,guardMiddleware:()=>_,initGuard:()=>S,validateEmergencyBypassToken:()=>R});module.exports=M($);var b="https://license-tau-nine.vercel.app",g="_lg_guard_state_v2",p="__license_guard_lock_overlay__";function L(t){let e=JSON.stringify(t),o=(typeof Buffer<"u"?Buffer.from(e,"utf-8").toString("base64"):btoa(unescape(encodeURIComponent(e)))).split("").map((r,n)=>String.fromCharCode(r.charCodeAt(0)^n%5+1)).join("");return"LGK_"+(typeof Buffer<"u"?Buffer.from(o,"binary").toString("base64"):btoa(o))}function w(t){try{let e=t.startsWith("LGK_")?t.slice(4):t,o=(typeof atob=="function"?atob(e):Buffer.from(e,"base64").toString("binary")).split("").map((r,n)=>String.fromCharCode(r.charCodeAt(0)^n%5+1)).join(""),a=typeof atob=="function"?decodeURIComponent(escape(atob(o))):Buffer.from(o,"base64").toString("utf-8");return JSON.parse(a)}catch{return{apiKey:t,endpoint:b}}}function x(t,e){let i="EBP_SALT_masdannn_guard_98f4",o=0,a=`${t}:${e}:${i}`;for(let d=0;d<a.length;d++)o=(o<<5)-o+a.charCodeAt(d),o|=0;let r=Math.abs(o).toString(16).toUpperCase().padStart(8,"0"),n=Math.abs(o^1515870810).toString(16).toUpperCase().padStart(8,"0");return`EBP-${r}${n}`}function R(t,e,i){if(!t||!t.startsWith("EBP-"))return!1;let o=x(e,i);return t.toUpperCase()===o.toUpperCase()}function y(t,e,i,o){if(typeof document>"u")return;let a=document.getElementById(p);if(a)return;if(a=document.createElement("div"),a.id=p,o&&o.trim()){a.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","margin: 0 !important","padding: 0 !important","overflow: auto !important","pointer-events: auto !important"].join(";"),a.innerHTML=o,document.body.appendChild(a);return}a.style.cssText=["position: fixed !important","top: 0 !important","left: 0 !important","width: 100vw !important","height: 100vh !important","z-index: 2147483647 !important","background: #ffffff !important","display: flex !important","flex-direction: column !important","align-items: center !important","justify-content: center !important","padding: 32px 20px !important","box-sizing: border-box !important","overflow-y: auto !important",'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',"color: #09090b !important","pointer-events: auto !important"].join(";");let r=t==="TAMPERED"?"Akses Dibatasi: Modifikasi Tidak Sah":"Akses Halaman Ditangguhkan",n=t==="TAMPERED"?"Domain Mismatch / File Lisensi Dimodifikasi":"Lisensi Dinonaktifkan oleh Administrator";a.innerHTML=`
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
            ${e}
          </div>
        </div>

        <div style="padding:9px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Waktu Penangguhan:</span>
          <span style="color:#09090b;font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;font-weight:700;">
            ${i}
          </span>
        </div>

        <div style="padding-top:9px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;">Status Lisensi:</span>
          <span style="color:#ef4444;font-size:12px;font-weight:700;">
            ${n}
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
  `,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden";let d=()=>{document.body&&!document.getElementById(p)&&document.body.appendChild(a)};document.body?d():document.addEventListener("DOMContentLoaded",d)}function v(){if(typeof document>"u")return;let t=document.getElementById(p);if(t&&t.parentNode&&t.parentNode.removeChild(t),document.documentElement.style.overflow="",document.body.style.overflow="",typeof window<"u"&&typeof window.dispatchEvent=="function")try{window.dispatchEvent(new CustomEvent("license-guard:unlocked",{detail:{unlocked:!0}}))}catch{}}function h(t){let e=t?new Date(t):new Date,i=o=>o<10?"0"+o:String(o);return`${i(e.getDate())}/${i(e.getMonth()+1)}/${e.getFullYear()} ${i(e.getHours())}:${i(e.getMinutes())}:${i(e.getSeconds())}`}var c=null,E=!1;function S(t={}){if(typeof window>"u"||E)return;E=!0;try{if(localStorage.getItem("_lg_emergency_bypass")==="true"){v();return}}catch{}let e=t.apiKey||"",i=t.endpoint||b;if(t.key){let s=w(t.key);e=s.apiKey||e,i=s.endpoint||i}if(!e){console.warn("[@masdannn/license-guard] License configuration key is missing or corrupted."),y("TAMPERED",window.location.href,h(Date.now())),I(i,"License key missing or stripped from source code");return}let o=i.replace(/\/$/,""),a=(t.interval||300)*1e3,r=window.location.hostname||"localhost",n={valid:!0,status:"ACTIVE",lastCheck:0,suspendedAt:null};try{let s=localStorage.getItem(g);s&&(n=JSON.parse(s))}catch{}let d=(s,l)=>{n.valid=!1,n.status=s,n.suspendedAt||(n.suspendedAt=Date.now());try{localStorage.setItem(g,JSON.stringify(n))}catch{}if(t.redirect){window.location.href=t.redirect;return}y(s,window.location.href,h(n.suspendedAt),l),c||(c=setInterval(u,3e3))},f=()=>{n.valid=!0,n.status="ACTIVE",n.suspendedAt=null;try{localStorage.setItem(g,JSON.stringify(n))}catch{}c&&(clearInterval(c),c=null),v()};async function u(){try{let s=await fetch(`${o}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:e,domain:r})});if(s.status===200){let l=await s.json();if(n.lastCheck=Date.now(),l.valid&&l.status==="ACTIVE")f();else{let k=l.status==="TAMPERED"?"TAMPERED":"SUSPENDED";d(k,l.customHtml)}}else if(s.status===403||s.status===401){let l=await s.json();n.lastCheck=Date.now(),d(l.status||"SUSPENDED",l.customHtml)}}catch{n.valid||d(n.status==="TAMPERED"?"TAMPERED":"SUSPENDED")}}(!n.valid||n.status==="SUSPENDED"||n.status==="TAMPERED")&&d(n.status==="TAMPERED"?"TAMPERED":"SUSPENDED"),u(),setInterval(u,a),window.addEventListener("focus",()=>{Date.now()-(n.lastCheck||0)>5e3&&u()}),typeof window<"u"&&window.MutationObserver&&new MutationObserver(()=>{!n.valid&&!document.getElementById(p)&&document.body&&y(n.status,window.location.href,h(n.suspendedAt))}).observe(document.documentElement,{childList:!0,subtree:!0})}async function I(t,e){try{let i=typeof window<"u"?window.location.hostname:"unknown";await fetch(`${t.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:"TAMPER_REPORT",domain:i,tamperReason:e})})}catch{}}function _(t){let e=t.apiKey||"",i=t.endpoint||b;if(t.key){let a=w(t.key);e=a.apiKey||e,i=a.endpoint||i}let o=t.domain||"localhost";return async function(a,r,n){try{let f=await(await fetch(`${i.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:e,domain:o})})).json();if((!f.valid||f.status!=="ACTIVE")&&r.status)return r.status(403).send("<h1>403 Forbidden \u2014 License Suspended</h1>");n&&n()}catch{n&&n()}}}function N({key:t}){return typeof window<"u"&&S({key:t}),null}0&&(module.exports={LicenseGuard,decodeLicensePayload,encodeLicensePayload,generateEmergencyBypassToken,guardMiddleware,initGuard,validateEmergencyBypassToken});
