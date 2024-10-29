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
- [ ] Fix scaling of objects so only children of currently tracked celestial body are scaled (with smart dynamic limits)
- [ ] Cast shadows from objects upon one another
- [ ] Add textures (and a proper model) for the spacecraft
- [ ] Add N-body physics to engine to allow orbital maneuvers between spacecraft and celestial bodies
- [ ] Add a level/puzzle: with a given delta V and time budget, get from body A's orbit to body B's orbit
- [ ] Make sun appear brighter and give it some kind of light flare / glow effects
- [ ] Add a WebGL fragment shader to simulate stars as background
- [ ] Simulate Earth's atmosphere (can I write shaders for that? e.g. Perlin noise?)
- [ ] Migrate physics to a Rust engine -> WASM bind (see `rustify` branch for WIP)
