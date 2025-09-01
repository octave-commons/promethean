import { AgentRuntime } from "@shared/ts/dist/agent/runtime.js";
import { AgentEnvelope } from "@shared/ts/dist/agent/envelope.js";

// Intent names (adjust per agent)
const IN_TOPIC = "promethean.p.*.t.*.voice.audio.segment";
const OUT_TOPIC = "promethean.p.{provider}.t.{tenant}.voice.audio.something";

type InputPayload = {
  session_id: string;
  segment_id: string;
  data_path: string;
  format: { rate_hz: number; channels: number; codec: "pcm_s16le" };
};

type OutputPayload = {
  session_id: string;
  segment_id: string;
  result_path: string;
  idempotency_key: string;
};

export async function start(runtime: AgentRuntime) {
  // Subscribe with a single handler; runtime should support wildcard or binding per-tenant.
  await runtime.subscribe(
    IN_TOPIC,
    async (msg: AgentEnvelope<InputPayload>) => {
      const { provider, tenant } = msg;
      const outPayload = await transform(msg.payload);
      const out: AgentEnvelope<OutputPayload> = {
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        src: "your-agent",
        dst: OUT_TOPIC.replace("{provider}", provider).replace(
          "{tenant}",
          tenant,
        ),
        provider,
        tenant,
        intent: "voice.audio.something",
        corr: msg.corr ?? msg.id,
        payload: outPayload,
      };
      await runtime.publish(out.dst, out);
    },
  );
}

/**
 * Pure transform: same input -> same output.
 * Do not read tokens or mutate external durable state here.
 */
export async function transform(p: InputPayload): Promise<OutputPayload> {
  // Example: derive deterministic idempotency key
  const idempotency_key = `${p.session_id}:${p.segment_id}`;

  // TODO: real work: read p.data_path, compute result, write to temp file via effects.fs (passed through runtime)
  const result_path = `/var/promethean/tmp/${p.session_id}_${p.segment_id}.bin`;

  return {
    session_id: p.session_id,
    segment_id: p.segment_id,
    result_path,
    idempotency_key,
  };
}
