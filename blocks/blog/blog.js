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
}
