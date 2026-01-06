export default function decorate(block) {
  const [imageWrapper, headerWrapper, descriptionWrapper] = block.children;

  // Create and insert the image if an image URL exists
  if (imageWrapper && imageWrapper.textContent.trim()) {
    const img = document.createElement('img');
    img.src = imageWrapper.textContent.trim();
    img.alt = 'Blog Image';
    img.classList.add('blog-image');
    imageWrapper.replaceChildren(img);
  }

  // Wrap the header in an h2
  if (headerWrapper) {
    const h2 = document.createElement('h2');
    h2.textContent = headerWrapper.textContent.trim();
    headerWrapper.replaceChildren(h2);
  }

  // Wrap the description in a p
  if (descriptionWrapper) {
    const p = document.createElement('p');
    p.textContent = descriptionWrapper.textContent.trim();
    descriptionWrapper.replaceChildren(p);
  }

  // Add position selector for authoring
  const positionSelector = document.createElement('select');
  positionSelector.classList.add('blog-position-selector');
  positionSelector.innerHTML = `
    <option value="top">Image Top</option>
    <option value="left">Image Left</option>
    <option value="right">Image Right</option>
    <option value="bottom">Image Bottom</option>
  `;

  // Set default position
  block.setAttribute('data-position', 'top');

  // Add event listener to change position
  positionSelector.addEventListener('change', (e) => {
    block.setAttribute('data-position', e.target.value);
  });

  // Insert selector at the top for authoring
  block.insertBefore(positionSelector, block.firstChild);
}
