const TAB_DATA = [
  {
    id: 'world',
    label: 'Royal Air Maroc around the world',
    heading: 'Royal Air Maroc around the world',
    description: 'RAM has flights from Casablanca to the following destinations: Montreal, New York, Washington, Miami, Sao Paulo, Europe and Africa.',
  },
  {
    id: 'domestic',
    label: 'Domestic network',
    heading: 'Domestic network',
    description: 'RAM connects all main cities of Morocco.',
  },
];

function getTabLabel(tabId) {
  return TAB_DATA.find((tab) => tab.id === tabId)?.label || TAB_DATA[0].label;
}

function renderTabs(activeId) {
  const tabsMarkup = TAB_DATA.map((tab) => [
    '<button',
    '  type="button"',
    `  class="ram-tab-button${tab.id === activeId ? ' is-active' : ''}"`,
    '  role="tab"',
    `  id="ram-tab-${tab.id}"`,
    `  aria-selected="${tab.id === activeId}"`,
    `  aria-controls="ram-tab-panel-${tab.id}"`,
    `  data-tab-target="${tab.id}"`,
    `  tabindex="${tab.id === activeId ? '0' : '-1'}"`,
    '>',
    `  <span>${tab.label}</span>`,
    '</button>',
  ].join('\n')).join('');

  const panelsMarkup = TAB_DATA.map((tab) => [
    '<section',
    `  class="ram-tab-panel${tab.id === activeId ? ' is-active' : ''}"`,
    '  role="tabpanel"',
    `  id="ram-tab-panel-${tab.id}"`,
    `  aria-labelledby="ram-tab-${tab.id}"`,
    `  ${tab.id === activeId ? '' : 'hidden'}`,
    '>',
    `  <p class="ram-tab-panel-copy">${tab.description}</p>`,
    '</section>',
  ].join('\n')).join('');

  return [
    '<div class="ram-tab-component-shell">',
    '  <div class="ram-tab-selector">',
    '    <button',
    '      type="button"',
    '      class="ram-tab-mobile-trigger"',
    '      aria-expanded="false"',
    '      aria-haspopup="true"',
    '      aria-label="Select destination tab"',
    '    >',
    `      <span class="ram-tab-mobile-value">${getTabLabel(activeId)}</span>`,
    '      <span class="ram-tab-mobile-icon" aria-hidden="true"></span>',
    '    </button>',
    '    <div class="ram-tab-list-wrapper">',
    '      <div class="ram-tab-list" role="tablist" aria-label="Royal Air Maroc destinations">',
    `        ${tabsMarkup}`,
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="ram-tab-panels">',
    `    ${panelsMarkup}`,
    '  </div>',
    '</div>',
  ].join('\n');
}

function setMobileMenuState(block, isOpen) {
  block.classList.toggle('is-mobile-open', isOpen);
  const trigger = block.querySelector('.ram-tab-mobile-trigger');
  if (trigger) {
    trigger.setAttribute('aria-expanded', String(isOpen));
  }
}

function syncMobileValue(block, tabId) {
  const value = block.querySelector('.ram-tab-mobile-value');
  if (value) {
    value.textContent = getTabLabel(tabId);
  }
}

function activateTab(block, nextId) {
  block.querySelectorAll('[data-tab-target]').forEach((button) => {
    const isActive = button.dataset.tabTarget === nextId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  block.querySelectorAll('.ram-tab-panel').forEach((panel) => {
    const isActive = panel.id === `ram-tab-panel-${nextId}`;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });

  syncMobileValue(block, nextId);
  setMobileMenuState(block, false);
}

export default function decorate(block) {
	block.classList.add('ram-tab-component');

  const defaultTab = TAB_DATA[0].id;
  block.innerHTML = renderTabs(defaultTab);

  block.addEventListener('click', (event) => {
    const mobileTrigger = event.target.closest('.ram-tab-mobile-trigger');
    if (mobileTrigger && block.contains(mobileTrigger)) {
      setMobileMenuState(block, !block.classList.contains('is-mobile-open'));
      return;
    }

    const button = event.target.closest('[data-tab-target]');
    if (!button || !block.contains(button)) return;
    activateTab(block, button.dataset.tabTarget);
  });

  document.addEventListener('click', (event) => {
    if (!block.contains(event.target)) {
      setMobileMenuState(block, false);
    }
  });
}
