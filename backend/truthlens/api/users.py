from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from truthlens.models import User
from truthlens.serializers import UserSerializer


@api_view(["POST"])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
def get_user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        return Response(UserSerializer(user).data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
