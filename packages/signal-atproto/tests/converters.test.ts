import { describe, it, expect } from "vitest";
import {
  toAtprotoSignalEvent,
  toAtprotoThread,
  toAtprotoSnapshot,
  toAtprotoConnectionOpportunity,
  toAtprotoActionCard,
} from "../src/converters.js";
import type {
  SignalEvent,
  Thread,
  ReducedSnapshot,
  ConnectionOpportunity,
  ActionCard,
} from "@workspace/radar-core";

const NOW = new Date().toISOString();

describe("AT Protocol record serialization", () => {
  describe("toAtprotoSignalEvent", () => {
    const signalEvent: SignalEvent = {
      id: "sig-001",
      provenance: {
        source_type: "bluesky",
        author: "alice.bsky.social",
        post_uri: "at://did:plc:abc/app.bsky.feed.post/123",
        parent_uri: undefined,
        confidence_class: "firsthand",
        retrieved_at: NOW,
      },
      text: "Infrastructure disruption reported",
      title: "Alert",
      links: ["https://example.com"],
      domain_tags: ["infrastructure"],
      observed_at: NOW,
      ingested_at: NOW,
      content_hash: "sha256:abc",
      metadata: {},
    };

    it("serializes a SignalEvent to AT Protocol record format", () => {
      const record = toAtprotoSignalEvent(signalEvent);
      expect(record.$type).toBe("app.openhax.radar.signalEvent");
      expect(record.provenanceSource).toBe("bluesky");
      expect(record.provenanceAuthor).toBe("alice.bsky.social");
      expect(record.provenancePostUri).toBe("at://did:plc:abc/app.bsky.feed.post/123");
      expect(record.text).toBe("Infrastructure disruption reported");
      expect(record.title).toBe("Alert");
      expect(record.links).toEqual(["https://example.com"]);
      expect(record.domainTags).toEqual(["infrastructure"]);
      expect(record.contentHash).toBe("sha256:abc");
      expect(record.observedAt).toBe(NOW);
      expect(record.ingestedAt).toBe(NOW);
    });

    it("handles optional/undefined provenance fields gracefully", () => {
      const minimalEvent: SignalEvent = {
        id: "sig-002",
        provenance: {
          source_type: "reddit",
          retrieved_at: NOW,
          confidence_class: "unknown",
        },
        text: "Some text",
        links: [],
        domain_tags: [],
        observed_at: NOW,
        ingested_at: NOW,
        metadata: {},
      };
      const record = toAtprotoSignalEvent(minimalEvent);
      expect(record.$type).toBe("app.openhax.radar.signalEvent");
      expect(record.provenanceAuthor).toBeUndefined();
      expect(record.provenancePostUri).toBeUndefined();
      expect(record.provenanceParentUri).toBeUndefined();
      expect(record.title).toBeUndefined();
      expect(record.contentHash).toBeUndefined();
    });
  });

  describe("toAtprotoThread", () => {
    const thread: Thread = {
      id: "thread-001",
      radar_id: "radar-001",
      kind: "event",
      title: "Energy crisis thread",
      summary: "Multiple signals about energy supply issues",
      members: [
        { signal_event_id: "sig-001", relevance: 0.9, added_at: NOW },
        { signal_event_id: "sig-002", relevance: 0.7, added_at: NOW },
      ],
      source_distribution: { bluesky: 0.6, reddit: 0.4 },
      confidence: 0.85,
      timeline: {
        first_seen: NOW,
        last_updated: NOW,
        peak_activity: NOW,
      },
      domain_tags: ["energy", "infrastructure"],
      status: "active",
    };

    it("serializes a Thread to AT Protocol record format with member refs", () => {
      const record = toAtprotoThread(thread);
      expect(record.$type).toBe("app.openhax.radar.thread");
      expect(record.radarId).toBe("radar-001");
      expect(record.kind).toBe("event");
      expect(record.title).toBe("Energy crisis thread");
      expect(record.memberRefs).toEqual(["sig-001", "sig-002"]);
      expect(record.sourceDistribution).toEqual({ bluesky: 0.6, reddit: 0.4 });
      expect(record.confidence).toBe(0.85);
      expect(record.domainTags).toEqual(["energy", "infrastructure"]);
      expect(record.status).toBe("active");
      expect(record.timelineFirstSeen).toBe(NOW);
      expect(record.timelineLastUpdated).toBe(NOW);
      expect(record.timelinePeakActivity).toBe(NOW);
    });
  });

  describe("toAtprotoSnapshot", () => {
    const snapshot: ReducedSnapshot = {
      id: "snap-001",
      radar_id: "radar-001",
      module_version_id: "mv-001",
      snapshot_kind: "live",
      as_of_utc: NOW,
      signals: {
        geopolitical: {
          median: 2.5,
          range: [1, 4],
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
          support: "moderate",
          agreement: 0.6,
          sample_size: 2,
          triggers: ["military buildup"],
        },
      ],
      model_count: 2,
      disagreement_index: 0.3,
      quality_score: 0.8,
      render_state: {},
    };

    it("serializes a ReducedSnapshot with flattened signal ranges", () => {
      const record = toAtprotoSnapshot(snapshot);
      expect(record.$type).toBe("app.openhax.radar.snapshot");
      expect(record.radarId).toBe("radar-001");
      expect(record.snapshotKind).toBe("live");
      expect(record.modelCount).toBe(2);
      expect(record.disagreementIndex).toBe(0.3);
      expect(record.qualityScore).toBe(0.8);

      // Check signal range flattening
      const signals = record.signals as Record<string, unknown>;
      const geo = signals["geopolitical"] as Record<string, unknown>;
      expect(geo.median).toBe(2.5);
      expect(geo.rangeLow).toBe(1);
      expect(geo.rangeHigh).toBe(4);
      expect(geo.agreement).toBe(0.7);

      // Check branches
      const branches = record.branches as Array<Record<string, unknown>>;
      expect(branches).toHaveLength(1);
      expect(branches[0].name).toBe("Escalation");
      expect(branches[0].support).toBe("moderate");
      expect(branches[0].triggers).toEqual(["military buildup"]);
    });
  });

  describe("toAtprotoConnectionOpportunity", () => {
    const conn: ConnectionOpportunity = {
      id: "conn-001",
      global_thread_id: "thread-001",
      local_thread_ids: ["thread-local-001", "thread-local-002"],
      bridge_type: "global_to_local",
      title: "Energy → AI Compute",
      summary: "Global energy disruption impacts local AI infrastructure",
      score: 0.78,
      confidence: 0.65,
      rationale: ["Energy prices affect data center costs"],
      user_expertise_tags: [],
      community_refs: [],
      public_benefit: 72,
      fear_factor: 35,
      realism: 80,
      polarization_risk: 15,
      compression_loss: 20,
      suggested_actions: ["Monitor prices"],
      coordination_path: "community-resilience",
      created_at: NOW,
      updated_at: NOW,
    };

    it("serializes a ConnectionOpportunity preserving scoring dimensions", () => {
      const record = toAtprotoConnectionOpportunity(conn);
      expect(record.$type).toBe("app.openhax.radar.connectionOpportunity");
      expect(record.globalThreadRef).toBe("thread-001");
      expect(record.localThreadRefs).toEqual(["thread-local-001", "thread-local-002"]);
      expect(record.bridgeType).toBe("global_to_local");
      expect(record.title).toBe("Energy → AI Compute");
      expect(record.score).toBe(0.78);
      expect(record.publicBenefit).toBe(72);
      expect(record.fearFactor).toBe(35);
      expect(record.realism).toBe(80);
      expect(record.polarizationRisk).toBe(15);
      expect(record.compressionLoss).toBe(20);
      expect(record.suggestedActions).toEqual(["Monitor prices"]);
      expect(record.coordinationPath).toBe("community-resilience");
    });
  });

  describe("toAtprotoActionCard", () => {
    const card: ActionCard = {
      id: "action-001",
      connection_opportunity_id: "conn-001",
      title: "Set up compute monitoring",
      description: "Configure alerts for compute availability",
      scope: "team",
      effort: "hours",
      expected_benefit: "Early warning of cost spikes",
      risk: "low",
      risk_description: "Minimal risk involved",
      feedback_metric: {
        name: "response_time",
        measurement: "minutes",
        baseline: 120,
        target: 15,
      },
      time_window: {
        label: "within 24 hours",
        start: NOW,
        end: NOW,
      },
      status: "proposed",
      outcome: {
        notes: "Completed successfully",
        feedback_value: 12,
      },
      created_at: NOW,
      updated_at: NOW,
    };

    it("serializes an ActionCard with all fields including outcome", () => {
      const record = toAtprotoActionCard(card);
      expect(record.$type).toBe("app.openhax.radar.actionCard");
      expect(record.connectionRef).toBe("conn-001");
      expect(record.title).toBe("Set up compute monitoring");
      expect(record.scope).toBe("team");
      expect(record.effort).toBe("hours");
      expect(record.expectedBenefit).toBe("Early warning of cost spikes");
      expect(record.risk).toBe("low");
      expect(record.riskDescription).toBe("Minimal risk involved");
      expect(record.feedbackMetricName).toBe("response_time");
      expect(record.feedbackMetricMeasurement).toBe("minutes");
      expect(record.feedbackMetricBaseline).toBe(120);
      expect(record.feedbackMetricTarget).toBe(15);
      expect(record.timeWindowLabel).toBe("within 24 hours");
      expect(record.status).toBe("proposed");
      expect(record.outcomeNotes).toBe("Completed successfully");
      expect(record.outcomeFeedbackValue).toBe(12);
    });
  });
});
