const createRoomButton = document.getElementById('createRoomButton');
const playerNameInput = document.getElementById('playerName');

const savedName = localStorage.getItem('tabletop-player-name');
if (savedName) {
  playerNameInput.value = savedName;
}

function generateRoomId() {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36).slice(-4);
  return `${randomPart}-${timePart}`;
}

createRoomButton?.addEventListener('click', () => {
  const roomId = generateRoomId();
  const playerName = playerNameInput.value.trim();

  if (playerName) {
    localStorage.setItem('tabletop-player-name', playerName);
  }

  const url = new URL('./table.html', window.location.href);
  url.searchParams.set('room', roomId);

  if (playerName) {
    url.searchParams.set('name', playerName);
  }

  window.location.href = url.toString();
});
