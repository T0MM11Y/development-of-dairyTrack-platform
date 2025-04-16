from datetime import datetime
from app import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    cow_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cow_id': self.cow_id,
            'date': self.date.strftime('%Y-%m-%d'),
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

    def __repr__(self):
        return f"Notification('{self.cow_id}', '{self.date}', '{self.message}')"
