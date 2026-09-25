import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'assets'];
const prohibited = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
    } else if (/\.svg$/i.test(entry.name)) {
      prohibited.push(filePath);
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}

if (prohibited.length > 0) {
  console.error('SVG prohibited:', prohibited);
  process.exit(1);
}

const requiredRasterAssets = [
  'assets/images/apple.webp',
  'assets/images/golden-apple.webp',
  'assets/images/leaf.webp',
];

for (const filePath of requiredRasterAssets) {
  if (!fs.existsSync(filePath)) {
    console.error('Missing raster asset:', filePath);
    process.exit(1);
  }
}

console.log('Raster art verification passed. No SVG files found.');
