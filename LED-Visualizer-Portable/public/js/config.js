// Application configuration
export const config = {
  // Default effect parameters
  effectParams: {
    plasma: { speed: 1.0, intensity: 1.0, colorShift: 0 },
    stars: { speed: 1.0, count: 200, brightness: 1.0 },
    waves: { speed: 1.0, frequency: 1.0, colorSpeed: 1.0 },
    kaleidoscope: { speed: 1.0, segments: 12, rotation: 0 },
    spiral: { speed: 1.0, arms: 5, tightness: 1.0 },
    mandala: { speed: 1.0, petals: 8, rotation: 0 },
    hexagons: { speed: 1.0, count: 3, rotation: 0 },
    fan: { speed: 1.0, blades: 4, rotation: 0 },
    bars: {
      speed: 1.0,
      count: 16,
      orientation: "vertical",
      reverse: false,
      mirror: false,
    },
    fullBars: {
      speed: 1.0,
      count: 16,
      orientation: "vertical",
      reverse: false,
      mirror: false,
    },
    scrollingBars: {
      speed: 1.0,
      count: 16,
      orientation: "vertical",
      horizontalSpeed: 1.0,
      verticalSpeed: 1.0,
      reverse: false,
      mirror: false,
    },
  },

  // Default audio effect parameters
  audioEffectParams: {
    audioPlasma: { reactiveness: 2.0, colorShift: 0 },
    audioStars: { reactiveness: 2.0, maxCount: 500 },
    audioWaves: { reactiveness: 3.0, colorSpeed: 1.0 },
    audioSpiral: { reactiveness: 2.0, arms: 5 },
    pulseRings: { shape: "circle", ringCount: 8, rotation: 0, size: 1.0 },
    audioHexagons: { reactiveness: 2.0, count: 3, rotation: 0 },
    audioFan: {
      blades: 4,
      rotationSpeed: 1.0,
      reactiveness: 2.0,
      colorMode: "energy",
    },
    audioBars: {
      count: 16,
      orientation: "vertical",
      reactiveness: 1.0,
      reverse: false,
      mirror: false,
    },
    audioFullBars: {
      count: 16,
      orientation: "vertical",
      reactiveness: 1.0,
      reverse: false,
      mirror: false,
    },
    audioScrollingBars: {
      count: 16,
      orientation: "vertical",
      reactiveness: 1.0,
      horizontalReactiveness: 1.0,
      verticalReactiveness: 1.0,
      reverse: false,
      mirror: false,
    },
  },

  // Audio defaults
  audio: {
    style: "bars",
    smoothing: 0.7,
    fftSize: 1024,
    sensitivity: 1.2,
    palette: "rainbow",
  },

  // Storage keys
  storage: {
    devices: "ledDevicesAudio",
  },
};
