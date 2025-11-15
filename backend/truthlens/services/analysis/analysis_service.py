from truthlens.models import Document, Sentence, Correction
from truthlens.ai.fact_checker import fact_checker

def analyze_document(doc_id):
    document = Document.objects.get(pk=doc_id)
    analysis = fact_checker(document.content)

    results = []

    for item in analysis:
        sent = Sentence.objects.create(
            document_id=document,
            text=item["sentence"],
            flag=item["flag"],
            confidence=item["confidence"],
        )
        
        for corr in item.get("corrections", []):
            Correction.objects.create(
                sentence_id=sent,
                reasoning=corr.get("reasoning", ""),
                sources=corr.get("sources", "")
            )

    return True
