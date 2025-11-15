"""Document-related database operations."""

from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import transaction

from truthlens.models import Document, User

def create_document(user_id: int, title: str, content: str) -> Document:
    if not title:
        raise ValidationError("title is required")

    try:
        user = User.objects.get(pk=user_id)
    except ObjectDoesNotExist as exc:
        raise ValidationError("user not found") from exc

    with transaction.atomic():
        document = Document.objects.create(
            user_id=user,
            title=title,
            content=content or "",
        )

    return document


def list_documents(user_id: int | None = None):
    queryset = Document.objects.all()
    if user_id is not None:
        queryset = queryset.filter(user_id=user_id)
    return queryset.order_by("-created_at")


def get_document(doc_id: int) -> Document:
    try:
        return Document.objects.get(pk=doc_id)
    except Document.DoesNotExist as exc:
        raise ValidationError("document not found") from exc


def update_document(document_id: int, *, title: str | None = None, content: str | None = None) -> Document:
    if title is None and content is None:
        raise ValidationError("nothing to update")

    try:
        document = Document.objects.get(pk=document_id)
    except Document.DoesNotExist as exc:
        raise ValidationError("document not found") from exc

    if title is not None:
        document.title = title
    if content is not None:
        document.content = content

    fields = [
        field for field, value in [
            ("title", title),
            ("content", content),
        ] if value is not None
    ]

    with transaction.atomic():
        document.save(update_fields=fields or ["updated_at"])

    return document


def delete_document(document_id: int) -> None:
    deleted, _ = Document.objects.filter(pk=document_id).delete()
    if deleted == 0:
        raise ValidationError("document not found")
