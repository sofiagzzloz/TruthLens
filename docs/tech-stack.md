---
title: Technology Stack
description: Overview of the tools and frameworks that power TruthLens
---

# Technology Stack

TruthLens combines a modern TypeScript frontend, a robust Python backend, and containerized DevOps tooling to deliver AI-assisted learning.

## Frontend

- Next.js 16 with the App Router for server components and routing
- React 19.2 for the interactive workspace experience
- TypeScript for type-safe UI development
- Tailwind CSS, shadcn/ui, and Radix primitives for consistent styling and accessibility
- React Hook Form paired with Zod for resilient form flows
- Framer Motion for lightweight, high-impact animations

## Backend

- Django 5.0 with Django REST Framework for a composable API layer
- PostgreSQL 15 as the relational source of truth
- Django Unfold for a polished admin experience
- Django CORS Headers to enable secure cross-origin requests

## AI and Analysis

- Ollama as the local LLM runtime that executes prompt engineering workflows
- Hugging Face Transformers and PyTorch for model orchestration and fine-tuning

## DevOps and Tooling

- Docker and Docker Compose for reproducible environments
- Nginx-ready deployment configuration for production readiness
- GitHub Actions (planned) for automated CI/CD hooks
