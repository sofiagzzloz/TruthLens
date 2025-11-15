from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from truthlens.services.analysis.analysis_service import run_analysis
from truthlens.services.analysis.persist_results import persist_analysis_results
from truthlens.models import Document


@api_view(["POST"])
def analyze_document(request, doc_id):
    """Run AI analysis on a document and store results."""
    try:
        document = Document.objects.get(document_id=doc_id)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)

    # 1. run the AI
    analysis = run_analysis(document.content)

    # 2. store results
    persist_analysis_results(document, analysis)

    return Response({"message": "Analysis completed"}, status=200)

