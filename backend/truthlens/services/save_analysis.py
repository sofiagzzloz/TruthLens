from truthlens.models import Document, Sentence, Correction
import json

def save_analysis_results(document_id, analysis):
    """
    Saves the AI analysis output into Sentence + Correction models.
    """

    document = Document.objects.get(document_id=document_id)

    for item in analysis["sentences"]:
        # Save sentence
        sentence = Sentence.objects.create(
            document_id=document,
            content=item["sentence"],
            start_index=item.get("start_index", 0),
            end_index=item.get("end_index", 0),
            flags=item["label"] != "true",    # flag false/uncertain
            confidence_scores=int(item["confidence"] * 100),
        )

        # Save correction
        Correction.objects.create(
            sentence_id=sentence,
            suggested_correction=item.get("suggested_correction", ""),
            reasoning=item.get("reasoning", ""),
            sources=json.dumps(item.get("sources", []))
        )

    return True
