// Boots the real app (index.html + native.js + ui.js + script.js) inside jsdom with a stand-in
// for WebGL, so the interface and the engine's settings code can be exercised without a GPU.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const read = name => readFileSync(join(ROOT, name), 'utf8');

// Any ALL_CAPS property is a constant, any other property is a method with a harmless result
// faults: { incompleteFramebuffers, linkFails } make the stand-in behave like a GPU that can't cope
function fakeGL (canvas, faults = {}) {
    const constants = new Map();
    const methods = {
        getExtension: () => ({}),
        getParameter: () => 4096,
        getShaderParameter: () => true,
        getProgramParameter: (program, name) => (name === constantOf('ACTIVE_UNIFORMS') ? 0 : !faults.linkFails),
        getShaderInfoLog: () => '',
        getProgramInfoLog: () => '',
        getError: () => 0,
        isContextLost: () => false,
        checkFramebufferStatus: () => (faults.incompleteFramebuffers ? 0 : constantOf('FRAMEBUFFER_COMPLETE')),
        getUniformLocation: () => ({}),
        getActiveUniform: () => ({ name: 'u' }),
    };
    function constantOf (name) {
        if (!constants.has(name)) constants.set(name, 0x1000 + constants.size);
        return constants.get(name);
    }
    return new Proxy({}, {
        get (target, prop) {
            if (typeof prop !== 'string') return undefined;
            if (prop === 'canvas') return canvas;
            if (prop === 'drawingBufferWidth') return canvas.width || 360;
            if (prop === 'drawingBufferHeight') return canvas.height || 720;
            if (/^[A-Z][A-Z0-9_]*$/.test(prop)) return constantOf(prop);
            if (methods[prop]) return methods[prop];
            if (/^create/.test(prop)) return () => ({});
            return () => undefined;
        },
    });
}

function fake2D () {
    const image = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h * 4)) });
    const methods = {
        measureText: () => ({ width: 10 }),
        createImageData: image,
        getImageData: (x, y, w, h) => image(w, h),
        createLinearGradient: () => ({ addColorStop () {} }),
        createRadialGradient: () => ({ addColorStop () {} }),
    };
    return new Proxy({}, {
        get: (target, prop) => (prop in target ? target[prop] : methods[prop] || (() => undefined)),
        set: (target, prop, v) => { target[prop] = v; return true; },
    });
}

// url: the address the app is opened at (the wallpaper page is the app with ?wallpaper=1)
export function boot ({ native = false, storage = {}, deviceMemory, gl = {}, url = 'https://localhost/' } = {}) {
    const dom = new JSDOM(read('index.html'), { url, runScripts: 'outside-only' });
    const { window } = dom;
    // A phone, so the tests exercise the mobile defaults on any machine
    Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
    });
    // Gigabytes of memory the device reports (browsers round it; some report nothing)
    if (deviceMemory != null) Object.defineProperty(window.navigator, 'deviceMemory', { value: deviceMemory });
    const errors = [];
    window.addEventListener('error', e => errors.push(e.error || e.message));
    Object.keys(storage).forEach(k => window.localStorage.setItem(k, storage[k]));

    const frames = [];
    window.requestAnimationFrame = fn => frames.push(fn);
    window.matchMedia = () => ({ matches: false, addEventListener () {}, removeEventListener () {} });
    window.HTMLElement.prototype.scrollIntoView = () => {};
    Object.defineProperty(window.HTMLCanvasElement.prototype, 'clientWidth', { get: () => 360 });
    Object.defineProperty(window.HTMLCanvasElement.prototype, 'clientHeight', { get: () => 720 });
    window.HTMLCanvasElement.prototype.getContext = function (type) {
        if (type === 'webgl2') return (this.__gl = this.__gl || fakeGL(this, gl));
        if (type === '2d') return (this.__2d = this.__2d || fake2D());
        return null;
    };
    window.HTMLCanvasElement.prototype.toBlob = function (cb) { cb(new window.Blob(['png'], { type: 'image/png' })); };

    const nativeCalls = [];
    if (native) {
        const listeners = {};
        window.Capacitor = {
            isNativePlatform: () => true,
            nativePromise: (plugin, method, options) => {
                nativeCalls.push({ plugin, method, options });
                if (plugin === 'Filesystem') return Promise.resolve({ uri: 'file:///cache/' + options.path });
                return Promise.resolve({});
            },
            addListener: (plugin, event, fn) => { listeners[plugin + '.' + event] = fn; },
        };
        window.__fireNative = name => listeners[name] && listeners[name]();
    }

    // Run as classic scripts, so top-level let/const stay reachable from later scripts
    const context = dom.getInternalVMContext();
    const script = (code, filename) => new vm.Script(code, { filename }).runInContext(context);
    // A script that stops with an error is reported like any other error, so tests can look at the page
    ['native.js', 'ui.js', 'script.js'].forEach(file => {
        try { script(read(file), file); } catch (e) { errors.push(e); }
    });

    let clock = 1000;
    return {
        dom,
        window,
        document: window.document,
        errors,
        nativeCalls,
        // Reads or runs anything in the app's global scope
        run: code => script(code, 'test-snippet.js'),
        userAgent: () => window.navigator.userAgent,
        // Advances the app by n animation frames
        // How many frames the app has asked for and not yet been given
        pendingFrames: () => frames.length,
        frames (n = 1) {
            for (let i = 0; i < n; i++) {
                clock += 300;
                const fn = frames.shift();
                if (fn) fn(clock);
            }
        },
        $: sel => window.document.querySelector(sel),
        $$: sel => Array.from(window.document.querySelectorAll(sel)),
        click (el) { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); },
        async settle () { await new Promise(r => setTimeout(r, 0)); },
        close () { window.close(); },
    };
}
