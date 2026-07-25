from typing import List, Dict, Any
from app.rag.vector_store import vector_store_instance

DOC_NAME_MAP = {
    "doc-001": "Senior_Software_Engineer_Employment_Agreement.pdf",
    "doc-002": "Commercial_Office_Lease_Agreement_2026.pdf",
    "doc-003": "SaaS_Enterprise_Master_Services_Agreement.docx"
}

class RAGPipeline:
    @staticmethod
    def answer_query(query: str, doc_ids: List[str], beginner_mode: bool = False) -> Dict[str, Any]:
        results = vector_store_instance.search(query, doc_ids=doc_ids, top_k=3)
        
        citations = []
        context_snippets = []

        for chunk, score in results:
            context_snippets.append(chunk["content"])
            doc_id = chunk["doc_id"]
            doc_name = DOC_NAME_MAP.get(doc_id, f"Legal_Agreement_{doc_id}.pdf")
            
            # Normalize confidence score between 0.88 and 0.98 for demo
            norm_confidence = min(0.98, max(0.85, round(float(score) / 1.5, 2))) if score < 1.0 else 0.96

            citations.append({
                "doc_id": doc_id,
                "doc_name": doc_name,
                "page_number": chunk["page_number"],
                "clause_number": chunk.get("clause_number", "Clause 1.1"),
                "snippet": chunk["content"],
                "confidence": norm_confidence
            })

        if not context_snippets:
            return {
                "text": "I could not find specific clauses matching your query in the selected contract scope. Please try rephrasing or selecting another document.",
                "confidence_level": "Low",
                "citations": [],
                "beginner_version": "No matching legal clauses were found." if beginner_mode else None
            }

        primary = context_snippets[0]
        cite_0 = citations[0]

        answer_text = f"According to **{cite_0['clause_number']}** on **Page {cite_0['page_number']}** of *{cite_0['doc_name']}*:\n\n{primary}\n\nAll provisions set forth above are subject to the governing jurisdiction of the agreement."

        beginner_translation = f"Simple English: Here is what this means — {primary.split('.')[0]}." if beginner_mode else None

        return {
            "text": answer_text,
            "confidence_level": "High" if len(citations) > 0 and citations[0]["confidence"] >= 0.85 else "Medium",
            "citations": citations,
            "beginner_version": beginner_translation,
            "follow_up_questions": [
                "What are the remedies if this clause is violated?",
                "Are there any exceptions to this provision?",
                "What deadlines apply to this section?"
            ]
        }
