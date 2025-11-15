from truthlens.models import Document, User
from django.core.exceptions import ObjectDoesNotExist

def create_document(user_id, title, content):
    try:
        user = User.objects.get(pk=user_id)
    except ObjectDoesNotExist:
        return None
    
    document = Document.objects.create(
        user_id=user,
        title=title,
        content=content
    )
    return document


def list_documents(user_id):
    return Document.objects.filter(user_id=user_id).order_by("-created_at")


def get_document(doc_id):
    try:
        return Document.objects.get(pk=doc_id)
    except Document.DoesNotExist:
        return None
