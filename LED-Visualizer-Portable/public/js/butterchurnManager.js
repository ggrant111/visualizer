// Butterchurn manager for built-in effects
// Butterchurn is a JavaScript port of Milkdrop with many presets

let butterchurn = null;
let butterchurnPresets = null;
let butterchurnVisualizer = null;
let butterchurnCanvas = null;
let butterchurnLastTime = null;
let butterchurnElapsedTime = 0;

// Calm presets list - curated for LED displays (smooth, slow, not too busy)
const CALM_PRESETS = [
  // Minimal / Smooth Motion
  "Flexi - Simple Wave",
  "martin - waveshape simple",
  "Krash - Simple Waveforms",
  "FiShbRaiN - smooth mover",
  "projectM - Zen Plasma",
  // Flowing / Organic
  "Yin - Cloudy Morning",
  "Flexi - mellow 5",
  "martin - mellowdot",
  "Eo.S. - Calm Field",
  "Flexi - Blue Shards",
  // Ambient / Hypnotic
  "Yin - Quiet Starfield",
  "Krash - Ethereal Calm",
  "Flexi - Lazy Swirl",
  "projectM - Starfield",
  "martin - color swirl simple",
];

/**
 * Initialize butterchurn (loads from CDN if not available)
 */
async function initButterchurn() {
  if (butterchurn && butterchurnPresets) {
    return true;
  }

  try {
    // Try multiple CDN approaches for ES modules
    // Use esm.sh which is designed for ES module CDN delivery
    const cdnUrls = {
      butterchurn: [
        'https://esm.sh/butterchurn@latest',
        'https://cdn.skypack.dev/butterchurn@latest',
        'https://unpkg.com/butterchurn@latest/dist/butterchurn.min.js?module',
      ],
      presets: [
        'https://esm.sh/butterchurn-presets@2.4.7',
        'https://cdn.skypack.dev/butterchurn-presets@2.4.7',
        'https://unpkg.com/butterchurn-presets@2.4.7/dist/butterchurnPresets.min.js?module',
      ],
    };

    // Try to load butterchurn
    if (!butterchurn) {
      let lastError = null;
      for (const url of cdnUrls.butterchurn) {
        try {
          const butterchurnModule = await import(url);
          butterchurn = butterchurnModule.default || butterchurnModule;
          
          // Try to get version info
          try {
            // Version info available but not logged
          } catch (vError) {
            // Version info not available
          }
          
          break;
        } catch (e) {
          lastError = e;
          console.warn('Failed to load butterchurn from', url, 'trying next...');
        }
      }
      if (!butterchurn) {
        throw lastError || new Error('All CDN attempts failed for butterchurn');
      }
    }

    // Try to load butterchurn-presets
    if (!butterchurnPresets) {
      let lastError = null;
      for (const url of cdnUrls.presets) {
        try {
          const presetsModule = await import(url);
          butterchurnPresets = presetsModule.default || presetsModule;
          
          // Try to get version info
          try {
            // Version info available but not logged
          } catch (vError) {
            // Version info not available
          }
          
          break;
        } catch (e) {
          lastError = e;
          console.warn('Failed to load butterchurn-presets from', url, 'trying next...');
        }
      }
      if (!butterchurnPresets) {
        throw lastError || new Error('All CDN attempts failed for butterchurn-presets');
      }
    }

    if (!butterchurn || !butterchurnPresets) {
      throw new Error('Failed to load butterchurn libraries from all CDN sources. Please install locally via npm.');
    }

    return true;
  } catch (error) {
    console.error('Failed to load butterchurn from CDN:', error);
    console.warn('Butterchurn requires npm installation or bundling. To install locally:');
    console.warn('  npm install butterchurn butterchurn-presets');
    console.warn('Then import them in your project.');
    return false;
  }
}

/**
 * Load a script dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      // Wait a bit for libraries to initialize
      setTimeout(resolve, 100);
    };
    script.onerror = (error) => {
      console.error(`Failed to load script: ${src}`, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

/**
 * Check if butterchurn is ready
 */
export function isButterchurnReady() {
  return butterchurn && butterchurnPresets;
}

/**
 * Get list of available presets
 * @param {boolean} calmOnly - If true, only return calm presets. If false, return all presets with calm ones first.
 */
export function getPresetNames(calmOnly = false) {
  if (!butterchurnPresets) {
    return [];
  }
  try {
    const presets = butterchurnPresets.getPresets();
    const allPresetNames = Object.keys(presets);
    
    // Check which calm presets are actually available (only log once, not every call)
    const availableCalmPresets = CALM_PRESETS.filter(name => allPresetNames.includes(name));
    const missingCalmPresets = CALM_PRESETS.filter(name => !allPresetNames.includes(name));
    
    // Only log if there are missing calm presets (to avoid spam)
    if (missingCalmPresets.length > 0) {
      console.warn('⚠️ Missing calm presets (not found in library):', missingCalmPresets);
    }
    
    if (calmOnly) {
      // Return only calm presets that actually exist
      return availableCalmPresets;
    }
    
    // Return calm presets first, then all others
    const calmPresets = availableCalmPresets;
    const otherPresets = allPresetNames.filter(name => !CALM_PRESETS.includes(name));
    return [...calmPresets, ...otherPresets];
  } catch (error) {
    console.error('Failed to get presets:', error);
    return [];
  }
}

/**
 * Get list of calm presets only
 */
export function getCalmPresetNames() {
  return getPresetNames(true);
}

/**
 * Initialize butterchurn visualizer
 * @param {HTMLCanvasElement} canvas - Canvas to render to
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {Object} options - Optional parameters (meshWidth, meshHeight)
 */
export function initVisualizer(canvas, width, height, options = {}) {
  if (!butterchurn) {
    console.warn('Butterchurn not loaded');
    return false;
  }

  try {
    butterchurnCanvas = canvas;
    const meshWidth = options.meshWidth || 64;
    const meshHeight = options.meshHeight || 48;
    
    butterchurnVisualizer = butterchurn.createVisualizer(null, canvas, {
      width: width,
      height: height,
      mesh_width: meshWidth,
      mesh_height: meshHeight,
      pixelRatio: window.devicePixelRatio || 1,
      textureRatio: 1,
    });

    butterchurnLastTime = performance.now();
    butterchurnElapsedTime = 0;
    return true;
  } catch (error) {
    console.error('Failed to create butterchurn visualizer:', error);
    return false;
  }
}

/**
 * Update butterchurn visualizer settings
 * @param {Object} options - Settings to update (meshWidth, meshHeight)
 */
export function updateVisualizerSettings(options = {}) {
  if (!butterchurnVisualizer || !butterchurnCanvas) {
    return false;
  }

  try {
    // Recreate visualizer with new mesh settings if needed
    if (options.meshWidth !== undefined || options.meshHeight !== undefined) {
      const meshWidth = options.meshWidth || 64;
      const meshHeight = options.meshHeight || 48;
      
      butterchurnVisualizer = butterchurn.createVisualizer(null, butterchurnCanvas, {
        width: butterchurnCanvas.width,
        height: butterchurnCanvas.height,
        mesh_width: meshWidth,
        mesh_height: meshHeight,
        pixelRatio: window.devicePixelRatio || 1,
        textureRatio: 1,
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to update butterchurn visualizer settings:', error);
    return false;
  }
}

/**
 * Load a preset
 * @param {string} presetName - Name of preset to load
 * @param {number} blendLength - Blend length in seconds
 */
export function loadPreset(presetName, blendLength = 2.0) {
  if (!butterchurnVisualizer || !butterchurnPresets) {
    return false;
  }

  try {
    const presets = butterchurnPresets.getPresets();
    const preset = presets[presetName];
    if (!preset) {
      console.warn(`Preset "${presetName}" not found`);
      return false;
    }

    butterchurnVisualizer.loadPreset(preset, blendLength);
    return true;
  } catch (error) {
    console.error('Failed to load preset:', error);
    return false;
  }
}

/**
 * Render butterchurn to canvas
 * @param {number} currentTime - Current time in milliseconds
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Uint8Array} audioData - Optional audio data (time domain)
 * @param {Uint8Array} audioDataLeft - Optional left channel audio
 * @param {Uint8Array} audioDataRight - Optional right channel audio
 * @param {Object} options - Optional render parameters (audioGain, speedMultiplier, audioSmoothing, brightness, saturation, contrast, flashReduction)
 */
export function renderButterchurn(currentTime, width, height, audioData = null, audioDataLeft = null, audioDataRight = null, options = {}) {
  if (!butterchurnVisualizer || !butterchurnCanvas) {
    return false;
  }

  try {
    // Update canvas size if needed
    if (butterchurnCanvas.width !== width || butterchurnCanvas.height !== height) {
      butterchurnCanvas.width = width;
      butterchurnCanvas.height = height;
      butterchurnVisualizer.setRendererSize(width, height);
    }

    // Calculate elapsed time with speed multiplier
    const speedMultiplier = options.speedMultiplier !== undefined ? options.speedMultiplier : 1.0;
    if (butterchurnLastTime === null) {
      butterchurnLastTime = currentTime;
    }
    const elapsedTime = ((currentTime - butterchurnLastTime) / 1000) * speedMultiplier;
    butterchurnElapsedTime += elapsedTime;
    butterchurnLastTime = currentTime;

    // Prepare audio data with gain and smoothing
    const audioGain = options.audioGain !== undefined ? options.audioGain : 1.0;
    const audioSmoothing = options.audioSmoothing !== undefined ? options.audioSmoothing : 0.0;
    
    // Apply audio gain and smoothing
    const processAudioData = (data) => {
      if (!data || data.length === 0) {
        return new Uint8Array(512);
      }
      
      const processed = new Uint8Array(data.length);
      let lastValue = 128; // Center value
      
      for (let i = 0; i < data.length; i++) {
        // Apply gain (amplify/reduce)
        let value = ((data[i] - 128) * audioGain) + 128;
        
        // Apply smoothing
        if (audioSmoothing > 0) {
          value = lastValue * audioSmoothing + value * (1 - audioSmoothing);
          lastValue = value;
        }
        
        // Clamp to valid range
        processed[i] = Math.max(0, Math.min(255, Math.round(value)));
      }
      
      return processed;
    };

    const audioLevels = {
      timeByteArray: audioData ? processAudioData(audioData) : new Uint8Array(512),
      timeByteArrayL: audioDataLeft ? processAudioData(audioDataLeft) : new Uint8Array(512),
      timeByteArrayR: audioDataRight ? processAudioData(audioDataRight) : new Uint8Array(512),
    };

    // Render - butterchurn requires all these properties
    butterchurnVisualizer.render({
      elapsedTime: butterchurnElapsedTime,
      audioLevels: audioLevels,
      width: width,
      height: height,
    });

    return true;
  } catch (error) {
    console.error('Failed to render butterchurn:', error);
    return false;
  }
}

/**
 * Clean up butterchurn visualizer
 */
export function cleanup() {
  if (butterchurnVisualizer) {
    butterchurnVisualizer = null;
  }
  if (butterchurnCanvas) {
    butterchurnCanvas = null;
  }
  butterchurnLastTime = null;
  butterchurnElapsedTime = 0;
}

/**
 * Initialize butterchurn on module load
 */
initButterchurn().catch((error) => {
  console.warn('Butterchurn will be loaded on-demand:', error);
});

