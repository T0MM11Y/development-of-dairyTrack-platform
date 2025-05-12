from sqlalchemy import Column, Integer, String, Date, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import db
from app.models.user_cow_association import user_cow_association

class Cow(db.Model):
    __tablename__ = 'cows'

    id = Column(Integer, primary_key=True, autoincrement=True)  # Fixed: removed db.Column
    name = Column(String(50), nullable=False)  # Fixed: removed db.Column
    birth = Column(Date, nullable=False)  # Fixed: removed db.Column
    breed = Column(String(50), nullable=False)  # Fixed: removed db.Column
    lactation_phase = Column(String(50), nullable=True)  # Fixed: removed db.Column
    weight = Column(Float, nullable=True)  # Fixed: removed db.Column
    gender = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship with User through association table
    managers = relationship(
        'User', 
        secondary=user_cow_association, 
        back_populates='managed_cows',
        lazy='dynamic'  # Changed to dynamic for better query control
    )

    def __repr__(self):
        return (f"<Cow(name='{self.name}', birth={self.birth}, breed='{self.breed}', "
                f"lactation_phase='{self.lactation_phase}', weight={self.weight}, "
                f"gender='{self.gender}', created_at={self.created_at}, updated_at={self.updated_at})>")