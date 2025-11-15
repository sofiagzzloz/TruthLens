from django.urls import path
from .users import (
    create_user_api,
    get_user_api,
    update_user_api,
    delete_user_api,
    login_api,
    change_password_api,
)
from .documents import (
    create_document_api,
    list_documents_api,
    get_document_api,
    update_document_api,
    delete_document_api,
)
from .analysis import analyze_document
from .sentences import get_document_sentences
from .corrections import get_sentence_corrections
from django.http import HttpResponse

urlpatterns = [
    path("", lambda r: HttpResponse("API running ✔")),

    # Users
    path("users/", create_user_api),
    path("users/<int:user_id>/", get_user_api),
    path("users/<int:user_id>/update/", update_user_api),
    path("users/<int:user_id>/delete/", delete_user_api),
    path("users/login/", login_api),
    path("users/<int:user_id>/change-password/", change_password_api),

    # Documents
    path("documents/", list_documents_api),
    path("documents/create/", create_document_api),
    path("documents/<int:doc_id>/", get_document_api),
    path("documents/<int:doc_id>/update/", update_document_api),
    path("documents/<int:doc_id>/delete/", delete_document_api),

    # Analysis
    path("documents/<int:doc_id>/analyze/", analyze_document),

    # Sentences + corrections
    path("documents/<int:doc_id>/sentences/", get_document_sentences),
    path("sentences/<int:sentence_id>/corrections/", get_sentence_corrections),
]
