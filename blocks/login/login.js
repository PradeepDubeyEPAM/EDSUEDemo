// ── SESSION HELPERS ────────────────────────────────────────

function getSession() {
  try {
    const d = localStorage.getItem('userSession');
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}

function saveSession(username, attributes) {
  localStorage.setItem('userSession', JSON.stringify({ username, attributes }));
}

function clearSession() {
  localStorage.removeItem('userSession');
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
    <h2 style="margin:0 0 1rem;font-size:1.25rem;font-family:sans-serif;">Welcome Back</h2>
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
      border:none;border-radius:8px;font-size:15px;cursor:pointer;font-family:sans-serif;">
      Login
    </button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const submitBtn = popup.querySelector('#nl-submit');

  const doLogin = async () => {
    const username = popup.querySelector('#nl-username').value.trim();
    const password = popup.querySelector('#nl-password').value.trim();
    const errorEl  = popup.querySelector('#nl-error');
    errorEl.textContent = '';

    if (!username || !password) {
      errorEl.textContent = 'Please enter both fields.';
      return;
    }

    submitBtn.textContent = 'Logging in…';
    submitBtn.disabled = true;

    try {
      const BASE_URL = window.location.hostname.includes('aem.live')
        ? ''
        : 'https://main--edsuedemo--pradeepdubeyepam.aem.page';

      const resp = await fetch(`${BASE_URL}/blocks/login/data.json`);
      const data = await resp.json();
      const user = data.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        saveSession(user.username, user.attributes);

        // tell header to update UI
        window.dispatchEvent(new CustomEvent('user:login', {
          detail: { username: user.username, attributes: user.attributes },
        }));

        // tell offers block to load offers
        window.dispatchEvent(new CustomEvent('user:login', {
          detail: { username: user.username, attributes: user.attributes },
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
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  });
}

// ── MAIN DECORATE ──────────────────────────────────────────

export default function decorate() {
  // listen for header telling us to open the popup
  window.addEventListener('login:open', () => {
    showLoginPopup();
  });

  // listen for logout event fired by header logout button
  window.addEventListener('user:logout', () => {
    clearSession();
  });

  // if already logged in on page load, fire login event
  // so header and offers both restore their state
  const session = getSession();
  if (session) {
    window.dispatchEvent(new CustomEvent('user:login', {
      detail: { username: session.username, attributes: session.attributes },
    }));
  }
}