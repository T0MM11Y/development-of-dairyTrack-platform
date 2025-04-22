# FILE: supervisor.py
from app import db
from bcrypt import hashpw, gensalt, checkpw

class Supervisor(db.Model):
    __tablename__ = 'supervisors'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    contact = db.Column(db.String(15))
    role = db.Column(db.String(20), default='supervisor')
    gender = db.Column(db.String(20))
    password = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'contact': self.contact,
            'gender': self.gender,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

    def set_password(self, password):
        self.password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def check_password(self, password):
        return checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def __repr__(self):
        return f"Supervisor('{self.first_name} {self.last_name}', '{self.contact}')"