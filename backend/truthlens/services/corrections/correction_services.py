from truthlens.models import Correction

def get_corrections(sentence_id):
    return Correction.objects.filter(sentence_id=sentence_id)
