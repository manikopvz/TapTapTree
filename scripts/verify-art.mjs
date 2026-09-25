import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'assets'];
const forbiddenFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name.toLowerCase().endsWith('.' + 'svg')) forbiddenFiles.push(filePath);
  }
}

for (const root of roots) if (fs.existsSync(root)) walk(root);
if (forbiddenFiles.length) {
  console.error('Forbidden vector files:', forbiddenFiles);
  process.exit(1);
}

const required = [
  ...['sky','mountains','islands','lake','forest','foreground'].map(x => `assets/images/backgrounds/${x}.webp`),
  ...['young','apple','mature','ancient','mystic','cosmic','reality'].map(x => `assets/images/trees/${x}.webp`),
  ...['apple','golden_apple','basket'].map(x => `assets/images/items/${x}.webp`),
  ...['grass','rock','stage_sign'].map(x => `assets/images/environment/${x}.webp`),
  ...['leaf','spark','gold_swirl','blue_swirl','glow','magic_glow'].map(x => `assets/images/fx/${x}.webp`),
  ...['tap','faster','critical','echo','rain','gold','frenzy'].map(x => `assets/images/icons/upgrades/${x}.webp`),
  ...['roots','trunk','branch','leaves','lucky','fruit','growth','abundance','rain'].map(x => `assets/images/icons/skills/${x}.webp`),
  ...['first_apple','crown','sun','star','tree_master','crystal','purple_star','diamond','mystery'].map(x => `assets/images/icons/achievements/${x}.webp`),
  ...['title_panel','large_panel','button_gold','button_selected','progress_orange','slot'].map(x => `assets/images/ui/${x}.webp`),
  'assets/images/manifest.json',
];

const missing = required.filter(file => !fs.existsSync(file));
if (missing.length) {
  console.error('Missing required raster assets:', missing);
  process.exit(1);
}

const webpFiles = [];
function collectWebp(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const p = path.join(directory, entry.name);
    if (entry.isDirectory()) collectWebp(p);
    else if (/\.webp$/i.test(entry.name)) webpFiles.push(p);
  }
}
collectWebp('assets/images');
if (webpFiles.length < 50) {
  console.error(`Incomplete art set: expected at least 50 WebP files, found ${webpFiles.length}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('assets/images/manifest.json', 'utf8'));
if (manifest.svgAllowed !== false) {
  console.error('Manifest raster policy is invalid.');
  process.exit(1);
}

const sourceFiles = [];
function collectSource(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const p = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSource(p);
    else if (/\.(js|mjs|css|html)$/i.test(entry.name)) sourceFiles.push(p);
  }
}
collectSource('src');
for (const extra of ['app.html']) if (fs.existsSync(extra)) sourceFiles.push(extra);
const vectorTag = '<' + 'svg';
const dataVector = 'data:image/' + 'svg';
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8').toLowerCase();
  if (text.includes(vectorTag) || text.includes(dataVector)) {
    console.error('Forbidden embedded vector markup in:', file);
    process.exit(1);
  }
}

console.log(`Raster art verification passed: ${webpFiles.length} WebP files, all required categories present.`);
