# RIPPL Studio

Interactive WebGL fluid simulation, shipped as an Android app (Capacitor) and a web app (GitHub Pages) from the same files.

## Layout
- Web app = repo root, no build step, no framework, no bundler. GitHub Pages serves `master` at `/`, so anything merged to `master` is live.
- `script.js`: engine (simulation, shaders, presets). Settings are described as data in `buildTabs()`.
- `ui.js` + `ui.css`: interface, drawn from that data. Knows nothing about the simulation.
- `native.js`: `window.RipplNative`, the only place that talks to Capacitor (through the injected bridge: `Capacitor.nativePromise(plugin, method, options)`), with web fallbacks.
- `android/`: Capacitor shell plus `RipplDevicePlugin.java` (save to gallery, keep screen on).
- `scripts/build.mjs` copies the web files to `dist/` for the Android shell.

## Commands
- `npm run check`: lint + tests + build. Run before every commit.
- `npm start`: local server on :8080.
- `npm run icons`: regenerate all icons (drawn in code by `scripts/make-icons.mjs`).
- Android can't be built on the Termux phone (no JDK/SDK); CI builds the APK on every PR.
- On Termux, run CLIs through node (`node node_modules/@capacitor/cli/bin/capacitor ...`); the `.bin` shims fail there.

## Conventions
- Adding a setting: add it to `config`, then one line in `buildTabs()` with the `ctl.*` helpers. Device-only settings also go in `SNAPSHOT_EXCLUDE` and `DEVICE_CHOICES`/`DEVICE_KEYS`.
- A new file the app loads must be added to `FILES` in `scripts/build.mjs` and `SHELL` in `sw.js`.
- The version lives in `package.json`, `APP_VERSION` (script.js) and the `?v=` stamps (index.html); the build fails if they differ.
- The CSP has no `'unsafe-inline'`: never use inline `style=""` attributes or inline scripts. Setting `el.style.x` from JS is fine.
- Build DOM with the `h()` helper and `textContent`; never put user text (preset names, imported data) through `innerHTML`.
- Storage keys keep the old `fluidfix.` prefix on purpose, so presets from earlier versions survive.
- Touch targets at least 44px; every control needs an accessible name (a test enforces it).

## Avoid
- Don't reintroduce dat.GUI or add a framework/bundler.
- Don't change the app ID `io.github.tsv30.ripplstudio` once the app is on Google Play.
- Don't commit keystores or signing passwords; release signing comes from GitHub secrets (docs/RELEASING.md).
