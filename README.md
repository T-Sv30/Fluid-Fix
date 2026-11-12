# Fluid Fix

An interactive WebGL fluid simulation that runs in desktop and mobile browsers. Drag across the screen to stir the fluid; open the settings panel to change resolution, colors, bloom, sunrays and more.

<img src="screenshot.jpg" width="880">

**Live:** https://t-sv30.github.io/Fluid-Fix/

## Features

The toolbar at the bottom gives one-tap access to **Randomize**, **Palette**, **Auto-play**, **Vortex** and **Freeze**. Everything else is in the controls panel (top right).

| Feature | What it does | Key |
|---|---|---|
| Rainbow mode | Colors continuously sweep around the color wheel | N |
| Color presets | 11 palettes: Classic, Sunset, Ocean, Aurora, Fire, Neon, Candy, Forest, Galaxy, Ice, Gold | C (next) |
| Randomize | New palette, background, motion and symmetry in one tap | R |
| Auto-play | Three streams paint by themselves on slow, wandering paths, with occasional bursts | A |
| Vortex | Orbiting arms stir a continuous whirlpool around the center | V |
| Mirror mode | Everything you draw is reflected left/right | M |
| Kaleidoscope | 2–10 rotated and reflected segments around the center | K |
| Color trails | Dye fades about 8× slower, leaving long trails | T |
| Blacklight | Neon-saturated colors with a UV-violet glow | B |
| Background presets | Black, Midnight, Nebula, Deep Ocean, Ember, Forest, Charcoal, Paper, Custom (crossfades) | |
| Speed | 0.1× to 3× simulation speed (sub-stepped to stay stable) | |
| Intensity | 0.1× to 3× strength of every touch and emitter | |
| Freeze / resume | Stops the motion; you can still paint on the frozen image | F or P |
| Random color on touch | Each new touch injects a burst of random colors | I |
| Auto transitions | Smoothly crossfades to the next palette every few seconds | |

Space adds random splats, and H hides the toolbar and panel.

## Run it

Open `index.html` in a browser, or serve the folder with any static web server (e.g. `python3 -m http.server`).

## Credits

Based on [WebGL Fluid Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) by Pavel Dobryakov.

References:
- [GPU Gems, Chapter 38: Fast Fluid Dynamics Simulation on the GPU](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)
- https://github.com/mharrys/fluids-2d
- https://github.com/haxiomic/GPU-Fluid-Experiments

## License

MIT. See [LICENSE](LICENSE).
