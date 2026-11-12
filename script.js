/*
MIT License

Copyright (c) 2017 Pavel Dobryakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

// Simulation section

const canvas = document.getElementsByTagName('canvas')[0];
resizeCanvas();

let config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 1,
    VELOCITY_DISSIPATION: 0.2,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 30,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: false,
    BLOOM: true,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
    SPEED: 1.0,
    INTENSITY: 1.0,
    PALETTE: 'Classic',
    AUTO_TRANSITION: false,
    TRANSITION_TIME: 10,
    BACKGROUND: 'Black',
    RAINBOW: false,
    RAINBOW_SPEED: 0.12,
    BLACKLIGHT: false,
    TRAILS: false,
    RANDOM_INJECTION: false,
    AUTOPLAY: false,
    VORTEX: false,
    MIRROR: false,
    KALEIDOSCOPE: false,
    KALEIDO_SEGMENTS: 6,
    // Stage 1 (0-100 percentages unless noted)
    PRESSURE_LEVEL: 'Norm',
    VISCOSITY: 0,
    GRAVITY: 0,
    TURBULENCE: 0,
    FLOW_STRENGTH: 50,
    SWIRL: 0,
    BUOYANCY: 50,
    ELASTICITY: 0,
    FLOW_DIRECTION: 'None',
    FLOW_SPEED: 30,
    RANDOMNESS: 0,
    EDGE: 'Wall',
    REPEL_STRENGTH: 50,
    REPEL_DISTANCE: 15,
    EDGE_FRICTION: 0,
    EDGE_BOUNCE: 0,
    EDGE_SOFTNESS: 50,
    CORNER: 'Normal',
}


// Fluid Fix features: palettes, backgrounds, modes and emitters

const PALETTES = {
    'Classic': null, // full spectrum
    'Sunset':  ['#ff5e62', '#ff9966', '#ffcc33', '#e8366f', '#8e2de2'],
    'Ocean':   ['#00c6ff', '#0072ff', '#00e5c0', '#1de9b6', '#3d5afe'],
    'Aurora':  ['#00ff87', '#60efff', '#0061ff', '#a855f7', '#22d3ee'],
    'Fire':    ['#ff2a00', '#ff7b00', '#ffb700', '#ff0040', '#ffd000'],
    'Neon':    ['#ff00e6', '#00fff0', '#fffb00', '#7c00ff', '#00ff6a'],
    'Candy':   ['#ff6ec7', '#ffb3de', '#a0e7ff', '#c3a6ff', '#ff9a8b'],
    'Forest':  ['#2ecc71', '#a8e063', '#00b894', '#f9d423', '#56ab2f'],
    'Galaxy':  ['#6a00f4', '#b100e8', '#3d5afe', '#ff4ecd', '#00b4ff'],
    'Ice':     ['#c9f2ff', '#7fdbff', '#39cccc', '#8ab6ff', '#5e60ce'],
    'Gold':    ['#ffd700', '#ffb300', '#ff8f00', '#fff1a8', '#c77d00'],
};
const PALETTE_NAMES = Object.keys(PALETTES);

// top, bottom, glow (glow is added as a soft radial light in the middle)
const BACKGROUNDS = {
    'Black':      ['#000000', '#000000', '#000000'],
    'Midnight':   ['#0b1026', '#000000', '#0a1a40'],
    'Nebula':     ['#1a0533', '#05010d', '#3b0a5e'],
    'Deep Ocean': ['#002233', '#000814', '#003b5c'],
    'Ember':      ['#1f0500', '#000000', '#3d0c00'],
    'Forest':     ['#04170f', '#000604', '#0b2e1c'],
    'Charcoal':   ['#2b2b2e', '#121214', '#000000'],
    'Paper':      ['#f5f2ea', '#e4ded0', '#000000'],
    'Custom':     null, // uses BACK_COLOR
};
const BACKGROUND_NAMES = Object.keys(BACKGROUNDS);

function hexToRGB (hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

const PALETTE_RGB = {};
PALETTE_NAMES.forEach(name => {
    PALETTE_RGB[name] = PALETTES[name] ? PALETTES[name].map(hexToRGB) : null;
});

function lerpColor (a, b, t) {
    return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

function frac (u) {
    return u - Math.floor(u);
}

function smooth01 (t) {
    t = Math.min(Math.max(t, 0), 1);
    return t * t * (3 - 2 * t);
}

// Color along a palette, treated as a looping gradient (u in [0, 1))
function paletteColor (name, u) {
    u = frac(u);
    const colors = PALETTE_RGB[name];
    if (!colors) return HSVtoRGB(u, 1.0, 1.0);
    const f = u * colors.length;
    const i = Math.floor(f) % colors.length;
    const j = (i + 1) % colors.length;
    return lerpColor(colors[i], colors[j], smooth01(f - Math.floor(f)));
}

// Palette crossfade state
let paletteFrom = config.PALETTE;
let paletteTo = config.PALETTE;
let paletteMix = 1;
let paletteFadeTime = 1.2;
let paletteHold = 0;

function setPalette (name, fadeSeconds) {
    if (!PALETTES.hasOwnProperty(name)) return;
    paletteFrom = paletteMix < 0.5 ? paletteFrom : paletteTo;
    paletteTo = name;
    paletteMix = 0;
    paletteFadeTime = Math.max(0.05, fadeSeconds);
    paletteHold = 0;
    config.PALETTE = name;
}

function nextPaletteName () {
    const i = PALETTE_NAMES.indexOf(paletteTo);
    return PALETTE_NAMES[(i + 1) % PALETTE_NAMES.length];
}

function updatePalette (dt) {
    if (paletteMix < 1)
        paletteMix = Math.min(1, paletteMix + dt / paletteFadeTime);

    if (config.AUTO_TRANSITION && !config.PAUSED) {
        paletteHold += dt;
        if (paletteHold >= config.TRANSITION_TIME) {
            const next = nextPaletteName();
            setPalette(next, Math.min(4, config.TRANSITION_TIME * 0.5));
            showToast('Palette · ' + next);
        }
    }
}

function samplePalette (u) {
    const to = paletteColor(paletteTo, u);
    if (paletteMix >= 1) return to;
    return lerpColor(paletteColor(paletteFrom, u), to, smooth01(paletteMix));
}

// Blacklight: push every color to full saturation and extra brightness
function neonize (c) {
    const mx = Math.max(c.r, c.g, c.b);
    const mn = Math.min(c.r, c.g, c.b);
    if (mx - mn < 1e-4) return { r: c.r * 1.6, g: c.g * 1.6, b: c.b * 1.6 };
    const k = 1.0 / (mx - mn);
    return { r: (c.r - mn) * k * 1.6, g: (c.g - mn) * k * 1.6, b: (c.b - mn) * k * 1.6 };
}

function finishColor (c) {
    if (config.BLACKLIGHT) c = neonize(c);
    return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
}

let rainbowHue = Math.random();

// Color for emitters: u picks a spot on the palette (or rainbow wheel)
function colorAt (u) {
    if (config.RAINBOW) return finishColor(HSVtoRGB(frac(rainbowHue + u), 1.0, 1.0));
    return finishColor(samplePalette(u));
}

// Symmetry: Mirror reflects left/right, Kaleidoscope makes N rotated + reflected copies
function symmetryCopies (x, y, dx, dy) {
    if (config.KALEIDOSCOPE) {
        const n = Math.max(2, Math.round(config.KALEIDO_SEGMENTS));
        const ar = canvas.width / canvas.height;
        const px = (x - 0.5) * ar;
        const py = y - 0.5;
        const out = [];
        for (let k = 0; k < n; k++) {
            const a = (Math.PI * 2 * k) / n;
            const c = Math.cos(a), s = Math.sin(a);
            out.push([(px * c - py * s) / ar + 0.5, px * s + py * c + 0.5, dx * c - dy * s, dx * s + dy * c]);
            // reflected copy
            out.push([(-px * c - py * s) / ar + 0.5, -px * s + py * c + 0.5, -dx * c - dy * s, -dx * s + dy * c]);
        }
        return dedupeCopies(out);
    }
    if (config.MIRROR)
        return dedupeCopies([[x, y, dx, dy], [1 - x, y, -dx, dy]]);
    return [[x, y, dx, dy]];
}

// Drop copies that land on the same spot moving the same way (they would only double the brightness)
function dedupeCopies (copies) {
    const out = [];
    for (const c of copies) {
        const dup = out.some(o =>
            Math.abs(o[0] - c[0]) < 1e-3 && Math.abs(o[1] - c[1]) < 1e-3 &&
            Math.abs(o[2] - c[2]) <= 1e-3 * (1 + Math.abs(c[2])) && Math.abs(o[3] - c[3]) <= 1e-3 * (1 + Math.abs(c[3])));
        if (!dup) out.push(c);
    }
    return out;
}

function emitSplat (x, y, dx, dy, color, dyeScale) {
    const k = dyeScale == null ? 1 : dyeScale;
    const r = config.RANDOMNESS / 100;
    if (r > 0) {
        const jitter = (Math.abs(dx) + Math.abs(dy) + 100) * r * 0.6;
        dx += (Math.random() - 0.5) * 2 * jitter;
        dy += (Math.random() - 0.5) * 2 * jitter;
    }
    const c = { r: color.r * k, g: color.g * k, b: color.b * k };
    symmetryCopies(x, y, dx, dy).forEach(s => splat(s[0], s[1], s[2], s[3], c));
}

// Auto-play: three wandering streams on slow, never-repeating paths
const autoplay = { t: Math.random() * 100, prev: [], burst: 2.5 };

function updateAutoplay (dt) {
    if (!config.AUTOPLAY || config.PAUSED) { autoplay.prev.length = 0; return; }
    autoplay.t += dt * config.SPEED;
    const t = autoplay.t;
    const force = config.SPLAT_FORCE * config.INTENSITY * 3.0;

    for (let k = 0; k < 3; k++) {
        const s = k * 2.17 + 0.5;
        const x = 0.5 + 0.34 * Math.sin(t * (0.53 + 0.11 * k) + s) * Math.cos(t * (0.21 + 0.05 * k) + s * 1.7)
                      + 0.1 * Math.sin(t * (1.13 + 0.17 * k) + s * 3.1);
        const y = 0.5 + 0.34 * Math.sin(t * (0.41 + 0.07 * k) + s * 2.3) * Math.cos(t * (0.17 + 0.04 * k) + s * 0.9)
                      + 0.1 * Math.cos(t * (0.97 + 0.13 * k) + s * 1.3);
        const prev = autoplay.prev[k];
        autoplay.prev[k] = { x, y };
        if (!prev) continue;
        const dx = correctDeltaX(x - prev.x) * force;
        const dy = correctDeltaY(y - prev.y) * force;
        emitSplat(x, y, dx, dy, colorAt(k / 3 + t * 0.04), 0.7);
    }

    autoplay.burst -= dt * config.SPEED;
    if (autoplay.burst <= 0) {
        autoplay.burst = 3 + Math.random() * 4;
        const color = colorAt(Math.random());
        const a = Math.random() * Math.PI * 2;
        const v = 900 * config.INTENSITY;
        emitSplat(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.7, Math.cos(a) * v, Math.sin(a) * v, color, 8);
    }
}

// Vortex: arms orbiting the center, stirring a continuous whirlpool
const vortex = { t: 0, prev: [] };

function updateVortex (dt) {
    if (!config.VORTEX || config.PAUSED) { vortex.prev.length = 0; return; }
    vortex.t += dt * config.SPEED;
    const t = vortex.t;
    const ar = canvas.width / canvas.height;
    const mind = Math.min(ar, 1);
    const arms = 3;
    const rad = (0.2 + 0.07 * Math.sin(t * 0.6)) * mind;
    const force = config.SPLAT_FORCE * config.INTENSITY * 2.5;

    for (let k = 0; k < arms; k++) {
        const a = t * 1.6 + (Math.PI * 2 * k) / arms;
        const x = (rad * Math.cos(a)) / ar + 0.5;
        const y = rad * Math.sin(a) + 0.5;
        const prev = vortex.prev[k];
        vortex.prev[k] = { x, y };
        if (!prev) continue;
        const dx = correctDeltaX(x - prev.x) * force;
        const dy = correctDeltaY(y - prev.y) * force;
        emitSplat(x, y, dx, dy, colorAt(k / arms + t * 0.05), 0.7);
    }
}

// Random color injection: a burst of fresh, random colors at each new touch
let injectQueue = [];

function queueInjection (x, y) {
    if (config.RANDOM_INJECTION) injectQueue.push({ x, y });
}

function applyInjections () {
    while (injectQueue.length > 0) {
        const p = injectQueue.shift();
        const count = 5;
        const ar = canvas.width / canvas.height;
        for (let i = 0; i < count; i++) {
            const a = (Math.PI * 2 * i) / count + Math.random() * 0.6;
            const r = 0.03;
            const color = finishColor(HSVtoRGB(Math.random(), 1.0, 1.0));
            const v = 450 * config.INTENSITY;
            emitSplat(p.x + (Math.cos(a) * r) / ar, p.y + Math.sin(a) * r,
                      Math.cos(a) * v, Math.sin(a) * v, color, 3);
        }
    }
}

// Background: crossfades smoothly between presets
const bgCurrent = { top: { r: 0, g: 0, b: 0 }, bottom: { r: 0, g: 0, b: 0 }, glow: { r: 0, g: 0, b: 0 } };
let bgInitialized = false;

function backgroundTarget () {
    const preset = BACKGROUNDS[config.BACKGROUND];
    let top, bottom, glow;
    if (preset) {
        top = hexToRGB(preset[0]);
        bottom = hexToRGB(preset[1]);
        glow = hexToRGB(preset[2]);
    } else {
        top = bottom = normalizeColor(config.BACK_COLOR);
        glow = { r: 0, g: 0, b: 0 };
    }
    if (config.BLACKLIGHT) {
        top = lerpColor(top, { r: 0.02, g: 0.0, b: 0.06 }, 0.6);
        bottom = lerpColor(bottom, { r: 0.0, g: 0.0, b: 0.02 }, 0.6);
        glow = { r: glow.r + 0.12, g: glow.g, b: glow.b + 0.28 };
    }
    return { top, bottom, glow };
}

function updateBackground (dt) {
    const target = backgroundTarget();
    const k = bgInitialized ? 1 - Math.exp(-dt * 5) : 1;
    bgInitialized = true;
    bgCurrent.top = lerpColor(bgCurrent.top, target.top, k);
    bgCurrent.bottom = lerpColor(bgCurrent.bottom, target.bottom, k);
    bgCurrent.glow = lerpColor(bgCurrent.glow, target.glow, k);
}

function pick (list) {
    return list[Math.floor(Math.random() * list.length)];
}

function rand (min, max) {
    return min + Math.random() * (max - min);
}

// Randomize: a fresh, good-looking configuration in one tap
function randomizeConfig () {
    const palette = pick(PALETTE_NAMES);
    const background = pick(['Black', 'Black', 'Midnight', 'Nebula', 'Deep Ocean', 'Ember', 'Forest', 'Charcoal']);
    setPalette(palette, 0.6);
    config.BACKGROUND = background;
    config.CURL = Math.round(rand(5, 45));
    config.SPLAT_RADIUS = rand(0.12, 0.5);
    config.DENSITY_DISSIPATION = rand(0.4, 1.8);
    config.VELOCITY_DISSIPATION = rand(0.1, 0.8);
    config.BLOOM_INTENSITY = rand(0.5, 1.3);
    config.BLOOM_THRESHOLD = rand(0.45, 0.75);
    config.SUNRAYS_WEIGHT = rand(0.5, 1.0);
    config.RAINBOW = Math.random() < 0.25;
    config.TRAILS = Math.random() < 0.3;
    config.BLACKLIGHT = Math.random() < 0.2;
    const sym = Math.random();
    config.MIRROR = sym >= 0.5 && sym < 0.75;
    config.KALEIDOSCOPE = sym >= 0.75;
    config.KALEIDO_SEGMENTS = Math.round(rand(3, 8));
    updateKeywords();
    refreshGUI();
    splatStack.push(Math.round(rand(8, 18)));

    let label = palette + ' · ' + background;
    if (config.KALEIDOSCOPE) label += ' · Kaleidoscope';
    else if (config.MIRROR) label += ' · Mirror';
    showToast(label);
}

function toggleFreeze () {
    config.PAUSED = !config.PAUSED;
    showToast(config.PAUSED ? 'Frozen' : 'Resumed');
}

function toggleMode (key, label) {
    config[key] = !config[key];
    if (key === 'MIRROR' && config.MIRROR) config.KALEIDOSCOPE = false;
    if (key === 'KALEIDOSCOPE' && config.KALEIDOSCOPE) config.MIRROR = false;
    if (key === 'BLACKLIGHT') updateKeywords();
    showToast(label + (config[key] ? ' on' : ' off'));
}

function cyclePalette () {
    const next = nextPaletteName();
    setPalette(next, 1.2);
    showToast('Palette · ' + next);
}

// GUI helpers

let guiRoot = null;

function refreshGUI (gui) {
    if (!gui) syncUI();
    gui = gui || guiRoot;
    if (!gui) return;
    gui.__controllers.forEach(c => c.updateDisplay());
    Object.keys(gui.__folders).forEach(k => refreshGUI(gui.__folders[k]));
}

let toastTimer = null;

function showToast (text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

const toolbarState = {};

function syncToolbar () {
    const set = (id, on) => {
        if (toolbarState[id] === on) return;
        toolbarState[id] = on;
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (id === 'tb-freeze') el.querySelector('.tb-label').textContent = on ? 'Resume' : 'Freeze';
    };
    set('tb-autoplay', !!config.AUTOPLAY);
    set('tb-vortex', !!config.VORTEX);
    set('tb-freeze', !!config.PAUSED);
}

function setupToolbar () {
    const on = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', e => { e.preventDefault(); fn(); refreshGUI(); });
    };
    on('tb-randomize', randomizeConfig);
    on('tb-palette', cyclePalette);
    on('tb-autoplay', () => toggleMode('AUTOPLAY', 'Auto-play'));
    on('tb-vortex', () => toggleMode('VORTEX', 'Vortex'));
    on('tb-freeze', toggleFreeze);
}

setupToolbar();

function pointerPrototype () {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
}

let pointers = [];
let splatStack = [];
pointers.push(new pointerPrototype());

const { gl, ext } = getWebGLContext(canvas);

if (isMobile()) {
    config.DYE_RESOLUTION = 512;
}
if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 512;
    config.SHADING = false;
    config.BLOOM = false;
    config.SUNRAYS = false;
}

// Stage 1: core controls (0-100% sliders, extra forces, edge behavior)

// Every slider in the UI is 0-100%. These map a percentage to the engine value and back.
const pctSpeedTo = p => p <= 50 ? p / 50 : 1 + (p - 50) / 25;          // 0..1x..3x, 50% = 1x
const pctSpeedFrom = v => v <= 1 ? v * 50 : 50 + (v - 1) * 25;
const pctSquareTo = max => p => max * (p / 100) * (p / 100);           // finer control at the low end
const pctSquareFrom = max => v => 100 * Math.sqrt(Math.max(v, 0) / max);
const pctLinTo = (min, max) => p => min + (max - min) * p / 100;
const pctLinFrom = (min, max) => v => 100 * (v - min) / (max - min);

const PCT = {
    TIME:            { cfg: 'SPEED',                to: pctSpeedTo,          from: pctSpeedFrom },
    RADIUS:          { cfg: 'SPLAT_RADIUS',         to: pctLinTo(0.01, 1),   from: pctLinFrom(0.01, 1) },
    DISSIPATION:     { cfg: 'DENSITY_DISSIPATION',  to: pctSquareTo(4),      from: pctSquareFrom(4) },
    DRAG:            { cfg: 'VELOCITY_DISSIPATION', to: pctSquareTo(4),      from: pctSquareFrom(4) },
    VORTICITY:       { cfg: 'CURL',                 to: pctLinTo(0, 50),     from: pctLinFrom(0, 50) },
    PRESSURE_STR:    { cfg: 'PRESSURE',             to: pctLinTo(0, 1),      from: pctLinFrom(0, 1) },
    TOUCH_FORCE:     { cfg: 'INTENSITY',            to: pctSpeedTo,          from: pctSpeedFrom },
    BLOOM_INT:       { cfg: 'BLOOM_INTENSITY',      to: pctLinTo(0, 2),      from: pctLinFrom(0, 2) },
    BLOOM_THR:       { cfg: 'BLOOM_THRESHOLD',      to: pctLinTo(0, 1),      from: pctLinFrom(0, 1) },
    SUNRAYS_W:       { cfg: 'SUNRAYS_WEIGHT',       to: pctLinTo(0, 1),      from: pctLinFrom(0, 1) },
    RAINBOW_SPD:     { cfg: 'RAINBOW_SPEED',        to: pctLinTo(0, 1),      from: pctLinFrom(0, 1) },
};

const ui = {};

function syncUI () {
    Object.keys(PCT).forEach(k => {
        const m = PCT[k];
        ui[k] = Math.round(Math.min(100, Math.max(0, m.from(config[m.cfg]))));
    });
}
syncUI();

function addPct (folder, key, label) {
    const m = PCT[key];
    return folder.add(ui, key, 0, 100).step(1).name(label).onChange(v => {
        config[m.cfg] = m.to(v);
    });
}

const QUALITY_LEVELS = { 'Very Low': 128, 'Low': 256, 'Medium': 512, 'High': 1024, 'Super High': 1536, 'Ultra High': 2048 };
const PRESSURE_LEVELS = { 'Low': 10, 'Norm': 20, 'Max': 50 };
const EDGE_MODES = ['Wall', 'Wrap', 'Void', 'Repel'];
const CORNER_MODES = ['Normal', 'Rounded', 'Repel', 'Bounce', 'Absorb', 'Wrap'];
const FLOW_DIRECTIONS = {
    'None':           null,
    'Up':             [0, 1],
    'Down':           [0, -1],
    'Left':           [-1, 0],
    'Right':          [1, 0],
    'Up-Left':        [-Math.SQRT1_2, Math.SQRT1_2],
    'Up-Right':       [Math.SQRT1_2, Math.SQRT1_2],
    'Down-Left':      [-Math.SQRT1_2, -Math.SQRT1_2],
    'Down-Right':     [Math.SQRT1_2, -Math.SQRT1_2],
    'Radial Outward': 'out',
    'Radial Inward':  'in',
    'Circular':       'circle',
};
const SEGMENT_CHOICES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const TRANSITION_CHOICES = { '3 s': 3, '5 s': 5, '8 s': 8, '10 s': 10, '15 s': 15, '20 s': 20, '30 s': 30 };

const isWebGL2Context = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
let displacement = null;
let forceTime = 0;
let wrapWarned = false;

// Wrap needs repeating textures, which WebGL1 cannot do at these sizes
function effectiveEdgeMode () {
    const i = EDGE_MODES.indexOf(config.EDGE);
    if (i === 1 && !isWebGL2Context) return 0;
    return Math.max(0, i);
}

function applyEdgeWrap () {
    const mode = effectiveEdgeMode() === 1 ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    const fbos = [velocity && velocity.read, velocity && velocity.write, dye && dye.read, dye && dye.write,
                  pressure && pressure.read, pressure && pressure.write, divergence, curl,
                  displacement && displacement.read, displacement && displacement.write];
    fbos.forEach(f => {
        if (!f) return;
        gl.bindTexture(gl.TEXTURE_2D, f.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode);
    });
}

function onEdgeChange () {
    if (config.EDGE === 'Wrap' && !isWebGL2Context && !wrapWarned) {
        wrapWarned = true;
        showToast('Wrap needs WebGL2 · using Wall');
    }
    applyEdgeWrap();
}

function flowUniforms () {
    const d = FLOW_DIRECTIONS[config.FLOW_DIRECTION];
    if (d == null) return { mode: -1, x: 0, y: 0 };
    if (d === 'out') return { mode: 1, x: 0, y: 0 };
    if (d === 'in') return { mode: 2, x: 0, y: 0 };
    if (d === 'circle') return { mode: 3, x: 0, y: 0 };
    return { mode: 0, x: d[0], y: d[1] };
}

function forcesActive () {
    return FLOW_DIRECTIONS[config.FLOW_DIRECTION] != null && config.FLOW_SPEED > 0
        || config.SWIRL > 0 || config.TURBULENCE > 0 || config.GRAVITY > 0
        || config.BUOYANCY !== 50 || config.ELASTICITY > 0
        || effectiveEdgeMode() !== 1 && (effectiveEdgeMode() === 3 || config.EDGE_FRICTION > 0 || config.EDGE_BOUNCE > 0 || config.CORNER !== 'Normal');
}

// Random kicks: velocity-only nudges whose rate and strength follow Randomness
function applyRandomness (dt) {
    const r = config.RANDOMNESS / 100;
    if (r <= 0 || config.PAUSED) return;
    let kicks = r * r * 20 * dt * config.SPEED;
    while (kicks > 0) {
        if (kicks < 1 && Math.random() > kicks) break;
        kicks -= 1;
        const a = Math.random() * Math.PI * 2;
        const v = (150 + 650 * r) * Math.random();
        splatVelocity(Math.random(), Math.random(), Math.cos(a) * v, Math.sin(a) * v, 0.6 + Math.random());
    }
}

startGUI();

function getWebGLContext (canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2)
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    let formatRGBA;
    let formatRG;
    let formatR;

    if (isWebGL2)
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    }
    else
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
        gl,
        ext: {
            formatRGBA,
            formatRG,
            formatR,
            halfFloatTexType,
            supportLinearFiltering
        }
    };
}

function getSupportedFormat (gl, internalFormat, format, type)
{
    if (!supportRenderTextureFormat(gl, internalFormat, format, type))
    {
        switch (internalFormat)
        {
            case gl.R16F:
                return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
            case gl.RG16F:
                return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
            default:
                return null;
        }
    }

    return {
        internalFormat,
        format
    }
}

function supportRenderTextureFormat (gl, internalFormat, format, type) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status == gl.FRAMEBUFFER_COMPLETE;
}

function startGUI () {
    var gui = new dat.GUI({ width: 310 });
    guiRoot = gui;

    gui.add({ fun: randomizeConfig }, 'fun').name('✨ Randomize');
    gui.add({ fun: () => { toggleFreeze(); } }, 'fun').name('❄ Freeze / Resume');
    gui.add({ fun: () => {
        splatStack.push(parseInt(Math.random() * 20) + 5);
    } }, 'fun').name('Random splats');

    let simFolder = gui.addFolder('Simulation');
    simFolder.add(config, 'DYE_RESOLUTION', QUALITY_LEVELS).name('quality').onFinishChange(initFramebuffers);
    addPct(simFolder, 'TIME', 'time');
    simFolder.add(config, 'AUTOPLAY').name('autoplay').listen();
    addPct(simFolder, 'RADIUS', 'radius');
    simFolder.add(config, 'SIM_RESOLUTION', { '32': 32, '64': 64, '128': 128, '256': 256 }).name('sim resolution').onFinishChange(initFramebuffers);
    addPct(simFolder, 'DISSIPATION', 'dissipation');
    simFolder.add(config, 'VISCOSITY', 0, 100).step(1).name('viscosity');
    addPct(simFolder, 'VORTICITY', 'vorticity');
    simFolder.add(config, 'GRAVITY', 0, 100).step(1).name('gravity');
    simFolder.add(config, 'PRESSURE_LEVEL', Object.keys(PRESSURE_LEVELS)).name('pressure');
    simFolder.add(config, 'PAUSED').name('paused').listen();

    let forcesFolder = gui.addFolder('Forces');
    forcesFolder.add(config, 'TURBULENCE', 0, 100).step(1).name('turbulence');
    forcesFolder.add(config, 'FLOW_STRENGTH', 0, 100).step(1).name('flow strength');
    forcesFolder.add(config, 'SWIRL', 0, 100).step(1).name('swirl');
    addPct(forcesFolder, 'PRESSURE_STR', 'pressure strength');
    forcesFolder.add(config, 'BUOYANCY', 0, 100).step(1).name('buoyancy (50 = none)');
    addPct(forcesFolder, 'DRAG', 'drag');
    forcesFolder.add(config, 'ELASTICITY', 0, 100).step(1).name('elasticity');
    forcesFolder.add(config, 'FLOW_DIRECTION', Object.keys(FLOW_DIRECTIONS)).name('flow direction');
    forcesFolder.add(config, 'FLOW_SPEED', 0, 100).step(1).name('flow speed');
    forcesFolder.add(config, 'RANDOMNESS', 0, 100).step(1).name('randomness');

    let edgeFolder = gui.addFolder('Edges');
    edgeFolder.add(config, 'EDGE', EDGE_MODES).name('edge').onChange(onEdgeChange);
    edgeFolder.add(config, 'REPEL_STRENGTH', 0, 100).step(1).name('repel strength');
    edgeFolder.add(config, 'REPEL_DISTANCE', 0, 100).step(1).name('repel distance');
    edgeFolder.add(config, 'EDGE_FRICTION', 0, 100).step(1).name('edge friction');
    edgeFolder.add(config, 'EDGE_BOUNCE', 0, 100).step(1).name('edge bounce');
    edgeFolder.add(config, 'EDGE_SOFTNESS', 0, 100).step(1).name('edge softness');
    edgeFolder.add(config, 'CORNER', CORNER_MODES).name('corner behavior');

    let touchFolder = gui.addFolder('Touch');
    addPct(touchFolder, 'TOUCH_FORCE', 'touch force');

    let modesFolder = gui.addFolder('Modes');
    modesFolder.add(config, 'VORTEX').name('vortex').listen();
    modesFolder.add(config, 'MIRROR').name('mirror').listen().onChange(v => {
        if (v) config.KALEIDOSCOPE = false;
    });
    modesFolder.add(config, 'KALEIDOSCOPE').name('kaleidoscope').listen().onChange(v => {
        if (v) config.MIRROR = false;
    });
    modesFolder.add(config, 'KALEIDO_SEGMENTS', SEGMENT_CHOICES).name('segments').listen()
        .onChange(v => { config.KALEIDO_SEGMENTS = Number(v); });
    modesFolder.add(config, 'RAINBOW').name('rainbow').listen();
    addPct(modesFolder, 'RAINBOW_SPD', 'rainbow speed');
    modesFolder.add(config, 'BLACKLIGHT').name('blacklight').listen().onChange(updateKeywords);
    modesFolder.add(config, 'TRAILS').name('color trails').listen();
    modesFolder.add(config, 'RANDOM_INJECTION').name('random color on touch').listen();

    let colorsFolder = gui.addFolder('Colors');
    colorsFolder.add(config, 'PALETTE', PALETTE_NAMES).name('palette').listen().onChange(v => setPalette(v, 1.2));
    colorsFolder.add(config, 'AUTO_TRANSITION').name('auto transitions').listen();
    colorsFolder.add(config, 'TRANSITION_TIME', TRANSITION_CHOICES).name('time per palette')
        .onChange(v => { config.TRANSITION_TIME = Number(v); });
    colorsFolder.add(config, 'BACKGROUND', BACKGROUND_NAMES).name('background').listen();
    colorsFolder.add(config, 'COLORFUL').name('colorful');

    let effectsFolder = gui.addFolder('Effects');
    effectsFolder.add(config, 'SHADING').name('shading').onFinishChange(updateKeywords);
    effectsFolder.add(config, 'BLOOM').name('bloom').onFinishChange(updateKeywords);
    addPct(effectsFolder, 'BLOOM_INT', 'bloom intensity');
    addPct(effectsFolder, 'BLOOM_THR', 'bloom threshold');
    effectsFolder.add(config, 'SUNRAYS').name('sunrays').onFinishChange(updateKeywords);
    addPct(effectsFolder, 'SUNRAYS_W', 'sunrays weight');

    let captureFolder = gui.addFolder('Capture');
    captureFolder.addColor(config, 'BACK_COLOR').name('background color').onChange(() => {
        config.BACKGROUND = 'Custom';
    });
    captureFolder.add(config, 'TRANSPARENT').name('transparent');
    captureFolder.add({ fun: captureScreenshot }, 'fun').name('take screenshot');

    if (isMobile())
        gui.close();
}

function isMobile () {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function captureScreenshot () {
    let res = getResolution(config.CAPTURE_RESOLUTION);
    let target = createFBO(res.width, res.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, gl.NEAREST);
    render(target);

    let texture = framebufferToTexture(target);
    texture = normalizeTexture(texture, target.width, target.height);

    let captureCanvas = textureToCanvas(texture, target.width, target.height);
    let datauri = captureCanvas.toDataURL();
    downloadURI('fluid.png', datauri);
    URL.revokeObjectURL(datauri);
}

function framebufferToTexture (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    let length = target.width * target.height * 4;
    let texture = new Float32Array(length);
    gl.readPixels(0, 0, target.width, target.height, gl.RGBA, gl.FLOAT, texture);
    return texture;
}

function normalizeTexture (texture, width, height) {
    let result = new Uint8Array(texture.length);
    let id = 0;
    for (let i = height - 1; i >= 0; i--) {
        for (let j = 0; j < width; j++) {
            let nid = i * width * 4 + j * 4;
            result[nid + 0] = clamp01(texture[id + 0]) * 255;
            result[nid + 1] = clamp01(texture[id + 1]) * 255;
            result[nid + 2] = clamp01(texture[id + 2]) * 255;
            result[nid + 3] = clamp01(texture[id + 3]) * 255;
            id += 4;
        }
    }
    return result;
}

function clamp01 (input) {
    return Math.min(Math.max(input, 0), 1);
}

function textureToCanvas (texture, width, height) {
    let captureCanvas = document.createElement('canvas');
    let ctx = captureCanvas.getContext('2d');
    captureCanvas.width = width;
    captureCanvas.height = height;

    let imageData = ctx.createImageData(width, height);
    imageData.data.set(texture);
    ctx.putImageData(imageData, 0, 0);

    return captureCanvas;
}

function downloadURI (filename, uri) {
    let link = document.createElement('a');
    link.download = filename;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

class Material {
    constructor (vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
    }

    setKeywords (keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++)
            hash += hashCode(keywords[i]);

        let program = this.programs[hash];
        if (program == null)
        {
            let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
            program = createProgram(this.vertexShader, fragmentShader);
            this.programs[hash] = program;
        }

        if (program == this.activeProgram) return;

        this.uniforms = getUniforms(program);
        this.activeProgram = program;
    }

    bind () {
        gl.useProgram(this.activeProgram);
    }
}

class Program {
    constructor (vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
    }

    bind () {
        gl.useProgram(this.program);
    }
}

function createProgram (vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.trace(gl.getProgramInfoLog(program));

    return program;
}

function getUniforms (program) {
    let uniforms = [];
    let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
    }
    return uniforms;
}

function compileShader (type, source, keywords) {
    source = addKeywords(source, keywords);

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.trace(gl.getShaderInfoLog(shader));

    return shader;
};

function addKeywords (source, keywords) {
    if (keywords == null) return source;
    let keywordsString = '';
    keywords.forEach(keyword => {
        keywordsString += '#define ' + keyword + '\n';
    });
    return keywordsString + source;
}

const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

const blurVertexShader = compileShader(gl.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

const blurShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`);

const copyShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`);

const clearShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`);

const colorShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`);

const checkerboardShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;

    #define SCALE 25.0

    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`);

const backgroundShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;

    varying vec2 vUv;
    uniform vec3 top;
    uniform vec3 bottom;
    uniform vec3 glow;
    uniform float aspectRatio;

    void main () {
        vec3 c = mix(bottom, top, smoothstep(0.0, 1.0, vUv.y));
        vec2 p = (vUv - 0.5) * vec2(aspectRatio, 1.0);
        float r = length(p);
        c += glow * exp(-r * r * 3.0);
        c *= 1.0 - 0.35 * smoothstep(0.45, 1.2, r);
        float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        c += (n - 0.5) / 255.0;
        gl_FragColor = vec4(max(c, 0.0), 1.0);
    }
`);

const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);

        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif

    #ifdef BLACKLIGHT
        float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = max(mix(vec3(lum), c, 1.6), 0.0) * 1.2;
    #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`;

const bloomPrefilterShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`);

const bloomBlurShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`);

const bloomFinalShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`);

const sunraysMaskShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`);

const sunraysShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`);

const splatShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`);

const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
);

const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    uniform float edgeMode;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (edgeMode > 1.5 && edgeMode < 2.5) {
            // Void: open boundary, fluid flows straight out
            if (vL.x < 0.0) { L = C.x; }
            if (vR.x > 1.0) { R = C.x; }
            if (vT.y > 1.0) { T = C.y; }
            if (vB.y < 0.0) { B = C.y; }
        } else if (edgeMode < 0.5 || edgeMode > 2.5) {
            // Wall and Repel: solid boundary
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
        }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`);

const forcesShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uDye;
    uniform sampler2D uDisp;
    uniform float dt;
    uniform float time;
    uniform float aspectRatio;
    uniform float flowMode;
    uniform vec2 flowDir;
    uniform float flowSpeed;
    uniform float swirl;
    uniform float turbulence;
    uniform float buoyancy;
    uniform float elasticity;
    uniform float edgeMode;
    uniform float cornerMode;
    uniform float repelStrength;
    uniform float repelDistance;
    uniform float edgeFriction;
    uniform float edgeBounce;
    uniform float edgeSoftness;

    float hash (vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float noise (vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float field (vec2 p) {
        return noise(p * 3.0 + vec2(time * 0.31, -time * 0.23))
             + 0.5 * noise(p * 6.1 + vec2(-time * 0.47, time * 0.37) + 17.0);
    }

    // Pushes velocity toward a target along a direction without overshooting
    vec2 relax (vec2 v, vec2 dir, float target, float rate) {
        float along = dot(v, dir);
        return dir * max(target - along, 0.0) * min(rate * dt, 1.0);
    }

    float band (float d) {
        float x = clamp(1.0 - d / repelDistance, 0.0, 1.0);
        return pow(x, mix(3.0, 0.6, edgeSoftness));
    }

    void main () {
        vec2 v = texture2D(uVelocity, vUv).xy;
        vec3 dye = texture2D(uDye, vUv).rgb;
        float w = clamp(dot(dye, vec3(0.3333)) * 4.0, 0.0, 1.0);

        vec2 p = (vUv - 0.5) * vec2(aspectRatio, 1.0);
        float r = length(p);
        vec2 radial = r > 1e-4 ? p / r : vec2(0.0);
        vec2 tangent = vec2(-radial.y, radial.x);

        // Flow direction
        if (flowMode > -0.5) {
            vec2 d = flowDir;
            if (flowMode > 0.5 && flowMode < 1.5) d = radial * smoothstep(0.0, 0.06, r);
            else if (flowMode > 1.5 && flowMode < 2.5) d = -radial * smoothstep(0.0, 0.06, r);
            else if (flowMode > 2.5) d = tangent * smoothstep(0.0, 0.06, r);
            v += relax(v, d, flowSpeed, 2.0 * (0.35 + 0.65 * w));
        }

        // Swirl around the center, strongest in the middle third
        if (swirl > 0.0) {
            float profile = smoothstep(0.0, 0.12, r) * exp(-r * r * 4.0);
            v += relax(v, tangent, swirl * profile, 3.0);
        }

        // Turbulence: divergence-free curl noise
        if (turbulence > 0.0) {
            float e = 0.01;
            float n1 = field(p + vec2(0.0, e));
            float n2 = field(p - vec2(0.0, e));
            float n3 = field(p + vec2(e, 0.0));
            float n4 = field(p - vec2(e, 0.0));
            vec2 c = vec2(n1 - n2, -(n3 - n4)) / (2.0 * e);
            v += c * turbulence * dt;
        }

        // Gravity and buoyancy act on the colored fluid
        v.y += buoyancy * w * dt;

        // Elasticity: spring back toward where the fluid started
        if (elasticity > 0.0)
            v -= texture2D(uDisp, vUv).xy * elasticity * dt;

        // Edges (not used when wrapping)
        if (edgeMode < 0.5 || edgeMode > 1.5) {
            vec2 halfSize = vec2(aspectRatio * 0.5, 0.5);
            vec2 q = halfSize - abs(p);
            float d;
            vec2 nOut;
            if (q.x < q.y) { d = q.x; nOut = vec2(sign(p.x), 0.0); }
            else           { d = q.y; nOut = vec2(0.0, sign(p.y)); }

            // Corner zone
            vec2 toCorner = halfSize * sign(p) - p;
            float cd = length(toCorner);
            float cornerZone = max(repelDistance * 1.5, 0.12);
            float c = 1.0 - smoothstep(0.0, cornerZone, cd);
            vec2 nCorner = cd > 1e-4 ? toCorner / cd : nOut;

            // Rounded corners: outside the rounded rectangle counts as solid
            if (cornerMode > 0.5 && cornerMode < 1.5) {
                float rr = 0.14;
                vec2 k = abs(p) - (halfSize - rr);
                float sd = length(max(k, 0.0)) + min(max(k.x, k.y), 0.0) - rr;
                if (k.x > 0.0 && k.y > 0.0) {
                    vec2 n = normalize(k) * sign(p);
                    float inside = -sd;
                    d = min(d, max(inside, 0.0));
                    nOut = n;
                    if (sd > 0.0) {
                        v -= n * max(dot(v, n), 0.0);
                        v -= n * 400.0 * min(sd / rr, 1.0) * dt;
                    }
                }
            }

            float f = band(d);
            float vn = dot(v, nOut);
            vec2 tn = vec2(-nOut.y, nOut.x);

            if (edgeMode > 2.5)
                v -= nOut * repelStrength * f * dt;
            if (edgeBounce > 0.0 && vn > 0.0)
                v -= nOut * vn * (1.0 + edgeBounce) * f;
            if (edgeFriction > 0.0)
                v -= tn * dot(v, tn) * edgeFriction * f * min(10.0 * dt, 1.0);

            if (cornerMode > 1.5 && cornerMode < 2.5)
                v -= nCorner * max(repelStrength, 300.0) * 1.5 * c * dt;
            if (cornerMode > 2.5 && cornerMode < 3.5) {
                float vc = dot(v, nCorner);
                if (vc > 0.0) v -= nCorner * vc * (1.0 + max(edgeBounce, 0.6)) * c;
            }
            if (cornerMode > 3.5 && cornerMode < 4.5)
                v *= 1.0 - c * min(4.0 * dt, 1.0);
            if (cornerMode > 4.5)
                v = mix(v, texture2D(uVelocity, vec2(1.0) - vUv).xy, c * min(8.0 * dt, 0.5));
        }

        // Keep runaway forces from blowing up the solver
        float speed = length(v);
        if (speed > 2500.0) v *= 2500.0 / speed;

        gl_FragColor = vec4(v, 0.0, 1.0);
    }
`);

const displacementShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uDisp;
    uniform sampler2D uVelocity;
    uniform float dt;

    void main () {
        vec2 d = texture2D(uDisp, vUv).xy + texture2D(uVelocity, vUv).xy * dt;
        d *= 1.0 / (1.0 + 1.5 * dt);
        gl_FragColor = vec4(d, 0.0, 1.0);
    }
`);

const viscosityShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform float alpha;

    void main () {
        vec2 c = texture2D(uVelocity, vUv).xy;
        vec2 sum = texture2D(uVelocity, vL).xy + texture2D(uVelocity, vR).xy
                 + texture2D(uVelocity, vT).xy + texture2D(uVelocity, vB).xy;
        gl_FragColor = vec4(c + alpha * (sum - 4.0 * c), 0.0, 1.0);
    }
`);

const edgeDyeShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float dt;
    uniform float aspectRatio;
    uniform float edgeMode;
    uniform float cornerMode;
    uniform float repelDistance;
    uniform float edgeSoftness;

    void main () {
        vec4 col = texture2D(uTarget, vUv);
        vec2 p = (vUv - 0.5) * vec2(aspectRatio, 1.0);
        vec2 halfSize = vec2(aspectRatio * 0.5, 0.5);
        vec2 q = halfSize - abs(p);
        float d = min(q.x, q.y);

        // Void: fluid fades away as it leaves through the edges
        if (edgeMode > 1.5 && edgeMode < 2.5) {
            float x = clamp(1.0 - d / max(repelDistance * 0.5, 0.02), 0.0, 1.0);
            float f = pow(x, mix(3.0, 0.6, edgeSoftness));
            col *= 1.0 - f * min(8.0 * dt, 1.0);
        }

        float cd = length(halfSize * sign(p) - p);
        float c = 1.0 - smoothstep(0.0, max(repelDistance * 1.5, 0.12), cd);
        if (cornerMode > 3.5 && cornerMode < 4.5)
            col *= 1.0 - c * min(4.0 * dt, 1.0);
        if (cornerMode > 4.5)
            col = mix(col, texture2D(uTarget, vec2(1.0) - vUv), c * min(8.0 * dt, 0.5));

        gl_FragColor = col;
    }
`);

const curlShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`);

const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`);

const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target, clear = false) => {
        if (target == null)
        {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else
        {
            gl.viewport(0, 0, target.width, target.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear)
        {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        // CHECK_FRAMEBUFFER_STATUS();
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
})();

function CHECK_FRAMEBUFFER_STATUS () {
    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
        console.trace("Framebuffer error: " + status);
}

let dye;
let velocity;
let divergence;
let curl;
let pressure;
let bloom;
let bloomFramebuffers = [];
let sunrays;
let sunraysTemp;

let ditheringTexture = createTextureAsync('LDR_LLL1_0.png');

const blurProgram            = new Program(blurVertexShader, blurShader);
const copyProgram            = new Program(baseVertexShader, copyShader);
const clearProgram           = new Program(baseVertexShader, clearShader);
const colorProgram           = new Program(baseVertexShader, colorShader);
const checkerboardProgram    = new Program(baseVertexShader, checkerboardShader);
const bloomPrefilterProgram  = new Program(baseVertexShader, bloomPrefilterShader);
const bloomBlurProgram       = new Program(baseVertexShader, bloomBlurShader);
const bloomFinalProgram      = new Program(baseVertexShader, bloomFinalShader);
const sunraysMaskProgram     = new Program(baseVertexShader, sunraysMaskShader);
const sunraysProgram         = new Program(baseVertexShader, sunraysShader);
const splatProgram           = new Program(baseVertexShader, splatShader);
const backgroundProgram      = new Program(baseVertexShader, backgroundShader);
const forcesProgram          = new Program(baseVertexShader, forcesShader);
const displacementProgram    = new Program(baseVertexShader, displacementShader);
const viscosityProgram       = new Program(baseVertexShader, viscosityShader);
const edgeDyeProgram         = new Program(baseVertexShader, edgeDyeShader);
const advectionProgram       = new Program(baseVertexShader, advectionShader);
const divergenceProgram      = new Program(baseVertexShader, divergenceShader);
const curlProgram            = new Program(baseVertexShader, curlShader);
const vorticityProgram       = new Program(baseVertexShader, vorticityShader);
const pressureProgram        = new Program(baseVertexShader, pressureShader);
const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

const displayMaterial = new Material(baseVertexShader, displayShaderSource);

function initFramebuffers () {
    let simRes = getResolution(config.SIM_RESOLUTION);
    let dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba    = ext.formatRGBA;
    const rg      = ext.formatRG;
    const r       = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    if (dye == null)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

    if (velocity == null)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    else
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

    divergence = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curl       = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

    if (displacement == null)
        displacement = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    else
        displacement = resizeDoubleFBO(displacement, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    applyEdgeWrap();

    initBloomFramebuffers();
    initSunraysFramebuffers();
}

function initBloomFramebuffers () {
    let res = getResolution(config.BLOOM_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    bloom = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);

    bloomFramebuffers.length = 0;
    for (let i = 0; i < config.BLOOM_ITERATIONS; i++)
    {
        let width = res.width >> (i + 1);
        let height = res.height >> (i + 1);

        if (width < 2 || height < 2) break;

        let fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
        bloomFramebuffers.push(fbo);
    }
}

function initSunraysFramebuffers () {
    let res = getResolution(config.SUNRAYS_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    sunrays     = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
    sunraysTemp = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
}

function createFBO (w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let texelSizeX = 1.0 / w;
    let texelSizeY = 1.0 / h;

    return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };
}

function createDoubleFBO (w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read () {
            return fbo1;
        },
        set read (value) {
            fbo1 = value;
        },
        get write () {
            return fbo2;
        },
        set write (value) {
            fbo2 = value;
        },
        swap () {
            let temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        }
    }
}

function resizeFBO (target, w, h, internalFormat, format, type, param) {
    let newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
}

function resizeDoubleFBO (target, w, h, internalFormat, format, type, param) {
    if (target.width == w && target.height == h)
        return target;
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
}

function createTextureAsync (url) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));

    let obj = {
        texture,
        width: 1,
        height: 1,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };

    let image = new Image();
    image.onload = () => {
        obj.width = image.width;
        obj.height = image.height;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    };
    image.src = url;

    return obj;
}

function updateKeywords () {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    if (config.BLOOM) displayKeywords.push("BLOOM");
    if (config.SUNRAYS) displayKeywords.push("SUNRAYS");
    if (config.BLACKLIGHT) displayKeywords.push("BLACKLIGHT");
    displayMaterial.setKeywords(displayKeywords);
}

updateKeywords();
initFramebuffers();
multipleSplats(parseInt(Math.random() * 20) + 5);

let lastUpdateTime = Date.now();
let colorUpdateTimer = 0.0;
update();

function update () {
    const dt = calcDeltaTime();
    if (resizeCanvas())
        initFramebuffers();
    updateColors(dt);
    updatePalette(dt);
    updateBackground(dt);
    applyInputs();
    updateAutoplay(dt);
    updateVortex(dt);
    applyRandomness(dt);
    if (!config.PAUSED) {
        const simDt = dt * config.SPEED;
        const substeps = Math.max(1, Math.ceil(simDt / 0.016667 - 1e-6));
        for (let i = 0; i < substeps; i++)
            step(simDt / substeps);
    }
    render(null);
    syncToolbar();
    requestAnimationFrame(update);
}

function calcDeltaTime () {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
}

function resizeCanvas () {
    let width = scaleByPixelRatio(canvas.clientWidth);
    let height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function updateColors (dt) {
    rainbowHue = frac(rainbowHue + dt * config.RAINBOW_SPEED);
    if (config.RAINBOW) {
        pointers.forEach((p, i) => {
            p.color = colorAt(i * 0.13);
        });
        return;
    }

    if (!config.COLORFUL) return;

    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
        pointers.forEach(p => {
            p.color = generateColor();
        });
    }
}

function applyInputs () {
    if (splatStack.length > 0)
        multipleSplats(splatStack.pop());
    applyInjections();

    pointers.forEach(p => {
        if (p.moved) {
            p.moved = false;
            splatPointer(p);
        }
    });
}

function step (dt) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    applyForces(dt);

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1f(divergenceProgram.uniforms.edgeMode, effectiveEdgeMode());
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    const pressureIterations = PRESSURE_LEVELS[config.PRESSURE_LEVEL] || config.PRESSURE_ITERATIONS;
    for (let i = 0; i < pressureIterations; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    let velocityId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    const flowScale = pctSpeedTo(config.FLOW_STRENGTH);
    gl.uniform1f(advectionProgram.uniforms.dt, dt * flowScale);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION / Math.max(flowScale, 0.05));
    blit(velocity.write);
    velocity.swap();

    if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, (config.TRAILS ? config.DENSITY_DISSIPATION * 0.12 : config.DENSITY_DISSIPATION) / Math.max(flowScale, 0.05));
    blit(dye.write);
    dye.swap();

    applyDyeEdges(dt);
}

function applyForces (dt) {
    forceTime += dt;

    if (config.ELASTICITY > 0) {
        displacementProgram.bind();
        gl.uniform1i(displacementProgram.uniforms.uDisp, displacement.read.attach(0));
        gl.uniform1i(displacementProgram.uniforms.uVelocity, velocity.read.attach(1));
        gl.uniform1f(displacementProgram.uniforms.dt, dt);
        blit(displacement.write);
        displacement.swap();
    }

    if (forcesActive()) {
        const flow = flowUniforms();
        const edgeMode = effectiveEdgeMode();
        const u = forcesProgram.uniforms;
        forcesProgram.bind();
        gl.uniform1i(u.uVelocity, velocity.read.attach(0));
        gl.uniform1i(u.uDye, dye.read.attach(1));
        gl.uniform1i(u.uDisp, displacement.read.attach(2));
        gl.uniform1f(u.dt, dt);
        gl.uniform1f(u.time, forceTime);
        gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);
        gl.uniform1f(u.flowMode, config.FLOW_SPEED > 0 ? flow.mode : -1);
        gl.uniform2f(u.flowDir, flow.x, flow.y);
        gl.uniform1f(u.flowSpeed, config.FLOW_SPEED / 100 * 450);
        gl.uniform1f(u.swirl, config.SWIRL / 100 * 900);
        gl.uniform1f(u.turbulence, config.TURBULENCE / 100 * 160);
        gl.uniform1f(u.buoyancy, (config.BUOYANCY - 50) / 50 * 700 - config.GRAVITY / 100 * 700);
        gl.uniform1f(u.elasticity, config.ELASTICITY / 100 * 80);
        gl.uniform1f(u.edgeMode, edgeMode);
        gl.uniform1f(u.cornerMode, CORNER_MODES.indexOf(config.CORNER));
        gl.uniform1f(u.repelStrength, config.REPEL_STRENGTH / 100 * 1500);
        gl.uniform1f(u.repelDistance, 0.01 + config.REPEL_DISTANCE / 100 * 0.34);
        gl.uniform1f(u.edgeFriction, config.EDGE_FRICTION / 100);
        gl.uniform1f(u.edgeBounce, config.EDGE_BOUNCE / 100);
        gl.uniform1f(u.edgeSoftness, config.EDGE_SOFTNESS / 100);
        blit(velocity.write);
        velocity.swap();
    }

    if (config.VISCOSITY > 0) {
        const total = config.VISCOSITY / 100;
        const iterations = Math.ceil(total / 0.24);
        viscosityProgram.bind();
        gl.uniform2f(viscosityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1f(viscosityProgram.uniforms.alpha, total / iterations);
        for (let i = 0; i < iterations; i++) {
            gl.uniform1i(viscosityProgram.uniforms.uVelocity, velocity.read.attach(0));
            blit(velocity.write);
            velocity.swap();
        }
    }
}

function applyDyeEdges (dt) {
    const edgeMode = effectiveEdgeMode();
    const corner = CORNER_MODES.indexOf(config.CORNER);
    if (edgeMode !== 2 && !(edgeMode !== 1 && corner >= 4)) return;
    const u = edgeDyeProgram.uniforms;
    edgeDyeProgram.bind();
    gl.uniform1i(u.uTarget, dye.read.attach(0));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);
    gl.uniform1f(u.edgeMode, edgeMode);
    gl.uniform1f(u.cornerMode, edgeMode === 1 ? 0 : corner);
    gl.uniform1f(u.repelDistance, 0.01 + config.REPEL_DISTANCE / 100 * 0.34);
    gl.uniform1f(u.edgeSoftness, config.EDGE_SOFTNESS / 100);
    blit(dye.write);
    dye.swap();
}

function render (target) {
    if (config.BLOOM)
        applyBloom(dye.read, bloom);
    if (config.SUNRAYS) {
        applySunrays(dye.read, dye.write, sunrays);
        blur(sunrays, sunraysTemp, 1);
    }

    if (target == null || !config.TRANSPARENT) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
    }
    else {
        gl.disable(gl.BLEND);
    }

    if (!config.TRANSPARENT)
        drawBackground(target);
    if (target == null && config.TRANSPARENT)
        drawCheckerboard(target);
    drawDisplay(target);
}

function drawColor (target, color) {
    colorProgram.bind();
    gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
    blit(target);
}

function drawBackground (target) {
    let width = target == null ? gl.drawingBufferWidth : target.width;
    let height = target == null ? gl.drawingBufferHeight : target.height;
    backgroundProgram.bind();
    gl.uniform3f(backgroundProgram.uniforms.top, bgCurrent.top.r, bgCurrent.top.g, bgCurrent.top.b);
    gl.uniform3f(backgroundProgram.uniforms.bottom, bgCurrent.bottom.r, bgCurrent.bottom.g, bgCurrent.bottom.b);
    gl.uniform3f(backgroundProgram.uniforms.glow, bgCurrent.glow.r, bgCurrent.glow.g, bgCurrent.glow.b);
    gl.uniform1f(backgroundProgram.uniforms.aspectRatio, width / height);
    blit(target);
}

function drawCheckerboard (target) {
    checkerboardProgram.bind();
    gl.uniform1f(checkerboardProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    blit(target);
}

function drawDisplay (target) {
    let width = target == null ? gl.drawingBufferWidth : target.width;
    let height = target == null ? gl.drawingBufferHeight : target.height;

    displayMaterial.bind();
    if (config.SHADING)
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    if (config.BLOOM) {
        gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1));
        gl.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2));
        let scale = getTextureScale(ditheringTexture, width, height);
        gl.uniform2f(displayMaterial.uniforms.ditherScale, scale.x, scale.y);
    }
    if (config.SUNRAYS)
        gl.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3));
    blit(target);
}

function applyBloom (source, destination) {
    if (bloomFramebuffers.length < 2)
        return;

    let last = destination;

    gl.disable(gl.BLEND);
    bloomPrefilterProgram.bind();
    let knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
    let curve0 = config.BLOOM_THRESHOLD - knee;
    let curve1 = knee * 2;
    let curve2 = 0.25 / knee;
    gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
    gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    blit(last);

    bloomBlurProgram.bind();
    for (let i = 0; i < bloomFramebuffers.length; i++) {
        let dest = bloomFramebuffers[i];
        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
        blit(dest);
        last = dest;
    }

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
        let baseTex = bloomFramebuffers[i];
        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
        gl.viewport(0, 0, baseTex.width, baseTex.height);
        blit(baseTex);
        last = baseTex;
    }

    gl.disable(gl.BLEND);
    bloomFinalProgram.bind();
    gl.uniform2f(bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
    gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
    gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
    blit(destination);
}

function applySunrays (source, mask, destination) {
    gl.disable(gl.BLEND);
    sunraysMaskProgram.bind();
    gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, source.attach(0));
    blit(mask);

    sunraysProgram.bind();
    gl.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT);
    gl.uniform1i(sunraysProgram.uniforms.uTexture, mask.attach(0));
    blit(destination);
}

function blur (target, temp, iterations) {
    blurProgram.bind();
    for (let i = 0; i < iterations; i++) {
        gl.uniform2f(blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
        gl.uniform1i(blurProgram.uniforms.uTexture, target.attach(0));
        blit(temp);

        gl.uniform2f(blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
        gl.uniform1i(blurProgram.uniforms.uTexture, temp.attach(0));
        blit(target);
    }
}

function splatPointer (pointer) {
    let dx = pointer.deltaX * config.SPLAT_FORCE * config.INTENSITY;
    let dy = pointer.deltaY * config.SPLAT_FORCE * config.INTENSITY;
    emitSplat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
}

function multipleSplats (amount) {
    for (let i = 0; i < amount; i++) {
        const color = generateColor();
        color.r *= 10.0;
        color.g *= 10.0;
        color.b *= 10.0;
        const x = Math.random();
        const y = Math.random();
        const dx = 1000 * config.INTENSITY * (Math.random() - 0.5);
        const dy = 1000 * config.INTENSITY * (Math.random() - 0.5);
        emitSplat(x, y, dx, dy, color);
    }
}

function splat (x, y, dx, dy, color) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
}

function splatVelocity (x, y, dx, dy, radiusScale) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS * (radiusScale || 1) / 100.0));
    blit(velocity.write);
    velocity.swap();
}

function correctRadius (radius) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1)
        radius *= aspectRatio;
    return radius;
}

canvas.addEventListener('mousedown', e => {
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    let pointer = pointers.find(p => p.id == -1);
    if (pointer == null)
        pointer = new pointerPrototype();
    updatePointerDownData(pointer, -1, posX, posY);
});

canvas.addEventListener('mousemove', e => {
    let pointer = pointers[0];
    if (!pointer.down) return;
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    updatePointerMoveData(pointer, posX, posY);
});

window.addEventListener('mouseup', () => {
    updatePointerUpData(pointers[0]);
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touches = e.targetTouches;
    while (touches.length >= pointers.length)
        pointers.push(new pointerPrototype());
    for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        updatePointerDownData(pointers[i + 1], touches[i].identifier, posX, posY);
    }
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
        let pointer = pointers[i + 1];
        if (!pointer.down) continue;
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        updatePointerMoveData(pointer, posX, posY);
    }
}, false);

window.addEventListener('touchend', e => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++)
    {
        let pointer = pointers.find(p => p.id == touches[i].identifier);
        if (pointer == null) continue;
        updatePointerUpData(pointer);
    }
});

window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (e.key === ' ') {
        e.preventDefault();
        splatStack.push(parseInt(Math.random() * 20) + 5);
    }
    switch (e.code) {
        case 'KeyP':
        case 'KeyF': toggleFreeze(); break;
        case 'KeyR': randomizeConfig(); break;
        case 'KeyC': cyclePalette(); break;
        case 'KeyA': toggleMode('AUTOPLAY', 'Auto-play'); break;
        case 'KeyV': toggleMode('VORTEX', 'Vortex'); break;
        case 'KeyM': toggleMode('MIRROR', 'Mirror'); break;
        case 'KeyK': toggleMode('KALEIDOSCOPE', 'Kaleidoscope'); break;
        case 'KeyB': toggleMode('BLACKLIGHT', 'Blacklight'); break;
        case 'KeyT': toggleMode('TRAILS', 'Color trails'); break;
        case 'KeyN': toggleMode('RAINBOW', 'Rainbow'); break;
        case 'KeyI': toggleMode('RANDOM_INJECTION', 'Random color on touch'); break;
        case 'KeyH': document.body.classList.toggle('hide-ui'); break;
        default: return;
    }
    refreshGUI();
});

function updatePointerDownData (pointer, id, posX, posY) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor();
    queueInjection(pointer.texcoordX, pointer.texcoordY);
}

function updatePointerMoveData (pointer, posX, posY) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
}

function updatePointerUpData (pointer) {
    pointer.down = false;
}

function correctDeltaX (delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
}

function correctDeltaY (delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
}

function generateColor () {
    if (config.RAINBOW)
        return colorAt(Math.random() * 0.08);
    return finishColor(samplePalette(Math.random()));
}

function HSVtoRGB (h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r,
        g,
        b
    };
}

function normalizeColor (input) {
    let output = {
        r: input.r / 255,
        g: input.g / 255,
        b: input.b / 255
    };
    return output;
}

function wrap (value, min, max) {
    let range = max - min;
    if (range == 0) return min;
    return (value - min) % range + min;
}

function getResolution (resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1)
        aspectRatio = 1.0 / aspectRatio;

    let min = Math.round(resolution);
    let max = Math.round(resolution * aspectRatio);
    const limit = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
    if (max > limit) {
        min = Math.round(min * limit / max);
        max = limit;
    }

    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
        return { width: max, height: min };
    else
        return { width: min, height: max };
}

function getTextureScale (texture, width, height) {
    return {
        x: width / texture.width,
        y: height / texture.height
    };
}

function scaleByPixelRatio (input) {
    let pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
}

function hashCode (s) {
    if (s.length == 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};