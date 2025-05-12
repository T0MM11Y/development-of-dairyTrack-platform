from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import db

class Blog(db.Model):
    __tablename__ = 'blogs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    photo_url = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship with categories through blog_category association table
    categories = relationship("Category", secondary="blog_categories", back_populates="blogs")

    def __repr__(self):
        return f"<Blog(title='{self.title}', photo_url='{self.photo_url}', content='{self.content}') , created_at='{self.created_at}', updated_at='{self.updated_at}')>"