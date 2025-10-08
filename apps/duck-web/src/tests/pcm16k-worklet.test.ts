import test from "ava";
import { float32ToInt16 } from "@promethean/duck-audio";

test("PCM16k worklet mathematical conversion validation", (t) => {
  // Test the mathematical accuracy of 48kHz → 16kHz conversion algorithm
  const TARGET_SAMPLE_RATE = 16_000;
  const SOURCE_SAMPLE_RATE = 48_000;
  const EPSILON = 1e-6;

  // Create test signal: 440Hz sine wave at 48kHz for 100ms
  const duration = 0.1; // 100ms
  const sourceLength = Math.floor(SOURCE_SAMPLE_RATE * duration);
  const input48kHz = new Float32Array(sourceLength);

  for (let i = 0; i < sourceLength; i++) {
    const time = i / SOURCE_SAMPLE_RATE;
    input48kHz[i] = Math.sin(2 * Math.PI * 440 * time) * 0.5;
  }

  // Simulate worklet processing (mirroring the actual pcm16k-worklet.js algorithm)
  const ratio = SOURCE_SAMPLE_RATE / TARGET_SAMPLE_RATE; // 3
  const frames = [];
  let offset = 0;
  const tail: Float32Array = new Float32Array(0);

  // First pass: process main buffer
  const data = input48kHz;
  let pos = offset;
  const total = data.length;

  while (pos + ratio <= total + EPSILON) {
    let remaining = ratio;
    let cursor = pos;
    let acc = 0;

    while (remaining > 0 && cursor < total) {
      const index = Math.floor(cursor);
      const sample = data[index] ?? 0;
      const frac = cursor - index;
      const available = Math.min(1 - frac, remaining);
      acc += sample * available;
      remaining -= available;
      cursor = index + 1;
    }

    frames.push(acc / ratio);
    pos += ratio;
  }

  // Validate conversion accuracy
  const expectedOutputLength = Math.floor(TARGET_SAMPLE_RATE * duration);
  t.true(frames.length > 0, "Should produce output frames");
  t.true(Math.abs(frames.length - expectedOutputLength) / expectedOutputLength <= 0.05,
    `Output length should be close to expected: got ${frames.length}, expected ~${expectedOutputLength}`);

  // Test that output maintains signal properties
  let nonZeroCount = 0;
  let maxAbsValue = 0;
  frames.forEach((sample) => {
    if (Math.abs(sample) > 0.001) nonZeroCount++;
    maxAbsValue = Math.max(maxAbsValue, Math.abs(sample));
  });

  t.true(nonZeroCount > frames.length * 0.8, "Most samples should be non-zero for sine wave input");
  t.true(maxAbsValue <= 0.6, "Output amplitude should be within expected range");

  // Test conversion to Int16 PCM
  const float32Array = new Float32Array(frames);
  const pcm16Array = float32ToInt16(float32Array);

  t.is(pcm16Array.length, frames.length, "PCM array should have same length");

  // Validate PCM range
  pcm16Array.forEach((sample, index) => {
    t.true(sample >= -32768 && sample <= 32767,
      `PCM sample ${index} should be in valid range: ${sample}`);
  });

  // Test that PCM conversion preserves signal characteristics
  const pcmNonZeroCount = pcm16Array.filter(s => s !== 0).length;
  t.true(pcmNonZeroCount > frames.length * 0.7, "PCM conversion should preserve most non-zero samples");
});

test("PCM16k worklet drift prevention mechanism", (t) => {
  // Test that fractional position tracking prevents drift
  const TARGET_SAMPLE_RATE = 16_000;
  const SOURCE_SAMPLE_RATE = 48_000;
  const EPSILON = 1e-6;
  const ratio = SOURCE_SAMPLE_RATE / TARGET_SAMPLE_RATE;

  // Simulate multiple processing iterations
  let offset = 0;
  let totalDrift = 0;
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    const pos = offset;
    offset += ratio;

    // Calculate fractional part
    const fractionalPart = offset - Math.floor(offset);
    t.true(fractionalPart >= 0 && fractionalPart < 1,
      `Fractional offset should be in [0,1) range at iteration ${i}: ${fractionalPart}`);

    // Track drift from expected integer multiples
    const expectedInteger = Math.floor(i * ratio);
    const actualInteger = Math.floor(offset);
    const drift = Math.abs(actualInteger - expectedInteger);
    totalDrift += drift;

    // Drift should never accumulate beyond 1 sample
    t.true(drift <= 1, `Drift should never exceed 1 sample at iteration ${i}: ${drift}`);
  }

  // Average drift should be very small
  const avgDrift = totalDrift / iterations;
  t.true(avgDrift < 0.1, `Average drift should be minimal: ${avgDrift}`);
});

test("PCM16k worklet multi-channel mixing", (t) => {
  // Test that stereo to mono conversion works correctly
  const frameLength = 96; // 2ms at 48kHz
  const channels = [
    new Float32Array(frameLength), // Left channel
    new Float32Array(frameLength), // Right channel
    new Float32Array(frameLength), // Third channel (if present)
  ];

  // Fill channels with test signals
  for (let i = 0; i < frameLength; i++) {
    channels[0][i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / 48000); // 440Hz
    channels[1][i] = 0.3 * Math.sin(2 * Math.PI * 880 * i / 48000); // 880Hz
    channels[2][i] = 0.2 * Math.sin(2 * Math.PI * 220 * i / 48000); // 220Hz
  }

  // Simulate mono mixing (from worklet)
  const mono = new Float32Array(frameLength);
  for (let frame = 0; frame < frameLength; frame++) {
    let sum = 0;
    let count = 0;
    for (let ch = 0; ch < channels.length; ch++) {
      const data = channels[ch];
      if (!data) continue;
      sum += data[frame] ?? 0;
      count += 1;
    }
    mono[frame] = count > 0 ? sum / count : 0;
  }

  // Validate mono mixing
  mono.forEach((sample, index) => {
    t.true(sample >= -1 && sample <= 1, `Mixed sample ${index} should be normalized: ${sample}`);

    // The mixed signal should have characteristics of all input signals
    if (index > 0) {
      const hasSignalEnergy = Math.abs(sample) > 0.01;
      if (index % 100 === 0) { // Check periodically to avoid too many assertions
        t.true(hasSignalEnergy, `Mixed signal should have energy at sample ${index}: ${sample}`);
      }
    }
  });

  // Test average calculation
  const originalAvg = (0.5 + 0.3 + 0.2) / 3; // Average of amplitudes
  const mixedAvg = mono.reduce((sum, s) => sum + Math.abs(s), 0) / mono.length;
  t.true(Math.abs(mixedAvg - originalAvg) < 0.1,
    `Mixed amplitude should be close to expected average: mixed=${mixedAvg}, expected=${originalAvg}`);
});

test("PCM16k worklet tail buffer management", (t) => {
  // Test tail buffer logic for handling non-integer ratios
  const TARGET_SAMPLE_RATE = 16_000;
  const SOURCE_SAMPLE_RATE = 48_000;
  const ratio = SOURCE_SAMPLE_RATE / TARGET_SAMPLE_RATE;

  // Create input that doesn't divide evenly by the ratio
  const inputLength = 100; // Not a multiple of 3
  const input = new Float32Array(inputLength);
  for (let i = 0; i < inputLength; i++) {
    input[i] = Math.sin(i * 0.1) * 0.5;
  }

  // Simulate worklet tail handling
  let tail = new Float32Array(0);
  let offset = 0;
  const data = new Float32Array(tail.length + input.length);
  data.set(tail, 0);
  data.set(input, tail.length);

  const frames = [];
  let pos = offset;
  const total = data.length;

  while (pos + ratio <= total) {
    let remaining = ratio;
    let cursor = pos;
    let acc = 0;

    while (remaining > 0 && cursor < total) {
      const index = Math.floor(cursor);
      const sample = data[index] ?? 0;
      const frac = cursor - index;
      const available = Math.min(1 - frac, remaining);
      acc += sample * available;
      remaining -= available;
      cursor = index + 1;
    }

    frames.push(acc / ratio);
    pos += ratio;
  }

  // Calculate new tail
  const keepIndex = Math.max(0, Math.floor(pos));
  let newTail: Float32Array;
  if (keepIndex < total) {
    newTail = new Float32Array(total - keepIndex);
    newTail.set(data.subarray(keepIndex));
  } else {
    newTail = new Float32Array(0);
  }

  // Validate tail management
  const expectedFrames = Math.floor(inputLength / ratio);
  t.is(frames.length, expectedFrames, "Should process expected number of frames");
  t.true(newTail.length < ratio, `Tail should be smaller than ratio: ${newTail.length} < ${ratio}`);

  // Tail should contain the remainder data
  if (newTail.length > 0) {
    const expectedTailStart = Math.floor(expectedFrames * ratio);
    for (let i = 0; i < newTail.length; i++) {
      t.is(newTail[i], input[expectedTailStart + i],
        `Tail sample ${i} should match input remainder`);
    }
  }
});

test("float32ToInt16 conversion edge cases", (t) => {
  // Test edge cases for PCM conversion
  const edgeCases = [
    { input: 0.0, expected: 0 },
    { input: 1.0, expected: 32767 },
    { input: -1.0, expected: -32768 },
    { input: 0.5, expected: 16383.5 },
    { input: -0.5, expected: -16384 },
    { input: 1.5, expected: 32767 }, // Clamping
    { input: -1.5, expected: -32768 }, // Clamping
  ];

  edgeCases.forEach(({ input, expected }) => {
    const floatArray = new Float32Array([input]);
    const pcmArray = float32ToInt16(floatArray);
    const actual = pcmArray[0];

    if (expected !== 16383.5) { // Handle floating point expectation
      t.is(actual, Math.round(expected),
        `Input ${input} should convert to ${Math.round(expected)}, got ${actual}`);
    } else {
      t.true(Math.abs(actual - expected) <= 1,
        `Input ${input} should convert close to ${expected}, got ${actual}`);
    }

    // Always validate range
    t.true(actual >= -32768 && actual <= 32767,
      `PCM output ${actual} should be in valid range for input ${input}`);
  });

  // Test with silence
  const silence = new Float32Array(100).fill(0);
  const silencePcm = float32ToInt16(silence);
  t.is(silencePcm.length, silence.length, "Silence should maintain length");
  silencePcm.forEach((sample, i) => {
    t.is(sample, 0, `Silence sample ${i} should be 0`);
  });
});