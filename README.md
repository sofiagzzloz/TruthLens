# 🔍 TruthLens

> **Automate your learning loop** — Turn messy notes into a guided learning system with AI-powered fact-checking and smart corrections.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)

---

## 🎯 Hackathon Tracks

This project is submitted to:
- **🏆 Automate Learning: Build Smarter Study Tools** (Primary Track)
- **📚 GitBook Best Documentation Track** (Bonus Track)

---

## 📖 What is TruthLens?

TruthLens is an **intelligent note-taking workspace** that automatically fact-checks your study notes in real-time using AI. As you write, TruthLens analyzes every sentence, identifies potential inaccuracies, provides corrections with reasoning, and links to reliable sources — all without breaking your flow.

Think of it as having a personal fact-checker and study assistant built directly into your notebook.

### ✨ Key Features

- **🔬 Sentence-Level Intelligence**: Inspects every sentence you write and flags weak or incorrect knowledge
- **🤖 AI-Powered Fact Checking**: Uses advanced LLMs (via Ollama) to verify claims and provide grounded corrections
- **📝 Effortless Corrections**: Get refined notes with confidence that every claim has been verified
- **🔗 Source Citations**: Automatically receive references to trustworthy sources for your corrections
- **📊 Learning Workspace**: Organized dashboard to manage documents, view analysis, and track corrections
- **🔒 Secure & Private**: User authentication with secure workspace management

---

## 💡 What Inspired TruthLens?

Learning efficiently is hard. Students and knowledge workers often:
- ❌ Take notes from multiple sources without verifying accuracy
- ❌ Struggle to identify gaps in their understanding
- ❌ Waste time manually fact-checking every claim
- ❌ Miss important corrections that could improve their knowledge

**TruthLens automates the feedback loop** — it catches errors early, provides immediate corrections, and helps you build a more reliable knowledge base. This makes the learning process faster, more efficient, and more confident.

---

## 🛠️ Technologies Used

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Beautiful, accessible components
- **Radix UI** - Unstyled, accessible primitives
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL 15** - Relational database
- **Django Unfold** - Modern admin interface
- **Django CORS Headers** - Cross-origin resource sharing

### AI/ML
- **Ollama** - Local LLM inference
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face transformers
- **LLM-based Fact Checking** - Custom prompt engineering for sentence analysis

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database
- **Nginx-ready** - Production deployment support

---

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Ollama** installed locally ([Install from here](https://ollama.ai/))
- Port 3000 (frontend) and 8000 (backend) available

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sofiagzzloz/TruthLens
   cd TruthLens
   ```

2. **Start Ollama** (in a separate terminal)
   ```bash
   ollama serve
   ```

3. **Pull an LLM model** (e.g., llama2)
   ```bash
   ollama pull llama2
   ```

4. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

5. **Run database migrations** (first time only)
   ```bash
   docker exec -it django_backend python manage.py migrate
   ```

6. **Create a superuser** (optional, for admin access)
   ```bash
   docker exec -it django_backend python manage.py createsuperuser
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

---

## 📱 How It Works

1. **Create an account** → Sign up and get your personal workspace
2. **Write your notes** → Create documents and start writing your study notes
3. **AI Analysis** → TruthLens automatically analyzes each sentence for factual accuracy
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

---

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
│   ├── intro.md
│   └── api.md
│
├── docker-compose.yml        # Multi-container orchestration
└── README.md                # This file
```

---

## 🎥 Demo Video

[**Watch our demo video here**](#) *(Add your YouTube/Vimeo link)*

Our demo showcases:
- Creating a new document and writing notes
- Real-time sentence analysis and fact-checking
- Viewing corrections with AI reasoning and sources
- Applying corrections to improve note accuracy
- The complete learning workflow from draft to verified knowledge

---

## 📚 Documentation

Full documentation is available in our **GitBook documentation site**:

**[📖 View Documentation](#)** *(Add your GitBook link here)*

The docs include:
- Getting started guide
- API reference
- Architecture overview
- Deployment instructions
- Contributing guidelines

---

## 🌟 Why TruthLens for Learning Automation?

TruthLens directly addresses the hackathon challenge: **"Make the learning process faster and more efficient"**

### We Automate:
1. ✅ **Note verification** - No more manual fact-checking
2. ✅ **Instant feedback** - Catch errors as you write
3. ✅ **Source finding** - Automatic citation and reference linking
4. ✅ **Knowledge gaps** - Identify weak understanding immediately
5. ✅ **Correction workflow** - Seamless fix application

### Learning Benefits:
- **⚡ Faster**: Automated fact-checking saves hours of manual verification
- **🎯 More Accurate**: AI catches errors humans might miss
- **📈 Better Retention**: Correcting mistakes reinforces learning
- **🔗 Better Citations**: Automatic source linking improves reference habits
- **🧠 Active Learning**: Reviewing corrections engages deeper understanding

---

## 🎨 Screenshots

### Landing Page
*A modern, clean interface that introduces TruthLens capabilities*

### Workspace
*Your personal note-taking environment with real-time analysis*

### Analysis View
*See flagged sentences with detailed corrections and reasoning*

### Corrections Dashboard
*Manage and apply AI-suggested improvements*

---

## 🔮 Future Enhancements

- [ ] Multi-language support for international learners
- [ ] Export to PDF/Markdown with citations
- [ ] Collaborative workspaces for study groups
- [ ] Integration with popular note-taking apps
- [ ] Advanced analytics and learning insights
- [ ] Mobile applications (iOS & Android)
- [ ] Browser extension for web-based learning
- [ ] Customizable AI models and prompts

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines in the documentation.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

*Add your team members here with their roles and GitHub/LinkedIn links*

---

## 🙏 Acknowledgments

- **Ollama** - For making local LLM inference accessible
- **Django & Next.js communities** - For amazing frameworks and documentation
- **Hackathon organizers** - For the opportunity to build something meaningful
- **All contributors** - Who helped make TruthLens possible

---

## 📞 Contact & Links

- **GitHub Repository**: https://github.com/yourusername/TruthLens
- **Documentation**: [Your GitBook URL]
- **Demo Video**: [Your Video URL]
- **Live Demo**: [If deployed]

---

<div align="center">
  <p>Built with 💙 for learners everywhere</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
