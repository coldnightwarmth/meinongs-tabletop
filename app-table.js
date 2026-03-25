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
const gameLayer = document.getElementById('gameLayer');
const drawingLayer = document.getElementById('drawingLayer');
const cardLayer = document.getElementById('cardLayer');
const cursorLayer = document.getElementById('cursorLayer');
const roomBadge = document.getElementById('roomBadge');
const assetLoadingStatus = document.getElementById('assetLoadingStatus');
const roomTitleInput = document.getElementById('roomTitleInput');
const statusBadge = document.getElementById('statusBadge');
const drawModeButton = document.getElementById('drawModeButton');
const drawClearButton = document.getElementById('drawClearButton');
const drawUndoButton = document.getElementById('drawUndoButton');
const drawToolRow = document.getElementById('drawToolRow');
const drawToolFreeButton = document.getElementById('drawToolFreeButton');
const drawToolLineButton = document.getElementById('drawToolLineButton');
const drawToolBoxButton = document.getElementById('drawToolBoxButton');
const auctionBidBoard = document.getElementById('auctionBidBoard');
const auctionBidEntry = document.getElementById('auctionBidEntry');
const auctionBidInput = document.getElementById('auctionBidInput');
const auctionBidSubmitButton = document.getElementById('auctionBidSubmitButton');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyLabel = document.getElementById('copyLabel');
const bottomRightControls = document.getElementById('bottomRightControls');
const deleteModeCancelButton = document.getElementById('deleteModeCancelButton');
const assetMenuButton = document.getElementById('assetMenuButton');
const assetMenuModal = document.getElementById('assetMenuModal');
const assetMenuCloseButton = document.getElementById('assetMenuCloseButton');
const assetMenuTabGameButton = document.getElementById('assetMenuTabGameButton');
const assetMenuTabComponentButton = document.getElementById('assetMenuTabComponentButton');
const assetGameGallery = document.getElementById('assetGameGallery');
const assetComponentGallery = document.getElementById('assetComponentGallery');
const coolJpegsTile = document.getElementById('coolJpegsTile');
const superMetalMonsTile = document.getElementById('superMetalMonsTile');
const diceComponentTile = document.getElementById('diceComponentTile');
const coinComponentTile = document.getElementById('coinComponentTile');
const labelComponentTile = document.getElementById('labelComponentTile');
const imageComponentTile = document.getElementById('imageComponentTile');
const diceAddModal = document.getElementById('diceAddModal');
const diceAddCloseButton = document.getElementById('diceAddCloseButton');
const diceTypeD6Button = document.getElementById('diceTypeD6Button');
const diceTypeD20Button = document.getElementById('diceTypeD20Button');
const diceCountRow = document.getElementById('diceCountRow');
const diceAddConfirmButton = document.getElementById('diceAddConfirmButton');
const imageAddModal = document.getElementById('imageAddModal');
const imageAddCloseButton = document.getElementById('imageAddCloseButton');
const imageAddFrontInput = document.getElementById('imageAddFrontInput');
const imageAddBackInput = document.getElementById('imageAddBackInput');
const imageAddCardCheckbox = document.getElementById('imageAddCardCheckbox');
const imageAddTwoSidedCheckbox = document.getElementById('imageAddTwoSidedCheckbox');
const imageAddBackField = document.getElementById('imageAddBackField');
const imageAddError = document.getElementById('imageAddError');
const imageAddConfirmButton = document.getElementById('imageAddConfirmButton');
const removeComponentsButton = document.getElementById('removeComponentsButton');
const tableResetRow = document.getElementById('tableResetRow');
const clearTableButton = document.getElementById('clearTableButton');
const wipeAllDrawingsButton = document.getElementById('wipeAllDrawingsButton');
const clearTableWarningModal = document.getElementById('clearTableWarningModal');
const clearTableWarningYesButton = document.getElementById('clearTableWarningYesButton');
const clearTableWarningNoButton = document.getElementById('clearTableWarningNoButton');
const drawClearWarningModal = document.getElementById('drawClearWarningModal');
const drawClearWarningYesButton = document.getElementById('drawClearWarningYesButton');
const drawClearWarningNoButton = document.getElementById('drawClearWarningNoButton');
const instanceWarningModal = document.getElementById('instanceWarningModal');
const instanceWarningContinueButton = document.getElementById('instanceWarningContinueButton');
const instanceWarningCancelButton = document.getElementById('instanceWarningCancelButton');
const gameOptionsModal = document.getElementById('gameOptionsModal');
const gameOptionsTitle = document.getElementById('gameOptionsTitle');
const gameOptionsTitleText = document.getElementById('gameOptionsTitleText');
const gameOptionsCloseButton = document.getElementById('gameOptionsCloseButton');
const gameOptionsResetButton = document.getElementById('gameOptionsResetButton');
const gameOptionsPutAwayButton = document.getElementById('gameOptionsPutAwayButton');
const monsItemChoiceModal = document.getElementById('monsItemChoiceModal');
const monsItemChoiceBombButton = document.getElementById('monsItemChoiceBombButton');
const monsItemChoicePotionButton = document.getElementById('monsItemChoicePotionButton');
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
const ASSET_MENU_VIEW_KEY = 'tabletop-asset-menu-view';
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
const DRAW_TOOL_FREE = 'free';
const DRAW_TOOL_LINE = 'line';
const DRAW_TOOL_BOX = 'box';
const DRAW_TOOL_DRAG_MIN_DISTANCE = 3;
const DELETE_FADE_DURATION_MS = 170;
const CURSOR_PENCIL_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 20L8.8 18.8L19.2 8.4C19.8 7.8 19.8 6.9 19.2 6.3L17.7 4.8C17.1 4.2 16.2 4.2 15.6 4.8L5.2 15.2L4 20Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.8 6.6L17.4 10.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"></path></svg>';
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
const CURSOR_HEARTBEAT_INTERVAL_MS = 12000;
const CURSOR_STALE_TIMEOUT_MS = 35000;
const PRESENCE_STALE_TIMEOUT_MS = 45000;
const DECK_KEY = 'cool-jpegs';
const MONS_GAME_KEY = 'super-metal-mons';
const CARD_BACK_IMAGE_SRC = './assets/back.png';
const MONS_BOARD_SIZE = 11;
const MONS_BOARD_LABELS = 'ABCDEFGHIJK';
const MONS_BOARD_CENTER = MONS_BOARD_SIZE / 2;
const MONS_BOARD_WORLD_WIDTH = 680;
const MONS_BOARD_WORLD_HEIGHT = 760;
const MONS_PIECE_PIXELATE_SCALE = 1.2;
const MONS_HUD_POTION_HIDE_SCREEN_WIDTH = 330;
const MONS_BOMB_ATTACK_RANGE = 3;
const MONS_MOVE_CONTROL_SIZE = 28;
const MONS_SIDE_CLAIMS_EDGE_INSET = 27;
const MONS_SIDE_CLAIMS_VERTICAL_OFFSET = 8;
const MONS_UNDO_HISTORY_LIMIT = 30;
const DIE_SIZE_D6 = 84;
const DIE_SIZE_D20 = 92;
const DIE_SIZE_COIN = 114;
const IMAGE_COMPONENT_MIN_WORLD_SIZE = DIE_SIZE_D20;
const IMAGE_COMPONENT_MAX_WORLD_WIDTH = MONS_BOARD_WORLD_WIDTH * 2;
const IMAGE_COMPONENT_MAX_WORLD_HEIGHT = MONS_BOARD_WORLD_HEIGHT * 2;
const DIE_ROLL_DURATION_MS = 850;
const DIE_ROLL_STEP_MS = 72;
const DICE_SPAWN_GAP = 108;
const LABEL_DEFAULT_TEXT = 'double click to type';
const LABEL_MIN_WORLD_WIDTH = 110;
const LABEL_MIN_WORLD_HEIGHT = 34;
const LABEL_MAX_WORLD_WIDTH = 3600;
const LABEL_MAX_WORLD_HEIGHT = 2200;
const LABEL_EDGE_OVERFLOW = 700;
const LABEL_CHAR_WORLD_WIDTH = 11;
const LABEL_LINE_WORLD_HEIGHT = 30;
const LABEL_PADDING_WORLD_X = 28;
const LABEL_PADDING_WORLD_Y = 18;
const LABEL_TEXT_MAX_LENGTH = 1200;
const LABEL_TEXT_SCALE_DEFAULT = 1;
const LABEL_TEXT_SCALE_MIN = 0.58;
const LABEL_TEXT_SCALE_MAX = 24;
const LABEL_FONT_SIZE_FACTOR = 0.58;
const LABEL_DEFAULT_SPAWN_WIDTH = 332;
const LABEL_MEASURE_BUFFER_X = 8;
const LABEL_MEASURE_BUFFER_Y = 6;
const D6_PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 30], [70, 30], [30, 50], [70, 50], [30, 70], [70, 70]]
};
const DICE_TILE_ICON_PIP_LAYOUTS = {
  1: [6],
  2: [0, 5],
  3: [0, 6, 5],
  4: [0, 1, 4, 5],
  5: [0, 1, 6, 4, 5],
  6: [0, 2, 4, 1, 3, 5]
};
const MONS_PARTICLE_DURATION_MS = 420;
const MONS_ATTACK_EFFECT_DURATION_MS = 820;
const MONS_SCORED_MANA_FADE_OUT_MS = 320;
const MONS_SCORED_MANA_FADE_OUT_HOLD_MS = 70;
const MONS_MANA_POOL_PULSE_MS = 620;
const MONS_SCORED_MANA_TRAVEL_MS = 260;
const MONS_SPAWN_GHOST_SCALE = 0.76;
const MONS_SPAWN_GHOST_OPACITY = 0.34;
const MONS_WAVE_PIXEL = 1 / 32;
const MONS_WAVE_FRAME_COUNT = 9;
const MONS_WAVE_FRAME_MS = 200;
const MONS_CORNER_TILE_COLOR = '#030DF4';
const MONS_WAVE_COLOR_A = '#6666FF';
const MONS_WAVE_COLOR_B = '#00FCFF';
const MONS_TILE_LIGHT_COLOR = '#f1f1ed';
const MONS_TILE_DARK_COLOR = '#e6e6e1';
const MONS_ITEM_TILE_COLOR = '#d0ccbe';
const MONS_DEMON_ATTACK_PARTICLE_COLORS = ['#FFB347', '#FF7A00', '#FF4300', '#FFD06E'];
const MONS_MYSTIC_ATTACK_PARTICLE_COLORS = ['#D9F4FF', '#97E8FF', '#61CCFF', '#9EE3FF'];
const MONS_BOMB_FLAME_PARTICLE_COLORS = ['#FFEFB0', '#FFD36A', '#FFAA3A', '#FF6E1F', '#F6400A'];
const MONS_BOMB_SMOKE_PARTICLE_COLORS = ['#F1ECE3', '#B3AAA0', '#868079', '#5D5955', '#3A3836'];
const MONS_ATTACK_INDICATOR_COLOR = 'rgba(238, 112, 86, 0.96)';
const MONS_SPIRIT_INDICATOR_COLOR = 'rgba(177, 76, 255, 0.98)';
const MONS_BLOCKED_INDICATOR_COLOR = 'rgba(246, 214, 132, 0.94)';
const MONS_ANGEL_ZONE_COLOR = 'rgba(175, 238, 255, 0.94)';
const MONS_CENTER_TILE = {
  row: Math.floor(MONS_BOARD_SIZE / 2),
  col: Math.floor(MONS_BOARD_SIZE / 2)
};
const MONS_CORNER_POOL_POSITIONS = [
  [0, 0],
  [MONS_BOARD_SIZE - 1, 0],
  [0, MONS_BOARD_SIZE - 1],
  [MONS_BOARD_SIZE - 1, MONS_BOARD_SIZE - 1]
];
const MONS_CORNER_WAVE_SEED_BASE = Math.floor(Math.random() * 0x7fffffff);
const MONS_ASSET_PREFIX = './assets/mons/';
const MONS_PIECE_ASSET_BY_TYPE = {
  mysticB: `${MONS_ASSET_PREFIX}mysticB.png`,
  spiritB: `${MONS_ASSET_PREFIX}spiritB.png`,
  drainerB: `${MONS_ASSET_PREFIX}drainerB.png`,
  angelB: `${MONS_ASSET_PREFIX}angelB.png`,
  demonB: `${MONS_ASSET_PREFIX}demonB.png`,
  demon: `${MONS_ASSET_PREFIX}demon.png`,
  angel: `${MONS_ASSET_PREFIX}angel.png`,
  drainer: `${MONS_ASSET_PREFIX}drainer.png`,
  spirit: `${MONS_ASSET_PREFIX}spirit.png`,
  mystic: `${MONS_ASSET_PREFIX}mystic.png`,
  manaB: `${MONS_ASSET_PREFIX}manaB.png`,
  mana: `${MONS_ASSET_PREFIX}mana.png`,
  supermana: `${MONS_ASSET_PREFIX}supermana.png`,
  bomb: `${MONS_ASSET_PREFIX}bomb.png`,
  potion: `${MONS_ASSET_PREFIX}potion.png`,
  bombOrPotion: `${MONS_ASSET_PREFIX}bombOrPotion.png`
};
const MONS_SUPER_MANA_HELD_ICON_SRC = `${MONS_ASSET_PREFIX}supermanaSimple.png`;
const MONS_BOMB_HELD_ICON_SRC = `${MONS_ASSET_PREFIX}bomb.png`;
const MONS_HELD_MANA_PIXEL_NUDGE = 4 / (MONS_BOARD_WORLD_WIDTH / MONS_BOARD_SIZE);
const MONS_HELD_MANA_VERTICAL_PIXEL_NUDGE = 1 / (MONS_BOARD_WORLD_WIDTH / MONS_BOARD_SIZE);
const MONS_HELD_BOMB_PIXEL_NUDGE = 8 / (MONS_BOARD_WORLD_WIDTH / MONS_BOARD_SIZE);
const MONS_HELD_BOMB_ICON_SIZE = 0.58;
const MONS_DEFAULT_PIECES = [
  { id: 'black-mystic', type: 'mysticB', side: 'black', row: 0, col: 3 },
  { id: 'black-spirit', type: 'spiritB', side: 'black', row: 0, col: 4 },
  { id: 'black-drainer', type: 'drainerB', side: 'black', row: 0, col: 5 },
  { id: 'black-angel', type: 'angelB', side: 'black', row: 0, col: 6 },
  { id: 'black-demon', type: 'demonB', side: 'black', row: 0, col: 7 },
  { id: 'white-demon', type: 'demon', side: 'white', row: 10, col: 3 },
  { id: 'white-angel', type: 'angel', side: 'white', row: 10, col: 4 },
  { id: 'white-drainer', type: 'drainer', side: 'white', row: 10, col: 5 },
  { id: 'white-spirit', type: 'spirit', side: 'white', row: 10, col: 6 },
  { id: 'white-mystic', type: 'mystic', side: 'white', row: 10, col: 7 },
  { id: 'mana-b1', type: 'manaB', side: 'black', row: 3, col: 4 },
  { id: 'mana-b2', type: 'manaB', side: 'black', row: 3, col: 6 },
  { id: 'mana-b3', type: 'manaB', side: 'black', row: 4, col: 3 },
  { id: 'mana-b4', type: 'manaB', side: 'black', row: 4, col: 5 },
  { id: 'mana-b5', type: 'manaB', side: 'black', row: 4, col: 7 },
  { id: 'mana-w1', type: 'mana', side: 'white', row: 6, col: 3 },
  { id: 'mana-w2', type: 'mana', side: 'white', row: 6, col: 5 },
  { id: 'mana-w3', type: 'mana', side: 'white', row: 6, col: 7 },
  { id: 'mana-w4', type: 'mana', side: 'white', row: 7, col: 4 },
  { id: 'mana-w5', type: 'mana', side: 'white', row: 7, col: 6 },
  { id: 'super-mana', type: 'supermana', side: 'neutral', row: 5, col: 5 },
  { id: 'item-left', type: 'bombOrPotion', side: 'neutral', row: 5, col: 0 },
  { id: 'item-right', type: 'bombOrPotion', side: 'neutral', row: 5, col: 10 }
];
const MONS_BASE_TYPE_BY_RENDER_TYPE = {
  mysticB: 'mystic',
  mystic: 'mystic',
  spiritB: 'spirit',
  spirit: 'spirit',
  drainerB: 'drainer',
  drainer: 'drainer',
  angelB: 'angel',
  angel: 'angel',
  demonB: 'demon',
  demon: 'demon',
  manaB: 'manaB',
  mana: 'mana',
  supermana: 'supermana',
  bombOrPotion: 'bombOrPotion'
};
const MONS_MON_BASE_TYPES = new Set(['angel', 'demon', 'drainer', 'spirit', 'mystic']);
const MONS_MON_SPAWN_BY_TILE_KEY = {};
const MONS_MON_SPAWN_BY_SIDE_AND_TYPE = {};
const MONS_MON_SPAWN_BY_ID = {};
const MONS_ITEM_SPAWN_TILE_KEYS = new Set();
const MONS_SUPER_MANA_SPAWN_TILE_KEYS = new Set();

function getMonsBaseTypeFromRenderType(type) {
  const mapped = MONS_BASE_TYPE_BY_RENDER_TYPE[type];
  return mapped || '';
}

function isMonsItemPieceType(type) {
  return type === 'bombOrPotion';
}

function isMonsItemPiece(piece) {
  return Boolean(piece && typeof piece === 'object' && isMonsItemPieceType(piece.type));
}

for (const piece of MONS_DEFAULT_PIECES) {
  if (piece.type === 'bombOrPotion') {
    MONS_ITEM_SPAWN_TILE_KEYS.add(`${piece.row}-${piece.col}`);
  }
  if (piece.type === 'supermana') {
    MONS_SUPER_MANA_SPAWN_TILE_KEYS.add(`${piece.row}-${piece.col}`);
  }
  const baseType = getMonsBaseTypeFromRenderType(piece.type);
  if (!MONS_MON_BASE_TYPES.has(baseType)) {
    continue;
  }
  const spawn = {
    row: piece.row,
    col: piece.col,
    side: piece.side,
    type: baseType
  };
  MONS_MON_SPAWN_BY_TILE_KEY[`${piece.row}-${piece.col}`] = spawn;
  MONS_MON_SPAWN_BY_SIDE_AND_TYPE[`${piece.side}-${baseType}`] = {
    row: piece.row,
    col: piece.col
  };
  MONS_MON_SPAWN_BY_ID[piece.id] = {
    row: piece.row,
    col: piece.col
  };
}

const CARD_FRONT_HIGH_RES_PREFIX = './assets/cards/';
const CARD_FRONT_LOW_RES_PREFIX = './assets/cards-low/';
const COOL_JPEGS_FRONT_IMAGES = Array.from({ length: 75 }, (_, index) => `${CARD_FRONT_HIGH_RES_PREFIX}${1000 + index}.png`);
const COOL_JPEGS_FRONT_IMAGES_LOW = COOL_JPEGS_FRONT_IMAGES.map((src) =>
  src.replace(CARD_FRONT_HIGH_RES_PREFIX, CARD_FRONT_LOW_RES_PREFIX)
);

function shouldUseCleanRoomPaths() {
  const host = window.location.hostname.toLowerCase();
  return host !== 'localhost' && host !== '127.0.0.1';
}

function getRoomIdFromPath(pathname = window.location.pathname) {
  const segments = String(pathname || '')
    .split('/')
    .filter(Boolean);
  const last = segments[segments.length - 1] || '';
  if (!last || last.includes('.')) {
    return '';
  }
  try {
    return decodeURIComponent(last).trim();
  } catch {
    return last.trim();
  }
}

function getRoomBasePath(pathname = window.location.pathname) {
  let basePath = String(pathname || '');
  const lowerPath = basePath.toLowerCase();
  if (lowerPath.endsWith('/table.html')) {
    basePath = basePath.slice(0, -'/table.html'.length);
  } else if (lowerPath.endsWith('/index.html')) {
    basePath = basePath.slice(0, -'/index.html'.length);
  } else {
    const segments = basePath.split('/');
    const last = segments[segments.length - 1];
    if (last && !last.includes('.')) {
      segments.pop();
      basePath = segments.join('/');
    }
  }
  if (!basePath) {
    basePath = '/';
  }
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }
  return basePath;
}

function buildRoomShareUrl(roomValue) {
  const room = String(roomValue || '').trim();
  if (!room) {
    return new URL(window.location.href);
  }
  if (shouldUseCleanRoomPaths()) {
    return new URL(`${getRoomBasePath()}${encodeURIComponent(room)}`, window.location.origin);
  }
  const legacyUrl = new URL('./table.html', window.location.href);
  legacyUrl.searchParams.set('room', room);
  return legacyUrl;
}

const query = new URLSearchParams(window.location.search);
const roomId = String(query.get('room') || getRoomIdFromPath(window.location.pathname) || '').trim();
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
setDocumentRoomTitle(defaultRoomTitle);
const dots = new Map();
const cards = new Map();
const diceById = new Map();
const cardElements = new Map();
const diceElements = new Map();
const cardFaces = new Map();
const cardFlipTimers = new Map();
const selectedCardIds = new Set();
const selectedDiceIds = new Set();
const selectedDeckIds = new Set();
const selectedMonsGameIds = new Set();
const frontImageLoadState = new Map();
const frontImagePromises = new Map();
const frontDisplayPendingByCard = new Map();
const handCardElements = new Map();
const handDisplayPendingByCard = new Map();
const discardReturnAnimatingCardIds = new Set();
const discardReturnAnimationTimers = new Map();
const drawingStrokes = new Map();
const drawingStrokeElements = new Map();
let roomBadgeWidthSyncRafId = 0;
let frontImagePendingLoadCount = 0;

let localPosition = { x: 0.5, y: 0.5 };
let syncCursorState = () => {};
let localClientId = '';
let localPlayerToken = '';
let latestPresenceByToken = {};
let deckState = null;
const deckStatesById = new Map();
let activeDeckId = DECK_KEY;
const deckUiById = new Map();
let monsGameState = null;
const monsGameStatesById = new Map();
const monsGhostBoardElementsById = new Map();
let activeMonsGameId = MONS_GAME_KEY;
let monsMoveButton = null;
let monsOptionsButton = null;
let monsUndoButton = null;
let monsFlipButton = null;
let monsGameShell = null;
let monsBoardSvg = null;
let monsBoardPiecesLayer = null;
let monsBoardTilesLayer = null;
let monsBoardWavesLayer = null;
let monsBoardGhostsLayer = null;
let monsBoardHintsLayer = null;
let monsBoardParticlesLayer = null;
let monsHud = null;
let monsScoreBlackLabel = null;
let monsScoreWhiteLabel = null;
let monsPotionsBlackTray = null;
let monsPotionsWhiteTray = null;
let monsBlackClaimButton = null;
let monsWhiteClaimButton = null;
let monsBlackClaimsList = null;
let monsWhiteClaimsList = null;
let monsSelectionPieceId = '';
let monsPendingSpiritPush = null;
let monsPendingDemonRebound = null;
let lastRenderedMonsMoveTick = 0;
let monsParticleAnimationRafId = 0;
let monsWaveFrameIndex = 0;
let monsWaveTimerId = 0;
let monsCornerWaveLines = [];
let deckDropIndicator = null;
let discardDropIndicator = null;
let auctionDropIndicator = null;
let deckDropIndicatorVisible = false;
let discardDropIndicatorVisible = false;
let auctionDropIndicatorVisible = false;
let deckDropIndicatorDeckId = '';
let discardDropIndicatorDeckId = '';
let auctionDropIndicatorDeckId = '';
let handTray = null;
let handDropGlow = null;
let handDropGlowVisible = false;
let handReorderState = null;
let handDropPreview = null;
let handHoverLayout = null;
let hoveredHandCardId = null;
let lastHandHoverClientX = Number.NaN;
let lastHandHoverClientY = Number.NaN;
let resizingImageCardId = '';
let resizingLabelDieId = '';
let latestRoomCursors = {};
let heldCardLayer = null;
let selectionBoxElement = null;
let deckShuffleFxCards = [];
let deckShuffleFxActive = false;
let deckShuffleFxTimerId = 0;
let deckShuffleFxDeckId = DECK_KEY;
let diceRollAnimationRafId = 0;
let cameraPersistTimerId = 0;
let themeTransitionTimerId = 0;
let coolJpegsFrontPreloadPromise = null;
let activeGameOptionsTarget = '';
let activeAssetMenuView = localStorage.getItem(ASSET_MENU_VIEW_KEY) === 'component' ? 'component' : 'game';
let clearTableWarningResolver = null;
let drawClearWarningResolver = null;
let instanceWarningResolver = null;
let pendingMonsItemChoice = null;
let activeDiceAddType = 'd6';
let activeDiceAddCount = 1;
let roomTitleValue = defaultRoomTitle;
let isRoomTitleEditing = false;
let isRoomOwner = false;
let spawnCoolJpegsDeck = async () => {
  showStatusMessage('Firebase connection is required before adding a deck.');
};
let spawnSuperMetalMonsBoard = async () => {
  showStatusMessage('Firebase connection is required before adding super metal mons.');
};
let resetCoolJpegsGame = async () => {
  showStatusMessage('Firebase connection is required before resetting cool jpegs.');
};
let putAwayCoolJpegsGame = async () => {
  showStatusMessage('Firebase connection is required before putting cool jpegs away.');
};
let resetSuperMetalMonsGame = async () => {
  showStatusMessage('Firebase connection is required before resetting super metal mons.');
};
let putAwaySuperMetalMonsGame = async () => {
  showStatusMessage('Firebase connection is required before putting super metal mons away.');
};
let spawnDice = async () => {
  showStatusMessage('Firebase connection is required before adding dice.');
};
let spawnCoin = async () => {
  showStatusMessage('Firebase connection is required before adding coins.');
};
let spawnImageComponent = async () => {
  showStatusMessage('Firebase connection is required before adding images.');
};
let spawnLabelComponent = async () => {
  showStatusMessage('Firebase connection is required before adding labels.');
};
let renameRoomTitle = async () => {
  showStatusMessage('Firebase connection is required before renaming the room.');
};
let clearTabletop = async () => {
  showStatusMessage('Firebase connection is required before clearing the table.');
};
let wipeAllDrawings = async () => {
  showStatusMessage('Firebase connection is required before wiping drawings.');
};
let clearOwnDrawings = async () => {
  showStatusMessage('Firebase connection is required before deleting drawings.');
};
let undoOwnDrawing = async () => {
  showStatusMessage('Firebase connection is required before undoing drawings.');
};
let submitMonsItemChoice = async () => {
  showStatusMessage('Firebase connection is required before choosing an item.');
};
let submitAuctionBid = async () => {
  showStatusMessage('Firebase connection is required before submitting bids.');
};
let shuffleCoolJpegsDeck = async () => {};
let dealOneCardEach = async () => {};
let reclaimDiscardToDeck = async () => {};
let onCardPointerDown = () => {};
let onCardResizePointerDown = () => {};
let onCardContextMenu = () => {};
let onHandCardPointerDown = () => {};
let onDiePointerDown = () => {};
let onDieContextMenu = () => {};
let onLabelResizePointerDown = () => {};
let onDeckMovePointerDown = () => {};
let onMonsMovePointerDown = () => {};
let onMonsUndoButtonClick = () => {};
let onMonsFlipButtonClick = () => {};
let onMonsBoardTilePointerDown = () => {};
let onMonsSideClaimClick = () => {};
let onDrawingStrokePointerDown = () => {};
let drawModeEnabled = false;
let deleteModeEnabled = false;
let activeDrawTool = DRAW_TOOL_FREE;
let onDrawToolModeChanged = () => {};
let setDrawModeEnabled = (enabled) => {
  drawModeEnabled = Boolean(enabled);
  syncDrawModeUi();
};
let setDeleteModeEnabled = (enabled) => {
  const nextEnabled = Boolean(enabled);
  deleteModeEnabled = nextEnabled;
  if (nextEnabled && drawModeEnabled) {
    setDrawModeEnabled(false);
  }
  tableRoot?.classList.toggle('is-delete-mode', deleteModeEnabled);
  deleteModeCancelButton?.classList.toggle('hidden', !deleteModeEnabled);
};

const camera = {
  scale: 1,
  panX: 0,
  panY: 0
};

function getMonsPieceImageRendering() {
  return camera.scale >= MONS_PIECE_PIXELATE_SCALE ? 'pixelated' : 'auto';
}

function getMonsColumnLabelText(index, flipped = false) {
  const normalizedIndex = clamp(Math.round(Number(index) || 0), 0, MONS_BOARD_SIZE - 1);
  const labelIndex = flipped ? MONS_BOARD_SIZE - 1 - normalizedIndex : normalizedIndex;
  return MONS_BOARD_LABELS[labelIndex] || '';
}

function getMonsRowLabelText(index, flipped = false) {
  const normalizedIndex = clamp(Math.round(Number(index) || 0), 0, MONS_BOARD_SIZE - 1);
  return flipped ? String(normalizedIndex + 1) : String(MONS_BOARD_SIZE - normalizedIndex);
}

function syncMonsBoardCoordinateLabels(boardSvgElement, flipped) {
  if (!(boardSvgElement instanceof SVGElement)) {
    return;
  }
  const labels = boardSvgElement.querySelectorAll('.mons-board-coordinate[data-mons-axis][data-mons-index]');
  for (const label of labels) {
    const axis = label.getAttribute('data-mons-axis');
    const index = Number(label.getAttribute('data-mons-index'));
    if (!Number.isFinite(index)) {
      continue;
    }
    if (axis === 'col') {
      label.textContent = getMonsColumnLabelText(index, flipped);
    } else if (axis === 'row') {
      label.textContent = getMonsRowLabelText(index, flipped);
    }
    if (flipped) {
      label.setAttribute('transform', `rotate(180 ${MONS_BOARD_CENTER} ${MONS_BOARD_CENTER})`);
    } else {
      label.removeAttribute('transform');
    }
  }
}

function isMonsBoardFlipped(gamePayload = monsGameState) {
  return gamePayload?.flipped === true;
}

function applyMonsBoardOrientation(boardSvgElement, flipped) {
  if (!(boardSvgElement instanceof SVGElement)) {
    return;
  }
  if (flipped) {
    boardSvgElement.style.transformOrigin = '50% 50%';
    boardSvgElement.style.transform = 'rotate(180deg)';
  } else {
    boardSvgElement.style.transform = '';
    boardSvgElement.style.transformOrigin = '';
  }
  syncMonsBoardCoordinateLabels(boardSvgElement, flipped);
}

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

function getViewportWorldCenter() {
  if (!tableRoot) {
    return {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2
    };
  }
  const rect = tableRoot.getBoundingClientRect();
  if (!rect.width || !rect.height || !Number.isFinite(camera.scale) || camera.scale <= 0) {
    return {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2
    };
  }
  const centerScreenX = rect.width / 2;
  const centerScreenY = rect.height / 2;
  return {
    x: clamp((centerScreenX - camera.panX) / camera.scale, 0, WORLD_WIDTH),
    y: clamp((centerScreenY - camera.panY) / camera.scale, 0, WORLD_HEIGHT)
  };
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

function normalizeDeckId(rawDeckId) {
  const normalized = String(rawDeckId || '').trim().toLowerCase();
  if (!normalized) {
    return DECK_KEY;
  }
  return normalized;
}

function normalizeMonsGameId(rawMonsGameId) {
  const normalized = String(rawMonsGameId || '').trim().toLowerCase();
  if (!normalized) {
    return MONS_GAME_KEY;
  }
  return normalized;
}

function isMonsGameId(rawGameId) {
  const normalized = normalizeMonsGameId(rawGameId);
  return normalized === MONS_GAME_KEY || normalized.startsWith(`${MONS_GAME_KEY}-copy-`);
}

function setActiveDeckId(nextDeckId) {
  const normalizedDeckId = normalizeDeckId(nextDeckId);
  activeDeckId = normalizedDeckId;
  deckState = deckStatesById.get(normalizedDeckId) || null;
}

function setActiveMonsGameId(nextMonsGameId) {
  const previousMonsGameId = normalizeMonsGameId(activeMonsGameId);
  const normalizedMonsGameId = normalizeMonsGameId(nextMonsGameId);
  activeMonsGameId = normalizedMonsGameId;
  monsGameState = monsGameStatesById.get(normalizedMonsGameId) || null;
  if (normalizedMonsGameId !== previousMonsGameId) {
    monsSelectionPieceId = '';
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    lastRenderedMonsMoveTick = Number(monsGameState?.moveTick) || 0;
  }
}

function getDeckStateById(deckId = activeDeckId) {
  const normalizedDeckId = normalizeDeckId(deckId);
  return deckStatesById.get(normalizedDeckId) || null;
}

function getMonsGameStateById(gameId = activeMonsGameId) {
  const normalizedMonsGameId = normalizeMonsGameId(gameId);
  return monsGameStatesById.get(normalizedMonsGameId) || null;
}

function getDeckIdsInRoom() {
  const deckIds = new Set(deckStatesById.keys());
  for (const cardState of cards.values()) {
    if (!cardState || typeof cardState !== 'object') {
      continue;
    }
    deckIds.add(normalizeDeckId(cardState.deckId));
  }
  return Array.from(deckIds);
}

function getDeckCenterPosition(deckId = activeDeckId) {
  const state = getDeckStateById(deckId);
  if (state) {
    return {
      x: state.x,
      y: state.y
    };
  }
  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
  };
}

function getDiscardCenterPosition(deckId = activeDeckId) {
  const deckCenter = getDeckCenterPosition(deckId);
  return {
    x: deckCenter.x - DISCARD_STACK_OFFSET_X,
    y: deckCenter.y
  };
}

function getAuctionCenterPosition(deckId = activeDeckId) {
  const deckCenter = getDeckCenterPosition(deckId);
  return {
    x: deckCenter.x + AUCTION_STACK_OFFSET_X,
    y: deckCenter.y
  };
}

function normalizeDieType(type) {
  if (type === 'label') {
    return 'label';
  }
  if (type === 'coin') {
    return 'coin';
  }
  return type === 'd20' ? 'd20' : 'd6';
}

function getDieSides(type) {
  const normalizedType = normalizeDieType(type);
  if (normalizedType === 'label') {
    return 1;
  }
  if (normalizedType === 'coin') {
    return 2;
  }
  return normalizedType === 'd20' ? 20 : 6;
}

function getDieSize(type) {
  const normalizedType = normalizeDieType(type);
  if (normalizedType === 'label') {
    return LABEL_MIN_WORLD_WIDTH;
  }
  if (normalizedType === 'coin') {
    return DIE_SIZE_COIN;
  }
  return normalizedType === 'd20' ? DIE_SIZE_D20 : DIE_SIZE_D6;
}

function normalizeLabelText(value) {
  const raw = String(value ?? '').replace(/\r\n?/g, '\n').slice(0, LABEL_TEXT_MAX_LENGTH);
  return raw;
}

function getLabelTextScale(valueOrState, fallback = LABEL_TEXT_SCALE_DEFAULT) {
  const rawValue =
    valueOrState && typeof valueOrState === 'object'
      ? Number(valueOrState.textScale)
      : Number(valueOrState);
  const fallbackValue = Number(fallback);
  const normalized = Number.isFinite(rawValue)
    ? rawValue
    : Number.isFinite(fallbackValue)
      ? fallbackValue
      : LABEL_TEXT_SCALE_DEFAULT;
  return clamp(normalized, LABEL_TEXT_SCALE_MIN, LABEL_TEXT_SCALE_MAX);
}

function getLabelFontSizePx(dieState) {
  const textScale = getLabelTextScale(dieState);
  const worldFontSize = LABEL_LINE_WORLD_HEIGHT * textScale * LABEL_FONT_SIZE_FACTOR;
  return clamp(worldFontSize * camera.scale, 4, 1680);
}

function measureLabelWorldDimensions(textValue, options = {}) {
  const normalizedText = normalizeLabelText(textValue);
  const lines = normalizedText.length > 0 ? normalizedText.split('\n') : [''];
  const textScale = getLabelTextScale(options.textScale, LABEL_TEXT_SCALE_DEFAULT);
  const charWorldWidth = Math.max(1, LABEL_CHAR_WORLD_WIDTH * textScale);
  const lineWorldHeight = Math.max(1, LABEL_LINE_WORLD_HEIGHT * textScale);
  const paddingX = LABEL_PADDING_WORLD_X;
  const paddingY = LABEL_PADDING_WORLD_Y;
  const maxWidthConstraint = clamp(
    Number.isFinite(Number(options.maxWidth)) ? Number(options.maxWidth) : LABEL_MAX_WORLD_WIDTH,
    LABEL_MIN_WORLD_WIDTH,
    LABEL_MAX_WORLD_WIDTH
  );
  const maxCharsPerWrappedLine = Math.max(
    1,
    Math.floor((maxWidthConstraint - paddingX * 2) / charWorldWidth)
  );
  let wrappedLineCount = 0;
  let maxLineLength = 1;
  for (const line of lines) {
    const lineLength = Array.from(String(line || '')).length;
    maxLineLength = Math.max(maxLineLength, lineLength);
    wrappedLineCount += Math.max(1, Math.ceil(lineLength / maxCharsPerWrappedLine));
  }
  const measuredWidth =
    Math.min(maxLineLength, maxCharsPerWrappedLine) * charWorldWidth + paddingX * 2 + LABEL_MEASURE_BUFFER_X;
  const measuredHeight =
    Math.max(1, wrappedLineCount) * lineWorldHeight + paddingY * 2 + LABEL_MEASURE_BUFFER_Y;
  return {
    width: clamp(measuredWidth, LABEL_MIN_WORLD_WIDTH, maxWidthConstraint),
    height: clamp(measuredHeight, LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT)
  };
}

function findLabelTextScaleToFit(textValue, targetWidth, targetHeight, preferredScale = LABEL_TEXT_SCALE_DEFAULT) {
  const normalizedText = normalizeLabelText(textValue);
  const width = clamp(Number(targetWidth) || LABEL_MIN_WORLD_WIDTH, LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH);
  const height = clamp(Number(targetHeight) || LABEL_MIN_WORLD_HEIGHT, LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT);
  const preferred = getLabelTextScale(preferredScale, LABEL_TEXT_SCALE_DEFAULT);
  const minScale = LABEL_TEXT_SCALE_MIN;
  const fitsAtScale = (scale) => {
    const measured = measureLabelWorldDimensions(normalizedText, {
      textScale: scale,
      maxWidth: width
    });
    return measured.width <= width + 0.001 && measured.height <= height + 0.001;
  };
  if (fitsAtScale(preferred)) {
    return preferred;
  }
  if (!fitsAtScale(minScale)) {
    return minScale;
  }
  let low = minScale;
  let high = preferred;
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (fitsAtScale(midpoint)) {
      low = midpoint;
    } else {
      high = midpoint;
    }
  }
  return getLabelTextScale(low);
}

function resolveLabelLayoutForBounds(textValue, targetWidth, targetHeight, preferredScale = LABEL_TEXT_SCALE_DEFAULT) {
  const normalizedText = normalizeLabelText(textValue);
  let width = clamp(Number(targetWidth) || LABEL_MIN_WORLD_WIDTH, LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH);
  let height = clamp(Number(targetHeight) || LABEL_MIN_WORLD_HEIGHT, LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT);
  let textScale = findLabelTextScaleToFit(normalizedText, width, height, preferredScale);
  let measured = measureLabelWorldDimensions(normalizedText, {
    textScale,
    maxWidth: width
  });
  width = clamp(Math.max(width, measured.width), LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH);
  height = clamp(Math.max(height, measured.height), LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT);
  if (textScale <= LABEL_TEXT_SCALE_MIN + 0.001) {
    const minimumMeasured = measureLabelWorldDimensions(normalizedText, {
      textScale: LABEL_TEXT_SCALE_MIN,
      maxWidth: width
    });
    width = clamp(Math.max(width, minimumMeasured.width), LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH);
    height = clamp(Math.max(height, minimumMeasured.height), LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT);
    measured = minimumMeasured;
  }
  return {
    text: normalizedText,
    textScale: getLabelTextScale(textScale),
    labelWidth: width,
    labelHeight: height,
    measuredWidth: measured.width,
    measuredHeight: measured.height
  };
}

function getDieWorldDimensions(typeOrPayload, payload = typeOrPayload) {
  const dieType =
    typeof typeOrPayload === 'string'
      ? normalizeDieType(typeOrPayload)
      : normalizeDieType(typeOrPayload?.type);
  if (dieType !== 'label') {
    const size = getDieSize(dieType);
    return { width: size, height: size };
  }
  const normalizedText = normalizeLabelText(payload?.text);
  const measured = measureLabelWorldDimensions(normalizedText, {
    textScale: getLabelTextScale(payload, LABEL_TEXT_SCALE_DEFAULT)
  });
  const payloadWidth = Number(payload?.labelWidth);
  const payloadHeight = Number(payload?.labelHeight);
  return {
    width: Number.isFinite(payloadWidth)
      ? clamp(payloadWidth, LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH)
      : measured.width,
    height: Number.isFinite(payloadHeight)
      ? clamp(payloadHeight, LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT)
      : measured.height
  };
}

function getDieCenterBounds(dieType, width, height) {
  const normalizedType = normalizeDieType(dieType);
  const fallbackSize = getDieSize(normalizedType);
  const resolvedWidth = Math.max(1, Number(width) || fallbackSize);
  const resolvedHeight = Math.max(1, Number(height) || fallbackSize);
  const edgeOverflow = normalizedType === 'label' ? LABEL_EDGE_OVERFLOW : 0;
  const minX = resolvedWidth / 2 - edgeOverflow;
  const maxX = WORLD_WIDTH - resolvedWidth / 2 + edgeOverflow;
  const minY = resolvedHeight / 2 - edgeOverflow;
  const maxY = WORLD_HEIGHT - resolvedHeight / 2 + edgeOverflow;
  return {
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minY: Math.min(minY, maxY),
    maxY: Math.max(minY, maxY)
  };
}

function getSecureRandomUint32() {
  if (typeof crypto?.getRandomValues === 'function') {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] >>> 0;
  }
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

function getRandomIntInclusive(minValue, maxValue) {
  const min = Math.ceil(Number(minValue));
  const max = Math.floor(Number(maxValue));
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }
  if (max <= min) {
    return min;
  }
  const span = max - min + 1;
  const maxRandomExclusive = 0x100000000;
  if (span > 0 && span <= maxRandomExclusive) {
    const cutoff = maxRandomExclusive - (maxRandomExclusive % span);
    let sample = 0;
    do {
      sample = getSecureRandomUint32();
    } while (sample >= cutoff);
    return min + (sample % span);
  }
  return min + Math.floor(Math.random() * span);
}

function normalizeDicePayload(payload) {
  const type = normalizeDieType(payload?.type);
  const dimensions = getDieWorldDimensions(type, payload);
  const centerBounds = getDieCenterBounds(type, dimensions.width, dimensions.height);
  const sides = getDieSides(type);
  const nextX = Number(payload?.x);
  const nextY = Number(payload?.y);
  const nextValue = Number(payload?.value);
  const nextZ = Math.round(Number(payload?.z) || 1);
  const holderClientId = typeof payload?.holderClientId === 'string' && payload.holderClientId ? payload.holderClientId : null;
  const rollStartedAt = Number(payload?.rollStartedAt);
  const rollDurationMs = Number(payload?.rollDurationMs);
  const rollSeed = Math.floor(Number(payload?.rollSeed) || 0);
  const textColor = normalizeHexColor(payload?.textColor || '#ff7a59');
  const text = normalizeLabelText(payload?.text);
  const textScale = getLabelTextScale(payload?.textScale, LABEL_TEXT_SCALE_DEFAULT);
  return {
    type,
    x: Number.isFinite(nextX)
      ? clamp(nextX, centerBounds.minX, centerBounds.maxX)
      : clamp(WORLD_WIDTH / 2, centerBounds.minX, centerBounds.maxX),
    y: Number.isFinite(nextY)
      ? clamp(nextY, centerBounds.minY, centerBounds.maxY)
      : clamp(WORLD_HEIGHT / 2, centerBounds.minY, centerBounds.maxY),
    z: clamp(Number.isFinite(nextZ) ? nextZ : 1, 1, DECK_UI_Z_INDEX - 1),
    value: clamp(Number.isFinite(nextValue) ? Math.round(nextValue) : 1, 1, sides),
    text,
    textColor,
    textScale,
    labelWidth: dimensions.width,
    labelHeight: dimensions.height,
    holderClientId,
    rollStartedAt: type === 'label' ? 0 : Number.isFinite(rollStartedAt) ? Math.max(0, rollStartedAt) : 0,
    rollDurationMs: Number.isFinite(rollDurationMs) ? clamp(Math.round(rollDurationMs), 120, 3000) : DIE_ROLL_DURATION_MS,
    rollSeed: Number.isFinite(rollSeed) ? rollSeed : 0
  };
}

function isDieRolling(dieState, now = Date.now()) {
  if (!dieState || typeof dieState !== 'object') {
    return false;
  }
  if (normalizeDieType(dieState.type) === 'label') {
    return false;
  }
  const startedAt = Number(dieState.rollStartedAt);
  const duration = Number(dieState.rollDurationMs);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || !Number.isFinite(duration) || duration <= 0) {
    return false;
  }
  return now < startedAt + duration;
}

function getPseudoRandomFromSeed(seedValue) {
  let seed = Math.floor(Number(seedValue) || 0) >>> 0;
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 0x7feb352d) >>> 0;
  seed ^= seed >>> 15;
  seed = Math.imul(seed, 0x846ca68b) >>> 0;
  seed ^= seed >>> 16;
  return seed >>> 0;
}

function getRenderedDieValue(dieState, now = Date.now()) {
  const normalized = normalizeDicePayload(dieState);
  if (!isDieRolling(normalized, now)) {
    return normalized.value;
  }
  const elapsed = Math.max(0, now - normalized.rollStartedAt);
  const tick = Math.floor(elapsed / DIE_ROLL_STEP_MS);
  const mixedSeed = getPseudoRandomFromSeed((normalized.rollSeed || 0) + tick * 2654435761);
  return (mixedSeed % getDieSides(normalized.type)) + 1;
}

function getTopDieZ() {
  let topZ = 0;
  for (const dieState of diceById.values()) {
    topZ = Math.max(topZ, Number(dieState?.z) || 0);
  }
  return topZ;
}

function buildCoolJpegsDeck(options = {}) {
  const {
    instanceId = 'default',
    deckId: requestedDeckId = '',
    center: requestedCenter = getDeckCenterPosition(),
    inDeck: startInDeck = true,
    zStart = 1
  } = options;
  const deck = {};
  const normalizedRequestedDeckId = normalizeDeckId(requestedDeckId);
  const safeId = String(instanceId || 'default').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'default';
  const cardIdPrefix = normalizedRequestedDeckId || (safeId === 'default' ? DECK_KEY : `${DECK_KEY}-${safeId}`);
  const nextDeckId = normalizeDeckId(cardIdPrefix);
  const center = {
    x: clamp(Number(requestedCenter?.x) || WORLD_WIDTH / 2, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2),
    y: clamp(Number(requestedCenter?.y) || WORLD_HEIGHT / 2, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2)
  };
  const baseZ = Number.isFinite(Number(zStart)) ? Number(zStart) : 1;
  for (let index = 0; index < COOL_JPEGS_FRONT_IMAGES.length; index += 1) {
    const cardId = `${cardIdPrefix}-${String(index + 1).padStart(3, '0')}`;
    deck[cardId] = {
      x: center.x,
      y: center.y,
      z: baseZ + index,
      face: 'back',
      frontSrc: COOL_JPEGS_FRONT_IMAGES[index],
      deckId: nextDeckId,
      inDeck: startInDeck,
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

function getMonsBoardTileFill(row, col) {
  const tileKey = `${row}-${col}`;
  const isCorner = (row === 0 || row === MONS_BOARD_SIZE - 1) && (col === 0 || col === MONS_BOARD_SIZE - 1);
  if (isCorner) {
    return MONS_CORNER_TILE_COLOR;
  }
  if (MONS_SUPER_MANA_SPAWN_TILE_KEYS.has(tileKey)) {
    return MONS_ITEM_TILE_COLOR;
  }
  if (MONS_ITEM_SPAWN_TILE_KEYS.has(tileKey)) {
    return MONS_ITEM_TILE_COLOR;
  }
  return (row + col) % 2 === 0 ? MONS_TILE_LIGHT_COLOR : MONS_TILE_DARK_COLOR;
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

function buildDefaultMonsPieces() {
  const piecesById = {};
  for (const piece of MONS_DEFAULT_PIECES) {
    piecesById[piece.id] = {
      id: piece.id,
      type: piece.type,
      side: piece.side,
      row: piece.row,
      col: piece.col,
      heldItemType: '',
      carriedManaType: '',
      carriedManaId: ''
    };
  }
  return piecesById;
}

function normalizeMonsScoresPayload(payload) {
  return {
    black: Math.max(0, Number(payload?.black) || 0),
    white: Math.max(0, Number(payload?.white) || 0)
  };
}

function normalizeMonsPotionsPayload(payload) {
  return {
    black: Math.max(0, Math.floor(Number(payload?.black) || 0)),
    white: Math.max(0, Math.floor(Number(payload?.white) || 0))
  };
}

function normalizeMonsClaimEntryPayload(entryPayload, fallbackToken = '') {
  const fallbackTokenValue = typeof fallbackToken === 'string' ? fallbackToken.trim() : '';
  const tokenRaw =
    typeof entryPayload === 'string'
      ? entryPayload
      : typeof entryPayload?.token === 'string' && entryPayload.token
        ? entryPayload.token
        : fallbackTokenValue;
  const token = String(tokenRaw || '').trim();
  if (!token) {
    return null;
  }
  const name =
    typeof entryPayload === 'object' && entryPayload
      ? String(entryPayload.name || '').trim().slice(0, 24)
      : '';
  const colorRaw =
    typeof entryPayload === 'object' && entryPayload && typeof entryPayload.color === 'string'
      ? entryPayload.color
      : '#ff7a59';
  return {
    token,
    name,
    color: normalizeHexColor(colorRaw)
  };
}

function normalizeMonsSideClaimsPayload(payload) {
  const normalizedEntries = [];
  const seenTokens = new Set();
  const sourceEntries = [];
  if (Array.isArray(payload)) {
    sourceEntries.push(...payload);
  } else if (payload && typeof payload === 'object') {
    for (const [claimId, claimPayload] of Object.entries(payload)) {
      if (claimPayload && typeof claimPayload === 'object') {
        sourceEntries.push({
          ...claimPayload,
          token:
            typeof claimPayload.token === 'string' && claimPayload.token
              ? claimPayload.token
              : claimId
        });
      } else {
        sourceEntries.push(claimId);
      }
    }
  }
  for (const entryPayload of sourceEntries) {
    const entry = normalizeMonsClaimEntryPayload(entryPayload);
    if (!entry || seenTokens.has(entry.token)) {
      continue;
    }
    seenTokens.add(entry.token);
    normalizedEntries.push(entry);
    if (normalizedEntries.length >= 2) {
      break;
    }
  }
  return normalizedEntries;
}

function normalizeMonsClaimsPayload(payload) {
  return {
    black: normalizeMonsSideClaimsPayload(payload?.black),
    white: normalizeMonsSideClaimsPayload(payload?.white)
  };
}

function getMonsSideClaimEntries(gamePayload, side) {
  const normalizedSide = side === 'black' ? 'black' : side === 'white' ? 'white' : '';
  if (!normalizedSide) {
    return [];
  }
  const claims = normalizeMonsClaimsPayload(gamePayload?.claims);
  return claims[normalizedSide];
}

function doesMonsGameHaveAnyClaims(gamePayload) {
  const claims = normalizeMonsClaimsPayload(gamePayload?.claims);
  return claims.black.length > 0 || claims.white.length > 0;
}

function isLocalPlayerClaimedForMonsSide(gamePayload, side) {
  if (!localPlayerToken) {
    return false;
  }
  const sideClaims = getMonsSideClaimEntries(gamePayload, side);
  return sideClaims.some((entry) => entry.token === localPlayerToken);
}

function getLocalPlayerClaimedMonsSide(gamePayload) {
  if (!localPlayerToken) {
    return '';
  }
  if (isLocalPlayerClaimedForMonsSide(gamePayload, 'black')) {
    return 'black';
  }
  if (isLocalPlayerClaimedForMonsSide(gamePayload, 'white')) {
    return 'white';
  }
  return '';
}

function canCurrentPlayerControlMonsPieceFromPayload(gamePayload, piece) {
  if (!piece || typeof piece !== 'object') {
    return false;
  }
  const localClaimedSide = getLocalPlayerClaimedMonsSide(gamePayload);
  const pieceType = typeof piece.type === 'string' ? piece.type : '';
  const pieceSide = piece.side === 'black' ? 'black' : piece.side === 'white' ? 'white' : '';
  if (localClaimedSide) {
    // Once claimed, players can directly control only their side's colored pieces.
    // Neutral pieces (items/super mana) remain ability-target only (e.g. spirit push).
    if (pieceType === 'supermana' || pieceType === 'bombOrPotion') {
      return false;
    }
    if (!pieceSide || pieceSide !== localClaimedSide) {
      return false;
    }
  }
  const side = pieceSide;
  if (!side) {
    return !doesMonsGameHaveAnyClaims(gamePayload);
  }
  const sideClaims = getMonsSideClaimEntries(gamePayload, side);
  if (sideClaims.length === 0) {
    return true;
  }
  if (!localPlayerToken) {
    return false;
  }
  return sideClaims.some((entry) => entry.token === localPlayerToken);
}

function normalizeMonsPiecePayload(piecePayload, fallbackId) {
  const id = typeof piecePayload?.id === 'string' && piecePayload.id ? piecePayload.id : fallbackId;
  const type = typeof piecePayload?.type === 'string' && MONS_PIECE_ASSET_BY_TYPE[piecePayload.type] ? piecePayload.type : 'mana';
  const baseType = getMonsBaseTypeFromRenderType(type);
  const sideRaw = typeof piecePayload?.side === 'string' ? piecePayload.side : '';
  const side = sideRaw === 'black' || sideRaw === 'neutral' ? sideRaw : 'white';
  const nextRow = Number(piecePayload?.row);
  const nextCol = Number(piecePayload?.col);
  const heldItemTypeRaw = typeof piecePayload?.heldItemType === 'string' ? piecePayload.heldItemType : '';
  const heldItemType = MONS_MON_BASE_TYPES.has(baseType) && heldItemTypeRaw === 'bomb' ? 'bomb' : '';
  const carriedManaTypeRaw = typeof piecePayload?.carriedManaType === 'string' ? piecePayload.carriedManaType : '';
  const carriedManaType =
    baseType === 'drainer' && (carriedManaTypeRaw === 'mana' || carriedManaTypeRaw === 'manaB' || carriedManaTypeRaw === 'supermana')
      ? carriedManaTypeRaw
      : '';
  const carriedManaIdRaw = typeof piecePayload?.carriedManaId === 'string' ? piecePayload.carriedManaId.trim() : '';
  const carriedManaId = carriedManaType ? carriedManaIdRaw || (carriedManaType === 'supermana' ? 'super-mana' : `${id}-${carriedManaType}`) : '';
  return {
    id,
    type,
    side,
    row: Number.isFinite(nextRow) ? clamp(Math.round(nextRow), 0, MONS_BOARD_SIZE - 1) : 0,
    col: Number.isFinite(nextCol) ? clamp(Math.round(nextCol), 0, MONS_BOARD_SIZE - 1) : 0,
    faintedByAttack: piecePayload?.faintedByAttack === true,
    heldItemType,
    carriedManaType,
    carriedManaId
  };
}

function normalizeMonsPiecesPayload(payload) {
  const entries = [];
  const hasExplicitObjectPayload = Boolean(payload && typeof payload === 'object');
  if (payload && typeof payload === 'object') {
    for (const [pieceId, piecePayload] of Object.entries(payload)) {
      if (!piecePayload || typeof piecePayload !== 'object') {
        continue;
      }
      entries.push(normalizeMonsPiecePayload(piecePayload, pieceId));
    }
  }
  if (hasExplicitObjectPayload && Object.keys(payload || {}).length === 0) {
    return {};
  }
  if (entries.length === 0) {
    return buildDefaultMonsPieces();
  }
  const piecesById = {};
  for (const piece of entries) {
    piecesById[piece.id] = piece;
  }
  return piecesById;
}

function normalizeMonsLastMovePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const row = Number(payload.row);
  const col = Number(payload.col);
  if (!Number.isFinite(row) || !Number.isFinite(col)) {
    return null;
  }
  const actionRaw = typeof payload.action === 'string' ? payload.action : '';
  const action =
    actionRaw === 'spirit' || actionRaw === 'demon' || actionRaw === 'mystic' || actionRaw === 'bomb' || actionRaw === 'move'
      ? actionRaw
      : 'move';
  const targetRow = Number(payload.targetRow);
  const targetCol = Number(payload.targetCol);
  const toRow = Number(payload.toRow);
  const toCol = Number(payload.toCol);
  const fromRow = Number(payload.fromRow);
  const fromCol = Number(payload.fromCol);
  const scoredPieceTypeRaw = typeof payload.scoredPieceType === 'string' ? payload.scoredPieceType : '';
  const scoredPieceType = MONS_PIECE_ASSET_BY_TYPE[scoredPieceTypeRaw] ? scoredPieceTypeRaw : '';
  return {
    row: clamp(Math.round(row), 0, MONS_BOARD_SIZE - 1),
    col: clamp(Math.round(col), 0, MONS_BOARD_SIZE - 1),
    action,
    side: payload.side === 'black' ? 'black' : 'white',
    pieceId: typeof payload.pieceId === 'string' ? payload.pieceId : '',
    type: typeof payload.type === 'string' ? payload.type : '',
    targetRow: Number.isFinite(targetRow) ? clamp(Math.round(targetRow), 0, MONS_BOARD_SIZE - 1) : null,
    targetCol: Number.isFinite(targetCol) ? clamp(Math.round(targetCol), 0, MONS_BOARD_SIZE - 1) : null,
    fromRow: Number.isFinite(fromRow) ? clamp(Math.round(fromRow), 0, MONS_BOARD_SIZE - 1) : null,
    fromCol: Number.isFinite(fromCol) ? clamp(Math.round(fromCol), 0, MONS_BOARD_SIZE - 1) : null,
    toRow: Number.isFinite(toRow) ? clamp(Math.round(toRow), 0, MONS_BOARD_SIZE - 1) : null,
    toCol: Number.isFinite(toCol) ? clamp(Math.round(toCol), 0, MONS_BOARD_SIZE - 1) : null,
    scoredPieceType
  };
}

function normalizeMonsUndoSnapshotPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const moveTickRaw = Number(payload.moveTick);
  const actorPlayerToken =
    typeof payload.actorPlayerToken === 'string' && payload.actorPlayerToken ? payload.actorPlayerToken : '';
  const actorClientId = typeof payload.actorClientId === 'string' && payload.actorClientId ? payload.actorClientId : '';
  const createdAtRaw = Number(payload.createdAt);
  return {
    pieces: normalizeMonsPiecesPayload(payload.pieces),
    scores: normalizeMonsScoresPayload(payload.scores),
    potions: normalizeMonsPotionsPayload(payload.potions),
    moveTick: Number.isFinite(moveTickRaw) ? moveTickRaw : 0,
    lastMove: normalizeMonsLastMovePayload(payload.lastMove),
    actorPlayerToken,
    actorClientId,
    createdAt: Number.isFinite(createdAtRaw) ? createdAtRaw : 0
  };
}

function normalizeMonsUndoHistoryPayload(payload) {
  const entries = [];
  if (!payload || typeof payload !== 'object') {
    return entries;
  }
  const sourceEntries = Array.isArray(payload) ? payload : Object.values(payload);
  for (const entryPayload of sourceEntries) {
    const entry = normalizeMonsUndoSnapshotPayload(entryPayload);
    if (!entry || !entry.pieces || !entry.scores || !entry.potions) {
      continue;
    }
    entries.push(entry);
  }
  if (entries.length <= MONS_UNDO_HISTORY_LIMIT) {
    return entries;
  }
  return entries.slice(entries.length - MONS_UNDO_HISTORY_LIMIT);
}

function buildMonsUndoSnapshotPayloadFromGame(gamePayload, actorPlayerToken = '', actorClientId = '') {
  if (!gamePayload || typeof gamePayload !== 'object') {
    return null;
  }
  const normalized = normalizeMonsGamePayload(gamePayload);
  return {
    pieces: normalizeMonsPiecesPayload(normalized.pieces),
    scores: normalizeMonsScoresPayload(normalized.scores),
    potions: normalizeMonsPotionsPayload(normalized.potions),
    moveTick: Number(normalized.moveTick) || 0,
    lastMove: normalizeMonsLastMovePayload(normalized.lastMove),
    actorPlayerToken: typeof actorPlayerToken === 'string' && actorPlayerToken ? actorPlayerToken : '',
    actorClientId: typeof actorClientId === 'string' && actorClientId ? actorClientId : '',
    createdAt: Date.now()
  };
}

function appendMonsUndoHistoryEntry(historyPayload, entryPayload) {
  const entry = normalizeMonsUndoSnapshotPayload(entryPayload);
  if (!entry) {
    return normalizeMonsUndoHistoryPayload(historyPayload);
  }
  const history = normalizeMonsUndoHistoryPayload(historyPayload);
  history.push(entry);
  if (history.length <= MONS_UNDO_HISTORY_LIMIT) {
    return history;
  }
  return history.slice(history.length - MONS_UNDO_HISTORY_LIMIT);
}

function canCurrentPlayerUndoMonsEntry(entryPayload) {
  if (!entryPayload || typeof entryPayload !== 'object') {
    return false;
  }
  const actorPlayerToken =
    typeof entryPayload.actorPlayerToken === 'string' && entryPayload.actorPlayerToken
      ? entryPayload.actorPlayerToken
      : '';
  const actorClientId =
    typeof entryPayload.actorClientId === 'string' && entryPayload.actorClientId ? entryPayload.actorClientId : '';
  if (actorPlayerToken) {
    return Boolean(localPlayerToken) && actorPlayerToken === localPlayerToken;
  }
  if (actorClientId) {
    return Boolean(localClientId) && actorClientId === localClientId;
  }
  return false;
}

function normalizeMonsGamePayload(payload) {
  const nextWidth = Number(payload?.width);
  const nextHeight = Number(payload?.height);
  const width = Number.isFinite(nextWidth) ? clamp(nextWidth, 560, WORLD_WIDTH) : MONS_BOARD_WORLD_WIDTH;
  const height = Number.isFinite(nextHeight) ? clamp(nextHeight, 620, WORLD_HEIGHT) : MONS_BOARD_WORLD_HEIGHT;
  const nextX = Number(payload?.x);
  const nextY = Number(payload?.y);
  const nextMoveTick = Number(payload?.moveTick);
  const holderClientId = typeof payload?.holderClientId === 'string' && payload.holderClientId ? payload.holderClientId : null;
  const flipped = payload?.flipped === true;
  return {
    enabled: payload?.enabled !== false,
    x: Number.isFinite(nextX) ? clamp(nextX, width / 2, WORLD_WIDTH - width / 2) : WORLD_WIDTH / 2,
    y: Number.isFinite(nextY) ? clamp(nextY, height / 2, WORLD_HEIGHT - height / 2) : WORLD_HEIGHT / 2,
    width,
    height,
    pieces: normalizeMonsPiecesPayload(payload?.pieces),
    scores: normalizeMonsScoresPayload(payload?.scores),
    potions: normalizeMonsPotionsPayload(payload?.potions),
    claims: normalizeMonsClaimsPayload(payload?.claims),
    moveTick: Number.isFinite(nextMoveTick) ? nextMoveTick : 0,
    lastMove: normalizeMonsLastMovePayload(payload?.lastMove),
    undoHistory: normalizeMonsUndoHistoryPayload(payload?.undoHistory),
    holderClientId,
    flipped
  };
}

function buildFreshMonsGamePayload(options = {}) {
  const nextWidth = Number(options?.width);
  const nextHeight = Number(options?.height);
  const width = Number.isFinite(nextWidth) ? clamp(nextWidth, 560, WORLD_WIDTH) : MONS_BOARD_WORLD_WIDTH;
  const height = Number.isFinite(nextHeight) ? clamp(nextHeight, 620, WORLD_HEIGHT) : MONS_BOARD_WORLD_HEIGHT;
  const nextX = Number(options?.x);
  const nextY = Number(options?.y);
  const flipped = options?.flipped === true;
  return {
    enabled: true,
    x: Number.isFinite(nextX) ? clamp(nextX, width / 2, WORLD_WIDTH - width / 2) : WORLD_WIDTH / 2,
    y: Number.isFinite(nextY) ? clamp(nextY, height / 2, WORLD_HEIGHT - height / 2) : WORLD_HEIGHT / 2,
    width,
    height,
    pieces: buildDefaultMonsPieces(),
    scores: {
      black: 0,
      white: 0
    },
    potions: {
      black: 0,
      white: 0
    },
    claims: normalizeMonsClaimsPayload(options?.claims),
    moveTick: 0,
    lastMove: null,
    undoHistory: [],
    holderClientId: null,
    flipped,
    updatedAt: Date.now()
  };
}

function getDeckCardIds(deckId = activeDeckId) {
  const normalizedDeckId = normalizeDeckId(deckId);
  const ids = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (cardState.inDeck && normalizeDeckId(cardState.deckId) === normalizedDeckId) {
      ids.push(cardId);
    }
  }
  return ids;
}

function getDiscardCardIds(deckId = activeDeckId) {
  const normalizedDeckId = normalizeDeckId(deckId);
  const ids = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (cardState.inDiscard && normalizeDeckId(cardState.deckId) === normalizedDeckId) {
      ids.push(cardId);
    }
  }
  return ids;
}

function getAuctionCardIds(deckId = activeDeckId) {
  const normalizedDeckId = normalizeDeckId(deckId);
  const ids = [];
  for (const [cardId, cardState] of cards.entries()) {
    if (cardState.inAuction && normalizeDeckId(cardState.deckId) === normalizedDeckId) {
      ids.push(cardId);
    }
  }
  return ids;
}

function toHighResFrontSrc(src) {
  if (typeof src !== 'string') {
    return COOL_JPEGS_FRONT_IMAGES[0];
  }
  const trimmedSrc = src.trim();
  if (!trimmedSrc) {
    return COOL_JPEGS_FRONT_IMAGES[0];
  }
  if (trimmedSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX)) {
    return trimmedSrc;
  }
  if (trimmedSrc.startsWith(CARD_FRONT_LOW_RES_PREFIX)) {
    return `${CARD_FRONT_HIGH_RES_PREFIX}${trimmedSrc.slice(CARD_FRONT_LOW_RES_PREFIX.length)}`;
  }
  return trimmedSrc;
}

function toLowResFrontSrc(src) {
  const highResSrc = toHighResFrontSrc(src);
  if (highResSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX)) {
    return highResSrc.replace(CARD_FRONT_HIGH_RES_PREFIX, CARD_FRONT_LOW_RES_PREFIX);
  }
  return highResSrc;
}

function resolveFrontVariantSources(frontSrc, cardScreenWidth) {
  const highResSrc = toHighResFrontSrc(frontSrc);
  if (!highResSrc.startsWith(CARD_FRONT_HIGH_RES_PREFIX)) {
    return {
      preferredSrc: highResSrc,
      fallbackSrc: ''
    };
  }
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
  setFrontImagePendingLoadCount(frontImagePendingLoadCount + 1);
  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    let settled = false;
    const finalize = (loaded) => {
      if (settled) {
        return;
      }
      settled = true;
      frontImageLoadState.set(src, loaded ? 'loaded' : 'error');
      frontImagePromises.delete(src);
      setFrontImagePendingLoadCount(frontImagePendingLoadCount - 1);
      resolve(loaded);
    };
    image.onload = () => {
      finalize(true);
    };
    image.onerror = () => {
      finalize(false);
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

function getDeckTopZ(deckId = activeDeckId) {
  const normalizedDeckId = normalizeDeckId(deckId);
  let maxZ = 1;
  for (const cardState of cards.values()) {
    if (cardState.inDeck && normalizeDeckId(cardState.deckId) === normalizedDeckId) {
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

function markTopDeckShuffleDarkening(deckId = deckShuffleFxDeckId) {
  clearTopDeckShuffleDarkening();
  const targetDeckId = normalizeDeckId(deckId);
  let topCardId = '';
  let topZ = -Infinity;
  for (const [cardId, cardState] of cards.entries()) {
    if (!cardState?.inDeck || normalizeDeckId(cardState.deckId) !== targetDeckId) {
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

function triggerDeckShuffleFx(deckId = activeDeckId) {
  deckShuffleFxDeckId = normalizeDeckId(deckId);
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
  markTopDeckShuffleDarkening(deckShuffleFxDeckId);

  renderDeckControls();
  deckShuffleFxTimerId = window.setTimeout(() => {
    setDeckShuffleFxActive(false);
  }, DECK_SHUFFLE_FX_DURATION_MS);
}

function renderDeckShuffleFx(deckId, deckScreen, cardScreenWidth, cardScreenHeight) {
  ensureDeckShuffleFxElements();
  if (!deckShuffleFxCards.length) {
    return;
  }

  const targetDeckId = normalizeDeckId(deckId);
  const targetDeckState = getDeckStateById(targetDeckId);
  if (!deckShuffleFxActive || !targetDeckState) {
    setDeckShuffleFxActive(false);
    return;
  }

  const topDeckZ = getDeckTopZ(targetDeckId);
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

function ensureDeckDropIndicators() {
  if (!tableRoot) {
    return false;
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

  return true;
}

function removeDeckUi(deckId) {
  const normalizedDeckId = normalizeDeckId(deckId);
  const deckUi = deckUiById.get(normalizedDeckId);
  if (!deckUi) {
    return;
  }
  for (const element of [
    deckUi.shuffleButton,
    deckUi.dealOneButton,
    deckUi.moveButton,
    deckUi.optionsButton,
    deckUi.discardResetButton,
    deckUi.discardSlot,
    deckUi.auctionSlot,
    deckUi.deckCountBadge
  ]) {
    element?.remove();
  }
  deckUiById.delete(normalizedDeckId);
  if (getDeckIdFromGameOptionsTarget(activeGameOptionsTarget) === normalizedDeckId) {
    closeGameOptionsMenu();
  }
}

function hideDeckUi(deckUi) {
  if (!deckUi) {
    return;
  }
  for (const control of [
    deckUi.shuffleButton,
    deckUi.dealOneButton,
    deckUi.moveButton,
    deckUi.optionsButton,
    deckUi.discardResetButton
  ]) {
    control?.classList.add('hidden');
    control?.classList.remove('is-pressing');
    control?.classList.remove('is-held-by-self');
    control?.classList.remove('is-group-selected');
  }
  deckUi.discardSlot?.classList.add('hidden');
  deckUi.auctionSlot?.classList.add('hidden');
  deckUi.deckCountBadge?.classList.add('hidden');
}

function ensureDeckControlElements(deckId = activeDeckId) {
  if (!tableRoot || !ensureDeckDropIndicators()) {
    return null;
  }

  const normalizedDeckId = normalizeDeckId(deckId);
  const existingDeckUi = deckUiById.get(normalizedDeckId);
  if (existingDeckUi) {
    if (
      existingDeckUi.shuffleButton?.isConnected &&
      existingDeckUi.discardSlot?.isConnected &&
      existingDeckUi.auctionSlot?.isConnected
    ) {
      return existingDeckUi;
    }
    removeDeckUi(normalizedDeckId);
  }

  const shuffleButton = document.createElement('button');
  shuffleButton.type = 'button';
  shuffleButton.className = 'deck-control-button deck-shuffle-button hidden';
  shuffleButton.dataset.stackScope = 'deck';
  shuffleButton.dataset.deckId = normalizedDeckId;
  shuffleButton.setAttribute('aria-label', 'shuffle deck');
  shuffleButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 7C5.2 5.1 7.4 4 10 4C13.8 4 16.8 6.7 17.6 10.2M20 8V12H16M20 17C18.8 18.9 16.6 20 14 20C10.2 20 7.2 17.3 6.4 13.8M4 16V12H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  shuffleButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      return;
    }
    shuffleButton.classList.remove('is-pressing');
    void shuffleButton.offsetWidth;
    shuffleButton.classList.add('is-pressing');
    shuffleCoolJpegsDeck(normalizedDeckId).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  });
  shuffleButton.addEventListener('animationend', (event) => {
    if (event.animationName === 'deckShufflePress') {
      shuffleButton.classList.remove('is-pressing');
    }
  });
  shieldPointerEvents(shuffleButton);
  tableRoot.appendChild(shuffleButton);

  const dealOneButton = document.createElement('button');
  dealOneButton.type = 'button';
  dealOneButton.className = 'deck-control-button deck-deal-button hidden';
  dealOneButton.dataset.stackScope = 'deck';
  dealOneButton.dataset.deckId = normalizedDeckId;
  dealOneButton.setAttribute('aria-label', 'deal one card to each player');
  dealOneButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4.8 12H10.8M7.8 9V15M15.8 8.3V16M14.5 9.6L15.8 8.3L17.1 9.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  dealOneButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      return;
    }
    if (dealOneButton.disabled) {
      return;
    }
    dealOneCardEach(normalizedDeckId).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  });
  shieldPointerEvents(dealOneButton);
  tableRoot.appendChild(dealOneButton);

  const moveButton = document.createElement('button');
  moveButton.type = 'button';
  moveButton.className = 'deck-control-button deck-move-button hidden';
  moveButton.dataset.stackScope = 'deck';
  moveButton.dataset.deckId = normalizedDeckId;
  moveButton.setAttribute('aria-label', 'move deck');
  moveButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 8H19M5 12H19M5 16H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  moveButton.addEventListener('pointerdown', (event) => {
    onDeckMovePointerDown(event, normalizedDeckId);
  });
  shieldPointerEvents(moveButton);
  tableRoot.appendChild(moveButton);

  const optionsButton = document.createElement('button');
  optionsButton.type = 'button';
  optionsButton.className = 'deck-control-button deck-options-button hidden';
  optionsButton.dataset.stackScope = 'deck';
  optionsButton.dataset.deckId = normalizedDeckId;
  optionsButton.setAttribute('aria-label', 'cool jpegs options');
  optionsButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="6.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="17.5" cy="12" r="1.7"/></svg>';
  optionsButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      return;
    }
    openGameOptionsMenu(DECK_KEY, normalizedDeckId);
  });
  shieldPointerEvents(optionsButton);
  tableRoot.appendChild(optionsButton);

  const discardResetButton = document.createElement('button');
  discardResetButton.type = 'button';
  discardResetButton.className = 'deck-control-button discard-reset-button hidden';
  discardResetButton.dataset.stackScope = 'deck';
  discardResetButton.dataset.deckId = normalizedDeckId;
  discardResetButton.setAttribute('aria-label', 'return discard to deck');
  discardResetButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12H17.5M13 7.5L17.5 12L13 16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  discardResetButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      return;
    }
    reclaimDiscardToDeck(normalizedDeckId).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  });
  shieldPointerEvents(discardResetButton);
  tableRoot.appendChild(discardResetButton);

  const discardSlot = document.createElement('div');
  discardSlot.className = 'discard-slot hidden';
  discardSlot.dataset.deckId = normalizedDeckId;
  discardSlot.setAttribute('aria-hidden', 'true');
  tableRoot.appendChild(discardSlot);

  const discardLabel = document.createElement('span');
  discardLabel.className = 'discard-slot-label';
  discardLabel.textContent = 'discard';
  discardSlot.appendChild(discardLabel);

  const auctionSlot = document.createElement('div');
  auctionSlot.className = 'auction-slot hidden';
  auctionSlot.dataset.deckId = normalizedDeckId;
  auctionSlot.setAttribute('aria-hidden', 'true');
  tableRoot.appendChild(auctionSlot);

  const auctionLabel = document.createElement('img');
  auctionLabel.className = 'auction-slot-icon';
  auctionLabel.src = './assets/auction.svg';
  auctionLabel.alt = 'auction';
  auctionLabel.draggable = false;
  auctionSlot.appendChild(auctionLabel);

  const deckCountBadge = document.createElement('div');
  deckCountBadge.className = 'deck-count-badge hidden';
  deckCountBadge.dataset.deckId = normalizedDeckId;
  deckCountBadge.setAttribute('aria-hidden', 'true');
  deckCountBadge.textContent = '0';
  tableRoot.appendChild(deckCountBadge);

  const deckUi = {
    deckId: normalizedDeckId,
    shuffleButton,
    dealOneButton,
    moveButton,
    optionsButton,
    discardResetButton,
    discardSlot,
    discardLabel,
    auctionSlot,
    auctionLabel,
    deckCountBadge
  };
  deckUiById.set(normalizedDeckId, deckUi);
  return deckUi;
}

function hideAllDeckUiElements() {
  if (!tableRoot) {
    return;
  }
  for (const deckUi of deckUiById.values()) {
    hideDeckUi(deckUi);
  }
  deckDropIndicator?.classList.add('hidden');
  deckDropIndicator?.classList.remove('is-visible');
  discardDropIndicator?.classList.add('hidden');
  discardDropIndicator?.classList.remove('is-visible');
  auctionDropIndicator?.classList.add('hidden');
  auctionDropIndicator?.classList.remove('is-visible');
}

function removeAllDeckUiArtifacts() {
  for (const deckId of Array.from(deckUiById.keys())) {
    removeDeckUi(deckId);
  }
  deckUiById.clear();
  deckDropIndicator?.remove();
  deckDropIndicator = null;
  discardDropIndicator?.remove();
  discardDropIndicator = null;
  auctionDropIndicator?.remove();
  auctionDropIndicator = null;
  if (tableRoot) {
    for (const node of tableRoot.querySelectorAll('.deck-control-button[data-stack-scope="deck"], .discard-slot, .auction-slot, .deck-count-badge, .deck-drop-indicator, .discard-drop-indicator, .auction-drop-indicator')) {
      node.remove();
    }
  }
}

function renderDeckControls() {
  ensureDeckDropIndicators();
  const deckIds = getDeckIdsInRoom().map((deckId) => normalizeDeckId(deckId));
  const renderedDeckIds = new Set();
  let hasVisibleDeck = false;
  const controlSize = DECK_CONTROL_SIZE;
  const controlGap = DECK_CONTROL_GAP;
  const cardScreenWidth = snapToDevicePixel(CARD_WIDTH * camera.scale);
  const cardScreenHeight = (cardScreenWidth * CARD_HEIGHT) / CARD_WIDTH;
  const auctionSlotScreenWidth = snapToDevicePixel((CARD_WIDTH + AUCTION_SLOT_EXTRA_SIZE) * camera.scale);
  const auctionSlotScreenHeight = snapToDevicePixel((CARD_HEIGHT + AUCTION_SLOT_EXTRA_SIZE) * camera.scale);
  const auctionCardScreenHeight = snapToDevicePixel(CARD_HEIGHT * AUCTION_CARD_SCALE * camera.scale);
  const auctionIconOccupiedSize = snapToDevicePixel(controlSize * 0.82, 14);
  const controlsXOffset = controlSize + controlGap;
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

  for (const deckId of deckIds) {
    const targetDeckState = getDeckStateById(deckId);
    const inDeckCount = getDeckCardIds(deckId).length;
    const inDiscardCount = getDiscardCardIds(deckId).length;
    const inAuctionCount = getAuctionCardIds(deckId).length;
    const hasCards = inDeckCount > 0 || inDiscardCount > 0 || inAuctionCount > 0;
    if (!targetDeckState || !hasCards) {
      const staleDeckUi = deckUiById.get(deckId);
      if (staleDeckUi) {
        hideDeckUi(staleDeckUi);
      }
      if (!hasCards && getDeckIdFromGameOptionsTarget(activeGameOptionsTarget) === deckId) {
        closeGameOptionsMenu();
      }
      if (!targetDeckState && staleDeckUi) {
        removeDeckUi(deckId);
      }
      continue;
    }

    const deckUi = ensureDeckControlElements(deckId);
    if (!deckUi) {
      continue;
    }

    hasVisibleDeck = true;
    renderedDeckIds.add(deckId);

    const deckScreen = worldToScreen({ x: targetDeckState.x, y: targetDeckState.y });
    const discardScreen = worldToScreen(getDiscardCenterPosition(deckId));
    const auctionScreen = worldToScreen(getAuctionCenterPosition(deckId));
    const controlsY = deckScreen.y + cardScreenHeight / 2 + DECK_COUNT_OFFSET_Y;

    deckUi.shuffleButton.classList.remove('hidden');
    deckUi.shuffleButton.style.left = `${deckScreen.x - controlsXOffset}px`;
    deckUi.shuffleButton.style.top = `${controlsY}px`;
    deckUi.shuffleButton.style.width = `${controlSize}px`;
    deckUi.shuffleButton.style.height = `${controlSize}px`;

    const dealTargetTokens = getActivePlayerTokensForDeal();
    const canDealToAllPlayers = dealTargetTokens.length > 0 && inDeckCount >= dealTargetTokens.length;
    deckUi.dealOneButton.classList.remove('hidden');
    deckUi.dealOneButton.style.left = `${deckScreen.x + controlsXOffset}px`;
    deckUi.dealOneButton.style.top = `${controlsY}px`;
    deckUi.dealOneButton.style.width = `${controlSize}px`;
    deckUi.dealOneButton.style.height = `${controlSize}px`;
    deckUi.dealOneButton.disabled = !canDealToAllPlayers;
    deckUi.dealOneButton.classList.toggle('is-disabled', !canDealToAllPlayers);

    deckUi.moveButton.classList.remove('hidden');
    deckUi.moveButton.style.left = `${auctionScreen.x + auctionSlotScreenWidth / 2 + controlGap + controlSize / 2 + 15}px`;
    deckUi.moveButton.style.top = `${auctionScreen.y + auctionSlotScreenHeight / 2 - controlSize / 2}px`;
    deckUi.moveButton.style.width = `${controlSize}px`;
    deckUi.moveButton.style.height = `${controlSize}px`;
    deckUi.moveButton.classList.toggle('is-held-by-self', targetDeckState.holderClientId === localClientId);
    deckUi.moveButton.classList.toggle('is-group-selected', selectedDeckIds.has(deckId));

    deckUi.optionsButton.classList.remove('hidden');
    deckUi.optionsButton.style.left = deckUi.moveButton.style.left;
    deckUi.optionsButton.style.top = `${auctionScreen.y + auctionSlotScreenHeight / 2 - (controlSize * 1.5 + controlGap)}px`;
    deckUi.optionsButton.style.width = `${controlSize}px`;
    deckUi.optionsButton.style.height = `${controlSize}px`;

    const discardResetVisible = inDiscardCount > 0;
    deckUi.discardResetButton.classList.toggle('hidden', !discardResetVisible);
    if (discardResetVisible) {
      deckUi.discardResetButton.style.left = `${discardScreen.x - cardScreenWidth / 2 - controlGap - controlSize / 2}px`;
      deckUi.discardResetButton.style.top = `${discardScreen.y - cardScreenHeight / 2 + controlSize / 2}px`;
      deckUi.discardResetButton.style.width = `${controlSize}px`;
      deckUi.discardResetButton.style.height = `${controlSize}px`;
    }

    const discardHovered = discardDropIndicatorVisible && discardDropIndicatorDeckId === deckId;
    deckUi.discardSlot.classList.remove('hidden');
    deckUi.discardSlot.style.left = `${discardScreen.x}px`;
    deckUi.discardSlot.style.top = `${discardScreen.y}px`;
    deckUi.discardSlot.style.width = `${cardScreenWidth}px`;
    deckUi.discardSlot.style.height = `${cardScreenHeight}px`;
    deckUi.discardSlot.classList.toggle('is-empty', inDiscardCount === 0);
    deckUi.discardSlot.classList.toggle('is-hovered', discardHovered);
    deckUi.discardLabel.classList.toggle('hidden', inDiscardCount > 0);

    const auctionHovered = auctionDropIndicatorVisible && auctionDropIndicatorDeckId === deckId;
    deckUi.auctionSlot.classList.remove('hidden');
    deckUi.auctionSlot.style.left = `${auctionScreen.x}px`;
    deckUi.auctionSlot.style.top = `${auctionScreen.y}px`;
    deckUi.auctionSlot.style.width = `${auctionSlotScreenWidth}px`;
    deckUi.auctionSlot.style.height = `${auctionSlotScreenHeight}px`;
    deckUi.auctionSlot.style.setProperty(
      '--auction-icon-occupied-top',
      `${auctionSlotScreenHeight / 2 + auctionCardScreenHeight / 2 + DECK_COUNT_OFFSET_Y}px`
    );
    deckUi.auctionSlot.style.setProperty('--auction-icon-occupied-size', `${auctionIconOccupiedSize}px`);
    deckUi.auctionSlot.classList.toggle('is-empty', inAuctionCount === 0);
    deckUi.auctionSlot.classList.toggle('is-hovered', auctionHovered);
    deckUi.auctionSlot.classList.toggle('is-occupied', inAuctionCount > 0);
    deckUi.auctionLabel.classList.remove('hidden');

    deckUi.deckCountBadge.classList.remove('hidden');
    deckUi.deckCountBadge.style.left = `${deckScreen.x}px`;
    deckUi.deckCountBadge.style.top = `${controlsY}px`;
    deckUi.deckCountBadge.textContent = String(inDeckCount);
  }

  for (const existingDeckId of Array.from(deckUiById.keys())) {
    if (renderedDeckIds.has(existingDeckId)) {
      continue;
    }
    const staleUi = deckUiById.get(existingDeckId);
    if (staleUi) {
      hideDeckUi(staleUi);
    }
    if (
      !deckStatesById.has(existingDeckId) &&
      getDeckCardIds(existingDeckId).length === 0 &&
      getDiscardCardIds(existingDeckId).length === 0 &&
      getAuctionCardIds(existingDeckId).length === 0
    ) {
      removeDeckUi(existingDeckId);
    }
  }

  const isHandAnchoredDropIndicator = Boolean(handDropIndicatorScreen && handReorderState?.releaseToTable);
  const dropIndicatorOffsetY = isHandAnchoredDropIndicator ? 0 : cardScreenHeight / 2 + DECK_DROP_INDICATOR_OFFSET_Y;

  const applyDropIndicator = (indicator, visible, targetScreen) => {
    if (!indicator || !visible || !targetScreen || !hasVisibleDeck) {
      indicator?.classList.add('hidden');
      indicator?.classList.remove('is-visible');
      return;
    }
    const screen = isHandAnchoredDropIndicator && handDropIndicatorScreen ? handDropIndicatorScreen : targetScreen;
    indicator.style.left = `${screen.x}px`;
    indicator.style.top = `${screen.y - dropIndicatorOffsetY}px`;
    indicator.classList.remove('hidden');
    indicator.classList.add('is-visible');
  };

  const deckDropTargetState = deckDropIndicatorDeckId ? getDeckStateById(deckDropIndicatorDeckId) : null;
  const deckDropTargetScreen = deckDropTargetState
    ? worldToScreen({ x: deckDropTargetState.x, y: deckDropTargetState.y })
    : null;
  const discardDropTargetScreen = discardDropIndicatorDeckId
    ? worldToScreen(getDiscardCenterPosition(discardDropIndicatorDeckId))
    : null;
  const auctionDropTargetScreen = auctionDropIndicatorDeckId
    ? worldToScreen(getAuctionCenterPosition(auctionDropIndicatorDeckId))
    : null;

  applyDropIndicator(deckDropIndicator, deckDropIndicatorVisible, deckDropTargetScreen);
  applyDropIndicator(discardDropIndicator, discardDropIndicatorVisible, discardDropTargetScreen);
  applyDropIndicator(auctionDropIndicator, auctionDropIndicatorVisible, auctionDropTargetScreen);

  if (deckShuffleFxActive) {
    const shuffleDeckId = normalizeDeckId(deckShuffleFxDeckId || activeDeckId);
    const shuffleDeckState = getDeckStateById(shuffleDeckId);
    if (shuffleDeckState && getDeckCardIds(shuffleDeckId).length > 0) {
      const shuffleDeckScreen = worldToScreen({ x: shuffleDeckState.x, y: shuffleDeckState.y });
      renderDeckShuffleFx(shuffleDeckId, shuffleDeckScreen, cardScreenWidth, cardScreenHeight);
    } else {
      setDeckShuffleFxActive(false);
    }
  }

  if (!hasVisibleDeck) {
    deckDropIndicatorVisible = false;
    discardDropIndicatorVisible = false;
    auctionDropIndicatorVisible = false;
    deckDropIndicatorDeckId = '';
    discardDropIndicatorDeckId = '';
    auctionDropIndicatorDeckId = '';
    hideAllDeckUiElements();
    setDeckShuffleFxActive(false);
    if (activeGameOptionsTarget.startsWith('deck:')) {
      closeGameOptionsMenu();
    }
  }
}

function ensureMonsBoardElements() {
  if (!tableRoot || !gameLayer) {
    return;
  }

  if (!monsGameShell) {
    monsGameShell = document.createElement('div');
    monsGameShell.id = 'monsGameShell';
    monsGameShell.className = 'mons-game-shell hidden';
    monsGameShell.setAttribute('aria-label', 'Super Metal Mons board');
    monsGameShell.dataset.drawPassthrough = 'true';
    shieldPointerEvents(monsGameShell, { allowDrawPassthrough: true, allowMiddleMousePan: true });

    monsBoardSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    monsBoardSvg.classList.add('mons-board-svg');
    monsBoardSvg.setAttribute('viewBox', '-0.34 -0.34 11.68 11.68');
    monsBoardSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    monsBoardSvg.setAttribute('aria-label', 'Super Metal Mons board');
    monsBoardSvg.addEventListener('pointerdown', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) {
        return;
      }
      const tileTarget = target.closest('[data-mons-row][data-mons-col]');
      if (!tileTarget) {
        return;
      }
      const row = Number(tileTarget.getAttribute('data-mons-row'));
      const col = Number(tileTarget.getAttribute('data-mons-col'));
      onMonsBoardTilePointerDown(event, row, col);
    });

    monsBoardTilesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    monsBoardTilesLayer.setAttribute('aria-hidden', 'true');
    monsBoardSvg.appendChild(monsBoardTilesLayer);

    monsBoardWavesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    monsBoardWavesLayer.setAttribute('aria-hidden', 'true');
    monsBoardWavesLayer.setAttribute('pointer-events', 'none');
    monsBoardSvg.appendChild(monsBoardWavesLayer);

    monsBoardGhostsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    monsBoardGhostsLayer.setAttribute('aria-hidden', 'true');
    monsBoardGhostsLayer.setAttribute('pointer-events', 'none');
    monsBoardSvg.appendChild(monsBoardGhostsLayer);

    monsBoardPiecesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    monsBoardPiecesLayer.setAttribute('aria-hidden', 'true');
    monsBoardSvg.appendChild(monsBoardPiecesLayer);

    // Keep hints above pieces so ability overlays stay visible.
    monsBoardHintsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    monsBoardHintsLayer.setAttribute('aria-hidden', 'true');
    monsBoardSvg.appendChild(monsBoardHintsLayer);

    monsBoardParticlesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    monsBoardParticlesLayer.setAttribute('aria-hidden', 'true');
    monsBoardSvg.appendChild(monsBoardParticlesLayer);

    for (let row = 0; row < MONS_BOARD_SIZE; row += 1) {
      for (let col = 0; col < MONS_BOARD_SIZE; col += 1) {
        const tile = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tile.setAttribute('x', String(col));
        tile.setAttribute('y', String(row));
        tile.setAttribute('width', '1');
        tile.setAttribute('height', '1');
        tile.setAttribute('data-mons-row', String(row));
        tile.setAttribute('data-mons-col', String(col));
        tile.classList.add('mons-board-tile');
        tile.style.fill = getMonsBoardTileFill(row, col);
        tile.style.cursor = 'pointer';
        monsBoardTilesLayer.appendChild(tile);
      }
    }

    for (let col = 0; col < MONS_BOARD_SIZE; col += 1) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(col + 0.5));
      label.setAttribute('y', '11.26');
      label.setAttribute('text-anchor', 'middle');
      label.classList.add('mons-board-coordinate');
      label.setAttribute('data-mons-axis', 'col');
      label.setAttribute('data-mons-index', String(col));
      label.textContent = getMonsColumnLabelText(col, false);
      monsBoardTilesLayer.appendChild(label);
    }
    for (let row = 0; row < MONS_BOARD_SIZE; row += 1) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '-0.2');
      label.setAttribute('y', String(row + 0.58));
      label.setAttribute('text-anchor', 'middle');
      label.classList.add('mons-board-coordinate');
      label.setAttribute('data-mons-axis', 'row');
      label.setAttribute('data-mons-index', String(row));
      label.textContent = getMonsRowLabelText(row, false);
      monsBoardTilesLayer.appendChild(label);
    }

    monsGameShell.appendChild(monsBoardSvg);

    monsHud = document.createElement('div');
    monsHud.className = 'mons-hud';
    monsHud.setAttribute('aria-label', 'player scores');

    const blackCluster = document.createElement('div');
    blackCluster.className = 'mons-hud-player mons-hud-player-black';
    const blackAvatarWrap = document.createElement('span');
    blackAvatarWrap.className = 'mons-hud-avatar-wrap';
    monsBlackClaimButton = document.createElement('button');
    monsBlackClaimButton.type = 'button';
    monsBlackClaimButton.className = 'mons-hud-avatar-button';
    monsBlackClaimButton.dataset.monsSide = 'black';
    monsBlackClaimButton.addEventListener('click', (event) => {
      onMonsSideClaimClick(event, 'black', activeMonsGameId);
    });
    shieldPointerEvents(monsBlackClaimButton);
    const blackAvatar = document.createElement('img');
    blackAvatar.src = MONS_PIECE_ASSET_BY_TYPE.drainerB;
    blackAvatar.alt = 'black player';
    blackAvatar.draggable = false;
    blackAvatar.className = 'mons-hud-avatar';
    monsBlackClaimButton.appendChild(blackAvatar);
    blackAvatarWrap.appendChild(monsBlackClaimButton);
    monsBlackClaimsList = document.createElement('div');
    monsBlackClaimsList.className = 'mons-side-claims mons-side-claims-black hidden';
    monsPotionsBlackTray = document.createElement('span');
    monsPotionsBlackTray.className = 'mons-hud-potions mons-hud-potions-black';
    monsPotionsBlackTray.setAttribute('aria-hidden', 'true');
    monsScoreBlackLabel = document.createElement('span');
    monsScoreBlackLabel.className = 'mons-hud-score';
    monsScoreBlackLabel.textContent = '0';
    blackCluster.appendChild(monsPotionsBlackTray);
    blackCluster.appendChild(monsScoreBlackLabel);
    blackCluster.appendChild(blackAvatarWrap);

    const whiteCluster = document.createElement('div');
    whiteCluster.className = 'mons-hud-player mons-hud-player-white';
    const whiteAvatarWrap = document.createElement('span');
    whiteAvatarWrap.className = 'mons-hud-avatar-wrap';
    monsWhiteClaimButton = document.createElement('button');
    monsWhiteClaimButton.type = 'button';
    monsWhiteClaimButton.className = 'mons-hud-avatar-button';
    monsWhiteClaimButton.dataset.monsSide = 'white';
    monsWhiteClaimButton.addEventListener('click', (event) => {
      onMonsSideClaimClick(event, 'white', activeMonsGameId);
    });
    shieldPointerEvents(monsWhiteClaimButton);
    const whiteAvatar = document.createElement('img');
    whiteAvatar.src = MONS_PIECE_ASSET_BY_TYPE.drainer;
    whiteAvatar.alt = 'white player';
    whiteAvatar.draggable = false;
    whiteAvatar.className = 'mons-hud-avatar';
    monsWhiteClaimButton.appendChild(whiteAvatar);
    whiteAvatarWrap.appendChild(monsWhiteClaimButton);
    monsWhiteClaimsList = document.createElement('div');
    monsWhiteClaimsList.className = 'mons-side-claims mons-side-claims-white hidden';
    monsPotionsWhiteTray = document.createElement('span');
    monsPotionsWhiteTray.className = 'mons-hud-potions';
    monsPotionsWhiteTray.setAttribute('aria-hidden', 'true');
    monsScoreWhiteLabel = document.createElement('span');
    monsScoreWhiteLabel.className = 'mons-hud-score';
    monsScoreWhiteLabel.textContent = '0';
    whiteCluster.appendChild(whiteAvatarWrap);
    whiteCluster.appendChild(monsScoreWhiteLabel);
    whiteCluster.appendChild(monsPotionsWhiteTray);

    const centerCluster = document.createElement('div');
    centerCluster.className = 'mons-hud-center';
    monsUndoButton = document.createElement('button');
    monsUndoButton.type = 'button';
    monsUndoButton.className = 'mons-undo-button';
    monsUndoButton.setAttribute('aria-label', 'undo last mons move');
    monsUndoButton.innerHTML =
      '<svg viewBox="0 0 512 512" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z" fill="currentColor"/></svg>';
    monsUndoButton.addEventListener('click', (event) => {
      onMonsUndoButtonClick(event);
    });
    shieldPointerEvents(monsUndoButton);
    centerCluster.appendChild(monsUndoButton);

    monsFlipButton = document.createElement('button');
    monsFlipButton.type = 'button';
    monsFlipButton.className = 'mons-flip-button';
    monsFlipButton.setAttribute('aria-label', 'flip super metal mons board');
    monsFlipButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M9 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.8 7.2L9 5L11.2 7.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14.8 16.8L17 19L19.2 16.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    monsFlipButton.addEventListener('click', (event) => {
      onMonsFlipButtonClick(event);
    });
    shieldPointerEvents(monsFlipButton);
    centerCluster.appendChild(monsFlipButton);

    monsHud.appendChild(whiteCluster);
    monsHud.appendChild(centerCluster);
    monsHud.appendChild(blackCluster);
    monsGameShell.appendChild(monsHud);

    gameLayer.appendChild(monsGameShell);
    tableRoot.appendChild(monsBlackClaimsList);
    tableRoot.appendChild(monsWhiteClaimsList);
  }

  if (monsBlackClaimsList && monsBlackClaimsList.parentElement !== tableRoot) {
    tableRoot.appendChild(monsBlackClaimsList);
  }
  if (monsWhiteClaimsList && monsWhiteClaimsList.parentElement !== tableRoot) {
    tableRoot.appendChild(monsWhiteClaimsList);
  }

  ensureMonsCornerWaveLines();
  renderMonsCornerWaves();
  startMonsCornerWaveAnimation();

  if (!monsMoveButton) {
    monsMoveButton = document.createElement('button');
    monsMoveButton.type = 'button';
    monsMoveButton.id = 'monsMoveButton';
    monsMoveButton.className = 'deck-control-button deck-move-button mons-move-button hidden';
    monsMoveButton.dataset.stackScope = 'mons';
    monsMoveButton.setAttribute('aria-label', 'move super metal mons board');
    monsMoveButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 8H19M5 12H19M5 16H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    monsMoveButton.addEventListener('pointerdown', (event) => {
      onMonsMovePointerDown(event);
    });
    shieldPointerEvents(monsMoveButton);
    tableRoot.appendChild(monsMoveButton);
  }

  if (!monsOptionsButton) {
    monsOptionsButton = document.createElement('button');
    monsOptionsButton.type = 'button';
    monsOptionsButton.id = 'monsOptionsButton';
    monsOptionsButton.className = 'deck-control-button deck-options-button mons-options-button hidden';
    monsOptionsButton.dataset.stackScope = 'mons';
    monsOptionsButton.setAttribute('aria-label', 'super metal mons options');
    monsOptionsButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="6.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="17.5" cy="12" r="1.7"/></svg>';
    monsOptionsButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (deleteModeEnabled) {
        return;
      }
      openGameOptionsMenu(MONS_GAME_KEY, activeMonsGameId);
    });
    shieldPointerEvents(monsOptionsButton);
    tableRoot.appendChild(monsOptionsButton);
  }
}

function hideMonsBoardElements() {
  closeMonsItemChoiceModal();
  setMonsBoardDragFloating(false);
  if (monsGameShell) {
    monsGameShell.classList.add('hidden');
  }
  if (monsMoveButton) {
    monsMoveButton.classList.add('hidden');
    monsMoveButton.classList.remove('is-held-by-self');
    monsMoveButton.classList.remove('is-group-selected');
  }
  if (monsOptionsButton) {
    monsOptionsButton.classList.add('hidden');
  }
  if (activeGameOptionsTarget.startsWith('mons:')) {
    closeGameOptionsMenu();
  }
  if (monsBlackClaimsList) {
    monsBlackClaimsList.classList.add('hidden');
  }
  if (monsWhiteClaimsList) {
    monsWhiteClaimsList.classList.add('hidden');
  }
  monsSelectionPieceId = '';
  monsPendingSpiritPush = null;
  monsPendingDemonRebound = null;
  lastRenderedMonsMoveTick = 0;
  stopMonsParticleAnimation();
  stopMonsCornerWaveAnimation();
}

function removeMonsBoardElements() {
  closeMonsItemChoiceModal();
  setMonsBoardDragFloating(false);
  if (monsMoveButton) {
    monsMoveButton.remove();
    monsMoveButton = null;
  }
  if (monsOptionsButton) {
    monsOptionsButton.remove();
    monsOptionsButton = null;
  }
  if (monsGameShell) {
    monsGameShell.remove();
    monsGameShell = null;
  }
  if (monsBlackClaimsList) {
    monsBlackClaimsList.remove();
  }
  if (monsWhiteClaimsList) {
    monsWhiteClaimsList.remove();
  }
  monsBoardSvg = null;
  monsBoardTilesLayer = null;
  monsBoardWavesLayer = null;
  monsBoardGhostsLayer = null;
  monsBoardHintsLayer = null;
  monsBoardPiecesLayer = null;
  monsBoardParticlesLayer = null;
  monsHud = null;
  monsUndoButton = null;
  monsFlipButton = null;
  monsScoreBlackLabel = null;
  monsScoreWhiteLabel = null;
  monsPotionsBlackTray = null;
  monsPotionsWhiteTray = null;
  monsBlackClaimButton = null;
  monsWhiteClaimButton = null;
  monsBlackClaimsList = null;
  monsWhiteClaimsList = null;
  monsSelectionPieceId = '';
  monsPendingSpiritPush = null;
  monsPendingDemonRebound = null;
  lastRenderedMonsMoveTick = 0;
  stopMonsParticleAnimation();
  stopMonsCornerWaveAnimation();
  monsWaveFrameIndex = 0;
  monsCornerWaveLines = [];
  for (const ghostBoardUi of monsGhostBoardElementsById.values()) {
    ghostBoardUi?.shell?.remove();
    ghostBoardUi?.moveButton?.remove();
    ghostBoardUi?.optionsButton?.remove();
    ghostBoardUi?.claimsBlackList?.remove();
    ghostBoardUi?.claimsWhiteList?.remove();
  }
  monsGhostBoardElementsById.clear();
}

function setMonsBoardDragFloating(shouldFloat) {
  if (!monsGameShell || !tableRoot || !gameLayer) {
    return;
  }
  const nextFloat = Boolean(shouldFloat);
  if (nextFloat) {
    if (monsGameShell.parentElement !== tableRoot) {
      tableRoot.appendChild(monsGameShell);
    }
    monsGameShell.classList.add('is-drag-floating');
    return;
  }
  if (monsGameShell.parentElement !== gameLayer) {
    gameLayer.appendChild(monsGameShell);
  }
  monsGameShell.classList.remove('is-drag-floating');
}

function appendMonsDrainerCarryOverlay(group, piece) {
  if (!group || !piece || typeof piece !== 'object') {
    return;
  }
  const baseType = getMonsBaseTypeFromRenderType(piece.type);
  const isMon = MONS_MON_BASE_TYPES.has(baseType);
  const carriedManaTypeRaw = typeof piece.carriedManaType === 'string' ? piece.carriedManaType : '';
  const carriedManaType =
    baseType === 'drainer' &&
    (carriedManaTypeRaw === 'mana' || carriedManaTypeRaw === 'manaB' || carriedManaTypeRaw === 'supermana')
      ? carriedManaTypeRaw
      : '';
  const heldItemType = isMon && piece.heldItemType === 'bomb' ? 'bomb' : '';
  const shouldShowBomb = heldItemType === 'bomb' && !carriedManaType;
  if (!carriedManaType && !shouldShowBomb) {
    return;
  }
  const isSuperMana = carriedManaType === 'supermana';
  const href = shouldShowBomb
    ? MONS_BOMB_HELD_ICON_SRC
    : isSuperMana
      ? MONS_SUPER_MANA_HELD_ICON_SRC
      : MONS_PIECE_ASSET_BY_TYPE[carriedManaType];
  if (!href) {
    return;
  }
  const transform =
    piece.faintedByAttack === true ? `rotate(90 ${piece.col + 0.5} ${piece.row + 0.5})` : '';
  const iconSize = shouldShowBomb ? MONS_HELD_BOMB_ICON_SIZE : isSuperMana ? 0.72 : 0.78;
  const iconXBase = shouldShowBomb
    ? piece.col + (1 - iconSize) + 0.11
    : isSuperMana
      ? piece.col + (1 - iconSize) / 2
      : piece.col + (1 - iconSize) + 0.09;
  const iconY = shouldShowBomb
    ? piece.row + (1 - iconSize) + 0.14
    : isSuperMana
      ? piece.row - 0.087
      : piece.row + (1 - iconSize) + 0.228;
  const adjustedIconX = isSuperMana ? iconXBase : iconXBase + 0.208;
  const normalManaNudge = !shouldShowBomb && !isSuperMana ? MONS_HELD_MANA_PIXEL_NUDGE : 0;
  const manaVerticalNudge = !shouldShowBomb ? MONS_HELD_MANA_VERTICAL_PIXEL_NUDGE : 0;
  const bombNudge = shouldShowBomb ? MONS_HELD_BOMB_PIXEL_NUDGE : 0;
  const iconOffsetX = shouldShowBomb ? bombNudge : normalManaNudge;
  const iconOffsetY = shouldShowBomb ? bombNudge : normalManaNudge + manaVerticalNudge;
  const imageRendering = getMonsPieceImageRendering();
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  icon.setAttribute('href', href);
  icon.setAttribute('x', (adjustedIconX - iconOffsetX).toFixed(3));
  icon.setAttribute('y', (iconY - iconOffsetY).toFixed(3));
  icon.setAttribute('width', iconSize.toFixed(3));
  icon.setAttribute('height', iconSize.toFixed(3));
  icon.setAttribute('style', `image-rendering: ${imageRendering}; pointer-events: none;`);
  if (transform) {
    icon.setAttribute('transform', transform);
  }
  group.appendChild(icon);
}

function renderMonsPotionTray(trayElement, potionCount, side = 'white', isVisible = true) {
  if (!trayElement) {
    return;
  }
  trayElement.classList.toggle('is-hidden', !Boolean(isVisible));
  trayElement.textContent = '';
  if (!isVisible) {
    return;
  }
  const count = Math.max(0, Math.floor(Number(potionCount) || 0));
  trayElement.classList.toggle('mons-hud-potions-black', side === 'black');
  if (count <= 0) {
    return;
  }
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const icon = document.createElement('img');
    icon.className = 'mons-hud-potion';
    icon.src = MONS_PIECE_ASSET_BY_TYPE.potion;
    icon.alt = '';
    icon.draggable = false;
    icon.setAttribute('aria-hidden', 'true');
    fragment.appendChild(icon);
  }
  trayElement.appendChild(fragment);
}

function shouldShowMonsHudPotions(boardScreenWidth) {
  const width = Number(boardScreenWidth);
  if (!Number.isFinite(width)) {
    return true;
  }
  return width >= MONS_HUD_POTION_HIDE_SCREEN_WIDTH;
}

function getCursorPayloadByPlayerToken(playerToken) {
  if (!playerToken) {
    return null;
  }
  for (const payload of Object.values(latestRoomCursors || {})) {
    const token = typeof payload?.playerToken === 'string' && payload.playerToken ? payload.playerToken : '';
    if (token === playerToken) {
      return payload;
    }
  }
  return null;
}

function resolveMonsClaimDisplay(entry) {
  const token = typeof entry?.token === 'string' ? entry.token : '';
  const isLocal = Boolean(localPlayerToken) && token === localPlayerToken;
  const livePayload = isLocal ? null : getCursorPayloadByPlayerToken(token);
  const name = String(isLocal ? playerState.name : livePayload?.name || entry?.name || '').trim();
  const color = normalizeHexColor(isLocal ? playerState.color : livePayload?.color || entry?.color || '#ff7a59');
  return {
    token,
    name: name || 'anon',
    color
  };
}

function renderMonsSideClaimsList(listElement, claims, side, claimButton = null) {
  if (!listElement) {
    return;
  }
  const normalizedSide = side === 'black' ? 'black' : 'white';
  const sideClaims = Array.isArray(claims) ? claims : [];
  listElement.textContent = '';
  listElement.classList.toggle('is-empty', sideClaims.length === 0);

  if (claimButton) {
    const isClaimedBySelf = Boolean(localPlayerToken) && sideClaims.some((entry) => entry?.token === localPlayerToken);
    const isSideFull = sideClaims.length >= 2 && !isClaimedBySelf;
    claimButton.classList.toggle('is-claimed', isClaimedBySelf);
    claimButton.classList.toggle('is-side-full', isSideFull);
    claimButton.disabled = isSideFull;
    claimButton.setAttribute('aria-label', `${normalizedSide} side`);
    claimButton.title = isClaimedBySelf
      ? `leave ${normalizedSide} side`
      : isSideFull
        ? `${normalizedSide} side full`
        : `claim ${normalizedSide} side`;
  }

  if (sideClaims.length === 0) {
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const entry of sideClaims) {
    const display = resolveMonsClaimDisplay(entry);
    const row = document.createElement('div');
    row.className = 'mons-side-claim-row';
    const dot = document.createElement('span');
    dot.className = 'mons-side-claim-dot';
    dot.style.background = display.color;
    row.appendChild(dot);
    const name = document.createElement('span');
    name.className = 'mons-side-claim-name';
    name.textContent = display.name;
    name.style.color = display.color;
    row.appendChild(name);
    fragment.appendChild(row);
  }
  listElement.appendChild(fragment);
}

function positionMonsSideClaimsList(
  listElement,
  claimButton,
  boardScreenCenter,
  boardScreenWidth,
  boardScreenHeight,
  side
) {
  if (!listElement) {
    return;
  }
  if (!tableRoot) {
    listElement.classList.add('hidden');
    return;
  }
  const normalizedSide = side === 'black' ? 'black' : 'white';
  const fallbackX =
    Number(boardScreenCenter?.x) +
    (normalizedSide === 'black' ? 1 : -1) * Math.max(0, Number(boardScreenWidth) / 2 - MONS_SIDE_CLAIMS_EDGE_INSET);
  let centerX = fallbackX;
  if (claimButton instanceof HTMLElement && claimButton.isConnected) {
    const rootRect = tableRoot.getBoundingClientRect();
    const buttonRect = claimButton.getBoundingClientRect();
    if (rootRect.width > 0 && buttonRect.width > 0) {
      centerX = buttonRect.left - rootRect.left + buttonRect.width / 2;
    }
  }
  const top = Number(boardScreenCenter?.y) + Number(boardScreenHeight) / 2 + MONS_SIDE_CLAIMS_VERTICAL_OFFSET;
  if (!Number.isFinite(centerX) || !Number.isFinite(top)) {
    listElement.classList.add('hidden');
    return;
  }
  listElement.classList.remove('hidden');
  listElement.style.left = `${snapToDevicePixel(centerX)}px`;
  listElement.style.top = `${snapToDevicePixel(top)}px`;
}

function positionMonsSideClaimsLists(
  blackListElement,
  whiteListElement,
  blackClaimButton,
  whiteClaimButton,
  boardScreenCenter,
  boardScreenWidth,
  boardScreenHeight
) {
  positionMonsSideClaimsList(
    blackListElement,
    blackClaimButton,
    boardScreenCenter,
    boardScreenWidth,
    boardScreenHeight,
    'black'
  );
  positionMonsSideClaimsList(
    whiteListElement,
    whiteClaimButton,
    boardScreenCenter,
    boardScreenWidth,
    boardScreenHeight,
    'white'
  );
}

function renderMonsGhostBoardState(ghostBoardUi, gameState, boardScreenWidth = Number.NaN) {
  if (!ghostBoardUi || !gameState) {
    return;
  }
  const piecesPayload = gameState.pieces && typeof gameState.pieces === 'object' ? gameState.pieces : {};
  const boardFlipped = isMonsBoardFlipped(gameState);
  const ghostsLayer = ghostBoardUi.boardGhostsLayer;
  const piecesLayer = ghostBoardUi.boardPiecesLayer;
  const pieceImageRendering = getMonsPieceImageRendering();
  const showHudPotions = shouldShowMonsHudPotions(boardScreenWidth);
  if (ghostsLayer) {
    ghostsLayer.textContent = '';
    const occupiedTileKeys = new Set();
    for (const piece of Object.values(piecesPayload)) {
      if (!piece || typeof piece !== 'object') {
        continue;
      }
      occupiedTileKeys.add(`${piece.row}-${piece.col}`);
    }
    const ghostSize = MONS_SPAWN_GHOST_SCALE;
    const ghostInset = (1 - ghostSize) / 2;
    for (const spawnPiece of MONS_DEFAULT_PIECES) {
      if (!spawnPiece || !MONS_MON_BASE_TYPES.has(getMonsBaseTypeFromRenderType(spawnPiece.type))) {
        continue;
      }
      const tileKey = `${spawnPiece.row}-${spawnPiece.col}`;
      if (occupiedTileKeys.has(tileKey)) {
        continue;
      }
      const href = MONS_PIECE_ASSET_BY_TYPE[spawnPiece.type];
      if (!href) {
        continue;
      }
      const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      ghost.setAttribute('href', href);
      ghost.setAttribute('x', String(spawnPiece.col + ghostInset));
      ghost.setAttribute('y', String(spawnPiece.row + ghostInset));
      ghost.setAttribute('width', String(ghostSize));
      ghost.setAttribute('height', String(ghostSize));
      if (boardFlipped) {
        ghost.setAttribute('transform', `rotate(180 ${spawnPiece.col + 0.5} ${spawnPiece.row + 0.5})`);
      }
      ghost.setAttribute('opacity', String(MONS_SPAWN_GHOST_OPACITY));
      ghost.setAttribute('style', `image-rendering: ${pieceImageRendering}; pointer-events: none;`);
      ghostsLayer.appendChild(ghost);
    }
  }

  if (piecesLayer) {
    piecesLayer.textContent = '';
    const pieces = Object.values(piecesPayload).filter((piece) => piece && typeof piece === 'object');
    pieces.sort((left, right) => {
      const leftNeutral = left?.side === 'neutral' ? 0 : 1;
      const rightNeutral = right?.side === 'neutral' ? 0 : 1;
      if (leftNeutral !== rightNeutral) {
        return leftNeutral - rightNeutral;
      }
      return String(left?.id || '').localeCompare(String(right?.id || ''));
    });
    for (const piece of pieces) {
      const href = MONS_PIECE_ASSET_BY_TYPE[piece.type];
      if (!href) {
        continue;
      }
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('data-mons-piece-id', String(piece.id));
      group.setAttribute('data-mons-row', String(piece.row));
      group.setAttribute('data-mons-col', String(piece.col));
      if (boardFlipped) {
        group.setAttribute('transform', `rotate(180 ${piece.col + 0.5} ${piece.row + 0.5})`);
      }

      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('href', href);
      image.setAttribute('x', String(piece.col));
      image.setAttribute('y', String(piece.row));
      image.setAttribute('width', '1');
      image.setAttribute('height', '1');
      if (piece.faintedByAttack === true) {
        image.setAttribute('transform', `rotate(90 ${piece.col + 0.5} ${piece.row + 0.5})`);
      }
      image.setAttribute('style', `image-rendering: ${pieceImageRendering}; pointer-events: none;`);
      group.appendChild(image);
      appendMonsDrainerCarryOverlay(group, piece);
      piecesLayer.appendChild(group);
    }
  }

  if (ghostBoardUi.scoreBlackLabel) {
    ghostBoardUi.scoreBlackLabel.textContent = String(Math.max(0, Number(gameState.scores?.black) || 0));
  }
  if (ghostBoardUi.scoreWhiteLabel) {
    ghostBoardUi.scoreWhiteLabel.textContent = String(Math.max(0, Number(gameState.scores?.white) || 0));
  }
  if (ghostBoardUi.potionsBlackTray) {
    renderMonsPotionTray(ghostBoardUi.potionsBlackTray, gameState.potions?.black, 'black', showHudPotions);
  }
  if (ghostBoardUi.potionsWhiteTray) {
    renderMonsPotionTray(ghostBoardUi.potionsWhiteTray, gameState.potions?.white, 'white', showHudPotions);
  }
  if (ghostBoardUi.undoButton) {
    ghostBoardUi.undoButton.classList.toggle('hidden', !showHudPotions);
  }
  if (ghostBoardUi.flipButton) {
    ghostBoardUi.flipButton.classList.toggle('hidden', !showHudPotions);
    ghostBoardUi.flipButton.classList.toggle('is-flipped', boardFlipped);
  }
  renderMonsSideClaimsList(ghostBoardUi.claimsBlackList, gameState.claims?.black, 'black', ghostBoardUi.blackClaimButton);
  renderMonsSideClaimsList(ghostBoardUi.claimsWhiteList, gameState.claims?.white, 'white', ghostBoardUi.whiteClaimButton);
  if (ghostBoardUi.undoButton) {
    const undoHistory = Array.isArray(gameState.undoHistory) ? gameState.undoHistory : [];
    const topUndoEntry = undoHistory.length > 0 ? undoHistory[undoHistory.length - 1] : null;
    const canUndo = canCurrentPlayerUndoMonsEntry(topUndoEntry);
    ghostBoardUi.undoButton.disabled = !canUndo;
    ghostBoardUi.undoButton.classList.toggle('is-disabled', !canUndo);
  }
}

function removeMonsGhostBoardUi(ghostBoardUi) {
  if (!ghostBoardUi || typeof ghostBoardUi !== 'object') {
    return;
  }
  ghostBoardUi.shell?.remove();
  ghostBoardUi.moveButton?.remove();
  ghostBoardUi.optionsButton?.remove();
  ghostBoardUi.claimsBlackList?.remove();
  ghostBoardUi.claimsWhiteList?.remove();
}

function ensureMonsGhostBoardElement(gameId) {
  if (!gameLayer || !tableRoot) {
    return null;
  }
  const normalizedGameId = normalizeMonsGameId(gameId);
  let ghostBoardUi = monsGhostBoardElementsById.get(normalizedGameId) || null;
  if (
    ghostBoardUi?.shell?.isConnected &&
    ghostBoardUi?.undoButton?.isConnected &&
    ghostBoardUi?.flipButton?.isConnected &&
    ghostBoardUi?.moveButton?.isConnected &&
    ghostBoardUi?.optionsButton?.isConnected &&
    ghostBoardUi?.claimsBlackList?.isConnected &&
    ghostBoardUi?.claimsWhiteList?.isConnected
  ) {
    return ghostBoardUi;
  }

  removeMonsGhostBoardUi(ghostBoardUi);

  const shell = document.createElement('div');
  shell.className = 'mons-game-shell hidden';
  shell.dataset.monsGameId = normalizedGameId;
  shell.dataset.drawPassthrough = 'true';
  shell.setAttribute('aria-label', 'Super Metal Mons board');
  shieldPointerEvents(shell, { allowDrawPassthrough: true, allowMiddleMousePan: true });
  shell.addEventListener('pointerdown', (event) => {
    if (drawModeEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (normalizeMonsGameId(activeMonsGameId) === normalizedGameId) {
      return;
    }
    setActiveMonsGameId(normalizedGameId);
    renderMonsBoard();
  });

  const boardSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  boardSvg.classList.add('mons-board-svg');
  boardSvg.setAttribute('viewBox', '-0.34 -0.34 11.68 11.68');
  boardSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  boardSvg.setAttribute('aria-label', 'Super Metal Mons board');
  boardSvg.addEventListener('pointerdown', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    const tileTarget = target.closest('[data-mons-row][data-mons-col]');
    if (!tileTarget) {
      return;
    }
    const row = Number(tileTarget.getAttribute('data-mons-row'));
    const col = Number(tileTarget.getAttribute('data-mons-col'));
    onMonsBoardTilePointerDown(event, row, col, normalizedGameId);
  });

  const boardTilesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  boardTilesLayer.setAttribute('aria-hidden', 'true');
  boardSvg.appendChild(boardTilesLayer);

  const boardWavesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  boardWavesLayer.setAttribute('aria-hidden', 'true');
  boardWavesLayer.setAttribute('pointer-events', 'none');
  boardSvg.appendChild(boardWavesLayer);

  const boardGhostsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  boardGhostsLayer.setAttribute('aria-hidden', 'true');
  boardGhostsLayer.setAttribute('pointer-events', 'none');
  boardSvg.appendChild(boardGhostsLayer);

  const boardPiecesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  boardPiecesLayer.setAttribute('aria-hidden', 'true');
  boardSvg.appendChild(boardPiecesLayer);

  for (let row = 0; row < MONS_BOARD_SIZE; row += 1) {
    for (let col = 0; col < MONS_BOARD_SIZE; col += 1) {
      const tile = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tile.setAttribute('x', String(col));
      tile.setAttribute('y', String(row));
      tile.setAttribute('width', '1');
      tile.setAttribute('height', '1');
      tile.setAttribute('data-mons-row', String(row));
      tile.setAttribute('data-mons-col', String(col));
      tile.classList.add('mons-board-tile');
      tile.style.fill = getMonsBoardTileFill(row, col);
      tile.style.cursor = 'pointer';
      boardTilesLayer.appendChild(tile);
    }
  }
  for (let col = 0; col < MONS_BOARD_SIZE; col += 1) {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(col + 0.5));
    label.setAttribute('y', '11.26');
    label.setAttribute('text-anchor', 'middle');
    label.classList.add('mons-board-coordinate');
    label.setAttribute('data-mons-axis', 'col');
    label.setAttribute('data-mons-index', String(col));
    label.textContent = getMonsColumnLabelText(col, false);
    boardTilesLayer.appendChild(label);
  }
  for (let row = 0; row < MONS_BOARD_SIZE; row += 1) {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '-0.2');
    label.setAttribute('y', String(row + 0.58));
    label.setAttribute('text-anchor', 'middle');
    label.classList.add('mons-board-coordinate');
    label.setAttribute('data-mons-axis', 'row');
    label.setAttribute('data-mons-index', String(row));
    label.textContent = getMonsRowLabelText(row, false);
    boardTilesLayer.appendChild(label);
  }

  shell.appendChild(boardSvg);

  const hud = document.createElement('div');
  hud.className = 'mons-hud';
  hud.setAttribute('aria-label', 'player scores');

  const blackCluster = document.createElement('div');
  blackCluster.className = 'mons-hud-player mons-hud-player-black';
  const blackAvatarWrap = document.createElement('span');
  blackAvatarWrap.className = 'mons-hud-avatar-wrap';
  const blackClaimButton = document.createElement('button');
  blackClaimButton.type = 'button';
  blackClaimButton.className = 'mons-hud-avatar-button';
  blackClaimButton.dataset.monsSide = 'black';
  blackClaimButton.addEventListener('click', (event) => {
    onMonsSideClaimClick(event, 'black', normalizedGameId);
  });
  shieldPointerEvents(blackClaimButton);
  const blackAvatar = document.createElement('img');
  blackAvatar.src = MONS_PIECE_ASSET_BY_TYPE.drainerB;
  blackAvatar.alt = 'black player';
  blackAvatar.draggable = false;
  blackAvatar.className = 'mons-hud-avatar';
  blackClaimButton.appendChild(blackAvatar);
  blackAvatarWrap.appendChild(blackClaimButton);
  const claimsBlackList = document.createElement('div');
  claimsBlackList.className = 'mons-side-claims mons-side-claims-black hidden';
  const potionsBlackTray = document.createElement('span');
  potionsBlackTray.className = 'mons-hud-potions mons-hud-potions-black';
  potionsBlackTray.setAttribute('aria-hidden', 'true');
  const scoreBlackLabel = document.createElement('span');
  scoreBlackLabel.className = 'mons-hud-score';
  scoreBlackLabel.textContent = '0';
  blackCluster.appendChild(potionsBlackTray);
  blackCluster.appendChild(scoreBlackLabel);
  blackCluster.appendChild(blackAvatarWrap);

  const whiteCluster = document.createElement('div');
  whiteCluster.className = 'mons-hud-player mons-hud-player-white';
  const whiteAvatarWrap = document.createElement('span');
  whiteAvatarWrap.className = 'mons-hud-avatar-wrap';
  const whiteClaimButton = document.createElement('button');
  whiteClaimButton.type = 'button';
  whiteClaimButton.className = 'mons-hud-avatar-button';
  whiteClaimButton.dataset.monsSide = 'white';
  whiteClaimButton.addEventListener('click', (event) => {
    onMonsSideClaimClick(event, 'white', normalizedGameId);
  });
  shieldPointerEvents(whiteClaimButton);
  const whiteAvatar = document.createElement('img');
  whiteAvatar.src = MONS_PIECE_ASSET_BY_TYPE.drainer;
  whiteAvatar.alt = 'white player';
  whiteAvatar.draggable = false;
  whiteAvatar.className = 'mons-hud-avatar';
  whiteClaimButton.appendChild(whiteAvatar);
  whiteAvatarWrap.appendChild(whiteClaimButton);
  const claimsWhiteList = document.createElement('div');
  claimsWhiteList.className = 'mons-side-claims mons-side-claims-white hidden';
  const potionsWhiteTray = document.createElement('span');
  potionsWhiteTray.className = 'mons-hud-potions';
  potionsWhiteTray.setAttribute('aria-hidden', 'true');
  const scoreWhiteLabel = document.createElement('span');
  scoreWhiteLabel.className = 'mons-hud-score';
  scoreWhiteLabel.textContent = '0';
  whiteCluster.appendChild(whiteAvatarWrap);
  whiteCluster.appendChild(scoreWhiteLabel);
  whiteCluster.appendChild(potionsWhiteTray);

  const centerCluster = document.createElement('div');
  centerCluster.className = 'mons-hud-center';
  const undoButton = document.createElement('button');
  undoButton.type = 'button';
  undoButton.className = 'mons-undo-button';
  undoButton.dataset.monsGameId = normalizedGameId;
  undoButton.setAttribute('aria-label', 'undo last mons move');
  undoButton.innerHTML =
    '<svg viewBox="0 0 512 512" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z" fill="currentColor"/></svg>';
  undoButton.addEventListener('click', (event) => {
    onMonsUndoButtonClick(event, normalizedGameId);
  });
  shieldPointerEvents(undoButton);
  centerCluster.appendChild(undoButton);

  const flipButton = document.createElement('button');
  flipButton.type = 'button';
  flipButton.className = 'mons-flip-button';
  flipButton.dataset.monsGameId = normalizedGameId;
  flipButton.setAttribute('aria-label', 'flip super metal mons board');
  flipButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M9 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.8 7.2L9 5L11.2 7.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14.8 16.8L17 19L19.2 16.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  flipButton.addEventListener('click', (event) => {
    onMonsFlipButtonClick(event, normalizedGameId);
  });
  shieldPointerEvents(flipButton);
  centerCluster.appendChild(flipButton);
  hud.appendChild(whiteCluster);
  hud.appendChild(centerCluster);
  hud.appendChild(blackCluster);
  shell.appendChild(hud);
  gameLayer.appendChild(shell);

  const moveButton = document.createElement('button');
  moveButton.type = 'button';
  moveButton.className = 'deck-control-button deck-move-button mons-move-button hidden';
  moveButton.dataset.stackScope = 'mons';
  moveButton.dataset.monsGameId = normalizedGameId;
  moveButton.setAttribute('aria-label', 'move super metal mons board');
  moveButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 8H19M5 12H19M5 16H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  moveButton.addEventListener('pointerdown', (event) => {
    onMonsMovePointerDown(event, normalizedGameId);
  });
  shieldPointerEvents(moveButton);
  tableRoot.appendChild(moveButton);

  const optionsButton = document.createElement('button');
  optionsButton.type = 'button';
  optionsButton.className = 'deck-control-button deck-options-button mons-options-button hidden';
  optionsButton.dataset.stackScope = 'mons';
  optionsButton.dataset.monsGameId = normalizedGameId;
  optionsButton.setAttribute('aria-label', 'super metal mons options');
  optionsButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="6.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="17.5" cy="12" r="1.7"/></svg>';
  optionsButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      return;
    }
    openGameOptionsMenu(MONS_GAME_KEY, normalizedGameId);
  });
  shieldPointerEvents(optionsButton);
  tableRoot.appendChild(optionsButton);
  tableRoot.appendChild(claimsBlackList);
  tableRoot.appendChild(claimsWhiteList);

  ghostBoardUi = {
    gameId: normalizedGameId,
    shell,
    boardSvg,
    boardWavesLayer,
    boardGhostsLayer,
    boardPiecesLayer,
    hud,
    scoreBlackLabel,
    scoreWhiteLabel,
    potionsBlackTray,
    potionsWhiteTray,
    claimsBlackList,
    claimsWhiteList,
    blackClaimButton,
    whiteClaimButton,
    undoButton,
    flipButton,
    moveButton,
    optionsButton
  };
  monsGhostBoardElementsById.set(normalizedGameId, ghostBoardUi);
  return ghostBoardUi;
}

function renderInactiveMonsBoardGhosts() {
  if (!gameLayer || !tableRoot) {
    return;
  }
  const activeId = normalizeMonsGameId(activeMonsGameId);
  const visibleGhostIds = new Set();
  const controlSize = MONS_MOVE_CONTROL_SIZE;
  const controlGap = DECK_CONTROL_GAP;
  for (const [gameId, gameState] of monsGameStatesById.entries()) {
    if (!gameState || gameState.enabled === false) {
      continue;
    }
    if (normalizeMonsGameId(gameId) === activeId) {
      continue;
    }
    const ghostBoardUi = ensureMonsGhostBoardElement(gameId);
    if (!ghostBoardUi) {
      continue;
    }
    const normalizedGameId = normalizeMonsGameId(gameId);
    visibleGhostIds.add(normalizedGameId);
    const boardScreen = worldToScreen({ x: gameState.x, y: gameState.y });
    const boardScreenWidth = snapToDevicePixel(gameState.width * camera.scale);
    const boardScreenHeight = snapToDevicePixel(gameState.height * camera.scale);
    const hudScreenHeight = snapToDevicePixel(Math.max(24, boardScreenHeight - boardScreenWidth), 24);

    ghostBoardUi.shell.classList.remove('hidden');
    ghostBoardUi.shell.style.left = `${boardScreen.x}px`;
    ghostBoardUi.shell.style.top = `${boardScreen.y}px`;
    ghostBoardUi.shell.style.width = `${boardScreenWidth}px`;
    ghostBoardUi.shell.style.height = `${boardScreenHeight}px`;
    ghostBoardUi.boardSvg.style.width = `${boardScreenWidth}px`;
    ghostBoardUi.boardSvg.style.height = `${boardScreenWidth}px`;
    applyMonsBoardOrientation(ghostBoardUi.boardSvg, isMonsBoardFlipped(gameState));
    ghostBoardUi.hud.style.width = `${boardScreenWidth}px`;
    ghostBoardUi.hud.style.height = `${hudScreenHeight}px`;
    renderMonsCornerWavesIntoLayer(ghostBoardUi.boardWavesLayer);
    renderMonsGhostBoardState(ghostBoardUi, gameState, boardScreenWidth);
    positionMonsSideClaimsLists(
      ghostBoardUi.claimsBlackList,
      ghostBoardUi.claimsWhiteList,
      ghostBoardUi.blackClaimButton,
      ghostBoardUi.whiteClaimButton,
      boardScreen,
      boardScreenWidth,
      boardScreenHeight
    );

    ghostBoardUi.moveButton.classList.remove('hidden');
    ghostBoardUi.moveButton.style.left = `${boardScreen.x + boardScreenWidth / 2 + controlGap + controlSize / 2}px`;
    ghostBoardUi.moveButton.style.top = `${boardScreen.y + boardScreenHeight / 2 - controlSize / 2}px`;
    ghostBoardUi.moveButton.style.width = `${controlSize}px`;
    ghostBoardUi.moveButton.style.height = `${controlSize}px`;
    ghostBoardUi.moveButton.classList.toggle('is-held-by-self', gameState.holderClientId === localClientId);
    ghostBoardUi.moveButton.classList.toggle('is-group-selected', selectedMonsGameIds.has(normalizedGameId));

    ghostBoardUi.optionsButton.classList.remove('hidden');
    ghostBoardUi.optionsButton.style.left = ghostBoardUi.moveButton.style.left;
    ghostBoardUi.optionsButton.style.top = `${boardScreen.y + boardScreenHeight / 2 - (controlSize * 1.5 + controlGap)}px`;
    ghostBoardUi.optionsButton.style.width = `${controlSize}px`;
    ghostBoardUi.optionsButton.style.height = `${controlSize}px`;
  }
  for (const [gameId, ghostBoardUi] of monsGhostBoardElementsById.entries()) {
    if (visibleGhostIds.has(normalizeMonsGameId(gameId))) {
      continue;
    }
    removeMonsGhostBoardUi(ghostBoardUi);
    monsGhostBoardElementsById.delete(gameId);
  }
}

function refreshMonsClaimLabelsOnly() {
  const activeGame = getMonsGameStateById(activeMonsGameId);
  if (activeGame && activeGame.enabled !== false) {
    renderMonsSideClaimsList(monsBlackClaimsList, activeGame.claims?.black, 'black', monsBlackClaimButton);
    renderMonsSideClaimsList(monsWhiteClaimsList, activeGame.claims?.white, 'white', monsWhiteClaimButton);
    const activeBoardScreen = worldToScreen({ x: activeGame.x, y: activeGame.y });
    const activeBoardScreenWidth = snapToDevicePixel(activeGame.width * camera.scale);
    const activeBoardScreenHeight = snapToDevicePixel(activeGame.height * camera.scale);
    positionMonsSideClaimsLists(
      monsBlackClaimsList,
      monsWhiteClaimsList,
      monsBlackClaimButton,
      monsWhiteClaimButton,
      activeBoardScreen,
      activeBoardScreenWidth,
      activeBoardScreenHeight
    );
  } else {
    if (monsBlackClaimsList) {
      monsBlackClaimsList.classList.add('hidden');
    }
    if (monsWhiteClaimsList) {
      monsWhiteClaimsList.classList.add('hidden');
    }
  }
  for (const [gameId, ghostBoardUi] of monsGhostBoardElementsById.entries()) {
    const gameState = getMonsGameStateById(gameId);
    if (!gameState || gameState.enabled === false) {
      continue;
    }
    renderMonsSideClaimsList(
      ghostBoardUi?.claimsBlackList,
      gameState.claims?.black,
      'black',
      ghostBoardUi?.blackClaimButton
    );
    renderMonsSideClaimsList(
      ghostBoardUi?.claimsWhiteList,
      gameState.claims?.white,
      'white',
      ghostBoardUi?.whiteClaimButton
    );
    const boardScreen = worldToScreen({ x: gameState.x, y: gameState.y });
    const boardScreenWidth = snapToDevicePixel(gameState.width * camera.scale);
    const boardScreenHeight = snapToDevicePixel(gameState.height * camera.scale);
    positionMonsSideClaimsLists(
      ghostBoardUi?.claimsBlackList,
      ghostBoardUi?.claimsWhiteList,
      ghostBoardUi?.blackClaimButton,
      ghostBoardUi?.whiteClaimButton,
      boardScreen,
      boardScreenWidth,
      boardScreenHeight
    );
  }
}

function getMonsPieceAtTile(row, col, piecesPayload = monsGameState?.pieces) {
  if (!piecesPayload || typeof piecesPayload !== 'object') {
    return null;
  }
  let itemPiece = null;
  for (const piece of Object.values(piecesPayload)) {
    if (!piece || typeof piece !== 'object') {
      continue;
    }
    if (piece.row === row && piece.col === col) {
      if (isMonsItemPiece(piece)) {
        itemPiece = piece;
        continue;
      }
      return piece;
    }
  }
  return itemPiece;
}

function stopMonsParticleAnimation() {
  if (monsParticleAnimationRafId) {
    window.cancelAnimationFrame(monsParticleAnimationRafId);
    monsParticleAnimationRafId = 0;
  }
  if (monsBoardParticlesLayer) {
    monsBoardParticlesLayer.textContent = '';
  }
}

function monsMulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(value) {
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

function easeOutCubic(value) {
  const normalized = clamp01(value);
  return 1 - Math.pow(1 - normalized, 3);
}

function createMonsDemonAttackParticles(seed) {
  const random = monsMulberry32(seed);
  const particles = [];
  const count = 16;
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.34 + random() * 1.02;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.1 + random() * 0.14,
      delayMs: random() * 95,
      durationMs: 230 + random() * 220,
      color: MONS_DEMON_ATTACK_PARTICLE_COLORS[Math.floor(random() * MONS_DEMON_ATTACK_PARTICLE_COLORS.length)],
      opacity: 0.62 + random() * 0.34
    });
  }
  return particles;
}

function createMonsMysticAttackParticles(seed) {
  const random = monsMulberry32(seed);
  const particles = [];
  const count = 14;
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.42 + random() * 1.16;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.04 + random() * 0.09,
      delayMs: random() * 80,
      durationMs: 240 + random() * 220,
      color: MONS_MYSTIC_ATTACK_PARTICLE_COLORS[Math.floor(random() * MONS_MYSTIC_ATTACK_PARTICLE_COLORS.length)],
      opacity: 0.66 + random() * 0.3
    });
  }
  return particles;
}

function createMonsBombFlameParticles(seed) {
  const random = monsMulberry32(seed);
  const particles = [];
  const count = 20;
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.36 + random() * 1.42;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.08 + random() * 0.18,
      delayMs: random() * 62,
      durationMs: 190 + random() * 220,
      color: MONS_BOMB_FLAME_PARTICLE_COLORS[Math.floor(random() * MONS_BOMB_FLAME_PARTICLE_COLORS.length)],
      opacity: 0.75 + random() * 0.25
    });
  }
  return particles;
}

function createMonsBombSmokeParticles(seed) {
  const random = monsMulberry32(seed);
  const particles = [];
  const count = 16;
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.18 + random() * 1.12;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.12 + random() * 0.24,
      delayMs: 35 + random() * 210,
      durationMs: 340 + random() * 360,
      color: MONS_BOMB_SMOKE_PARTICLE_COLORS[Math.floor(random() * MONS_BOMB_SMOKE_PARTICLE_COLORS.length)],
      opacity: 0.38 + random() * 0.38
    });
  }
  return particles;
}

function createMonsCornerWaveLines(seed) {
  const random = monsMulberry32(seed);
  const lines = [];
  const lineCount = 10;
  const usableYStart = 0.11;
  const usableYEnd = 0.89;
  const baseStep = (usableYEnd - usableYStart) / Math.max(1, lineCount - 1);
  for (let index = 0; index < lineCount; index += 1) {
    const width = (Math.floor(random() * 5) + 2) * MONS_WAVE_PIXEL;
    const jitter = (random() - 0.5) * baseStep * 1.45;
    const snappedY =
      Math.round((usableYStart + baseStep * index + jitter) / MONS_WAVE_PIXEL) * MONS_WAVE_PIXEL;
    const y = Math.max(MONS_WAVE_PIXEL, Math.min(1 - MONS_WAVE_PIXEL * 2, snappedY));
    lines.push({
      x: random() * (1 - width),
      width,
      y,
      color: random() > 0.5 ? MONS_WAVE_COLOR_A : MONS_WAVE_COLOR_B
    });
  }
  return lines.sort((left, right) => left.y - right.y);
}

function getMonsWaveSlideFrame(line, frameIndex) {
  let sliderX = line.x + line.width - MONS_WAVE_PIXEL * frameIndex;
  const attemptedWidth = Math.min(frameIndex, 3) * MONS_WAVE_PIXEL;
  if (sliderX < line.x) {
    if (sliderX + attemptedWidth <= line.x) {
      return { x: line.x, width: 0 };
    }
    const visibleWidth = attemptedWidth - line.x + sliderX;
    if (visibleWidth < MONS_WAVE_PIXEL / 2) {
      return { x: line.x, width: 0 };
    }
    sliderX = line.x;
    return { x: sliderX, width: visibleWidth };
  }
  return { x: sliderX, width: attemptedWidth };
}

function ensureMonsCornerWaveLines() {
  if (monsCornerWaveLines.length === MONS_CORNER_POOL_POSITIONS.length) {
    return;
  }
  monsCornerWaveLines = MONS_CORNER_POOL_POSITIONS.map((_, index) =>
    createMonsCornerWaveLines(MONS_CORNER_WAVE_SEED_BASE + (index + 1) * 7919)
  );
}

function renderMonsCornerWavesIntoLayer(targetLayer) {
  if (!targetLayer) {
    return;
  }
  ensureMonsCornerWaveLines();
  targetLayer.textContent = '';
  MONS_CORNER_POOL_POSITIONS.forEach(([poolCol, poolRow], poolIndex) => {
    const poolGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    poolGroup.setAttribute('transform', `translate(${poolCol}, ${poolRow})`);
    poolGroup.setAttribute('opacity', '0.5');
    const lines = monsCornerWaveLines[poolIndex] || [];
    for (const line of lines) {
      const slide = getMonsWaveSlideFrame(line, monsWaveFrameIndex);
      const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      base.setAttribute('x', String(line.x));
      base.setAttribute('y', String(line.y));
      base.setAttribute('width', String(line.width));
      base.setAttribute('height', String(MONS_WAVE_PIXEL));
      base.setAttribute('fill', line.color);
      lineGroup.appendChild(base);

      if (slide.width > 0) {
        const crest = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        crest.setAttribute('x', String(slide.x));
        crest.setAttribute('y', String(line.y - MONS_WAVE_PIXEL));
        crest.setAttribute('width', String(slide.width));
        crest.setAttribute('height', String(MONS_WAVE_PIXEL));
        crest.setAttribute('fill', line.color);
        lineGroup.appendChild(crest);

        const cutout = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cutout.setAttribute('x', String(slide.x));
        cutout.setAttribute('y', String(line.y));
        cutout.setAttribute('width', String(slide.width));
        cutout.setAttribute('height', String(MONS_WAVE_PIXEL));
        cutout.setAttribute('fill', MONS_CORNER_TILE_COLOR);
        lineGroup.appendChild(cutout);
      }

      poolGroup.appendChild(lineGroup);
    }
    targetLayer.appendChild(poolGroup);
  });
}

function renderMonsCornerWaves() {
  renderMonsCornerWavesIntoLayer(monsBoardWavesLayer);
}

function stopMonsCornerWaveAnimation() {
  if (monsWaveTimerId) {
    window.clearInterval(monsWaveTimerId);
    monsWaveTimerId = 0;
  }
}

function startMonsCornerWaveAnimation() {
  if (monsWaveTimerId || !monsBoardWavesLayer) {
    return;
  }
  monsWaveTimerId = window.setInterval(() => {
    monsWaveFrameIndex = (monsWaveFrameIndex + 1) % MONS_WAVE_FRAME_COUNT;
    renderMonsCornerWaves();
  }, MONS_WAVE_FRAME_MS);
}

function triggerMonsAbilityEffect(lastMove) {
  if (!monsBoardParticlesLayer || !lastMove) {
    return;
  }
  const action = typeof lastMove.action === 'string' ? lastMove.action : 'move';
  const isDemon = action === 'demon';
  const isMystic = action === 'mystic';
  const isSpirit = action === 'spirit';
  const isBomb = action === 'bomb';
  const scoredPieceTypeRaw = typeof lastMove.scoredPieceType === 'string' ? lastMove.scoredPieceType : '';
  const scoredPieceType =
    scoredPieceTypeRaw === 'mana' || scoredPieceTypeRaw === 'manaB' || scoredPieceTypeRaw === 'supermana'
      ? scoredPieceTypeRaw
      : '';
  const scoredPieceHref = scoredPieceType ? MONS_PIECE_ASSET_BY_TYPE[scoredPieceType] : '';
  const hasScoredMana = Boolean(scoredPieceHref);
  if (!isDemon && !isMystic && !isSpirit && !isBomb && !hasScoredMana) {
    return;
  }

  stopMonsParticleAnimation();
  const originColRaw = Number.isFinite(lastMove.targetCol) ? Number(lastMove.targetCol) : Number(lastMove.col);
  const originRowRaw = Number.isFinite(lastMove.targetRow) ? Number(lastMove.targetRow) : Number(lastMove.row);
  const originCol = Number.isFinite(originColRaw) ? originColRaw : 0;
  const originRow = Number.isFinite(originRowRaw) ? originRowRaw : 0;
  const baseX = originCol + 0.5;
  const baseY = originRow + 0.5;
  const seed = (Number(monsGameState?.moveTick) || 0) * 1399 + Math.round(originCol) * 97 + Math.round(originRow) * 173;
  const demonParticles = isDemon ? createMonsDemonAttackParticles(seed) : [];
  const mysticParticles = isMystic ? createMonsMysticAttackParticles(seed) : [];
  const bombFlameParticles = isBomb ? createMonsBombFlameParticles(seed) : [];
  const bombSmokeParticles = isBomb ? createMonsBombSmokeParticles(seed + 9191) : [];
  const spiritParticles = [];
  if (isSpirit) {
    const random = monsMulberry32(seed + 3119);
    const spiritCount = 14;
    for (let index = 0; index < spiritCount; index += 1) {
      const angle = (Math.PI * 2 * index) / spiritCount + (random() - 0.5) * 0.46;
      const speed = 0.08 + random() * 0.21;
      spiritParticles.push({
        x: baseX + (random() - 0.5) * 0.12,
        y: baseY + (random() - 0.5) * 0.12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.03,
        size: 0.04 + random() * 0.1,
        jitter: (random() - 0.5) * 0.13,
        fill:
          random() > 0.67
            ? 'rgba(111, 255, 214, 0.95)'
            : random() > 0.34
              ? 'rgba(163, 255, 234, 0.88)'
              : 'rgba(236, 255, 251, 0.82)'
      });
    }
  }

  const scoreToColRaw = Number.isFinite(lastMove.toCol) ? Number(lastMove.toCol) : Number(lastMove.col);
  const scoreToRowRaw = Number.isFinite(lastMove.toRow) ? Number(lastMove.toRow) : Number(lastMove.row);
  const scoreToCol = Number.isFinite(scoreToColRaw) ? scoreToColRaw : originCol;
  const scoreToRow = Number.isFinite(scoreToRowRaw) ? scoreToRowRaw : originRow;
  const scoreFromColRaw = Number(lastMove.fromCol);
  const scoreFromRowRaw = Number(lastMove.fromRow);
  const scoreFromCol = Number.isFinite(scoreFromColRaw) ? scoreFromColRaw : scoreToCol;
  const scoreFromRow = Number.isFinite(scoreFromRowRaw) ? scoreFromRowRaw : scoreToRow;
  const scoreDurationMs = MONS_SCORED_MANA_TRAVEL_MS + MONS_SCORED_MANA_FADE_OUT_MS + MONS_SCORED_MANA_FADE_OUT_HOLD_MS;
  const totalDurationMs = Math.max(
    isDemon || isMystic || isBomb ? MONS_ATTACK_EFFECT_DURATION_MS : 0,
    isSpirit ? MONS_PARTICLE_DURATION_MS : 0,
    hasScoredMana ? Math.max(scoreDurationMs, MONS_MANA_POOL_PULSE_MS + 80) : 0
  );
  if (totalDurationMs <= 0) {
    return;
  }

  const startedAt = performance.now();
  const step = (now) => {
    if (!monsBoardParticlesLayer) {
      monsParticleAnimationRafId = 0;
      return;
    }
    const elapsed = now - startedAt;
    let shouldContinue = elapsed < totalDurationMs;
    monsBoardParticlesLayer.textContent = '';

    if (isDemon || isMystic || isBomb) {
      const progress = clamp01(elapsed / MONS_ATTACK_EFFECT_DURATION_MS);
      const elapsedMs = MONS_ATTACK_EFFECT_DURATION_MS * progress;
      if (progress < 1) {
        shouldContinue = true;
      }
      if (isBomb) {
        const flashOpacity = Math.max(0, 1 - progress * 1.9);
        const flashRadius = 0.22 + easeOutCubic(progress) * 1.18;
        const heatOpacity = Math.max(0, 0.9 * (1 - progress * 1.25));
        const heatRadius = 0.2 + easeOutCubic(progress) * 0.84;
        const shockRingRadius = 0.16 + easeOutCubic(progress) * 1.84;
        const shockRingOpacity = Math.max(0, 0.86 * (1 - progress * 1.3));
        if (flashOpacity > 0) {
          const flash = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          flash.setAttribute('cx', baseX.toFixed(3));
          flash.setAttribute('cy', baseY.toFixed(3));
          flash.setAttribute('r', flashRadius.toFixed(3));
          flash.setAttribute('fill', '#FFF9D0');
          flash.setAttribute('opacity', flashOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(flash);
        }
        if (heatOpacity > 0) {
          const heat = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          heat.setAttribute('cx', baseX.toFixed(3));
          heat.setAttribute('cy', baseY.toFixed(3));
          heat.setAttribute('r', heatRadius.toFixed(3));
          heat.setAttribute('fill', '#FFB24A');
          heat.setAttribute('opacity', heatOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(heat);
        }
        if (shockRingOpacity > 0) {
          const shockRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          shockRing.setAttribute('cx', baseX.toFixed(3));
          shockRing.setAttribute('cy', baseY.toFixed(3));
          shockRing.setAttribute('r', shockRingRadius.toFixed(3));
          shockRing.setAttribute('fill', 'none');
          shockRing.setAttribute('stroke', '#FF7E1A');
          shockRing.setAttribute('stroke-width', '0.12');
          shockRing.setAttribute('opacity', shockRingOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(shockRing);
        }

        for (const particle of bombFlameParticles) {
          const localProgress = clamp01((elapsedMs - particle.delayMs) / particle.durationMs);
          const traveled = easeOutCubic(localProgress);
          const px = particle.dx * traveled;
          const py = particle.dy * traveled;
          const radiusBase = Math.max(0.014, particle.size * (1 - 0.86 * localProgress));
          const flameAngleDeg = (Math.atan2(particle.dy, particle.dx) * 180) / Math.PI + 90;
          const opacity = Math.max(0, particle.opacity * (1 - localProgress) * 1.12);
          if (opacity <= 0) {
            continue;
          }
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('transform', `translate(${(baseX + px).toFixed(3)} ${(baseY + py).toFixed(3)})`);
          group.setAttribute('opacity', opacity.toFixed(3));

          const flame = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          flame.setAttribute('cx', '0');
          flame.setAttribute('cy', '0');
          flame.setAttribute('rx', (radiusBase * 0.62).toFixed(3));
          flame.setAttribute('ry', (radiusBase * 1.6).toFixed(3));
          flame.setAttribute('fill', particle.color);
          flame.setAttribute('transform', `rotate(${flameAngleDeg.toFixed(2)})`);
          group.appendChild(flame);

          const ember = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ember.setAttribute('cx', '0');
          ember.setAttribute('cy', '0');
          ember.setAttribute('r', (radiusBase * 0.36).toFixed(3));
          ember.setAttribute('fill', '#FFFDEA');
          ember.setAttribute('opacity', '0.88');
          group.appendChild(ember);

          monsBoardParticlesLayer.appendChild(group);
        }

        for (const particle of bombSmokeParticles) {
          const localProgress = clamp01((elapsedMs - particle.delayMs) / particle.durationMs);
          const traveled = easeOutCubic(localProgress);
          const px = particle.dx * (0.45 + traveled * 0.72);
          const py = particle.dy * (0.38 + traveled * 0.72) - traveled * 0.42;
          const radius = Math.max(0.02, particle.size * (0.78 + localProgress * 0.96));
          const opacity = Math.max(0, particle.opacity * (1 - localProgress * 0.9));
          if (opacity <= 0) {
            continue;
          }
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('transform', `translate(${(baseX + px).toFixed(3)} ${(baseY + py).toFixed(3)})`);
          group.setAttribute('opacity', opacity.toFixed(3));

          const smoke = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          smoke.setAttribute('cx', '0');
          smoke.setAttribute('cy', '0');
          smoke.setAttribute('r', radius.toFixed(3));
          smoke.setAttribute('fill', particle.color);
          group.appendChild(smoke);

          monsBoardParticlesLayer.appendChild(group);
        }
      } else if (isDemon) {
        const coreOpacity = Math.max(0, 0.95 * (1 - progress));
        const coreRadius = 0.24 * (1 + easeOutCubic(progress) * 4.2);
        if (coreOpacity > 0) {
          const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          core.setAttribute('cx', baseX.toFixed(3));
          core.setAttribute('cy', baseY.toFixed(3));
          core.setAttribute('r', coreRadius.toFixed(3));
          core.setAttribute('fill', '#FFD59A');
          core.setAttribute('opacity', coreOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(core);
        }
        for (const particle of demonParticles) {
          const localProgress = clamp01((elapsedMs - particle.delayMs) / particle.durationMs);
          const traveled = easeOutCubic(localProgress);
          const px = particle.dx * traveled;
          const py = particle.dy * traveled;
          const radius = Math.max(0.004, particle.size * (1 - 0.85 * localProgress));
          const opacity = Math.max(0, particle.opacity * (1 - localProgress) * 1.08);
          if (opacity <= 0) {
            continue;
          }
          const flameAngleDeg = (Math.atan2(particle.dy, particle.dx) * 180) / Math.PI + 90;
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('transform', `translate(${(baseX + px).toFixed(3)} ${(baseY + py).toFixed(3)})`);
          group.setAttribute('opacity', opacity.toFixed(3));

          const flame = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          flame.setAttribute('cx', '0');
          flame.setAttribute('cy', '0');
          flame.setAttribute('rx', (radius * 0.58).toFixed(3));
          flame.setAttribute('ry', (radius * 1.55).toFixed(3));
          flame.setAttribute('fill', particle.color);
          flame.setAttribute('transform', `rotate(${flameAngleDeg.toFixed(2)})`);
          group.appendChild(flame);

          const ember = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ember.setAttribute('cx', '0');
          ember.setAttribute('cy', '0');
          ember.setAttribute('r', (radius * 0.32).toFixed(3));
          ember.setAttribute('fill', '#FFE3A4');
          ember.setAttribute('opacity', '0.78');
          group.appendChild(ember);

          monsBoardParticlesLayer.appendChild(group);
        }
      } else {
        const coreOpacity = Math.max(0, 1 - progress);
        const coreRadius = 0.18 * (1 + easeOutCubic(progress) * 4);
        const ringRadius = 0.28 + progress * 1.05;
        const ringOpacity = Math.max(0, 0.88 * (1 - progress));
        if (coreOpacity > 0) {
          const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          core.setAttribute('cx', baseX.toFixed(3));
          core.setAttribute('cy', baseY.toFixed(3));
          core.setAttribute('r', coreRadius.toFixed(3));
          core.setAttribute('fill', '#E7FAFF');
          core.setAttribute('opacity', coreOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(core);
        }
        if (ringOpacity > 0) {
          const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ring.setAttribute('cx', baseX.toFixed(3));
          ring.setAttribute('cy', baseY.toFixed(3));
          ring.setAttribute('r', ringRadius.toFixed(3));
          ring.setAttribute('fill', 'none');
          ring.setAttribute('stroke', '#7ED8FF');
          ring.setAttribute('stroke-width', '0.075');
          ring.setAttribute('opacity', ringOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(ring);
        }
        for (const particle of mysticParticles) {
          const localProgress = clamp01((elapsedMs - particle.delayMs) / particle.durationMs);
          const traveled = easeOutCubic(localProgress);
          const x2 = particle.dx * traveled;
          const y2 = particle.dy * traveled;
          const opacity = Math.max(0, particle.opacity * (1 - localProgress));
          if (opacity <= 0) {
            continue;
          }
          const norm = Math.max(0.0001, Math.sqrt(particle.dx * particle.dx + particle.dy * particle.dy));
          const perpX = -particle.dy / norm;
          const perpY = particle.dx / norm;
          const bend = (1 - localProgress) * 0.11;
          const midX = x2 * 0.52 + perpX * bend;
          const midY = y2 * 0.52 + perpY * bend;
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('opacity', opacity.toFixed(3));

          const bolt = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
          bolt.setAttribute(
            'points',
            `${baseX.toFixed(3)},${baseY.toFixed(3)} ${(baseX + midX).toFixed(3)},${(baseY + midY).toFixed(3)} ${(baseX + x2).toFixed(3)},${(baseY + y2).toFixed(3)}`
          );
          bolt.setAttribute('fill', 'none');
          bolt.setAttribute('stroke', particle.color);
          bolt.setAttribute('stroke-width', String(Math.max(0.022, particle.size * 1.25)));
          bolt.setAttribute('stroke-linecap', 'round');
          bolt.setAttribute('stroke-linejoin', 'round');
          group.appendChild(bolt);

          const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          spark.setAttribute('cx', (baseX + x2).toFixed(3));
          spark.setAttribute('cy', (baseY + y2).toFixed(3));
          spark.setAttribute('r', String(Math.max(0.012, particle.size * 0.42)));
          spark.setAttribute('fill', '#E6FAFF');
          spark.setAttribute('opacity', '0.86');
          group.appendChild(spark);

          monsBoardParticlesLayer.appendChild(group);
        }
      }
    }

    if (isSpirit) {
      const progress = clamp01(elapsed / MONS_PARTICLE_DURATION_MS);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      if (progress < 1) {
        shouldContinue = true;
      }
      for (const particle of spiritParticles) {
        const x = particle.x + particle.vx * easedProgress;
        const y = particle.y + particle.vy * easedProgress + particle.jitter * easedProgress;
        const size = particle.size * (1 - progress * 0.58);
        const opacity = Math.max(0, (1 - progress) * 0.95);
        if (opacity <= 0) {
          continue;
        }
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x.toFixed(3));
        dot.setAttribute('cy', y.toFixed(3));
        dot.setAttribute('r', Math.max(0.009, size).toFixed(3));
        dot.setAttribute('fill', particle.fill);
        dot.setAttribute('opacity', opacity.toFixed(3));
        monsBoardParticlesLayer.appendChild(dot);
      }
      if (Number.isFinite(lastMove.toCol) && Number.isFinite(lastMove.toRow)) {
        const toX = Number(lastMove.toCol) + 0.5;
        const toY = Number(lastMove.toRow) + 0.5;
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const ringRadius = 0.18 + easedProgress * 0.3;
        ring.setAttribute('cx', toX.toFixed(3));
        ring.setAttribute('cy', toY.toFixed(3));
        ring.setAttribute('r', ringRadius.toFixed(3));
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', 'rgba(186, 255, 240, 0.9)');
        ring.setAttribute('stroke-width', '0.055');
        ring.setAttribute('opacity', Math.max(0, 1 - progress * 1.15).toFixed(3));
        monsBoardParticlesLayer.appendChild(ring);
      }
    }

    if (hasScoredMana) {
      const moveProgress = clamp01(elapsed / MONS_SCORED_MANA_TRAVEL_MS);
      const easedMoveProgress = easeOutCubic(moveProgress);
      const currentCol = scoreFromCol + (scoreToCol - scoreFromCol) * easedMoveProgress;
      const currentRow = scoreFromRow + (scoreToRow - scoreFromRow) * easedMoveProgress;
      let fadeOpacity = 1;
      if (elapsed > MONS_SCORED_MANA_TRAVEL_MS) {
        const fadeProgress = clamp01((elapsed - MONS_SCORED_MANA_TRAVEL_MS) / MONS_SCORED_MANA_FADE_OUT_MS);
        fadeOpacity = Math.max(0, 1 - fadeProgress);
      }
      if (fadeOpacity > 0) {
        const scoredImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        scoredImage.setAttribute('href', scoredPieceHref);
        scoredImage.setAttribute('x', currentCol.toFixed(3));
        scoredImage.setAttribute('y', currentRow.toFixed(3));
        scoredImage.setAttribute('width', '1');
        scoredImage.setAttribute('height', '1');
        scoredImage.setAttribute('opacity', fadeOpacity.toFixed(3));
        scoredImage.setAttribute('style', 'image-rendering: crisp-edges; pointer-events: none;');
        monsBoardParticlesLayer.appendChild(scoredImage);
      }

      const pulseProgress = clamp01((elapsed - MONS_SCORED_MANA_TRAVEL_MS) / MONS_MANA_POOL_PULSE_MS);
      if (pulseProgress > 0) {
        const pulseCenterX = scoreToCol + 0.5;
        const pulseCenterY = scoreToRow + 0.5;
        const fillRadius = 0.22 * (1 + 1.7 * pulseProgress);
        const fillOpacity = Math.max(0, 0.86 * (1 - pulseProgress));
        if (fillOpacity > 0) {
          const fillPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          fillPulse.setAttribute('cx', pulseCenterX.toFixed(3));
          fillPulse.setAttribute('cy', pulseCenterY.toFixed(3));
          fillPulse.setAttribute('r', fillRadius.toFixed(3));
          fillPulse.setAttribute('fill', '#8CB4FF');
          fillPulse.setAttribute('opacity', fillOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(fillPulse);
        }
        const ringRadius = 0.28 * (1 + 2.4 * pulseProgress);
        const ringOpacity = Math.max(0, 1 - pulseProgress);
        if (ringOpacity > 0) {
          const ringPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ringPulse.setAttribute('cx', pulseCenterX.toFixed(3));
          ringPulse.setAttribute('cy', pulseCenterY.toFixed(3));
          ringPulse.setAttribute('r', ringRadius.toFixed(3));
          ringPulse.setAttribute('fill', 'none');
          ringPulse.setAttribute('stroke', '#DDEAFF');
          ringPulse.setAttribute('stroke-width', '0.07');
          ringPulse.setAttribute('opacity', ringOpacity.toFixed(3));
          monsBoardParticlesLayer.appendChild(ringPulse);
        }
      }
    }

    if (!shouldContinue) {
      monsParticleAnimationRafId = 0;
      monsBoardParticlesLayer.textContent = '';
      return;
    }
    monsParticleAnimationRafId = window.requestAnimationFrame(step);
  };
  monsParticleAnimationRafId = window.requestAnimationFrame(step);
}

function renderMonsAbilityHints() {
  if (!monsBoardHintsLayer) {
    return;
  }
  monsBoardHintsLayer.textContent = '';
  if (monsBoardTilesLayer) {
    for (const staleUnderlay of monsBoardTilesLayer.querySelectorAll(
      '.mons-spirit-push-underlay, .mons-demon-rebound-underlay'
    )) {
      staleUnderlay.remove();
    }
  }
  const piecesPayload = monsGameState?.pieces;
  if (!piecesPayload || typeof piecesPayload !== 'object') {
    return;
  }
  const pieces = Object.values(piecesPayload).filter((piece) => piece && typeof piece === 'object');
  const selectedPiece = monsSelectionPieceId ? piecesPayload[monsSelectionPieceId] : null;

  function inBounds(row, col) {
    return row >= 0 && row < MONS_BOARD_SIZE && col >= 0 && col < MONS_BOARD_SIZE;
  }

  function getBaseType(piece) {
    return getMonsBaseTypeFromRenderType(piece?.type);
  }

  function isMonPiece(piece) {
    return MONS_MON_BASE_TYPES.has(getBaseType(piece));
  }

  function canPieceOccupyTile(piece, row, col) {
    if (!piece || typeof piece !== 'object') {
      return false;
    }
    if (!inBounds(row, col)) {
      return false;
    }
    const baseType = getBaseType(piece);
    if (row === MONS_CENTER_TILE.row && col === MONS_CENTER_TILE.col) {
      return baseType === 'drainer' || baseType === 'supermana';
    }
    const spawnOwner = MONS_MON_SPAWN_BY_TILE_KEY[`${row}-${col}`];
    if (!spawnOwner) {
      return true;
    }
    if (!MONS_MON_BASE_TYPES.has(baseType)) {
      return false;
    }
    return piece.side === spawnOwner.side && baseType === spawnOwner.type;
  }

  function isTileOccupiedByOtherPiece(row, col, ignoredIds = []) {
    const ignoredIdSet = new Set(ignoredIds.filter(Boolean));
    for (const piece of pieces) {
      if (isMonsItemPiece(piece)) {
        continue;
      }
      if (ignoredIdSet.has(piece.id)) {
        continue;
      }
      if (piece.row === row && piece.col === col) {
        return true;
      }
    }
    return false;
  }

  function getSpawnTileForPiece(piece) {
    const byId = MONS_MON_SPAWN_BY_ID[piece.id];
    if (byId) {
      return byId;
    }
    const baseType = getBaseType(piece);
    if (!MONS_MON_BASE_TYPES.has(baseType)) {
      return null;
    }
    return MONS_MON_SPAWN_BY_SIDE_AND_TYPE[`${piece.side}-${baseType}`] || null;
  }

  function isAbilityBlockedOnOwnSpawn(piece) {
    const baseType = getBaseType(piece);
    if (baseType !== 'spirit' && baseType !== 'demon' && baseType !== 'mystic') {
      return false;
    }
    const spawnTile = getSpawnTileForPiece(piece);
    if (!spawnTile) {
      return false;
    }
    return piece.row === spawnTile.row && piece.col === spawnTile.col;
  }

  function getSpiritPushOptions(targetPiece) {
    const options = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const row = targetPiece.row + rowOffset;
        const col = targetPiece.col + colOffset;
        if (!canPieceOccupyTile(targetPiece, row, col)) {
          continue;
        }
        if (isTileOccupiedByOtherPiece(row, col, [targetPiece.id])) {
          continue;
        }
        options.push({ row, col });
      }
    }
    return options;
  }

  function getDemonMiddleTile(sourcePiece, targetPiece) {
    const deltaCol = targetPiece.col - sourcePiece.col;
    const deltaRow = targetPiece.row - sourcePiece.row;
    if (Math.abs(deltaCol) === 2 && deltaRow === 0) {
      return {
        row: sourcePiece.row,
        col: sourcePiece.col + deltaCol / 2
      };
    }
    if (Math.abs(deltaRow) === 2 && deltaCol === 0) {
      return {
        row: sourcePiece.row + deltaRow / 2,
        col: sourcePiece.col
      };
    }
    return null;
  }

  function getProtectingAngels(targetPiece) {
    if (!targetPiece || !isMonPiece(targetPiece)) {
      return [];
    }
    if (targetPiece.side !== 'black' && targetPiece.side !== 'white') {
      return [];
    }
    return pieces.filter((piece) => {
      if (!piece || piece.id === targetPiece.id) {
        return false;
      }
      if (piece.side !== targetPiece.side) {
        return false;
      }
      if (getBaseType(piece) !== 'angel') {
        return false;
      }
      if (piece.faintedByAttack === true) {
        return false;
      }
      return Math.max(Math.abs(piece.col - targetPiece.col), Math.abs(piece.row - targetPiece.row)) === 1;
    });
  }

  function isEnemyFaintedAbilityTarget(sourcePiece, targetPiece) {
    if (!sourcePiece || !targetPiece) {
      return false;
    }
    if (!isMonPiece(targetPiece)) {
      return false;
    }
    if (targetPiece.faintedByAttack !== true) {
      return false;
    }
    if (sourcePiece.side === 'neutral' || targetPiece.side === 'neutral') {
      return false;
    }
    return sourcePiece.side !== targetPiece.side;
  }

  function canMysticAttackIgnoringAngel(attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    if (!isMonPiece(attacker) || !isMonPiece(target)) {
      return false;
    }
    if (getBaseType(attacker) !== 'mystic') {
      return false;
    }
    if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
      return false;
    }
    if (isEnemyFaintedAbilityTarget(attacker, target)) {
      return false;
    }
    if (isAbilityBlockedOnOwnSpawn(attacker)) {
      return false;
    }
    if (Math.abs(target.col - attacker.col) !== 2 || Math.abs(target.row - attacker.row) !== 2) {
      return false;
    }
    const targetSpawnTile = getSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    return !isTileOccupiedByOtherPiece(targetSpawnTile.row, targetSpawnTile.col, [target.id]);
  }

  function canDemonAttackIgnoringAngel(attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    if (!isMonPiece(attacker) || !isMonPiece(target)) {
      return false;
    }
    if (getBaseType(attacker) !== 'demon') {
      return false;
    }
    if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
      return false;
    }
    if (isEnemyFaintedAbilityTarget(attacker, target)) {
      return false;
    }
    if (isAbilityBlockedOnOwnSpawn(attacker)) {
      return false;
    }
    const middleTile = getDemonMiddleTile(attacker, target);
    if (!middleTile) {
      return false;
    }
    if (middleTile.row === MONS_CENTER_TILE.row && middleTile.col === MONS_CENTER_TILE.col) {
      return false;
    }
    if (isTileOccupiedByOtherPiece(middleTile.row, middleTile.col, [attacker.id, target.id])) {
      return false;
    }
    const targetSpawnTile = getSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    const attackerCanOccupyTarget = canPieceOccupyTile(attacker, target.row, target.col);
    const targetOnOwnSpawn = targetSpawnTile.row === target.row && targetSpawnTile.col === target.col;
    if (!attackerCanOccupyTarget && !targetOnOwnSpawn) {
      return false;
    }
    if (attackerCanOccupyTarget && targetOnOwnSpawn) {
      return false;
    }
    return !isTileOccupiedByOtherPiece(targetSpawnTile.row, targetSpawnTile.col, [target.id, attacker.id]);
  }

  function canBombAttackIgnoringAngel(attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    if (!isMonPiece(attacker) || !isMonPiece(target)) {
      return false;
    }
    if (attacker.heldItemType !== 'bomb') {
      return false;
    }
    if (attacker.faintedByAttack === true) {
      return false;
    }
    if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
      return false;
    }
    if (isEnemyFaintedAbilityTarget(attacker, target)) {
      return false;
    }
    const maxDistance = Math.max(Math.abs(target.col - attacker.col), Math.abs(target.row - attacker.row));
    if (maxDistance <= 0 || maxDistance > MONS_BOMB_ATTACK_RANGE) {
      return false;
    }
    const targetSpawnTile = getSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    return !isTileOccupiedByOtherPiece(targetSpawnTile.row, targetSpawnTile.col, [target.id]);
  }

  function appendRangeHint(col, row, color, options = {}) {
    const radius = Number.isFinite(options.radius) ? options.radius : 0.145;
    const strokeWidth = Number.isFinite(options.strokeWidth) ? options.strokeWidth : 0.055;
    const opacity = Number.isFinite(options.opacity) ? options.opacity : 0.2;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', String(col + 0.5));
    marker.setAttribute('cy', String(row + 0.5));
    marker.setAttribute('r', String(radius));
    marker.setAttribute('fill', 'none');
    marker.setAttribute('stroke', color);
    marker.setAttribute('stroke-width', String(strokeWidth));
    marker.setAttribute('opacity', String(opacity));
    if (options.glow === true) {
      marker.style.filter = `drop-shadow(0 0 0.08px ${color}) drop-shadow(0 0 0.13px ${color})`;
    }
    marker.setAttribute('pointer-events', 'none');
    monsBoardHintsLayer.appendChild(marker);
  }

  function appendTargetIndicator(piece, color, options = {}) {
    const cornerSize = Number.isFinite(options.cornerSize) ? options.cornerSize : 0.24;
    const opacity = Number.isFinite(options.opacity) ? options.opacity : 0.92;
    const left = piece.col;
    const top = piece.row;
    const right = piece.col + 1;
    const bottom = piece.row + 1;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('opacity', String(opacity));
    group.setAttribute('pointer-events', 'none');
    if (options.glow === true) {
      group.style.filter = `drop-shadow(0 0 0.09px ${color}) drop-shadow(0 0 0.16px ${color})`;
    }
    const polygons = [
      `${left},${top} ${left + cornerSize},${top} ${left},${top + cornerSize}`,
      `${right},${top} ${right - cornerSize},${top} ${right},${top + cornerSize}`,
      `${left},${bottom} ${left + cornerSize},${bottom} ${left},${bottom - cornerSize}`,
      `${right},${bottom} ${right - cornerSize},${bottom} ${right},${bottom - cornerSize}`
    ];
    for (const points of polygons) {
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points);
      polygon.setAttribute('fill', color);
      group.appendChild(polygon);
    }
    monsBoardHintsLayer.appendChild(group);
  }

  function appendAngelZoneForPiece(piece) {
    const minCol = Math.max(0, piece.col - 1);
    const minRow = Math.max(0, piece.row - 1);
    const maxCol = Math.min(MONS_BOARD_SIZE, piece.col + 2);
    const maxRow = Math.min(MONS_BOARD_SIZE, piece.row + 2);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('pointer-events', 'none');
    group.style.filter =
      `drop-shadow(0 0 0.1px ${MONS_ANGEL_ZONE_COLOR}) drop-shadow(0 0 0.16px ${MONS_ANGEL_ZONE_COLOR})`;

    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    pulse.setAttribute('attributeName', 'opacity');
    pulse.setAttribute('values', '0.66;1;0.66');
    pulse.setAttribute('dur', '1100ms');
    pulse.setAttribute('repeatCount', 'indefinite');
    group.appendChild(pulse);

    const outer = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outer.setAttribute('x', String(minCol));
    outer.setAttribute('y', String(minRow));
    outer.setAttribute('width', String(maxCol - minCol));
    outer.setAttribute('height', String(maxRow - minRow));
    outer.setAttribute('fill', 'none');
    outer.setAttribute('stroke', MONS_ANGEL_ZONE_COLOR);
    outer.setAttribute('stroke-width', '0.1');
    outer.setAttribute('opacity', '0.26');
    outer.setAttribute('shape-rendering', 'geometricPrecision');
    group.appendChild(outer);

    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    inner.setAttribute('x', String(minCol));
    inner.setAttribute('y', String(minRow));
    inner.setAttribute('width', String(maxCol - minCol));
    inner.setAttribute('height', String(maxRow - minRow));
    inner.setAttribute('fill', 'none');
    inner.setAttribute('stroke', MONS_ANGEL_ZONE_COLOR);
    inner.setAttribute('stroke-width', '0.05');
    inner.setAttribute('opacity', '0.56');
    inner.setAttribute('shape-rendering', 'geometricPrecision');
    group.appendChild(inner);

    monsBoardHintsLayer.appendChild(group);
  }

  function appendBombRangeBox(piece) {
    const minCol = Math.max(0, piece.col - MONS_BOMB_ATTACK_RANGE);
    const minRow = Math.max(0, piece.row - MONS_BOMB_ATTACK_RANGE);
    const maxCol = Math.min(MONS_BOARD_SIZE, piece.col + MONS_BOMB_ATTACK_RANGE + 1);
    const maxRow = Math.min(MONS_BOARD_SIZE, piece.row + MONS_BOMB_ATTACK_RANGE + 1);

    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    fill.setAttribute('x', String(minCol));
    fill.setAttribute('y', String(minRow));
    fill.setAttribute('width', String(maxCol - minCol));
    fill.setAttribute('height', String(maxRow - minRow));
    fill.setAttribute('fill', MONS_ATTACK_INDICATOR_COLOR);
    fill.setAttribute('opacity', '0.1');
    fill.setAttribute('pointer-events', 'none');
    monsBoardHintsLayer.appendChild(fill);

    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outline.setAttribute('x', String(minCol + 0.04));
    outline.setAttribute('y', String(minRow + 0.04));
    outline.setAttribute('width', String(Math.max(0, maxCol - minCol - 0.08)));
    outline.setAttribute('height', String(Math.max(0, maxRow - minRow - 0.08)));
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', MONS_ATTACK_INDICATOR_COLOR);
    outline.setAttribute('stroke-width', '0.06');
    outline.setAttribute('opacity', '0.72');
    outline.setAttribute('pointer-events', 'none');
    monsBoardHintsLayer.appendChild(outline);
  }

  if (!monsPendingSpiritPush && !monsPendingDemonRebound && selectedPiece && typeof selectedPiece === 'object') {
    const occupiedTileKeySet = new Set(
      pieces.filter((piece) => !isMonsItemPiece(piece)).map((piece) => `${piece.row}-${piece.col}`)
    );
    const shownHintTileKeySet = new Set();
    const shownAngelZoneKeySet = new Set();
    const selectedBaseType = getBaseType(selectedPiece);
    const selectedHasBomb =
      isMonPiece(selectedPiece) && selectedPiece.faintedByAttack !== true && selectedPiece.heldItemType === 'bomb';
    const canUseActiveAbility = !selectedHasBomb && !isAbilityBlockedOnOwnSpawn(selectedPiece);

    const maybeAddRangeHint = (col, row, color, options = {}) => {
      if (!inBounds(row, col)) {
        return;
      }
      const tileKey = `${row}-${col}`;
      if (occupiedTileKeySet.has(tileKey) || shownHintTileKeySet.has(tileKey)) {
        return;
      }
      shownHintTileKeySet.add(tileKey);
      appendRangeHint(col, row, color, options);
    };

    if (selectedBaseType === 'angel' && selectedPiece.faintedByAttack !== true) {
      shownAngelZoneKeySet.add(selectedPiece.id);
      appendAngelZoneForPiece(selectedPiece);
    }

    if (selectedHasBomb) {
      appendBombRangeBox(selectedPiece);
      for (const targetPiece of pieces) {
        if (!isMonPiece(targetPiece)) {
          continue;
        }
        if (targetPiece.side === selectedPiece.side || targetPiece.side === 'neutral') {
          continue;
        }
        if (!canBombAttackIgnoringAngel(selectedPiece, targetPiece)) {
          continue;
        }
        appendTargetIndicator(targetPiece, MONS_ATTACK_INDICATOR_COLOR);
      }
    } else if (canUseActiveAbility) {
      if (selectedBaseType === 'spirit') {
        for (let row = 0; row < MONS_BOARD_SIZE; row += 1) {
          for (let col = 0; col < MONS_BOARD_SIZE; col += 1) {
            const maxDistance = Math.max(Math.abs(col - selectedPiece.col), Math.abs(row - selectedPiece.row));
            if (maxDistance === 2 && (col !== selectedPiece.col || row !== selectedPiece.row)) {
              maybeAddRangeHint(col, row, MONS_SPIRIT_INDICATOR_COLOR, {
                radius: 0.162,
                strokeWidth: 0.055,
                opacity: 0.22
              });
            }
          }
        }
        for (const targetPiece of pieces) {
          if (targetPiece.id === selectedPiece.id) {
            continue;
          }
          if (isEnemyFaintedAbilityTarget(selectedPiece, targetPiece)) {
            continue;
          }
          const maxDistance = Math.max(
            Math.abs(targetPiece.col - selectedPiece.col),
            Math.abs(targetPiece.row - selectedPiece.row)
          );
          if (maxDistance !== 2 || (targetPiece.col === selectedPiece.col && targetPiece.row === selectedPiece.row)) {
            continue;
          }
          if (getSpiritPushOptions(targetPiece).length === 0) {
            continue;
          }
          appendTargetIndicator(targetPiece, MONS_SPIRIT_INDICATOR_COLOR, {
            cornerSize: 0.25,
            opacity: 0.98
          });
        }
      } else if (selectedBaseType === 'mystic') {
        const diagonalSteps = [
          [2, 2],
          [-2, 2],
          [2, -2],
          [-2, -2]
        ];
        for (const [deltaCol, deltaRow] of diagonalSteps) {
          maybeAddRangeHint(selectedPiece.col + deltaCol, selectedPiece.row + deltaRow, MONS_ATTACK_INDICATOR_COLOR);
        }
        for (const targetPiece of pieces) {
          if (!isMonPiece(targetPiece)) {
            continue;
          }
          if (targetPiece.side === selectedPiece.side || targetPiece.side === 'neutral') {
            continue;
          }
          if (!canMysticAttackIgnoringAngel(selectedPiece, targetPiece)) {
            continue;
          }
          const protectingAngels = getProtectingAngels(targetPiece);
          if (protectingAngels.length > 0) {
            appendTargetIndicator(targetPiece, MONS_BLOCKED_INDICATOR_COLOR);
            for (const angel of protectingAngels) {
              if (shownAngelZoneKeySet.has(angel.id)) {
                continue;
              }
              shownAngelZoneKeySet.add(angel.id);
              appendAngelZoneForPiece(angel);
            }
            continue;
          }
          appendTargetIndicator(targetPiece, MONS_ATTACK_INDICATOR_COLOR);
        }
      } else if (selectedBaseType === 'demon') {
        const orthogonalSteps = [
          [2, 0],
          [-2, 0],
          [0, 2],
          [0, -2]
        ];
        for (const [deltaCol, deltaRow] of orthogonalSteps) {
          const targetCol = selectedPiece.col + deltaCol;
          const targetRow = selectedPiece.row + deltaRow;
          const middleTile = getDemonMiddleTile(selectedPiece, { row: targetRow, col: targetCol });
          if (!middleTile) {
            continue;
          }
          if (middleTile.row === MONS_CENTER_TILE.row && middleTile.col === MONS_CENTER_TILE.col) {
            continue;
          }
          if (isTileOccupiedByOtherPiece(middleTile.row, middleTile.col, [selectedPiece.id])) {
            continue;
          }
          maybeAddRangeHint(targetCol, targetRow, MONS_ATTACK_INDICATOR_COLOR);
        }
        for (const targetPiece of pieces) {
          if (!isMonPiece(targetPiece)) {
            continue;
          }
          if (targetPiece.side === selectedPiece.side || targetPiece.side === 'neutral') {
            continue;
          }
          if (!canDemonAttackIgnoringAngel(selectedPiece, targetPiece)) {
            continue;
          }
          const protectingAngels = getProtectingAngels(targetPiece);
          if (protectingAngels.length > 0) {
            appendTargetIndicator(targetPiece, MONS_BLOCKED_INDICATOR_COLOR);
            for (const angel of protectingAngels) {
              if (shownAngelZoneKeySet.has(angel.id)) {
                continue;
              }
              shownAngelZoneKeySet.add(angel.id);
              appendAngelZoneForPiece(angel);
            }
            continue;
          }
          appendTargetIndicator(targetPiece, MONS_ATTACK_INDICATOR_COLOR);
        }
      }
    }
  }

  if (monsPendingSpiritPush && Array.isArray(monsPendingSpiritPush.options) && monsPendingSpiritPush.options.length > 0) {
    const targetRow = Number(monsPendingSpiritPush.targetRow);
    const targetCol = Number(monsPendingSpiritPush.targetCol);
    if (Number.isFinite(targetRow) && Number.isFinite(targetCol) && monsBoardTilesLayer) {
      const targetRing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      targetRing.classList.add('mons-spirit-push-underlay');
      targetRing.setAttribute('x', String(targetCol + 0.06));
      targetRing.setAttribute('y', String(targetRow + 0.06));
      targetRing.setAttribute('width', '0.88');
      targetRing.setAttribute('height', '0.88');
      targetRing.setAttribute('fill', 'none');
      targetRing.setAttribute('stroke', MONS_SPIRIT_INDICATOR_COLOR);
      targetRing.setAttribute('stroke-width', '0.06');
      targetRing.setAttribute('rx', '0.12');
      targetRing.setAttribute('pointer-events', 'none');
      monsBoardTilesLayer.appendChild(targetRing);
    }

    for (const option of monsPendingSpiritPush.options) {
      if (!option || !Number.isFinite(option.row) || !Number.isFinite(option.col)) {
        continue;
      }
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      marker.setAttribute('cx', String(option.col + 0.5));
      marker.setAttribute('cy', String(option.row + 0.5));
      marker.setAttribute('r', '0.13');
      marker.setAttribute('fill', 'rgba(177, 76, 255, 0.44)');
      marker.setAttribute('data-mons-row', String(option.row));
      marker.setAttribute('data-mons-col', String(option.col));
      marker.style.cursor = 'pointer';
      monsBoardHintsLayer.appendChild(marker);
    }
  }

  if (!monsPendingDemonRebound || !Array.isArray(monsPendingDemonRebound.options) || monsPendingDemonRebound.options.length === 0) {
    return;
  }

  const reboundTargetRow = Number(monsPendingDemonRebound.targetRow);
  const reboundTargetCol = Number(monsPendingDemonRebound.targetCol);
  if (Number.isFinite(reboundTargetRow) && Number.isFinite(reboundTargetCol) && monsBoardTilesLayer) {
    const targetRing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    targetRing.classList.add('mons-demon-rebound-underlay');
    targetRing.setAttribute('x', String(reboundTargetCol + 0.06));
    targetRing.setAttribute('y', String(reboundTargetRow + 0.06));
    targetRing.setAttribute('width', '0.88');
    targetRing.setAttribute('height', '0.88');
    targetRing.setAttribute('fill', 'none');
    targetRing.setAttribute('stroke', MONS_ATTACK_INDICATOR_COLOR);
    targetRing.setAttribute('stroke-width', '0.06');
    targetRing.setAttribute('rx', '0.12');
    targetRing.setAttribute('pointer-events', 'none');
    monsBoardTilesLayer.appendChild(targetRing);
  }

  for (const option of monsPendingDemonRebound.options) {
    if (!option || !Number.isFinite(option.row) || !Number.isFinite(option.col)) {
      continue;
    }
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', String(option.col + 0.5));
    marker.setAttribute('cy', String(option.row + 0.5));
    marker.setAttribute('r', '0.13');
    marker.setAttribute('fill', 'rgba(255, 122, 89, 0.48)');
    marker.setAttribute('data-mons-row', String(option.row));
    marker.setAttribute('data-mons-col', String(option.col));
    marker.style.cursor = 'pointer';
    monsBoardHintsLayer.appendChild(marker);
  }
}

function renderMonsPieces() {
  if (!monsBoardPiecesLayer || !monsGameState?.pieces) {
    return;
  }
  monsBoardPiecesLayer.textContent = '';
  const boardFlipped = isMonsBoardFlipped(monsGameState);
  const pieceImageRendering = getMonsPieceImageRendering();
  const pieces = Object.values(monsGameState.pieces);
  let selectedPieceStillPresent = false;
  pieces.sort((left, right) => {
    const leftNeutral = left?.side === 'neutral' ? 0 : 1;
    const rightNeutral = right?.side === 'neutral' ? 0 : 1;
    if (leftNeutral !== rightNeutral) {
      return leftNeutral - rightNeutral;
    }
    return String(left?.id || '').localeCompare(String(right?.id || ''));
  });
  for (const piece of pieces) {
    if (!piece || typeof piece !== 'object') {
      continue;
    }
    const href = MONS_PIECE_ASSET_BY_TYPE[piece.type];
    if (!href) {
      continue;
    }
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('data-mons-piece-id', String(piece.id));
    group.setAttribute('data-mons-row', String(piece.row));
    group.setAttribute('data-mons-col', String(piece.col));
    group.style.cursor = 'pointer';
    if (boardFlipped) {
      group.setAttribute('transform', `rotate(180 ${piece.col + 0.5} ${piece.row + 0.5})`);
    }

    if (monsSelectionPieceId && piece.id === monsSelectionPieceId) {
      selectedPieceStillPresent = true;
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      ring.setAttribute('x', String(piece.col + 0.05));
      ring.setAttribute('y', String(piece.row + 0.05));
      ring.setAttribute('width', '0.9');
      ring.setAttribute('height', '0.9');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', 'rgba(255, 255, 255, 0.95)');
      ring.setAttribute('stroke-width', '0.08');
      ring.setAttribute('rx', '0.12');
      ring.style.filter =
        'drop-shadow(0 0 0.12px rgba(9, 12, 16, 0.38)) drop-shadow(0 0 0.22px rgba(9, 12, 16, 0.24))';
      group.appendChild(ring);
    }

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', href);
    image.setAttribute('x', String(piece.col));
    image.setAttribute('y', String(piece.row));
    image.setAttribute('width', '1');
    image.setAttribute('height', '1');
    if (piece.faintedByAttack === true) {
      image.setAttribute('transform', `rotate(90 ${piece.col + 0.5} ${piece.row + 0.5})`);
    }
    image.setAttribute('style', `image-rendering: ${pieceImageRendering}; pointer-events: none;`);
    group.appendChild(image);
    appendMonsDrainerCarryOverlay(group, piece);

    monsBoardPiecesLayer.appendChild(group);
  }
  if (monsSelectionPieceId && !selectedPieceStillPresent) {
    monsSelectionPieceId = '';
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
  }
}

function renderMonsSpawnGhosts() {
  if (!monsBoardGhostsLayer || !monsGameState?.pieces) {
    return;
  }
  monsBoardGhostsLayer.textContent = '';
  const boardFlipped = isMonsBoardFlipped(monsGameState);
  const pieceImageRendering = getMonsPieceImageRendering();
  const occupiedTileKeys = new Set();
  for (const piece of Object.values(monsGameState.pieces)) {
    if (!piece || typeof piece !== 'object') {
      continue;
    }
    occupiedTileKeys.add(`${piece.row}-${piece.col}`);
  }
  const ghostSize = MONS_SPAWN_GHOST_SCALE;
  const ghostInset = (1 - ghostSize) / 2;
  for (const spawnPiece of MONS_DEFAULT_PIECES) {
    if (!spawnPiece || !MONS_MON_BASE_TYPES.has(getMonsBaseTypeFromRenderType(spawnPiece.type))) {
      continue;
    }
    const tileKey = `${spawnPiece.row}-${spawnPiece.col}`;
    if (occupiedTileKeys.has(tileKey)) {
      continue;
    }
    const href = MONS_PIECE_ASSET_BY_TYPE[spawnPiece.type];
    if (!href) {
      continue;
    }
    const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    ghost.setAttribute('href', href);
    ghost.setAttribute('x', String(spawnPiece.col + ghostInset));
    ghost.setAttribute('y', String(spawnPiece.row + ghostInset));
    ghost.setAttribute('width', String(ghostSize));
    ghost.setAttribute('height', String(ghostSize));
    if (boardFlipped) {
      ghost.setAttribute('transform', `rotate(180 ${spawnPiece.col + 0.5} ${spawnPiece.row + 0.5})`);
    }
    ghost.setAttribute('opacity', String(MONS_SPAWN_GHOST_OPACITY));
    ghost.setAttribute('style', `image-rendering: ${pieceImageRendering}; pointer-events: none;`);
    monsBoardGhostsLayer.appendChild(ghost);
  }
}

function renderMonsBoard() {
  monsGameState = getMonsGameStateById(activeMonsGameId);
  if (!monsGameState || monsGameState.enabled === false) {
    hideMonsBoardElements();
    renderInactiveMonsBoardGhosts();
    return;
  }

  ensureMonsBoardElements();
  if (!monsGameShell || !monsMoveButton || !monsOptionsButton || !monsBoardSvg || !monsHud) {
    return;
  }
  if (monsSelectionPieceId) {
    const selectedPiece = monsGameState.pieces?.[monsSelectionPieceId] || null;
    if (!selectedPiece || !canCurrentPlayerControlMonsPieceFromPayload(monsGameState, selectedPiece)) {
      monsSelectionPieceId = '';
      monsPendingSpiritPush = null;
      monsPendingDemonRebound = null;
    }
  }

  const boardScreen = worldToScreen({ x: monsGameState.x, y: monsGameState.y });
  const boardScreenWidth = snapToDevicePixel(monsGameState.width * camera.scale);
  const boardScreenHeight = snapToDevicePixel(monsGameState.height * camera.scale);
  const hudScreenHeight = snapToDevicePixel(Math.max(24, boardScreenHeight - boardScreenWidth), 24);
  const showHudPotions = shouldShowMonsHudPotions(boardScreenWidth);
  const controlSize = MONS_MOVE_CONTROL_SIZE;
  const controlGap = DECK_CONTROL_GAP;

  monsGameShell.classList.remove('hidden');
  monsGameShell.style.left = `${boardScreen.x}px`;
  monsGameShell.style.top = `${boardScreen.y}px`;
  monsGameShell.style.width = `${boardScreenWidth}px`;
  monsGameShell.style.height = `${boardScreenHeight}px`;
  monsBoardSvg.style.width = `${boardScreenWidth}px`;
  monsBoardSvg.style.height = `${boardScreenWidth}px`;
  applyMonsBoardOrientation(monsBoardSvg, isMonsBoardFlipped(monsGameState));
  monsHud.style.width = `${boardScreenWidth}px`;
  monsHud.style.height = `${hudScreenHeight}px`;

  renderMonsSpawnGhosts();
  renderMonsPieces();
  renderMonsAbilityHints();
  if (monsScoreBlackLabel) {
    monsScoreBlackLabel.textContent = String(Math.max(0, Number(monsGameState.scores?.black) || 0));
  }
  if (monsScoreWhiteLabel) {
    monsScoreWhiteLabel.textContent = String(Math.max(0, Number(monsGameState.scores?.white) || 0));
  }
  if (monsPotionsBlackTray) {
    renderMonsPotionTray(monsPotionsBlackTray, monsGameState.potions?.black, 'black', showHudPotions);
  }
  if (monsPotionsWhiteTray) {
    renderMonsPotionTray(monsPotionsWhiteTray, monsGameState.potions?.white, 'white', showHudPotions);
  }
  if (monsUndoButton) {
    monsUndoButton.classList.toggle('hidden', !showHudPotions);
  }
  if (monsFlipButton) {
    monsFlipButton.classList.toggle('hidden', !showHudPotions);
    monsFlipButton.classList.toggle('is-flipped', isMonsBoardFlipped(monsGameState));
  }
  renderMonsSideClaimsList(monsBlackClaimsList, monsGameState.claims?.black, 'black', monsBlackClaimButton);
  renderMonsSideClaimsList(monsWhiteClaimsList, monsGameState.claims?.white, 'white', monsWhiteClaimButton);
  positionMonsSideClaimsLists(
    monsBlackClaimsList,
    monsWhiteClaimsList,
    monsBlackClaimButton,
    monsWhiteClaimButton,
    boardScreen,
    boardScreenWidth,
    boardScreenHeight
  );
  if (monsUndoButton) {
    const undoHistory = Array.isArray(monsGameState.undoHistory) ? monsGameState.undoHistory : [];
    const topUndoEntry = undoHistory.length > 0 ? undoHistory[undoHistory.length - 1] : null;
    const canUndo = canCurrentPlayerUndoMonsEntry(topUndoEntry);
    monsUndoButton.disabled = !canUndo;
    monsUndoButton.classList.toggle('is-disabled', !canUndo);
  }
  if (monsGameState.moveTick > 0 && monsGameState.moveTick !== lastRenderedMonsMoveTick) {
    if (lastRenderedMonsMoveTick > 0 && monsGameState.lastMove) {
      triggerMonsAbilityEffect(monsGameState.lastMove);
    }
    lastRenderedMonsMoveTick = monsGameState.moveTick;
  }

  monsMoveButton.classList.remove('hidden');
  monsMoveButton.style.left = `${boardScreen.x + boardScreenWidth / 2 + controlGap + controlSize / 2}px`;
  monsMoveButton.style.top = `${boardScreen.y + boardScreenHeight / 2 - controlSize / 2}px`;
  monsMoveButton.style.width = `${controlSize}px`;
  monsMoveButton.style.height = `${controlSize}px`;
  monsMoveButton.classList.toggle('is-held-by-self', monsGameState.holderClientId === localClientId);
  monsMoveButton.classList.toggle('is-group-selected', selectedMonsGameIds.has(normalizeMonsGameId(activeMonsGameId)));

  monsOptionsButton.classList.remove('hidden');
  monsOptionsButton.style.left = monsMoveButton.style.left;
  monsOptionsButton.style.top = `${boardScreen.y + boardScreenHeight / 2 - (controlSize * 1.5 + controlGap)}px`;
  monsOptionsButton.style.width = `${controlSize}px`;
  monsOptionsButton.style.height = `${controlSize}px`;
  renderInactiveMonsBoardGhosts();
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

function normalizeImageComponentSrc(src) {
  return typeof src === 'string' ? src.trim() : '';
}

function isImageComponentCard(cardState) {
  return Boolean(cardState && typeof cardState === 'object' && cardState.componentType === 'image');
}

function canCardUseDeckZones(cardState) {
  return !isImageComponentCard(cardState) || cardState.componentCardSized !== false;
}

function getFaceWhenEnteringHand(cardState) {
  if (!isImageComponentCard(cardState)) {
    return 'front';
  }
  return cardState?.face === 'back' ? 'back' : 'front';
}

function isResizableImageComponentCard(cardState) {
  const heldByOther = Boolean(cardState?.holderClientId) && cardState.holderClientId !== localClientId;
  return Boolean(
    cardState &&
    isImageComponentCard(cardState) &&
    cardState.componentCardSized === false &&
    !heldByOther &&
    !cardState.inDeck &&
    !cardState.inDiscard &&
    !cardState.inAuction &&
    !getCardHandOwnerId(cardState)
  );
}

function clampImageComponentSize(widthValue, heightValue) {
  let width = Number(widthValue);
  let height = Number(heightValue);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    return { width: CARD_WIDTH, height: CARD_HEIGHT };
  }
  width = Math.max(IMAGE_COMPONENT_MIN_WORLD_SIZE, width);
  height = Math.max(IMAGE_COMPONENT_MIN_WORLD_SIZE, height);
  const maxWidth = Math.max(IMAGE_COMPONENT_MIN_WORLD_SIZE, Math.min(IMAGE_COMPONENT_MAX_WORLD_WIDTH, WORLD_WIDTH - 20));
  const maxHeight = Math.max(IMAGE_COMPONENT_MIN_WORLD_SIZE, Math.min(IMAGE_COMPONENT_MAX_WORLD_HEIGHT, WORLD_HEIGHT - 20));
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: clamp(width * scale, IMAGE_COMPONENT_MIN_WORLD_SIZE, maxWidth),
    height: clamp(height * scale, IMAGE_COMPONENT_MIN_WORLD_SIZE, maxHeight)
  };
}

function getCardTableDimensions(cardState) {
  if (!cardState || typeof cardState !== 'object') {
    return { width: CARD_WIDTH, height: CARD_HEIGHT };
  }
  if (!isImageComponentCard(cardState) || cardState.componentCardSized !== false) {
    return { width: CARD_WIDTH, height: CARD_HEIGHT };
  }
  return clampImageComponentSize(cardState.componentWidth, cardState.componentHeight);
}

function getCardBackDisplaySrc(cardState) {
  if (isImageComponentCard(cardState)) {
    const explicitBackSrc = normalizeImageComponentSrc(cardState.backSrc);
    if (explicitBackSrc) {
      return explicitBackSrc;
    }
    const fallbackFrontSrc = normalizeImageComponentSrc(cardState.frontSrc);
    return fallbackFrontSrc || CARD_BACK_IMAGE_SRC;
  }
  return CARD_BACK_IMAGE_SRC;
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
  const deckId = normalizeDeckId(payload?.deckId || DECK_KEY);
  const componentType = payload?.componentType === 'image' ? 'image' : '';
  const componentCardSized = componentType === 'image' ? payload?.componentCardSized !== false : true;
  const backSrc = componentType === 'image' ? normalizeImageComponentSrc(payload?.backSrc || '') : '';
  const componentSize = componentType === 'image' && !componentCardSized
    ? clampImageComponentSize(payload?.componentWidth, payload?.componentHeight)
    : { width: CARD_WIDTH, height: CARD_HEIGHT };
  const inAuction = Boolean(payload?.inAuction);
  const face = inAuction ? 'front' : payload?.face === 'front' ? 'front' : 'back';
  const boundsWidth = inAuction || Boolean(payload?.inDeck) || Boolean(payload?.inDiscard) ? CARD_WIDTH : componentSize.width;
  const boundsHeight = inAuction || Boolean(payload?.inDeck) || Boolean(payload?.inDiscard) ? CARD_HEIGHT : componentSize.height;
  return {
    x: Number.isFinite(nextX) ? clamp(nextX, boundsWidth / 2, WORLD_WIDTH - boundsWidth / 2) : WORLD_WIDTH / 2,
    y: Number.isFinite(nextY) ? clamp(nextY, boundsHeight / 2, WORLD_HEIGHT - boundsHeight / 2) : WORLD_HEIGHT / 2,
    z: Number.isFinite(nextZ) ? nextZ : 1,
    face,
    frontSrc: normalizedFrontSrc,
    backSrc,
    componentType,
    componentCardSized,
    componentWidth: componentSize.width,
    componentHeight: componentSize.height,
    deckId,
    inDeck: Boolean(payload?.inDeck),
    inDiscard: Boolean(payload?.inDiscard),
    inAuction,
    holderClientId,
    handOwnerClientId,
    handOwnerPlayerToken
  };
}

function removeDieElement(dieId) {
  const die = diceElements.get(dieId);
  if (!die) {
    return;
  }
  die.remove();
  diceElements.delete(dieId);
}

function ensureDieElement(dieId) {
  if (!cardLayer) {
    return null;
  }
  let die = diceElements.get(dieId);
  if (!die) {
    die = document.createElement('button');
    die.type = 'button';
    die.className = 'table-die';
    die.dataset.dieId = dieId;
    die.setAttribute('aria-label', 'dice');

    const face = document.createElement('div');
    face.className = 'table-die-face';
    die.appendChild(face);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'table-label-resize-handle hidden';
    resizeHandle.setAttribute('aria-hidden', 'true');
    resizeHandle.innerHTML =
      '<svg viewBox="0 0 16 16" width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 13L13 3M7 13L13 7M11 13L13 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    resizeHandle.addEventListener('pointerdown', (event) => {
      onLabelResizePointerDown(event, dieId);
    });
    resizeHandle.addEventListener('pointerenter', () => {
      die.classList.add('is-label-resize-hovered');
    });
    resizeHandle.addEventListener('pointerleave', () => {
      die.classList.remove('is-label-resize-hovered');
    });
    die.appendChild(resizeHandle);

    die.addEventListener('pointerdown', (event) => {
      onDiePointerDown(event, dieId);
    });
    die.addEventListener('contextmenu', (event) => {
      onDieContextMenu(event, dieId);
    });
    die.addEventListener('dblclick', (event) => {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (eventTarget?.closest('.table-label-editor')) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (drawModeEnabled) {
        return;
      }
      handleDieRollIntent(dieId).catch((error) => {
        console.error(error);
      });
    });

    cardLayer.appendChild(die);
    diceElements.set(dieId, die);
  }
  return die;
}

function renderDieFace(die, dieType, faceValue, dieState) {
  if (!(die instanceof HTMLElement)) {
    return;
  }
  const face = die.querySelector('.table-die-face');
  if (!(face instanceof HTMLElement)) {
    return;
  }
  const isLabel = dieType === 'label';
  if (isLabel) {
    if (die.dataset.labelEditing === '1') {
      return;
    }
    face.classList.add('table-label-text');
    face.textContent = normalizeLabelText(dieState?.text || '');
    return;
  }
  face.classList.remove('table-label-text');
  face.textContent = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('table-die-svg');
  face.appendChild(svg);

  if (dieType === 'coin') {
    const shell = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    shell.setAttribute('cx', '50');
    shell.setAttribute('cy', '50');
    shell.setAttribute('r', '40');
    shell.setAttribute('class', 'table-coin-shell');
    svg.appendChild(shell);

    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inner.setAttribute('cx', '50');
    inner.setAttribute('cy', '50');
    inner.setAttribute('r', '31');
    inner.setAttribute('class', 'table-coin-inner');
    svg.appendChild(inner);

    const sideImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    sideImage.setAttribute('x', '24');
    sideImage.setAttribute('y', '24');
    sideImage.setAttribute('width', '52');
    sideImage.setAttribute('height', '52');
    sideImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    sideImage.setAttribute('href', Number(faceValue) === 2 ? MONS_PIECE_ASSET_BY_TYPE.demon : MONS_PIECE_ASSET_BY_TYPE.angel);
    sideImage.setAttribute('class', 'table-coin-sprite');
    sideImage.setAttribute('style', `image-rendering: ${getMonsPieceImageRendering()}; pointer-events: none;`);
    svg.appendChild(sideImage);
    return;
  }

  if (dieType === 'd20') {
    const shell = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    shell.setAttribute('points', '50,10 84.64,30 84.64,70 50,90 15.36,70 15.36,30');
    shell.setAttribute('class', 'table-die-d20-shell');
    svg.appendChild(shell);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50');
    text.setAttribute('y', '50.5');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'table-die-number table-die-d20-number');
    text.textContent = String(clamp(Math.round(faceValue), 1, 20));
    svg.appendChild(text);
    return;
  }

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '10');
  rect.setAttribute('y', '10');
  rect.setAttribute('width', '80');
  rect.setAttribute('height', '80');
  rect.setAttribute('rx', '18');
  rect.setAttribute('class', 'table-die-outline');
  svg.appendChild(rect);

  const pips = D6_PIP_LAYOUTS[clamp(Math.round(faceValue), 1, 6)] || D6_PIP_LAYOUTS[1];
  for (const [pipX, pipY] of pips) {
    const pip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pip.setAttribute('cx', String(pipX));
    pip.setAttribute('cy', String(pipY));
    pip.setAttribute('r', '5.6');
    pip.setAttribute('class', 'table-die-pip');
    svg.appendChild(pip);
  }
}

function renderDieElement(dieId) {
  const dieState = diceById.get(dieId);
  if (!dieState) {
    removeDieElement(dieId);
    return false;
  }
  const die = ensureDieElement(dieId);
  if (!die) {
    return false;
  }
  const dieType = normalizeDieType(dieState.type);
  const dimensions = getDieWorldDimensions(dieState);
  const screen = worldToScreen({ x: dieState.x, y: dieState.y });
  const screenWidth = snapToDevicePixel(dimensions.width * camera.scale, 2);
  const screenHeight = snapToDevicePixel(dimensions.height * camera.scale, 2);
  die.style.left = `${screen.x}px`;
  die.style.top = `${screen.y}px`;
  die.style.width = `${screenWidth}px`;
  die.style.height = `${screenHeight}px`;

  const isHeld = Boolean(dieState.holderClientId);
  const heldBySelf = Boolean(localClientId) && dieState.holderClientId === localClientId;
  const heldByOther = Boolean(dieState.holderClientId) && dieState.holderClientId !== localClientId;
  if (selectedDiceIds.has(dieId) && dieState.holderClientId !== localClientId) {
    selectedDiceIds.delete(dieId);
  }
  if (isHeld) {
    const overlayLayer = ensureHeldCardLayer();
    if (overlayLayer && die.parentElement !== overlayLayer) {
      overlayLayer.appendChild(die);
    }
  } else if (cardLayer && die.parentElement !== cardLayer) {
    cardLayer.appendChild(die);
  }
  const baseZ = clamp(Math.round(dieState.z || 1), 1, DECK_UI_Z_INDEX - 1);
  const renderZ = isHeld ? HELD_CARD_Z_INDEX_BASE + baseZ : baseZ;
  die.style.zIndex = String(renderZ);

  const now = Date.now();
  const rolling = isDieRolling(dieState, now);
  const isLabel = dieType === 'label';
  const isResizingLabel = resizingLabelDieId === dieId;
  const isLabelEditing = die.dataset.labelEditing === '1';
  const canResizeLabel =
    isLabel &&
    !heldByOther &&
    !drawModeEnabled &&
    !deleteModeEnabled &&
    !isLabelEditing;
  die.classList.toggle('table-die-d20', dieType === 'd20');
  die.classList.toggle('table-die-d6', dieType === 'd6');
  die.classList.toggle('table-die-coin', dieType === 'coin');
  die.classList.toggle('table-die-label', isLabel);
  die.classList.toggle('is-held-by-self', heldBySelf);
  die.classList.toggle('is-held-by-other', heldByOther);
  die.classList.toggle('is-group-selected', selectedDiceIds.has(dieId));
  die.classList.toggle('is-rolling', rolling);
  die.classList.toggle('is-resizable-label', canResizeLabel);
  die.classList.toggle('is-resizing-label', isResizingLabel);
  if (!isResizingLabel && !canResizeLabel) {
    die.classList.remove('is-label-resize-hovered');
  }
  const labelResizeHandle = die.querySelector('.table-label-resize-handle');
  if (labelResizeHandle instanceof HTMLElement) {
    labelResizeHandle.classList.toggle('hidden', !canResizeLabel);
  }
  die.setAttribute('aria-label', dieType === 'label' ? 'label' : 'dice');
  if (dieType === 'label') {
    const face = die.querySelector('.table-die-face');
    if (face instanceof HTMLElement) {
      const fontPx = getLabelFontSizePx(dieState);
      face.style.fontSize = `${fontPx.toFixed(2)}px`;
      face.style.color = normalizeHexColor(dieState.textColor || '#ff7a59');
      const activeEditor = face.querySelector('.table-label-editor');
      if (activeEditor instanceof HTMLTextAreaElement) {
        activeEditor.style.fontSize = `${fontPx.toFixed(2)}px`;
      }
    }
  }
  renderDieFace(die, dieType, getRenderedDieValue(dieState, now), dieState);
  return rolling;
}

function renderAllDice() {
  let hasRolling = false;
  for (const dieId of diceById.keys()) {
    if (renderDieElement(dieId)) {
      hasRolling = true;
    }
  }
  for (const dieId of Array.from(diceElements.keys())) {
    if (diceById.has(dieId)) {
      continue;
    }
    removeDieElement(dieId);
  }
  if (hasRolling && !diceRollAnimationRafId) {
    diceRollAnimationRafId = window.requestAnimationFrame(() => {
      diceRollAnimationRafId = 0;
      renderAllDice();
    });
  }
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

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'table-card-resize-handle hidden';
    resizeHandle.setAttribute('aria-hidden', 'true');
    resizeHandle.innerHTML =
      '<svg viewBox="0 0 16 16" width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 13L13 3M7 13L13 7M11 13L13 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    resizeHandle.addEventListener('pointerdown', (event) => {
      onCardResizePointerDown(event, cardId);
    });
    resizeHandle.addEventListener('pointerenter', () => {
      card.classList.add('is-resize-hovered');
    });
    resizeHandle.addEventListener('pointerleave', () => {
      card.classList.remove('is-resize-hovered');
    });
    card.appendChild(resizeHandle);

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

  const cardDeckId = normalizeDeckId(cardState.deckId);
  const cardDeckState = getDeckStateById(cardDeckId);
  const discardCenter = cardState.inDiscard && cardDeckState ? getDiscardCenterPosition(cardDeckId) : null;
  const auctionCenter = cardState.inAuction && cardDeckState ? getAuctionCenterPosition(cardDeckId) : null;
  const baseCardSize = getCardTableDimensions(cardState);
  const cardWorldX = cardState.inDeck && cardDeckState ? cardDeckState.x : discardCenter ? discardCenter.x : auctionCenter ? auctionCenter.x : cardState.x;
  const cardWorldY = cardState.inDeck && cardDeckState ? cardDeckState.y : discardCenter ? discardCenter.y : auctionCenter ? auctionCenter.y : cardState.y;
  const screen = worldToScreen({ x: cardWorldX, y: cardWorldY });
  card.style.left = `${screen.x}px`;
  card.style.top = `${screen.y}px`;
  const auctionCardWorldWidth = baseCardSize.width * AUCTION_CARD_SCALE;
  const auctionCardWorldHeight = baseCardSize.height * AUCTION_CARD_SCALE;
  const cardScreenWidth = cardState.inAuction
    ? snapToDevicePixel(auctionCardWorldWidth * camera.scale)
    : snapToDevicePixel(baseCardSize.width * camera.scale);
  const cardScreenHeight = cardState.inAuction
    ? snapToDevicePixel(auctionCardWorldHeight * camera.scale)
    : snapToDevicePixel(baseCardSize.height * camera.scale);
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
  card.classList.toggle('is-in-deck', cardState.inDeck);
  card.classList.toggle('is-in-discard', cardState.inDiscard);
  card.classList.toggle('is-in-auction', cardState.inAuction);
  card.classList.toggle('is-discard-returning', discardReturnAnimatingCardIds.has(cardId));
  const isImageComponent = isImageComponentCard(cardState);
  const isImageComponentCardMode = isImageComponent && cardState.componentCardSized !== false;
  const isImageComponentNativeMode = isImageComponent && cardState.componentCardSized === false;
  const isResizableImage = isResizableImageComponentCard(cardState);
  const isResizingThisCard = resizingImageCardId === cardId;
  card.classList.toggle('is-image-component', isImageComponent);
  card.classList.toggle('is-image-component-card', isImageComponentCardMode);
  card.classList.toggle('is-image-component-native', isImageComponentNativeMode);
  card.classList.toggle('is-resizable-image', isResizableImage);
  card.classList.toggle('is-resizing', isResizingThisCard);
  if (!isResizingThisCard && !isResizableImage) {
    card.classList.remove('is-resize-hovered');
  }

  const resizeHandle = card.querySelector('.table-card-resize-handle');
  if (resizeHandle instanceof HTMLElement) {
    resizeHandle.classList.toggle('hidden', !isResizableImage);
  }

  const image = card.querySelector('img');
  if (image) {
    const previousFace = cardFaces.get(cardId);
    const showingFront = cardState.face === 'front';
    const hasLoadedImage = Boolean(image.getAttribute('src'));

    let preferredFrontSrc = '';
    let fallbackFrontSrc = '';
    let displaySrc = getCardBackDisplaySrc(cardState);
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
              snapToDevicePixel(getCardTableDimensions(latestCardState).width * camera.scale)
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
  if (resizingImageCardId && !cards.has(resizingImageCardId)) {
    resizingImageCardId = '';
  }
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

function normalizeDrawToolMode(mode) {
  return mode === DRAW_TOOL_LINE || mode === DRAW_TOOL_BOX ? mode : DRAW_TOOL_FREE;
}

function setDrawToolMode(mode) {
  const nextMode = normalizeDrawToolMode(mode);
  if (activeDrawTool === nextMode) {
    syncDrawModeUi();
    return;
  }
  activeDrawTool = nextMode;
  onDrawToolModeChanged(nextMode);
  syncDrawModeUi();
}

function hasOwnDrawingStrokes() {
  for (const strokeState of drawingStrokes.values()) {
    if (!strokeState || typeof strokeState !== 'object') {
      continue;
    }
    const ownerToken = typeof strokeState.authorPlayerToken === 'string' ? strokeState.authorPlayerToken : '';
    const ownerClient = typeof strokeState.authorClientId === 'string' ? strokeState.authorClientId : '';
    const matchesToken = Boolean(localPlayerToken) && ownerToken === localPlayerToken;
    const matchesLegacyClient = !ownerToken && Boolean(clientId) && ownerClient === clientId;
    if (matchesToken || matchesLegacyClient) {
      return true;
    }
  }
  return false;
}

function syncDrawActionButtonsState() {
  const hasOwnStrokes = hasOwnDrawingStrokes();
  const canUseActions = drawModeEnabled && hasOwnStrokes;
  if (drawClearButton) {
    drawClearButton.disabled = !canUseActions;
    drawClearButton.classList.toggle('is-disabled', !canUseActions);
    drawClearButton.setAttribute('title', canUseActions ? 'delete my drawings' : 'no drawings to delete');
  }
  if (drawUndoButton) {
    drawUndoButton.disabled = !canUseActions;
    drawUndoButton.classList.toggle('is-disabled', !canUseActions);
    drawUndoButton.setAttribute('title', canUseActions ? 'undo last stroke' : 'no drawings to undo');
  }
}

function syncDrawModeUi() {
  tableRoot?.classList.toggle('is-draw-mode', drawModeEnabled);
  if (drawClearButton) {
    drawClearButton.classList.toggle('hidden', !drawModeEnabled);
  }
  if (drawUndoButton) {
    drawUndoButton.classList.toggle('hidden', !drawModeEnabled);
  }
  syncDrawActionButtonsState();
  if (drawToolRow) {
    drawToolRow.classList.toggle('hidden', !drawModeEnabled);
  }
  if (drawToolFreeButton) {
    const isActive = activeDrawTool === DRAW_TOOL_FREE;
    drawToolFreeButton.classList.toggle('is-active', isActive);
    drawToolFreeButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    drawToolFreeButton.setAttribute('title', 'freeform drawing');
  }
  if (drawToolLineButton) {
    const isActive = activeDrawTool === DRAW_TOOL_LINE;
    drawToolLineButton.classList.toggle('is-active', isActive);
    drawToolLineButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    drawToolLineButton.setAttribute('title', 'line drawing');
  }
  if (drawToolBoxButton) {
    const isActive = activeDrawTool === DRAW_TOOL_BOX;
    drawToolBoxButton.classList.toggle('is-active', isActive);
    drawToolBoxButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    drawToolBoxButton.setAttribute('title', 'box drawing');
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
    stroke.dataset.strokeId = String(strokeId);
    stroke.addEventListener('pointerdown', (event) => {
      onDrawingStrokePointerDown(event, strokeId);
    });
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
  syncDrawActionButtonsState();
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
  renderAllDice();
  renderAllCards();
  renderMonsBoard();
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
drawToolFreeButton?.addEventListener('click', () => {
  setDrawToolMode(DRAW_TOOL_FREE);
});
drawToolLineButton?.addEventListener('click', () => {
  setDrawToolMode(DRAW_TOOL_LINE);
});
drawToolBoxButton?.addEventListener('click', () => {
  setDrawToolMode(DRAW_TOOL_BOX);
});
drawClearButton?.addEventListener('click', async () => {
  if (!drawModeEnabled || drawClearButton.disabled) {
    return;
  }
  const shouldContinue = await openDrawClearWarningModal();
  if (!shouldContinue) {
    return;
  }
  onDrawToolModeChanged(activeDrawTool);
  clearOwnDrawings().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
drawUndoButton?.addEventListener('click', () => {
  if (!drawModeEnabled || drawUndoButton.disabled) {
    return;
  }
  onDrawToolModeChanged(activeDrawTool);
  undoOwnDrawing().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

setRoomBadgeText(defaultRoomTitle);
setRoomOwnerState(false);
scheduleRoomBadgeWidthSync();

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

const shareUrl = buildRoomShareUrl(roomId);
shareUrl.searchParams.delete('name');
shareUrl.searchParams.delete('color');
const canonicalPathAndSearch = `${shareUrl.pathname}${shareUrl.search}`;
const currentPathAndSearch = `${window.location.pathname}${window.location.search}`;
if (canonicalPathAndSearch !== currentPathAndSearch) {
  window.history.replaceState({}, '', `${canonicalPathAndSearch}${window.location.hash || ''}`);
}
localStorage.setItem(LAST_GAME_URL_KEY, canonicalPathAndSearch);
syncClearTableButtonState();

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
  refreshMonsClaimLabelsOnly();
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

function isMonsItemChoiceModalOpen() {
  return Boolean(monsItemChoiceModal && !monsItemChoiceModal.classList.contains('hidden'));
}

function closeMonsItemChoiceModal(options = {}) {
  const shouldClearPending = options.clearPending !== false;
  if (monsItemChoiceModal) {
    monsItemChoiceModal.classList.add('hidden');
  }
  if (tableRoot) {
    tableRoot.classList.remove('is-mons-item-choice-open');
  }
  if (monsItemChoiceBombButton) {
    monsItemChoiceBombButton.disabled = false;
    monsItemChoiceBombButton.classList.remove('is-disabled');
  }
  if (shouldClearPending) {
    pendingMonsItemChoice = null;
  }
}

function openMonsItemChoiceModal(context) {
  if (!monsItemChoiceModal) {
    return false;
  }
  const nextContext = context && typeof context === 'object' ? { ...context } : null;
  pendingMonsItemChoice = nextContext;
  const bombBlocked = Boolean(nextContext?.bombBlocked);
  if (monsItemChoiceBombButton) {
    monsItemChoiceBombButton.disabled = bombBlocked;
    monsItemChoiceBombButton.classList.toggle('is-disabled', bombBlocked);
  }
  monsItemChoiceModal.classList.remove('hidden');
  tableRoot?.classList.add('is-mons-item-choice-open');
  return true;
}

function isDiceAddModalOpen() {
  return Boolean(diceAddModal && !diceAddModal.classList.contains('hidden'));
}

function isImageAddModalOpen() {
  return Boolean(imageAddModal && !imageAddModal.classList.contains('hidden'));
}

function syncDiceAddModalUi() {
  const isD20 = activeDiceAddType === 'd20';
  diceTypeD6Button?.classList.toggle('is-active', !isD20);
  diceTypeD6Button?.setAttribute('aria-pressed', !isD20 ? 'true' : 'false');
  diceTypeD20Button?.classList.toggle('is-active', isD20);
  diceTypeD20Button?.setAttribute('aria-pressed', isD20 ? 'true' : 'false');
  if (!(diceCountRow instanceof HTMLElement)) {
    return;
  }
  const countButtons = diceCountRow.querySelectorAll('[data-dice-count]');
  for (const button of countButtons) {
    const parsedCount = Number(button.getAttribute('data-dice-count'));
    const isActive = parsedCount === activeDiceAddCount;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }
}

function setDiceAddType(type) {
  activeDiceAddType = normalizeDieType(type);
  syncDiceAddModalUi();
}

function setDiceAddCount(count) {
  const nextCount = clamp(Math.round(Number(count) || 1), 1, 5);
  activeDiceAddCount = nextCount;
  syncDiceAddModalUi();
}

function openDiceAddModal() {
  if (!diceAddModal) {
    return;
  }
  closeMonsItemChoiceModal();
  closeImageAddModal();
  closeGameOptionsMenu();
  closeAssetMenu();
  syncDiceAddModalUi();
  diceAddModal.classList.remove('hidden');
}

function closeDiceAddModal() {
  if (!diceAddModal) {
    return;
  }
  diceAddModal.classList.add('hidden');
}

function syncImageAddModalUi() {
  const twoSidedEnabled = Boolean(imageAddTwoSidedCheckbox?.checked);
  imageAddBackField?.classList.toggle('hidden', !twoSidedEnabled);
}

function setImageAddValidationMessage(message = '', options = {}) {
  const normalizedMessage = String(message || '').trim();
  if (imageAddError) {
    imageAddError.textContent = normalizedMessage;
    imageAddError.classList.toggle('hidden', !normalizedMessage);
  }
  const markFrontInvalid = options.frontInvalid === true;
  const markBackInvalid = options.backInvalid === true;
  imageAddFrontInput?.classList.toggle('is-invalid', markFrontInvalid);
  imageAddBackInput?.classList.toggle('is-invalid', markBackInvalid);
}

function openImageAddModal() {
  if (!imageAddModal) {
    return;
  }
  closeMonsItemChoiceModal();
  closeDiceAddModal();
  closeGameOptionsMenu();
  closeAssetMenu();
  setImageAddValidationMessage('');
  syncImageAddModalUi();
  imageAddModal.classList.remove('hidden');
}

function closeImageAddModal() {
  if (!imageAddModal) {
    return;
  }
  setImageAddValidationMessage('');
  imageAddModal.classList.add('hidden');
}

function openAssetMenu() {
  if (!assetMenuModal) {
    return;
  }
  closeDiceAddModal();
  closeImageAddModal();
  closeMonsItemChoiceModal();
  closeGameOptionsMenu();
  setAssetMenuView(activeAssetMenuView);
  syncClearTableButtonState();
  assetMenuModal.classList.remove('hidden');
}

function closeAssetMenu() {
  if (!assetMenuModal) {
    return;
  }
  assetMenuModal.classList.add('hidden');
}

function setAssetMenuView(view) {
  const nextView = view === 'component' ? 'component' : 'game';
  activeAssetMenuView = nextView;
  localStorage.setItem(ASSET_MENU_VIEW_KEY, nextView);
  const isComponentView = nextView === 'component';
  assetMenuModal?.classList.toggle('is-component-view', isComponentView);
  assetGameGallery?.classList.toggle('hidden', isComponentView);
  assetComponentGallery?.classList.toggle('hidden', !isComponentView);
  assetMenuTabGameButton?.classList.toggle('is-active', !isComponentView);
  assetMenuTabGameButton?.setAttribute('aria-selected', !isComponentView ? 'true' : 'false');
  assetMenuTabComponentButton?.classList.toggle('is-active', isComponentView);
  assetMenuTabComponentButton?.setAttribute('aria-selected', isComponentView ? 'true' : 'false');
}

function isTabletopCompletelyEmpty() {
  const hasCards = cards.size > 0;
  const hasDice = diceById.size > 0;
  const hasDecks = deckStatesById.size > 0;
  const hasMonsBoards = Array.from(monsGameStatesById.values()).some((gameState) => gameState && gameState.enabled !== false);
  const hasDrawings = drawingStrokes.size > 0;
  return !hasCards && !hasDice && !hasDecks && !hasMonsBoards && !hasDrawings;
}

function syncClearTableButtonState() {
  if (!clearTableButton) {
    syncWipeAllDrawingsButtonState();
    return;
  }
  const isEmpty = isTabletopCompletelyEmpty();
  clearTableButton.disabled = isEmpty;
  clearTableButton.classList.toggle('is-disabled', isEmpty);
  syncWipeAllDrawingsButtonState();
}

function syncWipeAllDrawingsButtonState() {
  if (!wipeAllDrawingsButton) {
    syncTableResetRowLayout();
    return;
  }
  const hasDrawings = drawingStrokes.size > 0;
  const isDisabled = !isRoomOwner || !hasDrawings;
  wipeAllDrawingsButton.disabled = isDisabled;
  wipeAllDrawingsButton.classList.toggle('is-disabled', isDisabled);
  syncTableResetRowLayout();
}

function syncTableResetRowLayout() {
  if (!tableResetRow || !wipeAllDrawingsButton) {
    return;
  }
  const hasVisibleWipeButton = !wipeAllDrawingsButton.classList.contains('hidden');
  tableResetRow.classList.toggle('has-wipe', hasVisibleWipeButton);
}

function resolveGameOptionsTitle(targetKey) {
  if (targetKey === MONS_GAME_KEY || String(targetKey || '').startsWith('mons:')) {
    return 'super metal mons!';
  }
  return 'cool jpegs';
}

function getDeckIdFromGameOptionsTarget(target) {
  const raw = String(target || '');
  if (!raw.startsWith('deck:')) {
    return '';
  }
  return normalizeDeckId(raw.slice('deck:'.length));
}

function getMonsGameIdFromGameOptionsTarget(target) {
  const raw = String(target || '');
  if (!raw.startsWith('mons:')) {
    return '';
  }
  return normalizeMonsGameId(raw.slice('mons:'.length));
}

function openGameOptionsMenu(targetKey, targetId = '') {
  if (!gameOptionsModal) {
    return;
  }
  closeMonsItemChoiceModal();
  closeAssetMenu();
  if (targetKey === MONS_GAME_KEY) {
    const normalizedMonsGameId = normalizeMonsGameId(targetId || activeMonsGameId || MONS_GAME_KEY);
    activeGameOptionsTarget = `mons:${normalizedMonsGameId}`;
  } else {
    activeGameOptionsTarget = `deck:${normalizeDeckId(targetId || activeDeckId || DECK_KEY)}`;
  }
  const titleText = resolveGameOptionsTitle(activeGameOptionsTarget);
  if (gameOptionsTitleText) {
    gameOptionsTitleText.textContent = titleText;
  } else if (gameOptionsTitle) {
    gameOptionsTitle.textContent = titleText;
  }
  gameOptionsModal.classList.remove('hidden');
}

function closeGameOptionsMenu() {
  if (!gameOptionsModal) {
    return;
  }
  gameOptionsModal.classList.add('hidden');
  activeGameOptionsTarget = '';
}

function closeClearTableWarningModal(shouldContinue = false) {
  if (clearTableWarningModal) {
    clearTableWarningModal.classList.add('hidden');
  }
  const resolver = clearTableWarningResolver;
  clearTableWarningResolver = null;
  resolver?.(Boolean(shouldContinue));
}

function openClearTableWarningModal() {
  if (!clearTableWarningModal) {
    return Promise.resolve(true);
  }
  closeMonsItemChoiceModal();
  if (clearTableWarningResolver) {
    return Promise.resolve(false);
  }
  clearTableWarningModal.classList.remove('hidden');
  return new Promise((resolve) => {
    clearTableWarningResolver = resolve;
  });
}

function closeDrawClearWarningModal(shouldContinue = false) {
  if (drawClearWarningModal) {
    drawClearWarningModal.classList.add('hidden');
  }
  const resolver = drawClearWarningResolver;
  drawClearWarningResolver = null;
  resolver?.(Boolean(shouldContinue));
}

function openDrawClearWarningModal() {
  if (!drawClearWarningModal) {
    return Promise.resolve(true);
  }
  closeMonsItemChoiceModal();
  if (drawClearWarningResolver) {
    return Promise.resolve(false);
  }
  drawClearWarningModal.classList.remove('hidden');
  return new Promise((resolve) => {
    drawClearWarningResolver = resolve;
  });
}

function closeInstanceWarningModal(shouldContinue = false) {
  if (instanceWarningModal) {
    instanceWarningModal.classList.add('hidden');
  }
  const resolver = instanceWarningResolver;
  instanceWarningResolver = null;
  resolver?.(Boolean(shouldContinue));
}

function openInstanceWarningModal() {
  if (!instanceWarningModal) {
    return Promise.resolve(true);
  }
  closeMonsItemChoiceModal();
  if (instanceWarningResolver) {
    return Promise.resolve(false);
  }
  instanceWarningModal.classList.remove('hidden');
  return new Promise((resolve) => {
    instanceWarningResolver = resolve;
  });
}

function hasGameInstanceOnTable(gameKey) {
  if (gameKey === MONS_GAME_KEY) {
    for (const gameState of monsGameStatesById.values()) {
      if (gameState && gameState.enabled !== false) {
        return true;
      }
    }
    return false;
  }
  return getDeckIdsInRoom().length > 0;
}

async function confirmAdditionalInstanceWarningIfNeeded(gameKey) {
  if (!hasGameInstanceOnTable(gameKey)) {
    return true;
  }
  return openInstanceWarningModal();
}

async function handleGameOptionsReset() {
  if (!activeGameOptionsTarget) {
    return;
  }
  const targetMonsGameId = getMonsGameIdFromGameOptionsTarget(activeGameOptionsTarget);
  if (targetMonsGameId) {
    await resetSuperMetalMonsGame(targetMonsGameId);
    return;
  }
  const targetDeckId = getDeckIdFromGameOptionsTarget(activeGameOptionsTarget);
  await resetCoolJpegsGame(targetDeckId || activeDeckId);
}

async function handleGameOptionsPutAway() {
  if (!activeGameOptionsTarget) {
    return;
  }
  const targetMonsGameId = getMonsGameIdFromGameOptionsTarget(activeGameOptionsTarget);
  if (targetMonsGameId) {
    await putAwaySuperMetalMonsGame(targetMonsGameId);
    return;
  }
  const targetDeckId = getDeckIdFromGameOptionsTarget(activeGameOptionsTarget);
  await putAwayCoolJpegsGame(targetDeckId || activeDeckId);
}

assetMenuButton?.addEventListener('click', () => {
  openAssetMenu();
});

assetMenuCloseButton?.addEventListener('click', () => {
  closeAssetMenu();
});
assetMenuTabGameButton?.addEventListener('click', () => {
  setAssetMenuView('game');
});
assetMenuTabComponentButton?.addEventListener('click', () => {
  setAssetMenuView('component');
});
removeComponentsButton?.addEventListener('click', () => {
  closeAssetMenu();
  setDeleteModeEnabled(true);
});
deleteModeCancelButton?.addEventListener('click', () => {
  setDeleteModeEnabled(false);
});

gameOptionsCloseButton?.addEventListener('click', () => {
  closeGameOptionsMenu();
});
monsItemChoiceBombButton?.addEventListener('click', () => {
  if (monsItemChoiceBombButton.disabled) {
    return;
  }
  submitMonsItemChoice('bomb').catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
monsItemChoicePotionButton?.addEventListener('click', () => {
  submitMonsItemChoice('potion').catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
instanceWarningContinueButton?.addEventListener('click', () => {
  closeInstanceWarningModal(true);
});
instanceWarningCancelButton?.addEventListener('click', () => {
  closeInstanceWarningModal(false);
});
clearTableWarningYesButton?.addEventListener('click', () => {
  closeClearTableWarningModal(true);
});
clearTableWarningNoButton?.addEventListener('click', () => {
  closeClearTableWarningModal(false);
});
drawClearWarningYesButton?.addEventListener('click', () => {
  closeDrawClearWarningModal(true);
});
drawClearWarningNoButton?.addEventListener('click', () => {
  closeDrawClearWarningModal(false);
});

coolJpegsTile?.addEventListener('click', async () => {
  const shouldContinue = await confirmAdditionalInstanceWarningIfNeeded(DECK_KEY);
  if (!shouldContinue) {
    return;
  }
  closeAssetMenu();
  spawnCoolJpegsDeck().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

superMetalMonsTile?.addEventListener('click', async () => {
  const shouldContinue = await confirmAdditionalInstanceWarningIfNeeded(MONS_GAME_KEY);
  if (!shouldContinue) {
    return;
  }
  closeAssetMenu();
  spawnSuperMetalMonsBoard().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

diceComponentTile?.addEventListener('click', () => {
  openDiceAddModal();
});
coinComponentTile?.addEventListener('click', () => {
  closeAssetMenu();
  spawnCoin().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
labelComponentTile?.addEventListener('click', () => {
  closeAssetMenu();
  spawnLabelComponent().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
imageComponentTile?.addEventListener('click', () => {
  openImageAddModal();
});

diceAddCloseButton?.addEventListener('click', () => {
  closeDiceAddModal();
});

diceTypeD6Button?.addEventListener('click', () => {
  setDiceAddType('d6');
});

diceTypeD20Button?.addEventListener('click', () => {
  setDiceAddType('d20');
});

diceCountRow?.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('[data-dice-count]') : null;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  setDiceAddCount(target.getAttribute('data-dice-count'));
});

diceAddConfirmButton?.addEventListener('click', () => {
  closeDiceAddModal();
  spawnDice(activeDiceAddType, activeDiceAddCount).catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
imageAddCloseButton?.addEventListener('click', () => {
  closeImageAddModal();
});
imageAddTwoSidedCheckbox?.addEventListener('change', () => {
  syncImageAddModalUi();
  setImageAddValidationMessage('');
});
imageAddCardCheckbox?.addEventListener('change', () => {
  setImageAddValidationMessage('');
});
imageAddFrontInput?.addEventListener('input', () => {
  setImageAddValidationMessage('');
});
imageAddBackInput?.addEventListener('input', () => {
  setImageAddValidationMessage('');
});
imageAddConfirmButton?.addEventListener('click', () => {
  const frontSrc = normalizeImageComponentSrc(imageAddFrontInput?.value || '');
  if (!frontSrc) {
    setImageAddValidationMessage('enter a valid image URL first.', { frontInvalid: true });
    return;
  }
  const twoSided = Boolean(imageAddTwoSidedCheckbox?.checked);
  const backSrc = normalizeImageComponentSrc(imageAddBackInput?.value || '');
  if (twoSided && !backSrc) {
    setImageAddValidationMessage('enter a back URL or disable 2-sided.', { backInvalid: true });
    return;
  }
  setImageAddValidationMessage('');
  const cardSized = Boolean(imageAddCardCheckbox?.checked);
  closeImageAddModal();
  spawnImageComponent(frontSrc, {
    cardSized,
    twoSided,
    backSrc
  }).catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

clearTableButton?.addEventListener('click', async () => {
  if (clearTableButton.disabled) {
    return;
  }
  const shouldContinue = await openClearTableWarningModal();
  if (!shouldContinue) {
    return;
  }
  closeAssetMenu();
  clearTabletop().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});
wipeAllDrawingsButton?.addEventListener('click', async () => {
  if (!isRoomOwner || wipeAllDrawingsButton.disabled) {
    return;
  }
  const shouldContinue = await openClearTableWarningModal();
  if (!shouldContinue) {
    return;
  }
  closeAssetMenu();
  wipeAllDrawings().catch((error) => {
    console.error(error);
    setRealtimeStatus('firebase: write blocked');
  });
});

gameOptionsResetButton?.addEventListener('click', () => {
  handleGameOptionsReset()
    .catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    })
    .finally(() => {
      closeGameOptionsMenu();
    });
});

gameOptionsPutAwayButton?.addEventListener('click', () => {
  handleGameOptionsPutAway()
    .catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    })
    .finally(() => {
      closeGameOptionsMenu();
    });
});

assetMenuModal?.addEventListener('pointerdown', (event) => {
  if (event.target === assetMenuModal) {
    closeAssetMenu();
  }
});
diceAddModal?.addEventListener('pointerdown', (event) => {
  if (event.target === diceAddModal) {
    closeDiceAddModal();
  }
});
imageAddModal?.addEventListener('pointerdown', (event) => {
  if (event.target === imageAddModal) {
    closeImageAddModal();
  }
});

gameOptionsModal?.addEventListener('pointerdown', (event) => {
  if (event.target === gameOptionsModal) {
    closeGameOptionsMenu();
  }
});
monsItemChoiceModal?.addEventListener('pointerdown', (event) => {
  if (event.target === monsItemChoiceModal) {
    closeMonsItemChoiceModal();
  }
});
instanceWarningModal?.addEventListener('pointerdown', (event) => {
  if (event.target === instanceWarningModal) {
    closeInstanceWarningModal(false);
  }
});
clearTableWarningModal?.addEventListener('pointerdown', (event) => {
  if (event.target === clearTableWarningModal) {
    closeClearTableWarningModal(false);
  }
});
drawClearWarningModal?.addEventListener('pointerdown', (event) => {
  if (event.target === drawClearWarningModal) {
    closeDrawClearWarningModal(false);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }
  if (isDiceAddModalOpen()) {
    closeDiceAddModal();
    return;
  }
  if (isImageAddModalOpen()) {
    closeImageAddModal();
    return;
  }
  if (isMonsItemChoiceModalOpen()) {
    closeMonsItemChoiceModal();
    return;
  }
  if (clearTableWarningModal && !clearTableWarningModal.classList.contains('hidden')) {
    closeClearTableWarningModal(false);
    return;
  }
  if (drawClearWarningModal && !drawClearWarningModal.classList.contains('hidden')) {
    closeDrawClearWarningModal(false);
    return;
  }
  if (instanceWarningModal && !instanceWarningModal.classList.contains('hidden')) {
    closeInstanceWarningModal(false);
    return;
  }
  if (gameOptionsModal && !gameOptionsModal.classList.contains('hidden')) {
    closeGameOptionsMenu();
    return;
  }
  if (assetMenuModal && !assetMenuModal.classList.contains('hidden')) {
    closeAssetMenu();
  }
});

syncDiceAddModalUi();
syncImageAddModalUi();

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

function setDiceTileIconFace(faceValue) {
  if (!diceComponentTile) {
    return;
  }
  const normalizedFace = clamp(Math.round(Number(faceValue) || 1), 1, 6);
  const activePips = new Set(DICE_TILE_ICON_PIP_LAYOUTS[normalizedFace] || DICE_TILE_ICON_PIP_LAYOUTS[1]);
  const pipElements = diceComponentTile.querySelectorAll('[data-dice-pip]');
  for (const pipElement of pipElements) {
    const pipIndex = Number(pipElement.getAttribute('data-dice-pip'));
    pipElement.style.opacity = activePips.has(pipIndex) ? '1' : '0';
  }
}

function initializeDiceTilePipShuffle(tile) {
  if (!tile) {
    return;
  }
  let lastShuffleAt = 0;
  let lastPointerX = Number.NaN;
  let lastPointerY = Number.NaN;
  let accumulatedDistance = 0;
  const minDistanceBeforeShuffle = 15;
  const shuffleIntervalMs = 140;
  setDiceTileIconFace(4);
  tile.addEventListener('pointermove', (event) => {
    if (Number.isFinite(lastPointerX) && Number.isFinite(lastPointerY)) {
      accumulatedDistance += Math.hypot(event.clientX - lastPointerX, event.clientY - lastPointerY);
    }
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    if (accumulatedDistance < minDistanceBeforeShuffle) {
      return;
    }
    const now = Date.now();
    if (now - lastShuffleAt < shuffleIntervalMs) {
      return;
    }
    lastShuffleAt = now;
    setDiceTileIconFace(1 + Math.floor(Math.random() * 6));
  });
  tile.addEventListener('pointerleave', () => {
    lastPointerX = Number.NaN;
    lastPointerY = Number.NaN;
    accumulatedDistance = 0;
    setDiceTileIconFace(4);
  });
}

initializeTileTilt(coolJpegsTile);
initializeTileTilt(superMetalMonsTile);
initializeTileTilt(diceComponentTile);
initializeTileTilt(coinComponentTile);
initializeTileTilt(labelComponentTile);
initializeTileTilt(imageComponentTile);
initializeDiceTilePipShuffle(diceComponentTile);

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

function syncRoomBadgeWidthVar() {
  roomBadgeWidthSyncRafId = 0;
  if (!tableRoot || !roomBadge || roomBadge.classList.contains('hidden')) {
    return;
  }
  const width = roomBadge.getBoundingClientRect().width;
  if (!Number.isFinite(width) || width <= 0) {
    return;
  }
  tableRoot.style.setProperty('--room-badge-width', `${Math.ceil(width)}px`);
}

function scheduleRoomBadgeWidthSync() {
  if (roomBadgeWidthSyncRafId) {
    return;
  }
  roomBadgeWidthSyncRafId = window.requestAnimationFrame(syncRoomBadgeWidthVar);
}

function setFrontImagePendingLoadCount(nextCount) {
  frontImagePendingLoadCount = Math.max(0, Number(nextCount) || 0);
  if (assetLoadingStatus) {
    assetLoadingStatus.classList.toggle('hidden', frontImagePendingLoadCount <= 0);
  }
  if (frontImagePendingLoadCount > 0) {
    scheduleRoomBadgeWidthSync();
  }
}

function setRealtimeStatus(text) {
  if (!statusBadge) {
    return;
  }
  statusBadge.textContent = text;
}

function setDocumentRoomTitle(title) {
  const normalizedTitle = normalizeRoomTitle(title);
  if (document.title !== normalizedTitle) {
    document.title = normalizedTitle;
  }
}

function setRoomBadgeText(title) {
  roomTitleValue = normalizeRoomTitle(title);
  setDocumentRoomTitle(roomTitleValue);
  if (roomBadge && !isRoomTitleEditing) {
    roomBadge.textContent = roomTitleValue;
    scheduleRoomBadgeWidthSync();
  }
}

function setRoomOwnerState(isOwner) {
  isRoomOwner = Boolean(isOwner);
  if (!roomBadge) {
    if (wipeAllDrawingsButton) {
      wipeAllDrawingsButton.classList.toggle('hidden', !isRoomOwner);
      syncWipeAllDrawingsButtonState();
    }
    return;
  }
  roomBadge.classList.toggle('is-editable', isRoomOwner);
  roomBadge.tabIndex = isRoomOwner ? 0 : -1;
  roomBadge.setAttribute('title', isRoomOwner ? 'rename room' : '');
  if (wipeAllDrawingsButton) {
    wipeAllDrawingsButton.classList.toggle('hidden', !isRoomOwner);
    syncWipeAllDrawingsButtonState();
  }
  syncTableResetRowLayout();
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
  scheduleRoomBadgeWidthSync();
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
  refreshMonsClaimLabelsOnly();
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
      '#copyLinkButton, #bottomRightControls, #assetMenuModal, #diceAddModal, #imageAddModal, #clearTableWarningModal, #drawClearWarningModal, #instanceWarningModal, #gameOptionsModal, #monsItemChoiceModal, #playerControls, #bottomLeftControls, #roomBadge, #roomTitleInput, #drawModeButton, #drawClearButton, #drawUndoButton, #drawToolRow, #drawToolFreeButton, #drawToolLineButton, #drawToolBoxButton, #auctionBidEntry, #auctionBidInput, .deck-control-button, #handTray, #handDropGlow, #gameLayer, #monsGameShell, #monsMoveButton, #monsOptionsButton, .mons-game-shell, .mons-move-button, .mons-options-button, .table-label-editor'
    )
  );
}

function shouldIgnorePointerEventInDrawMode(event) {
  const targetNode = event.target;
  const targetElement = targetNode instanceof Element ? targetNode : targetNode?.parentElement || null;
  if (!targetElement) {
    return false;
  }
  return Boolean(
    targetElement.closest(
      '#copyLinkButton, #bottomRightControls, #assetMenuModal, #diceAddModal, #imageAddModal, #clearTableWarningModal, #drawClearWarningModal, #instanceWarningModal, #gameOptionsModal, #monsItemChoiceModal, #playerControls, #bottomLeftControls, #roomBadge, #roomTitleInput, #drawModeButton, #drawClearButton, #drawUndoButton, #drawToolRow, #drawToolFreeButton, #drawToolLineButton, #drawToolBoxButton, #auctionBidEntry, #auctionBidInput, #handTray, #handDropGlow, .table-label-editor'
    )
  );
}

function shieldPointerEvents(element, options = {}) {
  if (!element) {
    return;
  }
  element.addEventListener('pointerdown', (event) => {
    if (drawModeEnabled && (options.allowDrawPassthrough || element.dataset.drawPassthrough === 'true')) {
      return;
    }
    if (options.allowMiddleMousePan && event.pointerType === 'mouse' && event.button === 1) {
      return;
    }
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

function parseServerTimestamp(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isPresencePayloadActive(payload, now = Date.now()) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  if (payload.connected !== true) {
    return false;
  }
  const lastSeen = parseServerTimestamp(payload.lastSeen);
  if (!lastSeen) {
    return true;
  }
  return now - lastSeen <= PRESENCE_STALE_TIMEOUT_MS;
}

function isCursorPayloadActive(id, payload, now = Date.now()) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const token = typeof payload.playerToken === 'string' && payload.playerToken ? payload.playerToken : id;
  const presenceState = token ? isPresencePayloadActive(latestPresenceByToken[token], now) : null;
  if (presenceState === false) {
    return false;
  }
  const updatedAt = parseServerTimestamp(payload.updatedAt);
  if (!updatedAt) {
    return presenceState !== false;
  }
  if (now - updatedAt <= CURSOR_STALE_TIMEOUT_MS) {
    return true;
  }
  return presenceState === true;
}

function buildVisibleCursorEntries(allCursors, localId) {
  const now = Date.now();
  const byToken = new Map();
  for (const [id, payload] of Object.entries(allCursors || {})) {
    if (!payload || typeof payload !== 'object') {
      continue;
    }
    if (typeof payload.x !== 'number' || typeof payload.y !== 'number') {
      continue;
    }
    const token = typeof payload.playerToken === 'string' && payload.playerToken ? payload.playerToken : id;
    if (!token) {
      continue;
    }
    if (localId && id === localId) {
      continue;
    }
    if (localPlayerToken && token === localPlayerToken) {
      continue;
    }
    if (!isCursorPayloadActive(id, payload, now)) {
      continue;
    }

    const current = byToken.get(token);
    if (!current) {
      byToken.set(token, { id, token, payload });
      continue;
    }
    const currentUpdatedAt = parseServerTimestamp(current.payload?.updatedAt);
    const nextUpdatedAt = parseServerTimestamp(payload.updatedAt);
    if (nextUpdatedAt > currentUpdatedAt || (nextUpdatedAt === currentUpdatedAt && id > current.id)) {
      byToken.set(token, { id, token, payload });
    }
  }
  return Array.from(byToken.values());
}

function upsertDot(id, payload) {
  if (!cursorLayer || typeof payload?.x !== 'number' || typeof payload?.y !== 'number') {
    return;
  }

  const payloadToken =
    typeof payload?.playerToken === 'string' && payload.playerToken
      ? payload.playerToken
      : '';
  if ((localClientId && id === localClientId) || (localPlayerToken && payloadToken && payloadToken === localPlayerToken)) {
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

    const pencil = document.createElement('span');
    pencil.className = 'cursor-pencil';
    pencil.innerHTML = CURSOR_PENCIL_SVG;
    dot.appendChild(pencil);

    const label = document.createElement('span');
    label.className = 'cursor-name';
    dot.appendChild(label);

    cursorLayer.appendChild(dot);
    dots.set(id, dot);
  }

  dot.dataset.normalizedX = String(clamp(payload.x, 0, 1));
  dot.dataset.normalizedY = String(clamp(payload.y, 0, 1));
  dot.dataset.playerToken = payloadToken;
  const isDrawing = payload?.drawMode === true;
  dot.classList.toggle('is-drawing', isDrawing);
  positionDot(dot);
  dot.style.background = isDrawing ? 'transparent' : payload.color || colorFromId(payloadToken || id);

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
  const entries = buildVisibleCursorEntries(allCursors, localId);
  if (entries.length === 0) {
    roomRoster.classList.add('hidden');
    return;
  }

  entries.sort((leftEntry, rightEntry) => {
    const leftName = String(leftEntry.payload?.name || '').trim().toLowerCase() || leftEntry.token;
    const rightName = String(rightEntry.payload?.name || '').trim().toLowerCase() || rightEntry.token;
    return leftName.localeCompare(rightName);
  });

  const fragment = document.createDocumentFragment();
  for (const entry of entries) {
    const id = entry.id;
    const payload = entry.payload;
    const ownerToken = entry.token;
    const row = document.createElement('div');
    row.className = 'room-roster-item';

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
shieldPointerEvents(deleteModeCancelButton);
shieldPointerEvents(assetMenuButton);
shieldPointerEvents(assetMenuModal);
shieldPointerEvents(assetMenuCloseButton);
shieldPointerEvents(assetMenuTabGameButton);
shieldPointerEvents(assetMenuTabComponentButton);
shieldPointerEvents(diceComponentTile);
shieldPointerEvents(coinComponentTile);
shieldPointerEvents(labelComponentTile);
shieldPointerEvents(imageComponentTile);
shieldPointerEvents(diceAddModal);
shieldPointerEvents(diceAddCloseButton);
shieldPointerEvents(diceTypeD6Button);
shieldPointerEvents(diceTypeD20Button);
shieldPointerEvents(diceCountRow);
shieldPointerEvents(diceAddConfirmButton);
shieldPointerEvents(imageAddModal);
shieldPointerEvents(imageAddCloseButton);
shieldPointerEvents(imageAddFrontInput);
shieldPointerEvents(imageAddBackInput);
shieldPointerEvents(imageAddCardCheckbox);
shieldPointerEvents(imageAddTwoSidedCheckbox);
shieldPointerEvents(imageAddBackField);
shieldPointerEvents(imageAddConfirmButton);
shieldPointerEvents(removeComponentsButton);
shieldPointerEvents(clearTableButton);
shieldPointerEvents(wipeAllDrawingsButton);
shieldPointerEvents(clearTableWarningModal);
shieldPointerEvents(clearTableWarningYesButton);
shieldPointerEvents(clearTableWarningNoButton);
shieldPointerEvents(drawClearWarningModal);
shieldPointerEvents(drawClearWarningYesButton);
shieldPointerEvents(drawClearWarningNoButton);
shieldPointerEvents(instanceWarningModal);
shieldPointerEvents(instanceWarningContinueButton);
shieldPointerEvents(instanceWarningCancelButton);
shieldPointerEvents(gameOptionsModal);
shieldPointerEvents(gameOptionsCloseButton);
shieldPointerEvents(gameOptionsResetButton);
shieldPointerEvents(gameOptionsPutAwayButton);
shieldPointerEvents(monsItemChoiceModal);
shieldPointerEvents(monsItemChoiceBombButton);
shieldPointerEvents(monsItemChoicePotionButton);
shieldPointerEvents(playerControls);
shieldPointerEvents(bottomLeftControls);
shieldPointerEvents(homeButton);
shieldPointerEvents(lightModeControl);
shieldPointerEvents(roomBadge);
shieldPointerEvents(roomTitleInput);
shieldPointerEvents(drawModeButton);
shieldPointerEvents(drawClearButton);
shieldPointerEvents(drawUndoButton);
shieldPointerEvents(drawToolRow);
shieldPointerEvents(drawToolFreeButton);
shieldPointerEvents(drawToolLineButton);
shieldPointerEvents(drawToolBoxButton);
shieldPointerEvents(auctionBidEntry);
shieldPointerEvents(auctionBidInput);
shieldPointerEvents(auctionBidSubmitButton);

async function startRealtimeSession() {
  if (!tableRoot || !playspaceLayer || !gameLayer || !drawingLayer || !cardLayer || !cursorLayer || !playerControls) {
    throw new Error('Missing required DOM nodes');
  }

  initializeCamera();

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const cursorsRef = ref(db, `${roomPath}/cursors`);
  const cardsRef = ref(db, `${roomPath}/cards`);
  const diceRef = ref(db, `${roomPath}/dice`);
  const drawingsRef = ref(db, `${roomPath}/drawings`);
  const auctionBidsRef = ref(db, `${roomPath}/auctionBids`);
  const decksRef = ref(db, `${roomPath}/decks`);
  const gamesRef = ref(db, `${roomPath}/games`);
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
      drawMode: drawModeEnabled,
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
  let dieWriteScheduled = false;
  const pendingDieWrites = new Map();
  let cardWriteGeneration = 0;
  let dieWriteGeneration = 0;
  let cardDragState = null;
  let cardResizeState = null;
  let dieDragState = null;
  let labelResizeState = null;
  let groupDragState = null;
  let selectionBoxState = null;
  let suppressNextCardContextMenu = false;
  let deckWriteScheduled = false;
  let pendingDeckPatch = {};
  let deckWriteGeneration = 0;
  let deckDragState = null;
  let monsWriteScheduled = false;
  let pendingMonsPatch = {};
  let monsWriteGeneration = 0;
  let monsDragState = null;
  let isTableResetting = false;
  let knownPeerTokens = new Set();
  let handReclaimInProgress = false;
  let handReclaimRafQueued = false;
  let handReclaimIntervalId = 0;
  let cursorHeartbeatIntervalId = 0;
  let localLockWatchdogIntervalId = 0;
  const endedTouchPointerIds = new Set();
  const recentTouchTapByCardId = new Map();
  const recentTouchTapByDieId = new Map();
  const recentMouseClickByCardId = new Map();
  const recentMouseClickByDieId = new Map();
  let selectedRightClickFlipCooldownUntil = 0;
  let strokeWriteScheduled = false;
  const pendingStrokeWrites = new Map();
  let strokeWriteGeneration = 0;
  let drawPointerState = null;
  let drawShapePointerState = null;
  let drawShapeAnchorState = null;
  let drawShapePreviewStroke = null;
  let drawShapeAnchorDot = null;
  let latestAuctionBidsByCard = {};
  let auctionBidUiRafQueued = false;
  let activeAuctionCardIdForUi = '';
  let previousActiveAuctionCardId = '';
  const pendingDeleteKeys = new Set();
  let labelEditState = null;
  latestPresenceByToken = {};
  let hasSignaledSessionLeave = false;

  function getMonsGameRef(gameId = activeMonsGameId) {
    const normalizedGameId = normalizeMonsGameId(gameId);
    return ref(db, `${roomPath}/games/${normalizedGameId}`);
  }

  function getUniqueConnectedElements(elements) {
    const uniqueElements = [];
    const seen = new Set();
    for (const candidate of elements || []) {
      if (!(candidate instanceof Element) || !candidate.isConnected) {
        continue;
      }
      if (seen.has(candidate)) {
        continue;
      }
      seen.add(candidate);
      uniqueElements.push(candidate);
    }
    return uniqueElements;
  }

  function applyDeleteFadeToElements(elements) {
    const fadeElements = getUniqueConnectedElements(elements);
    for (const element of fadeElements) {
      element.classList.add('is-delete-fading');
      element.dataset.deleteFading = '1';
    }
    return fadeElements;
  }

  function clearDeleteFadeFromElements(elements) {
    for (const element of elements || []) {
      if (!(element instanceof Element)) {
        continue;
      }
      element.classList.remove('is-delete-fading');
      delete element.dataset.deleteFading;
    }
  }

  async function runDeleteWithFade(deleteKey, elements, deleteFn) {
    const normalizedKey = String(deleteKey || '').trim();
    if (!normalizedKey || typeof deleteFn !== 'function') {
      return;
    }
    if (pendingDeleteKeys.has(normalizedKey)) {
      return;
    }
    pendingDeleteKeys.add(normalizedKey);
    const fadeElements = applyDeleteFadeToElements(elements);
    await new Promise((resolve) => {
      window.setTimeout(resolve, DELETE_FADE_DURATION_MS);
    });
    try {
      await deleteFn();
    } catch (error) {
      clearDeleteFadeFromElements(fadeElements);
      throw error;
    } finally {
      pendingDeleteKeys.delete(normalizedKey);
    }
  }

  function getDeckDeleteFadeElements(deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const elements = [];
    const deckUi = deckUiById.get(targetDeckId);
    if (deckUi) {
      elements.push(
        deckUi.shuffleButton,
        deckUi.dealOneButton,
        deckUi.moveButton,
        deckUi.optionsButton,
        deckUi.discardResetButton,
        deckUi.discardSlot,
        deckUi.auctionSlot,
        deckUi.deckCountBadge
      );
    }
    for (const [cardId, cardState] of cards.entries()) {
      if (!cardState || normalizeDeckId(cardState.deckId || DECK_KEY) !== targetDeckId) {
        continue;
      }
      elements.push(cardElements.get(cardId), handCardElements.get(cardId));
    }
    return getUniqueConnectedElements(elements);
  }

  function getMonsGameDeleteFadeElements(gameId = activeMonsGameId) {
    const targetGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    const elements = [];
    if (targetGameId === normalizeMonsGameId(activeMonsGameId)) {
      elements.push(monsGameShell, monsMoveButton, monsOptionsButton, monsBlackClaimsList, monsWhiteClaimsList);
    }
    const ghostBoardUi = monsGhostBoardElementsById.get(targetGameId);
    if (ghostBoardUi) {
      elements.push(
        ghostBoardUi.shell,
        ghostBoardUi.moveButton,
        ghostBoardUi.optionsButton,
        ghostBoardUi.claimsBlackList,
        ghostBoardUi.claimsWhiteList
      );
    }
    return getUniqueConnectedElements(elements);
  }

  function getMonsPieceDeleteFadeElement(pieceId, gameId = activeMonsGameId) {
    const targetPieceId = String(pieceId || '').trim();
    if (!targetPieceId) {
      return null;
    }
    const targetGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    const candidateSvgs = [];
    if (targetGameId === normalizeMonsGameId(activeMonsGameId) && monsBoardSvg instanceof SVGElement) {
      candidateSvgs.push(monsBoardSvg);
    }
    const ghostBoardUi = monsGhostBoardElementsById.get(targetGameId);
    if (ghostBoardUi?.boardSvg instanceof SVGElement) {
      candidateSvgs.push(ghostBoardUi.boardSvg);
    }
    for (const svg of candidateSvgs) {
      const pieceNodes = svg.querySelectorAll('[data-mons-piece-id]');
      for (const node of pieceNodes) {
        if (!(node instanceof Element)) {
          continue;
        }
        if (node.getAttribute('data-mons-piece-id') === targetPieceId) {
          return node;
        }
      }
    }
    return null;
  }

  async function deleteCardInRemoveMode(cardId) {
    const targetCardId = String(cardId || '').trim();
    if (!targetCardId) {
      return;
    }
    await runDeleteWithFade(
      `card:${targetCardId}`,
      [cardElements.get(targetCardId), handCardElements.get(targetCardId)],
      async () => {
        await set(ref(db, `${roomPath}/cards/${targetCardId}`), null);
      }
    );
  }

  async function deleteDieInRemoveMode(dieId) {
    const targetDieId = String(dieId || '').trim();
    if (!targetDieId) {
      return;
    }
    await runDeleteWithFade(
      `die:${targetDieId}`,
      [diceElements.get(targetDieId)],
      async () => {
        await set(ref(db, `${roomPath}/dice/${targetDieId}`), null);
      }
    );
  }

  async function deleteDrawingStrokeInRemoveMode(strokeId) {
    const targetStrokeId = String(strokeId || '').trim();
    if (!targetStrokeId) {
      return;
    }
    await runDeleteWithFade(
      `stroke:${targetStrokeId}`,
      [drawingStrokeElements.get(targetStrokeId)],
      async () => {
        await set(ref(db, `${roomPath}/drawings/${targetStrokeId}`), null);
      }
    );
  }

  async function deleteDeckInRemoveMode(deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    await runDeleteWithFade(
      `deck:${targetDeckId}`,
      getDeckDeleteFadeElements(targetDeckId),
      async () => {
        await putAwayCoolJpegsGame(targetDeckId);
      }
    );
  }

  async function deleteMonsGameInRemoveMode(gameId = activeMonsGameId) {
    const targetGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    await runDeleteWithFade(
      `mons-game:${targetGameId}`,
      getMonsGameDeleteFadeElements(targetGameId),
      async () => {
        await putAwaySuperMetalMonsGame(targetGameId);
      }
    );
  }

  async function deleteMonsPieceInRemoveMode(pieceId, gameId = activeMonsGameId) {
    const targetPieceId = String(pieceId || '').trim();
    if (!targetPieceId) {
      return;
    }
    const targetGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    const pieceElement = getMonsPieceDeleteFadeElement(targetPieceId, targetGameId);
    await runDeleteWithFade(
      `mons-piece:${targetGameId}:${targetPieceId}`,
      [pieceElement],
      async () => {
        await runTransaction(
          getMonsGameRef(targetGameId),
          (currentGame) => {
            if (!currentGame || typeof currentGame !== 'object') {
              return currentGame;
            }
            const normalized = normalizeMonsGamePayload(currentGame);
            if (normalized.enabled === false) {
              return currentGame;
            }
            const nextPieces = normalized.pieces && typeof normalized.pieces === 'object' ? { ...normalized.pieces } : {};
            if (!Object.prototype.hasOwnProperty.call(nextPieces, targetPieceId)) {
              return currentGame;
            }
            delete nextPieces[targetPieceId];
            return {
              ...normalized,
              pieces: nextPieces,
              moveTick: (Number(normalized.moveTick) || 0) + 1,
              lastMove: null,
              updatedAt: Date.now()
            };
          },
          { applyLocally: false }
        );
      }
    );

    if (monsSelectionPieceId === targetPieceId) {
      monsSelectionPieceId = '';
    }
    if (monsPendingSpiritPush && (monsPendingSpiritPush.spiritId === targetPieceId || monsPendingSpiritPush.targetId === targetPieceId)) {
      monsPendingSpiritPush = null;
    }
    if (monsPendingDemonRebound && (monsPendingDemonRebound.demonId === targetPieceId || monsPendingDemonRebound.targetId === targetPieceId)) {
      monsPendingDemonRebound = null;
    }
  }

  function isLabelDieState(dieState) {
    return normalizeDieType(dieState?.type) === 'label';
  }

  function isLabelDieEditing(dieId) {
    return Boolean(labelEditState && labelEditState.dieId === dieId);
  }

  function buildLabelDimensionsPatch(nextText, dieState = null) {
    const normalizedText = normalizeLabelText(nextText);
    const sourceState = isLabelDieState(dieState) ? dieState : null;
    const currentTextScale = getLabelTextScale(sourceState, LABEL_TEXT_SCALE_DEFAULT);
    const currentWidth = Number(sourceState?.labelWidth);
    const currentHeight = Number(sourceState?.labelHeight);
    if (!Number.isFinite(currentWidth) || !Number.isFinite(currentHeight)) {
      const dimensions = measureLabelWorldDimensions(normalizedText, {
        textScale: currentTextScale
      });
      return {
        text: normalizedText,
        textScale: currentTextScale,
        labelWidth: dimensions.width,
        labelHeight: dimensions.height
      };
    }

    // Refit text to fill the current label area, then expand bounds only if needed.
    const targetWidth = clamp(currentWidth, LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH);
    const targetHeight = clamp(currentHeight, LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT);
    const layout = resolveLabelLayoutForBounds(
      normalizedText,
      targetWidth,
      targetHeight,
      LABEL_TEXT_SCALE_MAX
    );
    const nextWidth = clamp(Math.max(targetWidth, layout.labelWidth), LABEL_MIN_WORLD_WIDTH, LABEL_MAX_WORLD_WIDTH);
    const nextHeight = clamp(Math.max(targetHeight, layout.labelHeight), LABEL_MIN_WORLD_HEIGHT, LABEL_MAX_WORLD_HEIGHT);
    return {
      text: normalizedText,
      textScale: layout.textScale,
      labelWidth: nextWidth,
      labelHeight: nextHeight
    };
  }

  function applyLabelTextPatch(dieId, nextText) {
    const targetDieId = String(dieId || '').trim();
    if (!targetDieId) {
      return;
    }
    const dieState = diceById.get(targetDieId);
    if (!isLabelDieState(dieState)) {
      return;
    }
    const patch = buildLabelDimensionsPatch(nextText, dieState);
    patchLocalDie(targetDieId, patch);
    queueDiePatch(targetDieId, patch);
  }

  function closeLabelEditor(options = {}) {
    if (!labelEditState) {
      return;
    }
    if (labelEditState.closing) {
      return;
    }
    labelEditState.closing = true;
    const { dieId, editor } = labelEditState;
    const shouldCommit = options.commit !== false;
    if (shouldCommit && editor instanceof HTMLTextAreaElement) {
      applyLabelTextPatch(dieId, editor.value);
    }
    if (editor instanceof HTMLTextAreaElement && editor.isConnected) {
      editor.remove();
    }
    const dieElement = diceElements.get(dieId);
    if (dieElement) {
      dieElement.classList.remove('is-label-editing');
      delete dieElement.dataset.labelEditing;
    }
    labelEditState = null;
    renderDieElement(dieId);
  }

  function beginLabelEditing(dieId) {
    const targetDieId = String(dieId || '').trim();
    if (!targetDieId) {
      return;
    }
    const dieState = diceById.get(targetDieId);
    if (!isLabelDieState(dieState)) {
      return;
    }
    if (dieState.holderClientId && dieState.holderClientId !== clientId) {
      return;
    }
    if (isLabelDieEditing(targetDieId)) {
      labelEditState?.editor?.focus({ preventScroll: true });
      return;
    }
    closeLabelEditor({ commit: true });
    const dieElement = ensureDieElement(targetDieId);
    if (!(dieElement instanceof HTMLElement)) {
      return;
    }
    const face = dieElement.querySelector('.table-die-face');
    if (!(face instanceof HTMLElement)) {
      return;
    }
    dieElement.classList.add('is-label-editing');
    dieElement.dataset.labelEditing = '1';
    dieElement.classList.remove('is-resizable-label');
    dieElement.classList.remove('is-label-resize-hovered');
    dieElement.classList.remove('is-resizing-label');
    const resizeHandle = dieElement.querySelector('.table-label-resize-handle');
    if (resizeHandle instanceof HTMLElement) {
      resizeHandle.classList.add('hidden');
    }
    face.textContent = '';
    const editor = document.createElement('textarea');
    editor.className = 'table-label-editor';
    editor.rows = 1;
    editor.spellcheck = false;
    editor.autocapitalize = 'off';
    editor.autocomplete = 'off';
    editor.inputMode = 'text';
    editor.value = normalizeLabelText(dieState.text || '');
    editor.placeholder = LABEL_DEFAULT_TEXT;
    editor.style.color = normalizeHexColor(dieState.textColor || '#ff7a59');
    editor.style.fontSize = `${getLabelFontSizePx(dieState).toFixed(2)}px`;
    editor.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
    editor.addEventListener('contextmenu', (event) => {
      event.stopPropagation();
    });
    editor.addEventListener('input', () => {
      applyLabelTextPatch(targetDieId, editor.value);
      const latestState = diceById.get(targetDieId);
      if (isLabelDieState(latestState)) {
        editor.style.fontSize = `${getLabelFontSizePx(latestState).toFixed(2)}px`;
      }
    });
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLabelEditor({ commit: false });
        return;
      }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        closeLabelEditor({ commit: true });
      }
    });
    editor.addEventListener('blur', () => {
      closeLabelEditor({ commit: true });
    });
    face.appendChild(editor);
    labelEditState = {
      dieId: targetDieId,
      editor,
      closing: false
    };
    editor.focus({ preventScroll: true });
    if ((dieState.text || '') === LABEL_DEFAULT_TEXT) {
      editor.select();
    } else {
      const end = editor.value.length;
      editor.setSelectionRange(end, end);
    }
  }

  const sendPresenceHeartbeat = () => {
    if (hasSignaledSessionLeave) {
      return;
    }
    update(myPresenceRef, {
      connected: true,
      clientId,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
    update(myCursorRef, {
      name: playerState.name,
      color: playerState.color,
      drawMode: drawModeEnabled,
      playerToken: localPlayerToken,
      updatedAt: serverTimestamp()
    }).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  };

  const signalSessionLeave = () => {
    if (hasSignaledSessionLeave) {
      return;
    }
    hasSignaledSessionLeave = true;
    if (cursorHeartbeatIntervalId) {
      window.clearInterval(cursorHeartbeatIntervalId);
      cursorHeartbeatIntervalId = 0;
    }
    update(myPresenceRef, {
      connected: false,
      clientId: null,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(() => {
      // Best-effort teardown.
    });
    set(myCursorRef, null).catch(() => {
      // Best-effort teardown.
    });
  };

  cursorHeartbeatIntervalId = window.setInterval(sendPresenceHeartbeat, CURSOR_HEARTBEAT_INTERVAL_MS);
  sendPresenceHeartbeat();
  window.addEventListener('pagehide', signalSessionLeave);

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
    setHandHoverDragLock(Boolean(cardDragState || cardResizeState || groupDragState || handReorderState));
  }

  function hasActiveCardInteraction() {
    return Boolean(
      cardDragState ||
      cardResizeState ||
      dieDragState ||
      labelResizeState ||
      groupDragState ||
      handReorderState ||
      deckDragState ||
      monsDragState ||
      selectionBoxState
    );
  }

  function hasDragPointerComeToRest(dragState) {
    if (!dragState) {
      return false;
    }
    const lastMotionAt = Number(dragState.lastMotionAt) || 0;
    return Date.now() - lastMotionAt >= RIGHT_CLICK_FLIP_REST_MS;
  }

  function cancelActiveCardInteractions() {
    if (labelEditState) {
      closeLabelEditor({ commit: true });
    }
    const hasCardDrag = Boolean(cardDragState || cardResizeState || dieDragState || labelResizeState || groupDragState);
    const hasSelectedObjects = hasAnyGroupSelection();
    if (!hasCardDrag && !hasSelectedObjects) {
      return;
    }

    const cardIdsToRelease = new Set();
    const dieIdsToRelease = new Set();
    if (cardDragState?.cardId) {
      cardIdsToRelease.add(cardDragState.cardId);
    }
    if (cardResizeState?.cardId) {
      cardIdsToRelease.add(cardResizeState.cardId);
    }
    if (dieDragState?.dieId) {
      dieIdsToRelease.add(dieDragState.dieId);
    }
    if (labelResizeState?.dieId) {
      dieIdsToRelease.add(labelResizeState.dieId);
    }
    if (groupDragState?.basePositions instanceof Map) {
      for (const cardId of groupDragState.basePositions.keys()) {
        cardIdsToRelease.add(cardId);
      }
    }
    if (groupDragState?.baseDiePositions instanceof Map) {
      for (const dieId of groupDragState.baseDiePositions.keys()) {
        dieIdsToRelease.add(dieId);
      }
    }
    for (const selectedId of selectedCardIds) {
      cardIdsToRelease.add(selectedId);
    }
    for (const selectedId of selectedDiceIds) {
      dieIdsToRelease.add(selectedId);
    }

    const selectedIds = Array.from(selectedCardIds);
    selectedCardIds.clear();
    for (const selectedId of selectedIds) {
      renderCardElement(selectedId);
    }
    const selectedDieIds = Array.from(selectedDiceIds);
    selectedDiceIds.clear();
    for (const selectedId of selectedDieIds) {
      renderDieElement(selectedId);
    }

    cardDragState = null;
    cardResizeState = null;
    resizingImageCardId = '';
    dieDragState = null;
    labelResizeState = null;
    resizingLabelDieId = '';
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
    for (const dieId of dieIdsToRelease) {
      const dieState = diceById.get(dieId);
      if (!dieState || dieState.holderClientId !== clientId) {
        renderDieElement(dieId);
        continue;
      }
      const releasePatch = {
        holderClientId: null
      };
      patchLocalDie(dieId, releasePatch);
      queueDiePatch(dieId, releasePatch);
      releaseDieLock(dieId).catch((error) => {
        console.error(error);
      });
    }

    releaseSelectedDecks();
    releaseSelectedMonsBoards();
  }

  function releaseUnexpectedLocalCardLocks() {
    if (hasActiveCardInteraction()) {
      return;
    }
    const movableSelectedIds = new Set(getMovableSelectedIds());
    const movableSelectedDieIds = new Set(getMovableSelectedDieIds());
    const movableSelectedDeckIds = new Set(getMovableSelectedDeckIds());
    const movableSelectedMonsIds = new Set(getMovableSelectedMonsGameIds());
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
    for (const [deckId, deckState] of deckStatesById.entries()) {
      if (!deckState || deckState.holderClientId !== clientId) {
        continue;
      }
      const normalizedDeckId = normalizeDeckId(deckId);
      if (movableSelectedDeckIds.has(normalizedDeckId)) {
        continue;
      }
      patchLocalDeck({ holderClientId: null }, normalizedDeckId);
      queueDeckPatch({ holderClientId: null }, normalizedDeckId);
      releaseDeckLock(normalizedDeckId).catch((error) => {
        console.error(error);
      });
    }
    for (const [dieId, dieState] of diceById.entries()) {
      if (!dieState || dieState.holderClientId !== clientId) {
        continue;
      }
      if (dieDragState?.dieId === dieId || labelResizeState?.dieId === dieId || movableSelectedDieIds.has(dieId)) {
        continue;
      }
      patchLocalDie(dieId, { holderClientId: null });
      queueDiePatch(dieId, { holderClientId: null });
      releaseDieLock(dieId).catch((error) => {
        console.error(error);
      });
    }
    for (const [gameId, gameState] of monsGameStatesById.entries()) {
      if (!gameState || gameState.holderClientId !== clientId) {
        continue;
      }
      const normalizedGameId = normalizeMonsGameId(gameId);
      if (movableSelectedMonsIds.has(normalizedGameId)) {
        continue;
      }
      patchLocalMonsGame({ holderClientId: null }, normalizedGameId);
      queueMonsPatch({ holderClientId: null }, normalizedGameId);
      releaseMonsBoardLock(normalizedGameId).catch((error) => {
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
    for (const [dieId, tap] of recentTouchTapByDieId.entries()) {
      if (now - tap.time > TOUCH_DOUBLE_TAP_MS) {
        recentTouchTapByDieId.delete(dieId);
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
    for (const [dieId, click] of recentMouseClickByDieId.entries()) {
      if (now - click.time > MOUSE_DOUBLE_CLICK_MS) {
        recentMouseClickByDieId.delete(dieId);
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

  function consumeDieDoubleTapIfPresent(dieId, event) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      return false;
    }
    const now = Date.now();
    pruneRecentTouchTaps(now);
    const previousTap = recentTouchTapByDieId.get(dieId);
    if (!previousTap) {
      return false;
    }
    const elapsed = now - previousTap.time;
    const distance = Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y);
    if (elapsed > TOUCH_DOUBLE_TAP_MS || distance > TOUCH_DOUBLE_TAP_MAX_DISTANCE_PX) {
      return false;
    }
    recentTouchTapByDieId.delete(dieId);
    return true;
  }

  function rememberDieTouchTapCandidate(dieId, event) {
    if ((event.pointerType !== 'touch' && event.pointerType !== 'pen') || !dieId) {
      return;
    }
    const now = Date.now();
    pruneRecentTouchTaps(now);
    recentTouchTapByDieId.set(dieId, {
      time: now,
      x: event.clientX,
      y: event.clientY
    });
  }

  function consumeDieDoubleClickIfPresent(dieId, event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return false;
    }
    const now = Date.now();
    pruneRecentMouseClicks(now);
    const previousClick = recentMouseClickByDieId.get(dieId);
    if (!previousClick) {
      return false;
    }
    const elapsed = now - previousClick.time;
    const distance = Math.hypot(event.clientX - previousClick.x, event.clientY - previousClick.y);
    if (elapsed > MOUSE_DOUBLE_CLICK_MS || distance > MOUSE_DOUBLE_CLICK_MAX_DISTANCE_PX) {
      return false;
    }
    recentMouseClickByDieId.delete(dieId);
    return true;
  }

  function rememberDieMouseClickCandidate(dieId, event) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !dieId) {
      return;
    }
    const now = Date.now();
    pruneRecentMouseClicks(now);
    recentMouseClickByDieId.set(dieId, {
      time: now,
      x: event.clientX,
      y: event.clientY
    });
  }

  function setDeckDropIndicator(visible, deckId = activeDeckId) {
    const nextVisible = Boolean(cardDragState || groupDragState || handReorderState?.releaseToTable) && Boolean(visible);
    const nextDeckId = nextVisible ? normalizeDeckId(deckId) : '';
    if (deckDropIndicatorVisible === nextVisible && deckDropIndicatorDeckId === nextDeckId) {
      return;
    }
    deckDropIndicatorVisible = nextVisible;
    deckDropIndicatorDeckId = nextDeckId;
    renderDeckControls();
  }

  function setDiscardDropIndicator(visible, deckId = activeDeckId) {
    const nextVisible = Boolean(cardDragState || groupDragState || handReorderState?.releaseToTable) && Boolean(visible);
    const nextDeckId = nextVisible ? normalizeDeckId(deckId) : '';
    if (discardDropIndicatorVisible === nextVisible && discardDropIndicatorDeckId === nextDeckId) {
      return;
    }
    discardDropIndicatorVisible = nextVisible;
    discardDropIndicatorDeckId = nextDeckId;
    renderDeckControls();
  }

  function setAuctionDropIndicator(visible, deckId = activeDeckId) {
    const nextVisible = Boolean(cardDragState || groupDragState || handReorderState?.releaseToTable) && Boolean(visible);
    const nextDeckId = nextVisible ? normalizeDeckId(deckId) : '';
    if (auctionDropIndicatorVisible === nextVisible && auctionDropIndicatorDeckId === nextDeckId) {
      return;
    }
    auctionDropIndicatorVisible = nextVisible;
    auctionDropIndicatorDeckId = nextDeckId;
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

  function queueDiePatch(dieId, patch) {
    if (isTableResetting || !dieId || !patch || typeof patch !== 'object') {
      return;
    }
    const queuedPatch = pendingDieWrites.get(dieId) || {};
    pendingDieWrites.set(dieId, { ...queuedPatch, ...patch });
    if (dieWriteScheduled) {
      return;
    }

    dieWriteScheduled = true;
    const scheduledGeneration = dieWriteGeneration;
    window.requestAnimationFrame(() => {
      dieWriteScheduled = false;
      if (scheduledGeneration !== dieWriteGeneration) {
        return;
      }
      for (const [pendingDieId, pendingPatch] of pendingDieWrites.entries()) {
        pendingDieWrites.delete(pendingDieId);
        update(ref(db, `${roomPath}/dice/${pendingDieId}`), {
          ...pendingPatch,
          updatedAt: serverTimestamp()
        }).catch((error) => {
          console.error(error);
          setRealtimeStatus('firebase: write blocked');
        });
      }
    });
  }

  function queueDeckPatch(patch, deckId = activeDeckId) {
    if (isTableResetting) {
      return;
    }
    const normalizedDeckId = normalizeDeckId(deckId);
    const queuedForDeck = pendingDeckPatch[normalizedDeckId] || {};
    pendingDeckPatch = {
      ...pendingDeckPatch,
      [normalizedDeckId]: { ...queuedForDeck, ...patch }
    };
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
      const entries = Object.entries(payload || {});
      if (entries.length === 0) {
        return;
      }
      for (const [pendingDeckId, deckPatch] of entries) {
        if (!deckPatch || typeof deckPatch !== 'object' || Object.keys(deckPatch).length === 0) {
          continue;
        }
        update(ref(db, `${roomPath}/decks/${pendingDeckId}`), {
          ...deckPatch,
          updatedAt: serverTimestamp()
        }).catch((error) => {
          console.error(error);
          setRealtimeStatus('firebase: write blocked');
        });
      }
    });
  }

  function queueMonsPatch(patch, gameId = activeMonsGameId) {
    if (isTableResetting) {
      return;
    }
    if (!patch || typeof patch !== 'object') {
      return;
    }
    const normalizedGameId = normalizeMonsGameId(gameId);
    const queuedForGame = pendingMonsPatch[normalizedGameId] || {};
    pendingMonsPatch = {
      ...pendingMonsPatch,
      [normalizedGameId]: { ...queuedForGame, ...patch }
    };
    if (monsWriteScheduled) {
      return;
    }

    monsWriteScheduled = true;
    const scheduledGeneration = monsWriteGeneration;
    window.requestAnimationFrame(() => {
      monsWriteScheduled = false;
      if (scheduledGeneration !== monsWriteGeneration) {
        return;
      }
      const payload = pendingMonsPatch;
      pendingMonsPatch = {};
      const entries = Object.entries(payload || {});
      if (entries.length === 0) {
        return;
      }
      for (const [pendingGameId, gamePatch] of entries) {
        if (!gamePatch || typeof gamePatch !== 'object' || Object.keys(gamePatch).length === 0) {
          continue;
        }
        update(ref(db, `${roomPath}/games/${pendingGameId}`), {
          ...gamePatch,
          updatedAt: serverTimestamp()
        }).catch((error) => {
          console.error(error);
          setRealtimeStatus('firebase: write blocked');
        });
      }
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
    syncDrawActionButtonsState();
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

  function getDrawShapePoints(tool, startPoint, endPoint) {
    const normalizedTool = normalizeDrawToolMode(tool);
    const startX = clamp(Number(startPoint?.x) || 0, 0, WORLD_WIDTH);
    const startY = clamp(Number(startPoint?.y) || 0, 0, WORLD_HEIGHT);
    const endX = clamp(Number(endPoint?.x) || 0, 0, WORLD_WIDTH);
    const endY = clamp(Number(endPoint?.y) || 0, 0, WORLD_HEIGHT);
    if (normalizedTool === DRAW_TOOL_BOX) {
      const left = Math.min(startX, endX);
      const right = Math.max(startX, endX);
      const top = Math.min(startY, endY);
      const bottom = Math.max(startY, endY);
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom },
        { x: left, y: top }
      ];
    }
    return [
      { x: startX, y: startY },
      { x: endX, y: endY }
    ];
  }

  function removeDrawShapePreviewStroke() {
    if (!drawShapePreviewStroke) {
      return;
    }
    drawShapePreviewStroke.remove();
    drawShapePreviewStroke = null;
  }

  function ensureDrawShapePreviewStroke() {
    if (!(drawingLayer instanceof SVGElement)) {
      return null;
    }
    if (drawShapePreviewStroke) {
      return drawShapePreviewStroke;
    }
    const previewStroke = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    previewStroke.classList.add('drawing-stroke', 'drawing-shape-preview');
    previewStroke.setAttribute('stroke-width', String(DRAW_STROKE_WORLD_WIDTH));
    previewStroke.setAttribute('fill', 'none');
    drawingLayer.appendChild(previewStroke);
    drawShapePreviewStroke = previewStroke;
    return drawShapePreviewStroke;
  }

  function removeDrawShapeAnchorDot() {
    if (!drawShapeAnchorDot) {
      return;
    }
    drawShapeAnchorDot.remove();
    drawShapeAnchorDot = null;
  }

  function ensureDrawShapeAnchorDot() {
    if (!(drawingLayer instanceof SVGElement)) {
      return null;
    }
    if (drawShapeAnchorDot) {
      return drawShapeAnchorDot;
    }
    const anchorDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    anchorDot.classList.add('drawing-anchor-dot');
    anchorDot.setAttribute('r', '6');
    drawingLayer.appendChild(anchorDot);
    drawShapeAnchorDot = anchorDot;
    return drawShapeAnchorDot;
  }

  function getShapeAnchorVisualPoint() {
    if (drawShapePointerState && drawShapePointerState.phase === 'second') {
      return drawShapePointerState.startPoint;
    }
    if (drawShapeAnchorState) {
      return drawShapeAnchorState.startPoint;
    }
    return null;
  }

  function syncShapeDrawingAssistVisuals() {
    if (drawShapePointerState) {
      const previewStroke = ensureDrawShapePreviewStroke();
      if (previewStroke) {
        const previewPoints = getDrawShapePoints(
          drawShapePointerState.tool,
          drawShapePointerState.startPoint,
          drawShapePointerState.currentPoint
        );
        if (
          previewPoints.length >= 2 &&
          Math.hypot(previewPoints[0].x - previewPoints[1].x, previewPoints[0].y - previewPoints[1].y) < 0.01
        ) {
          previewPoints[1] = {
            x: clamp(previewPoints[0].x + 0.01, 0, WORLD_WIDTH),
            y: clamp(previewPoints[0].y + 0.01, 0, WORLD_HEIGHT)
          };
        }
        const pointsText = previewPoints.map((point) => `${point.x},${point.y}`).join(' ');
        previewStroke.setAttribute('stroke', normalizeHexColor(drawShapePointerState.color || playerState.color || '#ff7a59'));
        previewStroke.setAttribute('points', pointsText);
      }
    } else {
      removeDrawShapePreviewStroke();
    }

    const anchorPoint = getShapeAnchorVisualPoint();
    if (!anchorPoint) {
      removeDrawShapeAnchorDot();
      return;
    }
    const anchorDot = ensureDrawShapeAnchorDot();
    if (!anchorDot) {
      return;
    }
    const anchorColor = normalizeHexColor(
      drawShapePointerState?.color || drawShapeAnchorState?.color || playerState.color || '#ff7a59'
    );
    anchorDot.setAttribute('cx', String(clamp(Number(anchorPoint.x) || 0, 0, WORLD_WIDTH)));
    anchorDot.setAttribute('cy', String(clamp(Number(anchorPoint.y) || 0, 0, WORLD_HEIGHT)));
    anchorDot.setAttribute('fill', anchorColor);
  }

  function commitShapeStroke(tool, startPoint, endPoint, color) {
    const strokeRef = push(drawingsRef);
    const strokeId = strokeRef.key;
    if (!strokeId) {
      return false;
    }
    const normalizedTool = normalizeDrawToolMode(tool);
    let points = getDrawShapePoints(normalizedTool, startPoint, endPoint);
    if (normalizedTool === DRAW_TOOL_LINE) {
      const first = points[0];
      const second = points[1];
      if (Math.hypot(second.x - first.x, second.y - first.y) < 0.01) {
        points = [
          first,
          {
            x: clamp(first.x + 0.01, 0, WORLD_WIDTH),
            y: clamp(first.y + 0.01, 0, WORLD_HEIGHT)
          }
        ];
      }
    }
    const now = Date.now();
    const normalizedColor = normalizeHexColor(color || playerState.color || '#ff7a59');
    patchLocalDrawingStroke(strokeId, {
      color: normalizedColor,
      points,
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken,
      createdAt: now,
      updatedAt: now
    });
    queueDrawingPatch(strokeId, {
      color: normalizedColor,
      points: serializeDrawingPoints(points),
      authorClientId: clientId,
      authorPlayerToken: localPlayerToken,
      createdAt: serverTimestamp()
    });
    return true;
  }

  function beginShapeDrawing(event) {
    if (!drawModeEnabled || drawShapePointerState) {
      return false;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }
    const normalizedTool = normalizeDrawToolMode(activeDrawTool);
    if (normalizedTool === DRAW_TOOL_FREE) {
      return false;
    }
    const startPoint = {
      x: clamp(worldPoint.x, 0, WORLD_WIDTH),
      y: clamp(worldPoint.y, 0, WORLD_HEIGHT)
    };
    const shapeColor = normalizeHexColor(playerState.color);
    const anchorState =
      drawShapeAnchorState && normalizeDrawToolMode(drawShapeAnchorState.tool) === normalizedTool
        ? drawShapeAnchorState
        : null;
    drawShapePointerState = {
      pointerId: event.pointerId,
      tool: normalizedTool,
      phase: anchorState ? 'second' : 'first',
      color: anchorState?.color || shapeColor,
      startPoint: anchorState?.startPoint || startPoint,
      currentPoint: startPoint,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false
    };
    if (anchorState) {
      drawShapeAnchorState = null;
    }
    syncShapeDrawingAssistVisuals();
    return true;
  }

  function updateShapeDrawing(event) {
    if (!drawModeEnabled || !drawShapePointerState || drawShapePointerState.pointerId !== event.pointerId) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return true;
    }
    drawShapePointerState.currentPoint = {
      x: clamp(worldPoint.x, 0, WORLD_WIDTH),
      y: clamp(worldPoint.y, 0, WORLD_HEIGHT)
    };
    const moveDistance = Math.hypot(
      event.clientX - drawShapePointerState.startClientX,
      event.clientY - drawShapePointerState.startClientY
    );
    if (moveDistance >= DRAW_TOOL_DRAG_MIN_DISTANCE) {
      drawShapePointerState.moved = true;
    }
    syncShapeDrawingAssistVisuals();
    return true;
  }

  function finishShapeDrawing(event) {
    if (!drawShapePointerState || drawShapePointerState.pointerId !== event.pointerId) {
      return false;
    }
    const finishedState = drawShapePointerState;
    drawShapePointerState = null;
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    const endPoint = worldPoint
      ? {
        x: clamp(worldPoint.x, 0, WORLD_WIDTH),
        y: clamp(worldPoint.y, 0, WORLD_HEIGHT)
      }
      : finishedState.currentPoint || finishedState.startPoint;

    if (finishedState.moved) {
      drawShapeAnchorState = null;
      const committed = commitShapeStroke(finishedState.tool, finishedState.startPoint, endPoint, finishedState.color);
      syncShapeDrawingAssistVisuals();
      return committed;
    }

    if (finishedState.phase === 'first') {
      drawShapeAnchorState = {
        tool: finishedState.tool,
        startPoint: finishedState.startPoint,
        color: finishedState.color
      };
      syncShapeDrawingAssistVisuals();
      return true;
    }

    drawShapeAnchorState = null;
    const committed = commitShapeStroke(finishedState.tool, finishedState.startPoint, endPoint, finishedState.color);
    syncShapeDrawingAssistVisuals();
    return committed;
  }

  onDrawToolModeChanged = () => {
    drawPointerState = null;
    drawShapePointerState = null;
    drawShapeAnchorState = null;
    syncShapeDrawingAssistVisuals();
  };

  setDrawModeEnabled = (enabled) => {
    const nextEnabled = Boolean(enabled);
    if (nextEnabled && deleteModeEnabled) {
      setDeleteModeEnabled(false);
    }
    if (drawModeEnabled === nextEnabled) {
      syncDrawModeUi();
      syncLocalDrawCursor();
      syncShapeDrawingAssistVisuals();
      return;
    }
    drawModeEnabled = nextEnabled;
    syncDrawModeUi();
    syncCursorState(localPosition);
    if (drawModeEnabled) {
      closeLabelEditor({ commit: true });
    }
    if (drawModeEnabled) {
      syncLocalDrawCursor();
    } else {
      hideLocalDrawCursor();
    }
    if (!drawModeEnabled) {
      drawPointerState = null;
      drawShapePointerState = null;
      drawShapeAnchorState = null;
      syncShapeDrawingAssistVisuals();
      return;
    }
    drawShapePointerState = null;
    drawShapeAnchorState = null;

    cancelActiveCardInteractions();
    if (hasAnyGroupSelection()) {
      releaseAllSelectedObjects();
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
    if (dieDragState) {
      const draggedDieId = dieDragState.dieId;
      const draggedDieState = diceById.get(draggedDieId);
      dieDragState = null;
      if (draggedDieState?.holderClientId === clientId) {
        patchLocalDie(draggedDieId, { holderClientId: null });
        queueDiePatch(draggedDieId, { holderClientId: null });
        releaseDieLock(draggedDieId).catch((error) => {
          console.error(error);
        });
      }
    }
    if (deckDragState) {
      const draggedDeckId = normalizeDeckId(deckDragState.deckId);
      const draggedDeckState = getDeckStateById(draggedDeckId);
      if (draggedDeckState?.holderClientId === clientId) {
        patchLocalDeck({ holderClientId: null }, draggedDeckId);
        queueDeckPatch({ holderClientId: null }, draggedDeckId);
        releaseDeckLock(draggedDeckId).catch((error) => {
          console.error(error);
        });
      }
      deckDragState = null;
    }
    if (monsDragState) {
      const draggedMonsGameId = normalizeMonsGameId(monsDragState.gameId || activeMonsGameId);
      const draggedMonsGameState = getMonsGameStateById(draggedMonsGameId);
      monsDragState = null;
      setMonsBoardDragFloating(false);
      if (draggedMonsGameState?.holderClientId === clientId) {
        patchLocalMonsGame({ holderClientId: null }, draggedMonsGameId);
        queueMonsPatch({ holderClientId: null }, draggedMonsGameId);
        releaseMonsBoardLock(draggedMonsGameId).catch((error) => {
          console.error(error);
        });
      }
    }
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    syncShapeDrawingAssistVisuals();
  };
  setDeleteModeEnabled = (enabled) => {
    const nextEnabled = Boolean(enabled);
    if (deleteModeEnabled === nextEnabled) {
      tableRoot?.classList.toggle('is-delete-mode', nextEnabled);
      deleteModeCancelButton?.classList.toggle('hidden', !nextEnabled);
      return;
    }
    if (nextEnabled) {
      closeLabelEditor({ commit: true });
      if (drawModeEnabled) {
        setDrawModeEnabled(false);
      }
      cancelActiveCardInteractions();
      if (hasAnyGroupSelection()) {
        releaseAllSelectedObjects();
      }
      closeGameOptionsMenu();
      closeDiceAddModal();
      closeImageAddModal();
      closeMonsItemChoiceModal();
    }
    deleteModeEnabled = nextEnabled;
    tableRoot?.classList.toggle('is-delete-mode', nextEnabled);
    deleteModeCancelButton?.classList.toggle('hidden', !nextEnabled);
  };
  setDeleteModeEnabled(deleteModeEnabled);
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
    drawShapePointerState = null;
    drawShapeAnchorState = null;
    syncShapeDrawingAssistVisuals();
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
    drawShapePointerState = null;
    drawShapeAnchorState = null;
    syncShapeDrawingAssistVisuals();
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
      const createdDeckIds = new Set();
      const orderedStaleCardIds = getCardsSortedByZ(staleCardIds);
      const nextDeckZById = new Map();
      const updatesByPath = {};
      for (const cardId of orderedStaleCardIds) {
        const staleCardState = cards.get(cardId);
        if (!staleCardState) {
          continue;
        }
        const targetDeckId = getCardDeckId(staleCardState);
        const existingDeck = getDeckStateById(targetDeckId);
        if (!existingDeck && !createdDeckIds.has(targetDeckId)) {
          const center = getDeckCenterPosition(targetDeckId);
          const nextDeck = {
            x: center.x,
            y: center.y,
            shuffleTick: 0,
            holderClientId: null
          };
          patchLocalDeck(nextDeck, targetDeckId);
          await update(ref(db, `${roomPath}/decks/${targetDeckId}`), {
            ...nextDeck,
            updatedAt: serverTimestamp()
          });
          createdDeckIds.add(targetDeckId);
        }
        const targetDeckState = getDeckStateById(targetDeckId);
        if (!targetDeckState) {
          continue;
        }
        let nextDeckZ = nextDeckZById.get(targetDeckId);
        if (!Number.isFinite(nextDeckZ)) {
          nextDeckZ = getDeckTopZ(targetDeckId) + 1;
        }
        const patch = {
          x: targetDeckState.x,
          y: targetDeckState.y,
          z: nextDeckZ,
          face: 'back',
          deckId: targetDeckId,
          inDeck: true,
          inDiscard: false,
          inAuction: false,
          holderClientId: null,
          handOwnerClientId: null,
          handOwnerPlayerToken: null
        };
        nextDeckZ += 1;
        nextDeckZById.set(targetDeckId, nextDeckZ);
        patchLocalCard(cardId, patch);
        updatesByPath[`${cardId}/x`] = patch.x;
        updatesByPath[`${cardId}/y`] = patch.y;
        updatesByPath[`${cardId}/z`] = patch.z;
        updatesByPath[`${cardId}/face`] = patch.face;
        updatesByPath[`${cardId}/deckId`] = patch.deckId;
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

  function patchLocalDie(dieId, patch) {
    const existingDie = diceById.get(dieId);
    if (!existingDie) {
      return;
    }
    const nextState = normalizeDicePayload({ ...existingDie, ...patch });
    diceById.set(dieId, nextState);
    renderDieElement(dieId);
  }

  function patchLocalCard(cardId, patch) {
    const existingCard = cards.get(cardId);
    if (!existingCard) {
      return;
    }
    cards.set(cardId, normalizeCardPayload({ ...existingCard, ...patch }));
    renderCardElement(cardId);
  }

  function patchLocalDeck(patch, deckId = activeDeckId) {
    const normalizedDeckId = normalizeDeckId(deckId);
    const baseDeck = getDeckStateById(normalizedDeckId) || normalizeDeckPayload(getDeckCenterPosition(normalizedDeckId));
    const nextDeck = normalizeDeckPayload({ ...baseDeck, ...patch });
    deckStatesById.set(normalizedDeckId, nextDeck);
    if (normalizeDeckId(activeDeckId) === normalizedDeckId) {
      deckState = nextDeck;
    }
    renderAllCards();
  }

  function patchLocalMonsGame(patch, gameId = activeMonsGameId) {
    const normalizedGameId = normalizeMonsGameId(gameId);
    const baseGame = getMonsGameStateById(normalizedGameId) || normalizeMonsGamePayload({});
    const nextGame = normalizeMonsGamePayload({ ...baseGame, ...patch });
    monsGameStatesById.set(normalizedGameId, nextGame);
    if (normalizeMonsGameId(activeMonsGameId) === normalizedGameId) {
      monsGameState = nextGame;
    }
    renderMonsBoard();
  }

  function getTopCardZ() {
    let topZ = 0;
    for (const cardState of cards.values()) {
      topZ = Math.max(topZ, Number(cardState.z) || 0);
    }
    return topZ;
  }

  function getTopObjectZ() {
    return Math.max(getTopCardZ(), getTopDieZ());
  }

  function getDeckCardIdsInOrder() {
    return getDeckCardIds(activeDeckId).sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
  }

  function getCardDeckId(cardState) {
    return normalizeDeckId(cardState?.deckId || activeDeckId || DECK_KEY);
  }

  function getDeckIdAtPosition(x, y, region = 'deck') {
    const deckIds = getDeckIdsInRoom();
    let matchedDeckId = '';
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const candidateDeckId of deckIds) {
      const candidateDeckState = getDeckStateById(candidateDeckId);
      if (!candidateDeckState) {
        continue;
      }
      let matches = false;
      let center = { x: candidateDeckState.x, y: candidateDeckState.y };
      if (region === 'discard') {
        center = getDiscardCenterPosition(candidateDeckId);
        matches = Math.abs(x - center.x) <= CARD_WIDTH / 2 && Math.abs(y - center.y) <= CARD_HEIGHT / 2;
      } else if (region === 'auction') {
        center = getAuctionCenterPosition(candidateDeckId);
        matches =
          Math.abs(x - center.x) <= (CARD_WIDTH + AUCTION_SLOT_EXTRA_SIZE) / 2 &&
          Math.abs(y - center.y) <= (CARD_HEIGHT + AUCTION_SLOT_EXTRA_SIZE) / 2;
      } else {
        matches = Math.abs(x - center.x) <= CARD_WIDTH / 2 && Math.abs(y - center.y) <= CARD_HEIGHT / 2;
      }
      if (!matches) {
        continue;
      }
      const distance = Math.hypot(x - center.x, y - center.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        matchedDeckId = candidateDeckId;
      }
    }
    return matchedDeckId;
  }

  function isPositionOverDeck(x, y, deckId = activeDeckId) {
    const targetDeckState = getDeckStateById(deckId);
    if (!targetDeckState) {
      return false;
    }
    return Math.abs(x - targetDeckState.x) <= CARD_WIDTH / 2 && Math.abs(y - targetDeckState.y) <= CARD_HEIGHT / 2;
  }

  function isPositionOverDiscard(x, y, deckId = activeDeckId) {
    const targetDeckState = getDeckStateById(deckId);
    if (!targetDeckState) {
      return false;
    }
    const discardCenter = getDiscardCenterPosition(deckId);
    return Math.abs(x - discardCenter.x) <= CARD_WIDTH / 2 && Math.abs(y - discardCenter.y) <= CARD_HEIGHT / 2;
  }

  function isPositionOverAuction(x, y, deckId = activeDeckId) {
    const targetDeckState = getDeckStateById(deckId);
    if (!targetDeckState) {
      return false;
    }
    const auctionCenter = getAuctionCenterPosition(deckId);
    return (
      Math.abs(x - auctionCenter.x) <= (CARD_WIDTH + AUCTION_SLOT_EXTRA_SIZE) / 2 &&
      Math.abs(y - auctionCenter.y) <= (CARD_HEIGHT + AUCTION_SLOT_EXTRA_SIZE) / 2
    );
  }

  function canPlaceCardOnAuction(cardId, deckId = activeDeckId) {
    const cardState = cards.get(cardId);
    if (!cardState || !canCardUseDeckZones(cardState)) {
      return false;
    }
    const targetDeckId = normalizeDeckId(deckId || getCardDeckId(cardState));
    const auctionIds = getAuctionCardIds(targetDeckId);
    if (auctionIds.length === 0) {
      return true;
    }
    return cardState.inAuction && normalizeDeckId(cardState.deckId) === targetDeckId;
  }

  function canPlaceCardsOnAuction(cardIds, deckId = activeDeckId) {
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return false;
    }
    const targetDeckId = normalizeDeckId(deckId);
    const auctionIds = getAuctionCardIds(targetDeckId);
    if (auctionIds.length === 0) {
      return true;
    }
    return cardIds.every((cardId) => {
      const cardState = cards.get(cardId);
      if (!cardState || !canCardUseDeckZones(cardState)) {
        return false;
      }
      return Boolean(cardState.inAuction) && normalizeDeckId(cardState.deckId) === targetDeckId;
    });
  }

  function getDiscardTopZ(deckId = activeDeckId) {
    const normalizedDeckId = normalizeDeckId(deckId);
    let maxZ = 1;
    for (const cardState of cards.values()) {
      if (cardState.inDiscard && normalizeDeckId(cardState.deckId) === normalizedDeckId) {
        maxZ = Math.max(maxZ, Number(cardState.z) || 1);
      }
    }
    return maxZ;
  }

  function getAuctionTopZ(deckId = activeDeckId) {
    const normalizedDeckId = normalizeDeckId(deckId);
    let maxZ = 1;
    for (const cardState of cards.values()) {
      if (cardState.inAuction && normalizeDeckId(cardState.deckId) === normalizedDeckId) {
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
    const nextFace = getFaceWhenEnteringHand(cardState);
    return {
      x: cardState.x,
      y: cardState.y,
      z: Number.isFinite(nextHandZ) ? nextHandZ : getTopHandZ(ownerToken) + 1,
      face: nextFace,
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

  function buildDeckDropPatch(cardId, preferredDeckId = '') {
    const cardState = cards.get(cardId);
    if (!cardState || !canCardUseDeckZones(cardState)) {
      return null;
    }

    const targetDeckId = normalizeDeckId(preferredDeckId || getDeckIdAtPosition(cardState.x, cardState.y, 'deck') || getCardDeckId(cardState));
    const targetDeckState = getDeckStateById(targetDeckId);
    if (!targetDeckState || !isPositionOverDeck(cardState.x, cardState.y, targetDeckId)) {
      return null;
    }

    return {
      x: targetDeckState.x,
      y: targetDeckState.y,
      z: getDeckTopZ(targetDeckId) + 1,
      deckId: targetDeckId,
      inDeck: true,
      inDiscard: false,
      inAuction: false,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
  }

  function buildDiscardPlacementPatch(nextZ = getDiscardTopZ() + 1, deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const discardCenter = getDiscardCenterPosition(targetDeckId);
    return {
      x: discardCenter.x,
      y: discardCenter.y,
      z: nextZ,
      deckId: targetDeckId,
      inDeck: false,
      inDiscard: true,
      inAuction: false,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
  }

  function buildDiscardDropPatch(cardId, preferredDeckId = '') {
    const cardState = cards.get(cardId);
    if (!cardState || !canCardUseDeckZones(cardState)) {
      return null;
    }

    const targetDeckId = normalizeDeckId(preferredDeckId || getDeckIdAtPosition(cardState.x, cardState.y, 'discard') || getCardDeckId(cardState));
    const targetDeckState = getDeckStateById(targetDeckId);
    if (!targetDeckState || !isPositionOverDiscard(cardState.x, cardState.y, targetDeckId)) {
      return null;
    }
    return buildDiscardPlacementPatch(getDiscardTopZ(targetDeckId) + 1, targetDeckId);
  }

  function buildAuctionPlacementPatch(nextZ = getAuctionTopZ() + 1, deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const auctionCenter = getAuctionCenterPosition(targetDeckId);
    return {
      x: auctionCenter.x,
      y: auctionCenter.y,
      z: nextZ,
      face: 'front',
      deckId: targetDeckId,
      inDeck: false,
      inDiscard: false,
      inAuction: true,
      holderClientId: null,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
  }

  function buildAuctionDropPatch(cardId, preferredDeckId = '') {
    const cardState = cards.get(cardId);
    if (!cardState || !canCardUseDeckZones(cardState)) {
      return null;
    }

    const targetDeckId = normalizeDeckId(preferredDeckId || getDeckIdAtPosition(cardState.x, cardState.y, 'auction') || getCardDeckId(cardState));
    const targetDeckState = getDeckStateById(targetDeckId);
    if (!targetDeckState || !isPositionOverAuction(cardState.x, cardState.y, targetDeckId)) {
      return null;
    }
    if (!canPlaceCardOnAuction(cardId, targetDeckId)) {
      return null;
    }
    return buildAuctionPlacementPatch(getAuctionTopZ(targetDeckId) + 1, targetDeckId);
  }

  async function bringDeckToFront(deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const orderedDeckCards = [];
    for (const [cardId, cardState] of cards.entries()) {
      if (!cardState || typeof cardState !== 'object') {
        continue;
      }
      if (normalizeDeckId(cardState.deckId || DECK_KEY) !== targetDeckId) {
        continue;
      }
      if (!cardState.inDeck && !cardState.inDiscard && !cardState.inAuction) {
        continue;
      }
      orderedDeckCards.push(cardId);
    }
    orderedDeckCards.sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
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

  async function acquireDieLock(dieId) {
    const holderRef = ref(db, `${roomPath}/dice/${dieId}/holderClientId`);
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

  async function releaseDieLock(dieId) {
    const holderRef = ref(db, `${roomPath}/dice/${dieId}/holderClientId`);
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

  function getMovableSelectedDeckIds() {
    return Array.from(selectedDeckIds).filter((deckId) => {
      const deckState = getDeckStateById(deckId);
      return Boolean(deckState) && deckState.holderClientId === clientId;
    });
  }

  function getMovableSelectedDieIds() {
    return Array.from(selectedDiceIds).filter((dieId) => {
      const dieState = diceById.get(dieId);
      return Boolean(dieState) && dieState.holderClientId === clientId;
    });
  }

  function getMovableSelectedMonsGameIds() {
    return Array.from(selectedMonsGameIds).filter((gameId) => {
      const gameState = getMonsGameStateById(gameId);
      return Boolean(gameState) && gameState.enabled !== false && gameState.holderClientId === clientId;
    });
  }

  function hasAnyGroupSelection() {
    return selectedCardIds.size > 0 || selectedDiceIds.size > 0 || selectedDeckIds.size > 0 || selectedMonsGameIds.size > 0;
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

  function releaseSelectedDecks() {
    const selectedIds = Array.from(selectedDeckIds);
    selectedDeckIds.clear();
    let shouldRender = selectedIds.length > 0;
    for (const deckId of selectedIds) {
      const deckState = getDeckStateById(deckId);
      if (deckState?.holderClientId === clientId) {
        patchLocalDeck({ holderClientId: null }, deckId);
        queueDeckPatch({ holderClientId: null }, deckId);
        releaseDeckLock(deckId).catch((error) => {
          console.error(error);
        });
      } else {
        shouldRender = true;
      }
    }
    if (shouldRender) {
      renderAllCards();
    }
  }

  function releaseSelectedDice() {
    const selectedIds = Array.from(selectedDiceIds);
    selectedDiceIds.clear();
    for (const dieId of selectedIds) {
      const dieState = diceById.get(dieId);
      if (dieState?.holderClientId === clientId) {
        patchLocalDie(dieId, { holderClientId: null });
        queueDiePatch(dieId, { holderClientId: null });
        releaseDieLock(dieId).catch((error) => {
          console.error(error);
        });
      } else {
        renderDieElement(dieId);
      }
    }
  }

  function releaseSelectedMonsBoards() {
    const selectedIds = Array.from(selectedMonsGameIds);
    selectedMonsGameIds.clear();
    let shouldRender = selectedIds.length > 0;
    for (const gameId of selectedIds) {
      const gameState = getMonsGameStateById(gameId);
      if (gameState?.holderClientId === clientId) {
        patchLocalMonsGame({ holderClientId: null }, gameId);
        queueMonsPatch({ holderClientId: null }, gameId);
        releaseMonsBoardLock(gameId).catch((error) => {
          console.error(error);
        });
      } else {
        shouldRender = true;
      }
    }
    if (shouldRender) {
      renderMonsBoard();
    }
  }

  function releaseAllSelectedObjects() {
    releaseSelectedCards();
    releaseSelectedDice();
    releaseSelectedDecks();
    releaseSelectedMonsBoards();
  }

  async function applySelectionFromBox(startWorld, endWorld) {
    const minX = Math.min(startWorld.x, endWorld.x);
    const maxX = Math.max(startWorld.x, endWorld.x);
    const minY = Math.min(startWorld.y, endWorld.y);
    const maxY = Math.max(startWorld.y, endWorld.y);

    const cardCandidates = [];
    const diceCandidates = [];
    const deckCandidates = [];
    const monsCandidates = [];
    const overlapsSelectionRect = (centerX, centerY, width, height) => {
      const halfWidth = Math.max(0, Number(width) || 0) / 2;
      const halfHeight = Math.max(0, Number(height) || 0) / 2;
      const left = centerX - halfWidth;
      const right = centerX + halfWidth;
      const top = centerY - halfHeight;
      const bottom = centerY + halfHeight;
      return !(right < minX || left > maxX || bottom < minY || top > maxY);
    };

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
        cardCandidates.push(cardId);
      }
    }

    for (const [dieId, dieState] of diceById.entries()) {
      if (!dieState) {
        continue;
      }
      if (dieState.holderClientId && dieState.holderClientId !== clientId) {
        continue;
      }
      const dieDimensions = getDieWorldDimensions(dieState);
      if (overlapsSelectionRect(dieState.x, dieState.y, dieDimensions.width, dieDimensions.height)) {
        diceCandidates.push(dieId);
      }
    }

    for (const deckId of getDeckIdsInRoom()) {
      const normalizedDeckId = normalizeDeckId(deckId);
      const deckState = getDeckStateById(normalizedDeckId);
      if (!deckState) {
        continue;
      }
      if (deckState.holderClientId && deckState.holderClientId !== clientId) {
        continue;
      }
      const hasCards =
        getDeckCardIds(normalizedDeckId).length > 0 ||
        getDiscardCardIds(normalizedDeckId).length > 0 ||
        getAuctionCardIds(normalizedDeckId).length > 0;
      if (!hasCards) {
        continue;
      }
      if (overlapsSelectionRect(deckState.x, deckState.y, CARD_WIDTH, CARD_HEIGHT)) {
        deckCandidates.push(normalizedDeckId);
      }
    }

    for (const [rawGameId, gameState] of monsGameStatesById.entries()) {
      const normalizedGameId = normalizeMonsGameId(rawGameId);
      if (!gameState || gameState.enabled === false) {
        continue;
      }
      if (gameState.holderClientId && gameState.holderClientId !== clientId) {
        continue;
      }
      if (overlapsSelectionRect(gameState.x, gameState.y, gameState.width, gameState.height)) {
        monsCandidates.push(normalizedGameId);
      }
    }

    releaseAllSelectedObjects();
    if (cardCandidates.length === 0 && diceCandidates.length === 0 && deckCandidates.length === 0 && monsCandidates.length === 0) {
      return;
    }

    let nextTopZ = getTopObjectZ();
    for (const cardId of cardCandidates) {
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

    for (const deckId of deckCandidates) {
      const acquired = await acquireDeckLock(deckId);
      if (!acquired) {
        continue;
      }
      selectedDeckIds.add(deckId);
      patchLocalDeck({ holderClientId: clientId }, deckId);
      queueDeckPatch({ holderClientId: clientId }, deckId);
    }

    for (const dieId of diceCandidates) {
      const acquired = await acquireDieLock(dieId);
      if (!acquired) {
        continue;
      }
      nextTopZ += 1;
      selectedDiceIds.add(dieId);
      const patch = {
        z: nextTopZ,
        holderClientId: clientId
      };
      patchLocalDie(dieId, patch);
      queueDiePatch(dieId, patch);
    }

    for (const gameId of monsCandidates) {
      const acquired = await acquireMonsBoardLock(gameId);
      if (!acquired) {
        continue;
      }
      selectedMonsGameIds.add(gameId);
      patchLocalMonsGame({ holderClientId: clientId }, gameId);
      queueMonsPatch({ holderClientId: clientId }, gameId);
    }
  }

  function buildGroupDragBase() {
    const basePositions = new Map();
    const baseDiePositions = new Map();
    const baseDeckPositions = new Map();
    const baseMonsPositions = new Map();

    for (const cardId of getMovableSelectedIds()) {
      const cardState = cards.get(cardId);
      if (!cardState) {
        continue;
      }
      const cardSize = getCardTableDimensions(cardState);
      basePositions.set(cardId, { x: cardState.x, y: cardState.y, width: cardSize.width, height: cardSize.height });
    }
    for (const deckId of getMovableSelectedDeckIds()) {
      const deckState = getDeckStateById(deckId);
      if (!deckState) {
        continue;
      }
      baseDeckPositions.set(deckId, { x: deckState.x, y: deckState.y });
    }
    for (const dieId of getMovableSelectedDieIds()) {
      const dieState = diceById.get(dieId);
      if (!dieState) {
        continue;
      }
      const dimensions = getDieWorldDimensions(dieState);
      baseDiePositions.set(dieId, {
        x: dieState.x,
        y: dieState.y,
        width: dimensions.width,
        height: dimensions.height,
        type: normalizeDieType(dieState.type)
      });
    }
    for (const gameId of getMovableSelectedMonsGameIds()) {
      const gameState = getMonsGameStateById(gameId);
      if (!gameState || gameState.enabled === false) {
        continue;
      }
      baseMonsPositions.set(gameId, { x: gameState.x, y: gameState.y });
    }

    return {
      basePositions,
      baseDiePositions,
      baseDeckPositions,
      baseMonsPositions
    };
  }

  function bringSelectedDeckStacksToFront(baseDeckPositions) {
    if (!(baseDeckPositions instanceof Map)) {
      return;
    }
    for (const deckId of baseDeckPositions.keys()) {
      bringDeckToFront(deckId).catch((error) => {
        console.error(error);
      });
    }
  }

  function beginGroupDrag(event, cardId) {
    if (!selectedCardIds.has(cardId) || cardDragState || cardResizeState || labelResizeState || groupDragState) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }
    const groupBase = buildGroupDragBase();
    const anchorCard = cards.get(cardId);
    const anchorBase = groupBase.basePositions.get(cardId);
    if (!anchorCard || !anchorBase) {
      releaseAllSelectedObjects();
      return false;
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
      anchorType: 'card',
      anchorId: cardId,
      anchorCardId: cardId,
      anchorWidth: anchorBase.width,
      anchorHeight: anchorBase.height,
      ...groupBase,
      moved: false
    };
    syncHandHoverDragLock();
    bringSelectedDeckStacksToFront(groupBase.baseDeckPositions);
    return true;
  }

  function beginGroupDragFromDeck(event, deckId) {
    const normalizedDeckId = normalizeDeckId(deckId);
    if (!selectedDeckIds.has(normalizedDeckId) || cardDragState || cardResizeState || labelResizeState || groupDragState || handReorderState) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }
    const groupBase = buildGroupDragBase();
    const anchorDeckState = getDeckStateById(normalizedDeckId);
    const anchorBase = groupBase.baseDeckPositions.get(normalizedDeckId);
    if (!anchorDeckState || !anchorBase) {
      releaseAllSelectedObjects();
      return false;
    }

    groupDragState = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      anchorOffsetX: worldPoint.x - anchorDeckState.x,
      anchorOffsetY: worldPoint.y - anchorDeckState.y,
      anchorType: 'deck',
      anchorId: normalizedDeckId,
      anchorCardId: '',
      anchorWidth: CARD_WIDTH,
      anchorHeight: CARD_HEIGHT,
      ...groupBase,
      moved: false
    };
    syncHandHoverDragLock();
    bringSelectedDeckStacksToFront(groupBase.baseDeckPositions);
    return true;
  }

  function beginGroupDragFromMons(event, gameId) {
    const normalizedGameId = normalizeMonsGameId(gameId);
    if (!selectedMonsGameIds.has(normalizedGameId) || cardDragState || cardResizeState || labelResizeState || groupDragState || handReorderState) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }
    const groupBase = buildGroupDragBase();
    const anchorGameState = getMonsGameStateById(normalizedGameId);
    const anchorBase = groupBase.baseMonsPositions.get(normalizedGameId);
    if (!anchorGameState || !anchorBase) {
      releaseAllSelectedObjects();
      return false;
    }

    groupDragState = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      anchorOffsetX: worldPoint.x - anchorGameState.x,
      anchorOffsetY: worldPoint.y - anchorGameState.y,
      anchorType: 'mons',
      anchorId: normalizedGameId,
      anchorCardId: '',
      anchorWidth: anchorGameState.width,
      anchorHeight: anchorGameState.height,
      ...groupBase,
      moved: false
    };
    syncHandHoverDragLock();
    bringSelectedDeckStacksToFront(groupBase.baseDeckPositions);
    return true;
  }

  function beginGroupDragFromDie(event, dieId) {
    if (!selectedDiceIds.has(dieId) || cardDragState || cardResizeState || labelResizeState || dieDragState || groupDragState || handReorderState) {
      return false;
    }
    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return false;
    }
    const groupBase = buildGroupDragBase();
    const anchorDieState = diceById.get(dieId);
    const anchorBase = groupBase.baseDiePositions.get(dieId);
    if (!anchorDieState || !anchorBase) {
      releaseAllSelectedObjects();
      return false;
    }
    groupDragState = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      anchorOffsetX: worldPoint.x - anchorDieState.x,
      anchorOffsetY: worldPoint.y - anchorDieState.y,
      anchorType: 'die',
      anchorId: dieId,
      anchorCardId: '',
      anchorWidth: anchorBase.width,
      anchorHeight: anchorBase.height,
      ...groupBase,
      moved: false
    };
    syncHandHoverDragLock();
    bringSelectedDeckStacksToFront(groupBase.baseDeckPositions);
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

    let anchorBase = null;
    if (groupDragState.anchorType === 'deck') {
      anchorBase = groupDragState.baseDeckPositions.get(groupDragState.anchorId);
    } else if (groupDragState.anchorType === 'mons') {
      anchorBase = groupDragState.baseMonsPositions.get(groupDragState.anchorId);
    } else if (groupDragState.anchorType === 'die') {
      anchorBase = groupDragState.baseDiePositions.get(groupDragState.anchorId);
    } else {
      anchorBase = groupDragState.basePositions.get(groupDragState.anchorId);
    }
    if (!anchorBase) {
      return true;
    }

    const anchorWidth = Math.max(1, Number(groupDragState.anchorWidth) || CARD_WIDTH);
    const anchorHeight = Math.max(1, Number(groupDragState.anchorHeight) || CARD_HEIGHT);
    let anchorMinX = anchorWidth / 2;
    let anchorMaxX = WORLD_WIDTH - anchorWidth / 2;
    let anchorMinY = anchorHeight / 2;
    let anchorMaxY = WORLD_HEIGHT - anchorHeight / 2;
    if (groupDragState.anchorType === 'die') {
      const anchorDieBase = groupDragState.baseDiePositions.get(groupDragState.anchorId);
      const anchorDieBounds = getDieCenterBounds(anchorDieBase?.type || 'd6', anchorWidth, anchorHeight);
      anchorMinX = anchorDieBounds.minX;
      anchorMaxX = anchorDieBounds.maxX;
      anchorMinY = anchorDieBounds.minY;
      anchorMaxY = anchorDieBounds.maxY;
    }
    const anchorNextX = clamp(worldPoint.x - groupDragState.anchorOffsetX, anchorMinX, anchorMaxX);
    const anchorNextY = clamp(worldPoint.y - groupDragState.anchorOffsetY, anchorMinY, anchorMaxY);
    const movedDistance = Math.hypot(event.clientX - groupDragState.startClientX, event.clientY - groupDragState.startClientY);
    const movedThreshold =
      groupDragState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    if (movedDistance > movedThreshold) {
      groupDragState.moved = true;
    }
    const deltaX = anchorNextX - anchorBase.x;
    const deltaY = anchorNextY - anchorBase.y;

    const selectedCardIdsInDrag = Array.from(groupDragState.basePositions.keys());
    const hasMovableCards = selectedCardIdsInDrag.length > 0;
    const hasDropEligibleCards = hasMovableCards && groupDragState.anchorType === 'card';
    const overHandDropRegion = hasDropEligibleCards && isClientInHandDropRegion(event.clientY);
    const anchorAuctionDeckId = hasDropEligibleCards ? getDeckIdAtPosition(anchorNextX, anchorNextY, 'auction') : '';
    const canPlaceGroupOnAuction =
      hasDropEligibleCards && canPlaceCardsOnAuction(selectedCardIdsInDrag, anchorAuctionDeckId);
    const anchorHalfWidth = Math.max(1, Number(anchorBase.width) || CARD_WIDTH) / 2;
    const anchorHalfHeight = Math.max(1, Number(anchorBase.height) || CARD_HEIGHT) / 2;
    const anchorHoverX = clamp(anchorBase.x + deltaX, anchorHalfWidth, WORLD_WIDTH - anchorHalfWidth);
    const anchorHoverY = clamp(anchorBase.y + deltaY, anchorHalfHeight, WORLD_HEIGHT - anchorHalfHeight);
    const anchorCardState = hasDropEligibleCards && groupDragState.anchorCardId ? cards.get(groupDragState.anchorCardId) : null;
    const canAnchorUseDeckZones = canCardUseDeckZones(anchorCardState);
    const deckTargetDeckId = hasDropEligibleCards && canAnchorUseDeckZones ? getDeckIdAtPosition(anchorHoverX, anchorHoverY, 'deck') : '';
    const discardTargetDeckId = hasDropEligibleCards && canAnchorUseDeckZones ? getDeckIdAtPosition(anchorHoverX, anchorHoverY, 'discard') : '';
    const auctionTargetDeckId = hasDropEligibleCards && canAnchorUseDeckZones ? getDeckIdAtPosition(anchorHoverX, anchorHoverY, 'auction') : '';
    const overDeck = Boolean(deckTargetDeckId);
    const overDiscard = Boolean(discardTargetDeckId);
    let overAuction = false;

    for (const [selectedCardId, base] of groupDragState.basePositions.entries()) {
      const halfWidth = Math.max(1, Number(base.width) || CARD_WIDTH) / 2;
      const halfHeight = Math.max(1, Number(base.height) || CARD_HEIGHT) / 2;
      const nextX = clamp(base.x + deltaX, halfWidth, WORLD_WIDTH - halfWidth);
      const nextY = clamp(base.y + deltaY, halfHeight, WORLD_HEIGHT - halfHeight);
      if (canPlaceGroupOnAuction && auctionTargetDeckId && isPositionOverAuction(nextX, nextY, auctionTargetDeckId)) {
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
      patchLocalCard(selectedCardId, patch);
      queueCardPatch(selectedCardId, patch);
    }

    for (const [selectedDeckId, base] of groupDragState.baseDeckPositions.entries()) {
      const nextX = clamp(base.x + deltaX, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2);
      const nextY = clamp(base.y + deltaY, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2);
      const patch = {
        x: nextX,
        y: nextY,
        holderClientId: clientId
      };
      patchLocalDeck(patch, selectedDeckId);
      queueDeckPatch(patch, selectedDeckId);
    }

    for (const [selectedDieId, base] of groupDragState.baseDiePositions.entries()) {
      const dieWidth = Math.max(1, Number(base?.width) || DIE_SIZE_D6);
      const dieHeight = Math.max(1, Number(base?.height) || DIE_SIZE_D6);
      const dieBounds = getDieCenterBounds(base?.type || 'd6', dieWidth, dieHeight);
      const nextX = clamp(base.x + deltaX, dieBounds.minX, dieBounds.maxX);
      const nextY = clamp(base.y + deltaY, dieBounds.minY, dieBounds.maxY);
      const patch = {
        x: nextX,
        y: nextY,
        holderClientId: clientId
      };
      patchLocalDie(selectedDieId, patch);
      queueDiePatch(selectedDieId, patch);
    }

    for (const [selectedGameId, base] of groupDragState.baseMonsPositions.entries()) {
      const targetGameState = getMonsGameStateById(selectedGameId);
      const halfWidth = Math.max(1, Number(targetGameState?.width) || MONS_BOARD_WORLD_WIDTH) / 2;
      const halfHeight = Math.max(1, Number(targetGameState?.height) || MONS_BOARD_WORLD_HEIGHT) / 2;
      const nextX = clamp(base.x + deltaX, halfWidth, WORLD_WIDTH - halfWidth);
      const nextY = clamp(base.y + deltaY, halfHeight, WORLD_HEIGHT - halfHeight);
      const patch = {
        x: nextX,
        y: nextY,
        holderClientId: clientId
      };
      patchLocalMonsGame(patch, selectedGameId);
      queueMonsPatch(patch, selectedGameId);
    }

    if (hasDropEligibleCards) {
      setHandDropGlow(overHandDropRegion);
      setHandDropPreview(null);
      setDiscardDropIndicator(overDiscard && !overHandDropRegion && !overAuction, discardTargetDeckId);
      setAuctionDropIndicator(overAuction && !overHandDropRegion, auctionTargetDeckId);
      setDeckDropIndicator(overDeck && !overHandDropRegion && !overDiscard && !overAuction, deckTargetDeckId);
    } else {
      setHandDropGlow(false);
      setHandDropPreview(null);
      setDeckDropIndicator(false);
      setDiscardDropIndicator(false);
      setAuctionDropIndicator(false);
    }
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
      if (finishedGroupDrag.anchorType === 'card' && finishedGroupDrag.anchorCardId) {
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
      } else if (finishedGroupDrag.anchorType === 'die' && finishedGroupDrag.anchorId) {
        if (finishedGroupDrag.pointerType === 'touch' || finishedGroupDrag.pointerType === 'pen') {
          rememberDieTouchTapCandidate(finishedGroupDrag.anchorId, event);
        } else if (finishedGroupDrag.pointerType === 'mouse' && event.button === 0) {
          rememberDieMouseClickCandidate(finishedGroupDrag.anchorId, event);
        }
      }
    }

    if (selectedIds.length === 0) {
      return true;
    }

    if (finishedGroupDrag.anchorType === 'card' && isClientInHandDropRegion(event.clientY)) {
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

    if (finishedGroupDrag.anchorType !== 'card') {
      schedulePublishFromClient(event.clientX, event.clientY);
      return true;
    }

    const deckEligibleSelectedIds = selectedIds.filter((cardId) => canCardUseDeckZones(cards.get(cardId)));
    const nonDeckSelectedIds = selectedIds.filter((cardId) => !deckEligibleSelectedIds.includes(cardId));
    const releaseNonDeckSelectedCards = () => {
      for (const cardId of nonDeckSelectedIds) {
        const currentCard = cards.get(cardId);
        if (!currentCard) {
          continue;
        }
        const patch = {
          holderClientId: null,
          inDeck: false,
          inDiscard: false,
          inAuction: false,
          handOwnerClientId: null,
          handOwnerPlayerToken: null
        };
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
    };

    const anchorCardId = finishedGroupDrag.anchorCardId;
    const anchorIsSelected = anchorCardId && selectedIds.includes(anchorCardId);
    const anchorCardState = anchorIsSelected ? cards.get(anchorCardId) : null;
    const canAnchorUseDeckZones = canCardUseDeckZones(anchorCardState);
    const deckTargetDeckId = anchorCardState && canAnchorUseDeckZones ? getDeckIdAtPosition(anchorCardState.x, anchorCardState.y, 'deck') : '';
    const discardTargetDeckId = anchorCardState && canAnchorUseDeckZones ? getDeckIdAtPosition(anchorCardState.x, anchorCardState.y, 'discard') : '';
    const auctionTargetDeckId = anchorCardState && canAnchorUseDeckZones ? getDeckIdAtPosition(anchorCardState.x, anchorCardState.y, 'auction') : '';
    const shouldStackOnDeck =
      deckEligibleSelectedIds.length > 0 &&
      Boolean(deckTargetDeckId) &&
      Boolean(anchorCardState) &&
      isPositionOverDeck(anchorCardState.x, anchorCardState.y, deckTargetDeckId);
    const shouldStackOnDiscard =
      deckEligibleSelectedIds.length > 0 &&
      Boolean(discardTargetDeckId) &&
      Boolean(anchorCardState) &&
      isPositionOverDiscard(anchorCardState.x, anchorCardState.y, discardTargetDeckId);
    const shouldStackOnAuction =
      deckEligibleSelectedIds.length > 0 &&
      Boolean(auctionTargetDeckId) &&
      canPlaceCardsOnAuction(deckEligibleSelectedIds, auctionTargetDeckId) &&
      deckEligibleSelectedIds.some((cardId) => {
        const cardState = cards.get(cardId);
        return Boolean(cardState) && isPositionOverAuction(cardState.x, cardState.y, auctionTargetDeckId);
      });

    if (shouldStackOnAuction && auctionTargetDeckId) {
      selectedCardIds.clear();
      let nextAuctionZ = getAuctionTopZ(auctionTargetDeckId) + 1;
      for (const cardId of deckEligibleSelectedIds) {
        const patch = buildAuctionPlacementPatch(nextAuctionZ, auctionTargetDeckId);
        nextAuctionZ += 1;
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
      releaseNonDeckSelectedCards();
      schedulePublishFromClient(event.clientX, event.clientY);
      return true;
    }

    if (shouldStackOnDiscard && discardTargetDeckId) {
      selectedCardIds.clear();
      let nextDiscardZ = getDiscardTopZ(discardTargetDeckId) + 1;
      for (const cardId of deckEligibleSelectedIds) {
        const patch = buildDiscardPlacementPatch(nextDiscardZ, discardTargetDeckId);
        nextDiscardZ += 1;
        patchLocalCard(cardId, patch);
        queueCardPatch(cardId, patch);
        releaseCardLock(cardId).catch((error) => {
          console.error(error);
        });
      }
      releaseNonDeckSelectedCards();
      schedulePublishFromClient(event.clientX, event.clientY);
      return true;
    }

    if (shouldStackOnDeck && deckTargetDeckId) {
      const targetDeckState = getDeckStateById(deckTargetDeckId);
      if (!targetDeckState) {
        schedulePublishFromClient(event.clientX, event.clientY);
        return true;
      }
      selectedCardIds.clear();
      let nextDeckZ = getDeckTopZ(deckTargetDeckId) + 1;
      for (const cardId of deckEligibleSelectedIds) {
        const patch = {
          x: targetDeckState.x,
          y: targetDeckState.y,
          z: nextDeckZ,
          deckId: deckTargetDeckId,
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
      releaseNonDeckSelectedCards();
    }

    schedulePublishFromClient(event.clientX, event.clientY);
    return true;
  }

  async function acquireDeckLock(deckId = activeDeckId) {
    const normalizedDeckId = normalizeDeckId(deckId);
    const holderRef = ref(db, `${roomPath}/decks/${normalizedDeckId}/holderClientId`);
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

  async function releaseDeckLock(deckId = activeDeckId) {
    const normalizedDeckId = normalizeDeckId(deckId);
    const holderRef = ref(db, `${roomPath}/decks/${normalizedDeckId}/holderClientId`);
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

  async function acquireMonsBoardLock(gameId = activeMonsGameId) {
    const normalizedGameId = normalizeMonsGameId(gameId);
    const holderRef = ref(db, `${roomPath}/games/${normalizedGameId}/holderClientId`);
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

  async function releaseMonsBoardLock(gameId = activeMonsGameId) {
    const normalizedGameId = normalizeMonsGameId(gameId);
    const holderRef = ref(db, `${roomPath}/games/${normalizedGameId}/holderClientId`);
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

  async function handleMonsMovePointerDown(event, gameId = activeMonsGameId) {
    if (drawModeEnabled) {
      return;
    }
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
      await deleteMonsGameInRemoveMode(gameId);
      schedulePublishFromClient(event.clientX, event.clientY);
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

    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    if (hasAnyGroupSelection()) {
      if (selectedMonsGameIds.has(targetMonsGameId) && beginGroupDragFromMons(event, targetMonsGameId)) {
        safeSetPointerCapture(event.currentTarget, event.pointerId);
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      if (!selectedMonsGameIds.has(targetMonsGameId)) {
        releaseAllSelectedObjects();
      }
    }
    if (normalizeMonsGameId(activeMonsGameId) !== targetMonsGameId) {
      setActiveMonsGameId(targetMonsGameId);
    }

    if (monsDragState || cardResizeState || groupDragState || handReorderState) {
      return;
    }
    const targetMonsGameState = getMonsGameStateById(targetMonsGameId);
    if (!targetMonsGameState) {
      return;
    }

    if (targetMonsGameState.holderClientId && targetMonsGameState.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireMonsBoardLock(targetMonsGameId);
    if (!acquired) {
      return;
    }
    if (wasTouchPointerReleased(event.pointerType, event.pointerId)) {
      await releaseMonsBoardLock(targetMonsGameId);
      return;
    }

    monsDragState = {
      gameId: targetMonsGameId,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: targetMonsGameState.x,
      startY: targetMonsGameState.y,
      width: targetMonsGameState.width,
      height: targetMonsGameState.height
    };

    patchLocalMonsGame({ holderClientId: clientId }, targetMonsGameId);
    queueMonsPatch({ holderClientId: clientId }, targetMonsGameId);
    setMonsBoardDragFloating(true);

    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function handleMonsDragMove(event) {
    if (!monsDragState || event.pointerId !== monsDragState.pointerId) {
      return;
    }
    if ((event.buttons & 1) === 0) {
      handleMonsDragEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return;
    }

    const targetMonsGameId = normalizeMonsGameId(monsDragState.gameId || activeMonsGameId);
    const deltaX = (event.clientX - monsDragState.startClientX) / camera.scale;
    const deltaY = (event.clientY - monsDragState.startClientY) / camera.scale;
    const nextX = clamp(
      monsDragState.startX + deltaX,
      monsDragState.width / 2,
      WORLD_WIDTH - monsDragState.width / 2
    );
    const nextY = clamp(
      monsDragState.startY + deltaY,
      monsDragState.height / 2,
      WORLD_HEIGHT - monsDragState.height / 2
    );

    patchLocalMonsGame({
      x: nextX,
      y: nextY,
      holderClientId: clientId
    }, targetMonsGameId);
    queueMonsPatch({
      x: nextX,
      y: nextY,
      holderClientId: clientId
    }, targetMonsGameId);
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleMonsDragEnd(event) {
    if (!monsDragState || event.pointerId !== monsDragState.pointerId) {
      return;
    }
    if (event.type === 'pointerup' && event.button !== 0 && (event.buttons & 1) !== 0) {
      return;
    }

    const targetMonsGameId = normalizeMonsGameId(monsDragState.gameId || activeMonsGameId);
    monsDragState = null;
    setMonsBoardDragFloating(false);
    patchLocalMonsGame({ holderClientId: null }, targetMonsGameId);
    queueMonsPatch({ holderClientId: null }, targetMonsGameId);
    releaseMonsBoardLock(targetMonsGameId).catch((error) => {
      console.error(error);
    });
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function getMonsPieceAtTileFromPayload(piecesPayload, row, col, excludeId = '') {
    if (!piecesPayload || typeof piecesPayload !== 'object') {
      return null;
    }
    let itemPiece = null;
    for (const piece of Object.values(piecesPayload)) {
      if (!piece || typeof piece !== 'object') {
        continue;
      }
      if (excludeId && piece.id === excludeId) {
        continue;
      }
      if (piece.row === row && piece.col === col) {
        if (isMonsItemPiece(piece)) {
          itemPiece = piece;
          continue;
        }
        return piece;
      }
    }
    return itemPiece;
  }

  function getMonsPieceBaseType(pieceOrType) {
    if (typeof pieceOrType === 'string') {
      return getMonsBaseTypeFromRenderType(pieceOrType);
    }
    return getMonsBaseTypeFromRenderType(pieceOrType?.type);
  }

  function isMonsManaPieceType(type) {
    return type === 'mana' || type === 'manaB' || type === 'supermana';
  }

  function getMonsHeldItemType(piece) {
    if (!piece || typeof piece !== 'object' || !isMonsMonPiece(piece)) {
      return '';
    }
    return piece.heldItemType === 'bomb' ? 'bomb' : '';
  }

  function setMonsHeldItemType(piece, heldItemType = '') {
    if (!piece || typeof piece !== 'object' || !isMonsMonPiece(piece)) {
      return piece;
    }
    return {
      ...piece,
      heldItemType: heldItemType === 'bomb' ? 'bomb' : ''
    };
  }

  function clearMonsHeldItem(piece) {
    return setMonsHeldItemType(piece, '');
  }

  function getMonsDrainerCarriedManaType(piece) {
    if (!piece || typeof piece !== 'object' || getMonsPieceBaseType(piece) !== 'drainer') {
      return '';
    }
    const carriedTypeRaw = typeof piece.carriedManaType === 'string' ? piece.carriedManaType : '';
    return isMonsManaPieceType(carriedTypeRaw) ? carriedTypeRaw : '';
  }

  function getMonsDrainerCarriedManaId(piece) {
    if (!piece || typeof piece !== 'object' || getMonsPieceBaseType(piece) !== 'drainer') {
      return '';
    }
    const carriedIdRaw = typeof piece.carriedManaId === 'string' ? piece.carriedManaId.trim() : '';
    const carriedType = getMonsDrainerCarriedManaType(piece);
    if (!carriedType) {
      return '';
    }
    if (carriedIdRaw) {
      return carriedIdRaw;
    }
    return carriedType === 'supermana' ? 'super-mana' : `${piece.id}-${carriedType}`;
  }

  function setMonsDrainerCarry(piece, manaType, manaId = '') {
    if (!piece || typeof piece !== 'object' || getMonsPieceBaseType(piece) !== 'drainer') {
      return piece;
    }
    const nextManaType = isMonsManaPieceType(manaType) ? manaType : '';
    if (!nextManaType) {
      return {
        ...piece,
        carriedManaType: '',
        carriedManaId: ''
      };
    }
    const normalizedManaId =
      typeof manaId === 'string' && manaId.trim()
        ? manaId.trim()
        : nextManaType === 'supermana'
          ? 'super-mana'
          : `${piece.id}-${nextManaType}`;
    return {
      ...piece,
      carriedManaType: nextManaType,
      carriedManaId: normalizedManaId
    };
  }

  function clearMonsDrainerCarry(piece) {
    return setMonsDrainerCarry(piece, '', '');
  }

  function canMonsDrainerPickupManaType(drainerPiece, manaType) {
    if (!drainerPiece || getMonsPieceBaseType(drainerPiece) !== 'drainer') {
      return false;
    }
    return manaType === 'mana' || manaType === 'manaB' || manaType === 'supermana';
  }

  function canMonsDrainerPickupManaPiece(drainerPiece, targetPiece) {
    if (!drainerPiece || !targetPiece || getMonsPieceBaseType(drainerPiece) !== 'drainer') {
      return false;
    }
    return canMonsDrainerPickupManaType(drainerPiece, targetPiece.type);
  }

  function getMonsManaSideForType(manaType) {
    if (manaType === 'manaB') {
      return 'black';
    }
    if (manaType === 'mana') {
      return 'white';
    }
    return 'neutral';
  }

  function getMonsDrainerCarryScoreGain(drainerPiece, manaType) {
    if (!drainerPiece || getMonsPieceBaseType(drainerPiece) !== 'drainer') {
      return 0;
    }
    if (manaType === 'supermana') {
      return 2;
    }
    if (manaType !== 'mana' && manaType !== 'manaB') {
      return 0;
    }
    const side = drainerPiece.side === 'black' ? 'black' : 'white';
    if ((side === 'white' && manaType === 'mana') || (side === 'black' && manaType === 'manaB')) {
      return 1;
    }
    return 2;
  }

  function getAvailableMonsPieceId(piecesPayload, preferredId, fallbackPrefix) {
    const preferred = typeof preferredId === 'string' && preferredId ? preferredId : '';
    if (preferred && !piecesPayload[preferred]) {
      return preferred;
    }
    let index = 1;
    let nextId = `${fallbackPrefix}-${index}`;
    while (piecesPayload[nextId]) {
      index += 1;
      nextId = `${fallbackPrefix}-${index}`;
    }
    return nextId;
  }

  function createMonsManaPieceFromCarry(piecesPayload, manaType, manaId, row, col) {
    if (!piecesPayload || typeof piecesPayload !== 'object') {
      return null;
    }
    if (manaType !== 'mana' && manaType !== 'manaB' && manaType !== 'supermana') {
      return null;
    }
    const rawRow = Number(row);
    const rawCol = Number(col);
    const nextRow = Number.isFinite(rawRow) ? clamp(Math.round(rawRow), 0, MONS_BOARD_SIZE - 1) : 0;
    const nextCol = Number.isFinite(rawCol) ? clamp(Math.round(rawCol), 0, MONS_BOARD_SIZE - 1) : 0;
    const fallbackPrefix = manaType === 'manaB' ? 'mana-b' : manaType === 'mana' ? 'mana-w' : 'super-mana';
    const pieceId = getAvailableMonsPieceId(piecesPayload, manaId, fallbackPrefix);
    return {
      id: pieceId,
      type: manaType,
      side: getMonsManaSideForType(manaType),
      row: nextRow,
      col: nextCol,
      faintedByAttack: false,
      carriedManaType: '',
      carriedManaId: ''
    };
  }

  function restoreMonsSuperManaToCenter(piecesPayload, preferredId = 'super-mana') {
    if (!piecesPayload || typeof piecesPayload !== 'object') {
      return;
    }
    let resolvedId = typeof preferredId === 'string' && preferredId ? preferredId : '';
    for (const [pieceId, piece] of Object.entries(piecesPayload)) {
      if (!piece || typeof piece !== 'object') {
        continue;
      }
      if (piece.type !== 'supermana') {
        continue;
      }
      if (!resolvedId) {
        resolvedId = pieceId;
      }
      delete piecesPayload[pieceId];
    }
    const centerOccupant = getMonsPieceAtTileFromPayload(piecesPayload, MONS_CENTER_TILE.row, MONS_CENTER_TILE.col);
    if (centerOccupant && getMonsPieceBaseType(centerOccupant) === 'drainer') {
      piecesPayload[centerOccupant.id] = setMonsDrainerCarry(centerOccupant, 'supermana', resolvedId || 'super-mana');
      return;
    }
    const superManaId = getAvailableMonsPieceId(piecesPayload, resolvedId || 'super-mana', 'super-mana');
    piecesPayload[superManaId] = {
      id: superManaId,
      type: 'supermana',
      side: 'neutral',
      row: MONS_CENTER_TILE.row,
      col: MONS_CENTER_TILE.col,
      faintedByAttack: false,
      carriedManaType: '',
      carriedManaId: ''
    };
  }

  function dropMonsDrainerCarriedManaOnFaint(piecesPayload, drainerPiece, dropRow, dropCol) {
    if (!piecesPayload || typeof piecesPayload !== 'object' || !drainerPiece || typeof drainerPiece !== 'object') {
      return false;
    }
    if (getMonsPieceBaseType(drainerPiece) !== 'drainer') {
      return false;
    }
    const carriedManaType = getMonsDrainerCarriedManaType(drainerPiece);
    if (!carriedManaType) {
      return false;
    }
    const carriedManaId = getMonsDrainerCarriedManaId(drainerPiece);
    if (carriedManaType === 'supermana') {
      restoreMonsSuperManaToCenter(piecesPayload, carriedManaId || 'super-mana');
      return true;
    }
    const droppedPiece = createMonsManaPieceFromCarry(piecesPayload, carriedManaType, carriedManaId, dropRow, dropCol);
    if (!droppedPiece) {
      return false;
    }
    piecesPayload[droppedPiece.id] = droppedPiece;
    return true;
  }

  function isMonsMonPiece(piece) {
    const baseType = getMonsPieceBaseType(piece);
    return MONS_MON_BASE_TYPES.has(baseType);
  }

  function getMonsSpawnTileForPiece(piece) {
    if (!piece || typeof piece !== 'object') {
      return null;
    }
    const byId = MONS_MON_SPAWN_BY_ID[piece.id];
    if (byId) {
      return byId;
    }
    const baseType = getMonsPieceBaseType(piece);
    if (!MONS_MON_BASE_TYPES.has(baseType)) {
      return null;
    }
    return MONS_MON_SPAWN_BY_SIDE_AND_TYPE[`${piece.side}-${baseType}`] || null;
  }

  function isMonsPieceOnOwnSpawn(piece) {
    const spawnTile = getMonsSpawnTileForPiece(piece);
    if (!spawnTile) {
      return false;
    }
    return piece.row === spawnTile.row && piece.col === spawnTile.col;
  }

  function isMonsAbilityUserBlockedOnOwnSpawn(piece) {
    if (!piece || typeof piece !== 'object') {
      return false;
    }
    const baseType = getMonsPieceBaseType(piece);
    if (baseType !== 'spirit' && baseType !== 'demon' && baseType !== 'mystic') {
      return false;
    }
    return isMonsPieceOnOwnSpawn(piece);
  }

  function isMonsEnemyFaintedAbilityTarget(sourcePiece, targetPiece) {
    if (!sourcePiece || !targetPiece) {
      return false;
    }
    if (!isMonsMonPiece(targetPiece)) {
      return false;
    }
    if (targetPiece.faintedByAttack !== true) {
      return false;
    }
    if (sourcePiece.side === 'neutral' || targetPiece.side === 'neutral') {
      return false;
    }
    return sourcePiece.side !== targetPiece.side;
  }

  function isMonsTargetProtectedByAngel(piecesPayload, targetPiece) {
    if (!targetPiece || typeof targetPiece !== 'object') {
      return false;
    }
    if (targetPiece.side !== 'black' && targetPiece.side !== 'white') {
      return false;
    }
    if (!isMonsMonPiece(targetPiece)) {
      return false;
    }
    for (const piece of Object.values(piecesPayload || {})) {
      if (!piece || typeof piece !== 'object') {
        continue;
      }
      if (piece.id === targetPiece.id) {
        continue;
      }
      if (piece.side !== targetPiece.side) {
        continue;
      }
      if (getMonsPieceBaseType(piece) !== 'angel') {
        continue;
      }
      if (piece.faintedByAttack === true) {
        continue;
      }
      if (Math.max(Math.abs(piece.col - targetPiece.col), Math.abs(piece.row - targetPiece.row)) !== 1) {
        continue;
      }
      return true;
    }
    return false;
  }

  function canMonsPieceOccupyTileFromPayload(piece, row, col) {
    if (!piece || typeof piece !== 'object') {
      return false;
    }
    if (row < 0 || row >= MONS_BOARD_SIZE || col < 0 || col >= MONS_BOARD_SIZE) {
      return false;
    }
    const baseType = getMonsPieceBaseType(piece);
    if (row === MONS_CENTER_TILE.row && col === MONS_CENTER_TILE.col) {
      return baseType === 'drainer' || baseType === 'supermana';
    }
    const spawnOwner = MONS_MON_SPAWN_BY_TILE_KEY[`${row}-${col}`];
    if (!spawnOwner) {
      return true;
    }
    if (!MONS_MON_BASE_TYPES.has(baseType)) {
      return false;
    }
    return piece.side === spawnOwner.side && baseType === spawnOwner.type;
  }

  function isMonsTileOccupiedByOtherPiece(piecesPayload, row, col, ignoredIds = []) {
    const ignoredIdSet = new Set(ignoredIds.filter(Boolean));
    for (const piece of Object.values(piecesPayload || {})) {
      if (!piece || typeof piece !== 'object') {
        continue;
      }
      if (isMonsItemPiece(piece)) {
        continue;
      }
      if (ignoredIdSet.has(piece.id)) {
        continue;
      }
      if (piece.row === row && piece.col === col) {
        return true;
      }
    }
    return false;
  }

  function isMonsSpiritAbilityRange(sourcePiece, targetPiece) {
    return (
      Math.max(Math.abs(targetPiece.col - sourcePiece.col), Math.abs(targetPiece.row - sourcePiece.row)) === 2 &&
      (targetPiece.col !== sourcePiece.col || targetPiece.row !== sourcePiece.row)
    );
  }

  function isMonsMysticAbilityRange(sourcePiece, targetPiece) {
    return Math.abs(targetPiece.col - sourcePiece.col) === 2 && Math.abs(targetPiece.row - sourcePiece.row) === 2;
  }

  function getMonsDemonMiddleTile(sourcePiece, targetPiece) {
    const deltaCol = targetPiece.col - sourcePiece.col;
    const deltaRow = targetPiece.row - sourcePiece.row;
    if (Math.abs(deltaCol) === 2 && deltaRow === 0) {
      return {
        row: sourcePiece.row,
        col: sourcePiece.col + deltaCol / 2
      };
    }
    if (Math.abs(deltaRow) === 2 && deltaCol === 0) {
      return {
        row: sourcePiece.row + deltaRow / 2,
        col: sourcePiece.col
      };
    }
    return null;
  }

  function getMonsSpiritPushOptionsFromPayload(piecesPayload, targetPiece) {
    const options = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const nextRow = targetPiece.row + rowOffset;
        const nextCol = targetPiece.col + colOffset;
        if (!canMonsPieceOccupyTileFromPayload(targetPiece, nextRow, nextCol)) {
          continue;
        }
        if (isMonsTileOccupiedByOtherPiece(piecesPayload, nextRow, nextCol, [targetPiece.id])) {
          continue;
        }
        options.push({
          row: nextRow,
          col: nextCol
        });
      }
    }
    return options;
  }

  function getMonsDemonReboundOptionsFromPayload(piecesPayload, attackerPiece, targetPiece) {
    if (!attackerPiece || !targetPiece) {
      return [];
    }
    const targetSpawnTile = getMonsSpawnTileForPiece(targetPiece);
    const options = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const nextRow = targetPiece.row + rowOffset;
        const nextCol = targetPiece.col + colOffset;
        if (targetSpawnTile && nextRow === targetSpawnTile.row && nextCol === targetSpawnTile.col) {
          continue;
        }
        if (!canMonsPieceOccupyTileFromPayload(attackerPiece, nextRow, nextCol)) {
          continue;
        }
        if (isMonsTileOccupiedByOtherPiece(piecesPayload, nextRow, nextCol, [attackerPiece.id, targetPiece.id])) {
          continue;
        }
        options.push({
          row: nextRow,
          col: nextCol
        });
      }
    }
    return options;
  }

  function shouldMonsDemonAttackRequireReboundChoice(attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    const targetSpawnTile = getMonsSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    const attackerCanOccupyTarget = canMonsPieceOccupyTileFromPayload(attacker, target.row, target.col);
    const targetOnOwnSpawn = targetSpawnTile.row === target.row && targetSpawnTile.col === target.col;
    const carriedManaType = getMonsDrainerCarriedManaType(target);
    const targetHoldsMana =
      carriedManaType === 'mana' || carriedManaType === 'manaB' || carriedManaType === 'supermana';
    return targetHoldsMana || (!attackerCanOccupyTarget && targetOnOwnSpawn);
  }

  function isMonsCornerTile(row, col) {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === MONS_BOARD_SIZE - 1) ||
      (row === MONS_BOARD_SIZE - 1 && col === 0) ||
      (row === MONS_BOARD_SIZE - 1 && col === MONS_BOARD_SIZE - 1)
    );
  }

  function getMonsScoreGainForType(type) {
    if (type === 'mana') {
      return 1;
    }
    if (type === 'manaB' || type === 'supermana') {
      return 2;
    }
    return 0;
  }

  function canMonsMysticAttackIgnoringAngelFromPayload(piecesPayload, attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    if (!isMonsMonPiece(attacker) || !isMonsMonPiece(target)) {
      return false;
    }
    if (getMonsPieceBaseType(attacker) !== 'mystic') {
      return false;
    }
    if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
      return false;
    }
    if (isMonsEnemyFaintedAbilityTarget(attacker, target)) {
      return false;
    }
    if (isMonsAbilityUserBlockedOnOwnSpawn(attacker)) {
      return false;
    }
    if (!isMonsMysticAbilityRange(attacker, target)) {
      return false;
    }
    const targetSpawnTile = getMonsSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    return !isMonsTileOccupiedByOtherPiece(piecesPayload, targetSpawnTile.row, targetSpawnTile.col, [target.id]);
  }

  function canMonsDemonAttackIgnoringAngelFromPayload(piecesPayload, attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    if (!isMonsMonPiece(attacker) || !isMonsMonPiece(target)) {
      return false;
    }
    if (getMonsPieceBaseType(attacker) !== 'demon') {
      return false;
    }
    if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
      return false;
    }
    if (isMonsEnemyFaintedAbilityTarget(attacker, target)) {
      return false;
    }
    if (isMonsAbilityUserBlockedOnOwnSpawn(attacker)) {
      return false;
    }
    const middleTile = getMonsDemonMiddleTile(attacker, target);
    if (!middleTile) {
      return false;
    }
    if (middleTile.row === MONS_CENTER_TILE.row && middleTile.col === MONS_CENTER_TILE.col) {
      return false;
    }
    if (isMonsTileOccupiedByOtherPiece(piecesPayload, middleTile.row, middleTile.col, [attacker.id, target.id])) {
      return false;
    }
    const targetSpawnTile = getMonsSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    const targetHoldsBomb = getMonsHeldItemType(target) === 'bomb';
    const attackerSpawnTile = targetHoldsBomb ? getMonsSpawnTileForPiece(attacker) : null;
    if (targetHoldsBomb) {
      if (!attackerSpawnTile) {
        return false;
      }
      if (isMonsTileOccupiedByOtherPiece(piecesPayload, attackerSpawnTile.row, attackerSpawnTile.col, [target.id, attacker.id])) {
        return false;
      }
    }
    const attackerCanOccupyTarget = canMonsPieceOccupyTileFromPayload(attacker, target.row, target.col);
    const targetOnOwnSpawn = targetSpawnTile.row === target.row && targetSpawnTile.col === target.col;
    if (!attackerCanOccupyTarget && !targetOnOwnSpawn) {
      return false;
    }
    if (attackerCanOccupyTarget && targetOnOwnSpawn) {
      return false;
    }
    return !isMonsTileOccupiedByOtherPiece(piecesPayload, targetSpawnTile.row, targetSpawnTile.col, [target.id, attacker.id]);
  }

  function isMonsBombAttackRange(sourcePiece, targetPiece) {
    const deltaCol = Math.abs((targetPiece?.col ?? 0) - (sourcePiece?.col ?? 0));
    const deltaRow = Math.abs((targetPiece?.row ?? 0) - (sourcePiece?.row ?? 0));
    if (deltaCol === 0 && deltaRow === 0) {
      return false;
    }
    return Math.max(deltaCol, deltaRow) <= MONS_BOMB_ATTACK_RANGE;
  }

  function canMonsBombAttackIgnoringAngelFromPayload(piecesPayload, attacker, target) {
    if (!attacker || !target) {
      return false;
    }
    if (!isMonsMonPiece(attacker) || !isMonsMonPiece(target)) {
      return false;
    }
    if (getMonsHeldItemType(attacker) !== 'bomb') {
      return false;
    }
    if (attacker.faintedByAttack === true) {
      return false;
    }
    if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
      return false;
    }
    if (isMonsEnemyFaintedAbilityTarget(attacker, target)) {
      return false;
    }
    if (!isMonsBombAttackRange(attacker, target)) {
      return false;
    }
    const targetSpawnTile = getMonsSpawnTileForPiece(target);
    if (!targetSpawnTile) {
      return false;
    }
    return !isMonsTileOccupiedByOtherPiece(piecesPayload, targetSpawnTile.row, targetSpawnTile.col, [target.id]);
  }

  async function moveSelectedMonsPiece(targetRow, targetCol) {
    const selectedPieceId = monsSelectionPieceId;
    if (!selectedPieceId) {
      return false;
    }
    const targetMonsGameId = normalizeMonsGameId(activeMonsGameId);
    const clampedRow = clamp(Math.round(targetRow), 0, MONS_BOARD_SIZE - 1);
    const clampedCol = clamp(Math.round(targetCol), 0, MONS_BOARD_SIZE - 1);
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const movingPiece = normalized.pieces[selectedPieceId];
        if (!movingPiece) {
          return currentGame;
        }
        if (!canCurrentPlayerControlMonsPieceFromPayload(normalized, movingPiece)) {
          return currentGame;
        }
        const undoEntry = buildMonsUndoSnapshotPayloadFromGame(normalized, localPlayerToken, clientId);
        if (!canMonsPieceOccupyTileFromPayload(movingPiece, clampedRow, clampedCol)) {
          return currentGame;
        }
        const targetPiece = getMonsPieceAtTileFromPayload(normalized.pieces, clampedRow, clampedCol, selectedPieceId);
        const canPickupTargetPiece = Boolean(targetPiece) && canMonsDrainerPickupManaPiece(movingPiece, targetPiece);
        if (targetPiece && !canPickupTargetPiece) {
          return currentGame;
        }

        const nextPieces = { ...normalized.pieces };
        let nextMovingPiece = {
          ...movingPiece,
          row: clampedRow,
          col: clampedCol,
          faintedByAttack: false
        };
        if (canPickupTargetPiece && targetPiece) {
          const carriedManaType = getMonsDrainerCarriedManaType(movingPiece);
          const carriedManaId = getMonsDrainerCarriedManaId(movingPiece);
          if (carriedManaType) {
            const droppedPiece = createMonsManaPieceFromCarry(
              nextPieces,
              carriedManaType,
              carriedManaId,
              movingPiece.row,
              movingPiece.col
            );
            if (droppedPiece) {
              nextPieces[droppedPiece.id] = droppedPiece;
            }
          }
          delete nextPieces[targetPiece.id];
          nextMovingPiece = setMonsDrainerCarry(nextMovingPiece, targetPiece.type, targetPiece.id);
        }
        nextPieces[selectedPieceId] = {
          ...nextMovingPiece
        };

        const nextScores = { ...normalized.scores };
        let scoredPieceType = '';
        if (isMonsCornerTile(clampedRow, clampedCol)) {
          if (getMonsPieceBaseType(nextMovingPiece) === 'drainer') {
            const carriedManaType = getMonsDrainerCarriedManaType(nextMovingPiece);
            const gainedCarryScore = getMonsDrainerCarryScoreGain(nextMovingPiece, carriedManaType);
            if (gainedCarryScore > 0) {
              const scoringSide = nextMovingPiece.side === 'black' ? 'black' : 'white';
              nextScores[scoringSide] = Math.max(0, Number(nextScores[scoringSide]) || 0) + gainedCarryScore;
              scoredPieceType = carriedManaType;
              nextMovingPiece = clearMonsDrainerCarry(nextMovingPiece);
              nextPieces[selectedPieceId] = {
                ...nextMovingPiece
              };
            }
          } else {
            const gainedScore = getMonsScoreGainForType(nextMovingPiece.type);
            if (gainedScore > 0) {
              const scoringSide = nextMovingPiece.side === 'black' ? 'black' : 'white';
              nextScores[scoringSide] = Math.max(0, Number(nextScores[scoringSide]) || 0) + gainedScore;
              scoredPieceType = nextMovingPiece.type;
              delete nextPieces[selectedPieceId];
            }
          }
        }

        return {
          ...normalized,
          pieces: nextPieces,
          scores: nextScores,
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: {
            row: clampedRow,
            col: clampedCol,
            action: 'move',
            side: movingPiece.side === 'black' ? 'black' : 'white',
            pieceId: selectedPieceId,
            type: movingPiece.type,
            fromRow: movingPiece.row,
            fromCol: movingPiece.col,
            toRow: clampedRow,
            toCol: clampedCol,
            scoredPieceType: scoredPieceType || null
          },
          undoHistory: appendMonsUndoHistoryEntry(normalized.undoHistory, undoEntry),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    if (!result.committed || !result.snapshot?.val()) {
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    if (!nextGame.pieces[selectedPieceId]) {
      monsSelectionPieceId = '';
    }
    renderMonsBoard();
    return true;
  }

  async function undoMonsLastAction() {
    const targetMonsGameId = normalizeMonsGameId(activeMonsGameId);
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const undoHistory = normalizeMonsUndoHistoryPayload(normalized.undoHistory);
        if (undoHistory.length === 0) {
          return currentGame;
        }
        const topUndoEntry = undoHistory[undoHistory.length - 1];
        if (!canCurrentPlayerUndoMonsEntry(topUndoEntry)) {
          return currentGame;
        }
        return {
          ...normalized,
          pieces: normalizeMonsPiecesPayload(topUndoEntry.pieces),
          scores: normalizeMonsScoresPayload(topUndoEntry.scores),
          potions: normalizeMonsPotionsPayload(topUndoEntry.potions),
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: null,
          undoHistory: undoHistory.slice(0, -1),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    if (!result.committed || !result.snapshot?.val()) {
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    if (monsSelectionPieceId && !nextGame.pieces[monsSelectionPieceId]) {
      monsSelectionPieceId = '';
    }
    renderMonsBoard();
    return true;
  }

  async function toggleMonsBoardOrientation(gameId = activeMonsGameId) {
    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        return {
          ...normalized,
          flipped: normalized.flipped !== true,
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    if (!result.committed || !result.snapshot?.val()) {
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    monsGameStatesById.set(targetMonsGameId, nextGame);
    if (normalizeMonsGameId(activeMonsGameId) === targetMonsGameId) {
      monsGameState = nextGame;
    }
    renderMonsBoard();
    return true;
  }

  async function executeMonsMysticAttack(attackerId, targetId) {
    const targetMonsGameId = normalizeMonsGameId(activeMonsGameId);
    const previousMoveTick = Number(monsGameState?.moveTick) || 0;
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const attacker = normalized.pieces[attackerId];
        const target = normalized.pieces[targetId];
        if (!attacker || !target) {
          return currentGame;
        }
        if (!canCurrentPlayerControlMonsPieceFromPayload(normalized, attacker)) {
          return currentGame;
        }
        const undoEntry = buildMonsUndoSnapshotPayloadFromGame(normalized, localPlayerToken, clientId);
        if (!isMonsMonPiece(attacker) || !isMonsMonPiece(target)) {
          return currentGame;
        }
        if (getMonsPieceBaseType(attacker) !== 'mystic') {
          return currentGame;
        }
        if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
          return currentGame;
        }
        if (isMonsAbilityUserBlockedOnOwnSpawn(attacker)) {
          return currentGame;
        }
        if (isMonsTargetProtectedByAngel(normalized.pieces, target)) {
          return currentGame;
        }
        if (!canMonsMysticAttackIgnoringAngelFromPayload(normalized.pieces, attacker, target)) {
          return currentGame;
        }
        const targetSpawnTile = getMonsSpawnTileForPiece(target);
        if (!targetSpawnTile) {
          return currentGame;
        }

        const nextPieces = { ...normalized.pieces };
        const targetTileBeforeFaint = {
          row: target.row,
          col: target.col
        };
        const resetTargetPiece = clearMonsHeldItem(clearMonsDrainerCarry(target));
        nextPieces[target.id] = {
          ...resetTargetPiece,
          row: targetSpawnTile.row,
          col: targetSpawnTile.col,
          faintedByAttack: true
        };
        dropMonsDrainerCarriedManaOnFaint(nextPieces, target, targetTileBeforeFaint.row, targetTileBeforeFaint.col);

        return {
          ...normalized,
          pieces: nextPieces,
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: {
            row: target.row,
            col: target.col,
            action: 'mystic',
            side: attacker.side === 'black' ? 'black' : 'white',
            pieceId: attacker.id,
            type: attacker.type,
            targetRow: target.row,
            targetCol: target.col,
            toRow: targetSpawnTile.row,
            toCol: targetSpawnTile.col
          },
          undoHistory: appendMonsUndoHistoryEntry(normalized.undoHistory, undoEntry),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    if (!result.committed || !result.snapshot?.val()) {
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    const applied =
      nextGame.moveTick > previousMoveTick &&
      nextGame.lastMove?.action === 'mystic' &&
      nextGame.lastMove?.pieceId === attackerId;
    if (!applied) {
      return false;
    }
    monsSelectionPieceId = nextGame.pieces[attackerId] ? attackerId : '';
    renderMonsBoard();
    return true;
  }

  async function executeMonsDemonAttack(attackerId, targetId, options = {}) {
    const targetMonsGameId = normalizeMonsGameId(options?.gameId || activeMonsGameId);
    const requestedReboundRow = Number(options?.reboundRow);
    const requestedReboundCol = Number(options?.reboundCol);
    const hasRequestedRebound = Number.isFinite(requestedReboundRow) && Number.isFinite(requestedReboundCol);
    const previousMoveTick = Number(monsGameState?.moveTick) || 0;
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const attacker = normalized.pieces[attackerId];
        const target = normalized.pieces[targetId];
        if (!attacker || !target) {
          return currentGame;
        }
        if (!canCurrentPlayerControlMonsPieceFromPayload(normalized, attacker)) {
          return currentGame;
        }
        const undoEntry = buildMonsUndoSnapshotPayloadFromGame(normalized, localPlayerToken, clientId);
        if (!isMonsMonPiece(attacker) || !isMonsMonPiece(target)) {
          return currentGame;
        }
        if (getMonsPieceBaseType(attacker) !== 'demon') {
          return currentGame;
        }
        if (attacker.side === 'neutral' || target.side === 'neutral' || attacker.side === target.side) {
          return currentGame;
        }
        if (isMonsAbilityUserBlockedOnOwnSpawn(attacker)) {
          return currentGame;
        }
        if (isMonsTargetProtectedByAngel(normalized.pieces, target)) {
          return currentGame;
        }
        if (!canMonsDemonAttackIgnoringAngelFromPayload(normalized.pieces, attacker, target)) {
          return currentGame;
        }
        const targetSpawnTile = getMonsSpawnTileForPiece(target);
        if (!targetSpawnTile) {
          return currentGame;
        }
        const targetHoldsBomb = getMonsHeldItemType(target) === 'bomb';
        const attackerSpawnTile = targetHoldsBomb ? getMonsSpawnTileForPiece(attacker) : null;
        if (targetHoldsBomb) {
          if (!attackerSpawnTile) {
            return currentGame;
          }
          if (
            isMonsTileOccupiedByOtherPiece(
              normalized.pieces,
              attackerSpawnTile.row,
              attackerSpawnTile.col,
              [attacker.id, target.id]
            )
          ) {
            return currentGame;
          }
        }
        const attackerCanOccupyTarget = canMonsPieceOccupyTileFromPayload(attacker, target.row, target.col);
        const targetCarriedManaType = getMonsDrainerCarriedManaType(target);
        const targetDropsManaOnFaint = targetCarriedManaType === 'mana' || targetCarriedManaType === 'manaB';
        const requiresReboundChoice = shouldMonsDemonAttackRequireReboundChoice(attacker, target);
        let reboundChoice = null;
        if (requiresReboundChoice) {
          if (targetHoldsBomb || !hasRequestedRebound) {
            return currentGame;
          }
          const reboundOptions = getMonsDemonReboundOptionsFromPayload(normalized.pieces, attacker, target);
          reboundChoice = reboundOptions.find(
            (option) => option.row === requestedReboundRow && option.col === requestedReboundCol
          );
          if (!reboundChoice) {
            return currentGame;
          }
        }

        const nextPieces = { ...normalized.pieces };
        const targetTileBeforeFaint = {
          row: target.row,
          col: target.col
        };
        const resetTargetPiece = clearMonsHeldItem(clearMonsDrainerCarry(target));
        nextPieces[target.id] = {
          ...resetTargetPiece,
          row: targetSpawnTile.row,
          col: targetSpawnTile.col,
          faintedByAttack: true
        };
        dropMonsDrainerCarriedManaOnFaint(nextPieces, target, targetTileBeforeFaint.row, targetTileBeforeFaint.col);
        if (targetHoldsBomb && attackerSpawnTile) {
          const attackerTileBeforeFaint = {
            row: attacker.row,
            col: attacker.col
          };
          const resetAttackerPiece = clearMonsHeldItem(clearMonsDrainerCarry(attacker));
          nextPieces[attacker.id] = {
            ...resetAttackerPiece,
            row: attackerSpawnTile.row,
            col: attackerSpawnTile.col,
            faintedByAttack: true
          };
          dropMonsDrainerCarriedManaOnFaint(
            nextPieces,
            attacker,
            attackerTileBeforeFaint.row,
            attackerTileBeforeFaint.col
          );
        } else if (reboundChoice) {
          nextPieces[attacker.id] = {
            ...attacker,
            row: reboundChoice.row,
            col: reboundChoice.col,
            faintedByAttack: false
          };
        } else if (attackerCanOccupyTarget && !targetDropsManaOnFaint) {
          nextPieces[attacker.id] = {
            ...attacker,
            row: target.row,
            col: target.col,
            faintedByAttack: false
          };
        }

        return {
          ...normalized,
          pieces: nextPieces,
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: {
            row: target.row,
            col: target.col,
            action: 'demon',
            side: attacker.side === 'black' ? 'black' : 'white',
            pieceId: attacker.id,
            type: attacker.type,
            targetRow: target.row,
            targetCol: target.col,
            toRow: targetSpawnTile.row,
            toCol: targetSpawnTile.col,
            reboundRow: reboundChoice?.row ?? null,
            reboundCol: reboundChoice?.col ?? null
          },
          undoHistory: appendMonsUndoHistoryEntry(normalized.undoHistory, undoEntry),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    if (!result.committed || !result.snapshot?.val()) {
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    const applied =
      nextGame.moveTick > previousMoveTick &&
      nextGame.lastMove?.action === 'demon' &&
      nextGame.lastMove?.pieceId === attackerId;
    if (!applied) {
      return false;
    }
    monsSelectionPieceId = nextGame.pieces[attackerId] ? attackerId : '';
    renderMonsBoard();
    return true;
  }

  function beginMonsItemChoice(piece, itemPiece) {
    if (!piece || !itemPiece) {
      return false;
    }
    if (!isMonsMonPiece(piece) || !isMonsItemPiece(itemPiece)) {
      return false;
    }
    if (!canMonsPieceOccupyTileFromPayload(piece, itemPiece.row, itemPiece.col)) {
      return false;
    }
    if (!canCurrentPlayerControlMonsPieceFromPayload(monsGameState, piece)) {
      return false;
    }
    pendingMonsItemChoice = {
      gameId: normalizeMonsGameId(activeMonsGameId),
      pieceId: piece.id,
      itemId: itemPiece.id,
      targetRow: itemPiece.row,
      targetCol: itemPiece.col,
      bombBlocked: getMonsPieceBaseType(piece) === 'drainer' && Boolean(getMonsDrainerCarriedManaType(piece))
    };
    return openMonsItemChoiceModal(pendingMonsItemChoice);
  }

  async function applyMonsItemChoice(choice) {
    const normalizedChoice = choice === 'bomb' ? 'bomb' : choice === 'potion' ? 'potion' : '';
    if (!normalizedChoice || !pendingMonsItemChoice) {
      closeMonsItemChoiceModal();
      return false;
    }
    const pendingChoice = { ...pendingMonsItemChoice };
    const targetMonsGameId = normalizeMonsGameId(pendingChoice.gameId || activeMonsGameId);
    const previousMoveTick = Number(getMonsGameStateById(targetMonsGameId)?.moveTick) || 0;
    closeMonsItemChoiceModal();
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const movingPiece = normalized.pieces[pendingChoice.pieceId];
        const itemPiece = normalized.pieces[pendingChoice.itemId];
        if (!movingPiece || !itemPiece) {
          return currentGame;
        }
        if (!canCurrentPlayerControlMonsPieceFromPayload(normalized, movingPiece)) {
          return currentGame;
        }
        if (!isMonsMonPiece(movingPiece) || !isMonsItemPiece(itemPiece)) {
          return currentGame;
        }
        if (!canMonsPieceOccupyTileFromPayload(movingPiece, itemPiece.row, itemPiece.col)) {
          return currentGame;
        }
        if (isMonsTileOccupiedByOtherPiece(normalized.pieces, itemPiece.row, itemPiece.col, [movingPiece.id, itemPiece.id])) {
          return currentGame;
        }
        if (
          normalizedChoice === 'bomb' &&
          getMonsPieceBaseType(movingPiece) === 'drainer' &&
          Boolean(getMonsDrainerCarriedManaType(movingPiece))
        ) {
          return currentGame;
        }
        const undoEntry = buildMonsUndoSnapshotPayloadFromGame(normalized, localPlayerToken, clientId);
        const nextPieces = { ...normalized.pieces };
        const nextPotions = normalizeMonsPotionsPayload(normalized.potions);
        let nextMovingPiece = {
          ...movingPiece,
          row: itemPiece.row,
          col: itemPiece.col,
          faintedByAttack: false
        };
        if (normalizedChoice === 'bomb') {
          nextMovingPiece = setMonsHeldItemType(nextMovingPiece, 'bomb');
        } else if (nextMovingPiece.side === 'black' || nextMovingPiece.side === 'white') {
          nextPotions[nextMovingPiece.side] = Math.max(0, Number(nextPotions[nextMovingPiece.side]) || 0) + 1;
        }
        nextPieces[movingPiece.id] = nextMovingPiece;
        delete nextPieces[itemPiece.id];
        return {
          ...normalized,
          pieces: nextPieces,
          potions: nextPotions,
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: {
            row: itemPiece.row,
            col: itemPiece.col,
            action: 'move',
            side: movingPiece.side === 'black' ? 'black' : 'white',
            pieceId: movingPiece.id,
            type: movingPiece.type,
            fromRow: movingPiece.row,
            fromCol: movingPiece.col,
            toRow: itemPiece.row,
            toCol: itemPiece.col,
            scoredPieceType: null
          },
          undoHistory: appendMonsUndoHistoryEntry(normalized.undoHistory, undoEntry),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    if (!result.committed || !result.snapshot?.val()) {
      renderMonsBoard();
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    const applied =
      nextGame.moveTick > previousMoveTick &&
      nextGame.lastMove?.pieceId === pendingChoice.pieceId &&
      nextGame.lastMove?.toRow === pendingChoice.targetRow &&
      nextGame.lastMove?.toCol === pendingChoice.targetCol;
    if (!applied) {
      renderMonsBoard();
      return false;
    }
    setActiveMonsGameId(targetMonsGameId);
    monsSelectionPieceId = nextGame.pieces[pendingChoice.pieceId] ? pendingChoice.pieceId : '';
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    renderMonsBoard();
    return true;
  }

  async function executeMonsBombAttack(attackerId, targetId) {
    const targetMonsGameId = normalizeMonsGameId(activeMonsGameId);
    const previousMoveTick = Number(monsGameState?.moveTick) || 0;
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const attacker = normalized.pieces[attackerId];
        const target = normalized.pieces[targetId];
        if (!attacker || !target) {
          return currentGame;
        }
        if (!canCurrentPlayerControlMonsPieceFromPayload(normalized, attacker)) {
          return currentGame;
        }
        if (!canMonsBombAttackIgnoringAngelFromPayload(normalized.pieces, attacker, target)) {
          return currentGame;
        }
        const targetSpawnTile = getMonsSpawnTileForPiece(target);
        if (!targetSpawnTile) {
          return currentGame;
        }
        const undoEntry = buildMonsUndoSnapshotPayloadFromGame(normalized, localPlayerToken, clientId);
        const nextPieces = { ...normalized.pieces };
        const targetTileBeforeFaint = {
          row: target.row,
          col: target.col
        };
        const resetTargetPiece = clearMonsHeldItem(clearMonsDrainerCarry(target));
        nextPieces[target.id] = {
          ...resetTargetPiece,
          row: targetSpawnTile.row,
          col: targetSpawnTile.col,
          faintedByAttack: true
        };
        dropMonsDrainerCarriedManaOnFaint(nextPieces, target, targetTileBeforeFaint.row, targetTileBeforeFaint.col);
        nextPieces[attacker.id] = {
          ...setMonsHeldItemType(attacker, ''),
          faintedByAttack: false
        };

        return {
          ...normalized,
          pieces: nextPieces,
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: {
            row: target.row,
            col: target.col,
            action: 'bomb',
            side: attacker.side === 'black' ? 'black' : 'white',
            pieceId: attacker.id,
            type: attacker.type,
            targetRow: target.row,
            targetCol: target.col,
            toRow: targetSpawnTile.row,
            toCol: targetSpawnTile.col
          },
          undoHistory: appendMonsUndoHistoryEntry(normalized.undoHistory, undoEntry),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    if (!result.committed || !result.snapshot?.val()) {
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    const applied =
      nextGame.moveTick > previousMoveTick &&
      nextGame.lastMove?.action === 'bomb' &&
      nextGame.lastMove?.pieceId === attackerId;
    if (!applied) {
      return false;
    }
    monsSelectionPieceId = nextGame.pieces[attackerId] ? attackerId : '';
    renderMonsBoard();
    return true;
  }

  function tryStartMonsSpiritPush(spiritPiece, targetPiece) {
    if (!monsGameState?.pieces) {
      return false;
    }
    if (!spiritPiece || !targetPiece) {
      return false;
    }
    if (spiritPiece.id === targetPiece.id) {
      return false;
    }
    if (getMonsPieceBaseType(spiritPiece) !== 'spirit') {
      return false;
    }
    if (!canCurrentPlayerControlMonsPieceFromPayload(monsGameState, spiritPiece)) {
      return false;
    }
    if (isMonsEnemyFaintedAbilityTarget(spiritPiece, targetPiece)) {
      return false;
    }
    if (isMonsAbilityUserBlockedOnOwnSpawn(spiritPiece)) {
      return false;
    }
    if (!isMonsSpiritAbilityRange(spiritPiece, targetPiece)) {
      return false;
    }
    const options = getMonsSpiritPushOptionsFromPayload(monsGameState.pieces, targetPiece);
    if (options.length === 0) {
      monsPendingSpiritPush = null;
      monsPendingDemonRebound = null;
      return false;
    }
    monsPendingSpiritPush = {
      gameId: normalizeMonsGameId(activeMonsGameId),
      spiritId: spiritPiece.id,
      targetId: targetPiece.id,
      sourceRow: spiritPiece.row,
      sourceCol: spiritPiece.col,
      targetRow: targetPiece.row,
      targetCol: targetPiece.col,
      options
    };
    monsPendingDemonRebound = null;
    return true;
  }

  async function applyMonsSpiritPushOption(targetRow, targetCol) {
    if (!monsPendingSpiritPush) {
      return false;
    }
    const pendingState = { ...monsPendingSpiritPush };
    const targetMonsGameId = normalizeMonsGameId(pendingState.gameId || activeMonsGameId);
    const previousMoveTick = Number(monsGameState?.moveTick) || 0;
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const spiritPiece = normalized.pieces[pendingState.spiritId];
        const pushedPiece = normalized.pieces[pendingState.targetId];
        if (!spiritPiece || !pushedPiece) {
          return currentGame;
        }
        if (!canCurrentPlayerControlMonsPieceFromPayload(normalized, spiritPiece)) {
          return currentGame;
        }
        const undoEntry = buildMonsUndoSnapshotPayloadFromGame(normalized, localPlayerToken, clientId);
        if (getMonsPieceBaseType(spiritPiece) !== 'spirit') {
          return currentGame;
        }
        if (isMonsEnemyFaintedAbilityTarget(spiritPiece, pushedPiece)) {
          return currentGame;
        }
        if (isMonsAbilityUserBlockedOnOwnSpawn(spiritPiece)) {
          return currentGame;
        }
        if (!isMonsSpiritAbilityRange(spiritPiece, pushedPiece)) {
          return currentGame;
        }
        const options = getMonsSpiritPushOptionsFromPayload(normalized.pieces, pushedPiece);
        const chosenOption = options.find((option) => option.row === targetRow && option.col === targetCol);
        if (!chosenOption) {
          return currentGame;
        }

        const nextPieces = { ...normalized.pieces };
        const nextScores = { ...normalized.scores };
        const gainedScore = getMonsScoreGainForType(pushedPiece.type);
        const didScorePushedPiece = gainedScore > 0 && isMonsCornerTile(chosenOption.row, chosenOption.col);
        if (didScorePushedPiece) {
          const scoringSide = spiritPiece.side === 'black' ? 'black' : 'white';
          nextScores[scoringSide] = Math.max(0, Number(nextScores[scoringSide]) || 0) + gainedScore;
          delete nextPieces[pushedPiece.id];
        } else {
          nextPieces[pushedPiece.id] = {
            ...pushedPiece,
            row: chosenOption.row,
            col: chosenOption.col,
            faintedByAttack: false
          };
        }

        return {
          ...normalized,
          pieces: nextPieces,
          scores: nextScores,
          moveTick: (Number(normalized.moveTick) || 0) + 1,
          lastMove: {
            row: pushedPiece.row,
            col: pushedPiece.col,
            action: 'spirit',
            side: spiritPiece.side === 'black' ? 'black' : 'white',
            pieceId: spiritPiece.id,
            type: spiritPiece.type,
            targetRow: pushedPiece.row,
            targetCol: pushedPiece.col,
            fromRow: pushedPiece.row,
            fromCol: pushedPiece.col,
            toRow: chosenOption.row,
            toCol: chosenOption.col,
            scoredPieceType: didScorePushedPiece ? pushedPiece.type : null
          },
          undoHistory: appendMonsUndoHistoryEntry(normalized.undoHistory, undoEntry),
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    if (!result.committed || !result.snapshot?.val()) {
      renderMonsBoard();
      return false;
    }
    const nextGame = normalizeMonsGamePayload(result.snapshot.val());
    const applied =
      nextGame.moveTick > previousMoveTick &&
      nextGame.lastMove?.action === 'spirit' &&
      nextGame.lastMove?.pieceId === pendingState.spiritId;
    if (!applied) {
      renderMonsBoard();
      return false;
    }
    monsSelectionPieceId = nextGame.pieces[pendingState.spiritId] ? pendingState.spiritId : '';
    renderMonsBoard();
    return true;
  }

  function tryStartMonsDemonRebound(demonPiece, targetPiece) {
    if (!monsGameState?.pieces) {
      return false;
    }
    if (!demonPiece || !targetPiece) {
      return false;
    }
    if (demonPiece.id === targetPiece.id) {
      return false;
    }
    if (getMonsPieceBaseType(demonPiece) !== 'demon') {
      return false;
    }
    if (!canCurrentPlayerControlMonsPieceFromPayload(monsGameState, demonPiece)) {
      return false;
    }
    if (!canMonsDemonAttackIgnoringAngelFromPayload(monsGameState.pieces, demonPiece, targetPiece)) {
      return false;
    }
    if (!shouldMonsDemonAttackRequireReboundChoice(demonPiece, targetPiece)) {
      return false;
    }
    const options = getMonsDemonReboundOptionsFromPayload(monsGameState.pieces, demonPiece, targetPiece);
    if (options.length === 0) {
      monsPendingSpiritPush = null;
      monsPendingDemonRebound = null;
      return false;
    }
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = {
      gameId: normalizeMonsGameId(activeMonsGameId),
      demonId: demonPiece.id,
      targetId: targetPiece.id,
      targetRow: targetPiece.row,
      targetCol: targetPiece.col,
      options
    };
    return true;
  }

  async function applyMonsDemonReboundOption(targetRow, targetCol) {
    if (!monsPendingDemonRebound) {
      return false;
    }
    const pendingState = { ...monsPendingDemonRebound };
    const chosenOption = Array.isArray(pendingState.options)
      ? pendingState.options.find((option) => option && option.row === targetRow && option.col === targetCol)
      : null;
    monsPendingDemonRebound = null;
    if (!chosenOption) {
      renderMonsBoard();
      return false;
    }
    const applied = await executeMonsDemonAttack(pendingState.demonId, pendingState.targetId, {
      gameId: pendingState.gameId,
      reboundRow: chosenOption.row,
      reboundCol: chosenOption.col
    });
    if (!applied) {
      renderMonsBoard();
      return false;
    }
    return true;
  }

  async function handleMonsAbilityTargetClick(selectedPiece, clickedPiece) {
    if (!selectedPiece || !clickedPiece) {
      return false;
    }
    if (!canCurrentPlayerControlMonsPieceFromPayload(monsGameState, selectedPiece)) {
      return false;
    }
    const selectedBaseType = getMonsPieceBaseType(selectedPiece);
    const selectedHasBomb = getMonsHeldItemType(selectedPiece) === 'bomb';
    if (isMonsItemPiece(clickedPiece)) {
      if (selectedBaseType === 'spirit' && isMonsSpiritAbilityRange(selectedPiece, clickedPiece)) {
        const startedSpiritPush = tryStartMonsSpiritPush(selectedPiece, clickedPiece);
        if (startedSpiritPush) {
          renderMonsBoard();
          return true;
        }
        return false;
      }
      return beginMonsItemChoice(selectedPiece, clickedPiece);
    }
    if (selectedHasBomb) {
      if (!isMonsMonPiece(clickedPiece)) {
        return false;
      }
      if (clickedPiece.side === selectedPiece.side || clickedPiece.side === 'neutral') {
        return false;
      }
      return executeMonsBombAttack(selectedPiece.id, clickedPiece.id);
    }
    if (selectedBaseType === 'drainer' && canMonsDrainerPickupManaPiece(selectedPiece, clickedPiece)) {
      return moveSelectedMonsPiece(clickedPiece.row, clickedPiece.col);
    }
    if (selectedBaseType === 'spirit') {
      const started = tryStartMonsSpiritPush(selectedPiece, clickedPiece);
      if (started) {
        renderMonsBoard();
        return true;
      }
      return false;
    }
    if (selectedBaseType === 'mystic') {
      if (
        monsGameState?.pieces &&
        canMonsMysticAttackIgnoringAngelFromPayload(monsGameState.pieces, selectedPiece, clickedPiece) &&
        isMonsTargetProtectedByAngel(monsGameState.pieces, clickedPiece)
      ) {
        renderMonsBoard();
        return true;
      }
      return executeMonsMysticAttack(selectedPiece.id, clickedPiece.id);
    }
    if (selectedBaseType === 'demon') {
      const canDemonAttack =
        monsGameState?.pieces &&
        canMonsDemonAttackIgnoringAngelFromPayload(monsGameState.pieces, selectedPiece, clickedPiece);
      if (canDemonAttack && isMonsTargetProtectedByAngel(monsGameState.pieces, clickedPiece)) {
        renderMonsBoard();
        return true;
      }
      if (canDemonAttack && tryStartMonsDemonRebound(selectedPiece, clickedPiece)) {
        renderMonsBoard();
        return true;
      }
      if (canDemonAttack && shouldMonsDemonAttackRequireReboundChoice(selectedPiece, clickedPiece)) {
        monsPendingDemonRebound = null;
        renderMonsBoard();
        return true;
      }
      return executeMonsDemonAttack(selectedPiece.id, clickedPiece.id);
    }
    return false;
  }

  async function handleMonsBoardTilePointerDownInternal(event, row, col, gameId = activeMonsGameId) {
    if (drawModeEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    const switchedMonsGame = normalizeMonsGameId(activeMonsGameId) !== targetMonsGameId;
    if (switchedMonsGame) {
      setActiveMonsGameId(targetMonsGameId);
      renderMonsBoard();
    }
    monsGameState = getMonsGameStateById(targetMonsGameId);

    if (!monsGameState || monsGameState.enabled === false) {
      return;
    }

    const clampedRow = clamp(Math.round(row), 0, MONS_BOARD_SIZE - 1);
    const clampedCol = clamp(Math.round(col), 0, MONS_BOARD_SIZE - 1);
    if (deleteModeEnabled) {
      const clickedPiece = getMonsPieceAtTile(clampedRow, clampedCol, monsGameState.pieces);
      if (clickedPiece?.id) {
        await deleteMonsPieceInRemoveMode(clickedPiece.id, targetMonsGameId);
      }
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    if (monsPendingDemonRebound) {
      const pendingGameId = normalizeMonsGameId(monsPendingDemonRebound.gameId || activeMonsGameId);
      const isPendingOptionClick =
        pendingGameId === targetMonsGameId &&
        Array.isArray(monsPendingDemonRebound.options) &&
        monsPendingDemonRebound.options.some(
          (option) => option && option.row === clampedRow && option.col === clampedCol
        );
      if (isPendingOptionClick) {
        await applyMonsDemonReboundOption(clampedRow, clampedCol);
      } else {
        monsPendingDemonRebound = null;
        renderMonsBoard();
      }
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    if (monsPendingSpiritPush) {
      const didApplySpiritPush = await applyMonsSpiritPushOption(clampedRow, clampedCol);
      if (didApplySpiritPush) {
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      monsPendingSpiritPush = null;
      monsPendingDemonRebound = null;
    }

    const clickedPiece = getMonsPieceAtTile(clampedRow, clampedCol, monsGameState.pieces);
    let selectedPiece = monsSelectionPieceId ? monsGameState.pieces[monsSelectionPieceId] : null;
    const boardHasAnyClaims = doesMonsGameHaveAnyClaims(monsGameState);
    if (selectedPiece && !canCurrentPlayerControlMonsPieceFromPayload(monsGameState, selectedPiece)) {
      monsSelectionPieceId = '';
      monsPendingSpiritPush = null;
      monsPendingDemonRebound = null;
      selectedPiece = null;
    }
    if (clickedPiece) {
      if (isMonsItemPiece(clickedPiece)) {
        if (selectedPiece && selectedPiece.id !== clickedPiece.id) {
          const handledItemChoice = await handleMonsAbilityTargetClick(selectedPiece, clickedPiece);
          if (handledItemChoice) {
            schedulePublishFromClient(event.clientX, event.clientY);
            return;
          }
        }
        if (!boardHasAnyClaims && canCurrentPlayerControlMonsPieceFromPayload(monsGameState, clickedPiece)) {
          monsSelectionPieceId = monsSelectionPieceId === clickedPiece.id ? '' : clickedPiece.id;
        } else if (monsSelectionPieceId === clickedPiece.id) {
          monsSelectionPieceId = '';
        }
        monsPendingSpiritPush = null;
        monsPendingDemonRebound = null;
        renderMonsBoard();
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      if (selectedPiece && selectedPiece.id !== clickedPiece.id) {
        const handledAbility = await handleMonsAbilityTargetClick(selectedPiece, clickedPiece);
        if (handledAbility) {
          schedulePublishFromClient(event.clientX, event.clientY);
          return;
        }
      }
      if (!canCurrentPlayerControlMonsPieceFromPayload(monsGameState, clickedPiece)) {
        monsPendingSpiritPush = null;
        monsPendingDemonRebound = null;
        renderMonsBoard();
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      monsSelectionPieceId = monsSelectionPieceId === clickedPiece.id ? '' : clickedPiece.id;
      monsPendingSpiritPush = null;
      monsPendingDemonRebound = null;
      renderMonsBoard();
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    if (!monsSelectionPieceId) {
      return;
    }
    monsPendingSpiritPush = null;
    monsPendingDemonRebound = null;
    await moveSelectedMonsPiece(clampedRow, clampedCol);
    schedulePublishFromClient(event.clientX, event.clientY);
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

  function getDieRollTargetIds(anchorDieId) {
    if (!anchorDieId) {
      return [];
    }
    if (selectedDiceIds.has(anchorDieId)) {
      const movableSelectedDieIds = getMovableSelectedDieIds();
      if (movableSelectedDieIds.includes(anchorDieId)) {
        return movableSelectedDieIds;
      }
    }
    return [anchorDieId];
  }

  async function rollDice(dieIds) {
    const targetDieIds = Array.from(
      new Set(
        (Array.isArray(dieIds) ? dieIds : [dieIds])
          .map((dieId) => String(dieId || '').trim())
          .filter(Boolean)
      )
    );
    if (targetDieIds.length === 0) {
      return;
    }
    await runTransaction(
      diceRef,
      (currentDice) => {
        if (!currentDice || typeof currentDice !== 'object') {
          return;
        }
        const nextDice = { ...currentDice };
        const now = Date.now();
        let changed = false;
        for (const dieId of targetDieIds) {
          const currentDie = currentDice[dieId];
          if (!currentDie || typeof currentDie !== 'object') {
            continue;
          }
          const normalized = normalizeDicePayload(currentDie);
          if (normalized.type === 'label') {
            continue;
          }
          if (normalized.holderClientId && normalized.holderClientId !== clientId) {
            continue;
          }
          const sides = getDieSides(normalized.type);
          nextDice[dieId] = {
            ...currentDie,
            type: normalized.type,
            value: getRandomIntInclusive(1, sides),
            rollStartedAt: now,
            rollDurationMs: DIE_ROLL_DURATION_MS,
            rollSeed: getRandomIntInclusive(0, 0x7fffffff),
            updatedAt: now
          };
          changed = true;
        }
        if (!changed) {
          return;
        }
        return nextDice;
      },
      { applyLocally: false }
    );
  }

  async function handleDieRollIntent(anchorDieId) {
    const anchorDieState = diceById.get(anchorDieId);
    if (isLabelDieState(anchorDieState)) {
      beginLabelEditing(anchorDieId);
      return;
    }
    const targetDieIds = getDieRollTargetIds(anchorDieId);
    if (targetDieIds.length === 0) {
      return;
    }
    await rollDice(targetDieIds);
  }

  const activePointers = new Set();
  const touchPointers = new Map();
  let mousePanState = null;
  let touchPanState = null;
  let pinchState = null;
  let rafScheduled = false;
  let pendingPosition = null;
  var localDrawCursor = null;
  var localMouseClientX = Number.NaN;
  var localMouseClientY = Number.NaN;
  var isMouseInsideTable = false;

  function ensureLocalDrawCursor() {
    if (localDrawCursor || !cursorLayer) {
      return localDrawCursor;
    }
    const cursor = document.createElement('div');
    cursor.className = 'local-draw-cursor hidden';
    cursor.innerHTML = CURSOR_PENCIL_SVG;
    cursorLayer.appendChild(cursor);
    localDrawCursor = cursor;
    return localDrawCursor;
  }

  function hideLocalDrawCursor() {
    if (localDrawCursor) {
      localDrawCursor.classList.add('hidden');
    }
  }

  function shouldHideLocalDrawCursorAtClient(clientX, clientY) {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return false;
    }
    const hovered = document.elementFromPoint(clientX, clientY);
    if (!(hovered instanceof Element)) {
      return false;
    }
    if (hovered.closest('#homeButton, #lightModeControl, #lightModeToggle, #cursorColorInput, #roomTitleInput')) {
      return true;
    }
    const hoveredButton = hovered.closest('button');
    if (!hoveredButton) {
      return false;
    }
    return Boolean(
      hoveredButton.closest(
        '#playerControls, #bottomLeftControls, #bottomRightControls, #roomBadge, #drawModeButton, #drawClearButton, #drawUndoButton, #drawToolRow, #auctionBidEntry, #auctionBidBoard, .deck-control-button'
      )
    );
  }

  function syncLocalDrawCursor() {
    if (!drawModeEnabled || !isMouseInsideTable || !Number.isFinite(localMouseClientX) || !Number.isFinite(localMouseClientY)) {
      hideLocalDrawCursor();
      return;
    }
    if (shouldHideLocalDrawCursorAtClient(localMouseClientX, localMouseClientY)) {
      hideLocalDrawCursor();
      return;
    }
    const cursor = ensureLocalDrawCursor();
    if (!cursor) {
      return;
    }
    const screenPoint = getScreenPoint(localMouseClientX, localMouseClientY);
    if (!screenPoint) {
      hideLocalDrawCursor();
      return;
    }
    cursor.style.left = `${screenPoint.x}px`;
    cursor.style.top = `${screenPoint.y}px`;
    cursor.classList.remove('hidden');
  }

  function updateLocalMouseCursor(clientX, clientY) {
    localMouseClientX = clientX;
    localMouseClientY = clientY;
    const screenPoint = getScreenPoint(clientX, clientY);
    isMouseInsideTable = Boolean(
      screenPoint &&
      screenPoint.x >= 0 &&
      screenPoint.y >= 0 &&
      screenPoint.x <= screenPoint.rect.width &&
      screenPoint.y <= screenPoint.rect.height
    );
    syncLocalDrawCursor();
  }

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

  function getImageResizeBounds(cardLeft, cardTop) {
    const normalizedLeft = clamp(Number(cardLeft) || 0, 0, WORLD_WIDTH);
    const normalizedTop = clamp(Number(cardTop) || 0, 0, WORLD_HEIGHT);
    const minWidth = IMAGE_COMPONENT_MIN_WORLD_SIZE;
    const minHeight = IMAGE_COMPONENT_MIN_WORLD_SIZE;
    const maxWidth = Math.max(minWidth, Math.min(IMAGE_COMPONENT_MAX_WORLD_WIDTH, WORLD_WIDTH - normalizedLeft));
    const maxHeight = Math.max(minHeight, Math.min(IMAGE_COMPONENT_MAX_WORLD_HEIGHT, WORLD_HEIGHT - normalizedTop));
    return {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight
    };
  }

  function getLabelResizeBounds(labelLeft, labelTop, dieState) {
    const edgeOverflow = LABEL_EDGE_OVERFLOW;
    const normalizedLeft = clamp(Number(labelLeft) || 0, -edgeOverflow, WORLD_WIDTH + edgeOverflow);
    const normalizedTop = clamp(Number(labelTop) || 0, -edgeOverflow, WORLD_HEIGHT + edgeOverflow);
    const maxWidth = Math.max(
      LABEL_MIN_WORLD_WIDTH,
      Math.min(LABEL_MAX_WORLD_WIDTH, WORLD_WIDTH + edgeOverflow - normalizedLeft)
    );
    const maxHeight = Math.max(
      LABEL_MIN_WORLD_HEIGHT,
      Math.min(LABEL_MAX_WORLD_HEIGHT, WORLD_HEIGHT + edgeOverflow - normalizedTop)
    );
    const textValue = normalizeLabelText(dieState?.text || '');
    const minimumScale = LABEL_TEXT_SCALE_MIN;
    const minimumMeasureAtMaxWidth = measureLabelWorldDimensions(textValue, {
      textScale: minimumScale,
      maxWidth
    });
    const minWidth = clamp(minimumMeasureAtMaxWidth.width, LABEL_MIN_WORLD_WIDTH, maxWidth);
    const minimumMeasureAtMinWidth = measureLabelWorldDimensions(textValue, {
      textScale: minimumScale,
      maxWidth: minWidth
    });
    const minHeight = clamp(minimumMeasureAtMinWidth.height, LABEL_MIN_WORLD_HEIGHT, maxHeight);
    return {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight
    };
  }

  async function handleLabelResizePointerDown(event, dieId) {
    if (drawModeEnabled) {
      return;
    }
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
      await deleteDieInRemoveMode(dieId);
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      endedTouchPointerIds.delete(event.pointerId);
    }
    event.preventDefault();
    event.stopPropagation();

    if (dieDragState || labelResizeState || cardDragState || cardResizeState || groupDragState || handReorderState) {
      return;
    }
    if (hasAnyGroupSelection()) {
      releaseAllSelectedObjects();
    }

    const existingDie = diceById.get(dieId);
    if (!isLabelDieState(existingDie)) {
      return;
    }
    if (isLabelDieEditing(dieId)) {
      return;
    }
    if (existingDie.holderClientId && existingDie.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireDieLock(dieId);
    if (!acquired) {
      return;
    }
    if (wasTouchPointerReleased(event.pointerType, event.pointerId)) {
      await releaseDieLock(dieId);
      return;
    }

    const latestDie = diceById.get(dieId) || existingDie;
    if (!isLabelDieState(latestDie) || isLabelDieEditing(dieId)) {
      await releaseDieLock(dieId);
      return;
    }

    const size = getDieWorldDimensions(latestDie);
    const labelLeft = latestDie.x - size.width / 2;
    const labelTop = latestDie.y - size.height / 2;
    const bounds = getLabelResizeBounds(labelLeft, labelTop, latestDie);
    labelResizeState = {
      dieId,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      labelLeft,
      labelTop,
      minWidth: bounds.minWidth,
      minHeight: bounds.minHeight,
      maxWidth: bounds.maxWidth,
      maxHeight: bounds.maxHeight,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      moved: false,
      text: normalizeLabelText(latestDie.text || ''),
      textScale: getLabelTextScale(latestDie)
    };
    resizingLabelDieId = dieId;
    renderDieElement(dieId);

    const startPatch = {
      holderClientId: clientId
    };
    patchLocalDie(dieId, startPatch);
    queueDiePatch(dieId, startPatch);

    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function handleLabelResizeMove(event) {
    if (!labelResizeState || event.pointerId !== labelResizeState.pointerId) {
      return;
    }
    if (labelResizeState.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      handleLabelResizeEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        pointerType: labelResizeState.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return;
    }

    const moveSinceLastEvent = Math.hypot(event.clientX - labelResizeState.lastClientX, event.clientY - labelResizeState.lastClientY);
    if (moveSinceLastEvent >= 0.5) {
      labelResizeState.lastMotionAt = Date.now();
    }
    labelResizeState.lastClientX = event.clientX;
    labelResizeState.lastClientY = event.clientY;

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return;
    }

    const movedDistance = Math.hypot(event.clientX - labelResizeState.startClientX, event.clientY - labelResizeState.startClientY);
    const movedThreshold = labelResizeState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    if (movedDistance > movedThreshold) {
      labelResizeState.moved = true;
    }

    const proposedWidth = clamp(
      worldPoint.x - labelResizeState.labelLeft,
      labelResizeState.minWidth,
      labelResizeState.maxWidth
    );
    const proposedHeight = clamp(
      worldPoint.y - labelResizeState.labelTop,
      labelResizeState.minHeight,
      labelResizeState.maxHeight
    );
    const nextLayout = resolveLabelLayoutForBounds(
      labelResizeState.text,
      proposedWidth,
      proposedHeight,
      LABEL_TEXT_SCALE_MAX
    );
    const nextWidth = clamp(
      Math.max(nextLayout.labelWidth, labelResizeState.minWidth),
      labelResizeState.minWidth,
      labelResizeState.maxWidth
    );
    const nextHeight = clamp(
      Math.max(nextLayout.labelHeight, labelResizeState.minHeight),
      labelResizeState.minHeight,
      labelResizeState.maxHeight
    );
    const nextX = labelResizeState.labelLeft + nextWidth / 2;
    const nextY = labelResizeState.labelTop + nextHeight / 2;
    const resizePatch = {
      x: nextX,
      y: nextY,
      labelWidth: nextWidth,
      labelHeight: nextHeight,
      textScale: nextLayout.textScale,
      holderClientId: clientId
    };
    labelResizeState.textScale = nextLayout.textScale;
    patchLocalDie(labelResizeState.dieId, resizePatch);
    queueDiePatch(labelResizeState.dieId, resizePatch);
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleLabelResizeEnd(event) {
    if (!labelResizeState || event.pointerId !== labelResizeState.pointerId) {
      return;
    }
    if (
      event.type === 'pointerup' &&
      labelResizeState.pointerType === 'mouse' &&
      event.button !== 0 &&
      (event.buttons & 1) !== 0
    ) {
      return;
    }

    const finishedResize = labelResizeState;
    labelResizeState = null;
    resizingLabelDieId = '';
    renderDieElement(finishedResize.dieId);
    diceElements.get(finishedResize.dieId)?.classList.remove('is-label-resize-hovered');

    const releasePatch = {
      holderClientId: null
    };
    patchLocalDie(finishedResize.dieId, releasePatch);
    queueDiePatch(finishedResize.dieId, releasePatch);
    releaseDieLock(finishedResize.dieId).catch((error) => {
      console.error(error);
    });

    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleCardResizePointerDown(event, cardId) {
    if (drawModeEnabled) {
      return;
    }
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
      await deleteCardInRemoveMode(cardId);
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      event.preventDefault();
      event.stopPropagation();
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

    if (cardDragState || cardResizeState || labelResizeState || groupDragState || handReorderState || dieDragState) {
      return;
    }

    if (hasAnyGroupSelection()) {
      releaseAllSelectedObjects();
    }

    const existingCard = cards.get(cardId);
    if (!isResizableImageComponentCard(existingCard)) {
      return;
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

    const latestCard = cards.get(cardId) || existingCard;
    if (!isResizableImageComponentCard(latestCard)) {
      await releaseCardLock(cardId);
      return;
    }

    const size = getCardTableDimensions(latestCard);
    const cardLeft = latestCard.x - size.width / 2;
    const cardTop = latestCard.y - size.height / 2;
    const resizeBounds = getImageResizeBounds(cardLeft, cardTop);
    cardResizeState = {
      cardId,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      cardLeft,
      cardTop,
      minWidth: resizeBounds.minWidth,
      minHeight: resizeBounds.minHeight,
      maxWidth: resizeBounds.maxWidth,
      maxHeight: resizeBounds.maxHeight,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastMotionAt: 0,
      moved: false
    };
    resizingImageCardId = cardId;
    syncHandHoverDragLock();
    renderCardElement(cardId);

    const startPatch = {
      x: latestCard.x,
      y: latestCard.y,
      inDeck: false,
      inDiscard: false,
      inAuction: false,
      holderClientId: clientId,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
    patchLocalCard(cardId, startPatch);
    queueCardPatch(cardId, startPatch);

    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function handleCardResizeMove(event) {
    if (!cardResizeState || event.pointerId !== cardResizeState.pointerId) {
      return;
    }
    if (cardResizeState.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      handleCardResizeEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        pointerType: cardResizeState.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return;
    }

    const moveSinceLastEvent = Math.hypot(event.clientX - cardResizeState.lastClientX, event.clientY - cardResizeState.lastClientY);
    if (moveSinceLastEvent >= 0.5) {
      cardResizeState.lastMotionAt = Date.now();
    }
    cardResizeState.lastClientX = event.clientX;
    cardResizeState.lastClientY = event.clientY;

    const worldPoint = screenToWorldFromClient(event.clientX, event.clientY);
    if (!worldPoint) {
      return;
    }

    const movedDistance = Math.hypot(event.clientX - cardResizeState.startClientX, event.clientY - cardResizeState.startClientY);
    const movedThreshold = cardResizeState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    if (movedDistance > movedThreshold) {
      cardResizeState.moved = true;
    }

    const nextWidth = clamp(worldPoint.x - cardResizeState.cardLeft, cardResizeState.minWidth, cardResizeState.maxWidth);
    const nextHeight = clamp(worldPoint.y - cardResizeState.cardTop, cardResizeState.minHeight, cardResizeState.maxHeight);
    const nextX = cardResizeState.cardLeft + nextWidth / 2;
    const nextY = cardResizeState.cardTop + nextHeight / 2;
    const resizePatch = {
      x: nextX,
      y: nextY,
      componentWidth: nextWidth,
      componentHeight: nextHeight,
      inDeck: false,
      inDiscard: false,
      inAuction: false,
      holderClientId: clientId,
      handOwnerClientId: null,
      handOwnerPlayerToken: null
    };
    patchLocalCard(cardResizeState.cardId, resizePatch);
    queueCardPatch(cardResizeState.cardId, resizePatch);
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleCardResizeEnd(event) {
    if (!cardResizeState || event.pointerId !== cardResizeState.pointerId) {
      return;
    }
    if (
      event.type === 'pointerup' &&
      cardResizeState.pointerType === 'mouse' &&
      event.button !== 0 &&
      (event.buttons & 1) !== 0
    ) {
      return;
    }

    const finishedResize = cardResizeState;
    cardResizeState = null;
    resizingImageCardId = '';
    syncHandHoverDragLock();
    renderCardElement(finishedResize.cardId);
    cardElements.get(finishedResize.cardId)?.classList.remove('is-resize-hovered');

    const releasePatch = {
      holderClientId: null
    };
    patchLocalCard(finishedResize.cardId, releasePatch);
    queueCardPatch(finishedResize.cardId, releasePatch);
    releaseCardLock(finishedResize.cardId).catch((error) => {
      console.error(error);
    });

    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleCardPointerDown(event, cardId) {
    if (drawModeEnabled) {
      return;
    }
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
      await deleteCardInRemoveMode(cardId);
      schedulePublishFromClient(event.clientX, event.clientY);
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

    if (cardDragState || cardResizeState || labelResizeState || groupDragState || handReorderState) {
      return;
    }

    const existingCard = cards.get(cardId);
    if (!existingCard) {
      return;
    }

    if (hasAnyGroupSelection()) {
      if (selectedCardIds.has(cardId) && beginGroupDrag(event, cardId)) {
        safeSetPointerCapture(event.currentTarget, event.pointerId);
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      if (!selectedCardIds.has(cardId)) {
        releaseAllSelectedObjects();
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
    const sourceDeckId = getCardDeckId(latestCard);
    setActiveDeckId(sourceDeckId);
    const sourceDeckState = getDeckStateById(sourceDeckId);
    const discardStartCenter = latestCard.inDiscard && sourceDeckState ? getDiscardCenterPosition(sourceDeckId) : null;
    const auctionStartCenter = latestCard.inAuction && sourceDeckState ? getAuctionCenterPosition(sourceDeckId) : null;
    const cardStartX = latestCard.inDeck && sourceDeckState ? sourceDeckState.x : discardStartCenter ? discardStartCenter.x : auctionStartCenter ? auctionStartCenter.x : latestCard.x;
    const cardStartY = latestCard.inDeck && sourceDeckState ? sourceDeckState.y : discardStartCenter ? discardStartCenter.y : auctionStartCenter ? auctionStartCenter.y : latestCard.y;
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
    const handCardState = cards.get(handReorderState.cardId);
    const canUseDeckZones = canCardUseDeckZones(handCardState);
    const deckTargetId = worldPoint && canUseDeckZones ? getDeckIdAtPosition(worldPoint.x, worldPoint.y, 'deck') : '';
    const discardTargetId = worldPoint && canUseDeckZones ? getDeckIdAtPosition(worldPoint.x, worldPoint.y, 'discard') : '';
    const auctionTargetId = worldPoint && canUseDeckZones ? getDeckIdAtPosition(worldPoint.x, worldPoint.y, 'auction') : '';
    const overDeck = Boolean(deckTargetId);
    const overDiscard = Boolean(discardTargetId);
    const overAuction = Boolean(auctionTargetId) && canPlaceCardOnAuction(handReorderState.cardId, auctionTargetId);
    setDeckDropIndicator(handReorderState.releaseToTable && overDeck && !overDiscard && !overAuction, deckTargetId);
    setDiscardDropIndicator(handReorderState.releaseToTable && overDiscard && !overAuction, discardTargetId);
    setAuctionDropIndicator(handReorderState.releaseToTable && overAuction, auctionTargetId);
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
        const droppedCard = cards.get(finishedState.cardId);
        const droppedSize = getCardTableDimensions(droppedCard);
        const dropX = clamp(worldPoint.x, droppedSize.width / 2, WORLD_WIDTH - droppedSize.width / 2);
        const dropY = clamp(worldPoint.y, droppedSize.height / 2, WORLD_HEIGHT - droppedSize.height / 2);
        const topZ = getTopCardZ() + 1;
        const releaseFace = isImageComponentCard(droppedCard)
          ? droppedCard?.face === 'back'
            ? 'back'
            : 'front'
          : 'front';
        const canUseDeckZones = canCardUseDeckZones(droppedCard);
        const auctionDeckId = canUseDeckZones ? getDeckIdAtPosition(dropX, dropY, 'auction') : '';
        const discardDeckId = canUseDeckZones ? getDeckIdAtPosition(dropX, dropY, 'discard') : '';
        const mainDeckId = canUseDeckZones ? getDeckIdAtPosition(dropX, dropY, 'deck') : '';
        const releasePatch = canUseDeckZones && canPlaceCardOnAuction(finishedState.cardId, auctionDeckId) && Boolean(auctionDeckId)
          ? buildAuctionPlacementPatch(topZ, auctionDeckId)
          : canUseDeckZones && Boolean(discardDeckId)
            ? buildDiscardPlacementPatch(topZ, discardDeckId)
            : canUseDeckZones && Boolean(mainDeckId)
              ? {
                x: getDeckStateById(mainDeckId)?.x ?? dropX,
                y: getDeckStateById(mainDeckId)?.y ?? dropY,
                z: getDeckTopZ(mainDeckId) + 1,
                deckId: mainDeckId,
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
              face: releaseFace,
              deckId: getCardDeckId(droppedCard),
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
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
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

    if (cardDragState || cardResizeState || labelResizeState || groupDragState || deckDragState || handReorderState) {
      return;
    }

    const existingCard = cards.get(cardId);
    if (!existingCard || getCardHandOwnerId(existingCard) !== localPlayerToken) {
      return;
    }

    if (hasAnyGroupSelection()) {
      releaseAllSelectedObjects();
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

    const activeCard = cards.get(cardDragState.cardId);
    const activeCardSize = getCardTableDimensions(activeCard);
    const nextX = clamp(worldPoint.x - cardDragState.offsetX, activeCardSize.width / 2, WORLD_WIDTH - activeCardSize.width / 2);
    const nextY = clamp(worldPoint.y - cardDragState.offsetY, activeCardSize.height / 2, WORLD_HEIGHT - activeCardSize.height / 2);
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
    const canUseDeckZones = canCardUseDeckZones(activeCard);
    const discardTargetDeckId = canUseDeckZones ? getDeckIdAtPosition(nextX, nextY, 'discard') : '';
    const auctionTargetDeckId = canUseDeckZones ? getDeckIdAtPosition(nextX, nextY, 'auction') : '';
    const deckTargetDeckId = canUseDeckZones ? getDeckIdAtPosition(nextX, nextY, 'deck') : '';
    const overDiscard = Boolean(discardTargetDeckId);
    const overAuction = Boolean(auctionTargetDeckId) && canPlaceCardOnAuction(cardDragState.cardId, auctionTargetDeckId);
    setDiscardDropIndicator(overDiscard && !overHandDropRegion && !overAuction, discardTargetDeckId);
    setAuctionDropIndicator(overAuction && !overHandDropRegion, auctionTargetDeckId);
    setDeckDropIndicator(Boolean(deckTargetDeckId) && !overHandDropRegion && !overDiscard && !overAuction, deckTargetDeckId);

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
        buildAuctionDropPatch(finishedDrag.cardId, auctionDropIndicatorDeckId) ||
        buildDiscardDropPatch(finishedDrag.cardId, discardDropIndicatorDeckId) ||
        buildDeckDropPatch(finishedDrag.cardId, deckDropIndicatorDeckId) || {
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
  onCardResizePointerDown = (event, cardId) => {
    handleCardResizePointerDown(event, cardId).catch((error) => {
      console.error(error);
    });
  };
  onCardContextMenu = (event, cardId) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      suppressNextCardContextMenu = false;
      return;
    }
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
  onDiePointerDown = (event, dieId) => {
    handleDiePointerDown(event, dieId).catch((error) => {
      console.error(error);
    });
  };
  onLabelResizePointerDown = (event, dieId) => {
    handleLabelResizePointerDown(event, dieId).catch((error) => {
      console.error(error);
    });
  };
  onDieContextMenu = (event, dieId) => {
    event.preventDefault();
    event.stopPropagation();
    if (deleteModeEnabled) {
      return;
    }
    if (drawModeEnabled) {
      return;
    }
    if (dieDragState?.dieId === dieId && dieDragState.moved) {
      return;
    }
    handleDieRollIntent(dieId).catch((error) => {
      console.error(error);
    });
  };
  onDrawingStrokePointerDown = (event, strokeId) => {
    handleDrawingStrokePointerDown(event, strokeId).catch((error) => {
      console.error(error);
    });
  };

  async function handleDrawingStrokePointerDown(event, strokeId) {
    if (!deleteModeEnabled || drawModeEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    await deleteDrawingStrokeInRemoveMode(strokeId);
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleDiePointerDown(event, dieId) {
    if (drawModeEnabled) {
      return;
    }
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
      await deleteDieInRemoveMode(dieId);
      schedulePublishFromClient(event.clientX, event.clientY);
      return;
    }
    if (isLabelDieEditing(dieId)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.pointerType === 'mouse' && event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
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

    if (consumeDieDoubleTapIfPresent(dieId, event) || consumeDieDoubleClickIfPresent(dieId, event)) {
      handleDieRollIntent(dieId).catch((error) => {
        console.error(error);
      });
      return;
    }

    if (hasAnyGroupSelection()) {
      if (selectedDiceIds.has(dieId) && beginGroupDragFromDie(event, dieId)) {
        safeSetPointerCapture(event.currentTarget, event.pointerId);
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      if (!selectedDiceIds.has(dieId)) {
        releaseAllSelectedObjects();
      }
    }

    if (dieDragState || labelResizeState || cardDragState || cardResizeState || groupDragState || handReorderState) {
      return;
    }
    const dieState = diceById.get(dieId);
    if (!dieState) {
      return;
    }
    if (dieState.holderClientId && dieState.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireDieLock(dieId);
    if (!acquired) {
      return;
    }
    if (wasTouchPointerReleased(event.pointerType, event.pointerId)) {
      await releaseDieLock(dieId);
      return;
    }

    const nextZ = getTopObjectZ() + 1;
    dieDragState = {
      dieId,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      type: normalizeDieType(dieState.type),
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      startX: dieState.x,
      startY: dieState.y,
      width: getDieWorldDimensions(dieState).width,
      height: getDieWorldDimensions(dieState).height,
      moved: false,
      lastMotionAt: 0
    };

    const startPatch = {
      z: nextZ,
      holderClientId: clientId
    };
    patchLocalDie(dieId, startPatch);
    queueDiePatch(dieId, startPatch);
    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  function handleDieDragMove(event) {
    if (!dieDragState || event.pointerId !== dieDragState.pointerId) {
      return;
    }
    if (dieDragState.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      handleDieDragEnd({
        type: 'pointercancel',
        pointerId: event.pointerId,
        pointerType: dieDragState.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0
      });
      return;
    }

    const deltaX = (event.clientX - dieDragState.startClientX) / camera.scale;
    const deltaY = (event.clientY - dieDragState.startClientY) / camera.scale;
    const dieWidth = Math.max(1, Number(dieDragState.width) || DIE_SIZE_D6);
    const dieHeight = Math.max(1, Number(dieDragState.height) || DIE_SIZE_D6);
    const dieBounds = getDieCenterBounds(dieDragState.type || 'd6', dieWidth, dieHeight);
    const nextX = clamp(dieDragState.startX + deltaX, dieBounds.minX, dieBounds.maxX);
    const nextY = clamp(dieDragState.startY + deltaY, dieBounds.minY, dieBounds.maxY);
    const movedDistance = Math.hypot(event.clientX - dieDragState.startClientX, event.clientY - dieDragState.startClientY);
    const movedThreshold = dieDragState.pointerType === 'mouse' ? MOUSE_CLICK_MAX_MOVE_PX : TOUCH_TAP_MAX_MOVE_PX;
    if (movedDistance > movedThreshold) {
      dieDragState.moved = true;
    }
    const moveSinceLastEvent = Math.hypot(event.clientX - dieDragState.lastClientX, event.clientY - dieDragState.lastClientY);
    if (moveSinceLastEvent >= 0.5) {
      dieDragState.lastMotionAt = Date.now();
    }
    dieDragState.lastClientX = event.clientX;
    dieDragState.lastClientY = event.clientY;

    const movePatch = {
      x: nextX,
      y: nextY,
      holderClientId: clientId
    };
    patchLocalDie(dieDragState.dieId, movePatch);
    queueDiePatch(dieDragState.dieId, movePatch);
    schedulePublishFromClient(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handleDieDragEnd(event) {
    if (!dieDragState || event.pointerId !== dieDragState.pointerId) {
      return;
    }
    if (
      event.type === 'pointerup' &&
      dieDragState.pointerType === 'mouse' &&
      event.button !== 0 &&
      (event.buttons & 1) !== 0
    ) {
      return;
    }

    const finishedDrag = dieDragState;
    dieDragState = null;
    const releasePatch = {
      holderClientId: null
    };
    patchLocalDie(finishedDrag.dieId, releasePatch);
    queueDiePatch(finishedDrag.dieId, releasePatch);
    releaseDieLock(finishedDrag.dieId).catch((error) => {
      console.error(error);
    });

    if (event.type === 'pointerup' && !finishedDrag.moved) {
      if (finishedDrag.pointerType === 'touch' || finishedDrag.pointerType === 'pen') {
        rememberDieTouchTapCandidate(finishedDrag.dieId, event);
      } else if (finishedDrag.pointerType === 'mouse' && event.button === 0) {
        rememberDieMouseClickCandidate(finishedDrag.dieId, event);
      }
    }

    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleDeckMovePointerDown(event, deckId = activeDeckId) {
    if (drawModeEnabled) {
      return;
    }
    if (deleteModeEnabled) {
      event.preventDefault();
      event.stopPropagation();
      await deleteDeckInRemoveMode(deckId);
      schedulePublishFromClient(event.clientX, event.clientY);
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

    const targetDeckId = normalizeDeckId(deckId);
    setActiveDeckId(targetDeckId);
    if (hasAnyGroupSelection()) {
      if (selectedDeckIds.has(targetDeckId) && beginGroupDragFromDeck(event, targetDeckId)) {
        safeSetPointerCapture(event.currentTarget, event.pointerId);
        schedulePublishFromClient(event.clientX, event.clientY);
        return;
      }
      if (!selectedDeckIds.has(targetDeckId)) {
        releaseAllSelectedObjects();
      }
    }
    const targetDeckState = getDeckStateById(targetDeckId);
    if (!targetDeckState || deckDragState || cardResizeState || labelResizeState || groupDragState || handReorderState) {
      return;
    }

    if (targetDeckState.holderClientId && targetDeckState.holderClientId !== clientId) {
      return;
    }

    const acquired = await acquireDeckLock(targetDeckId);
    if (!acquired) {
      return;
    }
    if (wasTouchPointerReleased(event.pointerType, event.pointerId)) {
      await releaseDeckLock(targetDeckId);
      return;
    }

    deckDragState = {
      deckId: targetDeckId,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: targetDeckState.x,
      startY: targetDeckState.y
    };

    patchLocalDeck({ holderClientId: clientId }, targetDeckId);
    queueDeckPatch({ holderClientId: clientId }, targetDeckId);

    safeSetPointerCapture(event.currentTarget, event.pointerId);
    schedulePublishFromClient(event.clientX, event.clientY);

    bringDeckToFront(targetDeckId).catch((error) => {
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
    }, deckDragState.deckId);
    queueDeckPatch({
      x: nextX,
      y: nextY,
      holderClientId: clientId
    }, deckDragState.deckId);
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

    const targetDeckId = normalizeDeckId(deckDragState.deckId);
    deckDragState = null;
    patchLocalDeck({ holderClientId: null }, targetDeckId);
    queueDeckPatch({ holderClientId: null }, targetDeckId);
    releaseDeckLock(targetDeckId).catch((error) => {
      console.error(error);
    });
    schedulePublishFromClient(event.clientX, event.clientY);
  }

  async function handleDeckShuffle(deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const targetDeckState = getDeckStateById(targetDeckId);
    if (targetDeckState?.holderClientId && targetDeckState.holderClientId !== clientId) {
      return;
    }
    const deckCardIds = getDeckCardIds(targetDeckId);
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
      patchLocalCard(cardId, { z: nextZ, deckId: targetDeckId });
      updatesByPath[`${cardId}/z`] = nextZ;
      updatesByPath[`${cardId}/deckId`] = targetDeckId;
      updatesByPath[`${cardId}/updatedAt`] = serverTimestamp();
    }
    await update(cardsRef, updatesByPath);

    await runTransaction(
      ref(db, `${roomPath}/decks/${targetDeckId}/shuffleTick`),
      (currentTick) => {
        const parsed = Number(currentTick);
        return Number.isFinite(parsed) ? parsed + 1 : 1;
      },
      { applyLocally: false }
    );
  }

  async function handleDealOneToEachPlayer(deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const targetDeckState = getDeckStateById(targetDeckId);
    if (targetDeckState?.holderClientId && targetDeckState.holderClientId !== clientId) {
      return;
    }

    const targetOwnerTokens = getActivePlayerTokensForDeal();
    if (targetOwnerTokens.length === 0) {
      return;
    }
    if (getDeckCardIds(targetDeckId).length < targetOwnerTokens.length) {
      return;
    }

    await runTransaction(
      cardsRef,
      (currentCards) => {
        if (!currentCards || typeof currentCards !== 'object') {
          return;
        }

        const deckEntries = Object.entries(currentCards).filter(([, cardState]) => {
          if (!cardState || typeof cardState !== 'object') {
            return false;
          }
          return cardState.inDeck === true && normalizeDeckId(cardState.deckId || DECK_KEY) === targetDeckId;
        });
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
          const dealtFace = getFaceWhenEnteringHand(sourceCard);
          nextCards[cardId] = {
            ...sourceCard,
            inDeck: false,
            inDiscard: false,
            inAuction: false,
            deckId: targetDeckId,
            holderClientId: null,
            handOwnerClientId: null,
            handOwnerPlayerToken: ownerToken,
            face: dealtFace,
            z: nextHandZ,
            updatedAt: timestamp + index
          };
        }

        return nextCards;
      },
      { applyLocally: false }
    );
  }

  async function handleDiscardReturnToDeck(deckId = activeDeckId) {
    const targetDeckId = normalizeDeckId(deckId);
    const targetDeckState = getDeckStateById(targetDeckId);
    if (!targetDeckState) {
      return;
    }
    const discardCardIds = getDiscardCardIds(targetDeckId).sort((leftId, rightId) => {
      const left = cards.get(leftId);
      const right = cards.get(rightId);
      return (Number(left?.z) || 0) - (Number(right?.z) || 0);
    });
    if (discardCardIds.length === 0) {
      return;
    }

    let nextDeckZ = getDeckTopZ(targetDeckId) + 1;
    const updatesByPath = {};
    for (const cardId of discardCardIds) {
      const patch = {
        x: targetDeckState.x,
        y: targetDeckState.y,
        z: nextDeckZ,
        face: 'back',
        deckId: targetDeckId,
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
      updatesByPath[`${cardId}/deckId`] = patch.deckId;
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

  async function toggleMonsSideClaim(side, gameId = activeMonsGameId) {
    const normalizedSide = side === 'black' ? 'black' : side === 'white' ? 'white' : '';
    if (!normalizedSide || !localPlayerToken) {
      return false;
    }
    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    const otherSide = normalizedSide === 'black' ? 'white' : 'black';
    const result = await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        if (!currentGame || typeof currentGame !== 'object') {
          return currentGame;
        }
        const normalized = normalizeMonsGamePayload(currentGame);
        const claims = normalizeMonsClaimsPayload(normalized.claims);
        const nextSideClaims = [...claims[normalizedSide]];
        const nextOtherSideClaims = [...claims[otherSide]];
        const currentSideIndex = nextSideClaims.findIndex((entry) => entry?.token === localPlayerToken);
        if (currentSideIndex >= 0) {
          nextSideClaims.splice(currentSideIndex, 1);
        } else {
          const otherSideIndex = nextOtherSideClaims.findIndex((entry) => entry?.token === localPlayerToken);
          if (otherSideIndex >= 0) {
            nextOtherSideClaims.splice(otherSideIndex, 1);
          }
          if (nextSideClaims.length >= 2) {
            return currentGame;
          }
          nextSideClaims.push({
            token: localPlayerToken,
            name: String(playerState.name || '').trim().slice(0, 24),
            color: normalizeHexColor(playerState.color)
          });
        }
        return {
          ...normalized,
          claims: {
            [normalizedSide]: nextSideClaims,
            [otherSide]: nextOtherSideClaims
          },
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    if (!result.committed) {
      return false;
    }
    renderMonsBoard();
    return true;
  }

  onDeckMovePointerDown = (event, deckId) => {
    handleDeckMovePointerDown(event, deckId).catch((error) => {
      console.error(error);
    });
  };
  onMonsMovePointerDown = (event, gameId = activeMonsGameId) => {
    handleMonsMovePointerDown(event, gameId).catch((error) => {
      console.error(error);
    });
  };
  onMonsUndoButtonClick = (event, gameId = activeMonsGameId) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (deleteModeEnabled) {
      return;
    }
    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    if (normalizeMonsGameId(activeMonsGameId) !== targetMonsGameId) {
      setActiveMonsGameId(targetMonsGameId);
      renderMonsBoard();
    }
    undoMonsLastAction().catch((error) => {
      console.error(error);
    });
  };
  onMonsFlipButtonClick = (event, gameId = activeMonsGameId) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (deleteModeEnabled) {
      return;
    }
    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    toggleMonsBoardOrientation(targetMonsGameId).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  };
  onMonsBoardTilePointerDown = (event, row, col, gameId = activeMonsGameId) => {
    handleMonsBoardTilePointerDownInternal(event, row, col, gameId).catch((error) => {
      console.error(error);
    });
  };
  onMonsSideClaimClick = (event, side, gameId = activeMonsGameId) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (deleteModeEnabled) {
      return;
    }
    toggleMonsSideClaim(side, gameId).catch((error) => {
      console.error(error);
      setRealtimeStatus('firebase: write blocked');
    });
  };
  submitMonsItemChoice = async (choice) => {
    await applyMonsItemChoice(choice);
  };
  shuffleCoolJpegsDeck = async (deckId = activeDeckId) => {
    await handleDeckShuffle(deckId);
  };
  dealOneCardEach = async (deckId = activeDeckId) => {
    await handleDealOneToEachPlayer(deckId);
  };
  reclaimDiscardToDeck = async (deckId = activeDeckId) => {
    await handleDiscardReturnToDeck(deckId);
  };

  async function loadImageNaturalSize(src) {
    const normalizedSrc = normalizeImageComponentSrc(src);
    if (!normalizedSrc) {
      return { width: CARD_WIDTH, height: CARD_HEIGHT };
    }
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      let settled = false;
      const finalize = (success) => {
        if (settled) {
          return;
        }
        settled = true;
        if (success && Number.isFinite(image.naturalWidth) && Number.isFinite(image.naturalHeight) && image.naturalWidth > 0 && image.naturalHeight > 0) {
          resolve(clampImageComponentSize(image.naturalWidth, image.naturalHeight));
          return;
        }
        resolve({ width: CARD_WIDTH, height: CARD_HEIGHT });
      };
      image.onload = () => finalize(true);
      image.onerror = () => finalize(false);
      image.src = normalizedSrc;
      if (image.complete) {
        finalize(image.naturalWidth > 0 && image.naturalHeight > 0);
      }
    });
  }

  spawnDice = async (type = 'd6', count = 1) => {
    const normalizedType = normalizeDieType(type);
    const normalizedCount = clamp(Math.round(Number(count) || 1), 1, 5);
    const dieDimensions = getDieWorldDimensions(normalizedType);
    const viewportCenter = getViewportWorldCenter();
    const spawnCenterX = clamp(viewportCenter.x, dieDimensions.width / 2, WORLD_WIDTH - dieDimensions.width / 2);
    const spawnCenterY = clamp(viewportCenter.y, dieDimensions.height / 2, WORLD_HEIGHT - dieDimensions.height / 2);
    await runTransaction(
      diceRef,
      (currentDice) => {
        const baseDice = currentDice && typeof currentDice === 'object' ? { ...currentDice } : {};
        let nextTopZ = getTopObjectZ();
        for (const payload of Object.values(baseDice)) {
          nextTopZ = Math.max(nextTopZ, Number(payload?.z) || 0);
        }
        const totalSpan = (normalizedCount - 1) * DICE_SPAWN_GAP;
        const startX = spawnCenterX - totalSpan / 2;
        for (let index = 0; index < normalizedCount; index += 1) {
          let nextDieId = `die-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
          while (Object.prototype.hasOwnProperty.call(baseDice, nextDieId)) {
            nextDieId = `die-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
          }
          const sides = getDieSides(normalizedType);
          const x = clamp(
            startX + index * DICE_SPAWN_GAP,
            dieDimensions.width / 2,
            WORLD_WIDTH - dieDimensions.width / 2
          );
          const y = spawnCenterY;
          nextTopZ += 1;
          baseDice[nextDieId] = {
            type: normalizedType,
            x,
            y,
            z: nextTopZ,
            value: 1 + Math.floor(Math.random() * sides),
            holderClientId: null,
            rollStartedAt: 0,
            rollDurationMs: DIE_ROLL_DURATION_MS,
            rollSeed: Math.floor(Math.random() * 0x7fffffff),
            updatedAt: Date.now()
          };
        }
        return baseDice;
      },
      { applyLocally: false }
    );
  };
  spawnCoin = async () => {
    await spawnDice('coin', 1);
  };
  spawnLabelComponent = async () => {
    const labelText = LABEL_DEFAULT_TEXT;
    const labelColor = normalizeHexColor(playerState.color);
    const baseDimensions = measureLabelWorldDimensions(labelText, {
      textScale: LABEL_TEXT_SCALE_DEFAULT
    });
    const targetSpawnWidth = clamp(
      Math.max(baseDimensions.width, LABEL_DEFAULT_SPAWN_WIDTH),
      LABEL_MIN_WORLD_WIDTH,
      LABEL_MAX_WORLD_WIDTH
    );
    const labelLayout = resolveLabelLayoutForBounds(
      labelText,
      targetSpawnWidth,
      baseDimensions.height,
      LABEL_TEXT_SCALE_DEFAULT
    );
    const viewportCenter = getViewportWorldCenter();
    const labelCenterBounds = getDieCenterBounds('label', labelLayout.labelWidth, labelLayout.labelHeight);
    const spawnCenterX = clamp(viewportCenter.x, labelCenterBounds.minX, labelCenterBounds.maxX);
    const spawnCenterY = clamp(viewportCenter.y, labelCenterBounds.minY, labelCenterBounds.maxY);
    await runTransaction(
      diceRef,
      (currentDice) => {
        const baseDice = currentDice && typeof currentDice === 'object' ? { ...currentDice } : {};
        let nextTopZ = getTopObjectZ();
        for (const payload of Object.values(baseDice)) {
          nextTopZ = Math.max(nextTopZ, Number(payload?.z) || 0);
        }
        nextTopZ += 1;
        let nextDieId = `label-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        while (Object.prototype.hasOwnProperty.call(baseDice, nextDieId)) {
          nextDieId = `label-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        }
        baseDice[nextDieId] = {
          type: 'label',
          x: spawnCenterX,
          y: spawnCenterY,
          z: nextTopZ,
          value: 1,
          text: labelText,
          textColor: labelColor,
          textScale: labelLayout.textScale,
          labelWidth: labelLayout.labelWidth,
          labelHeight: labelLayout.labelHeight,
          holderClientId: null,
          rollStartedAt: 0,
          rollDurationMs: DIE_ROLL_DURATION_MS,
          rollSeed: 0,
          updatedAt: Date.now()
        };
        return baseDice;
      },
      { applyLocally: false }
    );
  };
  spawnImageComponent = async (frontSrc, options = {}) => {
    const normalizedFrontSrc = normalizeImageComponentSrc(frontSrc);
    if (!normalizedFrontSrc) {
      throw new Error('Image URL required');
    }
    const useCardSize = options.cardSized !== false;
    const twoSided = options.twoSided === true;
    const normalizedBackSrc = twoSided ? normalizeImageComponentSrc(options.backSrc || '') : '';
    const nativeSize = useCardSize ? { width: CARD_WIDTH, height: CARD_HEIGHT } : await loadImageNaturalSize(normalizedFrontSrc);
    const viewportCenter = getViewportWorldCenter();
    const halfWidth = nativeSize.width / 2;
    const halfHeight = nativeSize.height / 2;
    const spawnCenterX = clamp(viewportCenter.x, halfWidth, WORLD_WIDTH - halfWidth);
    const spawnCenterY = clamp(viewportCenter.y, halfHeight, WORLD_HEIGHT - halfHeight);
    await runTransaction(
      cardsRef,
      (currentCards) => {
        const baseCards = currentCards && typeof currentCards === 'object' ? { ...currentCards } : {};
        let nextTopZ = 1;
        for (const payload of Object.values(baseCards)) {
          nextTopZ = Math.max(nextTopZ, Number(payload?.z) || 1);
        }
        nextTopZ += 1;
        let nextCardId = `image-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        while (Object.prototype.hasOwnProperty.call(baseCards, nextCardId)) {
          nextCardId = `image-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        }
        baseCards[nextCardId] = {
          x: spawnCenterX,
          y: spawnCenterY,
          z: nextTopZ,
          face: 'front',
          frontSrc: normalizedFrontSrc,
          backSrc: normalizedBackSrc,
          componentType: 'image',
          componentCardSized: useCardSize,
          componentWidth: nativeSize.width,
          componentHeight: nativeSize.height,
          deckId: DECK_KEY,
          inDeck: false,
          inDiscard: false,
          inAuction: false,
          holderClientId: null,
          handOwnerClientId: null,
          handOwnerPlayerToken: null,
          updatedAt: Date.now()
        };
        return baseCards;
      },
      { applyLocally: false }
    );
  };

  spawnCoolJpegsDeck = async () => {
    void preloadCoolJpegsFrontImages();
    const viewportCenter = getViewportWorldCenter();
    const spawnCenter = {
      x: clamp(viewportCenter.x, CARD_WIDTH / 2, WORLD_WIDTH - CARD_WIDTH / 2),
      y: clamp(viewportCenter.y, CARD_HEIGHT / 2, WORLD_HEIGHT - CARD_HEIGHT / 2)
    };
    const hasCards = cards.size > 0;
    const hasDecks = deckStatesById.size > 0;
    const nextDeckId = !hasCards && !hasDecks
      ? DECK_KEY
      : `${DECK_KEY}-copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    await runTransaction(
      cardsRef,
      (currentCards) => {
        const baseCards = currentCards && typeof currentCards === 'object' ? currentCards : {};
        const extraStack = buildCoolJpegsDeck({
          deckId: nextDeckId,
          center: spawnCenter,
          inDeck: true,
          zStart: 1
        });
        return {
          ...baseCards,
          ...extraStack
        };
      },
      { applyLocally: false }
    );

    await set(ref(db, `${roomPath}/decks/${nextDeckId}`), {
      x: spawnCenter.x,
      y: spawnCenter.y,
      shuffleTick: 0,
      holderClientId: null,
      updatedAt: serverTimestamp()
    });
    setActiveDeckId(nextDeckId);
  };

  spawnSuperMetalMonsBoard = async () => {
    const viewportCenter = getViewportWorldCenter();
    const spawnX = clamp(viewportCenter.x, MONS_BOARD_WORLD_WIDTH / 2, WORLD_WIDTH - MONS_BOARD_WORLD_WIDTH / 2);
    const spawnY = clamp(viewportCenter.y, MONS_BOARD_WORLD_HEIGHT / 2, WORLD_HEIGHT - MONS_BOARD_WORLD_HEIGHT / 2);
    let createdMonsGameId = '';
    const result = await runTransaction(
      gamesRef,
      (currentGames) => {
        const baseGames = currentGames && typeof currentGames === 'object' ? { ...currentGames } : {};
        const existingMonsIds = Object.keys(baseGames).filter((rawGameId) => {
          if (!isMonsGameId(rawGameId)) {
            return false;
          }
          const payload = baseGames[rawGameId];
          return Boolean(payload && typeof payload === 'object' && payload.enabled !== false);
        });
        let nextMonsGameId =
          existingMonsIds.length === 0 && !baseGames[MONS_GAME_KEY]
            ? MONS_GAME_KEY
            : `${MONS_GAME_KEY}-copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        while (Object.prototype.hasOwnProperty.call(baseGames, nextMonsGameId)) {
          nextMonsGameId = `${MONS_GAME_KEY}-copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        }
        createdMonsGameId = nextMonsGameId;
        return {
          ...baseGames,
          [nextMonsGameId]: buildFreshMonsGamePayload({
            x: spawnX,
            y: spawnY,
            width: MONS_BOARD_WORLD_WIDTH,
            height: MONS_BOARD_WORLD_HEIGHT
          })
        };
      },
      { applyLocally: false }
    );
    if (!result.committed) {
      return;
    }
    if (createdMonsGameId) {
      setActiveMonsGameId(createdMonsGameId);
    }
  };

  resetCoolJpegsGame = async (deckId = activeDeckId) => {
    const targetDeckId = normalizeDeckId(deckId);
    const center = getDeckCenterPosition(targetDeckId);
    await runTransaction(
      cardsRef,
      (currentCards) => {
        const baseCards = currentCards && typeof currentCards === 'object' ? { ...currentCards } : {};
        for (const [cardId, cardState] of Object.entries(baseCards)) {
          if (!cardState || typeof cardState !== 'object') {
            continue;
          }
          if (normalizeDeckId(cardState.deckId || DECK_KEY) !== targetDeckId) {
            continue;
          }
          delete baseCards[cardId];
        }
        return {
          ...baseCards,
          ...buildCoolJpegsDeck({
            deckId: targetDeckId,
            center,
            inDeck: true,
            zStart: 1
          })
        };
      },
      { applyLocally: false }
    );
    await update(ref(db, `${roomPath}/decks/${targetDeckId}`), {
      x: center.x,
      y: center.y,
      shuffleTick: 0,
      holderClientId: null,
      updatedAt: serverTimestamp()
    });
  };

  putAwayCoolJpegsGame = async (deckId = activeDeckId) => {
    const targetDeckId = normalizeDeckId(deckId);
    await runTransaction(
      cardsRef,
      (currentCards) => {
        if (!currentCards || typeof currentCards !== 'object') {
          return currentCards;
        }
        const nextCards = { ...currentCards };
        let removedAny = false;
        for (const [cardId, cardState] of Object.entries(nextCards)) {
          if (!cardState || typeof cardState !== 'object') {
            continue;
          }
          if (normalizeDeckId(cardState.deckId || DECK_KEY) !== targetDeckId) {
            continue;
          }
          delete nextCards[cardId];
          removedAny = true;
        }
        if (!removedAny) {
          return currentCards;
        }
        return nextCards;
      },
      { applyLocally: false }
    );
    await update(ref(db, `${roomPath}/decks`), {
      [targetDeckId]: null
    });
  };

  resetSuperMetalMonsGame = async (gameId = activeMonsGameId) => {
    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    await runTransaction(
      getMonsGameRef(targetMonsGameId),
      (currentGame) => {
        const normalized =
          currentGame && typeof currentGame === 'object'
            ? normalizeMonsGamePayload(currentGame)
            : normalizeMonsGamePayload({ enabled: true });
        return buildFreshMonsGamePayload({
          x: normalized.x,
          y: normalized.y,
          width: normalized.width,
          height: normalized.height,
          claims: normalized.claims
        });
      },
      { applyLocally: false }
    );
    setActiveMonsGameId(targetMonsGameId);
  };

  putAwaySuperMetalMonsGame = async (gameId = activeMonsGameId) => {
    const targetMonsGameId = normalizeMonsGameId(gameId || activeMonsGameId);
    await update(gamesRef, {
      [targetMonsGameId]: null
    });
  };

  function resetLocalTabletopState() {
    cardWriteGeneration += 1;
    dieWriteGeneration += 1;
    deckWriteGeneration += 1;
    monsWriteGeneration += 1;
    strokeWriteGeneration += 1;
    closeLabelEditor({ commit: true });
    cardWriteScheduled = false;
    dieWriteScheduled = false;
    deckWriteScheduled = false;
    monsWriteScheduled = false;
    strokeWriteScheduled = false;
    setDeckDropIndicator(false);
    setDiscardDropIndicator(false);
    setAuctionDropIndicator(false);
    setHandDropGlow(false);
    deckDropIndicatorVisible = false;
    discardDropIndicatorVisible = false;
    auctionDropIndicatorVisible = false;
    selectedCardIds.clear();
    selectedDiceIds.clear();
    selectedDeckIds.clear();
    selectedMonsGameIds.clear();
    pendingCardWrites.clear();
    pendingDieWrites.clear();
    pendingDeckPatch = {};
    pendingMonsPatch = {};
    pendingStrokeWrites.clear();
    drawPointerState = null;
    drawShapePointerState = null;
    drawShapeAnchorState = null;
    syncShapeDrawingAssistVisuals();
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
    cardResizeState = null;
    resizingImageCardId = '';
    dieDragState = null;
    labelResizeState = null;
    resizingLabelDieId = '';
    groupDragState = null;
    selectionBoxState = null;
    suppressNextCardContextMenu = false;
    recentTouchTapByCardId.clear();
    recentTouchTapByDieId.clear();
    recentMouseClickByCardId.clear();
    recentMouseClickByDieId.clear();
    deckDragState = null;
    monsDragState = null;
    handReorderState = null;
    handDropPreview = null;
    syncHandHoverDragLock();
    hideSelectionBox();
    setDeckShuffleFxActive(false);
    hideAllDeckUiElements();
    hideMonsBoardElements();
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
    for (const fxCard of deckShuffleFxCards) {
      fxCard.remove();
    }
    removeAllDeckUiArtifacts();
    removeMonsBoardElements();
    closeDiceAddModal();
    closeMonsItemChoiceModal();
    closeGameOptionsMenu();
    deckShuffleFxCards = [];
    deckShuffleFxActive = false;
    if (diceRollAnimationRafId) {
      window.cancelAnimationFrame(diceRollAnimationRafId);
      diceRollAnimationRafId = 0;
    }
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
    for (const dieElement of diceElements.values()) {
      dieElement.remove();
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
    syncDrawActionButtonsState();
    cards.clear();
    diceById.clear();
    cardElements.clear();
    diceElements.clear();
    frontDisplayPendingByCard.clear();
    deckState = null;
    deckStatesById.clear();
    activeDeckId = DECK_KEY;
    deckShuffleFxDeckId = DECK_KEY;
    deckDropIndicatorDeckId = '';
    discardDropIndicatorDeckId = '';
    auctionDropIndicatorDeckId = '';
    monsGameState = null;
    monsGameStatesById.clear();
    activeMonsGameId = MONS_GAME_KEY;
    setLocalHandCountLabel();
    setHandHoverDragLock(false);
    syncClearTableButtonState();
  }

  clearTabletop = async () => {
    isTableResetting = true;
    try {
      resetLocalTabletopState();

      await update(ref(db, roomPath), {
        cards: null,
        dice: null,
        decks: null,
        games: null,
        drawings: null,
        auctionBids: null
      });
    } finally {
      isTableResetting = false;
    }
  };

  wipeAllDrawings = async () => {
    if (!isRoomOwner) {
      throw new Error('Only the room creator can wipe all drawings.');
    }
    const ownerCheck = await runTransaction(
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
          ownerToken: currentOwnerToken,
          updatedAt: Date.now()
        };
      },
      { applyLocally: false }
    );
    if (!ownerCheck.committed) {
      throw new Error('Only the room creator can wipe all drawings.');
    }

    drawPointerState = null;
    drawShapePointerState = null;
    drawShapeAnchorState = null;
    syncShapeDrawingAssistVisuals();
    strokeWriteGeneration += 1;
    strokeWriteScheduled = false;
    pendingStrokeWrites.clear();
    await set(drawingsRef, null);
    for (const strokeElement of drawingStrokeElements.values()) {
      strokeElement.remove();
    }
    drawingStrokeElements.clear();
    drawingStrokes.clear();
    renderAllDrawingStrokes();
    syncClearTableButtonState();
  };

  let latestRawCursorsById = {};
  const refreshVisibleCursorState = () => {
    const visibleEntries = buildVisibleCursorEntries(latestRawCursorsById, clientId);
    latestRoomCursors = Object.fromEntries(
      visibleEntries.map((entry) => [
        entry.id,
        {
          ...entry.payload,
          playerToken: entry.token
        }
      ])
    );

    const activePeerTokens = new Set(visibleEntries.map((entry) => entry.token || entry.id));
    const hasNewPeer = Array.from(activePeerTokens).some((token) => !knownPeerTokens.has(token));
    knownPeerTokens = activePeerTokens;
    if (hasNewPeer) {
      void preloadCoolJpegsFrontImages();
    }

    const activeDotIds = new Set();
    for (const entry of visibleEntries) {
      const dotId = entry.token || entry.id;
      activeDotIds.add(dotId);
      upsertDot(dotId, {
        ...entry.payload,
        playerToken: entry.token
      });
    }

    for (const [dotId, dot] of dots.entries()) {
      if (activeDotIds.has(dotId)) {
        continue;
      }
      dot.remove();
      dots.delete(dotId);
    }

    renderRoomRoster(latestRoomCursors, clientId);
    renderDeckControls();
    scheduleAuctionBidUiRender();
    refreshMonsClaimLabelsOnly();

    const displayCount = visibleEntries.length + 1;
    setRealtimeStatus(`firebase: connected • players: ${displayCount}`);
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
      refreshVisibleCursorState();
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
      latestRawCursorsById = snapshot.val() || {};
      refreshVisibleCursorState();
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
        if (cardResizeState?.cardId === cardId) {
          cardResizeState = null;
          resizingImageCardId = '';
          syncHandHoverDragLock();
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
      syncClearTableButtonState();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Card sync failed. Check Realtime Database rules for room path access.');
    }
  );

  onValue(
    diceRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      const allDice = snapshot.val() || {};
      const activeDieIds = new Set();
      for (const [dieId, payload] of Object.entries(allDice)) {
        activeDieIds.add(dieId);
        diceById.set(dieId, normalizeDicePayload(payload));
      }
      if (labelEditState) {
        const editingState = diceById.get(labelEditState.dieId);
        if (!editingState || !isLabelDieState(editingState)) {
          closeLabelEditor({ commit: false });
        }
      }
      for (const dieId of Array.from(diceById.keys())) {
        if (activeDieIds.has(dieId)) {
          continue;
        }
        if (labelEditState?.dieId === dieId) {
          closeLabelEditor({ commit: false });
        }
        if (dieDragState?.dieId === dieId) {
          dieDragState = null;
        }
        if (labelResizeState?.dieId === dieId) {
          labelResizeState = null;
          resizingLabelDieId = '';
        }
        selectedDiceIds.delete(dieId);
        diceById.delete(dieId);
      }
      renderAllDice();
      syncClearTableButtonState();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Dice sync failed. Check Realtime Database rules for room path access.');
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
      syncClearTableButtonState();
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
    decksRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      const nextDecksPayload = snapshot.val();
      const nextDeckEntries = [];
      if (nextDecksPayload && typeof nextDecksPayload === 'object') {
        const looksLegacySingleDeck = Number.isFinite(Number(nextDecksPayload.x)) || Number.isFinite(Number(nextDecksPayload.y));
        if (looksLegacySingleDeck) {
          nextDeckEntries.push([DECK_KEY, nextDecksPayload]);
        } else {
          for (const [rawDeckId, rawDeckPayload] of Object.entries(nextDecksPayload)) {
            if (!rawDeckPayload || typeof rawDeckPayload !== 'object') {
              continue;
            }
            nextDeckEntries.push([normalizeDeckId(rawDeckId), rawDeckPayload]);
          }
        }
      }

      const nextDeckIds = new Set();
      let shouldTriggerShuffleFx = false;
      let shuffleFxDeckId = '';
      for (const [nextDeckId, rawDeckPayload] of nextDeckEntries) {
        const normalizedDeck = normalizeDeckPayload(rawDeckPayload);
        const previousDeckState = deckStatesById.get(nextDeckId) || null;
        if (previousDeckState && normalizedDeck.shuffleTick !== previousDeckState.shuffleTick) {
          shouldTriggerShuffleFx = true;
          shuffleFxDeckId = nextDeckId;
        }
        deckStatesById.set(nextDeckId, normalizedDeck);
        nextDeckIds.add(nextDeckId);
      }

      for (const existingDeckId of Array.from(deckStatesById.keys())) {
        if (nextDeckIds.has(existingDeckId)) {
          continue;
        }
        deckStatesById.delete(existingDeckId);
        removeDeckUi(existingDeckId);
      }
      for (const selectedDeckId of Array.from(selectedDeckIds)) {
        if (nextDeckIds.has(selectedDeckId)) {
          continue;
        }
        selectedDeckIds.delete(selectedDeckId);
      }

      if (!deckStatesById.has(activeDeckId)) {
        const fallbackDeckId = deckStatesById.has(DECK_KEY)
          ? DECK_KEY
          : Array.from(deckStatesById.keys())[0] || DECK_KEY;
        setActiveDeckId(fallbackDeckId);
      } else {
        setActiveDeckId(activeDeckId);
      }

      if (deckStatesById.size === 0) {
        setDeckShuffleFxActive(false);
      }

      void preloadCoolJpegsFrontImages();
      renderAllCards();

      if (shouldTriggerShuffleFx) {
        triggerDeckShuffleFx(shuffleFxDeckId || activeDeckId);
      }
      syncClearTableButtonState();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Deck sync failed. Check Realtime Database rules for room path access.');
    }
  );

  onValue(
    gamesRef,
    (snapshot) => {
      if (isTableResetting) {
        return;
      }
      const nextGamesRaw = snapshot.val();
      const nextMonsEntries = [];
      if (nextGamesRaw && typeof nextGamesRaw === 'object') {
        for (const [rawGameId, rawGamePayload] of Object.entries(nextGamesRaw)) {
          if (!isMonsGameId(rawGameId)) {
            continue;
          }
          if (!rawGamePayload || typeof rawGamePayload !== 'object' || rawGamePayload.enabled === false) {
            continue;
          }
          nextMonsEntries.push([normalizeMonsGameId(rawGameId), normalizeMonsGamePayload(rawGamePayload)]);
        }
      }

      const nextMonsIds = new Set();
      for (const [nextMonsGameId, nextMonsGameState] of nextMonsEntries) {
        monsGameStatesById.set(nextMonsGameId, nextMonsGameState);
        nextMonsIds.add(nextMonsGameId);
      }
      for (const existingMonsGameId of Array.from(monsGameStatesById.keys())) {
        if (nextMonsIds.has(existingMonsGameId)) {
          continue;
        }
        monsGameStatesById.delete(existingMonsGameId);
      }
      for (const selectedMonsGameId of Array.from(selectedMonsGameIds)) {
        if (nextMonsIds.has(selectedMonsGameId)) {
          continue;
        }
        selectedMonsGameIds.delete(selectedMonsGameId);
      }

      const optionsMonsGameId = getMonsGameIdFromGameOptionsTarget(activeGameOptionsTarget);
      if (optionsMonsGameId && !nextMonsIds.has(optionsMonsGameId)) {
        closeGameOptionsMenu();
      }

      if (nextMonsIds.size === 0) {
        setActiveMonsGameId(MONS_GAME_KEY);
        monsGameState = null;
        renderMonsBoard();
        syncClearTableButtonState();
        return;
      }

      let fallbackMonsGameId = normalizeMonsGameId(activeMonsGameId);
      if (!nextMonsIds.has(fallbackMonsGameId)) {
        fallbackMonsGameId = nextMonsIds.has(MONS_GAME_KEY) ? MONS_GAME_KEY : nextMonsEntries[0]?.[0] || MONS_GAME_KEY;
      }
      setActiveMonsGameId(fallbackMonsGameId);
      renderMonsBoard();
      syncClearTableButtonState();
    },
    (error) => {
      console.error(error);
      setRealtimeStatus('firebase: read blocked');
      showStatusMessage('Super Metal Mons board sync failed. Check Realtime Database rules for room path access.');
    }
  );

  window.addEventListener('pointermove', handleCardDragMove);
  window.addEventListener('pointerup', handleCardDragEnd);
  window.addEventListener('pointercancel', handleCardDragEnd);
  window.addEventListener('pointermove', handleCardResizeMove);
  window.addEventListener('pointerup', handleCardResizeEnd);
  window.addEventListener('pointercancel', handleCardResizeEnd);
  window.addEventListener('pointermove', handleDieDragMove);
  window.addEventListener('pointerup', handleDieDragEnd);
  window.addEventListener('pointercancel', handleDieDragEnd);
  window.addEventListener('pointermove', handleLabelResizeMove);
  window.addEventListener('pointerup', handleLabelResizeEnd);
  window.addEventListener('pointercancel', handleLabelResizeEnd);
  window.addEventListener('pointermove', handleHandReorderMove);
  window.addEventListener('pointerup', handleHandReorderEnd);
  window.addEventListener('pointercancel', handleHandReorderEnd);
  window.addEventListener('pointerup', markTouchPointerEnded);
  window.addEventListener('pointercancel', markTouchPointerEnded);

  window.addEventListener('pointermove', handleDeckDragMove);
  window.addEventListener('pointerup', handleDeckDragEnd);
  window.addEventListener('pointercancel', handleDeckDragEnd);
  window.addEventListener('pointermove', handleMonsDragMove);
  window.addEventListener('pointerup', handleMonsDragEnd);
  window.addEventListener('pointercancel', handleMonsDragEnd);

  handReclaimIntervalId = window.setInterval(() => {
    scheduleHandReclaimCheck();
  }, HAND_RECLAIM_CHECK_INTERVAL_MS);

  window.addEventListener('beforeunload', () => {
    cancelActiveCardInteractions();
    releaseUnexpectedLocalCardLocks();
    signalSessionLeave();
    if (themeTransitionTimerId) {
      window.clearTimeout(themeTransitionTimerId);
      themeTransitionTimerId = 0;
    }
    if (cameraPersistTimerId) {
      window.clearTimeout(cameraPersistTimerId);
      cameraPersistTimerId = 0;
    }
    if (diceRollAnimationRafId) {
      window.cancelAnimationFrame(diceRollAnimationRafId);
      diceRollAnimationRafId = 0;
    }
    persistCameraViewNow();
    if (handReclaimIntervalId) {
      window.clearInterval(handReclaimIntervalId);
      handReclaimIntervalId = 0;
    }
    if (cursorHeartbeatIntervalId) {
      window.clearInterval(cursorHeartbeatIntervalId);
      cursorHeartbeatIntervalId = 0;
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
    scheduleRoomBadgeWidthSync();
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

function isEventOnMonsBoardUi(event) {
  const target = event.target instanceof Element ? event.target : null;
  return Boolean(target?.closest('#monsGameShell, .mons-game-shell, #monsMoveButton, #monsOptionsButton, .mons-move-button, .mons-options-button'));
}

function getDistancePointToSegment(pointX, pointY, startX, startY, endX, endY) {
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const segmentLengthSq = segmentX * segmentX + segmentY * segmentY;
  if (segmentLengthSq <= 0.0001) {
    return Math.hypot(pointX - startX, pointY - startY);
  }
  const projection =
    ((pointX - startX) * segmentX + (pointY - startY) * segmentY) / segmentLengthSq;
  const clampedProjection = clamp(projection, 0, 1);
  const closestX = startX + segmentX * clampedProjection;
  const closestY = startY + segmentY * clampedProjection;
  return Math.hypot(pointX - closestX, pointY - closestY);
}

function getDeleteModeStrokeIdAtClient(clientX, clientY) {
  const worldPoint = screenToWorldFromClient(clientX, clientY);
  if (!worldPoint || !Number.isFinite(worldPoint.x) || !Number.isFinite(worldPoint.y)) {
    return '';
  }
  let closestStrokeId = '';
  let closestDistance = Infinity;
  const toleranceWorld = Math.max(DRAW_STROKE_WORLD_WIDTH * 0.8, 14 / Math.max(camera.scale, 0.001));
  for (const [strokeId, strokeState] of drawingStrokes.entries()) {
    const points = Array.isArray(strokeState?.points) ? strokeState.points : [];
    if (points.length === 0) {
      continue;
    }
    let strokeDistance = Infinity;
    if (points.length === 1) {
      strokeDistance = Math.hypot(worldPoint.x - points[0].x, worldPoint.y - points[0].y);
    } else {
      for (let index = 1; index < points.length; index += 1) {
        const startPoint = points[index - 1];
        const endPoint = points[index];
        if (!startPoint || !endPoint) {
          continue;
        }
        const distance = getDistancePointToSegment(
          worldPoint.x,
          worldPoint.y,
          Number(startPoint.x) || 0,
          Number(startPoint.y) || 0,
          Number(endPoint.x) || 0,
          Number(endPoint.y) || 0
        );
        if (distance < strokeDistance) {
          strokeDistance = distance;
        }
        if (strokeDistance <= toleranceWorld * 0.55) {
          break;
        }
      }
    }
    if (strokeDistance > toleranceWorld) {
      continue;
    }
    if (strokeDistance < closestDistance) {
      closestDistance = strokeDistance;
      closestStrokeId = strokeId;
    }
  }
  return closestStrokeId;
}

  tableRoot.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  tableRoot.addEventListener(
    'wheel',
    (event) => {
      if (shouldIgnorePointerEvent(event) && !isEventOnMonsBoardUi(event)) {
        return;
      }
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      setZoomAtClient(event.clientX, event.clientY, camera.scale * factor);
    },
    { passive: false }
  );

  tableRoot.addEventListener('pointerdown', (event) => {
    if (labelEditState) {
      const targetElement = event.target instanceof Element ? event.target : null;
      if (!targetElement?.closest('.table-label-editor')) {
        closeLabelEditor({ commit: true });
      }
    }
    if (drawModeEnabled) {
      if (shouldIgnorePointerEventInDrawMode(event)) {
        return;
      }
      if (event.pointerType === 'mouse') {
        updateLocalMouseCursor(event.clientX, event.clientY);
        if (event.button === 1 || event.button === 2) {
          event.preventDefault();
          activePointers.add(event.pointerId);
          tableRoot.setPointerCapture?.(event.pointerId);
          mousePanState = {
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startPanX: camera.panX,
            startPanY: camera.panY,
            buttonMask: event.button === 1 ? 4 : 2,
            moved: false
          };
          return;
        }
        if (event.button !== 0) {
          return;
        }
      } else {
        hideLocalDrawCursor();
      }
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        endedTouchPointerIds.delete(event.pointerId);
      }
      activePointers.add(event.pointerId);
      tableRoot.setPointerCapture?.(event.pointerId);
      const startedDrawing =
        activeDrawTool === DRAW_TOOL_FREE ? beginDrawingStroke(event) : beginShapeDrawing(event);
      if (startedDrawing) {
        event.preventDefault();
        schedulePublishFromEvent(event);
      }
      return;
    }

    const isMiddleMouseDown = event.pointerType === 'mouse' && event.button === 1;
    if (shouldIgnorePointerEvent(event) && !isMiddleMouseDown) {
      return;
    }

    activePointers.add(event.pointerId);
    tableRoot.setPointerCapture?.(event.pointerId);

    if (deleteModeEnabled && event.button === 0) {
      const clickedStrokeId = getDeleteModeStrokeIdAtClient(event.clientX, event.clientY);
      if (clickedStrokeId) {
        event.preventDefault();
        deleteDrawingStrokeInRemoveMode(clickedStrokeId).catch((error) => {
          console.error(error);
          setRealtimeStatus('firebase: write blocked');
        });
        schedulePublishFromEvent(event);
        return;
      }
    }

    if (event.pointerType === 'mouse') {
      if (event.button === 2) {
        event.preventDefault();
        if (deleteModeEnabled) {
          return;
        }
        if (cardDragState || cardResizeState || groupDragState) {
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

      if (event.button === 0 && hasAnyGroupSelection() && !isEventOnCard(event)) {
        event.preventDefault();
        releaseAllSelectedObjects();
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
      updateLocalMouseCursor(event.clientX, event.clientY);
      updateHandHoverFromClient(event.clientX, event.clientY, event.pointerType);
    } else if (drawModeEnabled) {
      hideLocalDrawCursor();
    }

    if (drawModeEnabled) {
      if (
        event.pointerType === 'mouse' &&
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
        event.preventDefault();
        return;
      }
      const updatedDrawing =
        activeDrawTool === DRAW_TOOL_FREE ? updateDrawingStroke(event) : updateShapeDrawing(event);
      if (updatedDrawing) {
        event.preventDefault();
      }
      if (event.pointerType === 'mouse' || activePointers.has(event.pointerId)) {
        schedulePublishFromEvent(event);
      }
      return;
    }

    const isActiveMiddleMousePan =
      event.pointerType === 'mouse' &&
      Boolean(mousePanState) &&
      mousePanState.pointerId === event.pointerId &&
      (mousePanState.buttonMask || 0) === 4 &&
      (event.buttons & 4) !== 0;
    if (shouldIgnorePointerEvent(event) && !isActiveMiddleMousePan) {
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
      const isMousePanEnding = event.pointerType === 'mouse' && mousePanState?.pointerId === event.pointerId;
      if (isMousePanEnding) {
        mousePanState = null;
      } else if (activeDrawTool === DRAW_TOOL_FREE) {
        finishDrawingStroke(event);
      } else {
        finishShapeDrawing(event);
      }
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
      isMouseInsideTable = false;
      hideLocalDrawCursor();
      setHoveredHandCard(null);
    }
  });

  localLockWatchdogIntervalId = window.setInterval(() => {
    releaseUnexpectedLocalCardLocks();
  }, 1200);
}
