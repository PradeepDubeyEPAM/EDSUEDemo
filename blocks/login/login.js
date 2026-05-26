/**
 * Login Block
 * Renders the login button in the nav.
 * Behaviour (popup, session, logged-in UI) is handled by header.js.
 * This block just creates the button with the correct id so header.js can find it.
 */
export default function decorate(block) {
  block.innerHTML = '';

  const btn = document.createElement('button');
  btn.id = 'nav-login-btn-trigger';
  btn.textContent = block.dataset.label || 'Login';
  btn.className = 'nav-login-btn';

  block.appendChild(btn);
}