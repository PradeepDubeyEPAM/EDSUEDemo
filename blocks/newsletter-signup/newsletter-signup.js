export default function decorate(block) {
  const rows = [...block.children];
  const cells0 = [...(rows[0]?.children || [])];
  const heading = cells0[0]?.textContent?.trim() || 'Stay in the Loop';
  const description = cells0[1]?.textContent?.trim()
    || 'Subscribe for exclusive deals and travel updates.';

  block.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'newsletter-signup-inner';

  const textBlock = document.createElement('div');
  textBlock.className = 'newsletter-signup-text';

  const h2 = document.createElement('h2');
  h2.textContent = heading;

  const p = document.createElement('p');
  p.textContent = description;

  textBlock.append(h2, p);

  const form = document.createElement('form');
  form.className = 'newsletter-signup-form';
  form.setAttribute('novalidate', '');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const msg = form.querySelector('.newsletter-signup-msg');
    if (!emailInput.value || !emailInput.validity.valid) {
      emailInput.setAttribute('aria-invalid', 'true');
      return;
    }
    emailInput.setAttribute('aria-invalid', 'false');
    msg.textContent = 'Thank you for subscribing!';
    msg.hidden = false;
    emailInput.value = '';
  });

  const emailWrap = document.createElement('div');
  emailWrap.className = 'newsletter-signup-row';

  const label = document.createElement('label');
  label.htmlFor = 'newsletter-email';
  label.className = 'sr-only';
  label.textContent = 'Email Address';

  const input = document.createElement('input');
  input.type = 'email';
  input.id = 'newsletter-email';
  input.placeholder = 'Your email address';
  input.required = true;
  input.autocomplete = 'email';

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.textContent = 'Subscribe';

  emailWrap.append(label, input, btn);

  const msg = document.createElement('p');
  msg.className = 'newsletter-signup-msg';
  msg.hidden = true;

  form.append(emailWrap, msg);
  inner.append(textBlock, form);
  block.append(inner);
}
