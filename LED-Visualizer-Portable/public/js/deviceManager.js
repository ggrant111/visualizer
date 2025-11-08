// Device management module
import { $, uid, pickFile, download } from "./utils.js";

const STORAGE_KEY = "ledDevicesAudio";

// Device state
let devices = [];

// Load devices from JSON file first, then localStorage as fallback
export async function loadDevices() {
  try {
    // Always try to load from JSON file first on page load
    try {
      const response = await fetch("/data/devices.json");
      if (response.ok) {
        const data = await response.json();
        if (
          data.devices &&
          Array.isArray(data.devices) &&
          data.devices.length > 0
        ) {
          devices = data.devices.map((d) => ({ ...d, ws: null }));
          saveDevices(); // Save to localStorage for future use
          console.log(`Loaded ${devices.length} device(s) from devices.json`);
          return devices;
        }
      }
    } catch (fetchError) {
      // JSON file doesn't exist or failed to load, continue to localStorage
      console.log(
        "devices.json not found or failed to load, trying localStorage"
      );
    }

    // Fallback to localStorage if JSON file doesn't exist or has no devices
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      devices = JSON.parse(stored);
      console.log(`Loaded ${devices.length} device(s) from localStorage`);
    } else {
      devices = [];
    }
  } catch (e) {
    console.error("Failed to load devices:", e);
    devices = [];
  }
  return devices;
}

// Save devices to localStorage
export function saveDevices() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(devices.map((d) => ({ ...d, ws: undefined })))
    );
  } catch (e) {
    console.error("Failed to save devices:", e);
  }
}

// Get all devices
export function getDevices() {
  return devices;
}

// Add a new device
export function addDevice(name, host, port = 4048) {
  const dev = {
    id: uid(),
    name: name || "Device",
    host: host || "",
    port: parseInt(port, 10) || 4048,
    enabled: true,
    map: [],
    posX: 0.5,
    posY: 0.5,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    show: true,
    showLabels: false,
    ws: null,
  };
  devices.push(dev);
  saveDevices();
  return dev;
}

// Delete a device
export function deleteDevice(deviceId) {
  const dev = devices.find((d) => d.id === deviceId);
  if (dev && dev.ws) {
    dev.ws.close();
  }
  devices = devices.filter((d) => d.id !== deviceId);
  saveDevices();
}

// Connect to a device via WebSocket
export function connectDevice(dev, log) {
  if (!dev.host) {
    log?.(`Host missing for ${dev.name || dev.id}`);
    return;
  }
  if (dev.ws && dev.ws.readyState === 1) {
    log?.(`${dev.name || dev.id}: already connected`);
    return;
  }
  // Use current hostname and port from window.location for flexibility
  const wsHost = window.location.hostname || 'localhost';
  const wsPort = window.location.port || '8137';
  const url = `ws://${wsHost}:${wsPort}/?host=${encodeURIComponent(
    dev.host
  )}&port=${encodeURIComponent(dev.port || 4048)}`;
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";
  ws.onopen = () => {
    log?.(`${dev.name || dev.id}: WS open`);
    // Update UI to reflect connection state
    const wrap = $("devices");
    if (wrap) {
      const statusBtn = wrap.querySelector(`#deviceStatus-${dev.id}`);
      if (statusBtn) {
        const card = statusBtn.closest(".devcard");
        if (card) {
          card.className = "devcard connected";
        }
        statusBtn.className = "device-status-btn connected";
        statusBtn.textContent = "✓ Connected & Enabled";
      }
    }
  };
  ws.onclose = () => {
    log?.(`${dev.name || dev.id}: WS closed`);
    dev.enabled = false; // Auto-disable on disconnect
    // Update UI to reflect disconnection
    const wrap = $("devices");
    if (wrap) {
      const statusBtn = wrap.querySelector(`#deviceStatus-${dev.id}`);
      if (statusBtn) {
        const card = statusBtn.closest(".devcard");
        if (card) {
          card.className = "devcard disconnected";
        }
        statusBtn.className = "device-status-btn disconnected";
        statusBtn.textContent = "✗ Disconnected";
      }
    }
  };
  dev.ws = ws;
}

// Parse CSV to mapping format
export function parseCsvToMap(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) throw new Error("CSV empty");
  const delim =
    lines[0].split(",").length >= lines[0].split("\t").length ? "," : "\t";
  const headers = lines[0].split(delim).map((s) => s.trim().toLowerCase());
  const rows = lines
    .slice(1)
    .map((line) => line.split(delim).map((s) => s.trim()));
  const iIndex = headers.indexOf("index");
  const iX = headers.indexOf("x");
  const iY = headers.indexOf("y");
  const out = [];
  for (let r = 0; r < rows.length; r++) {
    if (iIndex < 0 || iX < 0 || iY < 0) continue;
    const idx = parseInt(rows[r][iIndex], 10);
    const x = parseFloat(rows[r][iX]);
    const y = parseFloat(rows[r][iY]);
    if (Number.isFinite(idx) && Number.isFinite(x) && Number.isFinite(y)) {
      out.push({ index: idx, x, y });
    }
  }
  out.sort((a, b) => a.index - b.index);
  return out;
}

// Parse Excel to mapping format
export function parseExcelToMap(arrayBuffer) {
  // XLSX is loaded globally from CDN
  if (typeof XLSX === "undefined") {
    throw new Error("XLSX library not loaded");
  }

  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const shName = wb.SheetNames[0];
  const sh = wb.Sheets[shName];
  const range = XLSX.utils.decode_range(sh["!ref"]);
  const candidates = [];

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sh[addr];
      if (!cell) continue;
      const num = Number(cell.v);
      if (
        Number.isFinite(num) &&
        num > 0 &&
        Math.abs(num - Math.trunc(num)) < 1e-9
      ) {
        candidates.push({ index: Math.trunc(num), r, c });
      }
    }
  }

  if (!candidates.length) throw new Error("No positive integer indices found.");

  const colCounts = new Map(),
    rowCounts = new Map();
  for (const p of candidates) {
    colCounts.set(p.c, (colCounts.get(p.c) || 0) + 1);
    rowCounts.set(p.r, (rowCounts.get(p.r) || 0) + 1);
  }

  function weightedQuantile(entries, q) {
    const arr = Array.from(entries).sort((a, b) => a[0] - b[0]);
    const total = arr.reduce((s, [, w]) => s + w, 0);
    const target = q * total;
    let acc = 0;
    for (const [k, w] of arr) {
      acc += w;
      if (acc >= target) return k;
    }
    return arr[arr.length - 1][0];
  }

  const c_q1 = weightedQuantile(colCounts, 0.02),
    c_q2 = weightedQuantile(colCounts, 0.98);
  const r_q1 = weightedQuantile(rowCounts, 0.02),
    r_q2 = weightedQuantile(rowCounts, 0.98);
  const padC = Math.max(1, Math.floor(0.02 * (c_q2 - c_q1)));
  const padR = Math.max(1, Math.floor(0.02 * (r_q2 - r_q1)));
  const cMinCore = Math.floor(c_q1 - padC),
    cMaxCore = Math.ceil(c_q2 + padC);
  const rMinCore = Math.floor(r_q1 - padR),
    rMaxCore = Math.ceil(r_q2 + padR);
  const coreCenter = {
    r: (rMinCore + rMaxCore) / 2,
    c: (cMinCore + cMaxCore) / 2,
  };

  const byIdx = new Map();
  for (const p of candidates) {
    if (!byIdx.has(p.index)) byIdx.set(p.index, []);
    byIdx.get(p.index).push({ r: p.r, c: p.c });
  }

  function choose(locs) {
    const inside = locs.filter(
      ({ r, c }) =>
        r >= rMinCore && r <= rMaxCore && c >= cMinCore && c <= cMaxCore
    );
    const pool = inside.length ? inside : locs;
    let best = pool[0],
      bestD = Infinity;
    for (const { r, c } of pool) {
      const d2 =
        (r - coreCenter.r) * (r - coreCenter.r) +
        (c - coreCenter.c) * (c - coreCenter.c);
      if (d2 < bestD) {
        bestD = d2;
        best = { r, c };
      }
    }
    return best;
  }

  const picked = [];
  Array.from(byIdx.keys())
    .sort((a, b) => a - b)
    .forEach((idx) => {
      const { r, c } = choose(byIdx.get(idx));
      picked.push({ index: idx, r, c });
    });

  const rMin = Math.min(...picked.map((p) => p.r));
  const rMax = Math.max(...picked.map((p) => p.r));
  const cMin = Math.min(...picked.map((p) => p.c));
  const cMax = Math.max(...picked.map((p) => p.c));
  const gw = Math.max(1, cMax - cMin);
  const gh = Math.max(1, rMax - rMin);
  const margin = 0.02;

  const norm = picked.map((p) => ({
    index: p.index,
    x: margin + ((p.c - cMin) / gw) * (1 - 2 * margin),
    y: margin + ((p.r - rMin) / gh) * (1 - 2 * margin),
  }));
  norm.sort((a, b) => a.index - b.index);
  return norm;
}

// Render devices UI
export function renderDevicesUI(log, onUpdate) {
  const wrap = $("devices");
  if (!wrap) return;

    wrap.innerHTML = "";
  devices.forEach((dev) => {
    const card = document.createElement("div");
    const isConnected = dev.enabled && dev.ws && dev.ws.readyState === 1;
    card.className = `devcard ${isConnected ? "connected" : "disconnected"}`;
    card.innerHTML = `
      <div class="row">
        <input id="name-${dev.id}" value="${dev.name || ""}" placeholder="Name">
      </div>
      <div class="row">
        <input id="host-${dev.id}" value="${dev.host || ""}" placeholder="Host">
        <input id="port-${dev.id}" value="${
      dev.port || 4048
    }" placeholder="4048">
      </div>
      <div class="row">
        <button id="deviceStatus-${dev.id}" class="device-status-btn ${
      dev.enabled && dev.ws && dev.ws.readyState === 1 ? "connected" : "disconnected"
    }">
          ${dev.enabled && dev.ws && dev.ws.readyState === 1 ? "✓ Connected & Enabled" : "✗ Disconnected"}
        </button>
        <button id="delete-${dev.id}" style="color:#a00">Delete</button>
      </div>
      <div class="row">
        <button id="loadxl-${dev.id}">Load Excel/CSV</button>
        <button id="export-${dev.id}">Export CSV</button>
      </div>
      <div class="row">
        <button id="loadTemplate-${dev.id}">Load Template</button>
      </div>
      <details ${dev.map?.length ? "open" : ""}>
        <summary>Transform & Overlay</summary>
        <label>Position X <input id="posX-${
          dev.id
        }" type="range" min="0" max="1" step="0.001" value="${
      dev.posX ?? 0.5
    }"></label>
        <label>Position Y <input id="posY-${
          dev.id
        }" type="range" min="0" max="1" step="0.001" value="${
      dev.posY ?? 0.5
    }"></label>
        <label>Scale <input id="scale-${
          dev.id
        }" type="range" min="0.2" max="3" step="0.01" value="${
      dev.scale ?? 1
    }"></label>
        <div class="row">
          <label>Rotation
            <select id="rot-${dev.id}">
              ${[0, 90, 180, 270]
                .map(
                  (v) =>
                    `<option ${
                      (dev.rotation || 0) === v ? "selected" : ""
                    } value="${v}">${v}°</option>`
                )
                .join("")}
            </select>
          </label>
          <label class="toggle-label">
            <span class="toggle-label-text">Flip X</span>
            <label class="toggle-switch">
              <input type="checkbox" id="flipX-${dev.id}" ${dev.flipX ? "checked" : ""} />
              <span class="toggle-slider"></span>
            </label>
          </label>
          <label class="toggle-label">
            <span class="toggle-label-text">Flip Y</span>
            <label class="toggle-switch">
              <input type="checkbox" id="flipY-${dev.id}" ${dev.flipY ? "checked" : ""} />
              <span class="toggle-slider"></span>
            </label>
          </label>
        </div>
        <label>Width <input id="width-${
          dev.id
        }" type="range" min="0.2" max="3" step="0.01" value="${
      dev.width ?? dev.scale ?? 1
    }"> (horizontal scale)</label>
        <label>Height <input id="height-${
          dev.id
        }" type="range" min="0.2" max="3" step="0.01" value="${
      dev.height ?? dev.scale ?? 1
    }"> (vertical scale)</label>
        <label>Sample Radius <input id="sampleRadius-${
          dev.id
        }" type="range" min="0" max="3" step="1" value="${
      dev.sampleRadius !== undefined ? dev.sampleRadius : 1
    }"> (0=point, 1-3=area average)</label>
        <label class="toggle-label">
          <span class="toggle-label-text">Show sample points</span>
          <label class="toggle-switch">
            <input type="checkbox" id="show-${dev.id}" ${dev.show !== false ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
        </label>
        <label class="toggle-label">
          <span class="toggle-label-text">Show index labels</span>
          <label class="toggle-switch">
            <input type="checkbox" id="labels-${dev.id}" ${dev.showLabels ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
        </label>
      </details>
    `;
    wrap.appendChild(card);

    // Event listeners
    card.querySelector(`#name-${dev.id}`).addEventListener("input", (e) => {
      dev.name = e.target.value;
      saveDevices();
    });
    card.querySelector(`#host-${dev.id}`).addEventListener("input", (e) => {
      dev.host = e.target.value;
      saveDevices();
    });
    card.querySelector(`#port-${dev.id}`).addEventListener("input", (e) => {
      dev.port = parseInt(e.target.value || "4048", 10);
      saveDevices();
    });
    // Combined connect/enable button
    const statusBtn = card.querySelector(`#deviceStatus-${dev.id}`);
    statusBtn.addEventListener("click", () => {
      const isConnected = dev.enabled && dev.ws && dev.ws.readyState === 1;
      
      if (isConnected) {
        // Disconnect and disable
        if (dev.ws) {
          dev.ws.close();
          dev.ws = null;
        }
        dev.enabled = false;
      } else {
        // Enable and connect
        dev.enabled = true;
        connectDevice(dev, log);
      }
      saveDevices();
      // Re-render to update UI
      renderDevicesUI(log, onUpdate);
      onUpdate?.();
    });

    card.querySelector(`#delete-${dev.id}`).addEventListener("click", () => {
      deleteDevice(dev.id);
      renderDevicesUI(log, onUpdate);
      onUpdate?.();
    });

    card
      .querySelector(`#loadxl-${dev.id}`)
      .addEventListener("click", async () => {
        const f = await pickFile(
          ".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        if (!f) return;
        const buf = await f.arrayBuffer();
        try {
          if (f.name.toLowerCase().endsWith(".csv") || f.type.includes("csv")) {
            dev.map = parseCsvToMap(
              new TextDecoder().decode(new Uint8Array(buf))
            );
          } else {
            dev.map = parseExcelToMap(buf);
          }
          if (!dev.map.length) throw new Error("No mapping parsed");
          dev.posX ??= 0.5;
          dev.posY ??= 0.5;
          dev.scale ??= 1;
          dev.rotation ??= 0;
          dev.flipX ??= false;
          dev.flipY ??= false;
          dev.show ??= true;
          saveDevices();
          renderDevicesUI(log, onUpdate);
        } catch (err) {
          log?.(`Parse error (${dev.name || dev.id}): ` + err.message);
        }
      });

    card.querySelector(`#export-${dev.id}`).addEventListener("click", () => {
      if (!dev.map?.length) return;
      const rows = [
        "index,x,y",
        ...dev.map.map((p) => `${p.index},${p.x.toFixed(6)},${p.y.toFixed(6)}`),
      ];
      download(`${dev.name || "device"}_map.csv`, rows.join("\n"), "text/csv");
    });

    // Load template mapping - opens modal
    card
      .querySelector(`#loadTemplate-${dev.id}`)
      .addEventListener("click", () => {
        // Open template modal - will be handled in index.html
        if (window.openTemplateModal) {
          window.openTemplateModal(dev, log, () => {
            saveDevices();
            renderDevicesUI(log, onUpdate);
          });
        }
      });

    ["posX", "posY", "scale", "width", "height", "sampleRadius"].forEach(
      (k) => {
        const input = card.querySelector(`#${k}-${dev.id}`);
        if (input) {
          input.addEventListener("input", (e) => {
            dev[k] =
              k === "sampleRadius"
                ? parseInt(e.target.value, 10)
                : parseFloat(e.target.value);
            saveDevices();
            // Call onUpdate callback to notify of transform changes
            onUpdate?.();
          });
        }
      }
    );
    card.querySelector(`#rot-${dev.id}`).addEventListener("change", (e) => {
      dev.rotation = parseInt(e.target.value, 10);
      saveDevices();
      onUpdate?.();
    });
    card.querySelector(`#flipX-${dev.id}`).addEventListener("change", (e) => {
      dev.flipX = e.target.checked;
      saveDevices();
      onUpdate?.();
    });
    card.querySelector(`#flipY-${dev.id}`).addEventListener("change", (e) => {
      dev.flipY = e.target.checked;
      saveDevices();
      onUpdate?.();
    });
    card.querySelector(`#show-${dev.id}`).addEventListener("change", (e) => {
      dev.show = e.target.checked;
      saveDevices();
    });
    card.querySelector(`#labels-${dev.id}`).addEventListener("change", (e) => {
      dev.showLabels = e.target.checked;
      saveDevices();
    });
  });
}

// Export all devices to JSON file
export function exportDevicesToJSON() {
  const data = {
    devices: devices.map((d) => ({
      ...d,
      ws: undefined, // Don't include WebSocket
    })),
    exported: new Date().toISOString(),
    version: "1.0",
  };
  return JSON.stringify(data, null, 2);
}

// Import devices from JSON file
export function importDevicesFromJSON(jsonText, options = { merge: false }) {
  try {
    const data = JSON.parse(jsonText);
    const importedDevices = data.devices || (Array.isArray(data) ? data : []);

    if (!Array.isArray(importedDevices)) {
      throw new Error("Invalid device format");
    }

    if (options.merge) {
      // Merge with existing devices (by ID)
      importedDevices.forEach((importedDev) => {
        const existingIndex = devices.findIndex((d) => d.id === importedDev.id);
        if (existingIndex >= 0) {
          // Update existing device
          devices[existingIndex] = {
            ...devices[existingIndex],
            ...importedDev,
            ws: null,
          };
        } else {
          // Add new device
          devices.push({ ...importedDev, ws: null });
        }
      });
    } else {
      // Replace all devices
      devices = importedDevices.map((d) => ({ ...d, ws: null }));
    }

    saveDevices();
    return { success: true, count: importedDevices.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Save devices to devices.json file on server
export async function saveDevicesToFile() {
  try {
    const data = exportDevicesToJSON();
    const response = await fetch("/api/devices/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    const result = await response.json();
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Generate mapping from template
export function generateMappingFromTemplate(templateName, options = {}) {
  const templates = {
    linear_strip: {
      count: options.count || 50,
      pattern: "linear",
      generate: (count) => {
        const map = [];
        for (let i = 0; i < count; i++) {
          map.push({
            index: i + 1,
            x: i / (count - 1 || 1),
            y: 0.5,
          });
        }
        return map;
      },
    },
    grid: {
      count: options.count || 100,
      rows: options.rows || null,
      rowCounts: options.rowCounts || null, // Array of LED counts per row
      wiring: options.wiring || "linear", // "linear" or "serpentine"
      startPosition: options.startPosition || "top-left", // "top-left", "top-right", "bottom-left", "bottom-right"
      pattern: "grid",
      generate: (count, rows, rowCounts, wiring, startPosition) => {
        const map = [];
        let currentIndex = 1;

        // Helper function to transform coordinates based on start position
        const transformCoords = (x, y, maxX, maxY) => {
          let finalX = x;
          let finalY = y;

          // Apply start position transformation
          switch (startPosition) {
            case "top-left":
              // No transformation needed (default)
              break;
            case "top-right":
              finalX = maxX - x;
              break;
            case "bottom-left":
              finalY = maxY - y;
              break;
            case "bottom-right":
              finalX = maxX - x;
              finalY = maxY - y;
              break;
          }

          return { x: finalX, y: finalY };
        };

        if (
          rows &&
          rowCounts &&
          Array.isArray(rowCounts) &&
          rowCounts.length > 0
        ) {
          // Generate grid with specified rows and LEDs per row
          const numRows = Math.min(rows, rowCounts.length);
          const maxLedsPerRow = Math.max(...rowCounts);

          // First, collect all positions in logical order
          const positions = [];
          for (let row = 0; row < numRows; row++) {
            const ledsInRow = rowCounts[row] || rowCounts[0] || 10;
            const isSerpentineRow = wiring === "serpentine" && row % 2 === 1;
            
            // Determine column iteration order
            const colIndices = [];
            for (let col = 0; col < ledsInRow; col++) {
              colIndices.push(col);
            }
            if (isSerpentineRow) {
              colIndices.reverse(); // Reverse for serpentine rows
            }

            for (const col of colIndices) {
              const normalizedX = col / (maxLedsPerRow - 1 || 1);
              const normalizedY = row / (numRows - 1 || 1);
              positions.push({ x: normalizedX, y: normalizedY });
            }
          }

          // Assign indices and apply coordinate transformation
          for (const pos of positions) {
            const transformed = transformCoords(pos.x, pos.y, 1.0, 1.0);
            map.push({
              index: currentIndex++,
              x: transformed.x,
              y: transformed.y,
            });
          }
        } else {
          // Auto-generate square grid
          const size = Math.ceil(Math.sqrt(count));
          const positions = [];
          
          for (let y = 0; y < size; y++) {
            const isSerpentineRow = wiring === "serpentine" && y % 2 === 1;
            const xIndices = [];
            for (let x = 0; x < size; x++) {
              xIndices.push(x);
            }
            if (isSerpentineRow) {
              xIndices.reverse();
            }
            
            for (const x of xIndices) {
              if (currentIndex <= count) {
                const normalizedX = x / (size - 1 || 1);
                const normalizedY = y / (size - 1 || 1);
                const transformed = transformCoords(normalizedX, normalizedY, 1.0, 1.0);
                map.push({
                  index: currentIndex++,
                  x: transformed.x,
                  y: transformed.y,
                });
              }
            }
          }
        }
        return map;
      },
    },
    circle: {
      count: options.count || 60,
      segments: options.segments || null, // Array of LED counts for each circle
      pattern: "circle",
      generate: (count, segments) => {
        const map = [];
        let currentIndex = 1;

        if (segments && Array.isArray(segments) && segments.length > 0) {
          // Generate concentric circles
          const numCircles = segments.length;
          segments.forEach((ledCount, circleIndex) => {
            const radius = 0.15 + (circleIndex / numCircles) * 0.3; // Stagger radii
            for (let i = 0; i < ledCount; i++) {
              const angle = (i / ledCount) * Math.PI * 2;
              map.push({
                index: currentIndex++,
                x: 0.5 + Math.cos(angle) * radius,
                y: 0.5 + Math.sin(angle) * radius,
              });
            }
          });
        } else {
          // Single circle
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            map.push({
              index: currentIndex++,
              x: 0.5 + Math.cos(angle) * 0.4,
              y: 0.5 + Math.sin(angle) * 0.4,
            });
          }
        }
        return map;
      },
    },
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  // Call generate with appropriate parameters based on template type
  if (templateName === "circle") {
    return template.generate(template.count, template.segments);
  } else if (templateName === "grid") {
    return template.generate(
      template.count,
      template.rows,
      template.rowCounts,
      template.wiring,
      template.startPosition
    );
  } else {
    return template.generate(template.count);
  }
}

// Initialize devices (async)
export async function initDevices() {
  await loadDevices();
  return devices;
}
