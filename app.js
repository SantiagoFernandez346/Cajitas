const API_URL = 'https://graphql.anilist.co';

// GraphQL query to get current season anime with additional fields
const query = `
query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
      }
      episodes
      nextAiringEpisode {
        airingAt
        episode
      }
      genres
      status
      siteUrl
      popularity
      description(asHtml: false)
      studios(isMain: true) {
        nodes {
          name
        }
      }
      averageScore
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

// Utility to get current season and year
function getCurrentSeasonAndYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  let season;
  if (month >= 3 && month <= 5) season = 'SPRING';
  else if (month >= 6 && month <= 8) season = 'SUMMER';
  else if (month >= 9 && month <= 11) season = 'FALL';
  else season = 'WINTER';
  return { season, year };
}

// Format seconds to hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Create countdown timer element
function createCountdown(airingAt) {
  const countdown = document.createElement('span');
  function update() {
    const now = Math.floor(Date.now() / 1000);
    const diff = airingAt - now;
    if (diff <= 0) {
      countdown.textContent = 'Airing now or soon!';
      clearInterval(interval);
    } else {
      countdown.textContent = `Next episode in: ${formatTime(diff)}`;
    }
  }
  update();
  const interval = setInterval(update, 1000);
  return countdown;
}

// Manage favorites in localStorage
function getFavorites() {
  const favs = localStorage.getItem('favorites');
  return favs ? JSON.parse(favs) : [];
}

function saveFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}

function toggleFavorite(animeId) {
  let favs = getFavorites();
  if (favs.includes(animeId)) {
    favs = favs.filter(id => id !== animeId);
  } else {
    favs.push(animeId);
  }
  saveFavorites(favs);
  return favs;
}

function isFavorite(animeId) {
  const favs = getFavorites();
  return favs.includes(animeId);
}

// Create social sharing buttons
function createSocialSharing(anime) {
  // Removed social sharing buttons as per user request
  return document.createElement('div');
}

function createAnimeCard(anime) {
  const link = document.createElement('a');
  link.href = anime.siteUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'block bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl p-4 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300 max-w-xs dark:from-gray-200 dark:via-gray-100 dark:to-white dark:text-gray-900 min-h-[28rem]';

  // Add subtle border and shadow on hover for better visual feedback
  link.classList.add('border', 'border-transparent', 'hover:border-green-400', 'hover:shadow-green-500/50');
  link.setAttribute('aria-label', `Anime: ${anime.title.english || anime.title.romaji || anime.title.native || 'Unknown Title'}`);

  const img = document.createElement('img');
  img.src = anime.coverImage.large;
  img.alt = anime.title.english || anime.title.romaji || anime.title.native || 'Unknown Title';
  img.className = 'rounded shadow-md mb-2 w-full h-auto aspect-video object-cover';

  const title = anime.title.english || anime.title.romaji || anime.title.native || 'Unknown Title';
  const titleEl = document.createElement('h2');
  titleEl.className = 'text-md font-semibold mb-1 text-green-400 dark:text-green-600';
  titleEl.textContent = title;

  const genres = document.createElement('p');
  genres.className = 'text-xs text-gray-400 mb-1 dark:text-gray-600';
  genres.textContent = `Genres: ${anime.genres.join(', ')}`;

  const episodes = document.createElement('p');
  episodes.className = 'text-xs text-gray-400 mb-1 dark:text-gray-600';
  episodes.textContent = `Episodes: ${anime.episodes || 'N/A'}`;

  const status = document.createElement('p');
  status.className = 'text-xs text-gray-400 mb-1 dark:text-gray-600';
  status.textContent = `Status: ${anime.status}`;

  const studio = document.createElement('p');
  studio.className = 'text-xs text-gray-400 mb-1 dark:text-gray-600';
  studio.textContent = `Studio: ${anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'N/A'}`;

  const score = document.createElement('p');
  score.className = 'text-xs text-gray-400 mb-1 dark:text-gray-600';
  score.textContent = `Score: ${anime.averageScore || 'N/A'}`;

  const description = document.createElement('p');
  description.className = 'text-xs text-gray-700 mb-1 dark:text-gray-800 truncate';
  description.textContent = anime.description ? anime.description.replace(/<[^>]+>/g, '').slice(0, 100) + '...' : 'No description available.';

  const countdown = anime.nextAiringEpisode ? createCountdown(anime.nextAiringEpisode.airingAt) : document.createElement('span');
  if (!anime.nextAiringEpisode) {
    countdown.textContent = 'No upcoming episodes';
    countdown.className = 'text-xs text-gray-500 dark:text-gray-600';
  } else {
    countdown.className = 'text-xs text-green-400 font-semibold dark:text-green-600';
  }

  // Favorites button
  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'px-3 py-2 rounded-full bg-yellow-400 text-black font-bold hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-600 shadow-md transition duration-300';
  favBtn.textContent = isFavorite(anime.id) ? '★ Remove Favorite' : '☆ Add Favorite';
  favBtn.setAttribute('aria-pressed', isFavorite(anime.id));
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const favs = toggleFavorite(anime.id);
    const isFav = favs.includes(anime.id);
    favBtn.textContent = isFav ? '★ Remove Favorite' : '☆ Add Favorite';
    favBtn.setAttribute('aria-pressed', isFav);

    // Add more dynamic animation classes for scale, color, and bounce effect
    favBtn.classList.add('transform', 'scale-125', 'text-yellow-600', 'transition', 'duration-300', 'ease-in-out', 'translate-y-[-5px]');
    setTimeout(() => {
      favBtn.classList.remove('transform', 'scale-125', 'text-yellow-600', 'transition', 'duration-300', 'ease-in-out', 'translate-y-[-5px]');
    }, 300);
  });

  link.appendChild(img);
  link.appendChild(titleEl);
  link.appendChild(genres);
  link.appendChild(episodes);
  link.appendChild(status);
  link.appendChild(studio);
  link.appendChild(score);
  link.appendChild(description);
  link.appendChild(countdown);

  // Footer container for trailer link and favorite button
  const footerContainer = document.createElement('div');
  footerContainer.className = 'mt-4 flex justify-between items-center';

  if (anime.trailer && anime.trailer.site === 'youtube') {
    const trailerLink = document.createElement('a');
    trailerLink.href = `https://www.youtube.com/watch?v=${anime.trailer.id}`;
    trailerLink.target = '_blank';
    trailerLink.rel = 'noopener noreferrer';
    trailerLink.className = 'text-xs text-blue-400 hover:underline dark:text-blue-600';
    trailerLink.textContent = 'Watch Trailer';
    footerContainer.appendChild(trailerLink);
  } else {
    // Add empty placeholder span to keep space consistent
    const placeholder = document.createElement('span');
    placeholder.className = 'h-4 w-20'; // approximate size of trailer link text
    placeholder.textContent = '\u00A0'; // non-breaking space
    footerContainer.appendChild(placeholder);
  }

  footerContainer.appendChild(favBtn);
  link.appendChild(footerContainer);

  // Add social sharing buttons
  // Removed social sharing buttons as per user request
  // const socialSharing = createSocialSharing(anime);
  // link.appendChild(socialSharing);

  return link;
}

// Sort anime list based on selected criteria
function sortAnimeList(animeList, criteria) {
  switch (criteria) {
    case 'airing':
      return animeList.slice().sort((a, b) => {
        const aTime = a.nextAiringEpisode ? a.nextAiringEpisode.airingAt : Infinity;
        const bTime = b.nextAiringEpisode ? b.nextAiringEpisode.airingAt : Infinity;
        return aTime - bTime;
      });
    case 'popularity':
      return animeList.slice().sort((a, b) => b.popularity - a.popularity);
    case 'alphabetical':
      return animeList.slice().sort((a, b) => {
        const aTitle = a.title.english || a.title.romaji || a.title.native || '';
        const bTitle = b.title.english || b.title.romaji || b.title.native || '';
        return aTitle.localeCompare(bTitle);
      });
    default:
      return animeList;
  }
}

// Filter anime list by search text, genre, and favorites filter
function filterAnimeList(animeList, searchText, genre, showFavoritesOnly) {
  const favorites = showFavoritesOnly ? getFavorites() : null;
  return animeList.filter(anime => {
    const title = (anime.title.english || anime.title.romaji || anime.title.native || '').toLowerCase();
    const matchesSearch = title.includes(searchText.toLowerCase());
    const matchesGenre = genre === '' || anime.genres.includes(genre);
    const matchesFavorite = !showFavoritesOnly || (favorites && favorites.includes(anime.id));
    return matchesSearch && matchesGenre && matchesFavorite;
  });
}

  // Pagination variables
  let currentPage = 1;
  const perPage = 20;
  let totalPages = 1;
  let allAnime = [];

  // Show loading spinner
  function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
  }

  // Hide loading spinner
  function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
  }

  // Lazy load images for better performance
  function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const config = {
      rootMargin: '50px 0px',
      threshold: 0.01
    };

    let observer = new IntersectionObserver((entries, self) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          self.unobserve(img);
        }
      });
    }, config);

    images.forEach(image => {
      observer.observe(image);
    });
  }

  // Update last updated timestamp
  function updateLastUpdated() {
    const now = new Date();
    const lastUpdatedEl = document.getElementById('last-updated');
    lastUpdatedEl.textContent = `Last updated: ${now.toLocaleString()}`;
  }

  // Render anime list with pagination, filtering, and sorting
  function renderAnimeList() {
    const searchInput = document.getElementById('search-input');
    const genreSelect = document.getElementById('genre-select');
    const sortSelect = document.getElementById('sort-select');
    const favoritesFilter = document.getElementById('favorites-filter');

    const searchText = searchInput.value.trim();
    const selectedGenre = genreSelect.value;
    const sortCriteria = sortSelect.value;
    const showFavoritesOnly = favoritesFilter.checked;

    let filtered = filterAnimeList(allAnime, searchText, selectedGenre, showFavoritesOnly);
    filtered = sortAnimeList(filtered, sortCriteria);

    totalPages = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    const container = document.getElementById('anime-list');
    container.innerHTML = '';
    paginated.forEach(anime => {
      const card = createAnimeCard(anime);
      card.classList.add('animate-fadeIn');
      container.appendChild(card);
    });

    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    // Removed prev-page and next-page buttons, so no need to update their disabled state
    // document.getElementById('prev-page').disabled = currentPage <= 1;
    // document.getElementById('prev-page').setAttribute('aria-disabled', currentPage <= 1);
    // document.getElementById('next-page').disabled = currentPage >= totalPages;
    // document.getElementById('next-page').setAttribute('aria-disabled', currentPage >= totalPages);
  }

  // Fetch and display seasonal anime with sorting, filtering, and pagination
  async function loadSeasonalAnime() {
    showLoading();
    const { season, year } = getCurrentSeasonAndYear();
    const variables = {
      season: season,
      seasonYear: year,
      page: 1,
      perPage: 50,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      const json = await response.json();
      allAnime = json.data.Page.media;

      populateGenreFilter(allAnime);
      currentPage = 1;
      renderAnimeList();
      updateLastUpdated();
    } catch (error) {
      console.error('Error fetching anime data:', error);
      const container = document.getElementById('anime-list');
      container.innerHTML = '<p class="text-red-600">Failed to load anime data. Please try again later.</p>';
    } finally {
      hideLoading();
    }
  }

  // Populate genre filter options dynamically
  function populateGenreFilter(animeList) {
    const genreSelect = document.getElementById('genre-select');
    const genres = new Set();
    animeList.forEach(anime => {
      anime.genres.forEach(genre => genres.add(genre));
    });
    // Clear existing options except "All Genres"
    genreSelect.querySelectorAll('option:not([value=""])').forEach(opt => opt.remove());
    Array.from(genres).sort().forEach(genre => {
      const option = document.createElement('option');
      option.value = genre;
      option.textContent = genre;
      genreSelect.appendChild(option);
    });
  }

  // Event listeners for search, filter, sort, pagination, favorites filter, and dark mode toggle
  window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const genreSelect = document.getElementById('genre-select');
    const favoritesFilter = document.getElementById('favorites-filter');
    const sortSelect = document.getElementById('sort-select');
    const loadMoreBtn = document.getElementById('load-more');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlRoot = document.getElementById('html-root');

    searchInput.addEventListener('input', () => {
      currentPage = 1;
      renderAnimeList();
    });

    genreSelect.addEventListener('change', () => {
      currentPage = 1;
      renderAnimeList();
    });

    favoritesFilter.addEventListener('change', () => {
      currentPage = 1;
      renderAnimeList();
    });

    sortSelect.addEventListener('change', () => {
      currentPage = 1;
      renderAnimeList();
    });

    loadMoreBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderMoreAnime();
      }
    });

    // Dark/light mode toggle implementation
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      htmlRoot.classList.add('dark');
    } else {
      htmlRoot.classList.remove('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
      if (htmlRoot.classList.contains('dark')) {
        htmlRoot.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        htmlRoot.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    });

    loadSeasonalAnime();
  });

  // Render more anime for "Load More" button
  function renderMoreAnime() {
    const searchInput = document.getElementById('search-input');
    const genreSelect = document.getElementById('genre-select');
    const sortSelect = document.getElementById('sort-select');
    const favoritesFilter = document.getElementById('favorites-filter');

    const searchText = searchInput.value.trim();
    const selectedGenre = genreSelect.value;
    const sortCriteria = sortSelect.value;
    const showFavoritesOnly = favoritesFilter.checked;

    let filtered = filterAnimeList(allAnime, searchText, selectedGenre, showFavoritesOnly);
    filtered = sortAnimeList(filtered, sortCriteria);

    totalPages = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    const container = document.getElementById('anime-list');
    paginated.forEach(anime => {
      const card = createAnimeCard(anime);
      card.classList.add('animate-fadeIn');
      container.appendChild(card);
    });

    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    // Removed prev-page and next-page buttons, so no need to update their disabled state
    // document.getElementById('prev-page').disabled = currentPage <= 1;
    // document.getElementById('prev-page').setAttribute('aria-disabled', currentPage <= 1);
    // document.getElementById('next-page').disabled = currentPage >= totalPages;
    // document.getElementById('next-page').setAttribute('aria-disabled', currentPage >= totalPages);
  }
