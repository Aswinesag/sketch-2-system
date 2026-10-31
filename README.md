# Sketch2System 🚀
*Multimodal Architecture-to-Code & Infrastructure Engine*

---

## 💡 The Problem
Every engineering team and hackathon project starts with a whiteboard session—drawing boxes, arrows, and data flows on a glass board or digital tablet. Translating that raw visual sketch into actual backend boilerplates, database schemas, and microservice definitions manually takes hours of tedious setup.

## ⚡ The Solution: Sketch2System
**Sketch2System** is an enterprise-grade developer productivity tool powered by Gemma 4's advanced multimodal reasoning. Developers can upload a photo of a whiteboard architecture sketch, flowchart, or system diagram alongside text constraints. Sketch2System instantly parses the spatial topology and outputs a fully structured, production-ready system blueprint:
- **Architecture Summary:** Comprehensive topological breakdown.
- **Microservices Grid:** Extracted service nodes and component roles.
- **PostgreSQL DDL Schemas:** Complete relational table definitions with UUIDs, foreign keys, and indexes.
- **FastAPI Boilerplate:** Production-ready asynchronous Python backend scripts.

---

## 🛠️ Architecture & Tech Stack

```text
[ Whiteboard Diagram / Sketch ] 
              │
              ▼
    ( Gemma 4 Multimodal API )
              │
              ▼
  [ FastAPI Backend Engine ] ──► Structured JSON Payload
              │
              ▼
  [ SaaS Developer Dashboard ] ──► Interactive Tabs (Summary, Services, DDL, Code)
```

- **AI Core:** Google Gemini API leveraging Gemma 4 multimodal reasoning (`gemini-2.5-flash`).
- **Backend:** FastAPI (Python), Uvicorn, Pydantic, python-multipart.
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons.
- **Deployment:** Render (Backend) & Vercel (Frontend).

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key (`GEMINI_API_KEY`)

### 1. Clone & Set Up Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create a .env file and add your API key:
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env

# Run the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

### 2. Set Up Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000` to access the SaaS dashboard.

---

## 🎯 Example Test Case: Secure Voice-Intent Financial Engine
Sketch2System was rigorously tested against complex multi-modal architectures—such as a secure voice-intent banking pipeline featuring OpenAI Whisper, ECAPA-TDNN/FaceNet biometrics, Agentic fraud risk scoring, and SHAP/LIME compliance auditing. The model successfully parsed all parallel security verification branches into structured code and database schemas.