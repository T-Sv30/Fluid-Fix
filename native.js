// Platform bridge. Inside the Android app it talks to native plugins through Capacitor's
// injected bridge; in a browser it falls back to web APIs. Nothing here needs a bundler.

'use strict';

(function () {
    const cap = window.Capacitor;
    const isNative = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform() &&
                        typeof cap.nativePromise === 'function');

    function call (plugin, method, options) {
        if (!isNative) return Promise.reject(new Error('Not running in the app'));
        return cap.nativePromise(plugin, method, options || {});
    }

    // ---------- Haptics ----------

    let hapticsEnabled = true;
    const HAPTIC_STYLES = { light: 'LIGHT', medium: 'MEDIUM', heavy: 'HEAVY' };
    const HAPTIC_MS = { light: 8, medium: 16, heavy: 28 };

    function haptic (kind) {
        if (!hapticsEnabled) return;
        kind = HAPTIC_STYLES[kind] ? kind : 'light';
        if (isNative) {
            call('Haptics', 'impact', { style: HAPTIC_STYLES[kind] }).catch(() => {});
        } else if (navigator.vibrate) {
            try { navigator.vibrate(HAPTIC_MS[kind]); } catch (e) { /* not allowed here */ }
        }
    }

    // ---------- Files ----------

    function blobToBase64 (blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
            reader.onerror = () => reject(reader.error || new Error('Could not read the file'));
            reader.readAsDataURL(blob);
        });
    }

    function download (blob, filename) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        // Give the browser time to start the download before releasing the file
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }

    function writeCacheFile (blob, filename) {
        return blobToBase64(blob)
            .then(data => call('Filesystem', 'writeFile', { path: filename, data, directory: 'CACHE' }))
            .then(result => result.uri);
    }

    function isCancel (error) {
        return !!error && (error.name === 'AbortError' || /cancel/i.test(String(error.message || error)));
    }

    // Saves a PNG. Resolves with 'saved' (in the gallery), 'shared' (share sheet shown),
    // 'downloaded' (browser download) or 'cancelled'.
    function saveImage (blob, filename) {
        if (!isNative) {
            download(blob, filename);
            return Promise.resolve('downloaded');
        }
        return blobToBase64(blob)
            .then(data => call('RipplDevice', 'saveImage', { data, name: filename }))
            .then(() => 'saved')
            .catch(() => shareFile(blob, filename, 'RIPPL Studio'));   // older Android: hand it to the share sheet
    }

    function shareFile (blob, filename, title) {
        if (isNative) {
            return writeCacheFile(blob, filename)
                .then(uri => call('Share', 'share', { title, files: [uri], dialogTitle: title }))
                .then(() => 'shared', error => {
                    if (isCancel(error)) return 'cancelled';
                    throw error;
                });
        }
        let file = null;
        try { file = new File([blob], filename, { type: blob.type }); } catch (e) { /* no File constructor */ }
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            return navigator.share({ title, files: [file] }).then(() => 'shared', error => {
                if (isCancel(error)) return 'cancelled';
                download(blob, filename);
                return 'downloaded';
            });
        }
        download(blob, filename);
        return Promise.resolve('downloaded');
    }

    function canShare () {
        return isNative || typeof navigator.share === 'function';
    }

    // ---------- Back button ----------

    // handler() returns true when it used the press (for example to close a panel)
    function onBack (handler) {
        if (!isNative) return;
        const listener = () => {
            let used = false;
            try { used = handler(); } catch (e) { console.error(e); }
            if (!used) call('App', 'minimizeApp').catch(() => {});
        };
        try {
            if (typeof cap.addListener === 'function') cap.addListener('App', 'backButton', listener);
            else cap.nativeCallback('App', 'addListener', { eventName: 'backButton' }, listener);
        } catch (e) {
            console.error(e);
        }
    }

    // ---------- Screen ----------

    let wakeLock = null;
    let wantAwake = false;

    function requestWakeLock () {
        if (!wantAwake || wakeLock || !navigator.wakeLock || document.visibilityState !== 'visible') return;
        navigator.wakeLock.request('screen').then(lock => {
            wakeLock = lock;
            lock.addEventListener('release', () => { wakeLock = null; });
            if (!wantAwake) lock.release().catch(() => {});
        }).catch(() => {});
    }

    // Resolves true when the screen will be kept on (or released), false when the device can't do it
    function keepAwake (on) {
        wantAwake = !!on;
        if (isNative) return call('RipplDevice', 'setKeepAwake', { on: wantAwake }).then(() => true, () => false);
        if (!navigator.wakeLock) return Promise.resolve(!wantAwake);
        if (wantAwake) requestWakeLock();
        else if (wakeLock) wakeLock.release().catch(() => {});
        return Promise.resolve(true);
    }

    document.addEventListener('visibilitychange', requestWakeLock);

    // Hides the status and navigation bars while the interface is hidden
    function setImmersive (on) {
        if (!isNative) return;
        call('SystemBars', on ? 'hide' : 'show', {}).catch(() => {});
    }

    // ---------- Live wallpaper ----------

    // Opens Android's screen for setting RIPPL Studio as the live wallpaper
    function setLiveWallpaper () {
        return call('RipplDevice', 'setLiveWallpaper');
    }

    // ---------- Offline support in browsers ----------

    // The wallpaper page is shown inside other apps, which don't need it kept for offline use
    const isWallpaper = /[?&]wallpaper=1(&|$)/.test(location.search);

    if (!isNative && !isWallpaper && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support is optional */ });
        });
    }

    window.RipplNative = {
        isNative,
        haptic,
        setHaptics (on) { hapticsEnabled = !!on; },
        saveImage,
        shareFile,
        canShare,
        onBack,
        keepAwake,
        setImmersive,
        setLiveWallpaper,
    };
})();
