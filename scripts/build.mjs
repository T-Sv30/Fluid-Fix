// Copies the web app into dist/, the folder the Android shell packages.
// The site itself needs no build: GitHub Pages serves these same files from the repo root.

import { cpSync, mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

// Everything the running app loads. Add new files here and to SHELL in sw.js.
const FILES = [
    'index.html',
    'ui.css',
    'native.js',
    'ui.js',
    'script.js',
    'LDR_LLL1_0.png',
    'manifest.webmanifest',
    'privacy.html',
    'page.css',
    'LICENSE',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/maskable-512.png',
];

const fail = message => { console.error('Build failed: ' + message); process.exit(1); };

const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const script = readFileSync(join(ROOT, 'script.js'), 'utf8');
if (!script.includes(`const APP_VERSION = '${version}';`))
    fail(`script.js APP_VERSION does not match package.json (${version}).`);
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
(html.match(/\?v=[\w.-]+/g) || []).forEach(stamp => {
    if (stamp !== '?v=' + version) fail(`index.html has ${stamp} but package.json is ${version}.`);
});
// Every local file index.html loads must be in the list above
(html.match(/(?:src|href)="([^"]+)"/g) || []).forEach(attr => {
    const file = attr.replace(/^(?:src|href)="/, '').replace(/"$/, '').split('?')[0];
    if (/^(https?:|data:|#)/.test(file) || file === 'screenshot.jpg') return;
    if (!FILES.includes(file)) fail(`index.html loads ${file}, which is missing from FILES in scripts/build.mjs.`);
});

rmSync(DIST, { recursive: true, force: true });
FILES.forEach(file => {
    const from = join(ROOT, file);
    if (!existsSync(from)) fail(`${file} does not exist.`);
    mkdirSync(dirname(join(DIST, file)), { recursive: true });
    cpSync(from, join(DIST, file));
});
console.log(`Built RIPPL Studio ${version}: ${FILES.length} files in dist/`);
