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
