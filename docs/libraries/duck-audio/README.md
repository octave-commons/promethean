# duck-audio

Tiny audio utilities shared by browser and node.

## API

```ts
export const clamp16: (x: number) => number
export const float32ToInt16: (f: Float32Array) => Int16Array
```

## Diagram
```mermaid
flowchart LR
  A[Float32 -1..1] --> B[clamp16]
  B --> C[Int16 -32768..32767]
  A --> D[float32ToInt16]
  D --> E[Int16Array]
```

## Consumers
- duck-web PCM16k worklet glue.
- enso-browser-gateway server-side validation/tests.
