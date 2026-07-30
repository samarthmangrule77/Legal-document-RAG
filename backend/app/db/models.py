import datetime
import uuid
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    plan = Column(String(50), default="Business Pro", nullable=False)
    storage_used_mb = Column(Float, default=50.0, nullable=False)
    max_storage_mb = Column(Float, default=10000.0, nullable=False)

    # Relationships
    teams = relationship("Team", back_populates="workspace", cascade="all, delete-orphan")
    users = relationship("User", back_populates="workspace")
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="workspace", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="workspace", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="workspace", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(50), default="brand", nullable=False)
    document_count = Column(Integer, default=0, nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="teams")
    documents = relationship("Document", back_populates="team")

class User(Base):
    __tablename__ = "users"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="member", nullable=False)
    job_title = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    auth_provider = Column(String(50), default="local", nullable=False)  # local | google | microsoft | github
    active_org_id = Column(String(36), nullable=True)
    active_team_id = Column(String(36), default="all", nullable=True)

    # Relationships
    workspace = relationship("Workspace", back_populates="users")
    documents = relationship("Document", back_populates="user")
    chats = relationship("Chat", back_populates="user")

class Document(Base):
    __tablename__ = "documents"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(String(36), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    file_path = Column(Text, nullable=True)
    chunk_count = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="indexed", nullable=False)
    risk_score = Column(Integer, default=0, nullable=False)
    is_scanned_ocr = Column(Boolean, default=False, nullable=False)
    content = Column(Text, nullable=True)
    upload_date_str = Column(String(100), nullable=True)

    # Relationships
    workspace = relationship("Workspace", back_populates="documents")
    team = relationship("Team", back_populates="documents")
    user = relationship("User", back_populates="documents")
    summary = relationship("ContractSummary", back_populates="document", uselist=False, cascade="all, delete-orphan")
    risk_report = relationship("RiskReport", back_populates="document", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_documents_workspace_deleted", "workspace_id", "is_deleted"),
    )

class ContractSummary(Base):
    __tablename__ = "contract_summaries"

    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    executive_summary = Column(Text, nullable=True)
    parties = Column(JSON, nullable=True)  # List of parties
    effective_date = Column(String(100), nullable=True)
    expiry_date = Column(String(100), nullable=True)
    financial_terms = Column(Text, nullable=True)
    key_obligations = Column(JSON, nullable=True)  # List of obligations
    governing_law = Column(String(255), nullable=True)

    # Relationship
    document = relationship("Document", back_populates="summary")

class RiskReport(Base):
    __tablename__ = "risk_reports"

    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    overall_risk_score = Column(Integer, default=0, nullable=False)
    risk_level = Column(String(50), default="Low", nullable=False)  # High | Medium | Low
    flagged_clauses = Column(JSON, nullable=True)  # List of risk items

    # Relationship
    document = relationship("Document", back_populates="risk_report")

class Chat(Base):
    __tablename__ = "chats"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Conversation", nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="chats")
    user = relationship("User", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at")

    __table_args__ = (
        Index("ix_chats_workspace_user", "workspace_id", "user_id"),
    )

class Message(Base):
    __tablename__ = "messages"

    chat_id = Column(String(36), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # 'user' | 'ai'
    text = Column(Text, nullable=False)
    timestamp_str = Column(String(50), nullable=True)
    confidence_level = Column(String(20), nullable=True)  # 'High' | 'Medium' | 'Low'
    summary = Column(Text, nullable=True)
    beginner_version = Column(Text, nullable=True)
    reasoning = Column(Text, nullable=True)
    citations = Column(JSON, nullable=True)  # List of citation dicts
    related_clauses = Column(JSON, nullable=True)  # List of string clauses
    follow_up_questions = Column(JSON, nullable=True)  # List of strings

    # Relationship
    chat = relationship("Chat", back_populates="messages")

    __table_args__ = (
        Index("ix_messages_chat_created", "chat_id", "created_at"),
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    action_type = Column(String(50), nullable=False)  # UPLOAD | DELETE | EXPORT | GENERATE | BILLING | AUTH
    target_resource = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1", nullable=False)

    # Relationship
    workspace = relationship("Workspace", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_logs_workspace_created", "workspace_id", "created_at"),
    )

class Subscription(Base):
    __tablename__ = "subscriptions"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    plan_id = Column(String(50), default="free", nullable=False)
    plan_name = Column(String(100), default="Free Plan", nullable=False)
    pdf_limit = Column(Integer, default=5, nullable=False)
    current_pdf_count = Column(Integer, default=3, nullable=False)
    status = Column(String(50), default="active", nullable=False)
    billing_cycle = Column(String(50), default="monthly", nullable=False)
    price_per_month = Column(Float, default=0.0, nullable=False)
    renews_at = Column(String(50), default="2026-08-27", nullable=True)
    stripe_customer_id = Column(String(100), default="cus_lexi99201", nullable=True)

    # Relationships
    workspace = relationship("Workspace", back_populates="subscription")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"

    subscription_id = Column(String(36), ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_number = Column(String(100), nullable=False)
    date_str = Column(String(50), nullable=False)
    amount_str = Column(String(50), nullable=False)
    status = Column(String(50), default="Paid", nullable=False)
    plan_name = Column(String(100), nullable=False)
    pdf_url = Column(String(255), default="#", nullable=False)

    # Relationship
    subscription = relationship("Subscription", back_populates="invoices")
