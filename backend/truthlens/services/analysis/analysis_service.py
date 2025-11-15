import requests
from django.conf import settings


OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = getattr(settings, "OLLAMA_MODEL", "gpt-oss:20b")


def run_local_analysis(text: str) -> dict:
    """
    Sends text to the local Ollama AI model and returns structured analysis.
    """

    prompt = f"""
You are a fact-checking model. Analyze the following text and break it down into sentences.

For each sentence, output:
- sentence: the sentence text
- label: "true", "false", or "uncertain"
- confidence: a number 0 to 1
- reasoning: short explanation
- suggested_correction: only if false or uncertain
- sources: a list of URLs or source names

Return ONLY valid JSON in this format:
{{
  "sentences": [
    {{
      "sentence": "...",
      "label": "true/false/uncertain",
      "confidence": 0.82,
      "reasoning": "...",
      "suggested_correction": "...",
      "sources": ["source1", "source2"]
    }}
  ]
}}
Text to analyze:
{text}
"""

    response = requests.post(
        OLLAMA_API_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        },
        timeout=60
    )

    result = response.json()

    raw_output = result.get("response", "")
    import json

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        # fallback in case model output is messy
        return {"sentences": []}
