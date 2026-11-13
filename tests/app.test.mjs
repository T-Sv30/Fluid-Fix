import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { boot, read } from './harness.mjs';

let app = null;
const start = options => (app = boot(options));
afterEach(() => { if (app) app.close(); app = null; });

const WELCOMED = { 'rippl.welcomed': '1' };

function openTab (label, section) {
    app.run('RipplUI.open()');
    app.click(app.$$('.rs-tab').find(t => t.textContent === label));
    if (section) app.click(app.$$('.rs-subtabs .rs-chip').find(c => c.textContent === section));
}

function row (label) {
    const el = app.$$('.rs-body .rs-row').find(r => r.querySelector('.rs-label') && r.querySelector('.rs-label').textContent === label);
    assert.ok(el, 'control "' + label + '" exists');
    return el;
}

function slide (label, v) {
    const input = row(label).querySelector('input[type=range]');
    input.value = String(v);
    input.dispatchEvent(new app.window.Event('input', { bubbles: true }));
}

describe('startup', () => {
    test('boots and draws frames without errors', () => {
        start();
        app.frames(8);
        assert.deepEqual(app.errors, []);
        assert.deepEqual(app.$$('.rs-dock-btn').map(b => b.textContent), ['Presets', 'Random', 'Controls', 'Freeze', 'Capture']);
        assert.equal(app.$$('.rs-tab').length, 8);
    });

    test('welcome appears once', () => {
        start();
        assert.ok(app.$('.rs-welcome'));
        app.click(app.$('.rs-welcome .rs-btn'));
        assert.equal(app.$('.rs-welcome'), null);
        const stored = app.window.localStorage.getItem('rippl.welcomed');
        app.close();
        start({ storage: { 'rippl.welcomed': stored } });
        assert.equal(app.$('.rs-welcome'), null);
    });

    test('one version number everywhere', () => {
        start({ storage: WELCOMED });
        const version = JSON.parse(read('package.json')).version;
        assert.equal(app.run('APP_VERSION'), version);
        const stamps = read('index.html').match(/\?v=[\w.-]+/g);
        assert.ok(stamps.length >= 4);
        stamps.forEach(s => assert.equal(s, '?v=' + version));
    });
});

describe('controls', () => {
    test('every control in every tab can be used', async () => {
        start({ storage: WELCOMED });
        app.run('RipplUI.open()');
        const Event = app.window.Event;
        let used = 0;
        for (const tab of app.$$('.rs-tab')) {
            app.click(tab);
            const sections = app.$$('.rs-subtabs .rs-chip');
            for (let s = 0; s < Math.max(1, sections.length); s++) {
                if (sections.length) app.click(app.$$('.rs-subtabs .rs-chip')[s]);
                const panel = app.$('.rs-body .rs-panel');
                if (tab.textContent === 'Presets') continue;
                for (const sw of panel.querySelectorAll('.rs-switch')) { app.click(sw); used++; }
                for (const input of panel.querySelectorAll('input[type=range]')) {
                    for (const v of [input.min, input.max, '37']) {
                        input.value = v;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    used++;
                }
                for (const b of panel.querySelectorAll('.rs-chips .rs-chip, .rs-swatch, .rs-quick-btn')) { app.click(b); used++; }
                for (const select of panel.querySelectorAll('select')) {
                    for (let i = 0; i < select.options.length; i++) {
                        select.value = String(i);
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    used++;
                }
                for (const input of panel.querySelectorAll('input[type=color]')) {
                    input.value = '#336699';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    used++;
                }
                await app.settle();
                app.frames(3);
            }
        }
        assert.ok(used > 150, 'expected well over 150 controls, used ' + used);
        assert.deepEqual(app.errors, []);
    });

    test('a slider writes its tuned engine value and shows a readable figure', () => {
        start({ storage: WELCOMED });
        openTab('Scene');
        slide('Speed', 100);
        assert.equal(app.run('config.SPEED'), 3);
        assert.equal(row('Speed').querySelector('.rs-value').textContent, '3.0×');
        slide('Speed', 50);
        assert.equal(app.run('config.SPEED'), 1);
    });

    test('dependent controls appear only when they apply', async () => {
        start({ storage: WELCOMED });
        openTab('Scene');
        app.run("config.MIRROR_MODE = 'Horizontal'");
        assert.equal(row('Segments').hidden, true);
        app.click(row('Kaleidoscope'));
        await app.settle();
        assert.equal(row('Segments').hidden, false);
        assert.equal(app.run('config.MIRROR_MODE'), 'None', 'kaleidoscope replaces mirror');
    });

    test('controls follow changes the app makes itself', () => {
        start({ storage: WELCOMED });
        openTab('Look', 'Lighting');
        assert.equal(row('Bloom').querySelector('.rs-switch').getAttribute('aria-checked'), 'true');
        app.run('config.BLOOM = false');
        app.frames(2);
        assert.equal(row('Bloom').querySelector('.rs-switch').getAttribute('aria-checked'), 'false');
    });

    test('every control has an accessible name', () => {
        start({ storage: WELCOMED });
        app.run('RipplUI.open()');
        for (const tab of app.$$('.rs-tab')) {
            app.click(tab);
            const sections = app.$$('.rs-subtabs .rs-chip');
            for (let s = 0; s < Math.max(1, sections.length); s++) {
                if (sections.length) app.click(app.$$('.rs-subtabs .rs-chip')[s]);
                for (const el of app.$$('.rs-ui button, .rs-ui input, .rs-ui select')) {
                    const labelled = el.getAttribute('aria-labelledby');
                    const name = el.getAttribute('aria-label') || (labelled && app.document.getElementById(labelled).textContent) || el.textContent;
                    assert.ok(name && name.trim(), 'unnamed ' + el.outerHTML.slice(0, 120));
                }
            }
        }
    });
});

describe('presets', () => {
    const cards = () => app.$$('.rs-preset .rs-preset-name').map(n => n.textContent);
    const action = label => app.$$('.rs-actions .rs-btn').find(b => b.textContent === label);

    test('save, rename and delete a look', async () => {
        start({ storage: WELCOMED });
        openTab('Presets');
        assert.ok(app.$('.rs-empty'), 'explains the empty state');
        assert.equal(action('Delete').getAttribute('aria-disabled'), 'true');

        app.run('config.CURL = 12');
        app.click(action('Save this look'));
        assert.ok(cards().includes('My preset'));
        assert.equal(app.$('.rs-empty'), null);

        app.click(action('Rename'));
        const input = app.$('#modal-input');
        assert.equal(app.$('#modal').hidden, false);
        assert.equal(input.value, 'My preset');
        input.value = 'Calm <b>sea</b>';
        app.click(app.$('.modal-btn.primary'));
        assert.ok(cards().includes('Calm bsea/b'), 'markup characters are stripped from names');

        app.click(action('Delete'));
        app.click(app.$('.modal-btn.danger'));
        assert.ok(!cards().some(n => n.startsWith('Calm')));
        assert.equal(app.run('presetState.current'), 'Default');
    });

    test('saved looks come back after a restart', () => {
        start({ storage: WELCOMED });
        app.run("config.PALETTE = 'Fire'; config.CURL = 7; presetSave()");
        const storage = { ...WELCOMED };
        ['fluidfix.presets', 'fluidfix.currentPreset'].forEach(k => { storage[k] = app.window.localStorage.getItem(k); });
        app.close();
        start({ storage });
        assert.equal(app.run('presetState.current'), 'My preset');
        assert.equal(app.run('config.CURL'), 7);
        assert.equal(app.run('config.PALETTE'), 'Fire');
    });

    test('imported presets are cleaned before use', () => {
        start({ storage: WELCOMED });
        app.run('presetImport()');
        app.$('#modal-input').value = 'not json';
        app.click(app.$('.modal-btn.primary'));
        assert.match(app.$('#modal-error').textContent, /valid preset/);

        app.$('#modal-input').value = JSON.stringify({
            name: '<img src=x onerror=alert(1)>',
            values: { CURL: 99999, PALETTE: 'Nope', BLOOM: 'yes', SPEED: 2, PAUSED: true, __proto__x: 1 },
        });
        app.click(app.$('.modal-btn.primary'));
        assert.equal(app.$('#modal').hidden, true);
        assert.equal(app.run('config.CURL'), 50, 'numbers are clamped to their range');
        assert.equal(app.run('config.SPEED'), 2);
        assert.equal(app.run('config.PALETTE'), 'Classic', 'unknown choices are dropped');
        assert.equal(app.run('config.BLOOM'), true, 'wrong types are dropped');
        assert.equal(app.run('config.PAUSED'), false, 'runtime state is never imported');
        assert.ok(!/[<>]/.test(app.run('presetState.current')));
        assert.deepEqual(app.errors, []);
    });

    test('undo and redo step through settings', () => {
        start({ storage: WELCOMED });
        app.frames(2);
        app.run('config.CURL = 3');
        app.frames(3);
        app.run('undo()');
        assert.equal(app.run('config.CURL'), 30);
        app.run('redo()');
        assert.equal(app.run('config.CURL'), 3);
    });
});

describe('navigation', () => {
    test('Back closes the top-most thing first', () => {
        start({ storage: WELCOMED });
        const back = () => app.run('RipplUI.handleBack()');
        assert.equal(back(), false, 'nothing to close');

        app.click(app.$('.rs-dock-btn.main'));
        assert.equal(app.run('RipplUI.isOpen()'), true);
        app.run('showPrivacy()');
        assert.equal(back(), true);
        assert.equal(app.$('#modal').hidden, true, 'dialog first');
        assert.equal(app.run('RipplUI.isOpen()'), true);
        assert.equal(back(), true);
        assert.equal(app.run('RipplUI.isOpen()'), false, 'then the sheet');

        app.run('RipplUI.setHidden(true)');
        assert.ok(app.document.body.classList.contains('hide-ui'));
        assert.equal(back(), true);
        assert.ok(!app.document.body.classList.contains('hide-ui'));
    });

    test('the Presets dock button opens the preset gallery', () => {
        start({ storage: WELCOMED });
        app.click(app.$$('.rs-dock-btn')[0]);
        assert.equal(app.run('RipplUI.isOpen()'), true);
        assert.ok(app.$$('.rs-preset').length >= 6);
        assert.equal(app.$('.rs-tab[aria-selected="true"]').textContent, 'Presets');
    });

    test('Freeze shows its state on the dock', () => {
        start({ storage: WELCOMED });
        const freeze = app.$$('.rs-dock-btn')[3];
        app.click(freeze);
        assert.equal(app.run('config.PAUSED'), true);
        assert.equal(freeze.textContent, 'Resume');
        assert.equal(freeze.getAttribute('aria-pressed'), 'true');
    });
});

describe('device settings', () => {
    test('are remembered on the device and validated when read back', async () => {
        start({ storage: WELCOMED });
        openTab('System', 'Performance');
        app.click(row('Performance mode').querySelectorAll('.rs-chip')[0]);   // Battery Saver
        await app.settle();
        app.frames(6);
        const saved = app.window.localStorage.getItem('rippl.device');
        assert.equal(JSON.parse(saved).FPS_LIMIT, '30 FPS');
        app.close();

        start({ storage: { ...WELCOMED, 'rippl.device': saved } });
        assert.equal(app.run('config.FPS_LIMIT'), '30 FPS');
        assert.equal(app.run('config.BATTERY_SAVER'), true);
        app.close();

        const bad = JSON.stringify({ FPS_LIMIT: '9000 FPS', RENDER_SCALE: 'max', DYE_RESOLUTION: 123456, HAPTICS: 'no' });
        start({ storage: { ...WELCOMED, 'rippl.device': bad } });
        assert.equal(app.run('config.FPS_LIMIT'), 'Unlimited');
        assert.equal(app.run('config.RENDER_SCALE'), 100);
        assert.equal(app.run('config.DYE_RESOLUTION'), 512, 'the phone default');
        assert.equal(app.run('deviceSettings.HAPTICS'), true);
    });
});

describe('inside the Android app', () => {
    const calls = (plugin, method) => app.nativeCalls.filter(c => c.plugin === plugin && c.method === method);
    const wait = async () => { for (let i = 0; i < 5; i++) await app.settle(); };

    test('Capture saves to the gallery', async () => {
        start({ native: true, storage: WELCOMED });
        app.click(app.$$('.rs-dock-btn')[4]);
        await wait();
        const [save] = calls('RipplDevice', 'saveImage');
        assert.ok(save, 'asked the app to save the image');
        assert.match(save.options.name, /^rippl-\d{8}-\d{6}\.png$/);
        assert.ok(save.options.data.length > 0);
        assert.equal(app.$('#toast').textContent, 'Saved to your gallery');
    });

    test('sharing a preset sends a file through the share sheet', async () => {
        start({ native: true, storage: WELCOMED });
        app.run('presetExport()');
        const labels = Array.from(app.$$('.modal-btn')).map(b => b.textContent);
        assert.deepEqual(labels, ['Close', 'Share', 'Copy'], 'no browser download inside the app');
        app.click(app.$$('.modal-btn')[1]);
        await wait();
        assert.equal(calls('Filesystem', 'writeFile')[0].options.path, 'Default.rippl.json');
        assert.equal(calls('Share', 'share')[0].options.files.join(), 'file:///cache/Default.rippl.json');
    });

    test('Back minimizes the app only when nothing is open', async () => {
        start({ native: true, storage: WELCOMED });
        app.run('RipplUI.open()');
        app.window.__fireNative('App.backButton');
        assert.equal(app.run('RipplUI.isOpen()'), false);
        assert.equal(calls('App', 'minimizeApp').length, 0);
        app.window.__fireNative('App.backButton');
        assert.equal(calls('App', 'minimizeApp').length, 1);
    });

    test('haptics follow the setting, and hiding the controls hides the system bars', async () => {
        start({ native: true, storage: WELCOMED });
        openTab('System', 'App');
        app.click(row('Haptic feedback'));
        await wait();
        const before = calls('Haptics', 'impact').length;
        app.click(row('Keep the screen on'));
        await wait();
        assert.equal(calls('Haptics', 'impact').length, before, 'no vibration once switched off');
        assert.equal(calls('RipplDevice', 'setKeepAwake')[0].options.on, true);
        app.run('RipplUI.setHidden(true)');
        assert.equal(calls('SystemBars', 'hide').length, 1);
        assert.equal(app.window.navigator.serviceWorker, undefined);
    });
});
