# Changelog

## Unreleased

### Changes
- **A new app icon**: a glowing swirl of blue and orange fluid replaces the droplet, on the home
  screen, in the browser and on the store listing.

## 1.0.2

### Changes
- The menu is now almost see-through, so the fluid stays visible behind it; text and controls
  sit on dark plates of their own to stay readable.
- A live theme: a band of light travels around the menu's border, and the same colors flow
  through sliders, switches and selected buttons. It stops when "reduce motion" is set on the device.
- **Change color with age** (Color > Palette): choose up to eight colors and the fluid shifts
  through them as it gets older, over a time you set from 1 to 30 seconds. **Saturation** sets
  how strong the colors are and **Change sharpness** how suddenly each one gives way to the next.
  The colors take the place of the palette while it is on, and are saved with presets.
- Particles now come from the fluid itself: each one is born where there is fluid, more of them
  where it is brighter, and none appear on an empty screen. Before, they appeared at random
  places whether or not any fluid was there.
- Particles fly like firework sparks: each one sets off the way the fluid is moving where it is
  born, is pushed outward from the center of the fluid, and gradually slows to a stop. Before,
  they were carried along by the fluid for their whole life.
- Two new particle settings under Movement: **Slow down** (how quickly particles lose their
  speed) and **Outward push** (how hard they are pushed away from the middle of the fluid).
- **Save this look** now always makes a new preset and leaves the ones already saved alone.
  There are 10 preset spaces; once they are full, saving (or duplicating, importing or starting a
  blank preset) asks which one to overwrite. Before, saving silently overwrote the selected preset.

## 1.0.1

### Fixes
- A device whose graphics can't run the simulation now gets a message explaining so, instead of
  a blank screen.
- A device that is already dropping frames is no longer given extra solver passes on top.
- The screen-sized buffers used by the screen filters are freed when the last filter is switched off.

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
- Every setting has a short description (the ? button), and the settings can be searched.
- Phones start in Balanced mode: 60 frames a second with adaptive quality on.
- If the graphics keep resetting, the app restarts on safe settings, and stops restarting rather
  than looping if that doesn't help.
- Color sharpness is held to what the device's memory can carry.
- Adaptive quality waits longer before raising quality again when a raise didn't hold.

### Changes
- Controls that only matter when a feature is on (for example bloom intensity) are hidden until it is.
- The Android Back button closes the top-most thing first: dialog, hidden controls, then the sheet.
- Stricter content security policy (no inline styles); dat.GUI removed.

### Kept
- Every simulation setting, the keyboard shortcuts, and presets saved by earlier versions.
