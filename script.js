const API_KEY = 'SUA_API_KEY_AQUI';
const CHANNEL_ID = 'UCcmfAdgeXGf4snbc76wSBaQ';
const MAX_RESULTS = 6;
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const videoList = document.getElementById('video-list');

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

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

  card.addEventListener('click', () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  });

  return card;
}

function renderVideos(items) {
  videoList.innerHTML = '';

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

    if (videos.length) {
      renderVideos(videos);
    }
  } catch (error) {
    console.error(error);
  }
}

fetchYouTubeVideos();
