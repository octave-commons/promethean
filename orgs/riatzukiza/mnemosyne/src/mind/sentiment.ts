export type SentimentLabel = "positive" | "negative" | "neutral";

const POSITIVE_TOKENS = new Set([
  "lol",
  "lmao",
  "lmfao",
  "haha",
  "hah",
  "hehe",
  "nice",
  "good",
  "great",
  "awesome",
  "amazing",
  "love",
  "loved",
  "based",
  "perfect",
  "thanks",
  "thank",
  "thx",
  "cool",
  "sweet",
  "fire",
  "goated",
  "genius",
  "brilliant",
  "works",
  "working",
  "fixed",
  "clutch",
]);

const NEGATIVE_TOKENS = new Set([
  "spam",
  "spamming",
  "stop",
  "stfu",
  "shut",
  "annoying",
  "annoy",
  "wtf",
  "ugh",
  "hate",
  "bad",
  "worse",
  "worst",
  "dumb",
  "stupid",
  "noise",
  "noisy",
  "irrelevant",
  "offtopic",
  "off-topic",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .split(/[^a-z0-9]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 96);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function scoreSentiment(text: string): {
  score: number;
  label: SentimentLabel;
  hits: { positive: number; negative: number };
} {
  const tokens = tokenize(text);

  let pos = 0;
  let neg = 0;

  for (const token of tokens) {
    if (POSITIVE_TOKENS.has(token)) pos += 1;
    if (NEGATIVE_TOKENS.has(token)) neg += 1;
  }

  // Phrase-level signals (very coarse but useful for bot reception)
  const lowered = text.toLowerCase();
  if (/\bthank you\b/.test(lowered)) pos += 2;
  if (/\bthis rules\b|\bso good\b|\bhell yes\b/.test(lowered)) pos += 2;
  if (/\btoo much\b|\bplease stop\b|\bstop posting\b|\bgo away\b/.test(lowered)) neg += 3;

  // Normalized score in [-1, 1]
  const score = clamp((pos - neg) / (pos + neg + 2), -1, 1);

  const label: SentimentLabel =
    score > 0.18 ? "positive" : score < -0.18 ? "negative" : "neutral";

  return {
    score,
    label,
    hits: { positive: pos, negative: neg },
  };
}
