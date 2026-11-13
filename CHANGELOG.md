# Changelog

## 1.0.0

The first release as an app.

### Features
- Android app (Capacitor shell around the WebGL engine), built and signed in GitHub Actions.
- New touch interface: a dock for the everyday actions and a bottom sheet with tabs for every
  setting, replacing the dat.GUI panel. On wide screens the sheet becomes a side panel.
- The sheet turns see-through while a slider moves, so the fluid stays visible.
- Preset gallery with a picture of each look; rename, duplicate, share, import and delete.
- Capture saves straight to the gallery in the app (Pictures/RIPPL Studio), at up to 1440p, and
  can be shared through the system share sheet.
- Haptic feedback, keep-screen-on, and a hide-the-controls mode that also hides the system bars.
- Device settings (performance, quality, image size) are now remembered between sessions.
- The web version installs to the home screen and works offline.
- Welcome screen on first launch, About and Privacy screens, new original app icon.

### Changes
- Controls that only matter when a feature is on (for example bloom intensity) are hidden until it is.
- The Android Back button closes the top-most thing first: dialog, hidden controls, then the sheet.
- Stricter content security policy (no inline styles); dat.GUI removed.

### Kept
- Every simulation setting, the keyboard shortcuts, and presets saved by earlier versions.
