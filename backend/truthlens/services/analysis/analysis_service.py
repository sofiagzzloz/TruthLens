import json
from django.core.exceptions import ValidationError

from truthlens.models import Document
from truthlens.ai.ollama_client import ask_ollama
from truthlens.services.analysis.persist_results import save_analysis_results


ANALYSIS_SYSTEM_PROMPT = """
You are a strict JSON generator.

You MUST return *only* a JSON object shaped like this:

{
  "sentences": [
    {
      "sentence": "...",
      "label": "true" | "false" | "uncertain",
      "confidence": 0.0,
      "suggested_correction": "...",
      "reasoning": "...",
      "sources": ["...", "..."]
    }
  ]
}

Rules:
- DO NOT add backticks.
- DO NOT add explanations.
- DO NOT add any text before or after the JSON.
- Reply ONLY with valid JSON.
"""


def analyze_document(document_id: int) -> dict:
    """
    SYNC VERSION — correct for our Ollama client.
    """

    try:
        document = Document.objects.get(document_id=document_id)
    except Document.DoesNotExist:
        raise ValidationError("Document not found.")

    prompt = (
        ANALYSIS_SYSTEM_PROMPT
        + "\n\nText to analyze:\n"
        + document.content
        + "\n\nReturn ONLY valid JSON."
    )

    # SYNC call — correct for our Ollama client
    ai_output = ask_ollama(prompt)

    print("\n\n===== RAW OLLAMA OUTPUT =====")
    print(ai_output)
    print("===== END RAW OUTPUT =====\n\n")

    # 1. Try direct JSON
    try:
        analysis_json = json.loads(ai_output)
    except Exception:
        # 2. Try extracting JSON from within text
        import re
        match = re.search(r"\{.*\}", ai_output, re.DOTALL)
        if not match:
            raise ValidationError(f"AI returned invalid JSON: {ai_output}")

        try:
            analysis_json = json.loads(match.group())
        except Exception as exc:
            raise ValidationError(f"AI returned invalid JSON: {exc}")


    save_analysis_results(document_id=document_id, analysis=analysis_json)

    return analysis_json  
