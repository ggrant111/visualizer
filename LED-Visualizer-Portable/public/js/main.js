// Main application entry point
// This file imports and initializes all modules

import { $, createLogger, drawFitted } from "./utils.js";
import { getPaletteColor, colorPalettes } from "./colorPalettes.js";
import { AudioManager } from "./audioManager.js";
import { renderAudioVisualizer } from "./audioVisualizers.js";
import { renderEffect } from "./effectVisualizers.js";
import { initDevices, renderDevicesUI, addDevice, connectDevice, getDevices } from "./deviceManager.js";
import { config } from "./config.js";

// Initialize canvas and context
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const log = createLogger("log");

// Application state
const appState = {
  type: "effect",
  effectStyle: "plasma",
  effectParams: { ...config.effectParams },
  audioEffectParams: { ...config.audioEffectParams },
  audio: {
    style: config.audio.style,
    smoothing: config.audio.smoothing,
    fftSize: config.audio.fftSize,
    sensitivity: config.audio.sensitivity,
    palette: config.audio.palette,
    shockwaves: [],
    particles: [],
  },
  video: { el: null, fit: "contain" },
  lottie: { anim: null, canvas: document.createElement("canvas"), ctx: null },
};

// Initialize audio manager
const audioManager = new AudioManager({
  fftSize: appState.audio.fftSize,
  smoothing: appState.audio.smoothing,
  sensitivity: appState.audio.sensitivity,
});

// Initialize devices
let devices = initDevices();

// Export functions for use in HTML event handlers
window.app = {
  state: appState,
  audioManager,
  devices,
  log,
  canvas,
  ctx,
  getPaletteColor,
  renderAudioVisualizer,
  renderEffect,
  drawFitted,
  addDevice: (name, host, port) => {
    const dev = addDevice(name, host, port);
    devices = getDevices();
    renderDevicesUI(log, () => {
      // Callback after device update
    });
    return dev;
  },
  connectDevice: (dev) => connectDevice(dev, log),
  renderDevicesUI: () => renderDevicesUI(log, () => {}),
};

// Initialize devices UI
renderDevicesUI(log, () => {});

log("Application initialized. Modules loaded.");

