from truthlens.models import Correction


def get_corrections_for_sentence(sentence_id: int):
    """Return all corrections associated with a sentence."""
    return Correction.objects.filter(sentence_id=sentence_id).order_by("-created_at")


def create_correction(*, sentence_id, suggested_correction: str, reasoning: str, sources: str = "") -> Correction:
    """Create and persist a correction record."""
    return Correction.objects.create(
        sentence_id=sentence_id,
        suggested_correction=suggested_correction,
        reasoning=reasoning,
        sources=sources,
    )
