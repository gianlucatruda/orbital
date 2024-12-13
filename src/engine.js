import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";

const G = 6.67430e-11; // gravitational constant in m^3 kg^-1 s^-2

export function calculateOrbitAtTime(orbitalElements, time) {
  const { a, e, i, omega, w, L0, period } = orbitalElements;

  const n = 360 / period; // Mean motion (degrees per day)
  const M_deg = (L0 + n * time) % 360; // Mean anomaly in degrees
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

  // Calculate velocity TODO units? Why so small?
  const meanMotion = Math.sqrt(G / Math.pow(a, 3));
  let vx_orb = -meanMotion * a * Math.sin(E) / (1 - e * Math.cos(E));
  let vy_orb = meanMotion * a * Math.sqrt(1 - Math.pow(e, 2)) / (1 - e * Math.cos(E));

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

export function calculateElements(relativePos, relativeVel, parentMass) {

  const MU = G * parentMass;
  // Assume position in meters and velocity in meters per second

  // Calculate the specific angular momentum vector (h = r x v)
  const h = new THREE.Vector3().crossVectors(relativePos, relativeVel);

  // Calculate the magnitude of the specific angular momentum
  const hMag = h.length();

  // Compute the node vector (N = k x h), where k is the unit vector along Z-axis
  const k = new THREE.Vector3(0, 0, 1);
  const N = new THREE.Vector3().crossVectors(k, h);

  // Calculate the magnitude of the node vector
  const nMag = N.length();

  // Calculate the eccentricity vector (e = (v x h)/μ - r̂)
  const rMag = relativePos.length();
  const vMag = relativeVel.length();

  const rHat = relativePos.clone().normalize();
  const eVector = relativeVel
    .clone()
    .cross(h)
    .divideScalar(MU)
    .sub(rHat);

  const e = eVector.length(); // Eccentricity

  // Specific mechanical energy (ε)
  const energy = (vMag ** 2) / 2 - MU / rMag;

  // Semi-major axis (a)
  const a = -MU / (2 * energy);

  // Inclination (i)
  const i = Math.acos(h.z / hMag);

  // Longitude of ascending node (omega)
  let omega = Math.acos(N.x / nMag);
  if (N.y < 0) omega = 2 * Math.PI - omega;

  // Argument of periapsis (w)
  let w = Math.acos(N.dot(eVector) / (nMag * e));
  if (eVector.z < 0) w = 2 * Math.PI - w;

  // True anomaly (nu)
  let nu = Math.acos(eVector.dot(rHat) / e);
  if (relativePos.dot(relativeVel) < 0) nu = 2 * Math.PI - nu;

  // Mean anomaly (M)
  const E = Math.atan2(
    Math.sqrt(1 - e ** 2) * Math.sin(nu),
    e + Math.cos(nu),
  ); // Eccentric anomaly
  const M = E - e * Math.sin(E);

  // Orbital period (period)
  const period = 2 * Math.PI * Math.sqrt(a ** 3 / MU) / (60 * 60 * 24);

  // Mean longitude at epoch (L0)
  const L0 = (omega + w + parentMass) % (2 * Math.PI);

  // Convert radians to degrees
  const radToDeg = (rad) => THREE.MathUtils.radToDeg(rad);

  return {
    e: e, // Eccentricity
    a: a, // Semi-major axis in km
    i: radToDeg(i), // Inclination in degrees
    omega: radToDeg(omega), // Longitude of ascending node in degrees
    w: radToDeg(w), // Argument of periapsis in degrees
    L0: radToDeg(L0), // Mean longitude at epoch in degrees
    period: period, // Orbital period in days
  };
}

export function testOrbitCalcs() {

  // Basic test logic: 
  // calculateElements(calculateOrbitAtTime(elements, t)) == elements
  // calculateOrbitAtTime(calculateElements(position, velocity), t) == position, velocity
  const elements = {
    e: 0.1,
    a: 1,
    i: 0.1,
    omega: 0.1,
    w: 0.1,
    L0: 0.1,
    period: 100,
  };

  const earthMass = 5.972e24;
  const t = 0;
  let {position, velocity} = calculateOrbitAtTime(elements, t);
  const elements2 = calculateElements(position, velocity, earthMass);
  console.log(elements2);

  // const position2 = calculateOrbitAtTime(elements2, t);
  // const velocity2 = calculateOrbitAtTime(elements2, t);
  //
  // console.log(position2);
  // console.log(velocity2);

}
