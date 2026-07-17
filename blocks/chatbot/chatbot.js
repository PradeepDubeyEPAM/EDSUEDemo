/**
 * chatbot.js — EDS Block Decorator
 * ─────────────────────────────────────────────────────────────────
 * Floating chat widget for AEM Edge Delivery Services.
 * RAG is handled server-side (App Builder Runtime Action).
 * Frontend sends the user's question + conversation history.
 * ─────────────────────────────────────────────────────────────────
 */

// ── CONFIG ────────────────────────────────────────────────────────
const CHATBOT_ENDPOINT = 'https://26272-aemcloudpocapimesh-develop.adobeio-static.net/api/v1/web/api-mesh-proxy/groq-chat';
// const LOCAL_ENDPOINT = 'http://localhost:9080/api/v1/web/api-mesh-proxy/groq-chat';
// ─────────────────────────────────────────────────────────────────

// ── CONVERSATION HISTORY ──────────────────────────────────────────
const conversationHistory = [];
const HISTORY_LIMIT = 4;
// ─────────────────────────────────────────────────────────────────

/**
 * Sends the user's question + conversation history to the App Builder
 * Runtime Action. RAG retrieval + Groq response handled server-side.
 *
 * @param {string} question
 * @returns {Promise<string>}
 */
async function sendMessage(question) {
  try {
    // Snapshot history BEFORE this turn — backend receives previous turns only.
    // The current question is sent separately in the `question` field.
    // This prevents the user message from appearing twice in the Groq context.
    const historySnapshot = conversationHistory.slice(-HISTORY_LIMIT);

    const response = await fetch(CHATBOT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        history: historySnapshot,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      // eslint-disable-next-line no-console
      console.error('[chatbot] Runtime Action error:', data.error);
      return 'Sorry, the assistant hit an error. Please try again.';
    }

    const answer = data.body?.answer || data.answer || 'Sorry, I could not process your message.';

    // Push both turns to history AFTER successful response
    conversationHistory.push({ role: 'user', content: question });
    conversationHistory.push({ role: 'assistant', content: answer });

    return answer;

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[chatbot] Fetch error:', error);
    return 'Error connecting to the assistant. Please try again.';
  }
}

// ── UI CREATION ───────────────────────────────────────────────────

function createChatbotUI() {
  const container = document.createElement('div');
  container.className = 'chatbot-widget-container';

  // ── Toggle button (floating bubble) ──
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'chatbot-toggle';
  toggleBtn.setAttribute('aria-label', 'Open chat assistant');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  // ── Chat window ──
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window hidden';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-label', 'Chat assistant');

  // Header
  const header = document.createElement('div');
  header.className = 'chatbot-header';
  header.innerHTML = `
    <h3>Chat Assistant</h3>
    <button class="chatbot-close" aria-label="Close chat">×</button>
  `;

  // Messages area
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chatbot-messages';
  messagesContainer.setAttribute('aria-live', 'polite');
  messagesContainer.setAttribute('aria-atomic', 'false');

  // Input row
  const inputContainer = document.createElement('div');
  inputContainer.className = 'chatbot-input-container';

  const textarea = document.createElement('textarea');
  textarea.className = 'chatbot-input';
    textarea.placeholder = 'Hi,How can I help?';
  textarea.rows = '1';
  textarea.setAttribute('aria-label', 'Type your message');

  const sendBtn = document.createElement('button');
  sendBtn.className = 'chatbot-send hidden';
  sendBtn.setAttribute('aria-label', 'Send message');
  sendBtn.setAttribute('title', 'Send');
sendBtn.innerHTML = '<span class="chatbot-send-label">Enter</span>';

  inputContainer.appendChild(textarea);

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
  };
}

// ── MESSAGE HELPERS ───────────────────────────────────────────────

function formatBotMessage(message) {
  return message
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="chatbot-product-link">$1</a>',
    )
    .replace(
      /(?<!\()(?<!")(https?:\/\/[^\s<"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
function addMessage(container, message, sender) {
  const messageEl = document.createElement('div');
  messageEl.className = `chatbot-message ${sender}`;

  const content = document.createElement('div');
  content.className = 'chatbot-message-content';

  // Bot messages: render line breaks and basic markdown (bold)
  // User messages: plain text only for XSS safety
  if (sender === 'bot') {
const formatted = formatBotMessage(message);
console.log(formatted);
content.innerHTML = formatted;  } else {
    content.textContent = message;
  }

  messageEl.appendChild(content);
  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator(container) {
  const messageEl = document.createElement('div');
  messageEl.className = 'chatbot-message bot loading';

  const dots = document.createElement('div');
  dots.className = 'chatbot-typing-dots';
  dots.setAttribute('aria-label', 'Assistant is typing');
  dots.innerHTML = '<span></span><span></span><span></span>';

  messageEl.appendChild(dots);
  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;

  return messageEl;
}

// ── BLOCK DECORATOR ───────────────────────────────────────────────

export default function decorate(block) {
  block.innerHTML = '';

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

  // ── Toggle open/close ──
  toggleBtn.addEventListener('click', () => {
    const isHidden = chatWindow.classList.toggle('hidden');
    toggleBtn.setAttribute('aria-expanded', String(!isHidden));
    toggleBtn.classList.toggle('is-open', !isHidden);
    if (!isHidden) textarea.focus();
  });

  // ── Close button ──
  chatWindow.querySelector('.chatbot-close').addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.classList.remove('is-open');
    toggleBtn.focus();
  });

  // ── Auto-resize textarea ──
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    sendBtn.classList.toggle('hidden', textarea.value.trim().length === 0);
  });

  // ── Send handler ──
  async function handleSend() {
    const message = textarea.value.trim();
    if (!message || isLoading) return;

    isLoading = true;
    sendBtn.disabled = true;
    textarea.disabled = true;

    addMessage(messagesContainer, message, 'user');
    textarea.value = '';
    textarea.style.height = 'auto';

    const typingEl = showTypingIndicator(messagesContainer);

    // eslint-disable-next-line no-console
    console.log(`[chatbot] sending to: ${CHATBOT_ENDPOINT}`);

    const reply = await sendMessage(message);
    console.log(reply);

    typingEl.remove();
    addMessage(messagesContainer, reply, 'bot');

    isLoading = false;
    sendBtn.disabled = false;
    textarea.disabled = false;
    textarea.focus();
  }

  sendBtn.addEventListener('click', handleSend);

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // ── Welcome message ──
  addMessage(
    messagesContainer,
    'Hi! Ask me about any of our products or current offers.',
    'bot',
  );
}