## Notes

### 2026-01-29T18:25:00Z - Task 1 & 2 Verification
- Verified Tasks 1 & 2 are COMPLETE from previous work
- Profile schema and loader exist: `profiles.clj`, `profile_schema.clj`
- Both agents registered: Duck and OpenSkull in `agent.clj`
- `CEPHALON_PROFILE` env var implemented

### 2026-01-29T18:28:00Z - Task 3 Status
- PM2 ecosystem has both duck and skull process slots
- Missing: `CEPHALON_PROFILE=openskull` not set for skull-brain processes
- Need to add profile selection to PM2 config
