# truthlens/services/analysis/analysis_service.py

"""
This module handles AI-driven analysis for documents.
It takes text as input and returns a structured analysis output.
"""

from __future__ import annotations
from typing import Dict, Any

from truthlens.ai.fact_checker import fact_checker


def run_analysis(text: str) -> Dict[str, Any]:
    """
    Run AI fact-checking or analysis on a block of text.
    Returns structured output consumable by persist_results().
    
    Expected output format:
    {
        "sentences": [
            {
                "sentence": "Example sentence.",
                "start_index": 0,
                "end_index": 20,
                "label": "false" | "true" | "uncertain",
                "confidence": 0.87,
                "suggested_correction": "...",
                "reasoning": "...",
                "sources": ["..."]
            },
            ...
        ]
    }
    """

    if not text:
        return {"sentences": []}

    # Uses your existing OpenAI wrapper
    analysis = fact_checker(text)

    # Guarantee required fields exist
    for item in analysis.get("sentences", []):
        item.setdefault("start_index", 0)
        item.setdefault("end_index", 0)
        item.setdefault("suggested_correction", "")
        item.setdefault("reasoning", "")
        item.setdefault("sources", [])

    return analysis
