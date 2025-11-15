# truthlens/api/documents.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.core.exceptions import ValidationError

from truthlens.models import Document, User
from truthlens.services.documents.document_service import (
    create_document,
    update_document,
    delete_document,
)
from truthlens.services.sentences.sentence_service import sync_document_sentences


@api_view(["POST"])
def create_document_api(request):
    """Create a new document."""
    try:
        user_id = request.data.get("user_id")
        Document = create_document(
            user_id=user_id,
            title=request.data.get("title"),
            content=request.data.get("content", ""),
        )
        return Response({"document_id": Document.document_id}, status=201)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
def list_documents_api(request):
    """Get all documents."""
    docs = Document.objects.all().order_by("-updated_at")
    return Response(
        [
            {
                "document_id": d.document_id,
                "title": d.title,
                "updated_at": d.updated_at,
            }
            for d in docs
        ]
    )


@api_view(["GET"])
def get_document_api(request, doc_id):
    """Retrieve a single document."""
    try:
        doc = Document.objects.get(document_id=doc_id)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)

    return Response(
        {
            "document_id": doc.document_id,
            "title": doc.title,
            "content": doc.content,
            "user_id": doc.user_id_id,
        }
    )


@api_view(["PUT"])
def update_document_api(request, doc_id):
    """Update title/content and auto-sync sentences."""
    try:
        doc = update_document(
            document_id=doc_id,
            title=request.data.get("title"),
            content=request.data.get("content"),
        )

        # sync sentences because content may have changed
        sync_document_sentences(document=doc)

        return Response({"message": "Document updated"}, status=200)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["DELETE"])
def delete_document_api(request, doc_id):
    """Delete a document."""
    try:
        delete_document(doc_id)
        return Response({"message": "Document deleted"}, status=200)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)

