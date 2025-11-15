from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from asgiref.sync import async_to_sync
import json

from truthlens.services.analysis.analysis_service import analyze_document


@csrf_exempt
def analyze_document_api(request, doc_id: int):
    """
    POST /documents/<doc_id>/analyze/
    Runs the AI analysis pipeline and returns structured results.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        # Run async function inside sync Django context
        result = async_to_sync(analyze_document)(document_id=doc_id)
        return JsonResponse({"status": "ok", "analysis": result}, status=200)

    except ValidationError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    except Exception as exc:
        return JsonResponse({"error": f"Unexpected error: {exc}"}, status=500)
