import { readBlockConfig } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getTabSections(block) {
  return [...block.children].map((child) => {
    if (child.classList.contains('section')) {
      return child;
    }

    return child.querySelector(':scope > .section');
  }).filter(Boolean);
}

function getSectionMeta(section) {
  const sectionMeta = section.querySelector(':scope > .section-metadata, :scope > div > .section-metadata');
  if (!sectionMeta) {
    return {};
  }

  const meta = readBlockConfig(sectionMeta);
  sectionMeta.parentNode?.remove();
  return meta;
}

function parseSectionFields(section) {
  const fields = {};

  [...section.children].forEach((row) => {
    const attributedCell = row.querySelector('[data-aue-prop], [data-richtext-prop]');
    if (!attributedCell) {
      return;
    }

    const prop = attributedCell.getAttribute('data-aue-prop')
      || attributedCell.getAttribute('data-richtext-prop');

    if (prop && !fields[prop]) {
      fields[prop] = {
        row,
        cell: attributedCell,
      };
    }
  });

  return fields;
}

function activateTab(buttons, panels, activeIndex) {
  buttons.forEach((button, index) => {
    const isActive = index === activeIndex;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel, index) => {
    const isActive = index === activeIndex;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

export default function decorate(block) {
  const sections = getTabSections(block);

  if (!sections.length) {
    return;
  }

  const tabList = document.createElement('div');
  tabList.className = 'ram-tabs-list';
  tabList.setAttribute('role', 'tablist');

  const panelsWrapper = document.createElement('div');
  panelsWrapper.className = 'ram-tabs-panels';

  const uniqueId = `ram-tabs-${crypto.randomUUID?.() || Date.now()}`;
  const buttons = [];
  const panels = [];

  sections.forEach((section, index) => {
    const fields = parseSectionFields(section);
    const meta = getSectionMeta(section);
    const titleField = fields.title?.cell;
    const title = titleField?.textContent?.trim() || meta.title?.trim() || meta.name?.trim() || `Tab ${index + 1}`;
    const tabId = `${uniqueId}-tab-${index + 1}`;
    const panelId = `${uniqueId}-panel-${index + 1}`;

    const button = document.createElement('button');
    button.className = 'ram-tabs-button';
    button.type = 'button';
    button.id = tabId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panelId);
    button.setAttribute('aria-selected', 'false');
    button.tabIndex = -1;
    button.textContent = title;
    if (titleField) {
      moveInstrumentation(titleField, button);
      fields.title.row.remove();
    }

    section.classList.remove('section');
    section.classList.add('ram-tabs-panel');
    section.id = panelId;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', tabId);
    section.hidden = true;
    section.removeAttribute('data-section-status');
    section.style.display = '';

    button.addEventListener('click', () => activateTab(buttons, panels, index));
    button.addEventListener('keydown', (event) => {
      const keyToOffset = {
        ArrowRight: 1,
        ArrowLeft: -1,
        Home: 'start',
        End: 'end',
      };
      const next = keyToOffset[event.key];

      if (next === undefined) {
        return;
      }

      event.preventDefault();

      let nextIndex = index;
      if (next === 'start') {
        nextIndex = 0;
      } else if (next === 'end') {
        nextIndex = buttons.length - 1;
      } else {
        nextIndex = (index + next + buttons.length) % buttons.length;
      }

      activateTab(buttons, panels, nextIndex);
      buttons[nextIndex].focus();
    });

    buttons.push(button);
    panels.push(section);
    tabList.append(button);
    panelsWrapper.append(section);
  });

  block.replaceChildren(tabList, panelsWrapper);
  activateTab(buttons, panels, 0);
}
