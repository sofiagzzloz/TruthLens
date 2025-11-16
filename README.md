# 🔍 TruthLens

> **Automate your learning loop** — Turn messy notes into a guided learning system with AI-powered fact-checking and smart corrections.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/) [![Django](https://img.shields.io/badge/Django-5.0-green)](https://www.djangoproject.com/) [![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)

***

## 🎯 Hackathon Tracks

This project is submitted to:

* **🏆 Automate Learning: Build Smarter Study Tools** (Primary Track)
* **📚 GitBook Best Documentation Track** (Bonus Track)
* **🤖 Built with Cline CLI** (Bonus Track)

***

## 📖 What is TruthLens?

TruthLens is an **intelligent note-taking workspace** that fact-checks your study notes using AI. Once you're done writing, TruthLens analyzes every sentence, identifies potential inaccuracies, provides corrections with reasoning, and links to reliable sources; all without breaking your flow.

Think of it as having a personal fact-checker and study assistant built directly into your notebook.

### ✨ Key Features

* **🔬 Sentence-Level Intelligence**: Inspects every sentence you write and flags weak or incorrect knowledge
* **🤖 AI-Powered Fact Checking**: Uses advanced LLMs (via Ollama) to verify claims and provide grounded corrections
* **📝 Effortless Corrections**: Get refined notes with confidence that every claim has been verified
* **🔗 Source Citations**: Automatically receive references to trustworthy sources for your corrections
* **📊 Learning Workspace**: Organized dashboard to manage documents, view analysis, and track corrections
* **🔒 Secure & Private**: User authentication with secure workspace management

***

## 💡 What Inspired TruthLens?

We both go to an international university where professors first languages are often not english and it becomes incredibly hard to take notes and making sure that what you wrote is right.

We built this for students like us.

Most learners:

* ❌ Take notes quickly without verifying accuracy
* ❌ Miss subtle factual errors
* ❌ Spend hours double-checking material
* ❌ Struggle to turn raw notes into reliable knowledge

TruthLens automates the entire feedback loop, helping you learn faster, more accurately, and more confidently.

***

## 🛠️ Technologies Used

### Frontend

* **Next.js 16** - React framework with App Router
* **React 19.2** - UI library
* **TypeScript** - Type-safe development
* **Tailwind CSS** - Utility-first styling
* **Framer Motion** - Smooth animations
* **shadcn/ui** - Beautiful, accessible components
* **Radix UI** - Unstyled, accessible primitives
* **React Hook Form** - Form management
* **Zod** - Schema validation

### Backend

* **Django 5.0** - Python web framework
* **Django REST Framework** - API development
* **PostgreSQL 15** - Relational database
* **Django Unfold** - Modern admin interface
* **Django CORS Headers** - Cross-origin resource sharing

### AI/ML

* **Ollama** - Local LLM inference
* **PyTorch** - Deep learning framework
* **Transformers** - Hugging Face transformers
* **LLM-based Fact Checking** - Custom prompt engineering for sentence analysis

### DevOps

* **Docker & Docker Compose** - Multi-container orchestration
* **PostgreSQL** - Database management

***

## 🚀 Getting Started

### Prerequisites

* **Docker Desktop** installed
* **Ollama** installed locally ([Install from here](https://ollama.ai/)), we used gpt-oss:20b
* 14GB free of RAM available
* Port 3000 (frontend) and 8000 (backend) available

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/sofiagzzloz/TruthLens
    cd TruthLens
    ```
2.  **Start Ollama** (in a separate terminal)

    ```bash
    ollama serve
    ```
3.  **Pull an LLM model** (e.g., gpt-oss:20b)

    ```bash
    ollama pull gpt-oss:20b
    ```
4.  **Build and start all services**

    ```bash
    docker-compose up -d --build
    ```
5.  **Run database migrations** (first time only)

    ```bash
    docker exec -it django_backend python manage.py migrate
    ```
6.  **Create a superuser** (optional, for admin access)

    ```bash
    docker exec -it django_backend python manage.py createsuperuser
    ```
7. **Access the application**
   * Frontend: http://localhost:3000
   * Backend API: http://localhost:8000
   * Django Admin: http://localhost:8000/admin

***

## 📱 How It Works

1. **Create an account** → Sign up and get your personal workspace
2. **Write your notes** → Create documents and start writing your study notes
3. **AI Analysis** → Run TruthLens to analyze each sentence for factual accuracy
4. **View Results** → See flagged sentences with corrections, reasoning, and sources
5. **Apply Corrections** → Review and apply suggested corrections to improve your notes
6. **Build Knowledge** → Maintain a reliable, fact-checked knowledge base

### Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │ ───▶ │   Django    │ ───▶ │  PostgreSQL │
│  Frontend   │ HTTP │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                             │
                             ▼
                     ┌─────────────┐
                     │   Ollama    │
                     │  LLM Engine │
                     └─────────────┘
```

***

## 📁 Project Structure

```
TruthLens/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities & API client
│   └── package.json
│
├── backend/                  # Django backend application
│   ├── truthlens/           # Main Django app
│   │   ├── api/             # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── ai/              # AI/LLM integration
│   │   └── models.py        # Database models
│   ├── truthlens_project/   # Project settings
│   └── requirements.txt
│
├── docs/                     # GitBook documentation
│
├── docker-compose.yml        # Multi-container orchestration
└── README.md                # This file
```

***

## 🎥 Demo Video

[**Watch our demo video here**](https://youtu.be/egVAQgUe__c)

Our demo showcases:

* Creating a new document and writing notes
* Real-time sentence analysis and fact-checking
* Viewing corrections with AI reasoning and sources
* Applying corrections to improve note accuracy
* The complete learning workflow from draft to verified knowledge

***

## 📚 Documentation

Full documentation is available in our **GitBook documentation site**:

[**📖 View Documentation**](https://sofia-gonzalez-1.gitbook.io/truthlens/)

The docs include:

* Table of Contents
* Technology Stack
* Entity Relationship Diagram
* Backend Features
* Frontend Features
* AI Prompt Library
* API reference

***

## 🌟 Why TruthLens for Learning Automation?

TruthLens directly addresses the hackathon challenge: **"Make the learning process faster and more efficient"**

### We Automate:

1. ✅ **Note verification** - No more manual fact-checking
2. ✅ **Instant feedback** - Catch errors as you write
3. ✅ **Source finding** - Automatic citation and reference linking
4. ✅ **Knowledge gaps** - Identify weak understanding immediately
5. ✅ **Correction workflow** - Seamless fix application

### Learning Benefits:

* **⚡ Faster**: Automated fact-checking saves hours of manual verification
* **🎯 More Accurate**: AI catches errors humans might miss
* **📈 Better Retention**: Correcting mistakes reinforces learning
* **🔗 Better Citations**: Automatic source linking improves reference habits
* **🧠 Active Learning**: Reviewing corrections engages deeper understanding

***

## 🔮 Future Enhancements

* [ ] Export to PDF/Markdown with citations
* [ ] Collaborative workspaces for study groups
* [ ] Integration with popular note-taking apps
* [ ] Advanced analytics and learning insights
* [ ] Mobile applications (iOS & Android)
* [ ] Browser extension for web-based learning
* [ ] Customizable AI models and prompts

***

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE/) file for details.

***

## 👥 Team

**Jose Maria Larios Madrid** - [Github](https://github.com/jmlarios) | [LinkedIn](https://www.linkedin.com/in/jos%C3%A9-mar%C3%ADa-larios-madrid-5b1144355/)

**Sofia Gonzalez Lozano** - [Github](https://github.com/sofiagzzloz) | [LinkedIn](https://www.linkedin.com/in/sofia-gonzalez-lozano-32052a226/)

***

## 📞 Contact & Links

* **GitHub Repository**: https://github.com/sofiagzzloz/TruthLens
* **Documentation**: https://sofia-gonzalez-1.gitbook.io/truthlens/
* **Demo Video**: https://youtu.be/egVAQgUe\_\_c

***

Built with 💙 for learners everywhere

\- Atte: Sofia & JM
