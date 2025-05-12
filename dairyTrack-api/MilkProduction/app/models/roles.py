from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.database import db

class Role(db.Model):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    # Relationship with User
    users = relationship('User', back_populates='role', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Role(name='{self.name}', description='{self.description}')>"