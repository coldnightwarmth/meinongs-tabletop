const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:4273';
const DATABASE_URL = 'https://meinongs-tabletop-default-rtdb.firebaseio.com';
const HAND_RECLAIM_TIMEOUT_MS = 2 * 60 * 1000;

async function setPlayerName(page, name) {
  await page.click('#nameToggleButton');
  await page.fill('#nameInput', name);
  await page.keyboard.press('Enter');
  await expect.poll(async () => {
    const text = await page.locator('#nameToggleButton').textContent();
    return String(text || '').trim().toLowerCase();
  }).toBe(name.toLowerCase());
}

async function openAndSpawnDeck(page) {
  await page.click('#assetMenuButton');
  await page.click('#coolJpegsTile');
  await expect(page.locator('.table-card')).toHaveCount(75, { timeout: 45000 });
  await expect.poll(async () => {
    const text = await page.locator('.deck-count-badge').textContent();
    return String(text || '').trim();
  }, { timeout: 15000 }).toBe('75');
}

async function dragTopCardToHand(page) {
  const dragStart = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.table-card'));
    if (!cards.length) {
      return null;
    }

    let topCard = cards[0];
    let topZ = Number(topCard.style.zIndex || 0);
    for (const card of cards) {
      const z = Number(card.style.zIndex || 0);
      if (z >= topZ) {
        topCard = card;
        topZ = z;
      }
    }

    const rect = topCard.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      viewportBottom: window.innerHeight - 4
    };
  });

  expect(dragStart).toBeTruthy();

  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragStart.x, dragStart.viewportBottom, { steps: 24 });
  await page.mouse.up();
}

async function getRosterRowFor(page, targetName) {
  return page.evaluate((name) => {
    const rows = Array.from(document.querySelectorAll('.room-roster-item'));
    const normalized = String(name || '').trim().toLowerCase();
    for (const row of rows) {
      const nameText = String(row.querySelector('.room-roster-name')?.textContent || '').trim().toLowerCase();
      if (nameText === normalized) {
        return {
          count: String(row.querySelector('.room-roster-count')?.textContent || '').trim(),
          firstClass: row.firstElementChild?.className || ''
        };
      }
    }
    return null;
  }, targetName);
}

test('hand counts and stale-player reclaim to deck', async ({ browser }) => {
  const roomId = `e2e-hand-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const roomUrl = `${BASE_URL}/table.html?room=${encodeURIComponent(roomId)}`;

  const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const ctxB = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await pageA.goto(roomUrl, { waitUntil: 'domcontentloaded' });
  await pageB.goto(roomUrl, { waitUntil: 'domcontentloaded' });

  await setPlayerName(pageA, 'alice');
  await setPlayerName(pageB, 'bob');

  const localCountIsFirst = await pageA.evaluate(
    () => document.querySelector('.player-main-row')?.firstElementChild?.id || null
  );
  expect(localCountIsFirst).toBe('playerHandCount');

  await openAndSpawnDeck(pageA);

  await dragTopCardToHand(pageA);

  await expect.poll(async () => {
    const value = await pageA.locator('#playerHandCount').textContent();
    return String(value || '').trim();
  }, { timeout: 20000 }).toBe('1');

  await expect.poll(async () => {
    const value = await pageB.locator('.deck-count-badge').textContent();
    return String(value || '').trim();
  }, { timeout: 20000 }).toBe('74');

  const rosterBefore = await expect
    .poll(async () => getRosterRowFor(pageB, 'alice'), { timeout: 20000 })
    .not.toBeNull();

  const aliceRow = await getRosterRowFor(pageB, 'alice');
  expect(aliceRow).toBeTruthy();
  expect(aliceRow.firstClass).toContain('room-roster-count');
  expect(aliceRow.count).toBe('1');

  const playerToken = await pageA.evaluate(() => localStorage.getItem('tabletop-player-token'));
  expect(playerToken).toBeTruthy();

  await ctxA.close();

  const staleTimestamp = Date.now() - HAND_RECLAIM_TIMEOUT_MS - 10000;
  const patchResponse = await fetch(
    `${DATABASE_URL}/rooms/${encodeURIComponent(roomId)}/presence/${encodeURIComponent(playerToken)}.json`,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        connected: false,
        clientId: null,
        lastSeen: staleTimestamp,
        updatedAt: staleTimestamp
      })
    }
  );

  expect(patchResponse.ok).toBeTruthy();

  await expect.poll(async () => {
    const value = await pageB.locator('.deck-count-badge').textContent();
    return String(value || '').trim();
  }, { timeout: 45000 }).toBe('75');

  const cardsResponse = await fetch(`${DATABASE_URL}/rooms/${encodeURIComponent(roomId)}/cards.json`);
  expect(cardsResponse.ok).toBeTruthy();
  const cards = (await cardsResponse.json()) || {};
  const allCards = Object.values(cards);

  expect(allCards).toHaveLength(75);
  const inDeckCount = allCards.filter((card) => card && card.inDeck === true).length;
  expect(inDeckCount).toBe(75);

  const lingeringHandOwners = allCards.filter(
    (card) => card && (card.handOwnerPlayerToken || card.handOwnerClientId)
  ).length;
  expect(lingeringHandOwners).toBe(0);

  await ctxB.close();
}, 90000);
