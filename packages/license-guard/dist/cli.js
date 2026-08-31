#!/usr/bin/env node
"use strict";var K=Object.create;var $=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var M=Object.getOwnPropertyNames;var B=Object.getPrototypeOf,U=Object.prototype.hasOwnProperty;var J=(n,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of M(t))!U.call(n,r)&&r!==o&&$(n,r,{get:()=>t[r],enumerable:!(a=G(t,r))||a.enumerable});return n};var E=(n,t,o)=>(o=n!=null?K(B(n)):{},J(t||!n||!n.__esModule?$(o,"default",{value:n,enumerable:!0}):o,n));var s=E(require("fs")),i=E(require("path")),I=E(require("readline")),e=E(require("picocolors")),P=E(require("crypto")),N=require("child_process");var V="https://license-tau-nine.vercel.app";function D(n){let t=JSON.stringify(n),a=(typeof Buffer<"u"?Buffer.from(t,"utf-8").toString("base64"):btoa(unescape(encodeURIComponent(t)))).split("").map((l,c)=>String.fromCharCode(l.charCodeAt(0)^c%5+1)).join("");return"LGK_"+(typeof Buffer<"u"?Buffer.from(a,"binary").toString("base64"):btoa(a))}function v(n){try{let t=n.startsWith("LGK_")?n.slice(4):n,a=(typeof atob=="function"?atob(t):Buffer.from(t,"base64").toString("binary")).split("").map((l,c)=>String.fromCharCode(l.charCodeAt(0)^c%5+1)).join(""),r=typeof atob=="function"?decodeURIComponent(escape(atob(a))):Buffer.from(a,"base64").toString("utf-8");return JSON.parse(r)}catch{return{apiKey:n,endpoint:V}}}function z(n,t){let o="EBP_SALT_masdannn_guard_98f4",a=0,r=`${n}:${t}:${o}`;for(let u=0;u<r.length;u++)a=(a<<5)-a+r.charCodeAt(u),a|=0;let l=Math.abs(a).toString(16).toUpperCase().padStart(8,"0"),c=Math.abs(a^1515870810).toString(16).toUpperCase().padStart(8,"0");return`EBP-${l}${c}`}function T(n,t,o){if(!n||!n.startsWith("EBP-"))return!1;let a=z(t,o);return n.toUpperCase()===a.toUpperCase()}var x="https://license-tau-nine.vercel.app",j="3.0.0",A="^3.0.0";function L(n){if(s.default.existsSync(i.default.join(n,"pubspec.yaml")))return{framework:"flutter",label:"Flutter / Dart App"};let t=i.default.join(n,"package.json");if(s.default.existsSync(t))try{let o=JSON.parse(s.default.readFileSync(t,"utf-8")),a={...o.dependencies,...o.devDependencies};if(a.next)return{framework:"nextjs",label:"Next.js (App/Pages Router)"};if(a.nuxt)return{framework:"nuxt",label:"Nuxt.js (Vue 3 SSR)"};if(a.astro)return{framework:"astro",label:"Astro Web Framework"};if(a["@sveltejs/kit"]||a.svelte)return{framework:"vite-svelte",label:"Svelte / SvelteKit"};if(a.vue||a["@vitejs/plugin-vue"])return{framework:"vite-vue",label:"Vite + Vue.js"};if(a.react&&(a.vite||a["@vitejs/plugin-react"]))return{framework:"vite-react",label:"Vite + React.js"};if(a.react)return{framework:"vite-react",label:"React.js Web App"};if(a.express||a.fastify||a.koa)return{framework:"express",label:"Node.js / Express Backend"}}catch{}return s.default.existsSync(i.default.join(n,"composer.json"))||s.default.existsSync(i.default.join(n,"index.php"))?{framework:"php",label:"PHP Native / Laravel"}:s.default.existsSync(i.default.join(n,"index.html"))?{framework:"html",label:"HTML / Vanilla JavaScript"}:{framework:"unknown",label:"Universal JavaScript"}}function W(n){return s.default.existsSync(i.default.join(n,"pnpm-lock.yaml"))?"pnpm":s.default.existsSync(i.default.join(n,"yarn.lock"))?"yarn":s.default.existsSync(i.default.join(n,"bun.lockb"))||s.default.existsSync(i.default.join(n,"bun.lock"))?"bun":"npm"}function w(n){let t=i.default.join(n,"package.json");if(!s.default.existsSync(t))return!1;try{let o=JSON.parse(s.default.readFileSync(t,"utf-8"));return o.dependencies||(o.dependencies={}),o.dependencies["@masdannn/license-guard"]=A,s.default.writeFileSync(t,JSON.stringify(o,null,2),"utf-8"),!0}catch{return!1}}function Y(){return"LG-"+P.default.randomBytes(24).toString("hex")}function C(){let n=I.default.createInterface({input:process.stdin,output:process.stdout});return{ask:a=>new Promise(r=>{n.question(a,l=>{r(l.trim())})}),close:()=>{try{n.close(),process.stdin&&typeof process.stdin.pause=="function"&&process.stdin.pause(),process.stdin&&typeof process.stdin.unref=="function"&&process.stdin.unref()}catch{}}}}function k(){console.log(e.default.bold(e.default.cyan(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`))),console.log(e.default.bold(e.default.cyan("\u2551"))+"  "+e.default.bold(e.default.white("\u{1F6E1}\uFE0F  CENTRALIZED LICENSE GUARD CLI"))+" "+e.default.yellow(`(v${j})`)+"            "+e.default.bold(e.default.cyan("\u2551"))),console.log(e.default.bold(e.default.cyan("\u2551"))+"  "+e.default.dim("Proteksi Lisensi, Anti-Tamper & Remote Killswitch")+"      "+e.default.bold(e.default.cyan("\u2551"))),console.log(e.default.bold(e.default.cyan(`\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`)))}function q(n,t,o,a,r,l){let c=[],u={version:j,project:a,domain:r,endpoint:l,key:o,updatedAt:new Date().toISOString()};if(s.default.writeFileSync(i.default.join(n,".licenseguard.json"),JSON.stringify(u,null,2),"utf-8"),c.push(`  ${e.default.green("\u2713")} Konfigurasi Backup: ${e.default.bold(".licenseguard.json")}`),t==="nextjs"){w(n),c.push(`  ${e.default.green("\u2713")} Dependency: ${e.default.bold("@masdannn/license-guard "+A)}`);let d=i.default.join(n,"lib");s.default.existsSync(d)||s.default.mkdirSync(d,{recursive:!0});let b=`'use client';

// \u26A1 Auto-generated by @masdannn/license-guard (v2) \u2014 JANGAN DIHAPUS
import { initGuard } from '@masdannn/license-guard';
import { useEffect } from 'react';

const LICENSE_KEY = '${o}';

if (typeof window !== 'undefined') {
  initGuard({ key: LICENSE_KEY });
}

export function LicenseGuard() {
  useEffect(() => {
    initGuard({ key: LICENSE_KEY });
  }, []);
  return null;
}
`;s.default.writeFileSync(i.default.join(d,"license-guard.ts"),b,"utf-8"),c.push(`  ${e.default.green("\u2713")} Dibuat: ${e.default.bold("lib/license-guard.ts")}`);let m=[{file:i.default.join(n,"app","layout.tsx"),isAppRouter:!0},{file:i.default.join(n,"app","layout.jsx"),isAppRouter:!0},{file:i.default.join(n,"pages","_app.tsx"),isAppRouter:!1},{file:i.default.join(n,"pages","_app.jsx"),isAppRouter:!1}],y=!1;for(let{file:p,isAppRouter:g}of m)if(s.default.existsSync(p)){let f=s.default.readFileSync(p,"utf-8");g?f.includes("LicenseGuard")||(f=`import { LicenseGuard } from '@/lib/license-guard';
`+f,f.includes("<body")&&(f=f.replace(/(<body[^>]*>)/i,`$1
        <LicenseGuard />`)),s.default.writeFileSync(p,f,"utf-8"),c.push(`  ${e.default.green("\u2713")} Komponen diinjeksi ke: ${e.default.bold(i.default.relative(n,p).replace(/\\/g,"/"))}`)):f.includes("license-guard")||(s.default.writeFileSync(p,`import '@/lib/license-guard';
`+f,"utf-8"),c.push(`  ${e.default.green("\u2713")} Import diinjeksi ke: ${e.default.bold(i.default.relative(n,p).replace(/\\/g,"/"))}`)),y=!0;break}y||c.push(`  ${e.default.yellow("!")} Tambahkan <LicenseGuard /> di root layout: ${e.default.cyan("import { LicenseGuard } from '@/lib/license-guard';")}`)}else if(t==="vite-react"||t==="vite-vue"||t==="vite-svelte"){w(n),c.push(`  ${e.default.green("\u2713")} Dependency: ${e.default.bold("@masdannn/license-guard "+A)}`);let d=i.default.join(n,"src","lib");s.default.existsSync(d)||s.default.mkdirSync(d,{recursive:!0});let b=`// \u26A1 Auto-generated by @masdannn/license-guard (v2) \u2014 JANGAN DIHAPUS
import { initGuard } from '@masdannn/license-guard';

const LICENSE_KEY = '${o}';

if (typeof window !== 'undefined') {
  initGuard({ key: LICENSE_KEY });
}

export { initGuard };
`;s.default.writeFileSync(i.default.join(d,"license-guard.ts"),b,"utf-8"),c.push(`  ${e.default.green("\u2713")} Dibuat: ${e.default.bold("src/lib/license-guard.ts")}`);let m=[i.default.join(n,"src","main.tsx"),i.default.join(n,"src","main.jsx"),i.default.join(n,"src","main.ts"),i.default.join(n,"src","main.js"),i.default.join(n,"src","index.tsx"),i.default.join(n,"src","App.tsx"),i.default.join(n,"src","App.vue")],y=!1;for(let p of m)if(s.default.existsSync(p)){let g=s.default.readFileSync(p,"utf-8");g.includes("license-guard")||(g=`import './lib/license-guard';
`+g,s.default.writeFileSync(p,g,"utf-8"),c.push(`  ${e.default.green("\u2713")} Import diinjeksi ke: ${e.default.bold(i.default.relative(n,p).replace(/\\/g,"/"))}`)),y=!0;break}y||c.push(`  ${e.default.yellow("!")} Tambahkan di main entry file: ${e.default.cyan("import './lib/license-guard';")}`)}else if(t==="nuxt"){w(n);let d=i.default.join(n,"plugins");s.default.existsSync(d)||s.default.mkdirSync(d,{recursive:!0});let b=`import { initGuard } from '@masdannn/license-guard';

export default defineNuxtPlugin(() => {
  if (process.client) {
    initGuard({ key: '${o}' });
  }
});
`;s.default.writeFileSync(i.default.join(d,"license-guard.client.ts"),b,"utf-8"),c.push(`  ${e.default.green("\u2713")} Dibuat Nuxt Plugin: ${e.default.bold("plugins/license-guard.client.ts")}`)}else if(t==="flutter"){let d=i.default.join(n,"lib");s.default.existsSync(d)||s.default.mkdirSync(d,{recursive:!0});let b=`// \u26A1 Auto-generated by @masdannn/license-guard (v2) for Flutter \u2014 JANGAN DIHAPUS
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LicenseGuard {
  static const String licenseKey = '${o}';
  static const String endpoint = '${l}';
  static Timer? _timer;

  static void init(BuildContext context) {
    _performCheck(context);
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => _performCheck(context));
  }

  static Future<void> _performCheck(BuildContext context) async {
    try {
      final response = await http.post(
        Uri.parse('$endpoint/api/license/heartbeat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'apiKey': '${v(o).apiKey}',
          'domain': '${r}',
        }),
      );

      if (response.statusCode == 403 || response.statusCode == 401) {
        _showLockScreen(context);
      }
    } catch (_) {}
  }

  static void _showLockScreen(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => WillPopScope(
        onWillPop: () async => false,
        child: AlertDialog(
          title: const Text('\u{1F6E1}\uFE0F Lisensi Ditangguhkan', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
          content: const Text('Akses aplikasi ini dinonaktifkan oleh administrator sistem.'),
        ),
      ),
    );
  }
}
`;s.default.writeFileSync(i.default.join(d,"license_guard.dart"),b,"utf-8"),c.push(`  ${e.default.green("\u2713")} Dibuat Dart Guard: ${e.default.bold("lib/license_guard.dart")}`),c.push(`  ${e.default.cyan("\u2139")} Panggil di main.dart: ${e.default.bold("LicenseGuard.init(context);")}`)}else{let d=`/**
 * \u26A1 Auto-generated by @masdannn/license-guard (v2) \u2014 JANGAN DIHAPUS
 */
(function() {
  var key = "${o}";
  var endpoint = "${l}";
  var domain = "${r}";

  function check() {
    fetch(endpoint + "/api/license/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "${v(o).apiKey}",
        domain: window.location.hostname || domain
      })
    }).then(function(r) {
      if (r.status === 403 || r.status === 401) lock();
    }).catch(function(){});
  }

  function lock() {
    if (document.getElementById("__license_guard_lock_overlay__")) return;
    var div = document.createElement("div");
    div.id = "__license_guard_lock_overlay__";
    div.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;background:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;";
    div.innerHTML = "<div><h1 style='color:#ef4444;'>\u{1F6E1}\uFE0F Akses Ditangguhkan</h1><p style='color:#555;'>Akses ke website ini dinonaktifkan oleh administrator.</p></div>";
    document.body.appendChild(div);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", check);
  } else {
    check();
  }
  setInterval(check, 300000);
})();
`;s.default.writeFileSync(i.default.join(n,"license-guard.js"),d,"utf-8"),c.push(`  ${e.default.green("\u2713")} Dibuat: ${e.default.bold("license-guard.js")}`);let b=i.default.join(n,"index.html");if(s.default.existsSync(b)){let m=s.default.readFileSync(b,"utf-8");m.includes("license-guard.js")||(m=m.replace("</head>",`  <script src="license-guard.js"></script>
</head>`),s.default.writeFileSync(b,m,"utf-8"),c.push(`  ${e.default.green("\u2713")} Tag script diinjeksi ke: ${e.default.bold("index.html")}`))}}return c}async function Z(n){k(),console.log(e.default.bold(e.default.white(`\u{1F4E6} INFORMASI VERSI LICENSE GUARD
`))),console.log(`  Versi CLI           : ${e.default.bold(e.default.green("v"+j))}`);let t=i.default.join(n,".licenseguard.json");if(s.default.existsSync(t))try{let o=JSON.parse(s.default.readFileSync(t,"utf-8"));console.log(`  Versi Konfigurasi   : ${e.default.bold(e.default.cyan("v"+(o.version||j)))}`),console.log(`  Project Terdaftar   : ${e.default.bold(o.project||"\u2014")}`),console.log(`  Domain Terproteksi  : ${e.default.bold(o.domain||"\u2014")}`)}catch{}console.log("")}async function Q(n){k(),console.log(e.default.bold(e.default.yellow(`\u{1F504} MEMPERBARUI PACKAGE LICENSE GUARD KE VERSI TERBARU...
`)));let t=W(n);console.log(e.default.dim("Menggunakan Package Manager: ")+e.default.bold(e.default.cyan(t)));let o=t==="pnpm"?"pnpm add @masdannn/license-guard@latest":t==="yarn"?"yarn add @masdannn/license-guard@latest":t==="bun"?"bun add @masdannn/license-guard@latest":"npm install @masdannn/license-guard@latest";try{console.log(e.default.dim(`Menjalankan: ${o}...`)),(0,N.execSync)(o,{cwd:n,stdio:"inherit"});let a=i.default.join(n,".licenseguard.json");if(s.default.existsSync(a))try{let r=JSON.parse(s.default.readFileSync(a,"utf-8"));r.version=j,r.updatedAt=new Date().toISOString(),s.default.writeFileSync(a,JSON.stringify(r,null,2),"utf-8"),console.log(`  ${e.default.green("\u2713")} Konfigurasi .licenseguard.json diperbarui.`)}catch{}console.log(e.default.bold(e.default.green(`
\u{1F389} Pembaruan Berhasil!`))),console.log(e.default.dim(`@masdannn/license-guard kini telah diperbarui ke versi paling stabil.
`))}catch(a){console.log(e.default.red(`
\u274C Gagal memperbarui package: ${a instanceof Error?a.message:String(a)}
`))}}function X(n){k(),console.log(e.default.bold(e.default.yellow("\u{1F9F9} PROSES FINALISASI & PEMBERSIHAN (FINISH / DETACH)"))),console.log(e.default.dim(`Menghapus seluruh file konfigurasi lisensi dan dependensi dari proyek ini...
`));let t=[i.default.join(n,".licenseguard.json"),i.default.join(n,"lib","license-guard.ts"),i.default.join(n,"src","lib","license-guard.ts"),i.default.join(n,"plugins","license-guard.client.ts"),i.default.join(n,"lib","license_guard.dart"),i.default.join(n,"license-guard.js")];for(let r of t)if(s.default.existsSync(r))try{s.default.unlinkSync(r),console.log(`  ${e.default.green("\u2713")} Berkas Dihapus: ${e.default.bold(i.default.relative(n,r).replace(/\\/g,"/"))}`)}catch{}let o=[i.default.join(n,"app","layout.tsx"),i.default.join(n,"app","layout.jsx"),i.default.join(n,"pages","_app.tsx"),i.default.join(n,"pages","_app.jsx"),i.default.join(n,"src","main.tsx"),i.default.join(n,"src","main.jsx"),i.default.join(n,"src","main.ts"),i.default.join(n,"src","main.js"),i.default.join(n,"src","App.tsx"),i.default.join(n,"src","App.vue"),i.default.join(n,"index.html")];for(let r of o)if(s.default.existsSync(r))try{let l=s.default.readFileSync(r,"utf-8"),c=!1;l.includes(`import { LicenseGuard } from '@/lib/license-guard';
`)&&(l=l.replace(`import { LicenseGuard } from '@/lib/license-guard';
`,""),c=!0),l.includes(`
        <LicenseGuard />`)&&(l=l.replace(`
        <LicenseGuard />`,""),c=!0),l.includes(`import '@/lib/license-guard';
`)&&(l=l.replace(`import '@/lib/license-guard';
`,""),c=!0),l.includes(`import './lib/license-guard';
`)&&(l=l.replace(`import './lib/license-guard';
`,""),c=!0),l.includes(`  <script src="license-guard.js"></script>
`)&&(l=l.replace(`  <script src="license-guard.js"></script>
`,""),c=!0),c&&(s.default.writeFileSync(r,l,"utf-8"),console.log(`  ${e.default.green("\u2713")} Injeksi Dibersihkan dari: ${e.default.bold(i.default.relative(n,r).replace(/\\/g,"/"))}`))}catch{}let a=i.default.join(n,"package.json");if(s.default.existsSync(a))try{let r=JSON.parse(s.default.readFileSync(a,"utf-8")),l=!1;r.dependencies&&r.dependencies["@masdannn/license-guard"]&&(delete r.dependencies["@masdannn/license-guard"],l=!0),r.devDependencies&&r.devDependencies["@masdannn/license-guard"]&&(delete r.devDependencies["@masdannn/license-guard"],l=!0),l&&(s.default.writeFileSync(a,JSON.stringify(r,null,2),"utf-8"),console.log(`  ${e.default.green("\u2713")} Dependensi Dicabut dari: ${e.default.bold("package.json")}`))}catch{}console.log(e.default.bold(e.default.green(`
\u{1F389} Finalisasi Selesai!`))),console.log(e.default.dim(`Proyek Anda kini telah bersih secara total dan tidak lagi terikat proteksi License Guard.
`))}async function ee(n){k(),console.log(e.default.bold(e.default.white(`\u{1FA7A} LICENSE GUARD HEALTH CHECK & DIAGNOSTIC
`)));let t=0,o=0;o++;let a=process.version;console.log("  [1/5] Lingkungan Runtime Node.js:"),console.log(`        \u2022 Node Version : ${e.default.bold(a)}`),console.log(`        \u2022 Platform     : ${e.default.bold(process.platform)} (${process.arch})`),console.log(`        \u2022 Working Dir  : ${e.default.dim(n)}`),console.log(`        ${e.default.green("\u2713")} Runtime environment siap.
`),t++,o++;let{framework:r,label:l}=L(n);console.log("  [2/5] Deteksi Framework & Bahasa:"),console.log(`        \u2022 Tipe Framework: ${e.default.bold(e.default.cyan(l))}`),r!=="unknown"?(console.log(`        ${e.default.green("\u2713")} Framework didukung penuh.
`),t++):(console.log(`        ${e.default.yellow("!")} Framework universal/generic.
`),t++),o++,console.log("  [3/5] Integritas Berkas Konfigurasi (.licenseguard.json):");let c=i.default.join(n,".licenseguard.json"),u=null;if(s.default.existsSync(c))try{u=JSON.parse(s.default.readFileSync(c,"utf-8")),u&&u.key&&u.domain?(console.log(`        \u2022 Status File : ${e.default.green("Ditemukan & Valid")}`),console.log(`        \u2022 Project     : ${e.default.bold(u.project||"\u2014")}`),console.log(`        \u2022 Domain      : ${e.default.bold(u.domain||"\u2014")}`),console.log(`        \u2022 Endpoint    : ${e.default.dim(u.endpoint||x)}`),console.log(`        ${e.default.green("\u2713")} Konfigurasi lokal lengkap.
`),t++):console.log(`        ${e.default.red("\u2717")} Berkas .licenseguard.json rusak atau tidak lengkap.
`)}catch{console.log(`        ${e.default.red("\u2717")} Format JSON pada .licenseguard.json tidak valid.
`)}else console.log(`        ${e.default.yellow("!")} .licenseguard.json tidak ditemukan. Jalankan "npx @masdannn/license-guard init" terlebih dahulu.
`);o++,console.log("  [4/5] Pemasangan Berkas Guard di Source Code:");let b=[i.default.join(n,"lib","license-guard.ts"),i.default.join(n,"src","lib","license-guard.ts"),i.default.join(n,"plugins","license-guard.client.ts"),i.default.join(n,"lib","license_guard.dart"),i.default.join(n,"license-guard.js")].find(f=>s.default.existsSync(f));b?(console.log(`        \u2022 Berkas Guard : ${e.default.bold(e.default.green(i.default.relative(n,b).replace(/\\/g,"/")))}`),console.log(`        ${e.default.green("\u2713")} File helper proteksi terpasang di proyek.
`),t++):console.log(`        ${e.default.yellow("!")} File helper proteksi belum dibuat.
`),o++,console.log("  [5/5] Uji Konektivitas Server & Latency Ping:");let m=(u?.endpoint||x).replace(/\/$/,""),y=u?.key?v(u.key).apiKey:"TEST_DIAGNOSTIC",p=u?.domain||"localhost",g=Date.now();try{let f=await fetch(`${m}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:y,domain:p}),signal:AbortSignal.timeout(6e3)}),S=Date.now()-g,h=await f.json();console.log(`        \u2022 Endpoint Server : ${e.default.dim(m)}`),console.log(`        \u2022 Latency Respon  : ${e.default.bold(S<300?e.default.green(`\u26A1 ${S}ms`):e.default.yellow(`\u23F3 ${S}ms`))}`),console.log(`        \u2022 Status Lisensi  : ${f.status===200&&h.status==="ACTIVE"?e.default.bold(e.default.green("ACTIVE (Normal \u2713)")):e.default.bold(e.default.yellow(h.status||"RESPONSE "+f.status))}`),console.log(`        ${e.default.green("\u2713")} Komunikasi jaringan dengan server normal.
`),t++}catch(f){console.log(`        ${e.default.red("\u2717")} Gagal menghubungi endpoint server (${f instanceof Error?f.message:String(f)}).
`)}console.log(e.default.bold(e.default.cyan("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"))),t===o?(console.log(e.default.bold(e.default.cyan("\u2551"))+"  "+e.default.bold(e.default.green(`\u2705 HASIL DIAGNOSTIK: 100% SEHAT (${t}/${o} Pengecekan Lolos)`))+"  "+e.default.bold(e.default.cyan("\u2551"))),console.log(e.default.bold(e.default.cyan("\u2551"))+"  "+e.default.dim("Semua konfigurasi, file helper, dan koneksi server aman.")+"  "+e.default.bold(e.default.cyan("\u2551")))):(console.log(e.default.bold(e.default.cyan("\u2551"))+"  "+e.default.bold(e.default.yellow(`\u26A0\uFE0F HASIL DIAGNOSTIK: ${t}/${o} Pengecekan Lolos`))+"            "+e.default.bold(e.default.cyan("\u2551"))),console.log(e.default.bold(e.default.cyan("\u2551"))+"  "+e.default.dim("Beberapa konfigurasi perlu diperiksa sesuai laporan.")+"      "+e.default.bold(e.default.cyan("\u2551")))),console.log(e.default.bold(e.default.cyan(`\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`)))}async function ne(n,t,o){k(),console.log(e.default.bold(e.default.yellow(`\u{1F6A8} EMERGENCY BYPASS & OFFLINE UNLOCK TOOL
`)));let a=i.default.join(n,".licenseguard.json"),r={};if(s.default.existsSync(a))try{r=JSON.parse(s.default.readFileSync(a,"utf-8"))}catch{}if(t==="--disable"||t==="--off"||o==="--disable"||o==="--off"){r.bypass&&(delete r.bypass,s.default.writeFileSync(a,JSON.stringify(r,null,2),"utf-8"));let y=[i.default.join(n,"lib","license-guard.ts"),i.default.join(n,"src","lib","license-guard.ts")];for(let p of y)if(s.default.existsSync(p))try{let g=s.default.readFileSync(p,"utf-8");g.includes("localStorage.setItem('_lg_emergency_bypass', 'true');")&&(g=g.replace(`if (typeof window !== 'undefined') { try { localStorage.setItem('_lg_emergency_bypass', 'true'); } catch {} }
`,""),g=g.replace(`if (typeof window !== 'undefined') { try { localStorage.removeItem('_lg_emergency_bypass'); } catch {} }
`,""),g=`if (typeof window !== 'undefined') { try { localStorage.removeItem('_lg_emergency_bypass'); } catch {} }
`+g,s.default.writeFileSync(p,g,"utf-8"))}catch{}console.log(`  ${e.default.green("\u2713")} Mode Emergency Bypass telah ${e.default.bold("DINONAKTIFKAN")}.`),console.log(e.default.dim(`  Sistem kini kembali memverifikasi lisensi secara normal ke server pusat.
`));return}if(!r.key){console.log(e.default.red("\u274C File .licenseguard.json tidak ditemukan.")),console.log(e.default.dim(`Jalankan "npx @masdannn/license-guard init" terlebih dahulu.
`));return}let l=v(r.key),c=l.apiKey,u=r.domain||l.domain||"localhost",d=t?.trim();if(!d){let y=C();console.log(e.default.dim("Project Terdaftar : ")+e.default.bold(r.project||"\u2014")),console.log(e.default.dim("Domain            : ")+e.default.bold(u)),console.log(e.default.dim(`Dapatkan token ini di dashboard project detail Anda.
`)),d=await y.ask(e.default.bold("Masukkan Emergency Bypass Token (format: EBP-xxxxxxxx): ")),y.close()}if(!d){console.log(e.default.red(`
\u274C Token darurat tidak boleh kosong.
`));return}if(!T(d,c,u)){console.log(e.default.bold(e.default.red(`
\u274C Token Darurat Tidak Valid!`))),console.log(e.default.dim(`Token yang dimasukkan tidak cocok dengan kredensial project "${r.project||u}".`)),console.log(e.default.dim(`Periksa kembali Emergency Bypass Key di Dashboard Project Anda.
`));return}r.bypass={active:!0,token:d,activatedAt:new Date().toISOString()},s.default.writeFileSync(a,JSON.stringify(r,null,2),"utf-8");let m=[i.default.join(n,"lib","license-guard.ts"),i.default.join(n,"src","lib","license-guard.ts")];for(let y of m)if(s.default.existsSync(y))try{let p=s.default.readFileSync(y,"utf-8");p.includes("localStorage.setItem('_lg_emergency_bypass', 'true');")||(p=`if (typeof window !== 'undefined') { try { localStorage.setItem('_lg_emergency_bypass', 'true'); } catch {} }
`+p,s.default.writeFileSync(y,p,"utf-8"))}catch{}console.log(e.default.bold(e.default.green(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`))),console.log(e.default.bold(e.default.green("\u2551"))+"  "+e.default.bold(e.default.white("\u{1F389} EMERGENCY BYPASS BERHASIL DIAKTIFKAN!"))+"            "+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Project Name : ${e.default.bold((r.project||"\u2014").padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Domain       : ${e.default.bold(u.padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Bypass Token : ${e.default.yellow(d.padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Status Akses : ${e.default.green(e.default.bold("UNLOCKED (Offline Fail-Safe)".padEnd(41)))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green(`\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`))),console.log(e.default.dim("Untuk mengembalikan ke mode proteksi online normal sewaktu-waktu:")),console.log(e.default.cyan(`\u{1F449} npx @masdannn/license-guard bypass --disable
`))}async function te(n){k(),console.log(e.default.bold(`\u{1F50D} MEMERIKSA STATUS LISENSI REMOTE...
`));let t={},o=i.default.join(n,".licenseguard.json");if(s.default.existsSync(o))try{t=JSON.parse(s.default.readFileSync(o,"utf-8"))}catch{}if(!t.key){console.log(e.default.red("\u274C File .licenseguard.json tidak ditemukan atau belum diinisialisasi.")),console.log(e.default.dim(`Jalankan "npx @masdannn/license-guard init" terlebih dahulu.
`));return}let a=v(t.key),r=t.endpoint||a.endpoint||x,l=a.apiKey,c=t.domain||a.domain||"localhost";try{let u=await fetch(`${r.replace(/\/$/,"")}/api/license/heartbeat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:l,domain:c})}),d=await u.json();console.log(e.default.bold(e.default.white("Detail Project:"))),console.log(`  Project Name : ${e.default.bold(e.default.cyan(t.project||"\u2014"))}`),console.log(`  Domain       : ${e.default.bold(c)}`),console.log(`  Endpoint     : ${e.default.dim(r)}`),console.log(`  API Key      : ${e.default.dim(l?l.slice(0,8)+"...":"\u2014")}
`),u.status===200&&d.valid&&d.status==="ACTIVE"?(console.log(e.default.bold(e.default.green("  STATUS: ACTIVE (LISENSI AKTIF & VALID \u2713)"))),console.log(e.default.dim(`  Website klien berjalan normal tanpa pembatasan.
`))):d.status==="SUSPENDED"||u.status===403?(console.log(e.default.bold(e.default.red("  STATUS: SUSPENDED (DITANGGUHKAN \u23F8\uFE0F)"))),console.log(e.default.dim(`  Akses website ditangguhkan oleh Administrator di Dashboard.
`))):d.status==="TAMPERED"?(console.log(e.default.bold(e.default.red("  STATUS: TAMPERED (MODIFIKASI TIDAK SAH \u26A0\uFE0F)"))),console.log(e.default.dim(`  Domain tidak cocok atau file lisensi dimodifikasi.
`))):(console.log(e.default.bold(e.default.yellow(`  STATUS: ${d.status||"UNKNOWN"}`))),d.error&&console.log(`  Pesan: ${d.error}
`))}catch(u){console.log(e.default.red(`\u274C Gagal menghubungi server: ${u instanceof Error?u.message:String(u)}
`))}}async function ie(){let n=process.argv.slice(2),t=process.cwd(),o=n[0]?.toLowerCase();if(o==="version"||n.includes("--version")||n.includes("-v")){await Z(t);return}if(o==="update"){await Q(t);return}if(o==="finish"||o==="clean"||o==="detach"||o==="uninstall"){X(t);return}if(o==="doctor"||o==="diag"||o==="check"){await ee(t);return}if(o==="bypass"||o==="unlock"||o==="recover"){await ne(t,n[1],n[2]);return}if(o==="status"||o==="view"||o==="info"||o==="test"){await te(t);return}if(n.includes("--help")||n.includes("-h")){k(),console.log(e.default.bold("Penggunaan:")),console.log("  npx @masdannn/license-guard             Inisialisasi & pairing lisensi"),console.log("  npx @masdannn/license-guard init        Inisialisasi project baru"),console.log(`  npx @masdannn/license-guard status      Cek status lisensi aktif dari server
`);return}k();let{framework:a,label:r}=L(t);console.log(e.default.dim("Terdeteksi Environment: ")+e.default.bold(e.default.cyan(r))+`
`);let l=i.default.basename(t),c=C();try{let d=await c.ask(e.default.bold("1. Nama Project")+e.default.dim(` (default: ${l}): `))||l,m=await c.ask(e.default.bold("2. Domain Website Target")+e.default.dim(" (contoh: tokoklien.com / localhost:3000): "))||"localhost:3000",p=(await c.ask(e.default.bold("3. Email Akun Developer")+e.default.dim(" (terdaftar di License Guard Hub): "))).trim();if(c.close(),!p||!/^\S+@\S+\.\S+$/.test(p)){console.log(e.default.red(`
\u274C Email tidak valid. Pastikan memasukkan alamat email yang benar.
`));return}console.log(e.default.dim(`
Menghubungkan ke Central License Guard Server...`));let g=x,f=Y(),S=await fetch(`${g.replace(/\/$/,"")}/api/pairing/init`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:d,domain:m,email:p,apiKey:f,framework:a})}),h=await S.json();if(!S.ok||!h.success){console.log(e.default.bold(e.default.red(`
\u274C Inisialisasi Lisensi Gagal:`))),console.log(e.default.red(`   ${h.error||"Server menolak pendaftaran lisensi."}`)),console.log(e.default.dim(`
Tips:`)),console.log(e.default.dim(`  \u2022 Pastikan email "${p}" telah terdaftar di dashboard License Guard.`)),console.log(e.default.dim("  \u2022 Periksa apakah kuota project domain akun Anda masih mencukupi.")),console.log(e.default.dim(`  \u2022 Buka dashboard di: ${g}/billing
`));return}let F=h.project?.apiKey||f,_=D({apiKey:F,endpoint:g,domain:m});console.log(e.default.bold(e.default.white(`
Menyiapkan berkas proteksi lisensi:`)));let R=q(t,a,_,d,m,g);for(let O of R)console.log(O);console.log(e.default.bold(e.default.green(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`))),console.log(e.default.bold(e.default.green("\u2551"))+"  "+e.default.bold(e.default.white("\u2705 LISENSI BERHASIL DIINISIALISASI & TERHUBUNG!"))+"         "+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Project Name : ${e.default.bold(d.padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Domain Target: ${e.default.bold(m.padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Akun Pemilik : ${e.default.cyan(p.padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Framework    : ${e.default.yellow(r.padEnd(41).slice(0,41))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green("\u2551"))+`  Status       : ${e.default.green(e.default.bold("ACTIVE (Terproteksi Real-time)".padEnd(41)))}`+e.default.bold(e.default.green("\u2551"))),console.log(e.default.bold(e.default.green(`\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`))),console.log(e.default.dim("Buka dashboard untuk memantau status atau mengaktifkan killswitch:")),console.log(e.default.cyan(`\u{1F449} ${g}/projects/${h.project?.id||""}
`))}catch(u){c.close(),console.log(e.default.red(`
\u274C Terjadi kesalahan: ${u instanceof Error?u.message:String(u)}
`))}}ie();
