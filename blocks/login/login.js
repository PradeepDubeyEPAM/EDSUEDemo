
import { loadOffersOnPage, removeOffers } from './offers.js';

// ── SESSION HELPERS ────────────────────────────────────────
export function getSession() {
  try {
    const d = localStorage.getItem('userSession');
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

function clearSession() {
  localStorage.removeItem('userSession');
}

// ── NAV UI ─────────────────────────────────────────────────
export function showLoggedInUI(username) {
  
  const existing = document.getElementById('nav-user-wrapper');
  if (existing) existing.remove();

  const loginBtn = document.getElementById('nav-login-btn-trigger');
  const navTools = loginBtn ? loginBtn.parentElement
    : document.querySelector('.nav-tools');
  if (loginBtn) loginBtn.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.id = 'nav-user-wrapper';
  wrapper.style.cssText = 'display:flex;align-items:center;gap:10px;margin-left:12px;';

  const text = document.createElement('span');
  text.style.cssText = 'font-size:14px;font-family:sans-serif;';
  text.textContent = `Logged in as ${username}`;

  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.style.cssText = `
    background:#e34850;color:white;border:none;
    border-radius:20px;padding:6px 14px;cursor:pointer;font-size:14px;
  `;
  logoutBtn.addEventListener('click', () => {
    clearSession();
    removeOffers();
    showLoggedOutUI();
  });

  wrapper.appendChild(text);
  wrapper.appendChild(logoutBtn);
  if (navTools) navTools.appendChild(wrapper);
}

export function showLoggedOutUI() {
  const wrapper = document.getElementById('nav-user-wrapper');
  if (wrapper) wrapper.remove();
  const loginBtn = document.getElementById('nav-login-btn-trigger');
  if (loginBtn) loginBtn.style.display = '';
}

// ── LOGIN POPUP ────────────────────────────────────────────
function showLoginPopup() {
  const existing = document.getElementById('nav-login-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nav-login-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;z-index:9999;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background:white;border-radius:12px;padding:2rem;width:360px;
    box-shadow:0 4px 24px rgba(0,0,0,0.18);
  `;
  popup.innerHTML = `
    <h2 style="margin:0 0 1rem;font-size:1.25rem;font-family:sans-serif;">
      Welcome Back</h2>
    <input id="nl-username" type="text" placeholder="Enter username"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <input id="nl-password" type="password" placeholder="Enter password"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <p id="nl-error" style="color:red;font-size:13px;margin:0 0 8px;
      font-family:sans-serif;min-height:18px;"></p>
    <button id="nl-submit"
      style="width:100%;padding:12px;background:#1473e6;color:white;
      border:none;border-radius:8px;font-size:15px;cursor:pointer;">
      Login
    </button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const submitBtn = popup.querySelector('#nl-submit');
  const doLogin = async () => {
    const username = popup.querySelector('#nl-username').value.trim();
    const password = popup.querySelector('#nl-password').value.trim();
    const errorEl = popup.querySelector('#nl-error');
    errorEl.textContent = '';

    if (!username || !password) {
      errorEl.textContent = 'Please enter both fields.';
      return;
    }
    submitBtn.textContent = 'Logging in…';
    submitBtn.disabled = true;

    try {
      const BASE_URL = window.location.hostname.includes('aem.live')
        ? '' : 'https://main--edsuedemo--pradeepdubeyepam.aem.page';
      const resp = await fetch(`${BASE_URL}/blocks/login/data.json`);
      const data = await resp.json();
      const user = data.users.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        localStorage.setItem('userSession', JSON.stringify({
          username: user.username,
          attributes: user.attributes,
        }));
        overlay.remove();
      } else {
        errorEl.textContent = 'Invalid username or password.';
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
      }
    } catch {
      errorEl.textContent = 'Something went wrong. Try again.';
      submitBtn.textContent = 'Login';
      submitBtn.disabled = false;
    }
  };

  submitBtn.addEventListener('click', doLogin);
  popup.querySelectorAll('input').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  });
}

// ── REACTIVE SESSION MONITORING ────────────────────────────
function onSessionChange() {
  const session = getSession();
  if (session) {
    showLoggedInUI(session.username);
    loadOffersOnPage(session.attributes);
  } else {
    removeOffers();
    showLoggedOutUI();
  }
}

let _lastKnownSession = localStorage.getItem('userSession');

window.addEventListener('storage', (e) => {
  if (e.key === 'userSession') onSessionChange();
});

const _originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function setItem(key, value) {
  _originalSetItem(key, value);
  if (key === 'userSession') onSessionChange();
};

const _originalRemoveItem = localStorage.removeItem.bind(localStorage);
localStorage.removeItem = function removeItem(key) {
  _originalRemoveItem(key);
  if (key === 'userSession') onSessionChange();
};

setInterval(() => {
  const current = localStorage.getItem('userSession');
  if (current !== _lastKnownSession) {
    _lastKnownSession = current;
    onSessionChange();
  }
}, 1000);

// ── DECORATE ───────────────────────────────────────────────
export default function decorate(block) {
  block.innerHTML = '';

  const btn = document.createElement('button');
  btn.id = 'nav-login-btn-trigger';
  btn.textContent = block.dataset.label || 'Login';
  btn.className = 'nav-login-btn';
  btn.addEventListener('click', showLoginPopup);
  block.appendChild(btn);

  // Restore session on page load
  const session = getSession();
  if (session) {
    showLoggedInUI(session.username);
    let attempts = 0;
    const tryLoad = setInterval(() => {
      attempts++;
      const hasFragment = document.querySelector('[data-offer-base]');
      if (hasFragment || attempts > 20) {
        clearInterval(tryLoad);
        loadOffersOnPage(session.attributes);
      }
    }, 100);
  }
}