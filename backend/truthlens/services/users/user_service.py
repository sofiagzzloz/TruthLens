"""User-related database operations."""

from typing import Optional

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError, transaction

from truthlens.models import User


def create_user(*, username: str, email: str, password: str) -> User:
	"""Create and persist a new user record."""
	if not username or not email or not password:
		raise ValidationError("username, email, and password are required")

	hashed_password = make_password(password)

	try:
		with transaction.atomic():
			return User.objects.create(
				username=username,
				email=email,
				password=hashed_password,
			)
	except IntegrityError as exc:
		raise ValidationError("username or email already exists") from exc


def update_user(*, user_id: int, username: Optional[str] = None, email: Optional[str] = None,
				password: Optional[str] = None) -> User:
	"""Update mutable user fields and persist the changes."""
	try:
		user = User.objects.get(user_id=user_id)
	except ObjectDoesNotExist as exc:
		raise ValidationError("user not found") from exc

	if username is not None:
		user.username = username
	if email is not None:
		user.email = email
	if password is not None:
		user.password = make_password(password)

	try:
		with transaction.atomic():
			user.full_clean()
			user.save(update_fields=[
				field for field, value in [
					("username", username),
					("email", email),
					("password", password),
				] if value is not None
			] or ["updated_at"])
	except IntegrityError as exc:
		raise ValidationError("username or email already exists") from exc

	return user


def delete_user(*, user_id: int) -> None:
	"""Delete the user with the provided identifier."""
	deleted, _ = User.objects.filter(user_id=user_id).delete()
	if deleted == 0:
		raise ValidationError("user not found")
