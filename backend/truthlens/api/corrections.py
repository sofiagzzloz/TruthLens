from rest_framework.decorators import api_view
from rest_framework.response import Response

from truthlens.models import Sentence
from truthlens.services.corrections.correction_services import (
    get_corrections_for_sentence,
)
from truthlens.services.sentences.sentence_service import sync_document_sentences


@api_view(["GET"])
def get_sentence_corrections(request, sentence_id):
    """Get all corrections for a sentence."""
    try:
        Sentence.objects.get(sentence_id=sentence_id)
    except Sentence.DoesNotExist:
        return Response({"error": "Sentence not found"}, status=404)

    corrections = get_corrections_for_sentence(sentence_id)

    return Response(
        [
            {
                "correction_id": c.correction_id,
                "suggested_correction": c.suggested_correction,
                "reasoning": c.reasoning,
                "sources": c.sources,
                "created_at": c.created_at,
            }
            for c in corrections
        ]
    )


@api_view(["POST"])
def apply_correction(request, sentence_id, correction_id):
    from truthlens.models import Sentence, Correction, Document

    try:
        sentence = Sentence.objects.get(sentence_id=sentence_id)
    except Sentence.DoesNotExist:
        return Response({"error": "Sentence not found"}, status=404)

    try:
        correction = Correction.objects.get(correction_id=correction_id)
    except Correction.DoesNotExist:
        return Response({"error": "Correction not found"}, status=404)

    doc = sentence.document_id

    before = doc.content[:sentence.start_index]
    after = doc.content[sentence.end_index:]
    new_text = before + correction.suggested_correction + after

    doc.content = new_text
    doc.save(update_fields=["content"])

    sentence.content = correction.suggested_correction
    sentence.end_index = sentence.start_index + len(correction.suggested_correction)
    sentence.flags = False
    sentence.confidence_scores = 100
    sentence.save(update_fields=["content", "end_index", "flags", "confidence_scores"])

    sentences = sync_document_sentences(document=doc)

    payload = []

    for s in sentences:
        corrections = get_corrections_for_sentence(s.sentence_id)
        payload.append({
            "sentence_id": s.sentence_id,
            "content": s.content,
            "start_index": s.start_index,
            "end_index": s.end_index,
            "flags": s.flags,
            "confidence": s.confidence_scores,
            "corrections": [
                {
                    "correction_id": c.correction_id,
                    "suggested_correction": c.suggested_correction,
                    "reasoning": c.reasoning,
                    "sources": c.sources,
                    "created_at": c.created_at,
                }
                for c in corrections
            ],
        })

    return Response({
        "document_id": doc.document_id,
        "content": doc.content,
        "sentences": payload,
    })