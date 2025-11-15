from rest_framework.decorators import api_view
from rest_framework.response import Response
from truthlens.models import Document
from truthlens.ai.fact_checker import fact_checker
from backend.truthlens.services.analysis.save_analysis import save_analysis_results


@api_view(["POST"])
def analyze_document(request, doc_id):
    try:
        doc = Document.objects.get(pk=doc_id)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)

    analysis = fact_checker(doc.content)
    save_analysis_results(doc, analysis)

    return Response({"message": "Analysis complete", "analysis": analysis})
