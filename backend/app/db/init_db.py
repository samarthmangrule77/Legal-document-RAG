import datetime
from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.db.models import (
    Workspace, Team, User, Document, ContractSummary, RiskReport,
    Chat, Message, AuditLog, Subscription, Invoice
)
from app.auth import get_password_hash

def init_db():
    """Create all database tables and seed default data if empty."""
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if default workspace exists
        existing_org = db.query(Workspace).filter(Workspace.id == "org-nexus").first()
        if not existing_org:
            print("Seeding initial PostgreSQL database with default data...")

            # 1. Workspace
            workspace = Workspace(
                id="org-nexus",
                name="Nexus Corp Enterprise",
                slug="nexus-corp",
                plan="Business Pro",
                storage_used_mb=50.0,
                max_storage_mb=10000.0
            )
            db.add(workspace)

            # 2. Teams
            team_legal = Team(
                id="team-legal",
                workspace_id="org-nexus",
                name="General Legal Contracts",
                description="Default legal compliance scope",
                color="brand",
                document_count=3
            )
            team_hr = Team(
                id="team-hr",
                workspace_id="org-nexus",
                name="HR & Employment",
                description="Employment contracts & offer letters",
                color="emerald",
                document_count=1
            )
            db.add_all([team_legal, team_hr])

            # 3. Users
            user_alex = User(
                id="u-1",
                workspace_id="org-nexus",
                email="alex.rivera@nexuscorp.com",
                name="Alex Rivera",
                password_hash=get_password_hash("password123"),
                role="owner",
                active_org_id="org-nexus",
                active_team_id="all",
                job_title="Head of Legal & Compliance",
                company_name="Nexus Corp",
                email_verified=True,
                auth_provider="local"
            )
            user_samarth = User(
                id="u-2",
                workspace_id="org-nexus",
                email="samarth@nexuscorp.com",
                name="Samarth Mangrule",
                password_hash=get_password_hash("password123"),
                role="admin",
                active_org_id="org-nexus",
                active_team_id="all",
                job_title="Lead AI Engineer",
                company_name="Nexus Corp",
                email_verified=True,
                auth_provider="local"
            )
            db.add_all([user_alex, user_samarth])

            # 4. Documents
            doc1 = Document(
                id="doc-001",
                workspace_id="org-nexus",
                team_id="team-legal",
                user_id="u-1",
                filename="Senior_Software_Engineer_Employment_Agreement.pdf",
                file_type="pdf",
                file_size_bytes=2516582,
                file_path="/app/uploads/Senior_Software_Engineer_Employment_Agreement.pdf",
                chunk_count=24,
                status="indexed",
                risk_score=68,
                is_scanned_ocr=False,
                upload_date_str="2026-07-20 10:30",
                content="Employment agreement between Nexus Corp and Employee..."
            )
            doc2 = Document(
                id="doc-002",
                workspace_id="org-nexus",
                team_id="team-legal",
                user_id="u-1",
                filename="Commercial_Office_Lease_Agreement_2026.pdf",
                file_type="pdf",
                file_size_bytes=4299161,
                file_path="/app/uploads/Commercial_Office_Lease_Agreement_2026.pdf",
                chunk_count=38,
                status="indexed",
                risk_score=42,
                is_scanned_ocr=True,
                upload_date_str="2026-07-22 14:15",
                content="Lease agreement for commercial space at 500 Technology Way..."
            )
            doc3 = Document(
                id="doc-003",
                workspace_id="org-nexus",
                team_id="team-hr",
                user_id="u-2",
                filename="SaaS_Enterprise_Master_Services_Agreement.docx",
                file_type="docx",
                file_size_bytes=1887436,
                file_path="/app/uploads/SaaS_Enterprise_Master_Services_Agreement.docx",
                chunk_count=19,
                status="indexed",
                risk_score=25,
                is_scanned_ocr=False,
                upload_date_str="2026-07-24 16:40",
                content="Master Services Agreement for enterprise cloud platform subscription..."
            )
            db.add_all([doc1, doc2, doc3])

            # 5. Contract Summaries
            summary1 = ContractSummary(
                document_id="doc-001",
                executive_summary="Employment agreement detailing full-time engineering duties, baseline compensation, uncapped indemnification obligations, and 24-month non-compete covenants.",
                parties=["Nexus Corp Inc. (Employer)", "Alex Rivera (Employee)"],
                effective_date="August 1, 2026",
                expiry_date="Indefinite (Full-Time)",
                financial_terms="$185,000 USD Annual Base Salary + 15% Annual Target Bonus",
                key_obligations=[
                    "30-day written notice required prior to voluntary termination",
                    "Assignment of all intellectual property created during employment scope",
                    "24-month non-compete restriction across North America"
                ],
                governing_law="State of California, USA"
            )
            summary2 = ContractSummary(
                document_id="doc-002",
                executive_summary="Commercial property lease agreement for 12,000 sq ft office space with annual 3% escalations and auto-renewal notice terms.",
                parties=["Apex Real Estate Properties LLC (Landlord)", "Nexus Corp (Tenant)"],
                effective_date="April 1, 2026",
                expiry_date="March 31, 2029 (3-Year Term)",
                financial_terms="$32,000 USD Monthly Rent + Triple Net (NNN) Operating Expenses",
                key_obligations=[
                    "Landlord option to auto-renew unless 60-day notice is served",
                    "Tenant responsible for internal repairs over $1,000",
                    "Security deposit of 2 months rent held in escrow"
                ],
                governing_law="State of New York, USA"
            )
            db.add_all([summary1, summary2])

            # 6. Risk Reports
            risk1 = RiskReport(
                document_id="doc-001",
                overall_risk_score=68,
                risk_level="High",
                flagged_clauses=[
                    {
                        "category": "Uncapped Liability",
                        "severity": "High",
                        "clause_num": "Clause 12.1",
                        "text": "Employee shall indemnify employer for any indirect damages without cap.",
                        "recommendation": "Negotiate monetary cap equal to 12 months salary."
                    },
                    {
                        "category": "Non-Compete",
                        "severity": "Medium",
                        "clause_num": "Clause 14.3",
                        "text": "24-month non-compete window across North America.",
                        "recommendation": "Reduce duration to 6 months or narrow geographic scope."
                    }
                ]
            )
            risk2 = RiskReport(
                document_id="doc-002",
                overall_risk_score=42,
                risk_level="Medium",
                flagged_clauses=[
                    {
                        "category": "Auto-Renewal",
                        "severity": "Medium",
                        "clause_num": "Clause 5.2",
                        "text": "Lease automatically renews for 3 years unless notice given 60 days prior.",
                        "recommendation": "Calendar reminder 90 days before expiration date."
                    }
                ]
            )
            db.add_all([risk1, risk2])

            # 7. Chats & Messages
            chat1 = Chat(
                id="conv-1",
                workspace_id="org-nexus",
                user_id="u-1",
                title="Employment Contract Notice & Non-Compete Review"
            )
            db.add(chat1)

            msg1 = Message(
                id="m-1",
                chat_id="conv-1",
                sender="user",
                text="What is the required notice period for voluntary termination under the Senior Software Engineer Employment Agreement?",
                timestamp_str="10:30 AM"
            )
            msg2 = Message(
                id="m-2",
                chat_id="conv-1",
                sender="ai",
                text="According to Clause 8.1 of the Senior Software Engineer Employment Agreement, either party may terminate this agreement without cause by providing at least **30 calendar days advance written notice** to the other party.\n\nDuring the 30-day notice period, the employee remains obligated to fulfill standard duties and assist with handover responsibilities.",
                timestamp_str="10:31 AM",
                confidence_level="High",
                summary="The required voluntary termination notice period is 30 calendar days written notice.",
                beginner_version="You must give 30 days written notice before leaving your job.",
                reasoning="1. Scanned FAISS index for 'termination notice period'.\n2. Found Clause 8.1 on Page 4 with 96% vector similarity score.\n3. Extracted exact 30 calendar days requirement.",
                citations=[
                    {
                        "doc_id": "doc-001",
                        "doc_name": "Senior_Software_Engineer_Employment_Agreement.pdf",
                        "page_number": 4,
                        "clause_number": "Clause 8.1",
                        "snippet": "Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice.",
                        "confidence": 0.96
                    }
                ],
                related_clauses=[
                    "Clause 8.2 (Immediate Termination for Cause)",
                    "Clause 14.3 (Non-Compete Restrictions)"
                ],
                follow_up_questions=[
                    "What remedies apply if 30 days notice is not provided?",
                    "Are there any non-compete restrictions after termination?",
                    "What happens to unvested stock options upon termination?"
                ]
            )
            db.add_all([msg1, msg2])

            # 8. Subscription & Invoices
            subscription = Subscription(
                id="sub-1",
                workspace_id="org-nexus",
                plan_id="free",
                plan_name="Free Plan",
                pdf_limit=5,
                current_pdf_count=3,
                status="active",
                billing_cycle="monthly",
                price_per_month=0.0,
                renews_at="2026-08-27",
                stripe_customer_id="cus_lexi99201"
            )
            db.add(subscription)

            invoice1 = Invoice(
                id="inv-1",
                subscription_id="sub-1",
                invoice_number="inv_1092",
                date_str="2026-07-01",
                amount_str="$0.00",
                status="Paid",
                plan_name="Free Plan",
                pdf_url="#"
            )
            db.add(invoice1)

            # 9. Audit Logs
            logs = [
                AuditLog(
                    id="audit-101",
                    workspace_id="org-nexus",
                    user_id="u-1",
                    user_name="Alex Rivera",
                    user_email="alex.rivera@nexuscorp.com",
                    role="owner",
                    action_type="BILLING",
                    target_resource="Subscription Plan",
                    details="Verified workspace subscription details on Free Tier.",
                    ip_address="192.168.1.45"
                ),
                AuditLog(
                    id="audit-102",
                    workspace_id="org-nexus",
                    user_id="u-2",
                    user_name="Samarth Mangrule",
                    user_email="samarth@nexuscorp.com",
                    role="admin",
                    action_type="UPLOAD",
                    target_resource="Senior_Software_Engineer_Employment_Agreement.pdf",
                    details="Uploaded and indexed contract PDF into FAISS vector store.",
                    ip_address="192.168.1.12"
                )
            ]
            db.add_all(logs)

            db.commit()
            print("PostgreSQL initial data successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error initializing/seeding database: {e}")
    finally:
        db.close()
