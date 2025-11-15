import json
from truthlens.ai.ollama_client import ask_ollama


FACT_CHECK_PROMPT = """
You are an expert AI fact-checking system.

Analyze the following sentence:

"{sentence}"

Return JSON ONLY in this format:

{
  "is_flagged": true/false,
  "correction": "string",
  "reasoning": "string",
  "sources": "string"
}
"""


def analyze_sentence_llm(sentence: str) -> dict:
    prompt = FACT_CHECK_PROMPT.format(sentence=sentence)
    raw = ask_ollama(prompt)

    try:
        parsed = json.loads(raw)
    except:
        parsed = {
            "is_flagged": False,
            "correction": "",
            "reasoning": raw,
            "sources": "",
        }

    return parsed
