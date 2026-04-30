export const LEXICON_SIGNAL_EVENT = "app.openhax.radar.signalEvent" as const;
export const LEXICON_THREAD = "app.openhax.radar.thread" as const;
export const LEXICON_GAUGE_DEFINITION = "app.openhax.radar.gaugeDefinition" as const;
export const LEXICON_SNAPSHOT = "app.openhax.radar.snapshot" as const;
export const LEXICON_CONNECTION_OPPORTUNITY = "app.openhax.radar.connectionOpportunity" as const;
export const LEXICON_ACTION_CARD = "app.openhax.radar.actionCard" as const;

export type LexiconId =
  | typeof LEXICON_SIGNAL_EVENT
  | typeof LEXICON_THREAD
  | typeof LEXICON_GAUGE_DEFINITION
  | typeof LEXICON_SNAPSHOT
  | typeof LEXICON_CONNECTION_OPPORTUNITY
  | typeof LEXICON_ACTION_CARD;
