from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Date
from sqlalchemy.orm import relationship
from app.models.roles import Role
from app.models.user_cow_association import user_cow_association
from app.database.database import db

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    contact = Column(String(15), nullable=True)
    religion = Column(String(50), nullable=True)
    birth = Column(Date, nullable=True)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    token = Column(String(255), nullable=True)
    token_created_at = Column(DateTime, nullable=True)

    # Relationship with Role
    role = relationship('Role', back_populates='users')
    
    # Relationship with Cow through association table
    managed_cows = relationship(
        'Cow', 
        secondary=user_cow_association, 
        back_populates='managers',
        lazy='dynamic'
    )
    
    # Relationship with milking sessions
    milking_sessions = relationship('MilkingSession', back_populates='milker')
    
    # Relationship with notifications
    notifications = relationship('Notification', back_populates='user')

    def __repr__(self):
        return (f"<User(name='{self.name}', username='{self.username}', email='{self.email}', "
                f"contact='{self.contact}', religion='{self.religion}', birth='{self.birth}', "
                f"role='{self.role.name}', token='{self.token}', "
                f"token_created_at='{self.token_created_at}')>")