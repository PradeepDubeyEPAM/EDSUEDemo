export default function decorate(block) {
  const buttonTextDiv = block.querySelector('div:nth-child(1)');
  const buttonLinkDiv = block.querySelector('div:nth-child(2) > div:nth-child(2) > a');

  if (!buttonTextDiv || !buttonLinkDiv) return;

  const buttonText = buttonTextDiv.textContent.trim();
  const buttonHref = buttonLinkDiv.href;

  block.innerHTML = '';

  const button = document.createElement('a');
  button.href = buttonHref;
  button.className = 'button-element';
  button.textContent = buttonText;

  const LINK_CLICK_EVENT_NAME = 'link_click';
  button.addEventListener('click', () => {
    // datalayer push event
    const dataLayerObject = {
      event: LINK_CLICK_EVENT_NAME,
      details: {
        block_type: 'button-click',
        card_title: buttonText,
        url: buttonHref,
        cta_text: buttonText,
      },
    };

    if (window.digitalDataLayer && typeof window.digitalDataLayer.push === 'function') {
      window.digitalDataLayer.push(dataLayerObject);
    }
  });

  block.append(button);
}
