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

  var DOMAIN = window.location.hostname;
  var STORAGE_KEY = '_lg_license_state';
  var overlayId = '__license_guard_lock_overlay__';

  // ── Local State ────────────────────────────────────────────────────────────
  var state = {
    valid: true,
    status: 'ACTIVE',
    token: null,
    lastCheck: 0,
  };

  try {
    var cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      state = JSON.parse(cached);
    }
  } catch {}

  // ── UI Lock Screen (Inescapable Overlay) ────────────────────────────────────
  function createLockOverlay(reason) {
    if (document.getElementById(overlayId)) return;

    var statusText =
      reason === 'TAMPERED'
        ? 'Pelanggaran Lisensi Terdeteksi (Tampered)'
        : 'Akses Operasional Ditangguhkan (Suspended)';

    var descText =
      reason === 'TAMPERED'
        ? 'Domain ' +
          DOMAIN +
          ' tidak terdaftar atau telah dimodifikasi tanpa izin. Harap hubungi administrator/developer resmi.'
        : 'Lisensi website untuk domain ' +
          DOMAIN +
          ' sedang dalam status non-aktif. Silakan hubungi pengembang untuk pengaktifan kembali.';

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.cssText =
      'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;' +
      'z-index:2147483647!important;background:rgba(11,15,25,0.98)!important;backdrop-filter:blur(16px)!important;' +
      '-webkit-backdrop-filter:blur(16px)!important;display:flex!important;align-items:center!important;' +
      'justify-content:center!important;padding:24px!important;box-sizing:border-box!important;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif!important;color:#f8fafc!important;';

    overlay.innerHTML =
      '<div style="max-width:520px;width:100%;background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:36px 32px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.25);animation:lgFadeIn 0.3s ease-out;">' +
      '  <div style="width:68px;height:68px;border-radius:18px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">' +
      '    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
      '      <line x1="12" y1="8" x2="12" y2="12"/>' +
      '      <line x1="12" y1="16" x2="12.01" y2="16"/>' +
      '    </svg>' +
      '  </div>' +
      '  <h2 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">' +
      statusText +
      '</h2>' +
      '  <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#94a3b8;">' +
      descText +
      '</p>' +
      '  <div style="background:#1e293b;border-radius:12px;padding:14px 16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;font-size:12px;">' +
      '    <span style="color:#64748b;">Domain</span>' +
      '    <span style="color:#e2e8f0;font-family:monospace;font-weight:600;">' +
      DOMAIN +
      '</span>' +
      '  </div>' +
      '  <div style="font-size:12px;color:#64748b;display:flex;align-items:center;justify-content:center;gap:6px;">' +
      '    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;"></span>' +
      '    <span>Protected by Centralized License Guard</span>' +
      '  </div>' +
      '</div>' +
      '<style>' +
      '@keyframes lgFadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}' +
      '</style>';

    // Prevent body scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Append to document
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(overlay);
      });
    }

    // Anti-Tamper: MutationObserver to re-inject overlay if removed from DevTools
    if (window.MutationObserver) {
      var observer = new MutationObserver(function () {
        if (!document.getElementById(overlayId) && state.status !== 'ACTIVE') {
          if (document.body) document.body.appendChild(overlay);
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  function removeLockOverlay() {
    var overlay = document.getElementById(overlayId);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
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
            // JSON parse error — trust cache within grace period
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
          // Network / server temporary issue -> fallback to cache
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
    // If we have cached valid state within last 24h, allow it
    var isWithinGrace = state.valid && state.lastCheck && (Date.now() - state.lastCheck < 24 * 60 * 60 * 1000);
    if (!isWithinGrace && !state.valid) {
      createLockOverlay(state.status || 'SUSPENDED');
    }
  }

  // ── Auto Initialization ───────────────────────────────────────────────────
  function init() {
    // If cached status was already suspended, lock immediately before request
    if (state.valid === false || state.status === 'SUSPENDED' || state.status === 'TAMPERED') {
      createLockOverlay(state.status);
    }

    // Run active heartbeat check
    checkLicense();

    // Periodic heartbeat
    setInterval(checkLicense, HEARTBEAT_INTERVAL);

    // Re-check when user switches back to the tab
    window.addEventListener('focus', function () {
      if (Date.now() - state.lastCheck > 60 * 1000) {
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
      removeLockOverlay();
    },
  };
})();
