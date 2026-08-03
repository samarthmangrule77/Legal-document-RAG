"""Initial PostgreSQL relational database schema

Revision ID: 001_initial_postgres_schema
Revises: 
Create Date: 2026-08-01 22:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_postgres_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Workspaces
    op.create_table(
        'workspaces',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False, unique=True),
        sa.Column('plan', sa.String(length=50), nullable=False, server_default='Business Pro'),
        sa.Column('storage_used_mb', sa.Float(), nullable=False, server_default='50.0'),
        sa.Column('max_storage_mb', sa.Float(), nullable=False, server_default='10000.0'),
        sa.Column('brand_logo_url', sa.String(length=500), nullable=True),
        sa.Column('ai_llm_model', sa.String(length=100), nullable=False, server_default='GPT-4o (OpenAI)'),
        sa.Column('embedding_model', sa.String(length=100), nullable=False, server_default='all-MiniLM-L6-v2 (384-dim)'),
        sa.Column('storage_provider', sa.String(length=100), nullable=False, server_default='Local Vector Vault (Encrypted)'),
        sa.Column('primary_language', sa.String(length=50), nullable=False, server_default='English 🇺🇸'),
        sa.Column('openai_api_key', sa.String(length=255), nullable=True),
        sa.Column('anthropic_api_key', sa.String(length=255), nullable=True),
        sa.Column('company_policy_rules', sa.Text(), nullable=True),
        sa.Column('preferred_language', sa.String(length=50), nullable=False, server_default='English 🇺🇸'),
        sa.Column('explanation_style', sa.String(length=100), nullable=False, server_default='Executive TL;DR'),
        sa.Column('tone', sa.String(length=50), nullable=False, server_default='Professional & Direct'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_workspaces_slug', 'workspaces', ['slug'])
    op.create_index('ix_workspaces_is_deleted', 'workspaces', ['is_deleted'])

    # Teams
    op.create_table(
        'teams',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('workspace_id', sa.String(length=36), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(length=50), nullable=False, server_default='brand'),
        sa.Column('document_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_teams_workspace_id', 'teams', ['workspace_id'])

    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('workspace_id', sa.String(length=36), sa.ForeignKey('workspaces.id', ondelete='SET NULL'), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='member'),
        sa.Column('job_title', sa.String(length=255), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('auth_provider', sa.String(length=50), nullable=False, server_default='local'),
        sa.Column('active_org_id', sa.String(length=36), nullable=True),
        sa.Column('active_team_id', sa.String(length=36), nullable=True, server_default='all'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_workspace_id', 'users', ['workspace_id'])

    # Documents
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('workspace_id', sa.String(length=36), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('team_id', sa.String(length=36), sa.ForeignKey('teams.id', ondelete='SET NULL'), nullable=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('file_path', sa.Text(), nullable=True),
        sa.Column('chunk_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='indexed'),
        sa.Column('risk_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_scanned_ocr', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('upload_date_str', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_documents_workspace_deleted', 'documents', ['workspace_id', 'is_deleted'])

    # Contract Summaries
    op.create_table(
        'contract_summaries',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('document_id', sa.String(length=36), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('executive_summary', sa.Text(), nullable=True),
        sa.Column('parties', sa.JSON(), nullable=True),
        sa.Column('effective_date', sa.String(length=100), nullable=True),
        sa.Column('expiry_date', sa.String(length=100), nullable=True),
        sa.Column('financial_terms', sa.Text(), nullable=True),
        sa.Column('key_obligations', sa.JSON(), nullable=True),
        sa.Column('governing_law', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Risk Reports
    op.create_table(
        'risk_reports',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('document_id', sa.String(length=36), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('overall_risk_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('risk_level', sa.String(length=50), nullable=False, server_default='Low'),
        sa.Column('flagged_clauses', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Chats
    op.create_table(
        'chats',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('workspace_id', sa.String(length=36), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False, server_default='New Conversation'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_chats_workspace_user', 'chats', ['workspace_id', 'user_id'])

    # Messages
    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('chat_id', sa.String(length=36), sa.ForeignKey('chats.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender', sa.String(length=20), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('timestamp_str', sa.String(length=50), nullable=True),
        sa.Column('confidence_level', sa.String(length=20), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('beginner_version', sa.Text(), nullable=True),
        sa.Column('reasoning', sa.Text(), nullable=True),
        sa.Column('citations', sa.JSON(), nullable=True),
        sa.Column('related_clauses', sa.JSON(), nullable=True),
        sa.Column('follow_up_questions', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_messages_chat_created', 'messages', ['chat_id', 'created_at'])

    # Subscriptions
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('workspace_id', sa.String(length=36), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('plan_id', sa.String(length=50), nullable=False, server_default='free'),
        sa.Column('plan_name', sa.String(length=100), nullable=False, server_default='Free Plan'),
        sa.Column('pdf_limit', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('current_pdf_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('billing_cycle', sa.String(length=50), nullable=False, server_default='monthly'),
        sa.Column('price_per_month', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('renews_at', sa.String(length=50), nullable=True),
        sa.Column('stripe_customer_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Invoices
    op.create_table(
        'invoices',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('subscription_id', sa.String(length=36), sa.ForeignKey('subscriptions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('invoice_number', sa.String(length=100), nullable=False),
        sa.Column('date_str', sa.String(length=50), nullable=False),
        sa.Column('amount_str', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Paid'),
        sa.Column('plan_name', sa.String(length=100), nullable=False),
        sa.Column('pdf_url', sa.String(length=255), nullable=False, server_default='#'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('workspace_id', sa.String(length=36), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('user_name', sa.String(length=255), nullable=False),
        sa.Column('user_email', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('action_type', sa.String(length=50), nullable=False),
        sa.Column('target_resource', sa.String(length=255), nullable=False),
        sa.Column('details', sa.Text(), nullable=False),
        sa.Column('ip_address', sa.String(length=50), nullable=False, server_default='127.0.0.1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_audit_logs_workspace_created', 'audit_logs', ['workspace_id', 'created_at'])

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('invoices')
    op.drop_table('subscriptions')
    op.drop_table('messages')
    op.drop_table('chats')
    op.drop_table('risk_reports')
    op.drop_table('contract_summaries')
    op.drop_table('documents')
    op.drop_table('users')
    op.drop_table('teams')
    op.drop_table('workspaces')
