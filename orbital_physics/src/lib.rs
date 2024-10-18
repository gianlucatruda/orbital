use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-orbital-physics");
}

// use std::f64::consts::PI;
// use wasm_bindgen::prelude::*;
//
// #[wasm_bindgen]
// #[derive(Clone, Copy)]
// pub struct OrbitalElements {
//     pub a: f64,      // Semi-major axis
//     pub e: f64,      // Eccentricity
//     pub i: f64,      // Inclination in degrees
//     pub omega: f64,  // Longitude of ascending node
//     pub w: f64,      // Argument of periapsis
//     pub l0: f64,     // Mean longitude at epoch
//     pub period: f64, // Orbital period in Earth days
// }
//
// #[wasm_bindgen]
// #[derive(Clone, Copy)]
// pub struct CelestialBody {
//     // pub name: String,
//     pub orbital_elements: OrbitalElements,
//     pub rotation_period: f64,
// }
//
// fn deg_to_rad(degrees: f64) -> f64 {
//     degrees * PI / 180.0
// }
//
// #[wasm_bindgen]
// pub fn calculate_position_from_mean_anomaly(
//     orbital_elements: &OrbitalElements,
//     time: f64,
// ) -> Vec<f64> {
//     let OrbitalElements {
//         a,
//         e,
//         i,
//         omega,
//         w,
//         l0,
//         period,
//     } = orbital_elements;
//
//     let n = 360.0 / period; // Mean motion (degrees per day)
//     let m_deg = l0 + n * time; // Mean anomaly
//     let m_rad = deg_to_rad(m_deg % 360.0);
//
//     // Solve Kepler's Equation for Eccentric Anomaly using Newton-Raphson method
//     let mut e_anomaly = m_rad;
//     for _ in 0..5 {
//         e_anomaly =
//             e_anomaly - (e_anomaly - e * e_anomaly.sin() - m_rad) / (1.0 - e * e_anomaly.cos());
//     }
//
//     // True anomaly
//     let nu = 2.0
//         * ((1.0 + e).sqrt() * (e_anomaly / 2.0).sin())
//             .atan2((1.0 - e).sqrt() * (e_anomaly / 2.0).cos());
//
//     // Distance from the central body
//     let r = a * (1.0 - e * e_anomaly.cos());
//
//     // Heliocentric coordinates in the orbital plane
//     let x_orb = r * nu.cos();
//     let y_orb = r * nu.sin();
//
//     // Convert to 3D coordinates
//     let cos_omega = deg_to_rad(*omega).cos();
//     let sin_omega = deg_to_rad(*omega).sin();
//     let cos_i = deg_to_rad(*i).cos();
//     let sin_i = deg_to_rad(*i).sin();
//     let cos_w = deg_to_rad(*w).cos();
//     let sin_w = deg_to_rad(*w).sin();
//
//     let x = x_orb * (cos_omega * cos_w - sin_omega * sin_w * cos_i)
//         - y_orb * (cos_omega * sin_w + sin_omega * cos_w * cos_i);
//     let y = x_orb * (sin_omega * cos_w + cos_omega * sin_w * cos_i)
//         - y_orb * (sin_omega * sin_w - cos_omega * cos_w * cos_i);
//     let z = x_orb * (sin_w * sin_i) + y_orb * (cos_w * sin_i);
//
//     // Swapped y and z for correct orientation
//     vec![y, z, x]
// }
//
// #[wasm_bindgen]
// pub fn generate_orbit_path(orbital_elements: &OrbitalElements, steps: usize) -> Vec<f64> {
//     let mut positions = Vec::with_capacity(steps * 3);
//     for step in 0..steps {
//         let time = (step as f64 / steps as f64) * orbital_elements.period;
//         let pos = calculate_position_from_mean_anomaly(orbital_elements, time);
//         positions.extend_from_slice(&pos);
//     }
//     positions
// }
//
// #[cfg(test)]
// mod tests {
//     use super::*;
//
//     #[test]
//     fn test_deg_to_rad() {
//         assert_eq!(deg_to_rad(90.0), PI / 2.0);
//         assert_eq!(deg_to_rad(0.0), 0.0);
//         assert_eq!(deg_to_rad(180.0), PI);
//         assert_eq!(deg_to_rad(720.0), PI * 4.0);
//     }
// }
