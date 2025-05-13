from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import db

class MilkingSession(db.Model):
    __tablename__ = 'milking_sessions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    cow_id = Column(Integer, ForeignKey('cows.id'), nullable=False)
    milker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    milk_batch_id = Column(Integer, ForeignKey('milk_batches.id'), nullable=True)
    volume = Column(Float, nullable=False)
    milking_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    cow = relationship('Cow', back_populates='milking_sessions')
    milker = relationship('User', back_populates='milking_sessions')
    milk_batch = relationship('MilkBatch', back_populates='milking_sessions')

    def __repr__(self):
        return (f"<MilkingSession(id={self.id}, cow_id={self.cow_id}, "
                f"milker_id={self.milker_id}, milk_batch_id={self.milk_batch_id}, "
                f"volume={self.volume}, milking_time={self.milking_time})>")