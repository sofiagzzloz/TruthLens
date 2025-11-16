---
description: Overview of the TruthLens workspace experience and UI capabilities
---

# Frontend Features

## Workspace Experience

* **Unified document dashboard**: Browse, create, and delete study notes without leaving the workspace.
* **Rich editor highlights**: Sentence-level annotations show fact-check status inline, mimicking Grammarly's UX for clarity.
* **Analysis side panel**: Toggle detailed AI insights, including reasoning and source citations per sentence.
* **Apply correction workflow**: Accept suggested rewrites directly from the modal to update the document content instantly.
* **Toast-driven feedback**: Inform users about analysis progress, success, or recoverable errors in real time.

## Performance and UX Details

* Server components keep initial loads fast while client components manage interactive state.
* Optimistic UI updates ensure corrections feel instantaneous, with fallbacks when the API rejects changes.
* Loading skeletons and motion transitions maintain perceived responsiveness during analysis runs.

## Accessibility and Responsiveness

* Keyboard and screen-reader friendly controls based on Radix primitives.
* Responsive layout adapts gracefully from laptops to tablets, keeping critical controls within reach.
* Color-coded statuses respect WCAG contrast ratios to remain legible during long study sessions.
