from rest_framework.decorators import api_view
from rest_framework.response import Response
from truthlens.models import Document
from truthlens.serializers import DocumentSerializer


@api_view(["POST"])
def create_document(request):
    serializer = DocumentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
def list_documents(request):
    docs = Document.objects.all()
    return Response(DocumentSerializer(docs, many=True).data)


@api_view(["GET"])
def get_document(request, doc_id):
    try:
        doc = Document.objects.get(pk=doc_id)
        return Response(DocumentSerializer(doc).data)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)
