from truthlens.models import Sentence, Correction


def save_analysis_results(document, analysis: dict):
    """
    Saves AI analysis results:
    - Flags sentences
    - Adds corrections
    """

    sentences_data = analysis.get("sentences", [])

    # Load all sentences for this document
    existing_sentences = {
        s.content.strip(): s
        for s in Sentence.objects.filter(document_id=document)
    }

    for item in sentences_data:
        content = item.get("sentence", "").strip()
        label = item.get("label")
        confidence = float(item.get("confidence", 0))
        suggestion = item.get("suggested_correction", "").strip()
        reasoning = item.get("reasoning", "").strip()
        sources = item.get("sources", [])

        # Match by sentence content
        sentence_obj = existing_sentences.get(content)
        if not sentence_obj:
            continue  # AI sentence doesn't match extracted sentence

        sentence_obj.flags = (label == "false")
        sentence_obj.confidence_scores = int(confidence * 100)
        sentence_obj.save(update_fields=["flags", "confidence_scores"])

        if suggestion or reasoning:
            Correction.objects.create(
                sentence_id=sentence_obj,  
                suggested_correction=suggestion,
                reasoning=reasoning,
                sources="\n".join(sources),
            )
