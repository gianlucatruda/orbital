export const planetsData = [
  {
    name: "Sun",
    mass: 1.989e30, // Mass in kg
    diameter: 1391400, // Diameter in km
    density: 1408, // Density in kg/m^3
    rotationPeriod: 609.12, // Rotation period in hours
    lengthOfDay: null, // Length of day in hours
    obliquityToOrbit: 7.25, // Axial tilt in degrees
    orbitalElements: null,
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
        orbitalElements: { // Relative to the ecliptic
          e: 0.20563,
          a: 57909050,
          i: 7.0049,
          omega: 48.331,
          w: 29.124,
          L0: 252.251,
          period: 87.969,
        },
        satellites: [],
      },
      {
        name: "Venus",
        mass: 4.8675e24,
        diameter: 12104,
        density: 5243,
        rotationPeriod: -5832.5, // Rotation period in hours (retrograde)
        lengthOfDay: 2802.0,
        obliquityToOrbit: 177.36,
        orbitalElements: {
          e: 0.006772,
          a: 108208930,
          i: 3.3946,
          omega: 76.68,
          w: 54.884,
          L0: 181.979,
          period: 224.701,
        },
        satellites: [],
      },
      {
        name: "Earth",
        mass: 5.97237e24,
        diameter: 12756,
        density: 5514,
        rotationPeriod: 23.9345,
        lengthOfDay: 24.0,
        obliquityToOrbit: 23.4393,
        orbitalElements: {
          e: 0.0167086,
          a: 149597870,
          i: 0.0,
          omega: -11.26064,
          w: 102.94719,
          L0: 100.46435,
          period: 365.256,
        },
        satellites: [
          {
            name: "Moon",
            mass: 7.342e22,
            diameter: 3474.8,
            density: 3344,
            rotationPeriod: 655.728,
            lengthOfDay: 708.7,
            obliquityToOrbit: 6.68,
            orbitalElements: {
              e: 0.0549,
              a: 384400,
              i: 5.145,
              omega: -0.05295392,
              w: 318.15,
              L0: 0.0,
              period: 27.321582,
            },
            satellites: [
              {
                name: "Apollo 11 Command Module",
                mass: 1200,
                diameter: 100, // Diameter in km TODO
                density: null,
                rotationPeriod: 0,
                lengthOfDay: null,
                obliquityToOrbit: 0,
                orbitalElements: {
                  e: 0.0,
                  a: 3000,
                  i: 0.0,
                  omega: 0,
                  w: 0,
                  L0: 0,
                  period: 0.05,
                },
                satellites: [],
              },
            ],
          },
          {
            name: "ISS",
            mass: 420000,
            diameter: 200, // Diameter in km TODO
            density: null,
            rotationPeriod: 0.065,
            lengthOfDay: null,
            obliquityToOrbit: null,
            orbitalElements: {
              e: 0.000167,
              a: 6771,
              i: 51.64,
              omega: 0,
              w: 0,
              L0: 0,
              period: 0.066,
            },
            satellites: [],
          },
        ],
      },
      {
        name: "Mars",
        mass: 6.4171e23,
        diameter: 6792,
        density: 3933,
        rotationPeriod: 24.6229,
        lengthOfDay: 24.6597,
        obliquityToOrbit: 25.19,
        orbitalElements: {
          e: 0.09341233,
          a: 227943820,
          i: 1.85061,
          omega: 49.57854,
          w: 286.537,
          L0: 355.45332,
          period: 686.971,
        },
        satellites: [],
      },
    ],
  },
];
