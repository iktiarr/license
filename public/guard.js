/**
 * Centralized License Guard — Universal Client SDK (Native HTML / Any Web App)
 * Usage in any plain HTML or web template:
 * <script src="https://YOUR-SERVER-URL/guard.js" data-api-key="YOUR_PROJECT_API_KEY"></script>
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;
  if (window.__LICENSE_GUARD_INITIALIZED__) return;
  window.__LICENSE_GUARD_INITIALIZED__ = true;

  // ── Lottie Animation JSON (Embedded directly for 100% offline & instant load) ──
  var LOTTIE_DATA = {
    v: '4.8.0',
    fr: 30,
    ip: 0,
    op: 230,
    w: 500,
    h: 500,
    nm: 'Shake',
    ddd: 0,
    assets: [
      {
        id: 'comp_0',
        layers: [
          {
            ddd: 0,
            ind: 1,
            ty: 4,
            nm: 'Shape Layer 3',
            sr: 1,
            ks: {
              o: { a: 0, k: 100 },
              r: { a: 0, k: 40 },
              p: { a: 0, k: [375, 375, 0] },
              a: { a: 0, k: [14, 2.5, 0] },
              s: { a: 0, k: [100, 100, 100] },
            },
            shapes: [
              {
                ty: 'gr',
                it: [
                  {
                    ind: 0,
                    ty: 'sh',
                    ks: {
                      a: 0,
                      k: {
                        i: [[0, 0], [0, 0]],
                        o: [[0, 0], [0, 0]],
                        v: [[14, -121], [14, 126]],
                        c: false,
                      },
                    },
                    nm: 'Path 1',
                  },
                  {
                    ty: 'st',
                    c: { a: 0, k: [1, 1, 1, 1] },
                    o: { a: 0, k: 100 },
                    w: { a: 0, k: 30 },
                    lc: 2,
                    lj: 1,
                  },
                  {
                    ty: 'tr',
                    p: { a: 0, k: [0, 0] },
                    a: { a: 0, k: [0, 0] },
                    s: { a: 0, k: [100, 100] },
                    r: { a: 0, k: 0 },
                    o: { a: 0, k: 100 },
                  },
                ],
                nm: 'Shape 1',
              },
              {
                ty: 'tm',
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { i: { x: [0.261], y: [1] }, o: { x: [0.286], y: [0] }, t: 143, s: [0] },
                    { t: 166, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
                m: 1,
              },
            ],
            ip: 143,
            op: 260,
            st: 22,
          },
          {
            ddd: 0,
            ind: 2,
            ty: 4,
            nm: 'Shape Layer 2',
            sr: 1,
            ks: {
              o: { a: 0, k: 100 },
              r: { a: 0, k: -40 },
              p: { a: 0, k: [375, 375, 0] },
              a: { a: 0, k: [14, 2.5, 0] },
              s: { a: 0, k: [100, 100, 100] },
            },
            shapes: [
              {
                ty: 'gr',
                it: [
                  {
                    ind: 0,
                    ty: 'sh',
                    ks: {
                      a: 0,
                      k: {
                        i: [[0, 0], [0, 0]],
                        o: [[0, 0], [0, 0]],
                        v: [[14, -121], [14, 126]],
                        c: false,
                      },
                    },
                    nm: 'Path 1',
                  },
                  {
                    ty: 'st',
                    c: { a: 0, k: [1, 1, 1, 1] },
                    o: { a: 0, k: 100 },
                    w: { a: 0, k: 30 },
                    lc: 2,
                    lj: 1,
                  },
                  {
                    ty: 'tr',
                    p: { a: 0, k: [0, 0] },
                    a: { a: 0, k: [0, 0] },
                    s: { a: 0, k: [100, 100] },
                    r: { a: 0, k: 0 },
                    o: { a: 0, k: 100 },
                  },
                ],
                nm: 'Shape 1',
              },
              {
                ty: 'tm',
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { i: { x: [0.261], y: [1] }, o: { x: [0.286], y: [0] }, t: 134, s: [0] },
                    { t: 157, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
                m: 1,
              },
            ],
            ip: 134,
            op: 260,
            st: 13,
          },
          {
            ddd: 0,
            ind: 3,
            ty: 4,
            nm: 'Circle Stroke',
            sr: 1,
            ks: {
              o: {
                a: 1,
                k: [
                  { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
                  { t: 7, s: [100] },
                ],
              },
              r: { a: 0, k: 0 },
              p: { a: 0, k: [375, 375, 0] },
              a: { a: 0, k: [4, -6, 0] },
              s: { a: 0, k: [132, 132, 100] },
            },
            shapes: [
              {
                ty: 'gr',
                it: [
                  { d: 1, ty: 'el', s: { a: 0, k: [306, 306] }, p: { a: 0, k: [0, 0] } },
                  {
                    ty: 'st',
                    c: {
                      a: 1,
                      k: [
                        { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0, 0, 0, 1] },
                        { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 87, s: [0, 0, 0, 1] },
                        { t: 99, s: [0.95, 0.075, 0.075, 1] },
                      ],
                    },
                    o: { a: 0, k: 100 },
                    w: { a: 0, k: 8 },
                    lc: 2,
                    lj: 1,
                  },
                  {
                    ty: 'tr',
                    p: { a: 0, k: [4, -6] },
                    a: { a: 0, k: [0, 0] },
                    s: { a: 0, k: [100, 100] },
                    r: { a: 0, k: 0 },
                    o: { a: 0, k: 100 },
                  },
                ],
                nm: 'Ellipse 1',
              },
              {
                ty: 'tm',
                s: {
                  a: 1,
                  k: [
                    { i: { x: [0.338], y: [1] }, o: { x: [0.333], y: [0] }, t: 87, s: [50] },
                    { t: 122, s: [100] },
                  ],
                },
                e: {
                  a: 1,
                  k: [
                    { i: { x: [0.338], y: [1] }, o: { x: [0.333], y: [0] }, t: 87, s: [45] },
                    { t: 122, s: [0] },
                  ],
                },
                o: {
                  a: 1,
                  k: [
                    { i: { x: [0.474], y: [1] }, o: { x: [0.43], y: [0] }, t: 0, s: [-170.4] },
                    { t: 111, s: [-1250.4] },
                  ],
                },
                m: 1,
              },
            ],
            ip: 0,
            op: 260,
            st: 0,
          },
          {
            ddd: 0,
            ind: 4,
            ty: 4,
            nm: 'Circle Fill',
            sr: 1,
            ks: {
              o: {
                a: 1,
                k: [
                  { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: -33, s: [0] },
                  { t: -26, s: [100] },
                ],
              },
              r: { a: 0, k: 0 },
              p: { a: 0, k: [375, 375, 0] },
              a: { a: 0, k: [4, -6, 0] },
              s: {
                a: 1,
                k: [
                  { i: { x: [0.389, 0.389, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 121, s: [0, 0, 100] },
                  { t: 133, s: [130.1, 130.1, 100] },
                ],
              },
            },
            shapes: [
              {
                ty: 'gr',
                it: [
                  { d: 1, ty: 'el', s: { a: 0, k: [306, 306] }, p: { a: 0, k: [0, 0] } },
                  {
                    ty: 'fl',
                    c: { a: 0, k: [0.949, 0.074, 0.074, 1] },
                    o: { a: 0, k: 100 },
                  },
                  {
                    ty: 'tr',
                    p: { a: 0, k: [4, -6] },
                    a: { a: 0, k: [0, 0] },
                    s: { a: 0, k: [100, 100] },
                    r: { a: 0, k: 0 },
                    o: { a: 0, k: 100 },
                  },
                ],
                nm: 'Ellipse 1',
              },
            ],
            ip: 121,
            op: 260,
            st: -33,
          },
        ],
      },
    ],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 0,
        nm: 'Error',
        refId: 'comp_0',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [261, 250, 0] },
          a: { a: 0, k: [375, 375, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        w: 750,
        h: 750,
        ip: 179,
        op: 230,
        st: 0,
      },
      {
        ddd: 0,
        ind: 2,
        ty: 0,
        nm: 'Error',
        refId: 'comp_0',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 }, t: 171, s: [250, 250, 0] },
              { t: 173, s: [261, 250, 0] },
            ],
          },
          a: { a: 0, k: [375, 375, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        w: 750,
        h: 750,
        ip: 0,
        op: 179,
        st: 0,
      },
    ],
  };

  // ── Find Script Configuration ──────────────────────────────────────────────
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf('guard.js') !== -1) {
          return scripts[i];
        }
      }
      return null;
    })();

  var config = window.LICENSE_GUARD_CONFIG || {};
  var scriptOrigin = '';

  if (currentScript && currentScript.src) {
    try {
      var scriptUrl = new URL(currentScript.src, window.location.href);
      scriptOrigin = scriptUrl.origin;
    } catch {}
  }

  // ── Helper: Decode Obfuscated Token ─────────────────────────────────────────
  function decodeToken(encoded) {
    try {
      var raw = encoded.indexOf('LGK_') === 0 ? encoded.substring(4) : encoded;
      var str = atob(raw);
      var res = '';
      for (var i = 0; i < str.length; i++) {
        res += String.fromCharCode(str.charCodeAt(i) ^ ((i % 7) + 3));
      }
      return JSON.parse(decodeURIComponent(res));
    } catch {
      return { apiKey: encoded };
    }
  }

  var rawKeyAttr =
    config.key ||
    config.apiKey ||
    (currentScript && (currentScript.getAttribute('data-key') || currentScript.getAttribute('data-api-key'))) ||
    '';

  var decodedCreds = rawKeyAttr ? decodeToken(rawKeyAttr) : {};
  var API_KEY = decodedCreds.apiKey || rawKeyAttr;
  var ENDPOINT =
    config.endpoint ||
    decodedCreds.endpoint ||
    (currentScript && currentScript.getAttribute('data-endpoint')) ||
    scriptOrigin ||
    '';
  var REDIRECT_URL =
    config.redirect ||
    (currentScript && currentScript.getAttribute('data-redirect')) ||
    '';
  var HEARTBEAT_INTERVAL =
    parseInt(
      config.interval ||
        (currentScript && currentScript.getAttribute('data-interval')) ||
        '600', // 10 minutes default
      10
    ) * 1000;

  var DOMAIN = window.location.hostname || 'localhost';
  var STORAGE_KEY = '_lg_license_state';
  var overlayId = '__license_guard_lock_overlay__';
  var pollTimer = null;

  // ── Helper: Format Date (DD/MM/YYYY HH:MM:SS) ──────────────────────────────
  function formatDateTime(timestamp) {
    var d = timestamp ? new Date(timestamp) : new Date();
    var pad = function (n) {
      return n < 10 ? '0' + n : n;
    };
    return (
      pad(d.getDate()) +
      '/' +
      pad(d.getMonth() + 1) +
      '/' +
      d.getFullYear() +
      ' ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }

  // ── Local State ────────────────────────────────────────────────────────────
  var state = {
    valid: true,
    status: 'ACTIVE',
    token: null,
    lastCheck: 0,
    suspendedAt: null,
  };

  try {
    var cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      state = JSON.parse(cached);
    }
  } catch {}

  // ── Render Lottie Animation Directly ───────────────────────────────────────
  function initLottieAnimation(container) {
    if (!container) return;

    function renderLottie() {
      if (window.lottie) {
        container.innerHTML = '';
        window.lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: LOTTIE_DATA,
        });
      }
    }

    if (window.lottie) {
      renderLottie();
    } else {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
      s.onload = renderLottie;
      document.head.appendChild(s);
    }
  }

  // ── UI Lock Screen (Clean Full-Page Minimalist Typography) ──────────────────
  function createLockOverlay(reason) {
    var existing = document.getElementById(overlayId);
    if (existing) return;

    if (!state.suspendedAt) {
      state.suspendedAt = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }

    var suspendedDateFormatted = formatDateTime(state.suspendedAt);
    var pageUrl = window.location.href;

    var reasonText =
      reason === 'TAMPERED'
        ? 'Pelanggaran domain / modifikasi tidak sah'
        : 'Alasan tidak diketahui';

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.cssText =
      'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;' +
      'z-index:2147483647!important;background:#ffffff!important;display:flex!important;flex-direction:column!important;' +
      'align-items:center!important;justify-content:center!important;padding:40px 24px!important;box-sizing:border-box!important;' +
      'overflow-y:auto!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif!important;' +
      'color:#09090b!important;';

    overlay.innerHTML =
      '<div style="max-width:680px;width:100%;margin:auto;text-align:center;animation:lgFadeIn 0.35s cubic-bezier(0.16,1,0.3,1);">' +
      // Lottie Animation Container
      '  <div id="__lg_lottie_box__" style="width:130px;height:130px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">' +
      '    <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '      <circle cx="12" cy="12" r="10"/>' +
      '      <line x1="12" y1="8" x2="12" y2="12"/>' +
      '      <line x1="12" y1="16" x2="12.01" y2="16"/>' +
      '    </svg>' +
      '  </div>' +
      // Large Typography Title
      '  <h1 style="margin:0 0 14px;font-size:38px;font-weight:800;letter-spacing:-0.035em;color:#09090b;line-height:1.15;">' +
      '    halaman ditangguhkan' +
      '  </h1>' +
      // Subtitle
      '  <p style="margin:0 auto 36px;font-size:16px;line-height:1.65;color:#52525b;max-width:560px;">' +
      '    anda tidak dapat menggunakan halaman ini. silahkan hubungi pihak terkait untuk bisa mengakses kembali halaman ini.' +
      '  </p>' +
      // Information Box with Full unbroken URL & Clear Typography
      '  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:24px 28px;text-align:left;font-size:14px;line-height:1.6;margin-bottom:36px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">' +
      // Row 1: Rincian (Full unbroken link)
      '    <div style="padding:12px 0;border-bottom:1px solid #e2e8f0;">' +
      '      <div style="color:#64748b;font-size:13px;font-weight:600;margin-bottom:6px;">rincian :</div>' +
      '      <div style="color:#09090b;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;font-weight:700;word-break:break-all;overflow-wrap:anywhere;line-height:1.5;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;">' +
      pageUrl +
      '      </div>' +
      '    </div>' +
      // Row 2: Tanggal ditangguhkan
      '    <div style="padding:12px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '      <span style="color:#64748b;font-size:13px;font-weight:600;">tanggal ditangguhkan:</span>' +
      '      <span style="color:#09090b;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;font-weight:700;">' +
      suspendedDateFormatted +
      '</span>' +
      '    </div>' +
      // Row 3: Tanggal dikembalikan
      '    <div style="padding:12px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '      <span style="color:#64748b;font-size:13px;font-weight:600;">tanggal dikembalikan :</span>' +
      '      <span style="color:#71717a;font-style:italic;font-size:14px;font-weight:600;">Tidak ditentukan</span>' +
      '    </div>' +
      // Row 4: Alasan
      '    <div style="padding:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '      <span style="color:#64748b;font-size:13px;font-weight:600;">alasan :</span>' +
      '      <span style="color:#09090b;font-size:14px;font-weight:700;">' +
      reasonText +
      '</span>' +
      '    </div>' +
      '  </div>' +
      // Minimal Footer
      '  <div style="font-size:12px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;">' +
      '    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;"></span>' +
      '    <span>Protected by Centralized License Guard</span>' +
      '  </div>' +
      '</div>' +
      '<style>' +
      '@keyframes lgFadeIn{from{opacity:0;transform:scale(0.97) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
      '</style>';

    // Prevent body scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Append to document and start Lottie animation
    function appendOverlay() {
      if (document.body && !document.getElementById(overlayId)) {
        document.body.appendChild(overlay);
        var lottieBox = document.getElementById('__lg_lottie_box__');
        if (lottieBox) {
          initLottieAnimation(lottieBox);
        }
      }
    }

    if (document.body) {
      appendOverlay();
    } else {
      document.addEventListener('DOMContentLoaded', appendOverlay);
    }

    // Auto-polling every 4 seconds to unlock instantly when activated in Dashboard
    if (!pollTimer) {
      pollTimer = setInterval(function () {
        if (state.status !== 'ACTIVE') {
          checkLicense();
        }
      }, 4000);
    }

    // Anti-Tamper: MutationObserver to re-inject overlay if removed from DevTools
    if (window.MutationObserver) {
      var observer = new MutationObserver(function () {
        if (!document.getElementById(overlayId) && state.status !== 'ACTIVE') {
          if (document.body) appendOverlay();
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  function removeLockOverlay() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    state.suspendedAt = null;
    var overlay = document.getElementById(overlayId);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // ── Verification / Heartbeat Request ────────────────────────────────────────
  function checkLicense(callback) {
    if (!API_KEY) {
      console.warn('[LicenseGuard] No data-api-key provided.');
      return;
    }

    var endpointUrl = (ENDPOINT ? ENDPOINT.replace(/\/$/, '') : '') + '/api/license/heartbeat';

    var payload = {
      apiKey: API_KEY,
      domain: DOMAIN,
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', endpointUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 10000;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data.valid && data.status === 'ACTIVE') {
              state = {
                valid: true,
                status: 'ACTIVE',
                token: data.token,
                lastCheck: Date.now(),
                suspendedAt: null,
              };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
              } catch {}
              removeLockOverlay();
              if (callback) callback(true, state);
            } else {
              handleSuspended(data.status || 'SUSPENDED');
              if (callback) callback(false, state);
            }
          } catch {
            handleNetworkFail();
          }
        } else if (xhr.status === 403 || xhr.status === 401) {
          try {
            var errData = JSON.parse(xhr.responseText);
            handleSuspended(errData.status || 'SUSPENDED');
          } catch {
            handleSuspended('SUSPENDED');
          }
          if (callback) callback(false, state);
        } else {
          handleNetworkFail();
        }
      }
    };

    xhr.ontimeout = handleNetworkFail;
    xhr.onerror = handleNetworkFail;

    xhr.send(JSON.stringify(payload));
  }

  function handleSuspended(status) {
    state.valid = false;
    state.status = status;
    if (!state.suspendedAt) {
      state.suspendedAt = Date.now();
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}

    if (REDIRECT_URL) {
      window.location.href = REDIRECT_URL;
      return;
    }

    createLockOverlay(status);
    if (typeof window.onLicenseSuspended === 'function') {
      window.onLicenseSuspended(status);
    }
  }

  function handleNetworkFail() {
    var isWithinGrace =
      state.valid &&
      state.lastCheck &&
      Date.now() - state.lastCheck < 24 * 60 * 60 * 1000;
    if (!isWithinGrace && !state.valid) {
      createLockOverlay(state.status || 'SUSPENDED');
    }
  }

  // ── Auto Initialization ───────────────────────────────────────────────────
  function init() {
    if (state.valid === false || state.status === 'SUSPENDED' || state.status === 'TAMPERED') {
      createLockOverlay(state.status);
    }

    checkLicense();
    setInterval(checkLicense, HEARTBEAT_INTERVAL);

    window.addEventListener('focus', function () {
      if (Date.now() - state.lastCheck > 5 * 1000) {
        checkLicense();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public Global API ─────────────────────────────────────────────────────
  window.LicenseGuard = {
    init: function (opts) {
      if (opts) {
        if (opts.apiKey) API_KEY = opts.apiKey;
        if (opts.endpoint) ENDPOINT = opts.endpoint;
        if (opts.redirect) REDIRECT_URL = opts.redirect;
      }
      checkLicense();
    },
    check: checkLicense,
    getStatus: function () {
      return state.status;
    },
    isValid: function () {
      return state.valid;
    },
    lock: function (reason) {
      handleSuspended(reason || 'SUSPENDED');
    },
    unlock: function () {
      state.valid = true;
      state.status = 'ACTIVE';
      state.suspendedAt = null;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
      removeLockOverlay();
    },
  };
})();
