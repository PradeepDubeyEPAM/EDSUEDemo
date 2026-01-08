export default function decorate(block) {
  if (!block.classList.contains('custom-button')) return;

  const buttons = block.querySelectorAll('.button.secondary');

 window.adobeDataLayer = window.adobeDataLayer || [];
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      window.adobeDataLayer.push({
        event: 'custom_button_click',
        eventInfo: {
          block_type: 'custom-button',
          url: button.href,
          cta_text: button.textContent.trim(),
          position: index + 1,
        },
      });
    });
  });
}
