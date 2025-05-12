from sqlalchemy import Column, Integer, ForeignKey
from app.database.database import db

class BlogCategory(db.Model):
    __tablename__ = 'blog_categories'

    blog_id = Column(Integer, ForeignKey('blogs.id', ondelete='CASCADE'), primary_key=True)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True)