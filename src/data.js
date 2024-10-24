export const planetsData = [
  {
    name: "Sun",
    mass: 1.989e30, // Mass in kg
    diameter: 1391400, // Diameter in km
    density: 1408, // Density in kg/m^3
    gravity: 274, // Gravity in m/s^2
    escapeVelocity: 617.7, // Escape velocity in km/s
    rotationPeriod: 609.12, // Rotation period in hours
    lengthOfDay: null, // Length of day is not applicable
    obliquityToOrbit: 7.25, // Axial tilt in degrees
    orbitalElements: null, // Orbital elements are not applicable
    satellites: [
      {
        name: "Mercury",
        mass: 3.3011e23, // Mass in kg
        diameter: 4879.4, // Diameter in km
        density: 5427, // Density in kg/m^3
        gravity: 3.7, // Gravity in m/s^2
        escapeVelocity: 4.25, // Escape velocity in km/s
        rotationPeriod: 1407.6, // Rotation period in hours
        lengthOfDay: 4222.6, // Length of day in hours
        obliquityToOrbit: 0.034, // Axial tilt in degrees
        orbitalElements: {
          e: 0.20563, // Eccentricity
          a: 57909050, // Semi-major axis in km
          i: 7.0049, // Inclination in degrees
          omega: 48.331, // Longitude of ascending node in degrees
          w: 29.124, // Argument of periapsis in degrees
          L0: 252.251, // Mean longitude at epoch (J2000.0) in degrees
          period: 87.969, // Orbital period in Earth days
        },
        satellites: [],
      },
      {
        name: "Venus",
        mass: 4.8675e24, // Mass in kg
        diameter: 12104, // Diameter in km
        density: 5243, // Density in kg/m^3
        gravity: 8.87, // Gravity in m/s^2
        escapeVelocity: 10.36, // Escape velocity in km/s
        rotationPeriod: -5832.5, // Rotation period in hours (retrograde)
        lengthOfDay: 2802.0, // Length of day in hours
        obliquityToOrbit: 177.36, // Axial tilt in degrees
        orbitalElements: {
          e: 0.006772, // Eccentricity
          a: 108208930, // Semi-major axis in km
          i: 3.3946, // Inclination in degrees
          omega: 76.68, // Longitude of ascending node in degrees
          w: 54.884, // Argument of periapsis in degrees
          L0: 181.979, // Mean longitude at epoch (J2000.0) in degrees
          period: 224.701, // Orbital period in Earth days
        },
        satellites: [],
      },
      {
        name: "Earth",
        mass: 5.97237e24, // Mass in kg
        diameter: 12756, // Diameter in km
        density: 5514, // Density in kg/m^3
        gravity: 9.807, // Gravity in m/s^2
        escapeVelocity: 11.186, // Escape velocity in km/s
        rotationPeriod: 23.9345, // Rotation period in hours
        lengthOfDay: 24.0, // Length of day in hours
        obliquityToOrbit: 23.4393, // Axial tilt in degrees
        orbitalElements: {
          e: 0.0167086, // Eccentricity
          a: 149597870, // Semi-major axis in km
          i: 0.0, // Inclination in degrees
          omega: -11.26064, // Longitude of ascending node in degrees
          w: 102.94719, // Argument of periapsis in degrees
          L0: 100.46435, // Mean longitude at epoch (J2000.0) in degrees
          period: 365.256, // Orbital period in Earth days
        },
        satellites: [
          {
            name: "Moon",
            mass: 7.342e22, // Mass in kg
            diameter: 3474.8, // Diameter in km
            density: 3344, // Density in kg/m^3
            gravity: 1.62, // Gravity in m/s^2
            escapeVelocity: 2.38, // Escape velocity in km/s
            rotationPeriod: 655.728, // Rotation period in hours
            lengthOfDay: 708.7, // Length of day in hours
            obliquityToOrbit: 6.68, // Axial tilt in degrees
            orbitalElements: {
              e: 0.0549, // Eccentricity
              a: 384400, // Semi-major axis in km
              i: 5.145, // Inclination in degrees
              omega: -0.05295392, // Longitude of ascending node in degrees
              w: 318.15, // Argument of periapsis in degrees
              L0: 0.0, // Mean longitude at epoch (J2000.0) in degrees
              period: 27.321582, // Orbital period in Earth days
            },
            satellites: [],
          },
          {
            name: "ISS",
            mass: 420000, // Mass in kg
            diameter: 109, // Diameter in meters
            density: null, // Density is not applicable
            gravity: null, // Gravity is not applicable
            escapeVelocity: null, // Escape velocity is not applicable
            rotationPeriod: 0.065, // Rotation period in hours
            lengthOfDay: null, // Length of day is not applicable
            obliquityToOrbit: null, // Axial tilt is not applicable
            orbitalElements: {
              e: 0.000167, // Eccentricity
              a: 6771, // Semi-major axis in km
              i: 51.64, // Inclination in degrees
              omega: 0, // Longitude of ascending node in degrees
              w: 0, // Argument of periapsis in degrees
              L0: 0, // Mean longitude at epoch (J2000.0) in degrees
              period: 0.066, // Orbital period in Earth days
            },
            satellites: [],
          },
        ],
      },
      {
        name: "Mars",
        mass: 6.4171e23, // Mass in kg
        diameter: 6792, // Diameter in km
        density: 3933, // Density in kg/m^3
        gravity: 3.711, // Gravity in m/s^2
        escapeVelocity: 5.03, // Escape velocity in km/s
        rotationPeriod: 24.6229, // Rotation period in hours
        lengthOfDay: 24.6597, // Length of day in hours
        obliquityToOrbit: 25.19, // Axial tilt in degrees
        orbitalElements: {
          e: 0.09341233, // Eccentricity
          a: 227943820, // Semi-major axis in km
          i: 1.85061, // Inclination in degrees
          omega: 49.57854, // Longitude of ascending node in degrees
          w: 286.537, // Argument of periapsis in degrees
          L0: 355.45332, // Mean longitude at epoch (J2000.0) in degrees
          period: 686.971, // Orbital period in Earth days
        },
        satellites: [],
      },
    ],
  },
];
