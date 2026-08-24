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

  var API_KEY =
    config.apiKey ||
    (currentScript && currentScript.getAttribute('data-api-key')) ||
    '';
  var ENDPOINT =
    config.endpoint ||
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

  // ── Load DotLottie Player Component Dynamically ────────────────────────────
  function loadLottiePlayer() {
    if (window.__DOTLOTTIE_SCRIPT_LOADED__) return;
    window.__DOTLOTTIE_SCRIPT_LOADED__ = true;
    try {
      var s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
      document.head.appendChild(s);
    } catch {}
  }

  // ── UI Lock Screen (Clean Full-Page Layout with Lottie Animation) ───────────
  function createLockOverlay(reason) {
    var existing = document.getElementById(overlayId);
    if (existing) return;

    loadLottiePlayer();

    if (!state.suspendedAt) {
      state.suspendedAt = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }

    var suspendedDateFormatted = formatDateTime(state.suspendedAt);
    var pageUrl = window.location.href;
    var lottieUrl = (ENDPOINT ? ENDPOINT.replace(/\/$/, '') : '') + '/error.lottie';

    var reasonText =
      reason === 'TAMPERED'
        ? 'Pelanggaran domain / modifikasi tidak sah'
        : 'Alasan tidak diketahui';

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.cssText =
      'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;' +
      'z-index:2147483647!important;background:#ffffff!important;display:flex!important;flex-direction:column!important;' +
      'align-items:center!important;justify-content:center!important;padding:32px 24px!important;box-sizing:border-box!important;' +
      'overflow-y:auto!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif!important;' +
      'color:#09090b!important;';

    overlay.innerHTML =
      '<div style="max-width:620px;width:100%;margin:auto;text-align:center;animation:lgFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);">' +
      '  <div style="width:140px;height:140px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">' +
      '    <dotlottie-player src="' +
      lottieUrl +
      '" background="transparent" speed="1" style="width:140px;height:140px;" loop autoplay>' +
      '      <div style="width:72px;height:72px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;color:#ef4444;font-size:32px;">🚫</div>' +
      '    </dotlottie-player>' +
      '  </div>' +
      '  <h1 style="margin:0 0 12px;font-size:32px;font-weight:800;letter-spacing:-0.03em;color:#09090b;line-height:1.2;">' +
      '    halaman ditangguhkan' +
      '  </h1>' +
      '  <p style="margin:0 auto 32px;font-size:15px;line-height:1.65;color:#71717a;max-width:520px;">' +
      '    anda tidak dapat menggunakan halaman ini. silahkan hubungi pihak terkait untuk bisa mengakses kembali halaman ini.' +
      '  </p>' +
      '  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:20px 24px;text-align:left;font-size:13px;line-height:1.6;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">' +
      '    <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;display:flex;flex-direction:column;gap:4px;">' +
      '      <span style="color:#64748b;font-size:12px;font-weight:600;">rincian :</span>' +
      '      <span style="color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:600;word-break:break-all;overflow-wrap:anywhere;line-height:1.5;">' +
      pageUrl +
      '</span>' +
      '    </div>' +
      '    <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '      <span style="color:#64748b;font-size:12px;font-weight:600;">tanggal ditangguhkan:</span>' +
      '      <span style="color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:600;">' +
      suspendedDateFormatted +
      '</span>' +
      '    </div>' +
      '    <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '      <span style="color:#64748b;font-size:12px;font-weight:600;">tanggal dikembalikan :</span>' +
      '      <span style="color:#64748b;font-style:italic;font-weight:500;">Tidak ditentukan</span>' +
      '    </div>' +
      '    <div style="padding:10px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '      <span style="color:#64748b;font-size:12px;font-weight:600;">alasan :</span>' +
      '      <span style="color:#0f172a;font-weight:600;">' +
      reasonText +
      '</span>' +
      '    </div>' +
      '  </div>' +
      '  <div style="font-size:12px;color:#94a3b8;display:flex;align-items:center;justify-content:center;gap:6px;">' +
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

    // Append to document
    function appendOverlay() {
      if (document.body && !document.getElementById(overlayId)) {
        document.body.appendChild(overlay);
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
