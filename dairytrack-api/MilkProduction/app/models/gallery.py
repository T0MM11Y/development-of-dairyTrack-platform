# FILE: gallery.py
from app import db

class Gallery(db.Model):
    __tablename__ = 'galleries'

    id = db.Column(db.Integer, primary_key=True)
    photo = db.Column(db.String(255), nullable=False)  # URL atau path file ke foto
    tittle = db.Column(db.String(255), nullable=False)  # Judul foto
    created_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now(), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'photo': self.photo,
            'tittle': self.tittle,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    def __repr__(self):
        return f"Gallery('{self.photo}', '{self.tittle}', '{self.created_at}', '{self.updated_at}')"