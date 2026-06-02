const DOMESTIC_NETWORK = [
  'Agadir',
  'Al Hoceima',
  'Casablanca',
  'Dakhla',
  'Errachidia',
  'Fez',
  'Guelmim',
  'Laayoune',
  'Marrakech',
  'Nador',
  'Ouarzazate',
  'Oujda',
  'Rabat',
  'Semara',
  'Tan Tan',
  'Tangier',
  'Tetouan',
  'Zagora',
];

const WORLD_NETWORK = [
  {
    heading: 'Europe',
    items: [
      'Amsterdam', 'Alicante', 'Barcelona', 'Bilbao', 'Bologna', 'Bordeaux', 'Bruxelles', 'Catania',
      'Frankfurt', 'Geneva', 'Istanbul', 'Las Palmas', 'Lille', 'Lisbon', 'London', 'Lyon', 'Madrid',
      'Malaga', 'Manchester', 'Marseille', 'Milan', 'Montpellier', 'Moscow', 'Munich', 'Nantes',
      'Naples', 'Nice', 'Paris', 'Porto', 'Rome', 'Saint-Petersburg', 'Seville', 'Strasbourg',
      'Tenerife', 'Toulouse', 'Turin', 'Valencia', 'Venice', 'Verona', 'Zurich',
    ],
  },
  {
    heading: 'Africa',
    items: [
      'Abidjan', 'Abuja', 'Accra', 'Algiers', 'Bamako', 'Bangui', 'Banjul', 'Bissau', 'Brazzaville',
      'Conakry', 'Cotonou', 'Dakar', 'Douala', 'Freetown', 'Kinshasa', 'Lagos', 'Cairo', 'Libreville',
      'Lome', 'Luanda', 'Malabo', 'Monrovia', 'Niamey', "N'Djamena", 'Nouakchott', 'Ouagadougou',
      'Praia', 'Pointe-Noire', 'Sal', 'Tripoli', 'Tunis', 'Yaounde',
    ],
  },
  {
    heading: 'Middle East & Asia',
    items: ['Beirut', 'Doha', 'Dubai', 'Jeddah', 'Medina', 'Beijing', 'Ryadh', 'Tel Aviv'],
  },
  {
    heading: 'North America',
    items: ['Los Angeles', 'Miami', 'Montreal', 'New York', 'Toronto', 'Washington'],
  },
  {
    heading: 'South America',
    items: ['Sao Paulo'],
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

function buildAccordionItem(id, title, columns) {
  return `
    <article class="ram-network-accordion-item" data-accordion-item>
      <h3 class="ram-network-accordion-header">
        <button class="ram-network-accordion-trigger" type="button" aria-expanded="false" aria-controls="${id}" data-accordion-trigger>
          ${title}
        </button>
      </h3>
      <div id="${id}" class="ram-network-accordion-panel" aria-hidden="true" data-accordion-panel>
        <div class="ram-network-accordion-table-wrap">
          <table>
            <tbody>
              <tr>
                ${buildColumns(columns)}
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
    <section class="ram-network-accordion" aria-label="Our network accordion">
      ${buildAccordionItem('ram-network-domestic', 'Domestic network', [{ heading: '', items: DOMESTIC_NETWORK }])}
      ${buildAccordionItem('ram-network-world', 'Royal Air Maroc around the world', WORLD_NETWORK)}
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
