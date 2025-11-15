from django.http import JsonResponse
from truthlens.models import Document
from truthlens.services.analysis.analysis_service import run_local_analysis
from truthlens.services.analysis.persist_results import save_analysis_results


def analyze_document(request, doc_id):
    try:
        document = Document.objects.get(document_id=doc_id)
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)

    analysis = run_local_analysis(document.content)

    save_analysis_results(document_id=doc_id, analysis=analysis)

    return JsonResponse({
        "status": "ok",
        "analysis": analysis
    })

