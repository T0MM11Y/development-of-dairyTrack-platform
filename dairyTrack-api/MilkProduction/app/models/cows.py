from sqlalchemy import Column, Integer, String, Date, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import db
from app.models.user_cow_association import user_cow_association

class Cow(db.Model):
    __tablename__ = 'cows'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    birth = Column(Date, nullable=False)
    breed = Column(String(50), nullable=False)
    lactation_phase = Column(String(50), nullable=True)
    weight = Column(Float, nullable=True)
    gender = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship with User through association table
    managers = relationship(
        'User', 
        secondary=user_cow_association, 
        back_populates='managed_cows',
        lazy='dynamic'
    )
    
    # New relationships
    milking_sessions = relationship('MilkingSession', back_populates='cow')
    daily_summaries = relationship('DailyMilkSummary', back_populates='cow')
    notifications = relationship('Notification', back_populates='cow', foreign_keys='Notification.cow_id', 
                            cascade="all, delete-orphan", lazy='dynamic')

    def __repr__(self):
        return (f"<Cow(name='{self.name}', birth={self.birth}, breed='{self.breed}', "
                f"lactation_phase='{self.lactation_phase}', weight={self.weight}, "
                f"gender='{self.gender}', created_at={self.created_at}, updated_at={self.updated_at})>")