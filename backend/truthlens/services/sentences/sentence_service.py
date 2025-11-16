"""Utilities for keeping document sentences in sync with stored text."""

from __future__ import annotations

import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import List, Optional

from django.db import transaction

from truthlens.models import Document, Sentence


# Regex pattern for sentence detection
_SENTENCE_PATTERN = re.compile(r"[^.!?]+[.!?]?")


@dataclass(frozen=True)
class SentenceSlice:
    """Intermediate representation of a sentence extracted from text."""

    content: str
    start_index: int
    end_index: int


def _extract_sentence_slices(text: str) -> List[SentenceSlice]:
    """Split raw text into sentence slices with normalised indices."""
    slices: List[SentenceSlice] = []

    for match in _SENTENCE_PATTERN.finditer(text):
        snippet = text[match.start(): match.end()]
        stripped = snippet.strip()

        if not stripped:
            continue

        leading = len(snippet) - len(snippet.lstrip())
        start = match.start() + leading
        end = start + len(stripped)

        slices.append(
            SentenceSlice(
                content=stripped,
                start_index=start,
                end_index=end,
            )
        )

    return slices


def sync_document_sentences(*, document: Document, text: Optional[str] = None) -> List[Sentence]:
    """Synchronise the Sentence rows for a document with the supplied text."""

    source_text = text if text is not None else document.content or ""
    new_slices = _extract_sentence_slices(source_text)

    # Fast exit when no sentences remain.
    if not new_slices:
        with transaction.atomic():
            Sentence.objects.filter(document_id=document).delete()
        return []

    existing = list(
        Sentence.objects.filter(document_id=document)
        .order_by("start_index", "sentence_id")
    )

    matcher = SequenceMatcher(
        None,
        [sentence.content for sentence in existing],
        [slice_.content for slice_ in new_slices],
    )

    to_delete: List[Sentence] = []
    to_create: List[SentenceSlice] = []
    to_update: List[tuple[Sentence, SentenceSlice]] = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for old_index, new_index in zip(range(i1, i2), range(j1, j2)):
                to_update.append((existing[old_index], new_slices[new_index]))

        elif tag == "replace":
            old_segment = existing[i1:i2]
            new_segment = new_slices[j1:j2]

            if len(old_segment) == len(new_segment):
                for old_sentence, new_slice in zip(old_segment, new_segment):
                    to_update.append((old_sentence, new_slice))
            else:
                to_delete.extend(old_segment)
                to_create.extend(new_segment)

        elif tag == "delete":
            to_delete.extend(existing[i1:i2])

        elif tag == "insert":
            to_create.extend(new_slices[j1:j2])

    # Apply all DB changes inside a transaction
    with transaction.atomic():
        if to_delete:
            Sentence.objects.filter(
                pk__in=[sentence.pk for sentence in to_delete]
            ).delete()

        # Update modified rows
        for sentence, slice_ in to_update:
            fields_to_update: List[str] = []

            if sentence.content != slice_.content:
                sentence.content = slice_.content
                fields_to_update.append("content")

            if sentence.start_index != slice_.start_index:
                sentence.start_index = slice_.start_index
                fields_to_update.append("start_index")

            if sentence.end_index != slice_.end_index:
                sentence.end_index = slice_.end_index
                fields_to_update.append("end_index")

            if fields_to_update:
                sentence.save(update_fields=fields_to_update)

        # Create new sentences
        for slice_ in to_create:
            Sentence.objects.create(
                document_id=document,
                content=slice_.content,
                start_index=slice_.start_index,
                end_index=slice_.end_index,
                flags=False,
                confidence_scores=0,
            )

    # Return final ordered list
    return list(
        Sentence.objects.filter(document_id=document)
        .order_by("start_index", "sentence_id")
    )
