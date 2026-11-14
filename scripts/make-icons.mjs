// Cuts every icon the web app and the Android app need from one piece of artwork,
// icons/app-icon-source.png (a glowing fluid swirl inside a rounded square, on black).
// Pure Node: no image libraries. Run with `npm run icons` after replacing the artwork.

import { deflateSync, inflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
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

// ---------- PNG reader ----------

// Reads an 8-bit RGB or RGBA PNG (not interlaced) into { width, height, channels, data }
function readPng (file) {
    const buf = readFileSync(file);
    let pos = 8, width = 0, height = 0, channels = 0;
    const idat = [];
    while (pos < buf.length) {
        const length = buf.readUInt32BE(pos);
        const type = buf.toString('ascii', pos + 4, pos + 8);
        const data = buf.subarray(pos + 8, pos + 8 + length);
        if (type === 'IHDR') {
            width = data.readUInt32BE(0);
            height = data.readUInt32BE(4);
            channels = data[9] === 2 ? 3 : data[9] === 6 ? 4 : 0;
            if (data[8] !== 8 || !channels || data[12] !== 0) throw new Error(file + ': needs an 8-bit RGB or RGBA PNG that is not interlaced');
        }
        if (type === 'IDAT') idat.push(data);
        pos += length + 12;
    }
    const raw = inflateSync(Buffer.concat(idat));
    const stride = width * channels;
    const out = Buffer.alloc(stride * height);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)];
        const line = y * (stride + 1) + 1, row = y * stride;
        for (let i = 0; i < stride; i++) {
            const left = i >= channels ? out[row + i - channels] : 0;
            const up = y > 0 ? out[row - stride + i] : 0;
            const upLeft = y > 0 && i >= channels ? out[row - stride + i - channels] : 0;
            let predict = 0;
            if (filter === 1) predict = left;
            else if (filter === 2) predict = up;
            else if (filter === 3) predict = (left + up) >> 1;
            else if (filter === 4) {
                const p = left + up - upLeft;
                const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
                predict = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
            }
            out[row + i] = (raw[line + i] + predict) & 0xff;
        }
    }
    return { width, height, channels, data: out };
}

// ---------- Cutting icons from the artwork ----------

const art = readPng(join(ROOT, 'icons/app-icon-source.png'));

// Where things are in the artwork, as fractions of its width
const FRAME = 0.905;     // the glowing rounded square, edge to edge
const INSIDE = 0.80;     // the fluid inside the frame, clear of its rim
const FRAME_CORNER = 0.37;   // the frame's corner radius, relative to half its width

const clamp01 = v => Math.min(1, Math.max(0, v));

function roundedSquare (x, y, half, radius) {
    const dx = Math.abs(x) - half + radius;
    const dy = Math.abs(y) - half + radius;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radius;
}

// One icon. `span` is how much of the artwork's width the icon shows, centred (more than 1 leaves
// a black margin around the artwork). `shape` is the outline: 'rounded' follows the artwork's own
// frame, 'circle' is a disc, 'full' is a plain square.
function draw (size, { shape, span }) {
    const out = Buffer.alloc(size * size * 4);
    const { width: W, height: H, channels: C, data } = art;
    const N = Math.min(12, Math.max(3, Math.ceil(span * W / size)));     // samples per pixel, each way
    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let sy = 0; sy < N; sy++) {
                for (let sx = 0; sx < N; sx++) {
                    const x = ((px + (sx + 0.5) / N) / size) * 2 - 1;
                    const y = ((py + (sy + 0.5) / N) / size) * 2 - 1;
                    const cover = shape === 'rounded' ? clamp01(0.5 - roundedSquare(x, y, 1, FRAME_CORNER) * size)
                                : shape === 'circle' ? clamp01(0.5 - (Math.hypot(x, y) - 1) * size)
                                : 1;
                    if (cover === 0) continue;
                    a += cover;
                    const u = (0.5 + x * span / 2) * W - 0.5, v = (0.5 + y * span / 2) * H - 0.5;
                    if (u < 0 || v < 0 || u > W - 1 || v > H - 1) continue;      // outside the artwork: black
                    const iu = Math.min(W - 2, Math.floor(u)), iv = Math.min(H - 2, Math.floor(v));
                    const fu = u - iu, fv = v - iv;
                    const i = (iv * W + iu) * C, j = i + W * C;
                    const tap = c => (data[i + c] * (1 - fu) + data[i + C + c] * fu) * (1 - fv)
                                   + (data[j + c] * (1 - fu) + data[j + C + c] * fu) * fv;
                    r += tap(0) * cover; g += tap(1) * cover; b += tap(2) * cover;
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
write('icons/icon-192.png', 192, { shape: 'rounded', span: FRAME });
write('icons/icon-512.png', 512, { shape: 'rounded', span: FRAME });
write('icons/maskable-512.png', 512, { shape: 'full', span: INSIDE });      // the device cuts its own shape from this
write('icons/store-icon-512.png', 512, { shape: 'full', span: 1 });         // Google Play listing icon

// Android app (skipped until the android project exists)
const res = 'android/app/src/main/res';
if (existsSync(join(ROOT, res))) {
    const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
    Object.keys(densities).forEach(d => {
        const k = densities[d];
        write(`${res}/mipmap-${d}/ic_launcher.png`, 48 * k, { shape: 'rounded', span: FRAME });
        write(`${res}/mipmap-${d}/ic_launcher_round.png`, 48 * k, { shape: 'circle', span: INSIDE });
        // The launcher shows the middle two thirds of this layer, so the fluid fills that and the frame falls outside it
        write(`${res}/mipmap-${d}/ic_launcher_foreground.png`, 108 * k, { shape: 'full', span: INSIDE * 108 / 76 });
    });
}
