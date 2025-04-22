from datetime import datetime, date
from app import db

# Model Notification
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    cow_id = db.Column(db.Integer, db.ForeignKey('cows.id'), nullable=False)  # Foreign key ke tabel cows
    date = db.Column(db.Date, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship dengan Cow
    cow = db.relationship('Cow', back_populates='notifications')

    def to_dict(self, include_cow=True):
        return {
            'id': self.id,
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'cow': self.cow.to_dict(include_notifications=False) if include_cow and self.cow else None
        }

    def __repr__(self):
        return f"Notification('{self.cow_id}', '{self.date}', '{self.message}')"

# Model TodayNotification
