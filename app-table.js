import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
  update
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

const tableRoot = document.getElementById('tableRoot');
const cursorLayer = document.getElementById('cursorLayer');
const roomBadge = document.getElementById('roomBadge');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyLabel = document.getElementById('copyLabel');

const query = new URLSearchParams(window.location.search);
const roomId = query.get('room');
if (!roomId) {
  window.location.replace('./index.html');
  throw new Error('Missing room id in URL');
}

const rawName = query.get('name')?.trim() || localStorage.getItem('tabletop-player-name') || 'player';
const playerName = rawName.slice(0, 24);
const clientId = self.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const playerColor = colorFromId(clientId);
const roomPath = `rooms/${roomId}`;

if (roomBadge) {
  roomBadge.textContent = `room: ${roomId}`;
}

copyLinkButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch {
    const fallback = document.createElement('textarea');
    fallback.value = window.location.href;
    fallback.style.position = 'fixed';
    fallback.style.opacity = '0';
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
  }

  copyLinkButton.classList.add('copied');
  if (copyLabel) {
    copyLabel.textContent = 'copied';
  }
  window.setTimeout(() => {
    copyLinkButton.classList.remove('copied');
    if (copyLabel) {
      copyLabel.textContent = 'copy link';
    }
  }, 1300);
});

function colorFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 85% 62%)`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hasPlaceholderConfig(config) {
  return Object.values(config).some((value) => String(value).includes('REPLACE_ME'));
}

function showConfigMessage() {
  showStatusMessage('Add your Firebase config in firebase-config.js to enable realtime syncing.');
}

function showStatusMessage(text) {
  if (!tableRoot) {
    return;
  }

  const message = document.createElement('div');
  message.className = 'room-badge';
  message.style.left = '50%';
  message.style.top = '50%';
  message.style.transform = 'translate(-50%, -50%)';
  message.style.maxWidth = 'min(92vw, 520px)';
  message.style.padding = '0.85rem 1rem';
  message.textContent = text;
  tableRoot.appendChild(message);
}

if (hasPlaceholderConfig(firebaseConfig)) {
  showConfigMessage();
} else {
  startRealtimeSession().catch((error) => {
    console.error(error);
    if (String(error?.code || '').includes('PERMISSION_DENIED')) {
      showStatusMessage('Realtime Database denied access. Update database rules to allow reads/writes for rooms.');
      return;
    }
    showStatusMessage('Firebase setup is incomplete. Check firebase-config.js and Realtime Database settings.');
  });
}

async function startRealtimeSession() {
  if (!tableRoot || !cursorLayer) {
    throw new Error('Missing required DOM nodes');
  }

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const cursorsRef = ref(db, `${roomPath}/cursors`);
  const myCursorRef = ref(db, `${roomPath}/cursors/${clientId}`);
  const roomMetaRef = ref(db, `${roomPath}/meta`);

  await update(roomMetaRef, {
    updatedAt: serverTimestamp()
  });

  await set(myCursorRef, {
    x: 0.5,
    y: 0.5,
    name: playerName,
    color: playerColor,
    updatedAt: serverTimestamp()
  });

  onDisconnect(myCursorRef).remove();

  const dots = new Map();

  onValue(cursorsRef, (snapshot) => {
    const allCursors = snapshot.val() || {};
    const activeIds = new Set(Object.keys(allCursors));

    for (const [id, payload] of Object.entries(allCursors)) {
      if (typeof payload?.x !== 'number' || typeof payload?.y !== 'number') {
        continue;
      }

      let dot = dots.get(id);
      if (!dot) {
        dot = document.createElement('div');
        dot.className = 'remote-cursor';
        dot.dataset.clientId = id;

        const label = document.createElement('span');
        label.className = 'cursor-name';
        dot.appendChild(label);

        cursorLayer.appendChild(dot);
        dots.set(id, dot);
      }

      dot.style.left = `${clamp(payload.x, 0, 1) * 100}%`;
      dot.style.top = `${clamp(payload.y, 0, 1) * 100}%`;
      dot.style.background = payload.color || colorFromId(id);

      const nameElement = dot.querySelector('.cursor-name');
      if (nameElement) {
        nameElement.textContent = payload.name || 'player';
      }

      if (id === clientId) {
        dot.style.opacity = '0.85';
      }
    }

    for (const [id, dot] of dots.entries()) {
      if (!activeIds.has(id)) {
        dot.remove();
        dots.delete(id);
      }
    }
  });

  let rafScheduled = false;
  let pendingPosition = null;

  function schedulePublish(event) {
    const rect = tableRoot.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    pendingPosition = {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1)
    };

    if (rafScheduled) {
      return;
    }

    rafScheduled = true;
    window.requestAnimationFrame(() => {
      const next = pendingPosition;
      pendingPosition = null;
      rafScheduled = false;

      if (next) {
        update(myCursorRef, {
          x: next.x,
          y: next.y,
          name: playerName,
          color: playerColor,
          updatedAt: serverTimestamp()
        });
      }
    });
  }

  tableRoot.addEventListener('pointermove', schedulePublish);
}
