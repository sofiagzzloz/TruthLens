---
title: Backend Features
description: Capabilities delivered by the Django API and background services
---

# Backend Features

## Core API Capabilities

- **Document lifecycle**: Create, list, update, and delete documents scoped per user with ownership validation.
- **Sentence synchronization**: Split document content into sentences, persist offsets, and keep rows in sync as users edit notes.
- **AI analysis orchestration**: Trigger Ollama-backed fact checking, manage prompt construction, and collect sentence-level verdicts.
- **Correction management**: Store suggested rewrites, reasoning, and sources for each sentence; support applying corrections to the source document.
- **User authentication**: Secure endpoints using Django's auth system and session middleware (token-based auth planned).

## Services and Workflows

- `analysis_service`: Handles asynchronous fact-check requests, aggregates model responses, and invokes persistence.
- `persist_results`: Normalizes AI output, updates sentence flags and confidence scores, and records corrections.
- `sentence_service`: Keeps sentence records aligned with the current document content using diff-aware synchronization.
- `save_analysis`: Ensures prior analysis artifacts are cleared before new runs, preventing stale corrections.

## Reliability and Safety

- Transactionally applies corrections to prevent partial updates.
- Bulk resets flags and corrections to guarantee a clean slate each analysis run.
- Uses optimistic concurrency on sentence updates to avoid conflicting writes.
