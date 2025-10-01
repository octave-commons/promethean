import { randomUUID } from "node:crypto";
import type { Envelope } from "./types/envelope.js";
import type { StreamFrame } from "./types/streams.js";

interface StreamState {
  expectedSeq: number;
  paused: boolean;
  degraded: boolean;
}

interface FlowNackPayload {
  streamId: string;
  missing: number[];
}

interface FlowPausePayload {
  streamId: string;
}

interface FlowResumePayload {
  streamId: string;
}

interface StatePatchPayload {
  room: string;
  voice: Record<string, "ok" | "degraded" | "paused">;
}

function nowIso(): string {
  return new Date().toISOString();
}

function mkEnvelope<T>(type: string, payload: T): Envelope<T> {
  return {
    id: randomUUID(),
    ts: nowIso(),
    room: "flow",
    from: "enso-flow-controller",
    kind: "event",
    type,
    payload,
  };
}

function range(from: number, toExclusive: number): number[] {
  const values: number[] = [];
  for (let value = from; value < toExclusive; value += 1) {
    values.push(value);
  }
  return values;
}

export class FlowController {
  private readonly streams = new Map<string, StreamState>();
  private readonly room: string;

  constructor(room: string) {
    this.room = room;
  }

  register(streamId: string, initialSeq = 0): void {
    this.streams.set(streamId, {
      expectedSeq: initialSeq,
      paused: false,
      degraded: false,
    });
  }

  handleFrame(
    frame: StreamFrame,
  ): Array<Envelope<FlowNackPayload | FlowPausePayload>> {
    if (!this.streams.has(frame.streamId)) {
      this.register(frame.streamId, frame.seq + 1);
      return [];
    }
    const state = this.streams.get(frame.streamId)!;
    if (state.paused) {
      return [mkEnvelope("flow.pause", { streamId: frame.streamId })];
    }
    const envelopes: Array<Envelope<FlowNackPayload | FlowPausePayload>> = [];
    if (frame.seq !== state.expectedSeq) {
      if (frame.seq > state.expectedSeq) {
        const missing = range(state.expectedSeq, frame.seq);
        envelopes.push(
          mkEnvelope("flow.nack", { streamId: frame.streamId, missing }),
        );
        state.expectedSeq = frame.seq + 1;
      } else {
        // duplicate or out-of-order older frame, request resend if gap persists
        envelopes.push(
          mkEnvelope("flow.nack", {
            streamId: frame.streamId,
            missing: [state.expectedSeq],
          }),
        );
      }
    } else {
      state.expectedSeq += 1;
    }
    if (frame.eof) {
      this.streams.delete(frame.streamId);
    }
    return envelopes;
  }

  pause(streamId: string): Envelope<FlowPausePayload> | undefined {
    const state = this.streams.get(streamId);
    if (!state || state.paused) {
      return undefined;
    }
    state.paused = true;
    return mkEnvelope("flow.pause", { streamId });
  }

  resume(streamId: string): Envelope<FlowResumePayload> | undefined {
    const state = this.streams.get(streamId);
    if (!state || !state.paused) {
      return undefined;
    }
    state.paused = false;
    return mkEnvelope("flow.resume", { streamId });
  }

  markDegraded(streamId: string): Envelope<StatePatchPayload> | undefined {
    const state = this.streams.get(streamId);
    if (!state || state.degraded) {
      return undefined;
    }
    state.degraded = true;
    return mkEnvelope("state.patch", {
      room: this.room,
      voice: { [streamId]: "degraded" },
    });
  }
}
