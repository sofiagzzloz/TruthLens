import json
from django.core.exceptions import ValidationError

from truthlens.models import Document
from truthlens.ai.ollama_client import ask_ollama
from truthlens.services.analysis.persist_results import save_analysis_results


ANALYSIS_SYSTEM_PROMPT = """
You are a fact-checking assistant. Your job is to analyze text and split it into sentences.
For each sentence, classify it:

- "true" → factual, reliable
- "false" → incorrect
- "uncertain" → unclear or unverified

For each sentence, you MUST return:
- sentence (string)
- label (string: "true" | "false" | "uncertain")
- confidence (float 0–1)
- suggested_correction (string, can be empty)
- reasoning (string explaining the label)
- sources (array of strings)

Output ONLY valid JSON in this format:

{
  "sentences": [
    {
      "sentence": "...",
      "label": "...",
      "confidence": 0.82,
      "suggested_correction": "...",
      "reasoning": "...",
      "sources": ["...", "..."]
    }
  ]
}
"""
def analyze_document(document_id: int) -> dict:
    """
    Performs AI-based semantic + factual analysis for the document,
    stores the results, and returns the structured output.
    """

    try:
        document = Document.objects.get(document_id=document_id)
    except Document.DoesNotExist as exc:
        raise ValidationError("Document not found.") from exc

    # Build model prompt
    prompt = (
        ANALYSIS_SYSTEM_PROMPT
        + "\n\n"
        + f"Text to analyze:\n{document.content}\n\n"
        + "Return ONLY valid JSON."
    )

    # Call Ollama synchronously
    ai_raw_output = ask_ollama(prompt)

    # Parse the JSON
    try:
        analysis_json = json.loads(ai_raw_output)
    except json.JSONDecodeError:
        raise ValidationError(f"AI returned invalid JSON: {ai_raw_output}")

    # Save results to DB
    save_analysis_results(document_id=document_id, analysis=analysis_json)

    return analysis_json
