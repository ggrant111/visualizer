// Audio visualizer rendering module
import { getPaletteColor } from "./colorPalettes.js";
import { hslToRgb } from "./utils.js";
import {
  isButterchurnReady,
  initVisualizer as initButterchurnVisualizer,
  loadPreset as loadButterchurnPreset,
  renderButterchurn,
  getPresetNames,
  updateVisualizerSettings,
} from "./butterchurnManager.js";

/**
 * Render audio visualizer based on style
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {Object} audioData - Audio data object with analyser, dataFreq, dataWave, etc.
 * @param {string} style - Visualizer style name
 * @param {number} sensitivity - Sensitivity multiplier
 * @param {string} palette - Color palette name
 * @param {Object} effectParams - Audio effect parameters
 * @returns {ImageData} - Rendered image data
 */
export function renderAudioVisualizer(
  ctx,
  w,
  h,
  audioData,
  style,
  sensitivity,
  palette,
  effectParams = {},
  gradientMode = true
) {
  const {
    analyser,
    dataFreq,
    dataWave,
    shockwaves = [],
    particles = [],
  } = audioData;

  if (!analyser) {
    const img = ctx.createImageData(w, h);
    ctx.putImageData(img, 0, 0);
    return img;
  }

  // Use the arrays passed in - they should already be initialized by audioManager
  // If they're not provided, create new ones as fallback
  let freqData = dataFreq;
  let waveData = dataWave;

  if (!freqData || freqData.length === 0) {
    console.warn("renderAudioVisualizer: Creating new freqData array", {
      dataFreq: !!dataFreq,
      length: dataFreq?.length,
    });
    freqData = new Uint8Array(analyser.frequencyBinCount);
  }
  if (!waveData || waveData.length === 0) {
    console.warn("renderAudioVisualizer: Creating new waveData array", {
      dataWave: !!dataWave,
      length: dataWave?.length,
    });
    waveData = new Uint8Array(analyser.fftSize);
  }

  // Update audio data from analyser - this populates the arrays with fresh data
  // The analyser's smoothingTimeConstant (set in audioManager) controls how data is smoothed over time
  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(waveData);

  // Debug: check occasionally to verify data is being populated (logging removed)

  const sens = sensitivity;
  // Calculate audio intensity for audio-reactive effects
  let audioIntensity = 0;
  if (freqData) {
    let sum = 0;
    for (let i = 0; i < freqData.length; i++) {
      sum += freqData[i];
    }
    audioIntensity = sum / (freqData.length * 255);
  }

  ctx.clearRect(0, 0, w, h);

  switch (style) {
    case "bars":
      renderBars(ctx, w, h, freqData, sens, palette, gradientMode);
      break;
    case "wave":
      renderWave(ctx, w, h, waveData, sens, palette, gradientMode);
      break;
    case "radial":
      renderRadial(ctx, w, h, freqData, sens, palette, gradientMode);
      break;
    case "blobs":
      renderBlobs(ctx, w, h, freqData, sens, palette, gradientMode);
      break;
    case "shockwave":
      renderShockwave(
        ctx,
        w,
        h,
        freqData,
        sens,
        shockwaves,
        palette,
        gradientMode
      );
      break;
    case "spectrumCircle":
      renderSpectrumCircle(ctx, w, h, freqData, sens, palette, gradientMode);
      break;
    case "particles":
      renderParticles(
        ctx,
        w,
        h,
        freqData,
        sens,
        particles,
        palette,
        gradientMode
      );
      break;
    case "pulseRings":
      renderPulseRings(
        ctx,
        w,
        h,
        freqData,
        sens,
        palette,
        effectParams.pulseRings || {},
        gradientMode
      );
      break;
    case "matrix":
      renderMatrix(ctx, w, h, freqData, sens, palette, gradientMode);
      break;
    case "oscilloscope":
      renderOscilloscope(
        ctx,
        w,
        h,
        waveData,
        freqData,
        sens,
        palette,
        gradientMode
      );
      break;
    case "audioPlasma":
      renderAudioPlasma(
        ctx,
        w,
        h,
        audioIntensity,
        effectParams.audioPlasma || {},
        palette,
        gradientMode
      );
      break;
    case "audioStars":
      renderAudioStars(
        ctx,
        w,
        h,
        audioIntensity,
        effectParams.audioStars || {},
        palette,
        gradientMode
      );
      break;
    case "audioWaves":
      renderAudioWaves(
        ctx,
        w,
        h,
        audioIntensity,
        effectParams.audioWaves || {},
        palette,
        gradientMode
      );
      break;
    case "audioSpiral":
      renderAudioSpiral(
        ctx,
        w,
        h,
        audioIntensity,
        effectParams.audioSpiral || {},
        palette,
        gradientMode
      );
      break;
    case "audioHexagons":
      renderAudioHexagons(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.audioHexagons || {},
        palette,
        gradientMode
      );
      break;
    case "synthBars":
      renderSynthBars(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.synthBars || {},
        palette,
        gradientMode
      );
      break;
    case "sunflower":
      renderSunflower(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.sunflower || {},
        palette,
        gradientMode
      );
      break;
    case "frostFire":
      renderFrostFire(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.frostFire || {},
        palette,
        gradientMode
      );
      break;
    case "butterchurn":
      renderAudioButterchurn(
        ctx,
        w,
        h,
        waveData,
        analyser,
        effectParams.butterchurn || {},
        palette,
        gradientMode
      );
      break;
    case "audioFan":
      renderAudioFan(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.audioFan || {},
        palette,
        gradientMode
      );
      break;
    case "audioBars":
      renderAudioBars(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.audioBars || {},
        palette,
        gradientMode
      );
      break;
    case "audioFullBars":
      renderAudioFullBars(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.audioFullBars || {},
        palette,
        gradientMode
      );
      break;
    case "audioScrollingBars":
      renderAudioScrollingBars(
        ctx,
        w,
        h,
        freqData,
        sens,
        effectParams.audioScrollingBars || {},
        palette,
        gradientMode
      );
      break;
  }

  return ctx.getImageData(0, 0, w, h);
}

function renderBars(ctx, w, h, dataFreq, sens, palette, gradientMode = true) {
  if (!dataFreq || dataFreq.length === 0) {
    return; // No audio data available
  }
  const bins = dataFreq.length;
  const barW = Math.max(1, Math.floor(w / bins));
  const spacing = barW > 1 ? 1 : 0;
  for (let i = 0; i < bins; i++) {
    const v = (dataFreq[i] / 255) ** 1.2 * sens;
    const bh = Math.max(1, Math.min(h, v * h));
    const x = i * barW;
    const y = h - bh;
    const color = getPaletteColor(palette, i / bins, gradientMode);
    ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    ctx.fillRect(x, y, Math.max(1, barW - spacing), bh);
  }
}

function renderWave(ctx, w, h, dataWave, sens, palette) {
  if (!dataWave || dataWave.length === 0) {
    return; // No audio data available
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < dataWave.length; i++) {
    const v = ((dataWave[i] - 128) / 128) * sens;
    const x = (i / (dataWave.length - 1)) * w;
    const y = h / 2 + v * (h * 0.45);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  const color = getPaletteColor(palette, 0.5, gradientMode); // Use middle of palette for waveform
  ctx.strokeStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  ctx.stroke();
}

function renderRadial(ctx, w, h, dataFreq, sens, palette, gradientMode = true) {
  const cx = w / 2,
    cy = h / 2;
  const R = Math.min(cx, cy) * 0.9;
  const bins = dataFreq.length;
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < bins; i++) {
    const ang = (i / bins) * Math.PI * 2;
    const v = (dataFreq[i] / 255) ** 1.2 * sens;
    const r = R * (0.1 + 0.9 * v);
    const color = getPaletteColor(palette, i / bins, gradientMode);
    ctx.strokeStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * R * 0.2, Math.sin(ang) * R * 0.2);
    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    ctx.stroke();
  }
  ctx.restore();
}

function renderBlobs(ctx, w, h, dataFreq, sens, palette, gradientMode = true) {
  const bins = dataFreq.length;
  for (let i = 0; i < bins; i++) {
    const u = i / (bins - 1);
    const v = (dataFreq[i] / 255) ** 1.6 * sens;
    const x = Math.floor(u * w);
    const y0 = Math.floor((1 - v) * h);
    const color1 = getPaletteColor(palette, u, gradientMode);
    const color2 = getPaletteColor(palette, (u + 0.33) % 1, gradientMode);
    const grad = ctx.createLinearGradient(x, y0, x, h);
    grad.addColorStop(0, `hsla(${color1.h}, ${color1.s}%, ${color1.l}%, 0.95)`);
    grad.addColorStop(1, `hsla(${color2.h}, ${color2.s}%, ${color2.l}%, 0.05)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y0, 2, h - y0);
  }
}

function renderShockwave(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  shockwaves,
  palette,
  gradientMode = true
) {
  const cx = w / 2,
    cy = h / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);
  const bins = dataFreq.length;
  const bassBins = Math.floor(bins * 0.1);
  let bassSum = 0;
  for (let i = 0; i < bassBins; i++) {
    bassSum += dataFreq[i];
  }
  const bassAvg = bassSum / bassBins;
  const bassIntensity = (bassAvg / 255) * sens;

  // Trigger new shockwave when bass is strong enough
  if (bassIntensity > 0.3 && shockwaves.length < 5) {
    // Get color from palette based on bass intensity
    const paletteT = (bassIntensity + Math.random() * 0.3) % 1;
    const color = getPaletteColor(palette, paletteT, gradientMode);
    shockwaves.push({
      radius: 0,
      opacity: 1.0,
      color: color,
      speed: 2 + Math.random() * 3,
    });
  }

  // Update and draw existing shockwaves
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const wave = shockwaves[i];
    wave.radius += wave.speed;
    wave.opacity = Math.max(0, 1 - wave.radius / maxRadius);

    if (wave.opacity <= 0 || wave.radius > maxRadius) {
      shockwaves.splice(i, 1);
      continue;
    }

    const { h: hue, s: sat, l: light } = wave.color;
    const trailLength = 5;
    const trailSpacing = wave.speed * 2;

    // Draw trail rings
    for (let t = trailLength; t >= 0; t--) {
      const trailRadius = wave.radius - (trailLength - t) * trailSpacing;
      if (trailRadius < 0) continue;
      const trailOpacity = wave.opacity * (t / trailLength) * 0.4;
      if (trailOpacity <= 0) continue;

      const trailInnerRadius = Math.max(0, trailRadius - 10);
      const trailOuterRadius = trailRadius + 10;
      const trailGradient = ctx.createRadialGradient(
        cx,
        cy,
        trailInnerRadius,
        cx,
        cy,
        trailOuterRadius
      );
      trailGradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
      trailGradient.addColorStop(
        0.5,
        `hsla(${hue}, ${sat}%, ${light}%, ${trailOpacity})`
      );
      trailGradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);

      ctx.fillStyle = trailGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, trailOuterRadius, 0, Math.PI * 2);
      ctx.fill();

      if (t > 0) {
        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light + 10}%, ${
          trailOpacity * 0.6
        })`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, trailRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw main wave
    const innerRadius = Math.max(0, wave.radius - 10);
    const outerRadius = wave.radius + 10;
    const gradient = ctx.createRadialGradient(
      cx,
      cy,
      innerRadius,
      cx,
      cy,
      outerRadius
    );
    gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
    gradient.addColorStop(
      0.5,
      `hsla(${hue}, ${sat}%, ${light}%, ${wave.opacity * 0.8})`
    );
    gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light + 20}%, ${wave.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, wave.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function renderSpectrumCircle(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  palette,
  gradientMode = true
) {
  const cx = w / 2,
    cy = h / 2;
  const R = Math.min(cx, cy) * 0.8;
  const bins = dataFreq.length;
  const barWidth = (Math.PI * 2 * R) / bins;
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < bins; i++) {
    const ang = (i / bins) * Math.PI * 2 - Math.PI / 2;
    const v = (dataFreq[i] / 255) ** 1.3 * sens;
    const barLength = R * 0.3 + v * R * 0.6;
    const color = getPaletteColor(palette, i / bins, gradientMode);
    ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${50 + v * 30}%)`;
    ctx.save();
    ctx.rotate(ang);
    ctx.fillRect(R, -barWidth / 2, barLength, barWidth);
    ctx.restore();
  }
  ctx.restore();
}

function renderParticles(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  particles,
  palette,
  gradientMode = true
) {
  const cx = w / 2,
    cy = h / 2;
  const bins = dataFreq.length;
  const bassBins = Math.floor(bins * 0.15);
  let bassSum = 0;
  for (let i = 0; i < bassBins; i++) {
    bassSum += dataFreq[i];
  }
  const bassIntensity = (bassSum / bassBins / 255) * sens;

  // Spawn new particles
  if (bassIntensity > 0.4 && particles.length < 200) {
    const particleCount = Math.floor(bassIntensity * 20);
    for (let p = 0; p < particleCount; p++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      // Get color from palette based on bass intensity and random variation
      const paletteT = (bassIntensity + Math.random() * 0.3) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        size: 2 + Math.random() * 4,
        color: color,
      });
    }
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life -= p.decay;

    if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
      particles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper function to draw shapes
function drawShape(ctx, cx, cy, radius, sides, shape, rotation = 0) {
  ctx.beginPath();

  if (shape === "circle") {
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    return;
  }

  if (shape === "star") {
    const outerRadius = radius;
    const innerRadius = radius * 0.5;
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2 + rotation;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    return;
  }

  if (shape === "snowflake") {
    const branches = 6;
    const branchLength = radius;
    const branchWidth = radius * 0.3;
    for (let i = 0; i < branches; i++) {
      const angle = (i / branches) * Math.PI * 2 + rotation;
      const x1 = cx + Math.cos(angle) * branchLength;
      const y1 = cy + Math.sin(angle) * branchLength;
      const x2 = cx + Math.cos(angle + Math.PI) * branchLength;
      const y2 = cy + Math.sin(angle + Math.PI) * branchLength;

      // Main branch
      ctx.moveTo(cx, cy);
      ctx.lineTo(x1, y1);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);

      // Side branches
      const sideAngle1 = angle + Math.PI / 3;
      const sideAngle2 = angle - Math.PI / 3;
      const sideX1 = cx + Math.cos(sideAngle1) * branchWidth;
      const sideY1 = cy + Math.sin(sideAngle1) * branchWidth;
      const sideX2 = cx + Math.cos(sideAngle2) * branchWidth;
      const sideY2 = cy + Math.sin(sideAngle2) * branchWidth;

      ctx.moveTo(x1, y1);
      ctx.lineTo(sideX1, sideY1);
      ctx.moveTo(x1, y1);
      ctx.lineTo(sideX2, sideY2);
    }
    return;
  }

  // Regular polygons (triangle, square, pentagon, hexagon, heptagon, octagon)
  if (sides >= 3) {
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2 + rotation;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}

function renderPulseRings(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  palette,
  params = {},
  gradientMode = true
) {
  if (!dataFreq || dataFreq.length === 0) {
    // Debug: log when no data
    console.warn("renderPulseRings: No audio data available", {
      dataFreq: !!dataFreq,
      length: dataFreq?.length,
    });
    return; // No audio data available
  }
  const cx = w / 2,
    cy = h / 2;
  const maxR = Math.min(cx, cy) * 0.9;
  const bins = dataFreq.length;
  const ringCount = params.ringCount || 8;
  const shape = params.shape || "circle";
  const rotationSpeed = params.rotation || 0; // Rotation speed (0 = no rotation, 1 = max rotation per ring)
  const size = params.size !== undefined ? params.size : 1.0; // Size multiplier (0.1 = tiny, 1.0 = full size)
  const ringWidth = params.ringWidth !== undefined ? params.ringWidth : 3; // Ring stroke width (3-20px)
  const enableGlow = params.enableGlow !== undefined ? params.enableGlow : true; // Enable glow effect (false = solid vibrant colors)
  const binPerRing = Math.floor(bins / ringCount);

  // Map shape name to sides
  const shapeSides = {
    triangle: 3,
    square: 4,
    pentagon: 5,
    hexagon: 6,
    heptagon: 7,
    octagon: 8,
  };
  const sides = shapeSides[shape] || 0;

  for (let r = 0; r < ringCount; r++) {
    let ringSum = 0;
    for (let i = r * binPerRing; i < (r + 1) * binPerRing && i < bins; i++) {
      ringSum += dataFreq[i];
    }
    // Calculate intensity with sensitivity multiplier
    // ringSum / binPerRing gives average value per bin (0-255)
    // Divide by 255 to normalize (0-1), then multiply by sensitivity
    const ringIntensity = (ringSum / binPerRing / 255) * sens;
    const baseRadius = (maxR / ringCount) * (r + 1) * size;
    const pulseRadius = baseRadius * (0.5 + ringIntensity * 0.5);
    const color = getPaletteColor(palette, r / ringCount, gradientMode);
    // When glow is disabled, use full opacity for vibrant LED colors
    // When glow is enabled, use variable opacity based on audio intensity
    const opacity = enableGlow ? 0.3 + ringIntensity * 0.7 : 1.0;

    // Calculate rotation: if rotationSpeed is 0, all shapes align (no rotation)
    // If > 0, each ring rotates by rotationSpeed * ringIndex
    const rotation = rotationSpeed * r * Math.PI;

    if (shape === "circle") {
      if (enableGlow) {
        // For circles with glow, use filled gradient rings
        // Gradient spread is based on ring width
        const gradientSpread = ringWidth * 1.5; // Make gradient wider than stroke for smooth fade
        const gradient = ctx.createRadialGradient(
          cx,
          cy,
          pulseRadius - gradientSpread,
          cx,
          cy,
          pulseRadius + gradientSpread
        );
        gradient.addColorStop(
          0,
          `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`
        );
        gradient.addColorStop(
          0.5,
          `hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity})`
        );
        gradient.addColorStop(
          1,
          `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`
        );

        ctx.fillStyle = gradient;
        drawShape(
          ctx,
          cx,
          cy,
          pulseRadius + gradientSpread,
          sides,
          shape,
          rotation
        );
        ctx.fill();

        ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${
          color.l + 10
        }%, ${opacity})`;
        ctx.lineWidth = ringWidth;
        drawShape(ctx, cx, cy, pulseRadius, sides, shape, rotation);
        ctx.stroke();
      } else {
        // No glow: solid vibrant colors for LED - use full saturation and brightness
        // Fill with solid color at full saturation
        ctx.fillStyle = `hsl(${color.h}, 100%, ${color.l}%)`;
        drawShape(
          ctx,
          cx,
          cy,
          pulseRadius + ringWidth * 0.5,
          sides,
          shape,
          rotation
        );
        ctx.fill();

        // Stroke with slightly brighter color for definition
        ctx.strokeStyle = `hsl(${color.h}, 100%, ${Math.min(
          100,
          color.l + 15
        )}%)`;
        ctx.lineWidth = ringWidth;
        drawShape(ctx, cx, cy, pulseRadius, sides, shape, rotation);
        ctx.stroke();
      }
    } else {
      // For non-circle shapes
      // Main stroke with full saturation when glow is off
      const saturation = enableGlow ? color.s : 100; // Full saturation when glow disabled
      ctx.strokeStyle = `hsla(${color.h}, ${saturation}%, ${
        color.l + 10
      }%, ${opacity})`;
      ctx.lineWidth = ringWidth;
      drawShape(ctx, cx, cy, pulseRadius, sides, shape, rotation);
      ctx.stroke();

      // Optional: draw a subtle outer glow (only when glow is enabled)
      if (enableGlow) {
        ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${
          opacity * 0.3
        })`;
        ctx.lineWidth = Math.max(1, ringWidth * 0.3); // Glow is 30% of ring width, minimum 1px
        drawShape(
          ctx,
          cx,
          cy,
          pulseRadius + ringWidth * 0.5,
          sides,
          shape,
          rotation
        );
        ctx.stroke();
      }
    }
  }
}

function renderMatrix(ctx, w, h, dataFreq, sens, palette, gradientMode = true) {
  const bins = dataFreq.length;
  const columnCount = Math.floor(w / 4);
  const binPerColumn = Math.floor(bins / columnCount);

  for (let col = 0; col < columnCount; col++) {
    let colSum = 0;
    for (
      let i = col * binPerColumn;
      i < (col + 1) * binPerColumn && i < bins;
      i++
    ) {
      colSum += dataFreq[i];
    }
    const colIntensity = (colSum / binPerColumn / 255) * sens;
    const x = (col / columnCount) * w;
    const barHeight = h * (0.3 + colIntensity * 0.7);
    const y = h - barHeight;
    const color = getPaletteColor(palette, col / columnCount, gradientMode);

    const grad = ctx.createLinearGradient(x, y, x, h);
    grad.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.9)`);
    grad.addColorStop(
      0.5,
      `hsla(${color.h}, ${color.s - 20}%, ${color.l - 10}%, 0.6)`
    );
    grad.addColorStop(
      1,
      `hsla(${color.h}, ${color.s - 40}%, ${color.l - 20}%, 0.3)`
    );

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, 4, barHeight);

    ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${
      color.l + 20
    }%, ${colIntensity})`;
    ctx.fillRect(x, y, 4, 8);
  }
}

function renderOscilloscope(
  ctx,
  w,
  h,
  dataWave,
  dataFreq,
  sens,
  palette,
  gradientMode = true
) {
  const centerY = h / 2;
  const halfH = h * 0.4;

  // Top waveform - use palette color at 0.3
  const topColor = getPaletteColor(palette, 0.3);
  ctx.strokeStyle = `hsl(${topColor.h}, ${topColor.s}%, ${topColor.l}%)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < dataWave.length; i++) {
    const v = ((dataWave[i] - 128) / 128) * sens;
    const x = (i / (dataWave.length - 1)) * w;
    const y = centerY - halfH + v * halfH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Bottom waveform - use palette color at 0.7
  const bottomColor = getPaletteColor(palette, 0.7);
  ctx.strokeStyle = `hsl(${bottomColor.h}, ${bottomColor.s}%, ${bottomColor.l}%)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const bins = dataFreq.length;
  for (let i = 0; i < bins; i++) {
    const v = (dataFreq[i] / 255) * sens;
    const x = (i / (bins - 1)) * w;
    const y = centerY + halfH - v * halfH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Center line
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(w, centerY);
  ctx.stroke();

  // Lissajous curve - use palette color at 0.5
  const lissajousColor = getPaletteColor(palette, 0.5);
  ctx.strokeStyle = `hsl(${lissajousColor.h}, ${lissajousColor.s}%, ${lissajousColor.l}%)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const centerX = w / 2;
  const offset = Math.floor(dataWave.length / 4);
  for (let i = 0; i < dataWave.length - offset; i++) {
    const xv = ((dataWave[i] - 128) / 128) * sens;
    const yv = ((dataWave[i + offset] - 128) / 128) * sens;
    const x = centerX + xv * centerX * 0.8;
    const y = centerY + yv * centerY * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function renderAudioPlasma(
  ctx,
  w,
  h,
  audioIntensity,
  params,
  palette,
  gradientMode = true
) {
  const t = performance.now();
  const t1 = t * 0.001;
  const audioBoost = 1 + audioIntensity * (params.reactiveness || 2.0);
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w,
        v = y / h;
      const v1 =
        Math.sin(u * 10 + t1 * 3 * audioBoost) +
        Math.cos(v * 10 - t1 * 2 * audioBoost);
      const v2 = Math.sin(u * 4 + v * 5 + t1 * 5 * audioBoost);
      const a = (v1 + v2) * 0.5;
      const i = (y * w + x) * 4;
      // Normalize 'a' to 0-1 range for palette lookup
      const paletteT = ((a + 1) / 2 + t1 * 0.1 + audioIntensity * 0.2) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function renderAudioStars(
  ctx,
  w,
  h,
  audioIntensity,
  params,
  palette,
  gradientMode = true
) {
  const t = performance.now();
  const reactiveness = params.reactiveness || 2.0;
  const maxCount = params.maxCount || 500;
  const starCount = Math.min(
    maxCount,
    200 + Math.floor(audioIntensity * (maxCount - 200))
  );
  const t1 = t * 0.0005 * (1 + audioIntensity * reactiveness);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  for (let s = 0; s < starCount; s++) {
    const seed = s * 123.456;
    const x = (Math.sin(seed) * 0.5 + 0.5) * w;
    const y = (Math.cos(seed * 2) * 0.5 + 0.5) * h;
    const z = (Math.sin(seed * 3) * 0.5 + 0.5) * 100 + 50;
    const speed = (0.1 + (s % 3) * 0.05) * (1 + audioIntensity * reactiveness);
    const starZ = (z + t1 * speed * 100) % 100;
    if (starZ > 0 && starZ < 100) {
      const size = (100 - starZ) / 100;
      const px = (x / starZ) * 100;
      const py = (y / starZ) * 100;
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const brightness = Math.min(255, 255 * size * (1 + audioIntensity));
        // Get color from palette based on star index and audio intensity
        const paletteT = (s / starCount + audioIntensity * 0.3 + t1 * 0.1) % 1;
        const color = getPaletteColor(palette, paletteT, gradientMode);
        ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${
          brightness / 255
        })`;
        ctx.beginPath();
        ctx.arc(px, py, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function renderAudioWaves(
  ctx,
  w,
  h,
  audioIntensity,
  params,
  palette,
  gradientMode = true
) {
  const t = performance.now();
  const reactiveness = params.reactiveness || 3.0;
  const colorSpeed = params.colorSpeed || 1.0;
  const t1 = t * 0.001;
  const audioBoost = 1 + audioIntensity * reactiveness;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w,
        v = y / h;
      const wave1 =
        Math.sin((u * 5 + t1 * 2 * audioBoost) * Math.PI * 2) * 0.5 + 0.5;
      const wave2 =
        Math.sin((v * 3 - t1 * 1.5 * audioBoost) * Math.PI * 2) * 0.5 + 0.5;
      const wave3 =
        Math.sin(((u + v) * 4 + t1 * 3 * audioBoost) * Math.PI * 2) * 0.5 + 0.5;
      const combined = (wave1 + wave2 + wave3) / 3;
      const i = (y * w + x) * 4;
      const paletteT =
        (combined + t1 * 0.1 * colorSpeed + audioIntensity * 0.3) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function renderAudioSpiral(
  ctx,
  w,
  h,
  audioIntensity,
  params,
  palette,
  gradientMode = true
) {
  const t = performance.now();
  const reactiveness = params.reactiveness || 2.0;
  const arms = params.arms || 5;
  const t1 = t * 0.001;
  const audioBoost = 1 + audioIntensity * reactiveness;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = Math.min(centerX, centerY);
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy) / maxR;
      const angle = Math.atan2(dy, dx);
      const spiral =
        (angle + Math.PI) / (Math.PI * 2) + r * arms + t1 * 2 * audioBoost;
      const pattern = Math.sin(spiral * Math.PI * 4) * 0.5 + 0.5;
      const i = (y * w + x) * 4;
      const paletteT =
        (pattern + r * 0.5 + t1 * 0.05 + audioIntensity * 0.2) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);
      const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

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

function renderAudioHexagons(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  const p = {
    reactiveness: 2.0,
    count: 3,
    rotation: 0,
    ...params,
  };
  const centerX = w / 2;
  const centerY = h / 2;
  // Maximum radius to fill screen (diagonal distance)
  const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
  const hexCount = p.count || 3;
  const rotation = (p.rotation * Math.PI) / 180;

  // Calculate audio intensity from frequency data
  const bins = dataFreq.length;
  const bassBins = Math.floor(bins * 0.2);
  let bassSum = 0;
  for (let i = 0; i < bassBins; i++) {
    bassSum += dataFreq[i];
  }
  const audioIntensity = (bassSum / bassBins / 255) * sens;
  const audioBoost = 1 + audioIntensity * p.reactiveness;

  // Create ImageData for pixel manipulation
  const img = ctx.createImageData(w, h);
  const d = img.data;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  // Draw expanding hexagons from center based on audio
  // Draw from largest to smallest so smallest appears on top
  for (let i = hexCount - 1; i >= 0; i--) {
    // Map frequency bin to hexagon for more reactive response
    const binIndex = Math.floor((i / hexCount) * bins);
    const binIntensity = (dataFreq[binIndex] / 255) * sens;

    // Calculate size based on audio - starts small, grows with audio
    // Each hexagon has a different maximum size based on its index for layering
    const phase = Math.min(1, binIntensity * audioBoost);
    const maxSizeRatio = 0.5 + (i / hexCount) * 0.2; // Range from 50% to 70% based on index
    const minSizeRatio = 0.05 + (i / hexCount) * 0.05; // Start size varies by index
    const currentSize =
      maxR * (minSizeRatio + phase * (maxSizeRatio - minSizeRatio));

    const opacity = Math.max(0.3, Math.min(1, binIntensity * 2));

    if (currentSize < 1 || opacity <= 0) continue;

    // Get color from palette based on hexagon index and audio intensity
    const paletteT = (i / hexCount + audioIntensity * 0.3 + phase * 0.5) % 1;
    const color = getPaletteColor(palette, paletteT, gradientMode);
    const rgb = hslToRgb(color.h / 360, color.s / 100, color.l / 100);

    // Draw hexagon by checking if each pixel is inside (using ImageData)
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
        const angle = Math.atan2(ry, rx);
        const dist = Math.sqrt(rx * rx + ry * ry);

        // Normalize angle and shift so we're measuring from flat edge center
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
      (paletteT + 0.1) % 1,
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

  ctx.putImageData(img, 0, 0);
}

// SynthBars - LED-style bars with horizontal scanning lines
function renderSynthBars(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  const p = {
    numberOfBars: 64,
    noiseGain: 0.3,
    lineSpeed: 0.2,
    ...params,
  };

  const bins = dataFreq.length;
  const barCount = Math.min(p.numberOfBars, bins);
  const barWidth = w / barCount;
  const t = performance.now() * 0.001;

  // Draw bars
  for (let i = 0; i < barCount; i++) {
    const binIndex = Math.floor((i / barCount) * bins);
    const v = (dataFreq[binIndex] / 255) ** 1.2 * sens;
    const barHeight = Math.max(1, Math.min(h, v * h));
    const x = i * barWidth;
    const y = h - barHeight;

    // Get color from palette
    const color = getPaletteColor(palette, i / barCount, gradientMode);

    // Create gradient for LED effect
    const grad = ctx.createLinearGradient(x, y, x, h);
    grad.addColorStop(
      0,
      `hsl(${color.h}, ${color.s}%, ${Math.min(100, color.l + 20)}%)`
    );
    grad.addColorStop(0.5, `hsl(${color.h}, ${color.s}%, ${color.l}%)`);
    grad.addColorStop(
      1,
      `hsl(${color.h}, ${color.s}%, ${Math.max(0, color.l - 20)}%)`
    );

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);

    // LED pixel effect
    const ledCount = Math.floor(barHeight / 4);
    for (let led = 0; led < ledCount; led++) {
      const ledY = y + led * 4;
      const brightness = 1 - (led / ledCount) * 0.3;
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${Math.min(
        100,
        color.l * brightness
      )}%)`;
      ctx.fillRect(x, ledY, Math.max(1, barWidth - 1), 2);
    }
  }

  // Horizontal scanning line
  const linePosition = (t * p.lineSpeed * 100) % h;
  ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, linePosition);
  ctx.lineTo(w, linePosition);
  ctx.stroke();

  // Noise overlay
  if (p.noiseGain > 0) {
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = Math.random() * p.noiseGain;
      d[i] = Math.min(255, d[i] + noise * 255);
      d[i + 1] = Math.min(255, d[i + 1] + noise * 255);
      d[i + 2] = Math.min(255, d[i + 2] + noise * 255);
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
}

// Sunflower - Radial pattern with concentric rings
function renderSunflower(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  const p = {
    radius: 0.1,
    size: 0.8,
    innerRadiusGain: 1.5,
    midRadiusGain: 1.2,
    outerRadiusGain: 1.0,
    ...params,
  };

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(cx, cy) * p.size;
  const bins = dataFreq.length;

  // Convert to polar coordinates and draw
  const img = ctx.createImageData(w, h);
  const d = img.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;

      // Create symmetry
      let symX = dx;
      let symY = dy;
      if (dx >= 0) {
        symY = -dy; // Flip for symmetry
      }

      // Convert to polar
      const angle = Math.atan2(symX, symY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Normalize angle to 0-1
      let normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
      normalizedAngle = normalizedAngle % 1;

      // Get audio value for this angle
      const binIndex = Math.floor(normalizedAngle * bins);
      const audioValue = (dataFreq[binIndex] / 255) * sens;

      // Calculate dynamic radii
      const innerRadius = (p.radius + audioValue * p.innerRadiusGain) * maxR;
      const midRadius = (p.radius + audioValue * p.midRadiusGain) * maxR;
      const outerRadius = (p.radius + audioValue * p.outerRadiusGain) * maxR;
      const endRadius = (p.radius + audioValue) * maxR;

      // Get colors from palette
      const innerColor = getPaletteColor(
        palette,
        normalizedAngle,
        gradientMode
      );
      const midColor = getPaletteColor(
        palette,
        (normalizedAngle + 0.1) % 1,
        gradientMode
      );
      const outerColor = getPaletteColor(
        palette,
        (normalizedAngle + 0.2) % 1,
        gradientMode
      );

      let color = { r: 0, g: 0, b: 0 };

      if (dist < innerRadius) {
        const rgb = hslToRgb(
          innerColor.h / 360,
          innerColor.s / 100,
          innerColor.l / 100
        );
        color = { r: rgb[0], g: rgb[1], b: rgb[2] };
      } else if (dist < midRadius) {
        const t = (dist - innerRadius) / (midRadius - innerRadius);
        const innerRgb = hslToRgb(
          innerColor.h / 360,
          innerColor.s / 100,
          innerColor.l / 100
        );
        const midRgb = hslToRgb(
          midColor.h / 360,
          midColor.s / 100,
          midColor.l / 100
        );
        color = {
          r: innerRgb[0] * (1 - t) + midRgb[0] * t,
          g: innerRgb[1] * (1 - t) + midRgb[1] * t,
          b: innerRgb[2] * (1 - t) + midRgb[2] * t,
        };
      } else if (dist < outerRadius) {
        const t = (dist - midRadius) / (outerRadius - midRadius);
        const midRgb = hslToRgb(
          midColor.h / 360,
          midColor.s / 100,
          midColor.l / 100
        );
        const outerRgb = hslToRgb(
          outerColor.h / 360,
          outerColor.s / 100,
          outerColor.l / 100
        );
        color = {
          r: midRgb[0] * (1 - t) + outerRgb[0] * t,
          g: midRgb[1] * (1 - t) + outerRgb[1] * t,
          b: midRgb[2] * (1 - t) + outerRgb[2] * t,
        };
      }

      // Fade out at edges
      if (dist < endRadius) {
        const fade =
          1 - Math.max(0, (dist - midRadius) / (endRadius - midRadius));
        color.r *= fade;
        color.g *= fade;
        color.b *= fade;
      }

      const idx = (y * w + x) * 4;
      d[idx] = Math.min(255, Math.max(0, color.r));
      d[idx + 1] = Math.min(255, Math.max(0, color.g));
      d[idx + 2] = Math.min(255, Math.max(0, color.b));
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

// FrostFire - Hexagonal grid with frost/fire color gradient
function renderFrostFire(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  const p = {
    numberOfHexagons: 20,
    height: 1.0,
    colorBlend: 0.5,
    dynamicColor: 0.3,
    breathing: 0.2,
    ...params,
  };

  const bins = dataFreq.length;
  const hexCount = p.numberOfHexagons;
  const t = performance.now() * 0.001;

  // Hexagonal grid spacing
  const hexSize = Math.min(w, h) / hexCount;
  const hexRadius = hexSize * 0.5;
  const hexHeight = hexSize * Math.sqrt(3) * 0.5;

  // Get frost and fire colors from palette
  const frostColor = getPaletteColor(palette, 0.6, gradientMode); // Cool colors
  const fireColor = getPaletteColor(palette, 0.1, gradientMode); // Warm colors
  const blendColor = getPaletteColor(palette, 0.5, gradientMode); // Middle

  const frostRgb = hslToRgb(
    frostColor.h / 360,
    frostColor.s / 100,
    frostColor.l / 100
  );
  const fireRgb = hslToRgb(
    fireColor.h / 360,
    fireColor.s / 100,
    fireColor.l / 100
  );
  const blendRgb = hslToRgb(
    blendColor.h / 360,
    blendColor.s / 100,
    blendColor.l / 100
  );

  // Draw hexagonal grid
  for (let row = 0; row < hexCount; row++) {
    for (let col = 0; col < hexCount; col++) {
      const x = col * hexSize * 0.75 + (row % 2) * hexSize * 0.375;
      const y = row * hexHeight;

      // Normalize position to 0-1
      const nx = x / w;
      const ny = y / h;

      // Get audio value - use position-based bin mapping
      const binIndex = Math.floor(nx * bins);
      const audioValue = (dataFreq[binIndex] / 255) * sens * p.height;
      const audioInv =
        1 - (dataFreq[Math.floor((1 - nx) * bins)] / 255) * sens * p.height;

      // Breathing effect
      const breathing = Math.sin(nx * ny * 10 + t * 2) * p.breathing;
      const size = hexRadius * (1 - breathing);

      // Determine color based on position and audio
      let color = { r: 0, g: 0, b: 0 };
      let colorGain = 0.1;

      // Frost side (left)
      if (nx < 0.5) {
        const frostBlend = ((0.5 - nx) / 0.5) * p.colorBlend;
        color = {
          r: blendRgb[0] * (1 - frostBlend) + frostRgb[0] * frostBlend,
          g: blendRgb[1] * (1 - frostBlend) + frostRgb[1] * frostBlend,
          b: blendRgb[2] * (1 - frostBlend) + frostRgb[2] * frostBlend,
        };

        if (audioValue > ny) {
          colorGain = Math.max(audioValue, p.dynamicColor);
        }
      }
      // Fire side (right)
      else {
        const fireBlend = ((nx - 0.5) / 0.5) * p.colorBlend;
        color = {
          r: blendRgb[0] * (1 - fireBlend) + fireRgb[0] * fireBlend,
          g: blendRgb[1] * (1 - fireBlend) + fireRgb[1] * fireBlend,
          b: blendRgb[2] * (1 - fireBlend) + fireRgb[2] * fireBlend,
        };

        if (audioInv < ny) {
          colorGain = Math.max(audioInv, p.dynamicColor);
        }
      }

      // Draw hexagon
      ctx.save();
      ctx.translate(x, y);

      // Draw hexagon shape
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const hx = Math.cos(angle) * size;
        const hy = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();

      // Apply color with gain
      ctx.fillStyle = `rgba(${Math.floor(color.r * colorGain)}, ${Math.floor(
        color.g * colorGain
      )}, ${Math.floor(color.b * colorGain)}, 1)`;
      ctx.fill();

      ctx.restore();
    }
  }
}

// Butterchurn state for audio visualization
let audioButterchurnInitialized = false;
let audioButterchurnWebGLCanvas = null;
let audioButterchurnCurrentPreset = null;
let audioButterchurnMeshWidth = 64;
let audioButterchurnMeshHeight = 48;

/**
 * Render butterchurn with audio reactivity
 */
function renderAudioButterchurn(
  ctx,
  w,
  h,
  dataWave,
  analyser,
  params,
  palette
) {
  const p = {
    preset: "",
    blendLength: 2.0,
    audioGain: 1.0,
    speedMultiplier: 0.2,
    meshWidth: 64,
    meshHeight: 48,
    audioSmoothing: 0.0,
    brightness: 1.0,
    saturation: 1.0,
    contrast: 1.0,
    flashReduction: 0.0,
    ...params,
  };

  const t = performance.now();

  // Initialize butterchurn if needed
  if (!audioButterchurnInitialized) {
    if (!isButterchurnReady()) {
      // Fallback - draw black
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      return;
    }

    // Create WebGL canvas for butterchurn
    audioButterchurnWebGLCanvas = document.createElement("canvas");
    audioButterchurnWebGLCanvas.width = w;
    audioButterchurnWebGLCanvas.height = h;
    audioButterchurnMeshWidth = p.meshWidth;
    audioButterchurnMeshHeight = p.meshHeight;
    const initialized = initButterchurnVisualizer(
      audioButterchurnWebGLCanvas,
      w,
      h,
      {
        meshWidth: p.meshWidth,
        meshHeight: p.meshHeight,
      }
    );
    if (!initialized) {
      audioButterchurnInitialized = false;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      return;
    }
    audioButterchurnInitialized = true;

    // Load initial preset
    if (p.preset) {
      const loaded = loadButterchurnPreset(p.preset, p.blendLength);
      if (loaded) {
        audioButterchurnCurrentPreset = p.preset;
      } else {
        // Try first available preset
        const presets = getPresetNames();
        if (presets.length > 0) {
          const firstPreset = presets[0];
          if (loadButterchurnPreset(firstPreset, p.blendLength)) {
            audioButterchurnCurrentPreset = firstPreset;
            p.preset = firstPreset;
          }
        }
      }
    } else {
      // No preset specified, load first available
      const presets = getPresetNames();
      if (presets.length > 0) {
        const firstPreset = presets[0];
        if (loadButterchurnPreset(firstPreset, p.blendLength)) {
          audioButterchurnCurrentPreset = firstPreset;
          p.preset = firstPreset;
        }
      }
    }
  }

  // Load preset if changed
  if (p.preset && p.preset !== audioButterchurnCurrentPreset) {
    const loaded = loadButterchurnPreset(p.preset, p.blendLength);
    if (loaded) {
      audioButterchurnCurrentPreset = p.preset;
    }
  }

  // Check if mesh size changed and needs reinitialization
  if (
    audioButterchurnInitialized &&
    (p.meshWidth !== audioButterchurnMeshWidth ||
      p.meshHeight !== audioButterchurnMeshHeight)
  ) {
    // Mesh size changed - force reinitialization
    audioButterchurnInitialized = false;
    audioButterchurnCurrentPreset = null; // Force preset reload
    // Reinitialize will happen on next render - return early to avoid rendering with old visualizer
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Prepare audio data - butterchurn expects time domain data
  // dataWave is already in the correct format (Uint8Array from analyser)
  let audioData = null;
  let audioDataLeft = null;
  let audioDataRight = null;

  if (dataWave && dataWave.length > 0) {
    // Use the time domain data directly
    audioData = dataWave;

    // For stereo, we could split the data, but analyser typically gives us mono
    // If we had stereo, we'd split it here
    // For now, use the same data for left and right (mono)
    audioDataLeft = dataWave;
    audioDataRight = dataWave;
  }

  // Render butterchurn to WebGL canvas with parameters
  const rendered = renderButterchurn(
    t,
    w,
    h,
    audioData,
    audioDataLeft,
    audioDataRight,
    {
      audioGain: p.audioGain,
      speedMultiplier: p.speedMultiplier,
      audioSmoothing: p.audioSmoothing,
    }
  );

  if (!rendered) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Copy WebGL canvas content to 2D canvas with post-processing
  ctx.clearRect(0, 0, w, h);

  // Apply brightness, saturation, contrast, and flash reduction if needed
  const brightness = p.brightness !== undefined ? p.brightness : 1.0;
  const saturation = p.saturation !== undefined ? p.saturation : 1.0;
  const contrast = p.contrast !== undefined ? p.contrast : 1.0;
  const flashReduction =
    p.flashReduction !== undefined ? p.flashReduction : 0.0;

  // Always apply processing to ensure parameters are active
  // This ensures the controls work even when values are at defaults
  const needsProcessing = true;

  if (needsProcessing) {
    // Create temporary canvas for processing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw WebGL canvas to temp canvas
    tempCtx.drawImage(audioButterchurnWebGLCanvas, 0, 0);

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
    ctx.drawImage(audioButterchurnWebGLCanvas, 0, 0, w, h);
  }
}

function renderAudioFan(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  if (!dataFreq || dataFreq.length === 0) {
    return; // No audio data available
  }

  const p = {
    blades: 4,
    rotationSpeed: 1.0,
    reactiveness: 2.0,
    colorMode: "energy", // "energy" or "bass"
    ...params,
  };

  const t = performance.now();
  const t1 = t * 0.001;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = Math.min(centerX, centerY) * 0.9;
  const blades = Math.max(2, Math.floor(p.blades));

  // Calculate audio intensity
  const bins = dataFreq.length;
  let audioSum = 0;
  for (let i = 0; i < bins; i++) {
    audioSum += dataFreq[i];
  }
  const audioIntensity = (audioSum / (bins * 255)) * sens;

  // Calculate rotation based on audio
  // Use bass frequencies for bass intensity detection
  const bassBins = Math.floor(bins * 0.15);
  let bassSum = 0;
  for (let i = 0; i < bassBins; i++) {
    bassSum += dataFreq[i];
  }
  const bassIntensity = (bassSum / (bassBins * 255)) * sens;

  // Rotation speed increases with audio intensity
  const rotationSpeed = p.rotationSpeed * (1 + bassIntensity * p.reactiveness);
  const rotation = t1 * rotationSpeed;

  // Create ImageData for pixel manipulation
  const img = ctx.createImageData(w, h);
  const d = img.data;

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
        // Determine intensity source based on color mode
        let intensityForColor;
        if (p.colorMode === "energy") {
          intensityForColor = audioIntensity;
        } else {
          intensityForColor = bassIntensity;
        }

        // Shift color one blade forward based on intensity
        // When intensity is high, shift colors forward by one blade position
        const colorShift = Math.floor(intensityForColor * blades);
        const shiftedBladeIndex = (bladeIndex + colorShift) % blades;

        // Each blade gets its own unique color from the palette
        // Distribute blades evenly across the palette (0 to 1)
        // This ensures each blade has a different color even when intensity is 0
        const paletteT = shiftedBladeIndex / blades;
        const color = getPaletteColor(palette, paletteT, gradientMode);

        // Brightness controlled by energy or bass (based on color mode) - solid color per blade
        const audioBrightness = 0.5 + intensityForColor * 0.5;

        const rgb = hslToRgb(
          color.h / 360,
          color.s / 100,
          Math.min(100, color.l * audioBrightness) / 100
        );
        const idx = (y * w + x) * 4;
        d[idx] = rgb[0];
        d[idx + 1] = rgb[1];
        d[idx + 2] = rgb[2];
        d[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}

function renderAudioBars(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  if (!dataFreq || dataFreq.length === 0) {
    return; // No audio data available
  }

  const p = {
    count: 16,
    orientation: "vertical",
    reactiveness: 1.0,
    reverse: false,
    mirror: false,
    ...params,
  };

  const bins = dataFreq.length;
  const count = Math.max(2, Math.floor(p.count));
  const isVertical = p.orientation === "vertical";
  const effectiveCount = p.mirror ? Math.ceil(count / 2) : count;

  ctx.clearRect(0, 0, w, h);

  if (isVertical) {
    // Vertical bars - each bar represents frequency bins
    const barWidth = w / count;
    const binPerBar = Math.floor(bins / count);

    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate average frequency for this bar
      let barSum = 0;
      for (
        let j = barIndex * binPerBar;
        j < (barIndex + 1) * binPerBar && j < bins;
        j++
      ) {
        barSum += dataFreq[j];
      }
      const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;
      const barHeight = Math.max(1, Math.min(h, barIntensity * h));

      const x = i * barWidth;
      const y = h - barHeight;

      // Get color from palette based on bar index and intensity
      const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);

      // Solid color - no gradient
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorX = w - x - barWidth;
        ctx.fillRect(mirrorX, y, Math.max(1, barWidth - 1), barHeight);
      }
    }
  } else {
    // Horizontal bars - each bar represents frequency bins
    const barHeight = h / count;
    const binPerBar = Math.floor(bins / count);

    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate average frequency for this bar
      let barSum = 0;
      for (
        let j = barIndex * binPerBar;
        j < (barIndex + 1) * binPerBar && j < bins;
        j++
      ) {
        barSum += dataFreq[j];
      }
      const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;
      const barWidth = Math.max(1, Math.min(w, barIntensity * w));

      const y = i * barHeight;
      const x = (w - barWidth) / 2;

      // Get color from palette based on bar index and intensity
      const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);

      // Solid color - no gradient
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      ctx.fillRect(x, y, barWidth, Math.max(1, barHeight - 1));

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorY = h - y - barHeight;
        ctx.fillRect(x, mirrorY, barWidth, Math.max(1, barHeight - 1));
      }
    }
  }
}

function renderAudioFullBars(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  if (!dataFreq || dataFreq.length === 0) {
    return; // No audio data available
  }

  const p = {
    count: 16,
    orientation: "vertical",
    reactiveness: 1.0,
    reverse: false,
    mirror: false,
    ...params,
  };

  const bins = dataFreq.length;
  const count = Math.max(2, Math.floor(p.count));
  const isVertical = p.orientation === "vertical";
  const effectiveCount = p.mirror ? Math.ceil(count / 2) : count;

  ctx.clearRect(0, 0, w, h);

  if (isVertical) {
    // Vertical bars - full height, width varies with audio
    const barWidth = w / count;
    const binPerBar = Math.floor(bins / count);

    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate average frequency for this bar
      let barSum = 0;
      for (
        let j = barIndex * binPerBar;
        j < (barIndex + 1) * binPerBar && j < bins;
        j++
      ) {
        barSum += dataFreq[j];
      }
      const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;

      // Bar width varies with intensity (full height always)
      const currentBarWidth = barWidth * (0.3 + barIntensity * 0.7);
      const x = i * barWidth;
      const barCenterX = x + barWidth / 2;
      const barStartX = barCenterX - currentBarWidth / 2;
      const barEndX = barCenterX + currentBarWidth / 2;

      // Get color from palette based on bar index and intensity
      const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);

      // Solid color - no gradient
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      ctx.fillRect(barStartX, 0, Math.max(1, barEndX - barStartX), h);

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorCenterX = w - barCenterX;
        const mirrorStartX = mirrorCenterX - currentBarWidth / 2;
        const mirrorEndX = mirrorCenterX + currentBarWidth / 2;
        ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
        ctx.fillRect(
          mirrorStartX,
          0,
          Math.max(1, mirrorEndX - mirrorStartX),
          h
        );
      }
    }
  } else {
    // Horizontal bars - full width, height varies with audio
    const barHeight = h / count;
    const binPerBar = Math.floor(bins / count);

    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate average frequency for this bar
      let barSum = 0;
      for (
        let j = barIndex * binPerBar;
        j < (barIndex + 1) * binPerBar && j < bins;
        j++
      ) {
        barSum += dataFreq[j];
      }
      const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;

      // Bar height varies with intensity (full width always)
      const currentBarHeight = barHeight * (0.3 + barIntensity * 0.7);
      const y = i * barHeight;
      const barCenterY = y + barHeight / 2;
      const barStartY = barCenterY - currentBarHeight / 2;
      const barEndY = barCenterY + currentBarHeight / 2;

      // Get color from palette based on bar index and intensity
      const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
      const color = getPaletteColor(palette, paletteT, gradientMode);

      // Solid color - no gradient
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      ctx.fillRect(0, barStartY, w, Math.max(1, barEndY - barStartY));

      // Draw mirrored bar if enabled
      if (p.mirror) {
        const mirrorCenterY = h - barCenterY;
        const mirrorStartY = mirrorCenterY - currentBarHeight / 2;
        const mirrorEndY = mirrorCenterY + currentBarHeight / 2;
        ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
        ctx.fillRect(
          0,
          mirrorStartY,
          w,
          Math.max(1, mirrorEndY - mirrorStartY)
        );
      }
    }
  }
}

function renderAudioScrollingBars(
  ctx,
  w,
  h,
  dataFreq,
  sens,
  params,
  palette,
  gradientMode = true
) {
  if (!dataFreq || dataFreq.length === 0) {
    return; // No audio data available
  }

  const p = {
    count: 16,
    orientation: "vertical",
    reactiveness: 1.0,
    horizontalReactiveness: 1.0,
    verticalReactiveness: 1.0,
    reverse: false,
    mirror: false,
    ...params,
  };

  const bins = dataFreq.length;
  const count = Math.max(2, Math.floor(p.count));
  const isVertical = p.orientation === "vertical";
  const effectiveCount = p.mirror ? Math.ceil(count / 2) : count;

  // Use ImageData for proper pixel manipulation with wrapping
  const img = ctx.createImageData(w, h);
  const d = img.data;

  // Clear to black
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 1] = 0;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  if (isVertical) {
    // Vertical bars - full height, move horizontally and vertically based on audio
    const barWidth = w / count;
    const binPerBar = Math.floor(bins / count);

    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate average frequency for this bar
      let barSum = 0;
      for (
        let j = barIndex * binPerBar;
        j < (barIndex + 1) * binPerBar && j < bins;
        j++
      ) {
        barSum += dataFreq[j];
      }
      const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;

      // Horizontal movement based on audio
      const horizontalBinIndex = Math.floor((barIndex / count) * bins);
      const horizontalIntensity =
        (dataFreq[horizontalBinIndex] / 255) * sens * p.horizontalReactiveness;
      const barX = horizontalIntensity * w;

      // Vertical movement based on audio (shifts the entire bar pattern)
      const verticalBinIndex = Math.floor(
        (((barIndex + count / 2) % count) / count) * bins
      );
      const verticalIntensity =
        (dataFreq[verticalBinIndex] / 255) * sens * p.verticalReactiveness;
      const verticalShift = verticalIntensity * h;

      // Get color from palette based on bar index and intensity
      const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
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
        let barSum = 0;
        for (
          let j = barIndex * binPerBar;
          j < (barIndex + 1) * binPerBar && j < bins;
          j++
        ) {
          barSum += dataFreq[j];
        }
        const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;
        const horizontalBinIndex = Math.floor((barIndex / count) * bins);
        const horizontalIntensity =
          (dataFreq[horizontalBinIndex] / 255) *
          sens *
          p.horizontalReactiveness;
        const barX = w - horizontalIntensity * w;
        const verticalBinIndex = Math.floor(
          (((barIndex + count / 2) % count) / count) * bins
        );
        const verticalIntensity =
          (dataFreq[verticalBinIndex] / 255) * sens * p.verticalReactiveness;
        const verticalShift = verticalIntensity * h;
        const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
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
    // Horizontal bars - full width, move horizontally and vertically based on audio
    const barHeight = h / count;
    const binPerBar = Math.floor(bins / count);

    for (let i = 0; i < effectiveCount; i++) {
      // Apply reverse logic
      const barIndex = p.reverse ? effectiveCount - 1 - i : i;
      // Calculate average frequency for this bar
      let barSum = 0;
      for (
        let j = barIndex * binPerBar;
        j < (barIndex + 1) * binPerBar && j < bins;
        j++
      ) {
        barSum += dataFreq[j];
      }
      const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;

      // Vertical movement based on audio
      const verticalBinIndex = Math.floor((barIndex / count) * bins);
      const verticalIntensity =
        (dataFreq[verticalBinIndex] / 255) * sens * p.verticalReactiveness;
      const barY = verticalIntensity * h;

      // Horizontal movement based on audio (shifts the entire bar pattern)
      const horizontalBinIndex = Math.floor(
        (((barIndex + count / 2) % count) / count) * bins
      );
      const horizontalIntensity =
        (dataFreq[horizontalBinIndex] / 255) * sens * p.horizontalReactiveness;
      const horizontalShift = horizontalIntensity * w;

      // Get color from palette based on bar index and intensity
      const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
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

    // Draw mirrored bars if enabled (horizontal)
    if (p.mirror) {
      for (let i = 0; i < effectiveCount; i++) {
        const barIndex = p.reverse ? effectiveCount - 1 - i : i;
        let barSum = 0;
        for (
          let j = barIndex * binPerBar;
          j < (barIndex + 1) * binPerBar && j < bins;
          j++
        ) {
          barSum += dataFreq[j];
        }
        const barIntensity = (barSum / binPerBar / 255) * sens * p.reactiveness;
        const verticalBinIndex = Math.floor((barIndex / count) * bins);
        const verticalIntensity =
          (dataFreq[verticalBinIndex] / 255) * sens * p.verticalReactiveness;
        const barY = h - verticalIntensity * h;
        const horizontalBinIndex = Math.floor(
          (((barIndex + count / 2) % count) / count) * bins
        );
        const horizontalIntensity =
          (dataFreq[horizontalBinIndex] / 255) *
          sens *
          p.horizontalReactiveness;
        const horizontalShift = horizontalIntensity * w;
        const paletteT = (barIndex / count + barIntensity * 0.2) % 1;
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

  ctx.putImageData(img, 0, 0);
}
