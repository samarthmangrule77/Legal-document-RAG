import numpy as np
from typing import List, Dict, Any, Tuple

DEFAULT_DEMO_CHUNKS: List[Dict[str, Any]] = [
    {
        "id": "doc-001-chunk-1",
        "doc_id": "doc-001",
        "page_number": 9,
        "clause_number": "Clause 10.1",
        "content": "Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice to the non-terminating party. In cases of gross misconduct or material breach, Employer reserves the right to terminate employment immediately without notice."
    },
    {
        "id": "doc-001-chunk-2",
        "doc_id": "doc-001",
        "page_number": 7,
        "clause_number": "Clause 8.2",
        "content": "Employee agrees that during employment and for a period of twenty-four (24) months thereafter, Employee shall not directly or indirectly engage in any business competing with Employer within any geographic region worldwide."
    },
    {
        "id": "doc-001-chunk-3",
        "doc_id": "doc-001",
        "page_number": 11,
        "clause_number": "Clause 12.1",
        "content": "Employee shall indemnify and hold harmless Employer against all third-party intellectual property infringement claims arising out of custom software code developed by Employee during the course of employment."
    },
    {
        "id": "doc-002-chunk-1",
        "doc_id": "doc-002",
        "page_number": 4,
        "clause_number": "Clause 4.3",
        "content": "The lease term shall automatically renew for an additional three (3) year term unless Tenant provides written notice of non-renewal at least one hundred eighty (180) days prior to the expiration date."
    },
    {
        "id": "doc-002-chunk-2",
        "doc_id": "doc-002",
        "page_number": 5,
        "clause_number": "Clause 5.1",
        "content": "Monthly base rent of $12,500 USD shall be payable in advance on or before the first (1st) day of each calendar month. Late payments shall accrue interest at a rate of 1.5% per month."
    },
    {
        "id": "doc-003-chunk-1",
        "doc_id": "doc-003",
        "page_number": 2,
        "clause_number": "Section 3.1",
        "content": "Provider guarantees 99.9% uptime for Cloud AI services. Service credits shall be issued for any unscheduled service outage exceeding 30 consecutive minutes."
    }
]

class VectorStore:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings: List[np.ndarray] = []
        self._model = None
        # Auto pre-load demo contract chunks
        self.add_chunks(DEFAULT_DEMO_CHUNKS)

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception:
                self._model = "fallback"
        return self._model

    def _embed_text(self, text: str) -> np.ndarray:
        model = self._get_model()
        if model != "fallback" and hasattr(model, 'encode'):
            try:
                vec = model.encode(text)
                return vec / (np.linalg.norm(vec) + 1e-10)
            except Exception:
                pass

        # Fallback hash bag-of-words vector generator
        words = text.lower().split()
        vec = np.zeros(128, dtype=np.float32)
        for w in words:
            idx = abs(hash(w)) % 128
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        return vec / (norm if norm > 0 else 1.0)

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        for chunk in chunks:
            vec = self._embed_text(chunk["content"])
            self.chunks.append(chunk)
            self.embeddings.append(vec)

    def search(self, query: str, doc_ids: List[str] = None, top_k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        if not self.chunks:
            return []

        q_vec = self._embed_text(query)
        scored: List[Tuple[Dict[str, Any], float]] = []

        for chunk, emb in zip(self.chunks, self.embeddings):
            if doc_ids and ("all" not in doc_ids) and (chunk["doc_id"] not in doc_ids):
                continue
            
            score = float(np.dot(q_vec, emb))

            # Keyword relevance boost for exact query terms
            q_lower = query.lower()
            c_lower = chunk["content"].lower()
            if any(w in c_lower for w in q_lower.split() if len(w) > 3):
                score += 0.35

            scored.append((chunk, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

vector_store_instance = VectorStore()
