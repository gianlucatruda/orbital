# ORBITAL

Tasks:

- [x] Refactor to modular design: data/parameters, UI, and physics/logic.
- [x] Add a spacecraft 
- [ ] Incorporate true planet and moon sizes and distances (with object scaling factor in Controls pane)
- [ ] Add N-body physics to engine to allow orbital maneuvers between spacecraft and celestial bodies
- [ ] Add a level/puzzle: with a given delta V and time budget, get from body A's orbit to body B's orbit
- [x] Fix camera tracking of celestial bodies (particularly for moon)
- [ ] Fix moon's weird orbital plane (due to Earth-relative axial tilt?)
- [x] Fix UI scaling on small screens (especially mobile devices)

---

Future Ideas:

- [ ] Add a WebGL fragment shader to simulate stars as background
- [ ] Simulate Earth's atmosphere (can I write shaders for that? e.g. Perlin noise?)
- [ ] Migrate physics to a Rust engine -> WASM bind (see `rustify` branch)
- [ ] Refactor build and deploy pipelines (Rust part + frontend part)
