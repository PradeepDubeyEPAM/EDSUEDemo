
const BASE_URL = window.location.hostname.includes('aem.live')
  ? ''
  : 'https://main--edsuedemo--pradeepdubeyepam.aem.page';


const OFFER_PATHS = {
  uk:  '/language-masters/en/offers/uk',
  us:  '/language-masters/en/offers/us',
  aus: '/language-masters/en/offers/aus',
};


export default async function decorate(block) {
  // Read UE authored fields
  const cells = [...block.children];
  const authored = {};
  cells.forEach((row) => {
    const [key, val] = [...row.children];
    if (key && val) authored[key.textContent.trim()] = val.textContent.trim();
  });
  block.innerHTML = '';

  // Render login form
  renderLoginForm(block, authored);

  const existingSession = getSession();
  if (existingSession) {
    showOffersOverlay(existingSession);
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'userSession') {
      if (e.newValue) {
        const session = JSON.parse(e.newValue);
        showOffersOverlay(session);
      } else {
        // Session cleared — remove overlay if open
        closeOverlay();
      }
    }
  });
}



function getSession() {
  try {
    const data = localStorage.getItem('userSession');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    // Malformed JSON in localStorage — clear it and return null
    localStorage.removeItem('userSession');
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem('userSession', JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem('userSession');
}


// 

async function fetchUserData() {
  const resp = await fetch(`${BASE_URL}/blocks/login/data.json`);
  if (!resp.ok) throw new Error('Failed to load user data');
  return resp.json();
}



async function fetchOfferPage(country) {
  const path = OFFER_PATHS[country];
  if (!path) return null;

  try {
    const resp = await fetch(`${BASE_URL}${path}.plain.html`);
    if (!resp.ok) return null;
    return resp.text();
  } catch (e) {
    
    return null;
  }
}

// LOGIN FOR


function renderLoginForm(block, authored = {}) {
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'login-wrapper';

  const title = document.createElement('h2');
  title.className = 'login-title';
  title.textContent = authored.heading || 'Welcome Back';

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.className = 'login-input';
  usernameInput.placeholder = authored.usernamePlaceholder || 'Enter username';
  usernameInput.setAttribute('aria-label', 'Username');

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.className = 'login-input';
  passwordInput.placeholder = authored.passwordPlaceholder || 'Enter password';
  passwordInput.setAttribute('aria-label', 'Password');

  const error = document.createElement('p');
  error.className = 'login-error';
  error.setAttribute('role', 'alert');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'login-btn';
  button.textContent = authored.buttonText || 'Login';

  const forgot = document.createElement('a');
  forgot.href = '#';
  forgot.className = 'login-forgot';
  forgot.textContent = authored.forgotPasswordText || 'Forgot password?';

  // Login handler
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
      const data = await fetchUserData();
      const user = data.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        const session = { username: user.username, country: user.country };
        saveSession(session);
        await showOffersOverlay(session);
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

  [usernameInput, passwordInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') button.click();
    });
  });

  wrapper.append(title, usernameInput, passwordInput, error, button, forgot);
  block.appendChild(wrapper);
}



async function showOffersOverlay(session) {
  
  closeOverlay();

  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.id = 'login-overlay';

  const popup = document.createElement('div');
  popup.className = 'login-popup';

  
  const welcome = document.createElement('h2');
  welcome.className = 'login-popup-welcome';
  welcome.textContent = `Welcome, ${capitalize(session.username)}!`;

  const locale = document.createElement('p');
  locale.className = 'login-popup-locale';
  locale.textContent = `📍 ${countryLabel(session.country)}`;

  
  const offersContainer = document.createElement('div');
  offersContainer.className = 'login-popup-offers';
  offersContainer.innerHTML = '<p>Loading offers...</p>';

 
  const closeBtn = document.createElement('button');
  closeBtn.className = 'login-popup-close';
  closeBtn.textContent = '✕ Close';
  closeBtn.addEventListener('click', () => {
    closeOverlay();
    clearSession();
  });


  const viewBtn = document.createElement('button');
  viewBtn.className = 'login-btn login-popup-view';
  viewBtn.textContent = 'View All Offers →';
  viewBtn.addEventListener('click', () => {
    const path = OFFER_PATHS[session.country];
    if (path) window.location.href = `${BASE_URL}${path}`;
  });

  popup.append(welcome, locale, offersContainer, viewBtn, closeBtn);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);


  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay();
      clearSession();
    }
  });

  
 


  offersContainer.innerHTML = buildFallbackOffers(session.country);
}


const FALLBACK_OFFERS = {
  uk: [
    'Black Friday Sale – Up to 60% off on all UK orders!',
    'Free delivery on orders over £30 this weekend only!',
    'Buy 2 Get 1 Free on selected items – UK Exclusive!',
  ],
  us: [
    'Black Friday Mega Deal – Save up to 70% sitewide!',
    'Free shipping on all US orders over $25 today only!',
    'Cyber Monday Early Access – Extra 15% off with code CYBER15!',
  ],
  aus: [
    'Black Friday Sale – Up to 50% off across all categories!',
    'Free express shipping on orders over $40 – Australia wide!',
    'Summer Sale Special – Buy More Save More this November!',
  ],
};

function buildFallbackOffers(country) {
  const offers = FALLBACK_OFFERS[country];
  if (!offers || offers.length === 0) {
    return `<p>Special offers available for ${countryLabel(country)}!</p>
            <p>Click "View All Offers" to see your personalised deals.</p>`;
  }
  const items = offers.map((o) => `<li>${o}</li>`).join('');
  return `<ul class="login-offers-list">${items}</ul>`;
}

function closeOverlay() {
  const existing = document.getElementById('login-overlay');
  if (existing) existing.remove();
}



function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function countryLabel(code) {
  const map = {
    uk:  'United Kingdom',
    us:  'United States',
    aus: ' Australia',
  };
  return map[code] || code.toUpperCase();
}
