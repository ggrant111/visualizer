/**
 * ColorSource abstraction for pluggable color sources
 * Supports Canvas and Screen/Window capture sources
 */

/**
 * Base ColorSource interface
 * @typedef {Object} ColorSource
 * @property {function(): Promise<void>} start - Start the source
 * @property {function(): void} stop - Stop the source
 * @property {function(): {width: number, height: number}} getSize - Get current frame size
 * @property {function(): ImageData|null} getFrame - Get latest frame as ImageData
 * @property {function(HTMLCanvasElement): void} drawPreview - Draw preview to canvas
 * @property {boolean} isActive - Whether source is currently active
 */

/**
 * CanvasSource - Reads from an existing canvas element
 */
export class CanvasSource {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.isActive = false;
  }

  async start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
  }

  getSize() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  getFrame() {
    if (!this.isActive) return null;
    try {
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    } catch (e) {
      console.warn("CanvasSource: Failed to get frame", e);
      return null;
    }
  }

  drawPreview(previewCanvas) {
    if (!this.isActive) return;
    const previewCtx = previewCanvas.getContext("2d");
    previewCanvas.width = this.canvas.width;
    previewCanvas.height = this.canvas.height;
    previewCtx.drawImage(this.canvas, 0, 0);
  }
}

/**
 * ScreenSource - Captures screen/window using getDisplayMedia
 */
export class ScreenSource {
  constructor(options = {}) {
    this.options = {
      width: options.width || 1280,
      height: options.height || 720,
      frameRate: options.frameRate || 30,
    };
    this.stream = null;
    this.video = null;
    this.workerCanvas = null;
    this.workerCtx = null;
    this.isActive = false;
    this.onSizeChange = options.onSizeChange || null;
  }

  async start() {
    if (this.isActive) {
      return;
    }

    try {
      // Request screen capture (requires user gesture)
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: this.options.width },
          height: { ideal: this.options.height },
          frameRate: { ideal: this.options.frameRate },
        },
        audio: false,
      });

      // Create video element to receive the stream
      this.video = document.createElement("video");
      this.video.srcObject = this.stream;
      this.video.autoplay = true;
      this.video.playsInline = true;

      // Wait for video metadata
      await new Promise((resolve, reject) => {
        this.video.onloadedmetadata = () => {
          // Create worker canvas for downscaling if needed
          const actualWidth = this.video.videoWidth;
          const actualHeight = this.video.videoHeight;

          // Use actual dimensions or downscale to target size
          const targetWidth = Math.min(actualWidth, this.options.width);
          const targetHeight = Math.min(actualHeight, this.options.height);

          this.workerCanvas = document.createElement("canvas");
          this.workerCanvas.width = targetWidth;
          this.workerCanvas.height = targetHeight;
          this.workerCtx = this.workerCanvas.getContext("2d", {
            willReadFrequently: true,
          });

          this.isActive = true;

          // Notify size change if callback provided
          if (this.onSizeChange) {
            this.onSizeChange({
              width: actualWidth,
              height: actualHeight,
            });
          }

          resolve();
        };
        this.video.onerror = reject;
      });

      // Handle stream ending (user stops sharing)
      this.stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          this.stop();
        };
      });
    } catch (error) {
      console.error("ScreenSource: Failed to start", error);
      this.isActive = false;
      throw error;
    }
  }

  stop() {
    this.isActive = false;

    // Stop all tracks
    if (this.stream) {
      this.stream.getVideoTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Clean up video element
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }

    // Clean up worker canvas
    this.workerCanvas = null;
    this.workerCtx = null;
  }

  getSize() {
    if (!this.isActive || !this.video) {
      return { width: 0, height: 0 };
    }
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight,
    };
  }

  getFrame() {
    if (!this.isActive || !this.video || !this.workerCtx) {
      return null;
    }

    try {
      // Check if video is ready
      if (this.video.readyState < 2) {
        return null;
      }

      // Draw video frame to worker canvas (with downscaling if needed)
      const actualWidth = this.video.videoWidth;
      const actualHeight = this.video.videoHeight;
      const targetWidth = this.workerCanvas.width;
      const targetHeight = this.workerCanvas.height;

      this.workerCtx.drawImage(
        this.video,
        0,
        0,
        actualWidth,
        actualHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Return ImageData from worker canvas
      return this.workerCtx.getImageData(0, 0, targetWidth, targetHeight);
    } catch (e) {
      console.warn("ScreenSource: Failed to get frame", e);
      return null;
    }
  }

  drawPreview(previewCanvas) {
    if (!this.isActive || !this.video) return;

    const previewCtx = previewCanvas.getContext("2d");
    const actualWidth = this.video.videoWidth;
    const actualHeight = this.video.videoHeight;

    if (actualWidth === 0 || actualHeight === 0) return;

    // Fit preview to canvas while maintaining aspect ratio
    const previewAspect = actualWidth / actualHeight;
    const canvasAspect = previewCanvas.width / previewCanvas.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (previewAspect > canvasAspect) {
      // Video is wider - fit to width
      drawWidth = previewCanvas.width;
      drawHeight = previewCanvas.width / previewAspect;
      drawX = 0;
      drawY = (previewCanvas.height - drawHeight) / 2;
    } else {
      // Video is taller - fit to height
      drawWidth = previewCanvas.height * previewAspect;
      drawHeight = previewCanvas.height;
      drawX = (previewCanvas.width - drawWidth) / 2;
      drawY = 0;
    }

    previewCtx.fillStyle = "#000";
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.drawImage(this.video, drawX, drawY, drawWidth, drawHeight);
  }
}

