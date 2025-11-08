// Audio capture and management module

/**
 * Audio Manager
 * Handles audio capture from microphone or screen/tab
 */
export class AudioManager {
  constructor(config = {}) {
    this.config = {
      fftSize: config.fftSize || 1024,
      smoothing: config.smoothing || 0.7,
      sensitivity: config.sensitivity || 1.2,
      ...config,
    };

    this.ctx = null;
    this.analyser = null;
    this.gain = null;
    this.srcNode = null;
    this.stream = null;
    this.dataFreq = null;
    this.dataWave = null;
    this.inputDeviceId = null;
  }

  // Get audio intensity (for audio-reactive effects)
  getAudioIntensity() {
    if (!this.analyser || !this.dataFreq) return 0;
    this.analyser.getByteFrequencyData(this.dataFreq);
    let sum = 0;
    for (let i = 0; i < this.dataFreq.length; i++) {
      sum += this.dataFreq[i];
    }
    return sum / (this.dataFreq.length * 255);
  }

  // Enumerate audio input devices
  async enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "audioinput");
    } catch (e) {
      console.error("enumerateDevices failed:", e);
      return [];
    }
  }

  // Start audio capture from microphone
  async startMicrophone(deviceId = null, log = null) {
    try {
      if (this.stream) {
        log?.("Audio already running");
        return false;
      }

      const constraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this._setupAudioContext(stream, log);
    } catch (e) {
      log?.("Audio start error: " + e.message);
      if (e.name === "NotAllowedError") {
        log?.("Permission denied. Please allow microphone access.");
      } else if (e.name === "NotFoundError") {
        log?.("No audio input device found.");
      }
      return false;
    }
  }

  // Start audio capture from screen/tab
  async startScreenCapture(log = null) {
    try {
      if (this.stream) {
        log?.("Audio already running");
        return false;
      }

      // Some browsers require video: true even for audio-only capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false,
        },
        video: true, // Required by some browsers, we'll disable the video track
      });

      // Disable video tracks since we only need audio
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.stop(); // Stop video track to save resources
        });
        log?.("Video track disabled (audio-only mode)");
      }

      log?.(
        "Screen/Tab audio capture started. Make sure to check 'Share audio' when selecting a tab/window."
      );
      return this._setupAudioContext(stream, log);
    } catch (e) {
      log?.(
        "Screen capture error: " +
          e.message +
          ". Make sure to select a tab/window and check 'Share audio' checkbox."
      );
      return false;
    }
  }

  // Setup audio context from stream
  _setupAudioContext(stream, log = null) {
    try {
      // Check if stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        log?.(
          "No audio tracks found in stream. Make sure to enable audio sharing."
        );
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      log?.(`Audio track found: ${audioTracks[0].label || "Unknown"}`);

      // Set up audio context and analyser
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ac.createAnalyser();
      const gain = ac.createGain();
      gain.gain.value = 1.0;
      analyser.fftSize = this.config.fftSize;
      analyser.smoothingTimeConstant = this.config.smoothing;
      const srcNode = ac.createMediaStreamSource(stream);
      srcNode.connect(gain);
      gain.connect(analyser);

      this.ctx = ac;
      this.analyser = analyser;
      this.gain = gain;
      this.srcNode = srcNode;
      this.stream = stream;
      this.dataFreq = new Uint8Array(analyser.frequencyBinCount);
      this.dataWave = new Uint8Array(analyser.fftSize);

      // Monitor stream end (e.g., when user stops sharing)
      audioTracks[0].addEventListener("ended", () => {
        log?.("Audio track ended. Stopping visualizer.");
        this.stop();
      });

      log?.("Audio started successfully.");
      return true;
    } catch (e) {
      log?.("Audio context setup error: " + e.message);
      return false;
    }
  }

  // Stop audio capture
  stop() {
    try {
      this.stream?.getTracks()?.forEach((t) => t.stop());
    } catch (e) {
      console.error("Error stopping stream tracks:", e);
    }
    try {
      this.ctx?.close();
    } catch (e) {
      console.error("Error closing audio context:", e);
    }
    this.ctx = null;
    this.analyser = null;
    this.gain = null;
    this.srcNode = null;
    this.stream = null;
  }

  // Update analyser data
  update() {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this.dataFreq);
    this.analyser.getByteTimeDomainData(this.dataWave);
  }

  // Update configuration
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (this.analyser) {
      if (config.fftSize !== undefined) {
        this.analyser.fftSize = config.fftSize;
        this.dataFreq = new Uint8Array(this.analyser.frequencyBinCount);
        this.dataWave = new Uint8Array(this.analyser.fftSize);
      }
      if (config.smoothing !== undefined) {
        this.analyser.smoothingTimeConstant = config.smoothing;
      }
    }
  }
}
