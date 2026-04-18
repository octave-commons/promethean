import type {
  SignalEvent,
  Thread,
  ReducedSnapshot,
  ConnectionOpportunity,
  ActionCard,
} from "@workspace/radar-core";

export function toAtprotoSignalEvent(event: SignalEvent): Record<string, unknown> {
  return {
    $type: "app.openhax.radar.signalEvent",
    provenanceSource: event.provenance.source_type,
    provenanceAuthor: event.provenance.author,
    provenancePostUri: event.provenance.post_uri,
    provenanceParentUri: event.provenance.parent_uri,
    confidenceClass: event.provenance.confidence_class,
    text: event.text,
    title: event.title,
    links: event.links,
    domainTags: event.domain_tags,
    contentHash: event.content_hash,
    observedAt: event.observed_at,
    ingestedAt: event.ingested_at,
  };
}

export function toAtprotoThread(thread: Thread): Record<string, unknown> {
  return {
    $type: "app.openhax.radar.thread",
    radarId: thread.radar_id,
    kind: thread.kind,
    title: thread.title,
    summary: thread.summary,
    memberRefs: thread.members.map((m) => m.signal_event_id),
    sourceDistribution: thread.source_distribution,
    confidence: thread.confidence,
    domainTags: thread.domain_tags,
    status: thread.status,
    timelineFirstSeen: thread.timeline.first_seen,
    timelineLastUpdated: thread.timeline.last_updated,
    timelinePeakActivity: thread.timeline.peak_activity,
  };
}

export function toAtprotoSnapshot(snapshot: ReducedSnapshot): Record<string, unknown> {
  const signals: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(snapshot.signals)) {
    signals[key] = {
      median: value.median,
      rangeLow: value.range[0],
      rangeHigh: value.range[1],
      agreement: value.agreement,
      sampleSize: value.sample_size,
    };
  }
  return {
    $type: "app.openhax.radar.snapshot",
    radarId: snapshot.radar_id,
    moduleVersionId: snapshot.module_version_id,
    snapshotKind: snapshot.snapshot_kind,
    asOfUtc: snapshot.as_of_utc,
    signals,
    branches: snapshot.branches.map((b) => ({
      name: b.name,
      support: b.support,
      agreement: b.agreement,
      triggers: b.triggers,
    })),
    modelCount: snapshot.model_count,
    disagreementIndex: snapshot.disagreement_index,
    qualityScore: snapshot.quality_score,
  };
}

export function toAtprotoConnectionOpportunity(opp: ConnectionOpportunity): Record<string, unknown> {
  return {
    $type: "app.openhax.radar.connectionOpportunity",
    globalThreadRef: opp.global_thread_id,
    localThreadRefs: opp.local_thread_ids,
    bridgeType: opp.bridge_type,
    title: opp.title,
    summary: opp.summary,
    score: opp.score,
    confidence: opp.confidence,
    rationale: opp.rationale,
    publicBenefit: opp.public_benefit,
    fearFactor: opp.fear_factor,
    realism: opp.realism,
    polarizationRisk: opp.polarization_risk,
    compressionLoss: opp.compression_loss,
    suggestedActions: opp.suggested_actions,
    coordinationPath: opp.coordination_path,
    createdAt: opp.created_at,
  };
}

export function toAtprotoActionCard(card: ActionCard): Record<string, unknown> {
  return {
    $type: "app.openhax.radar.actionCard",
    connectionRef: card.connection_opportunity_id,
    title: card.title,
    description: card.description,
    scope: card.scope,
    effort: card.effort,
    expectedBenefit: card.expected_benefit,
    risk: card.risk,
    riskDescription: card.risk_description,
    feedbackMetricName: card.feedback_metric.name,
    feedbackMetricMeasurement: card.feedback_metric.measurement,
    feedbackMetricBaseline: card.feedback_metric.baseline,
    feedbackMetricTarget: card.feedback_metric.target,
    timeWindowLabel: card.time_window.label,
    timeWindowStart: card.time_window.start,
    timeWindowEnd: card.time_window.end,
    status: card.status,
    outcomeNotes: card.outcome?.notes,
    outcomeFeedbackValue: card.outcome?.feedback_value,
    createdAt: card.created_at,
  };
}
