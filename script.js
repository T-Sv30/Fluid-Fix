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

// Internal render scale (Performance → render scale); a var so it exists before config is created
var renderScaleFactor = 1;

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
    // Stage 2
    TOUCH_RADIUS: 50,
    TOUCH_ATTRACTION: 0,
    TOUCH_REPULSION: 0,
    MULTI_TOUCH: 50,
    CONTINUOUS_DRAWING: false,
    TOUCH_SENSITIVITY: 50,
    GESTURE: 'Push',
    INJECTION: 'Continuous',
    FORCE_FIELD: 'None',
    FIELD_STRENGTH: 50,
    // Stage 3: effects, blacklight, filters
    MIRROR_MODE: 'None',
    FLARE: false,
    FLARE_STYLE: 'Soft',
    GAMMA: false,
    GAMMA_MODE: 'Standard',
    SPECULAR: false,
    SPECULAR_STYLE: 'Glossy',
    GLOW_INTENSITY: 0,
    GLOW_RADIUS: 40,
    REFRACTION: 0,
    REFLECTION: 0,
    TRANSPARENCY: 0,
    DEPTH: 0,
    BLACKLIGHT_INTENSITY: 60,
    FLUORESCENCE: 50,
    UV_MODE: 'Full Spectrum',
    PIXELS: false,
    PIXEL_MODE: '4×',
    NEON: false,
    EMBOSS: false,
    FRINGE: false,
    FILTER: false,
    SATURATION: 50,
    CONTRAST: 50,
    INVERT: false,
    SHAKE: false,
    SHAKE_STYLE: 'Normal',
    MOTION: false,
    MOTION_STYLE: 'Smooth',
    MOTION_INTENSITY: 50,
    CHROMATIC_ABERRATION: 0,
    BLUR: 0,
    SHARPEN: 0,
    COLOR_VARIATION: 0,
    // Stage 4: particles
    PARTICLES: false,
    PARTICLE_MIX: 50,
    PARTICLE_INTENSITY: 50,
    PARTICLE_SPEED: 50,
    PARTICLE_AMOUNT: 'Very High',
    PARTICLE_STYLE: 'Glow',
    PARTICLE_SIZE: 20,
    PARTICLE_LENGTH: 40,
    PARTICLE_DENSITY: 100,
    PARTICLE_GLOW: 30,
    PARTICLE_SPREAD: 100,
    PARTICLE_TURBULENCE: 0,
    PARTICLE_FADE: 30,
    PARTICLE_ATTRACTION: 0,
    PARTICLE_COLLISION: false,
    PARTICLE_TRAILS: false,
    PARTICLE_COLOR_MODE: 'Fluid Color',
    PARTICLE_COLOR: { r: 120, g: 220, b: 255 },
    // Stage 5
    SIM_MODE: 'Standard Fluid',
    // Stage 6
    FPS_LIMIT: 'Unlimited',
    ADAPTIVE_QUALITY: false,
    PERFORMANCE_MODE: 'Performance',
    RENDER_SCALE: 100,
    EFFECT_QUALITY: 'Medium',
    PARTICLE_LIMIT: 'Maximum',
    BATTERY_SAVER: false,
    // Stage 7
    TEXT: false,
    TEXT_MODE: 'Paint',
    TEXT_CONTENT: 'Fluid Fix',
    TEXT_FONT: 'Sans',
    TEXT_SIZE: 40,
    TEXT_COLOR: { r: 255, g: 255, b: 255 },
    TEXT_OUTLINE: false,
    TEXT_OUTLINE_THICKNESS: 30,
    TEXT_GLOW: false,
    TEXT_GLOW_INTENSITY: 50,
    TEXT_X: 50,
    TEXT_Y: 50,
    TEXT_ROTATION: 50,
    TEXT_OPACITY: 100,
    BG_BRIGHTNESS: 50,
    BG_BLUR: 0,
    BG_OPACITY: 100,
    SPLASHES: false,
    WALLPAPER_CLEAR: false,
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
    'White':      ['#ffffff', '#f2f2f4', '#000000'],
    'Transparent': null, // nothing drawn; screenshots get a transparent background
    'Custom':     null, // uses BACK_COLOR
    'Midnight':   ['#0b1026', '#000000', '#0a1a40'],
    'Nebula':     ['#1a0533', '#05010d', '#3b0a5e'],
    'Deep Ocean': ['#002233', '#000814', '#003b5c'],
    'Ember':      ['#1f0500', '#000000', '#3d0c00'],
    'Forest':     ['#04170f', '#000604', '#0b2e1c'],
    'Charcoal':   ['#2b2b2e', '#121214', '#000000'],
    'Paper':      ['#f5f2ea', '#e4ded0', '#000000'],
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
            out.push([(px * c - py * s) / ar + 0.5, px * s + py * c + 0.5, dx * c - dy * s, dx * s + dy * c, false]);
            // reflected copy
            out.push([(-px * c - py * s) / ar + 0.5, -px * s + py * c + 0.5, -dx * c - dy * s, -dx * s + dy * c, true]);
        }
        return dedupeCopies(out);
    }
    switch (config.MIRROR_MODE) {
        case 'Horizontal':
            return dedupeCopies([[x, y, dx, dy, false], [1 - x, y, -dx, dy, true]]);
        case 'Vertical':
            return dedupeCopies([[x, y, dx, dy, false], [x, 1 - y, dx, -dy, true]]);
        case 'Diagonal':
            return dedupeCopies([[x, y, dx, dy, false], [1 - x, 1 - y, -dx, -dy, false]]);
        case 'Complex':
            return dedupeCopies([[x, y, dx, dy, false], [1 - x, y, -dx, dy, true],
                                 [x, 1 - y, dx, -dy, true], [1 - x, 1 - y, -dx, -dy, false]]);
    }
    return [[x, y, dx, dy, false]];
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
        const I = config.BLACKLIGHT_INTENSITY / 100;
        const f = 0.3 + 0.65 * I;
        const uv = uvColor();
        const tint = uv ? { r: uv[0] * 0.3, g: uv[1] * 0.3, b: uv[2] * 0.3 } : { r: 0.12, g: 0.0, b: 0.28 };
        top = lerpColor(top, { r: 0.02, g: 0.0, b: 0.06 }, f);
        bottom = lerpColor(bottom, { r: 0.0, g: 0.0, b: 0.02 }, f);
        glow = { r: glow.r + tint.r * I, g: glow.g + tint.g * I, b: glow.b + tint.b * I };
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
    config.DENSITY_DISSIPATION = pctFadeTo(rand(20, 100));
    config.VELOCITY_DISSIPATION = rand(0.1, 0.8);
    config.BLOOM_INTENSITY = rand(0.5, 1.3);
    config.BLOOM_THRESHOLD = rand(0.45, 0.75);
    config.SUNRAYS_WEIGHT = rand(0.5, 1.0);
    config.RAINBOW = Math.random() < 0.25;
    config.TRAILS = Math.random() < 0.3;
    config.BLACKLIGHT = Math.random() < 0.2;
    const sym = Math.random();
    config.MIRROR_MODE = sym >= 0.5 && sym < 0.75 ? pick(['Horizontal', 'Vertical', 'Diagonal', 'Complex']) : 'None';
    config.KALEIDOSCOPE = sym >= 0.75;
    config.KALEIDO_SEGMENTS = Math.round(rand(3, 8));
    updateKeywords();
    refreshGUI();
    splatStack.push(Math.round(rand(8, 18)));

    let label = palette + ' · ' + background;
    if (config.KALEIDOSCOPE) label += ' · Kaleidoscope';
    else if (config.MIRROR_MODE !== 'None') label += ' · Mirror ' + config.MIRROR_MODE;
    showToast(label);
}

function toggleFreeze () {
    config.PAUSED = !config.PAUSED;
    showToast(config.PAUSED ? 'Frozen' : 'Resumed');
}

function toggleMode (key, label) {
    config[key] = !config[key];
    if (key === 'KALEIDOSCOPE' && config.KALEIDOSCOPE) config.MIRROR_MODE = 'None';
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

let freezeController = null;
let freezeShown = null;

// Keeps the Freeze button label in step with the current state
function syncTopMenu () {
    if (!freezeController || freezeShown === config.PAUSED) return;
    freezeShown = config.PAUSED;
    freezeController.name(config.PAUSED ? '▶ Resume' : '❄ Freeze');
}

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
    this.justDown = false;
    this.heldTime = 0;
    this.dirX = 0;
    this.dirY = 1;
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
// Dissipation: seconds for color to fade 95% of the way out. 0% = 0.2 s, 100% = 3 s.
// The dye fades exponentially at rate d, so that takes ln(20) / d seconds.
const FADE_LN = Math.log(20);
const fadeSeconds = p => 0.2 + 2.8 * p / 100;
const pctFadeTo = p => FADE_LN / fadeSeconds(p);
const pctFadeFrom = d => d > 0 ? (FADE_LN / d - 0.2) / 2.8 * 100 : 100;
const pctSquareTo = max => p => max * (p / 100) * (p / 100);           // finer control at the low end
const pctSquareFrom = max => v => 100 * Math.sqrt(Math.max(v, 0) / max);
const pctLinTo = (min, max) => p => min + (max - min) * p / 100;
const pctLinFrom = (min, max) => v => 100 * (v - min) / (max - min);

const PCT = {
    SPEED:           { cfg: 'SPEED',                to: pctSpeedTo,          from: pctSpeedFrom },
    RADIUS:          { cfg: 'SPLAT_RADIUS',         to: pctLinTo(0.01, 1),   from: pctLinFrom(0.01, 1) },
    DISSIPATION:     { cfg: 'DENSITY_DISSIPATION',  to: pctFadeTo,           from: pctFadeFrom },
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
        || config.FORCE_FIELD !== 'None' && config.FIELD_STRENGTH > 0
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

// Stage 2: touch, gestures, injection modes and force fields

const GESTURE_MODES = ['Push', 'Pull', 'Swirl', 'Attract', 'Repel', 'Inject', 'Erase', 'Vortex'];
const INJECTION_MODES = ['Continuous', 'Burst', 'Pulse', 'Spray', 'Fountain', 'Random', 'Directional'];
const FORCE_FIELDS = ['None', 'Vortex', 'Attractor', 'Repeller', 'Spiral', 'Radial', 'Wave', 'Magnetic'];

// 0..50% = 0.2x..1x, 50..100% = 1x..3x
const pctScaleTo = p => p <= 50 ? 0.2 + 0.8 * p / 50 : 1 + (p - 50) / 25;

let splatRadiusScale = 1;

function activeTouchCount () {
    return pointers.filter(p => p.down).length;
}

function cycleSetting (key, list, label) {
    const i = list.indexOf(config[key]);
    config[key] = list[(i + 1) % list.length];
    showToast(label + ' · ' + config[key]);
}

// Applies a local effect around (x, y) on velocity and/or dye, honoring Mirror/Kaleidoscope.
// radial/tangential add velocity (texels/s), warp moves color (+ away, - toward), fade erases color.
function pointEffect (x, y, opts) {
    const radius = correctRadius(config.SPLAT_RADIUS * splatRadiusScale * (opts.area || 4) / 100.0);
    symmetryCopies(x, y, 0, 0).forEach(c => {
        const spin = c[4] ? -1 : 1;
        if (opts.radial || opts.tangential) {
            pointForceProgram.bind();
            const u = pointForceProgram.uniforms;
            gl.uniform1i(u.uTarget, velocity.read.attach(0));
            gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);
            gl.uniform2f(u.point, c[0], c[1]);
            gl.uniform1f(u.radius, radius);
            gl.uniform1f(u.radial, opts.radial || 0);
            gl.uniform1f(u.tangential, (opts.tangential || 0) * spin);
            gl.uniform1f(u.warp, 0);
            gl.uniform1f(u.fade, opts.velocityFade || 0);
            blit(velocity.write);
            velocity.swap();
        }
        if (opts.warp || opts.fade) {
            pointForceProgram.bind();
            const u = pointForceProgram.uniforms;
            gl.uniform1i(u.uTarget, dye.read.attach(0));
            gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);
            gl.uniform2f(u.point, c[0], c[1]);
            gl.uniform1f(u.radius, radius);
            gl.uniform1f(u.radial, 0);
            gl.uniform1f(u.tangential, 0);
            gl.uniform1f(u.warp, opts.warp || 0);
            gl.uniform1f(u.fade, opts.fade || 0);
            blit(dye.write);
            dye.swap();
        }
    });
}

function randomSpectrumColor () {
    return finishColor(HSVtoRGB(Math.random(), 1.0, 1.0));
}

// How color leaves the finger
function injectColor (p, moved, dt, vx, vy, force) {
    const x = p.texcoordX, y = p.texcoordY;
    const mode = config.INJECTION;
    const ar = canvas.width / canvas.height;
    const jet = 900 * force;

    switch (mode) {
        case 'Continuous':
            if (moved) strokeSplat(p, vx, vy, p.color, 1);
            else if (config.CONTINUOUS_DRAWING) emitSplat(x, y, 0, 0, p.color, 0.5);
            break;
        case 'Burst':
            if (p.justDown) {
                for (let i = 0; i < 10; i++) {
                    const a = (Math.PI * 2 * i) / 10;
                    emitSplat(x, y, Math.cos(a) * jet * 1.3, Math.sin(a) * jet * 1.3, colorAt(i / 10 + Math.random() * 0.1), 2.5);
                }
            }
            if (moved) emitSplat(x, y, vx, vy, p.color, 0.6);
            else if (config.CONTINUOUS_DRAWING) emitSplat(x, y, 0, 0, p.color, 0.3);
            break;
        case 'Pulse': {
            const phase = Math.sin(p.heldTime * Math.PI * 2 * 2.5);
            if (phase > 0.2) emitSplat(x, y, vx, vy, p.color, 1.6 * phase);
            else if (moved) emitSplat(x, y, vx, vy, p.color, 0.15);
            break;
        }
        case 'Spray': {
            splatRadiusScale *= 0.35;
            for (let i = 0; i < 4; i++) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()) * 0.06 * splatRadiusScale / 0.35;
                emitSplat(x + Math.cos(a) * r / ar, y + Math.sin(a) * r,
                          vx * 0.5 + Math.cos(a) * jet * 0.25, vy * 0.5 + Math.sin(a) * jet * 0.25, p.color, 0.9);
            }
            splatRadiusScale /= 0.35;
            break;
        }
        case 'Fountain': {
            const a = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
            emitSplat(x, y, Math.cos(a) * jet + vx * 0.3, Math.sin(a) * jet + vy * 0.3, p.color, 0.8);
            break;
        }
        case 'Random': {
            const a = Math.random() * Math.PI * 2;
            emitSplat(x, y, Math.cos(a) * jet * 0.8 + vx * 0.5, Math.sin(a) * jet * 0.8 + vy * 0.5, randomSpectrumColor(), 0.9);
            break;
        }
        case 'Directional':
            emitSplat(x, y, p.dirX * jet + vx * 0.3, p.dirY * jet + vy * 0.3, p.color, 0.8);
            break;
    }
}

// Lays a stroke from the previous to the current position, filling gaps on fast swipes or low frame rates
function strokeSplat (p, vx, vy, color, dyeScale) {
    const ar = canvas.width / canvas.height;
    const dist = Math.hypot((p.texcoordX - p.prevTexcoordX) * ar, p.texcoordY - p.prevTexcoordY);
    const spacing = Math.max(0.01, Math.sqrt(config.SPLAT_RADIUS * splatRadiusScale / 100) * 0.7);
    const n = Math.min(8, Math.max(1, Math.ceil(dist / spacing)));
    for (let i = 1; i <= n; i++) {
        const t = i / n;
        const x = p.prevTexcoordX + (p.texcoordX - p.prevTexcoordX) * t;
        const y = p.prevTexcoordY + (p.texcoordY - p.prevTexcoordY) * t;
        emitSplat(x, y, vx / n, vy / n, color, dyeScale);
    }
}

// Runs every frame for each finger / mouse button that is down (or just moved)
function updateTouches (dt) {
    const multi = activeTouchCount() > 1 ? pctScaleTo(config.MULTI_TOUCH) : 1;
    const force = config.INTENSITY * multi;
    const attract = config.TOUCH_ATTRACTION / 100;
    const repel = config.TOUCH_REPULSION / 100;
    splatRadiusScale = pctScaleTo(config.TOUCH_RADIUS);

    pointers.forEach(p => {
        const moved = p.moved;
        p.moved = false;
        if (!p.down && !moved) return;
        if (p.down) p.heldTime = (p.heldTime || 0) + dt;

        const x = p.texcoordX, y = p.texcoordY;
        // Reverse Flow: the fluid moves against your finger
        const dirSign = config.SIM_MODE === 'Reverse Flow' ? -1 : 1;
        const vx = p.deltaX * config.SPLAT_FORCE * force * dirSign;
        const vy = p.deltaY * config.SPLAT_FORCE * force * dirSign;

        switch (config.GESTURE) {
            case 'Push':
                injectColor(p, moved, dt, vx, vy, force);
                break;
            case 'Pull':
                pointEffect(x, y, { warp: -0.35 * force * dt, area: 5 });
                injectColor(p, moved, dt, vx * 0.4, vy * 0.4, force * 0.5);
                break;
            case 'Swirl':
                pointEffect(x, y, { tangential: 2200 * force * dt, area: 4 });
                injectColor(p, moved, dt, vx * 0.5, vy * 0.5, force * 0.5);
                break;
            case 'Attract':
                if (p.down) pointEffect(x, y, { radial: -900 * force * dt, warp: -0.4 * force * dt, area: 7 });
                break;
            case 'Repel':
                if (p.down) pointEffect(x, y, { radial: 900 * force * dt, warp: 0.4 * force * dt, area: 7 });
                break;
            case 'Inject':
                injectColor(p, moved, dt, vx * 0.15, vy * 0.15, force * 0.25);
                if (p.down && !moved && config.INJECTION === 'Continuous' && !config.CONTINUOUS_DRAWING)
                    emitSplat(x, y, 0, 0, p.color, 0.5);
                break;
            case 'Erase':
                if (p.down || moved) pointEffect(x, y, { fade: Math.min(1, 8 * dt), velocityFade: Math.min(1, 3 * dt), area: 3 });
                break;
            case 'Vortex':
                if (p.down) pointEffect(x, y, { tangential: 3500 * force * dt, warp: -0.15 * force * dt, area: 6 });
                injectColor(p, moved, dt, vx * 0.3, vy * 0.3, force * 0.4);
                break;
        }

        if (p.down && (attract > 0 || repel > 0)) {
            const net = repel - attract;
            pointEffect(x, y, { radial: net * 900 * dt, warp: net * 0.3 * dt, area: 7 });
        }

        p.justDown = false;
    });

    splatRadiusScale = 1;
}

// Stage 3: effects, blacklight and filters

const MIRROR_MODES = ['None', 'Horizontal', 'Vertical', 'Diagonal', 'Complex'];
const FLARE_STYLES = ['Soft', 'Sharp', 'Radial', 'Cinematic'];
const GAMMA_MODES = ['Standard', 'Bright', 'Dark', 'Cinematic'];
const SPECULAR_STYLES = { 'Soft': [8, 0.6], 'Glossy': [32, 1.0], 'Sharp': [128, 1.6] };
const UV_MODES = {
    'Neon Blue':        [0.10, 0.45, 1.00],
    'Electric Purple':  [0.62, 0.15, 1.00],
    'Fluorescent Pink': [1.00, 0.15, 0.65],
    'Toxic Green':      [0.35, 1.00, 0.10],
    'Neon Orange':      [1.00, 0.45, 0.05],
    'Ultraviolet':      [0.35, 0.05, 0.95],
    'Cyan':             [0.00, 0.95, 1.00],
    'Full Spectrum':    null,
};
const PIXEL_MODES = { '2×': 2, '4×': 4, '8×': 8, '16×': 16 };
const SHAKE_STYLES = { 'Subtle': 0.003, 'Normal': 0.008, 'Strong': 0.02 };
const MOTION_STYLES = ['Smooth', 'Fluid', 'Dramatic'];

let glowFBO = null;
let glowTemp = null;
let frameFBO = null;
let historyFBO = null;
let postTime = 0;
let shakeEnergy = 0;
let shakeOffset = { x: 0, y: 0 };

function postKeywords () {
    const k = [];
    if (config.CHROMATIC_ABERRATION > 0 || config.FRINGE) k.push('CHROMA');
    if (config.SHAKE) k.push('SHAKE');
    if (config.PIXELS) k.push('PIXELATE');
    if (config.BLUR > 0) k.push('BLUR');
    if (config.SHARPEN > 0) k.push('SHARPEN');
    if (config.EMBOSS) k.push('EMBOSS');
    if (config.NEON) k.push('NEON');
    if (config.SATURATION !== 50 || config.CONTRAST !== 50 || config.COLOR_VARIATION > 0) k.push('GRADE');
    if (config.GAMMA) k.push('GAMMA');
    if (config.FILTER) k.push('FILM');
    if (config.INVERT) k.push('INVERT');
    if (config.MOTION) k.push('MOTION');
    return k;
}

function ensurePostFramebuffers () {
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    if (frameFBO && frameFBO.width === w && frameFBO.height === h) return;
    frameFBO = createFBO(w, h, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    historyFBO = createDoubleFBO(w, h, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
}

// Screen shake follows how hard you are stirring, with a little constant life
function updateShake (dt) {
    let motion = 0;
    pointers.forEach(p => {
        if (p.down) motion += Math.hypot(p.deltaX, p.deltaY);
    });
    shakeEnergy = Math.min(1.5, shakeEnergy * Math.exp(-4 * dt) + motion * 6);
    const amp = (SHAKE_STYLES[config.SHAKE_STYLE] || 0.008) * (0.15 + shakeEnergy);
    const t = postTime;
    shakeOffset.x = amp * (Math.sin(t * 37.1) * 0.6 + Math.sin(t * 23.7 + 1.3) * 0.4);
    shakeOffset.y = amp * (Math.sin(t * 31.3 + 0.7) * 0.6 + Math.sin(t * 19.9 + 2.1) * 0.4);
}

function runPost (dt) {
    postTime += dt;
    if (config.SHAKE) updateShake(dt);
    postMaterial.setKeywords(postKeywords());
    postMaterial.bind();
    const u = postMaterial.uniforms;
    const dpr = pixelRatio();
    gl.disable(gl.BLEND);
    gl.uniform1i(u.uFrame, frameFBO.attach(0));
    gl.uniform1i(u.uHistory, historyFBO.read.attach(1));
    gl.uniform2f(u.resolution, frameFBO.width, frameFBO.height);
    gl.uniform1f(u.time, postTime);
    gl.uniform2f(u.shake, shakeOffset.x, shakeOffset.y);
    gl.uniform1f(u.pixelSize, (PIXEL_MODES[config.PIXEL_MODE] || 4) * 3 * dpr);
    gl.uniform1f(u.caAmount, config.CHROMATIC_ABERRATION / 100 * 0.012);
    gl.uniform1f(u.fringeAmount, config.FRINGE ? 0.025 : 0);
    gl.uniform1f(u.blurAmount, config.BLUR / 100 * 6 * dpr);
    gl.uniform1f(u.sharpenAmount, config.SHARPEN / 100 * 2.5);
    gl.uniform1f(u.saturation, config.SATURATION / 50);
    gl.uniform1f(u.contrast, 0.3 + config.CONTRAST / 100 * 1.4);
    gl.uniform1f(u.variation, config.COLOR_VARIATION / 100 * 0.5);
    gl.uniform1f(u.gammaMode, GAMMA_MODES.indexOf(config.GAMMA_MODE));
    gl.uniform1f(u.motionMix, 0.5 + config.MOTION_INTENSITY / 100 * 0.47);
    gl.uniform1f(u.motionStyle, MOTION_STYLES.indexOf(config.MOTION_STYLE));
    if (config.MOTION) {
        blit(historyFBO.write);
        historyFBO.swap();
        copyProgram.bind();
        gl.uniform1i(copyProgram.uniforms.uTexture, historyFBO.read.attach(0));
        blit(null);
    } else {
        blit(null);
    }
}

function applyGlow () {
    if (!glowFBO) return;
    gl.disable(gl.BLEND);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, dye.read.attach(0));
    blit(glowFBO);
    blur(glowFBO, glowTemp, 1 + Math.round(config.GLOW_RADIUS / 100 * 11));
}

function uvColor () {
    return UV_MODES[config.UV_MODE] || null;
}

function cycleMirror () {
    cycleSetting('MIRROR_MODE', MIRROR_MODES, 'Mirror');
    if (config.MIRROR_MODE !== 'None') config.KALEIDOSCOPE = false;
}

// Stage 4: GPU particles

const PARTICLE_AMOUNTS = {
    'Very Low': 128, 'Low': 256, 'Medium': 512, 'High': 1024,
    'Very High': 2048, 'Ultra': 4096, 'Extreme': 8192, 'Maximum': 16384,
};
const PARTICLE_STYLES = ['Points', 'Lines', 'Trails', 'Circles', 'Glow', 'Sparks', 'Bubbles', 'Dust', 'Orbs', 'Waves'];
const PARTICLE_COLOR_MODES = ['Fluid Color', 'Single Color', 'Random', 'Velocity-Based', 'Rainbow', 'Gradient', 'Temperature-Based'];

const particles = {
    supported: null,     // decided on first use
    floatType: null,
    internalFormat: null,
    programs: null,
    state: null,         // double FBO: xy = position, z = age, w = seed
    count: 0,
    width: 0,
    height: 0,
    vertexBuffer: null,
    density: null,
    trail: null,
    time: 0,
    warned: false,
};

const PARTICLE_GLSL_COMMON = `
    float phash (vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float pnoise (vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(phash(i), phash(i + vec2(1.0, 0.0)), u.x),
                   mix(phash(i + vec2(0.0, 1.0)), phash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    vec3 hsv2rgb (vec3 c) {
        vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
        return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
    }
`;

const particleUpdateSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uState;
    uniform sampler2D uVelocity;
    uniform sampler2D uDensity;
    uniform vec2 velTexel;
    uniform float dt;
    uniform float time;
    uniform float aspectRatio;
    uniform float turbulence;
    uniform float attraction;
    uniform float collision;
    uniform float lifetime;
    uniform float spawnMode;
    uniform vec2 spawnPoint;
    uniform float spawnRadius;
    uniform float wrapEdges;
    uniform vec2 densityTexel;
    ${PARTICLE_GLSL_COMMON}

    void main () {
        vec4 s = texture2D(uState, vUv);
        vec2 p = s.xy;
        float age = s.z;
        float seed = s.w;

        // Ride the fluid (velocity is stored in texels per second)
        vec2 v = texture2D(uVelocity, p).xy * velTexel;

        if (turbulence > 0.0) {
            vec2 q = p * vec2(aspectRatio, 1.0) * 4.0 + vec2(time * 0.2, -time * 0.15) + seed * 0.3;
            float e = 0.05;
            float n1 = pnoise(q + vec2(0.0, e));
            float n2 = pnoise(q - vec2(0.0, e));
            float n3 = pnoise(q + vec2(e, 0.0));
            float n4 = pnoise(q - vec2(e, 0.0));
            v += vec2(n1 - n2, -(n3 - n4)) / (2.0 * e) * turbulence;
        }

        if (attraction > 0.0 || collision > 0.0) {
            float dl = texture2D(uDensity, p - vec2(densityTexel.x, 0.0)).r;
            float dr = texture2D(uDensity, p + vec2(densityTexel.x, 0.0)).r;
            float db = texture2D(uDensity, p - vec2(0.0, densityTexel.y)).r;
            float dtp = texture2D(uDensity, p + vec2(0.0, densityTexel.y)).r;
            float here = texture2D(uDensity, p).r;
            vec2 g = vec2(dr - dl, dtp - db);
            // Attraction: drift toward crowds; Collision: push apart where crowded
            v += g * attraction;
            v -= g * collision * smoothstep(0.15, 0.5, here);
        }

        p += v * dt;
        age += dt;

        if (wrapEdges > 0.5) p = fract(p);

        float life = lifetime * (0.6 + 0.8 * seed);
        bool outside = p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0;
        if (age > life || outside) {
            float r1 = phash(vUv * 97.0 + vec2(time * 13.7, seed * 31.1));
            float r2 = phash(vUv * 53.0 + vec2(seed * 17.3, time * 7.9));
            if (spawnMode < 0.5) {
                p = vec2(r1, r2);
            } else {
                float a = r1 * 6.2831853;
                float rr = sqrt(r2) * spawnRadius;
                p = clamp(spawnPoint + vec2(cos(a) * rr / aspectRatio, sin(a) * rr), 0.001, 0.999);
            }
            age = 0.0;
        }

        gl_FragColor = vec4(p, age, seed);
    }
`;

const particleVertexSource = `
    precision highp float;
    precision highp sampler2D;

    attribute float aVertex;
    uniform sampler2D uState;
    uniform sampler2D uVelocity;
    uniform sampler2D uDye;
    uniform vec2 stateSize;
    uniform float activeCount;
    uniform vec2 velTexel;
    uniform vec2 viewport;
    uniform float size;
    uniform float lengthScale;
    uniform float style;
    uniform float glow;
    uniform float time;
    uniform float lifetime;
    uniform float colorMode;
    uniform float rainbowHue;
    uniform vec3 singleColor;
    uniform vec3 pal0;
    uniform vec3 pal1;
    uniform vec3 pal2;
    uniform vec3 pal3;
    uniform vec3 pal4;

    varying vec2 vLocal;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vSeed;
    varying float vAspect;
    ${PARTICLE_GLSL_COMMON}

    vec3 paletteAt (float t) {
        float f = fract(t) * 5.0;
        if (f < 1.0) return mix(pal0, pal1, f);
        if (f < 2.0) return mix(pal1, pal2, f - 1.0);
        if (f < 3.0) return mix(pal2, pal3, f - 2.0);
        if (f < 4.0) return mix(pal3, pal4, f - 3.0);
        return mix(pal4, pal0, f - 4.0);
    }

    void main () {
        float idx = floor(aVertex / 6.0 + 0.001);
        float corner = aVertex - idx * 6.0;
        if (idx >= activeCount) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            return;
        }

        vec2 suv = (vec2(mod(idx, stateSize.x), floor(idx / stateSize.x)) + 0.5) / stateSize;
        vec4 s = texture2D(uState, suv);
        vec2 p = s.xy;
        float age = s.z;
        float seed = s.w;

        vec2 v = texture2D(uVelocity, p).xy * velTexel;
        vec2 vpx = v * viewport;
        float spd = length(vpx);
        vec2 dir = spd > 0.001 ? vpx / spd : vec2(1.0, 0.0);
        vec2 nrm = vec2(-dir.y, dir.x);

        // Style-dependent footprint
        float w = size;
        float stretch = 0.0;
        if (style > 0.5 && style < 2.5) { w = size * 0.6; stretch = spd * lengthScale; }   // Lines, Trails
        else if (style > 3.5 && style < 4.5) { w = size * 3.0; }                            // Glow
        else if (style > 4.5 && style < 5.5) { w = size * 0.5; stretch = spd * lengthScale * 0.6 + size; } // Sparks
        else if (style > 5.5 && style < 6.5) { w = size * 2.2; }                            // Bubbles
        else if (style > 6.5 && style < 7.5) { w = size * 0.6; }                            // Dust
        else if (style > 7.5 && style < 8.5) { w = size * 2.6; }                            // Orbs
        else if (style > 8.5) { w = size * 2.0; stretch = spd * lengthScale + size * 2.0; } // Waves

        float gf = 1.0 + glow * 1.5;
        float halfW = w * 0.5 * gf;
        float halfL = (w * 0.5 + stretch * 0.5) * gf;

        vec2 c;
        if (corner < 0.5) c = vec2(-1.0, -1.0);
        else if (corner < 1.5) c = vec2(1.0, -1.0);
        else if (corner < 2.5) c = vec2(1.0, 1.0);
        else if (corner < 3.5) c = vec2(-1.0, -1.0);
        else if (corner < 4.5) c = vec2(1.0, 1.0);
        else c = vec2(-1.0, 1.0);

        vec2 centerPx = p * viewport - dir * stretch * 0.5;
        vec2 posPx = centerPx + dir * c.x * halfL + nrm * c.y * halfW;
        gl_Position = vec4(posPx / viewport * 2.0 - 1.0, 0.0, 1.0);

        vLocal = c * gf;
        vAspect = halfL / max(halfW, 0.001);
        vSeed = seed;

        // Color
        vec3 dye = texture2D(uDye, p).rgb;
        float dm = max(dye.r, max(dye.g, dye.b));
        vec3 col;
        if (colorMode < 0.5) {
            col = mix(vec3(0.75), dye / max(dm, 0.001), smoothstep(0.0, 0.08, dm));
        } else if (colorMode < 1.5) {
            col = singleColor;
        } else if (colorMode < 2.5) {
            col = hsv2rgb(vec3(seed, 0.85, 1.0));
        } else if (colorMode < 3.5) {
            float t = clamp(spd / 700.0, 0.0, 1.0);
            col = t < 0.5 ? mix(vec3(0.1, 0.25, 1.0), vec3(0.1, 0.95, 1.0), t * 2.0)
                          : mix(vec3(0.1, 0.95, 1.0), vec3(1.0), (t - 0.5) * 2.0);
        } else if (colorMode < 4.5) {
            col = hsv2rgb(vec3(fract(rainbowHue + seed * 0.15 + p.x * 0.35), 0.9, 1.0));
        } else if (colorMode < 5.5) {
            col = paletteAt(seed);
        } else {
            float t = clamp(dm * 1.5 + spd / 1500.0, 0.0, 1.0);
            col = t < 0.33 ? mix(vec3(0.25, 0.0, 0.0), vec3(1.0, 0.15, 0.0), t * 3.0)
                : t < 0.66 ? mix(vec3(1.0, 0.15, 0.0), vec3(1.0, 0.8, 0.1), (t - 0.33) * 3.0)
                           : mix(vec3(1.0, 0.8, 0.1), vec3(1.0), (t - 0.66) * 3.0);
        }
        vColor = col;

        float life = lifetime * (0.6 + 0.8 * seed);
        vAlpha = smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(life * 0.7, life, age));
    }
`;

const particleFragmentSource = `
    precision highp float;

    varying vec2 vLocal;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vSeed;
    varying float vAspect;
    uniform float style;
    uniform float intensity;
    uniform float glow;
    uniform float time;
    ${PARTICLE_GLSL_COMMON}

    void main () {
        // x runs along the direction of motion (head at +x), y across it
        vec2 q = vLocal;
        float d = length(q);
        float a = 0.0;
        vec3 col = vColor;

        if (style < 0.5) {                 // Points
            a = 1.0 - smoothstep(0.6, 1.0, d);
        } else if (style < 1.5) {          // Lines: even streak
            float along = 1.0 - smoothstep(0.85, 1.0, abs(q.x));
            a = along * (1.0 - smoothstep(0.3, 1.0, abs(q.y)));
        } else if (style < 2.5) {          // Trails: bright head, fading tail
            float along = smoothstep(-1.0, 0.9, q.x) * (1.0 - smoothstep(0.9, 1.0, q.x));
            a = along * along * (1.0 - smoothstep(0.4, 1.0, abs(q.y)));
        } else if (style < 3.5) {          // Circles: rings
            a = smoothstep(0.55, 0.7, d) * (1.0 - smoothstep(0.85, 1.0, d));
        } else if (style < 4.5) {          // Glow: soft light
            a = exp(-d * d * 3.5);
        } else if (style < 5.5) {          // Sparks: sharp tapered streaks that flicker
            float taper = 1.0 - abs(q.x);
            a = taper * (1.0 - smoothstep(0.0, 0.6 * taper + 0.05, abs(q.y)));
            a *= 0.6 + 0.8 * phash(vec2(vSeed * 91.0, floor(time * 24.0)));
            col = mix(col, vec3(1.0), 0.45);
        } else if (style < 6.5) {          // Bubbles: thin rim, highlight, faint body
            float rim = smoothstep(0.72, 0.88, d) * (1.0 - smoothstep(0.92, 1.0, d));
            float hl = exp(-dot(q - vec2(-0.35, 0.35), q - vec2(-0.35, 0.35)) * 40.0);
            a = rim * 0.9 + hl * 0.9 + (1.0 - smoothstep(0.85, 1.0, d)) * 0.07;
            col = mix(col, vec3(1.0), hl * 0.8);
        } else if (style < 7.5) {          // Dust: tiny, dim, twinkling
            a = (1.0 - smoothstep(0.3, 1.0, d)) * 0.45;
            a *= 0.5 + 0.5 * sin(time * 3.0 + vSeed * 40.0);
        } else if (style < 8.5) {          // Orbs: shaded spheres with a highlight
            float z = sqrt(max(1.0 - d * d, 0.0));
            float shade = 0.35 + 0.65 * clamp(dot(normalize(vec3(q.x, q.y, z + 1e-4)), normalize(vec3(-0.4, 0.5, 0.8))), 0.0, 1.0);
            float spec = pow(clamp(dot(normalize(vec3(q.x, q.y, z + 1e-4)), normalize(vec3(-0.3, 0.4, 1.0))), 0.0, 1.0), 30.0);
            a = 1.0 - smoothstep(0.92, 1.0, d);
            col = col * shade + vec3(spec);
        } else {                           // Waves: wavy ribbons
            float y = q.y - 0.45 * sin(q.x * vAspect * 3.1416 + time * 6.0 + vSeed * 20.0);
            float along = 1.0 - smoothstep(0.8, 1.0, abs(q.x));
            a = along * (1.0 - smoothstep(0.08, 0.3, abs(y)));
        }

        // Halo around the core (Particle Glow)
        float halo = glow * exp(-d * d * 1.2) * 0.6;

        float alpha = (a + halo) * vAlpha;
        gl_FragColor = vec4(col * alpha * intensity, alpha);
    }
`;

const particleDensityVertexSource = `
    precision highp float;
    precision highp sampler2D;

    attribute float aVertex;
    uniform sampler2D uState;
    uniform vec2 stateSize;
    uniform float activeCount;

    void main () {
        float idx = floor(aVertex / 6.0 + 0.001);
        float corner = aVertex - idx * 6.0;
        // One point per particle: only the first vertex of each quad is used
        if (idx >= activeCount || corner > 0.5) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            gl_PointSize = 1.0;
            return;
        }
        vec2 suv = (vec2(mod(idx, stateSize.x), floor(idx / stateSize.x)) + 0.5) / stateSize;
        vec2 p = texture2D(uState, suv).xy;
        gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
        gl_PointSize = 2.0;
    }
`;

const particleDensityFragmentSource = `
    precision mediump float;
    uniform float amount;

    void main () {
        gl_FragColor = vec4(amount, 0.0, 0.0, 1.0);
    }
`;

const trailFadeSource = `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float keep;

    void main () {
        // The small subtraction stops 8-bit trails from leaving permanent ghosts
        vec4 c = texture2D(uTexture, vUv) * keep - vec4(1.5 / 255.0);
        gl_FragColor = max(c, 0.0);
    }
`;

function linkParticleProgram (vsSource, fsSource) {
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'aVertex');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.trace(gl.getProgramInfoLog(program));
    return { program, uniforms: getUniforms(program), bind () { gl.useProgram(program); } };
}

// Particles need float textures we can render into, and texture reads in the vertex shader
function detectParticleSupport () {
    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 2) return false;
    let internalFormat, type;
    if (isWebGL2Context) {
        if (!gl.getExtension('EXT_color_buffer_float')) return false;
        internalFormat = gl.RGBA32F;
        type = gl.FLOAT;
    } else {
        if (!gl.getExtension('OES_texture_float')) return false;
        gl.getExtension('WEBGL_color_buffer_float');
        internalFormat = gl.RGBA;
        type = gl.FLOAT;
    }
    const test = createFBO(4, 4, internalFormat, gl.RGBA, type, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, test.fbo);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.deleteFramebuffer(test.fbo);
    gl.deleteTexture(test.texture);
    particles.internalFormat = internalFormat;
    particles.floatType = type;
    return ok;
}

function particleStateSize (count) {
    const w = 1 << Math.ceil(Math.log2(Math.sqrt(count)));
    return { w, h: Math.ceil(count / w) };
}

function createParticleTexture (w, h, data) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, particles.internalFormat, w, h, 0, gl.RGBA, particles.floatType, data);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return {
        texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };
}

function setupParticles () {
    const count = effParticleCount();
    if (particles.state && particles.count === count) return;

    const { w, h } = particleStateSize(count);
    const data = new Float32Array(w * h * 4);
    const life = particleLifetime();
    for (let i = 0; i < w * h; i++) {
        const seed = Math.random();
        data[i * 4 + 0] = Math.random();
        data[i * 4 + 1] = Math.random();
        data[i * 4 + 2] = Math.random() * life * (0.6 + 0.8 * seed);  // staggered ages
        data[i * 4 + 3] = seed;
    }
    const a = createParticleTexture(w, h, data);
    const b = createParticleTexture(w, h, data);
    if (particles.state) {
        [particles.state.read, particles.state.write].forEach(f => {
            gl.deleteFramebuffer(f.fbo);
            gl.deleteTexture(f.texture);
        });
    }
    particles.state = {
        read: a, write: b,
        swap () { const t = this.read; this.read = this.write; this.write = t; }
    };
    particles.count = count;
    particles.width = w;
    particles.height = h;

    const verts = new Float32Array(w * h * 6);
    for (let i = 0; i < verts.length; i++) verts[i] = i;
    if (!particles.vertexBuffer) particles.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particles.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    blit.restore();
}

function ensureParticleTargets () {
    if (!particles.density) {
        const res = getResolution(64);
        particles.density = createFBO(res.width, res.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    }
    const tw = Math.max(1, gl.drawingBufferWidth >> 1), th = Math.max(1, gl.drawingBufferHeight >> 1);
    if (config.PARTICLE_TRAILS && (!particles.trail || particles.trail.read.width !== tw || particles.trail.read.height !== th))
        particles.trail = createDoubleFBO(tw, th, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
}

function particlesReady () {
    if (!config.PARTICLES) return false;
    if (particles.supported === null) {
        particles.supported = detectParticleSupport();
        if (particles.supported) {
            particles.programs = {
                update: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, particleUpdateSource)),
                draw: linkParticleProgram(particleVertexSource, particleFragmentSource),
                density: linkParticleProgram(particleDensityVertexSource, particleDensityFragmentSource),
                fade: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, trailFadeSource)),
            };
        }
    }
    if (!particles.supported) {
        if (!particles.warned) {
            particles.warned = true;
            showToast('Particles are not supported on this device');
        }
        return false;
    }
    setupParticles();
    ensureParticleTargets();
    return true;
}

function particleLifetime () {
    return 12 - config.PARTICLE_FADE / 100 * 11.6;   // 0% = 12 s, 100% = 0.4 s
}

function particleActiveCount () {
    return Math.max(1, Math.round(particles.count * config.PARTICLE_DENSITY / 100));
}

function drawParticleQuads (program, mode, count) {
    gl.bindBuffer(gl.ARRAY_BUFFER, particles.vertexBuffer);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.drawArrays(mode, 0, count * 6);
    blit.restore();
}

function updateParticles (dt) {
    if (!particlesReady()) return;
    particles.time += dt;
    const step = config.PAUSED ? 0 : dt * pctSpeedTo(config.PARTICLE_SPEED);
    const active = particleActiveCount();

    const needDensity = config.PARTICLE_ATTRACTION > 0 || config.PARTICLE_COLLISION;
    if (needDensity) {
        const d = particles.programs.density;
        gl.bindFramebuffer(gl.FRAMEBUFFER, particles.density.fbo);
        gl.viewport(0, 0, particles.density.width, particles.density.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        d.bind();
        gl.uniform1i(d.uniforms.uState, particles.state.read.attach(0));
        gl.uniform2f(d.uniforms.stateSize, particles.width, particles.height);
        gl.uniform1f(d.uniforms.activeCount, active);
        // Normalize so an even spread gives about the same density at any amount
        const cells = particles.density.width * particles.density.height;
        gl.uniform1f(d.uniforms.amount, Math.min(0.25, 0.08 * cells / active));
        drawParticleQuads(d, gl.POINTS, active);
        gl.disable(gl.BLEND);
    }

    // Spawn around the first finger when Spread is below 100%
    const spread = config.PARTICLE_SPREAD / 100;
    const finger = pointers.find(p => p.down);
    const spawnAround = spread < 0.999;
    const sp = finger ? [finger.texcoordX, finger.texcoordY] : [0.5, 0.5];

    const u = particles.programs.update;
    gl.disable(gl.BLEND);
    u.bind();
    gl.uniform1i(u.uniforms.uState, particles.state.read.attach(0));
    gl.uniform1i(u.uniforms.uVelocity, velocity.read.attach(1));
    gl.uniform1i(u.uniforms.uDensity, particles.density.attach(2));
    gl.uniform2f(u.uniforms.velTexel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform2f(u.uniforms.densityTexel, particles.density.texelSizeX * 1.5, particles.density.texelSizeY * 1.5);
    gl.uniform1f(u.uniforms.dt, step);
    gl.uniform1f(u.uniforms.time, particles.time);
    gl.uniform1f(u.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform1f(u.uniforms.turbulence, config.PARTICLE_TURBULENCE / 100 * 0.08);
    gl.uniform1f(u.uniforms.attraction, config.PARTICLE_ATTRACTION / 100 * 0.6);
    gl.uniform1f(u.uniforms.collision, config.PARTICLE_COLLISION ? 1.2 : 0);
    gl.uniform1f(u.uniforms.lifetime, particleLifetime());
    gl.uniform1f(u.uniforms.spawnMode, spawnAround ? 1 : 0);
    gl.uniform2f(u.uniforms.spawnPoint, sp[0], sp[1]);
    gl.uniform1f(u.uniforms.spawnRadius, 0.03 + spread * 0.7);
    gl.uniform1f(u.uniforms.wrapEdges, effectiveEdgeMode() === 1 ? 1 : 0);
    blit(particles.state.write);
    particles.state.swap();
}

function particleColors () {
    const c = config.PARTICLE_COLOR;
    const pal = [0, 0.2, 0.4, 0.6, 0.8].map(u => samplePalette(u));
    return { single: [c.r / 255, c.g / 255, c.b / 255], pal };
}

function setParticleDrawUniforms (u, width, height) {
    const dpr = pixelRatio();
    const colors = particleColors();
    gl.uniform1i(u.uState, particles.state.read.attach(0));
    gl.uniform1i(u.uVelocity, velocity.read.attach(1));
    gl.uniform1i(u.uDye, dye.read.attach(2));
    gl.uniform2f(u.stateSize, particles.width, particles.height);
    gl.uniform1f(u.activeCount, particleActiveCount());
    gl.uniform2f(u.velTexel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform2f(u.viewport, width, height);
    gl.uniform1f(u.size, (1 + 23 * Math.pow(config.PARTICLE_SIZE / 100, 1.5)) * dpr * (width / Math.max(gl.drawingBufferWidth, 1)));
    gl.uniform1f(u.lengthScale, config.PARTICLE_LENGTH / 100 * 0.12);
    gl.uniform1f(u.style, PARTICLE_STYLES.indexOf(config.PARTICLE_STYLE));
    gl.uniform1f(u.glow, config.PARTICLE_GLOW / 100);
    gl.uniform1f(u.time, particles.time);
    gl.uniform1f(u.lifetime, particleLifetime());
    gl.uniform1f(u.colorMode, PARTICLE_COLOR_MODES.indexOf(config.PARTICLE_COLOR_MODE));
    gl.uniform1f(u.rainbowHue, rainbowHue);
    gl.uniform3f(u.singleColor, colors.single[0], colors.single[1], colors.single[2]);
    ['pal0', 'pal1', 'pal2', 'pal3', 'pal4'].forEach((k, i) => gl.uniform3f(u[k], colors.pal[i].r, colors.pal[i].g, colors.pal[i].b));
    gl.uniform1f(u.intensity, config.PARTICLE_INTENSITY / 50 * particleMixAmount());
}

// Draws particles additively on top of the fluid in `target`
function renderParticles (target) {
    if (!config.PARTICLES || !particles.supported || !particles.state) return;
    const draw = particles.programs.draw;
    const width = target == null ? gl.drawingBufferWidth : target.width;
    const height = target == null ? gl.drawingBufferHeight : target.height;

    if (config.PARTICLE_TRAILS && particles.trail && (target == null || target === frameFBO)) {
        // Fade the trail buffer, add this frame's particles, then lay it over the scene
        const t = particles.trail;
        gl.disable(gl.BLEND);
        particles.programs.fade.bind();
        gl.uniform1i(particles.programs.fade.uniforms.uTexture, t.read.attach(0));
        gl.uniform1f(particles.programs.fade.uniforms.keep, config.PAUSED ? 1 : 0.9);
        blit(t.write);
        t.swap();

        gl.bindFramebuffer(gl.FRAMEBUFFER, t.read.fbo);
        gl.viewport(0, 0, t.read.width, t.read.height);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        draw.bind();
        setParticleDrawUniforms(draw.uniforms, t.read.width, t.read.height);
        drawParticleQuads(draw, gl.TRIANGLES, particleActiveCount());

        copyProgram.bind();
        gl.uniform1i(copyProgram.uniforms.uTexture, t.read.attach(0));
        blit(target);
    } else {
        if (target == null) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, width, height);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
            gl.viewport(0, 0, width, height);
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        draw.bind();
        setParticleDrawUniforms(draw.uniforms, width, height);
        drawParticleQuads(draw, gl.TRIANGLES, particleActiveCount());
    }
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

// Mix: 0% = only fluid, 50% = both at full strength, 100% = only particles
function fluidAmount () {
    if (!config.PARTICLES || !particles.supported) return 1;
    return Math.min(1, 2 - 2 * config.PARTICLE_MIX / 100);
}

function particleMixAmount () {
    return Math.min(1, 2 * config.PARTICLE_MIX / 100);
}

// Stage 5: simulation modes (presets of existing forces + a small driver that keeps each scene alive)

// Everything a mode may change. Standard Fluid restores exactly these values.
const MODE_BASE = {
    FORCE_FIELD: 'None', FIELD_STRENGTH: 50, SWIRL: 0, TURBULENCE: 0, GRAVITY: 0, BUOYANCY: 50,
    FLOW_DIRECTION: 'None', FLOW_SPEED: 30, CURL: 30, EDGE: 'Wall', VORTEX: false,
    DENSITY_DISSIPATION: 1, VELOCITY_DISSIPATION: 0.2,
};

const SIM_MODES = {
    'Standard Fluid': {},
    'Vortex':         { VORTEX: true, FORCE_FIELD: 'Vortex', FIELD_STRENGTH: 35 },
    'Whirlpool':      { FORCE_FIELD: 'Spiral', FIELD_STRENGTH: 70, CURL: 20 },
    'Tornado':        { BUOYANCY: 85, TURBULENCE: 25, CURL: 45 },
    'Explosion':      { CURL: 35, DENSITY_DISSIPATION: pctFadeTo(65), VELOCITY_DISSIPATION: 0.5 },
    'Fountain':       { GRAVITY: 55, CURL: 15 },
    'Waterfall':      { GRAVITY: 70, FLOW_DIRECTION: 'Down', FLOW_SPEED: 40, EDGE: 'Void', CURL: 20 },
    'Waves':          { FORCE_FIELD: 'Wave', FIELD_STRENGTH: 70, EDGE: 'Wrap', FLOW_DIRECTION: 'Right', FLOW_SPEED: 35, CURL: 15 },
    'Orbit':          { FORCE_FIELD: 'Attractor', FIELD_STRENGTH: 30, CURL: 10 },
    'Magnetic':       { FORCE_FIELD: 'Magnetic', FIELD_STRENGTH: 80, CURL: 10 },
    'Plasma':         { TURBULENCE: 70, CURL: 50, VELOCITY_DISSIPATION: 0.3 },
    'Galaxy':         { FORCE_FIELD: 'Vortex', FIELD_STRENGTH: 45, CURL: 25 },
    'Black Hole':     { FORCE_FIELD: 'Spiral', FIELD_STRENGTH: 85, CURL: 20 },
    'Reverse Flow':   {},
};
const SIM_MODE_NAMES = Object.keys(SIM_MODES);

const modeState = { t: 0, timer: 0, prev: [] };

function applySimMode (name) {
    if (!SIM_MODES.hasOwnProperty(name)) return;
    Object.assign(config, MODE_BASE, SIM_MODES[name]);
    config.SIM_MODE = name;
    modeState.t = 0;
    modeState.timer = 0;
    modeState.prev = [];
    onEdgeChange();
    refreshGUI();
}

function cycleSimMode () {
    const i = SIM_MODE_NAMES.indexOf(config.SIM_MODE);
    applySimMode(SIM_MODE_NAMES[(i + 1) % SIM_MODE_NAMES.length]);
    showToast('Mode · ' + config.SIM_MODE);
}

// Converts centered height-unit coordinates to texture coordinates
function centeredToUV (px, py) {
    const ar = canvas.width / canvas.height;
    return [px / ar + 0.5, py + 0.5];
}

// Emitter that remembers its last position so it can push fluid along its own path
function trackedEmit (key, x, y, color, dyeScale, boost) {
    const prev = modeState.prev[key];
    modeState.prev[key] = { x, y };
    if (!prev) return;
    const force = config.SPLAT_FORCE * config.INTENSITY * (boost || 1);
    emitSplat(x, y, correctDeltaX(x - prev.x) * force, correctDeltaY(y - prev.y) * force, color, dyeScale);
}

function updateSimMode (dt) {
    if (config.PAUSED || config.SIM_MODE === 'Standard Fluid' || config.SIM_MODE === 'Reverse Flow' || config.SIM_MODE === 'Vortex') {
        modeState.prev = [];
        return;
    }
    const sdt = dt * config.SPEED;
    modeState.t += sdt;
    modeState.timer -= sdt;
    const t = modeState.t;
    const ar = canvas.width / canvas.height;
    const mind = Math.min(ar, 1);
    const F = config.INTENSITY;

    switch (config.SIM_MODE) {
        case 'Whirlpool': {
            // Color pours in at the rim and drains away in the middle
            for (let k = 0; k < 2; k++) {
                const a = t * 0.9 + Math.PI * k;
                const r = 0.42 * mind;
                const [x, y] = centeredToUV(Math.cos(a) * r, Math.sin(a) * r);
                emitSplat(x, y, -Math.sin(a) * 600 * F - Math.cos(a) * 150 * F, Math.cos(a) * 600 * F - Math.sin(a) * 150 * F,
                          colorAt(k * 0.5 + t * 0.03), 0.8);
            }
            pointEffect(0.5, 0.5, { fade: Math.min(1, 3 * sdt), area: 1.5 });
            break;
        }
        case 'Tornado': {
            // A rising column from a swaying base, twisted from side to side
            const bx = 0.5 + 0.06 * Math.sin(t * 0.8) / ar;
            emitSplat(bx, 0.07, Math.sin(t * 5) * 400 * F, 900 * F, colorAt(t * 0.05), 1.0);
            const ty = 0.35 + 0.25 * Math.sin(t * 0.5);
            splatVelocity(bx + 0.03 * Math.sin(t * 2.3), ty, Math.sin(t * 6) * 700 * F, 0, 1.2);
            break;
        }
        case 'Explosion': {
            if (modeState.timer <= 0) {
                modeState.timer = 1.6 + Math.random() * 1.4;
                const cx = 0.25 + Math.random() * 0.5, cy = 0.25 + Math.random() * 0.5;
                const base = Math.random();
                for (let i = 0; i < 18; i++) {
                    const a = (Math.PI * 2 * i) / 18 + Math.random() * 0.2;
                    const v = (1800 + Math.random() * 1200) * F;
                    emitSplat(cx, cy, Math.cos(a) * v, Math.sin(a) * v, colorAt(base + i / 18 * 0.3), 4);
                }
                emitSplat(cx, cy, 0, 0, colorAt(base), 6);
            }
            break;
        }
        case 'Fountain': {
            // An upward jet that arcs over and falls back under gravity
            const a = Math.PI / 2 + 0.25 * Math.sin(t * 1.7) + (Math.random() - 0.5) * 0.1;
            emitSplat(0.5, 0.06, Math.cos(a) * 1600 * F, Math.sin(a) * 1600 * F, colorAt(t * 0.04), 0.9);
            break;
        }
        case 'Waterfall': {
            for (let k = 0; k < 5; k++) {
                const x = 0.2 + 0.15 * k + 0.02 * Math.sin(t * 1.3 + k * 2.1);
                emitSplat(x, 0.96, Math.sin(t * 2 + k) * 80 * F, -500 * F, colorAt(k / 5 + t * 0.02), 0.6);
            }
            break;
        }
        case 'Waves': {
            // A pen tracing a traveling sine wave across the screen
            const x = (t * 0.18) % 1;
            const y = 0.5 + 0.18 * Math.sin(x * Math.PI * 4 + t);
            if (modeState.prev[0] && x < modeState.prev[0].x) modeState.prev[0] = null;   // wrapped around
            trackedEmit(0, x, y, colorAt(x + t * 0.02), 0.8, 3);
            break;
        }
        case 'Orbit': {
            // Bodies on circular orbits; inner ones move faster, like planets
            const radii = [0.12, 0.22, 0.32, 0.42];
            radii.forEach((r0, k) => {
                const r = r0 * mind;
                const w = 1.6 / Math.pow(r0 / 0.12, 1.5);
                const a = t * w + k * 1.7;
                const [x, y] = centeredToUV(Math.cos(a) * r, Math.sin(a) * r);
                trackedEmit(k, x, y, colorAt(k / 4), 0.6, 3);
            });
            if (modeState.timer <= 0) {
                modeState.timer = 0.3;
                emitSplat(0.5, 0.5, 0, 0, colorAt(0.1), 1.5);
            }
            break;
        }
        case 'Magnetic': {
            // Color streams out of both poles and follows the field lines
            const poles = [0.5 - 0.22, 0.5 + 0.22];
            poles.forEach((px, k) => {
                const a = t * 2 + k * Math.PI;
                emitSplat(px, 0.5, Math.cos(a) * 500 * F, Math.sin(a) * 500 * F, colorAt(k * 0.5), 0.7);
            });
            break;
        }
        case 'Plasma': {
            // Short crackling arcs at random spots
            if (Math.random() < 6 * sdt) {
                let x = 0.15 + Math.random() * 0.7, y = 0.15 + Math.random() * 0.7;
                let a = Math.random() * Math.PI * 2;
                const color = colorAt(Math.random());
                for (let i = 0; i < 5; i++) {
                    a += (Math.random() - 0.5) * 1.6;
                    const step = 0.025;
                    x += Math.cos(a) * step / ar;
                    y += Math.sin(a) * step;
                    emitSplat(x, y, Math.cos(a) * 900 * F, Math.sin(a) * 900 * F, color, 2);
                }
            }
            break;
        }
        case 'Galaxy': {
            // Two spiral arms wound around a bright core
            for (let k = 0; k < 2; k++) {
                const phase = (t * 0.25 + k * 0.5) % 1;
                const r = (0.05 + 0.35 * phase) * mind;
                const a = t * 0.6 + Math.PI * k + r * 4 / mind;
                const [x, y] = centeredToUV(Math.cos(a) * r, Math.sin(a) * r);
                emitSplat(x, y, -Math.sin(a) * 350 * F + Math.cos(a) * 120 * F, Math.cos(a) * 350 * F + Math.sin(a) * 120 * F,
                          colorAt(k * 0.5 + phase * 0.3), 0.7);
            }
            if (modeState.timer <= 0) {
                modeState.timer = 0.3;
                emitSplat(0.5, 0.5, 0, 0, colorAt(0.15), 1.2);
            }
            break;
        }
        case 'Black Hole': {
            // Clouds fall in from the edges and vanish at the event horizon
            if (modeState.timer <= 0) {
                modeState.timer = 0.4;
                const a = Math.random() * Math.PI * 2;
                const r = 0.45 * mind;
                const [x, y] = centeredToUV(Math.cos(a) * r, Math.sin(a) * r);
                emitSplat(x, y, -Math.sin(a) * 900 * F, Math.cos(a) * 900 * F, colorAt(Math.random()), 3);
            }
            pointEffect(0.5, 0.5, { fade: Math.min(1, 6 * sdt), velocityFade: Math.min(1, 2 * sdt), area: 1.2 });
            break;
        }
    }
}

// Stage 6: performance and quality

const FPS_LIMITS = { '15 FPS': 15, '24 FPS': 24, '30 FPS': 30, '45 FPS': 45, '60 FPS': 60, '90 FPS': 90, '120 FPS': 120, 'Unlimited': 0 };
const EFFECT_LEVELS = {
    'Very Low': { bloom: 64,  iterations: 4, sunrays: 64,  glow: 64 },
    'Low':      { bloom: 128, iterations: 6, sunrays: 96,  glow: 96 },
    'Medium':   { bloom: 256, iterations: 8, sunrays: 196, glow: 160 },   // the original values
    'High':     { bloom: 384, iterations: 8, sunrays: 256, glow: 224 },
    'Ultra':    { bloom: 512, iterations: 9, sunrays: 384, glow: 320 },
};
const EFFECT_NAMES = Object.keys(EFFECT_LEVELS);
const PERFORMANCE_MODES = {
    'Battery Saver':       { FPS_LIMIT: '30 FPS',    RENDER_SCALE: 60,  EFFECT_QUALITY: 'Low',    PARTICLE_LIMIT: 'Medium',    ADAPTIVE_QUALITY: true,  BATTERY_SAVER: true },
    'Balanced':            { FPS_LIMIT: '60 FPS',    RENDER_SCALE: 85,  EFFECT_QUALITY: 'Medium', PARTICLE_LIMIT: 'Very High', ADAPTIVE_QUALITY: true,  BATTERY_SAVER: false },
    'Performance':         { FPS_LIMIT: 'Unlimited', RENDER_SCALE: 100, EFFECT_QUALITY: 'Medium', PARTICLE_LIMIT: 'Maximum',   ADAPTIVE_QUALITY: false, BATTERY_SAVER: false },
    'Maximum Performance': { FPS_LIMIT: 'Unlimited', RENDER_SCALE: 100, EFFECT_QUALITY: 'Ultra',  PARTICLE_LIMIT: 'Maximum',   ADAPTIVE_QUALITY: false, BATTERY_SAVER: false },
};
// Adaptive quality steps down through these levels when frames run slow
const ADAPT_SCALE = [1, 0.85, 0.7, 0.6, 0.5];
const ADAPT_MAX = ADAPT_SCALE.length - 1;

const perf = {
    fps: 60,
    emaInterval: 1000 / 60,
    lastFrameAt: 0,
    adaptLevel: 0,
    slowTime: 0,
    fastTime: 0,
    appliedDye: null,
    appliedSim: null,
    appliedEffect: null,
};

function applyPerformanceMode (name) {
    if (!PERFORMANCE_MODES.hasOwnProperty(name)) return;
    Object.assign(config, PERFORMANCE_MODES[name]);
    config.PERFORMANCE_MODE = name;
    perf.adaptLevel = 0;
    refreshGUI();
}

function effFpsLimit () {
    let f = FPS_LIMITS[config.FPS_LIMIT] || 0;
    if (config.BATTERY_SAVER) f = f ? Math.min(f, 30) : 30;
    return f;
}

function effRenderScale () {
    let s = 0.25 + 0.75 * config.RENDER_SCALE / 100;
    if (config.BATTERY_SAVER) s = Math.min(s, 0.7);
    return Math.max(0.2, s * ADAPT_SCALE[perf.adaptLevel]);
}

function effEffectLevel () {
    let i = Math.max(0, EFFECT_NAMES.indexOf(config.EFFECT_QUALITY));
    if (config.BATTERY_SAVER) i = Math.min(i, 1);
    if (perf.adaptLevel >= 2) i -= 1;
    if (perf.adaptLevel >= 4) i -= 1;
    return EFFECT_NAMES[Math.max(0, i)];
}

function effDyeResolution () {
    let r = Number(config.DYE_RESOLUTION);
    if (config.BATTERY_SAVER) r = Math.min(r, 512);
    if (perf.adaptLevel >= 2) r = Math.min(r, 512);
    if (perf.adaptLevel >= 3) r = Math.min(r, 256);
    return r;
}

function effSimResolution () {
    let r = Number(config.SIM_RESOLUTION);
    if (perf.adaptLevel >= 4) r = Math.min(r, 64);
    return r;
}

function effPressureIterations () {
    let n = PRESSURE_LEVELS[config.PRESSURE_LEVEL] || config.PRESSURE_ITERATIONS;
    if (config.BATTERY_SAVER) n = Math.min(n, 12);
    return n;
}

function effParticleCount () {
    let n = Math.min(PARTICLE_AMOUNTS[config.PARTICLE_AMOUNT] || 1024, PARTICLE_AMOUNTS[config.PARTICLE_LIMIT] || 16384);
    if (config.BATTERY_SAVER) n = Math.min(n, 1024);
    return n;
}

function pixelRatio () {
    return (window.devicePixelRatio || 1) * (renderScaleFactor || 1);
}

// Returns false when this animation frame should be skipped to honor the frame rate limit
function frameAllowed (now) {
    const limit = effFpsLimit();
    if (!limit) {
        perf.lastFrameAt = now;
        return true;
    }
    const interval = 1000 / limit;
    const elapsed = now - perf.lastFrameAt;
    if (elapsed < 0) {
        perf.lastFrameAt = now;   // the clock jumped backwards; start a fresh schedule
        return true;
    }
    if (elapsed < interval - 2) return false;
    // Step the schedule forward by whole intervals so the average rate stays on target
    perf.lastFrameAt = elapsed < interval * 2 ? perf.lastFrameAt + interval : now;
    return true;
}

function measureFrame (intervalMs) {
    if (intervalMs <= 0 || intervalMs > 250) return;   // ignore pauses such as a hidden tab
    perf.emaInterval += (intervalMs - perf.emaInterval) * 0.1;
    perf.fps = Math.round(1000 / perf.emaInterval);
}

// Adaptive quality: step down after 1.5 s of slow frames, back up after 5 s of smooth ones
function updateAdaptive (dt) {
    if (!config.ADAPTIVE_QUALITY) {
        if (perf.adaptLevel !== 0) perf.adaptLevel = 0;
        perf.slowTime = perf.fastTime = 0;
        return;
    }
    const target = Math.min(effFpsLimit() || 60, 60);
    const fps = 1000 / perf.emaInterval;
    if (fps < target * 0.85) {
        perf.slowTime += dt;
        perf.fastTime = 0;
        if (perf.slowTime > 1.5 && perf.adaptLevel < ADAPT_MAX) {
            perf.adaptLevel++;
            perf.slowTime = 0;
            showToast('Adaptive quality · lowered');
        }
    } else if (fps > target * 0.95) {
        perf.fastTime += dt;
        perf.slowTime = 0;
        if (perf.fastTime > 5 && perf.adaptLevel > 0) {
            perf.adaptLevel--;
            perf.fastTime = 0;
            showToast('Adaptive quality · raised');
        }
    } else {
        perf.slowTime = perf.fastTime = 0;
    }
}

function applyEffectLevel () {
    const name = effEffectLevel();
    if (perf.appliedEffect === name) return;
    perf.appliedEffect = name;
    const e = EFFECT_LEVELS[name];
    config.BLOOM_RESOLUTION = e.bloom;
    config.BLOOM_ITERATIONS = e.iterations;
    config.SUNRAYS_RESOLUTION = e.sunrays;
    if (bloom) {
        initBloomFramebuffers();
        initSunraysFramebuffers();
    }
}

function currentGlowResolution () {
    return EFFECT_LEVELS[effEffectLevel()].glow;
}

// Runs once per drawn frame, before anything is resized or rendered
function updatePerformance (dt) {
    updateAdaptive(dt);
    renderScaleFactor = effRenderScale();
    applyEffectLevel();
    const dyeRes = effDyeResolution(), simRes = effSimResolution();
    if (perf.appliedDye !== null && (perf.appliedDye !== dyeRes || perf.appliedSim !== simRes))
        initFramebuffers();
}

// Stage 7: presets, text, background, wallpaper and interface actions

// ---------- Safe storage (private windows and blocked storage just fall back to memory) ----------

const memoryStore = {};

function storeGet (key) {
    try {
        const v = window.localStorage.getItem(key);
        return v != null ? v : (key in memoryStore ? memoryStore[key] : null);
    } catch (e) {
        return key in memoryStore ? memoryStore[key] : null;
    }
}

function storeSet (key, value) {
    memoryStore[key] = value;
    try { window.localStorage.setItem(key, value); } catch (e) { /* memory only */ }
}

// ---------- Settings snapshots ----------

// Device-specific and runtime keys are not part of a look, so presets and undo leave them alone
const SNAPSHOT_EXCLUDE = new Set([
    'PAUSED', 'DYE_RESOLUTION', 'SIM_RESOLUTION', 'CAPTURE_RESOLUTION',
    'BLOOM_RESOLUTION', 'BLOOM_ITERATIONS', 'SUNRAYS_RESOLUTION', 'PRESSURE_ITERATIONS',
    'FPS_LIMIT', 'ADAPTIVE_QUALITY', 'PERFORMANCE_MODE', 'RENDER_SCALE', 'EFFECT_QUALITY',
    'PARTICLE_LIMIT', 'BATTERY_SAVER',
]);

function snapshotValues () {
    const out = {};
    Object.keys(config).forEach(k => {
        if (!SNAPSHOT_EXCLUDE.has(k)) out[k] = config[k];
    });
    return JSON.parse(JSON.stringify(out));
}

function cleanValues (values) {
    const out = {};
    Object.keys(values || {}).forEach(k => {
        if (!SNAPSHOT_EXCLUDE.has(k) && config.hasOwnProperty(k) && typeof values[k] === typeof config[k])
            out[k] = values[k];
    });
    return JSON.parse(JSON.stringify(out));
}

let DEFAULT_VALUES = null;   // captured once the GUI exists

function applyValues (values, fromDefaults) {
    if (fromDefaults && DEFAULT_VALUES) Object.assign(config, JSON.parse(JSON.stringify(DEFAULT_VALUES)));
    Object.assign(config, cleanValues(values));
    setPalette(config.PALETTE, 0.8);
    updateKeywords();
    onEdgeChange();
    modeState.t = 0;
    modeState.prev = [];
    textState.dirty = true;
    refreshGUI();
}

// ---------- Presets ----------

const ui7 = { preset: 'Default', presetName: 'Default' };
let presetCtrl = null;

function rebuildPresetDropdown () {
    if (!presetCtrl || !presetCtrl.options) return;
    presetCtrl = presetCtrl.options(presetNames()).name('preset').onChange(v => selectPreset(v, true));
    presetCtrl.updateDisplay();
}

// Restores the last preset used on this device; runs once everything is initialized
function initPresets () {
    DEFAULT_VALUES = snapshotValues();
    loadStoredPresets();
    const saved = storeGet('fluidfix.currentPreset');
    if (saved && saved !== 'Default' && presetNames().indexOf(saved) !== -1) selectPreset(saved, true);
    else selectPreset('Default', false);
    settingsHistory.lastSeen = JSON.stringify(snapshotValues());
    settingsHistory.stack = [settingsHistory.lastSeen];
    settingsHistory.index = 0;
}

const BUILTIN_PRESETS = {
    'Default': {},
    'Aurora Dream': { PALETTE: 'Aurora', BACKGROUND: 'Nebula', AUTOPLAY: true, TRAILS: true, GLOW_INTENSITY: 30, AUTO_TRANSITION: true },
    'Lava Lamp': { PALETTE: 'Fire', BACKGROUND: 'Ember', BUOYANCY: 78, VISCOSITY: 45, CURL: 8, SPLAT_RADIUS: 0.45, AUTOPLAY: true },
    'Neon Party': { PALETTE: 'Neon', BLACKLIGHT: true, MIRROR_MODE: 'Complex', AUTOPLAY: true, RAINBOW: true },
    'Ink on Paper': { BACKGROUND: 'Paper', BLOOM: false, SUNRAYS: false, PALETTE: 'Ocean', CURL: 20, DENSITY_DISSIPATION: 0.92 },
    'Starry Galaxy': { SIM_MODE: 'Galaxy', FORCE_FIELD: 'Vortex', FIELD_STRENGTH: 45, CURL: 25, PALETTE: 'Galaxy', BACKGROUND: 'Midnight', PARTICLES: true, PARTICLE_STYLE: 'Dust', PARTICLE_AMOUNT: 'Ultra' },
};

const presetState = {
    user: [],          // [{ name, values }]
    current: 'Default',
};

function loadStoredPresets () {
    try {
        const list = JSON.parse(storeGet('fluidfix.presets') || '[]');
        presetState.user = Array.isArray(list)
            ? list.filter(p => p && typeof p.name === 'string' && p.values && typeof p.values === 'object')
            : [];
    } catch (e) {
        presetState.user = [];
    }
}

function saveStoredPresets () {
    storeSet('fluidfix.presets', JSON.stringify(presetState.user));
    storeSet('fluidfix.currentPreset', presetState.current);
}

function presetNames () {
    return Object.keys(BUILTIN_PRESETS).concat(presetState.user.map(p => p.name));
}

function isBuiltin (name) {
    return BUILTIN_PRESETS.hasOwnProperty(name);
}

function findUserPreset (name) {
    return presetState.user.find(p => p.name === name);
}

function uniqueName (base) {
    const names = new Set(presetNames());
    if (!names.has(base)) return base;
    for (let i = 2; ; i++) {
        const n = base + ' ' + i;
        if (!names.has(n)) return n;
    }
}

function selectPreset (name, apply) {
    presetState.current = name;
    ui7.preset = name;
    ui7.presetName = name;
    if (apply) {
        const values = isBuiltin(name) ? BUILTIN_PRESETS[name] : (findUserPreset(name) || {}).values;
        applyValues(values || {}, true);
    }
    saveStoredPresets();
    rebuildPresetDropdown();
}

function presetSave () {
    if (isBuiltin(presetState.current)) {
        const name = uniqueName('My preset');
        presetState.user.push({ name, values: snapshotValues() });
        selectPreset(name, false);
        showToast('Saved as ' + name);
    } else {
        findUserPreset(presetState.current).values = snapshotValues();
        saveStoredPresets();
        showToast('Saved ' + presetState.current);
    }
}

function presetNew () {
    const name = uniqueName('Preset');
    presetState.user.push({ name, values: JSON.parse(JSON.stringify(DEFAULT_VALUES)) });
    selectPreset(name, true);
    showToast('New preset · ' + name);
}

function presetClone () {
    const name = uniqueName(presetState.current + ' copy');
    presetState.user.push({ name, values: snapshotValues() });
    selectPreset(name, false);
    showToast('Cloned as ' + name);
}

function presetRename (newName) {
    newName = String(newName || '').trim().slice(0, 40);
    if (!newName || newName === presetState.current) { ui7.presetName = presetState.current; refreshGUI(); return; }
    if (isBuiltin(presetState.current)) {
        ui7.presetName = presetState.current;
        refreshGUI();
        showToast('Built-in presets can’t be renamed · clone it first');
        return;
    }
    if (presetNames().indexOf(newName) !== -1) {
        ui7.presetName = presetState.current;
        refreshGUI();
        showToast('A preset called ' + newName + ' already exists');
        return;
    }
    findUserPreset(presetState.current).name = newName;
    selectPreset(newName, false);
    showToast('Renamed to ' + newName);
}

function presetDelete () {
    const name = presetState.current;
    if (isBuiltin(name)) {
        showToast('Built-in presets can’t be deleted');
        return;
    }
    openModal({
        title: 'Delete preset?',
        text: '“' + name + '” will be removed from this device. This can’t be undone.',
        buttons: [
            { label: 'Cancel' },
            { label: 'Delete', danger: true, action: () => {
                presetState.user = presetState.user.filter(p => p.name !== name);
                selectPreset('Default', false);
                showToast('Deleted ' + name);
            } },
        ],
    });
}

function presetExport () {
    const name = presetState.current;
    const json = JSON.stringify({ app: 'Fluid Fix', version: 1, name, values: snapshotValues() }, null, 2);
    const buttons = [{ label: 'Close' }];
    if (navigator.share)
        buttons.push({ label: 'Share', action: () => { navigator.share({ title: 'Fluid Fix preset · ' + name, text: json }).catch(() => {}); } });
    buttons.push({ label: 'Download', action: () => downloadText(name.replace(/[^\w\- ]+/g, '') + '.fluidfix.json', json) });
    buttons.push({ label: 'Copy', primary: true, action: () => copyText(json) });
    openModal({ title: 'Export preset', text: 'Share this with anyone using Fluid Fix. They can bring it in with Load preset.', input: json, readOnly: true, buttons });
}

function presetImport () {
    openModal({
        title: 'Load preset',
        text: 'Paste a preset someone shared with you, or choose a .json file.',
        input: '',
        placeholder: '{ "app": "Fluid Fix", ... }',
        file: true,
        buttons: [
            { label: 'Cancel' },
            { label: 'Load', primary: true, keepOpen: true, action: (text) => importPresetText(text) },
        ],
    });
}

function importPresetText (text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        modalError('That isn’t valid preset text.');
        return;
    }
    const values = cleanValues(data && data.values);
    if (!Object.keys(values).length) {
        modalError('No Fluid Fix settings found in that text.');
        return;
    }
    const name = uniqueName(String(data.name || 'Imported').trim().slice(0, 40) || 'Imported');
    presetState.user.push({ name, values });
    closeModal();
    selectPreset(name, true);
    showToast('Loaded ' + name);
}

function resetSimulation () {
    selectPreset('Default', true);
    clearFluid();
    showToast('Reset to default');
}

// ---------- Undo / redo (settings) ----------

const settingsHistory = { stack: [], index: -1, lastSeen: null, timer: 0, applying: false };

function recordHistory (dt) {
    settingsHistory.timer += dt;
    if (settingsHistory.timer < 0.3) return;
    settingsHistory.timer = 0;
    const s = JSON.stringify(snapshotValues());
    if (s === settingsHistory.lastSeen) return;
    settingsHistory.lastSeen = s;
    settingsHistory.stack.length = settingsHistory.index + 1;
    settingsHistory.stack.push(s);
    if (settingsHistory.stack.length > 60) settingsHistory.stack.shift();
    settingsHistory.index = settingsHistory.stack.length - 1;
}

function undo () {
    if (settingsHistory.index <= 0) { showToast('Nothing to undo'); return; }
    settingsHistory.index--;
    applyValues(JSON.parse(settingsHistory.stack[settingsHistory.index]), false);
    settingsHistory.lastSeen = settingsHistory.stack[settingsHistory.index];   // don't record the undo itself
    showToast('Undo');
}

function redo () {
    if (settingsHistory.index >= settingsHistory.stack.length - 1) { showToast('Nothing to redo'); return; }
    settingsHistory.index++;
    applyValues(JSON.parse(settingsHistory.stack[settingsHistory.index]), false);
    settingsHistory.lastSeen = settingsHistory.stack[settingsHistory.index];
    showToast('Redo');
}

// ---------- Clear fluid, fullscreen, screenshot, wallpaper ----------

function clearFluid () {
    const targets = [dye.read, dye.write, velocity.read, velocity.write, pressure.read, pressure.write,
                     displacement && displacement.read, displacement && displacement.write,
                     historyFBO && historyFBO.read, historyFBO && historyFBO.write,
                     particles.trail && particles.trail.read, particles.trail && particles.trail.write];
    gl.clearColor(0, 0, 0, 0);
    targets.forEach(t => {
        if (!t) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.clearColor(0, 0, 0, 1);
}

function isFullscreen () {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function toggleFullscreen () {
    const el = document.documentElement;
    try {
        if (isFullscreen()) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
            const req = el.requestFullscreen || el.webkitRequestFullscreen;
            if (!req) throw new Error('unsupported');
            const r = req.call(el);
            if (r && r.catch) r.catch(() => showToast('Fullscreen isn’t available here'));
        }
    } catch (e) {
        showToast('Fullscreen isn’t available here');
    }
}

function showWallpaperInfo () {
    openModal({
        title: 'Live wallpaper',
        text: 'A web page can’t install itself as an Android live wallpaper; that needs a native app. ' +
              'For a wallpaper-like screen: turn on Splashes or Auto-play, tap Fullscreen, and keep the screen on. ' +
              'Your current preset is kept the next time you open Fluid Fix on this device.',
        buttons: [{ label: 'Go fullscreen', action: toggleFullscreen }, { label: 'OK', primary: true }],
    });
}

const wallpaper = { timer: 2 };

function updateWallpaper (dt) {
    if (!config.SPLASHES || config.PAUSED) return;
    wallpaper.timer -= dt;
    if (wallpaper.timer <= 0) {
        wallpaper.timer = 1.2 + Math.random() * 2.3;
        splatStack.push(1 + Math.floor(Math.random() * 3));
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && config.WALLPAPER_CLEAR && dye) {
        clearFluid();
        splatStack.push(4 + Math.floor(Math.random() * 4));
    }
});

function copyText (text) {
    const done = () => showToast('Copied');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy (text) {
    const ta = document.getElementById('modal-input');
    if (ta) {
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); showToast('Copied'); return; } catch (e) { /* fall through */ }
    }
    showToast('Select the text and copy it');
}

function downloadText (filename, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

// ---------- Modal ----------

let modalButtons = [];

function openModal (opts) {
    const m = document.getElementById('modal');
    if (!m) return;
    document.getElementById('modal-title').textContent = opts.title || '';
    document.getElementById('modal-text').textContent = opts.text || '';
    document.getElementById('modal-error').textContent = '';
    const input = document.getElementById('modal-input');
    input.hidden = opts.input == null;
    input.value = opts.input || '';
    input.readOnly = !!opts.readOnly;
    input.placeholder = opts.placeholder || '';
    const file = document.getElementById('modal-file');
    file.hidden = !opts.file;
    file.value = '';
    const actions = document.getElementById('modal-actions');
    actions.innerHTML = '';
    modalButtons = opts.buttons || [{ label: 'OK', primary: true }];
    modalButtons.forEach(b => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = b.label;
        btn.className = 'modal-btn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : '');
        btn.addEventListener('click', () => {
            const value = input.value;
            if (!b.keepOpen) closeModal();
            if (b.action) b.action(value);
        });
        actions.appendChild(btn);
    });
    m.hidden = false;
    setTimeout(() => {
        if (!input.hidden && !input.readOnly) input.focus();
        else { const p = actions.querySelector('.primary') || actions.lastChild; if (p) p.focus(); }
    }, 30);
}

function closeModal () {
    const m = document.getElementById('modal');
    if (m) m.hidden = true;
}

function modalError (text) {
    document.getElementById('modal-error').textContent = text;
}

function modalOpen () {
    const m = document.getElementById('modal');
    return !!(m && !m.hidden);
}

(function setupModal () {
    const m = document.getElementById('modal');
    if (!m || !m.addEventListener) return;
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOpen()) closeModal(); });
    const file = document.getElementById('modal-file');
    file.addEventListener('change', () => {
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => { document.getElementById('modal-input').value = String(reader.result || ''); };
        reader.readAsText(f);
    });
})();

// ---------- Text ----------

const TEXT_MODES = ['Paint', 'Obstacle'];
const TEXT_FONTS = {
    'Sans':        'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    'Serif':       'Georgia, "Times New Roman", Times, serif',
    'Mono':        '"SFMono-Regular", Menlo, Consolas, "Courier New", monospace',
    'Rounded':     '"Arial Rounded MT Bold", "Nunito", "Varela Round", system-ui, sans-serif',
    'Impact':      'Impact, "Arial Black", "Helvetica Neue", sans-serif',
    'Handwriting': '"Segoe Script", "Brush Script MT", "Comic Sans MS", cursive',
};

const textState = {
    canvas: null,
    ctx: null,
    texture: null,
    dirty: true,
    key: '',
};

function textSettingsKey () {
    return JSON.stringify([config.TEXT_CONTENT, config.TEXT_FONT, config.TEXT_SIZE, config.TEXT_COLOR, config.TEXT_OUTLINE,
        config.TEXT_OUTLINE_THICKNESS, config.TEXT_GLOW, config.TEXT_GLOW_INTENSITY, config.TEXT_X, config.TEXT_Y,
        config.TEXT_ROTATION, canvas.width, canvas.height]);
}

function editText () {
    openModal({
        title: 'Edit text',
        text: 'New lines start a new row of text.',
        input: config.TEXT_CONTENT,
        placeholder: 'Type something',
        buttons: [
            { label: 'Cancel' },
            { label: 'Done', primary: true, action: (v) => {
                config.TEXT_CONTENT = String(v).slice(0, 200);
                if (!config.TEXT) config.TEXT = true;
                textState.dirty = true;
                refreshGUI();
            } },
        ],
    });
}

function drawTextCanvas () {
    const scale = Math.min(1, 1024 / Math.max(canvas.width, canvas.height));
    const W = Math.max(2, Math.round(canvas.width * scale));
    const H = Math.max(2, Math.round(canvas.height * scale));
    if (!textState.canvas) {
        textState.canvas = document.createElement('canvas');
        textState.ctx = textState.canvas.getContext('2d');
    }
    const cv = textState.canvas, ctx = textState.ctx;
    if (!ctx) return false;
    cv.width = W;
    cv.height = H;
    ctx.clearRect(0, 0, W, H);

    const lines = String(config.TEXT_CONTENT || '').split('\n');
    const family = TEXT_FONTS[config.TEXT_FONT] || TEXT_FONTS['Sans'];
    let size = (0.04 + 0.36 * config.TEXT_SIZE / 100) * Math.min(W, H);
    ctx.font = '700 ' + size + 'px ' + family;
    // Shrink to fit the screen width
    const widest = Math.max(1, ...lines.map(l => ctx.measureText(l).width));
    if (widest > W * 0.92) size *= W * 0.92 / widest;
    ctx.font = '700 ' + size + 'px ' + family;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const c = config.TEXT_COLOR;
    const fill = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
    const light = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255 > 0.75;
    const lineH = size * 1.15;

    ctx.save();
    ctx.translate(config.TEXT_X / 100 * W, (1 - config.TEXT_Y / 100) * H);
    ctx.rotate((config.TEXT_ROTATION - 50) / 50 * Math.PI);
    const drawLines = fn => lines.forEach((l, i) => fn(l, 0, (i - (lines.length - 1) / 2) * lineH));

    if (config.TEXT_GLOW && config.TEXT_GLOW_INTENSITY > 0) {
        ctx.shadowColor = fill;
        ctx.shadowBlur = size * (0.1 + 0.6 * config.TEXT_GLOW_INTENSITY / 100);
        ctx.fillStyle = fill;
        const passes = 1 + Math.round(config.TEXT_GLOW_INTENSITY / 40);
        for (let i = 0; i < passes; i++) drawLines((l, x, y) => ctx.fillText(l, x, y));
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
    if (config.TEXT_OUTLINE && config.TEXT_OUTLINE_THICKNESS > 0) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = 1 + size * 0.16 * config.TEXT_OUTLINE_THICKNESS / 100;
        ctx.strokeStyle = light ? '#111318' : '#ffffff';
        drawLines((l, x, y) => ctx.strokeText(l, x, y));
    }
    ctx.fillStyle = fill;
    drawLines((l, x, y) => ctx.fillText(l, x, y));
    ctx.restore();
    return true;
}

function updateTextTexture () {
    if (!config.TEXT) return false;
    const key = textSettingsKey();
    if (!textState.dirty && key === textState.key && textState.texture) return true;
    textState.key = key;
    textState.dirty = false;
    if (!drawTextCanvas()) return false;
    if (!textState.texture) {
        const tex = gl.createTexture();
        textState.texture = {
            texture: tex,
            attach (id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, tex);
                return id;
            }
        };
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textState.texture.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textState.canvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    return true;
}

function textActive () {
    return config.TEXT && String(config.TEXT_CONTENT || '').trim().length > 0 && textState.texture;
}

// mode 0: block velocity, 1: block color, 2: paint color
function applyText (target, mode, amount) {
    const u = textApplyProgram.uniforms;
    textApplyProgram.bind();
    gl.uniform1i(u.uTarget, target.read.attach(0));
    gl.uniform1i(u.uText, textState.texture.attach(1));
    gl.uniform1f(u.mode, mode);
    gl.uniform1f(u.amount, amount);
    blit(target.write);
    target.swap();
}

function textVelocityPass () {
    if (!textActive() || config.TEXT_MODE !== 'Obstacle') return;
    applyText(velocity, 0, 1);
}

function textDyePass (dt) {
    if (!textActive()) return;
    if (config.TEXT_MODE === 'Obstacle') applyText(dye, 1, 1);
    else applyText(dye, 2, 1.2 * dt * config.TEXT_OPACITY / 100);
}

function drawTextOverlay (target) {
    if (!textActive() || config.TEXT_MODE !== 'Obstacle' || config.TEXT_OPACITY <= 0) return;
    textOverlayProgram.bind();
    gl.uniform1i(textOverlayProgram.uniforms.uText, textState.texture.attach(0));
    gl.uniform1f(textOverlayProgram.uniforms.opacity, config.TEXT_OPACITY / 100);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    blit(target);
}

// ---------- Background blur backdrop ----------

let bgBlurFBO = null;
let bgBlurTemp = null;

function applyBackgroundBlur () {
    if (config.BG_BLUR <= 0) return;
    if (!bgBlurFBO) {
        const res = getResolution(96);
        const rgba = ext.formatRGBA;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
        bgBlurFBO = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, ext.halfFloatTexType, filtering);
        bgBlurTemp = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, ext.halfFloatTexType, filtering);
    }
    gl.disable(gl.BLEND);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, dye.read.attach(0));
    blit(bgBlurFBO);
    blur(bgBlurFBO, bgBlurTemp, 2 + Math.round(config.BG_BLUR / 100 * 10));
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
    freezeController = gui.add({ fun: () => { toggleFreeze(); } }, 'fun').name('❄ Freeze');
    gui.add({ fun: cyclePalette }, 'fun').name('🎨 Next palette');
    gui.add(config, 'AUTOPLAY').name('auto-play').listen();
    gui.add(config, 'VORTEX').name('vortex').listen();
    gui.add({ fun: () => {
        splatStack.push(parseInt(Math.random() * 20) + 5);
    } }, 'fun').name('Random splats');
    gui.add({ fun: () => { clearFluid(); showToast('Cleared'); } }, 'fun').name('🧽 Clear fluid');
    gui.add({ fun: undo }, 'fun').name('↶ Undo');
    gui.add({ fun: redo }, 'fun').name('↷ Redo');
    gui.add({ fun: captureScreenshot }, 'fun').name('📷 Screenshot');
    gui.add({ fun: toggleFullscreen }, 'fun').name('⛶ Fullscreen');

    let presetsFolder = gui.addFolder('Presets');
    presetCtrl = presetsFolder.add(ui7, 'preset', presetNames()).name('preset').onChange(v => selectPreset(v, true));
    presetsFolder.add(ui7, 'presetName').name('preset name').onFinishChange(presetRename);
    presetsFolder.add({ fun: presetSave }, 'fun').name('💾 Save preset');
    presetsFolder.add({ fun: presetNew }, 'fun').name('＋ New');
    presetsFolder.add({ fun: presetClone }, 'fun').name('⧉ Clone');
    presetsFolder.add({ fun: randomizeConfig }, 'fun').name('🎲 Random');
    presetsFolder.add({ fun: presetExport }, 'fun').name('📤 Export');
    presetsFolder.add({ fun: presetImport }, 'fun').name('📂 Load preset…');
    presetsFolder.add({ fun: presetDelete }, 'fun').name('🗑 Delete');
    presetsFolder.add({ fun: resetSimulation }, 'fun').name('↺ Reset simulation');

    let simFolder = gui.addFolder('Simulation');
    simFolder.add(config, 'SIM_MODE', SIM_MODE_NAMES).name('simulation mode').listen().onChange(v => {
        applySimMode(v);
        showToast('Mode · ' + v);
    });
    simFolder.add(config, 'DYE_RESOLUTION', QUALITY_LEVELS).name('quality').onFinishChange(initFramebuffers);
    addPct(simFolder, 'SPEED', 'speed');
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
    forcesFolder.add(config, 'FORCE_FIELD', FORCE_FIELDS).name('force field').listen();
    forcesFolder.add(config, 'FIELD_STRENGTH', 0, 100).step(1).name('field strength');

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
    touchFolder.add(config, 'TOUCH_RADIUS', 0, 100).step(1).name('touch radius');
    touchFolder.add(config, 'TOUCH_ATTRACTION', 0, 100).step(1).name('touch attraction');
    touchFolder.add(config, 'TOUCH_REPULSION', 0, 100).step(1).name('touch repulsion');
    touchFolder.add(config, 'MULTI_TOUCH', 0, 100).step(1).name('multi-touch strength');
    touchFolder.add(config, 'CONTINUOUS_DRAWING').name('continuous drawing');
    touchFolder.add(config, 'TOUCH_SENSITIVITY', 0, 100).step(1).name('touch sensitivity');
    touchFolder.add(config, 'GESTURE', GESTURE_MODES).name('gesture mode').listen();
    touchFolder.add(config, 'INJECTION', INJECTION_MODES).name('injection mode').listen();

    let modesFolder = gui.addFolder('Modes');
    modesFolder.add(config, 'VORTEX').name('vortex').listen();
    modesFolder.add(config, 'KALEIDOSCOPE').name('kaleidoscope').listen().onChange(v => {
        if (v) config.MIRROR_MODE = 'None';
    });
    modesFolder.add(config, 'KALEIDO_SEGMENTS', SEGMENT_CHOICES).name('segments').listen()
        .onChange(v => { config.KALEIDO_SEGMENTS = Number(v); });
    modesFolder.add(config, 'RAINBOW').name('rainbow').listen();
    addPct(modesFolder, 'RAINBOW_SPD', 'rainbow speed');
    modesFolder.add(config, 'TRAILS').name('color trails').listen();
    modesFolder.add(config, 'RANDOM_INJECTION').name('random color on touch').listen();

    let colorsFolder = gui.addFolder('Colors');
    colorsFolder.add(config, 'PALETTE', PALETTE_NAMES).name('palette').listen().onChange(v => setPalette(v, 1.2));
    colorsFolder.add(config, 'AUTO_TRANSITION').name('auto transitions').listen();
    colorsFolder.add(config, 'TRANSITION_TIME', TRANSITION_CHOICES).name('time per palette')
        .onChange(v => { config.TRANSITION_TIME = Number(v); });
    colorsFolder.add(config, 'COLORFUL').name('colorful');

    let effectsFolder = gui.addFolder('Effects');
    effectsFolder.add(config, 'SHADING').name('shading');
    effectsFolder.add(config, 'BLOOM').name('bloom');
    addPct(effectsFolder, 'BLOOM_INT', 'bloom intensity');
    addPct(effectsFolder, 'BLOOM_THR', 'bloom threshold');
    effectsFolder.add(config, 'FLARE').name('flare');
    effectsFolder.add(config, 'FLARE_STYLE', FLARE_STYLES).name('flare style');
    effectsFolder.add(config, 'SUNRAYS').name('sunrays');
    addPct(effectsFolder, 'SUNRAYS_W', 'sunrays weight');
    effectsFolder.add(config, 'GAMMA').name('gamma');
    effectsFolder.add(config, 'GAMMA_MODE', GAMMA_MODES).name('gamma mode');
    effectsFolder.add(config, 'SPECULAR').name('specular');
    effectsFolder.add(config, 'SPECULAR_STYLE', Object.keys(SPECULAR_STYLES)).name('specular style');
    effectsFolder.add(config, 'MIRROR_MODE', MIRROR_MODES).name('mirror').listen().onChange(v => {
        if (v !== 'None') config.KALEIDOSCOPE = false;
    });
    effectsFolder.add(config, 'GLOW_INTENSITY', 0, 100).step(1).name('glow intensity');
    effectsFolder.add(config, 'GLOW_RADIUS', 0, 100).step(1).name('glow radius');
    effectsFolder.add(config, 'REFRACTION', 0, 100).step(1).name('refraction');
    effectsFolder.add(config, 'REFLECTION', 0, 100).step(1).name('reflection');
    effectsFolder.add(config, 'TRANSPARENCY', 0, 100).step(1).name('transparency');
    effectsFolder.add(config, 'DEPTH', 0, 100).step(1).name('depth');

    let blacklightFolder = gui.addFolder('Blacklight');
    blacklightFolder.add(config, 'BLACKLIGHT').name('blacklight mode').listen();
    blacklightFolder.add(config, 'BLACKLIGHT_INTENSITY', 0, 100).step(1).name('blacklight intensity');
    blacklightFolder.add(config, 'FLUORESCENCE', 0, 100).step(1).name('fluorescence');
    blacklightFolder.add(config, 'UV_MODE', Object.keys(UV_MODES)).name('UV color mode');

    let filtersFolder = gui.addFolder('Filters');
    filtersFolder.add(config, 'PIXELS').name('pixels');
    filtersFolder.add(config, 'PIXEL_MODE', Object.keys(PIXEL_MODES)).name('pixel mode');
    filtersFolder.add(config, 'NEON').name('neon');
    filtersFolder.add(config, 'EMBOSS').name('emboss');
    filtersFolder.add(config, 'FRINGE').name('fringe');
    filtersFolder.add(config, 'FILTER').name('film filter');
    filtersFolder.add(config, 'SATURATION', 0, 100).step(1).name('saturation');
    filtersFolder.add(config, 'CONTRAST', 0, 100).step(1).name('contrast');
    filtersFolder.add(config, 'INVERT').name('invert');
    filtersFolder.add(config, 'SHAKE').name('shake');
    filtersFolder.add(config, 'SHAKE_STYLE', Object.keys(SHAKE_STYLES)).name('shake style');
    filtersFolder.add(config, 'MOTION').name('motion');
    filtersFolder.add(config, 'MOTION_STYLE', MOTION_STYLES).name('motion style');
    filtersFolder.add(config, 'MOTION_INTENSITY', 0, 100).step(1).name('motion intensity');
    filtersFolder.add(config, 'CHROMATIC_ABERRATION', 0, 100).step(1).name('chromatic aberration');
    filtersFolder.add(config, 'BLUR', 0, 100).step(1).name('blur');
    filtersFolder.add(config, 'SHARPEN', 0, 100).step(1).name('sharpen');
    filtersFolder.add(config, 'COLOR_VARIATION', 0, 100).step(1).name('color variation');

    let particlesFolder = gui.addFolder('Particles');
    particlesFolder.add(config, 'PARTICLES').name('particles').listen();
    particlesFolder.add(config, 'PARTICLE_MIX', 0, 100).step(1).name('mix');
    particlesFolder.add(config, 'PARTICLE_INTENSITY', 0, 100).step(1).name('intensity');
    particlesFolder.add(config, 'PARTICLE_SPEED', 0, 100).step(1).name('speed');
    particlesFolder.add(config, 'PARTICLE_AMOUNT', Object.keys(PARTICLE_AMOUNTS)).name('amount');
    particlesFolder.add(config, 'PARTICLE_STYLE', PARTICLE_STYLES).name('style').listen();
    particlesFolder.add(config, 'PARTICLE_SIZE', 0, 100).step(1).name('size');
    particlesFolder.add(config, 'PARTICLE_LENGTH', 0, 100).step(1).name('length');
    particlesFolder.add(config, 'PARTICLE_DENSITY', 0, 100).step(1).name('density');
    particlesFolder.add(config, 'PARTICLE_GLOW', 0, 100).step(1).name('glow');
    particlesFolder.add(config, 'PARTICLE_SPREAD', 0, 100).step(1).name('spread');
    particlesFolder.add(config, 'PARTICLE_TURBULENCE', 0, 100).step(1).name('turbulence');
    particlesFolder.add(config, 'PARTICLE_FADE', 0, 100).step(1).name('fade');
    particlesFolder.add(config, 'PARTICLE_ATTRACTION', 0, 100).step(1).name('attraction');
    particlesFolder.add(config, 'PARTICLE_COLLISION').name('collision');
    particlesFolder.add(config, 'PARTICLE_TRAILS').name('trails');
    particlesFolder.add(config, 'PARTICLE_COLOR_MODE', PARTICLE_COLOR_MODES).name('color mode');
    particlesFolder.addColor(config, 'PARTICLE_COLOR').name('single color');

    let perfFolder = gui.addFolder('Performance');
    perfFolder.add(config, 'PERFORMANCE_MODE', Object.keys(PERFORMANCE_MODES)).name('performance mode').listen().onChange(v => {
        applyPerformanceMode(v);
        showToast('Performance · ' + v);
    });
    perfFolder.add(config, 'FPS_LIMIT', Object.keys(FPS_LIMITS)).name('frame rate limit').listen();
    perfFolder.add(config, 'ADAPTIVE_QUALITY').name('adaptive quality').listen();
    perfFolder.add(config, 'RENDER_SCALE', 0, 100).step(1).name('render scale').listen();
    perfFolder.add(config, 'EFFECT_QUALITY', EFFECT_NAMES).name('effect quality').listen();
    perfFolder.add(config, 'PARTICLE_LIMIT', Object.keys(PARTICLE_AMOUNTS)).name('particle limit').listen();
    perfFolder.add(config, 'BATTERY_SAVER').name('battery saver').listen();
    perfFolder.add(perf, 'fps').name('current fps').listen();

    let textFolder = gui.addFolder('Text');
    textFolder.add(config, 'TEXT').name('text').listen();
    textFolder.add(config, 'TEXT_MODE', TEXT_MODES).name('text mode').listen();
    textFolder.add({ fun: editText }, 'fun').name('✎ Edit text');
    textFolder.add(config, 'TEXT_FONT', Object.keys(TEXT_FONTS)).name('font').listen();
    textFolder.add(config, 'TEXT_SIZE', 0, 100).step(1).name('font size').listen();
    textFolder.addColor(config, 'TEXT_COLOR').name('text color').listen();
    textFolder.add(config, 'TEXT_OUTLINE').name('outline').listen();
    textFolder.add(config, 'TEXT_OUTLINE_THICKNESS', 0, 100).step(1).name('outline thickness').listen();
    textFolder.add(config, 'TEXT_GLOW').name('text glow').listen();
    textFolder.add(config, 'TEXT_GLOW_INTENSITY', 0, 100).step(1).name('glow intensity').listen();
    textFolder.add(config, 'TEXT_X', 0, 100).step(1).name('position x').listen();
    textFolder.add(config, 'TEXT_Y', 0, 100).step(1).name('position y').listen();
    textFolder.add(config, 'TEXT_ROTATION', 0, 100).step(1).name('rotation (50 = level)').listen();
    textFolder.add(config, 'TEXT_OPACITY', 0, 100).step(1).name('opacity').listen();

    let backgroundFolder = gui.addFolder('Background');
    backgroundFolder.add(config, 'BACKGROUND', BACKGROUND_NAMES).name('background').listen();
    backgroundFolder.addColor(config, 'BACK_COLOR').name('background color').listen().onChange(() => {
        config.BACKGROUND = 'Custom';
    });
    backgroundFolder.add(config, 'BG_BRIGHTNESS', 0, 100).step(1).name('brightness (50 = normal)').listen();
    backgroundFolder.add(config, 'BG_BLUR', 0, 100).step(1).name('blur').listen();
    backgroundFolder.add(config, 'BG_OPACITY', 0, 100).step(1).name('opacity').listen();

    let wallpaperFolder = gui.addFolder('Wallpaper');
    wallpaperFolder.add(config, 'SPLASHES').name('splashes').listen();
    wallpaperFolder.add(config, 'WALLPAPER_CLEAR').name('clear on return').listen();
    wallpaperFolder.add({ fun: showWallpaperInfo }, 'fun').name('📱 Set live wallpaper');

    let captureFolder = gui.addFolder('Capture');
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
        let hash = keywords.join('|');

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
    uniform float brightness;
    uniform float opacity;
    uniform sampler2D uBlur;
    uniform float blurAmount;

    void main () {
        vec3 c = mix(bottom, top, smoothstep(0.0, 1.0, vUv.y));
        vec2 p = (vUv - 0.5) * vec2(aspectRatio, 1.0);
        float r = length(p);
        c += glow * exp(-r * r * 3.0);
        c *= 1.0 - 0.35 * smoothstep(0.45, 1.2, r);
        float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        c += (n - 0.5) / 255.0;
        c = c * brightness + vec3(max(brightness - 1.0, 0.0) * 0.12);
        // Background blur: a soft, out-of-focus copy of the fluid behind it
        c += texture2D(uBlur, vUv).rgb * blurAmount;
        gl_FragColor = vec4(max(c, 0.0) * opacity, opacity);
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
    uniform sampler2D uGlow;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;
    uniform float specularPower;
    uniform float specularStrength;
    uniform float refraction;
    uniform float reflection;
    uniform float transparency;
    uniform float depth;
    uniform float glowIntensity;
    uniform float flareStyle;
    uniform float blIntensity;
    uniform float fluorescence;
    uniform float uvTint;
    uniform vec3 uvColor;
    uniform vec3 envTop;
    uniform vec3 envBottom;
    uniform float fluidAmount;

    #if defined(SHADING) || defined(SPECULAR) || defined(REFRACTION) || defined(REFLECTION) || defined(DEPTH) || defined(BLACKLIGHT)
    #define NEEDS_NORMAL
    #endif

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    float maxc (vec3 c) {
        return max(c.r, max(c.g, c.b));
    }

    #ifdef FLARE
    float ghostWeight (vec2 o, float power) {
        return pow(max(1.0 - length(vec2(0.5) - o) / 0.7071, 0.0), power);
    }

    vec3 flare (vec2 uv) {
        vec2 tc = vec2(1.0) - uv;
        vec2 toC = vec2(0.5) - tc;
        vec3 res = vec3(0.0);
        if (flareStyle < 0.5) {
            // Soft: a few wide, gentle ghosts
            for (int i = 0; i < 4; i++) {
                vec2 o = tc + toC * 0.45 * float(i);
                res += texture2D(uBloom, o).rgb * ghostWeight(o, 6.0);
            }
            res *= 0.35;
        } else if (flareStyle < 1.5) {
            // Sharp: a chain of crisp ghosts with color fringing
            for (int i = 0; i < 7; i++) {
                vec2 o = tc + toC * 0.28 * float(i);
                float w = ghostWeight(o, 10.0);
                res.r += texture2D(uBloom, o + toC * 0.012).r * w;
                res.g += texture2D(uBloom, o).g * w;
                res.b += texture2D(uBloom, o - toC * 0.012).b * w;
            }
            res *= 0.6;
        } else if (flareStyle < 2.5) {
            // Radial: a halo ring around the center
            vec2 hv = normalize(toC + vec2(1e-5)) * 0.42;
            vec2 o = tc + hv;
            res = texture2D(uBloom, o).rgb * ghostWeight(o, 4.0) * 0.9;
            vec2 o2 = tc + hv * 0.6;
            res += texture2D(uBloom, o2).rgb * ghostWeight(o2, 4.0) * vec3(0.6, 0.8, 1.0) * 0.4;
        } else {
            // Cinematic: blue anamorphic horizontal streaks
            for (int i = -6; i <= 6; i++) {
                float f = float(i);
                res += texture2D(uBloom, uv + vec2(f * 0.035, 0.0)).rgb * exp(-abs(f) * 0.35);
            }
            res *= vec3(0.35, 0.55, 1.0) * 0.35;
        }
        return res;
    }
    #endif

    void main () {
        vec2 uv = vUv;
        vec3 n = vec3(0.0, 0.0, 1.0);
        float edge = 0.0;

    #ifdef NEEDS_NORMAL
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        n = normalize(vec3(dx, dy, length(texelSize)));
        edge = length(vec2(dx, dy));
    #endif

    #ifdef REFRACTION
        uv += n.xy * refraction;
    #endif

        vec3 c = texture2D(uTexture, uv).rgb * fluidAmount;
        float presence = clamp(maxc(c) * 3.0, 0.0, 1.0);

    #ifdef SHADING
        float diffuse = clamp(dot(n, vec3(0.0, 0.0, 1.0)) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef DEPTH
        vec3 ld = normalize(vec3(-0.5, 0.6, 1.0));
        c *= mix(1.0, clamp(dot(n, ld) * 1.4 - 0.15, 0.25, 1.3), depth);
    #endif

    #ifdef SPECULAR
        vec3 L = normalize(vec3(-0.6, 0.7, 0.45));
        vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
        float spec = pow(max(dot(n, H), 0.0), specularPower) - pow(H.z, specularPower);
        c += vec3(max(spec, 0.0) * specularStrength) * presence;
    #endif

    #ifdef REFLECTION
        vec3 R = reflect(vec3(0.0, 0.0, -1.0), n);
        vec3 env = mix(envBottom, envTop, smoothstep(-0.6, 0.8, R.y));
        env += vec3(1.0) * pow(max(dot(R, normalize(vec3(-0.4, 0.7, 0.6))), 0.0), 24.0);
        float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 1.5);
        c += env * reflection * (0.15 + 0.85 * fres) * presence;
    #endif

    #if defined(BLOOM) || defined(FLARE)
        vec3 bloom = texture2D(uBloom, vUv).rgb * fluidAmount;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #if defined(BLOOM) || defined(FLARE)
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

    #ifdef GLOW
        c += texture2D(uGlow, vUv).rgb * glowIntensity;
    #endif

    #ifdef FLARE
        c += linearToGamma(flare(vUv));
    #endif

    #ifdef BLACKLIGHT
        float lumMax = maxc(c);
        c = mix(c, uvColor * lumMax * 1.2, uvTint);
        float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = max(mix(vec3(lum), c, 1.0 + 0.9 * blIntensity), 0.0) * (0.9 + 0.7 * fluorescence);
        vec3 hue = c / max(maxc(c), 1e-4);
        c += hue * clamp(edge * 120.0, 0.0, 1.0) * fluorescence * 0.6 * clamp(lumMax * 4.0, 0.0, 1.0);
    #endif

        float a = max(c.r, max(c.g, c.b));
        c *= 1.0 - transparency * 0.8;
        a *= 1.0 - transparency;

    #ifdef DEPTH
        // Drop shadow cast onto the background (light from the top left)
        float sh = length(texture2D(uTexture, vUv + vec2(-0.006, 0.008)).rgb);
        a += clamp(sh * 2.0, 0.0, 1.0) * depth * 0.55 * (1.0 - clamp(a, 0.0, 1.0));
    #endif

        gl_FragColor = vec4(c, a);
    }
`;

const postShaderSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uFrame;
    uniform sampler2D uHistory;
    uniform vec2 resolution;
    uniform float time;
    uniform vec2 shake;
    uniform float pixelSize;
    uniform float caAmount;
    uniform float fringeAmount;
    uniform float blurAmount;
    uniform float sharpenAmount;
    uniform float saturation;
    uniform float contrast;
    uniform float variation;
    uniform float gammaMode;
    uniform float motionMix;
    uniform float motionStyle;

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

    vec3 hueRotate (vec3 c, float a) {
        vec3 k = vec3(0.57735);
        float ca = cos(a);
        return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
    }

    float luma (vec3 c) {
        return dot(c, vec3(0.2126, 0.7152, 0.0722));
    }

    vec3 sampleColor (vec2 uv) {
    #ifdef CHROMA
        vec2 off = vec2(caAmount, 0.0) + (uv - 0.5) * fringeAmount;
        return vec3(texture2D(uFrame, uv + off).r, texture2D(uFrame, uv).g, texture2D(uFrame, uv - off).b);
    #else
        return texture2D(uFrame, uv).rgb;
    #endif
    }

    void main () {
        vec2 uv = vUv;
        vec2 px = 1.0 / resolution;

    #ifdef SHAKE
        uv = (uv - 0.5) * 0.97 + 0.5 + shake;
    #endif

    #ifdef PIXELATE
        vec2 cells = resolution / pixelSize;
        uv = (floor(uv * cells) + 0.5) / cells;
    #endif

        vec3 c = sampleColor(uv);

    #ifdef BLUR
        vec3 s = vec3(0.0);
        for (int i = 0; i < 8; i++) {
            float a = float(i) * 0.7853982;
            vec2 d = vec2(cos(a), sin(a)) * px * blurAmount;
            s += texture2D(uFrame, uv + d).rgb * 0.6 + texture2D(uFrame, uv + d * 2.0).rgb * 0.3;
        }
        c = (c + s) / (1.0 + 8.0 * 0.9);
    #endif

    #ifdef SHARPEN
        vec3 nb = (texture2D(uFrame, uv + vec2(px.x, 0.0)).rgb + texture2D(uFrame, uv - vec2(px.x, 0.0)).rgb
                 + texture2D(uFrame, uv + vec2(0.0, px.y)).rgb + texture2D(uFrame, uv - vec2(0.0, px.y)).rgb) * 0.25;
        c += (c - nb) * sharpenAmount;
    #endif

    #ifdef EMBOSS
        float e = luma(texture2D(uFrame, uv + px * 1.5).rgb) - luma(texture2D(uFrame, uv - px * 1.5).rgb);
        e *= 4.0;
        c = c * (1.0 + e * 1.5) + vec3(max(e, 0.0)) * 0.25;
    #endif

    #ifdef NEON
        float tl = luma(texture2D(uFrame, uv + vec2(-px.x, px.y) * 1.5).rgb);
        float tm = luma(texture2D(uFrame, uv + vec2(0.0, px.y) * 1.5).rgb);
        float tr = luma(texture2D(uFrame, uv + vec2(px.x, px.y) * 1.5).rgb);
        float ml = luma(texture2D(uFrame, uv + vec2(-px.x, 0.0) * 1.5).rgb);
        float mr = luma(texture2D(uFrame, uv + vec2(px.x, 0.0) * 1.5).rgb);
        float bl = luma(texture2D(uFrame, uv + vec2(-px.x, -px.y) * 1.5).rgb);
        float bm = luma(texture2D(uFrame, uv + vec2(0.0, -px.y) * 1.5).rgb);
        float br = luma(texture2D(uFrame, uv + vec2(px.x, -px.y) * 1.5).rgb);
        float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
        float gy = (tl + 2.0 * tm + tr) - (bl + 2.0 * bm + br);
        float g = length(vec2(gx, gy));
        vec3 hue = c / max(max(c.r, max(c.g, c.b)), 0.05);
        c = c * 0.25 + hue * smoothstep(0.02, 0.25, g) * 1.6;
    #endif

    #ifdef GRADE
        c = mix(vec3(luma(c)), c, saturation);
        c = (c - 0.5) * contrast + 0.5;
        if (variation > 0.0) {
            float nz = noise(uv * 3.0 + vec2(time * 0.07, -time * 0.05));
            c = hueRotate(c, (nz - 0.5) * 6.2831853 * variation);
        }
        c = max(c, 0.0);
    #endif

    #ifdef GAMMA
        c = max(c, 0.0);
        if (gammaMode < 0.5) {
            c = pow(c, vec3(0.9));
        } else if (gammaMode < 1.5) {
            c = pow(1.0 - exp(-c * 1.8), vec3(0.8));
        } else if (gammaMode < 2.5) {
            c = pow(c, vec3(1.5)) * 0.9;
        } else {
            c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
            c = mix(c * vec3(0.92, 1.02, 1.06), c * vec3(1.08, 1.0, 0.9), smoothstep(0.2, 0.8, luma(c)));
        }
    #endif

    #ifdef FILM
        c *= vec3(1.06, 1.0, 0.92);
        c *= mix(0.55, 1.0, smoothstep(0.95, 0.35, length(vUv - 0.5)));
        c += (hash(vUv * resolution + vec2(time * 61.0, time * 37.0)) - 0.5) * 0.06;
    #endif

    #ifdef INVERT
        c = 1.0 - clamp(c, 0.0, 1.0);
    #endif

    #ifdef MOTION
        vec2 huv = vUv;
        if (motionStyle > 0.5 && motionStyle < 1.5) {
            // Fluid: echoes drift and slowly rotate
            vec2 d = vUv - 0.5;
            float a = 0.012 * sin(time * 0.3);
            huv = 0.5 + vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a)) * 0.996 + vec2(0.0, 0.0012);
        } else if (motionStyle > 1.5) {
            // Dramatic: echoes zoom outward like a tunnel and shift hue
            huv = 0.5 + (vUv - 0.5) * 0.985;
        }
        vec3 h = texture2D(uHistory, huv).rgb;
        if (motionStyle > 1.5) h = hueRotate(h, 0.06);
        c = max(c, h * motionMix);
    #endif

        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
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
    uniform float fieldMode;
    uniform float fieldStrength;

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

        // Force fields
        if (fieldMode > 0.5) {
            float S = fieldStrength;
            float near = smoothstep(0.0, 0.08, r);
            if (fieldMode < 1.5) {
                // Vortex: whole-screen rotation, faster near the middle
                v += relax(v, tangent, S * near * 1.6 / (1.0 + 3.0 * r), 2.5);
            } else if (fieldMode < 2.5) {
                // Attractor: colored fluid falls toward the center
                v -= radial * near * S * 3.0 * w * dt;
            } else if (fieldMode < 3.5) {
                // Repeller: colored fluid is pushed out from the center
                v += radial * near * S * 3.0 * w * dt;
            } else if (fieldMode < 4.5) {
                // Spiral: rotation plus inward pull
                v += relax(v, tangent, S * near * 1.1 / (1.0 + 3.0 * r), 2.0);
                v -= radial * near * S * 2.0 * w * dt;
            } else if (fieldMode < 5.5) {
                // Radial: slowly turning star of outward and inward rays
                float ang = atan(p.y, p.x);
                v += radial * near * sin(6.0 * ang + time * 0.5) * S * 3.0 * (0.3 + 0.7 * w) * dt;
            } else if (fieldMode < 6.5) {
                // Wave: traveling vertical waves
                v.y += sin(p.x * 9.0 - time * 2.0) * S * 2.0 * dt;
                v.x += sin(p.y * 7.0 + time * 1.3) * S * 0.6 * dt;
            } else {
                // Magnetic: two opposite poles; flow circles them and follows field lines
                vec2 a = vec2(-0.22 * aspectRatio, 0.0);
                vec2 b = vec2(0.22 * aspectRatio, 0.0);
                vec2 pa = p - a;
                vec2 pb = p - b;
                vec2 E = pa / (dot(pa, pa) + 0.02) - pb / (dot(pb, pb) + 0.02);
                vec2 R = vec2(-E.y, E.x);
                v += (R * 0.5 + E * 0.8 * w) * S * 0.25 * dt;
            }
        }

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

const textApplyShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform sampler2D uText;
    uniform float mode;
    uniform float amount;

    void main () {
        vec4 c = texture2D(uTarget, vUv);
        vec4 t = texture2D(uText, vUv);
        float m = smoothstep(0.35, 0.65, t.a);
        if (mode < 0.5) c.xy *= 1.0 - m;           // obstacle: no flow inside letters
        else if (mode < 1.5) c.rgb *= 1.0 - m;     // obstacle: no color inside letters
        else c.rgb += t.rgb * amount;              // paint: letters keep adding color
        gl_FragColor = c;
    }
`);

const textOverlayShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uText;
    uniform float opacity;

    void main () {
        gl_FragColor = texture2D(uText, vUv) * opacity;
    }
`);

const pointForceShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec2 point;
    uniform float radius;
    uniform float radial;
    uniform float tangential;
    uniform float warp;
    uniform float fade;

    void main () {
        vec2 d = vUv - point;
        d.x *= aspectRatio;
        float r = length(d);
        float g = exp(-dot(d, d) / radius);
        vec2 dir = r > 1e-5 ? d / r : vec2(0.0);
        vec2 tang = vec2(-dir.y, dir.x);

        vec2 off = dir * warp * g;
        off.x /= aspectRatio;
        vec4 c = texture2D(uTarget, vUv - off);
        c.xy += (dir * radial + tang * tangential) * g;
        c *= 1.0 - fade * g;
        gl_FragColor = c;
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
    const quadBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const fn = (target, clear = false) => {
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
    };

    // Particles draw from their own buffer; this puts the fullscreen quad back
    fn.restore = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    };

    return fn;
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
const pointForceProgram      = new Program(baseVertexShader, pointForceShader);
const textApplyProgram       = new Program(baseVertexShader, textApplyShader);
const textOverlayProgram     = new Program(baseVertexShader, textOverlayShader);
const edgeDyeProgram         = new Program(baseVertexShader, edgeDyeShader);
const advectionProgram       = new Program(baseVertexShader, advectionShader);
const divergenceProgram      = new Program(baseVertexShader, divergenceShader);
const curlProgram            = new Program(baseVertexShader, curlShader);
const vorticityProgram       = new Program(baseVertexShader, vorticityShader);
const pressureProgram        = new Program(baseVertexShader, pressureShader);
const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

const displayMaterial = new Material(baseVertexShader, displayShaderSource);
const postMaterial = new Material(baseVertexShader, postShaderSource);

function initFramebuffers () {
    perf.appliedSim = effSimResolution();
    perf.appliedDye = effDyeResolution();
    let simRes = getResolution(perf.appliedSim);
    let dyeRes = getResolution(perf.appliedDye);

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

    let glowRes = getResolution(currentGlowResolution());
    glowFBO = createFBO(glowRes.width, glowRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    glowTemp = createFBO(glowRes.width, glowRes.height, rgba.internalFormat, rgba.format, texType, filtering);

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
    if (config.SPECULAR) displayKeywords.push("SPECULAR");
    if (config.REFRACTION > 0) displayKeywords.push("REFRACTION");
    if (config.REFLECTION > 0) displayKeywords.push("REFLECTION");
    if (config.DEPTH > 0) displayKeywords.push("DEPTH");
    if (config.GLOW_INTENSITY > 0) displayKeywords.push("GLOW");
    if (config.FLARE) displayKeywords.push("FLARE");
    displayMaterial.setKeywords(displayKeywords);
}

updateKeywords();
initFramebuffers();
multipleSplats(parseInt(Math.random() * 20) + 5);

let lastUpdateTime = null;
let colorUpdateTimer = 0.0;
initPresets();
update();

function update (timestamp) {
    // One clock for everything: the browser's frame timestamp
    const now = typeof timestamp === 'number' ? timestamp : performance.now();
    if (!frameAllowed(now)) {
        requestAnimationFrame(update);
        return;
    }
    const frameSeconds = perf.prevDrawn != null ? Math.min(Math.max((now - perf.prevDrawn) / 1000, 0), 0.25) : 1 / 60;
    if (perf.prevDrawn != null) measureFrame(now - perf.prevDrawn);
    perf.prevDrawn = now;

    const dt = calcDeltaTime(now);
    updatePerformance(frameSeconds);
    if (resizeCanvas())
        initFramebuffers();
    updateTextTexture();
    updateWallpaper(dt);
    recordHistory(frameSeconds);
    updateColors(dt);
    updatePalette(dt);
    updateBackground(dt);
    applyInputs(dt);
    // Emitters keep their 60-per-second rhythm even when fewer frames are drawn
    const emitSteps = Math.min(4, Math.max(1, Math.round(dt * 60)));
    for (let i = 0; i < emitSteps; i++) {
        updateAutoplay(dt / emitSteps);
        updateVortex(dt / emitSteps);
        updateSimMode(dt / emitSteps);
    }
    applyRandomness(dt);
    if (!config.PAUSED) {
        const simDt = dt * config.SPEED;
        const substeps = Math.max(1, Math.ceil(simDt / 0.0334 - 1e-6));
        for (let i = 0; i < substeps; i++)
            step(simDt / substeps);
    }
    updateParticles(dt);
    render(null, dt);
    syncTopMenu();
    requestAnimationFrame(update);
}

function calcDeltaTime (now) {
    let dt = lastUpdateTime == null ? 1 / 60 : (now - lastUpdateTime) / 1000;
    // Allow longer frames so low frame-rate limits keep real-time speed (the solver sub-steps them)
    dt = Math.min(Math.max(dt, 0), 1 / 15);
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

function applyInputs (dt) {
    if (splatStack.length > 0)
        multipleSplats(splatStack.pop());
    applyInjections();
    updateTouches(dt);
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
    textVelocityPass();

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
    const pressureIterations = effPressureIterations();
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
    textDyePass(dt);
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
        gl.uniform1f(u.fieldMode, FORCE_FIELDS.indexOf(config.FORCE_FIELD));
        gl.uniform1f(u.fieldStrength, config.FIELD_STRENGTH / 100 * 600);
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

function render (target, dt) {
    if (config.BLOOM || config.FLARE)
        applyBloom(dye.read, bloom);
    if (config.SUNRAYS) {
        applySunrays(dye.read, dye.write, sunrays);
        blur(sunrays, sunraysTemp, 1);
    }
    if (config.GLOW_INTENSITY > 0)
        applyGlow();
    applyBackgroundBlur();
    const transparent = config.TRANSPARENT || config.BACKGROUND === 'Transparent';

    // Screen filters render the frame offscreen first, then post-process it
    const usePost = target == null && postKeywords().length > 0;
    if (usePost) ensurePostFramebuffers();
    const dest = usePost ? frameFBO : target;

    if (target == null || !transparent) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
    }
    else {
        gl.disable(gl.BLEND);
    }

    if (usePost) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, dest.fbo);
        gl.viewport(0, 0, dest.width, dest.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (!transparent)
        drawBackground(dest);
    if (target == null && transparent)
        drawCheckerboard(dest);
    drawDisplay(dest);
    renderParticles(dest);
    drawTextOverlay(dest);

    if (usePost)
        runPost(dt || 0.016);
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
    gl.uniform1f(backgroundProgram.uniforms.brightness, config.BG_BRIGHTNESS / 50);
    gl.uniform1f(backgroundProgram.uniforms.opacity, config.BG_OPACITY / 100);
    gl.uniform1i(backgroundProgram.uniforms.uBlur, (config.BG_BLUR > 0 && bgBlurFBO ? bgBlurFBO : dye.read).attach(5));
    gl.uniform1f(backgroundProgram.uniforms.blurAmount, config.BG_BLUR > 0 && bgBlurFBO ? 0.45 * Math.min(1, config.BG_BLUR / 30) : 0);
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

    updateKeywords();
    displayMaterial.bind();
    const u = displayMaterial.uniforms;
    gl.uniform2f(u.texelSize, 1.0 / width, 1.0 / height);
    gl.uniform1i(u.uTexture, dye.read.attach(0));
    if (config.BLOOM || config.FLARE)
        gl.uniform1i(u.uBloom, bloom.attach(1));
    if (config.BLOOM) {
        gl.uniform1i(u.uDithering, ditheringTexture.attach(2));
        let scale = getTextureScale(ditheringTexture, width, height);
        gl.uniform2f(u.ditherScale, scale.x, scale.y);
    }
    if (config.SUNRAYS)
        gl.uniform1i(u.uSunrays, sunrays.attach(3));
    if (config.GLOW_INTENSITY > 0 && glowFBO) {
        gl.uniform1i(u.uGlow, glowFBO.attach(4));
        gl.uniform1f(u.glowIntensity, config.GLOW_INTENSITY / 100 * 1.5);
    }
    const spec = SPECULAR_STYLES[config.SPECULAR_STYLE] || SPECULAR_STYLES['Glossy'];
    gl.uniform1f(u.specularPower, spec[0]);
    gl.uniform1f(u.specularStrength, spec[1]);
    gl.uniform1f(u.refraction, config.REFRACTION / 100 * 0.02);
    gl.uniform1f(u.reflection, config.REFLECTION / 100 * 0.8);
    gl.uniform1f(u.transparency, config.TRANSPARENCY / 100 * 0.9);
    gl.uniform1f(u.depth, config.DEPTH / 100);
    gl.uniform1f(u.flareStyle, FLARE_STYLES.indexOf(config.FLARE_STYLE));
    gl.uniform1f(u.blIntensity, config.BLACKLIGHT_INTENSITY / 100);
    gl.uniform1f(u.fluorescence, config.FLUORESCENCE / 100);
    const uv = uvColor();
    gl.uniform1f(u.uvTint, uv ? 1 : 0);
    gl.uniform3f(u.uvColor, uv ? uv[0] : 0, uv ? uv[1] : 0, uv ? uv[2] : 0);
    gl.uniform3f(u.envTop, 0.55, 0.65, 0.85);
    gl.uniform3f(u.envBottom, 0.06, 0.05, 0.08);
    gl.uniform1f(u.fluidAmount, fluidAmount());
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
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS * splatRadiusScale / 100.0));
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
    updatePointerDownData(pointers[0], -1, posX, posY);
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

// Each finger is tracked by its identifier, so lifting one finger never disturbs the others
function touchPointer (identifier) {
    return pointers.find((p, i) => i > 0 && p.down && p.id === identifier);
}

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        let pointer = touchPointer(touches[i].identifier)
                   || pointers.find((p, j) => j > 0 && !p.down);
        if (pointer == null) {
            pointer = new pointerPrototype();
            pointers.push(pointer);
        }
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        updatePointerDownData(pointer, touches[i].identifier, posX, posY);
    }
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        let pointer = touchPointer(touches[i].identifier);
        if (pointer == null) continue;
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        updatePointerMoveData(pointer, posX, posY);
    }
}, false);

function releaseTouches (e) {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        let pointer = touchPointer(touches[i].identifier);
        if (pointer == null) continue;
        updatePointerUpData(pointer);
    }
}

window.addEventListener('touchend', releaseTouches);
window.addEventListener('touchcancel', releaseTouches);

// If the page loses focus mid-gesture, let go of everything so nothing stays stuck on
window.addEventListener('blur', () => pointers.forEach(updatePointerUpData));

window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
    if (modalOpen()) return;
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        redo();
        return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
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
        case 'KeyM': cycleMirror(); break;
        case 'KeyK': toggleMode('KALEIDOSCOPE', 'Kaleidoscope'); break;
        case 'KeyB': toggleMode('BLACKLIGHT', 'Blacklight'); break;
        case 'KeyT': toggleMode('TRAILS', 'Color trails'); break;
        case 'KeyN': toggleMode('RAINBOW', 'Rainbow'); break;
        case 'KeyI': toggleMode('RANDOM_INJECTION', 'Random color on touch'); break;
        case 'KeyH': document.body.classList.toggle('hide-ui'); break;
        case 'KeyG': cycleSetting('GESTURE', GESTURE_MODES, 'Gesture'); break;
        case 'KeyJ': cycleSetting('INJECTION', INJECTION_MODES, 'Injection'); break;
        case 'KeyX': cycleSetting('FORCE_FIELD', FORCE_FIELDS, 'Force field'); break;
        case 'KeyO': toggleMode('PARTICLES', 'Particles'); break;
        case 'KeyQ': cycleSimMode(); break;
        case 'KeyL': cycleSetting('PARTICLE_STYLE', PARTICLE_STYLES, 'Particle style'); break;
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
    pointer.justDown = true;
    pointer.heldTime = 0;
    queueInjection(pointer.texcoordX, pointer.texcoordY);
}

function updatePointerMoveData (pointer, posX, posY) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    let dx = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    let dy = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);

    // Sensitivity: low values ignore tiny jitters and soften response, high values amplify
    const sens = config.TOUCH_SENSITIVITY / 100;
    const deadZone = Math.max(0, 0.5 - sens) * 0.003;
    const mag = Math.hypot(dx, dy);
    if (mag <= deadZone) {
        dx = 0;
        dy = 0;
    } else {
        const k = pctScaleTo(config.TOUCH_SENSITIVITY) * (mag - deadZone) / mag;
        dx *= k;
        dy *= k;
        pointer.dirX = dx / Math.hypot(dx, dy);
        pointer.dirY = dy / Math.hypot(dx, dy);
    }

    pointer.deltaX = dx;
    pointer.deltaY = dy;
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
    let pixelRatio = (window.devicePixelRatio || 1) * (renderScaleFactor || 1);
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