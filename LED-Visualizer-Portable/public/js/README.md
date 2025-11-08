# JavaScript Modules Structure

This directory contains the modular JavaScript code for the LED visualizer application.

## Module Overview

### `utils.js`
- Utility functions: `hslToRgb()`, `$()`, `createLogger()`, `drawFitted()`, `uid()`, `download()`, `pickFile()`

### `colorPalettes.js`
- Color palette definitions and `getPaletteColor()` function
- Supports: rainbow, fire, ocean, neon, pastel, monochrome, sunset, forest, ice, lava, purple, cyber

### `deviceManager.js`
- Device management: load, save, add, delete, connect
- CSV/Excel parsing for LED mappings
- Device UI rendering

### `audioManager.js` (to be created)
- Audio capture from microphone or screen/tab
- Audio context management
- Device enumeration

### `audioVisualizers.js` (to be created)
- All audio visualizer styles: bars, wave, radial, blobs, shockwave, etc.
- Audio-reactive effects

### `effectVisualizers.js` (to be created)
- Built-in effects: plasma, stars, waves, kaleidoscope, spiral, mandala
- Audio-reactive built-in effects

### `main.js` (to be created)
- Main application initialization
- Event handlers
- Main render loop

## Usage

Import modules using ES6 syntax:
```javascript
import { getPaletteColor } from './colorPalettes.js';
import { loadDevices, saveDevices } from './deviceManager.js';
```

## Data Files

See `/data/` directory for:
- `devices.json` - Device configuration schema and examples
- `mappings.json` - Mapping templates and format documentation

