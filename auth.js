/**
 * auth.js — Shared Firebase Authentication Module
 * Providers: Google, GitHub, Microsoft (Outlook), Yahoo
 *
 * Prerequisites (add to each HTML page before this script):
 *   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
 *   <script src="auth.js"></script>
 */

const MK_AUTH_APP_NAME = 'mk-site';

// ── Firebase config (hardcoded) ───────────────────────────────────────────────
const MK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAoDWn6VF2qvLoHUFURdIxdqJJN_XnojEQ",
  authDomain: "cloudiaas-14c01.firebaseapp.com",
  databaseURL: "https://cloudiaas-14c01-default-rtdb.firebaseio.com",
  projectId: "cloudiaas-14c01",
  storageBucket: "cloudiaas-14c01.firebasestorage.app",
  messagingSenderId: "846824147799",
  appId: "1:846824147799:web:78f31588eb6abe1d6b4c12",
  measurementId: "G-WLR8DVRNCB"
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function _getApp() {
  try {
    const existing = firebase.apps.find(a => a.name === MK_AUTH_APP_NAME);
    return existing || firebase.initializeApp(MK_FIREBASE_CONFIG, MK_AUTH_APP_NAME);
  } catch (e) {
    console.warn('[auth.js] Firebase init error:', e);
    return null;
  }
}

function _getAuth() {
  const app = _getApp();
  return app ? firebase.auth(app) : null;
}

// ── Sign-in methods ───────────────────────────────────────────────────────────

function signInWithGoogle() {
  const auth = _getAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider).catch(_handleError);
}

function signInWithGitHub() {
  const auth = _getAuth();
  const provider = new firebase.auth.GithubAuthProvider();
  return auth.signInWithPopup(provider).catch(_handleError);
}

function signInWithMicrosoft() {
  const auth = _getAuth();
  const provider = new firebase.auth.OAuthProvider('microsoft.com');
  return auth.signInWithPopup(provider).catch(_handleError);
}

function signInWithYahoo() {
  const auth = _getAuth();
  const provider = new firebase.auth.OAuthProvider('yahoo.com');
  return auth.signInWithPopup(provider).catch(_handleError);
}

function signInAsGuest() {
  const auth = _getAuth();
  return auth.signInAnonymously().catch(_handleError);
}

function signOut() {
  const auth = _getAuth();
  if (auth) auth.signOut();
}

function onAuthReady(callback) {
  const auth = _getAuth();
  if (!auth) { callback(null); return; }
  auth.onAuthStateChanged(callback);
}

function _handleError(err) {
  if (err.code === 'auth/popup-closed-by-user') return;
  if (err.code === 'auth/cancelled-popup-request') return;
  console.error('[auth.js]', err.code, err.message);
  alert('Sign-in failed: ' + (err.message || err.code));
}

// ── Nav auth widget ───────────────────────────────────────────────────────────
// Looks for <div id="nav-auth"></div> in the page nav and populates it.

function initNavAuth(loginUrl) {
  onAuthReady(user => {
    const el = document.getElementById('nav-auth');
    if (!el) return;

    if (user) {
      const isGuest = user.isAnonymous;
      const initial = isGuest ? '👤' : (user.displayName || user.email || 'U')[0].toUpperCase();
      const photo   = user.photoURL;
      const label   = isGuest ? 'Guest' : (user.displayName || user.email);
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          ${photo
            ? `<img src="${photo}" referrerpolicy="no-referrer"
                    style="width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.35);">`
            : `<div style="width:28px;height:28px;border-radius:50%;background:${isGuest ? '#6B7280' : '#7C3AED'};
                           display:flex;align-items:center;justify-content:center;
                           font-size:${isGuest ? '14px' : '12px'};font-weight:700;color:white;">${initial}</div>`
          }
          <span style="font-size:12px;color:rgba(255,255,255,.8);max-width:130px;
                       overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${label}
          </span>
          <button onclick="signOut()"
                  style="font-size:11px;padding:4px 10px;border-radius:6px;
                         border:1px solid rgba(255,255,255,.25);background:none;
                         color:rgba(255,255,255,.7);cursor:pointer;transition:all .2s;"
                  onmouseover="this.style.background='rgba(255,255,255,.1)';this.style.color='white';"
                  onmouseout="this.style.background='none';this.style.color='rgba(255,255,255,.7)';">
            Sign out
          </button>
        </div>`;
    } else {
      const url = loginUrl || 'login.html';
      el.innerHTML = `
        <a href="${url}"
           style="padding:7px 16px;background:rgba(124,58,237,.4);color:white;border-radius:8px;
                  font-size:13px;font-weight:700;text-decoration:none;
                  border:1px solid rgba(124,58,237,.6);transition:all .2s;"
           onmouseover="this.style.filter='brightness(1.2)'"
           onmouseout="this.style.filter=''">
          Sign In
        </a>`;
    }
  });
}
