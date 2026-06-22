async function sendMessageToGroq(userMessage, products) {
  try {
    const endpoint = 'http://localhost:9080/api/v1/web/api-mesh-proxy/groq-chat';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: userMessage,
        products: products || [], 
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      // eslint-disable-next-line no-console
      console.error('Groq action returned an error:', data.error);
      return 'Sorry, the chatbot service hit an error. Please try again.';
    }

    return data.answer || 'Sorry, I could not process your message.';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Groq API error:', error);
    return 'Error connecting to the chatbot service. Please try again.';
  }
}

/**
 * Reads product/offer info from the page DOM so the chatbot has real
 * context instead of hallucinating generic retail copy.
 * Called once per chat session (on first panel open) and cached.
 */
function getPageContext() {
  const products = [];

  // Adjust these selectors to match your actual EDS block markup.
  // Default EDS "cards" block markup uses .cards-card-body for the text wrapper.
  // Add any other block classes your offer/product cards actually use.
  const cardSelectors = [
    '.cards-card-body',
    '.offers-card-body',
    '.offer-card',
  ];

  const cards = document.querySelectorAll(cardSelectors.join(', '));

  cards.forEach((card) => {
    const titleEl = card.querySelector('h1, h2, h3, h4, h5, strong');
    const descEl = card.querySelector('p');

    const title = titleEl?.textContent?.trim();
    const description = descEl?.textContent?.trim();

    if (title) {
      products.push({ title, description: description || '' });
    }
  });

  // eslint-disable-next-line no-console
  console.log('[chatbot] page context collected:', products);

  return products;
}

function createChatbotUI() {
  const container = document.createElement('div');
  container.className = 'chatbot-widget-container';

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'chatbot-toggle';
  toggleBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  // Chat window
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window hidden';

  const header = document.createElement('div');
  header.className = 'chatbot-header';
  header.innerHTML = `
    <h3>Chat Assistant</h3>
    <button class="chatbot-close" aria-label="Close chat">×</button>
  `;

  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chatbot-messages';

  const inputContainer = document.createElement('div');
  inputContainer.className = 'chatbot-input-container';

  const textarea = document.createElement('textarea');
  textarea.className = 'chatbot-input';
  textarea.placeholder = 'Type your message...';
  textarea.rows = '1';

  const sendBtn = document.createElement('button');
  sendBtn.className = 'chatbot-send';
  sendBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  `;

  inputContainer.appendChild(textarea);
  inputContainer.appendChild(sendBtn);

  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputContainer);

  container.appendChild(toggleBtn);
  container.appendChild(chatWindow);

  return {
    container,
    toggleBtn,
    chatWindow,
    messagesContainer,
    textarea,
    sendBtn,
    header,
  };
}

function addMessage(container, message, sender) {
  const messageEl = document.createElement('div');
  messageEl.className = `chatbot-message ${sender}`;

  const content = document.createElement('div');
  content.className = 'chatbot-message-content';
  content.textContent = message;

  messageEl.appendChild(content);
  container.appendChild(messageEl);

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function showLoadingIndicator(container) {
  const messageEl = document.createElement('div');
  messageEl.className = 'chatbot-message bot loading';

  const dots = document.createElement('div');
  dots.className = 'chatbot-typing-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';

  messageEl.appendChild(dots);
  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;

  return messageEl;
}

export default function decorate(block) {
  if (!block.classList.contains('chatbot')) return;

  const ui = createChatbotUI();
  block.appendChild(ui.container);

  const {
    toggleBtn,
    chatWindow,
    messagesContainer,
    textarea,
    sendBtn,
  } = ui;

  let isLoading = false;
  let pageProducts = null; // cache for session

  // Toggle chat window
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      textarea.focus();
      if (!pageProducts) {
        pageProducts = getPageContext(); // read DOM only once per session
      }
    }
  });

  // Close button
  const closeBtn = chatWindow.querySelector('.chatbot-close');
  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
  });

  // Send message on button click
  sendBtn.addEventListener('click', async () => {
    const message = textarea.value.trim();
    if (!message || isLoading) return;

    isLoading = true;
    sendBtn.disabled = true;
    textarea.disabled = true;

    // Add user message to chat
    addMessage(messagesContainer, message, 'user');
    textarea.value = '';
    textarea.style.height = 'auto';

    // Show loading indicator
    const loadingEl = showLoadingIndicator(messagesContainer);

    // Make sure we have context even if the panel was already open on first send
    if (!pageProducts) {
      pageProducts = getPageContext();
    }

    // Send to Groq API
    const response = await sendMessageToGroq(message, pageProducts);

    // Remove loading indicator
    loadingEl.remove();

    // Add bot response
    addMessage(messagesContainer, response, 'bot');

    isLoading = false;
    sendBtn.disabled = false;
    textarea.disabled = false;
    textarea.focus();
  });

  // Send message on Enter key (not Shift+Enter)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Add welcome message
  addMessage(messagesContainer, 'Hello! How can I help you today?', 'bot');
}