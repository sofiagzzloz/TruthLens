"""Authentication helpers for the custom User model."""

from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q

from truthlens.models import User


def authenticate_user(*, identifier: str, password: str) -> User:
	"""Validate user credentials and return the matching user."""
	if not identifier or not password:
		raise ValidationError("identifier and password are required")

	user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
	if not user or not check_password(password, user.password):
		raise ValidationError("invalid credentials")

	return user


def change_user_password(*, user_id: int, current_password: str, new_password: str) -> User:
	"""Change a user's password after verifying the current password."""
	if not new_password:
		raise ValidationError("new password is required")

	try:
		user = User.objects.get(user_id=user_id)
	except User.DoesNotExist as exc:
		raise ValidationError("user not found") from exc

	if not check_password(current_password, user.password):
		raise ValidationError("current password is incorrect")

	with transaction.atomic():
		user.password = make_password(new_password)
		user.save(update_fields=["password", "updated_at"])

	return user
