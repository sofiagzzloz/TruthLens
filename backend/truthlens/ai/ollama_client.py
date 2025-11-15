import requests

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
DEFAULT_MODEL = "gpt-oss:20b"


def ask_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        raise Exception(f"Ollama request failed: {e}")

    if "response" not in data:
        raise Exception(f"Unexpected response format: {data}")

    return data["response"]
