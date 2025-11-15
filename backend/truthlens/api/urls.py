from django.urls import path
from .users import create_user, get_user
from .documents import create_document, list_documents, get_document
from .analysis import analyze_document
from .sentences import get_document_sentences
from .corrections import get_sentence_corrections
from django.http import HttpResponse

urlpatterns = [
    path("", lambda r: HttpResponse("API running ✔")),

    # Users
    path("users/", create_user),
    path("users/<int:user_id>/", get_user),

    # Documents
    path("documents/", list_documents),
    path("documents/create/", create_document),
    path("documents/<int:doc_id>/", get_document),

    # Analysis
    path("documents/<int:doc_id>/analyze/", analyze_document),

    # Sentences + corrections
    path("documents/<int:doc_id>/sentences/", get_document_sentences),
    path("sentences/<int:sentence_id>/corrections/", get_sentence_corrections),
]
