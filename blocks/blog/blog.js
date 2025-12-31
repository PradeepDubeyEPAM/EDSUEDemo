export default function decorate(block) {
  const [imageWrapper, textWrapper, quoteWrapper] = block.children;

  // Create and insert the image if an image URL exists
  if (imageWrapper && imageWrapper.textContent.trim()) {
    const img = document.createElement('img');
    img.src = imageWrapper.textContent.trim();
    img.alt = 'Blog Image';
    imageWrapper.replaceChildren(img);
  }

  // Wrap the text in a blockquote
  if (textWrapper) {
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = textWrapper.textContent.trim();
    textWrapper.replaceChildren(blockquote);
  }

  if (quoteWrapper) {
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = quoteWrapper.textContent.trim();
    quoteWrapper.replaceChildren(blockquote);
  }
}
