# @promethean-os/duck-audio

Audio processing utilities for PCM16 conversion and audio format handling.

## Installation

```bash
pnpm add @promethean-os/duck-audio
```

## Usage

```typescript
import {
  float32ToInt16,
  clampPcm16,
  floatToPcm16,
  PCM16_MIN,
  PCM16_MAX,
} from '@promethean-os/duck-audio';

// Convert Float32Array to Int16Array
const floatData = new Float32Array([0.5, -0.8, 1.0, -1.0]);
const intData = float32ToInt16(floatData);

// Clamp PCM16 values
const clamped = clampPcm16(-40000); // Returns -32768

// Convert float to PCM16
const pcm16 = floatToPcm16(0.75); // Returns 24575
```

## Constants

- `PCM16_MIN` (-32768) - Minimum 16-bit PCM value
- `PCM16_MAX` (32767) - Maximum 16-bit PCM value
- `PCM16_SCALAR` (32767) - Scaling factor for float to PCM16 conversion
- `PCM48_SAMPLE_RATE` (48000) - 48kHz sample rate
- `PCM16_SAMPLE_RATE` (16000) - 16kHz sample rate
- `PCM48_TO_16_DECIMATION` (3) - Decimation ratio for 48kHz→16kHz

## Functions

### Audio Conversion

- `float32ToInt16(inSeq: Float32Array): Int16Array` - Convert Float32Array to Int16Array
- `floatToPcm16(value: number): number` - Convert normalized float to PCM16

### Clamping Utilities

- `clampPcm16(value: number): number` - Clamp value to int16 range
- `clampUnitFloat(value: number): number` - Clamp value to [-1, 1] range

### Audio Processing

- `averageStereoFrame(left: number, right: number): number` - Average stereo channels
