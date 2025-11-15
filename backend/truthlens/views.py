from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from truthlens.services.analysis.persist_results import save_analysis_results
from truthlens.ai.fact_checker import fact_checker
from django.http import HttpResponse



def home(request):
    return HttpResponse("<h1>TruthLens Backend is Running 🎉</h1>")

@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "healthy",
        "ai_models_loaded": fact_checker.claim_detector is not None,
        "device": str(fact_checker.device)
    })


@api_view(["GET"])
def get_models(request):
    models_info = {
        "claim_detection": {
            "name": "facebook/bart-large-mnli",
            "status": "loaded" if fact_checker.claim_detector else "not_loaded"
        },
        "fact_verification": {
            "name": "Dzeniks/roberta-fact-check",
            "status": "loaded" if hasattr(fact_checker, "fact_model") else "not_loaded"
        },
        "climate_fact_checker": {
            "name": "amandakonet/climatebert-fact-checking",
            "status": "loaded" if hasattr(fact_checker, "climate_fact_checker") else "not_loaded"
        },
        "hallucination_detector": {
            "name": "vectara/hallucination_evaluation_model",
            "status": "loaded" if hasattr(fact_checker, "hallucination_detector") else "not_loaded"
        },
    }

    return Response({
        "models": models_info,
        "device": str(fact_checker.device),
        "cache_size": len(fact_checker.fact_cache)
    })


@api_view(["POST"])
def test_claim(request):
    claim = request.data.get("claim")
    if not claim:
        return Response({"error": "Missing 'claim' field"}, status=400)

    result = fact_checker.verify_claim(claim)
    return Response(result)


@api_view(["POST"])
def analyze_text(request):
    text = request.data.get("text")
    include_sources = request.data.get("include_sources", True)
    use_advanced_ai = request.data.get("use_advanced_ai", True)

    if not text:
        return Response({"error": "Missing 'text' field"}, status=400)

    try:
        result = fact_checker.analyze_text(text)

        # Optionally remove sources
        if not include_sources:
            for s in result["sentences"]:
                s["sources"] = []

        return Response(result)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def analyze_document(request, document_id):

    document_text = request.data.get("text", "")

    # Run AI
    results = fact_checker.analyze_text(document_text)

    # Save to DB
    save_analysis_results(document_id, results)

    return Response(results)