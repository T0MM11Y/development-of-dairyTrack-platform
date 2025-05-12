from sqlalchemy import Column, Integer, ForeignKey, Table
from app.database.database import db

# Association table for many-to-many relationship between User and Cow
user_cow_association = Table(
    'user_cow_association',
    db.Model.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('cow_id', Integer, ForeignKey('cows.id', ondelete='CASCADE'), primary_key=True)
)