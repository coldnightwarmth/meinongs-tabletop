const DEDICATED_ROOM_ROUTES = Object.freeze({
  swagstudio: 'swagstudio/'
});

const SWAG_STUDIO_SHORTCUT_KEYS = Object.freeze(['l', 'e', 't', 'm', 'i', 'n']);

function normalizeRoomId(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePathToAppBase(pathname = window.location.pathname) {
  let basePath = String(pathname || '');
  const lowerPath = basePath.toLowerCase();
  if (lowerPath.endsWith('/table.html')) {
    basePath = basePath.slice(0, -'/table.html'.length);
  } else if (lowerPath.endsWith('/index.html')) {
    basePath = basePath.slice(0, -'/index.html'.length);
  } else {
    const trimmedPath = basePath.replace(/\/+$/, '');
    const segments = trimmedPath.split('/');
    const lastSegment = segments[segments.length - 1] || '';
    if (lastSegment && !lastSegment.includes('.')) {
      segments.pop();
      basePath = segments.join('/');
    } else {
      basePath = trimmedPath || basePath;
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

function normalizeShortcutKey(value) {
  return String(value || '').trim().toLowerCase();
}

export function buildDedicatedRoomUrl(roomId, options = {}) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const route = DEDICATED_ROOM_ROUTES[normalizedRoomId];
  if (!route) {
    return null;
  }
  const origin = options.origin || window.location.origin;
  const pathname = options.pathname || window.location.pathname;
  return new URL(`${normalizePathToAppBase(pathname)}${route}`, origin);
}

export function installSwagStudioShortcut(options = {}) {
  const targetRoomId = normalizeRoomId(options.roomId || 'swagstudio') || 'swagstudio';
  const requiredKeys = new Set(
    (Array.isArray(options.keys) ? options.keys : SWAG_STUDIO_SHORTCUT_KEYS)
      .map(normalizeShortcutKey)
      .filter(Boolean)
  );
  if (!requiredKeys.size) {
    return () => {};
  }

  const pressedKeys = new Set();
  let isTriggered = false;

  function resetPressedKeys() {
    pressedKeys.clear();
    isTriggered = false;
  }

  function maybeTriggerShortcut() {
    if (isTriggered) {
      return;
    }
    for (const key of requiredKeys) {
      if (!pressedKeys.has(key)) {
        return;
      }
    }
    const targetUrl = buildDedicatedRoomUrl(targetRoomId);
    if (!targetUrl) {
      return;
    }
    const currentUrl = new URL(window.location.href);
    currentUrl.hash = '';
    currentUrl.search = '';
    if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
      isTriggered = true;
      return;
    }
    isTriggered = true;
    window.location.href = targetUrl.toString();
  }

  function handleKeyDown(event) {
    const key = normalizeShortcutKey(event.key);
    if (!requiredKeys.has(key)) {
      return;
    }
    pressedKeys.add(key);
    maybeTriggerShortcut();
  }

  function handleKeyUp(event) {
    const key = normalizeShortcutKey(event.key);
    if (!requiredKeys.has(key)) {
      return;
    }
    pressedKeys.delete(key);
    if (!pressedKeys.size) {
      isTriggered = false;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      resetPressedKeys();
    }
  }

  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp, true);
  window.addEventListener('blur', resetPressedKeys);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('keyup', handleKeyUp, true);
    window.removeEventListener('blur', resetPressedKeys);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
