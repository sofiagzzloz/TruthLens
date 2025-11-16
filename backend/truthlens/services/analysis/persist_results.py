from truthlens.models import Sentence, Correction
from truthlens.services.sentences.sentence_service import sync_document_sentences


def save_analysis_results(document, analysis: dict):
    """
    Saves AI analysis results:
    - Flags sentences
    - Adds corrections
    """

    sentences_data = analysis.get("sentences", [])

    sentences = sync_document_sentences(document=document, text=document.content)

    sentence_lookup = {sentence.content.strip(): sentence for sentence in sentences}

    sentence_ids = [sentence.sentence_id for sentence in sentences]
    if sentence_ids:
        Correction.objects.filter(sentence_id__in=sentence_ids).delete()
        Sentence.objects.filter(sentence_id__in=sentence_ids).update(
            flags=False,
            confidence_scores=0,
        )

    for item in sentences_data:
        content = item.get("sentence", "").strip()
        label = item.get("label")
        confidence = float(item.get("confidence", 0))
        suggestion = item.get("suggested_correction", "").strip()
        reasoning = item.get("reasoning", "").strip()
        sources = item.get("sources", [])

        # Match by sentence content
        sentence_obj = sentence_lookup.get(content)
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
