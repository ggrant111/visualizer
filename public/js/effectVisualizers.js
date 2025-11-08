// Built-in effect visualizer rendering module
import { hslToRgb } from "./utils.js";
import { getPaletteColor } from "./colorPalettes.js";
import {
  isButterchurnReady,
  initVisualizer as initButterchurnVisualizer,
  loadPreset as loadButterchurnPreset,
  renderButterchurn,
  getPresetNames,
  cleanup as cleanupButterchurn,
  updateVisualizerSettings,
} from "./butterchurnManager.js";

// Helper function to draw a hexagon on canvas context
function drawHexagon(ctx, cx, cy, radius, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + rotation;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Render built-in effect based on style
 * @param {number} t - Time in milliseconds
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} style - Effect style name
 * @param {Object} effectParams - Effect parameters
 * @param {number} audioIntensity - Audio intensity (0-1) for audio-reactive effects
 * @param {string} palette - Color palette name
 * @returns {ImageData} - Rendered image data
 */
// Butterchurn state management
let butterchurnInitialized = false;
let butterchurnWebGLCanvas = null;
let currentButterchurnPreset = null;

export function renderEffect(
  t,
  ctx,
  w,
  h,
  style,
  effectParams,
  audioIntensity = 0,
  palette = "rainbow",
  gradientMode = true
) {
  // Handle butterchurn separately as it uses WebGL
  if (style === "butterchurn") {
    return renderButterchurnEffect(
      t,
      ctx,
      w,
      h,
      effectParams.butterchurn || {},
      audioIntensity
    );
  }

  const img = ctx.createImageData(w, h);
  const d = img.data;

  switch (style) {
    case "plasma":
      renderPlasma(
        d,
        w,
        h,
        t,
        effectParams.plasma || {},
        palette,
        gradientMode
      );
      break;
    case "stars":
      renderStars(d, w, h, t, effectParams.stars || {}, palette, gradientMode);
      break;
    case "waves":
      renderWaves(d, w, h, t, effectParams.waves || {}, palette, gradientMode);
      break;
    case "kaleidoscope":
      renderKaleidoscope(
        d,
        w,
        h,
        t,
        effectParams.kaleidoscope || {},
        palette,
        gradientMode
      );
      break;
    case "spiral":
      renderSpiral(
        d,
        w,
        h,
        t,
        effectParams.spiral || {},
        palette,
        gradientMode
      );
      break;
    case "mandala":
      renderMandala(
        d,
        w,
        h,
        t,
        effectParams.mandala || {},
        palette,
        gradientMode
      );
      break;
    case "hexagons":
      renderHexagons(
        d,
        w,
        h,
        t,
        effectParams.hexagons || {},
        palette,
        gradientMode
      );
      break;
    case "fan":
      renderFan(d, w, h, t, effectParams.fan || {}, palette, gradientMode);
      break;
    case "bars":
      renderBars(d, w, h, t, effectParams.bars || {}, palette, gradientMode);
      break;
    case "fullBars":
      renderFullBars(
        d,
        w,
        h,
        t,
        effectParams.fullBars || {},
        palette,
        gradientMode
      );
      break;
    case "scrollingBars":
      renderScrollingBars(
        d,
        w,
        h,
        t,
        effectParams.scrollingBars || {},
        palette,
        gradientMode
      );
      break;
    default:
      // Default to plasma
      renderPlasma(
        d,
        w,
        h,
        t,
        effectParams.plasma || {},
        palette,
        gradientMode
      );
  }

  ctx.putImageData(img, 0, 0);
  return img;
}

/**
 * Render butterchurn effect (WebGL-based Milkdrop visualizer)
 */
function renderButterchurnEffect(t, ctx, w, h, params, audioIntensity) {
  const p = {
    preset: "",
    blendLength: 2.0,
    cyclePresets: false,
    cycleSeconds: 30,
    speedMultiplier: 0.2,
    meshWidth: 64,
    meshHeight: 48,
    brightness: 1.0,
    saturation: 1.0,
    contrast: 1.0,
    flashReduction: 0.0,
    ...params,
  };

  // Initialize butterchurn if needed (synchronous check)
  if (!butterchurnInitialized) {
    // Check if butterchurn is loaded (will be loaded asynchronously by module)
    if (!isButterchurnReady()) {
      // Fallback to plasma if butterchurn not yet loaded
      const img = ctx.createImageData(w, h);
      const d = img.data;
      renderPlasma(d, w, h, t, {}, "rainbow");
      ctx.putImageData(img, 0, 0);
      return img;
    }

    // Create WebGL canvas for butterchurn
    butterchurnWebGLCanvas = document.createElement("canvas");
    butterchurnWebGLCanvas.width = w;
    butterchurnWebGLCanvas.height = h;
    const initialized = initButterchurnVisualizer(
      butterchurnWebGLCanvas,
      w,
      h,
      {
        meshWidth: p.meshWidth,
        meshHeight: p.meshHeight,
      }
    );
    if (!initialized) {
      butterchurnInitialized = false;
      const img = ctx.createImageData(w, h);
      ctx.putImageData(img, 0, 0);
      return img;
    }
    butterchurnInitialized = true;

    // Load initial preset if provided
    if (p.preset) {
      const loaded = loadButterchurnPreset(p.preset, p.blendLength);
      if (loaded) {
        currentButterchurnPreset = p.preset;
      } else {
        // If preset fails, try to load first available preset
        const presets = getPresetNames();
        if (presets.length > 0) {
          const firstPreset = presets[0];
          if (loadButterchurnPreset(firstPreset, p.blendLength)) {
            currentButterchurnPreset = firstPreset;
            p.preset = firstPreset; // Update params with working preset
          }
        }
      }
    } else {
      // No preset specified, load first available
      const presets = getPresetNames();
      if (presets.length > 0) {
        const firstPreset = presets[0];
        if (loadButterchurnPreset(firstPreset, p.blendLength)) {
          currentButterchurnPreset = firstPreset;
          p.preset = firstPreset; // Update params with working preset
        }
      }
    }
  }

  // Load preset if changed
  if (p.preset && p.preset !== currentButterchurnPreset) {
    const loaded = loadButterchurnPreset(p.preset, p.blendLength);
    if (loaded) {
      currentButterchurnPreset = p.preset;
    }
  }

  // Get audio data if available (optional - butterchurn works without audio)
  let audioData = null;
  let audioDataLeft = null;
  let audioDataRight = null;

  // Render butterchurn to WebGL canvas with parameters
  const rendered = renderButterchurn(
    t,
    w,
    h,
    audioData,
    audioDataLeft,
    audioDataRight,
    {
      speedMultiplier: p.speedMultiplier,
    }
  );

  if (!rendered) {
    const img = ctx.createImageData(w, h);
    ctx.putImageData(img, 0, 0);
    return img;
  }

  // Copy WebGL canvas content to 2D canvas with post-processing
  ctx.clearRect(0, 0, w, h);

  // Apply brightness, saturation, contrast, and flash reduction if needed
  const brightness = p.brightness !== undefined ? p.brightness : 1.0;
  const saturation = p.saturation !== undefined ? p.saturation : 1.0;
  const contrast = p.contrast !== undefined ? p.contrast : 1.0;
  const flashReduction =
    p.flashReduction !== undefined ? p.flashReduction : 0.0;

  // Always process to ensure controls work
  const needsProcessing = true;

  if (needsProcessing) {
    // Create temporary canvas for processing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw WebGL canvas to temp canvas
    tempCtx.drawImage(butterchurnWebGLCanvas, 0, 0);

    // Get image data for processing
    const imageData = tempCtx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Apply filters
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness adjustment
      if (brightness !== 1.0) {
        r = Math.min(255, r * brightness);
        g = Math.min(255, g * brightness);
        b = Math.min(255, b * brightness);
      }

      // Contrast adjustment
      if (contrast !== 1.0) {
        const factor =
          (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }

      // Saturation adjustment
      if (saturation !== 1.0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * saturation;
        g = gray + (g - gray) * saturation;
        b = gray + (b - gray) * saturation;
      }

      // Flash reduction - reduce sudden brightness spikes
      if (flashReduction > 0) {
        const intensity = (r + g + b) / 3;
        const threshold = 200; // Brightness threshold
        if (intensity > threshold) {
          const reduction =
            flashReduction * ((intensity - threshold) / (255 - threshold));
          r = Math.max(0, r - reduction);
          g = Math.max(0, g - reduction);
          b = Math.max(0, b - reduction);
        }
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    // Put processed image data back
    tempCtx.putImageData(imageData, 0, 0);

    // Draw processed canvas to main canvas
    ctx.drawImage(tempCanvas, 0, 0, w, h);
  } else {
    // No processing needed, draw directly
    ctx.drawImage(butterchurnWebGLCanvas, 0, 0, w, h);
  }

  return ctx.getImageData(0, 0, w, h);
}

/**
 * Get available butterchurn presets
 * Returns a Promise that resolves when butterchurn is ready
 * @param {boolean} calmOnly - If true, only return calm presets
 */
export async function getButterchurnPresets(calmOnly = false) {
  // Wait for butterchurn to be ready
  let attempts = 0;
  while (!isButterchurnReady() && attempts < 50) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!isButterchurnReady()) {
    console.warn("Butterchurn not ready after waiting");
    return [];
  }

  return getPresetNames(calmOnly);
}

function renderPlasma(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, intensity: 1.0, colorShift: 0, ...params };
  const t1 = t * 0.001 * p.speed;
  const t2 = t * 0.0007 * p.speed;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const v1 =
        Math.sin(u * 10 * p.intensity + t1 * 3) +
        Math.cos(v * 10 * p.intensity - t1 * 2);
      const v2 = Math.sin(u * 4 + v * 5 + t2 * 5);
      const a = (v1 + v2) * 0.5;
      const i = (y * w + x) * 4;
      // Normalize 'a' to 0-1 range for palette lookup
      const paletteT = ((a + 1) / 2 + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
}

function renderStars(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, count: 200, brightness: 1.0, ...params };
  const starCount = p.count;
  const t1 = t * 0.0005 * p.speed;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  const centerX = w / 2;
  const centerY = h / 2;
  const maxZ = 200;

  for (let s = 0; s < starCount; s++) {
    const seed1 = s * 123.456;
    const seed2 = s * 789.012;
    const seed3 = s * 345.678;

    const baseX = (Math.sin(seed1) * 0.5 + 0.5) * w;
    const baseY = (Math.cos(seed2) * 0.5 + 0.5) * h;
    const baseZ = (Math.sin(seed3) * 0.5 + 0.5) * maxZ + 50;
    const speed = (0.15 + (s % 5) * 0.03) * p.speed;
    const currentZ = (baseZ + t1 * speed * maxZ) % maxZ;

    if (currentZ > 10 && currentZ < maxZ) {
      const scale = 200 / currentZ;
      const px = centerX + (baseX - centerX) * scale;
      const py = centerY + (baseY - centerY) * scale;
      const normalizedZ = currentZ / maxZ;
      const size = Math.max(0.5, (1 - normalizedZ) * 3);
      const brightness = (1 - normalizedZ * 0.7) * p.brightness;

      // Get color from palette based on star position and time
      const paletteT = (s / starCount + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw star trail
      const prevZ = (currentZ - speed * 5) % maxZ;
      if (prevZ > 10 && prevZ < maxZ) {
        const prevScale = 200 / prevZ;
        const prevPx = centerX + (baseX - centerX) * prevScale;
        const prevPy = centerY + (baseY - centerY) * prevScale;
        const dx = px - prevPx;
        const dy = py - prevPy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 100) {
          const steps = Math.floor(dist);
          for (let step = 0; step < steps; step++) {
            const t = step / steps;
            const tx = Math.floor(prevPx + dx * t);
            const ty = Math.floor(prevPy + dy * t);
            if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
              const idx = (ty * w + tx) * 4;
              const trailAlpha = (1 - t) * 0.5 * brightness;
              d[idx] = Math.min(255, d[idx] + rgb[0] * trailAlpha);
              d[idx + 1] = Math.min(255, d[idx + 1] + rgb[1] * trailAlpha);
              d[idx + 2] = Math.min(255, d[idx + 2] + rgb[2] * trailAlpha);
            }
          }
        }
      }

      // Draw star
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const starSize = Math.ceil(size);
        const halfSize = Math.floor(starSize / 2);
        for (let sy = -halfSize; sy <= halfSize; sy++) {
          for (let sx = -halfSize; sx <= halfSize; sx++) {
            const distance = Math.sqrt(sx * sx + sy * sy);
            if (distance <= starSize / 2) {
              const tx = Math.floor(px + sx);
              const ty = Math.floor(py + sy);
              if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
                const idx = (ty * w + tx) * 4;
                const falloff = 1 - distance / (starSize / 2);
                const starBright = brightness * falloff;
                d[idx] = Math.min(255, d[idx] + rgb[0] * starBright);
                d[idx + 1] = Math.min(255, d[idx + 1] + rgb[1] * starBright);
                d[idx + 2] = Math.min(255, d[idx + 2] + rgb[2] * starBright);
              }
            }
          }
        }
      }
    }
  }
}

function renderWaves(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, frequency: 1.0, colorSpeed: 1.0, ...params };
  const t1 = t * 0.001 * p.speed;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const wave1 =
        Math.sin((u * 5 * p.frequency + t1 * 2) * Math.PI * 2) * 0.5 + 0.5;
      const wave2 =
        Math.sin((v * 3 * p.frequency - t1 * 1.5) * Math.PI * 2) * 0.5 + 0.5;
      const wave3 =
        Math.sin(((u + v) * 4 * p.frequency + t1 * 3) * Math.PI * 2) * 0.5 +
        0.5;
      const combined = (wave1 + wave2 + wave3) / 3;
      const i = (y * w + x) * 4;
      const paletteT = (combined + t1 * 0.1 * p.colorSpeed) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
}

function renderKaleidoscope(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, segments: 12, rotation: 0, ...params };
  const t1 = t * 0.0005 * p.speed;
  const segments = p.segments;
  const rotRad = (p.rotation * Math.PI) / 180;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy) / maxR;
      const angle = Math.atan2(dy, dx) + rotRad;
      const segment = Math.floor(
        (angle + Math.PI) / ((Math.PI * 2) / segments)
      );
      const mirroredAngle =
        (segment % 2 === 0 ? angle : -angle) +
        segment * ((Math.PI * 2) / segments);
      const u = Math.cos(mirroredAngle) * r * 0.5 + 0.5;
      const v = Math.sin(mirroredAngle) * r * 0.5 + 0.5;
      const pattern = Math.sin(u * 20 + t1 * 5) * Math.cos(v * 20 + t1 * 3);
      const i = (y * w + x) * 4;
      const paletteT = (pattern * 0.5 + 0.5 + r * 0.5 + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
}

function renderSpiral(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, arms: 5, tightness: 1.0, ...params };
  const t1 = t * 0.001 * p.speed;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = Math.min(centerX, centerY);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy) / maxR;
      const angle = Math.atan2(dy, dx);
      const spiral =
        (angle + Math.PI) / (Math.PI * 2) + r * p.arms * p.tightness + t1 * 2;
      const pattern = Math.sin(spiral * Math.PI * 4) * 0.5 + 0.5;
      const i = (y * w + x) * 4;
      const paletteT = (pattern + r * 0.5 + t1 * 0.05) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
}

function renderMandala(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, petals: 8, rotation: 0, ...params };
  const t1 = t * 0.0003 * p.speed;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = Math.min(centerX, centerY);
  const petals = p.petals;
  const rotRad = (p.rotation * Math.PI) / 180;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy) / maxR;
      const angle = Math.atan2(dy, dx) + rotRad;
      const petalAngle = (angle * petals) % (Math.PI * 2);
      const petal = Math.abs(Math.sin(petalAngle / 2));
      const pattern = Math.sin(r * 20 - t1 * 10) * petal;
      const i = (y * w + x) * 4;
      const paletteT =
        (pattern * 0.5 + 0.5 + angle / (Math.PI * 2) + t1 * 0.05) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
}

function renderHexagons(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, count: 3, rotation: 0, ...params };
  const t1 = t * 0.001 * p.speed;
  const rotation = (p.rotation * Math.PI) / 180;
  const hexCount = p.count || 3;

  const centerX = w / 2;
  const centerY = h / 2;
  // Maximum radius to fill screen (diagonal distance)
  const maxR = Math.sqrt(centerX * centerX + centerY * centerY);

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  // Draw expanding hexagons from center (one at a time, looping)
  for (let i = 0; i < hexCount; i++) {
    // Calculate phase for this hexagon (staggered growth)
    const phase = (t1 * 0.3 + i / hexCount) % 1.5;
    const normalizedPhase = Math.min(1, phase / 1.0); // Grow over 1.0 phase, then fade

    // Calculate current size - starts small, grows to fill screen
    const currentSize = maxR * normalizedPhase;

    // Fade out as it grows beyond screen
    const opacity = Math.max(0, 1 - (phase - 1.0) * 2);

    if (currentSize < 1 || opacity <= 0) continue;

    // Calculate color based on phase and time (similar to plasma/waves)
    const colorPhase = (t1 * 0.1 + i / hexCount + normalizedPhase * 0.5) % 1;
    const color = getPaletteColor(palette, colorPhase, gradientMode);
    const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

    // Draw hexagon by checking if each pixel is inside
    // Use a more accurate hexagon point-in-polygon test
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - centerX;
        const dy = y - centerY;

        // Rotate point around center
        const cosR = Math.cos(-rotation);
        const sinR = Math.sin(-rotation);
        const rx = dx * cosR - dy * sinR;
        const ry = dx * sinR + dy * cosR;

        // Check if point is inside hexagon
        // For a regular hexagon, check distance to nearest edge
        const angle = Math.atan2(ry, rx);
        const dist = Math.sqrt(rx * rx + ry * ry);

        // For a hexagon with radius R (distance to vertex):
        // The distance to a flat edge is R * cos(30°) = R * √3/2
        // We need to find which edge segment this angle is in and calculate distance to that edge

        // Normalize angle and shift so we're measuring from flat edge center
        // Flat edges are at: -90°, -30°, 30°, 90°, 150°, 210° (in standard orientation)
        // Shift by 90° to align with flat edge at top
        let normalizedAngle =
          (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);

        // Find which of the 6 edges (each spans 60°)
        const edgeIndex = Math.floor(normalizedAngle / (Math.PI / 3));
        const angleWithinEdge = normalizedAngle % (Math.PI / 3);

        // Distance from center to flat edge
        const flatRadius = currentSize * Math.cos(Math.PI / 6); // R * √3/2

        // Angle from the center of the current edge (0° at edge center, ±30° at vertices)
        const angleFromEdgeCenter = angleWithinEdge - Math.PI / 6;

        // Distance to edge at this angle: flatRadius / cos(angleFromEdgeCenter)
        const edgeDist = flatRadius / Math.cos(angleFromEdgeCenter);

        // Check if point is inside hexagon
        if (dist <= edgeDist) {
          const idx = (y * w + x) * 4;
          // Blend with existing color (for overlapping hexagons)
          const alpha = opacity;
          d[idx] = Math.min(255, d[idx] * (1 - alpha) + rgb[0] * alpha);
          d[idx + 1] = Math.min(255, d[idx + 1] * (1 - alpha) + rgb[1] * alpha);
          d[idx + 2] = Math.min(255, d[idx + 2] * (1 - alpha) + rgb[2] * alpha);
          d[idx + 3] = 255;
        }
      }
    }

    // Draw hexagon border
    const borderColor = getPaletteColor(
      palette,
      (colorPhase + 0.1) % 1,
      gradientMode
    );
    const borderRgb = hslToRgb(
      borderColor.h / 360,
      borderColor.s / 100,
      Math.min(100, borderColor.l + 10) / 100
    );

    // Draw border by checking points near the edge
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - centerX;
        const dy = y - centerY;

        // Rotate point
        const cosR = Math.cos(-rotation);
        const sinR = Math.sin(-rotation);
        const rx = dx * cosR - dy * sinR;
        const ry = dx * sinR + dy * cosR;

        const angle = Math.atan2(ry, rx);
        const dist = Math.sqrt(rx * rx + ry * ry);

        if (dist < currentSize * 0.95 || dist > currentSize * 1.05) continue;

        let normalizedAngle =
          (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        const angleWithinEdge = normalizedAngle % (Math.PI / 3);
        const flatRadius = currentSize * Math.cos(Math.PI / 6);
        const angleFromEdgeCenter = angleWithinEdge - Math.PI / 6;
        const edgeDist = flatRadius / Math.cos(angleFromEdgeCenter);

        // Check if point is near the edge
        if (Math.abs(dist - edgeDist) < 2) {
          const idx = (y * w + x) * 4;
          const borderAlpha = opacity * 0.8;
          d[idx] = Math.min(
            255,
            d[idx] * (1 - borderAlpha) + borderRgb[0] * borderAlpha
          );
          d[idx + 1] = Math.min(
            255,
            d[idx + 1] * (1 - borderAlpha) + borderRgb[1] * borderAlpha
          );
          d[idx + 2] = Math.min(
            255,
            d[idx + 2] * (1 - borderAlpha) + borderRgb[2] * borderAlpha
          );
          d[idx + 3] = 255;
        }
      }
    }
  }
}

function renderFan(d, w, h, t, params, palette, gradientMode = true) {
  const p = { speed: 1.0, blades: 4, rotation: 0, colorShiftSpeed: 0.1, ...params };
  const t1 = t * 0.001 * p.speed;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
  const blades = Math.max(2, Math.floor(p.blades));
  const rotation = (p.rotation * Math.PI) / 180 + t1 * 0.5;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  // Draw fan blades
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Normalize angle relative to rotation
      let normalizedAngle = (angle - rotation + Math.PI * 2) % (Math.PI * 2);

      // Determine which blade this pixel belongs to
      const bladeIndex = Math.floor((normalizedAngle / (Math.PI * 2)) * blades);
      const bladeAngle = (bladeIndex / blades) * Math.PI * 2;
      const angleInBlade = normalizedAngle - bladeAngle;

      // Check if pixel is within the fan radius
      if (dist <= maxR) {
        // Each blade gets its own unique color from the palette
        // Distribute blades evenly across the palette (0 to 1)
        const basePaletteT = bladeIndex / blades;
        // Add time-based color shift if enabled
        const colorShiftSpeed = p.colorShiftSpeed !== undefined ? p.colorShiftSpeed : 0.1;
        const paletteT = (basePaletteT + t1 * colorShiftSpeed) % 1;
        const color = getPaletteColor(palette, paletteT, gradientMode);

        // Solid color - no brightness variation
        const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
        const idx = (y * w + x) * 4;
        d[idx] = rgb[0];
        d[idx + 1] = rgb[1];
        d[idx + 2] = rgb[2];
        d[idx + 3] = 255;
      }
    }
  }
}

function renderBars(d, w, h, t, params, palette, gradientMode = true) {
  const p = {
    speed: 1.0,
    count: 16,
    orientation: "vertical",
    reverse: false,
    mirror: false,
    ...params,
  };
  const t1 = t * 0.001 * p.speed;
  const count = Math.max(2, Math.floor(p.count));
  const isVertical = p.orientation === "vertical";
  const effectiveCount = p.mirror ? Math.ceil(count / 2) : count;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  if (isVertical) {
    // Vertical bars
    const barWidth = w / count;
    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      const x = i * barWidth;
      const xEnd = (i + 1) * barWidth;

      // Animate bar height with wave pattern
      const phase = (barIndex / count) * Math.PI * 2 + t1 * 2;
      const height = (Math.sin(phase) * 0.5 + 0.5) * h;
      const barHeight = Math.max(1, height);

      // Get color from palette
      const paletteT = (barIndex / count + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw bar (and mirrored version if enabled)
      const drawBar = (xPos, xEndPos) => {
        for (let y = 0; y < h; y++) {
          const yStart = h - barHeight;
          if (y >= yStart) {
            for (
              let x = Math.floor(xPos);
              x < Math.floor(xEndPos) && x < w;
              x++
            ) {
              if (x >= 0) {
                const idx = (y * w + x) * 4;
                // Solid color - no gradient
                d[idx] = rgb[0];
                d[idx + 1] = rgb[1];
                d[idx + 2] = rgb[2];
                d[idx + 3] = 255;
              }
            }
          }
        }
      };

      // Draw original bar
      drawBar(x, xEnd);

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorX = w - xEnd;
        const mirrorXEnd = w - x;
        drawBar(mirrorX, mirrorXEnd);
      }
    }
  } else {
    // Horizontal bars
    const barHeight = h / count;
    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      const y = i * barHeight;
      const yEnd = (i + 1) * barHeight;

      // Animate bar width with wave pattern
      const phase = (barIndex / count) * Math.PI * 2 + t1 * 2;
      const width = (Math.sin(phase) * 0.5 + 0.5) * w;
      const barWidth = Math.max(1, width);

      // Get color from palette
      const paletteT = (barIndex / count + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw bar (and mirrored version if enabled)
      const drawBar = (yPos, yEndPos) => {
        for (let x = 0; x < w; x++) {
          const xStart = (w - barWidth) / 2;
          if (x >= xStart && x < xStart + barWidth) {
            for (
              let y = Math.floor(yPos);
              y < Math.floor(yEndPos) && y < h;
              y++
            ) {
              if (y >= 0) {
                const idx = (y * w + x) * 4;
                // Solid color - no gradient
                d[idx] = rgb[0];
                d[idx + 1] = rgb[1];
                d[idx + 2] = rgb[2];
                d[idx + 3] = 255;
              }
            }
          }
        }
      };

      // Draw original bar
      drawBar(y, yEnd);

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorY = h - yEnd;
        const mirrorYEnd = h - y;
        drawBar(mirrorY, mirrorYEnd);
      }
    }
  }
}

function renderFullBars(d, w, h, t, params, palette, gradientMode = true) {
  const p = {
    speed: 1.0,
    count: 16,
    orientation: "vertical",
    reverse: false,
    mirror: false,
    ...params,
  };
  const t1 = t * 0.001 * p.speed;
  const count = Math.max(2, Math.floor(p.count));
  const isVertical = p.orientation === "vertical";
  const effectiveCount = p.mirror ? Math.ceil(count / 2) : count;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  if (isVertical) {
    // Vertical bars - full height
    const barWidth = w / count;
    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      const x = i * barWidth;
      const xEnd = (i + 1) * barWidth;

      // Animate bar width/intensity with wave pattern
      const phase = (barIndex / count) * Math.PI * 2 + t1 * 2;
      const intensity = Math.sin(phase) * 0.5 + 0.5;
      const currentBarWidth = barWidth * (0.5 + intensity * 0.5);

      // Get color from palette
      const paletteT = (barIndex / count + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw full-height bar
      const barCenterX = x + barWidth / 2;
      const barStartX = barCenterX - currentBarWidth / 2;
      const barEndX = barCenterX + currentBarWidth / 2;

      // Draw bar (and mirrored version if enabled)
      const drawBar = (xPos, xEndPos, centerX) => {
        for (let y = 0; y < h; y++) {
          for (
            let x = Math.floor(xPos);
            x < Math.floor(xEndPos) && x < w;
            x++
          ) {
            if (x >= 0) {
              const idx = (y * w + x) * 4;
              // Solid color - no gradient
              d[idx] = rgb[0];
              d[idx + 1] = rgb[1];
              d[idx + 2] = rgb[2];
              d[idx + 3] = 255;
            }
          }
        }
      };

      // Draw original bar
      drawBar(barStartX, barEndX, barCenterX);

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorCenterX = w - barCenterX;
        const mirrorStartX = mirrorCenterX - currentBarWidth / 2;
        const mirrorEndX = mirrorCenterX + currentBarWidth / 2;
        drawBar(mirrorStartX, mirrorEndX, mirrorCenterX);
      }
    }
  } else {
    // Horizontal bars - full width
    const barHeight = h / count;
    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      const y = i * barHeight;
      const yEnd = (i + 1) * barHeight;

      // Animate bar height/intensity with wave pattern
      const phase = (barIndex / count) * Math.PI * 2 + t1 * 2;
      const intensity = Math.sin(phase) * 0.5 + 0.5;
      const currentBarHeight = barHeight * (0.5 + intensity * 0.5);

      // Get color from palette
      const paletteT = (barIndex / count + t1 * 0.1) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw full-width bar
      const barCenterY = y + barHeight / 2;
      const barStartY = barCenterY - currentBarHeight / 2;
      const barEndY = barCenterY + currentBarHeight / 2;

      // Draw bar (and mirrored version if enabled)
      const drawBar = (yPos, yEndPos, centerY) => {
        for (let x = 0; x < w; x++) {
          for (
            let y = Math.floor(yPos);
            y < Math.floor(yEndPos) && y < h;
            y++
          ) {
            if (y >= 0) {
              const idx = (y * w + x) * 4;
              // Solid color - no gradient
              d[idx] = rgb[0];
              d[idx + 1] = rgb[1];
              d[idx + 2] = rgb[2];
              d[idx + 3] = 255;
            }
          }
        }
      };

      // Draw original bar
      drawBar(barStartY, barEndY, barCenterY);

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorCenterY = h - barCenterY;
        const mirrorStartY = mirrorCenterY - currentBarHeight / 2;
        const mirrorEndY = mirrorCenterY + currentBarHeight / 2;
        drawBar(mirrorStartY, mirrorEndY, mirrorCenterY);
      }
    }
  }
}

function renderScrollingBars(d, w, h, t, params, palette, gradientMode = true) {
  const p = {
    speed: 1.0,
    count: 16,
    orientation: "vertical",
    horizontalSpeed: 1.0,
    verticalSpeed: 1.0,
    reverse: false,
    mirror: false,
    colorShiftSpeed: 0.1,
    ...params,
  };
  const t1 = t * 0.001 * p.speed;
  const count = Math.max(2, Math.floor(p.count));
  const isVertical = p.orientation === "vertical";
  const effectiveCount = p.mirror ? Math.ceil(count / 2) : count;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  if (isVertical) {
    // Vertical bars - full height, move horizontally and vertically
    const barWidth = w / count;
    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate horizontal movement (left to right or right to left)
      const horizontalPhase =
        (barIndex / count) * Math.PI * 2 + t1 * p.horizontalSpeed;
      const barX = (Math.sin(horizontalPhase) * 0.5 + 0.5) * w;

      // Calculate vertical movement (up and down) - shifts the entire bar pattern
      const verticalPhase =
        (barIndex / count) * Math.PI * 2 + t1 * p.verticalSpeed;
      const verticalShift = (Math.sin(verticalPhase) * 0.5 + 0.5) * h;

      // Get color from palette
      const colorShiftSpeed = p.colorShiftSpeed !== undefined ? p.colorShiftSpeed : 0.1;
      const paletteT = (barIndex / count + t1 * colorShiftSpeed) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw full-height bar at calculated X position
      const barStartX = barX - barWidth / 2;
      const barEndX = barX + barWidth / 2;

      for (let y = 0; y < h; y++) {
        // Apply vertical shift (wrapping)
        let shiftedY = (y + Math.floor(verticalShift)) % h;
        if (shiftedY < 0) shiftedY += h;

        for (
          let xPos = Math.floor(barStartX);
          xPos < Math.floor(barEndX) && xPos < w;
          xPos++
        ) {
          if (xPos >= 0) {
            const idx = (shiftedY * w + xPos) * 4;
            // Add gradient effect from center
            const gradient = Math.abs((xPos - barX) / (barWidth / 2));
            const brightness = 1 - gradient * 0.3;
            d[idx] = Math.min(255, rgb[0] * brightness);
            d[idx + 1] = Math.min(255, rgb[1] * brightness);
            d[idx + 2] = Math.min(255, rgb[2] * brightness);
            d[idx + 3] = 255;
          }
        }
      }
    }

    // Draw mirrored bars if enabled (vertical)
    if (p.mirror) {
      for (let i = 0; i < effectiveCount; i++) {
        const barIndex = p.reverse ? effectiveCount - 1 - i : i;
        const horizontalPhase =
          (barIndex / count) * Math.PI * 2 + t1 * p.horizontalSpeed;
        const barX = w - (Math.sin(horizontalPhase) * 0.5 + 0.5) * w;
        const verticalPhase =
          (barIndex / count) * Math.PI * 2 + t1 * p.verticalSpeed;
        const verticalShift = (Math.sin(verticalPhase) * 0.5 + 0.5) * h;
        const paletteT = (barIndex / count + t1 * 0.1) % 1;
        const color = getPaletteColor(palette, paletteT, gradientMode);
        const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
        const barStartX = barX - barWidth / 2;
        const barEndX = barX + barWidth / 2;

        for (let y = 0; y < h; y++) {
          let shiftedY = (y + Math.floor(verticalShift)) % h;
          if (shiftedY < 0) shiftedY += h;
          for (
            let xPos = Math.floor(barStartX);
            xPos < Math.floor(barEndX) && xPos < w;
            xPos++
          ) {
            if (xPos >= 0) {
              const idx = (shiftedY * w + xPos) * 4;
              const gradient = Math.abs((xPos - barX) / (barWidth / 2));
              const brightness = 1 - gradient * 0.3;
              d[idx] = Math.min(255, rgb[0] * brightness);
              d[idx + 1] = Math.min(255, rgb[1] * brightness);
              d[idx + 2] = Math.min(255, rgb[2] * brightness);
              d[idx + 3] = 255;
            }
          }
        }
      }
    }
  } else {
    // Horizontal bars - full width, move horizontally and vertically
    const barHeight = h / count;
    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate vertical movement (up and down)
      const verticalPhase =
        (barIndex / count) * Math.PI * 2 + t1 * p.verticalSpeed;
      const barY = (Math.sin(verticalPhase) * 0.5 + 0.5) * h;

      // Calculate horizontal movement (left to right or right to left) - shifts the entire bar pattern
      const horizontalPhase =
        (barIndex / count) * Math.PI * 2 + t1 * p.horizontalSpeed;
      const horizontalShift = (Math.sin(horizontalPhase) * 0.5 + 0.5) * w;

      // Get color from palette
      const colorShiftSpeed = p.colorShiftSpeed !== undefined ? p.colorShiftSpeed : 0.1;
      const paletteT = (barIndex / count + t1 * colorShiftSpeed) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

      // Draw full-width bar at calculated Y position
      const barStartY = barY - barHeight / 2;
      const barEndY = barY + barHeight / 2;

      for (let x = 0; x < w; x++) {
        // Apply horizontal shift (wrapping)
        let shiftedX = (x + Math.floor(horizontalShift)) % w;
        if (shiftedX < 0) shiftedX += w;

        for (
          let yPos = Math.floor(barStartY);
          yPos < Math.floor(barEndY) && yPos < h;
          yPos++
        ) {
          if (yPos >= 0) {
            const idx = (yPos * w + shiftedX) * 4;
            // Add gradient effect from center
            const gradient = Math.abs((yPos - barY) / (barHeight / 2));
            const brightness = 1 - gradient * 0.3;
            d[idx] = Math.min(255, rgb[0] * brightness);
            d[idx + 1] = Math.min(255, rgb[1] * brightness);
            d[idx + 2] = Math.min(255, rgb[2] * brightness);
            d[idx + 3] = 255;
          }
        }
      }
    }

    // Draw mirrored bars if enabled
    if (p.mirror) {
      for (let i = 0; i < effectiveCount; i++) {
        const barIndex = p.reverse ? effectiveCount - 1 - i : i;
        const verticalPhase =
          (barIndex / count) * Math.PI * 2 + t1 * p.verticalSpeed;
        const barY = h - (Math.sin(verticalPhase) * 0.5 + 0.5) * h;
        const horizontalPhase =
          (barIndex / count) * Math.PI * 2 + t1 * p.horizontalSpeed;
        const horizontalShift = (Math.sin(horizontalPhase) * 0.5 + 0.5) * w;
        const paletteT = (barIndex / count + t1 * 0.1) % 1;
        const color = getPaletteColor(palette, paletteT, gradientMode);
        const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
        const barStartY = barY - barHeight / 2;
        const barEndY = barY + barHeight / 2;

        for (let x = 0; x < w; x++) {
          let shiftedX = (x + Math.floor(horizontalShift)) % w;
          if (shiftedX < 0) shiftedX += w;
          for (
            let yPos = Math.floor(barStartY);
            yPos < Math.floor(barEndY) && yPos < h;
            yPos++
          ) {
            if (yPos >= 0) {
              const idx = (yPos * w + shiftedX) * 4;
              const gradient = Math.abs((yPos - barY) / (barHeight / 2));
              const brightness = 1 - gradient * 0.3;
              d[idx] = Math.min(255, rgb[0] * brightness);
              d[idx + 1] = Math.min(255, rgb[1] * brightness);
              d[idx + 2] = Math.min(255, rgb[2] * brightness);
              d[idx + 3] = 255;
            }
          }
        }
      }
    }
  }
}
