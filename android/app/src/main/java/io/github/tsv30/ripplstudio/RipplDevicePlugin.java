package io.github.tsv30.ripplstudio;

import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.Window;
import android.view.WindowManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Small device features the web layer can't reach by itself: saving an image straight to the
 * gallery and keeping the screen on. Called from native.js as "RipplDevice".
 */
@CapacitorPlugin(name = "RipplDevice")
public class RipplDevicePlugin extends Plugin {

    /**
     * Saves a base64 PNG into Pictures/RIPPL Studio. Uses MediaStore, which needs no storage
     * permission on Android 10 and newer. Older versions reject, and the web layer falls back
     * to the share sheet.
     */
    @PluginMethod
    public void saveImage(PluginCall call) {
        String data = call.getString("data");
        String name = call.getString("name", "rippl.png");
        if (data == null || data.isEmpty()) {
            call.reject("No image data was provided");
            return;
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.unavailable("Saving to the gallery needs Android 10 or newer");
            return;
        }

        ContentResolver resolver = getContext().getContentResolver();
        Uri uri = null;
        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);

            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, name);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/RIPPL Studio");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);

            uri = resolver.insert(MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), values);
            if (uri == null) {
                throw new IOException("The gallery did not accept a new image");
            }
            try (OutputStream out = resolver.openOutputStream(uri)) {
                if (out == null) {
                    throw new IOException("The new image could not be opened for writing");
                }
                out.write(bytes);
            }

            ContentValues done = new ContentValues();
            done.put(MediaStore.Images.Media.IS_PENDING, 0);
            resolver.update(uri, done, null, null);

            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            call.resolve(result);
        } catch (Exception e) {
            // Don't leave a half-written image behind
            if (uri != null) {
                try {
                    resolver.delete(uri, null, null);
                } catch (Exception ignored) {
                    // Nothing more can be done; the original error is what matters
                }
            }
            call.reject("The image could not be saved", e);
        }
    }

    @PluginMethod
    public void setKeepAwake(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            if (on) {
                window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
                window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
            call.resolve();
        });
    }

    /**
     * Opens Android's screen for setting RIPPL Studio as the live wallpaper, where the user
     * previews it and confirms. Falls back to the list of all live wallpapers on devices
     * that don't offer the direct screen.
     */
    @PluginMethod
    public void setLiveWallpaper(PluginCall call) {
        Intent direct = new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);
        direct.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                new ComponentName(getContext(), RipplWallpaperService.class));
        try {
            getActivity().startActivity(direct);
            call.resolve();
            return;
        } catch (RuntimeException e) {
            // No such screen on this device; try the general list next
        }
        try {
            getActivity().startActivity(new Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER));
            call.resolve();
        } catch (RuntimeException e) {
            call.unavailable("This device has no live wallpaper screen");
        }
    }
}
