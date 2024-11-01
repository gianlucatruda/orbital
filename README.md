# ORBITAL

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
- [ ] WIP: Update engine to allow orbital maneuvers between spacecraft and celestial bodies
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
