// Built-in color palettes - stored as arrays of HSL colors {h, s, l}
// Each palette is an array of discrete colors that can be interpolated or used directly

export const colorPalettes = {
  rainbow: [
    { h: 0, s: 100, l: 50 }, // Red
    { h: 30, s: 100, l: 50 }, // Orange
    { h: 60, s: 100, l: 50 }, // Yellow
    { h: 90, s: 100, l: 50 }, // Yellow-green
    { h: 120, s: 100, l: 50 }, // Green
    { h: 150, s: 100, l: 50 }, // Cyan-green
    { h: 180, s: 100, l: 50 }, // Cyan
    { h: 210, s: 100, l: 50 }, // Blue-cyan
    { h: 240, s: 100, l: 50 }, // Blue
    { h: 270, s: 100, l: 50 }, // Purple
    { h: 300, s: 100, l: 50 }, // Magenta
    { h: 330, s: 100, l: 50 }, // Pink
  ],
  fire: [
    { h: 0, s: 100, l: 30 }, // Dark red
    { h: 0, s: 100, l: 40 }, // Red
    { h: 10, s: 100, l: 50 }, // Red-orange
    { h: 20, s: 100, l: 55 }, // Orange
    { h: 30, s: 100, l: 60 }, // Bright orange
    { h: 40, s: 100, l: 65 }, // Yellow-orange
    { h: 50, s: 100, l: 60 }, // Yellow
    { h: 60, s: 100, l: 50 }, // Bright yellow
  ],
  ocean: [
    { h: 200, s: 100, l: 30 }, // Deep blue
    { h: 195, s: 100, l: 35 }, // Blue
    { h: 190, s: 100, l: 40 }, // Blue-cyan
    { h: 185, s: 100, l: 45 }, // Cyan-blue
    { h: 180, s: 100, l: 50 }, // Cyan
    { h: 175, s: 100, l: 45 }, // Cyan-green
    { h: 210, s: 100, l: 40 }, // Blue
    { h: 220, s: 100, l: 35 }, // Deep blue
  ],
  neon: [
    { h: 0, s: 100, l: 50 }, // Red
    { h: 60, s: 100, l: 50 }, // Yellow
    { h: 120, s: 100, l: 50 }, // Green
    { h: 180, s: 100, l: 50 }, // Cyan
    { h: 240, s: 100, l: 50 }, // Blue
    { h: 300, s: 100, l: 50 }, // Magenta
  ],
  pastel: [
    { h: 0, s: 60, l: 70 }, // Pastel red
    { h: 30, s: 60, l: 70 }, // Pastel orange
    { h: 60, s: 60, l: 70 }, // Pastel yellow
    { h: 120, s: 60, l: 70 }, // Pastel green
    { h: 180, s: 60, l: 70 }, // Pastel cyan
    { h: 240, s: 60, l: 70 }, // Pastel blue
    { h: 270, s: 60, l: 70 }, // Pastel purple
    { h: 300, s: 60, l: 70 }, // Pastel pink
  ],
  monochrome: [
    { h: 0, s: 0, l: 20 }, // Dark gray
    { h: 0, s: 0, l: 35 }, // Gray
    { h: 0, s: 0, l: 50 }, // Medium gray
    { h: 0, s: 0, l: 65 }, // Light gray
    { h: 0, s: 0, l: 80 }, // Very light gray
  ],
  sunset: [
    { h: 0, s: 100, l: 50 }, // Red
    { h: 10, s: 100, l: 45 }, // Red-orange
    { h: 20, s: 100, l: 40 }, // Orange
    { h: 30, s: 100, l: 35 }, // Bright orange
    { h: 330, s: 100, l: 45 }, // Pink
    { h: 320, s: 100, l: 50 }, // Pink-purple
    { h: 310, s: 100, l: 50 }, // Purple-pink
  ],
  forest: [
    { h: 120, s: 80, l: 30 }, // Dark green
    { h: 125, s: 80, l: 35 }, // Green
    { h: 130, s: 80, l: 40 }, // Light green
    { h: 135, s: 80, l: 45 }, // Yellow-green
    { h: 140, s: 80, l: 50 }, // Bright yellow-green
  ],
  ice: [
    { h: 180, s: 60, l: 70 }, // Light cyan
    { h: 190, s: 60, l: 75 }, // Cyan-blue
    { h: 200, s: 60, l: 80 }, // Light blue
    { h: 210, s: 60, l: 85 }, // Very light blue
    { h: 220, s: 60, l: 80 }, // Light blue-cyan
  ],
  lava: [
    { h: 0, s: 100, l: 40 }, // Dark red
    { h: 5, s: 100, l: 45 }, // Red
    { h: 10, s: 100, l: 50 }, // Bright red
    { h: 15, s: 100, l: 55 }, // Red-orange
    { h: 25, s: 100, l: 60 }, // Orange
    { h: 30, s: 100, l: 55 }, // Bright orange
  ],
  purple: [
    { h: 270, s: 100, l: 40 }, // Dark purple
    { h: 275, s: 100, l: 45 }, // Purple
    { h: 280, s: 100, l: 50 }, // Bright purple
    { h: 285, s: 100, l: 55 }, // Purple-pink
    { h: 290, s: 100, l: 50 }, // Pink-purple
    { h: 300, s: 100, l: 45 }, // Pink
  ],
  cyber: [
    { h: 150, s: 100, l: 50 }, // Cyan-green
    { h: 160, s: 100, l: 50 }, // Green-cyan
    { h: 170, s: 100, l: 50 }, // Cyan
    { h: 180, s: 100, l: 50 }, // Pure cyan
    { h: 190, s: 100, l: 50 }, // Blue-cyan
    { h: 200, s: 100, l: 50 }, // Cyan-blue
  ],
};

// Custom palettes stored as arrays of HSL colors
let customPalettes = {};

// Validate a color object has all required properties
function validateColor(color) {
  if (!color || typeof color !== "object") return false;
  if (
    typeof color.h !== "number" ||
    typeof color.s !== "number" ||
    typeof color.l !== "number"
  ) {
    return false;
  }
  return true;
}

// Load custom palettes from JSON file first, then localStorage as fallback
export async function loadCustomPalettes() {
  try {
    // Always try to load from JSON file first
    try {
      const response = await fetch("/data/customPalettes.json");
      if (response.ok) {
        const data = await response.json();
        if (data.palettes && typeof data.palettes === "object") {
          // Validate and clean up loaded palettes
          customPalettes = {};
          for (const [name, colors] of Object.entries(data.palettes)) {
            if (Array.isArray(colors)) {
              // Filter out invalid colors
              const validColors = colors.filter(validateColor);
              if (validColors.length > 0) {
                customPalettes[name] = validColors;
              }
            }
          }
          // Save to localStorage for offline use
          saveCustomPalettes();
          console.log(
            `Loaded ${
              Object.keys(customPalettes).length
            } custom palette(s) from customPalettes.json`
          );
          return;
        }
      }
    } catch (fetchError) {
      // JSON file doesn't exist or failed to load, continue to localStorage
      console.log(
        "customPalettes.json not found or failed to load, trying localStorage"
      );
    }

    // Fallback to localStorage if JSON file doesn't exist or has no palettes
    const stored = localStorage.getItem("customPalettes");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and clean up loaded palettes
      customPalettes = {};
      for (const [name, colors] of Object.entries(parsed)) {
        if (Array.isArray(colors)) {
          // Filter out invalid colors
          const validColors = colors.filter(validateColor);
          if (validColors.length > 0) {
            customPalettes[name] = validColors;
          }
        }
      }
      console.log(
        `Loaded ${
          Object.keys(customPalettes).length
        } custom palette(s) from localStorage`
      );
    }
  } catch (e) {
    console.warn("Failed to load custom palettes:", e);
    customPalettes = {};
  }
}

// Save custom palettes to localStorage
export function saveCustomPalettes() {
  try {
    localStorage.setItem("customPalettes", JSON.stringify(customPalettes));
  } catch (e) {
    console.warn("Failed to save custom palettes:", e);
  }
}

// Save a custom palette
export async function saveCustomPalette(name, colors) {
  // Validate and filter out invalid colors before saving
  if (!Array.isArray(colors)) {
    console.warn("saveCustomPalette: colors must be an array");
    return { success: false, error: "Colors must be an array" };
  }
  const validColors = colors.filter(validateColor);
  if (validColors.length === 0) {
    console.warn("saveCustomPalette: no valid colors to save");
    return { success: false, error: "No valid colors to save" };
  }
  customPalettes[name] = validColors;
  saveCustomPalettes(); // Save to localStorage for offline use

  // Also save to JSON file on server
  try {
    const response = await fetch("/api/palettes/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        colors: validColors,
      }),
    });

    const result = await response.json();
    return result;
  } catch (e) {
    console.warn("Failed to save palette to file:", e);
    return { success: false, error: e.message };
  }
}

// Delete a custom palette
export async function deleteCustomPalette(name) {
  delete customPalettes[name];
  saveCustomPalettes(); // Update localStorage

  // Also delete from JSON file on server
  try {
    const response = await fetch(`/api/palettes/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });

    const result = await response.json();
    return result;
  } catch (e) {
    console.warn("Failed to delete palette from file:", e);
    return { success: false, error: e.message };
  }
}

// Get all custom palette names
export function getCustomPaletteNames() {
  return Object.keys(customPalettes);
}

// Get a custom palette
export function getCustomPalette(name) {
  return customPalettes[name];
}

// Convert a palette to an array of colors (for compatibility/utility)
// Built-in palettes are already arrays, but this can be used to get a copy
export function paletteToArray(paletteName, colorCount = null) {
  const palette = colorPalettes[paletteName];
  if (!palette) return null;

  // If it's already an array, return a copy
  if (Array.isArray(palette)) {
    return [...palette];
  }

  // Legacy support: if it's a function (shouldn't happen with new system)
  if (typeof palette === "function") {
    const safeColorCount = Math.max(2, colorCount || 16);
    const colors = [];
    for (let i = 0; i < safeColorCount; i++) {
      const t = i / (safeColorCount - 1);
      const color = palette(t);
      if (
        color &&
        typeof color === "object" &&
        "h" in color &&
        "s" in color &&
        "l" in color
      ) {
        colors.push(color);
      } else {
        // Fallback to rainbow
        if (
          colorPalettes.rainbow &&
          Array.isArray(colorPalettes.rainbow) &&
          colorPalettes.rainbow.length > 0
        ) {
          const rainbowIdx = Math.floor(t * colorPalettes.rainbow.length);
          colors.push(
            colorPalettes.rainbow[
              Math.min(rainbowIdx, colorPalettes.rainbow.length - 1)
            ]
          );
        } else {
          colors.push({ h: t * 360, s: 100, l: 50 });
        }
      }
    }
    return colors.length > 0 ? colors : null;
  }

  return null;
}

// Convert an array-based palette to a function
function arrayToPaletteFunction(colors) {
  return (t) => {
    if (colors.length === 0) return { h: 0, s: 0, l: 50 };
    if (colors.length === 1) return colors[0];

    const idx = Math.min(
      Math.floor(t * (colors.length - 1)),
      colors.length - 2
    );
    const localT = (t * (colors.length - 1)) % 1;
    const c1 = colors[idx];
    const c2 = colors[idx + 1];

    // Interpolate between colors
    return {
      h: c1.h + (c2.h - c1.h) * localT,
      s: c1.s + (c2.s - c1.s) * localT,
      l: c1.l + (c2.l - c1.l) * localT,
    };
  };
}

// Get color from palette at position t (0-1)
// gradientMode: true = interpolate between colors, false = use nearest solid color
export function getPaletteColor(paletteName, t, gradientMode = true) {
  // Clamp t to valid range [0, 1]
  const clampedT = Math.max(0, Math.min(1, t));

  // Check if it's a custom palette (array-based)
  if (customPalettes[paletteName]) {
    const colors = customPalettes[paletteName];
    if (!Array.isArray(colors) || colors.length === 0) {
      return { h: 0, s: 0, l: 50 };
    }

    // Filter out any invalid colors
    const validColors = colors.filter(validateColor);
    if (validColors.length === 0) {
      return { h: 0, s: 0, l: 50 };
    }

    if (validColors.length === 1) {
      return validColors[0];
    }

    if (!gradientMode) {
      // Solid mode: use nearest color
      // Use floor to get distinct color bands
      // Handle edge case: when clampedT is exactly 1.0, we want the last color
      let idx;
      if (clampedT >= 1.0) {
        idx = validColors.length - 1;
      } else {
        idx = Math.floor(clampedT * validColors.length);
      }
      const color = validColors[Math.min(idx, validColors.length - 1)];
      // Double-check the color is valid before returning
      if (validateColor(color)) {
        return color;
      }
      // Fallback to first valid color
      return validColors[0];
    }

    // Gradient mode: interpolate between colors
    const idx = Math.min(
      Math.floor(clampedT * (validColors.length - 1)),
      validColors.length - 2
    );
    const localT = (clampedT * (validColors.length - 1)) % 1;
    const c1 = validColors[idx];
    const c2 = validColors[idx + 1];

    // Ensure both colors are valid before interpolating
    if (!validateColor(c1) || !validateColor(c2)) {
      // Fallback to first valid color
      return validColors[0];
    }

    // Interpolate between colors
    return {
      h: c1.h + (c2.h - c1.h) * localT,
      s: c1.s + (c2.s - c1.s) * localT,
      l: c1.l + (c2.l - c1.l) * localT,
    };
  }

  // Check if it's a built-in palette (array-based)
  const palette = colorPalettes[paletteName];
  if (palette && Array.isArray(palette)) {
    const colors = palette;
    if (colors.length === 0) {
      return { h: 0, s: 0, l: 50 };
    }

    // Filter out any invalid colors
    const validColors = colors.filter(validateColor);
    if (validColors.length === 0) {
      return { h: 0, s: 0, l: 50 };
    }

    if (validColors.length === 1) {
      return validColors[0];
    }

    if (!gradientMode) {
      // Solid mode: use nearest color
      let idx;
      if (clampedT >= 1.0) {
        idx = validColors.length - 1;
      } else {
        idx = Math.floor(clampedT * validColors.length);
      }
      const color = validColors[Math.min(idx, validColors.length - 1)];
      // Double-check the color is valid before returning
      if (validateColor(color)) {
        return color;
      }
      // Fallback to first valid color
      return validColors[0];
    }

    // Gradient mode: interpolate between colors
    const idx = Math.min(
      Math.floor(clampedT * (validColors.length - 1)),
      validColors.length - 2
    );
    const localT = (clampedT * (validColors.length - 1)) % 1;
    const c1 = validColors[idx];
    const c2 = validColors[idx + 1];

    // Ensure both colors are valid before interpolating
    if (!validateColor(c1) || !validateColor(c2)) {
      // Fallback to first valid color
      return validColors[0];
    }

    // Interpolate between colors
    return {
      h: c1.h + (c2.h - c1.h) * localT,
      s: c1.s + (c2.s - c1.s) * localT,
      l: c1.l + (c2.l - c1.l) * localT,
    };
  }

  // Default to rainbow - ensure we always return a valid color
  if (
    colorPalettes.rainbow &&
    Array.isArray(colorPalettes.rainbow) &&
    colorPalettes.rainbow.length > 0
  ) {
    return colorPalettes.rainbow[0];
  }
  // Ultimate fallback - return a valid color object
  return { h: 0, s: 100, l: 50 };
}

// Initialize: load custom palettes on module load
loadCustomPalettes();
