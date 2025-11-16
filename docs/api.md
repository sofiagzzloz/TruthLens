---
title: API Reference
description: REST endpoints exposed by the TruthLens Django backend
---

# API Reference

All endpoints are served under the base path `/api/`. Responses are JSON encoded. Unless otherwise noted, request bodies must be JSON and the user resource IDs referenced must exist.

## Health Check

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/` | Returns `API running ✔` as a quick uptime probe. |

---

## Authentication & Users

### Create User
- **POST** `/api/users/`
- Body
	```json
	{
		"username": "alice",
		"email": "alice@example.com",
		"password": "StrongPass123"
	}
	```
- Success → `201 Created`
	```json
	{
		"user_id": 1,
		"username": "alice",
		"email": "alice@example.com"
	}
	```
- Errors → `400 Bad Request` when validation fails (duplicate email, weak password, etc.).

### Login
- **POST** `/api/users/login/`
- Body accepts username or email via `identifier` plus `password`.
	```json
	{
		"identifier": "alice@example.com",
		"password": "StrongPass123"
	}
	```
- Success → `200 OK`
	```json
	{ "user_id": 1 }
	```
- Errors → `400 Bad Request` when credentials are invalid.

### Get User
- **GET** `/api/users/{user_id}/`
- Success → `200 OK`
	```json
	{
		"user_id": 1,
		"username": "alice",
		"email": "alice@example.com"
	}
	```
- Errors → `404 Not Found` if the user does not exist.

### Update User
- **PUT** `/api/users/{user_id}/update/`
- Body (all fields optional; omitted values remain unchanged)
	```json
	{
		"username": "alice",
		"email": "alice@example.com",
		"password": "NewPass123"
	}
	```
- Success → `200 OK` with `{ "message": "User updated" }`
- Errors → `400 Bad Request` if validation fails.

### Change Password
- **POST** `/api/users/{user_id}/change-password/`
- Body
	```json
	{
		"current_password": "StrongPass123",
		"new_password": "NewPass123"
	}
	```
- Success → `200 OK` with `{ "message": "Password updated" }`
- Errors → `400 Bad Request` if the current password is wrong or new password fails validation.

### Delete User
- **DELETE** `/api/users/{user_id}/delete/`
- Success → `200 OK` with `{ "message": "User deleted" }`
- Errors → `400 Bad Request` when deletion fails (e.g., missing user).

---

## Documents

### List Documents
- **GET** `/api/documents/`
- Optional query parameter `user_id` filters by owner.
- Success → `200 OK`
	```json
	[
		{
			"document_id": 10,
			"title": "Week 3 Biology",
			"updated_at": "2025-11-14T18:32:10.123Z",
			"user_id": 1
		}
	]
	```

### Create Document
- **POST** `/api/documents/create/`
- Body
	```json
	{
		"user_id": 1,
		"title": "Week 3 Biology",
		"content": "Raw notes go here."
	}
	```
- Success → `201 Created` with `{ "document_id": 10 }`
- Errors → `400 Bad Request` when validation fails (missing title, invalid user, etc.).

### Get Document
- **GET** `/api/documents/{doc_id}/`
- Success → `200 OK`
	```json
	{
		"document_id": 10,
		"title": "Week 3 Biology",
		"content": "Raw notes go here.",
		"user_id": 1
	}
	```
- Errors → `404 Not Found` if the document does not exist.

### Update Document
- **PUT** `/api/documents/{doc_id}/update/`
- Body
	```json
	{
		"title": "Week 3 Biology (Updated)",
		"content": "Edited notes"
	}
	```
- Success → `200 OK` with `{ "message": "Document updated" }`
- Side effects → Triggers sentence synchronization.
- Errors → `400 Bad Request` when validation fails.

### Delete Document
- **DELETE** `/api/documents/{doc_id}/delete/`
- Success → `200 OK` with `{ "message": "Document deleted" }`
- Errors → `400 Bad Request` if deletion fails.

---

## Analysis

### Run Document Analysis
- **POST** `/api/documents/{doc_id}/analyze/`
- No body required.
- Success → `200 OK`
	```json
	{
		"status": "ok",
		"analysis": {
			"doc_id": 10,
			"sentences": [
				{
					"content": "The mitochondria is the powerhouse of the cell.",
					"label": "true",
					"confidence": 0.94,
					"suggestion": null,
					"reasoning": "Widely accepted biological fact.",
					"sources": ["https://..." ]
				}
			]
		}
	}
	```
- Errors → `400 Bad Request` for validation issues, `500 Internal Server Error` for unexpected faults.

---

## Sentences

### List Document Sentences
- **GET** `/api/documents/{doc_id}/sentences/`
- Auto-syncs sentences before returning them.
- Success → `200 OK`
	```json
	[
		{
			"sentence_id": 55,
			"content": "The mitochondria is the powerhouse of the cell.",
			"start_index": 0,
			"end_index": 53,
			"flags": false,
			"confidence": 100
		}
	]
	```
- Errors → `404 Not Found` when the document is missing.

---

## Corrections

### List Corrections for a Sentence
- **GET** `/api/sentences/{sentence_id}/corrections/`
- Success → `200 OK`
	```json
	[
		{
			"correction_id": 9,
			"suggested_correction": "Mitochondria generate ATP for the cell.",
			"reasoning": "Clarifies the biochemical process involved.",
			"sources": "https://...",
			"created_at": "2025-11-14T19:02:45.512Z"
		}
	]
	```
- Errors → `404 Not Found` if the sentence is missing.

### Apply Correction
- **POST** `/api/sentences/{sentence_id}/apply/{correction_id}/`
- No body required.
- Success → `200 OK`
	```json
	{
		"document_id": 10,
		"content": "Corrected document text"
	}
	```
- Side effects → Updates the document text, rewrites the sentence record, resets flags, deletes the correction, and re-syncs sentences.
- Errors → `404 Not Found` for missing sentence or correction, `400 Bad Request` when the correction does not belong to the sentence, `500 Internal Server Error` if the transactional update fails.
