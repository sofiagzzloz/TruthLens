---
description: Entity relationship diagram and explanations for core TruthLens tables
---

# Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Document : owns
    Document ||--o{ Sentence : contains
    Sentence ||--o{ Correction : receives

    User {
        int user_id PK
        varchar username
        varchar email
        varchar password
        datetime created_at
        datetime updated_at
    }

    Document {
        int document_id PK
        varchar title
        text content
        datetime created_at
        datetime updated_at
        int user_id FK
    }

    Sentence {
        int sentence_id PK
        int document_id FK
        text content
        int start_index
        int end_index
        bool flags
        int confidence_scores
    }

    Correction {
        int correction_id PK
        int sentence_id FK
        text suggested_correction
        text reasoning
        text sources
        datetime created_at
        datetime updated_at
    }
```

## Model Notes

* `flags` marks sentences that the AI believes need attention.
* `confidence_scores` stores the AI confidence (0-100) so the UI can prioritize low-certainty claims.
* Corrections persist the AI response, enabling learners to reapply suggestions even after leaving the workspace.
