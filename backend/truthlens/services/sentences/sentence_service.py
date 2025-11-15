from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from truthlens.models import Document, Sentence
from truthlens.services.sentences.sentence_service import (
    sync_document_sentences,
)


@api_view(["GET"])
def get_document_sentences(request, doc_id):
    """
    Returns all sentences for a document.
    Ensures the sentences are synced with the latest document content.
    """
    try:
        document = Document.objects.get(document_id=doc_id)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)

    # Sync sentences to ensure DB is correct
    synced_sentences = sync_document_sentences(document=document)

    results = [
        {
            "sentence_id": s.sentence_id,
            "content": s.content,
            "start_index": s.start_index,
            "end_index": s.end_index,
            "flags": s.flags,
            "confidence_scores": s.confidence_scores,
        }
        for s in synced_sentences
    ]

    return Response(results, status=200)
