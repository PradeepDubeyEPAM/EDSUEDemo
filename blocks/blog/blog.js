export default function decorate(block) {
  // Convert each row into a blog post
  const posts = document.createElement('div');
  posts.className = 'blog-posts';
  [...block.children].forEach((row) => {
    const post = document.createElement('article');
    post.className = 'blog-post';
    // Assuming columns: title | author | date | content
    const [title, author, date, content] = [...row.children];
    if (title) {
      const h1 = document.createElement('h1');
      h1.textContent = title.textContent;
      post.appendChild(h1);
    }
    if (author || date) {
      const meta = document.createElement('p');
      meta.className = 'blog-meta';
      meta.textContent = `By ${author?.textContent || ''} on ${
        date?.textContent || ''
      }`;
      post.appendChild(meta);
    }
    if (content) {
      const div = document.createElement('div');
      div.className = 'blog-content';
      div.innerHTML = content.innerHTML;
      post.appendChild(div);
    }
    posts.appendChild(post);
  });

  block.replaceChildren(posts);
}
