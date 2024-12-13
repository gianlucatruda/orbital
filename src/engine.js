import * as THREE from "three";
const G = 6.67430e-11; // gravitational constant in m^3 kg^-1 s^-2

import { degToRad, radToDeg } from "three/src/math/MathUtils";

/**
 * Calculates the position and velocity vectors at a given time for specified orbital elements.
 *
 * @param {Object} orbitalElements - The orbital elements of the body.
 * @param {number} deltaDays - Time in days since epoch.
 * @param {number} centralMass - Mass of the central body in kg.
 * @returns {Object} - Position and velocity vectors (in meters and m/s).
 */
export function calculateOrbitAtTime(orbitalElements, deltaDays, centralMass) {
  const deltaSecs = deltaDays * 86400; // seconds since epoch
  const { e, a, i, omega, w, L0 } = orbitalElements; // a in km, angles in degrees

  // Convert degrees to radians
  const i_rad = degToRad(i);
  const omega_rad = degToRad(omega);
  const w_rad = degToRad(w);
  const L0_rad = degToRad(L0);

  // Convert semi-major axis to meters
  const a_m = a * 1000; // meters

  // Standard gravitational parameter μ = G * M
  const mu = G * centralMass; // m^3 s^-2

  // Compute mean motion n = sqrt(mu / a^3)
  const n = Math.sqrt(mu / Math.pow(a_m, 3)); // rad/s

  // Compute mean anomaly at epoch M0 = L0 - omega - w
  let M0 = L0_rad - omega_rad - w_rad; // radians

  // Normalize M0 between 0 and 2π
  M0 = ((M0 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Compute mean anomaly at time t: M = M0 + n * delta_t
  let M = M0 + n * deltaSecs; // radians

  // Normalize M between 0 and 2π
  M = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Solve Kepler's Equation for Eccentric Anomaly E using Newton-Raphson method
  let E = M;
  const maxIter = 100;
  const tolerance = 1e-8;
  let iter = 0;
  let deltaE = 1;

  while (Math.abs(deltaE) > tolerance && iter < maxIter) {
    deltaE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
    E += deltaE;
    iter++;
  }

  // Compute true anomaly ν
  const cos_E = Math.cos(E);
  const sin_E = Math.sin(E);
  const sqrt_1_minus_e2 = Math.sqrt(1 - e * e);
  const sin_nu = (sqrt_1_minus_e2 * sin_E) / (1 - e * cos_E);
  const cos_nu = (cos_E - e) / (1 - e * cos_E);
  const nu = Math.atan2(sin_nu, cos_nu); // radians

  // Compute distance r
  const r = a_m * (1 - e * cos_E); // meters

  // Position in perifocal coordinate system
  const x_pf = r * cos_nu;
  const y_pf = r * sin_nu;
  const z_pf = 0;

  // Compute specific angular momentum h
  const h = Math.sqrt(mu * a_m * (1 - e * e));

  // Compute velocity in perifocal coordinate system
  const v_pf_x = (mu / h) * (-sin_nu);
  const v_pf_y = (mu / h) * (e + cos_nu);
  const v_pf_z = 0;

  // Rotation matrices
  const cos_omega = Math.cos(omega_rad);
  const sin_omega = Math.sin(omega_rad);
  const cos_i = Math.cos(i_rad);
  const sin_i = Math.sin(i_rad);
  const cos_w = Math.cos(w_rad);
  const sin_w = Math.sin(w_rad);

  // Rotation matrix from perifocal to ECI frame
  const R = new THREE.Matrix3();
  R.set(
    cos_omega * cos_w - sin_omega * sin_w * cos_i, // R11
    -cos_omega * sin_w - sin_omega * cos_w * cos_i, // R12
    sin_omega * sin_i, // R13

    sin_omega * cos_w + cos_omega * sin_w * cos_i, // R21
    -sin_omega * sin_w + cos_omega * cos_w * cos_i, // R22
    -cos_omega * sin_i, // R23

    sin_w * sin_i, // R31
    cos_w * sin_i, // R32
    cos_i // R33
  );

  // Position vector in ECI frame
  const r_pf = new THREE.Vector3(x_pf, y_pf, z_pf);
  const position = r_pf.applyMatrix3(R); // meters

  // Velocity vector in ECI frame
  const v_pf = new THREE.Vector3(v_pf_x, v_pf_y, v_pf_z);
  const velocity = v_pf.applyMatrix3(R); // meters per second

  return {
    position: position,
    velocity: velocity,
  };
}

/**
 * Calculates the orbital elements from position and velocity vectors.
 *
 * @param {THREE.Vector3} relativePos - Position vector in meters.
 * @param {THREE.Vector3} relativeVel - Velocity vector in meters per second.
 * @param {number} centralMass - Mass of the central body in kg.
 * @param {number} deltaDays - Time in days since epoch.
 * @returns {Object} - Orbital elements.
 */
export function calculateElements(relativePos, relativeVel, centralMass, deltaDays = 0) {
  const mu = G * centralMass;
  const deltaSecs = deltaDays * 86400; // seconds since epoch

  const r_vec = relativePos.clone(); // meters
  const v_vec = relativeVel.clone(); // m/s
  const r = r_vec.length(); // meters
  const v = v_vec.length(); // m/s

  // Specific angular momentum vector
  const h_vec = new THREE.Vector3().crossVectors(r_vec, v_vec);
  const h = h_vec.length();

  // Eccentricity vector
  const e_vec = v_vec
    .clone()
    .cross(h_vec)
    .divideScalar(mu)
    .sub(r_vec.clone().divideScalar(r));
  const e = e_vec.length();

  // Node vector
  const k_vec = new THREE.Vector3(0, 0, 1);
  const N_vec = new THREE.Vector3().crossVectors(k_vec, h_vec);
  const N = N_vec.length();

  // Semi-major axis
  const energy = (v * v) / 2 - mu / r;
  const a = -mu / (2 * energy); // meters

  // Inclination
  const i_rad = Math.acos(h_vec.z / h);

  // Longitude of ascending node
  let omega_rad = Math.acos(N_vec.x / N);
  if (N_vec.y < 0) {
    omega_rad = 2 * Math.PI - omega_rad;
  }

  // Argument of periapsis
  let w_rad = Math.acos(N_vec.dot(e_vec) / (N * e));
  if (e_vec.z < 0) {
    w_rad = 2 * Math.PI - w_rad;
  }

  // True anomaly
  let nu_rad = Math.acos(e_vec.dot(r_vec) / (e * r));
  if (r_vec.dot(v_vec) < 0) {
    nu_rad = 2 * Math.PI - nu_rad;
  }

  // Eccentric anomaly
  const cos_E = (e + Math.cos(nu_rad)) / (1 + e * Math.cos(nu_rad));
  const sin_E = (Math.sqrt(1 - e * e) * Math.sin(nu_rad)) / (1 + e * Math.cos(nu_rad));
  const E = Math.atan2(sin_E, cos_E);

  // Mean anomaly at time t
  const M = E - e * Math.sin(E);

  // Mean motion
  const n = Math.sqrt(mu / Math.pow(a, 3)); // rad/s

  // Mean anomaly at epoch
  const M0 = M - n * deltaSecs;

  // Mean longitude at epoch
  const L0_rad = M0 + w_rad + omega_rad;

  // Normalize angles
  const normalizeAngle = (angle) => ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Convert radians to degrees
  const i_deg = radToDeg(normalizeAngle(i_rad));
  const omega_deg = radToDeg(normalizeAngle(omega_rad));
  const w_deg = radToDeg(normalizeAngle(w_rad));
  const L0_deg = radToDeg(normalizeAngle(L0_rad));

  // Orbital period
  const period = (2 * Math.PI) / n / 86400; // days

  return {
    e: e,
    a: a / 1000, // km
    i: i_deg, // degrees
    omega: omega_deg, // degrees
    w: w_deg, // degrees
    L0: L0_deg, // degrees
    period: period, // days
  };
}

/**
 * Tests the orbital calculations by comparing initial and computed orbital elements.
 */
export function testOrbitCalcs() {
  const sunMass = 1.98847e30; // kg

  // Test with Earth's orbital elements
  const earthElements = {
    e: 0.0167086,
    a: 149597870.7, // km
    i: 0.00005, // degrees
    omega: -11.26064, // degrees
    w: 102.94719, // degrees
    L0: 100.46435, // degrees
  };

  const time = 180; // days since epoch
  const { position, velocity } = calculateOrbitAtTime(earthElements, time, sunMass);
  const computedElements = calculateElements(position, velocity, sunMass, time);

  console.log("Initial Orbital Elements:");
  console.log(earthElements);
  console.log("\nComputed Orbital Elements:");
  console.log(computedElements);

  console.log("\nComparison:");
  for (const key in earthElements) {
    const initial = earthElements[key];
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
      `${key}: initial=${initial}, computed=${computed.toFixed(
        6
      )}, error=${error.toFixed(6)}%`
    );
  }
}

// Run the test function
testOrbitCalcs();
