function buildPathFromLanguagePath(targetLangPath) {
  if (!targetLangPath) return '#';

  const parts = targetLangPath.split('/');
  const country = parts[parts.length - 2];
  const language = parts[parts.length - 1];

  const newRoot = `/${country}/${language}`;

  const currentPath = window.location.pathname;
  const remainder = currentPath.replace(/^\/[a-z]{2}\/[a-z]{2}/i, '');

  return `${newRoot}${remainder}`;
}

export default async function decorate(block) {
  const response = await fetch('/site-config.json');
  if (!response.ok) return;

  const { data } = await response.json();
  if (!data?.length) return;

  const items = new Map(
    data
      .filter((row) => row.Language && row['Language Path'])
      .map((row) => [row.Language, row['Language Path']]),
  );

  if (!items.size) return;
  let activeLabel;

  const [first] = items.keys();

  const toggle = document.createElement('button');
  toggle.className = 'lang-toggle';
  toggle.type = 'button';

  const list = document.createElement('ul');
  const currentRoot = window.location.pathname.substring(0, 6);

  items.forEach((path, label) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const langRoot = `/${path.split('/').slice(-2).join('/')}`;

    a.href = buildPathFromLanguagePath(path);
    a.textContent = label;

    if (currentRoot === langRoot) {
      a.classList.add('active');
      activeLabel = label;
    }
    li.appendChild(a);
    list.appendChild(li);
  });
  toggle.textContent = activeLabel || first;
  block.replaceChildren(toggle, list);

  toggle.addEventListener('click', () => {
    block.classList.toggle('open');
  });
}
