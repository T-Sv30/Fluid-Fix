# Releasing RIPPL Studio

The app ID is `io.github.tsv30.ripplstudio`. **It can never change once the app is on Google Play**, so if you'd rather use another one (for example a domain you own), change it before the first upload in `capacitor.config.json`, `android/app/build.gradle` (`namespace` and `applicationId`), `android/app/src/main/res/values/strings.xml`, and the Java package folder.

## One-time setup

### 1. Create the upload key

On any machine with a JDK (keep the file and passwords somewhere safe, such as a password manager; never commit them):

```sh
keytool -genkeypair -v -keystore rippl-upload.jks -alias rippl-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Add the signing secrets to GitHub

Repository → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `RIPPL_KEYSTORE_BASE64` | Output of `base64 -w0 rippl-upload.jks` |
| `RIPPL_KEYSTORE_PASSWORD` | The keystore password |
| `RIPPL_KEY_ALIAS` | `rippl-upload` |
| `RIPPL_KEY_PASSWORD` | The key password |

### 3. Google Play Console

1. Create a developer account (one-time US$25) at https://play.google.com/console.
2. Create the app: name "RIPPL Studio", type App, Free.
3. Accept **Play App Signing** (Google holds the real signing key; yours is the upload key).
4. Fill in the listing from [store-listing.md](store-listing.md). The 512px icon is `icons/store-icon-512.png`. You need at least two phone screenshots; take them with Capture, or on the phone itself.
5. Privacy policy URL: `https://t-sv30.github.io/RIPPL-Studio/privacy.html`.
6. Data safety form: "No data collected" and "No data shared". Content rating questionnaire: no objectionable content. Target audience: all ages; contains no ads.

New personal developer accounts must run a **closed test with at least 12 testers for 14 days** before Google allows a production release. Start that test with the first build.

## Test builds

CI signs every debug APK with one shared debug key, kept in the `RIPPL_DEBUG_KEYSTORE_BASE64` secret
(a PKCS12 file, alias `androiddebugkey`, password `android`, as Android expects of a debug key), so a
new test build installs over the previous one and keeps its presets. It is not the release key and
protects nothing. If the secret is ever replaced, uninstall the app once before installing the next build.

## Each release

1. Update `version` in `package.json`, `APP_VERSION` in `script.js`, and the `?v=` stamps in `index.html` (the build fails if they disagree). Add the release to `CHANGELOG.md`.
2. Merge to `master`. The web version is live as soon as GitHub Pages finishes.
3. Tag it: `git tag v1.0.1 && git push origin v1.0.1`.
4. The **Release** workflow builds the signed `.aab` and `.apk` and opens a **draft** GitHub release with both attached.
5. Upload the `.aab` to the Play Console (Testing or Production → Create new release), then publish the GitHub release.

The Android `versionCode` is derived from the version (1.2.3 → 10203), so every release needs a higher version number.

## Before the first production release

Try the debug APK from CI on at least one real phone and check:

- [ ] Launch shows the droplet on black, then the simulation; no white flash
- [ ] Painting with several fingers; nothing sits under the status bar or the gesture bar
- [ ] Every tab opens; a slider turns the sheet see-through while it moves
- [ ] Capture → the image appears in the gallery under "RIPPL Studio"
- [ ] Share image and Share preset open the share sheet; Import reads a `.json` file
- [ ] Back closes the sheet, then minimizes the app
- [ ] Hide the controls → the system bars hide too; the arrow brings everything back
- [ ] Haptics on and off; "Keep the screen on" keeps it on
- [ ] Rotate the phone: the sheet becomes a side panel
- [ ] Close and reopen: the last preset and the device settings are still there

## Rolling back

Web: `git revert` the bad commit on `master`. Play: halt the rollout in the Play Console and upload a fixed build with a higher version; Play cannot go back to a lower `versionCode`.
