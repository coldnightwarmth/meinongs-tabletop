import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getDatabase,
  onDisconnect,
  onValue,
  push,
  ref,
  runTransaction,
  serverTimestamp,
  set,
  update
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

const tableRoot = document.getElementById('tableRoot');
const playspaceLayer = document.getElementById('playspaceLayer');
const cardLayer = document.getElementById('cardLayer');
const cursorLayer = document.getElementById('cursorLayer');
const roomBadge = document.getElementById('roomBadge');
const statusBadge = document.getElementById('statusBadge');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyLabel = document.getElementById('copyLabel');
const bottomRightControls = document.getElementById('bottomRightControls');
const assetMenuButton = document.getElementById('assetMenuButton');
const assetMenuModal = document.getElementById('assetMenuModal');
const assetMenuCloseButton = document.getElementById('assetMenuCloseButton');
const coolJpegsTile = document.getElementById('coolJpegsTile');
const clearTableButton = document.getElementById('clearTableButton');
const nameToggleButton = document.getElementById('nameToggleButton');
const nameInput = document.getElementById('nameInput');
const cursorColorInput = document.getElementById('cursorColorInput');
const roomRoster = document.getElementById('roomRoster');
const playerControls = document.getElementById('playerControls');
const bottomLeftControls = document.getElementById('bottomLeftControls');
const homeButton = document.getElementById('homeButton');
const lightModeControl = document.getElementById('lightModeControl');
const lightModeToggle = document.getElementById('lightModeToggle');
const modeIcon = document.getElementById('modeIcon');

const LAST_GAME_URL_KEY = 'tabletop-last-room-url';
const LIGHT_MODE_KEY = 'tabletop-light-mode-enabled';

const WORLD_WIDTH = 7680;
const WORLD_HEIGHT = 4320;
const WORLD_PAN_MARGIN = 500;
const MIN_SCALE = 0.2;
const MAX_SCALE = 2.4;
const BASE_GRID_CELL_SIZE = 42;
const MIN_SCREEN_GRID_CELL_SIZE = 14;
const MIN_WORLD_GRID_LINE_SIZE = 0.25;
const MAX_WORLD_GRID_LINE_SIZE = 7;
const LOW_ZOOM_PIXEL_SNAP_SCALE = 0.35;
const CARD_SIZE_MULTIPLIER = 1.8;
const CARD_WIDTH = 120 * CARD_SIZE_MULTIPLIER;
const CARD_HEIGHT = 168 * CARD_SIZE_MULTIPLIER;
const CARD_FLIP_DURATION_MS = 220;
const DECK_CONTROL_SIZE = 28;
const DECK_CONTROL_GAP = 9;
const DECK_SHUFFLE_FX_DURATION_MS = 980;
const DECK_UI_Z_INDEX = 50000;
const HELD_CARD_Z_INDEX_BASE = DECK_UI_Z_INDEX + 1000;
const DECK_DROP_INDICATOR_OFFSET_Y = 32;
const DECK_KEY = 'cool-jpegs';
const CARD_BACK_IMAGE_SRC = './assets/back.png';
const COOL_JPEGS_FRONT_IMAGES = Array.from({ length: 75 }, (_, index) => `./assets/cards/${1000 + index}.png`);

const query = new URLSearchParams(window.location.search);
const roomId = query.get('room');
if (!roomId) {
  window.location.replace('./index.html');
  throw new Error('Missing room id in URL');
}

const playerState = {
  name: (localStorage.getItem('tabletop-player-name') || '').trim().slice(0, 24),
  color: normalizeHexColor(localStorage.getItem('tabletop-player-color') || '#ff7a59')
};

const roomPath = `rooms/${roomId}`;
const dots = new Map();
const cards = new Map();
const cardElements = new Map();
const cardFaces = new Map();
const cardFlipTimers = new Map();
const selectedCardIds = new Set();

let localPosition = { x: 0.5, y: 0.5 };
let syncCursorState = () => {};
let localClientId = '';
let deckState = null;
let deckShuffleButton = null;
let deckMoveButton = null;
let deckDropIndicator = null;
let deckDropIndicatorVisible = false;
let heldCardLayer = null;
let selectionBoxElement = null;
let deckShuffleFxCards = [];
let deckShuffleFxActive = false;
let deckShuffleFxTimerId = 0;
let spawnCoolJpegsDeck = async () => {
  showStatusMessage('Firebase connection is required before adding a deck.');
};
let clearTabletop = async () => {
  showStatusMessage('Firebase connection is required before clearing the table.');
};
let shuffleCoolJpegsDeck = async () => {};
let onCardPointerDown = () => {};
let onCardContextMenu = () => {};
let onDeckMovePointerDown = () => {};

const camera = {
  scale: 1,
  panX: 0,
  panY: 0
};

function normalizedToWorld(position) {
  return {
    x: clamp(position.x, 0, 1) * WORLD_WIDTH,
    y: clamp(position.y, 0, 1) * WORLD_HEIGHT
  };
}

function worldToNormalized(position) {
  return {
    x: clamp(position.x / WORLD_WIDTH, 0, 1),
    y: clamp(position.y / WORLD_HEIGHT, 0, 1)
  };
}

function worldToScreen(position) {
  return {
    x: position.x * camera.scale + camera.panX,
    y: position.y * camera.scale + camera.panY
  };
}

function getScreenPoint(clientX, clientY) {
  if (!tableRoot) {
    return null;
  }
  const rect = tableRoot.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
    rect
  };
}

function screenToWorldFromClient(clientX, clientY) {
  const screen = getScreenPoint(clientX, clientY);
  if (!screen) {
    return null;
  }
  return {
    x: (screen.x - camera.panX) / camera.scale,
    y: (screen.y - camera.panY) / camera.scale
  };
}

function snapToDevicePixel(value, min = 1) {
  const dpr = window.devicePixelRatio || 1;
  return Math.max(min, Math.round(value * dpr) / dpr);
}

function clampCameraToViewport() {
  if (!tableRoot) {
    return;
  }

  const rect = tableRoot.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const worldScreenWidth = WORLD_WIDTH * camera.scale;
  const worldScreenHeight = WORLD_HEIGHT * camera.scale;
  const marginScreen = WORLD_PAN_MARGIN * camera.scale;

  if (worldScreenWidth + marginScreen * 2 <= rect.width) {
    camera.panX = (rect.width - worldScreenWidth) / 2;
  } else {
    camera.panX = clamp(camera.panX, rect.width - worldScreenWidth - marginScreen, marginScreen);
  }

  if (worldScreenHeight + marginScreen * 2 <= rect.height) {
    camera.panY = (rect.height - worldScreenHeight) / 2;
  } else {
    camera.panY = clamp(camera.panY, rect.height - worldScreenHeight - marginScreen, marginScreen);
  }
}

function positionDot(dot) {
  const normalizedX = Number(dot.dataset.normalizedX ?? 0.5);
  const normalizedY = Number(dot.dataset.normalizedY ?? 0.5);
  const world = normalizedToWorld({ x: normalizedX, y: normalizedY });
  const screen = worldToScreen(world);
  dot.style.left = `${screen.x}px`;
  dot.style.top = `${screen.y}px`;
}

function renderAllDots() {
  for (const dot of dots.values()) {
    positionDot(dot);
  }
}

function getDeckCenterPosition() {
  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
  };
}

function buildCoolJpegsDeck() {
  const deck = {};
  const center = getDeckCenterPosition();
  for (let index = 0; index < COOL_JPEGS_FRONT_IMAGES.length; index += 1) {
    const cardId = `cool-jpegs-${String(index + 1).padStart(3, '0')}`;
    deck[cardId] = {
      x: center.x,
      y: center.y,
      z: index + 1,
      face: 'back',
      frontSrc: COOL_JPEGS_FRONT_IMAGES[index],
      inDeck: true,
      holderClientId: null,
      updatedAt: Date.now()
    };
  }
  return deck;
}

function normalizeDeckPayload(payload) {
  const nextX = Number(payload?.x);
  const nextY = Number(payload?.y);
  const nextShuffleTick = Number(payload?.shuffleTick);
  const holderClientId = typeof payload?.holderClientId === 'string' && payload.holderClientId ? payload.holderClientId : null;
  return {
    x: Number.isFinite(nextX) ? clamp(nextX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2) : WORLD_WIDTH / 2,
    y: Number.isFinite(nextY) ? clamp(nextY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2) : WORLD_HEIGHT / 2,
    shuffleTick: Number.isFinite(nextShuffleTick) ? nextShuffleTick : 0,
    holderClientId
  };
}

function getDeckCardIds() {
  const ids = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (cardState.inDeck) {
      ids.push(cardId);
    }
  }
  return ids;
}

function getDeckTopZ() {
  let maxZ = 1;
  for (const cardState of cards.values()) {
    if (cardState.inDeck) {
      maxZ = Math.max(maxZ, Number(cardState.z) || 1);
    }
  }
  return maxZ;
}

function clearCardFlipTimer(cardId) {
  const timers = cardFlipTimers.get(cardId);
  if (timers) {
    window.clearTimeout(timers.swapTimer);
    window.clearTimeout(timers.endTimer);
    cardFlipTimers.delete(cardId);
  }
}

function ensureDeckShuffleFxElements() {
  if (!cardLayer || deckShuffleFxCards.length === 2) {
    return;
  }

  deckShuffleFxCards = [];
  for (let index = 0; index < 2; index += 1) {
    const cardBack = document.createElement('img');
    cardBack.className = `deck-shuffle-fx deck-shuffle-fx-${index + 1} hidden`;
    cardBack.alt = '';
    cardBack.draggable = false;
    cardBack.decoding = 'async';
    cardBack.loading = 'eager';
    cardBack.src = CARD_BACK_IMAGE_SRC;
    cardLayer.appendChild(cardBack);
    deckShuffleFxCards.push(cardBack);
  }
}

function setDeckShuffleFxActive(active) {
  deckShuffleFxActive = active;
  if (!active) {
    window.clearTimeout(deckShuffleFxTimerId);
    deckShuffleFxTimerId = 0;
  }
  for (const cardBack of deckShuffleFxCards) {
    cardBack.classList.toggle('hidden', !active);
    if (!active) {
      cardBack.classList.remove('is-active');
    }
  }
}

function triggerDeckShuffleFx() {
  ensureDeckShuffleFxElements();
  if (!deckShuffleFxCards.length) {
    return;
  }

  window.clearTimeout(deckShuffleFxTimerId);
  deckShuffleFxTimerId = 0;
  deckShuffleFxActive = true;

  for (const cardBack of deckShuffleFxCards) {
    cardBack.classList.remove('hidden');
    cardBack.classList.remove('is-active');
    // Force animation restart when shuffle is triggered repeatedly.
    void cardBack.offsetWidth;
    cardBack.classList.add('is-active');
  }

  renderDeckControls();
  deckShuffleFxTimerId = window.setTimeout(() => {
    setDeckShuffleFxActive(false);
  }, DECK_SHUFFLE_FX_DURATION_MS);
}

function renderDeckShuffleFx(deckScreen, cardScreenWidth, cardScreenHeight) {
  ensureDeckShuffleFxElements();
  if (!deckShuffleFxCards.length) {
    return;
  }

  if (!deckShuffleFxActive || !deckState) {
    setDeckShuffleFxActive(false);
    return;
  }

  const topDeckZ = getDeckTopZ();
  const baseZ = Math.max(1, topDeckZ - 2);
  const effectWidth = cardScreenWidth * 0.96;
  const effectHeight = cardScreenHeight * 0.96;
  const offsets = [
    { x: -cardScreenWidth * 0.05, y: 0 },
    { x: cardScreenWidth * 0.05, y: 0 }
  ];

  for (let index = 0; index < deckShuffleFxCards.length; index += 1) {
    const cardBack = deckShuffleFxCards[index];
    const offset = offsets[index] || offsets[offsets.length - 1];
    cardBack.style.left = `${deckScreen.x + offset.x}px`;
    cardBack.style.top = `${deckScreen.y + offset.y}px`;
    cardBack.style.width = `${effectWidth}px`;
    cardBack.style.height = `${effectHeight}px`;
    cardBack.style.zIndex = String(baseZ + index);
    cardBack.classList.remove('hidden');
  }
}

function ensureDeckControlElements() {
  if (!tableRoot) {
    return;
  }

  if (!deckShuffleButton) {
    deckShuffleButton = document.createElement('button');
    deckShuffleButton.type = 'button';
    deckShuffleButton.className = 'deck-control-button deck-shuffle-button hidden';
    deckShuffleButton.setAttribute('aria-label', 'shuffle deck');
    deckShuffleButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 7C5.2 5.1 7.4 4 10 4C13.8 4 16.8 6.7 17.6 10.2M20 8V12H16M20 17C18.8 18.9 16.6 20 14 20C10.2 20 7.2 17.3 6.4 13.8M4 16V12H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    deckShuffleButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      deckShuffleButton?.classList.remove('is-pressing');
      void deckShuffleButton?.offsetWidth;
      deckShuffleButton?.classList.add('is-pressing');
      shuffleCoolJpegsDeck().catch((error) => {
        console.error(error);
        setRealtimeStatus('firebase: write blocked');
      });
    });
    deckShuffleButton.addEventListener('animationend', (event) => {
      if (event.animationName === 'deckShufflePress') {
        deckShuffleButton?.classList.remove('is-pressing');
      }
    });
    shieldPointerEvents(deckShuffleButton);
    tableRoot.appendChild(deckShuffleButton);
  }

  if (!deckMoveButton) {
    deckMoveButton = document.createElement('button');
    deckMoveButton.type = 'button';
    deckMoveButton.className = 'deck-control-button deck-move-button hidden';
    deckMoveButton.setAttribute('aria-label', 'move deck');
    deckMoveButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 8H19M5 12H19M5 16H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    deckMoveButton.addEventListener('pointerdown', (event) => {
      onDeckMovePointerDown(event);
    });
    shieldPointerEvents(deckMoveButton);
    tableRoot.appendChild(deckMoveButton);
  }

  if (!deckDropIndicator) {
    deckDropIndicator = document.createElement('div');
    deckDropIndicator.className = 'deck-drop-indicator hidden';
    deckDropIndicator.setAttribute('aria-hidden', 'true');
    deckDropIndicator.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V17M6.5 11.5L12 17L17.5 11.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    tableRoot.appendChild(deckDropIndicator);
  }
}

function hideAllDeckUiElements() {
  if (!tableRoot) {
    return;
  }

  const allDeckControls = tableRoot.querySelectorAll('.deck-control-button');
  for (const control of allDeckControls) {
    control.classList.add('hidden');
    control.classList.remove('is-pressing');
    control.classList.remove('is-held-by-self');
  }

  const allDropIndicators = tableRoot.querySelectorAll('.deck-drop-indicator');
  for (const indicator of allDropIndicators) {
    indicator.classList.add('hidden');
    indicator.classList.remove('is-visible');
  }
}

function removeAllDeckUiArtifacts() {
  if (!tableRoot) {
    return;
  }

  for (const node of tableRoot.querySelectorAll('.deck-control-button, .deck-drop-indicator, .deck-shuffle-fx')) {
    node.remove();
  }
}

function renderDeckControls() {
  const inDeckCount = getDeckCardIds().length;
  if (!deckState || inDeckCount === 0) {
    deckDropIndicatorVisible = false;
    hideAllDeckUiElements();
    setDeckShuffleFxActive(false);
    return;
  }

  ensureDeckControlElements();
  if (!deckShuffleButton || !deckMoveButton || !deckDropIndicator) {
    return;
  }

  const deckScreen = worldToScreen({ x: deckState.x, y: deckState.y });
  const controlSize = DECK_CONTROL_SIZE;
  const controlGap = DECK_CONTROL_GAP;
  const cardScreenWidth = snapToDevicePixel(CARD_WIDTH * camera.scale);
  const cardScreenHeight = (cardScreenWidth * CARD_HEIGHT) / CARD_WIDTH;

  const controlCenterX = deckScreen.x + cardScreenWidth / 2 + controlGap + controlSize / 2;
  const lowerCenterY = deckScreen.y + cardScreenHeight / 2 - controlSize / 2;
  const upperCenterY = lowerCenterY - controlSize - controlGap;

  deckMoveButton.classList.remove('hidden');
  deckMoveButton.style.left = `${controlCenterX}px`;
  deckMoveButton.style.top = `${lowerCenterY}px`;
  deckMoveButton.style.width = `${controlSize}px`;
  deckMoveButton.style.height = `${controlSize}px`;
  deckMoveButton.classList.toggle('is-held-by-self', deckState.holderClientId === localClientId);

  deckShuffleButton.classList.remove('hidden');
  deckShuffleButton.style.left = `${controlCenterX}px`;
  deckShuffleButton.style.top = `${upperCenterY}px`;
  deckShuffleButton.style.width = `${controlSize}px`;
  deckShuffleButton.style.height = `${controlSize}px`;

  deckDropIndicator.style.left = `${deckScreen.x}px`;
  deckDropIndicator.style.top = `${deckScreen.y - cardScreenHeight / 2 - DECK_DROP_INDICATOR_OFFSET_Y}px`;
  deckDropIndicator.classList.toggle('hidden', !deckDropIndicatorVisible);
  deckDropIndicator.classList.toggle('is-visible', deckDropIndicatorVisible);

  renderDeckShuffleFx(deckScreen, cardScreenWidth, cardScreenHeight);
}

function normalizeCardPayload(payload) {
  const nextX = Number(payload?.x);
  const nextY = Number(payload?.y);
  const nextZ = Number(payload?.z);
  const holderClientId = typeof payload?.holderClientId === 'string' && payload.holderClientId ? payload.holderClientId : null;
  const normalizedFrontSrc = String(payload?.frontSrc || '').trim();
  return {
    x: Number.isFinite(nextX) ? clamp(nextX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2) : WORLD_WIDTH / 2,
    y: Number.isFinite(nextY) ? clamp(nextY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2) : WORLD_HEIGHT / 2,
    z: Number.isFinite(nextZ) ? nextZ : 1,
    face: payload?.face === 'front' ? 'front' : 'back',
    frontSrc: normalizedFrontSrc.startsWith('./assets/cards/') ? normalizedFrontSrc : COOL_JPEGS_FRONT_IMAGES[0],
    inDeck: Boolean(payload?.inDeck),
    holderClientId
  };
}

function ensureCardElement(cardId) {
  if (!cardLayer) {
    return null;
  }

  let card = cardElements.get(cardId);
  if (!card) {
    card = document.createElement('button');
    card.type = 'button';
    card.className = 'table-card';
    card.dataset.cardId = cardId;

    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    image.decoding = 'async';
    image.loading = 'lazy';
    card.appendChild(image);

    card.addEventListener('pointerdown', (event) => {
      onCardPointerDown(event, cardId);
    });
    card.addEventListener('contextmenu', (event) => {
      onCardContextMenu(event, cardId);
    });

    cardLayer.appendChild(card);
    cardElements.set(cardId, card);
  }
  return card;
}

function ensureHeldCardLayer() {
  if (!tableRoot) {
    return null;
  }
  if (!heldCardLayer) {
    heldCardLayer = document.createElement('div');
    heldCardLayer.className = 'held-cards-layer';
    heldCardLayer.setAttribute('aria-hidden', 'true');
    tableRoot.appendChild(heldCardLayer);
  }
  return heldCardLayer;
}

function ensureSelectionBoxElement() {
  if (!tableRoot) {
    return null;
  }
  if (!selectionBoxElement) {
    selectionBoxElement = document.createElement('div');
    selectionBoxElement.className = 'selection-box hidden';
    selectionBoxElement.setAttribute('aria-hidden', 'true');
    tableRoot.appendChild(selectionBoxElement);
  }
  return selectionBoxElement;
}

function hideSelectionBox() {
  if (!selectionBoxElement) {
    return;
  }
  selectionBoxElement.classList.add('hidden');
}

function renderSelectionBox(startWorld, endWorld) {
  const box = ensureSelectionBoxElement();
  if (!box || !startWorld || !endWorld) {
    return;
  }
  const startScreen = worldToScreen(startWorld);
  const endScreen = worldToScreen(endWorld);
  const left = Math.min(startScreen.x, endScreen.x);
  const top = Math.min(startScreen.y, endScreen.y);
  const width = Math.abs(endScreen.x - startScreen.x);
  const height = Math.abs(endScreen.y - startScreen.y);

  box.classList.remove('hidden');
  box.dataset.startWorldX = String(startWorld.x);
  box.dataset.startWorldY = String(startWorld.y);
  box.dataset.endWorldX = String(endWorld.x);
  box.dataset.endWorldY = String(endWorld.y);
  box.style.left = `${left}px`;
  box.style.top = `${top}px`;
  box.style.width = `${width}px`;
  box.style.height = `${height}px`;
}

function animateCardFlip(cardId, card, image, nextSrc) {
  clearCardFlipTimer(cardId);
  card.classList.remove('is-flipping');
  // Restart the keyframe cleanly on rapid repeated flips.
  void card.offsetWidth;
  card.classList.add('is-flipping');

  const swapTimer = window.setTimeout(() => {
    if (image.getAttribute('src') !== nextSrc) {
      image.src = nextSrc;
    }
  }, CARD_FLIP_DURATION_MS / 2);

  const endTimer = window.setTimeout(() => {
    card.classList.remove('is-flipping');
    cardFlipTimers.delete(cardId);
  }, CARD_FLIP_DURATION_MS);

  cardFlipTimers.set(cardId, { swapTimer, endTimer });
}

function renderCardElement(cardId) {
  const cardState = cards.get(cardId);
  if (!cardState) {
    return;
  }

  const card = ensureCardElement(cardId);
  if (!card) {
    return;
  }

  const cardWorldX = cardState.inDeck && deckState ? deckState.x : cardState.x;
  const cardWorldY = cardState.inDeck && deckState ? deckState.y : cardState.y;
  const screen = worldToScreen({ x: cardWorldX, y: cardWorldY });
  card.style.left = `${screen.x}px`;
  card.style.top = `${screen.y}px`;
  const cardScreenWidth = snapToDevicePixel(CARD_WIDTH * camera.scale);
  const cardScreenHeight = (cardScreenWidth * CARD_HEIGHT) / CARD_WIDTH;
  card.style.width = `${cardScreenWidth}px`;
  card.style.height = `${cardScreenHeight}px`;
  const heldBySelf = Boolean(localClientId) && cardState.holderClientId === localClientId;
  const heldByOther = Boolean(cardState.holderClientId) && cardState.holderClientId !== localClientId;
  const isHeld = Boolean(cardState.holderClientId);
  if (selectedCardIds.has(cardId) && cardState.holderClientId !== localClientId) {
    selectedCardIds.delete(cardId);
  }
  if (isHeld) {
    const overlayLayer = ensureHeldCardLayer();
    if (overlayLayer && card.parentElement !== overlayLayer) {
      overlayLayer.appendChild(card);
    }
  } else if (cardLayer && card.parentElement !== cardLayer) {
    cardLayer.appendChild(card);
  }

  const rawBaseZ = Math.round(cardState.z || 1);
  const baseZ = clamp(rawBaseZ, 1, DECK_UI_Z_INDEX - 1);
  const renderZ = isHeld ? HELD_CARD_Z_INDEX_BASE + baseZ : baseZ;
  card.style.zIndex = String(renderZ);
  card.classList.toggle('is-held-by-self', heldBySelf);
  card.classList.toggle('is-held-by-other', heldByOther);
  card.classList.toggle('is-group-selected', selectedCardIds.has(cardId));

  const image = card.querySelector('img');
  if (image) {
    const previousFace = cardFaces.get(cardId);
    const nextSrc = cardState.face === 'front' ? cardState.frontSrc : CARD_BACK_IMAGE_SRC;
    const hasLoadedImage = Boolean(image.getAttribute('src'));
    if (previousFace && previousFace !== cardState.face && hasLoadedImage) {
      animateCardFlip(cardId, card, image, nextSrc);
    } else if (image.getAttribute('src') !== nextSrc) {
      image.src = nextSrc;
    }
    cardFaces.set(cardId, cardState.face);
  }
}

function renderAllCards() {
  for (const cardId of cards.keys()) {
    renderCardElement(cardId);
  }
  renderDeckControls();
}

function getGridCellSizeForScale(scale) {
  let cellSize = BASE_GRID_CELL_SIZE;
  while (cellSize * scale < MIN_SCREEN_GRID_CELL_SIZE) {
    cellSize *= 2;
  }
  return cellSize;
}

function getGridLineSizeForScale(scale) {
  const lowZoomBoost = clamp((0.34 - scale) / 0.14, 0, 1) * 0.2;
  const targetScreenLineSize = 1 + lowZoomBoost;
  return clamp(targetScreenLineSize / scale, MIN_WORLD_GRID_LINE_SIZE, MAX_WORLD_GRID_LINE_SIZE);
}

function snapScreenTranslation(value) {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

function applyCamera() {
  clampCameraToViewport();
  if (camera.scale <= LOW_ZOOM_PIXEL_SNAP_SCALE) {
    camera.panX = snapScreenTranslation(camera.panX);
    camera.panY = snapScreenTranslation(camera.panY);
  }
  if (playspaceLayer) {
    const gridLineSize = getGridLineSizeForScale(camera.scale);
    const gridCellSize = getGridCellSizeForScale(camera.scale);
    playspaceLayer.style.setProperty('--grid-line-size', `${gridLineSize}px`);
    playspaceLayer.style.setProperty('--grid-cell-size', `${gridCellSize}px`);
    playspaceLayer.style.transform = `translate(${camera.panX}px, ${camera.panY}px) scale(${camera.scale})`;
  }
  renderAllCards();
  if (selectionBoxElement && !selectionBoxElement.classList.contains('hidden')) {
    const startWorldX = Number(selectionBoxElement.dataset.startWorldX || 0);
    const startWorldY = Number(selectionBoxElement.dataset.startWorldY || 0);
    const endWorldX = Number(selectionBoxElement.dataset.endWorldX || 0);
    const endWorldY = Number(selectionBoxElement.dataset.endWorldY || 0);
    renderSelectionBox({ x: startWorldX, y: startWorldY }, { x: endWorldX, y: endWorldY });
  }
  renderAllDots();
}

function setZoomAtClient(clientX, clientY, nextScale) {
  const screen = getScreenPoint(clientX, clientY);
  if (!screen) {
    return;
  }

  const worldX = (screen.x - camera.panX) / camera.scale;
  const worldY = (screen.y - camera.panY) / camera.scale;

  camera.scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  camera.panX = screen.x - worldX * camera.scale;
  camera.panY = screen.y - worldY * camera.scale;
  applyCamera();
}

function initializeCamera() {
  if (!tableRoot || !playspaceLayer) {
    return;
  }

  playspaceLayer.style.width = `${WORLD_WIDTH}px`;
  playspaceLayer.style.height = `${WORLD_HEIGHT}px`;

  const rect = tableRoot.getBoundingClientRect();
  camera.scale = 1;
  camera.panX = rect.width / 2 - (WORLD_WIDTH * camera.scale) / 2;
  camera.panY = rect.height / 2 - (WORLD_HEIGHT * camera.scale) / 2;
  applyCamera();
}

function setModeIcon(lightModeEnabled) {
  if (!modeIcon) {
    return;
  }

  if (lightModeEnabled) {
    modeIcon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" stroke-width="2"/><path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M19.07 4.93L16.95 7.05M7.05 16.95L4.93 19.07" stroke-width="2" stroke-linecap="round"/></svg>';
    return;
  }

  modeIcon.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform:scaleX(-1)"><path d="M20 15.5A8.5 8.5 0 1 1 8.5 4a7 7 0 1 0 11.5 11.5Z" stroke-width="2" stroke-linejoin="round"/></svg>';
}

function setLightMode(enabled) {
  tableRoot?.classList.toggle('light-mode', enabled);
  setModeIcon(enabled);
}

const storedLightMode = localStorage.getItem(LIGHT_MODE_KEY);
const hasLightModeEnabled = storedLightMode === null ? true : storedLightMode === '1';
if (storedLightMode === null) {
  localStorage.setItem(LIGHT_MODE_KEY, '1');
}
setLightMode(hasLightModeEnabled);
if (lightModeToggle) {
  lightModeToggle.checked = hasLightModeEnabled;
  lightModeToggle.addEventListener('change', () => {
    const enabled = lightModeToggle.checked;
    setLightMode(enabled);
    localStorage.setItem(LIGHT_MODE_KEY, enabled ? '1' : '0');
  });
}

if (roomBadge) {
  roomBadge.textContent = `room: ${roomId}`;
}

const shareUrl = new URL(window.location.href);
shareUrl.searchParams.set('room', roomId);
const hadLegacyIdentityParams = shareUrl.searchParams.has('name') || shareUrl.searchParams.has('color');
shareUrl.searchParams.delete('name');
shareUrl.searchParams.delete('color');
if (hadLegacyIdentityParams) {
  window.history.replaceState({}, '', shareUrl.toString());
}
localStorage.setItem(LAST_GAME_URL_KEY, `${shareUrl.pathname}${shareUrl.search}`);

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
    await navigator.clipboard.writeText(shareUrl.toString());
  } catch {
    const fallback = document.createElement('textarea');
    fallback.value = shareUrl.toString();
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

function openAssetMenu() {
  if (!assetMenuModal) {
    return;
  }
  assetMenuModal.classList.remove('hidden');
}

function closeAssetMenu() {
  if (!assetMenuModal) {
    return;
  }
  assetMenuModal.classList.add('hidden');
}

assetMenuButton?.addEventListener('click', () => {
  openAssetMenu();
});

assetMenuCloseButton?.addEventListener('click', () => {
  closeAssetMenu();
});

coolJpegsTile?.addEventListener('click', () => {
  closeAssetMenu();
  spawnCoolJpegsDeck().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

clearTableButton?.addEventListener('click', () => {
  closeAssetMenu();
  clearTabletop().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

assetMenuModal?.addEventListener('pointerdown', (event) => {
  if (event.target === assetMenuModal) {
    closeAssetMenu();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && assetMenuModal && !assetMenuModal.classList.contains('hidden')) {
    closeAssetMenu();
  }
});

function initializeTileTilt(tile) {
  if (!tile) {
    return;
  }

  const maxTilt = 9;

  tile.addEventListener('pointermove', (event) => {
    const rect = tile.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const tiltY = (x - 0.5) * maxTilt * 2;
    const tiltX = (0.5 - y) * maxTilt * 2;

    tile.style.setProperty('--tile-tilt-x', `${tiltX.toFixed(2)}deg`);
    tile.style.setProperty('--tile-tilt-y', `${tiltY.toFixed(2)}deg`);
    tile.style.setProperty('--tile-gloss-x', `${(x * 100).toFixed(2)}%`);
    tile.style.setProperty('--tile-gloss-y', `${(y * 100).toFixed(2)}%`);
  });

  tile.addEventListener('pointerleave', () => {
    tile.style.setProperty('--tile-tilt-x', '0deg');
    tile.style.setProperty('--tile-tilt-y', '0deg');
  });
}

initializeTileTilt(coolJpegsTile);

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
  const targetNode = event.target;
  const targetElement = targetNode instanceof Element ? targetNode : targetNode?.parentElement || null;
  if (!targetElement) {
    return false;
  }
  return Boolean(
    targetElement.closest(
      '#copyLinkButton, #bottomRightControls, #assetMenuModal, #playerControls, #bottomLeftControls, .deck-control-button'
    )
  );
}

function shieldPointerEvents(element) {
  if (!element) {
    return;
  }
  element.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
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

  dot.dataset.normalizedX = String(clamp(payload.x, 0, 1));
  dot.dataset.normalizedY = String(clamp(payload.y, 0, 1));
  positionDot(dot);
  dot.style.background = payload.color || colorFromId(id);

  const nameElement = dot.querySelector('.cursor-name');
  if (nameElement) {
    const trimmedName = String(payload.name || '').trim();
    nameElement.textContent = trimmedName;
    nameElement.style.display = trimmedName ? 'inline-block' : 'none';
  }
}

function renderRoomRoster(allCursors, localId) {
  if (!roomRoster) {
    return;
  }

  roomRoster.textContent = '';
  const entries = Object.entries(allCursors || {}).filter(([id]) => id !== localId);
  if (entries.length === 0) {
    roomRoster.classList.add('hidden');
    return;
  }

  entries.sort(([leftId, leftPayload], [rightId, rightPayload]) => {
    const leftName = String(leftPayload?.name || '').trim().toLowerCase() || leftId;
    const rightName = String(rightPayload?.name || '').trim().toLowerCase() || rightId;
    return leftName.localeCompare(rightName);
  });

  const fragment = document.createDocumentFragment();
  for (const [id, payload] of entries) {
    const row = document.createElement('div');
    row.className = 'room-roster-item';

    const dot = document.createElement('span');
    dot.className = 'room-roster-dot';
    dot.style.background = payload?.color || colorFromId(id);
    row.appendChild(dot);

    const label = document.createElement('span');
    label.className = 'room-roster-name';
    const trimmedName = String(payload?.name || '').trim();
    label.textContent = trimmedName || 'unnamed';
    row.appendChild(label);

    fragment.appendChild(row);
  }

  roomRoster.appendChild(fragment);
  roomRoster.classList.remove('hidden');
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

shieldPointerEvents(copyLinkButton);
shieldPointerEvents(bottomRightControls);
shieldPointerEvents(assetMenuButton);
shieldPointerEvents(assetMenuModal);
shieldPointerEvents(assetMenuCloseButton);
shieldPointerEvents(clearTableButton);
shieldPointerEvents(playerControls);
shieldPointerEvents(bottomLeftControls);
shieldPointerEvents(homeButton);
shieldPointerEvents(lightModeControl);

async function startRealtimeSession() {
  if (!tableRoot || !playspaceLayer || !cardLayer || !cursorLayer || !playerControls) {
    throw new Error('Missing required DOM nodes');
  }

  initializeCamera();

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const cursorsRef = ref(db, `${roomPath}/cursors`);
  const cardsRef = ref(db, `${roomPath}/cards`);
  const deckRef = ref(db, `${roomPath}/decks/${DECK_KEY}`);
  const deckShuffleTickRef = ref(db, `${roomPath}/decks/${DECK_KEY}/shuffleTick`);
  const roomMetaRef = ref(db, `${roomPath}/meta`);
  const connectedRef = ref(db, '.info/connected');

  const myCursorRef = push(cursorsRef);
  const clientId = myCursorRef.key;
  if (!clientId) {
    throw new Error('Failed to create unique cursor ID');
  }
  localClientId = clientId;

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

  let cardWriteScheduled = false;
  const pendingCardWrites = new Map();
  let cardWriteGeneration = 0;
  let cardDragState = null;
  let groupDragState = null;
  let selectionBoxState = null;
  let suppressNextCardContextMenu = false;
  let deckWriteScheduled = false;
  let pendingDeckPatch = {};
  let deckWriteGeneration = 0;
  let deckDragState = null;
  let isTableResetting = false;

  function setDeckDropIndicator(visible) {
    const nextVisible = Boolean(cardDragState || groupDragState) && Boolean(visible);
    if (deckDropIndicatorVisible === nextVisible) {
      return;
    }
    deckDropIndicatorVisible = nextVisible;
    renderDeckControls();
  }

  function queueCardPatch(cardId, patch) {
    if (isTableResetting) {
      return;
    }
    const queuedPatch = pendingCardWrites.get(cardId) || {};
    pendingCardWrites.set(cardId, { ...queuedPatch, ...patch });
    if (cardWriteScheduled) {
      return;
    }

    cardWriteScheduled = true;
    const scheduledGeneration = cardWriteGeneration;
    window.requestAnimationFrame(() => {
      cardWriteScheduled = false;
      if (scheduledGeneration !== cardWriteGeneration) {
        return;
      }
      for (const [pendingCardId, pendingPatch] of pendingCardWrites.entries()) {
        pendingCardWrites.delete(pendingCardId);
        update(ref(db, `${roomPath}/cards/${pendingCardId}`), {
          ...pendingPatch,
          updatedAt: serverTimestamp()
        }).catch((error) => {
          console.error(error);
          setRealtimeStatus('firebase: write blocked');
        });
      }
    });
  }

  function queueDeckPatch(patch) {
    if (isTableResetting) {
      return;
    }
    pendingDeckPatch = { ...pendingDeckPatch, ...patch };
    if (deckWriteScheduled) {
      return;
    }

    deckWriteScheduled = true;
    const scheduledGeneration = deckWriteGeneration;
    window.requestAnimationFrame(() => {
      deckWriteScheduled = false;
      if (scheduledGeneration !== deckWriteGeneration) {
        return;
      }
      const payload = pendingDeckPatch;
      pendingDeckPatch = {};
      if (!payload || Object.keys(payload).length === 0) {
        return;
      }
      update(deckRef, {
        ...payload,
        updatedAt: serverTimestamp()
      }).catch((error) => {
        console.error(error);
        setRealtimeStatus('firebase: write blocked');
      });
    });
  }

  function patchLocalCard(cardId, patch) {
    const existingCard = cards.get(cardId);
    if (!existingCard) {
      return;
    }
    cards.set(cardId, normalizeCardPayload({ ...existingCard, ...patch }));
    renderCardElement(cardId);
  }

  function patchLocalDeck(patch) {
    const baseDeck = deckState || normalizeDeckPayload(getDeckCenterPosition());
    deckState = normalizeDeckPayload({ ...baseDeck, ...patch });
    renderAllCards();
  }

  function getTopCardZ() {
    let topZ = 0;
    for (const cardState of cards.values()) {
      topZ = Math.max(topZ, Number(cardState.z) || 0);
    }
    return topZ;
  }

  function getDeckCardIdsInOrder() {
    return getDeckCardIds().sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
  }

  function isPositionOverDeck(x, y) {
    if (!deckState) {
      return false;
    }
    return Math.abs(x - deckState.x) <= CARD_WIDTH / 2 && Math.abs(y - deckState.y) <= CARD_HEIGHT / 2;
  }

  function buildDeckDropPatch(cardId) {
    if (!deckState) {
      return null;
    }

    const cardState = cards.get(cardId);
    if (!cardState) {
      return null;
    }

    if (!isPositionOverDeck(cardState.x, cardState.y)) {
      return null;
    }

    return {
      x: deckState.x,
      y: deckState.y,
      z: getDeckTopZ() + 1,
      inDeck: true,
      holderClientId: null
    };
  }

  async function bringDeckToFront() {
    const orderedDeckCards = getDeckCardIdsInOrder();
    if (orderedDeckCards.length === 0) {
      return;
    }

    const startingTopZ = getTopCardZ();
    const updatesByPath = {};
    for (let index = 0; index < orderedDeckCards.length; index += 1) {
      const cardId = orderedDeckCards[index];
      const nextZ = startingTopZ + index + 1;
      patchLocalCard(cardId, { z: nextZ });
      updatesByPath[`${cardId}/z`] = nextZ;
      updatesByPath[`${cardId}/updatedAt`] = serverTimestamp();
    }

    await update(cardsRef, updatesByPath);
  }

  async function acquireCardLock(cardId) {
    const holderRef = ref(db, `${roomPath}/cards/${cardId}/holderClientId`);
    const result = await runTransaction(
      holderRef,
      (currentHolder) => {
        if (typeof currentHolder === 'string' && currentHolder && currentHolder !== clientId) {
          return;
        }
        return clientId;
      },
      { applyLocally: false }
    );
    if (!result.committed || result.snapshot.val() !== clientId) {
      return false;
    }
    onDisconnect(holderRef).set(null);
    return true;
  }

  async function releaseCardLock(cardId) {
    const holderRef = ref(db, `${roomPath}/cards/${cardId}/holderClientId`);
    await runTransaction(
      holderRef,
      (currentHolder) => {
        if (currentHolder !== clientId) {
          return;
        }
        return null;
      },
      { applyLocally: false }
    );
  }

  function getMovableSelectedIds() {
    return Array.from(selectedCardIds).filter((cardId) => {
      const cardState = cards.get(cardId);
      return Boolean(cardState) && !cardState.inDeck && cardState.holderClientId === clientId;
    });
  }

  function releaseSelectedCards() {
    const selectedIds = Array.from(selectedCardIds);
    selectedCardIds.clear();
    for (const cardId of selectedIds) {
      const cardState = cards.get(cardId);
      if (cardState?.holderClientId === clientId) {
        patchLocalCard(cardId, { holderClientId: null });
        queueCardPatch(cardId, { holderClientId: null });
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      } else {
        renderCardElement(cardId);
      }
    }
  }

  async function applySelectionFromBox(startWorld, endWorld) {
    const minX = Math.min(startWorld.x, endWorld.x);
    const maxX = Math.max(startWorld.x, endWorld.x);
    const minY = Math.min(startWorld.y, endWorld.y);
    const maxY = Math.max(startWorld.y, endWorld.y);

    const candidates = [];
    for (const [cardId, cardState] of cards.entries()) {
      if (cardState.inDeck) {
        continue;
      }
      if (cardState.holderClientId && cardState.holderClientId !== clientId) {
        continue;
      }
      if (cardState.x >= minX && cardState.x <= maxX && cardState.y >= minY && cardState.y <= maxY) {
        candidates.push(cardId);
      }
    }

    releaseSelectedCards();
    if (candidates.length === 0) {
      return;
    }

    let nextTopZ = getTopCardZ();
    for (const cardId of candidates) {
      const acquired = await acquireCardLock(cardId);
      if (!acquired) {
        continue;
      }
      nextTopZ += 1;
      selectedCardIds.add(cardId);
      const patch = {
        z: nextTopZ,
        inDeck: false,
        holderClientId: clientId
      };
      patchLocalCard(cardId, patch);
      queueCardPatch(cardId, patch);
    }
  }

  function beginGroupDrag(event, cardId) {
    if (!selectedCardIds.has(cardId) || cardDragState || groupDragState) {
      return false;
    }

    const selectedIds = getMovableSelectedIds();
    if (selectedIds.length === 0) {
      selectedCardIds.clear();
      return false;
    }

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }

    const anchorCard = cards.get(cardId);
    if (!anchorCard) {
      return false;
    }

    const basePositions = new Map();
    for (const selectedId of selectedIds) {
      const cardState = cards.get(selectedId);
      if (!cardState) {
        continue;
      }
      basePositions.set(selectedId, { x: cardState.x, y: cardState.y });
    }

    groupDragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      anchorOffsetX: worldPoint.x - anchorCard.x,
      anchorOffsetY: worldPoint.y - anchorCard.y,
      anchorCardId: cardId,
      basePositions
    };

    return true;
  }

  function handleGroupDragMove(event) {
    if (!groupDragState || event.pointerId !== groupDragState.pointerId) {
      return false;
    }

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      setDeckDropIndicator(false);
      return true;
    }

    const anchorNextX = clamp(worldPoint.x - groupDragState.anchorOffsetX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
    const anchorNextY = clamp(worldPoint.y - groupDragState.anchorOffsetY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
    const anchorBase = groupDragState.basePositions.get(groupDragState.anchorCardId);
    const deltaX = anchorBase ? anchorNextX - anchorBase.x : 0;
    const deltaY = anchorBase ? anchorNextY - anchorBase.y : 0;

    let overDeck = false;
    for (const [selectedId, base] of groupDragState.basePositions.entries()) {
      const nextX = clamp(base.x + deltaX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
      const nextY = clamp(base.y + deltaY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
      if (isPositionOverDeck(nextX, nextY)) {
        overDeck = true;
      }
      const patch = {
        x: nextX,
        y: nextY,
        inDeck: false,
        holderClientId: clientId
      };
      patchLocalCard(selectedId, patch);
      queueCardPatch(selectedId, patch);
    }

    setDeckDropIndicator(overDeck);
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
    return true;
  }

  function handleGroupDragEnd(event) {
    if (!groupDragState || event.pointerId !== groupDragState.pointerId) {
      return false;
    }

    const selectedIds = getMovableSelectedIds();
    groupDragState = null;
    setDeckDropIndicator(false);

    if (selectedIds.length === 0) {
      return true;
    }

    const shouldStackOnDeck = Boolean(deckState) && selectedIds.some((cardId) => {
      const cardState = cards.get(cardId);
      return Boolean(cardState) && isPositionOverDeck(cardState.x, cardState.y);
    });

    if (shouldStackOnDeck && deckState) {
      selectedCardIds.clear();
      let nextDeckZ = getDeckTopZ() + 1;
      for (const cardId of selectedIds) {
        const patch = {
          x: deckState.x,
          y: deckState.y,
          z: nextDeckZ,
          inDeck: true,
          holderClientId: null
        };
        nextDeckZ += 1;
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
    }

    schedulePublishFromClient(event.clientX, event.clientY);
    return true;
  }

  async function acquireDeckLock() {
    const holderRef = ref(db, `${roomPath}/decks/${DECK_KEY}/holderClientId`);
    const result = await runTransaction(
      holderRef,
      (currentHolder) => {
        if (typeof currentHolder === 'string' && currentHolder && currentHolder !== clientId) {
          return;
        }
        return clientId;
      },
      { applyLocally: false }
    );
    if (!result.committed || result.snapshot.val() !== clientId) {
      return false;
    }
    onDisconnect(holderRef).set(null);
    return true;
  }

  async function releaseDeckLock() {
    const holderRef = ref(db, `${roomPath}/decks/${DECK_KEY}/holderClientId`);
    await runTransaction(
      holderRef,
      (currentHolder) => {
        if (currentHolder !== clientId) {
          return;
        }
        return null;
      },
      { applyLocally: false }
    );
  }

  async function handleCardFlip(cardId) {
    const cardRef = ref(db, `${roomPath}/cards/${cardId}`);
    await runTransaction(
      cardRef,
      (currentCard) => {
        if (!currentCard || typeof currentCard !== 'object') {
          return;
        }
        const holder = typeof currentCard.holderClientId === 'string' ? currentCard.holderClientId : null;
        if (holder && holder !== clientId) {
          return;
        }
        return {
          ...currentCard,
          face: currentCard.face === 'front' ? 'back' : 'front',
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
  }

  async function handleSelectedGroupFlip(anchorCardId) {
    if (selectedCardIds.size < 2 || !selectedCardIds.has(anchorCardId)) {
      return false;
    }

    const anchorCard = cards.get(anchorCardId);
    if (!anchorCard || anchorCard.holderClientId !== clientId) {
      return false;
    }

    const sourceFace = anchorCard.face === 'front' ? 'front' : 'back';
    const nextFace = sourceFace === 'front' ? 'back' : 'front';
    const selectedIds = getMovableSelectedIds().filter((cardId) => {
      const cardState = cards.get(cardId);
      return Boolean(cardState) && cardState.face === sourceFace;
    });
    if (selectedIds.length === 0) {
      return false;
    }

    const updatesByPath = {};
    for (const selectedId of selectedIds) {
      patchLocalCard(selectedId, { face: nextFace });
      updatesByPath[`${selectedId}/face`] = nextFace;
      updatesByPath[`${selectedId}/updatedAt`] = serverTimestamp();
    }
    await update(cardsRef, updatesByPath);
    return true;
  }

  async function handleCardFlipIntent(cardId) {
    const flippedGroup = await handleSelectedGroupFlip(cardId);
    if (flippedGroup) {
      return;
    }
    await handleCardFlip(cardId);
  }

  const activePointers = new Set();
  const touchPointers = new Map();
  let mousePanState = null;
  let touchPanState = null;
  let pinchState = null;
  let rafScheduled = false;
  let pendingPosition = null;

  function schedulePublishFromClient(clientX, clientY) {
    const world = screenToWorldFromClient(clientX, clientY);
    if (!world) {
      return;
    }

    pendingPosition = worldToNormalized(world);

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

  function schedulePublishFromEvent(event) {
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function startSelectionBox(event) {
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return;
    }
    const targetCardElement = event.target instanceof Element ? event.target.closest('.table-card') : null;
    const targetCardId = targetCardElement?.getAttribute('data-card-id') || null;
    selectionBoxState = {
      pointerId: event.pointerId,
      startWorldX: worldPoint.x,
      startWorldY: worldPoint.y,
      endWorldX: worldPoint.x,
      endWorldY: worldPoint.y,
      startClientX: event.clientX,
      startClientY: event.clientY,
      targetCardId,
      moved: false
    };
    hideSelectionBox();
  }

  function updateSelectionBox(event) {
    if (!selectionBoxState || event.pointerId !== selectionBoxState.pointerId) {
      return false;
    }

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return true;
    }

    selectionBoxState.endWorldX = worldPoint.x;
    selectionBoxState.endWorldY = worldPoint.y;
    if (!selectionBoxState.moved) {
      const movedDistance = Math.hypot(event.clientX - selectionBoxState.startClientX, event.clientY - selectionBoxState.startClientY);
      selectionBoxState.moved = movedDistance > 6;
    }

    if (selectionBoxState.moved) {
      renderSelectionBox(
        { x: selectionBoxState.startWorldX, y: selectionBoxState.startWorldY },
        { x: selectionBoxState.endWorldX, y: selectionBoxState.endWorldY }
      );
    }
    return true;
  }

  async function finalizeSelectionBox(event) {
    if (!selectionBoxState || event.pointerId !== selectionBoxState.pointerId) {
      return false;
    }

    const completedSelection = selectionBoxState;
    selectionBoxState = null;
    hideSelectionBox();

    if (!completedSelection.moved) {
      if (completedSelection.targetCardId) {
        suppressNextCardContextMenu = true;
        await handleCardFlipIntent(completedSelection.targetCardId);
      }
      return true;
    }

    suppressNextCardContextMenu = true;
    await applySelectionFromBox(
      { x: completedSelection.startWorldX, y: completedSelection.startWorldY },
      { x: completedSelection.endWorldX, y: completedSelection.endWorldY }
    );
    return true;
  }

  async function handleCardPointerDown(event, cardId) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDeckDropIndicator(false);
    if (cardDragState || groupDragState) {
      return;
    }

    const existingCard = cards.get(cardId);
    if (!existingCard) {
      return;
    }

    if (selectedCardIds.size > 0) {
      if (selectedCardIds.has(cardId) && beginGroupDrag(event, cardId)) {
        const target = event.currentTarget;
        if (target instanceof Element) {
          target.setPointerCapture?.(event.pointerId);
        }
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      if (!selectedCardIds.has(cardId)) {
        releaseSelectedCards();
      }
    }

    if (existingCard.holderClientId && existingCard.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireCardLock(cardId);
    if (!acquired) {
      return;
    }

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      await releaseCardLock(cardId);
      return;
    }

    const latestCard = cards.get(cardId) || existingCard;
    const cardStartX = latestCard.inDeck && deckState ? deckState.x : latestCard.x;
    const cardStartY = latestCard.inDeck && deckState ? deckState.y : latestCard.y;
    cardDragState = {
      cardId,
      pointerId: event.pointerId,
      offsetX: worldPoint.x - cardStartX,
      offsetY: worldPoint.y - cardStartY
    };

    const topZ = getTopCardZ() + 1;
    const startPatch = {
      x: cardStartX,
      y: cardStartY,
      inDeck: false,
      holderClientId: clientId,
      z: topZ
    };
    patchLocalCard(cardId, startPatch);
    queueCardPatch(cardId, startPatch);

    const target = event.currentTarget;
    if (target instanceof Element) {
      target.setPointerCapture?.(event.pointerId);
    }
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function handleCardDragMove(event) {
    if (handleGroupDragMove(event)) {
      return;
    }

    if (!cardDragState || event.pointerId !== cardDragState.pointerId) {
      return;
    }

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      setDeckDropIndicator(false);
      return;
    }

    const nextX = clamp(worldPoint.x - cardDragState.offsetX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
    const nextY = clamp(worldPoint.y - cardDragState.offsetY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
    setDeckDropIndicator(isPositionOverDeck(nextX, nextY));

    patchLocalCard(cardDragState.cardId, {
      x: nextX,
      y: nextY,
      inDeck: false,
      holderClientId: clientId
    });
    queueCardPatch(cardDragState.cardId, {
      x: nextX,
      y: nextY,
      inDeck: false,
      holderClientId: clientId
    });
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleCardDragEnd(event) {
    if (handleGroupDragEnd(event)) {
      return;
    }

    if (!cardDragState || event.pointerId !== cardDragState.pointerId) {
      return;
    }

    const finishedDrag = cardDragState;
    cardDragState = null;
    setDeckDropIndicator(false);
    const finalPatch = buildDeckDropPatch(finishedDrag.cardId) || { holderClientId: null };

    patchLocalCard(finishedDrag.cardId, finalPatch);
    queueCardPatch(finishedDrag.cardId, finalPatch);
    releaseCardLock(finishedDrag.cardId).catch((error) => {
      console.error(error);
    });
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  onCardPointerDown = (event, cardId) => {
    handleCardPointerDown(event, cardId).catch((error) => {
      console.error(error);
    });
  };
  onCardContextMenu = (event, cardId) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressNextCardContextMenu) {
      suppressNextCardContextMenu = false;
      return;
    }
    handleCardFlipIntent(cardId).catch((error) => {
      console.error(error);
    });
  };

  async function handleDeckMovePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (!deckState || deckDragState) {
      return;
    }

    if (deckState.holderClientId && deckState.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireDeckLock();
    if (!acquired) {
      return;
    }

    await bringDeckToFront();

    deckDragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: deckState.x,
      startY: deckState.y
    };

    patchLocalDeck({ holderClientId: clientId });
    queueDeckPatch({ holderClientId: clientId });

    const target = event.currentTarget;
    if (target instanceof Element) {
      target.setPointerCapture?.(event.pointerId);
    }
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function handleDeckDragMove(event) {
    if (!deckDragState || event.pointerId !== deckDragState.pointerId) {
      return;
    }

    const deltaX = (event.clientX - deckDragState.startClientX) / camera.scale;
    const deltaY = (event.clientY - deckDragState.startClientY) / camera.scale;
    const nextX = clamp(deckDragState.startX + deltaX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
    const nextY = clamp(deckDragState.startY + deltaY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);

    patchLocalDeck({
      x: nextX,
      y: nextY,
      holderClientId: clientId
    });
    queueDeckPatch({
      x: nextX,
      y: nextY,
      holderClientId: clientId
    });
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleDeckDragEnd(event) {
    if (!deckDragState || event.pointerId !== deckDragState.pointerId) {
      return;
    }

    deckDragState = null;
    patchLocalDeck({ holderClientId: null });
    queueDeckPatch({ holderClientId: null });
    releaseDeckLock().catch((error) => {
      console.error(error);
    });
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleDeckShuffle() {
    if (deckState?.holderClientId && deckState.holderClientId !== clientId) {
      return;
    }
    const deckCardIds = getDeckCardIds();
    if (deckCardIds.length < 2) {
      return;
    }

    for (let index = deckCardIds.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = deckCardIds[index];
      deckCardIds[index] = deckCardIds[swapIndex];
      deckCardIds[swapIndex] = temp;
    }

    const updatesByPath = {};
    for (let index = 0; index < deckCardIds.length; index += 1) {
      const cardId = deckCardIds[index];
      const nextZ = index + 1;
      patchLocalCard(cardId, { z: nextZ });
      updatesByPath[`${cardId}/z`] = nextZ;
      updatesByPath[`${cardId}/updatedAt`] = serverTimestamp();
    }
    await update(cardsRef, updatesByPath);

    await runTransaction(
      deckShuffleTickRef,
      (currentTick) => {
        const parsed = Number(currentTick);
        return Number.isFinite(parsed) ? parsed + 1 : 1;
      },
      { applyLocally: false }
    );
  }

  onDeckMovePointerDown = (event) => {
    handleDeckMovePointerDown(event).catch((error) => {
      console.error(error);
    });
  };
  shuffleCoolJpegsDeck = async () => {
    await handleDeckShuffle();
  };

  spawnCoolJpegsDeck = async () => {
    await runTransaction(
      cardsRef,
      (currentCards) => {
        if (currentCards && Object.keys(currentCards).length > 0) {
          return;
        }
        return buildCoolJpegsDeck();
      },
      { applyLocally: false }
    );

    await runTransaction(
      deckRef,
      (currentDeck) => {
        if (currentDeck && typeof currentDeck === 'object') {
          return currentDeck;
        }
        const center = getDeckCenterPosition();
        return {
          x: center.x,
          y: center.y,
          shuffleTick: 0,
          holderClientId: null,
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
  };

  function resetLocalTabletopState() {
    cardWriteGeneration += 1;
    deckWriteGeneration += 1;
    cardWriteScheduled = false;
    deckWriteScheduled = false;
    setDeckDropIndicator(false);
    deckDropIndicatorVisible = false;
    selectedCardIds.clear();
    pendingCardWrites.clear();
    pendingDeckPatch = {};
    cardDragState = null;
    groupDragState = null;
    selectionBoxState = null;
    suppressNextCardContextMenu = false;
    deckDragState = null;
    hideSelectionBox();
    setDeckShuffleFxActive(false);
    hideAllDeckUiElements();
    if (deckShuffleButton) {
      deckShuffleButton.remove();
      deckShuffleButton = null;
    }
    if (deckMoveButton) {
      deckMoveButton.remove();
      deckMoveButton = null;
    }
    if (deckDropIndicator) {
      deckDropIndicator.remove();
      deckDropIndicator = null;
    }
    for (const fxCard of deckShuffleFxCards) {
      fxCard.remove();
    }
    removeAllDeckUiArtifacts();
    deckShuffleFxCards = [];
    deckShuffleFxActive = false;
    window.clearTimeout(deckShuffleFxTimerId);
    deckShuffleFxTimerId = 0;

    for (const cardId of cardElements.keys()) {
      clearCardFlipTimer(cardId);
      cardFaces.delete(cardId);
    }
    for (const cardElement of cardElements.values()) {
      cardElement.remove();
    }
    if (heldCardLayer) {
      heldCardLayer.textContent = '';
    }
    cards.clear();
    cardElements.clear();
    deckState = null;
  }

  clearTabletop = async () => {
    isTableResetting = true;
    try {
      resetLocalTabletopState();

      await update(ref(db, roomPath), {
        cards: null,
        decks: null
      });
    } finally {
      isTableResetting = false;
    }
  };

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

      renderRoomRoster(allCursors, clientId);

      const displayCount = activeIds.has(clientId) ? activeIds.size : activeIds.size + 1;
      setRealtimeStatus(`firebase: connected • cursors: ${displayCount}`);
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Realtime read failed. Check Realtime Database rules for room path access.');
    }
  );

  onValue(
    cardsRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      const allCards = snapshot.val() || {};
      const activeCardIds = new Set();

      for (const [cardId, payload] of Object.entries(allCards)) {
        activeCardIds.add(cardId);
        cards.set(cardId, normalizeCardPayload(payload));
        renderCardElement(cardId);
      }

      for (const [cardId, cardElement] of cardElements.entries()) {
        if (!activeCardIds.has(cardId)) {
          clearCardFlipTimer(cardId);
          cardFaces.delete(cardId);
          selectedCardIds.delete(cardId);
          cardElement.remove();
          cardElements.delete(cardId);
          cards.delete(cardId);
        }
      }
      renderDeckControls();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Card sync failed. Check Realtime Database rules for room path access.');
    }
  );

  onValue(
    deckRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      const nextDeck = snapshot.val();
      if (!nextDeck || typeof nextDeck !== 'object') {
        deckState = null;
        setDeckShuffleFxActive(false);
        renderDeckControls();
        return;
      }
      const normalizedDeck = normalizeDeckPayload(nextDeck);
      const previousShuffleTick = deckState ? deckState.shuffleTick : normalizedDeck.shuffleTick;
      const shouldTriggerShuffleFx = Boolean(deckState) && normalizedDeck.shuffleTick !== previousShuffleTick;

      deckState = normalizedDeck;
      renderAllCards();

      if (shouldTriggerShuffleFx) {
        triggerDeckShuffleFx();
      }
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Deck sync failed. Check Realtime Database rules for room path access.');
    }
  );

  window.addEventListener('pointermove', handleCardDragMove);
  window.addEventListener('pointerup', handleCardDragEnd);
  window.addEventListener('pointercancel', handleCardDragEnd);

  window.addEventListener('pointermove', handleDeckDragMove);
  window.addEventListener('pointerup', handleDeckDragEnd);
  window.addEventListener('pointercancel', handleDeckDragEnd);

  window.addEventListener('resize', () => {
    applyCamera();
  });

  function capturePinchState() {
    if (touchPointers.size < 2) {
      return null;
    }

    const points = Array.from(touchPointers.values());
    const first = points[0];
    const second = points[1];
    const midpointX = (first.x + second.x) / 2;
    const midpointY = (first.y + second.y) / 2;
    const midpointWorld = screenToWorldFromClient(midpointX, midpointY);
    if (!midpointWorld) {
      return null;
    }

    return {
      startScale: camera.scale,
      startDistance: Math.max(Math.hypot(first.x - second.x, first.y - second.y), 1),
      worldX: midpointWorld.x,
      worldY: midpointWorld.y
    };
  }

  function updatePinchView() {
    if (!pinchState || touchPointers.size < 2) {
      return;
    }

    const points = Array.from(touchPointers.values());
    const first = points[0];
    const second = points[1];
    const midpointX = (first.x + second.x) / 2;
    const midpointY = (first.y + second.y) / 2;
    const currentDistance = Math.max(Math.hypot(first.x - second.x, first.y - second.y), 1);
    const nextScale = clamp((currentDistance / pinchState.startDistance) * pinchState.startScale, MIN_SCALE, MAX_SCALE);

    camera.scale = nextScale;
    const midpointScreen = getScreenPoint(midpointX, midpointY);
    if (!midpointScreen) {
      return;
    }

    camera.panX = midpointScreen.x - pinchState.worldX * camera.scale;
    camera.panY = midpointScreen.y - pinchState.worldY * camera.scale;
    applyCamera();
  }

  function isEventOnCard(event) {
    const target = event.target instanceof Element ? event.target : null;
    return Boolean(target?.closest('.table-card'));
  }

  tableRoot.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  tableRoot.addEventListener(
    'wheel',
    (event) => {
      if (shouldIgnorePointerEvent(event)) {
        return;
      }
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      setZoomAtClient(event.clientX, event.clientY, camera.scale * factor);
    },
    { passive: false }
  );

  tableRoot.addEventListener('pointerdown', (event) => {
    if (shouldIgnorePointerEvent(event)) {
      return;
    }

    activePointers.add(event.pointerId);
    tableRoot.setPointerCapture?.(event.pointerId);

    if (event.pointerType === 'mouse') {
      if (event.button === 2) {
        event.preventDefault();
        startSelectionBox(event);
        return;
      }

      if (event.button === 0 && selectedCardIds.size > 0 && !isEventOnCard(event)) {
        event.preventDefault();
        releaseSelectedCards();
        schedulePublishFromEvent(event);
        return;
      }

      if (event.button === 0 || event.button === 1) {
        if (event.button === 1) {
          event.preventDefault();
        }
        mousePanState = {
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startPanX: camera.panX,
          startPanY: camera.panY,
          buttonMask: event.button === 1 ? 4 : 1,
          moved: false
        };
      }
      return;
    }

    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touchPointers.size >= 2) {
        pinchState = capturePinchState();
        touchPanState = null;
        return;
      }

      touchPanState = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX: camera.panX,
        startPanY: camera.panY,
        moved: false
      };
    }
  });

  tableRoot.addEventListener('pointermove', (event) => {
    if (shouldIgnorePointerEvent(event)) {
      return;
    }

    if (updateSelectionBox(event)) {
      event.preventDefault();
      return;
    }

    if (event.pointerType === 'mouse') {
      if (
        mousePanState &&
        mousePanState.pointerId === event.pointerId &&
        (event.buttons & (mousePanState.buttonMask || 1)) !== 0
      ) {
        const deltaX = event.clientX - mousePanState.startClientX;
        const deltaY = event.clientY - mousePanState.startClientY;
        if (Math.hypot(deltaX, deltaY) > 2) {
          mousePanState.moved = true;
        }
        camera.panX = mousePanState.startPanX + deltaX;
        camera.panY = mousePanState.startPanY + deltaY;
        applyCamera();
        return;
      }

      schedulePublishFromEvent(event);
      return;
    }

    if ((event.pointerType === 'touch' || event.pointerType === 'pen') && activePointers.has(event.pointerId)) {
      touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (touchPointers.size >= 2) {
        if (!pinchState) {
          pinchState = capturePinchState();
        }
        updatePinchView();
        return;
      }

      if (touchPanState && touchPanState.pointerId === event.pointerId) {
        const deltaX = event.clientX - touchPanState.startClientX;
        const deltaY = event.clientY - touchPanState.startClientY;
        if (Math.hypot(deltaX, deltaY) > 4) {
          touchPanState.moved = true;
        }
        camera.panX = touchPanState.startPanX + deltaX;
        camera.panY = touchPanState.startPanY + deltaY;
        applyCamera();
      }
    }
  });

  function handlePointerEnd(event) {
    activePointers.delete(event.pointerId);

    if (selectionBoxState && event.pointerType === 'mouse' && selectionBoxState.pointerId === event.pointerId) {
      finalizeSelectionBox(event).catch((error) => {
        console.error(error);
      });
    }

    if (event.pointerType === 'mouse' && mousePanState?.pointerId === event.pointerId) {
      mousePanState = null;
    }

    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      const finishedTouchPan = touchPanState && touchPanState.pointerId === event.pointerId ? touchPanState : null;
      const wasPinching = Boolean(pinchState);
      touchPointers.delete(event.pointerId);

      if (finishedTouchPan && !finishedTouchPan.moved && !wasPinching && !shouldIgnorePointerEvent(event)) {
        schedulePublishFromEvent(event);
      }

      if (touchPointers.size >= 2) {
        pinchState = capturePinchState();
        touchPanState = null;
      } else if (touchPointers.size === 1) {
        const [remainingPointerId, remainingPoint] = Array.from(touchPointers.entries())[0];
        touchPanState = {
          pointerId: remainingPointerId,
          startClientX: remainingPoint.x,
          startClientY: remainingPoint.y,
          startPanX: camera.panX,
          startPanY: camera.panY,
          moved: false
        };
        pinchState = null;
      } else {
        touchPanState = null;
        pinchState = null;
      }
    }

    if (tableRoot.hasPointerCapture?.(event.pointerId)) {
      tableRoot.releasePointerCapture(event.pointerId);
    }
  }

  tableRoot.addEventListener('pointerup', handlePointerEnd);
  tableRoot.addEventListener('pointercancel', handlePointerEnd);
}
