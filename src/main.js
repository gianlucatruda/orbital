import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Pane } from "tweakpane";
import Stats from "three/examples/jsm/libs/stats.module.js";

const SECONDS_PER_DAY = 86400;

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
  sun: textureLoader.load('/textures/2k_sun.jpg'),
  mercury: textureLoader.load('/textures/2k_mercury.jpg'),
  venus: textureLoader.load('/textures/2k_venus_surface.jpg'),
  earth: textureLoader.load('/textures/2k_earth_daymap.jpg'),
  mars: textureLoader.load('/textures/2k_mars.jpg'),
  moon: textureLoader.load('/textures/2k_moon.jpg'),
};

// Set texture color space
Object.values(textures).forEach(texture => {
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

// Create the sun
const sun = new THREE.Mesh(sphereGeometry, materials.sun);
sun.scale.setScalar(5);
scene.add(sun);

// Orbital parameters (simplified for the simulation)
const planetsData = [
  {
    name: 'Mercury',
    radius: 0.5,
    texture: 'mercury',
    axialTilt: 0.034,
    rotationPeriod: 58.646,
    orbitalElements: {
      a: 10, // Semi-major axis
      e: 0.2056, // Eccentricity
      i: 7, // Inclination in degrees
      omega: 48.331, // Longitude of ascending node
      w: 29.124, // Argument of periapsis
      L0: 252.251, // Mean longitude at epoch
      period: 87.969, // Orbital period in Earth days
    },
    moons: [],
  },
  {
    name: 'Venus',
    radius: 0.8,
    texture: 'venus',
    axialTilt: 177.36,
    rotationPeriod: -243.025, // Negative for retrograde rotation
    orbitalElements: {
      a: 15,
      e: 0.0067,
      i: 3.39,
      omega: 76.680,
      w: 54.884,
      L0: 181.979,
      period: 224.701,
    },
    moons: [],
  },
  {
    name: 'Earth',
    radius: 1,
    texture: 'earth',
    axialTilt: 23.44,
    rotationPeriod: 1.0,
    orbitalElements: {
      a: 20,
      e: 0.0167,
      i: 0,
      omega: 0,
      w: 102.937,
      L0: 100.464,
      period: 365.256,
    },
    moons: [
      {
        name: 'Moon',
        radius: 0.3,
        texture: 'moon',
        axialTilt: 6.68,
        rotationPeriod: 27.322,
        orbitalElements: {
          a: 3,
          e: 0.0549,
          i: 5.145,
          omega: 0,
          w: 0,
          L0: 0,
          period: 27.322,
        },
      },
    ],
  },
  {
    name: 'Mars',
    radius: 0.7,
    texture: 'mars',
    axialTilt: 25.19,
    rotationPeriod: 1.025,
    orbitalElements: {
      a: 25,
      e: 0.0934,
      i: 1.85,
      omega: 49.558,
      w: 286.502,
      L0: 355.453,
      period: 686.980,
    },
    moons: [],
  },
];

// Function to convert degrees to radians
const degToRad = degrees => (degrees * Math.PI) / 180;

// Function to calculate the position from mean anomaly
function calculatePositionFromMeanAnomaly(orbitalElements, M_deg) {
  const { a, e, i, omega, w } = orbitalElements;
  const M_rad = degToRad(M_deg);

  // Solve Kepler's Equation for Eccentric Anomaly using Newton-Raphson method
  let E = M_rad;
  for (let j = 0; j < 5; j++) {
    E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
  }

  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2),
  );

  // Distance from the central body
  const r = a * (1 - e * Math.cos(E));

  // Heliocentric coordinates in the orbital plane
  const x_orb = r * Math.cos(nu);
  const y_orb = r * Math.sin(nu);

  // Convert to 3D coordinates
  const x = x_orb * (Math.cos(degToRad(omega)) * Math.cos(degToRad(w)) - Math.sin(degToRad(omega)) * Math.sin(degToRad(w)) * Math.cos(degToRad(i)))
    - y_orb * (Math.cos(degToRad(omega)) * Math.sin(degToRad(w)) + Math.sin(degToRad(omega)) * Math.cos(degToRad(w)) * Math.cos(degToRad(i)));
  const y = x_orb * (Math.sin(degToRad(omega)) * Math.cos(degToRad(w)) + Math.cos(degToRad(omega)) * Math.sin(degToRad(w)) * Math.cos(degToRad(i)))
    + y_orb * (Math.cos(degToRad(omega)) * Math.cos(degToRad(w)) * Math.cos(degToRad(i)) - Math.sin(degToRad(omega)) * Math.sin(degToRad(w)));
  const z = x_orb * (Math.sin(degToRad(w)) * Math.sin(degToRad(i))) + y_orb * (Math.cos(degToRad(w)) * Math.sin(degToRad(i)));

  return new THREE.Vector3(x, z, y); // Note: Swapped y and z for correct orientation
}

// Create orbit paths
function createOrbitPath(orbitalElements, parentPosition = new THREE.Vector3()) {
  const positions = [];
  for (let M_deg = 0; M_deg < 360; M_deg += 1) {
    const position = calculatePositionFromMeanAnomaly(orbitalElements, M_deg);
    position.add(parentPosition);
    positions.push(position.x, position.y, position.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x888888, opacity: 0.5, transparent: true });
  return new THREE.LineLoop(geometry, material);
}

// Create celestial bodies
const celestialBodies = [];
const orbitPaths = [];

planetsData.forEach(planetData => {
  const planetMaterial = materials[planetData.texture];

  const planetGroup = new THREE.Object3D();
  planetGroup.name = planetData.name + '_group';
  const axialTilt = degToRad(planetData.axialTilt || 0);
  planetGroup.rotation.x = axialTilt;

  const planetMesh = new THREE.Mesh(sphereGeometry, planetMaterial);
  planetMesh.scale.setScalar(planetData.radius);
  planetMesh.name = planetData.name;

  planetGroup.add(planetMesh);
  scene.add(planetGroup);

  // Create orbit path
  const orbitPath = createOrbitPath(planetData.orbitalElements);
  orbitPaths.push(orbitPath);
  scene.add(orbitPath);

  const planet = {
    group: planetGroup,
    mesh: planetMesh,
    orbitalElements: planetData.orbitalElements,
    rotationPeriod: planetData.rotationPeriod,
    moons: [],
  };

  planetData.moons.forEach(moonData => {
    const moonMaterial = materials[moonData.texture];

    const moonGroup = new THREE.Object3D();
    moonGroup.name = moonData.name + '_group';
    const moonAxialTilt = degToRad(moonData.axialTilt || 0);
    moonGroup.rotation.x = moonAxialTilt;

    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.setScalar(moonData.radius);
    moonMesh.name = moonData.name;

    moonGroup.add(moonMesh);
    planetGroup.add(moonGroup);

    const moon = {
      group: moonGroup,
      mesh: moonMesh,
      orbitalElements: moonData.orbitalElements,
      rotationPeriod: moonData.rotationPeriod,
      parent: planet,
    };

    // Create orbit path for the moon
    const moonOrbitPath = createOrbitPath(moonData.orbitalElements);
    orbitPaths.push(moonOrbitPath);
    planetGroup.add(moonOrbitPath);

    planet.moons.push(moon);
    celestialBodies.push(moon);
  });

  celestialBodies.push(planet);
});

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Point light (sunlight)
const pointLight = new THREE.PointLight(0xffffff, 2000, 0, 2);
scene.add(pointLight);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2000,
);
camera.position.set(0, 60, 0);

// Renderer setup
const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controlPane = pane.addFolder({
  title: 'Controls',
  expanded: true
});
let simControls = {
  timeAccel: 1.0, // 1 day / sec
  simTime: 0.0,
  rotateCam: false,
  showOrbitPaths: true,
};
controlPane.addBinding(simControls, 'timeAccel', { min: 0, max: 50, step: 1, label: 'Speedup (days/s)' });
controlPane.addBinding(simControls, 'rotateCam');
controlPane.addBinding(simControls, 'showOrbitPaths', { label: 'Show Orbit Paths' });

// Log simTime to the controlPane
controlPane.addBinding(simControls, 'simTime', { readonly: true, label: "delta t (days)" });

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 500;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let clock = new THREE.Clock();

function animate() {
  simControls.simTime += simControls.timeAccel * SECONDS_PER_DAY * (clock.getDelta() / 86400); // Convert seconds to days

  celestialBodies.forEach(body => {
    const position = calculatePositionFromMeanAnomaly(body.orbitalElements, simControls.simTime);
    if (body.parent) {
      body.group.position.copy(position);
    } else {
      body.group.position.copy(position);
    }

    if (body.rotationPeriod) {
      const rotationAngle = (simControls.simTime / body.rotationPeriod) * Math.PI * 2;
      body.mesh.rotation.y = rotationAngle;
    }
  });

  // Toggle orbit paths visibility
  orbitPaths.forEach(path => {
    path.visible = simControls.showOrbitPaths;
  });

  controls.autoRotate = simControls.rotateCam;
  controls.update();
  stats.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
