# truthlens/services/analysis/persist_results.py

"""
Persist AI analysis results into Sentence + Correction models.
This module receives the structured output from analysis_service.run_analysis
and updates database rows accordingly.
"""

from __future__ import annotations
import json
from typing import Dict, Any, List

from django.db import transaction

from truthlens.models import Document, Sentence, Correction
from truthlens.services.sentences.sentence_service import sync_document_sentences


def persist_analysis_results(document: Document, analysis: Dict[str, Any]) -> None:
    """
    Save the AI analysis to the database.

    Steps:
    1. Sync sentences for the document (ensures DB matches text)
    2. Match AI output sentences with DB sentences by index
    3. Update flags + confidence
    4. Create Correction entries
    """
    ai_sentences = analysis.get("sentences", [])
    if not ai_sentences:
        # Just sync and exit
        sync_document_sentences(document=document)
        return

    # 1. Sync sentences first
    db_sentences: List[Sentence] = sync_document_sentences(document=document)

    # Create lookup by (start, end)
    sentence_map = {
        (s.start_index, s.end_index): s for s in db_sentences
    }

    with transaction.atomic():
        for item in ai_sentences:
            key = (item["start_index"], item["end_index"])
            db_sentence = sentence_map.get(key)

            if not db_sentence:
                # Sentence mismatch — skip gracefully
                continue

            # 2. Update flags + confidence
            db_sentence.flags = (item.get("label") != "true")
            db_sentence.confidence_scores = int(item.get("confidence", 0) * 100)
            db_sentence.save(update_fields=["flags", "confidence_scores", "updated_at"])

            # 3. Create Correction
            Correction.objects.create(
                sentence_id=db_sentence,
                suggested_correction=item.get("suggested_correction", ""),
                reasoning=item.get("reasoning", ""),
                sources=json.dumps(item.get("sources", [])),
            )
