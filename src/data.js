export const planetsData = [
  {
    name: "Mercury",
    radius: 0.5,
    texture: "mercury",
    axialTilt: 0.034,
    rotationPeriod: 58.646,
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
    name: "Venus",
    radius: 0.8,
    texture: "venus",
    axialTilt: 180 - 177.36,
    rotationPeriod: -243.025, // Negative for retrograde rotation
    orbitalElements: {
      a: 15,
      e: 0.0067,
      i: 3.39,
      omega: 76.68,
      w: 54.884,
      L0: 181.979,
      period: 224.701,
    },
    moons: [],
  },
  {
    name: "Earth",
    radius: 1,
    texture: "earth",
    axialTilt: 23.44,
    rotationPeriod: 1.0,
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
        name: "Moon",
        radius: 0.3,
        texture: "moon",
        axialTilt: 6.68,
        rotationPeriod: 27.322,
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
    name: "Mars",
    radius: 0.7,
    texture: "mars",
    axialTilt: 25.19,
    rotationPeriod: 1.025,
    orbitalElements: {
      a: 25,
      e: 0.0934,
      i: 1.85,
      omega: 49.558,
      w: 286.502,
      L0: 355.453,
      period: 686.98,
    },
    moons: [],
  },
];
