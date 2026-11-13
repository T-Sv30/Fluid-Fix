// RIPPL Studio interface: a dock, a bottom sheet with tabs, and touch-sized controls.
// The engine (script.js) describes its settings as plain data and this file draws them.
// It knows nothing about the simulation; every control talks through get() and set().

'use strict';

(function () {
    const ICONS = {
        logo:      'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5',
        sparkle:   'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
        pause:     'M8 5v14 M16 5v14',
        play:      'M7 4.5l12 7.5-12 7.5z',
        clear:     'M4 15l8.5-8.5 6 6L13 18H7z M10 9l6 6 M13 21h7',
        drop:      'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z',
        palette:   'M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.9 1.4-1.9-.3-1 .3-2.1 1.4-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z M7.5 11h.01 M10.5 7h.01 M15.5 7.5h.01',
        wave:      'M3 12c2.5-5 5.5-5 8 0s5.5 5 8 0 M3 17c2.5-3 5.5-3 8 0s5.5 3 8 0 M3 7c2.5-3 5.5-3 8 0s5.5 3 8 0',
        vortex:    'M12 12a1.5 1.5 0 1 1 1.5 1.5 M13.5 13.5A4 4 0 1 1 16 9 M16 9a7 7 0 1 1-9.5 9',
        particles: 'M5 7h.01 M12 4.5h.01 M19 8h.01 M8 13h.01 M15 12h.01 M19 17h.01 M11 19h.01 M4 18h.01',
        undo:      'M9 14L4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
        redo:      'M15 14l5-5-5-5 M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
        camera:    'M4 8h3l2-3h6l2 3h3v11H4z M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
        expand:    'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5',
        presets:   'M6 4h12v17l-6-4-6 4z',
        scene:     'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M3 12c0-3 4-5.5 9-5.5s9 2.5 9 5.5-4 5.5-9 5.5S3 15 3 12z M12 3v2 M12 19v2',
        touch:     'M9 11V5a1.5 1.5 0 0 1 3 0v6 M12 10V8.5a1.5 1.5 0 0 1 3 0V11 M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.8-2.4L4 15a1.5 1.5 0 0 1 2.3-1.9L9 15',
        look:      'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
        physics:   'M3 10c2.5-4 5.5-4 8 0s5.5 4 8 0 M3 16c2.5-4 5.5-4 8 0s5.5 4 8 0',
        text:      'M5 6V4h14v2 M12 4v16 M9 20h6',
        system:    'M4 7h10 M18 7h2 M4 17h4 M12 17h8 M14 5v4 M8 15v4',
        controls:  'M4 6h9 M17 6h3 M4 12h3 M11 12h9 M4 18h11 M19 18h1 M15 4v4 M9 10v4 M17 16v4',
        close:     'M6 6l12 12 M18 6L6 18',
        hide:      'M3 3l18 18 M10.6 6.2A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7 M6.5 7.6A17 17 0 0 0 2 12s4 6 10 6a9.6 9.6 0 0 0 4-.9 M9.9 9.9a3 3 0 0 0 4.2 4.2',
        up:        'M6 15l6-6 6 6',
        save:      'M5 4h11l3 3v13H5z M8 4v5h7 M8 20v-6h8v6',
        copy:      'M9 9h11v11H9z M5 15H4V4h11v1',
        edit:      'M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4',
        share:     'M12 15V3 M8 7l4-4 4 4 M5 12v8h14v-8',
        open:      'M4 7V5h6l2 2h8v12H4z',
        trash:     'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5 M14 11v5',
        plus:      'M12 5v14 M5 12h14',
        reset:     'M4 12a8 8 0 1 0 2.6-5.9 M4 4v5h5',
        phone:     'M7 3h10v18H7z M11 18h2',
    };

    const SVG_NS = 'http://www.w3.org/2000/svg';
    let idCounter = 0;

    function icon (name) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('class', 'rs-icon');
        svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', ICONS[name] || ICONS.drop);
        svg.appendChild(path);
        return svg;
    }

    // Small element builder: h('button', { class: 'x', onclick: fn }, child, 'text')
    function h (tag, props) {
        const el = document.createElement(tag);
        if (props) {
            Object.keys(props).forEach(k => {
                const v = props[k];
                if (v == null || v === false) return;
                if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
                else el.setAttribute(k, v === true ? '' : String(v));
            });
        }
        for (let i = 2; i < arguments.length; i++) {
            const child = arguments[i];
            if (child == null || child === false) continue;
            el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        }
        return el;
    }

    function value (x) {
        return typeof x === 'function' ? x() : x;
    }

    function haptic (kind) {
        if (window.RipplNative) window.RipplNative.haptic(kind);
    }

    function store (key, val) {
        try {
            if (val === undefined) return window.localStorage.getItem(key);
            window.localStorage.setItem(key, val);
        } catch (e) { /* private window: nothing is remembered */ }
        return null;
    }

    const ui = {
        opts: null,
        root: null,
        dock: null,
        dockButtons: [],
        sheet: null,
        body: null,
        status: null,
        tabButtons: {},
        subtabs: null,
        tab: null,
        section: {},        // tab id → section id shown
        panels: {},         // "tab/section" → { el, bindings }
        open: false,
        hidden: false,
        expanded: false,
        historyPushed: false,
        activeRow: null,
        peekTimer: 0,
        refreshQueued: false,
        welcome: null,
        shown: {},
    };

    // ---------- Controls ----------

    function changed (control) {
        if (ui.opts.onChange) ui.opts.onChange(control);
        queueRefresh();
    }

    function queueRefresh () {
        if (ui.refreshQueued) return;
        ui.refreshQueued = true;
        Promise.resolve().then(() => {
            ui.refreshQueued = false;
            refresh();
        });
    }

    function peekStart (row) {
        ui.activeRow = row;
        clearTimeout(ui.peekTimer);
        // A short delay so a plain tap on the track doesn't flash the panel
        ui.peekTimer = setTimeout(() => {
            if (ui.activeRow !== row) return;
            row.classList.add('active');
            ui.sheet.classList.add('peek');
        }, 110);
    }

    function peekEnd () {
        clearTimeout(ui.peekTimer);
        if (ui.activeRow) ui.activeRow.classList.remove('active');
        ui.activeRow = null;
        ui.sheet.classList.remove('peek');
    }

    function buildToggle (c) {
        const id = 'rs-l' + (++idCounter);
        const sw = h('button', { class: 'rs-switch', type: 'button', role: 'switch', 'aria-checked': 'false', 'aria-labelledby': id });
        const row = h('div', { class: 'rs-row' }, h('span', { class: 'rs-label', id }, c.label), sw);
        row.addEventListener('click', () => {
            c.set(!c.get());
            haptic('light');
            changed(c);
        });
        return { el: row, update: () => sw.setAttribute('aria-checked', c.get() ? 'true' : 'false') };
    }

    function buildSlider (c) {
        const id = 'rs-l' + (++idCounter);
        const min = c.min == null ? 0 : c.min;
        const max = c.max == null ? 100 : c.max;
        const format = c.format || (v => v + '%');
        const readout = h('span', { class: 'rs-value', 'aria-hidden': 'true' });
        const input = h('input', { class: 'rs-range', type: 'range', min, max, step: c.step || 1, 'aria-labelledby': id });
        const row = h('div', { class: 'rs-row stack' },
            h('div', { class: 'rs-line' }, h('span', { class: 'rs-label', id }, c.label), readout),
            input);

        function paint (v) {
            readout.textContent = format(v);
            input.setAttribute('aria-valuetext', format(v));
            input.style.setProperty('--p', (max > min ? (v - min) / (max - min) * 100 : 0) + '%');
        }

        input.addEventListener('input', () => {
            const v = Number(input.value);
            c.set(v);
            paint(v);
            changed(c);
        });
        input.addEventListener('pointerdown', () => peekStart(row));
        ['pointerup', 'pointercancel', 'blur'].forEach(type => input.addEventListener(type, peekEnd));

        return {
            el: row,
            update: () => {
                if (ui.activeRow === row) return;   // never fight the finger
                const v = Math.min(max, Math.max(min, Number(c.get()) || 0));
                input.value = String(v);
                paint(v);
            },
        };
    }

    function normalizeOptions (options) {
        const list = value(options);
        if (Array.isArray(list)) return list.map(o => (o && typeof o === 'object') ? o : { label: String(o), value: o });
        return Object.keys(list).map(k => ({ label: k, value: list[k] }));
    }

    function buildSelect (c) {
        const id = 'rs-l' + (++idCounter);
        const options = normalizeOptions(c.options);
        const pick = option => {
            c.set(option.value);
            haptic('light');
            changed(c);
        };

        if (c.swatch || c.chips || options.length <= 4) {
            const buttons = options.map(o => {
                const b = c.swatch
                    ? h('button', { class: 'rs-swatch', type: 'button', 'aria-pressed': 'false' }, h('span', { class: 'rs-swatch-dot' }), o.label)
                    : h('button', { class: 'rs-chip', type: 'button', 'aria-pressed': 'false' }, o.label);
                if (c.swatch) b.firstChild.style.background = c.swatch(o.value);
                b.addEventListener('click', () => pick(o));
                return b;
            });
            const group = h('div', { class: c.swatch ? 'rs-swatches' : 'rs-chips', role: 'group', 'aria-labelledby': id });
            buttons.forEach(b => group.appendChild(b));
            const row = h('div', { class: 'rs-row stack' }, h('span', { class: 'rs-label', id }, c.label), group);
            return {
                el: row,
                update: () => {
                    const current = c.get();
                    buttons.forEach((b, i) => b.setAttribute('aria-pressed', options[i].value === current ? 'true' : 'false'));
                },
            };
        }

        const select = h('select', { class: 'rs-select', 'aria-labelledby': id });
        options.forEach((o, i) => select.appendChild(h('option', { value: i }, o.label)));
        select.addEventListener('change', () => pick(options[Number(select.value)]));
        const row = h('div', { class: 'rs-row' }, h('span', { class: 'rs-label', id }, c.label), select);
        return {
            el: row,
            update: () => {
                const current = c.get();
                const i = options.findIndex(o => o.value === current);
                if (i !== -1) select.value = String(i);
            },
        };
    }

    function toHex (rgb) {
        const part = n => ('0' + Math.round(Math.min(255, Math.max(0, n || 0))).toString(16)).slice(-2);
        return '#' + part(rgb.r) + part(rgb.g) + part(rgb.b);
    }

    function fromHex (hex) {
        const n = parseInt(String(hex).slice(1), 16) || 0;
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function buildColor (c) {
        const id = 'rs-l' + (++idCounter);
        const input = h('input', { class: 'rs-color', type: 'color', 'aria-labelledby': id });
        input.addEventListener('input', () => {
            c.set(fromHex(input.value));
            changed(c);
        });
        const row = h('div', { class: 'rs-row' }, h('span', { class: 'rs-label', id }, c.label), input);
        return { el: row, update: () => { input.value = toHex(c.get() || {}); } };
    }

    function actionButton (c, extraClass) {
        const b = h('button', {
            class: 'rs-btn' + (c.primary ? ' primary' : '') + (c.danger ? ' danger' : '') + (extraClass ? ' ' + extraClass : ''),
            type: 'button',
        }, c.icon ? icon(c.icon) : null, h('span', null, c.label));
        b.addEventListener('click', () => {
            haptic(c.danger ? 'medium' : 'light');
            c.run();
            queueRefresh();
        });
        return b;
    }

    function buildAction (c) {
        const b = actionButton(c);
        return {
            el: h('div', { class: 'rs-row' }, b),
            update: () => { if (c.disabled) b.setAttribute('aria-disabled', c.disabled() ? 'true' : 'false'); },
        };
    }

    function buildQuick (c) {
        const grid = h('div', { class: 'rs-quick', role: 'toolbar', 'aria-label': c.label || 'Quick actions' });
        const items = c.items.map(item => {
            const label = h('span', null, value(item.label));
            const b = h('button', { class: 'rs-quick-btn', type: 'button', 'aria-label': item.title || value(item.label) }, icon(value(item.icon)), label);
            if (item.on) b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', () => {
                haptic('light');
                item.run();
                queueRefresh();
            });
            grid.appendChild(b);
            return { item, b };
        });
        return {
            el: grid,
            update: () => items.forEach(({ item, b }) => {
                if (item.on) b.setAttribute('aria-pressed', item.on() ? 'true' : 'false');
            }),
        };
    }

    const BUILDERS = {
        toggle: buildToggle,
        slider: buildSlider,
        select: buildSelect,
        color: buildColor,
        action: buildAction,
        quick: buildQuick,
        heading: c => ({ el: h('h3', { class: 'rs-heading' }, c.label) }),
        note: c => ({ el: h('p', { class: 'rs-note' }, c.label) }),
    };

    function buildControls (controls) {
        const el = h('div', { class: 'rs-panel', role: 'tabpanel' });
        const bindings = [];
        controls.forEach(c => {
            const build = BUILDERS[c.type];
            if (!build) throw new Error('Unknown control type: ' + c.type);
            const binding = build(c);
            binding.control = c;
            el.appendChild(binding.el);
            bindings.push(binding);
        });
        return { el, bindings };
    }

    // ---------- Presets ----------

    function presetCard (p, name) {
        const art = h('span', { class: 'rs-preset-art' });
        art.style.background = p.preview(name);
        const card = h('button', { class: 'rs-preset', type: 'button', 'aria-pressed': name === p.current() ? 'true' : 'false' },
            art, h('span', { class: 'rs-preset-name' }, name));
        card.addEventListener('click', () => {
            haptic('light');
            p.select(name);
        });
        return card;
    }

    function buildPresets () {
        const el = h('div', { class: 'rs-panel', role: 'tabpanel' });
        const panel = { el, bindings: [], render };

        function render () {
            const p = ui.opts.presets;
            const names = p.names();
            const builtin = names.filter(n => p.isBuiltin(n));
            const mine = names.filter(n => !p.isBuiltin(n));
            const grid = list => {
                const g = h('div', { class: 'rs-presets' });
                list.forEach(n => g.appendChild(presetCard(p, n)));
                return g;
            };
            // Redrawing replaces the cards, so remember which one had keyboard focus
            const focused = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.rs-preset') : null;
            const focusedName = focused && el.contains(focused) ? focused.textContent : null;
            const actions = h('div', { class: 'rs-actions' });
            p.actions.forEach(a => {
                const b = actionButton(a, a.wide ? 'wide' : '');
                if (a.disabled && a.disabled()) b.setAttribute('aria-disabled', 'true');
                actions.appendChild(b);
            });
            el.replaceChildren(
                h('h3', { class: 'rs-heading' }, 'Your looks'),
                mine.length ? grid(mine) : h('p', { class: 'rs-empty' }, 'Nothing saved yet. Shape the fluid the way you like it, then tap “Save this look”.'),
                actions,
                h('h3', { class: 'rs-heading' }, 'Built in'),
                grid(builtin)
            );
            if (focusedName) {
                const again = Array.from(el.querySelectorAll('.rs-preset')).find(c => c.textContent === focusedName);
                if (again) again.focus();
            }
        }

        render();
        return panel;
    }

    // ---------- Sheet, tabs and panels ----------

    function tabById (id) {
        return ui.opts.tabs.find(t => t.id === id);
    }

    function currentPanel () {
        const tab = tabById(ui.tab);
        if (!tab) return null;
        const key = tab.id + '/' + (tab.custom ? '' : ui.section[tab.id]);
        if (!ui.panels[key]) {
            if (tab.custom === 'presets') ui.panels[key] = buildPresets();
            else ui.panels[key] = buildControls(tab.sections.find(s => s.id === ui.section[tab.id]).controls);
        }
        return ui.panels[key];
    }

    function showPanel () {
        const tab = tabById(ui.tab);
        const sections = tab.sections || [];
        ui.subtabs.replaceChildren();
        ui.subtabs.hidden = sections.length < 2;
        if (sections.length > 1) {
            sections.forEach(s => {
                const chip = h('button', { class: 'rs-chip', type: 'button', role: 'tab', 'aria-selected': s.id === ui.section[tab.id] ? 'true' : 'false' }, s.label);
                chip.addEventListener('click', () => {
                    ui.section[tab.id] = s.id;
                    haptic('light');
                    showPanel();
                });
                ui.subtabs.appendChild(chip);
            });
        }
        const panel = currentPanel();
        panel.el.setAttribute('aria-label', tab.label);
        ui.body.replaceChildren(panel.el);
        ui.body.scrollTop = 0;
        refresh();
    }

    function selectTab (id) {
        if (!tabById(id)) return;
        ui.tab = id;
        Object.keys(ui.tabButtons).forEach(k => {
            const selected = k === id;
            ui.tabButtons[k].setAttribute('aria-selected', selected ? 'true' : 'false');
            ui.tabButtons[k].tabIndex = selected ? 0 : -1;
        });
        const b = ui.tabButtons[id];
        if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center' });
        showPanel();
    }

    function isWide () {
        return !!(window.matchMedia && window.matchMedia('(min-width: 900px), (orientation: landscape) and (min-width: 600px)').matches);
    }

    function setExpanded (expanded) {
        ui.expanded = expanded;
        const view = window.innerHeight || 800;
        ui.sheet.style.setProperty('--rs-sheet-h', Math.round(view * (expanded ? 1 : 0.62)) + 'px');
    }

    function pushHistory () {
        if (ui.historyPushed || (window.RipplNative && window.RipplNative.isNative)) return;
        try {
            window.history.pushState({ ripplSheet: true }, '');
            ui.historyPushed = true;
        } catch (e) { /* history is unavailable here; Back just leaves the page */ }
    }

    function dropHistory () {
        if (!ui.historyPushed) return;
        ui.historyPushed = false;
        try { window.history.back(); } catch (e) { /* nothing to undo */ }
    }

    function open (tabId) {
        if (ui.hidden) setHidden(false);
        if (tabId && tabId !== ui.tab) selectTab(tabId);
        if (ui.open) return;
        ui.open = true;
        ui.sheet.classList.add('open');
        document.body.classList.add('sheet-open');
        pushHistory();
        refresh();
    }

    function hideSheet () {
        if (!ui.open) return;
        ui.open = false;
        peekEnd();
        const hadFocus = ui.sheet.contains(document.activeElement);
        ui.sheet.classList.remove('open');
        document.body.classList.remove('sheet-open');
        if (hadFocus && ui.dockMain) ui.dockMain.focus();
    }

    function close () {
        hideSheet();
        dropHistory();
    }

    function setHidden (hidden) {
        hidden = !!hidden;
        if (ui.hidden === hidden) return;
        ui.hidden = hidden;
        document.body.classList.toggle('hide-ui', hidden);
        if (window.RipplNative) window.RipplNative.setImmersive(hidden);
        if (hidden && ui.opts.toast) ui.opts.toast('Controls hidden · tap the arrow to bring them back');
    }

    function dismissWelcome () {
        if (!ui.welcome) return;
        ui.welcome.remove();
        ui.welcome = null;
        store('rippl.welcomed', '1');
    }

    // Android Back / Escape: closes the top-most thing. Returns true when something was closed.
    function handleBack () {
        if (ui.welcome) { dismissWelcome(); return true; }
        if (ui.opts.closeDialog && ui.opts.closeDialog()) return true;
        if (ui.hidden) { setHidden(false); return true; }
        if (ui.open) { close(); return true; }
        return false;
    }

    function refresh () {
        if (!ui.opts || !ui.open) return;
        const panel = currentPanel();
        if (!panel) return;
        panel.bindings.forEach(b => {
            const c = b.control;
            if (c.visible) b.el.hidden = !c.visible();
            if (b.update && !b.el.hidden) b.update();
        });
    }

    function refreshPresets () {
        Object.keys(ui.panels).forEach(k => {
            if (ui.panels[k].render) ui.panels[k].render();
        });
    }

    // Cheap enough to call a few times a second: status line, dock states and the open panel
    function tick () {
        if (!ui.opts) return;
        ui.dockButtons.forEach(d => {
            const on = d.item.on ? !!d.item.on() : false;
            const iconName = value(d.item.icon);
            const label = value(d.item.label);
            if (d.on !== on) {
                d.on = on;
                d.el.classList.toggle('on', on);
                d.el.setAttribute('aria-pressed', on ? 'true' : 'false');
            }
            if (d.icon !== iconName) {
                d.icon = iconName;
                d.el.replaceChild(icon(iconName), d.el.firstChild);
            }
            if (d.label !== label) {
                d.label = label;
                d.el.lastChild.textContent = label;
            }
        });
        if (!ui.open) return;
        const status = ui.opts.status ? ui.opts.status() : '';
        if (ui.shown.status !== status) {
            ui.shown.status = status;
            ui.status.textContent = status;
        }
        refresh();
    }

    // ---------- Construction ----------

    function buildDock () {
        const dock = h('nav', { class: 'rs-dock', 'aria-label': 'Main actions' });
        ui.opts.dock.forEach(item => {
            const b = h('button', { class: 'rs-dock-btn' + (item.main ? ' main' : ''), type: 'button', title: item.title || null },
                icon(value(item.icon)), h('span', null, value(item.label)));
            if (item.on) b.setAttribute('aria-pressed', 'false');
            if (item.main) {
                b.setAttribute('aria-haspopup', 'dialog');
                ui.dockMain = b;
            }
            b.addEventListener('click', () => {
                haptic(item.main ? 'medium' : 'light');
                if (item.main) open(); else item.run();
                tick();
            });
            dock.appendChild(b);
            ui.dockButtons.push({ item, el: b, on: false, icon: value(item.icon), label: value(item.label) });
        });
        return dock;
    }

    function iconButton (name, label, run) {
        const b = h('button', { class: 'rs-icon-btn', type: 'button', 'aria-label': label, title: label }, icon(name));
        b.addEventListener('click', () => {
            haptic('light');
            run();
            queueRefresh();
        });
        return b;
    }

    function buildSheet () {
        const o = ui.opts;
        const grab = h('div', { class: 'rs-grab', 'aria-hidden': 'true' });
        ui.status = h('span', { class: 'rs-status' });
        const head = h('div', { class: 'rs-head' },
            h('div', { class: 'rs-head-title' }, h('span', { class: 'rs-brand' }, o.title || 'RIPPL STUDIO'), ui.status));
        (o.headActions || []).forEach(a => head.appendChild(iconButton(a.icon, a.label, a.run)));
        head.appendChild(iconButton('hide', 'Hide the controls', () => setHidden(true)));
        head.appendChild(iconButton('close', 'Close the controls', close));

        const tabs = h('div', { class: 'rs-tabs', role: 'tablist', 'aria-label': 'Settings' });
        o.tabs.forEach(t => {
            const b = h('button', { class: 'rs-tab', type: 'button', role: 'tab', 'aria-selected': 'false', tabindex: '-1' }, icon(t.icon), h('span', null, t.label));
            b.addEventListener('click', () => {
                haptic('light');
                selectTab(t.id);
            });
            tabs.appendChild(b);
            ui.tabButtons[t.id] = b;
            if (t.sections && t.sections.length) ui.section[t.id] = t.sections[0].id;
        });
        tabs.addEventListener('keydown', e => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const ids = o.tabs.map(t => t.id);
            const next = ids[(ids.indexOf(ui.tab) + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
            selectTab(next);
            ui.tabButtons[next].focus();
            e.preventDefault();
        });

        ui.subtabs = h('div', { class: 'rs-subtabs', role: 'tablist', 'aria-label': 'Section', hidden: true });
        ui.body = h('div', { class: 'rs-body' });
        const sheet = h('section', { class: 'rs-sheet', role: 'dialog', 'aria-label': 'Controls' }, grab, head, tabs, ui.subtabs, ui.body);

        // Drag the handle to resize, or flick it down to close
        let drag = null;
        grab.addEventListener('pointerdown', e => {
            if (isWide()) return;
            drag = { y: e.clientY, h: sheet.getBoundingClientRect().height || 0, moved: false, now: 0 };
            drag.now = drag.h;
            if (grab.setPointerCapture) { try { grab.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ } }
            sheet.classList.add('dragging');
        });
        grab.addEventListener('pointermove', e => {
            if (!drag) return;
            const dy = drag.y - e.clientY;
            if (Math.abs(dy) > 4) drag.moved = true;
            drag.now = Math.max(80, drag.h + dy);
            sheet.style.setProperty('--rs-sheet-h', drag.now + 'px');
        });
        const endDrag = () => {
            if (!drag) return;
            const view = window.innerHeight || 800;
            const d = drag;
            drag = null;
            sheet.classList.remove('dragging');
            if (!d.moved) { setExpanded(!ui.expanded); return; }
            if (d.now < view * 0.32) { close(); setExpanded(false); }
            else setExpanded(d.now > view * 0.75);
        };
        grab.addEventListener('pointerup', endDrag);
        grab.addEventListener('pointercancel', endDrag);

        return sheet;
    }

    function buildWelcome () {
        const tip = (name, text) => h('li', null, icon(name), h('span', null, text));
        const start = h('button', { class: 'rs-btn primary', type: 'button' }, h('span', null, 'Start painting'));
        start.addEventListener('click', () => {
            haptic('medium');
            dismissWelcome();
        });
        const card = h('div', { class: 'rs-welcome-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rs-welcome-title' },
            h('h2', { id: 'rs-welcome-title' }, 'Welcome to RIPPL Studio'),
            h('p', null, 'A pocket of living color. Here’s how it works:'),
            h('ul', { class: 'rs-welcome-list' },
                tip('touch', 'Drag anywhere to stir the fluid. Use several fingers at once.'),
                tip('controls', 'Tap Controls to change colors, physics, particles and more.'),
                tip('presets', 'Save looks you like, and capture images to keep or share.')),
            start);
        const overlay = h('div', { class: 'rs-welcome' }, card);
        setTimeout(() => { if (ui.welcome) start.focus(); }, 50);
        return overlay;
    }

    function init (opts) {
        if (ui.opts) throw new Error('RipplUI.init was already called');
        ui.opts = opts;
        ui.root = h('div', { class: 'rs-ui' });
        ui.dock = buildDock();
        ui.sheet = buildSheet();
        const reveal = h('button', { class: 'rs-reveal', type: 'button', 'aria-label': 'Show the controls' }, icon('up'));
        reveal.addEventListener('click', () => {
            haptic('light');
            setHidden(false);
        });
        ui.root.appendChild(ui.dock);
        ui.root.appendChild(ui.sheet);
        ui.root.appendChild(reveal);
        document.body.appendChild(ui.root);

        setExpanded(false);
        window.addEventListener('resize', () => setExpanded(ui.expanded));
        window.addEventListener('popstate', () => {
            if (!ui.historyPushed) return;
            ui.historyPushed = false;
            hideSheet();
        });
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            if (ui.opts.dialogOpen && ui.opts.dialogOpen()) return;   // the dialog closes itself
            if (handleBack()) e.preventDefault();
        });
        if (window.RipplNative) window.RipplNative.onBack(handleBack);

        selectTab(opts.startTab || opts.tabs[0].id);

        if (opts.welcome !== false && !store('rippl.welcomed')) {
            ui.welcome = buildWelcome();
            ui.root.appendChild(ui.welcome);
        }
    }

    window.RipplUI = {
        init,
        open,
        close,
        toggle () { if (ui.open) close(); else open(); },
        isOpen: () => ui.open,
        isHidden: () => ui.hidden,
        setHidden,
        toggleHidden () { setHidden(!ui.hidden); },
        handleBack,
        refresh,
        refreshPresets,
        tick,
    };
})();
