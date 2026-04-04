#!/usr/bin/env node

const DATABASE_URL = 'https://meinongs-tabletop-default-rtdb.firebaseio.com';
const ROOM_ROOT = 'rooms';
const GLOBAL_ROOM_ID = '__global';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const daysArg = process.argv.slice(2).find((arg) => arg.startsWith('--days='));
const inactiveDays = Number.isFinite(Number(daysArg?.split('=')[1]))
  ? Math.max(1, Math.floor(Number(daysArg.split('=')[1])))
  : 7;

const now = Date.now();
const cutoff = now - inactiveDays * 24 * 60 * 60 * 1000;

function toTimestamp(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function deriveLastActiveAt(meta) {
  if (!meta || typeof meta !== 'object') {
    return 0;
  }
  return Math.max(
    toTimestamp(meta.lastActiveAt),
    toTimestamp(meta.updatedAt),
    toTimestamp(meta.createdAt)
  );
}

async function fetchJson(path) {
  const [basePath, query = ''] = String(path || '').split('?');
  const normalizedBasePath = basePath.replace(/^\//, '');
  const url = `${DATABASE_URL}/${normalizedBasePath}.json${query ? `?${query}` : ''}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`GET ${path}.json failed (${response.status}): ${JSON.stringify(data)}`);
  }
  if (data && typeof data === 'object' && typeof data.error === 'string') {
    throw new Error(`GET ${path}.json error: ${data.error}`);
  }
  return data;
}

async function deletePath(path) {
  const normalizedPath = String(path || '').replace(/^\//, '');
  const url = `${DATABASE_URL}/${normalizedPath}.json`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.text().catch(() => '');
  if (!response.ok) {
    throw new Error(`DELETE ${path}.json failed (${response.status}): ${data}`);
  }
}

async function main() {
  console.log(`Scanning rooms inactive for > ${inactiveDays} days...`);
  let roomKeys;
  try {
    roomKeys = await fetchJson(`${ROOM_ROOT}?shallow=true`);
  } catch (error) {
    console.error('Unable to list rooms. This is usually a Realtime Database rules permission issue.');
    console.error(String(error?.message || error));
    process.exit(1);
  }

  const ids = Object.keys(roomKeys || {}).filter((id) => id && id !== GLOBAL_ROOM_ID);
  console.log(`Found ${ids.length} rooms (excluding ${GLOBAL_ROOM_ID}).`);

  const candidates = [];
  for (const roomId of ids) {
    try {
      const meta = await fetchJson(`${ROOM_ROOT}/${encodeURIComponent(roomId)}/meta`);
      const lastActiveAt = deriveLastActiveAt(meta);
      if (lastActiveAt > 0 && lastActiveAt < cutoff) {
        candidates.push({ roomId, lastActiveAt });
      }
    } catch (error) {
      console.warn(`Skipping ${roomId}: ${String(error?.message || error)}`);
    }
  }

  candidates.sort((a, b) => a.lastActiveAt - b.lastActiveAt);
  console.log(`Inactive room candidates: ${candidates.length}`);

  if (candidates.length === 0) {
    console.log('No rooms to delete.');
    return;
  }

  for (const candidate of candidates) {
    console.log(`- ${candidate.roomId} (lastActiveAt=${new Date(candidate.lastActiveAt).toISOString()})`);
  }

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to delete these rooms.');
    return;
  }

  let deleted = 0;
  for (const candidate of candidates) {
    try {
      await deletePath(`${ROOM_ROOT}/${encodeURIComponent(candidate.roomId)}`);
      deleted += 1;
      console.log(`Deleted ${candidate.roomId}`);
    } catch (error) {
      console.error(`Failed deleting ${candidate.roomId}: ${String(error?.message || error)}`);
    }
  }

  console.log(`Done. Deleted ${deleted}/${candidates.length} rooms.`);
}

main().catch((error) => {
  console.error(String(error?.message || error));
  process.exit(1);
});
