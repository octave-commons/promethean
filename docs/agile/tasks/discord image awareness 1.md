Here’s a refined version that makes it clear this is about **selective Discord image ingestion** into context rather than a brute-force “always pass the latest image” approach:

---

## 🛠️ Description

Enable the system to **ingest and selectively include Discord images** into the context pipeline.
Currently, image handling is limited to a single “moving frame” model, where only the latest image passes through the system. This change will allow **multiple relevant images** to be retained, filtered, and passed selectively based on context needs.

Images should be:

* Captured from Discord messages in real time.
* Tagged and stored alongside transcripts or other message context.
* Queryable so that only **relevant** images are sent through for processing (e.g., to Ollama, vision models, or downstream tasks).

This allows the “Duck” to have **visual memory** tied to conversational context instead of a rolling overwrite.

---

## 🎯 Goals

* Integrate **Discord image ingestion** into the context pipeline.
* Enable **selective** image passing rather than always overwriting with the latest.
* Store images with **contextual metadata** (author, timestamp, related transcript segment).
* Make images **queryable** by relevance for use in generation pipelines.
* Support expansion to **other image sources** in the future.

---

## 📦 Requirements

* [ ] Modify Discord listener to capture and store image attachments with metadata.
* [ ] Store images in retrievable format (local FS, object storage, or DB reference).
* [ ] Link images to transcript segments for contextual retrieval.
* [ ] Implement filtering logic to decide which images enter active context.
* [ ] Support multi-modal prompt building with images + text for Ollama or other models.
* [ ] Ensure storage limits and cleanup mechanisms are in place.

---

## 📋 Subtasks

* [ ] Extend Discord message ingestion to parse attachments.
* [ ] Save image to storage and store metadata in DB.
* [ ] Link images to transcript or event records.
* [ ] Build query API for retrieving relevant images.
* [ ] Integrate image retrieval into prompt-building step.
* [ ] Add configurable relevance filters (recentness, author, keyword match).

---

## 🔗 Related Epics

\#framework-core
\#ollama-integration
\#multimodal-context

---

If you want, I can also make you a **flow diagram** showing how Discord images move from ingestion → storage → context selection → pipeline, so we can see exactly where the “selective” part happens.
That’ll help decide where scoring and filtering logic plug in.
#todo
