# LED Visualizer - Real-Time Audio Visualization for LED Strips

A powerful web-based real-time audio visualization system that streams visual effects to LED devices using the DDP (DDP) protocol. Supports audio-reactive visualizations, built-in effects, and Butterchurn (Milkdrop) presets.

## Features

- **Audio Visualizations**: Bars, waves, radial, pulse rings, particles, shockwaves, spectrum circle, audio plasma, audio stars, audio waves, audio spiral, audio fan, and more
- **Built-in Effects**: Plasma, stars, waves, kaleidoscope, spiral, mandala, hexagons, fan, bars, full bars, scrolling bars
- **Butterchurn Integration**: Milkdrop-style visualizations with 100+ presets
- **Real-time Audio Processing**: Microphone or screen/tab audio capture
- **Color Sources**: Canvas source and screen/window capture for flexible input
- **Multi-Device Support**: Control multiple LED devices simultaneously
- **Flexible Mapping**: Import LED positions from Excel/CSV files or use templates
- **Color Sampling**: Area-based color sampling with configurable radius
- **Post-Processing**: Brightness, saturation, contrast, and flash reduction controls
- **Custom Palettes**: Save and manage custom color palettes via API

## Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/visualizer.git
   cd visualizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install:

   - `ws` - WebSocket server for DDP communication
   - Other Node.js built-in modules (`dgram`, `http`, `fs`, `path`, `url`) are included with Node.js

3. **Start the server**

   ```bash
   node server.js
   ```

   The server will start on port `8137` by default. You can change this by setting the `HTTP_PORT` environment variable:

   ```bash
   HTTP_PORT=3000 node server.js
   ```

4. **Open in browser**
   Navigate to `http://localhost:8137` in your web browser.

## Usage

### Basic Setup

1. **Select Source Type**

   - Choose from: Effect, Video, Lottie, or Audio
   - For audio visualizations, select "Audio"

2. **Configure Color Source** (Optional)

   - **Canvas Source**: Use the visualization canvas as color source
   - **Screen/Window Capture**: Capture colors from screen or window (Chrome/Edge recommended)
   - Click "Stop Source" to return to direct canvas rendering

3. **Configure Audio Source** (for Audio visualizations)

   - **Microphone**: Select your microphone input
   - **Screen/Tab**: Share your screen/tab audio (Chrome/Edge recommended)

4. **Select Visualization Style**

   - Choose from available audio visualizers or built-in effects
   - Adjust parameters using the controls panel

5. **Add LED Device**

   - Click "Add Device" in the Devices section
   - Enter device name, host IP, and port (default: 4048)
   - Load mapping or use a template
   - Click "Save All to devices.json" to persist your device configurations (optional, but recommended)

6. **Connect and Enable**
   - Click "Connect" to establish WebSocket connection
   - Enable the device to start streaming

**Note**: If `devices.json` doesn't exist, the application will start with an empty device list. Devices are stored in browser localStorage by default. Use "Save All to devices.json" to create the file and persist configurations across sessions.

### Device Mapping

Device mapping defines the physical position of each LED in normalized coordinates (0.0 to 1.0). This allows you to map any LED layout to the visualization canvas.

#### Method 1: Excel/CSV Import (Recommended)

1. **Prepare your mapping file**

   **CSV Format (Recommended):**

   ```csv
   index,x,y
   1,0.0,0.5
   2,0.1,0.5
   3,0.2,0.5
   4,0.3,0.5
   ```

   - `index`: LED index number (must be positive integers: 1, 2, 3, ...)
   - `x`: X position normalized to 0.0-1.0 (left to right)
   - `y`: Y position normalized to 0.0-1.0 (top to bottom)

   **Excel Format:**

   - Two methods supported:

   **Method A - Column Headers:**

   - Create columns: `index`, `x`, `y`
   - Place LED data in rows

   **Method B - Auto-Detection:**

   - Place LED index numbers directly in cells (e.g., 1, 2, 3, ...)
   - The system will auto-detect positions based on cell locations
   - Automatically finds the center-most LEDs and normalizes coordinates

2. **Load the mapping**
   - Click "Add Device" or select an existing device
   - Click "Load Excel/CSV" button
   - Select your `.csv`, `.xlsx`, or `.xls` file
   - The mapping will be automatically parsed and applied
   - Use "Export CSV" to save your mapping for backup

#### Method 2: Template Mapping

Quick start templates for common layouts:

1. Click "Load Template" on a device
2. Select a template:

   - **linear_strip**: Single horizontal row of LEDs
   - **grid**: Square grid layout (auto-calculates size)
   - **circle**: Circular arrangement of LEDs

3. **Customize LED count** (optional):
   - Format: `template:count` (e.g., `linear_strip:100`, `grid:256`, `circle:60`)
   - If not specified, uses default count from template

#### Method 3: Manual Configuration

Edit `public/data/devices.json` directly (advanced users):

```json
{
  "devices": [
    {
      "id": "unique-id-here",
      "name": "My LED Strip",
      "host": "192.168.1.100",
      "port": 4048,
      "enabled": true,
      "posX": 0.5,
      "posY": 0.5,
      "scale": 1.0,
      "width": 1.0,
      "height": 1.0,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "sampleRadius": 1,
      "map": [
        { "index": 1, "x": 0.0, "y": 0.5 },
        { "index": 2, "x": 0.1, "y": 0.5 },
        { "index": 3, "x": 0.2, "y": 0.5 }
      ]
    }
  ]
}
```

**Note**: Device configurations are also saved in browser localStorage, so manual edits may be overwritten. It's recommended to use the UI for configuration.

### Device Configuration

Each device supports the following settings:

- **Position (X, Y)**: Position on canvas (0.0 to 1.0)
- **Scale**: Overall size multiplier
- **Width/Height**: Independent horizontal/vertical scaling
- **Rotation**: Rotate mapping (0°, 90°, 180°, 270°)
- **Flip X/Y**: Mirror mapping horizontally or vertically
- **Sample Radius**: Area sampling radius (0-3px)
  - `0`: Point sampling (sharp)
  - `1-3`: Area averaging (smoother colors)

### Audio Visualization Styles

#### Available Styles

- **Bars**: Frequency bars
- **Wave**: Waveform
- **Radial**: Radial frequency display
- **Blobs**: Frequency-based blobs
- **Shockwave**: Expanding shockwaves
- **Particles**: Audio-reactive particles
- **Pulse Rings**: Concentric pulsing rings
- **Matrix**: Falling matrix effect
- **Oscilloscope**: Dual waveform display
- **Spectrum Circle**: Circular frequency spectrum
- **Audio Hexagons**: Hexagonal grid
- **Synth Bars**: LED-style bars
- **Sunflower**: Radial pattern
- **Frost Fire**: Hexagonal frost/fire effect
- **Audio Plasma**: Audio-reactive plasma field
- **Audio Stars**: Audio-reactive starfield
- **Audio Waves**: Audio-reactive wave patterns
- **Audio Spiral**: Audio-reactive spiral patterns
- **Audio Fan**: Audio-reactive fan blades
- **Audio Bars**: Audio-reactive bar visualization
- **Audio Full Bars**: Full-height audio-reactive bars
- **Audio Scrolling Bars**: Horizontally scrolling audio bars
- **Butterchurn**: Milkdrop-style visualizations

#### Butterchurn Controls

- **Preset**: Select from 100+ presets (calm presets recommended for LED)
- **Audio Gain**: Amplify/reduce audio input (0-3)
- **Speed**: Animation speed multiplier (0.01-3)
- **Mesh Size**: Resolution (width/height)
- **Audio Smoothing**: Smooth audio transitions (0-0.9)
- **Brightness**: Overall brightness (0.1-2)
- **Saturation**: Color saturation (0-2)
- **Contrast**: Image contrast (0.5-2)
- **Flash Reduction**: Reduce bright flashes (0-100)

### Color Sources

The application supports multiple color source types:

- **Canvas Source**: Uses the visualization canvas directly as the color source

  - Automatically captures colors from the active visualization
  - No additional setup required

- **Screen/Window Capture**: Captures colors from your screen or specific windows
  - Useful for capturing colors from external applications or videos
  - Requires browser permissions for screen sharing
  - Chrome/Edge recommended for best compatibility

### Color Sampling

The system supports area-based color sampling to reduce washed-out colors:

- **Sample Radius**: Controls how many pixels are averaged
  - `0`: Point sample (fast, sharp)
  - `1`: 3×3 pixel area (good balance)
  - `2-3`: Larger areas (smoother, less washed out)

Adjust in device settings under "Transform & Overlay" → "Sample Radius"

## DDP Protocol

This application uses the **DDP (DDP)** protocol to stream RGB data to LED controllers over UDP.

### Protocol Details

- **Protocol Version**: DDP v1
- **Transport**: UDP
- **Default Port**: 4048 (configurable per device)
- **Data Type**: RGB (24-bit, 3 bytes per LED)
- **Chunking**: Automatic packet splitting (480 RGB values per packet = 1440 bytes payload)
- **Header Size**: 10 bytes per packet

### Supported Controllers

- **WLED**: Enable DDP input in WLED settings
- **Any DDP-compatible controller**: Supports standard DDP protocol

### Connection Setup

1. **In WLED/Controller**:

   - Enable DDP input
   - Set DDP port (default: 4048)
   - Note the device IP address

2. **In Visualizer**:
   - Add device with correct IP and port
   - Click "Connect" to establish WebSocket
   - Enable device to start streaming
   - Data flows: Browser → WebSocket → Node.js Server → UDP → LED Controller

## Project Structure

```
visualizer/
├── server.js              # Node.js server (DDP streaming + API endpoints)
├── package.json           # Node.js dependencies and scripts
├── public/
│   ├── index.html         # Main application UI
│   ├── butter.js          # Butterchurn library
│   ├── data/
│   │   ├── devices.json       # Device configurations
│   │   ├── mappings.json      # Mapping templates
│   │   └── customPalettes.json # Custom color palettes
│   └── js/
│       ├── main.js              # Main application entry point
│       ├── config.js            # Application configuration
│       ├── audioManager.js      # Audio capture/processing
│       ├── audioVisualizers.js  # Audio visualization styles
│       ├── effectVisualizers.js # Built-in effects
│       ├── butterchurnManager.js # Butterchurn integration
│       ├── deviceManager.js     # Device/mapping management
│       ├── colorPalettes.js     # Color palette definitions
│       ├── colorSources.js      # Canvas and screen capture sources
│       ├── mappingScaler.js     # LED mapping coordinate scaling
│       └── utils.js             # Utility functions
└── README.md
```

## Development

### Running in Development

```bash
node server.js
```

### Environment Variables

- `HTTP_PORT`: HTTP server port (default: 8137)

### Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Limited (WebGL may have issues)

## Troubleshooting

### Audio Not Working

1. **Check browser permissions**: Allow microphone/screen sharing
2. **Check audio source**: Ensure audio is actually playing
3. **Check sensitivity**: Increase sensitivity slider
4. **Check console**: Look for error messages

### LEDs Not Responding

1. **Check connection**: Click "Connect" button
2. **Check device enabled**: Enable checkbox must be checked
3. **Check IP/Port**: Verify host IP and port (default: 4048)
4. **Check DDP support**: Ensure controller supports DDP protocol
5. **Check firewall**: Allow UDP port 4048

### Colors Washed Out

1. **Adjust Sample Radius**: Try values 1-3 for area averaging
2. **Check brightness/saturation**: Adjust in visualization parameters
3. **Disable glow**: For pulse rings, uncheck "Enable Glow" for vibrant colors

### Mapping Issues

1. **Check CSV format**: Must have `index`, `x`, `y` columns
2. **Check coordinates**: X and Y must be between 0.0 and 1.0
3. **Check indices**: LED indices should be positive integers
4. **Try template**: Use a template first to verify setup

## CSV/Excel Mapping Format Details

### CSV Format Requirements

Your CSV file must have a header row with these exact column names (case-insensitive):

- `index` - LED index number (1, 2, 3, ...)
- `x` - X coordinate (0.0 to 1.0)
- `y` - Y coordinate (0.0 to 1.0)

**Example CSV:**

```csv
index,x,y
1,0.0,0.0
2,0.1,0.0
3,0.2,0.0
4,0.0,0.1
5,0.1,0.1
```

### Excel Format Requirements

**Option 1 - Column Headers:**

- Row 1: Headers (`index`, `x`, `y`)
- Rows 2+: Data values

**Option 2 - Auto-Detection:**

- Place LED index numbers (1, 2, 3, ...) directly in spreadsheet cells
- System automatically:
  - Finds all positive integer values
  - Determines grid layout from cell positions
  - Normalizes coordinates to 0.0-1.0 range
  - Selects center-most LED positions for each index

### Coordinate System

- **Origin (0, 0)**: Top-left corner
- **X-axis**: Left to right (0.0 = left, 1.0 = right)
- **Y-axis**: Top to bottom (0.0 = top, 1.0 = bottom)
- **Normalized**: All coordinates are 0.0 to 1.0, regardless of canvas size

### Tips for Creating Mappings

1. **For LED Strips**: Use linear coordinates

   - X: 0.0 to 1.0 (evenly spaced)
   - Y: 0.5 (center vertically)

2. **For Grids**: Calculate positions

   - For N×M grid: `x = (col / (M-1))`, `y = (row / (N-1))`

3. **For Custom Shapes**: Use image editing software
   - Create a grid overlay on your LED layout image
   - Measure positions and convert to 0.0-1.0 range

## API Endpoints

The server provides the following REST API endpoints:

### Device Management

- **POST `/api/devices/save`**: Save device configurations to `public/data/devices.json`
  - Body: JSON object with `devices` array
  - Returns: `{ success: true, message: "Devices saved to devices.json" }`

### Palette Management

- **POST `/api/palettes/save`**: Save custom color palettes to `public/data/customPalettes.json`

  - Body: JSON object with `name` and `colors` array, or full palettes object
  - Returns: `{ success: true, message: "Palette saved to customPalettes.json" }`

- **DELETE `/api/palettes/{name}`**: Delete a custom palette by name
  - Returns: `{ success: true, message: "Palette deleted" }` or `{ success: false, error: "Palette not found" }`

## Advanced Configuration

### Environment Variables

```bash
# Change HTTP server port
HTTP_PORT=3000 node server.js
```

### Browser Console

The application includes debug logging. Open browser console (F12) to see:

- Audio data samples
- Device connection status
- Mapping parse results
- Butterchurn preset information
- Color source status

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Acknowledgments

- **Butterchurn**: [jberg/butterchurn](https://github.com/jberg/butterchurn) - Milkdrop port for web
- **Butterchurn Presets**: [jberg/butterchurn-presets](https://github.com/jberg/butterchurn-presets) - Preset library (v2.4.7)
- **Chrome Audio Visualizer Extension**: [afreakk/ChromeAudioVisualizerExtension](https://github.com/afreakk/ChromeAudioVisualizerExtension) - Inspiration for some visualizations

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
