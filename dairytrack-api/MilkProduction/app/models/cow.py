from app import db

class Cow(db.Model):
    __tablename__ = 'cows'

    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmers.id'), nullable=False)
    name = db.Column(db.String(50))
    breed = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    lactation_status = db.Column(db.Boolean, default=False)
    lactation_phase = db.Column(db.String(20), default=None)
    weight_kg = db.Column(db.Numeric(5, 2))
    reproductive_status = db.Column(db.String(20))
    gender = db.Column(db.String(10))
    entry_date = db.Column(db.Date)
    notifications = db.relationship('Notification', back_populates='cow')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Relationship with RawMilk
    raw_milks = db.relationship('RawMilk', back_populates='cow', cascade='all, delete-orphan')

    def to_dict(self, include_raw_milks=True):
        return {
            'id': self.id,
            'farmer_id': self.farmer_id,
            'name': self.name,
            'breed': self.breed,
            'birth_date': self.birth_date.strftime('%Y-%m-%d'),
            'lactation_status': self.lactation_status,
            'lactation_phase': self.lactation_phase,
            'weight_kg': str(self.weight_kg),
            'reproductive_status': self.reproductive_status,
            'gender': self.gender,
            'entry_date': self.entry_date.strftime('%Y-%m-%d'),
            'notifications': [notification.to_dict() for notification in self.notifications],
            'raw_milks': [raw_milk.to_dict(include_cow=False) for raw_milk in self.raw_milks] if include_raw_milks else []
        }

    def __repr__(self):
        return f"Cow('{self.name}', '{self.breed}')"