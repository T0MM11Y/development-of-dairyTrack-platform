# FILE: farmer.py
from app import db
from bcrypt import hashpw, gensalt, checkpw

class Farmer(db.Model):
    __tablename__ = 'farmers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    contact = db.Column(db.String(15))
    religion = db.Column(db.String(50))
    address = db.Column(db.Text)
    gender = db.Column(db.String(10))
    total_cattle = db.Column(db.Integer, default=0)
    join_date = db.Column(db.Date)
    status = db.Column(db.String(20))
    role = db.Column(db.String(20), default='farmer')
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'birth_date': self.birth_date.strftime('%Y-%m-%d') if self.birth_date else None,
            'contact': self.contact,
            'religion': self.religion,
            'address': self.address,
            'gender': self.gender,
            'total_cattle': self.total_cattle,
            'join_date': self.join_date.strftime('%Y-%m-%d') if self.join_date else None,
            'status': self.status,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }

    def set_password(self, password):
        self.password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def check_password(self, password):
        return checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def __repr__(self):
        return f"Farmer('{self.first_name} {self.last_name}', '{self.birth_date}')"