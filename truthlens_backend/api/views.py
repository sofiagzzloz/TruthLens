from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ai import fact_checker

@api_view(["POST"])
def analyze_text(request):
    text = request.data.get("text", "")
    include_sources = request.data.get("include_sources", True)

    try:
        result = fact_checker.analyze_text(text)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "healthy",
        "ai_models_loaded": fact_checker.claim_detector is not None
    })

@api_view(["GET"])
def get_models(request):
    return Response({
        "claim_detection": str(fact_checker.claim_detector is not None),
        "verification": str(hasattr(fact_checker, "fact_model")),
        "climate": str(hasattr(fact_checker, "climate_fact_checker"))
    })

@api_view(["POST"])
def test_claim(request):
    claim = request.data.get("claim", "")
    result = fact_checker.verify_claim(claim)
    return Response(result)
