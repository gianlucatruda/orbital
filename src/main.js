import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import { calculatePositionFromMeanAnomaly } from "./engine";
import { degToRad } from "three/src/math/MathUtils";
import { planetsData } from "./data";

const SECONDS_PER_DAY = 86400;
const AU_IN_KM = 149597871;
let simControls = {
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
function createOrbitPath(
  body
) {
  const positions = [];
  const steps = 3600;
  for (let step = 0; step <= steps; step++) {
    const time = (step / steps) * body.data.orbitalElements.period;
    let position = calculatePositionFromMeanAnomaly(body.data.orbitalElements, time);
    position.divideScalar(AU_IN_KM); // Convert position to AU

    positions.push(
      position.x,
      position.y,
      position.z,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
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
  bodyGroup.rotation.x = axialTilt;

  const bodyMesh = new THREE.Mesh(sphereGeometry, bodyMaterial);
  bodyMesh.scale.setScalar(bodyData.diameter / 2 / AU_IN_KM); // Radius in AU
  bodyMesh.name = bodyData.name;

  bodyGroup.add(bodyMesh);
  scene.add(bodyGroup);

  const celestialBody = {
    name: bodyData.name,
    group: bodyGroup,
    mesh: bodyMesh,
    data: bodyData,
    parent: parent,
  };

  bodyData.satellites.forEach((satelliteData) => {
    const child = addCelestialBody(celestialBody, satelliteData);
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
        (simControls.planetScale * body.data.diameter) / 2 / AU_IN_KM,
      );
    }
    if (body.data.rotationPeriod) {
      const rotationAngle =
        ((simControls.simTime / body.data.rotationPeriod) * 24 * Math.PI * 2) %
        (Math.PI * 2);
      body.mesh.rotation.y = rotationAngle;
    }
    if (body.data.orbitalElements) {
      let position = calculatePositionFromMeanAnomaly(
        body.data.orbitalElements,
        simControls.simTime,
      );
      position.divideScalar(AU_IN_KM); // Convert position to AU
      const parentPosition = body.parent.group.position;
      position = position.clone().add(parentPosition);
      body.group.position.copy(position);
    }
  });
}

function computeOrbitPaths(celestialBodies) {
  celestialBodies.forEach((body) => {
    if (body.data.orbitalElements) {
      const orbitPath = createOrbitPath(body);
      orbitPaths.push(orbitPath);
      body.parent.group.add(orbitPath);
    }
  });
}

// computePositions(celestialBodies);
computeOrbitPaths(celestialBodies);

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
camera.position.set(0, 5, -1); // Position the camera at 300 million km on Z-axis

// Renderer setup
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controlPane = pane.addFolder({
  title: "Controls",
  expanded: true,
});

// Prepare options for celestial body selection
const celestialBodiesOptions = {};
celestialBodies.forEach((body) => {
  celestialBodiesOptions[body.mesh.name] = body.mesh.name;
});

const timeAccelControl = controlPane.addBinding(simControls, "timeAccel", {
  min: 0.0,
  label: "Speedup (days/s)",
  format: (v) => v.toFixed(6),
});
controlPane.addBinding(simControls, "realtime", { label: "Realtime" });
controlPane.addBinding(simControls, "planetScale", {
  min: 1,
  max: 1000,
  step: 1,
  label: "Planet scaling",
});
controlPane.addBinding(simControls, "rotateCam");
controlPane.addBinding(simControls, "showOrbitPaths", {
  label: "Show Orbit Paths",
});
controlPane.addBinding(simControls, "anchorTo", {
  options: celestialBodiesOptions,
  label: "Anchor To",
});
controlPane.addBinding(simControls, "simTime", {
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

function animate() {
  if (simControls.realtime) {
    simControls.simTime += clock.getDelta() / SECONDS_PER_DAY;
    // Temporarily disable time acceleration controls
    timeAccelControl.disabled = true;
    timeAccelControl.refresh();
  } else {
    timeAccelControl.disabled = false;
    simControls.simTime +=
      simControls.timeAccel *
      SECONDS_PER_DAY *
      (clock.getDelta() / SECONDS_PER_DAY); // Convert seconds to days
  }

  computePositions(celestialBodies);

  // Toggle orbit paths visibility
  orbitPaths.forEach((path) => {
    path.visible = simControls.showOrbitPaths;
  });

  // Update camera position and target
  if (simControls.anchorTo) {
    const selectedBody = celestialBodies.find(
      (body) => body.mesh.name === simControls.anchorTo,
    );
    if (selectedBody) {
      const target = selectedBody.group.getWorldPosition(new THREE.Vector3());
      camControls.target.copy(target);
      const eps = (selectedBody.data.diameter * 1.25) / AU_IN_KM;
      if (selectedBody.name !== "Sun" && !simControls.realtime && !simControls.rotateCam) {
        camera.position.set(target.x + eps, target.y + eps, target.z + eps);
      }
    }
  }

  camControls.autoRotate = simControls.rotateCam;
  camControls.update();
  stats.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
