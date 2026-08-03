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
        existing_org = db.query(Workspace).first()
        if not existing_org:
            print("Seeding initial PostgreSQL database with default data...")

            # 1. Workspace
            ws_id = "11111111-1111-4111-8111-111111111111"
            workspace = Workspace(
                id=ws_id,
                name="Nexus Corp Enterprise",
                slug="nexus-corp",
                plan="Business Pro",
                storage_used_mb=50.0,
                max_storage_mb=10000.0,
                brand_logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
                ai_llm_model="GPT-4o (OpenAI)",
                embedding_model="all-MiniLM-L6-v2 (384-dim)",
                storage_provider="Local Vector Vault (Encrypted)",
                primary_language="English 🇺🇸",
                openai_api_key="sk-proj-************************************",
                anthropic_api_key="sk-ant-************************************",
                company_policy_rules="All indemnification clauses must be capped at 12 months total fees paid. Non-compete covenants must be limited to 6 months local territory. Notice period minimum is 30 calendar days.",
                preferred_language="English 🇺🇸",
                explanation_style="Executive TL;DR",
                tone="Professional & Direct"
            )
            db.add(workspace)

            # 2. Teams
            team_legal_id = "22222222-2222-4222-8222-222222222221"
            team_hr_id = "22222222-2222-4222-8222-222222222222"
            team_legal = Team(
                id=team_legal_id,
                workspace_id=ws_id,
                name="General Legal Contracts",
                description="Default legal compliance scope",
                color="brand",
                document_count=3
            )
            team_hr = Team(
                id=team_hr_id,
                workspace_id=ws_id,
                name="HR & Employment",
                description="Employment contracts & offer letters",
                color="emerald",
                document_count=1
            )
            db.add_all([team_legal, team_hr])

            # 3. Users
            u1_id = "33333333-3333-4333-8333-333333333331"
            u2_id = "33333333-3333-4333-8333-333333333332"
            user_alex = User(
                id=u1_id,
                workspace_id=ws_id,
                email="alex.rivera@nexuscorp.com",
                name="Alex Rivera",
                password_hash=get_password_hash("password123"),
                role="owner",
                active_org_id=ws_id,
                active_team_id="all",
                job_title="Head of Legal & Compliance",
                company_name="Nexus Corp",
                email_verified=True,
                auth_provider="local"
            )
            user_samarth = User(
                id=u2_id,
                workspace_id=ws_id,
                email="samarth@nexuscorp.com",
                name="Samarth Mangrule",
                password_hash=get_password_hash("password123"),
                role="admin",
                active_org_id=ws_id,
                active_team_id="all",
                job_title="Lead AI Engineer",
                company_name="Nexus Corp",
                email_verified=True,
                auth_provider="local"
            )
            db.add_all([user_alex, user_samarth])

            # 4. Documents
            doc1_id = "44444444-4444-4444-8444-444444444441"
            doc2_id = "44444444-4444-4444-8444-444444444442"
            doc3_id = "44444444-4444-4444-8444-444444444443"
            doc1 = Document(
                id=doc1_id,
                workspace_id=ws_id,
                team_id=team_legal_id,
                user_id=u1_id,
                filename="Senior_Software_Engineer_Employment_Agreement.pdf",
                file_type="pdf",
                file_size_bytes=2516582,
                file_path="/app/uploads/Senior_Software_Engineer_Employment_Agreement.pdf",
                chunk_count=24,
                status="indexed",
                risk_score=68,
                is_scanned_ocr=False,
                upload_date_str="2026-07-20 10:30",
                content="Employment agreement detailing full-time engineering duties, compensation, notice period, and non-compete covenants."
            )
            doc2 = Document(
                id=doc2_id,
                workspace_id=ws_id,
                team_id=team_legal_id,
                user_id=u1_id,
                filename="Commercial_Office_Lease_Agreement_2026.pdf",
                file_type="pdf",
                file_size_bytes=4299161,
                file_path="/app/uploads/Commercial_Office_Lease_Agreement_2026.pdf",
                chunk_count=38,
                status="indexed",
                risk_score=42,
                is_scanned_ocr=True,
                upload_date_str="2026-07-22 14:15",
                content="Commercial property lease agreement for 12,000 sq ft office space with annual 3% escalations."
            )
            doc3 = Document(
                id=doc3_id,
                workspace_id=ws_id,
                team_id=team_hr_id,
                user_id=u2_id,
                filename="SaaS_Enterprise_Master_Services_Agreement.docx",
                file_type="docx",
                file_size_bytes=1887436,
                file_path="/app/uploads/SaaS_Enterprise_Master_Services_Agreement.docx",
                chunk_count=19,
                status="indexed",
                risk_score=25,
                is_scanned_ocr=False,
                upload_date_str="2026-07-24 16:40",
                content="Master Services Agreement for enterprise cloud platform subscription."
            )
            db.add_all([doc1, doc2, doc3])

            # 5. Contract Summaries
            summary1 = ContractSummary(
                id="55555555-5555-4555-8555-555555555551",
                document_id=doc1_id,
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
                id="55555555-5555-4555-8555-555555555552",
                document_id=doc2_id,
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
                id="66666666-6666-4666-8666-666666666661",
                document_id=doc1_id,
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
                id="66666666-6666-4666-8666-666666666662",
                document_id=doc2_id,
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
            chat1_id = "77777777-7777-4777-8777-777777777771"
            chat1 = Chat(
                id=chat1_id,
                workspace_id=ws_id,
                user_id=u1_id,
                title="Employment Contract Notice & Non-Compete Review"
            )
            db.add(chat1)

            msg1 = Message(
                id="88888888-8888-4888-8888-888888888881",
                chat_id=chat1_id,
                sender="user",
                text="What is the required notice period for voluntary termination under the Senior Software Engineer Employment Agreement?",
                timestamp_str="10:30 AM"
            )
            msg2 = Message(
                id="88888888-8888-4888-8888-888888888882",
                chat_id=chat1_id,
                sender="ai",
                text="According to Clause 8.1 of the Senior Software Engineer Employment Agreement, either party may terminate this agreement without cause by providing at least **30 calendar days advance written notice** to the other party.\n\nDuring the 30-day notice period, the employee remains obligated to fulfill standard duties and assist with handover responsibilities.",
                timestamp_str="10:31 AM",
                confidence_level="High",
                summary="The required voluntary termination notice period is 30 calendar days written notice.",
                beginner_version="You must give 30 days written notice before leaving your job.",
                reasoning="1. Scanned vector index for 'termination notice period'.\n2. Found Clause 8.1 on Page 4 with 96% similarity score.\n3. Extracted exact 30 calendar days requirement.",
                citations=[
                    {
                        "doc_id": doc1_id,
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
            sub_id = "99999999-9999-4999-8999-999999999991"
            subscription = Subscription(
                id=sub_id,
                workspace_id=ws_id,
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
                id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
                subscription_id=sub_id,
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
                    id="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
                    workspace_id=ws_id,
                    user_id=u1_id,
                    user_name="Alex Rivera",
                    user_email="alex.rivera@nexuscorp.com",
                    role="owner",
                    action_type="BILLING",
                    target_resource="Subscription Plan",
                    details="Verified workspace subscription details on Free Tier.",
                    ip_address="192.168.1.45"
                ),
                AuditLog(
                    id="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
                    workspace_id=ws_id,
                    user_id=u2_id,
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
