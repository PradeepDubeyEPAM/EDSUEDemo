export default async function decorate(block) {
  const session = getSession();
 
  if (session) {
    await renderLoggedIn(block, session);
  } else {
    renderLoginForm(block);
  }
}
 
//LOGIN FORM
function renderLoginForm(block) {
  block.innerHTML = '';
 
  const form = document.createElement('div');
 
  const username = document.createElement('input');
  username.placeholder = 'Username';
 
  const password = document.createElement('input');
  password.placeholder = 'Password';
  password.type = 'password';
 
  const button = document.createElement('button');
  button.innerText = 'Login';
 
  const error = document.createElement('p');
  error.className = 'error';
 
  button.addEventListener('click', async () => {
    const data = await fetchData();
 
    const user = data.users[username.value];

    if (!username.value || !password.value) {
      error.innerText = 'Please enter username and password';
     return;
    }
      button.innerText = 'Logging in...';
       button.disabled = true;
 
    if (user && user.password === password.value) {
      const session = {
        username: username.value,
        region: user.region
      };
 
      localStorage.setItem('userSession', JSON.stringify(session));
 
      await renderLoggedIn(block, session);
    } else {
      error.innerText = 'Invalid credentials ';
    }
  });
 
  form.append(username, password, button, error);
  block.appendChild(form);
}
 
// LOGGED IN VIEW
async function renderLoggedIn(block, session) {
  block.innerHTML = '';
 
  const welcome = document.createElement('h3');
  welcome.innerText = `Welcome ${session.username} `;
 
  const regionText = document.createElement('p');
  regionText.innerText = `Region: ${session.region}`;
 
  const data = await fetchData();
  const offers = getOffers(data, session.region);
 
  const logout = document.createElement('button');
  logout.innerText = 'Logout';
 
  logout.addEventListener('click', () => {
    localStorage.removeItem('userSession');
    renderLoginForm(block);
  });
 
  block.append(welcome, regionText, offers, logout);
}
 
// OFFERS
function getOffers(data, region) {
  const container = document.createElement('div');
  container.className = 'offers';
 
  const regionOffers = data.offers[region] || [];
 
  regionOffers.forEach((offer) => {
    const p = document.createElement('p');
    p.innerText = offer;
    container.appendChild(p);
  });
 
  return container;
}
 
//  FETCH JSON
async function fetchData() {
  const resp = await fetch('/blocks/login/login.json');
  return resp.json();
}
 

function getSession() {
  const data = localStorage.getItem('userSession');
  return data ? JSON.parse(data) : null;
}
 