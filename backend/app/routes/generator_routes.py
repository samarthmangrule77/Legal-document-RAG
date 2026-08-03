import os
import time
import uuid
import asyncio
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import Document, ContractSummary, RiskReport, Workspace, User, AuditLog
from app.rag.extractor import DocumentExtractor
from app.rag.vector_store import vector_store_instance
from app.rag.analyzer import ContractAnalyzer

router = APIRouter(prefix="/generator", tags=["AI Contract Generator"])

class GenerateContractRequest(BaseModel):
    template_id: str
    parameters: Dict[str, Any]

@router.get("/templates")
def list_contract_templates():
    return [
        {
            "id": "employment",
            "title": "Employment Agreement",
            "category": "HR & Hiring",
            "description": "Standard full-time employment contract with compensation, probation, notice period, and IP assignment clauses.",
            "fields": [
                {"name": "employee_name", "label": "Employee Full Name", "placeholder": "e.g. Sarah Connor", "type": "text", "required": True},
                {"name": "job_title", "label": "Job Title / Position", "placeholder": "e.g. Senior Software Engineer", "type": "text", "required": True},
                {"name": "salary", "label": "Annual Salary", "placeholder": "e.g. $140,000", "type": "text", "required": True},
                {"name": "country", "label": "Country / Jurisdiction", "placeholder": "e.g. United States", "type": "text", "required": True},
                {"name": "notice_period", "label": "Notice Period", "placeholder": "e.g. 30 Days", "type": "text", "required": True},
                {"name": "probation_period", "label": "Probation Period", "placeholder": "e.g. 90 Days", "type": "text", "required": False}
            ]
        },
        {
            "id": "nda",
            "title": "Non-Disclosure Agreement (NDA)",
            "category": "Confidentiality",
            "description": "Mutual or unilateral non-disclosure agreement to protect trade secrets and proprietary data.",
            "fields": [
                {"name": "disclosing_party", "label": "Disclosing Party Name", "placeholder": "e.g. LexiCorp Inc.", "type": "text", "required": True},
                {"name": "receiving_party", "label": "Receiving Party Name", "placeholder": "e.g. Cyberdyne Systems", "type": "text", "required": True},
                {"name": "country", "label": "Governing Jurisdiction", "placeholder": "e.g. United Kingdom", "type": "text", "required": True},
                {"name": "term_years", "label": "Confidentiality Term (Years)", "placeholder": "e.g. 3 Years", "type": "text", "required": True}
            ]
        },
        {
            "id": "saas_msa",
            "title": "SaaS Master Services Agreement (MSA)",
            "category": "Commercial & Tech",
            "description": "Enterprise cloud SaaS agreement outlining service SLA, payment terms, data protection, and liability caps.",
            "fields": [
                {"name": "provider_name", "label": "SaaS Provider Company", "placeholder": "e.g. NexusCloud AI Technologies", "type": "text", "required": True},
                {"name": "client_name", "label": "Client Company Name", "placeholder": "e.g. Global Logistics Ltd.", "type": "text", "required": True},
                {"name": "annual_fee", "label": "Annual SaaS License Fee", "placeholder": "e.g. $48,000", "type": "text", "required": True},
                {"name": "sla_tier", "label": "Uptime SLA Tier", "placeholder": "e.g. 99.9% Uptime Guarantee", "type": "text", "required": True},
                {"name": "country", "label": "Governing Law", "placeholder": "e.g. Delaware, USA", "type": "text", "required": True}
            ]
        },
        {
            "id": "lease",
            "title": "Commercial Property Lease",
            "category": "Real Estate",
            "description": "Commercial lease agreement covering monthly rent, security deposit, maintenance, and lease duration.",
            "fields": [
                {"name": "landlord_name", "label": "Landlord / Lessor Name", "placeholder": "e.g. Skyline Real Estate Holdings", "type": "text", "required": True},
                {"name": "tenant_name", "label": "Tenant / Lessee Name", "placeholder": "e.g. Acme Tech Solutions Inc.", "type": "text", "required": True},
                {"name": "property_address", "label": "Leased Premises Address", "placeholder": "e.g. 500 Market St, Suite 1200, San Francisco, CA", "type": "text", "required": True},
                {"name": "monthly_rent", "label": "Monthly Rent Amount", "placeholder": "e.g. $8,500 / month", "type": "text", "required": True},
                {"name": "lease_term_months", "label": "Lease Term (Months)", "placeholder": "e.g. 36 Months", "type": "text", "required": True}
            ]
        }
    ]

def _build_employment_text(p: Dict[str, Any]) -> str:
    emp = p.get("employee_name", "John Doe")
    title = p.get("job_title", "Software Engineer")
    salary = p.get("salary", "$120,000")
    country = p.get("country", "United States")
    notice = p.get("notice_period", "30 Days")
    probation = p.get("probation_period", "90 Days")
    date_str = time.strftime("%B %d, %Y")

    return f"""EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT (the "Agreement") is entered into as of {date_str}, by and between Employer ("Company") and {emp} ("Employee").

1. POSITION AND DUTIES
1.1 Employer agrees to employ Employee in the position of {title}. Employee shall perform all duties customary to such role under the laws of {country}.
1.2 Employee agrees to devote their full working time, attention, and effort to the business and affairs of the Company.

2. COMPENSATION AND BENEFITS
2.1 Base Salary: Employer shall pay Employee an annual base compensation of {salary}, payable in accordance with the Company's standard payroll practices.
2.2 Benefits: Employee shall be eligible to participate in standard employee benefit plans including medical insurance, retirement contributions, and paid leave.

3. PROBATION AND TERMINATION
3.1 Probationary Period: Employee shall be subject to an initial probationary period of {probation} from the commencement date.
3.2 Notice Period: Either party may terminate this Agreement at any time by providing written notice of at least {notice} to the other party.
3.3 Termination for Cause: Employer reserves the right to terminate employment immediately without prior notice in the event of gross misconduct, breach of fiduciary duty, or willful neglect.

4. CONFIDENTIALITY AND INTELLECTUAL PROPERTY
4.1 All inventions, software code, legal documents, and trade secrets developed by Employee during employment shall belong exclusively to Employer.
4.2 Employee covenants to maintain strict confidentiality regarding all proprietary information of Company both during and after employment.

5. GOVERNING LAW AND ARBITRATION
5.1 This Agreement shall be governed by and construed in accordance with the substantive laws of {country}.
5.2 Any dispute arising out of or relating to this Agreement shall be resolved through binding arbitration in accordance with standard legal procedures.

IN WITNESS WHEREOF, the parties hereto have executed this Employment Agreement as of the date first written above.

Employer Representative: _______________________
Employee ({emp}): _______________________
"""

def _build_nda_text(p: Dict[str, Any]) -> str:
    disc = p.get("disclosing_party", "Disclosing Corp")
    rec = p.get("receiving_party", "Receiving Corp")
    country = p.get("country", "United States")
    term = p.get("term_years", "3 Years")
    date_str = time.strftime("%B %d, %Y")

    return f"""MUTUAL NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement (the "Agreement") is effective as of {date_str}, by and between {disc} ("Disclosing Party") and {rec} ("Receiving Party").

1. PURPOSE AND PROPRIETARY INFORMATION
The parties intend to evaluate a potential business transaction. In connection with this evaluation, Disclosing Party may disclose confidential technical, legal, and financial information.

2. OBLIGATIONS OF RECEIVING PARTY
2.1 Receiving Party agrees to hold all Proprietary Information in strict confidence and use it solely for the Purpose.
2.2 Receiving Party shall not disclose Proprietary Information to third parties without prior written consent.

3. TERM AND TERMINATION
This Agreement and the confidentiality obligations set forth herein shall remain binding for a period of {term} from the date of disclosure.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {country}.

Disclosing Party ({disc}): _______________________
Receiving Party ({rec}): _______________________
"""

def _build_saas_msa_text(p: Dict[str, Any]) -> str:
    prov = p.get("provider_name", "SaaS Cloud Inc.")
    client = p.get("client_name", "Client Corp")
    fee = p.get("annual_fee", "$50,000")
    sla = p.get("sla_tier", "99.9% Uptime Guarantee")
    country = p.get("country", "Delaware, USA")
    date_str = time.strftime("%B %d, %Y")

    return f"""SAAS MASTER SERVICES AGREEMENT (MSA)

This Master Services Agreement (the "Agreement") is entered into on {date_str}, between {prov} ("Provider") and {client} ("Client").

1. SAAS SUBSCRIPTION SERVICE
1.1 Provider grants Client a non-exclusive subscription to access the LexiRAG SaaS platform.
1.2 SLA Commitment: Provider guarantees {sla}.

2. FEES AND PAYMENT
2.1 Client shall pay an annual SaaS subscription fee of {fee}, billed in advance.
2.2 Late payments shall accrue interest at 1.5% per month.

3. LIMITATION OF LIABILITY AND GOVERNING LAW
3.1 Maximum aggregate liability of Provider shall not exceed total fees paid by Client in the preceding 12 months.
3.2 This MSA is governed by the laws of {country}.

Provider ({prov}): _______________________
Client ({client}): _______________________
"""

def _build_lease_text(p: Dict[str, Any]) -> str:
    landlord = p.get("landlord_name", "Landlord Inc.")
    tenant = p.get("tenant_name", "Tenant Corp")
    address = p.get("property_address", "100 Main St")
    rent = p.get("monthly_rent", "$5,000 / month")
    term = p.get("lease_term_months", "24 Months")
    date_str = time.strftime("%B %d, %Y")

    return f"""COMMERCIAL PROPERTY LEASE AGREEMENT

This Lease Agreement is executed on {date_str}, between {landlord} ("Lessor") and {tenant} ("Lessee").

1. PREMISES AND TERM
1.1 Lessor leases to Lessee the commercial space located at {address}.
1.2 The initial lease duration shall be {term}.

2. RENT AND DEPOSIT
2.1 Lessee agrees to pay a monthly rent of {rent}, payable on the 1st of each month.

3. GOVERNING LAW
This Lease shall be governed by applicable commercial real estate laws.

Lessor ({landlord}): _______________________
Lessee ({tenant}): _______________________
"""

@router.post("/generate")
async def generate_contract(req: GenerateContractRequest, db: Session = Depends(get_db)):
    p = req.parameters
    if req.template_id == "employment":
        filename = f"Employment_Agreement_{p.get('employee_name', 'Draft').replace(' ', '_')}.pdf"
        contract_text = _build_employment_text(p)
    elif req.template_id == "nda":
        filename = f"NDA_{p.get('disclosing_party', 'PartyA').replace(' ', '_')}_vs_{p.get('receiving_party', 'PartyB').replace(' ', '_')}.pdf"
        contract_text = _build_nda_text(p)
    elif req.template_id == "saas_msa":
        filename = f"SaaS_MSA_{p.get('client_name', 'Client').replace(' ', '_')}.pdf"
        contract_text = _build_saas_msa_text(p)
    elif req.template_id == "lease":
        filename = f"Commercial_Lease_{p.get('tenant_name', 'Tenant').replace(' ', '_')}.pdf"
        contract_text = _build_lease_text(p)
    else:
        raise HTTPException(status_code=400, detail="Unsupported contract template.")

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "w", encoding="utf-8", errors="ignore") as f:
        f.write(contract_text)

    extracted = {"file_type": "pdf", "page_count": 1, "pages": [{"page_number": 1, "text": contract_text}], "is_scanned_ocr": False}
    chunks = DocumentExtractor.chunk_document(extracted, doc_id)
    vector_store_instance.add_chunks(chunks)

    risk_analysis = ContractAnalyzer.analyze_risks(chunks)
    summary = ContractAnalyzer.generate_summary(chunks)
    timeline = ContractAnalyzer.extract_timeline(chunks)

    ws = db.query(Workspace).first()
    ws_id = ws.id if ws else str(uuid.uuid4())

    new_doc = Document(
        id=doc_id,
        workspace_id=ws_id,
        filename=filename,
        file_type="pdf",
        file_size_bytes=len(contract_text.encode("utf-8")),
        file_path=file_path,
        chunk_count=len(chunks),
        status="indexed",
        risk_score=risk_analysis.get("risk_score", 0),
        is_scanned_ocr=False,
        content=contract_text,
        upload_date_str=time.strftime("%Y-%m-%d %H:%M")
    )
    db.add(new_doc)

    summary_rec = ContractSummary(
        id=str(uuid.uuid4()),
        document_id=doc_id,
        executive_summary=summary.get("executive_summary", "Contract summary generated."),
        parties=summary.get("parties", []),
        effective_date=summary.get("effective_date", "TBD"),
        expiry_date=summary.get("expiry_date", "TBD"),
        financial_terms=summary.get("financial_terms", "Standard terms"),
        key_obligations=summary.get("key_obligations", []),
        governing_law=summary.get("governing_law", "Standard jurisdiction")
    )
    db.add(summary_rec)

    risk_rec = RiskReport(
        id=str(uuid.uuid4()),
        document_id=doc_id,
        overall_risk_score=risk_analysis.get("risk_score", 0),
        risk_level="High" if risk_analysis.get("risk_score", 0) > 60 else ("Medium" if risk_analysis.get("risk_score", 0) > 30 else "Low"),
        flagged_clauses=risk_analysis.get("risks", [])
    )
    db.add(risk_rec)

    audit_log = AuditLog(
        id=str(uuid.uuid4()),
        workspace_id=ws_id,
        user_name="AI Contract Generator",
        user_email="ai.generator@nexuscorp.com",
        role="system",
        action_type="GENERATE",
        target_resource=filename,
        details=f"Synthesized and indexed {filename} via AI Contract Generator.",
        ip_address="127.0.0.1"
    )
    db.add(audit_log)

    db.commit()
    db.refresh(new_doc)

    size_mb = new_doc.file_size_bytes / (1024 * 1024) if new_doc.file_size_bytes else 0.1
    file_size_str = f"{size_mb:.1f} MB" if size_mb >= 1.0 else f"{max(0.1, round(new_doc.file_size_bytes / 1024, 1))} KB"

    doc_meta = {
        "id": doc_id,
        "filename": filename,
        "file_type": "pdf",
        "upload_date": time.strftime("%Y-%m-%d %H:%M"),
        "file_size": file_size_str,
        "chunk_count": len(chunks),
        "status": "indexed",
        "risk_score": risk_analysis["risk_score"],
        "is_scanned_ocr": False,
        "summary": summary,
        "risks": risk_analysis["risks"],
        "timeline": timeline,
        "generated_text": contract_text
    }

    try:
        from app.routes.ws_routes import ws_manager
        asyncio.create_task(ws_manager.broadcast({
            "event": "doc_indexed",
            "title": "AI Contract Generated & Indexed ✔",
            "message": f"Drafted and vector-indexed {filename}",
            "filename": filename,
            "doc_id": doc_id,
            "timestamp": time.strftime("%H:%M:%S")
        }))
    except Exception:
        pass

    return {
        "status": "success",
        "message": "Contract successfully generated and indexed into RAG database!",
        "document": doc_meta,
        "contract_text": contract_text
    }
