"""Add S3 Cloud Storage and AES-256 Encryption columns to Documents table

Revision ID: 002_s3_cloud_storage
Revises: 001_initial_postgres_schema
Create Date: 2026-08-01 23:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_s3_cloud_storage'
down_revision: Union[str, None] = '001_initial_postgres_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('documents', sa.Column('s3_bucket', sa.String(length=255), nullable=True, server_default='lexirag-documents'))
    op.add_column('documents', sa.Column('s3_key', sa.String(length=500), nullable=True))
    op.add_column('documents', sa.Column('s3_version_id', sa.String(length=255), nullable=True))
    op.add_column('documents', sa.Column('encryption_type', sa.String(length=50), nullable=False, server_default='AES-256'))
    op.add_column('documents', sa.Column('sha256_hash', sa.String(length=64), nullable=True))
    op.add_column('documents', sa.Column('mime_type', sa.String(length=100), nullable=True, server_default='application/pdf'))
    op.add_column('documents', sa.Column('is_recovered', sa.Boolean(), nullable=False, server_default='false'))

def downgrade() -> None:
    op.drop_column('documents', 'is_recovered')
    op.drop_column('documents', 'mime_type')
    op.drop_column('documents', 'sha256_hash')
    op.drop_column('documents', 'encryption_type')
    op.drop_column('documents', 's3_version_id')
    op.drop_column('documents', 's3_key')
    op.drop_column('documents', 's3_bucket')
