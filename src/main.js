import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Pane } from "tweakpane";
import Stats from "three/examples/jsm/libs/stats.module.js";

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

// Function to calculate the position of a celestial body in its orbit
function calculatePosition(orbitalElements, elapsedTime) {
  const { a, e, i, omega, w, L0, period } = orbitalElements;

  // Mean anomaly
  const M = ((360 / period) * elapsedTime + L0 - w) % 360;
  const M_rad = degToRad(M);

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

// Create planet meshes
const celestialBodies = [];

planetsData.forEach(planetData => {
  const planetMaterial = materials[planetData.texture];
  const planetMesh = new THREE.Mesh(sphereGeometry, planetMaterial);
  planetMesh.scale.setScalar(planetData.radius);
  planetMesh.name = planetData.name;
  scene.add(planetMesh);

  const planet = {
    mesh: planetMesh,
    orbitalElements: planetData.orbitalElements,
    moons: [],
  };

  planetData.moons.forEach(moonData => {
    const moonMaterial = materials[moonData.texture];
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.setScalar(moonData.radius);
    moonMesh.name = moonData.name;
    scene.add(moonMesh);

    const moon = {
      mesh: moonMesh,
      orbitalElements: moonData.orbitalElements,
      parent: planet,
    };

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
})
let simControls = {
  timeAccel: 1e8,
  simTime: 0.0,
  rotateCam: false,
};
controlPane.addBinding(simControls, 'timeAccel', { min: 0, max: 1e9, step: 1e7 });
controlPane.addBinding(simControls, 'rotateCam');

// Log simTime to the controlPane
controlPane.addBinding(simControls, 'simTime', { readonly: true, label: "simTime (days)" });

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
  simControls.simTime += simControls.timeAccel * (clock.getDelta() / (1000 * 86400)); // Convert milliseconds to days

  celestialBodies.forEach(body => {
    const position = calculatePosition(body.orbitalElements, simControls.simTime);
    if (body.parent) {
      // For moons, position relative to the parent planet
      const parentPosition = body.parent.mesh.position;
      body.mesh.position.copy(position).add(parentPosition);
    } else {
      // For planets, position relative to the sun
      body.mesh.position.copy(position);
    }
  });

  controls.autoRotate = simControls.rotateCam;
  controls.update();
  stats.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
}

animate();
