# truthlens/api/users.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.core.exceptions import ValidationError

from truthlens.services.users.user_service import (
    create_user,
    update_user,
    delete_user,
)
from truthlens.services.users.auth import (
    authenticate_user,
    change_user_password,
)
from truthlens.models import User


@api_view(["POST"])
def create_user_api(request):
    """Create a new user."""
    try:
        user = create_user(
            username=request.data.get("username"),
            email=request.data.get("email"),
            password=request.data.get("password"),
        )
        return Response(
            {"user_id": user.user_id, "username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
def get_user_api(request, user_id):
    """Retrieve user details."""
    try:
        user = User.objects.get(user_id=user_id)
        return Response(
            {"user_id": user.user_id, "username": user.username, "email": user.email},
            status=200,
        )
    except User.DoesNotExist:
        return Response({"error": "user not found"}, status=404)


@api_view(["PUT"])
def update_user_api(request, user_id):
    """Update basic user fields."""
    try:
        user = update_user(
            user_id=user_id,
            username=request.data.get("username"),
            email=request.data.get("email"),
            password=request.data.get("password"),
        )
        return Response({"message": "User updated"}, status=200)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["POST"])
def login_api(request):
    """Authenticate username/email + password."""
    try:
        user = authenticate_user(
            identifier=request.data.get("identifier"),
            password=request.data.get("password"),
        )
        return Response({"user_id": user.user_id}, status=200)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["POST"])
def change_password_api(request, user_id):
    """Change password for a user."""
    try:
        change_user_password(
            user_id=user_id,
            current_password=request.data.get("current_password"),
            new_password=request.data.get("new_password"),
        )
        return Response({"message": "Password updated"}, status=200)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["DELETE"])
def delete_user_api(request, user_id):
    """Delete a user."""
    try:
        delete_user(user_id=user_id)
        return Response({"message": "User deleted"}, status=200)
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)
