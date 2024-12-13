import * as THREE from "three";
const G = 6.67430e-11; // Gravitational constant in m^3 kg^-1 s^-2

import { degToRad, radToDeg } from "three/src/math/MathUtils";

/**
 * Clamp function to ensure values are within valid ranges for trigonometric functions.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the position and velocity vectors at a given time for specified orbital elements.
 *
 * @param {Object} orbitalElements - The orbital elements of the body.
 * @param {number} deltaDays - Time in days since epoch.
 * @param {number} centralMass - Mass of the central body in kg.
 * @returns {Object} - Position and velocity vectors (in km and km/s).
 */
export function calculateOrbitAtTime(orbitalElements, deltaDays, centralMass) {
  const {
    e,       // Eccentricity
    a,       // Semi-major axis in km
    i,       // Inclination in degrees
    omega,   // Longitude of ascending node in degrees
    w,       // Argument of periapsis in degrees
    L0,      // Mean longitude at epoch in degrees
    period, // Orbital period in days
  } = orbitalElements;

  const n = 360 / period; // Mean motion (degrees per day)
  const M_deg = (L0 + n * deltaDays) % 360; // Mean anomaly in degrees
  const M_rad = degToRad(M_deg);

  // Solve Kepler's Equation for Eccentric Anomaly using Newton-Raphson method
  let E = M_rad;
  for (let j = 0; j < 5; j++) {
    E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
  }

  // True anomaly
  const nu =
    2 *
    Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2),
    );
  // TODO should this be multiplied by tan(E/2) ?

  // Distance from the central body (in km)
  const r = a * (1 - e * Math.cos(E));

  // Heliocentric coordinates in the orbital plane
  const x_orb = r * Math.cos(nu);
  const y_orb = r * Math.sin(nu);

  // Convert to 3D coordinates
  const cosOmega = Math.cos(degToRad(omega));
  const sinOmega = Math.sin(degToRad(omega));
  const cosI = Math.cos(degToRad(i));
  const sinI = Math.sin(degToRad(i));
  const cosW = Math.cos(degToRad(w));
  const sinW = Math.sin(degToRad(w));

  // Transformation from orbital plane to ecliptic coordinates
  const x =
    x_orb * (cosOmega * cosW - sinOmega * sinW * cosI) -
    y_orb * (cosOmega * sinW + sinOmega * cosW * cosI);
  const y =
    x_orb * (sinOmega * cosW + cosOmega * sinW * cosI) -
    y_orb * (sinOmega * sinW - cosOmega * cosW * cosI);
  const z = x_orb * (sinW * sinI) + y_orb * (cosW * sinI);

  // Calculate velocity in km/s
  const mu = G * centralMass / 1e9; // Gravitational parameter in km^3/s^2
  const meanMotion = Math.sqrt(mu / Math.pow(a, 3));
  let vx_orb = -meanMotion * a * Math.sin(E);
  let vy_orb = meanMotion * a * Math.sqrt(1 - Math.pow(e, 2)) * Math.cos(E);

  // Transformation from orbital plane to ecliptic coordinates
  const vx =
    vx_orb * (cosOmega * cosW - sinOmega * sinW * cosI) -
    vy_orb * (cosOmega * sinW + sinOmega * cosW * cosI);
  const vy =
    vx_orb * (sinOmega * cosW + cosOmega * sinW * cosI) -
    vy_orb * (sinOmega * sinW - cosOmega * cosW * cosI);
  const vz = vx_orb * (sinW * sinI) + vy_orb * (cosW * sinI);

  // Note: Swapped order for correct orientation in Three.js
  return {
    position: new THREE.Vector3(y, z, x),
    velocity: new THREE.Vector3(vy, vz, vx),
  };
}

/**
 * Calculates the orbital elements from position and velocity vectors.
 *
 * @param {THREE.Vector3} relativePos - Position vector in km.
 * @param {THREE.Vector3} relativeVel - Velocity vector in km/s.
 * @param {number} centralMass - Mass of the central body in kg.
 * @param {number} deltaDays - Time in days since epoch.
 * @returns {Object} - Orbital elements.
 */
export function calculateElements(relativePos, relativeVel, centralMass, deltaDays = 0) {
  const mu = G * centralMass; // Gravitational parameter in m^3/s^2

  // Convert position and velocity to meters and m/s
  let r_vec = relativePos.clone().multiplyScalar(1000); // km to m
  let v_vec = relativeVel.clone().multiplyScalar(1000); // km/s to m/s

  // NB! Re-order THREE.js vector order to conventional ordering for calculations
  r_vec = new THREE.Vector3(r_vec.z, r_vec.x, r_vec.y);
  v_vec = new THREE.Vector3(v_vec.z, v_vec.x, v_vec.y);

  const r = r_vec.length();
  const v = v_vec.length();

  // Specific angular momentum (vector)
  const h_vec = new THREE.Vector3().crossVectors(r_vec, v_vec);
  const h = h_vec.length();

  // Node vector
  const n_vec = new THREE.Vector3(-h_vec.y, h_vec.x, 0);
  const n = n_vec.length();

  // Eccentricity vector
  const e_vec = v_vec.clone().cross(h_vec).divideScalar(mu).sub(r_vec.clone().divideScalar(r));
  const e = e_vec.length();

  // Semi-major axis (a)
  const energy = (v * v) / 2 - mu / r;
  const a = -mu / (2 * energy) / 1000; // Convert back to km

  // Inclination (i)
  const i_rad = Math.acos(clamp(h_vec.z / h, -1, 1));
  const i_deg = radToDeg(i_rad);

  // Longitude of ascending node (omega)
  let omega_rad;
  if (n > 1e-8) {
    omega_rad = Math.acos(clamp(n_vec.x / n, -1, 1));
    if (n_vec.y < 0) {
      omega_rad = 2 * Math.PI - omega_rad;
    }
  } else {
    // Equatorial orbit
    omega_rad = 0;
  }
  const omega_deg = radToDeg(omega_rad);

  // Argument of periapsis (w)
  let w_rad;
  if (e > 1e-8 && n > 1e-8) {
    w_rad = Math.acos(clamp(n_vec.dot(e_vec) / (n * e), -1, 1));
    if (e_vec.z < 0) {
      w_rad = 2 * Math.PI - w_rad;
    }
  } else {
    // Circular orbit or equatorial orbit
    w_rad = 0;
  }
  const w_deg = radToDeg(w_rad);

  // True anomaly (nu)
  let nu_rad;
  if (e > 1e-8) {
    nu_rad = Math.acos(clamp(e_vec.dot(r_vec) / (e * r), -1, 1));
    if (r_vec.dot(v_vec) < 0) {
      nu_rad = 2 * Math.PI - nu_rad;
    }
  } else {
    // Circular orbit
    nu_rad = Math.acos(clamp(r_vec.x / r, -1, 1));
    if (r_vec.y < 0) {
      nu_rad = 2 * Math.PI - nu_rad;
    }
  }
  const nu_deg = radToDeg(nu_rad);

  // Eccentric anomaly (E)
  let E;
  if (e < 1e-8) {
    E = Math.atan2(r_vec.dot(v_vec) / Math.sqrt(mu * a * 1000), 1 - r / (a * 1000));
  } else {
    E = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(nu_rad), e + Math.cos(nu_rad));
  }

  // Mean anomaly (M)
  const M = E - e * Math.sin(E);

  // Mean motion (rad/s)
  const n_ang = Math.sqrt(mu / Math.pow(a * 1000, 3)); // a in km converted to meters

  // Time in seconds since epoch
  const deltaTime = deltaDays * 86400; // Convert days to seconds

  // Mean anomaly at epoch (M0)
  let M0 = M - n_ang * deltaTime;
  M0 = (M0 + 2 * Math.PI) % (2 * Math.PI); // Ensure M0 is between 0 and 2π

  // Mean longitude at epoch (L0)
  const L0_rad = (M0 + omega_rad + w_rad) % (2 * Math.PI);
  const L0_deg = radToDeg(L0_rad);

  // Orbital period
  const period = (2 * Math.PI) / n_ang / 86400; // In days

  return {
    e: e,
    a: a,                   // km
    i: i_deg,               // degrees
    omega: omega_deg % 360, // degrees
    w: w_deg % 360,         // degrees
    L0: L0_deg % 360,       // degrees
    period: period,         // days
  };
}

/**
 * Tests the orbital calculations by comparing initial and computed orbital elements.
 */
export function testOrbitCalcs() {
  const earthMass = 5.97237e24; // kg

  // Test with ISS's orbital elements
  const issElements = {
    e: 0.000167,
    a: 6771, // km
    i: 51.64,     // degrees
    omega: 0.1, // degrees
    w: 0.1,     // degrees
    L0: 0.1,    // degrees
    period: 0.066,  // days
  };

  const time = 180; // days since epoch
  const { position, velocity } = calculateOrbitAtTime(issElements, time, earthMass);
  const computedElements = calculateElements(position, velocity, earthMass, time);

  console.log("Initial Orbital Elements:");
  console.log(issElements);
  console.log("\nRe-computed Orbital Elements:");
  console.log(computedElements);
  console.log("\nComputed position, velocity");
  console.log({position, velocity});
  let pd = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2) + Math.pow(position.z, 2));
  console.log("P abs. (km)", pd);
  let vd = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));
  console.log("V abs. (km/s)", vd);


  console.log("\nComparison:");
  for (const key in issElements) {
    const initial = issElements[key];
    const computed = computedElements[key];
    let error;
    if (typeof initial === "number" && typeof computed === "number") {
      if (key === "omega" || key === "w" || key === "L0") {
        // Adjust for angle wrapping
        const diff = ((computed - initial + 180 + 360) % 360) - 180;
        error = (Math.abs(diff) / 360) * 100;
      } else {
        error = (Math.abs(computed - initial) / Math.abs(initial)) * 100;
      }
    } else {
      error = "N/A";
    }
    console.log(
      `${key}: initial=${initial}, computed=${computed.toFixed(6)}, error=${error.toFixed(6)}%`
    );
  }
}

testOrbitCalcs();