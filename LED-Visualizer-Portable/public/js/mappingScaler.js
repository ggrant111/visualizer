/**
 * Mapping scaler utility for handling aspect ratio differences
 * between authoring resolution and capture resolution
 */

/**
 * Scale LED mapping from base authoring resolution to actual capture resolution
 * Uses "cover" fit to fill the canvas (may crop but ensures mapping aligns with display)
 *
 * @param {number} baseWidth - Base authoring width (e.g., 1920)
 * @param {number} baseHeight - Base authoring height (e.g., 1080)
 * @param {number} captureWidth - Actual capture width
 * @param {number} captureHeight - Actual capture height
 * @param {Array<{index: number, x: number, y: number, radius?: number}>} mapping - Original LED mapping (normalized 0-1)
 * @returns {Array<{index: number, x: number, y: number, radius?: number}>} - Scaled mapping (normalized 0-1)
 */
export function scaleMapping(baseWidth, baseHeight, captureWidth, captureHeight, mapping) {
  if (!mapping || mapping.length === 0) {
    return [];
  }

  // Calculate "cover" scale (fill entire capture area, may crop)
  const scaleX = captureWidth / baseWidth;
  const scaleY = captureHeight / baseHeight;
  const scale = Math.max(scaleX, scaleY); // Use max to fill (cover mode)

  // Calculate scaled dimensions (will be larger than capture area)
  const scaledWidth = baseWidth * scale;
  const scaledHeight = baseHeight * scale;

  // Calculate offsets to center the content (crop edges)
  const offsetX = (scaledWidth - captureWidth) / 2;
  const offsetY = (scaledHeight - captureHeight) / 2;

  // Transform each LED position
  return mapping.map((led) => {
    // Original position is in normalized base coordinates (0-1)
    // First, convert to base pixel coordinates
    const baseX = led.x * baseWidth;
    const baseY = led.y * baseHeight;

    // Scale to capture coordinates (using cover scale)
    const scaledX = baseX * scale - offsetX;
    const scaledY = baseY * scale - offsetY;

    // Convert to normalized capture coordinates (0-1)
    // Clamp to 0-1 range since we may crop outside the capture area
    const scaledXNorm = Math.max(0, Math.min(1, scaledX / captureWidth));
    const scaledYNorm = Math.max(0, Math.min(1, scaledY / captureHeight));

    // Scale radius if present (in pixels, so scale by pixel scale)
    const scaledRadius = led.radius !== undefined ? led.radius * scale : undefined;

    return {
      index: led.index,
      x: scaledXNorm,
      y: scaledYNorm,
      radius: scaledRadius,
    };
  });
}

/**
 * Get scaling information for debugging
 *
 * @param {number} baseWidth
 * @param {number} baseHeight
 * @param {number} captureWidth
 * @param {number} captureHeight
 * @returns {Object} Scaling info
 */
export function getScalingInfo(baseWidth, baseHeight, captureWidth, captureHeight) {
  const scaleX = captureWidth / baseWidth;
  const scaleY = captureHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);
  const scaledWidth = baseWidth * scale;
  const scaledHeight = baseHeight * scale;
  const offsetX = (captureWidth - scaledWidth) / 2;
  const offsetY = (captureHeight - scaledHeight) / 2;

  return {
    scale,
    scaleX,
    scaleY,
    scaledWidth,
    scaledHeight,
    offsetX,
    offsetY,
    letterboxX: offsetX > 0,
    letterboxY: offsetY > 0,
  };
}

