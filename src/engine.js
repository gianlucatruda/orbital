import * as THREE from 'three';
import { degToRad } from "three/src/math/MathUtils";

// Function to calculate the position from mean anomaly
export function calculatePositionFromMeanAnomaly(orbitalElements, time) {
  const { a, e, i, omega, w, L0, period } = orbitalElements;

  const n = 360 / period; // Mean motion (degrees per day)
  const M_deg = L0 + n * time; // Mean anomaly
  const M_rad = degToRad(M_deg % 360);

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
  const cosOmega = Math.cos(degToRad(omega));
  const sinOmega = Math.sin(degToRad(omega));
  const cosI = Math.cos(degToRad(i));
  const sinI = Math.sin(degToRad(i));
  const cosW = Math.cos(degToRad(w));
  const sinW = Math.sin(degToRad(w));

  const x =
    x_orb *
    (cosOmega * cosW - sinOmega * sinW * cosI) -
    y_orb * (cosOmega * sinW + sinOmega * cosW * cosI);
  const y = x_orb * (sinOmega * cosW + cosOmega * sinW * cosI) -
    y_orb * (sinOmega * sinW - cosOmega * cosW * cosI);
  const z =
    x_orb * (sinW * sinI) + y_orb * (cosW * sinI);

  return new THREE.Vector3(y, z, x); // Note: Swapped y and z for correct orientation
}
