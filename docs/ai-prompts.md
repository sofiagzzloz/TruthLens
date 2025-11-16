---
title: AI Prompt Library
description: Canonical prompts used to guide TruthLens AI behaviour across services
---

# AI Prompt Library

This page captures the curated prompts that drive TruthLens AI workflows. Reuse or evolve them consistently so the backend and frontend teams remain aligned on AI behaviour.

## Sentence Service Implementation Prompt

Use this when generating or refining the Django sentence synchronization logic.

```
Ok, perfect. Moving on with sentence_service.py. This file is supposed to implement the sentence service. The sentence service works as follows: When a user creates a document, and writes text in it, once the user saves the document/contents added, the sentence service will recognize all the existing sentences in the text and store them in the database. Every time the document is saved again, this happens, of course if a sentence already exists, it should not be duplicated, but in case a change is noticed, the database record should be updated. A change could happen in a case of new sentence creation, update or deletion. Guide yourself with the models for the sentences.
```

**Intended outcome**
- Enforce idempotent sentence syncing
- Handle new, updated, and deleted sentences without duplication
- Align with existing Django models (`Sentence`, `Document`)

## Frontend Stack Setup Prompt

Apply this prompt to scaffold the overall Next.js workspace.

```
Ok. Lets start with frontend development. We will use a React app, using typescript, not javascript. Lets go step by step, and build the apps frontend. Use the following: Framework: Next.js + React

Styling: Tailwind CSS

UI primitives: shadcn/ui

Icons: lucide-react

Charts: Recharts

Animations: framer-motion

Toasts: sonner or shadcn toast

and also things from here: https://reactbits.dev/get-started/index in order to build a good ui
```

**Intended outcome**
- Generate boilerplate code and component structure aligned with the chosen libraries
- Emphasize TypeScript-first development and consistent UI primitives

## Auth Pages Prompt

Reference this prompt when implementing or revisiting authentication flows on the frontend.

```
Now, lets move forward. I need you to develop the frontend for user registration and login. These are not yet implemented in the frontend. Make these pages and connect the API endpoints to test the functioning of them.
```

**Intended outcome**
- Deliver registration and login pages that call the Django REST auth endpoints
- Provide end-to-end validation and error handling for the auth flow

## Workspace and Navigation Prompt

Use this for guidance when building the workspace layout and document CRUD interactions.

```
Ok. perfect, next steps.

Home page:
take out pricing part.

Make sure buttons and routes are working in all pages we have.

Develop the frontend for the My workspace part. In here users should be able to see their created documents, create other documents, delete their documents, update their documents. Right after we do this we will continue with the frontend for the documents themselves.

For now do this.
```

**Intended outcome**
- Clean up navigation, remove unused sections, and ensure routing works
- Implement document CRUD UI within the workspace view

## Sentence Analysis UI Prompt

Anchor sentence analysis and correction UX work with this prompt.

```
I want to keep working on the frontend. Moving on with sentences, analysis and corrections services, these services must be integrated into the frontend as well. For the sentences, given that every sentence of the document will be analysed we can make a homogenous ui for all sentences in general. I was thinking of allowing the user to open a modal from each sentence in which the flag (true or false), confidence rate, analysis and corrections (if there are any) are present. Figure out a way to make this work with the already existing document ui, where we also have a space for truthlens suggestions.
```

**Intended outcome**
- Build a consistent per-sentence modal experience listing flags, confidence, reasoning, and corrections
- Integrate modal controls with the document editor and suggestion panel

## Model Selection Prompt

Capture the current direction for AI model choices and deployment.

```
Okay, so all of the files, I'm not gonna change until we have the model that I'm gonna use. So, I'm thinking of OpenAI, but I wasn't thinking of 4.0 or anything that uses tokens, because we don't want to put any money into it. And there was this free one that they have, like an open source. It was like BCC20, BGG20, something like that. I think we're gonna use that. I have those two models downloaded on my OLAMA app. (Screenshot of gpt-oss).
```

**Intended outcome**
- Prefer open-source, zero-cost models running locally via Ollama
- Document available model identifiers (confirm spelling—likely `bcc20` / `ggml` variants) for repeatable setup
