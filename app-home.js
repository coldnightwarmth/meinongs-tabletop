const createRoomButton = document.getElementById('createRoomButton');
const playerNameInput = document.getElementById('playerName');
const playerColorInput = document.getElementById('playerColor');
const myGamesButton = document.getElementById('myGamesButton');
const lastGameButton = document.getElementById('lastGameButton');

const LAST_GAME_URL_KEY = 'tabletop-last-room-url';

const savedName = localStorage.getItem('tabletop-player-name');
const savedColor = localStorage.getItem('tabletop-player-color');
if (savedName) {
  playerNameInput.value = savedName;
}
if (savedColor && playerColorInput) {
  playerColorInput.value = savedColor;
}

function normalizeHexColor(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : '#ff7a59';
}

function generateRoomId() {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36).slice(-4);
  return `${randomPart}-${timePart}`;
}

function shouldUseCleanRoomPaths() {
  const host = window.location.hostname.toLowerCase();
  return host !== 'localhost' && host !== '127.0.0.1';
}

function getHomeBasePath() {
  let basePath = window.location.pathname;
  if (basePath.toLowerCase().endsWith('/index.html')) {
    basePath = basePath.slice(0, -'/index.html'.length);
  }
  if (!basePath) {
    basePath = '/';
  }
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }
  return basePath;
}

function getTableUrlForRoom(roomId) {
  if (!roomId) {
    return null;
  }
  if (shouldUseCleanRoomPaths()) {
    const cleanUrl = new URL(window.location.origin);
    cleanUrl.pathname = `${getHomeBasePath()}${encodeURIComponent(roomId)}`;
    return cleanUrl.toString();
  }
  const legacyUrl = new URL('./table.html', window.location.href);
  legacyUrl.searchParams.set('room', roomId);
  return legacyUrl.toString();
}

function extractRoomIdFromUrl(candidate) {
  const queryRoomId = String(candidate.searchParams.get('room') || '').trim();
  if (queryRoomId) {
    return queryRoomId;
  }
  const pathSegments = candidate.pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] || '';
  if (!lastSegment || lastSegment.includes('.')) {
    return '';
  }
  const homeBasePath = getHomeBasePath();
  if (candidate.pathname === homeBasePath || candidate.pathname === `${homeBasePath}index.html`) {
    return '';
  }
  try {
    return decodeURIComponent(lastSegment).trim();
  } catch {
    return lastSegment.trim();
  }
}

function getLastGameUrl() {
  const stored = localStorage.getItem(LAST_GAME_URL_KEY);
  if (!stored) {
    return null;
  }

  try {
    const candidate = new URL(stored, window.location.href);
    const roomId = extractRoomIdFromUrl(candidate);
    if (!roomId) {
      return null;
    }
    return getTableUrlForRoom(roomId);
  } catch {
    return null;
  }
}

function setLastGameButtonState() {
  if (!lastGameButton) {
    return;
  }

  const lastGameUrl = getLastGameUrl();
  const isEnabled = Boolean(lastGameUrl);
  lastGameButton.disabled = !isEnabled;
  lastGameButton.classList.toggle('is-disabled', !isEnabled);
}

lastGameButton?.addEventListener('click', () => {
  const lastGameUrl = getLastGameUrl();
  if (!lastGameUrl) {
    return;
  }
  window.location.href = lastGameUrl;
});

myGamesButton?.addEventListener('click', () => {
  // Placeholder for future "my games" experience.
});

setLastGameButtonState();

createRoomButton?.addEventListener('click', () => {
  const roomId = generateRoomId();
  const playerName = playerNameInput.value.trim();
  const playerColor = normalizeHexColor(playerColorInput?.value);

  if (playerName) {
    localStorage.setItem('tabletop-player-name', playerName);
  } else {
    localStorage.removeItem('tabletop-player-name');
  }
  localStorage.setItem('tabletop-player-color', playerColor);

  const nextUrl = getTableUrlForRoom(roomId);
  if (!nextUrl) {
    return;
  }
  window.location.href = nextUrl;
});
