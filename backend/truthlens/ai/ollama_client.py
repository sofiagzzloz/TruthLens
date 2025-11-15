import httpx
from django.core.exceptions import ValidationError


OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
DEFAULT_MODEL = "gpt-oss:20b"


async def generate_completion(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    Sends a prompt to the local Ollama model and returns the generated text.

    Raises:
        ValidationError: if Ollama is unreachable or returns an unexpected response.
    """

    if not prompt:
        raise ValidationError("Prompt cannot be empty.")

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        raise ValidationError(f"Ollama request failed: {exc}") from exc

    # Ensure expected structure
    if "response" not in data:
        raise ValidationError("Unexpected Ollama response format.")

    return data["response"]
