# truthlens/api/sentences.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from truthlens.models import Document, Sentence
from truthlens.services.sentences.sentence_service import sync_document_sentences


@api_view(["GET"])
def get_document_sentences(request, doc_id):
    """Return sentences, auto-syncing first."""
    try:
        doc = Document.objects.get(document_id=doc_id)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)

    sentences = sync_document_sentences(document=doc)

    return Response(
        [
            {
                "sentence_id": s.sentence_id,
                "content": s.content,
                "start_index": s.start_index,
                "end_index": s.end_index,
                "flags": s.flags,
                "confidence": s.confidence_scores,
            }
            for s in sentences
        ]
    )
