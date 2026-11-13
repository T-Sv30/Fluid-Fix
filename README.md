# RIPPL Studio

An interactive WebGL fluid simulation that runs in desktop and mobile browsers. Drag across the screen to stir the fluid; open the settings panel to change resolution, colors, bloom, sunrays and more.

<img src="screenshot.jpg" width="880">

**Live:** https://t-sv30.github.io/RIPPL-Studio/

## Features

Everything is in the controls panel (top right). Its top rows give one-tap access to **Randomize**, **Freeze / Resume**, **Next palette**, **Auto-play**, **Vortex**, **Random splats**, **Clear fluid**, **Undo**, **Redo**, **Screenshot** and **Fullscreen**.

| Feature | What it does | Key |
|---|---|---|
| Rainbow mode | Colors continuously sweep around the color wheel | N |
| Color presets | 11 palettes: Classic, Sunset, Ocean, Aurora, Fire, Neon, Candy, Forest, Galaxy, Ice, Gold | C (next) |
| Randomize | New palette, background, motion and symmetry in one tap | R |
| Auto-play | Three streams paint by themselves on slow, wandering paths, with occasional bursts | A |
| Vortex | Orbiting arms stir a continuous whirlpool around the center | V |
| Mirror | None, Horizontal, Vertical, Diagonal or Complex (4-way) symmetry | M (cycle) |
| Kaleidoscope | 2–10 rotated and reflected segments around the center | K |
| Color trails | Dye fades about 8× slower, leaving long trails | T |
| Blacklight | Fluorescent colors under UV light, with intensity, fluorescence and 8 UV color modes | B |
| Background presets | Black, Midnight, Nebula, Deep Ocean, Ember, Forest, Charcoal, Paper, Custom (crossfades) | |
| Dissipation | How long color takes to fade away: 0% = 0.2 s, 100% = 3 s | |
| Speed | Simulation speed: 0% stopped, 50% normal, 100% = 3× (sub-stepped to stay stable) | |
| Touch force | Strength of every touch and emitter: 50% normal, 100% = 3× | |
| Freeze / resume | Stops the motion; you can still paint on the frozen image | F or P |
| Random color on touch | Each new touch injects a burst of random colors | I |
| Auto transitions | Smoothly crossfades to the next palette every few seconds | |

Space adds random splats, H hides the controls panel, G / J / X cycle the gesture mode, injection mode and force field, O toggles particles, L cycles the particle style and Q cycles the simulation mode.

## Settings

Every slider runs from 0 to 100%, and each one is mapped to a tuned engine value. The panel is grouped like this:

- **Presets:** choose a preset (six built in: Default, Aurora Dream, Lava Lamp, Neon Party, Ink on Paper, Starry Galaxy), rename it, save, new, clone, random, export (copy, share or download as JSON), load (paste or open a JSON file), delete, and reset simulation. Presets are saved on this device, and the last one you used opens next time. Undo and redo (also Ctrl+Z / Ctrl+Shift+Z) step through settings changes.
- **Simulation → simulation mode:** one-tap scenes built from the forces below. Each sets its own forces, fields and edges, and most keep the scene moving on their own:
  - **Standard Fluid** (resets those forces), **Vortex**, **Whirlpool** (color pours in at the rim and drains in the middle), **Tornado** (a rising, twisting column), **Explosion** (periodic bursts), **Fountain** (a jet that arcs and falls), **Waterfall** (falls off the top and out the bottom), **Waves** (a traveling sine ribbon), **Orbit** (planets on Kepler-style orbits), **Magnetic** (color streams along field lines between two poles), **Plasma** (crackling arcs in turbulence), **Galaxy** (two spiral arms around a bright core), **Black Hole** (clouds spiral in and vanish), **Reverse Flow** (fluid moves against your finger)
- **Simulation:** quality (Very Low → Ultra High), speed, autoplay, radius, sim resolution, dissipation (fade time), viscosity, vorticity, gravity, pressure (Low / Norm / Max)
- **Forces:** turbulence (animated curl noise), flow strength, swirl, pressure strength, buoyancy (50% = neutral, lower sinks, higher rises), drag, elasticity (springy wobble), flow direction (8 directions, radial outward/inward, circular), flow speed, randomness
- **Edges:** Wall, Wrap (fluid leaving one side comes back on the other; needs WebGL2), Void (fluid flows out and vanishes), Repel; plus repel strength, repel distance, edge friction, edge bounce, edge softness, and corner behavior (Normal, Rounded, Repel, Bounce, Absorb, Wrap)
- **Touch:** touch force, touch radius, touch attraction, touch repulsion, multi-touch strength (applies while 2+ fingers are down), continuous drawing (keeps adding color while a finger is held still), touch sensitivity (below 50% ignores tiny jitters, above 50% amplifies movement), gesture mode, injection mode
  - **Gesture modes:** Push (classic), Pull (draws color in behind the finger), Swirl (spins fluid around the finger), Attract and Repel (hold to pull color in or push it away), Inject (color with little force), Erase (wipes color away), Vortex (a whirlpool under the finger)
  - **Injection modes:** Continuous, Burst (a ring of color on touch), Pulse (rhythmic bursts), Spray (spray-paint speckles), Fountain (an upward jet), Random (random directions and colors), Directional (a steady jet in the direction you last moved)
- **Forces → force field:** Vortex, Attractor, Repeller, Spiral, Radial (a turning star of rays), Wave (traveling waves), Magnetic (two poles), plus field strength
- **Effects:** shading, bloom, flare (Soft, Sharp, Radial, Cinematic), sunrays, gamma (Standard, Bright, Dark, Cinematic), specular highlights (Soft, Glossy, Sharp), mirror, glow intensity and radius, refraction (glass-like distortion), reflection, transparency, depth (relief lighting and a drop shadow)
- **Blacklight:** blacklight mode, intensity, fluorescence (brightness and glowing edges), UV color mode (Neon Blue, Electric Purple, Fluorescent Pink, Toxic Green, Neon Orange, Ultraviolet, Cyan, Full Spectrum)
- **Filters:** pixels (2×–16×), neon outlines, emboss, lens fringe, film filter (warm grade, vignette, grain), saturation and contrast (50% = unchanged), invert, shake (follows how hard you stir; Subtle, Normal, Strong), motion echoes (Smooth, Fluid, Dramatic) with intensity, chromatic aberration, blur, sharpen, color variation
- **Particles:** particles, mix (0% = fluid only, 50% = both, 100% = particles only), intensity, speed, amount (128 to 16,384), style (Points, Lines, Trails, Circles, Glow, Sparks, Bubbles, Dust, Orbs, Waves), size, length (streak length for moving particles), density (share of particles shown), glow (halo), spread (100% = whole screen, lower = spawn around your finger), turbulence, fade (how quickly each particle disappears), attraction (particles drift toward each other), collision (crowded particles push apart), trails, color mode (Fluid Color, Single Color, Random, Velocity-Based, Rainbow, Gradient from the current palette, Temperature-Based), single color
- **Performance:** performance mode (Battery Saver, Balanced, Performance, Maximum Performance presets), frame rate limit (15–120 FPS or Unlimited), adaptive quality (steps render scale, dye resolution and effect quality down when frames run slow, and back up when they recover), render scale (internal resolution, 0% = 25%), effect quality (bloom, sunrays and glow resolution), particle limit, battery saver (caps at 30 FPS, 70% render scale, Low effects, 1,024 particles), and a live FPS readout
- **Text:** text on/off, text mode (Paint: the letters keep pouring color into the fluid; Obstacle: the fluid flows around solid letters), edit text (multiple lines), font, font size, text color, outline and thickness, text glow and intensity, position x / y, rotation, opacity
- **Background:** Black, White, Transparent (transparent screenshots), Custom (with a color picker) and the gradient presets, plus brightness, blur (a soft out-of-focus copy of the fluid behind it) and opacity
- **Wallpaper:** splashes (gentle automatic splashes), clear on return (starts fresh when you come back to the page), and set live wallpaper (explains the options, since a web page can't install itself as an Android wallpaper)
- **Modes, Colors, Capture**

Simulation speed stays real-time at any frame rate limit: the solver sub-steps long frames, emitters keep their 60-per-second rhythm, and fast strokes are filled in between frames.

Particles run entirely on the GPU and ride the fluid's velocity. They need float textures (WebGL2 on nearly all current phones); devices without them show a message instead.

Screen filters only run while at least one is switched on, so they cost nothing when off. Screenshots capture the fluid without screen filters.

Gravity, buoyancy and flow direction act on the colored fluid, so dense color sinks, rises or drifts while clear areas stay calm. In Wrap and Void modes a directional flow also moves the whole field.

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
