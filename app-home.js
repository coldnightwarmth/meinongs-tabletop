const createRoomButton = document.getElementById('createRoomButton');
const playerNameInput = document.getElementById('playerName');
const playerColorInput = document.getElementById('playerColor');

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

  const url = new URL('./table.html', window.location.href);
  url.searchParams.set('room', roomId);
  url.searchParams.set('color', playerColor);

  if (playerName) {
    url.searchParams.set('name', playerName);
  }

  window.location.href = url.toString();
});
