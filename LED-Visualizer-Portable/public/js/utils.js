// Utility functions

// Helper: HSL to RGB conversion
export function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Helper: Get DOM element by ID
export function $(id) {
  return document.getElementById(id);
}

// Helper: Logging function
export function createLogger(logElementId) {
  const el = $(logElementId);
  return (s) => {
    el.textContent = (s + "\n" + el.textContent).slice(0, 4000);
  };
}

// Helper: Draw fitted image/video
export function drawFitted(sourceW, sourceH, fit, destCtx, destW, destH, drawCb) {
  if (fit === "stretch") {
    drawCb(0, 0, destW, destH);
    return;
  }
  const srcAR = sourceW / sourceH,
    dstAR = destW / destH;
  let dw, dh, dx, dy;
  if (fit === "cover" ? srcAR < dstAR : srcAR > dstAR) {
    dw = destW;
    dh = Math.round(destW / srcAR);
    dx = 0;
    dy = Math.round((destH - dh) / 2);
  } else {
    dh = destH;
    dw = Math.round(destH * srcAR);
    dy = 0;
    dx = Math.round((destW - dw) / 2);
  }
  drawCb(dx, dy, dw, dh);
}

// Helper: Generate unique ID
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Helper: Download file
export function download(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper: Pick file
export function pickFile(accept) {
  return new Promise((res) => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = accept || "*";
    inp.onchange = () => res(inp.files?.[0] || null);
    inp.click();
  });
}

