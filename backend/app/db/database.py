import datetime
import uuid
from typing import Generator
from sqlalchemy import create_engine, Column, DateTime, Boolean, String, inspect
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# Create SQLAlchemy engine
# SQLite fallback if PostgreSQL server is not active during local testing
DATABASE_URL = settings.DATABASE_URL
if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class CustomBase:
    """Base model providing UUID primary key, timestamps, and soft deletion."""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def soft_delete(self, session: Session):
        self.is_deleted = True
        self.deleted_at = datetime.datetime.utcnow()
        session.add(self)

    def to_dict(self):
        """Helper to convert model attributes into a serializable dictionary."""
        res = {}
        for c in inspect(self).mapper.column_attrs:
            val = getattr(self, c.key)
            if isinstance(val, (datetime.datetime, datetime.date)):
                val = val.isoformat()
            res[c.key] = val
        return res

Base = declarative_base(cls=CustomBase)

def get_db() -> Generator[Session, None, None]:
    """Dependency for providing a database session to FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
