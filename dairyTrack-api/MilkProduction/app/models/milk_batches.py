from sqlalchemy import Column, Integer, String, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.database import db

class MilkStatus(enum.Enum):
    FRESH = "FRESH"  # Changed to match database values
    EXPIRED = "EXPIRED"  # Changed to match database values
    USED = "USED"  # Changed to match database values

class MilkBatch(db.Model):
    __tablename__ = 'milk_batches'

    id = Column(Integer, primary_key=True, autoincrement=True)
    batch_number = Column(String(50), unique=True, nullable=False)
    total_volume = Column(Float, default=0, nullable=False)
    status = Column(Enum(MilkStatus), default=MilkStatus.FRESH, nullable=False)
    production_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    milking_sessions = relationship('MilkingSession', back_populates='milk_batch')

    def __repr__(self):
        return (f"<MilkBatch(id={self.id}, batch_number='{self.batch_number}', "
                f"total_volume={self.total_volume}, status={self.status}, "
                f"production_date={self.production_date}, expiry_date={self.expiry_date})>")
    
    