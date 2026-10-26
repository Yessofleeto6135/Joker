const defaultCategories = ['Pun', 'Dad Joke', 'Dark', 'One-Liner', 'Office', 'Animal', 'Travel', 'Roast'];

const state = {
  categories: defaultCategories,
  selectedCategory: 'Pun',
  currentJoke: ''
};

const categoryContainer = document.getElementById('categoryContainer');
const resultBox = document.getElementById('resultBox');
const statusBadge = document.getElementById('statusBadge');
const memoryList = document.getElementById('memoryList');
const promptPanel = document.getElementById('promptPanel');
const promptInput = document.getElementById('promptInput');
const speakButton = document.getElementById('speakButton');

function loadMemory() {
  try {
    const raw = localStorage.getItem('joker-memory');
    if (!raw) return { history: [], profile: { favorites: [] } };
    return JSON.parse(raw);
  } catch (error) {
    return { history: [], profile: { favorites: [] } };
  }
}

function saveMemory(memory) {
  localStorage.setItem('joker-memory', JSON.stringify(memory));
}

function renderCategories() {
  categoryContainer.innerHTML = '';

  state.categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-button ${state.selectedCategory === category ? 'selected' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => {
      state.selectedCategory = category;
      renderCategories();
    });
    categoryContainer.appendChild(button);
  });
}

function setStatus(text, tone = 'success') {
  statusBadge.textContent = text;
  statusBadge.style.color = tone === 'error' ? '#fca5a5' : '#34d399';
  statusBadge.style.borderColor = tone === 'error' ? 'rgba(248, 113, 113, 0.32)' : 'rgba(52, 211, 153, 0.25)';
}

function renderMemory(memory) {
  const history = Array.isArray(memory.history) ? memory.history : [];

  if (!history.length) {
    memoryList.innerHTML = '<li>No jokes yet — your style will appear here.</li>';
    return;
  }

  memoryList.innerHTML = history
    .slice(0, 5)
    .map((entry) => `<li><strong>[${entry.category}]</strong> ${entry.joke}</li>`)
    .join('');
}

function cleanPrompt(prompt) {
  return typeof prompt === 'string' ? prompt.trim() : '';
}

function buildOfflineJoke({ category, prompt, memory }) {
  const safePrompt = cleanPrompt(prompt) || 'funny life';
  const historyCount = Array.isArray(memory.history) ? memory.history.length : 0;
  const words = safePrompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['make', 'joke', 'about', 'this', 'that', 'with', 'from'].includes(word));

  const favoriteTopics = Array.isArray(memory.profile?.favorites) ? memory.profile.favorites : [];
  const detail = words[0] || favoriteTopics[0] || 'daily life';

  const templates = {
    Pun: [
      `I tried to start a ${detail} business, but it was a real pun-derful disaster.`,
      `My ${detail} idea was so good that even the calendar said it had a date.`,
      `I started a podcast about ${detail}. Now my friends say I’m a little too niche.`
    ],
    'Dad Joke': [
      `I told my ${detail} problem to a friend. He said, “Sounds like a bad punchline.”`,
      `I tried to be serious about ${detail}, but it just kept slipping into a joke.`,
      `My ${detail} plan was so good that even my coffee looked impressed.`
    ],
    Dark: [
      `I made a dark joke about ${detail}. Even my shadow said, “That was a little much.”`,
      `My ${detail} idea had a dramatic ending, which feels very on-brand for me.`,
      `I told a dark joke about ${detail}. It was edgy and still somehow encouraging.`
    ],
    'One-Liner': [
      `I have a ${detail} joke so sharp it could start a Monday morning fight.`,
      `My ${detail} idea is simple: laugh now, explain later.`,
      `I wanted to be funny about ${detail}, but I realized I was already doing it.`
    ],
    Office: [
      `At work, my ${detail} idea got approved immediately because my boss needed a distraction.`,
      `I told a ${detail} joke at the office and got called “creative.”`,
      `The meeting about ${detail} was so boring that even the coffee looked for a new job.`
    ],
    Animal: [
      `My dog tried to tell a ${detail} joke, but it was too doggone dramatic.`,
      `The cat judged my ${detail} joke like it was a courtroom drama.`,
      `I asked the dog for a ${detail} joke and it just wagged like it knew the punchline.`
    ],
    Travel: [
      `My ${detail} trip was so chaotic it felt like a passport to confusion.`,
      `I planned a ${detail} vacation, but the joke was on me when I forgot the map.`,
      `The only thing more dramatic than my ${detail} trip was my luggage’s personality.`
    ],
    Roast: [
      `Your ${detail} energy is so strong it deserves a standing ovation.`,
      `I tried to roast ${detail}, but it was too easy and too accurate.`,
      `The ${detail} idea was so bold it should have gotten its own applause.`
    ]
  };

  const list = templates[category] || templates.Pun;
  const index = (historyCount + safePrompt.length + detail.length) % list.length;
  return list[index];
}

function generateJoke({ category, prompt, mode, memory }) {
  const safePrompt = cleanPrompt(prompt) || 'make me laugh';
  const userWords = safePrompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['make', 'joke', 'about', 'from', 'with', 'that', 'this'].includes(word));

  const favorites = Array.isArray(memory.profile?.favorites) ? memory.profile.favorites : [];
  const merged = [...favorites, ...userWords].slice(0, 8);

  if (!memory.profile) memory.profile = { favorites: [] };
  memory.profile.favorites = [...new Set(merged)];

  return buildOfflineJoke({ category, prompt: safePrompt, memory });
}

function requestJoke(payload) {
  const memory = loadMemory();
  const category = payload.category || state.selectedCategory;
  const prompt = payload.prompt || `Make a ${category.toLowerCase()} joke for me.`;
  const mode = payload.mode || 'category';

  setStatus('Thinking...');

  const joke = generateJoke({ category, prompt, mode, memory });
  state.currentJoke = joke;
  resultBox.textContent = joke;

  const nextMemory = {
    history: [
      { category, prompt, joke, mode, createdAt: new Date().toISOString() },
      ...(Array.isArray(memory.history) ? memory.history : [])
    ].slice(0, 12),
    profile: memory.profile || { favorites: [] }
  };

  saveMemory(nextMemory);
  renderMemory(nextMemory);
  setStatus('Ready');
}

function speakJoke() {
  const joke = state.currentJoke || resultBox.textContent;
  if (!joke || joke.includes('Select a category')) return;

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(joke);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

document.getElementById('askButton').addEventListener('click', () => {
  promptPanel.classList.remove('hidden');
  promptInput.focus();
});

document.getElementById('closePromptButton').addEventListener('click', () => {
  promptPanel.classList.add('hidden');
});

document.getElementById('createJokeButton').addEventListener('click', () => {
  requestJoke({
    mode: 'category',
    category: state.selectedCategory,
    prompt: `Make a ${state.selectedCategory.toLowerCase()} joke for me.`
  });
});

document.getElementById('createNewButton').addEventListener('click', () => {
  requestJoke({
    mode: 'createNew',
    category: state.selectedCategory,
    prompt: 'Create a fresh joke based on my past humor and my personality.'
  });
});

document.getElementById('generateCustomButton').addEventListener('click', () => {
  const customPrompt = cleanPrompt(promptInput.value);
  if (!customPrompt) {
    resultBox.textContent = 'Type a request first so Joker knows what kind of joke to make.';
    return;
  }

  requestJoke({
    mode: 'custom',
    category: state.selectedCategory,
    prompt: customPrompt
  });

  promptPanel.classList.add('hidden');
  promptInput.value = '';
});

speakButton.addEventListener('click', speakJoke);

renderCategories();
renderMemory(loadMemory());
resultBox.textContent = 'Select a category or ask Joker to create something fun.';
