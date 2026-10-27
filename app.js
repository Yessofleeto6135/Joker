const defaultCategories = ['Pun', 'Dad Joke', 'Dark', 'One-Liner', 'Office', 'Animal', 'Travel', 'Roast'];
const languages = {
  English: {
    askLabel: 'Ask from Joker',
    customPrompt: 'What kind of joke do you want?',
    generate: 'Generate',
    ready: 'Ready',
    thinking: 'Thinking...'
  },
  Spanish: {
    askLabel: 'Pregunta a Joker',
    customPrompt: '¿Qué tipo de chiste quieres?',
    generate: 'Generar',
    ready: 'Listo',
    thinking: 'Pensando...'
  },
  French: {
    askLabel: 'Demander à Joker',
    customPrompt: 'Quel type de blague veux-tu ?',
    generate: 'Générer',
    ready: 'Prêt',
    thinking: 'Réflexion...'
  },
  Arabic: {
    askLabel: 'اسأل جوكر',
    customPrompt: 'ما نوع النكتة التي تريدها؟',
    generate: 'إنشاء',
    ready: 'مستعد',
    thinking: 'يُفكر...'
  }
};

const state = {
  categories: defaultCategories,
  selectedCategory: 'Pun',
  currentJoke: '',
  language: 'English'
};

const categoryContainer = document.getElementById('categoryContainer');
const resultBox = document.getElementById('resultBox');
const statusBadge = document.getElementById('statusBadge');
const memoryList = document.getElementById('memoryList');
const promptPanel = document.getElementById('promptPanel');
const promptInput = document.getElementById('promptInput');
const speakButton = document.getElementById('speakButton');
const askButton = document.getElementById('askButton');
const languageSelect = document.getElementById('languageSelect');

const builtInAI = {
  // Built-in joke engine embedded directly in the application code.
  // This model is intentionally safe, clean, and always returns a joke.
  generate({ prompt, category, memory, language }) {
    const text = (prompt || '').trim() || 'funny life';
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !['make', 'joke', 'about', 'this', 'that', 'with', 'from', 'for', 'the', 'and'].includes(word));

    const favoriteTopics = Array.isArray(memory?.profile?.favorites) ? memory.profile.favorites : [];
    const topic = words[0] || favoriteTopics[0] || 'coffee';
    const safeCategory = defaultCategories.includes(category) ? category : 'Pun';

    const jokes = {
      English: {
        Pun: [
          `I tried to open a ${topic} bakery, but it was a crumby idea and still somehow a little flaky.`,
          `My ${topic} plan was so good that even my calendar wanted a date with it.`,
          `I bought a ${topic} lamp because I wanted brighter ideas, but it only lit up my excuses.`
        ],
        'Dad Joke': [
          `I told my friend I was starting a ${topic} business, and he said, “That sounds like a pun-derful plan.”`,
          `The ${topic} expert told me to relax, so I sat down and let my stress do a little decompressing.`,
          `I asked the ${topic} coach for advice and it said, “Just keep your balance and don’t let life get too dramatic.”`
        ],
        Dark: [
          `I tried telling a dark joke about ${topic}, but even my shadow said, “That was a little too much.”`,
          `My ${topic} story had a dramatic ending, which is honestly pretty on-brand for me.`,
          `I made a dark joke about ${topic}, and the room got quiet because even the silence wanted to stay polite.`
        ],
        'One-Liner': [
          `My ${topic} idea is so sharp it could cut through a Monday morning.`,
          `I started a ${topic} routine and now my schedule is dramatically more emotional.`,
          `I wanted to be funny about ${topic}, but then I realized I already was.`
        ],
        Office: [
          `At work, my ${topic} idea got approved instantly because my boss needed a distraction.`,
          `I told a ${topic} joke in the office and suddenly everyone called it “creative energy.”`,
          `The team meeting about ${topic} was so boring that even the coffee looked for a new job.`
        ],
        Animal: [
          `My dog tried to tell a ${topic} joke, but it was too doggone dramatic.`,
          `The cat judged my ${topic} joke like it was a courtroom scene.`,
          `I asked my dog for a ${topic} punchline and it just wagged like it had it ready.`
        ],
        Travel: [
          `My ${topic} trip was so chaotic it felt like a passport to confusion.`,
          `I booked a ${topic} vacation and forgot the map, so now I’m just exploring my own mistakes.`,
          `The only thing more dramatic than my ${topic} trip was my suitcase acting like it had a personality.`
        ],
        Roast: [
          `Your ${topic} energy is so strong it deserves its own applause.`,
          `I tried to roast ${topic}, but it was too easy and too accurate.`,
          `The ${topic} idea was so bold it should have gotten its own standing ovation.`
        ]
      },
      Spanish: {
        Pun: [
          `Intenté abrir una panadería de ${topic}, pero fue una idea un poco demasiado crujiente.`,
          `Mi idea sobre ${topic} fue tan buena que hasta el calendario quiso salir conmigo.`,
          `Compré una lámpara de ${topic} para iluminar mis ideas, pero solo encendió mis excusas.`
        ],
        'Dad Joke': [
          `Le dije a mi amigo que iba a abrir un negocio de ${topic} y me dijo: “Eso suena muy divertido.”`,
          `El experto en ${topic} me dijo que me relajara, así que me senté y dejé que mi estrés tomara un descanso.`,
          `Le pedí consejo al coach de ${topic} y me dijo: “Solo mantén el equilibrio y no dejes que la vida sea tan dramática.”`
        ],
        Dark: [
          `Intenté contar un chiste oscuro sobre ${topic}, pero incluso mi sombra dijo que fue demasiado.`,
          `Mi historia sobre ${topic} tuvo un final dramático, que en verdad es muy de mi estilo.`,
          `Hice un chiste oscuro sobre ${topic} y la sala se quedó en silencio porque incluso el silencio quería ser educado.`
        ],
        'One-Liner': [
          `Mi idea de ${topic} es tan aguda que podría cortar un lunes por la mitad.`,
          `Empecé una rutina de ${topic} y ahora mi horario tiene más drama que una serie.`,
          `Quería hacer humor sobre ${topic}, pero entonces me di cuenta de que ya lo estaba haciendo.`
        ],
        Office: [
          `En la oficina, mi idea de ${topic} fue aprobada de inmediato porque mi jefe necesitaba una distracción.`,
          `Dije un chiste de ${topic} en la oficina y de repente todo el mundo lo llamó “energía creativa”.`,
          `La reunión del equipo sobre ${topic} fue tan aburrida que hasta el café buscó otro trabajo.`
        ],
        Animal: [
          `Mi perro intentó contar un chiste de ${topic}, pero fue demasiado dramático.`,
          `El gato juzgó mi chiste de ${topic} como si fuera una escena judicial.`,
          `Le pedí a mi perro un remate sobre ${topic} y solo movió la cola como si ya lo tuviera listo.`
        ],
        Travel: [
          `Mi viaje de ${topic} fue tan caótico que parecía un pasaporte a la confusión.`,
          `Reservé unas vacaciones de ${topic} y olvidé el mapa, así que ahora estoy explorando mis propios errores.`,
          `Lo único más dramático que mi viaje de ${topic} fue mi maleta actuando como si tuviera personalidad.`
        ],
        Roast: [
          `Tu energía de ${topic} es tan fuerte que merece su propio aplauso.`,
          `Intenté hacer una broma sobre ${topic}, pero fue demasiado fácil y demasiado precisa.`,
          `La idea de ${topic} fue tan audaz que merecía una ovación de pie.`
        ]
      },
      French: {
        Pun: [
          `J’ai essayé d’ouvrir une boulangerie de ${topic}, mais c’était une idée un peu trop croustillante.`,
          `Mon idée sur ${topic} était si bonne que même le calendrier voulait sortir avec elle.`,
          `J’ai acheté une lampe de ${topic} pour éclairer mes idées, mais elle n’a fait qu’allumer mes excuses.`
        ],
        'Dad Joke': [
          `J’ai dit à mon ami que je créais une entreprise de ${topic}, et il a répondu: « Ça sonne comme un plan parfaitement drôle. »`,
          `Le coach de ${topic} m’a dit de me détendre, donc je me suis assis et j’ai laissé mon stress faire une petite pause.`,
          `J’ai demandé conseil au coach de ${topic} et il m’a dit: « Garde l’équilibre et laisse la vie être moins dramatique. »`
        ],
        Dark: [
          `J’ai voulu faire une blague sombre sur ${topic}, mais même mon ombre a dit: « C’était un peu trop. »`,
          `Mon histoire sur ${topic} a eu une fin dramatique, ce qui est très dans mon style.`,
          `J’ai fait une blague sombre sur ${topic}, et la pièce est devenue silencieuse parce que même le silence voulait être poli.`
        ],
        'One-Liner': [
          `Mon idée sur ${topic} est si tranchante qu’elle pourrait couper un lundi en deux.`,
          `J’ai commencé une routine de ${topic} et maintenant mon emploi du temps a plus de drame qu’une série.`,
          `Je voulais être drôle sur ${topic}, puis j’ai réalisé que je l’étais déjà.`
        ],
        Office: [
          `Au bureau, mon idée de ${topic} a été approuvée tout de suite parce que mon patron avait besoin d’une distraction.`,
          `J’ai dit une blague sur ${topic} au bureau, et soudain tout le monde a appelé ça « énergie créative ».`,
          `La réunion d’équipe sur ${topic} était si ennuyeuse que même le café cherchait un autre travail.`
        ],
        Animal: [
          `Mon chien a essayé de faire une blague sur ${topic}, mais c’était trop dramatique.`,
          `Le chat a jugé ma blague sur ${topic} comme une scène judiciaire.`,
          `J’ai demandé à mon chien un punchline sur ${topic} et il a juste remué la queue comme s’il l’avait déjà prête.`
        ],
        Travel: [
          `Mon voyage de ${topic} était si chaotique qu’il ressemblait à un passeport vers la confusion.`,
          `J’ai réservé des vacances sur ${topic} et j’ai oublié la carte, donc maintenant je parcours mes propres erreurs.`,
          `La seule chose plus dramatique que mon voyage de ${topic} était ma valise qui se comportait comme une personne.`
        ],
        Roast: [
          `Ton énergie sur ${topic} est si forte qu’elle mérite sa propre ovation.`,
          `J’ai essayé de faire une blague sur ${topic}, mais c’était trop facile et trop juste.`,
          `L’idée de ${topic} était tellement audacieuse qu’elle méritait une standing ovation.`
        ]
      },
      Arabic: {
        Pun: [
          `حاولت فتح مخبزًا لـ ${topic}، لكنه كان فكرة مترهلة جدًا ومقرفة نوعًا ما.`,
          `كانت فكرة ${topic} جيدة جدًا لدرجة أن حتى التقويم أراد الخروج معها.`,
          `اشتريت مصباحًا لـ ${topic} لأضيء أفكاري، لكنه أضاء فقط أعذاري.`
        ],
        'Dad Joke': [
          `قلت لصديقي أنني سأفتح متجرًا لـ ${topic} وقال: «يبدو هذا مخططًا مضحكًا جدًا».`,
          `قال خبير ${topic} إنني بحاجة للهدوء، فجلست وتركـت التوتر يذهب في استراحة قصيرة.`,
          `سألت مدرب ${topic} عن النصيحة، فقال: «حافظ على التوازن ولا تدع الحياة تكون درامية جدًا».`
        ],
        Dark: [
          `حاولت أن أقول نكتة مظلمة عن ${topic}، لكن حتى ظلي قال: «هذا كان كثيرًا بعض الشيء».`,
          `قصة ${topic} كانت لها نهاية درامية، وهذا مناسب جدًا لشخصيتي.`,
          `قلت نكتة مظلمة عن ${topic} فصمتت الغرفة لأن حتى الصمت أراد أن يكون مهذبًا.`
        ],
        'One-Liner': [
          `فكرة ${topic} حادة جدًا لدرجة أنها قد تقطع صباح الاثنين في نصفين.`,
          `بدأت Routine لـ ${topic} والآن جدول أعمالي أكثر دراما من المسلسل.`,
          `كنت أريد أن أكون مضحكًا حول ${topic}، ثم أدركت أنني كنت أضحك فعلاً.`
        ],
        Office: [
          `في المكتب، تمت الموافقة على فكرة ${topic} فورًا لأن المدير كان يحتاج إلى تشتيت.`,
          `قلت نكتة عن ${topic} في المكتب، وفجأة كل أحد دعاها «طاقة إبداعية».`,
          `اجتماع الفريق حول ${topic} كان مملًا جدًا لدرجة أن حتى القهوة بحثت عن وظيفة جديدة.`
        ],
        Animal: [
          `حاول كلبـي أن يقول نكتة عن ${topic}، لكنها كانت درامية جدًا.`,
          `القط حكم على نكتتي عن ${topic} كما لو أنها مشهد قضيائي.`,
          `سألت كلبي عن قافية ${topic} فقط هز ذيله وكأنه يعرفها.`
        ],
        Travel: [
          `رحلة ${topic} كانت فوضوية جدًا لدرجة أنها شعرت كأنها جواز سفر نحو الارتباك.`,
          `حجزت إجازة ${topic} ونسيت الخريطة، لذلك الآن أنا أستكشف أخطائي بنفسي.`,
          `الشيء الوحيد الأكثر دراما من رحلتي في ${topic} هو حقيبتي التي تتصرف كأنها شخص.`
        ],
        Roast: [
          `طاقة ${topic} قوية جدًا لدرجة أنها تستحق تصفيقًا منفصلًا.`,
          `حاولت أن أستهزئ بـ ${topic}، لكنه كان سهلًا جدًا ومباشرًا جدًا.`,
          `فكرة ${topic} كانت جريئة جدًا لدرجة أنها تستحق تصفيق وقوف.`
        ]
      }
    };

    const collection = jokes[language]?.[safeCategory] || jokes.English[safeCategory];
    const index = (text.length + safeCategory.length + topic.length + (memory?.history?.length || 0)) % collection.length;
    return collection[index];
  }
};

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

function setLanguage(lang) {
  state.language = lang;
  const languageText = languages[lang] || languages.English;
  askButton.textContent = languageText.askLabel;
  promptInput.placeholder = languageText.customPrompt;
  const fieldLabel = document.querySelector('.field-label');
  if (fieldLabel) fieldLabel.textContent = languageText.customPrompt;
  setStatus(languageText.ready);
  promptInput.setAttribute('aria-label', languageText.customPrompt);
}

function cleanPrompt(prompt) {
  return typeof prompt === 'string' ? prompt.trim() : '';
}

function requestJoke(payload) {
  const memory = loadMemory();
  const category = payload.category || state.selectedCategory;
  const prompt = payload.prompt || `Make a ${category.toLowerCase()} joke for me.`;
  const mode = payload.mode || 'category';

  setStatus(languages[state.language]?.thinking || 'Thinking...');

  const joke = builtInAI.generate({
    prompt,
    category,
    memory,
    language: state.language
  });

  state.currentJoke = joke;
  resultBox.textContent = joke;

  const nextMemory = {
    history: [
      { category, prompt, joke, mode, createdAt: new Date().toISOString() },
      ...(Array.isArray(memory.history) ? memory.history : [])
    ].slice(0, 12),
    profile: memory.profile || { favorites: [] }
  };

  if (!nextMemory.profile.favorites) nextMemory.profile.favorites = [];

  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['make', 'joke', 'about', 'from', 'with', 'that', 'this', 'for', 'the'].includes(word));

  if (words.length) {
    nextMemory.profile.favorites = [...new Set([...nextMemory.profile.favorites, ...words])].slice(0, 8);
  }

  saveMemory(nextMemory);
  renderMemory(nextMemory);
  setStatus(languages[state.language]?.ready || 'Ready');
}

function speakJoke() {
  const joke = state.currentJoke || resultBox.textContent;
  if (!joke || joke.includes('Select a category')) return;

  const synth = window.speechSynthesis;
  if (!synth) {
    resultBox.textContent = 'Speech is not supported in this browser.';
    return;
  }

  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(joke);
  utterance.lang = languageMap[state.language] || 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  synth.speak(utterance);
}

const languageMap = {
  English: 'en-US',
  Spanish: 'es-ES',
  French: 'fr-FR',
  Arabic: 'ar-SA'
};

languageSelect.addEventListener('change', (event) => {
  setLanguage(event.target.value);
});

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
setLanguage('English');
resultBox.textContent = 'Select a category or ask Joker to create something fun.';
