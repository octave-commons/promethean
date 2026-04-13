import { describe, it, expect } from "vitest";
import {
  signalEventSchema,
  signalEventProvenanceSchema,
  threadSchema,
  threadMembershipSchema,
  connectionOpportunitySchema,
  actionCardSchema,
  radarSchema,
  reducedSnapshotSchema,
} from "../src/schema.js";

const NOW = new Date().toISOString();

// ---------- SignalEvent ----------

describe("SignalEvent schema", () => {
  const validSignalEvent = {
    id: "sig-001",
    provenance: {
      source_type: "bluesky" as const,
      author: "alice.bsky.social",
      post_uri: "at://did:plc:abc/app.bsky.feed.post/123",
      confidence_class: "firsthand" as const,
      retrieved_at: NOW,
    },
    text: "Breaking: major infrastructure disruption reported in the region.",
    title: "Infrastructure alert",
    links: ["https://example.com/article"],
    domain_tags: ["infrastructure", "geopolitical"],
    observed_at: NOW,
    ingested_at: NOW,
    content_hash: "sha256:abc123",
    metadata: { source_list: "curated-geopolitical" },
  };

  it("validates a well-formed SignalEvent", () => {
    const result = signalEventSchema.safeParse(validSignalEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("sig-001");
      expect(result.data.provenance.source_type).toBe("bluesky");
    }
  });

  it("rejects a SignalEvent with missing required fields", () => {
    const result = signalEventSchema.safeParse({
      id: "sig-002",
      // missing provenance, text, observed_at, ingested_at
    });
    expect(result.success).toBe(false);
  });

  it("rejects a SignalEvent with empty id", () => {
    const result = signalEventSchema.safeParse({
      ...validSignalEvent,
      id: "",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional array fields", () => {
    const minimal = {
      id: "sig-003",
      provenance: {
        source_type: "reddit" as const,
        retrieved_at: NOW,
      },
      text: "Some content",
      observed_at: NOW,
      ingested_at: NOW,
    };
    const result = signalEventSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.links).toEqual([]);
      expect(result.data.domain_tags).toEqual([]);
      expect(result.data.metadata).toEqual({});
      expect(result.data.provenance.confidence_class).toBe("unknown");
    }
  });
});

// ---------- Thread ----------

describe("Thread schema", () => {
  const validThread = {
    id: "thread-001",
    kind: "event" as const,
    title: "Energy supply disruption thread",
    summary: "Multiple signals about energy grid issues",
    members: [
      {
        signal_event_id: "sig-001",
        relevance: 0.95,
        added_at: NOW,
      },
      {
        signal_event_id: "sig-002",
        relevance: 0.8,
        added_at: NOW,
      },
    ],
    source_distribution: { bluesky: 0.6, reddit: 0.4 },
    confidence: 0.85,
    timeline: {
      first_seen: NOW,
      last_updated: NOW,
    },
    domain_tags: ["energy", "infrastructure"],
    status: "active" as const,
  };

  it("validates a well-formed Thread", () => {
    const result = threadSchema.safeParse(validThread);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("thread-001");
      expect(result.data.kind).toBe("event");
      expect(result.data.members).toHaveLength(2);
    }
  });

  it("rejects a Thread with invalid kind", () => {
    const result = threadSchema.safeParse({
      ...validThread,
      kind: "invalid_kind",
    });
    expect(result.success).toBe(false);
  });

  it("applies default status as 'emerging'", () => {
    const { status, ...withoutStatus } = validThread;
    const result = threadSchema.safeParse(withoutStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("emerging");
    }
  });
});

// ---------- ConnectionOpportunity ----------

describe("ConnectionOpportunity schema", () => {
  const validConnection = {
    id: "conn-001",
    global_thread_id: "thread-001",
    local_thread_ids: ["thread-local-001"],
    bridge_type: "global_to_local" as const,
    title: "Energy grid stress → local AI infra impact",
    summary: "Global energy disruption may affect local AI compute availability",
    score: 0.78,
    confidence: 0.65,
    rationale: ["Energy prices affect data center costs", "Local AI labs rely on stable power"],
    public_benefit: 72,
    fear_factor: 35,
    realism: 80,
    polarization_risk: 15,
    compression_loss: 20,
    suggested_actions: ["Monitor local energy prices", "Prepare backup compute plans"],
    coordination_path: "community-energy-resilience",
    created_at: NOW,
    updated_at: NOW,
  };

  it("validates a well-formed ConnectionOpportunity", () => {
    const result = connectionOpportunitySchema.safeParse(validConnection);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("conn-001");
      expect(result.data.bridge_type).toBe("global_to_local");
      expect(result.data.score).toBe(0.78);
    }
  });

  it("rejects ConnectionOpportunity with score out of range", () => {
    const result = connectionOpportunitySchema.safeParse({
      ...validConnection,
      score: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

// ---------- ActionCard ----------

describe("ActionCard schema", () => {
  const validActionCard = {
    id: "action-001",
    connection_opportunity_id: "conn-001",
    title: "Set up backup compute monitoring",
    description: "Configure alerts for local compute availability based on energy grid signals",
    scope: "team" as const,
    effort: "hours" as const,
    expected_benefit: "Early warning of compute cost spikes",
    risk: "low" as const,
    feedback_metric: {
      name: "alert_response_time",
      measurement: "minutes from signal to team notification",
      baseline: 120,
      target: 15,
    },
    time_window: {
      label: "within 24 hours",
      start: NOW,
    },
    status: "proposed" as const,
    created_at: NOW,
    updated_at: NOW,
  };

  it("validates a well-formed ActionCard", () => {
    const result = actionCardSchema.safeParse(validActionCard);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("action-001");
      expect(result.data.scope).toBe("team");
      expect(result.data.effort).toBe("hours");
      expect(result.data.feedback_metric.name).toBe("alert_response_time");
    }
  });

  it("rejects ActionCard with invalid scope enum value", () => {
    const result = actionCardSchema.safeParse({
      ...validActionCard,
      scope: "galaxy",
    });
    expect(result.success).toBe(false);
  });
});

// ---------- Radar (core config) ----------

describe("Radar schema", () => {
  it("validates a well-formed Radar", () => {
    const validRadar = {
      id: "radar-001",
      slug: "hormuz-energy",
      name: "Hormuz Energy Monitor",
      category: "geopolitical",
      status: "active" as const,
      created_at: NOW,
      updated_at: NOW,
    };
    const result = radarSchema.safeParse(validRadar);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("hormuz-energy");
    }
  });
});

// ---------- ReducedSnapshot ----------

describe("ReducedSnapshot schema", () => {
  it("validates a well-formed ReducedSnapshot with score ranges", () => {
    const snapshot = {
      id: "snap-001",
      radar_id: "radar-001",
      module_version_id: "mv-001",
      snapshot_kind: "live" as const,
      as_of_utc: NOW,
      signals: {
        geopolitical_stress: {
          median: 2.5,
          range: [1, 4] as [number, number],
          agreement: 0.7,
          sample_size: 3,
          weighted_values: [
            { value: 2, weight: 0.5, model_id: "model-a" },
            { value: 3, weight: 0.5, model_id: "model-b" },
          ],
        },
      },
      branches: [
        {
          name: "Escalation",
          support: "moderate" as const,
          agreement: 0.6,
          sample_size: 2,
          triggers: ["military buildup", "diplomatic breakdown"],
        },
      ],
      model_count: 2,
      disagreement_index: 0.3,
      quality_score: 0.8,
    };
    const result = reducedSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disagreement_index).toBe(0.3);
      expect(result.data.signals["geopolitical_stress"].range).toEqual([1, 4]);
    }
  });
});
