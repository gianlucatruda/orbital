# ORBITAL

Orbital is an experimental simulator / game for orbital mechanics that runs in your browser.

I’m using it as a way to:

1.  advance my computer graphics and front-end skills,
2.  explore my interests in space travel and physics,
3.  practise pair-programming with LLMs in a low-stakes setting

The project is currently written in JavaScript (with scatterings of Rust, GLSL, and WebAssembly).

It makes heavy use of the excellent [Three.js](https://github.com/mrdoob/three.js/) library, which gives convenient high-level APIs for browser-based graphics atop the cross-platform [WebGL](https://en.wikipedia.org/wiki/WebGL). That saves me having to implement low-level features from scratch, which I’ve already done in [my browser-based raytracer](https://gianluca.ai/raytracer/).

Read the Development Log at [gianluca.ai/orbital-devlog](https://gianluca.ai/orbital-devlog/)

![Orbital Cover image showing Moon](https://gianluca.ai/orbital-devlog/images/orbital-cover-01-moon.jpeg)


---

Tasks:

- [x] Refactor to modular design: data/parameters, UI, and physics/logic.
- [x] Add a spacecraft
- [x] Fix camera tracking of celestial bodies (particularly for moon)
- [x] Fix UI scaling on small screens (especially mobile devices)
- [x] Incorporate true planet and moon sizes and distances (with object scaling factor in Controls pane)
- [x] Convert to AU-based render units (and fix scaling systems) to deal with numerical stability
- [x] Fix camera tracking to follow the object as it moves (only noticeable at realistic scale)
- [x] Fix bug where only sun is spinning, not any planets.
- [x] Fix orbit path drift
- [x] Fix orbit path drawing for satellites
- [x] Fix bug where animated object diverges from true orbit at higher speedup.
- [x] Fix bug in satellite (child) orbital path tilt
- [ ] Fix bug where craft "teleport" to new orbit after burn instead of conserving relative position.
- [ ] WIP: `calculateOrbitAtTime` and `calculateElements` in engine (mostly correct) enables demo burn on ISS
- [ ] WIP: Update engine to allow orbital maneuvers between spacecraft and celestial bodies
- [ ] Fix bug where `Array.forEach` throws `RangeError: Array buffer allocation failed` (happened at delta t = `16103.61413`)
- [ ] Add some tests for the core physics (e.g. using orbital formulae to cross-check)
- [ ] Fix scaling of objects so only children of currently tracked celestial body are scaled (with smart dynamic limits)
- [ ] Fix camera jankiness when using true sizes and distances. Replace OrbitControls with custom camera system?
- [ ] Refactor and tidy up the code. Fewer side-effects.
- [ ] Cast shadows from objects upon one another
- [ ] Add textures (and a proper model) for the spacecraft
- [ ] Add a level/puzzle: with a given delta V and time budget, get from body A's orbit to body B's orbit
- [ ] Make sun appear brighter and give it some kind of light flare / glow effects
- [ ] Add a WebGL fragment shader to simulate stars as background
- [ ] Calibrate the solar system against https://eyes.nasa.gov/apps/solar-system
- [ ] Simulate Earth's atmosphere (can I write shaders for that? e.g. Perlin noise?)
- [ ] Migrate physics to a Rust engine -> WASM bind (see `rustify` branch for WIP)
