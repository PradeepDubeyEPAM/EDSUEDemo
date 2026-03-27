export default async function decorate(block) {
  // Read placeholder/label overrides authored in Universal Editor
  const cells = [...block.children];
  const authored = {};
  cells.forEach((row) => {
    const [key, val] = [...row.children];
    if (key && val) {
      authored[key.textContent.trim()] = val.textContent.trim();
    }
  });

  
  block.innerHTML = '';

  const session = getSession();
  if (session) {
    await renderLoggedIn(block, session);
  } else {
    renderLoginForm(block, authored);
  }
}

// ─────────────────────────────────────────────
// SESSION HELPERS
// ─────────────────────────────────────────────

function getSession() {
  const data = localStorage.getItem('userSession');
  return data ? JSON.parse(data) : null;
}

function saveSession(session) {
  localStorage.setItem('userSession', JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem('userSession');
}


// FETCH DATA (login.json lives next to login.js)


async function fetchData() {
  const resp = await fetch('/blocks/login/login.json');
  if (!resp.ok) throw new Error('Failed to load login data');
  return resp.json();
}



function renderLoginForm(block, authored = {}) {
  block.innerHTML = '';

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'login-wrapper';

  // Title
  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = 'Welcome Back';
  wrapper.appendChild(title);

  // Username input
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.className = 'login-input';
  usernameInput.placeholder = authored.usernamePlaceholder || 'Enter username';
  usernameInput.setAttribute('aria-label', 'Username');
  usernameInput.id = 'login-username';

  // Password input
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.className = 'login-input';
  passwordInput.placeholder = authored.passwordPlaceholder || 'Enter password';
  passwordInput.setAttribute('aria-label', 'Password');
  passwordInput.id = 'login-password';

  // Error message
  const error = document.createElement('p');
  error.className = 'login-error';
  error.setAttribute('role', 'alert');

  // Submit button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'login-btn';
  button.textContent = authored.buttonText || 'Login';

  // Forgot password link
  const forgot = document.createElement('a');
  forgot.href = '#';
  forgot.className = 'login-forgot';
  forgot.textContent = authored.forgotPasswordText || 'Forgot password?';

  // ── Login handler ──
  button.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    error.textContent = '';

    if (!username || !password) {
      error.textContent = 'Please enter both username and password.';
      return;
    }

    button.textContent = 'Logging in…';
    button.disabled = true;

    try {
      const data = await fetchData();
      const user = data.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        const session = { username: user.username, country: user.country };
        saveSession(session);
        await renderLoggedIn(block, session);
      } else {
        error.textContent = 'Invalid username or password. Please try again.';
        button.textContent = authored.buttonText || 'Login';
        button.disabled = false;
      }
    } catch (err) {
      error.textContent = 'Something went wrong. Please try again later.';
      button.textContent = authored.buttonText || 'Login';
      button.disabled = false;
    }
  });

  // Allow Enter key to submit
  [usernameInput, passwordInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') button.click();
    });
  });

  wrapper.append(usernameInput, passwordInput, error, button, forgot);
  block.appendChild(wrapper);
}


// LOGGED IN VIEW


async function renderLoggedIn(block, session) {
  block.innerHTML = '';

  let data;
  try {
    data = await fetchData();
  } catch {
    block.textContent = 'Failed to load offers. Please refresh.';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'login-wrapper login-loggedin';

  // Welcome heading
  const welcome = document.createElement('h2');
  welcome.className = 'login-welcome';
  welcome.textContent = `Welcome, ${capitalize(session.username)}! 👋`;

  // Country / locale badge
  const locale = document.createElement('p');
  locale.className = 'login-locale';
  locale.textContent = ` Region: ${countryLabel(session.country)}`;

  // Offers section
  const offersHeading = document.createElement('h3');
  offersHeading.className = 'login-offers-heading';
  offersHeading.textContent = ' Exclusive Offers For You';

  const offersList = document.createElement('ul');
  offersList.className = 'login-offers-list';

  const regionOffers = data.offers[session.country] || [];
  if (regionOffers.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No offers available for your region right now.';
    offersList.appendChild(li);
  } else {
    regionOffers.forEach((offer) => {
      const li = document.createElement('li');
      li.className = 'login-offer-item';
      li.textContent = offer;
      offersList.appendChild(li);
    });
  }

  // Logout button
  const logout = document.createElement('button');
  logout.type = 'button';
  logout.className = 'login-btn login-logout-btn';
  logout.textContent = 'Logout';

  logout.addEventListener('click', () => {
    clearSession();
    renderLoginForm(block);
  });

  wrapper.append(welcome, locale, offersHeading, offersList, logout);
  block.appendChild(wrapper);
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function countryLabel(code) {
  const map = { uk: '🇬🇧 United Kingdom', us: '🇺🇸 United States', aus: '🇦🇺 Australia' };
  return map[code] || code.toUpperCase();
}