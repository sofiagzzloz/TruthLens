import json
import httpx
from django.core.exceptions import ValidationError

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
DEFAULT_MODEL = "gpt-oss:20b"   # <-- change to your installed model


def ask_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    Calls Ollama and returns raw text.
    DEBUG PRINT ENABLED.
    """

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "temperature": 0
    }

    try:
        response = httpx.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
    except Exception as exc:
        raise ValidationError(f"Ollama request failed: {exc}")

    raw = data.get("response")

    print("\n\n====================")
    print("RAW OLLAMA OUTPUT:")
    print(raw)
    print("====================\n\n")

    return raw

