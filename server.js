const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const memoryPath = path.join(__dirname, 'data', 'joker-memory.json');

const categories = ['Pun', 'Dad Joke', 'Dark', 'One-Liner', 'Office', 'Animal', 'Travel', 'Roast'];

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureMemoryFile() {
  const dir = path.dirname(memoryPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(memoryPath)) {
    fs.writeFileSync(memoryPath, JSON.stringify({ history: [], profile: { favorites: [] } }, null, 2));
  }
}

function readMemory() {
  ensureMemoryFile();
  try {
    const raw = fs.readFileSync(memoryPath, 'utf8');
    const data = JSON.parse(raw);
    return {
      history: Array.isArray(data.history) ? data.history : [],
      profile: data.profile || { favorites: [] }
    };
  } catch (error) {
    return { history: [], profile: { favorites: [] } };
  }
}

function writeMemory(memory) {
  ensureMemoryFile();
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
}

function sanitize(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function buildOfflineJoke({ category, prompt, memory }) {
  const safePrompt = sanitize(prompt, 'funny life');
  const historyCount = memory.history.length;
  const topicWords = safePrompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['make', 'joke', 'about', 'this', 'that', 'with', 'from'].includes(word));

  const favorites = Array.isArray(memory.profile.favorites) ? memory.profile.favorites : [];
  const detail = topicWords[0] || favorites[0] || 'daily life';

  const templates = {
    Pun: [
      `I tried to make a ${detail} joke, but it turned into a pun-derful disaster.`,
      `My ${detail} idea was so good, even the calendar said it had a date.`,
      `I started a business around ${detail}. It was a real crowd-pleaser, but also a little too niche.`
    ],
    'Dad Joke': [
      `I told my ${detail} problem to a friend. He said, “I think you need a little more space.”`,
      `My ${detail} plan was so good, even my coffee said it was brewing with confidence.`,
      `I asked the ${detail} expert for advice. They said, “Just stay calm and keep a good sense of humor.”`
    ],
    Dark: [
      `I tried to make a dark joke about ${detail}, but even my shadow said it was a bit much.`,
      `My ${detail} idea had a dramatic ending, which feels very on-brand for me.`,
      `I told a dark joke about ${detail}. It was edgy, dramatic, and weirdly motivating.`
    ],
    'One-Liner': [
      `I have a ${detail} joke so sharp it could cut through a Monday morning.`,
      `My ${detail} idea is simple: laugh now, explain later.`,
      `I wanted to be funny about ${detail}, but then I realized I was already doing it.`
    ],
    Office: [
      `At work, my ${detail} idea got approved immediately because my manager needed a distraction.`,
      `I told a ${detail} joke at the office and somehow got called “creative.”`,
      `The meeting about ${detail} was so boring that even the coffee looked for a better job.`
    ],
    Animal: [
      `My pet tried to tell a ${detail} joke, but it was just too doggone dramatic.`,
      `The cat judged my ${detail} joke like it was a courtroom drama.`,
      `I asked the dog for a ${detail} joke and it just wagged like it had the punchline.`
    ],
    Travel: [
      `My ${detail} trip was so chaotic it felt like a passport to confusion.`,
      `I planned a ${detail} vacation, but the joke was on me when I forgot the map.`,
      `The only thing more dramatic than my ${detail} trip was my luggage’s personality.`
    ],
    Roast: [
      `Your ${detail} energy is so strong it could get its own applause.`,
      `I tried to roast ${detail}, but honestly it was too easy and too accurate.`,
      `The ${detail} idea was so bold it deserved its own standing ovation.`
    ]
  };

  const list = templates[category] || templates.Pun;
  const index = (historyCount + safePrompt.length + detail.length) % list.length;
  return list[index];
}

async function generateWithOllama(prompt) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3.1',
      prompt,
      stream: false,
      options: { temperature: 0.9, top_p: 0.9 }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama failed: ${response.status}`);
  }

  const data = await response.json();
  return sanitize(data.response || '', '');
}

async function generateJoke({ category, prompt, mode, memory }) {
  const safePrompt = sanitize(prompt, 'make me laugh');
  const historyText = memory.history.length
    ? memory.history.slice(0, 5).map((entry) => `${entry.category}: ${entry.prompt} -> ${entry.joke}`).join('\n')
    : 'No previous jokes.';

  const favoriteText = Array.isArray(memory.profile.favorites) && memory.profile.favorites.length
    ? memory.profile.favorites.join(', ')
    : 'no favorite topics yet';

  const ollamaPrompt = `You are Joker, a funny comedian. Create one original, short, clean joke. Use category: ${category}. Mode: ${mode}. User prompt: ${safePrompt}. Remember recent history: ${historyText}. Favorite humor topics: ${favoriteText}. Output only the joke text with no quotes, no markdown, and no explanation.`;

  try {
    const result = await generateWithOllama(ollamaPrompt);
    if (result && result.length > 10) return result;
  } catch (error) {
    console.warn('Ollama unavailable, falling back to offline joke engine:', error.message);
  }

  return buildOfflineJoke({ category, prompt: safePrompt, memory });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ollamaUrl: OLLAMA_URL, status: 'Joker backend ready' });
});

app.get('/api/categories', (req, res) => {
  res.json({ categories });
});

app.get('/api/memory', (req, res) => {
  res.json({ memory: readMemory() });
});

app.post('/api/joke', async (req, res) => {
  const payload = req.body || {};
  const category = sanitize(payload.category, 'Pun');
  const prompt = sanitize(payload.prompt, 'make me laugh');
  const mode = sanitize(payload.mode, 'category');

  const memory = readMemory();
  const joke = await generateJoke({ category, prompt, mode, memory });

  const favoriteKeywords = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['make', 'joke', 'about', 'from', 'with', 'that', 'this'].includes(word));

  if (favoriteKeywords.length) {
    memory.profile.favorites = Array.from(new Set([...(memory.profile.favorites || []), ...favoriteKeywords])).slice(0, 8);
  }

  const entry = {
    category,
    prompt,
    joke,
    mode,
    createdAt: new Date().toISOString()
  };

  memory.history = [entry, ...(memory.history || [])].slice(0, 12);
  writeMemory(memory);

  res.json({ joke, memory });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Joker app is running on http://localhost:${PORT}`);
  console.log(`If Ollama is installed locally, the app will use it automatically for richer jokes.`);
});
