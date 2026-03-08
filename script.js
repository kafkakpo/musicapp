/* ============================================
   CONFIGURATION API DEEZER
   ============================================ */
const DEEZER_API_BASE = 'https://api.deezer.com';
const DEEZER_API_LIMIT = 50;

/* ============================================
   VARIABLES D'ÉTAT GLOBALES
   ============================================ */
let appState = {
    currentFilter: 'track',
    searchQuery: '',
    favorites: JSON.parse(localStorage.getItem('musicbox_favorites')) || [],
    currentTrack: null,
    isPlaying: false,
    audioElement: null,
};

/* ============================================
   INITIALISATION DE L'APPLICATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    renderFavorites();
    console.log('🎵 MusicBox - Application initialisée');
});

/* ============================================
   CONFIGURATION DES ÉVÉNEMENTS
   ============================================ */
function initializeEventListeners() {
    // Recherche
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', () => performSearch());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Filtres
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => changeFilter(tab));
    });

    // Contrôles du lecteur
    document.getElementById('playBtn').addEventListener('click', playTrack);
    document.getElementById('pauseBtn').addEventListener('click', pauseTrack);
    document.getElementById('volumeBtn').addEventListener('click', toggleVolume);
}

/* ============================================
   RECHERCHE ET RÉCUPÉRATION DES DONNÉES
   ============================================ */
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        showError('Veuillez entrer un terme de recherche');
        return;
    }

    appState.searchQuery = query;
    await fetchResults(query, appState.currentFilter);
}

async function fetchResults(query, type) {
    showLoading(true);
    clearError();

    try {
        let endpoint = buildDeezerEndpoint(query, type);
        console.log('🔍 Recherche:', { query, type, endpoint });

        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data, type);

    } catch (error) {
        console.error('❌ Erreur de recherche:', error);
        showError(`Erreur lors de la recherche: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function buildDeezerEndpoint(query, type) {
    const encodedQuery = encodeURIComponent(query);
    const endpoints = {
        track: `${DEEZER_API_BASE}/search/track?q=${encodedQuery}&limit=${DEEZER_API_LIMIT}`,
        artist: `${DEEZER_API_BASE}/search/artist?q=${encodedQuery}&limit=${DEEZER_API_LIMIT}`,
        album: `${DEEZER_API_BASE}/search/album?q=${encodedQuery}&limit=${DEEZER_API_LIMIT}`,
        playlist: `${DEEZER_API_BASE}/search/playlist?q=${encodedQuery}&limit=${DEEZER_API_LIMIT}`,
    };

    return endpoints[type] || endpoints.track;
}

/* ============================================
   AFFICHAGE DES RÉSULTATS
   ============================================ */
function displayResults(data, type) {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';

    const items = data.data || [];

    if (items.length === 0) {
        showError(`Aucun résultat trouvé pour "${appState.searchQuery}"`);
        return;
    }

    items.forEach(item => {
        const card = createResultCard(item, type);
        resultsGrid.appendChild(card);
    });
}

function createResultCard(item, type) {
    const card = document.createElement('div');
    card.className = 'result-card';

    let title = '';
    let subtitle = '';
    let image = '';
    let id = '';

    // Récupérer les informations basées sur le type
    switch (type) {
        case 'track':
            title = item.title || 'Titre inconnu';
            subtitle = item.artist?.name || 'Artiste inconnu';
            image = item.album?.cover_medium || 'https://via.placeholder.com/150';
            id = item.id;
            break;
        case 'artist':
            title = item.name || 'Artiste inconnu';
            subtitle = `${item.nb_fan || 0} fans`;
            image = item.picture_medium || 'https://via.placeholder.com/150';
            id = item.id;
            break;
        case 'album':
            title = item.title || 'Album inconnu';
            subtitle = item.artist?.name || 'Artiste inconnu';
            image = item.cover_medium || 'https://via.placeholder.com/150';
            id = item.id;
            break;
        case 'playlist':
            title = item.title || 'Playlist inconnu';
            subtitle = `${item.nb_tracks || 0} titres`;
            image = item.picture_medium || 'https://via.placeholder.com/150';
            id = item.id;
            break;
    }

    const isFavorite = appState.favorites.some(fav => fav.id === id);

    card.innerHTML = `
        <img src="${image}" alt="${title}" class="card-image" onerror="this.src='https://via.placeholder.com/150'">
        <div class="card-title" title="${title}">${title}</div>
        <div class="card-subtitle" title="${subtitle}">${subtitle}</div>
        <div class="card-actions">
            <button class="card-btn play-action" data-id="${id}" data-type="${type}">▶ Écouter</button>
            <button class="card-btn favorite-action ${isFavorite ? 'liked' : ''}" data-id="${id}" data-title="${title}" data-subtitle="${subtitle}" data-image="${image}">❤</button>
        </div>
    `;

    // Événements des boutons
    card.querySelector('.play-action').addEventListener('click', (e) => {
        e.stopPropagation();
        handlePlay(item, type);
    });

    card.querySelector('.favorite-action').addEventListener('click', (e) => {
        e.stopPropagation();
        handleToggleFavorite(e.target, id, title, subtitle, image);
    });

    return card;
}

/* ============================================
   GESTION DU LECTEUR AUDIO
   ============================================ */
function handlePlay(item, type) {
    if (type === 'track') {
        playTrackItem(item);
    } else if (type === 'artist') {
        fetchArtistTopTracks(item.id);
    } else if (type === 'album') {
        fetchAlbumTracks(item.id);
    } else if (type === 'playlist') {
        fetchPlaylistTracks(item.id);
    }
}

async function fetchArtistTopTracks(artistId) {
    try {
        const response = await fetch(`${DEEZER_API_BASE}/artist/${artistId}/top?limit=10`);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            playTrackItem(data.data[0]);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des titres de l\'artiste:', error);
    }
}

async function fetchAlbumTracks(albumId) {
    try {
        const response = await fetch(`${DEEZER_API_BASE}/album/${albumId}/tracks`);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            playTrackItem(data.data[0]);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des titres de l\'album:', error);
    }
}

async function fetchPlaylistTracks(playlistId) {
    try {
        const response = await fetch(`${DEEZER_API_BASE}/playlist/${playlistId}/tracks`);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            playTrackItem(data.data[0]);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des titres de la playlist:', error);
    }
}

function playTrackItem(track) {
    appState.currentTrack = {
        id: track.id,
        title: track.title || 'Titre inconnu',
        artist: track.artist?.name || 'Artiste inconnu',
        cover: track.album?.cover_medium || 'https://via.placeholder.com/150',
        preview: track.preview,
        duration: track.duration || 0,
    };

    updatePlayerDisplay();
    playPreview();
}

function updatePlayerDisplay() {
    if (!appState.currentTrack) return;

    document.getElementById('playerTitle').textContent = appState.currentTrack.title;
    document.getElementById('playerArtist').textContent = appState.currentTrack.artist;
    document.getElementById('playerCover').src = appState.currentTrack.cover;
    document.getElementById('playerCover').onerror = function() {
        this.src = 'https://via.placeholder.com/150';
    };
}

function playPreview() {
    if (!appState.currentTrack || !appState.currentTrack.preview) {
        showError('Aperçu audio non disponible pour ce titre');
        return;
    }

    // Arrêter le lecteur précédent
    if (appState.audioElement) {
        appState.audioElement.pause();
    }

    // Créer un nouvel élément audio
    appState.audioElement = new Audio(appState.currentTrack.preview);
    appState.audioElement.play();
    appState.isPlaying = true;

    updatePlayButtonState();

    // Mettre à jour la barre de progression
    appState.audioElement.addEventListener('timeupdate', updateProgress);
    appState.audioElement.addEventListener('ended', () => {
        appState.isPlaying = false;
        updatePlayButtonState();
    });
}

function playTrack() {
    if (!appState.currentTrack) {
        showError('Veuillez sélectionner une chanson d\'abord');
        return;
    }

    if (appState.audioElement) {
        appState.audioElement.play();
        appState.isPlaying = true;
        updatePlayButtonState();
    }
}

function pauseTrack() {
    if (appState.audioElement) {
        appState.audioElement.pause();
        appState.isPlaying = false;
        updatePlayButtonState();
    }
}

function toggleVolume() {
    if (appState.audioElement) {
        appState.audioElement.muted = !appState.audioElement.muted;
        const volumeBtn = document.getElementById('volumeBtn');
        volumeBtn.textContent = appState.audioElement.muted ? '🔇' : '🔊';
    }
}

function updatePlayButtonState() {
    const playBtn = document.getElementById('playBtn');
    if (appState.isPlaying) {
        playBtn.classList.add('active');
    } else {
        playBtn.classList.remove('active');
    }
}

function updateProgress() {
    if (!appState.audioElement) return;

    const progress = document.getElementById('progress');
    const percentage = (appState.audioElement.currentTime / appState.audioElement.duration) * 100;
    progress.style.width = percentage + '%';
}

/* ============================================
   GESTION DES FAVORIS
   ============================================ */
function handleToggleFavorite(button, id, title, subtitle, image) {
    const favoriteIndex = appState.favorites.findIndex(fav => fav.id === id);

    if (favoriteIndex > -1) {
        // Supprimer des favoris
        appState.favorites.splice(favoriteIndex, 1);
        button.classList.remove('liked');
    } else {
        // Ajouter aux favoris
        appState.favorites.push({
            id,
            title,
            artist: subtitle,
            image,
        });
        button.classList.add('liked');
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('musicbox_favorites', JSON.stringify(appState.favorites));
    renderFavorites();
}

function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';

    if (appState.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">Aucun favori pour le moment. Cliquez sur le cœur pour en ajouter!</p>';
        return;
    }

    appState.favorites.forEach(favorite => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <img src="${favorite.image}" alt="${favorite.title}" onerror="this.src='https://via.placeholder.com/150'">
            <div class="favorite-info">
                <div class="favorite-title" title="${favorite.title}">${favorite.title}</div>
                <div class="favorite-artist" title="${favorite.artist}">${favorite.artist}</div>
            </div>
            <button class="remove-favorite" data-id="${favorite.id}">✕</button>
        `;

        item.querySelector('.remove-favorite').addEventListener('click', () => {
            removeFavorite(favorite.id);
        });

        favoritesList.appendChild(item);
    });
}

function removeFavorite(id) {
    appState.favorites = appState.favorites.filter(fav => fav.id !== id);
    localStorage.setItem('musicbox_favorites', JSON.stringify(appState.favorites));
    renderFavorites();

    // Mettre à jour l'interface
    document.querySelectorAll(`[data-id="${id}"]`).forEach(el => {
        if (el.classList.contains('favorite-action')) {
            el.classList.remove('liked');
        }
    });
}

/* ============================================
   GESTION DES FILTRES
   ============================================ */
function changeFilter(tab) {
    // Mettre à jour l'interface
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Mettre à jour l'état
    appState.currentFilter = tab.dataset.type;

    // Relancer la recherche si applicable
    if (appState.searchQuery) {
        performSearch();
    }
}

/* ============================================
   AFFICHAGE / GESTION DES MESSAGES
   ============================================ */
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function clearError() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.style.display = 'none';
}

/* ============================================
   UTILITAIRES
   ============================================ */
console.log('%c🎵 MusicBox v1.0', 'color: #ff6b00; font-size: 20px; font-weight: bold;');
console.log('%cApplication musicale utilisant l\'API Deezer', 'color: #ff9500; font-size: 14px;');
