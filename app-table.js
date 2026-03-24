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
const drawingLayer = document.getElementById('drawingLayer');
const cardLayer = document.getElementById('cardLayer');
const cursorLayer = document.getElementById('cursorLayer');
const roomBadge = document.getElementById('roomBadge');
const roomTitleInput = document.getElementById('roomTitleInput');
const statusBadge = document.getElementById('statusBadge');
const drawModeButton = document.getElementById('drawModeButton');
const drawClearButton = document.getElementById('drawClearButton');
const drawUndoButton = document.getElementById('drawUndoButton');
const auctionBidBoard = document.getElementById('auctionBidBoard');
const auctionBidEntry = document.getElementById('auctionBidEntry');
const auctionBidInput = document.getElementById('auctionBidInput');
const auctionBidSubmitButton = document.getElementById('auctionBidSubmitButton');
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
const playerHandCount = document.getElementById('playerHandCount');
const bottomLeftControls = document.getElementById('bottomLeftControls');
const homeButton = document.getElementById('homeButton');
const lightModeControl = document.getElementById('lightModeControl');
const lightModeToggle = document.getElementById('lightModeToggle');
const modeIcon = document.getElementById('modeIcon');

const LAST_GAME_URL_KEY = 'tabletop-last-room-url';
const LIGHT_MODE_KEY = 'tabletop-light-mode-enabled';
const CAMERA_VIEW_STORAGE_KEY_PREFIX = 'tabletop-camera-view';
const OWNER_TOKEN_KEY = 'tabletop-owner-token';
const PLAYER_TOKEN_KEY = 'tabletop-player-token';
const ROOM_TITLE_MAX_LENGTH = 48;

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
const STACK_SLOT_GAP = 46;
const DISCARD_STACK_OFFSET_X = CARD_WIDTH + STACK_SLOT_GAP;
const AUCTION_SHIFT_X = 40;
const AUCTION_SLOT_EXTRA_SIZE = 20;
const AUCTION_CARD_SCALE = 1.15;
const AUCTION_STACK_OFFSET_X = CARD_WIDTH + STACK_SLOT_GAP + AUCTION_SHIFT_X;
const DISCARD_RETURN_ANIMATION_MS = 300;
const DECK_COUNT_OFFSET_Y = 18;
const FRONT_IMAGE_PRELOAD_CONCURRENCY = 4;
const TOUCH_TAP_MAX_MOVE_PX = 10;
const TOUCH_DOUBLE_TAP_MS = 320;
const TOUCH_DOUBLE_TAP_MAX_DISTANCE_PX = 28;
const MOUSE_CLICK_MAX_MOVE_PX = 6;
const MOUSE_DOUBLE_CLICK_MS = 320;
const MOUSE_DOUBLE_CLICK_MAX_DISTANCE_PX = 20;
const RIGHT_CLICK_SELECTED_FLIP_COOLDOWN_MS = 1000;
const RIGHT_CLICK_FLIP_REST_MS = 120;
const DRAW_STROKE_WORLD_WIDTH = 9;
const DRAW_POINT_MIN_DISTANCE = 3;
const HAND_DROP_REGION_HEIGHT = 110;
const HAND_CARD_WIDTH = 170;
const HAND_CARD_HEIGHT = (HAND_CARD_WIDTH * CARD_HEIGHT) / CARD_WIDTH;
const HAND_CARD_BASE_BOTTOM_OFFSET = -Math.round(HAND_CARD_HEIGHT * 0.52);
const HAND_CARD_FAN_MAX_WIDTH = 980;
const HAND_CARD_FAN_MIN_STEP = 22;
const HAND_CARD_FAN_MAX_STEP = 74;
const HAND_HOVER_REGION_TOP_OFFSET_PX = 250;
const HAND_HOVER_REGION_MIN_HEIGHT_PX = 24;
const LOW_RES_FRONT_SWITCH_SCREEN_WIDTH = 132;
const HAND_RECLAIM_TIMEOUT_MS = 2 * 60 * 1000;
const HAND_RECLAIM_CHECK_INTERVAL_MS = 15000;
const DECK_KEY = 'cool-jpegs';
const CARD_BACK_IMAGE_SRC = './assets/back.png';
const CARD_FRONT_HIGH_RES_PREFIX = './assets/cards/';
const CARD_FRONT_LOW_RES_PREFIX = './assets/cards-low/';
const COOL_JPEGS_FRONT_IMAGES = Array.from({ length: 75 }, (_, index) => `${CARD_FRONT_HIGH_RES_PREFIX}${1000 + index}.png`);
const COOL_JPEGS_FRONT_IMAGES_LOW = COOL_JPEGS_FRONT_IMAGES.map((src) =>
  src.replace(CARD_FRONT_HIGH_RES_PREFIX, CARD_FRONT_LOW_RES_PREFIX)
);

const query = new URLSearchParams(window.location.search);
const roomId = query.get('room');
if (!roomId) {
  window.location.replace('./index.html');
  throw new Error('Missing room id in URL');
}
const cameraViewStorageKey = `${CAMERA_VIEW_STORAGE_KEY_PREFIX}-${roomId}`;

const playerState = {
  name: (localStorage.getItem('tabletop-player-name') || '').trim().slice(0, 24),
  color: normalizeHexColor(localStorage.getItem('tabletop-player-color') || '#ff7a59')
};

const roomPath = `rooms/${roomId}`;
const defaultRoomTitle = `room: ${roomId}`;
const dots = new Map();
const cards = new Map();
const cardElements = new Map();
const cardFaces = new Map();
const cardFlipTimers = new Map();
const selectedCardIds = new Set();
const frontImageLoadState = new Map();
const frontImagePromises = new Map();
const frontDisplayPendingByCard = new Map();
const handCardElements = new Map();
const handDisplayPendingByCard = new Map();
const discardReturnAnimatingCardIds = new Set();
const discardReturnAnimationTimers = new Map();
const drawingStrokes = new Map();
const drawingStrokeElements = new Map();

let localPosition = { x: 0.5, y: 0.5 };
let syncCursorState = () => {};
let localClientId = '';
let localPlayerToken = '';
let deckState = null;
let deckShuffleButton = null;
let deckDealOneButton = null;
let deckMoveButton = null;
let discardResetButton = null;
let deckDropIndicator = null;
let discardDropIndicator = null;
let auctionDropIndicator = null;
let discardSlot = null;
let discardLabel = null;
let auctionSlot = null;
let auctionLabel = null;
let deckCountBadge = null;
let deckDropIndicatorVisible = false;
let discardDropIndicatorVisible = false;
let auctionDropIndicatorVisible = false;
let handTray = null;
let handDropGlow = null;
let handDropGlowVisible = false;
let handReorderState = null;
let handDropPreview = null;
let handHoverLayout = null;
let hoveredHandCardId = null;
let lastHandHoverClientX = Number.NaN;
let lastHandHoverClientY = Number.NaN;
let latestRoomCursors = {};
let heldCardLayer = null;
let selectionBoxElement = null;
let deckShuffleFxCards = [];
let deckShuffleFxActive = false;
let deckShuffleFxTimerId = 0;
let cameraPersistTimerId = 0;
let themeTransitionTimerId = 0;
let coolJpegsFrontPreloadPromise = null;
let roomTitleValue = defaultRoomTitle;
let isRoomTitleEditing = false;
let isRoomOwner = false;
let spawnCoolJpegsDeck = async () => {
  showStatusMessage('Firebase connection is required before adding a deck.');
};
let renameRoomTitle = async () => {
  showStatusMessage('Firebase connection is required before renaming the room.');
};
let clearTabletop = async () => {
  showStatusMessage('Firebase connection is required before clearing the table.');
};
let clearOwnDrawings = async () => {
  showStatusMessage('Firebase connection is required before deleting drawings.');
};
let undoOwnDrawing = async () => {
  showStatusMessage('Firebase connection is required before undoing drawings.');
};
let submitAuctionBid = async () => {
  showStatusMessage('Firebase connection is required before submitting bids.');
};
let shuffleCoolJpegsDeck = async () => {};
let dealOneCardEach = async () => {};
let reclaimDiscardToDeck = async () => {};
let onCardPointerDown = () => {};
let onCardContextMenu = () => {};
let onHandCardPointerDown = () => {};
let onDeckMovePointerDown = () => {};
let drawModeEnabled = false;
let setDrawModeEnabled = (enabled) => {
  drawModeEnabled = Boolean(enabled);
  syncDrawModeUi();
};

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

function readStoredCameraView() {
  try {
    const raw = localStorage.getItem(cameraViewStorageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const scale = Number(parsed?.scale);
    const panX = Number(parsed?.panX);
    const panY = Number(parsed?.panY);
    if (!Number.isFinite(scale) || !Number.isFinite(panX) || !Number.isFinite(panY)) {
      return null;
    }
    return {
      scale: clamp(scale, MIN_SCALE, MAX_SCALE),
      panX,
      panY
    };
  } catch {
    return null;
  }
}

function persistCameraViewNow() {
  try {
    localStorage.setItem(
      cameraViewStorageKey,
      JSON.stringify({
        scale: Number(camera.scale.toFixed(5)),
        panX: Number(camera.panX.toFixed(2)),
        panY: Number(camera.panY.toFixed(2))
      })
    );
  } catch {
    // Ignore storage failures.
  }
}

function scheduleCameraViewPersist() {
  if (cameraPersistTimerId) {
    window.clearTimeout(cameraPersistTimerId);
  }
  cameraPersistTimerId = window.setTimeout(() => {
    cameraPersistTimerId = 0;
    persistCameraViewNow();
  }, 120);
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

function setDiscardReturnAnimating(cardId, active) {
  const existingTimer = discardReturnAnimationTimers.get(cardId);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
    discardReturnAnimationTimers.delete(cardId);
  }

  if (!active) {
    discardReturnAnimatingCardIds.delete(cardId);
    return;
  }

  discardReturnAnimatingCardIds.add(cardId);
  const timer = window.setTimeout(() => {
    discardReturnAnimationTimers.delete(cardId);
    if (!discardReturnAnimatingCardIds.has(cardId)) {
      return;
    }
    discardReturnAnimatingCardIds.delete(cardId);
    renderCardElement(cardId);
  }, DISCARD_RETURN_ANIMATION_MS + 40);
  discardReturnAnimationTimers.set(cardId, timer);
}

function getDeckCenterPosition() {
  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
  };
}

function getDiscardCenterPosition() {
  const deckCenter = deckState
    ? { x: deckState.x, y: deckState.y }
    : getDeckCenterPosition();
  return {
    x: deckCenter.x - DISCARD_STACK_OFFSET_X,
    y: deckCenter.y
  };
}

function getAuctionCenterPosition() {
  const deckCenter = deckState
    ? { x: deckState.x, y: deckState.y }
    : getDeckCenterPosition();
  return {
    x: deckCenter.x + AUCTION_STACK_OFFSET_X,
    y: deckCenter.y
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
      inDiscard: false,
      inAuction: false,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null,
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

function getDiscardCardIds() {
  const ids = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (cardState.inDiscard) {
      ids.push(cardId);
    }
  }
  return ids;
}

function getAuctionCardIds() {
  const ids = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (cardState.inAuction) {
      ids.push(cardId);
    }
  }
  return ids;
}

function toHighResFrontSrc(src) {
  if (typeof src !== 'string') {
    return COOL_JPEGS_FRONT_IMAGES[0];
  }
  if (src.startsWith(CARD_FRONT_HIGH_RES_PREFIX)) {
    return src;
  }
  if (src.startsWith(CARD_FRONT_LOW_RES_PREFIX)) {
    return `${CARD_FRONT_HIGH_RES_PREFIX}${src.slice(CARD_FRONT_LOW_RES_PREFIX.length)}`;
  }
  return COOL_JPEGS_FRONT_IMAGES[0];
}

function toLowResFrontSrc(src) {
  const highResSrc = toHighResFrontSrc(src);
  return highResSrc.replace(CARD_FRONT_HIGH_RES_PREFIX, CARD_FRONT_LOW_RES_PREFIX);
}

function resolveFrontVariantSources(frontSrc, cardScreenWidth) {
  const highResSrc = toHighResFrontSrc(frontSrc);
  const lowResSrc = toLowResFrontSrc(highResSrc);
  const preferLowRes = cardScreenWidth <= LOW_RES_FRONT_SWITCH_SCREEN_WIDTH;
  return {
    preferredSrc: preferLowRes ? lowResSrc : highResSrc,
    fallbackSrc: preferLowRes ? highResSrc : lowResSrc
  };
}

function normalizeSrcForCompare(src) {
  if (!src || typeof src !== 'string') {
    return '';
  }
  try {
    return new URL(src, window.location.href).href;
  } catch {
    return src;
  }
}

function srcMatchesVariant(candidateSrc, variantSrc) {
  if (!candidateSrc || !variantSrc) {
    return false;
  }
  if (candidateSrc === variantSrc) {
    return true;
  }
  return normalizeSrcForCompare(candidateSrc) === normalizeSrcForCompare(variantSrc);
}

function imageHasSource(image, src) {
  if (!(image instanceof HTMLImageElement) || !src) {
    return false;
  }
  const attributeSrc = image.getAttribute('src') || '';
  if (srcMatchesVariant(attributeSrc, src)) {
    return true;
  }
  return srcMatchesVariant(image.currentSrc || image.src || '', src);
}

function chooseLoadedFrontDisplaySrc(preferredSrc, fallbackSrc, currentSrc) {
  if (preferredSrc && srcMatchesVariant(currentSrc, preferredSrc) && isFrontImageLoaded(preferredSrc)) {
    return preferredSrc;
  }
  if (fallbackSrc && srcMatchesVariant(currentSrc, fallbackSrc) && isFrontImageLoaded(fallbackSrc)) {
    return fallbackSrc;
  }
  if (preferredSrc && isFrontImageLoaded(preferredSrc)) {
    return preferredSrc;
  }
  if (fallbackSrc && isFrontImageLoaded(fallbackSrc)) {
    return fallbackSrc;
  }
  return '';
}

function isFrontImageLoaded(src) {
  return frontImageLoadState.get(src) === 'loaded';
}

function ensureFrontImageLoaded(src) {
  if (!src || typeof src !== 'string') {
    return Promise.resolve(false);
  }

  if (isFrontImageLoaded(src)) {
    return Promise.resolve(true);
  }

  const existingPromise = frontImagePromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  frontImageLoadState.set(src, 'loading');
  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      frontImageLoadState.set(src, 'loaded');
      frontImagePromises.delete(src);
      resolve(true);
    };
    image.onerror = () => {
      frontImageLoadState.set(src, 'error');
      frontImagePromises.delete(src);
      resolve(false);
    };
    image.src = src;
  });

  frontImagePromises.set(src, promise);
  return promise;
}

async function preloadImageSources(sources, concurrency) {
  const pendingSources = [...sources];
  const workerCount = Math.max(1, concurrency);
  const workers = Array.from({ length: workerCount }, async () => {
    while (pendingSources.length > 0) {
      const nextSrc = pendingSources.shift();
      if (!nextSrc) {
        break;
      }
      await ensureFrontImageLoaded(nextSrc);
    }
  });
  await Promise.allSettled(workers);
}

function preloadCoolJpegsFrontImages() {
  if (coolJpegsFrontPreloadPromise) {
    return coolJpegsFrontPreloadPromise;
  }

  coolJpegsFrontPreloadPromise = (async () => {
    // Prioritize low-res faces so flips at zoomed-out levels appear immediately.
    await preloadImageSources(COOL_JPEGS_FRONT_IMAGES_LOW, FRONT_IMAGE_PRELOAD_CONCURRENCY * 2);
    // Continue warming full-res faces in the background.
    await preloadImageSources(COOL_JPEGS_FRONT_IMAGES, FRONT_IMAGE_PRELOAD_CONCURRENCY);
  })();
  return coolJpegsFrontPreloadPromise;
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

function clearTopDeckShuffleDarkening() {
  for (const cardElement of cardElements.values()) {
    cardElement.classList.remove('is-shuffle-darkening');
  }
}

function markTopDeckShuffleDarkening() {
  clearTopDeckShuffleDarkening();
  let topCardId = '';
  let topZ = -Infinity;
  for (const [cardId, cardState] of cards.entries()) {
    if (!cardState?.inDeck) {
      continue;
    }
    const z = Number(cardState.z) || 0;
    if (z >= topZ) {
      topZ = z;
      topCardId = cardId;
    }
  }
  if (!topCardId) {
    return;
  }

  const topCardElement = cardElements.get(topCardId);
  if (!topCardElement) {
    return;
  }
  topCardElement.classList.remove('is-shuffle-darkening');
  // Restart the animation cleanly when shuffles happen rapidly.
  void topCardElement.offsetWidth;
  topCardElement.classList.add('is-shuffle-darkening');
}

function setDeckShuffleFxActive(active) {
  deckShuffleFxActive = active;
  if (!active) {
    window.clearTimeout(deckShuffleFxTimerId);
    deckShuffleFxTimerId = 0;
    clearTopDeckShuffleDarkening();
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
  markTopDeckShuffleDarkening();

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

  if (!deckDealOneButton) {
    deckDealOneButton = document.createElement('button');
    deckDealOneButton.type = 'button';
    deckDealOneButton.className = 'deck-control-button deck-deal-button hidden';
    deckDealOneButton.setAttribute('aria-label', 'deal one card to each player');
    deckDealOneButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 10H11M8 7V13M16 6.5V17.5M14.5 8L16 6.5L17.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    deckDealOneButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (deckDealOneButton?.disabled) {
        return;
      }
      dealOneCardEach().catch((error) => {
        console.error(error);
        setRealtimeStatus('firebase: write blocked');
      });
    });
    shieldPointerEvents(deckDealOneButton);
    tableRoot.appendChild(deckDealOneButton);
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

  if (!discardResetButton) {
    discardResetButton = document.createElement('button');
    discardResetButton.type = 'button';
    discardResetButton.className = 'deck-control-button discard-reset-button hidden';
    discardResetButton.setAttribute('aria-label', 'return discard to deck');
    discardResetButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12H17.5M13 7.5L17.5 12L13 16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    discardResetButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      reclaimDiscardToDeck().catch((error) => {
        console.error(error);
        setRealtimeStatus('firebase: write blocked');
      });
    });
    shieldPointerEvents(discardResetButton);
    tableRoot.appendChild(discardResetButton);
  }

  if (!deckDropIndicator) {
    deckDropIndicator = document.createElement('div');
    deckDropIndicator.className = 'deck-drop-indicator hidden';
    deckDropIndicator.setAttribute('aria-hidden', 'true');
    deckDropIndicator.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V17M6.5 11.5L12 17L17.5 11.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    tableRoot.appendChild(deckDropIndicator);
  }

  if (!discardDropIndicator) {
    discardDropIndicator = document.createElement('div');
    discardDropIndicator.className = 'discard-drop-indicator hidden';
    discardDropIndicator.setAttribute('aria-hidden', 'true');
    discardDropIndicator.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V17M6.5 11.5L12 17L17.5 11.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    tableRoot.appendChild(discardDropIndicator);
  }

  if (!auctionDropIndicator) {
    auctionDropIndicator = document.createElement('div');
    auctionDropIndicator.className = 'auction-drop-indicator hidden';
    auctionDropIndicator.setAttribute('aria-hidden', 'true');
    auctionDropIndicator.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V17M6.5 11.5L12 17L17.5 11.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    tableRoot.appendChild(auctionDropIndicator);
  }

  if (!discardSlot) {
    discardSlot = document.createElement('div');
    discardSlot.className = 'discard-slot hidden';
    discardSlot.setAttribute('aria-hidden', 'true');
    tableRoot.appendChild(discardSlot);

    discardLabel = document.createElement('span');
    discardLabel.className = 'discard-slot-label';
    discardLabel.textContent = 'discard';
    discardSlot.appendChild(discardLabel);
  }

  if (!auctionSlot) {
    auctionSlot = document.createElement('div');
    auctionSlot.className = 'auction-slot hidden';
    auctionSlot.setAttribute('aria-hidden', 'true');
    tableRoot.appendChild(auctionSlot);

    auctionLabel = document.createElement('img');
    auctionLabel.className = 'auction-slot-icon';
    auctionLabel.src = './assets/auction.svg';
    auctionLabel.alt = 'auction';
    auctionLabel.draggable = false;
    auctionSlot.appendChild(auctionLabel);
  }

  if (!deckCountBadge) {
    deckCountBadge = document.createElement('div');
    deckCountBadge.className = 'deck-count-badge hidden';
    deckCountBadge.setAttribute('aria-hidden', 'true');
    deckCountBadge.textContent = '0';
    tableRoot.appendChild(deckCountBadge);
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

  const allDiscardDropIndicators = tableRoot.querySelectorAll('.discard-drop-indicator');
  for (const indicator of allDiscardDropIndicators) {
    indicator.classList.add('hidden');
    indicator.classList.remove('is-visible');
  }

  const allAuctionDropIndicators = tableRoot.querySelectorAll('.auction-drop-indicator');
  for (const indicator of allAuctionDropIndicators) {
    indicator.classList.add('hidden');
    indicator.classList.remove('is-visible');
  }

  const allDiscardSlots = tableRoot.querySelectorAll('.discard-slot');
  for (const slot of allDiscardSlots) {
    slot.classList.add('hidden');
  }

  const allAuctionSlots = tableRoot.querySelectorAll('.auction-slot');
  for (const slot of allAuctionSlots) {
    slot.classList.add('hidden');
  }

  const allCountBadges = tableRoot.querySelectorAll('.deck-count-badge');
  for (const badge of allCountBadges) {
    badge.classList.add('hidden');
  }
}

function removeAllDeckUiArtifacts() {
  if (!tableRoot) {
    return;
  }

  for (const node of tableRoot.querySelectorAll('.deck-control-button, .deck-drop-indicator, .discard-drop-indicator, .auction-drop-indicator, .discard-slot, .auction-slot, .deck-shuffle-fx, .deck-count-badge')) {
    node.remove();
  }
}

function renderDeckControls() {
  const inDeckCount = getDeckCardIds().length;
  const inDiscardCount = getDiscardCardIds().length;
  const inAuctionCount = getAuctionCardIds().length;
  if (!deckState || (inDeckCount === 0 && inDiscardCount === 0 && inAuctionCount === 0)) {
    deckDropIndicatorVisible = false;
    discardDropIndicatorVisible = false;
    auctionDropIndicatorVisible = false;
    hideAllDeckUiElements();
    setDeckShuffleFxActive(false);
    return;
  }

  ensureDeckControlElements();
  if (
    !deckShuffleButton ||
    !deckDealOneButton ||
    !deckMoveButton ||
    !discardResetButton ||
    !deckDropIndicator ||
    !discardDropIndicator ||
    !auctionDropIndicator ||
    !discardSlot ||
    !auctionSlot ||
    !deckCountBadge
  ) {
    return;
  }

  const deckScreen = worldToScreen({ x: deckState.x, y: deckState.y });
  const discardScreen = worldToScreen(getDiscardCenterPosition());
  const auctionScreen = worldToScreen(getAuctionCenterPosition());
  const controlSize = DECK_CONTROL_SIZE;
  const controlGap = DECK_CONTROL_GAP;
  const cardScreenWidth = snapToDevicePixel(CARD_WIDTH * camera.scale);
  const cardScreenHeight = (cardScreenWidth * CARD_HEIGHT) / CARD_WIDTH;
  const auctionSlotScreenWidth = snapToDevicePixel((CARD_WIDTH + AUCTION_SLOT_EXTRA_SIZE) * camera.scale);
  const auctionSlotScreenHeight = snapToDevicePixel((CARD_HEIGHT + AUCTION_SLOT_EXTRA_SIZE) * camera.scale);
  const auctionCardScreenHeight = snapToDevicePixel(CARD_HEIGHT * AUCTION_CARD_SCALE * camera.scale);
  const auctionIconOccupiedSize = snapToDevicePixel(controlSize * 0.82, 14);
  let handDropIndicatorScreen = null;
  if (handReorderState?.releaseToTable) {
    const activeHandCard = handReorderState.cardId ? handCardElements.get(handReorderState.cardId) : null;
    const tableRect = tableRoot?.getBoundingClientRect();
    if (activeHandCard && tableRect) {
      const activeRect = activeHandCard.getBoundingClientRect();
      handDropIndicatorScreen = {
        x: activeRect.left - tableRect.left + activeRect.width / 2,
        y: activeRect.top - tableRect.top + activeRect.height / 2
      };
    } else {
      const handDropWorld = screenToWorldFromClient(handReorderState.clientX, handReorderState.clientY);
      if (handDropWorld) {
        const handDropX = clamp(handDropWorld.x, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
        const handDropY = clamp(handDropWorld.y, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
        handDropIndicatorScreen = worldToScreen({ x: handDropX, y: handDropY });
      }
    }
  }

  const controlsY = deckScreen.y + cardScreenHeight / 2 + DECK_COUNT_OFFSET_Y;
  const controlsXOffset = controlSize + controlGap;

  deckShuffleButton.classList.remove('hidden');
  deckShuffleButton.style.left = `${deckScreen.x - controlsXOffset}px`;
  deckShuffleButton.style.top = `${controlsY}px`;
  deckShuffleButton.style.width = `${controlSize}px`;
  deckShuffleButton.style.height = `${controlSize}px`;

  const dealTargetTokens = getActivePlayerTokensForDeal();
  const canDealToAllPlayers = dealTargetTokens.length > 0 && inDeckCount >= dealTargetTokens.length;
  deckDealOneButton.classList.remove('hidden');
  deckDealOneButton.style.left = `${deckScreen.x + controlsXOffset}px`;
  deckDealOneButton.style.top = `${controlsY}px`;
  deckDealOneButton.style.width = `${controlSize}px`;
  deckDealOneButton.style.height = `${controlSize}px`;
  deckDealOneButton.disabled = !canDealToAllPlayers;
  deckDealOneButton.classList.toggle('is-disabled', !canDealToAllPlayers);

  deckMoveButton.classList.remove('hidden');
  deckMoveButton.style.left = `${auctionScreen.x + auctionSlotScreenWidth / 2 + controlGap + controlSize / 2 + 15}px`;
  deckMoveButton.style.top = `${auctionScreen.y + auctionSlotScreenHeight / 2 - controlSize / 2}px`;
  deckMoveButton.style.width = `${controlSize}px`;
  deckMoveButton.style.height = `${controlSize}px`;
  deckMoveButton.classList.toggle('is-held-by-self', deckState.holderClientId === localClientId);

  const discardResetVisible = inDiscardCount > 0;
  discardResetButton.classList.toggle('hidden', !discardResetVisible);
  if (discardResetVisible) {
    discardResetButton.style.left = `${discardScreen.x - cardScreenWidth / 2 - controlGap - controlSize / 2}px`;
    discardResetButton.style.top = `${discardScreen.y - cardScreenHeight / 2 + controlSize / 2}px`;
    discardResetButton.style.width = `${controlSize}px`;
    discardResetButton.style.height = `${controlSize}px`;
  }

  const isHandAnchoredDropIndicator = Boolean(handDropIndicatorScreen && handReorderState?.releaseToTable);
  const dropIndicatorOffsetY = isHandAnchoredDropIndicator ? 0 : cardScreenHeight / 2 + DECK_DROP_INDICATOR_OFFSET_Y;
  const deckDropScreen = isHandAnchoredDropIndicator ? handDropIndicatorScreen : deckScreen;
  deckDropIndicator.style.left = `${deckDropScreen.x}px`;
  deckDropIndicator.style.top = `${deckDropScreen.y - dropIndicatorOffsetY}px`;
  deckDropIndicator.classList.toggle('hidden', !deckDropIndicatorVisible);
  deckDropIndicator.classList.toggle('is-visible', deckDropIndicatorVisible);

  const discardDropScreen = isHandAnchoredDropIndicator ? handDropIndicatorScreen : discardScreen;
  discardDropIndicator.style.left = `${discardDropScreen.x}px`;
  discardDropIndicator.style.top = `${discardDropScreen.y - dropIndicatorOffsetY}px`;
  discardDropIndicator.classList.toggle('hidden', !discardDropIndicatorVisible);
  discardDropIndicator.classList.toggle('is-visible', discardDropIndicatorVisible);

  const auctionDropScreen = isHandAnchoredDropIndicator ? handDropIndicatorScreen : auctionScreen;
  auctionDropIndicator.style.left = `${auctionDropScreen.x}px`;
  auctionDropIndicator.style.top = `${auctionDropScreen.y - dropIndicatorOffsetY}px`;
  auctionDropIndicator.classList.toggle('hidden', !auctionDropIndicatorVisible);
  auctionDropIndicator.classList.toggle('is-visible', auctionDropIndicatorVisible);

  discardSlot.classList.remove('hidden');
  discardSlot.style.left = `${discardScreen.x}px`;
  discardSlot.style.top = `${discardScreen.y}px`;
  discardSlot.style.width = `${cardScreenWidth}px`;
  discardSlot.style.height = `${cardScreenHeight}px`;
  discardSlot.classList.toggle('is-empty', inDiscardCount === 0);
  discardSlot.classList.toggle('is-hovered', discardDropIndicatorVisible);
  if (discardLabel) {
    discardLabel.classList.toggle('hidden', inDiscardCount > 0);
  }

  auctionSlot.classList.remove('hidden');
  auctionSlot.style.left = `${auctionScreen.x}px`;
  auctionSlot.style.top = `${auctionScreen.y}px`;
  auctionSlot.style.width = `${auctionSlotScreenWidth}px`;
  auctionSlot.style.height = `${auctionSlotScreenHeight}px`;
  auctionSlot.style.setProperty(
    '--auction-icon-occupied-top',
    `${auctionSlotScreenHeight / 2 + auctionCardScreenHeight / 2 + DECK_COUNT_OFFSET_Y}px`
  );
  auctionSlot.style.setProperty('--auction-icon-occupied-size', `${auctionIconOccupiedSize}px`);
  auctionSlot.classList.toggle('is-empty', inAuctionCount === 0);
  auctionSlot.classList.toggle('is-hovered', auctionDropIndicatorVisible);
  auctionSlot.classList.toggle('is-occupied', inAuctionCount > 0);
  if (auctionLabel) {
    auctionLabel.classList.remove('hidden');
  }

  deckCountBadge.classList.remove('hidden');
  deckCountBadge.style.left = `${deckScreen.x}px`;
  deckCountBadge.style.top = `${controlsY}px`;
  deckCountBadge.textContent = String(inDeckCount);

  renderDeckShuffleFx(deckScreen, cardScreenWidth, cardScreenHeight);
}

function getCardHandOwnerId(cardState) {
  if (!cardState || typeof cardState !== 'object') {
    return null;
  }
  const ownerToken =
    typeof cardState.handOwnerPlayerToken === 'string' && cardState.handOwnerPlayerToken
      ? cardState.handOwnerPlayerToken
      : null;
  if (ownerToken) {
    return ownerToken;
  }
  // Backward-compatibility for older room state.
  return typeof cardState.handOwnerClientId === 'string' && cardState.handOwnerClientId ? cardState.handOwnerClientId : null;
}

function getHandCountsByOwner() {
  const counts = new Map();
  for (const cardState of cards.values()) {
    const ownerId = getCardHandOwnerId(cardState);
    if (!ownerId) {
      continue;
    }
    counts.set(ownerId, (counts.get(ownerId) || 0) + 1);
  }
  return counts;
}

function setLocalHandCountLabel() {
  if (!playerHandCount) {
    return;
  }
  const counts = getHandCountsByOwner();
  const countFromToken = localPlayerToken ? counts.get(localPlayerToken) || 0 : 0;
  const countFromClientId = localClientId ? counts.get(localClientId) || 0 : 0;
  const count = countFromToken + countFromClientId;
  playerHandCount.textContent = String(count);
}

function normalizeCardPayload(payload) {
  const nextX = Number(payload?.x);
  const nextY = Number(payload?.y);
  const nextZ = Number(payload?.z);
  const holderClientId = typeof payload?.holderClientId === 'string' && payload.holderClientId ? payload.holderClientId : null;
  const handOwnerClientId = typeof payload?.handOwnerClientId === 'string' && payload.handOwnerClientId ? payload.handOwnerClientId : null;
  const handOwnerPlayerToken =
    typeof payload?.handOwnerPlayerToken === 'string' && payload.handOwnerPlayerToken ? payload.handOwnerPlayerToken : null;
  const normalizedFrontSrc = toHighResFrontSrc(String(payload?.frontSrc || '').trim());
  const inAuction = Boolean(payload?.inAuction);
  const face = inAuction ? 'front' : payload?.face === 'front' ? 'front' : 'back';
  return {
    x: Number.isFinite(nextX) ? clamp(nextX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2) : WORLD_WIDTH / 2,
    y: Number.isFinite(nextY) ? clamp(nextY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2) : WORLD_HEIGHT / 2,
    z: Number.isFinite(nextZ) ? nextZ : 1,
    face,
    frontSrc: normalizedFrontSrc,
    inDeck: Boolean(payload?.inDeck),
    inDiscard: Boolean(payload?.inDiscard),
    inAuction,
    holderClientId,
    handOwnerClientId,
    handOwnerPlayerToken
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
    image.addEventListener('load', () => {
      const loadedSrc = image.getAttribute('src') || '';
      if (loadedSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX) || loadedSrc.startsWith(CARD_FRONT_LOW_RES_PREFIX)) {
        frontImageLoadState.set(loadedSrc, 'loaded');
      }
    });
    image.addEventListener('error', () => {
      const failedSrc = image.getAttribute('src') || '';
      if (failedSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX) || failedSrc.startsWith(CARD_FRONT_LOW_RES_PREFIX)) {
        frontImageLoadState.set(failedSrc, 'error');
      }
    });
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

function ensureHandUiElements() {
  if (!tableRoot) {
    return;
  }

  if (!handTray) {
    handTray = document.createElement('div');
    handTray.id = 'handTray';
    handTray.className = 'hand-tray hidden';
    handTray.setAttribute('aria-hidden', 'true');
    tableRoot.appendChild(handTray);
  }

  if (!handDropGlow) {
    handDropGlow = document.createElement('div');
    handDropGlow.id = 'handDropGlow';
    handDropGlow.className = 'hand-drop-glow';
    handDropGlow.setAttribute('aria-hidden', 'true');
    tableRoot.appendChild(handDropGlow);
  } else {
    handDropGlow.classList.remove('hidden');
  }
}

function setHandDropGlow(visible) {
  if (visible) {
    ensureHandUiElements();
  }
  if (!handDropGlow) {
    return;
  }
  const nextVisible = Boolean(visible);
  if (handDropGlowVisible === nextVisible) {
    return;
  }
  handDropGlowVisible = nextVisible;
  handDropGlow.classList.toggle('is-visible', nextVisible);
}

function isClientInHandDropRegion(clientY) {
  if (!tableRoot) {
    return false;
  }
  const rect = tableRoot.getBoundingClientRect();
  if (!rect.height) {
    return false;
  }
  const screenY = clientY - rect.top;
  return screenY >= rect.height - HAND_DROP_REGION_HEIGHT;
}

function getHandFanLayout(handSize, trayWidth) {
  const maxFanWidth = Math.min(Math.max(HAND_CARD_WIDTH, trayWidth - 100), HAND_CARD_FAN_MAX_WIDTH);
  const fanStep =
    handSize > 1
      ? clamp((maxFanWidth - HAND_CARD_WIDTH) / (handSize - 1), HAND_CARD_FAN_MIN_STEP, HAND_CARD_FAN_MAX_STEP)
      : 0;
  const totalWidth = HAND_CARD_WIDTH + fanStep * Math.max(0, handSize - 1);
  const startX = (trayWidth - totalWidth) / 2;
  return { fanStep, totalWidth, startX };
}

function getHandInsertIndex(clientX, handSize, trayWidth) {
  if (handSize <= 1) {
    return 0;
  }
  const { fanStep, startX } = getHandFanLayout(handSize, trayWidth);
  if (fanStep <= 0) {
    return 0;
  }
  const minCenter = startX + HAND_CARD_WIDTH / 2;
  const maxCenter = minCenter + fanStep * (handSize - 1);
  const clampedCenter = clamp(clientX, minCenter, maxCenter);
  const rawIndex = Math.round((clampedCenter - minCenter) / fanStep);
  return clamp(rawIndex, 0, handSize - 1);
}

function setHoveredHandCard(cardId) {
  const nextCardId = typeof cardId === 'string' && cardId ? cardId : null;
  if (hoveredHandCardId === nextCardId) {
    return;
  }

  if (hoveredHandCardId) {
    const previousElement = handCardElements.get(hoveredHandCardId);
    previousElement?.classList.remove('is-hovered');
  }

  hoveredHandCardId = nextCardId;
  if (hoveredHandCardId) {
    const nextElement = handCardElements.get(hoveredHandCardId);
    nextElement?.classList.add('is-hovered');
  }
}

function updateHandHoverFromClient(clientX, clientY, pointerType = 'mouse') {
  if (pointerType !== 'mouse' || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
    setHoveredHandCard(null);
    return;
  }

  lastHandHoverClientX = clientX;
  lastHandHoverClientY = clientY;

  if (!tableRoot || !handTray || handTray.classList.contains('hidden')) {
    setHoveredHandCard(null);
    return;
  }
  if (tableRoot.classList.contains('is-card-dragging') || handDropPreview?.cardId) {
    setHoveredHandCard(null);
    return;
  }
  if (!handHoverLayout || handHoverLayout.cardIds.length === 0) {
    setHoveredHandCard(null);
    return;
  }

  const trayRect = handTray.getBoundingClientRect();
  const hoverTop = Math.min(
    trayRect.bottom - HAND_HOVER_REGION_MIN_HEIGHT_PX,
    trayRect.top + HAND_HOVER_REGION_TOP_OFFSET_PX
  );
  if (!trayRect.width || !trayRect.height || clientY < hoverTop || clientY > trayRect.bottom) {
    setHoveredHandCard(null);
    return;
  }

  const localX = clientX - trayRect.left;
  const { cardIds, fanStep, minCenter, maxCenter, startX, endX } = handHoverLayout;
  if (localX < startX || localX > endX) {
    setHoveredHandCard(null);
    return;
  }
  if (cardIds.length === 1 || fanStep <= 0) {
    setHoveredHandCard(cardIds[0] || null);
    return;
  }

  const clampedCenter = clamp(localX, minCenter, maxCenter);
  const rawIndex = Math.round((clampedCenter - minCenter) / fanStep);
  const index = clamp(rawIndex, 0, cardIds.length - 1);
  setHoveredHandCard(cardIds[index] || null);
}

function ensureHandCardElement(cardId) {
  ensureHandUiElements();
  if (!handTray) {
    return null;
  }

  let card = handCardElements.get(cardId);
  if (!card) {
    card = document.createElement('div');
    card.className = 'hand-card';
    card.dataset.cardId = cardId;

    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    image.decoding = 'async';
    image.loading = 'lazy';
    image.addEventListener('load', () => {
      const loadedSrc = image.getAttribute('src') || '';
      if (loadedSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX) || loadedSrc.startsWith(CARD_FRONT_LOW_RES_PREFIX)) {
        frontImageLoadState.set(loadedSrc, 'loaded');
      }
    });
    image.addEventListener('error', () => {
      const failedSrc = image.getAttribute('src') || '';
      if (failedSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX) || failedSrc.startsWith(CARD_FRONT_LOW_RES_PREFIX)) {
        frontImageLoadState.set(failedSrc, 'error');
      }
    });
    card.appendChild(image);
    card.addEventListener('pointerdown', (event) => {
      onHandCardPointerDown(event, cardId);
    });

    handTray.appendChild(card);
    handCardElements.set(cardId, card);
  }
  return card;
}

function removeHandCardElement(cardId) {
  const handCard = handCardElements.get(cardId);
  if (handCard) {
    handCard.remove();
    handCardElements.delete(cardId);
  }
  handDisplayPendingByCard.delete(cardId);
}

function removeTableCardElement(cardId) {
  const tableCard = cardElements.get(cardId);
  if (tableCard) {
    tableCard.remove();
    cardElements.delete(cardId);
  }
  clearCardFlipTimer(cardId);
  cardFaces.delete(cardId);
  frontDisplayPendingByCard.delete(cardId);
}

function renderLocalHandCards() {
  ensureHandUiElements();
  if (!handTray) {
    return;
  }

  if (handReorderState?.cardId && !cards.has(handReorderState.cardId)) {
    handReorderState = null;
  }
  if (handDropPreview?.cardId && !cards.has(handDropPreview.cardId)) {
    handDropPreview = null;
  }

  const sortedLocalHandIds = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (getCardHandOwnerId(cardState) === localPlayerToken) {
      sortedLocalHandIds.push(cardId);
    }
  }

  sortedLocalHandIds.sort((leftId, rightId) => {
    const left = cards.get(leftId);
    const right = cards.get(rightId);
    return (Number(left?.z) || 0) - (Number(right?.z) || 0);
  });

  const trayWidth = tableRoot?.clientWidth || window.innerWidth || 0;
  let localHandIds = [...sortedLocalHandIds];
  if (handReorderState?.cardId) {
    const reordered = handReorderState.order.filter((cardId) => localHandIds.includes(cardId));
    for (const cardId of localHandIds) {
      if (!reordered.includes(cardId)) {
        reordered.push(cardId);
      }
    }
    localHandIds = reordered;
  }

  let previewCardId = null;
  if (handDropPreview?.cardId && cards.has(handDropPreview.cardId) && !localHandIds.includes(handDropPreview.cardId)) {
    const previewCardState = cards.get(handDropPreview.cardId);
    if (previewCardState && !getCardHandOwnerId(previewCardState) && previewCardState.holderClientId === localClientId) {
      previewCardId = handDropPreview.cardId;
      const previewIndex = getHandInsertIndex(handDropPreview.clientX, localHandIds.length + 1, trayWidth);
      localHandIds.splice(previewIndex, 0, previewCardId);
    }
  }

  if (localHandIds.length === 0) {
    handTray.classList.add('hidden');
    handHoverLayout = null;
    setHoveredHandCard(null);
    for (const staleId of handCardElements.keys()) {
      removeHandCardElement(staleId);
    }
    return;
  }

  handTray.classList.remove('hidden');
  const handSize = localHandIds.length;
  const { fanStep, startX } = getHandFanLayout(handSize, trayWidth);
  const hoverCardIds = sortedLocalHandIds.filter((cardId) => cardId !== previewCardId);
  const hoverLayout = getHandFanLayout(hoverCardIds.length, trayWidth);
  const hoverMinCenter = hoverLayout.startX + HAND_CARD_WIDTH / 2;
  const hoverMaxCenter = hoverMinCenter + hoverLayout.fanStep * Math.max(0, hoverCardIds.length - 1);
  handHoverLayout = {
    cardIds: hoverCardIds,
    fanStep: hoverLayout.fanStep,
    minCenter: hoverMinCenter,
    maxCenter: hoverMaxCenter,
    startX: hoverLayout.startX,
    endX: hoverLayout.startX + hoverLayout.totalWidth
  };
  const tableRect = tableRoot?.getBoundingClientRect();
  const activeHandIds = new Set(localHandIds);

  for (let index = 0; index < localHandIds.length; index += 1) {
    const cardId = localHandIds[index];
    const cardState = cards.get(cardId);
    if (!cardState) {
      continue;
    }

    const handCard = ensureHandCardElement(cardId);
    if (!handCard) {
      continue;
    }

    const isActiveReorderCard = Boolean(handReorderState) && handReorderState.cardId === cardId;
    const isPreviewCard = previewCardId === cardId;

    let left = startX + fanStep * index;
    let bottom = HAND_CARD_BASE_BOTTOM_OFFSET;
    let zIndex = index + 1;
    if (isActiveReorderCard && tableRect) {
      left = clamp(
        handReorderState.clientX - tableRect.left - HAND_CARD_WIDTH / 2,
        8,
        Math.max(8, trayWidth - HAND_CARD_WIDTH - 8)
      );
      const draggedBottom = tableRect.bottom - handReorderState.clientY - HAND_CARD_HEIGHT / 2;
      const maxLiftBottom = handReorderState.releaseToTable
        ? Math.max(138, tableRect.height - HAND_CARD_HEIGHT * 0.34)
        : 138;
      bottom = clamp(draggedBottom, HAND_CARD_BASE_BOTTOM_OFFSET - 8, maxLiftBottom);
      zIndex = 99999;
    } else if (isPreviewCard) {
      zIndex = handSize + 6;
    }

    handCard.style.left = `${left}px`;
    handCard.style.bottom = `${bottom}px`;
    handCard.style.width = `${HAND_CARD_WIDTH}px`;
    handCard.style.height = `${HAND_CARD_HEIGHT}px`;
    handCard.style.zIndex = String(zIndex);
    handCard.classList.toggle('is-reordering-active', isActiveReorderCard);
    handCard.classList.toggle('is-preview', isPreviewCard);
    handCard.classList.toggle('is-hovered', !isActiveReorderCard && !isPreviewCard && hoveredHandCardId === cardId);

    const image = handCard.querySelector('img');
    if (!image) {
      continue;
    }

    const variants = resolveFrontVariantSources(cardState.frontSrc, HAND_CARD_WIDTH);
    const currentSrc = image.getAttribute('src') || image.currentSrc || image.src || '';
    let displaySrc = chooseLoadedFrontDisplaySrc(variants.preferredSrc, variants.fallbackSrc, currentSrc);
    if (!displaySrc) {
      const pendingKey = `${variants.preferredSrc}|${variants.fallbackSrc}|${cardState.frontSrc}`;
      if (handDisplayPendingByCard.get(cardId) !== pendingKey) {
        handDisplayPendingByCard.set(cardId, pendingKey);
        const rerenderWhenReady = () => {
          if (handDisplayPendingByCard.get(cardId) !== pendingKey) {
            return;
          }
          const latestCard = cards.get(cardId);
          if (!latestCard || getCardHandOwnerId(latestCard) !== localPlayerToken) {
            handDisplayPendingByCard.delete(cardId);
            return;
          }
          const latestVariants = resolveFrontVariantSources(latestCard.frontSrc, HAND_CARD_WIDTH);
          const hasLoadedVariant =
            isFrontImageLoaded(latestVariants.preferredSrc) ||
            (latestVariants.fallbackSrc && isFrontImageLoaded(latestVariants.fallbackSrc));
          if (!hasLoadedVariant) {
            return;
          }
          handDisplayPendingByCard.delete(cardId);
          renderLocalHandCards();
        };
        ensureFrontImageLoaded(variants.preferredSrc).then((loaded) => {
          if (loaded) {
            rerenderWhenReady();
          }
        });
        if (variants.fallbackSrc && variants.fallbackSrc !== variants.preferredSrc) {
          ensureFrontImageLoaded(variants.fallbackSrc).then((loaded) => {
            if (loaded) {
              rerenderWhenReady();
            }
          });
        }
      }
    }

    handCard.classList.toggle('is-front-pending', !displaySrc);
    if (displaySrc) {
      if (!imageHasSource(image, displaySrc)) {
        image.src = displaySrc;
      }
    } else if (image.getAttribute('src')) {
      image.removeAttribute('src');
    }
  }

  for (const staleId of handCardElements.keys()) {
    if (!activeHandIds.has(staleId)) {
      removeHandCardElement(staleId);
    }
  }

  if (hoveredHandCardId && !activeHandIds.has(hoveredHandCardId)) {
    setHoveredHandCard(null);
  }
  if (Number.isFinite(lastHandHoverClientX) && Number.isFinite(lastHandHoverClientY)) {
    updateHandHoverFromClient(lastHandHoverClientX, lastHandHoverClientY, 'mouse');
  }
}

function animateCardFlip(cardId, card, image, nextSrc) {
  clearCardFlipTimer(cardId);
  card.classList.remove('is-flipping');
  // Restart the keyframe cleanly on rapid repeated flips.
  void card.offsetWidth;
  card.classList.add('is-flipping');

  const swapTimer = window.setTimeout(() => {
    const currentSrc = image.getAttribute('src') || '';
    if (nextSrc) {
      if (currentSrc !== nextSrc) {
        image.src = nextSrc;
      }
    } else if (currentSrc) {
      image.removeAttribute('src');
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
    removeHandCardElement(cardId);
    removeTableCardElement(cardId);
    return;
  }

  const handOwnerClientId = getCardHandOwnerId(cardState);
  if (handOwnerClientId) {
    selectedCardIds.delete(cardId);
    removeTableCardElement(cardId);
    if (handOwnerClientId !== localPlayerToken) {
      removeHandCardElement(cardId);
    }
    return;
  }

  removeHandCardElement(cardId);

  const card = ensureCardElement(cardId);
  if (!card) {
    return;
  }

  const discardCenter = cardState.inDiscard && deckState ? getDiscardCenterPosition() : null;
  const auctionCenter = cardState.inAuction && deckState ? getAuctionCenterPosition() : null;
  const cardWorldX = cardState.inDeck && deckState ? deckState.x : discardCenter ? discardCenter.x : auctionCenter ? auctionCenter.x : cardState.x;
  const cardWorldY = cardState.inDeck && deckState ? deckState.y : discardCenter ? discardCenter.y : auctionCenter ? auctionCenter.y : cardState.y;
  const screen = worldToScreen({ x: cardWorldX, y: cardWorldY });
  card.style.left = `${screen.x}px`;
  card.style.top = `${screen.y}px`;
  const auctionCardWorldWidth = CARD_WIDTH * AUCTION_CARD_SCALE;
  const auctionCardWorldHeight = CARD_HEIGHT * AUCTION_CARD_SCALE;
  const cardScreenWidth = cardState.inAuction
    ? snapToDevicePixel(auctionCardWorldWidth * camera.scale)
    : snapToDevicePixel(CARD_WIDTH * camera.scale);
  const cardScreenHeight = cardState.inAuction
    ? snapToDevicePixel(auctionCardWorldHeight * camera.scale)
    : (cardScreenWidth * CARD_HEIGHT) / CARD_WIDTH;
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
  card.classList.toggle('is-hand-preview-hidden', handDropPreview?.cardId === cardId);
  card.classList.toggle('is-held-by-self', heldBySelf);
  card.classList.toggle('is-held-by-other', heldByOther);
  card.classList.toggle('is-group-selected', selectedCardIds.has(cardId));
  card.classList.toggle('is-in-discard', cardState.inDiscard);
  card.classList.toggle('is-in-auction', cardState.inAuction);
  card.classList.toggle('is-discard-returning', discardReturnAnimatingCardIds.has(cardId));

  const image = card.querySelector('img');
  if (image) {
    const previousFace = cardFaces.get(cardId);
    const showingFront = cardState.face === 'front';
    const hasLoadedImage = Boolean(image.getAttribute('src'));

    let preferredFrontSrc = '';
    let fallbackFrontSrc = '';
    let displaySrc = CARD_BACK_IMAGE_SRC;
    if (showingFront) {
      const variants = resolveFrontVariantSources(cardState.frontSrc, cardScreenWidth);
      preferredFrontSrc = variants.preferredSrc;
      fallbackFrontSrc = variants.fallbackSrc;
      const currentSrc = image.getAttribute('src') || image.currentSrc || image.src || '';
      displaySrc = chooseLoadedFrontDisplaySrc(preferredFrontSrc, fallbackFrontSrc, currentSrc);
      if (!displaySrc) {
        displaySrc = '';
        const pendingKey = `${preferredFrontSrc}|${fallbackFrontSrc}|${cardState.frontSrc}`;
        if (frontDisplayPendingByCard.get(cardId) !== pendingKey) {
          frontDisplayPendingByCard.set(cardId, pendingKey);
          const rerenderWhenReady = () => {
            if (frontDisplayPendingByCard.get(cardId) !== pendingKey) {
              return;
            }
            const latestCardState = cards.get(cardId);
            if (!latestCardState || latestCardState.face !== 'front' || latestCardState.frontSrc !== cardState.frontSrc) {
              frontDisplayPendingByCard.delete(cardId);
              return;
            }
            const latestVariants = resolveFrontVariantSources(
              latestCardState.frontSrc,
              snapToDevicePixel(CARD_WIDTH * camera.scale)
            );
            const hasAnyVariantLoaded =
              isFrontImageLoaded(latestVariants.preferredSrc) ||
              (latestVariants.fallbackSrc && isFrontImageLoaded(latestVariants.fallbackSrc));
            if (!hasAnyVariantLoaded) {
              return;
            }
            frontDisplayPendingByCard.delete(cardId);
            renderCardElement(cardId);
          };

          ensureFrontImageLoaded(preferredFrontSrc).then((loaded) => {
            if (loaded) {
              rerenderWhenReady();
            }
          });
          if (fallbackFrontSrc && fallbackFrontSrc !== preferredFrontSrc) {
            ensureFrontImageLoaded(fallbackFrontSrc).then((loaded) => {
              if (loaded) {
                rerenderWhenReady();
              }
            });
          }
        }
      }
    } else {
      frontDisplayPendingByCard.delete(cardId);
    }

    if (showingFront && preferredFrontSrc && !isFrontImageLoaded(preferredFrontSrc)) {
      void ensureFrontImageLoaded(preferredFrontSrc);
    }

    card.classList.toggle('is-front-pending', showingFront && !displaySrc);

    if (previousFace && previousFace !== cardState.face && hasLoadedImage) {
      animateCardFlip(cardId, card, image, displaySrc);
    } else if (displaySrc) {
      if (!imageHasSource(image, displaySrc)) {
        image.src = displaySrc;
      }
    } else if (image.getAttribute('src')) {
      image.removeAttribute('src');
    }
    cardFaces.set(cardId, cardState.face);
  }
}

function renderAllCards() {
  for (const cardId of cards.keys()) {
    renderCardElement(cardId);
  }
  renderDeckControls();
  renderLocalHandCards();
  setLocalHandCountLabel();
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

function syncDrawModeUi() {
  tableRoot?.classList.toggle('is-draw-mode', drawModeEnabled);
  if (drawClearButton) {
    drawClearButton.classList.toggle('hidden', !drawModeEnabled);
    drawClearButton.setAttribute('title', 'delete my drawings');
  }
  if (drawUndoButton) {
    drawUndoButton.classList.toggle('hidden', !drawModeEnabled);
    drawUndoButton.setAttribute('title', 'undo last stroke');
  }
  if (!drawModeButton) {
    return;
  }
  drawModeButton.classList.toggle('is-active', drawModeEnabled);
  drawModeButton.setAttribute('aria-pressed', drawModeEnabled ? 'true' : 'false');
  drawModeButton.setAttribute('title', drawModeEnabled ? 'drawing mode: on' : 'drawing mode: off');
}

function normalizeStrokePoint(rawPoint) {
  let x = Number.NaN;
  let y = Number.NaN;
  if (Array.isArray(rawPoint)) {
    x = Number(rawPoint[0]);
    y = Number(rawPoint[1]);
  } else if (rawPoint && typeof rawPoint === 'object') {
    x = Number(rawPoint.x);
    y = Number(rawPoint.y);
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return {
    x: clamp(x, 0, WORLD_WIDTH),
    y: clamp(y, 0, WORLD_HEIGHT)
  };
}

function normalizeDrawingPayload(payload) {
  const color = normalizeHexColor(payload?.color || '#ff7a59');
  const authorClientId = typeof payload?.authorClientId === 'string' ? payload.authorClientId : '';
  const authorPlayerToken = typeof payload?.authorPlayerToken === 'string' ? payload.authorPlayerToken : '';
  const createdAtRaw = Number(payload?.createdAt);
  const updatedAtRaw = Number(payload?.updatedAt);
  const pointsRaw = Array.isArray(payload?.points) ? payload.points : [];
  const points = [];
  for (const rawPoint of pointsRaw) {
    const normalizedPoint = normalizeStrokePoint(rawPoint);
    if (!normalizedPoint) {
      continue;
    }
    points.push(normalizedPoint);
  }
  return {
    color,
    points,
    authorClientId,
    authorPlayerToken,
    createdAt: Number.isFinite(createdAtRaw) ? createdAtRaw : 0,
    updatedAt: Number.isFinite(updatedAtRaw) ? updatedAtRaw : 0
  };
}

function serializeDrawingPoints(points) {
  return points.map((point) => ({
    x: Number(point.x.toFixed(2)),
    y: Number(point.y.toFixed(2))
  }));
}

function removeDrawingStrokeElement(strokeId) {
  const strokeElement = drawingStrokeElements.get(strokeId);
  if (!strokeElement) {
    return;
  }
  strokeElement.remove();
  drawingStrokeElements.delete(strokeId);
}

function ensureDrawingStrokeElement(strokeId) {
  if (!(drawingLayer instanceof SVGElement)) {
    return null;
  }
  let stroke = drawingStrokeElements.get(strokeId);
  if (!stroke) {
    stroke = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    stroke.classList.add('drawing-stroke');
    stroke.setAttribute('stroke-width', String(DRAW_STROKE_WORLD_WIDTH));
    stroke.setAttribute('fill', 'none');
    drawingLayer.appendChild(stroke);
    drawingStrokeElements.set(strokeId, stroke);
  }
  return stroke;
}

function renderDrawingStroke(strokeId) {
  const strokeState = drawingStrokes.get(strokeId);
  if (!strokeState || !Array.isArray(strokeState.points) || strokeState.points.length === 0) {
    removeDrawingStrokeElement(strokeId);
    return;
  }
  const stroke = ensureDrawingStrokeElement(strokeId);
  if (!stroke) {
    return;
  }
  const points = strokeState.points;
  const pointsText =
    points.length === 1
      ? `${points[0].x},${points[0].y} ${points[0].x + 0.01},${points[0].y + 0.01}`
      : points.map((point) => `${point.x},${point.y}`).join(' ');
  stroke.setAttribute('stroke', normalizeHexColor(strokeState.color || '#ff7a59'));
  stroke.setAttribute('points', pointsText);
}

function renderAllDrawingStrokes() {
  for (const strokeId of drawingStrokes.keys()) {
    renderDrawingStroke(strokeId);
  }
  for (const strokeId of Array.from(drawingStrokeElements.keys())) {
    if (!drawingStrokes.has(strokeId)) {
      removeDrawingStrokeElement(strokeId);
    }
  }
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
  if (drawingLayer) {
    drawingLayer.style.transform = `translate(${camera.panX}px, ${camera.panY}px) scale(${camera.scale})`;
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
  scheduleCameraViewPersist();
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
  if (drawingLayer) {
    drawingLayer.style.width = `${WORLD_WIDTH}px`;
    drawingLayer.style.height = `${WORLD_HEIGHT}px`;
    if (drawingLayer instanceof SVGElement) {
      drawingLayer.setAttribute('viewBox', `0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`);
    }
  }

  const storedView = readStoredCameraView();
  if (storedView) {
    camera.scale = storedView.scale;
    camera.panX = storedView.panX;
    camera.panY = storedView.panY;
  } else {
    const rect = tableRoot.getBoundingClientRect();
    camera.scale = 1;
    camera.panX = rect.width / 2 - (WORLD_WIDTH * camera.scale) / 2;
    camera.panY = rect.height / 2 - (WORLD_HEIGHT * camera.scale) / 2;
  }
  applyCamera();
  renderAllDrawingStrokes();
}

function ensureModeIconMarkup() {
  if (!modeIcon) {
    return;
  }
  if (modeIcon.dataset.ready === '1') {
    return;
  }
  modeIcon.innerHTML =
    '<svg class="mode-icon mode-icon-sun" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke-width="2"/><path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M19.07 4.93L16.95 7.05M7.05 16.95L4.93 19.07" stroke-width="2" stroke-linecap="round"/></svg><svg class="mode-icon mode-icon-moon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 1 1 8.5 4a7 7 0 1 0 11.5 11.5Z" stroke-width="2" stroke-linejoin="round"/></svg>';
  modeIcon.dataset.ready = '1';
}

function setModeIcon(lightModeEnabled) {
  if (!modeIcon) {
    return;
  }
  ensureModeIconMarkup();
  modeIcon.classList.toggle('is-light', Boolean(lightModeEnabled));
  modeIcon.classList.toggle('is-dark', !Boolean(lightModeEnabled));
}

function setLightMode(enabled, options = {}) {
  const shouldAnimate = options.animate !== false;
  const nextEnabled = Boolean(enabled);

  if (!tableRoot) {
    setModeIcon(nextEnabled);
    return;
  }

  if (themeTransitionTimerId) {
    window.clearTimeout(themeTransitionTimerId);
    themeTransitionTimerId = 0;
  }

  if (shouldAnimate) {
    tableRoot.classList.add('is-theme-transitioning');
  } else {
    tableRoot.classList.remove('is-theme-transitioning');
  }

  tableRoot.classList.toggle('light-mode', nextEnabled);
  setModeIcon(nextEnabled);

  if (!shouldAnimate) {
    return;
  }

  themeTransitionTimerId = window.setTimeout(() => {
    themeTransitionTimerId = 0;
    tableRoot?.classList.remove('is-theme-transitioning');
  }, 230);
}

const storedLightMode = localStorage.getItem(LIGHT_MODE_KEY);
const hasLightModeEnabled = storedLightMode === null ? true : storedLightMode === '1';
if (storedLightMode === null) {
  localStorage.setItem(LIGHT_MODE_KEY, '1');
}
setLightMode(hasLightModeEnabled, { animate: false });
if (lightModeToggle) {
  lightModeToggle.checked = hasLightModeEnabled;
  lightModeToggle.addEventListener('change', () => {
    const enabled = lightModeToggle.checked;
    setLightMode(enabled);
    localStorage.setItem(LIGHT_MODE_KEY, enabled ? '1' : '0');
  });
}
syncDrawModeUi();
drawModeButton?.addEventListener('click', () => {
  setDrawModeEnabled(!drawModeEnabled);
});
drawClearButton?.addEventListener('click', () => {
  if (!drawModeEnabled) {
    return;
  }
  clearOwnDrawings().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
drawUndoButton?.addEventListener('click', () => {
  if (!drawModeEnabled) {
    return;
  }
  undoOwnDrawing().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

setRoomBadgeText(defaultRoomTitle);
setRoomOwnerState(false);

roomBadge?.addEventListener('click', () => {
  openRoomTitleEditor();
});

roomBadge?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openRoomTitleEditor();
  }
});

async function submitRoomTitleInput() {
  if (!roomTitleInput || !isRoomOwner || !isRoomTitleEditing) {
    return;
  }
  const previousTitle = roomTitleValue;
  const nextTitle = normalizeRoomTitle(roomTitleInput.value);
  roomTitleInput.value = nextTitle;
  setRoomBadgeText(nextTitle);
  try {
    await renameRoomTitle(nextTitle);
  } catch (error) {
    console.error(error);
    setRoomBadgeText(previousTitle);
    setRealtimeStatus('firebase: write blocked');
  }
}

roomTitleInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitRoomTitleInput().finally(() => {
      closeRoomTitleEditor();
    });
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    roomTitleInput.value = roomTitleValue;
    closeRoomTitleEditor();
  }
});

roomTitleInput?.addEventListener('blur', () => {
  submitRoomTitleInput().finally(() => {
    closeRoomTitleEditor();
  });
});

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

function submitAuctionBidFromUi() {
  submitAuctionBid(auctionBidInput?.value || '').catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
}

auctionBidInput?.addEventListener('input', () => {
  const sanitized = sanitizeBidInputText(auctionBidInput.value);
  if (auctionBidInput.value !== sanitized) {
    auctionBidInput.value = sanitized;
  }
  auctionBidInput.classList.remove('is-invalid');
});

auctionBidInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitAuctionBidFromUi();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  const allowedNavigationKeys = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End']);
  if (allowedNavigationKeys.has(event.key)) {
    return;
  }
  if (event.key >= '0' && event.key <= '9') {
    return;
  }
  if (event.key === '.') {
    if (!auctionBidInput.value.includes('.')) {
      return;
    }
    event.preventDefault();
    return;
  }
  event.preventDefault();
});

auctionBidSubmitButton?.addEventListener('click', (event) => {
  event.preventDefault();
  submitAuctionBidFromUi();
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

function parseBidNumber(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }
  const normalized = raw.replace(/,/g, '');
  if (!/^(?:\d+|\d*\.\d+)$/.test(normalized)) {
    return null;
  }
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return null;
  }
  return {
    numericValue,
    textValue: normalized
  };
}

function sanitizeBidInputText(value) {
  const raw = String(value || '');
  let next = '';
  let hasDecimalPoint = false;
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      next += char;
      continue;
    }
    if (char === '.' && !hasDecimalPoint) {
      next += char;
      hasDecimalPoint = true;
    }
  }
  return next;
}

function hasPlaceholderConfig(config) {
  return Object.values(config).some((value) => String(value).includes('REPLACE_ME'));
}

function normalizeRoomTitle(value) {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ROOM_TITLE_MAX_LENGTH);
  return normalized || defaultRoomTitle;
}

function generateOwnerToken() {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateOwnerToken() {
  const existing = String(localStorage.getItem(OWNER_TOKEN_KEY) || '').trim();
  if (existing) {
    return existing;
  }
  const created = generateOwnerToken();
  localStorage.setItem(OWNER_TOKEN_KEY, created);
  return created;
}

const ownerToken = getOrCreateOwnerToken();

function getOrCreatePlayerToken() {
  const existing = String(localStorage.getItem(PLAYER_TOKEN_KEY) || '').trim();
  if (existing) {
    return existing;
  }
  const created = generateOwnerToken();
  localStorage.setItem(PLAYER_TOKEN_KEY, created);
  return created;
}

localPlayerToken = getOrCreatePlayerToken();

function setRealtimeStatus(text) {
  if (!statusBadge) {
    return;
  }
  statusBadge.textContent = text;
}

function setRoomBadgeText(title) {
  roomTitleValue = normalizeRoomTitle(title);
  if (roomBadge && !isRoomTitleEditing) {
    roomBadge.textContent = roomTitleValue;
  }
}

function setRoomOwnerState(isOwner) {
  isRoomOwner = Boolean(isOwner);
  if (!roomBadge) {
    return;
  }
  roomBadge.classList.toggle('is-editable', isRoomOwner);
  roomBadge.tabIndex = isRoomOwner ? 0 : -1;
  roomBadge.setAttribute('title', isRoomOwner ? 'rename room' : '');
}

function openRoomTitleEditor() {
  if (!roomBadge || !roomTitleInput || !isRoomOwner) {
    return;
  }
  isRoomTitleEditing = true;
  roomTitleInput.value = roomTitleValue;
  roomBadge.classList.add('hidden');
  roomTitleInput.classList.remove('hidden');
  roomTitleInput.focus();
  roomTitleInput.select();
}

function closeRoomTitleEditor() {
  if (!roomBadge || !roomTitleInput) {
    return;
  }
  isRoomTitleEditing = false;
  roomTitleInput.classList.add('hidden');
  roomBadge.classList.remove('hidden');
  roomBadge.textContent = roomTitleValue;
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
      '#copyLinkButton, #bottomRightControls, #assetMenuModal, #playerControls, #bottomLeftControls, #roomBadge, #roomTitleInput, #drawModeButton, #drawClearButton, #drawUndoButton, #auctionBidEntry, #auctionBidInput, .deck-control-button, #handTray, #handDropGlow'
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

function safeSetPointerCapture(target, pointerId) {
  if (!(target instanceof Element)) {
    return;
  }
  try {
    target.setPointerCapture?.(pointerId);
  } catch {
    // Touch pointers can end before async lock paths complete; ignore capture failures.
  }
}

function upsertDot(id, payload) {
  if (!cursorLayer || typeof payload?.x !== 'number' || typeof payload?.y !== 'number') {
    return;
  }

  if (localClientId && id === localClientId) {
    const existingDot = dots.get(id);
    if (existingDot) {
      existingDot.remove();
      dots.delete(id);
    }
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

  const handCountsByOwner = getHandCountsByOwner();
  setLocalHandCountLabel();
  roomRoster.textContent = '';
  const entries = Object.entries(allCursors || {}).filter(([id, payload]) => {
    if (id === localId) {
      return false;
    }
    const entryToken =
      typeof payload?.playerToken === 'string' && payload.playerToken ? payload.playerToken : '';
    if (localPlayerToken && entryToken && entryToken === localPlayerToken) {
      return false;
    }
    return true;
  });
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

    const ownerToken =
      typeof payload?.playerToken === 'string' && payload.playerToken ? payload.playerToken : id;

    const count = document.createElement('span');
    count.className = 'room-roster-count';
    const countFromToken = handCountsByOwner.get(ownerToken) || 0;
    const countFromClientId = ownerToken === id ? 0 : handCountsByOwner.get(id) || 0;
    count.textContent = String(countFromToken + countFromClientId);
    row.appendChild(count);

    const label = document.createElement('span');
    label.className = 'room-roster-name';
    const trimmedName = String(payload?.name || '').trim();
    label.textContent = trimmedName || 'anon';
    row.appendChild(label);

    const dot = document.createElement('span');
    dot.className = 'room-roster-dot';
    dot.style.background = payload?.color || colorFromId(id);
    row.appendChild(dot);

    fragment.appendChild(row);
  }

  roomRoster.appendChild(fragment);
  roomRoster.classList.remove('hidden');
}

function getActivePlayerTokensForDeal() {
  const playersByToken = new Map();

  for (const [id, payload] of Object.entries(latestRoomCursors || {})) {
    const token = typeof payload?.playerToken === 'string' && payload.playerToken ? payload.playerToken : id;
    if (!token) {
      continue;
    }
    const name = String(payload?.name || '').trim().toLowerCase();
    const existing = playersByToken.get(token);
    if (!existing) {
      playersByToken.set(token, {
        token,
        sortName: name || '',
        sortKey: name || `~${token}`
      });
      continue;
    }
    if (!existing.sortName && name) {
      existing.sortName = name;
      existing.sortKey = name;
    }
  }

  if (localPlayerToken) {
    const localName = String(playerState?.name || '').trim().toLowerCase();
    const existing = playersByToken.get(localPlayerToken);
    if (!existing) {
      playersByToken.set(localPlayerToken, {
        token: localPlayerToken,
        sortName: localName || '',
        sortKey: localName || `~${localPlayerToken}`
      });
    } else if (!existing.sortName && localName) {
      existing.sortName = localName;
      existing.sortKey = localName;
    }
  }

  return Array.from(playersByToken.values())
    .sort((left, right) => {
      const byName = left.sortKey.localeCompare(right.sortKey);
      if (byName !== 0) {
        return byName;
      }
      return left.token.localeCompare(right.token);
    })
    .map((entry) => entry.token);
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
shieldPointerEvents(roomBadge);
shieldPointerEvents(roomTitleInput);
shieldPointerEvents(drawModeButton);
shieldPointerEvents(drawClearButton);
shieldPointerEvents(drawUndoButton);
shieldPointerEvents(auctionBidEntry);
shieldPointerEvents(auctionBidInput);
shieldPointerEvents(auctionBidSubmitButton);

async function startRealtimeSession() {
  if (!tableRoot || !playspaceLayer || !drawingLayer || !cardLayer || !cursorLayer || !playerControls) {
    throw new Error('Missing required DOM nodes');
  }

  initializeCamera();

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const cursorsRef = ref(db, `${roomPath}/cursors`);
  const cardsRef = ref(db, `${roomPath}/cards`);
  const drawingsRef = ref(db, `${roomPath}/drawings`);
  const auctionBidsRef = ref(db, `${roomPath}/auctionBids`);
  const deckRef = ref(db, `${roomPath}/decks/${DECK_KEY}`);
  const deckShuffleTickRef = ref(db, `${roomPath}/decks/${DECK_KEY}/shuffleTick`);
  const roomMetaRef = ref(db, `${roomPath}/meta`);
  const roomPresenceRef = ref(db, `${roomPath}/presence`);
  const connectedRef = ref(db, '.info/connected');

  const myCursorRef = push(cursorsRef);
  const clientId = myCursorRef.key;
  if (!clientId) {
    throw new Error('Failed to create unique cursor ID');
  }
  localClientId = clientId;
  const myPresenceRef = ref(db, `${roomPath}/presence/${localPlayerToken}`);

  function buildPayload(position = localPosition) {
    return {
      x: clamp(position.x, 0, 1),
      y: clamp(position.y, 0, 1),
      name: playerState.name,
      color: playerState.color,
      playerToken: localPlayerToken,
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

  await runTransaction(
    roomMetaRef,
    (currentMeta) => {
      const baseMeta = currentMeta && typeof currentMeta === 'object' ? { ...currentMeta } : {};
      const currentOwnerToken = typeof baseMeta.ownerToken === 'string' ? baseMeta.ownerToken : '';
      return {
        ...baseMeta,
        title: normalizeRoomTitle(baseMeta.title),
        ownerToken: currentOwnerToken || ownerToken,
        updatedAt: Date.now()
      };
    },
    { applyLocally: false }
  );

  renameRoomTitle = async (nextTitle) => {
    const normalizedTitle = normalizeRoomTitle(nextTitle);
    const result = await runTransaction(
      roomMetaRef,
      (currentMeta) => {
        if (!currentMeta || typeof currentMeta !== 'object') {
          return;
        }
        const currentOwnerToken = typeof currentMeta.ownerToken === 'string' ? currentMeta.ownerToken : '';
        if (!currentOwnerToken || currentOwnerToken !== ownerToken) {
          return;
        }
        return {
          ...currentMeta,
          title: normalizedTitle,
          ownerToken: currentOwnerToken,
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    if (!result.committed) {
      throw new Error('Only the room creator can rename this room.');
    }
  };

  await set(myCursorRef, buildPayload(localPosition));
  onDisconnect(myCursorRef).remove();
  await update(myPresenceRef, {
    connected: true,
    clientId,
    lastSeen: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  onDisconnect(myPresenceRef).update({
    connected: false,
    clientId: null,
    lastSeen: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
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
  let knownCursorIds = new Set();
  let latestPresenceByToken = {};
  let handReclaimInProgress = false;
  let handReclaimRafQueued = false;
  let handReclaimIntervalId = 0;
  let localLockWatchdogIntervalId = 0;
  const endedTouchPointerIds = new Set();
  const recentTouchTapByCardId = new Map();
  const recentMouseClickByCardId = new Map();
  let selectedRightClickFlipCooldownUntil = 0;
  let strokeWriteScheduled = false;
  const pendingStrokeWrites = new Map();
  let strokeWriteGeneration = 0;
  let drawPointerState = null;
  let latestAuctionBidsByCard = {};
  let auctionBidUiRafQueued = false;
  let activeAuctionCardIdForUi = '';
  let previousActiveAuctionCardId = '';

  function setHandHoverDragLock(active) {
    const isActive = Boolean(active);
    tableRoot?.classList.toggle('is-card-dragging', isActive);
    if (handTray) {
      handTray.classList.toggle('is-card-dragging', isActive);
    }
    if (isActive) {
      setHoveredHandCard(null);
    } else if (Number.isFinite(lastHandHoverClientX) && Number.isFinite(lastHandHoverClientY)) {
      updateHandHoverFromClient(lastHandHoverClientX, lastHandHoverClientY, 'mouse');
    }
  }

  function syncHandHoverDragLock() {
    setHandHoverDragLock(Boolean(cardDragState || groupDragState || handReorderState));
  }

  function hasActiveCardInteraction() {
    return Boolean(cardDragState || groupDragState || handReorderState || deckDragState || selectionBoxState);
  }

  function hasDragPointerComeToRest(dragState) {
    if (!dragState) {
      return false;
    }
    const lastMotionAt = Number(dragState.lastMotionAt) || 0;
    return Date.now() - lastMotionAt >= RIGHT_CLICK_FLIP_REST_MS;
  }

  function cancelActiveCardInteractions() {
    const hasCardDrag = Boolean(cardDragState || groupDragState);
    if (!hasCardDrag) {
      return;
    }

    const cardIdsToRelease = new Set();
    if (cardDragState?.cardId) {
      cardIdsToRelease.add(cardDragState.cardId);
    }
    if (groupDragState?.basePositions instanceof Map) {
      for (const cardId of groupDragState.basePositions.keys()) {
        cardIdsToRelease.add(cardId);
      }
    }
    for (const selectedId of selectedCardIds) {
      cardIdsToRelease.add(selectedId);
    }

    const selectedIds = Array.from(selectedCardIds);
    selectedCardIds.clear();
    for (const selectedId of selectedIds) {
      renderCardElement(selectedId);
    }

    cardDragState = null;
    groupDragState = null;
    selectionBoxState = null;
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    setHandDropPreview(null);
    hideSelectionBox();
    syncHandHoverDragLock();

    for (const cardId of cardIdsToRelease) {
      const cardState = cards.get(cardId);
      if (!cardState || cardState.holderClientId !== clientId) {
        renderCardElement(cardId);
        continue;
      }
      const releasePatch = {
        holderClientId: null
      };
      patchLocalCard(cardId, releasePatch);
      queueCardPatch(cardId, releasePatch);
      releaseCardLock(cardId).catch((error) => {
        console.error(error);
      });
    }
  }

  function releaseUnexpectedLocalCardLocks() {
    if (hasActiveCardInteraction()) {
      return;
    }
    const movableSelectedIds = new Set(getMovableSelectedIds());
    for (const [cardId, cardState] of cards.entries()) {
      if (!cardState || cardState.holderClientId !== clientId) {
        continue;
      }
      if (movableSelectedIds.has(cardId)) {
        continue;
      }
      const releasePatch = {
        holderClientId: null
      };
      patchLocalCard(cardId, releasePatch);
      queueCardPatch(cardId, releasePatch);
      releaseCardLock(cardId).catch((error) => {
        console.error(error);
      });
    }
  }

  function markTouchPointerEnded(event) {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      endedTouchPointerIds.add(event.pointerId);
    }
  }

  function wasTouchPointerReleased(pointerType, pointerId) {
    return (pointerType === 'touch' || pointerType === 'pen') && endedTouchPointerIds.has(pointerId);
  }

  function pruneRecentTouchTaps(now = Date.now()) {
    for (const [cardId, tap] of recentTouchTapByCardId.entries()) {
      if (now - tap.time > TOUCH_DOUBLE_TAP_MS) {
        recentTouchTapByCardId.delete(cardId);
      }
    }
  }

  function consumeDoubleTapIfPresent(cardId, event) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      return false;
    }
    const now = Date.now();
    pruneRecentTouchTaps(now);
    const previousTap = recentTouchTapByCardId.get(cardId);
    if (!previousTap) {
      return false;
    }

    const elapsed = now - previousTap.time;
    const distance = Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y);
    if (elapsed > TOUCH_DOUBLE_TAP_MS || distance > TOUCH_DOUBLE_TAP_MAX_DISTANCE_PX) {
      return false;
    }

    recentTouchTapByCardId.delete(cardId);
    return true;
  }

  function rememberTouchTapCandidate(cardId, event) {
    if ((event.pointerType !== 'touch' && event.pointerType !== 'pen') || !cardId) {
      return;
    }
    const now = Date.now();
    pruneRecentTouchTaps(now);
    recentTouchTapByCardId.set(cardId, {
      time: now,
      x: event.clientX,
      y: event.clientY
    });
  }

  function pruneRecentMouseClicks(now = Date.now()) {
    for (const [cardId, click] of recentMouseClickByCardId.entries()) {
      if (now - click.time > MOUSE_DOUBLE_CLICK_MS) {
        recentMouseClickByCardId.delete(cardId);
      }
    }
  }

  function consumeDoubleClickIfPresent(cardId, event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return false;
    }
    const now = Date.now();
    pruneRecentMouseClicks(now);
    const previousClick = recentMouseClickByCardId.get(cardId);
    if (!previousClick) {
      return false;
    }

    const elapsed = now - previousClick.time;
    const distance = Math.hypot(event.clientX - previousClick.x, event.clientY - previousClick.y);
    if (elapsed > MOUSE_DOUBLE_CLICK_MS || distance > MOUSE_DOUBLE_CLICK_MAX_DISTANCE_PX) {
      return false;
    }

    recentMouseClickByCardId.delete(cardId);
    return true;
  }

  function setDeckDropIndicator(visible) {
    const nextVisible = Boolean(cardDragState || groupDragState || handReorderState?.releaseToTable) && Boolean(visible);
    if (deckDropIndicatorVisible === nextVisible) {
      return;
    }
    deckDropIndicatorVisible = nextVisible;
    renderDeckControls();
  }

  function setDiscardDropIndicator(visible) {
    const nextVisible = Boolean(cardDragState || groupDragState || handReorderState?.releaseToTable) && Boolean(visible);
    if (discardDropIndicatorVisible === nextVisible) {
      return;
    }
    discardDropIndicatorVisible = nextVisible;
    renderDeckControls();
  }

  function setAuctionDropIndicator(visible) {
    const nextVisible = Boolean(cardDragState || groupDragState || handReorderState?.releaseToTable) && Boolean(visible);
    if (auctionDropIndicatorVisible === nextVisible) {
      return;
    }
    auctionDropIndicatorVisible = nextVisible;
    renderDeckControls();
  }

  function getLocalHandIdsSortedByZ() {
    const localHandIds = [];
    for (const [cardId, cardState] of cards.entries()) {
      if (getCardHandOwnerId(cardState) === localPlayerToken) {
        localHandIds.push(cardId);
      }
    }
    localHandIds.sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
    return localHandIds;
  }

  function setHandDropPreview(cardId, clientX = 0) {
    const nextCardId = typeof cardId === 'string' && cardId ? cardId : null;
    if (!nextCardId) {
      if (!handDropPreview) {
        return;
      }
      const previousCardId = handDropPreview.cardId;
      handDropPreview = null;
      renderLocalHandCards();
      if (previousCardId) {
        renderCardElement(previousCardId);
      }
      return;
    }

    const nextClientX = Number.isFinite(clientX) ? clientX : handDropPreview?.clientX || 0;
    const previousCardId = handDropPreview?.cardId || null;
    const idChanged = previousCardId !== nextCardId;
    const xChanged = !handDropPreview || Math.abs((handDropPreview.clientX || 0) - nextClientX) >= 0.5;
    if (!idChanged && !xChanged) {
      return;
    }

    handDropPreview = {
      cardId: nextCardId,
      clientX: nextClientX
    };
    renderLocalHandCards();
    if (idChanged && previousCardId) {
      renderCardElement(previousCardId);
    }
    if (idChanged) {
      renderCardElement(nextCardId);
    }
  }

  function getActiveAuctionCardId() {
    const auctionCardIds = getAuctionCardIds();
    if (auctionCardIds.length === 0) {
      return '';
    }
    auctionCardIds.sort((leftId, rightId) => {
      const leftZ = Number(cards.get(leftId)?.z) || 0;
      const rightZ = Number(cards.get(rightId)?.z) || 0;
      return rightZ - leftZ;
    });
    return auctionCardIds[0] || '';
  }

  function getCursorRosterByToken() {
    const roster = new Map();
    for (const [id, payload] of Object.entries(latestRoomCursors || {})) {
      const token = typeof payload?.playerToken === 'string' && payload.playerToken ? payload.playerToken : id;
      if (!token) {
        continue;
      }
      const trimmedName = String(payload?.name || '').trim();
      const existing = roster.get(token) || {
        name: '',
        color: payload?.color || colorFromId(token)
      };
      if (trimmedName) {
        existing.name = trimmedName;
      }
      if (payload?.color) {
        existing.color = payload.color;
      }
      roster.set(token, existing);
    }

    if (localPlayerToken) {
      const localExisting = roster.get(localPlayerToken) || {};
      roster.set(localPlayerToken, {
        name: localExisting.name || String(playerState.name || '').trim(),
        color: playerState.color || localExisting.color || colorFromId(localPlayerToken)
      });
    }

    return roster;
  }

  function buildAuctionBidEntries(auctionCardId) {
    if (!auctionCardId) {
      return [];
    }
    const rosterByToken = getCursorRosterByToken();
    const bidsForCard =
      latestAuctionBidsByCard && typeof latestAuctionBidsByCard[auctionCardId] === 'object'
        ? latestAuctionBidsByCard[auctionCardId]
        : null;
    if (!bidsForCard) {
      return [];
    }

    const entries = [];
    for (const [entryKey, payload] of Object.entries(bidsForCard)) {
      const playerToken =
        typeof payload?.playerToken === 'string' && payload.playerToken
          ? payload.playerToken
          : entryKey;
      if (!playerToken) {
        continue;
      }
      const numericValue = Number(payload?.value);
      if (!Number.isFinite(numericValue)) {
        continue;
      }
      const rosterEntry = rosterByToken.get(playerToken) || {};
      const name = String(rosterEntry.name || '').trim() || 'anon';
      const color = typeof rosterEntry.color === 'string' && rosterEntry.color ? rosterEntry.color : colorFromId(playerToken);
      const updatedAt = Number(payload?.updatedAt) || 0;
      const textValue = String(payload?.text || '').trim() || String(numericValue);
      entries.push({
        playerToken,
        name,
        color,
        numericValue,
        textValue,
        updatedAt
      });
    }

    entries.sort((left, right) => {
      if (right.numericValue !== left.numericValue) {
        return right.numericValue - left.numericValue;
      }
      if (right.updatedAt !== left.updatedAt) {
        return right.updatedAt - left.updatedAt;
      }
      const byName = left.name.localeCompare(right.name);
      if (byName !== 0) {
        return byName;
      }
      return left.playerToken.localeCompare(right.playerToken);
    });
    return entries;
  }

  function positionAuctionBidEntryUnderBoard() {
    if (!tableRoot || !auctionBidBoard || !auctionBidEntry) {
      return;
    }
    if (auctionBidBoard.classList.contains('hidden') || auctionBidEntry.classList.contains('hidden')) {
      return;
    }
    const rootRect = tableRoot.getBoundingClientRect();
    const boardRect = auctionBidBoard.getBoundingClientRect();
    if (!boardRect.width || !boardRect.height) {
      return;
    }
    const top = Math.max(0, boardRect.bottom - rootRect.top + 8);
    auctionBidEntry.style.left = '50%';
    auctionBidEntry.style.top = `${top}px`;
    auctionBidEntry.style.bottom = 'auto';
    auctionBidEntry.style.transform = 'translateX(-50%)';
  }

  function renderAuctionBidUi() {
    const activeAuctionCardId = getActiveAuctionCardId();
    const auctionActive = Boolean(activeAuctionCardId);

    if (auctionBidEntry) {
      auctionBidEntry.classList.toggle('hidden', !auctionActive);
    }
    if (auctionBidBoard) {
      auctionBidBoard.classList.toggle('hidden', !auctionActive);
    }

    if (!auctionActive) {
      activeAuctionCardIdForUi = '';
      if (auctionBidBoard) {
        auctionBidBoard.textContent = '';
      }
      if (auctionBidInput) {
        auctionBidInput.value = '';
        auctionBidInput.classList.remove('is-invalid');
      }
      return;
    }

    const bidEntries = buildAuctionBidEntries(activeAuctionCardId);
    if (auctionBidInput && document.activeElement !== auctionBidInput) {
      if (activeAuctionCardIdForUi !== activeAuctionCardId || auctionBidInput.value.trim() === '') {
        auctionBidInput.value = '';
      }
      auctionBidInput.classList.remove('is-invalid');
    }
    activeAuctionCardIdForUi = activeAuctionCardId;

    if (!auctionBidBoard) {
      return;
    }
    auctionBidBoard.textContent = '';
    if (bidEntries.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'auction-bid-empty';
      emptyState.textContent = 'no bids yet';
      auctionBidBoard.appendChild(emptyState);
      positionAuctionBidEntryUnderBoard();
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of bidEntries) {
      const row = document.createElement('div');
      row.className = 'auction-bid-item';

      const player = document.createElement('span');
      player.className = 'auction-bid-player';

      const dot = document.createElement('span');
      dot.className = 'auction-bid-dot';
      dot.style.background = entry.color;
      player.appendChild(dot);

      const name = document.createElement('span');
      name.className = 'auction-bid-name';
      name.textContent = entry.name;
      player.appendChild(name);

      const value = document.createElement('span');
      value.className = 'auction-bid-value';
      value.textContent = entry.textValue;

      row.appendChild(player);
      row.appendChild(value);
      fragment.appendChild(row);
    }
    auctionBidBoard.appendChild(fragment);
    positionAuctionBidEntryUnderBoard();
  }

  function scheduleAuctionBidUiRender() {
    if (auctionBidUiRafQueued) {
      return;
    }
    auctionBidUiRafQueued = true;
    window.requestAnimationFrame(() => {
      auctionBidUiRafQueued = false;
      renderAuctionBidUi();
    });
  }

  function clearAuctionBidsForCard(auctionCardId) {
    if (!auctionCardId) {
      return;
    }
    if (latestAuctionBidsByCard && typeof latestAuctionBidsByCard === 'object') {
      const nextBidsByCard = { ...latestAuctionBidsByCard };
      delete nextBidsByCard[auctionCardId];
      latestAuctionBidsByCard = nextBidsByCard;
    }
    scheduleAuctionBidUiRender();
    update(auctionBidsRef, { [auctionCardId]: null }).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  }

  submitAuctionBid = async (rawValue) => {
    const activeAuctionCardId = getActiveAuctionCardId();
    if (!activeAuctionCardId) {
      if (auctionBidInput) {
        auctionBidInput.classList.add('is-invalid');
      }
      return;
    }

    const parsedBid = parseBidNumber(rawValue);
    if (!parsedBid) {
      if (auctionBidInput) {
        auctionBidInput.classList.add('is-invalid');
        auctionBidInput.focus();
        auctionBidInput.select();
      }
      return;
    }

    const bidOwnerToken = localPlayerToken || clientId;
    if (!bidOwnerToken) {
      return;
    }

    const bidPayload = {
      value: parsedBid.numericValue,
      text: parsedBid.textValue,
      playerToken: bidOwnerToken,
      updatedAt: serverTimestamp()
    };

    const existingCardBids =
      latestAuctionBidsByCard && typeof latestAuctionBidsByCard[activeAuctionCardId] === 'object'
        ? latestAuctionBidsByCard[activeAuctionCardId]
        : {};
    latestAuctionBidsByCard = {
      ...(latestAuctionBidsByCard || {}),
      [activeAuctionCardId]: {
        ...existingCardBids,
        [bidOwnerToken]: {
          ...bidPayload,
          updatedAt: Date.now()
        }
      }
    };

    if (auctionBidInput) {
      auctionBidInput.classList.remove('is-invalid');
      auctionBidInput.value = '';
    }
    scheduleAuctionBidUiRender();
    await set(ref(db, `${roomPath}/auctionBids/${activeAuctionCardId}/${bidOwnerToken}`), bidPayload);
  };

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

  function patchLocalDrawingStroke(strokeId, patch) {
    if (!strokeId) {
      return;
    }
    const existing = drawingStrokes.get(strokeId) || { color: playerState.color, points: [], createdAt: 0, updatedAt: 0 };
    const nextState = normalizeDrawingPayload({ ...existing, ...patch });
    drawingStrokes.set(strokeId, nextState);
    renderDrawingStroke(strokeId);
  }

  function queueDrawingPatch(strokeId, patch) {
    if (isTableResetting || !strokeId) {
      return;
    }
    const queuedPatch = pendingStrokeWrites.get(strokeId) || {};
    pendingStrokeWrites.set(strokeId, { ...queuedPatch, ...patch });
    if (strokeWriteScheduled) {
      return;
    }

    strokeWriteScheduled = true;
    const scheduledGeneration = strokeWriteGeneration;
    window.requestAnimationFrame(() => {
      strokeWriteScheduled = false;
      if (scheduledGeneration !== strokeWriteGeneration) {
        return;
      }
      for (const [pendingStrokeId, pendingPatch] of pendingStrokeWrites.entries()) {
        pendingStrokeWrites.delete(pendingStrokeId);
        update(ref(db, `${roomPath}/drawings/${pendingStrokeId}`), {
          ...pendingPatch,
          updatedAt: serverTimestamp()
        }).catch((error) => {
          console.error(error);
          setRealtimeStatus('firebase: write blocked');
        });
      }
    });
  }

  function beginDrawingStroke(event) {
    if (!drawModeEnabled || drawPointerState) {
      return false;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }
    const strokeRef = push(drawingsRef);
    const strokeId = strokeRef.key;
    if (!strokeId) {
      return false;
    }
    const startPoint = {
      x: clamp(worldPoint.x, 0, WORLD_WIDTH),
      y: clamp(worldPoint.y, 0, WORLD_HEIGHT)
    };
    const color = normalizeHexColor(playerState.color);
    const points = [startPoint];
    const now = Date.now();
    drawPointerState = {
      pointerId: event.pointerId,
      strokeId,
      color,
      points,
      lastClientX: event.clientX,
      lastClientY: event.clientY
    };
    patchLocalDrawingStroke(strokeId, {
      color,
      points,
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken,
      createdAt: now,
      updatedAt: now
    });
    queueDrawingPatch(strokeId, {
      color,
      points: serializeDrawingPoints(points),
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken,
      createdAt: serverTimestamp()
    });
    return true;
  }

  function updateDrawingStroke(event) {
    if (!drawModeEnabled || !drawPointerState || drawPointerState.pointerId !== event.pointerId) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return true;
    }
    const nextPoint = {
      x: clamp(worldPoint.x, 0, WORLD_WIDTH),
      y: clamp(worldPoint.y, 0, WORLD_HEIGHT)
    };
    const previousPoint = drawPointerState.points[drawPointerState.points.length - 1];
    if (!previousPoint) {
      drawPointerState.points.push(nextPoint);
    } else {
      const distance = Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
      if (distance >= DRAW_POINT_MIN_DISTANCE) {
        drawPointerState.points.push(nextPoint);
      }
    }
    drawPointerState.lastClientX = event.clientX;
    drawPointerState.lastClientY = event.clientY;
    const now = Date.now();

    patchLocalDrawingStroke(drawPointerState.strokeId, {
      color: drawPointerState.color,
      points: drawPointerState.points,
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken,
      updatedAt: now
    });
    queueDrawingPatch(drawPointerState.strokeId, {
      color: drawPointerState.color,
      points: serializeDrawingPoints(drawPointerState.points),
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken
    });
    return true;
  }

  function finishDrawingStroke(event) {
    if (!drawPointerState || drawPointerState.pointerId !== event.pointerId) {
      return false;
    }
    const finishedStroke = drawPointerState;
    drawPointerState = null;
    const points = finishedStroke.points.length === 1
      ? [
        finishedStroke.points[0],
        {
          x: finishedStroke.points[0].x + 0.01,
          y: finishedStroke.points[0].y + 0.01
        }
      ]
      : finishedStroke.points;
    const now = Date.now();
    patchLocalDrawingStroke(finishedStroke.strokeId, {
      color: finishedStroke.color,
      points,
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken,
      updatedAt: now
    });
    queueDrawingPatch(finishedStroke.strokeId, {
      color: finishedStroke.color,
      points: serializeDrawingPoints(points),
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken
    });
    return true;
  }

  setDrawModeEnabled = (enabled) => {
    const nextEnabled = Boolean(enabled);
    if (drawModeEnabled === nextEnabled) {
      syncDrawModeUi();
      return;
    }
    drawModeEnabled = nextEnabled;
    syncDrawModeUi();
    if (!drawModeEnabled) {
      drawPointerState = null;
      return;
    }

    cancelActiveCardInteractions();
    if (selectedCardIds.size > 0) {
      releaseSelectedCards();
    }
    if (selectionBoxState) {
      selectionBoxState = null;
      hideSelectionBox();
    }
    if (handReorderState) {
      handReorderState = null;
      setHandDropGlow(false);
      setHandDropPreview(null);
      renderLocalHandCards();
    }
    if (deckDragState && deckState?.holderClientId === clientId) {
      deckDragState = null;
      patchLocalDeck({ holderClientId: null });
      queueDeckPatch({ holderClientId: null });
      releaseDeckLock().catch((error) => {
        console.error(error);
      });
    }
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
  };
  setDrawModeEnabled(drawModeEnabled);

  function getOwnedStrokeEntries() {
    const ownedStrokeEntries = [];
    for (const [strokeId, strokeState] of drawingStrokes.entries()) {
      const ownerToken = typeof strokeState?.authorPlayerToken === 'string' ? strokeState.authorPlayerToken : '';
      const ownerClient = typeof strokeState?.authorClientId === 'string' ? strokeState.authorClientId : '';
      const matchesToken = Boolean(localPlayerToken) && ownerToken === localPlayerToken;
      const matchesLegacyClient = !ownerToken && Boolean(clientId) && ownerClient === clientId;
      if (matchesToken || matchesLegacyClient) {
        ownedStrokeEntries.push([strokeId, strokeState]);
      }
    }
    return ownedStrokeEntries;
  }

  clearOwnDrawings = async () => {
    const ownedStrokeIds = getOwnedStrokeEntries().map(([strokeId]) => strokeId);

    if (ownedStrokeIds.length === 0) {
      return;
    }

    if (drawPointerState && ownedStrokeIds.includes(drawPointerState.strokeId)) {
      drawPointerState = null;
    }

    const updatesByPath = {};
    for (const strokeId of ownedStrokeIds) {
      pendingStrokeWrites.delete(strokeId);
      drawingStrokes.delete(strokeId);
      removeDrawingStrokeElement(strokeId);
      updatesByPath[strokeId] = null;
    }
    renderAllDrawingStrokes();

    await update(drawingsRef, updatesByPath);
  };

  undoOwnDrawing = async () => {
    const ownedStrokes = getOwnedStrokeEntries();
    if (ownedStrokes.length === 0) {
      return;
    }

    let latestStrokeId = ownedStrokes[0][0];
    let latestScore = Number(ownedStrokes[0][1]?.createdAt) || Number(ownedStrokes[0][1]?.updatedAt) || 0;

    for (let index = 1; index < ownedStrokes.length; index += 1) {
      const [strokeId, strokeState] = ownedStrokes[index];
      const score = Number(strokeState?.createdAt) || Number(strokeState?.updatedAt) || 0;
      if (score > latestScore || (score === latestScore && strokeId > latestStrokeId)) {
        latestStrokeId = strokeId;
        latestScore = score;
      }
    }

    if (drawPointerState && drawPointerState.strokeId === latestStrokeId) {
      drawPointerState = null;
    }

    pendingStrokeWrites.delete(latestStrokeId);
    drawingStrokes.delete(latestStrokeId);
    removeDrawingStrokeElement(latestStrokeId);
    renderAllDrawingStrokes();
    await update(drawingsRef, {
      [latestStrokeId]: null
    });
  };

  function scheduleHandReclaimCheck() {
    if (handReclaimRafQueued || handReclaimInProgress) {
      return;
    }
    handReclaimRafQueued = true;
    window.requestAnimationFrame(() => {
      handReclaimRafQueued = false;
      reclaimStaleHandsToDeck().catch((error) => {
        console.error(error);
        setRealtimeStatus('firebase: write blocked');
      });
    });
  }

  async function reclaimStaleHandsToDeck() {
    if (isTableResetting || handReclaimInProgress) {
      return;
    }

    const now = Date.now();
    const staleOwnerTokens = new Set();
    for (const [ownerToken, payload] of Object.entries(latestPresenceByToken || {})) {
      const connected = payload?.connected === true;
      const lastSeen = Number(payload?.lastSeen);
      if (connected || !Number.isFinite(lastSeen)) {
        continue;
      }
      if (now - lastSeen <= HAND_RECLAIM_TIMEOUT_MS) {
        continue;
      }
      staleOwnerTokens.add(ownerToken);
    }

    if (staleOwnerTokens.size === 0) {
      return;
    }

    const staleCardIds = [];
    for (const [cardId, cardState] of cards.entries()) {
      const ownerToken = getCardHandOwnerId(cardState);
      if (!ownerToken || !staleOwnerTokens.has(ownerToken)) {
        continue;
      }
      staleCardIds.push(cardId);
    }

    if (staleCardIds.length === 0) {
      return;
    }

    handReclaimInProgress = true;
    try {
      if (!deckState) {
        const center = getDeckCenterPosition();
        const nextDeck = {
          x: center.x,
          y: center.y,
          shuffleTick: 0,
          holderClientId: null
        };
        patchLocalDeck(nextDeck);
        await update(deckRef, {
          ...nextDeck,
          updatedAt: serverTimestamp()
        });
      }

      const orderedStaleCardIds = getCardsSortedByZ(staleCardIds);
      let nextDeckZ = getDeckTopZ() + 1;
      const updatesByPath = {};
      for (const cardId of orderedStaleCardIds) {
        const patch = {
          x: deckState ? deckState.x : WORLD_WIDTH / 2,
          y: deckState ? deckState.y : WORLD_HEIGHT / 2,
          z: nextDeckZ,
          face: 'back',
          inDeck: true,
          inDiscard: false,
          inAuction: false,
          holderClientId: null,
          handOwnerClientId: null,
          handOwnerPlayerToken: null
        };
        nextDeckZ += 1;
        patchLocalCard(cardId, patch);
        updatesByPath[`${cardId}/x`] = patch.x;
        updatesByPath[`${cardId}/y`] = patch.y;
        updatesByPath[`${cardId}/z`] = patch.z;
        updatesByPath[`${cardId}/face`] = patch.face;
        updatesByPath[`${cardId}/inDeck`] = patch.inDeck;
        updatesByPath[`${cardId}/inDiscard`] = patch.inDiscard;
        updatesByPath[`${cardId}/inAuction`] = patch.inAuction;
        updatesByPath[`${cardId}/holderClientId`] = patch.holderClientId;
        updatesByPath[`${cardId}/handOwnerClientId`] = patch.handOwnerClientId;
        updatesByPath[`${cardId}/handOwnerPlayerToken`] = patch.handOwnerPlayerToken;
        updatesByPath[`${cardId}/updatedAt`] = serverTimestamp();
      }

      if (Object.keys(updatesByPath).length > 0) {
        await update(cardsRef, updatesByPath);
      }
      renderRoomRoster(latestRoomCursors, clientId);
    } finally {
      handReclaimInProgress = false;
    }
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

  function isPositionOverDiscard(x, y) {
    if (!deckState) {
      return false;
    }
    const discardCenter = getDiscardCenterPosition();
    return Math.abs(x - discardCenter.x) <= CARD_WIDTH / 2 && Math.abs(y - discardCenter.y) <= CARD_HEIGHT / 2;
  }

  function isPositionOverAuction(x, y) {
    if (!deckState) {
      return false;
    }
    const auctionCenter = getAuctionCenterPosition();
    return (
      Math.abs(x - auctionCenter.x) <= (CARD_WIDTH + AUCTION_SLOT_EXTRA_SIZE) / 2 &&
      Math.abs(y - auctionCenter.y) <= (CARD_HEIGHT + AUCTION_SLOT_EXTRA_SIZE) / 2
    );
  }

  function canPlaceCardOnAuction(cardId) {
    const cardState = cards.get(cardId);
    if (!cardState) {
      return false;
    }
    const auctionIds = getAuctionCardIds();
    if (auctionIds.length === 0) {
      return true;
    }
    return cardState.inAuction;
  }

  function canPlaceCardsOnAuction(cardIds) {
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return false;
    }
    const auctionIds = getAuctionCardIds();
    if (auctionIds.length === 0) {
      return true;
    }
    return cardIds.every((cardId) => Boolean(cards.get(cardId)?.inAuction));
  }

  function getDiscardTopZ() {
    let maxZ = 1;
    for (const cardState of cards.values()) {
      if (cardState.inDiscard) {
        maxZ = Math.max(maxZ, Number(cardState.z) || 1);
      }
    }
    return maxZ;
  }

  function getAuctionTopZ() {
    let maxZ = 1;
    for (const cardState of cards.values()) {
      if (cardState.inAuction) {
        maxZ = Math.max(maxZ, Number(cardState.z) || 1);
      }
    }
    return maxZ;
  }

  function getTopHandZ(ownerToken) {
    let topZ = 0;
    for (const cardState of cards.values()) {
      if (getCardHandOwnerId(cardState) !== ownerToken) {
        continue;
      }
      topZ = Math.max(topZ, Number(cardState.z) || 0);
    }
    return topZ;
  }

  function buildHandDropPatch(cardId, ownerToken, nextHandZ) {
    const cardState = cards.get(cardId);
    if (!cardState) {
      return null;
    }
    return {
      x: cardState.x,
      y: cardState.y,
      z: Number.isFinite(nextHandZ) ? nextHandZ : getTopHandZ(ownerToken) + 1,
      face: 'front',
      inDeck: false,
      inDiscard: false,
      inAuction: false,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: ownerToken
    };
  }

  function getCardsSortedByZ(cardIds) {
    return [...cardIds].sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
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
      inDiscard: false,
      inAuction: false,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
  }

  function buildDiscardPlacementPatch(nextZ = getDiscardTopZ() + 1) {
    const discardCenter = getDiscardCenterPosition();
    return {
      x: discardCenter.x,
      y: discardCenter.y,
      z: nextZ,
      inDeck: false,
      inDiscard: true,
      inAuction: false,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
  }

  function buildDiscardDropPatch(cardId) {
    if (!deckState) {
      return null;
    }

    const cardState = cards.get(cardId);
    if (!cardState) {
      return null;
    }

    if (!isPositionOverDiscard(cardState.x, cardState.y)) {
      return null;
    }
    return buildDiscardPlacementPatch();
  }

  function buildAuctionPlacementPatch(nextZ = getAuctionTopZ() + 1) {
    const auctionCenter = getAuctionCenterPosition();
    return {
      x: auctionCenter.x,
      y: auctionCenter.y,
      z: nextZ,
      face: 'front',
      inDeck: false,
      inDiscard: false,
      inAuction: true,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
  }

  function buildAuctionDropPatch(cardId) {
    if (!deckState) {
      return null;
    }

    const cardState = cards.get(cardId);
    if (!cardState) {
      return null;
    }

    if (!isPositionOverAuction(cardState.x, cardState.y)) {
      return null;
    }
    if (!canPlaceCardOnAuction(cardId)) {
      return null;
    }
    return buildAuctionPlacementPatch();
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
      return (
        Boolean(cardState) &&
        !cardState.inDeck &&
        !cardState.inDiscard &&
        !cardState.inAuction &&
        !getCardHandOwnerId(cardState) &&
        cardState.holderClientId === clientId
      );
    });
  }

  function releaseSelectedCards() {
    const selectedIds = Array.from(selectedCardIds);
    selectedCardIds.clear();
    for (const cardId of selectedIds) {
      const cardState = cards.get(cardId);
      if (cardState?.holderClientId === clientId) {
        patchLocalCard(cardId, {
          holderClientId: null,
          inDiscard: false,
          inAuction: false,
          handOwnerClientId: null,
          handOwnerPlayerToken: null
        });
        queueCardPatch(cardId, {
          holderClientId: null,
          inDiscard: false,
          inAuction: false,
          handOwnerClientId: null,
          handOwnerPlayerToken: null
        });
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
      if (cardState.inDiscard) {
        continue;
      }
      if (cardState.inAuction) {
        continue;
      }
      if (getCardHandOwnerId(cardState)) {
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
        inDiscard: false,
        inAuction: false,
        holderClientId: clientId,
        handOwnerClientId: null,
        handOwnerPlayerToken: null
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
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      anchorOffsetX: worldPoint.x - anchorCard.x,
      anchorOffsetY: worldPoint.y - anchorCard.y,
      anchorCardId: cardId,
      basePositions,
      moved: false
    };
    syncHandHoverDragLock();

    return true;
  }

  function handleGroupDragMove(event) {
    if (!groupDragState || event.pointerId !== groupDragState.pointerId) {
      return false;
    }
    if (groupDragState.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      handleGroupDragEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        pointerType: groupDragState.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return true;
    }

    const moveSinceLastEvent = Math.hypot(event.clientX - groupDragState.lastClientX, event.clientY - groupDragState.lastClientY);
    if (moveSinceLastEvent >= 0.5) {
      groupDragState.lastMotionAt = Date.now();
    }
    groupDragState.lastClientX = event.clientX;
    groupDragState.lastClientY = event.clientY;

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      setDeckDropIndicator(false);
      setDiscardDropIndicator(false);
      setAuctionDropIndicator(false);
      setHandDropGlow(false);
      setHandDropPreview(null);
      return true;
    }

    const anchorNextX = clamp(worldPoint.x - groupDragState.anchorOffsetX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
    const anchorNextY = clamp(worldPoint.y - groupDragState.anchorOffsetY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
    const movedDistance = Math.hypot(event.clientX - groupDragState.startClientX, event.clientY - groupDragState.startClientY);
    const movedThreshold =
      groupDragState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    if (movedDistance > movedThreshold) {
      groupDragState.moved = true;
    }
    const anchorBase = groupDragState.basePositions.get(groupDragState.anchorCardId);
    const deltaX = anchorBase ? anchorNextX - anchorBase.x : 0;
    const deltaY = anchorBase ? anchorNextY - anchorBase.y : 0;

    const overHandDropRegion = isClientInHandDropRegion(event.clientY);
    const selectedIds = Array.from(groupDragState.basePositions.keys());
    const canPlaceGroupOnAuction = canPlaceCardsOnAuction(selectedIds);
    const anchorHoverX = anchorBase
      ? clamp(anchorBase.x + deltaX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2)
      : anchorNextX;
    const anchorHoverY = anchorBase
      ? clamp(anchorBase.y + deltaY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2)
      : anchorNextY;
    const overDeck = isPositionOverDeck(anchorHoverX, anchorHoverY);
    const overDiscard = isPositionOverDiscard(anchorHoverX, anchorHoverY);
    let overAuction = false;
    for (const [selectedId, base] of groupDragState.basePositions.entries()) {
      const nextX = clamp(base.x + deltaX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
      const nextY = clamp(base.y + deltaY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
      if (canPlaceGroupOnAuction && isPositionOverAuction(nextX, nextY)) {
        overAuction = true;
      }
      const patch = {
        x: nextX,
        y: nextY,
        inDeck: false,
        inDiscard: false,
        inAuction: false,
        holderClientId: clientId,
        handOwnerClientId: null,
        handOwnerPlayerToken: null
      };
      patchLocalCard(selectedId, patch);
      queueCardPatch(selectedId, patch);
    }

    setHandDropGlow(overHandDropRegion);
    setHandDropPreview(null);
    setDiscardDropIndicator(overDiscard && !overHandDropRegion && !overAuction);
    setAuctionDropIndicator(overAuction && !overHandDropRegion);
    setDeckDropIndicator(overDeck && !overHandDropRegion && !overDiscard && !overAuction);
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
    return true;
  }

  function handleGroupDragEnd(event) {
    if (!groupDragState || event.pointerId !== groupDragState.pointerId) {
      return false;
    }
    if (
      event.type === 'pointerup' &&
      groupDragState.pointerType === 'mouse' &&
      event.button !== 0 &&
      (event.buttons & 1) !== 0
    ) {
      return true;
    }

    const finishedGroupDrag = groupDragState;
    const selectedIds = getMovableSelectedIds();
    groupDragState = null;
    syncHandHoverDragLock();
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    setHandDropPreview(null);

    if (event.type === 'pointerup' && !finishedGroupDrag.moved) {
      if (finishedGroupDrag.pointerType === 'touch' || finishedGroupDrag.pointerType === 'pen') {
        pruneRecentTouchTaps();
        recentTouchTapByCardId.set(finishedGroupDrag.anchorCardId, {
          time: Date.now(),
          x: event.clientX,
          y: event.clientY
        });
      } else if (finishedGroupDrag.pointerType === 'mouse' && event.button === 0) {
        pruneRecentMouseClicks();
        recentMouseClickByCardId.set(finishedGroupDrag.anchorCardId, {
          time: Date.now(),
          x: event.clientX,
          y: event.clientY
        });
      }
    }

    if (selectedIds.length === 0) {
      return true;
    }

    if (isClientInHandDropRegion(event.clientY)) {
      const orderedSelectedIds = getCardsSortedByZ(selectedIds);
      selectedCardIds.clear();
      let nextHandZ = getTopHandZ(localPlayerToken) + 1;
      for (const cardId of orderedSelectedIds) {
        const patch = buildHandDropPatch(cardId, localPlayerToken, nextHandZ);
        nextHandZ += 1;
        if (!patch) {
          continue;
        }
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
      schedulePublishFromClient(event.clientX, event.clientY);
      return true;
    }

    const anchorCardId = finishedGroupDrag.anchorCardId;
    const anchorIsSelected = selectedIds.includes(anchorCardId);
    const anchorCardState = anchorIsSelected ? cards.get(anchorCardId) : null;
    const shouldStackOnDeck =
      Boolean(deckState) && Boolean(anchorCardState) && isPositionOverDeck(anchorCardState.x, anchorCardState.y);

    const shouldStackOnDiscard =
      Boolean(deckState) && Boolean(anchorCardState) && isPositionOverDiscard(anchorCardState.x, anchorCardState.y);

    const shouldStackOnAuction =
      Boolean(deckState) &&
      canPlaceCardsOnAuction(selectedIds) &&
      selectedIds.some((cardId) => {
      const cardState = cards.get(cardId);
      return Boolean(cardState) && isPositionOverAuction(cardState.x, cardState.y);
    });

    if (shouldStackOnAuction && deckState) {
      selectedCardIds.clear();
      let nextAuctionZ = getAuctionTopZ() + 1;
      for (const cardId of selectedIds) {
        const patch = buildAuctionPlacementPatch(nextAuctionZ);
        nextAuctionZ += 1;
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
      schedulePublishFromClient(event.clientX, event.clientY);
      return true;
    }

    if (shouldStackOnDiscard && deckState) {
      selectedCardIds.clear();
      let nextDiscardZ = getDiscardTopZ() + 1;
      for (const cardId of selectedIds) {
        const patch = buildDiscardPlacementPatch(nextDiscardZ);
        nextDiscardZ += 1;
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
      schedulePublishFromClient(event.clientX, event.clientY);
      return true;
    }

    if (shouldStackOnDeck && deckState) {
      selectedCardIds.clear();
      let nextDeckZ = getDeckTopZ() + 1;
      for (const cardId of selectedIds) {
        const patch = {
          x: deckState.x,
          y: deckState.y,
          z: nextDeckZ,
          inDeck: true,
          inDiscard: false,
          inAuction: false,
          holderClientId: null,
          handOwnerClientId: null,
          handOwnerPlayerToken: null
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
        if (currentCard.inAuction === true) {
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

  async function handleRightClickFlipIntent(cardId) {
    if (selectedCardIds.size > 0) {
      const now = Date.now();
      if (now < selectedRightClickFlipCooldownUntil) {
        return;
      }
      selectedRightClickFlipCooldownUntil = now + RIGHT_CLICK_SELECTED_FLIP_COOLDOWN_MS;
    }
    await handleCardFlipIntent(cardId);
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
        await handleRightClickFlipIntent(completedSelection.targetCardId);
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
    if (drawModeEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button === 2) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      endedTouchPointerIds.delete(event.pointerId);
    }
    event.preventDefault();
    event.stopPropagation();
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    setHandDropPreview(null);

    if (consumeDoubleTapIfPresent(cardId, event) || consumeDoubleClickIfPresent(cardId, event)) {
      handleCardFlipIntent(cardId).catch((error) => {
        console.error(error);
      });
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    rememberTouchTapCandidate(cardId, event);

    if (cardDragState || groupDragState || handReorderState) {
      return;
    }

    const existingCard = cards.get(cardId);
    if (!existingCard) {
      return;
    }

    if (selectedCardIds.size > 0) {
      if (selectedCardIds.has(cardId) && beginGroupDrag(event, cardId)) {
        safeSetPointerCapture(event.currentTarget, event.pointerId);
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
    if (wasTouchPointerReleased(event.pointerType, event.pointerId)) {
      await releaseCardLock(cardId);
      return;
    }

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      await releaseCardLock(cardId);
      return;
    }

    const latestCard = cards.get(cardId) || existingCard;
    const discardStartCenter = latestCard.inDiscard && deckState ? getDiscardCenterPosition() : null;
    const auctionStartCenter = latestCard.inAuction && deckState ? getAuctionCenterPosition() : null;
    const cardStartX = latestCard.inDeck && deckState ? deckState.x : discardStartCenter ? discardStartCenter.x : auctionStartCenter ? auctionStartCenter.x : latestCard.x;
    const cardStartY = latestCard.inDeck && deckState ? deckState.y : discardStartCenter ? discardStartCenter.y : auctionStartCenter ? auctionStartCenter.y : latestCard.y;
    cardDragState = {
      cardId,
      pointerId: event.pointerId,
      offsetX: worldPoint.x - cardStartX,
      offsetY: worldPoint.y - cardStartY,
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      moved: false
    };
    syncHandHoverDragLock();

    const topZ = getTopCardZ() + 1;
    const startPatch = {
      x: cardStartX,
      y: cardStartY,
      inDeck: false,
      inDiscard: false,
      inAuction: false,
      holderClientId: clientId,
      handOwnerClientId: null,
      handOwnerPlayerToken: null,
      z: topZ
    };
    patchLocalCard(cardId, startPatch);
    queueCardPatch(cardId, startPatch);

    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function beginHandReorderDrag(event, cardId) {
    const localHandIds = getLocalHandIdsSortedByZ();
    if (!localHandIds.includes(cardId)) {
      return false;
    }

    setHandDropPreview(null);

    handReorderState = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      cardId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
      moved: false,
      order: localHandIds,
      releaseToTable: false,
      wasReleasedToTable: false
    };
    syncHandHoverDragLock();
    setHandDropGlow(false);
    setHandDropPreview(null);
    renderLocalHandCards();
    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);
    return true;
  }

  function handleHandReorderMove(event) {
    if (!handReorderState || event.pointerId !== handReorderState.pointerId) {
      return;
    }
    if (handReorderState.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      handleHandReorderEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        pointerType: handReorderState.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return;
    }

    handReorderState.clientX = event.clientX;
    handReorderState.clientY = event.clientY;
    const movedDistance = Math.hypot(event.clientX - handReorderState.startClientX, event.clientY - handReorderState.startClientY);
    const movedThreshold = handReorderState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    if (movedDistance > movedThreshold) {
      handReorderState.moved = true;
    }

    const tableRect = tableRoot?.getBoundingClientRect();
    const releaseToTableY = tableRect ? tableRect.bottom - HAND_DROP_REGION_HEIGHT - 26 : window.innerHeight - HAND_DROP_REGION_HEIGHT - 26;
    const overHandDropRegion = isClientInHandDropRegion(event.clientY);
    handReorderState.releaseToTable = event.clientY < releaseToTableY;
    if (handReorderState.releaseToTable) {
      handReorderState.wasReleasedToTable = true;
    }
    const showHandReturnAssist = Boolean(handReorderState.wasReleasedToTable) && overHandDropRegion;
    setHandDropGlow(showHandReturnAssist);
    if (showHandReturnAssist) {
      setHandDropPreview(handReorderState.cardId, event.clientX);
    } else {
      setHandDropPreview(null);
    }
    const worldPoint = handReorderState.releaseToTable ? screenToWorldFromClient(event.clientX, event.clientY) : null;
    const overDeck = Boolean(worldPoint) && isPositionOverDeck(worldPoint.x, worldPoint.y);
    const overDiscard = Boolean(worldPoint) && isPositionOverDiscard(worldPoint.x, worldPoint.y);
    const overAuction =
      Boolean(worldPoint) && canPlaceCardOnAuction(handReorderState.cardId) && isPositionOverAuction(worldPoint.x, worldPoint.y);
    setDeckDropIndicator(handReorderState.releaseToTable && overDeck && !overDiscard && !overAuction);
    setDiscardDropIndicator(handReorderState.releaseToTable && overDiscard && !overAuction);
    setAuctionDropIndicator(handReorderState.releaseToTable && overAuction);
    if (handReorderState.releaseToTable) {
      renderLocalHandCards();
      renderDeckControls();
      schedulePublishFromClient(event.clientX, event.clientY);
      event.preventDefault();
      return;
    }

    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);

    const currentLocalIds = getLocalHandIdsSortedByZ();
    const cardId = handReorderState.cardId;
    const baseOrder = handReorderState.order.filter((id) => id !== cardId && currentLocalIds.includes(id));
    for (const id of currentLocalIds) {
      if (id !== cardId && !baseOrder.includes(id)) {
        baseOrder.push(id);
      }
    }

    const trayWidth = tableRoot?.clientWidth || window.innerWidth || 0;
    const nextIndex = getHandInsertIndex(event.clientX, baseOrder.length + 1, trayWidth);
    baseOrder.splice(nextIndex, 0, cardId);
    handReorderState.order = baseOrder;
    renderLocalHandCards();
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleHandReorderEnd(event) {
    if (!handReorderState || event.pointerId !== handReorderState.pointerId) {
      return;
    }
    if (
      event.type === 'pointerup' &&
      handReorderState.pointerType === 'mouse' &&
      event.button !== 0 &&
      (event.buttons & 1) !== 0
    ) {
      return;
    }

    const finishedState = handReorderState;
    handReorderState = null;
    syncHandHoverDragLock();
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    setHandDropPreview(null);
    renderLocalHandCards();

    if (finishedState.releaseToTable) {
      const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
      if (worldPoint) {
        const dropX = clamp(worldPoint.x, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
        const dropY = clamp(worldPoint.y, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
        const topZ = getTopCardZ() + 1;
        const releasePatch = canPlaceCardOnAuction(finishedState.cardId) && isPositionOverAuction(dropX, dropY)
          ? buildAuctionPlacementPatch(topZ)
          : isPositionOverDiscard(dropX, dropY)
            ? buildDiscardPlacementPatch(topZ)
            : isPositionOverDeck(dropX, dropY)
              ? {
                x: deckState ? deckState.x : dropX,
                y: deckState ? deckState.y : dropY,
                z: getDeckTopZ() + 1,
                inDeck: true,
                inDiscard: false,
                inAuction: false,
                holderClientId: null,
                handOwnerClientId: null,
                handOwnerPlayerToken: null
              }
            : {
              x: dropX,
              y: dropY,
              face: 'front',
              inDeck: false,
              inDiscard: false,
              inAuction: false,
              holderClientId: null,
              handOwnerClientId: null,
              handOwnerPlayerToken: null,
              z: topZ
            };
        patchLocalCard(finishedState.cardId, releasePatch);
        queueCardPatch(finishedState.cardId, releasePatch);
      }
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }

    if (finishedState.moved) {
      const currentLocalIds = getLocalHandIdsSortedByZ();
      const nextOrder = finishedState.order.filter((id) => currentLocalIds.includes(id));
      for (const cardId of currentLocalIds) {
        if (!nextOrder.includes(cardId)) {
          nextOrder.push(cardId);
        }
      }

      let minZ = Infinity;
      for (const cardId of nextOrder) {
        const currentZ = Number(cards.get(cardId)?.z);
        if (Number.isFinite(currentZ)) {
          minZ = Math.min(minZ, currentZ);
        }
      }
      if (!Number.isFinite(minZ)) {
        minZ = 1;
      }

      for (let index = 0; index < nextOrder.length; index += 1) {
        const cardId = nextOrder[index];
        const nextZ = minZ + index;
        const cardState = cards.get(cardId);
        if (!cardState || Number(cardState.z) === nextZ) {
          continue;
        }
        patchLocalCard(cardId, { z: nextZ });
        queueCardPatch(cardId, { z: nextZ });
      }
    }

    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleHandCardPointerDown(event, cardId) {
    if (drawModeEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      endedTouchPointerIds.delete(event.pointerId);
    }
    event.preventDefault();
    event.stopPropagation();
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    setHandDropPreview(null);

    if (cardDragState || groupDragState || deckDragState || handReorderState) {
      return;
    }

    const existingCard = cards.get(cardId);
    if (!existingCard || getCardHandOwnerId(existingCard) !== localPlayerToken) {
      return;
    }

    if (selectedCardIds.size > 0) {
      releaseSelectedCards();
    }

    beginHandReorderDrag(event, cardId);
  }

  function handleCardDragMove(event) {
    if (handleGroupDragMove(event)) {
      return;
    }

    if (!cardDragState || event.pointerId !== cardDragState.pointerId) {
      return;
    }
    if (cardDragState.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      handleCardDragEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        pointerType: cardDragState.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return;
    }

    const moveSinceLastEvent = Math.hypot(event.clientX - cardDragState.lastClientX, event.clientY - cardDragState.lastClientY);
    if (moveSinceLastEvent >= 0.5) {
      cardDragState.lastMotionAt = Date.now();
    }
    cardDragState.lastClientX = event.clientX;
    cardDragState.lastClientY = event.clientY;

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      setDeckDropIndicator(false);
      setDiscardDropIndicator(false);
      setAuctionDropIndicator(false);
      setHandDropGlow(false);
      setHandDropPreview(null);
      return;
    }

    const nextX = clamp(worldPoint.x - cardDragState.offsetX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
    const nextY = clamp(worldPoint.y - cardDragState.offsetY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
    const movedDistance = Math.hypot(event.clientX - cardDragState.startClientX, event.clientY - cardDragState.startClientY);
    const movedThreshold =
      cardDragState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    const wasMoved = cardDragState.moved;
    if (movedDistance > movedThreshold) {
      cardDragState.moved = true;
    }
    if (!wasMoved && cardDragState.moved && (cardDragState.pointerType === 'touch' || cardDragState.pointerType === 'pen')) {
      recentTouchTapByCardId.delete(cardDragState.cardId);
    }
    const overHandDropRegion = isClientInHandDropRegion(event.clientY);
    setHandDropGlow(overHandDropRegion);
    if (overHandDropRegion) {
      setHandDropPreview(cardDragState.cardId, event.clientX);
    } else {
      setHandDropPreview(null);
    }
    const overDiscard = isPositionOverDiscard(nextX, nextY);
    const overAuction = canPlaceCardOnAuction(cardDragState.cardId) && isPositionOverAuction(nextX, nextY);
    setDiscardDropIndicator(overDiscard && !overHandDropRegion && !overAuction);
    setAuctionDropIndicator(overAuction && !overHandDropRegion);
    setDeckDropIndicator(isPositionOverDeck(nextX, nextY) && !overHandDropRegion && !overDiscard && !overAuction);

    patchLocalCard(cardDragState.cardId, {
      x: nextX,
      y: nextY,
      inDeck: false,
      inDiscard: false,
      inAuction: false,
      holderClientId: clientId,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    });
    queueCardPatch(cardDragState.cardId, {
      x: nextX,
      y: nextY,
      inDeck: false,
      inDiscard: false,
      inAuction: false,
      holderClientId: clientId,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
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
    if (
      event.type === 'pointerup' &&
      cardDragState.pointerType === 'mouse' &&
      event.button !== 0 &&
      (event.buttons & 1) !== 0
    ) {
      return;
    }

    const finishedDrag = cardDragState;
    cardDragState = null;
    syncHandHoverDragLock();
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    setHandDropPreview(null);

    let finalPatch = null;
    if (isClientInHandDropRegion(event.clientY)) {
      finalPatch = buildHandDropPatch(finishedDrag.cardId, localPlayerToken);
      selectedCardIds.delete(finishedDrag.cardId);
    }
    if (!finalPatch) {
      finalPatch =
        buildAuctionDropPatch(finishedDrag.cardId) ||
        buildDiscardDropPatch(finishedDrag.cardId) ||
        buildDeckDropPatch(finishedDrag.cardId) || {
        holderClientId: null,
        inDeck: false,
        inDiscard: false,
        inAuction: false,
        handOwnerClientId: null,
        handOwnerPlayerToken: null
      };
    }

    patchLocalCard(finishedDrag.cardId, finalPatch);
    queueCardPatch(finishedDrag.cardId, finalPatch);
    releaseCardLock(finishedDrag.cardId).catch((error) => {
      console.error(error);
    });

    if (
      event.type === 'pointerup' &&
      (finishedDrag.pointerType === 'touch' || finishedDrag.pointerType === 'pen') &&
      !finishedDrag.moved
    ) {
      pruneRecentTouchTaps();
      recentTouchTapByCardId.set(finishedDrag.cardId, {
        time: Date.now(),
        x: event.clientX,
        y: event.clientY
      });
    }

    if (event.type === 'pointerup' && finishedDrag.pointerType === 'mouse' && event.button === 0 && !finishedDrag.moved) {
      pruneRecentMouseClicks();
      recentMouseClickByCardId.set(finishedDrag.cardId, {
        time: Date.now(),
        x: event.clientX,
        y: event.clientY
      });
    }

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
    if (drawModeEnabled) {
      suppressNextCardContextMenu = false;
      return;
    }
    const canFlipWhileHeldIdle =
      (Boolean(cardDragState) && cardDragState.cardId === cardId && hasDragPointerComeToRest(cardDragState)) ||
      (Boolean(groupDragState) &&
        selectedCardIds.has(cardId) &&
        groupDragState.basePositions?.has(cardId) &&
        hasDragPointerComeToRest(groupDragState));
    if (hasActiveCardInteraction() && !canFlipWhileHeldIdle) {
      suppressNextCardContextMenu = false;
      return;
    }
    if (suppressNextCardContextMenu) {
      suppressNextCardContextMenu = false;
      return;
    }
    handleRightClickFlipIntent(cardId).catch((error) => {
      console.error(error);
    });
  };
  onHandCardPointerDown = (event, cardId) => {
    handleHandCardPointerDown(event, cardId).catch((error) => {
      console.error(error);
    });
  };

  async function handleDeckMovePointerDown(event) {
    if (drawModeEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      endedTouchPointerIds.delete(event.pointerId);
    }
    event.preventDefault();
    event.stopPropagation();

    if (!deckState || deckDragState || handReorderState) {
      return;
    }

    if (deckState.holderClientId && deckState.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireDeckLock();
    if (!acquired) {
      return;
    }
    if (wasTouchPointerReleased(event.pointerType, event.pointerId)) {
      await releaseDeckLock();
      return;
    }

    deckDragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: deckState.x,
      startY: deckState.y
    };

    patchLocalDeck({ holderClientId: clientId });
    queueDeckPatch({ holderClientId: clientId });

    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);

    bringDeckToFront().catch((error) => {
      console.error(error);
    });
  }

  function handleDeckDragMove(event) {
    if (!deckDragState || event.pointerId !== deckDragState.pointerId) {
      return;
    }
    if ((event.buttons & 1) === 0) {
      handleDeckDragEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
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
    if (event.type === 'pointerup' && event.button !== 0 && (event.buttons & 1) !== 0) {
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

  async function handleDealOneToEachPlayer() {
    if (deckState?.holderClientId && deckState.holderClientId !== clientId) {
      return;
    }

    const targetOwnerTokens = getActivePlayerTokensForDeal();
    if (targetOwnerTokens.length === 0) {
      return;
    }
    if (getDeckCardIds().length < targetOwnerTokens.length) {
      return;
    }

    await runTransaction(
      cardsRef,
      (currentCards) => {
        if (!currentCards || typeof currentCards !== 'object') {
          return;
        }

        const deckEntries = Object.entries(currentCards).filter(
          ([, cardState]) => Boolean(cardState) && typeof cardState === 'object' && cardState.inDeck === true
        );
        if (deckEntries.length < targetOwnerTokens.length) {
          return;
        }
        deckEntries.sort(([, leftState], [, rightState]) => (Number(rightState?.z) || 0) - (Number(leftState?.z) || 0));

        const nextCards = { ...currentCards };
        const topHandZByOwner = new Map();
        for (const [, cardState] of Object.entries(currentCards)) {
          if (!cardState || typeof cardState !== 'object') {
            continue;
          }
          const ownerToken = getCardHandOwnerId(cardState);
          if (!ownerToken) {
            continue;
          }
          const nextZ = Number(cardState.z) || 0;
          topHandZByOwner.set(ownerToken, Math.max(topHandZByOwner.get(ownerToken) || 0, nextZ));
        }

        const timestamp = Date.now();
        for (let index = 0; index < targetOwnerTokens.length; index += 1) {
          const ownerToken = targetOwnerTokens[index];
          const deckEntry = deckEntries[index];
          if (!deckEntry) {
            break;
          }
          const [cardId, sourceCard] = deckEntry;
          if (!sourceCard || typeof sourceCard !== 'object') {
            continue;
          }
          const nextHandZ = (topHandZByOwner.get(ownerToken) || 0) + 1;
          topHandZByOwner.set(ownerToken, nextHandZ);
          nextCards[cardId] = {
            ...sourceCard,
            inDeck: false,
            inDiscard: false,
            inAuction: false,
            holderClientId: null,
            handOwnerClientId: null,
            handOwnerPlayerToken: ownerToken,
            face: 'front',
            z: nextHandZ,
            updatedAt: timestamp + index
          };
        }

        return nextCards;
      },
      { applyLocally: false }
    );
  }

  async function handleDiscardReturnToDeck() {
    if (!deckState) {
      return;
    }
    const discardCardIds = getDiscardCardIds().sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
    if (discardCardIds.length === 0) {
      return;
    }

    let nextDeckZ = getDeckTopZ() + 1;
    const updatesByPath = {};
    for (const cardId of discardCardIds) {
      const patch = {
        x: deckState.x,
        y: deckState.y,
        z: nextDeckZ,
        face: 'back',
        inDeck: true,
        inDiscard: false,
        inAuction: false,
        holderClientId: null,
        handOwnerClientId: null,
        handOwnerPlayerToken: null
      };
      nextDeckZ += 1;
      setDiscardReturnAnimating(cardId, true);
      patchLocalCard(cardId, patch);
      updatesByPath[`${cardId}/x`] = patch.x;
      updatesByPath[`${cardId}/y`] = patch.y;
      updatesByPath[`${cardId}/z`] = patch.z;
      updatesByPath[`${cardId}/face`] = patch.face;
      updatesByPath[`${cardId}/inDeck`] = patch.inDeck;
      updatesByPath[`${cardId}/inDiscard`] = patch.inDiscard;
      updatesByPath[`${cardId}/inAuction`] = patch.inAuction;
      updatesByPath[`${cardId}/holderClientId`] = patch.holderClientId;
      updatesByPath[`${cardId}/handOwnerClientId`] = patch.handOwnerClientId;
      updatesByPath[`${cardId}/handOwnerPlayerToken`] = patch.handOwnerPlayerToken;
      updatesByPath[`${cardId}/updatedAt`] = serverTimestamp();
    }

    if (Object.keys(updatesByPath).length > 0) {
      await update(cardsRef, updatesByPath);
    }
  }

  onDeckMovePointerDown = (event) => {
    handleDeckMovePointerDown(event).catch((error) => {
      console.error(error);
    });
  };
  shuffleCoolJpegsDeck = async () => {
    await handleDeckShuffle();
  };
  dealOneCardEach = async () => {
    await handleDealOneToEachPlayer();
  };
  reclaimDiscardToDeck = async () => {
    await handleDiscardReturnToDeck();
  };

  spawnCoolJpegsDeck = async () => {
    void preloadCoolJpegsFrontImages();

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
    strokeWriteGeneration += 1;
    cardWriteScheduled = false;
    deckWriteScheduled = false;
    strokeWriteScheduled = false;
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    deckDropIndicatorVisible = false;
    discardDropIndicatorVisible = false;
    auctionDropIndicatorVisible = false;
    selectedCardIds.clear();
    pendingCardWrites.clear();
    pendingDeckPatch = {};
    pendingStrokeWrites.clear();
    drawPointerState = null;
    latestAuctionBidsByCard = {};
    auctionBidUiRafQueued = false;
    activeAuctionCardIdForUi = '';
    previousActiveAuctionCardId = '';
    for (const timerId of discardReturnAnimationTimers.values()) {
      window.clearTimeout(timerId);
    }
    discardReturnAnimationTimers.clear();
    discardReturnAnimatingCardIds.clear();
    cardDragState = null;
    groupDragState = null;
    selectionBoxState = null;
    suppressNextCardContextMenu = false;
    recentTouchTapByCardId.clear();
    recentMouseClickByCardId.clear();
    deckDragState = null;
    handReorderState = null;
    handDropPreview = null;
    syncHandHoverDragLock();
    hideSelectionBox();
    setDeckShuffleFxActive(false);
    hideAllDeckUiElements();
    if (deckShuffleButton) {
      deckShuffleButton.remove();
      deckShuffleButton = null;
    }
    if (deckDealOneButton) {
      deckDealOneButton.remove();
      deckDealOneButton = null;
    }
    if (deckMoveButton) {
      deckMoveButton.remove();
      deckMoveButton = null;
    }
    if (discardResetButton) {
      discardResetButton.remove();
      discardResetButton = null;
    }
    if (deckDropIndicator) {
      deckDropIndicator.remove();
      deckDropIndicator = null;
    }
    if (discardDropIndicator) {
      discardDropIndicator.remove();
      discardDropIndicator = null;
    }
    if (auctionDropIndicator) {
      auctionDropIndicator.remove();
      auctionDropIndicator = null;
    }
    if (discardSlot) {
      discardSlot.remove();
      discardSlot = null;
    }
    if (auctionSlot) {
      auctionSlot.remove();
      auctionSlot = null;
    }
    discardLabel = null;
    auctionLabel = null;
    if (deckCountBadge) {
      deckCountBadge.remove();
      deckCountBadge = null;
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
      frontDisplayPendingByCard.delete(cardId);
    }
    for (const cardElement of cardElements.values()) {
      cardElement.remove();
    }
    for (const handCardId of handCardElements.keys()) {
      removeHandCardElement(handCardId);
    }
    handDisplayPendingByCard.clear();
    if (handTray) {
      handTray.classList.add('hidden');
    }
    if (heldCardLayer) {
      heldCardLayer.textContent = '';
    }
    if (auctionBidBoard) {
      auctionBidBoard.textContent = '';
      auctionBidBoard.classList.add('hidden');
    }
    if (auctionBidEntry) {
      auctionBidEntry.classList.add('hidden');
    }
    if (auctionBidInput) {
      auctionBidInput.value = '';
      auctionBidInput.classList.remove('is-invalid');
    }
    for (const strokeElement of drawingStrokeElements.values()) {
      strokeElement.remove();
    }
    drawingStrokeElements.clear();
    drawingStrokes.clear();
    cards.clear();
    cardElements.clear();
    frontDisplayPendingByCard.clear();
    deckState = null;
    setLocalHandCountLabel();
    setHandHoverDragLock(false);
  }

  clearTabletop = async () => {
    isTableResetting = true;
    try {
      resetLocalTabletopState();

      await update(ref(db, roomPath), {
        cards: null,
        decks: null,
        drawings: null,
        auctionBids: null
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
    roomMetaRef,
    (snapshot) => {
      const roomMeta = snapshot.val() || {};
      const syncedTitle = normalizeRoomTitle(roomMeta.title);
      setRoomBadgeText(syncedTitle);

      const syncedOwnerToken = typeof roomMeta.ownerToken === 'string' ? roomMeta.ownerToken : '';
      setRoomOwnerState(Boolean(syncedOwnerToken) && syncedOwnerToken === ownerToken);

      if (!isRoomOwner && isRoomTitleEditing) {
        closeRoomTitleEditor();
      }
    },
    (error) => {
      console.error(error);
      setRoomOwnerState(false);
      if (isRoomTitleEditing) {
        closeRoomTitleEditor();
      }
    }
  );

  onValue(
    roomPresenceRef,
    (snapshot) => {
      latestPresenceByToken = snapshot.val() || {};
      scheduleHandReclaimCheck();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
    }
  );

  onValue(
    cursorsRef,
    (snapshot) => {
      const allCursors = snapshot.val() || {};
      latestRoomCursors = allCursors;
      const activeIds = new Set(Object.keys(allCursors));
      const hasNewPeer = Array.from(activeIds).some((id) => id !== clientId && !knownCursorIds.has(id));
      knownCursorIds = new Set(activeIds);
      if (hasNewPeer) {
        void preloadCoolJpegsFrontImages();
      }

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
      renderDeckControls();
      scheduleAuctionBidUiRender();

      const displayCount = activeIds.has(clientId) ? activeIds.size : activeIds.size + 1;
      setRealtimeStatus(`firebase: connected • players: ${displayCount}`);
      scheduleHandReclaimCheck();
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
        const previousCard = cards.get(cardId);
        const nextCard = normalizeCardPayload(payload);
        if (previousCard?.inDiscard && nextCard.inDeck && !nextCard.inDiscard) {
          setDiscardReturnAnimating(cardId, true);
        }
        cards.set(cardId, nextCard);
      }

      for (const cardId of Array.from(cards.keys())) {
        if (activeCardIds.has(cardId)) {
          continue;
        }
        selectedCardIds.delete(cardId);
        frontDisplayPendingByCard.delete(cardId);
        removeHandCardElement(cardId);
        removeTableCardElement(cardId);
        setDiscardReturnAnimating(cardId, false);
        cards.delete(cardId);
      }
      const nextActiveAuctionCardId = getActiveAuctionCardId();
      if (previousActiveAuctionCardId && previousActiveAuctionCardId !== nextActiveAuctionCardId) {
        clearAuctionBidsForCard(previousActiveAuctionCardId);
      }
      previousActiveAuctionCardId = nextActiveAuctionCardId;
      renderAllCards();
      renderRoomRoster(latestRoomCursors, clientId);
      scheduleHandReclaimCheck();
      scheduleAuctionBidUiRender();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Card sync failed. Check Realtime Database rules for room path access.');
    }
  );

  onValue(
    drawingsRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      const allDrawings = snapshot.val() || {};
      const activeStrokeIds = new Set();

      for (const [strokeId, payload] of Object.entries(allDrawings)) {
        const nextStroke = normalizeDrawingPayload(payload);
        if (nextStroke.points.length === 0) {
          continue;
        }
        activeStrokeIds.add(strokeId);
        if (drawPointerState && drawPointerState.strokeId === strokeId) {
          if (nextStroke.points.length < drawPointerState.points.length) {
            patchLocalDrawingStroke(strokeId, {
              color: drawPointerState.color,
              points: drawPointerState.points
            });
            continue;
          }
        }
        drawingStrokes.set(strokeId, nextStroke);
        renderDrawingStroke(strokeId);
      }

      for (const strokeId of Array.from(drawingStrokes.keys())) {
        if (activeStrokeIds.has(strokeId)) {
          continue;
        }
        drawingStrokes.delete(strokeId);
      }
      renderAllDrawingStrokes();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
    }
  );

  onValue(
    auctionBidsRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      latestAuctionBidsByCard = snapshot.val() || {};
      scheduleAuctionBidUiRender();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
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
      void preloadCoolJpegsFrontImages();

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
  window.addEventListener('pointermove', handleHandReorderMove);
  window.addEventListener('pointerup', handleHandReorderEnd);
  window.addEventListener('pointercancel', handleHandReorderEnd);
  window.addEventListener('pointerup', markTouchPointerEnded);
  window.addEventListener('pointercancel', markTouchPointerEnded);

  window.addEventListener('pointermove', handleDeckDragMove);
  window.addEventListener('pointerup', handleDeckDragEnd);
  window.addEventListener('pointercancel', handleDeckDragEnd);

  handReclaimIntervalId = window.setInterval(() => {
    scheduleHandReclaimCheck();
  }, HAND_RECLAIM_CHECK_INTERVAL_MS);

  window.addEventListener('beforeunload', () => {
    cancelActiveCardInteractions();
    releaseUnexpectedLocalCardLocks();
    if (themeTransitionTimerId) {
      window.clearTimeout(themeTransitionTimerId);
      themeTransitionTimerId = 0;
    }
    if (cameraPersistTimerId) {
      window.clearTimeout(cameraPersistTimerId);
      cameraPersistTimerId = 0;
    }
    persistCameraViewNow();
    if (handReclaimIntervalId) {
      window.clearInterval(handReclaimIntervalId);
      handReclaimIntervalId = 0;
    }
    if (localLockWatchdogIntervalId) {
      window.clearInterval(localLockWatchdogIntervalId);
      localLockWatchdogIntervalId = 0;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cancelActiveCardInteractions();
      releaseUnexpectedLocalCardLocks();
    }
  });

  window.addEventListener('blur', () => {
    cancelActiveCardInteractions();
    releaseUnexpectedLocalCardLocks();
  });

  window.addEventListener('resize', () => {
    applyCamera();
    scheduleAuctionBidUiRender();
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

    if (drawModeEnabled) {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        endedTouchPointerIds.delete(event.pointerId);
      }
      activePointers.add(event.pointerId);
      tableRoot.setPointerCapture?.(event.pointerId);
      if (beginDrawingStroke(event)) {
        event.preventDefault();
        schedulePublishFromEvent(event);
      }
      return;
    }

    activePointers.add(event.pointerId);
    tableRoot.setPointerCapture?.(event.pointerId);

    if (event.pointerType === 'mouse') {
      if (event.button === 2) {
        event.preventDefault();
        if (cardDragState || groupDragState) {
          if (isEventOnCard(event)) {
            // Allow card context menu flip while keeping the current drag alive.
            suppressNextCardContextMenu = false;
            return;
          }
          suppressNextCardContextMenu = true;
          cancelActiveCardInteractions();
          return;
        }
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
      endedTouchPointerIds.delete(event.pointerId);
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
    if (event.pointerType === 'mouse') {
      updateHandHoverFromClient(event.clientX, event.clientY, event.pointerType);
    }
    if (shouldIgnorePointerEvent(event)) {
      return;
    }

    if (drawModeEnabled) {
      if (updateDrawingStroke(event)) {
        event.preventDefault();
      }
      if (event.pointerType === 'mouse' || activePointers.has(event.pointerId)) {
        schedulePublishFromEvent(event);
      }
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

    if (drawModeEnabled) {
      finishDrawingStroke(event);
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        touchPointers.delete(event.pointerId);
        touchPanState = null;
        pinchState = null;
      }
      schedulePublishFromEvent(event);
      if (tableRoot.hasPointerCapture?.(event.pointerId)) {
        tableRoot.releasePointerCapture(event.pointerId);
      }
      return;
    }

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
  tableRoot.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') {
      setHoveredHandCard(null);
    }
  });

  localLockWatchdogIntervalId = window.setInterval(() => {
    releaseUnexpectedLocalCardLocks();
  }, 1200);
}
