const API_KEY = 'SUA_API_KEY_AQUI';
const CHANNEL_ID = 'UCcmfAdgeXGf4snbc76wSBaQ';
const MAX_RESULTS = 6;
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const videoList = document.getElementById('video-list');
const quoteList = document.getElementById('quote-list');
const sponsorList = document.getElementById('sponsor-list');

const sponsorData = [
  {
    name: 'Casa do Samba',
    type: 'Parceiro oficial',
    logo: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Terra do Ritmo',
    type: 'Apoio cultural',
    logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Roda de Bamba',
    type: 'Apoio institucional',
    logo: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80'
  }
];

//campo de fragmentos de sabedoria 
const quoteData = [
  {
    text: 'O samba não é só ritmo; é memória viva de quem construiu a cidade.',
    author: 'Maria do Bairro',
    topic: 'Memória e identidade',
    link: 'https://www.youtube.com/results?search_query=Maria+do+Bairro+samba',
    label: 'Ver entrevista de Maria do Bairro'
  },
  {
    text: 'Quando a gente toca, a rua conversa. O samba carrega histórias que precisam ser ouvidas.',
    author: 'Seu Nilo',
    topic: 'Ritmo e tradição',
    link: 'https://www.youtube.com/results?search_query=Seu+Nilo+samba',
    label: 'Ver entrevista de Seu Nilo'
  },
  {
    text: 'A cultura popular é poesia em movimento, e o samba é uma das suas vozes mais fortes.',
    author: 'Clara Santos',
    topic: 'Cultura e poesia',
    link: 'https://www.youtube.com/results?search_query=Clara+Santos+samba',
    label: 'Ver entrevista de Clara Santos'
  }
];

//finalização do campo de fragmentos de sabedoria

function renderQuotes() {
  if (!quoteList) return;

  // Renderiza os fragmentos de sabedoria no HTML

  quoteList.innerHTML = quoteData
    .map(
      (quote) => `
        <a class="quote-card" href="${quote.link}" aria-label="${quote.label}">
          <span class="quote-mark">“</span>
          <p>${quote.text}</p>
          <div class="quote-author">
            <strong>${quote.author}</strong>
            <span>${quote.topic}</span>
          </div>
          <span class="quote-link">Ver entrevista</span>
        </a>
      `
    )
    .join('');
}

function renderSponsors() {
  if (!sponsorList) return;

  sponsorList.innerHTML = sponsorData
    .map(
      (sponsor) => `
        <article class="sponsor-card">
          <div class="sponsor-logo-wrap">
            <img class="sponsor-logo" src="${sponsor.logo}" alt="Logo de ${sponsor.name}" />
          </div>
          <div class="sponsor-meta">
            <span class="sponsor-badge">${sponsor.type}</span>
            <strong>${sponsor.name}</strong>
          </div>
        </article>
      `
    )
    .join('');
}

// Função para renderizar o estado vazio quando não há vídeos disponíveis

function renderEmptyState() {
  videoList.innerHTML = `
    <div class="video-empty-state">
      <p>Nenhum vídeo disponível no momento.</p>
    </div>
  `;
}

// Função para formatar a data no formato brasileiro (dd/mm/yyyy)

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Função para analisar o feed XML do YouTube e extrair informações relevantes dos vídeos

function parseYouTubeFeed(xmlString) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');
  const entries = [...xml.querySelectorAll('entry')];

  return entries.map((entry) => {
    const videoId =
      entry.querySelector('yt\:videoId')?.textContent ||
      entry.querySelector('videoId')?.textContent ||
      '';

    const thumbnail =
      entry.querySelector('media\:thumbnail')?.getAttribute('url') ||
      entry.querySelector('thumbnail')?.getAttribute('url') ||
      '';

    const title = entry.querySelector('title')?.textContent || 'Vídeo do YouTube';
    const publishedAt = entry.querySelector('published')?.textContent || new Date().toISOString();
    const channelTitle = entry.querySelector('author name')?.textContent || 'YouTube';

    return {
      id: { videoId },
      snippet: {
        title,
        publishedAt,
        channelTitle,
        thumbnails: {
          high: { url: thumbnail },
          medium: { url: thumbnail }
        }
      }
    };
  });
}

// Função para renderizar cada vídeo como um card clicável que abre o vídeo no YouTube em uma nova aba

function renderVideoCard(item) {
  const card = document.createElement('article');
  card.className = 'video-card';

  const videoId = item.id.videoId;
  const thumbnail = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url;
  const title = item.snippet.title;
  const publishedAt = formatDate(item.snippet.publishedAt);
  const channelTitle = item.snippet.channelTitle;

  card.innerHTML = `
    <div class="video-thumb">
      <img src="${thumbnail}" alt="${title}" />
      <span class="video-badge">YouTube</span>
    </div>
    <div class="video-info">
      <h3>${title}</h3>
      <div class="video-meta">
        <span>${channelTitle}</span>
        <span>${publishedAt}</span>
      </div>
    </div>
  `;

// Adiciona um evento de clique ao card para abrir o vídeo no YouTube em uma nova aba
  card.addEventListener('click', () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  });

  return card;
}

// Função para renderizar a lista de vídeos no HTML, chamando a função renderVideoCard para cada vídeo

function renderVideos(items) {
  videoList.innerHTML = '';

  if (!items || items.length === 0) {
    renderEmptyState();
    return;
  }

  items.forEach((item) => {
    const card = renderVideoCard(item);
    videoList.appendChild(card);
  });
}

async function fetchYouTubeVideos() {
  if (!CHANNEL_ID || CHANNEL_ID === 'SEU_CHANNEL_ID') {
    return;
  }

  try {
    if (API_KEY && API_KEY !== 'SUA_API_KEY_AQUI') {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API do YouTube: ${response.status}`);
      }

      const data = await response.json();
      const videos = data.items.filter((item) => item.id && item.id.videoId);

      if (videos.length) {
        renderVideos(videos);
        return;
      }
    }

    const feedResponse = await fetch(YOUTUBE_FEED_URL);

    if (!feedResponse.ok) {
      throw new Error(`Erro ao carregar o feed do YouTube: ${feedResponse.status}`);
    }

    const feedXml = await feedResponse.text();
    const videos = parseYouTubeFeed(feedXml).slice(0, MAX_RESULTS);

    // Renderiza os vídeos ou o estado vazio, dependendo se há vídeos disponíveis

    if (videos.length) {
      renderVideos(videos);
    } else {
      renderEmptyState();
    }
  } catch (error) {
    console.error(error);
    renderEmptyState();
  }
}

renderQuotes();
renderSponsors();
fetchYouTubeVideos();
