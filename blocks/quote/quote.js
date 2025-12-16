// export default function decorate(block) {
//     // 
//     const inputData = document.createElement('div');
//     inputData.className = 'user-data';
   
//     [...block.children].forEach((row) => {
//       const post = document.createElement('input');
//       post.className = 'user-input';
   
//       // Assuming columns: title | author | date | content
//       const [title, author, date, content] = [...row.children];
   
//       if (title) {
//         const h1 = document.createElement('h1');
//         h1.textContent = title.textContent;
//         post.appendChild(h1);
//       }
//       if (author || date) {
//         const meta = document.createElement('p');
//         meta.className = 'blog-meta';
//         meta.textContent = `By ${author?.textContent || ''} on ${date?.textContent || ''}`;
//         post.appendChild(meta);
//       }
//       if (content) {
//         const div = document.createElement('div');
//         div.className = 'blog-content';
//         div.innerHTML = content.innerHTML;
//         post.appendChild(div);
//       }
   
//       inputData.appendChild(post);
//     });
   
//     block.replaceChildren(inputData);
    
//   }
export default function decorate(block) {
  const [quoteWrapper] = block.children;

  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren(blockquote);
}

