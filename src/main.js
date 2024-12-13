import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import { calculateElements, calculateOrbitAtTime } from "./engine";
import { degToRad } from "three/src/math/MathUtils";
import { planetsData } from "./data";

const SECONDS_PER_DAY = 86400;
const AU_IN_KM = 149597871;
const G = 6.67430e-11; // gravitational constant in m^3 kg^-1 s^-2

let simParams = {
  timeAccel: 0.01, // days / sec
  realtime: false,
  planetScale: 1,
  simTime: 0.0,
  rotateCam: false,
  showOrbitPaths: true,
  anchorTo: "Earth",
};

// Stats (FPS)
const stats = Stats();
document.body.appendChild(stats.dom);

// initialize pane
const pane = new Pane();

// Initialize the scene
const scene = new THREE.Scene();

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Load textures
const textures = {
  sun: textureLoader.load("/textures/2k_sun.jpg"),
  mercury: textureLoader.load("/textures/2k_mercury.jpg"),
  venus: textureLoader.load("/textures/2k_venus_surface.jpg"),
  earth: textureLoader.load("/textures/2k_earth_daymap.jpg"),
  mars: textureLoader.load("/textures/2k_mars.jpg"),
  moon: textureLoader.load("/textures/2k_moon.jpg"),
};

// Set texture color space
Object.values(textures).forEach((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
});

// Materials
const materials = {
  sun: new THREE.MeshBasicMaterial({ map: textures.sun }),
  mercury: new THREE.MeshStandardMaterial({ map: textures.mercury }),
  venus: new THREE.MeshStandardMaterial({ map: textures.venus }),
  earth: new THREE.MeshStandardMaterial({ map: textures.earth }),
  mars: new THREE.MeshStandardMaterial({ map: textures.mars }),
  moon: new THREE.MeshStandardMaterial({ map: textures.moon }),
};

// Sphere geometry
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);

// Create orbit paths
function createOrbitPath(body, color = 0xffffff) {
  const positions = [];
  const steps = 3600;
  for (let step = 0; step <= steps; step++) {
    const time = (step / steps) * body.data.orbitalElements.period;
    let position = calculateOrbitAtTime(
      body.data.orbitalElements,
      time,
    ).position;
    position.divideScalar(AU_IN_KM); // Convert position to AU

    positions.push(position.x, position.y, position.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  const material = new THREE.LineBasicMaterial({
    color: color,
    opacity: 0.7,
    transparent: true,
  });
  let line = new THREE.LineLoop(geometry, material);
  // line.computeLineDistances(); // Only needed for dashed lines
  return line;
}

// Recursively create and add celestial bodies
const celestialBodies = [];
const orbitPaths = [];

function addCelestialBody(parent, bodyData) {
  const bodyMaterial =
    materials[bodyData.name.toLowerCase()] ||
    new THREE.MeshStandardMaterial({ color: 0x808080 });

  const bodyGroup = new THREE.Object3D();
  bodyGroup.name = bodyData.name + "_group";
  const axialTilt = degToRad(bodyData.obliquityToOrbit || 0);

  const bodyMesh = new THREE.Mesh(sphereGeometry, bodyMaterial);
  bodyMesh.name = bodyData.name;
  bodyMesh.scale.setScalar(bodyData.diameter / 2 / AU_IN_KM); // Radius in AU
  // Apply tilt to mesh (NOT body) so children (satellites) are unaffected
  bodyMesh.rotation.x = axialTilt;
  bodyGroup.add(bodyMesh);

  // Use relative positioning of children to the parent for consistent orbits
  if (parent) {
    parent.group.add(bodyGroup);
  } else {
    scene.add(bodyGroup);
  }

  const celestialBody = {
    name: bodyData.name,
    group: bodyGroup,
    mesh: bodyMesh,
    data: bodyData,
    parent: parent,
  };

  bodyData.satellites.forEach((satelliteData) => {
    addCelestialBody(celestialBody, satelliteData);
  });

  celestialBodies.push(celestialBody);
  return celestialBody;
}

addCelestialBody(null, planetsData[0]);

function computePositions(celestialBodies) {
  celestialBodies.forEach((body) => {
    // Scale the planets
    if (body.name !== "Sun") {
      body.mesh.scale.setScalar(
        (simParams.planetScale * body.data.diameter) / 2 / AU_IN_KM,
      );
    }
    if (body.data.rotationPeriod) {
      const rotationAngle =
        ((simParams.simTime / body.data.rotationPeriod) * 24 * Math.PI * 2) %
        (Math.PI * 2);
      body.mesh.rotation.y = rotationAngle; // Must rotate the mesh, not the object else you'll fuck satellite orbits
    }
    if (body.data.orbitalElements) {
      const pv = calculateOrbitAtTime(
        body.data.orbitalElements,
        simParams.simTime,
      );
      let position = pv.position;
      let velocity = pv.velocity;
      if (body.name == "ISS") {
        // console.log(position, velocity);
      }
      position.divideScalar(AU_IN_KM); // Convert position to AU
      // velocity.divideScalar(AU_IN_KM); // Convert velocity to AU
      body.group.position.copy(position.add(velocity));
      // body.group.position.copy(position)
    }
  });
}

function constructOrbitPaths(celestialBodies) {
  celestialBodies.forEach((body) => {
    if (body.data.orbitalElements) {
      const orbitPath = createOrbitPath(body);
      orbitPaths.push(orbitPath);
      body.parent.group.add(orbitPath);
    }
  });
}

constructOrbitPaths(celestialBodies);

console.log({ celestialBodies });
console.log({ orbitPaths });

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Point light (sunlight)
const pointLight = new THREE.PointLight(0xffffff, 10, 0, 0.00001);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1 / AU_IN_KM,
  5e9 / AU_IN_KM, // Far plane in AU
);
camera.position.set(0, 5, -1); // Position the camera

// Renderer setup
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// UI Controls
const controlPane = pane.addFolder({
  title: "Controls",
  expanded: true,
});
const dataPane = pane.addFolder({
  title: "Data",
  expanded: true,
});

// Prepare options for celestial body selection
const celestialBodiesOptions = {};
celestialBodies.forEach((body) => {
  celestialBodiesOptions[body.mesh.name] = body.mesh.name;
});

controlPane.addBinding(simParams, "anchorTo", {
  options: celestialBodiesOptions,
  label: "Anchor To",
});
const timeAccelControl = controlPane.addBinding(simParams, "timeAccel", {
  min: 0.0,
  label: "Speedup (days/s)",
  format: (v) => v.toFixed(6),
});
controlPane.addBinding(simParams, "realtime", { label: "Realtime" });
controlPane.addBinding(simParams, "planetScale", {
  min: 1,
  max: 1000,
  step: 1,
  label: "Planet scaling",
});
controlPane.addBinding(simParams, "rotateCam");
controlPane.addBinding(simParams, "showOrbitPaths", {
  label: "Show Orbit Paths",
});
dataPane.addBinding(simParams, "simTime", {
  readonly: true,
  label: "delta t (days)",
  format: (v) => v.toFixed(5),
});

// Orbit controls
const camControls = new OrbitControls(camera, canvas);
camControls.enableDamping = true;
camControls.maxDistance = 1e10 / AU_IN_KM; // in AU
camControls.minDistance = 0.1 / AU_IN_KM; // in AU

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let clock = new THREE.Clock();
let hotpaths = { "ISS": [] };

// Initialize burn parameters
let burnOccurred = false;
const deltaV = new THREE.Vector3(0.001, 0.001, 0.001); // Adjust delta-v components as needed (in km/s)
const burnTime = 0.03; // The simulation time (in days) when the burn should occur

// Function to update satellite stats
function satStats(body, stats = {}) {
  if (!body.parent) {
    return null;
  }
  const M = body.parent.data.mass;
  const P = body.data.orbitalElements.period * 3600 * 24; // In seconds
  const OEs = body.data.orbitalElements;
  const a = OEs.a * 1000; // In m
  const e = OEs.e;
  const r_apo = (1 + e) * a; // In meters
  const r_per = (1 - e) * a; // In meters
  const r = body.group.position.length() * AU_IN_KM * 1000; // Orbital radius in meters

  // Specific energy (epsilon) in J/kg
  let eps = (-G * M) / (2 * a); // J/kg

  // Velocities at apoapsis and periapsis (in m/s)
  let v_apo = Math.sqrt(2 * (eps + (G * M) / r_apo));
  let v_per = Math.sqrt(2 * (eps + (G * M) / r_per));

  // Current velocity (in m/s)
  let v = Math.sqrt(2 * eps + ((2 * G * M) / r));

  if (stats) {
    // TODO this sucks!
    stats.r = r;
    stats.v = v;
    stats.eps = eps;
    stats.r_per = r_per;
    stats.v_per = v_per;
    stats.r_apo = r_apo;
    stats.v_apo = v_apo;
    return stats
  }
  stats = { r, v, eps, r_per, v_per, r_apo, v_apo };
  return stats

  // TODO these should become tests/asserts
  // console.log({ P, a });
  // console.log((r_per * v_per) - (r_apo * v_apo)); // Should be 0
  // console.log((r_apo + r_per) - 2 * a); // Should be 0
  // console.log(
  //   ((G * M) / (4 * Math.pow(Math.PI, 2))) * Math.pow(P, 2) - Math.pow(a, 3)
  // ); // should be 0
  // console.log(
  //   Math.sqrt((Math.pow(a, 3) * 4 * Math.pow(Math.PI, 2)) / (G * M)) - P
  // ); // should be 0

}

// Stats for the ISS (TODO generalise to any movable satellite)
let iss = celestialBodies.find(body => body.name === "ISS");
let issStats = satStats(iss);
const issStatsPane = dataPane.addFolder({
  title: "ISS",
  expanded: true,
});
for (const stat in issStats) {
  issStatsPane.addBinding(issStats, stat, {
    readonly: true,
    label: stat,
    format: (v) => v.toFixed(2),
  });
}

function animate() {
  if (simParams.realtime) {
    simParams.simTime += clock.getDelta() / SECONDS_PER_DAY;
    // Temporarily disable time acceleration controls
    timeAccelControl.disabled = true;
    timeAccelControl.refresh();
  } else {
    timeAccelControl.disabled = false;
    simParams.simTime +=
      simParams.timeAccel *
      SECONDS_PER_DAY *
      (clock.getDelta() / SECONDS_PER_DAY); // Convert seconds to days
  }

  computePositions(celestialBodies);

  // Toggle orbit paths visibility
  orbitPaths.forEach((path) => {
    path.visible = simParams.showOrbitPaths;
  });

  // TODO hacky orbital redrawing for dynamic orbits. Fix and generalise.
  celestialBodies.forEach((body) => {
    if (body.name === "ISS") {
      satStats(body, issStats);

      // Apply the burn if the time has reached burnTime and the burn hasn't occurred yet
      if (!burnOccurred && simParams.simTime >= burnTime) {
        // Get current position and velocity
        let ISSParams = calculateOrbitAtTime(
          body.data.orbitalElements,
          simParams.simTime,
          body.parent.data.mass // Pass centralMass here
        );
        console.log({ISSParams});

        console.log("Time to burn! Old orbital elements:", body.data.orbitalElements);

        // Apply delta-v (burn)
        ISSParams.velocity.add(deltaV.clone());

        // Recalculate orbital elements
        let ISSOrbElements = calculateElements(
          ISSParams.position,
          ISSParams.velocity,
          body.parent.data.mass, // Pass centralMass
          simParams.simTime
        );

        // Update the orbital elements
        body.data.orbitalElements = ISSOrbElements;

        burnOccurred = true;

        // Update the orbit path
        if (hotpaths[body.name].length > 0) {
          let oldPath = hotpaths[body.name].pop();
          body.parent.group.remove(oldPath);
        }
        let orbitPath = createOrbitPath(body, 0x00ff00);
        hotpaths[body.name].push(orbitPath);
        body.parent.group.add(orbitPath);

        console.log("Burn applied! New orbital elements:", body.data.orbitalElements);
        console.log("ISS Position after burn (km):", ISSParams.position);
        console.log("ISS Velocity after burn (km/s):", ISSParams.velocity);

      }
    }
  });

  // Update camera position and target
  if (simParams.anchorTo) {
    const selectedBody = celestialBodies.find(
      (body) => body.mesh.name === simParams.anchorTo,
    );
    if (selectedBody) {
      const target = selectedBody.group.getWorldPosition(new THREE.Vector3());
      camControls.target.copy(target);
      // const eps = (selectedBody.data.diameter * 1.25) / AU_IN_KM;
      if (
        selectedBody.name !== "Sun" &&
        !simParams.realtime &&
        !simParams.rotateCam
      ) {
        // camera.position.set(target.x + eps, target.y + eps, target.z + eps);
        camControls.maxDistance = selectedBody.data.diameter * 5.0 / AU_IN_KM;
      }
      else {
        camControls.maxDistance = 100;
      }
    }
  }

  camControls.autoRotate = simParams.rotateCam;
  camControls.update();
  stats.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
