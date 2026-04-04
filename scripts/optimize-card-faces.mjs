#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

const JOBS = [
  {
    dir: 'assets/cards',
    inputExt: '.png',
    outputExt: '.webp',
    resize: { height: 1400, withoutEnlargement: true },
    encode: { quality: 82, effort: 6 }
  },
  {
    dir: 'assets/cards-low',
    inputExt: '.png',
    outputExt: '.webp',
    resize: { height: 448, withoutEnlargement: true },
    encode: { quality: 76, effort: 6 }
  },
  {
    dir: 'assets/codegame',
    inputExt: '.jpg',
    outputExt: '.webp',
    resize: { width: 384, height: 384, fit: 'inside', withoutEnlargement: true },
    encode: { quality: 78, effort: 6 }
  }
];

async function listFiles(dir, ext) {
  const fullDir = path.join(ROOT, dir);
  const entries = await fs.readdir(fullDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(ext))
    .map((entry) => path.join(fullDir, entry.name))
    .sort();
}

async function convertFile(sourcePath, outputExt, resize, encode) {
  const parsed = path.parse(sourcePath);
  const targetPath = path.join(parsed.dir, `${parsed.name}${outputExt}`);
  await sharp(sourcePath)
    .resize(resize)
    .webp(encode)
    .toFile(targetPath);
  return targetPath;
}

async function removeByExt(dir, ext) {
  const files = await listFiles(dir, ext);
  await Promise.all(files.map((filePath) => fs.unlink(filePath)));
  return files.length;
}

async function bytesForDir(dir) {
  const fullDir = path.join(ROOT, dir);
  const entries = await fs.readdir(fullDir, { withFileTypes: true });
  let total = 0;
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    const stat = await fs.stat(path.join(fullDir, entry.name));
    total += stat.size;
  }
  return total;
}

function formatMiB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

async function run() {
  const beforeTotals = new Map();
  for (const job of JOBS) {
    beforeTotals.set(job.dir, await bytesForDir(job.dir));
  }

  for (const job of JOBS) {
    const sourceFiles = await listFiles(job.dir, job.inputExt);
    for (const sourcePath of sourceFiles) {
      await convertFile(sourcePath, job.outputExt, job.resize, job.encode);
    }
    await removeByExt(job.dir, job.inputExt);
  }

  for (const job of JOBS) {
    const afterTotal = await bytesForDir(job.dir);
    const beforeTotal = beforeTotals.get(job.dir) || 0;
    const delta = beforeTotal - afterTotal;
    const ratio = beforeTotal > 0 ? (afterTotal / beforeTotal) * 100 : 0;
    console.log(`${job.dir}: ${formatMiB(beforeTotal)} -> ${formatMiB(afterTotal)} (-${formatMiB(delta)}, ${ratio.toFixed(1)}% of original)`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
