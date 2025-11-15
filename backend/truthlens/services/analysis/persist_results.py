from truthlens.models import Sentence, Correction


def save_analysis_results(document_id: int, analysis: dict):
    """
    Saves AI analysis results:
    - Flags sentences
    - Adds corrections
    """

    sentences_data = analysis.get("sentences", [])

    # Load all sentences for this document
    existing_sentences = {s.content.strip(): s for s in Sentence.objects.filter(document_id=document_id)}

    for item in sentences_data:
        content = item.get("sentence", "").strip()
        label = item.get("label")
        confidence = item.get("confidence", 0)
        suggestion = item.get("suggested_correction", "")
        reasoning = item.get("reasoning", "")
        sources = item.get("sources", [])

        # Match with existing sentence
        sentence_obj = existing_sentences.get(content)

        if not sentence_obj:
            # AI sentence doesn't match extracted sentence → skip
            continue

        # Update sentence flags + confidence
        sentence_obj.flags = (label == "false")
        sentence_obj.confidence_scores = int(confidence * 100)
        sentence_obj.save(update_fields=["flags", "confidence_scores"])

        # Create correction entry if needed
        if suggestion or reasoning:
            Correction.objects.create(
                sentence_id=sentence_obj,
                suggested_correction=suggestion,
                reasoning=reasoning,
                sources="\n".join(sources),
            )

