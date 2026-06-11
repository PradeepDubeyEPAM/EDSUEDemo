const ALLIANCE_ACCORDION_ITEMS = [
  {
    id: 'ram-alliance-africa',
    title: 'Africa',
    columns: [
      { heading: 'Country', items: ['Sénégal', 'Kenya', 'Egypte'] },
      { heading: 'Code Airline', items: ['HC', 'KR', 'MS'] },
      { heading: 'Airline', items: ['Air Senegal', 'Kenya Airways', 'Egyptair'] },
    ],
  },
  {
    id: 'ram-alliance-north-america',
    title: 'Amérique du Nord',
    columns: [
      { heading: 'Pays', items: ['États-Unis', 'États-Unis'] },
      { heading: 'Code Compagnie aérienne', items: ['AA', 'B6'] },
      { heading: 'Compagnie aérienne', items: ['American Airlines', 'JetBlue'] },
    ],
  },
  {
    id: 'ram-alliance-south-america',
    title: 'Amérique du Sud',
    columns: [
      { heading: 'Pays', items: ['Brésil'] },
      { heading: 'Code Compagnie aérienne', items: ['G3'] },
      { heading: 'Compagnie aérienne', items: ['Gol'] },
    ],
  },
  {
    id: 'ram-alliance-europe',
    title: 'Europe',
    columns: [
      { heading: 'Pays', items: ['Royaume-Uni', 'Espagne', 'Italie'] },
      { heading: 'Code Compagnie aérienne', items: ['BA', 'IB', 'AZ'] },
      { heading: 'Compagnie aérienne', items: ['British Airways', 'Iberia', 'ITA Airways'] },
    ],
  },
];

function buildList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function buildColumns(columns) {
  return columns
    .map((column) => `
      <td>
        ${column.heading ? `<span class="coltitle">${column.heading}</span>` : ''}
        ${buildList(column.items)}
      </td>
    `)
    .join('');
}

function buildAccordionItem(item) {
  return `
    <article class="ram-alliance-accordion-item" data-accordion-item>
      <h3 class="ram-alliance-accordion-header">
        <button class="ram-alliance-accordion-trigger" type="button" aria-expanded="false" aria-controls="${item.id}" data-accordion-trigger>
          ${item.title}
        </button>
      </h3>
      <div id="${item.id}" class="ram-alliance-accordion-panel" aria-hidden="true" data-accordion-panel>
        <div class="ram-alliance-accordion-table-wrap">
          <table>
            <tbody>
              <tr>
                ${buildColumns(item.columns)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
  `;
}

export default function decorate(block) {
  block.innerHTML = `
    <section class="ram-alliance-accordion" aria-label="Alliance partnerships accordion">
      ${ALLIANCE_ACCORDION_ITEMS.map((item) => buildAccordionItem(item)).join('')}
    </section>
  `;

  const triggers = block.querySelectorAll('[data-accordion-trigger]');
  const panels = block.querySelectorAll('[data-accordion-panel]');

  panels.forEach((panel) => {
    panel.style.maxHeight = '0px';
    panel.setAttribute('aria-hidden', 'true');
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('[data-accordion-item]');
      const panel = item?.querySelector('[data-accordion-panel]');
      if (!panel) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        if (panel.style.maxHeight === 'none') {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
        requestAnimationFrame(() => {
          panel.style.maxHeight = '0px';
        });
        panel.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-open');
        return;
      }

      panel.style.maxHeight = '0px';
      panel.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      item.classList.add('is-open');

      requestAnimationFrame(() => {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      });

      const onTransitionEnd = (event) => {
        if (event.propertyName !== 'max-height') return;
        if (trigger.getAttribute('aria-expanded') === 'true') {
          panel.style.maxHeight = 'none';
        }
        panel.removeEventListener('transitionend', onTransitionEnd);
      };

      panel.addEventListener('transitionend', onTransitionEnd);
    });
  });
}
