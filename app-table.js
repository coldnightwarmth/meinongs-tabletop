import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getDatabase,
  onDisconnect,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
  update
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

const tableRoot = document.getElementById('tableRoot');
const cursorLayer = document.getElementById('cursorLayer');
const roomBadge = document.getElementById('roomBadge');
const statusBadge = document.getElementById('statusBadge');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyLabel = document.getElementById('copyLabel');
const nameToggleButton = document.getElementById('nameToggleButton');
const nameInput = document.getElementById('nameInput');
const cursorColorInput = document.getElementById('cursorColorInput');
const playerControls = document.getElementById('playerControls');

const query = new URLSearchParams(window.location.search);
const roomId = query.get('room');
if (!roomId) {
  window.location.replace('./index.html');
  throw new Error('Missing room id in URL');
}

const playerState = {
  name: (query.get('name') || localStorage.getItem('tabletop-player-name') || '').trim().slice(0, 24),
  color: normalizeHexColor(query.get('color') || localStorage.getItem('tabletop-player-color') || '#ff7a59')
};

const roomPath = `rooms/${roomId}`;
const dots = new Map();

let localPosition = { x: 0.5, y: 0.5 };
let syncCursorState = () => {};

if (roomBadge) {
  roomBadge.textContent = `room: ${roomId}`;
}

if (cursorColorInput) {
  cursorColorInput.value = playerState.color;
}

if (nameInput) {
  nameInput.value = playerState.name;
}

setNameButtonLabel();

nameToggleButton?.addEventListener('click', () => {
  openNameEditor();
});

nameInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    applyNameInput();
    closeNameEditor();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    if (nameInput) {
      nameInput.value = playerState.name;
    }
    closeNameEditor();
  }
});

nameInput?.addEventListener('blur', () => {
  applyNameInput();
  closeNameEditor();
});

cursorColorInput?.addEventListener('input', () => {
  playerState.color = normalizeHexColor(cursorColorInput.value);
  localStorage.setItem('tabletop-player-color', playerState.color);
  syncCursorState();
});

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

function normalizeHexColor(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : '#ff7a59';
}

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

function setRealtimeStatus(text) {
  if (!statusBadge) {
    return;
  }
  statusBadge.textContent = text;
}

function setNameButtonLabel() {
  if (!nameToggleButton) {
    return;
  }
  nameToggleButton.textContent = playerState.name || 'enter name';
}

function openNameEditor() {
  if (!nameToggleButton || !nameInput) {
    return;
  }
  nameToggleButton.classList.add('hidden');
  nameInput.classList.remove('hidden');
  nameInput.value = playerState.name;
  nameInput.focus();
  nameInput.select();
}

function closeNameEditor() {
  if (!nameToggleButton || !nameInput) {
    return;
  }
  nameInput.classList.add('hidden');
  nameToggleButton.classList.remove('hidden');
}

function applyNameInput() {
  if (!nameInput) {
    return;
  }

  const nextName = nameInput.value.trim().slice(0, 24);
  playerState.name = nextName;

  if (nextName) {
    localStorage.setItem('tabletop-player-name', nextName);
  } else {
    localStorage.removeItem('tabletop-player-name');
  }

  setNameButtonLabel();
  syncCursorState();
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

function shouldIgnorePointerEvent(event) {
  if (!(event.target instanceof Element)) {
    return false;
  }
  return Boolean(event.target.closest('#copyLinkButton, #playerControls'));
}

function upsertDot(id, payload) {
  if (!cursorLayer || typeof payload?.x !== 'number' || typeof payload?.y !== 'number') {
    return;
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
    const trimmedName = String(payload.name || '').trim();
    nameElement.textContent = trimmedName;
    nameElement.style.display = trimmedName ? 'inline-block' : 'none';
  }
}

if (hasPlaceholderConfig(firebaseConfig)) {
  showStatusMessage('Add your Firebase config in firebase-config.js to enable realtime syncing.');
} else {
  startRealtimeSession().catch((error) => {
    console.error(error);
    if (String(error?.code || '').includes('PERMISSION_DENIED')) {
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Realtime Database denied access. Update database rules to allow reads/writes for rooms.');
      return;
    }
    setRealtimeStatus('firebase: setup issue');
    showStatusMessage('Firebase setup is incomplete. Check firebase-config.js and Realtime Database settings.');
  });
}

async function startRealtimeSession() {
  if (!tableRoot || !cursorLayer || !playerControls) {
    throw new Error('Missing required DOM nodes');
  }

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const cursorsRef = ref(db, `${roomPath}/cursors`);
  const roomMetaRef = ref(db, `${roomPath}/meta`);
  const connectedRef = ref(db, '.info/connected');

  const myCursorRef = push(cursorsRef);
  const clientId = myCursorRef.key;
  if (!clientId) {
    throw new Error('Failed to create unique cursor ID');
  }

  function buildPayload(position = localPosition) {
    return {
      x: clamp(position.x, 0, 1),
      y: clamp(position.y, 0, 1),
      name: playerState.name,
      color: playerState.color,
      updatedAt: serverTimestamp()
    };
  }

  syncCursorState = (position = localPosition) => {
    localPosition = {
      x: clamp(position.x, 0, 1),
      y: clamp(position.y, 0, 1)
    };
    const payload = buildPayload(localPosition);
    upsertDot(clientId, payload);
    update(myCursorRef, payload).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  };

  await update(roomMetaRef, {
    updatedAt: serverTimestamp()
  });

  await set(myCursorRef, buildPayload(localPosition));
  onDisconnect(myCursorRef).remove();
  upsertDot(clientId, buildPayload(localPosition));
  setRealtimeStatus('firebase: connected');

  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      setRealtimeStatus('firebase: connected');
      return;
    }
    setRealtimeStatus('firebase: reconnecting');
  });

  onValue(
    cursorsRef,
    (snapshot) => {
      const allCursors = snapshot.val() || {};
      const activeIds = new Set(Object.keys(allCursors));

      for (const [id, payload] of Object.entries(allCursors)) {
        upsertDot(id, payload);
      }

      if (!activeIds.has(clientId)) {
        upsertDot(clientId, buildPayload(localPosition));
      }

      for (const [id, dot] of dots.entries()) {
        if (!activeIds.has(id) && id !== clientId) {
          dot.remove();
          dots.delete(id);
        }
      }

      const displayCount = activeIds.has(clientId) ? activeIds.size : activeIds.size + 1;
      setRealtimeStatus(`firebase: connected • cursors: ${displayCount}`);
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Realtime read failed. Check Realtime Database rules for room path access.');
    }
  );

  const activePointers = new Set();
  let rafScheduled = false;
  let pendingPosition = null;

  function schedulePublishFromEvent(event) {
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
      rafScheduled = false;
      const next = pendingPosition;
      pendingPosition = null;

      if (next) {
        syncCursorState(next);
      }
    });
  }

  tableRoot.addEventListener('pointerdown', (event) => {
    if (shouldIgnorePointerEvent(event)) {
      return;
    }
    activePointers.add(event.pointerId);
    tableRoot.setPointerCapture?.(event.pointerId);
    schedulePublishFromEvent(event);
  });

  tableRoot.addEventListener('pointermove', (event) => {
    if (!activePointers.has(event.pointerId)) {
      return;
    }
    schedulePublishFromEvent(event);
  });

  function handlePointerEnd(event) {
    activePointers.delete(event.pointerId);
    if (tableRoot.hasPointerCapture?.(event.pointerId)) {
      tableRoot.releasePointerCapture(event.pointerId);
    }
  }

  tableRoot.addEventListener('pointerup', handlePointerEnd);
  tableRoot.addEventListener('pointercancel', handlePointerEnd);
}
