import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Pane } from "tweakpane";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { degToRad } from 'three/src/math/MathUtils';
import { calculatePositionFromMeanAnomaly } from './engine';

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
sun.name = 'Sun';
scene.add(sun);

// Orbital parameters (simplified for the simulation)
import { planetsData } from './data';


// Create orbit paths
function createOrbitPath(orbitalElements, parentPosition = new THREE.Vector3()) {
  const positions = [];
  const steps = 360;
  for (let step = 0; step < steps; step++) {
    const time = (step / steps) * orbitalElements.period;
    const position = calculatePositionFromMeanAnomaly(orbitalElements, time);
    position.add(parentPosition);
    positions.push(position.x, position.y, position.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
  let line = new THREE.LineLoop(geometry, material, 100);
  line.computeLineDistances();
  return line;
}

// Create celestial bodies
const celestialBodies = [];
const orbitPaths = [];

// Add the sun to celestialBodies
celestialBodies.push({
  group: sun,
  mesh: sun,
  name: 'Sun',
});

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
    name: planetData.name,
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
      name: moonData.name,
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

// Prepare options for celestial body selection
const celestialBodiesOptions = {
  'Sun': 'Sun',
};
celestialBodies.forEach(body => {
  celestialBodiesOptions[body.mesh.name] = body.mesh.name;
});

let simControls = {
  timeAccel: 1.0, // 1 day / sec
  simTime: 0.0,
  rotateCam: false,
  showOrbitPaths: true,
  anchorTo: 'Sun',
};

controlPane.addBinding(simControls, 'timeAccel', { min: 0, max: 50, step: 1, label: 'Speedup (days/s)' });
controlPane.addBinding(simControls, 'rotateCam');
controlPane.addBinding(simControls, 'showOrbitPaths', { label: 'Show Orbit Paths' });
controlPane.addBinding(simControls, 'anchorTo', { options: celestialBodiesOptions, label: 'Anchor To' });

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
    // Ignore the Sun
    if (body.name == "Sun") {
      body.mesh.rotation.y = (simControls.simTime / 2) * Math.PI * 2;
    }
    if (body.name != "Sun") {
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
    }
  });

  // Toggle orbit paths visibility
  orbitPaths.forEach(path => {
    path.visible = simControls.showOrbitPaths;
  });

  // Update controls target to the selected body
  if (simControls.anchorTo) {
    if (simControls.anchorTo === 'Sun') {
      controls.target.copy(sun.position);
    } else {
      const selectedBody = celestialBodies.find(body => body.mesh.name === simControls.anchorTo);
      if (selectedBody) {
        controls.target.copy(selectedBody.group.position);
      }
    }
  }

  controls.autoRotate = simControls.rotateCam;
  controls.update();
  stats.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
