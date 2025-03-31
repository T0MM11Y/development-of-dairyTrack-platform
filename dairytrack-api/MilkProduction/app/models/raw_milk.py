from app import db

class RawMilk(db.Model):
    __tablename__ = 'raw_milks'
    id = db.Column(db.Integer, primary_key=True)
    cow_id = db.Column(db.Integer, db.ForeignKey('cows.id'), nullable=False)
    production_time = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    expiration_time = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp() + db.text('INTERVAL 8 HOUR'))
    volume_liters = db.Column(db.Numeric(5, 2), nullable=False)
    previous_volume = db.Column(db.Numeric(5, 2), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='fresh')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationship with Cow
    cow = db.relationship('Cow', back_populates='raw_milks')

    def to_dict(self):
        return {
            'id': self.id,
            'cow_id': self.cow_id,
            'cow': self.cow.to_dict() if self.cow else None,  # Include cow details
            'production_time': self.production_time,
            'expiration_time': self.expiration_time,
            'volume_liters': self.volume_liters,
            'previous_volume': self.previous_volume,
            'status': self.status,
            'created_at': self.created_at,
        }

    def __repr__(self):
        return f"RawMilk('{self.cow_id}', '{self.production_time}')"