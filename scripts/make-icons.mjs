// Draws the RIPPL Studio icon (a gradient droplet on a dark field) and writes every size the
// web app and the Android app need. Pure Node: no image libraries. Run with `npm run icons`.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- PNG writer ----------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

function crc32 (buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk (type, data) {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);
    return out;
}

function png (size, rgba) {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(size, 0);
    header.writeUInt32BE(size, 4);
    header[8] = 8;   // bit depth
    header[9] = 6;   // RGBA
    const rows = Buffer.alloc(size * (size * 4 + 1));
    for (let y = 0; y < size; y++) rgba.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(rows, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---------- Drawing ----------

const VIOLET = [139, 92, 246];
const CYAN = [34, 211, 238];
const PINK = [244, 114, 182];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp01 = v => Math.min(1, Math.max(0, v));

function gradient (t) {
    t = clamp01(t);
    return t < 0.55 ? mix(VIOLET, CYAN, t / 0.55) : mix(CYAN, PINK, (t - 0.55) / 0.45);
}

// Distance to a teardrop: a round body of radius r with its tip h above the centre (negative inside)
function teardrop (x, y, r, h) {
    x = Math.abs(x);
    const tip = 0.02 * r;
    const b = (r - tip) / h;
    const a = Math.sqrt(1 - b * b);
    const k = -x * b + y * a;
    if (k < 0) return Math.hypot(x, y) - r;
    if (k > a * h) return Math.hypot(x, y - h) - tip;
    return x * a + y * b - r;
}

function roundedSquare (x, y, half, radius) {
    const dx = Math.abs(x) - half + radius;
    const dy = Math.abs(y) - half + radius;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radius;
}

// One sample at (x, y) in -1..1, y pointing up. Returns straight-alpha [r, g, b, a].
function sample (x, y, { shape, scale }) {
    let color = [0, 0, 0];
    let alpha = 0;

    if (shape !== 'foreground') {
        const glow = Math.exp(-((x * x) + (y + 0.1) * (y + 0.1)) * 1.6);
        color = mix([8, 8, 16], [58, 28, 120], glow * 0.85);
        alpha = shape === 'rounded' ? clamp01(0.5 - roundedSquare(x, y, 1, 0.44) * 200)
              : shape === 'circle' ? clamp01(0.5 - (Math.hypot(x, y) - 1) * 200)
              : 1;
    }

    const cy = -0.2 * scale;                      // body centre sits a little below the middle
    const r = 0.5 * scale;
    const d = teardrop(x, y - cy, r, 1.04 * scale);
    const fill = gradient((x - (y - cy)) / (2.2 * scale) + 0.5);

    // Soft halo around the drop
    if (d > 0) {
        const halo = Math.exp(-d / (0.16 * scale)) * 0.45;
        color = mix(color, fill, halo);
        if (shape === 'foreground') { color = fill; alpha = Math.max(alpha, halo); }
    }

    const inside = clamp01(0.5 - d * 160);
    if (inside > 0) {
        const lit = mix(fill, [255, 255, 255], clamp01(0.22 + (y - cy) / (3 * scale)) * 0.35);
        color = mix(color, lit, inside);
        alpha = Math.max(alpha, inside);

        // The highlight: a short arc inside the lower left of the drop
        const px = x, py = y - cy;
        const ring = Math.abs(Math.hypot(px, py) - 0.3 * scale) - 0.045 * scale;
        const angle = Math.atan2(py, px) * 180 / Math.PI;      // lower left is around -135°
        const inArc = clamp01(1 - Math.abs(angle + 135) / 42);
        const shine = clamp01(0.5 - ring * 160) * Math.min(1, inArc * 4) * inside;
        color = mix(color, [255, 255, 255], shine * 0.9);
    }
    return [color[0], color[1], color[2], alpha];
}

function draw (size, options) {
    const out = Buffer.alloc(size * size * 4);
    const N = 4;   // 4×4 samples per pixel
    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let sy = 0; sy < N; sy++) {
                for (let sx = 0; sx < N; sx++) {
                    const x = ((px + (sx + 0.5) / N) / size) * 2 - 1;
                    const y = 1 - ((py + (sy + 0.5) / N) / size) * 2;
                    const s = sample(x, y, options);
                    r += s[0] * s[3]; g += s[1] * s[3]; b += s[2] * s[3]; a += s[3];
                }
            }
            const i = (py * size + px) * 4;
            if (a > 0) {
                out[i] = Math.round(r / a);
                out[i + 1] = Math.round(g / a);
                out[i + 2] = Math.round(b / a);
            }
            out[i + 3] = Math.round(a / (N * N) * 255);
        }
    }
    return png(size, out);
}

function write (path, size, options) {
    const file = join(ROOT, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, draw(size, options));
    console.log(path, size + 'px');
}

// Web app
write('icons/icon-192.png', 192, { shape: 'rounded', scale: 0.62 });
write('icons/icon-512.png', 512, { shape: 'rounded', scale: 0.62 });
write('icons/maskable-512.png', 512, { shape: 'full', scale: 0.46 });
write('icons/store-icon-512.png', 512, { shape: 'full', scale: 0.62 });   // Google Play listing icon

// Android app (skipped until the android project exists)
const res = 'android/app/src/main/res';
if (existsSync(join(ROOT, res))) {
    const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
    Object.keys(densities).forEach(d => {
        const k = densities[d];
        write(`${res}/mipmap-${d}/ic_launcher.png`, 48 * k, { shape: 'rounded', scale: 0.62 });
        write(`${res}/mipmap-${d}/ic_launcher_round.png`, 48 * k, { shape: 'circle', scale: 0.56 });
        write(`${res}/mipmap-${d}/ic_launcher_foreground.png`, 108 * k, { shape: 'foreground', scale: 0.4 });
    });
}
