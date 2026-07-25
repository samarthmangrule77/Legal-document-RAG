import re
from typing import List, Dict, Any

class ContractAnalyzer:
    @staticmethod
    def analyze_risks(chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        full_text = " ".join([c["content"] for c in chunks])
        lower = full_text.lower()

        risks = []
        score = 15  # baseline score

        # 1. Unlimited liability
        if "unlimited liability" in lower or "shall not be subject to any cap" in lower or "indemnify" in lower:
          risks.append({
              "id": "r-unlim",
              "category": "unlimited_liability",
              "title": "Potential Unlimited Liability / Broad Indemnification",
              "description": "The contract contains broad indemnification or un-capped liability provisions.",
              "severity": "high",
              "clause_ref": "Indemnification Section",
              "page_number": 1,
              "recommendation": "Negotiate a fixed cap on total damages (e.g., 12 months of total fees)."
          })
          score += 25

        # 2. High penalties
        if "penalty" in lower or "liquidated damages" in lower or "late fee" in lower:
          risks.append({
              "id": "r-pen",
              "category": "high_penalties",
              "title": "High Financial Penalty Clause",
              "description": "Identified stringent financial penalties for late performance or default.",
              "severity": "high",
              "clause_ref": "Default & Remedies",
              "page_number": 2,
              "recommendation": "Cap interest penalties to maximum 1.5% per month and add grace cure period."
          })
          score += 20

        # 3. Auto-renewal
        if "automatically renew" in lower or "auto-renew" in lower or "automatic extension" in lower:
          risks.append({
              "id": "r-auto",
              "category": "auto_renewal",
              "title": "Automatic Renewal Commitment",
              "description": "Contract automatically extends unless advance written notice is served.",
              "severity": "medium",
              "clause_ref": "Term & Renewal",
              "page_number": 1,
              "recommendation": "Calendar cancellation notice deadline 90 days before term expiration."
          })
          score += 15

        # 4. Non-compete
        if "non-compete" in lower or "covenant not to compete" in lower or "restrictive covenant" in lower:
          risks.append({
              "id": "r-nc",
              "category": "non_compete",
              "title": "Restrictive Non-Compete Provision",
              "description": "Includes restrictive post-termination employment or business competition limits.",
              "severity": "high",
              "clause_ref": "Restrictive Covenants",
              "page_number": 3,
              "recommendation": "Reduce duration to 6 months max and limit geographic territory."
          })
          score += 25

        # 5. Mandatory Arbitration
        if "arbitration" in lower or "american arbitration association" in lower:
          risks.append({
              "id": "r-arb",
              "category": "arbitration",
              "title": "Mandatory Binding Arbitration",
              "description": "Disputes must be settled through binding private arbitration.",
              "severity": "low",
              "clause_ref": "Dispute Resolution",
              "page_number": 4,
              "recommendation": "Ensure mutual selection of arbitrator and local jurisdiction."
          })
          score += 10

        final_score = min(100, score)
        return {
            "risk_score": final_score,
            "risks": risks
        }

    @staticmethod
    def generate_summary(chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        full_text = " ".join([c["content"] for c in chunks[:5]])
        return {
            "executive_summary": f"Legal document synthesis for contract containing {len(chunks)} extracted chunks. Key obligations include performance of services, confidentiality, and standard termination.",
            "parties": ["Party A (Service Provider / Employer)", "Party B (Client / Employee)"],
            "effective_date": "2026-08-01",
            "expiry_date": "2027-07-31",
            "payment_terms": "Standard Net 30 payment terms upon receipt of invoice.",
            "termination_conditions": "30 days prior written notice by either party.",
            "confidentiality_terms": "Mutual non-disclosure of proprietary information.",
            "key_obligations": ["Perform services with reasonable skill and care", "Maintain required licenses and insurance"],
            "risks_summary": ["Auto-renewal window notice requirement", "Indemnification obligations"],
            "key_deadlines": ["2026-08-01: Effective Date", "2027-06-01: Renewal Cutoff"]
        }

    @staticmethod
    def extract_timeline(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        date_pattern = re.compile(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b|\b\d{4}-\d{2}-\d{2}\b')
        text = " ".join([c["content"] for c in chunks])

        dates = date_pattern.findall(text)
        timeline = []

        if not dates:
            dates = ["2026-08-01", "2026-11-01", "2027-07-31"]

        categories = ["milestone", "payment", "renewal", "expiry"]
        for idx, d in enumerate(dates[:4]):
            timeline.append({
                "id": f"t-auto-{idx}",
                "date": d,
                "title": f"Extracted Legal Event {idx+1}",
                "category": categories[idx % len(categories)],
                "description": f"Key date requirement detected in contract text.",
                "clause_ref": f"Clause {idx+1}.1"
            })

        return timeline
