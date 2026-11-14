package io.github.tsv30.ripplstudio;

import android.annotation.SuppressLint;
import android.app.Presentation;
import android.graphics.Color;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.net.Uri;
import android.service.wallpaper.WallpaperService;
import android.util.Log;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;

/**
 * RIPPL Studio as an Android live wallpaper.
 *
 * The wallpaper is the app's own web page in wallpaper mode (index.html?wallpaper=1: no
 * controls, one fixed look). A WebView can't draw straight onto a wallpaper surface, so the
 * surface is wrapped in a private virtual display and the WebView is shown on that display.
 *
 * The page is served from the app's bundled files under https://localhost, the same address the
 * app itself uses, so it can read the look the app saved for it. It loads nothing from the network.
 */
public class RipplWallpaperService extends WallpaperService {

    private static final String TAG = "RipplWallpaper";
    private static final String HOST = "localhost";
    private static final String PAGE = "https://" + HOST + "/public/index.html?wallpaper=1";

    @Override
    public Engine onCreateEngine() {
        return new RipplEngine();
    }

    private class RipplEngine extends Engine {

        private VirtualDisplay display;
        private Presentation presentation;
        private WebView web;
        private int width;
        private int height;
        private boolean pageReady;

        @Override
        public void onCreate(SurfaceHolder holder) {
            super.onCreate(holder);
            // Touches on the home screen stir the fluid
            setTouchEventsEnabled(true);
        }

        @Override
        public void onSurfaceChanged(SurfaceHolder holder, int format, int newWidth, int newHeight) {
            super.onSurfaceChanged(holder, format, newWidth, newHeight);
            if (web != null && newWidth == width && newHeight == height) {
                return;
            }
            // A presentation closes itself when its display changes size, so start again
            stop();
            start(holder, newWidth, newHeight);
        }

        @Override
        public void onVisibilityChanged(boolean visible) {
            super.onVisibilityChanged(visible);
            if (web == null) {
                return;
            }
            if (visible) {
                web.onResume();
            }
            tellPage(visible);
            if (!visible) {
                web.onPause();
            }
        }

        @Override
        public void onTouchEvent(MotionEvent event) {
            super.onTouchEvent(event);
            if (web != null) {
                web.dispatchTouchEvent(event);
            }
        }

        @Override
        public void onSurfaceDestroyed(SurfaceHolder holder) {
            stop();
            super.onSurfaceDestroyed(holder);
        }

        @Override
        public void onDestroy() {
            stop();
            super.onDestroy();
        }

        @SuppressLint("SetJavaScriptEnabled")
        private void start(SurfaceHolder holder, int newWidth, int newHeight) {
            if (newWidth <= 0 || newHeight <= 0) {
                return;
            }
            try {
                DisplayManager manager = (DisplayManager) getSystemService(DISPLAY_SERVICE);
                int dpi = getResources().getDisplayMetrics().densityDpi;
                display = manager.createVirtualDisplay("RIPPL Studio wallpaper", newWidth, newHeight, dpi,
                        holder.getSurface(), DisplayManager.VIRTUAL_DISPLAY_FLAG_OWN_CONTENT_ONLY);
                presentation = new Presentation(RipplWallpaperService.this, display.getDisplay());

                web = new WebView(presentation.getContext());
                web.setBackgroundColor(Color.BLACK);
                WebSettings settings = web.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setAllowFileAccess(false);
                settings.setAllowContentAccess(false);
                web.setWebViewClient(new BundledPages());

                presentation.setContentView(web);
                presentation.show();
                width = newWidth;
                height = newHeight;
                web.loadUrl(PAGE);
            } catch (RuntimeException e) {
                // Leaves a blank wallpaper rather than taking the home screen down with it
                Log.e(TAG, "The wallpaper could not start", e);
                stop();
            }
        }

        private void stop() {
            pageReady = false;
            width = 0;
            height = 0;
            if (presentation != null) {
                try {
                    presentation.dismiss();
                } catch (RuntimeException e) {
                    Log.w(TAG, "The wallpaper window was already gone", e);
                }
                presentation = null;
            }
            if (web != null) {
                web.destroy();
                web = null;
            }
            if (display != null) {
                display.release();
                display = null;
            }
        }

        /** Lets the page stop drawing while the wallpaper is covered, and pick up a new look when shown. */
        private void tellPage(boolean visible) {
            if (web != null && pageReady) {
                web.evaluateJavascript(
                        "window.RipplWallpaper && window.RipplWallpaper.setVisible(" + visible + ")", null);
            }
        }

        /** Serves the app's bundled files and refuses everything else. */
        private class BundledPages extends WebViewClient {

            private final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                    .setDomain(HOST)
                    .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(RipplWallpaperService.this))
                    .build();

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("https".equals(url.getScheme()) && HOST.equals(url.getHost())) {
                    return assets.shouldInterceptRequest(url);
                }
                return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // The wallpaper never navigates anywhere
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                tellPage(isVisible());
            }
        }
    }
}
