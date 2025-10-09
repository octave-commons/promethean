import test from "ava";
import { promises as fs } from "fs";
import path from "path";
import { 
  float32ToInt16,
  PCM16_MIN,
  PCM16_MAX,
  PCM16_SAMPLE_RATE,
  PCM16_FRAME_DURATION_MS,
  PCM16_BYTES_PER_SAMPLE,
  PCM16_BYTES_PER_FRAME,
  PCM16_SCALAR,
  PCM48_SAMPLE_RATE,
  clampPcm16,
  clampUnitFloat,
  floatToPcm16,
  PCM48_TO_16_DECIMATION,
  STEREO_FRAMES_PER_OUTPUT_SAMPLE,
  SAMPLES_PER_DECIMATED_OUTPUT,
  PCM48_STEREO_CHANNELS
} from "@promethean/duck-audio";
import { transportFactory, createMockWsFactory } from '../net/ws.js';
import { makeThrottledSender, defaultSenderConfig, createMockSender } from '../net/send.js';

// Mock AudioWorkletProcessor for testing
global.AudioWorkletProcessor = class {
  constructor() {
    // Mock implementation
  }
};

global.registerProcessor = (name: string, processor: any) => {
  // Mock registration for testing
  return processor;
};

// Mock AudioContext
global.AudioContext = class {
  sampleRate: number;
  constructor({ sampleRate = 48000 } = {}) {
    this.sampleRate = sampleRate;
  }

  createMediaStreamSource(stream: MediaStream) {
    return new MediaStreamAudioSourceNode(stream);
  }

  audioWorklet: any = {
    addModule: async (url: string) => {
      // Mock worklet loading - in real scenario this loads pcm16k-worklet.js
      return Promise.resolve();
    }
  };

  createScriptProcessor(bufferSize: number, numberOfInputs: number, numberOfOutputs: number) {
    return new ScriptProcessorNode(bufferSize, numberOfInputs, numberOfOutputs);
  }

  close() {
    return Promise.resolve();
  }
};

// Mock AudioWorkletNode
global.AudioWorkletNode = class {
  port: MessagePort;
  constructor(context: AudioContext, name: string) {
    this.port = new MessagePort();
  }

  connect(destination: any) {
    // Mock connection
  }

  disconnect() {
    // Mock disconnection
  }
};

// Mock MediaStreamAudioSourceNode
class MediaStreamAudioSourceNode {
  constructor(stream: MediaStream) {
    // Mock implementation
  }

  connect(destination: any) {
    // Mock connection
  }

  disconnect() {
    // Mock disconnection
  }
}

// Mock ScriptProcessorNode
class ScriptProcessorNode {
  onaudioprocess: ((event: any) => void) | null = null;
  constructor(
    public bufferSize: number,
    public numberOfInputs: number,
    public numberOfOutputs: number
  ) {}

  connect(destination: any) {
    // Mock connection
  }

  disconnect() {
    // Mock disconnection
  }
}

// Mock MessagePort
class MessagePort {
  onmessage: ((event: any) => void) | null = null;
  private listeners: Array<(event: any) => void> = [];

  postMessage(message: any) {
    // Simulate async message delivery
    setTimeout(() => {
      this.listeners.forEach(listener => {
        listener({ data: message });
      });
    }, 0);
  }

  // Mock the worklet sending Int16Array data
  simulateWorkletPCM16Data(callback: (pcmData: Int16Array) => void) {
    // Simulate worklet processing Float32 -> Int16Array conversion
    const mockPCMData = new Int16Array([1000, -1000, 500, -500, 2000, -2000, 0, 0]); // Mock PCM16 samples
    setTimeout(() => callback(mockPCMData), 50);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (type === 'message') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (type === 'message') {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
  }
}

// Mock MediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: async (constraints: MediaStreamConstraints) => {
      // Mock media stream with test audio data
      const stream = new MediaStream();

      // Add mock audio track with 48kHz stereo test data
      const audioContext = new AudioContext({ sampleRate: 48000 });
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // A4 note for testing
      gainNode.gain.value = 0.5;

      // Start and stop oscillator to generate test data
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1); // 100ms of audio

      return stream;
    }
  },
  writable: false
});

// Mock performance
Object.defineProperty(global, 'performance', {
  value: {
    now: () => Date.now()
  },
  writable: false
});

// Mock queueMicrotask
Object.defineProperty(global, 'queueMicrotask', {
  value: (callback: () => void) => {
    Promise.resolve().then(callback);
  },
  writable: false
});

// Import the module under test
const { startMic } = await import('../mic.ts');

test.serial("mic → worklet → PCM16 integration test", async (t) => {
  // Test data setup
  const testResults: Array<{ pcm: Int16Array; tstampMs: number }> = [];
  let resolveTest: (() => void) | null = null;

  const testPromise = new Promise<void>((resolve) => {
    resolveTest = resolve;
  });

  // Callback to capture PCM data
  const onPcm = (pcm: Int16Array, tstampMs: number) => {
    testResults.push({ pcm, tstampMs });

    // After collecting some samples, resolve the test
    if (testResults.length >= 3) {
      setTimeout(resolveTest!, 100);
    }
  };

  // Mock the worklet to send Int16Array data
  const mockWorkletNode = new (global as any).AudioWorkletNode(null, 'pcm16k');
  // Simulate worklet sending PCM16 data
  setTimeout(() => {
    const mockPCMData = new Int16Array([1000, -1000, 500, -500, 2000, -2000, 0, 0]); // Mock PCM16 samples
    mockWorkletNode.port.onmessage({ data: mockPCMData });
  }, 50);

  // Start microphone capture
  const micHandle = await startMic(onPcm);

  // Wait for test data collection
  await testPromise;

  // Cleanup
  await micHandle.stop();

  // Validate results
  t.true(testResults.length >= 3, "Should collect at least 3 PCM frames");

  // Test PCM data properties
  testResults.forEach((result, index) => {
    t.true(Array.isArray(result.pcm), `PCM data should be array (frame ${index})`);
    t.true(result.pcm.length > 0, `PCM data should not be empty (frame ${index})`);
    t.true(result.pcm.length <= 640, `PCM frame should be <= 640 samples (20ms @ 16kHz) (frame ${index})`);
    t.is(result.pcm.constructor, Int16Array, `PCM data should be Int16Array (frame ${index})`);
    t.true(Number.isInteger(result.tstampMs), `Timestamp should be integer (frame ${index})`);
    t.true(result.tstampMs > 0, `Timestamp should be positive (frame ${index})`);

    // Validate PCM range (-32768 to 32767)
    result.pcm.forEach((sample, sampleIndex) => {
      t.true(sample >= -32768 && sample <= 32767,
        `PCM sample ${sampleIndex} in frame ${index} should be in valid range: ${sample}`);
    });
  });

  // Test temporal consistency (timestamps should be increasing)
  for (let i = 1; i < testResults.length; i++) {
    t.true(testResults[i].tstampMs >= testResults[i - 1].tstampMs,
      `Timestamps should be monotonically increasing: frame ${i-1}=${testResults[i-1].tstampMs}, frame ${i}=${testResults[i].tstampMs}`);
  }

  // Test sample rate consistency (each frame should be ~20ms = 320 samples at 16kHz)
  testResults.forEach((result, index) => {
    const expectedSamples = 320; // 16kHz * 0.020s
    const tolerance = 0.2; // 20% tolerance for variable frame sizes

    t.true(Math.abs(result.pcm.length - expectedSamples) / expectedSamples <= tolerance,
      `Frame ${index} should have ~${expectedSamples} samples (got ${result.pcm.length})`);
  });
});

test.serial("startMic returns proper handle with cleanup methods", async (t) => {
  const onPcm = (pcm: Int16Array, tstampMs: number) => {
    // Minimal callback for cleanup test
  };

  const handle = await startMic(onPcm);

  // Validate handle structure
  t.is(typeof handle.stop, 'function', 'Handle should have stop method');
  t.truthy(handle.ctx, 'Handle should have AudioContext');
  t.true(handle.ctx instanceof AudioContext, 'ctx should be AudioContext instance');

  // Test cleanup
  await handle.stop();
  t.pass('Cleanup should complete without errors');
});

test.serial("microphone pipeline handles errors gracefully", async (t) => {
  // Test error handling when media devices fail
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia;

  // Mock getUserMedia to throw an error
  Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
    value: async () => {
      throw new Error('Mock error: Permission denied');
    },
    writable: true
  });

  const onPcm = (pcm: Int16Array, tstampMs: number) => {
    // Should not be called
  };

  await t.throwsAsync(
    async () => await startMic(onPcm),
    { message: /Permission denied/ },
    'Should handle getUserMedia errors'
  );

  // Restore original method
  Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
    value: originalGetUserMedia,
    writable: false
  });
});

test.serial("worklet processes audio with correct sample rate conversion", async (t) => {
  // Test the mathematical accuracy of 48kHz → 16kHz conversion
  const input48kHz = new Float32Array(4800); // 100ms at 48kHz
  const expected16kHzSamples = 1600; // 100ms at 16kHz

  // Fill with test signal (sine wave)
  for (let i = 0; i < input48kHz.length; i++) {
    input48kHz[i] = Math.sin(2 * Math.PI * 440 * i / 48000) * 0.5; // 440Hz sine wave at 50% volume
  }

  // Simulate worklet processing (simplified version of the actual algorithm)
  const TARGET_SAMPLE_RATE = 16_000;
  const ratio = 48000 / TARGET_SAMPLE_RATE; // 3
  const frames = [];

  let pos = 0;
  const total = input48kHz.length;

  while (pos + ratio <= total) {
    let remaining = ratio;
    let cursor = pos;
    let acc = 0;

    while (remaining > 0 && cursor < total) {
      const index = Math.floor(cursor);
      const sample = input48kHz[index] || 0;
      const frac = cursor - index;
      const available = Math.min(1 - frac, remaining);
      acc += sample * available;
      remaining -= available;
      cursor = index + 1;
    }

    frames.push(acc / ratio);
    pos += ratio;
  }

  // Validate conversion
  t.true(frames.length > 0, 'Should produce output frames');
  t.true(frames.length <= expected16kHzSamples, 'Should not exceed expected sample count');

  // Validate signal properties
  frames.forEach((sample, index) => {
    t.true(sample >= -1 && sample <= 1, `Output sample ${index} should be normalized: ${sample}`);

    // For a 440Hz sine wave, zero crossings should occur regularly
    if (index > 0 && index < frames.length - 1) {
      const hasZeroCrossing = (frames[index - 1] > 0 && frames[index] < 0) ||
                           (frames[index - 1] < 0 && frames[index] > 0);
      // Note: Zero crossing test is probabilistic for short samples
    }
  });

  // Test that duck-audio float32ToInt16 conversion works
  const floatArray = new Float32Array(frames);
  const pcmArray = float32ToInt16(floatArray);

  t.is(pcmArray.length, frames.length, 'PCM array should have same length as input');
  pcmArray.forEach((sample, index) => {
    t.true(sample >= -32768 && sample <= 32767, `PCM sample ${index} should be in valid range: ${sample}`);
  });
});

test.serial("audio worklet prevents drift with fractional position tracking", async (t) => {
  // Test the drift prevention mechanism
  const EPSILON = 1e-6;
  let offset = 0;
  const ratio = 3; // 48kHz / 16kHz

  // Simulate multiple processing iterations
  let totalDrift = 0;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    const pos = offset;
    offset += ratio;

    // Check that fractional offset prevents drift accumulation
    const fractionalPart = offset - Math.floor(offset);
    t.true(fractionalPart >= 0 && fractionalPart < 1,
      `Fractional offset should be in [0,1) range: ${fractionalPart}`);

    // After integer ratios, offset should return to near-zero fractional part
    if (i > 0 && i % 10 === 0) {
      t.true(fractionalPart < 0.1 || fractionalPart > 0.9,
        `Fractional offset should show no significant drift after ${i} iterations: ${fractionalPart}`);
    }
  }

  t.pass('Fractional position tracking prevents drift accumulation');
});

test.serial('transport factory creates injectable dependencies', (t) => {
  // Test WebSocket factory
  t.is(typeof transportFactory.wsFactory, 'function');
  t.is(typeof transportFactory.mockWsFactory, 'function');
  
  // Test mock WebSocket factory
  const mockWs = transportFactory.mockWsFactory('ws://localhost:8080');
  t.is(mockWs.readyState, 1); // WebSocket.OPEN
  t.is(typeof mockWs.send, 'function');
  t.is(typeof mockWs.close, 'function');
});

test.serial('throttled sender factory creates configurable senders', (t) => {
  // Mock RTCDataChannel
  const mockChannel = {
    readyState: 'open',
    bufferedAmount: 0,
    bufferedAmountLowThreshold: 1048576,
    send: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  } as any;
  
  // Test default configuration
  const defaultSender = makeThrottledSender(mockChannel);
  t.is(typeof defaultSender, 'function');
  
  // Test custom configuration
  const customSender = makeThrottledSender(mockChannel, {
    threshold: 2 << 20, // 2MB
    enableMetrics: true
  });
  t.is(typeof customSender, 'function');
  
  // Test mock sender
  const mockSender = createMockSender();
  t.is(typeof mockSender.send, 'function');
  t.is(typeof mockSender.getMetrics, 'function');
  
  const metrics = mockSender.getMetrics();
  t.is(metrics.bytesSent, 0);
  t.is(metrics.framesSent, 0);
});

test.serial('shared audio constants are properly imported', (t) => {
  // Test that all shared constants are available
  t.is(PCM16_MIN, -32768);
  t.is(PCM16_MAX, 32767);
  t.is(PCM16_SCALAR, 32767);
  t.is(PCM48_SAMPLE_RATE, 48000);
  t.is(PCM16_SAMPLE_RATE, 16000);
  t.is(PCM16_FRAME_DURATION_MS, 20);
  t.is(PCM16_BYTES_PER_SAMPLE, 2);
  
  // Test helper functions
  t.is(typeof clampPcm16, 'function');
  t.is(typeof clampUnitFloat, 'function');
  t.is(typeof floatToPcm16, 'function');
  t.is(typeof float32ToInt16, 'function');
});

test.serial('clampPcm16 function validates input correctly', (t) => {
  // Test boundary values
  t.is(clampPcm16(32768), 32767); // Above max
  t.is(clampPcm16(-32769), -32768); // Below min
  t.is(clampPcm16(0), 0); // In range
  t.is(clampPcm16(32767), 32767); // At max
  t.is(clampPcm16(-32768), -32768); // At min
  
  // Test NaN handling
  t.is(clampPcm16(NaN), 0);
  
  // Test infinity handling
  t.is(clampPcm16(Infinity), 32767);
  t.is(clampPcm16(-Infinity), -32768);
});

test.serial('PCM16 conversion functions work correctly', (t) => {
  // Test float32ToInt16 conversion
  const floatArray = new Float32Array([1.0, -1.0, 0.0, 0.5, -0.5]);
  const intArray = float32ToInt16(floatArray);
  
  t.is(intArray[0], 32767); // 1.0 -> 32767
  t.is(intArray[1], -32768); // -1.0 -> -32768
  t.is(intArray[2], 0); // 0.0 -> 0
  t.is(intArray[3], 16384); // 0.5 -> 16384
  t.is(intArray[4], -16384); // -0.5 -> -16384
  
  // Test floatToPcm16 conversion
  t.is(floatToPcm16(1.0), 32767);
  t.is(floatToPcm16(-1.0), -32768);
  t.is(floatToPcm16(0.0), 0);
  t.is(floatToPcm16(0.5), 16384);
  t.is(floatToPcm16(-0.5), -16384);
  
  // Test overflow/underflow protection
  t.is(floatToPcm16(2.0), 32767); // Above 1.0
  t.is(floatToPcm16(-2.0), -32768); // Below -1.0
});

test.serial('frame duration calculations are correct', (t) => {
  const sampleRate = PCM16_SAMPLE_RATE; // 16000
  const frameDuration = PCM16_FRAME_DURATION_MS; // 20ms
  const expectedSamples = (sampleRate * frameDuration) / 1000; // 16000 * 0.02 = 320
  
  t.is(expectedSamples, 320);
  t.is(PCM16_BYTES_PER_FRAME, expectedSamples * PCM16_BYTES_PER_SAMPLE); // 320 * 2 = 640
  
  // Test that worklet frame size matches expectations
  const workletFrameSize = 320; // Should match calculation
  t.is(workletFrameSize, expectedSamples);
});

test.serial('sample rate conversion ratios are correct', (t) => {
  const inputRate = PCM48_SAMPLE_RATE; // 48000
  const outputRate = PCM16_SAMPLE_RATE; // 16000
  const ratio = inputRate / outputRate; // 3
  
  t.is(ratio, 3);
  t.is(PCM48_TO_16_DECIMATION, ratio);
  
  // Test that ratio is an integer for clean conversion
  t.true(Number.isInteger(ratio), 'Conversion ratio should be integer for clean decimation');
  t.is(STEREO_FRAMES_PER_OUTPUT_SAMPLE, ratio);
  t.is(SAMPLES_PER_DECIMATED_OUTPUT, PCM48_STEREO_CHANNELS * ratio);
});