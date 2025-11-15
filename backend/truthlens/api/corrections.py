from rest_framework.decorators import api_view
from rest_framework.response import Response

from truthlens.models import Sentence
from truthlens.services.corrections.correction_services import (
    get_corrections_for_sentence,
)


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

