# LexiRAG AI - Enterprise Legal Document Assistant (RAG)

**LexiRAG AI** is a modern, production-grade enterprise web application for legal document analysis, contract risk detection, timeline extraction, and Retrieval-Augmented Generation (RAG) Q&A.

---

## 🌟 Key Features

1. **RAG Legal Q&A Chat**:
   - Grounded answers backed strictly by uploaded contracts.
   - Exact **Page #** and **Clause #** citations with source snippet popup.
   - Confidence scoring (High, Medium, Low).
   - Follow-up query suggestions.
2. **"Explain Like I'm a Beginner"**:
   - One-click toggle transforming complex legalese into clear, simple English.
3. **Automated Risk Detector**:
   - Scans 8 critical risk factors: *Unlimited Liability, High Penalties, Auto-Renewal, Non-Compete, Mandatory Arbitration, Perpetual Confidentiality, Missing Signatures, Missing Termination*.
   - Circular Risk Score Gauge (0-100).
4. **AI Contract Summary**:
   - Automated extraction of Executive Summary, Parties, Effective/Expiry Dates, Financial Terms, Obligations, and Risks.
5. **Contract Side-by-Side Comparison**:
   - Semantic diff highlighting added, removed, and modified clauses.
6. **Chronological Timeline Roadmap**:
   - Visual roadmap of payment deadlines, renewal windows, and probation periods.
7. **Dense Vector Semantic Search**:
   - Natural language search across all indexed document chunks ranked by cosine similarity.
8. **Voice Input & Output**:
   - Speech-to-Text query voice input and Text-to-Speech answer reader.
9. **Admin Analytics Dashboard**:
   - Telemetry metrics on users, documents, query latency, and popular search topics.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend**: FastAPI (Python), PyMuPDF (`fitz`), python-docx, Sentence-Transformers (`all-MiniLM-L6-v2`), FAISS, LangChain.
- **Security**: JWT Authentication, guest mode, file validation, encrypted storage.

---

## 🚀 Quick Start & Installation

### Option 1: Running with Docker Compose

```bash
docker-compose up --build
```
Access the application at:
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
