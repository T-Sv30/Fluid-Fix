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

const visibleRows = () => app.$$('.rs-body .rs-row').filter(r => !r.hidden).map(r => r.querySelector('.rs-label') && r.querySelector('.rs-label').textContent);

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
        assert.match(app.userAgent(), /Pixel 8/, 'the harness pretends to be a phone on every machine');
        assert.deepEqual(app.$$('.rs-dock-btn').map(b => b.textContent), ['Presets', 'Random', 'Controls', 'Freeze', 'Capture']);
        assert.deepEqual(app.$$('.rs-tab').map(t => t.textContent), ['Presets', 'Scene', 'Color', 'Effects', 'Physics', 'Layers', 'System']);
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
        openTab('Effects', 'Light');
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

describe('finding your way', () => {

    test('every setting, section and button has a short description', () => {
        start({ storage: WELCOMED });
        const missing = [];
        const check = (where, item) => {
            const text = item.help;
            if (!text || text.length < 12 || text.length > 140 || !/[.]$/.test(text)) missing.push(where + ' › ' + (typeof item.label === 'function' ? item.label() : item.label));
        };
        const tabs = app.run('buildTabs()');
        let count = 0;
        tabs.forEach(tab => {
            if (tab.custom) { check('tab', tab); return; }
            tab.sections.forEach(section => {
                check(tab.label, section);
                section.controls.forEach(c => {
                    if (c.type === 'heading') return;
                    if (c.type === 'quick') { c.items.forEach(i => { check(section.label, i); count++; }); return; }
                    check(tab.label + ' › ' + section.label, c);
                    count++;
                });
            });
        });
        assert.deepEqual(missing, []);
        assert.ok(count > 150, 'described ' + count + ' settings');
    });

    test('every choice of the big pickers has its own note', () => {
        start({ storage: WELCOMED });
        const gaps = app.run(`(() => {
            const lists = { SIM_MODE: SIM_MODE_NAMES, GESTURE: GESTURE_MODES, INJECTION: INJECTION_MODES, FORCE_FIELD: FORCE_FIELDS,
                            EDGE: EDGE_MODES, TEXT_MODE: TEXT_MODES, PERFORMANCE_MODE: Object.keys(PERFORMANCE_MODES) };
            const out = [];
            Object.keys(lists).forEach(k => lists[k].forEach(name => { if (!OPTION_HELP[k][name]) out.push(k + ':' + name); }));
            Object.keys(HELP).forEach(k => { if (!(k in config) && !(k in PCT)) out.push('unknown key ' + k); });
            return out.join(', ');
        })()`);
        assert.equal(gaps, '');
    });

    test('the ? button shows and hides descriptions, and remembers the choice', async () => {
        start({ storage: WELCOMED });
        openTab('Scene');
        const button = app.$('.rs-icon-btn[aria-label^="Show a short description"]');
        const sheet = app.$('.rs-sheet');
        assert.equal(sheet.classList.contains('help-on'), false);
        app.click(button);
        assert.equal(sheet.classList.contains('help-on'), true);
        assert.equal(button.getAttribute('aria-pressed'), 'true');

        const mode = row('Mode');
        assert.match(mode.querySelector('.rs-help').textContent, /ready-made scene.*Standard Fluid: plain fluid/);
        app.click(Array.from(mode.querySelectorAll('.rs-chip')).find(c => c.textContent === 'Whirlpool'));
        await app.settle();
        assert.match(mode.querySelector('.rs-help').textContent, /Whirlpool: color pours in at the rim/, 'follows the current choice');

        const speed = row('Speed').querySelector('input');
        assert.equal(app.document.getElementById(speed.getAttribute('aria-describedby')).textContent, app.run('HELP.SPEED'));
        assert.match(app.$('.rs-intro').textContent, /What is happening on screen/);
        const firstQuick = app.$('.rs-help-list div');   // the colon between the two is drawn by the stylesheet
        assert.equal(firstQuick.querySelector('dt').textContent, 'Splash');
        assert.match(firstQuick.querySelector('dd').textContent, /^Adds a handful/);

        const stored = app.window.localStorage.getItem('rippl.help');
        app.close();
        start({ storage: { ...WELCOMED, 'rippl.help': stored } });
        assert.equal(app.$('.rs-sheet').classList.contains('help-on'), true);
    });

    test('search finds settings by name, description or place, and they work in place', async () => {
        start({ storage: WELCOMED });
        app.click(app.$('.rs-icon-btn[aria-label="Search the settings"]'));
        assert.equal(app.run('RipplUI.isOpen()'), true, 'search opens the sheet');
        assert.equal(app.$('.rs-search').hidden, false);
        assert.match(app.$('.rs-empty').textContent, /Type to find/);

        const type = text => {
            const input = app.$('.rs-search-input');
            input.value = text;
            input.dispatchEvent(new app.window.Event('input', { bubbles: true }));
        };

        type('bloom');
        assert.deepEqual(visibleRows(), ['Bloom', 'Bloom intensity', 'Bloom threshold', 'Effect quality'],
            'name matches come first, then settings whose description mentions the word');
        assert.equal(app.$('.rs-crumb').textContent, 'Effects › Light');
        app.click(row('Bloom'));
        await app.settle();
        assert.equal(app.run('config.BLOOM'), false, 'a result is the real control');
        assert.ok(visibleRows().includes('Bloom intensity'), 'results stay visible even when their feature is off');

        type('honey');
        assert.deepEqual(visibleRows(), ['Thickness'], 'matches words in the description');
        type('edges bounce');
        assert.deepEqual(visibleRows(), ['Bounce', 'Corners'],
            'every word must match somewhere, and a match in the name comes first');
        type('zzzz');
        assert.match(app.$('.rs-empty').textContent, /No setting matches “zzzz”/);

        type('gravity');
        app.click(app.$('.rs-crumb'));
        assert.equal(app.$('.rs-search').hidden, true, 'going to a place closes search');
        assert.equal(app.$('.rs-tab[aria-selected="true"]').textContent, 'Physics');
        assert.equal(app.$('.rs-subtabs .rs-chip[aria-selected="true"]').textContent, 'Forces');
        assert.ok(visibleRows().includes('Gravity'));

        app.run('RipplUI.search()');
        assert.equal(app.run('RipplUI.handleBack()'), true);
        assert.equal(app.$('.rs-search').hidden, true, 'Back leaves search first');
        assert.equal(app.run('RipplUI.isOpen()'), true);
        assert.deepEqual(app.errors, []);
    });

    test('a feature’s options appear only while the feature is on', async () => {
        start({ storage: WELCOMED });
        openTab('Layers', 'Particles');
        assert.deepEqual(visibleRows(), ['Particles']);
        app.click(row('Particles'));
        await app.settle();
        assert.ok(visibleRows().length > 12);
        assert.ok(!visibleRows().includes('Single color'));
        app.run("config.PARTICLE_COLOR_MODE = 'Single Color'");
        app.frames(2);
        assert.ok(visibleRows().includes('Single color'));
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

    test('saving always makes a new preset and leaves the others alone', () => {
        start({ storage: WELCOMED });
        app.run('config.CURL = 5; presetSave()');
        app.run('config.CURL = 9; presetSave()');
        assert.deepEqual(JSON.parse(app.run('JSON.stringify(presetState.user.map(p => [p.name, p.values.CURL]))')),
            [['My preset', 5], ['My preset 2', 9]]);
        assert.equal(app.run('presetState.current'), 'My preset 2');
        assert.equal(app.$('#modal').hidden, true);
    });

    test('with all 10 spaces full, saving asks which preset to overwrite', () => {
        start({ storage: WELCOMED });
        for (let i = 0; i < 10; i++) app.run('config.CURL = ' + i + '; presetSave()');
        assert.equal(app.run('presetState.user.length'), 10);

        app.run('config.CURL = 25; presetSave()');
        assert.equal(app.run('presetState.user.length'), 10, 'nothing is added or changed before choosing');
        assert.equal(app.$('#modal').hidden, false);
        assert.match(app.$('#modal-text').textContent, /overwrite/);
        const choices = app.$$('.modal-btn').map(b => b.textContent);
        assert.deepEqual(choices, ['My preset', ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => 'My preset ' + n), 'Cancel']);

        app.click(app.$$('.modal-btn').find(b => b.textContent === 'My preset 4'));
        assert.equal(app.$('#modal').hidden, true);
        const saved = JSON.parse(app.run('JSON.stringify(presetState.user.map(p => [p.name, p.values.CURL]))'));
        assert.equal(saved.length, 10);
        assert.deepEqual(saved[3], ['My preset 4', 25], 'the chosen one is overwritten and keeps its name');
        assert.deepEqual(saved.filter((p, i) => i !== 3).map(p => p[1]), [0, 1, 2, 4, 5, 6, 7, 8, 9], 'the rest are untouched');
        assert.equal(app.run('presetState.current'), 'My preset 4');
        assert.deepEqual(app.errors, []);
    });

    test('cancelling the overwrite question changes nothing', () => {
        start({ storage: WELCOMED });
        for (let i = 0; i < 10; i++) app.run('config.CURL = ' + i + '; presetSave()');
        app.run('config.CURL = 25; presetSave()');
        app.click(app.$$('.modal-btn').find(b => b.textContent === 'Cancel'));
        assert.deepEqual(JSON.parse(app.run('JSON.stringify(presetState.user.map(p => p.values.CURL))')), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('duplicating into full spaces also asks which preset to replace', () => {
        start({ storage: WELCOMED });
        for (let i = 0; i < 10; i++) app.run('presetSave()');
        app.run('presetClone()');
        assert.equal(app.run('presetState.user.length'), 10);
        assert.equal(app.$('#modal').hidden, false);
        app.click(app.$$('.modal-btn').find(b => b.textContent === 'My preset 2'));
        const names = JSON.parse(app.run('JSON.stringify(presetState.user.map(p => p.name))'));
        assert.equal(names.length, 10);
        assert.equal(names[1], 'My preset 10 copy');
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
        assert.equal(app.run('config.FPS_LIMIT'), '60 FPS', 'the phone default');
        assert.equal(app.run('config.RENDER_SCALE'), 85, 'the phone default');
        assert.equal(app.run('config.DYE_RESOLUTION'), 512, 'the phone default');
        assert.equal(app.run('deviceSettings.HAPTICS'), true);
    });
});

describe('fluid color over its life', () => {
    test('the three colors and the time appear only while the feature is on', async () => {
        start({ storage: WELCOMED });
        openTab('Color', 'Palette');
        assert.ok(visibleRows().includes('Change color with age'));
        assert.ok(!visibleRows().includes('Starting color'));
        app.click(row('Change color with age'));
        await app.settle();
        ['Starting color', 'Middle color', 'Final color', 'Time to change'].forEach(label =>
            assert.ok(visibleRows().includes(label), label));
        app.frames(3);
        assert.deepEqual(app.errors, []);
    });

    test('a chosen color sets the hue; brightness comes from the fluid', () => {
        start({ storage: WELCOMED });
        const tint = c => JSON.parse(app.run('JSON.stringify(ageColorTint(' + JSON.stringify(c) + '))'));
        assert.deepEqual(tint({ r: 255, g: 0, b: 0 }), { r: 1, g: 0, b: 0 });
        assert.deepEqual(tint({ r: 100, g: 50, b: 0 }), { r: 1, g: 0.5, b: 0 }, 'a dark shade is as bright as a light one');
        assert.deepEqual(tint({ r: 0, g: 0, b: 0 }), { r: 1, g: 1, b: 1 }, 'black would erase the fluid, so it counts as white');
    });

    test('the time slider runs from 1 second to 30', () => {
        start({ storage: WELCOMED });
        const seconds = pct => app.run('config.AGE_COLOR_TIME = ' + pct + '; ageColorSeconds()');
        assert.equal(seconds(0), 1);
        assert.equal(seconds(100), 30);
        assert.ok(seconds(50) > 1 && seconds(50) < 30);
    });

    test('new fluid starts in the starting color', () => {
        start({ storage: WELCOMED });
        app.run('config.AGE_COLORS = true; config.AGE_COLOR_START = { r: 0, g: 0, b: 255 }');
        const c = JSON.parse(app.run('JSON.stringify(generateColor())'));
        assert.equal(c.r, 0);
        assert.equal(c.g, 0);
        assert.ok(c.b > 0);
    });

    test('the colors are saved with a preset', () => {
        start({ storage: WELCOMED });
        app.run('config.AGE_COLORS = true; config.AGE_COLOR_END = { r: 1, g: 2, b: 3 }; config.AGE_COLOR_TIME = 80; presetSave()');
        const saved = JSON.parse(app.run('JSON.stringify(presetState.user[0].values)'));
        assert.equal(saved.AGE_COLORS, true);
        assert.deepEqual(saved.AGE_COLOR_END, { r: 1, g: 2, b: 3 });
        assert.equal(saved.AGE_COLOR_TIME, 80);
    });
});

describe('particles', () => {
    test('start out waiting for fluid instead of scattered over the screen', () => {
        start({ storage: WELCOMED });
        const ages = JSON.parse(app.run('JSON.stringify(Array.from(newParticleState(4, 4)).filter((v, i) => i % 4 === 2))'));
        assert.equal(ages.length, 16);
        assert.ok(ages.every(age => age < 0), 'a negative age means "not born yet"');
        assert.deepEqual(app.errors, []);
    });

    test('each particle carries its own momentum, kept only while particles are on', () => {
        start({ storage: WELCOMED });
        app.run('config.PARTICLES = true');
        app.frames(3);
        assert.equal(app.run('!!particles.momentum'), true);
        assert.equal(app.run('particles.momentum.read.width === particles.state.read.width && particles.momentum.read.height === particles.state.read.height'), true);
        app.run('config.PARTICLES = false');
        app.frames(2);
        assert.equal(app.run('particles.momentum'), null, 'freed with the rest');
        assert.deepEqual(app.errors, []);
    });

    test('the Speed help no longer says particles follow the fluid', () => {
        start({ storage: WELCOMED });
        assert.doesNotMatch(app.run('HELP.PARTICLE_SPEED'), /follow/);
    });

    test('how fast particles slow down and how hard they are pushed outward are settings', async () => {
        start({ storage: WELCOMED });
        // The middle of each slider is the feel the app shipped with
        assert.equal(app.run('particleDrag()'), 1.3);
        assert.equal(app.run('particlePush()'), 0.45);
        app.run('config.PARTICLE_DRAG = 0; config.PARTICLE_PUSH = 0');
        assert.equal(app.run('particleDrag()'), 0, 'at 0% particles never slow down');
        assert.equal(app.run('particlePush()'), 0, 'at 0% nothing pushes them outward');
        app.run('config.PARTICLE_DRAG = 100; config.PARTICLE_PUSH = 100');
        assert.ok(app.run('particleDrag()') > 1.3);
        assert.ok(app.run('particlePush()') > 0.45);

        openTab('Layers', 'Particles');
        app.click(row('Particles'));
        await app.settle();
        assert.ok(visibleRows().includes('Slow down'));
        assert.ok(visibleRows().includes('Outward push'));
        assert.deepEqual(app.errors, []);
    });

    test('the Spread help says particles come from the fluid', () => {
        start({ storage: WELCOMED });
        assert.match(app.run('HELP.PARTICLE_SPREAD'), /fluid/);
    });
});

describe('staying up on any device', () => {
    const loseGraphics = () => app.$('canvas').dispatchEvent(new app.window.Event('webglcontextlost', { cancelable: true }));
    const restoreGraphics = () => app.$('canvas').dispatchEvent(new app.window.Event('webglcontextrestored'));
    // Reloading can't happen inside the test page, so count the requests instead
    const countReloads = () => app.run('var reloads = 0; reloadApp = () => { reloads++; };');
    const resets = (...secondsAgo) => JSON.stringify(secondsAgo.map(s => Date.now() - s * 1000));
    const HEAVY = JSON.stringify({ DYE_RESOLUTION: 2048, EFFECT_QUALITY: 'Ultra', RENDER_SCALE: 100, PARTICLE_LIMIT: 'Maximum', ADAPTIVE_QUALITY: false });

    test('a new phone starts in Balanced mode rather than flat out', () => {
        start({ storage: WELCOMED });
        assert.equal(app.run('config.PERFORMANCE_MODE'), 'Balanced');
        assert.equal(app.run('config.FPS_LIMIT'), '60 FPS');
        assert.equal(app.run('config.RENDER_SCALE'), 85);
        assert.equal(app.run('config.ADAPTIVE_QUALITY'), true);
    });

    test('one graphics reset keeps the look and the device settings, and reloads', () => {
        start({ storage: { ...WELCOMED, 'rippl.device': HEAVY } });
        countReloads();
        app.run('config.CURL = 42');
        loseGraphics();
        restoreGraphics();
        assert.equal(app.run('reloads'), 1);
        assert.equal(JSON.parse(app.window.localStorage.getItem('fluidfix.recover')).CURL, 42);
        const stored = { ...WELCOMED, 'rippl.device': HEAVY, 'rippl.gfxResets': app.window.localStorage.getItem('rippl.gfxResets') };
        app.close();

        start({ storage: stored });
        assert.equal(app.run('config.DYE_RESOLUTION'), 2048, 'a single reset is not blamed on the settings');
        assert.equal(app.run('config.EFFECT_QUALITY'), 'Ultra');
    });

    test('a second reset within two minutes restarts on safe settings and says so', () => {
        start({ storage: { ...WELCOMED, 'rippl.device': HEAVY, 'rippl.gfxResets': resets(40, 5) } });
        assert.equal(app.run('config.DYE_RESOLUTION'), 512);
        assert.equal(app.run('config.EFFECT_QUALITY'), 'Low');
        assert.equal(app.run('config.RENDER_SCALE'), 70);
        assert.equal(app.run('config.PARTICLE_LIMIT'), 'Medium');
        assert.equal(app.run('config.ADAPTIVE_QUALITY'), true);
        assert.match(app.$('#toast').textContent, /kept resetting.*quality lowered/i);
        assert.equal(JSON.parse(app.window.localStorage.getItem('rippl.device')).DYE_RESOLUTION, 512, 'the safe settings are saved');
        assert.deepEqual(app.errors, []);
    });

    test('resets from long ago are not counted', () => {
        start({ storage: { ...WELCOMED, 'rippl.device': HEAVY, 'rippl.gfxResets': resets(4000, 600) } });
        assert.equal(app.run('config.DYE_RESOLUTION'), 2048);
    });

    test('after four resets in two minutes the app stops reloading and explains', () => {
        start({ storage: { ...WELCOMED, 'rippl.gfxResets': resets(60, 40, 20) } });
        countReloads();
        loseGraphics();
        restoreGraphics();
        assert.equal(app.run('reloads'), 0, 'no reload loop');
        assert.match(app.$('.rs-fatal').textContent, /graphics keep resetting/i);
        assert.deepEqual(app.errors, []);
    });

    test('color sharpness is held to what the device’s memory can carry', () => {
        start({ storage: { ...WELCOMED, 'rippl.device': HEAVY }, deviceMemory: 2 });
        app.frames(2);
        assert.equal(app.run('config.DYE_RESOLUTION'), 2048, 'the choice itself is kept');
        assert.equal(app.run('perf.appliedDye'), 1024);
        assert.match(app.$('#toast').textContent, /Color sharpness limited to High on this device/);
        app.close();

        start({ storage: { ...WELCOMED, 'rippl.device': HEAVY }, deviceMemory: 8 });
        app.frames(2);
        assert.equal(app.run('perf.appliedDye'), 2048);
        app.close();

        start({ storage: { ...WELCOMED, 'rippl.device': HEAVY } });   // a phone that reports nothing
        app.frames(2);
        assert.equal(app.run('perf.appliedDye'), 1536);
    });

    test('a GPU that can’t draw into floating-point textures gets a message, not a blank screen', () => {
        start({ storage: WELCOMED, gl: { incompleteFramebuffers: true } });
        assert.match(app.$('.rs-fatal').textContent, /graphics can’t draw into the floating-point textures/);
        assert.equal(app.errors.length, 1, 'the app stops there');
    });

    test('a GPU that can’t build the simulation’s shaders gets a message, not a blank screen', () => {
        start({ storage: WELCOMED, gl: { linkFails: true } });
        assert.match(app.$('.rs-fatal').textContent, /graphics couldn’t prepare the simulation/);
        assert.equal(app.errors.length, 1, 'the app stops there');
    });

    test('slow frames don’t pile extra solver passes on a struggling device', () => {
        start({ storage: WELCOMED });
        app.run('config.FPS_LIMIT = "Unlimited"; config.BATTERY_SAVER = false;');
        const substeps = (frameMs, simDt) => app.run(`perf.emaInterval = ${frameMs}; simSubsteps(${simDt})`);
        assert.equal(substeps(16, 0.016), 1);
        assert.equal(substeps(16, 0.2), 6, 'a fast device takes as many passes as accuracy asks for');
        assert.equal(substeps(60, 0.2), 2, 'a struggling one takes at most two');
        app.run('config.FPS_LIMIT = "15 FPS"');
        assert.equal(substeps(66, 0.2), 6, 'a frame rate limit is not struggling');
    });

    test('the frame rate limit holds its average on a faster screen', () => {
        start({ storage: WELCOMED });
        app.run('config.FPS_LIMIT = "30 FPS"; config.BATTERY_SAVER = false; perf.lastFrameAt = 0;');
        // One second of a 120 Hz screen
        const drawn = app.run('(() => { let n = 0; for (let i = 1; i <= 120; i++) if (frameAllowed(i * 1000 / 120)) n++; return n; })()');
        assert.ok(drawn >= 29 && drawn <= 31, 'drew ' + drawn + ' frames');
    });

    test('screen filter buffers are freed when the last filter is switched off', () => {
        start({ storage: WELCOMED });
        app.frames(2);
        assert.equal(app.run('frameFBO'), null, 'nothing is held while no filter is on');
        app.run('config.INVERT = true');
        app.frames(2);
        assert.notEqual(app.run('frameFBO'), null);
        app.run('config.INVERT = false');
        app.frames(2);
        assert.equal(app.run('frameFBO'), null);
        assert.equal(app.run('historyFBO'), null);
        assert.deepEqual(app.errors, []);
    });

    test('adaptive quality waits longer to raise again after a raise that didn’t hold', () => {
        start({ storage: WELCOMED });
        const feed = (frameMs, seconds) => app.run(`perf.emaInterval = ${frameMs}; updateAdaptive(${seconds}); perf.adaptLevel`);
        assert.equal(feed(40, 1.6), 1, 'slow frames lower the quality');
        assert.equal(feed(16, 5.1), 0, 'five smooth seconds raise it again');
        assert.equal(feed(40, 1.6), 1, 'which did not hold');
        assert.equal(feed(16, 5.1), 1, 'so five smooth seconds are no longer enough');
        assert.equal(feed(16, 15), 0, 'twenty are');
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
