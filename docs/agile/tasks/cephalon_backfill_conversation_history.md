Cephalon: Backfill conversation history (optional)

Goal: Migrate recent logs/outputs into `transcripts` and `agent_messages` to seed context for active users.

Why: After restoring persistence, agents may still loop until enough new context accumulates.

Scope:
- Define a simple script to scan recent Discord messages and TTS logs (if available) to backfill collections.
- Idempotent: avoid duplicates by keying on timestamps and message IDs.

Exit Criteria:
- Backfill script present in `services/ts/cephalon/scripts/` and documented; safe to run.

#incoming #cephalon #backfill #context
