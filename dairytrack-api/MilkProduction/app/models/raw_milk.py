from app import db
from datetime import datetime

class RawMilk(db.Model):
    __tablename__ = 'raw_milks'
    id = db.Column(db.Integer, primary_key=True)
    cow_id = db.Column(db.Integer, db.ForeignKey('cows.id'), nullable=False)
    production_time = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    expiration_time = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp() + db.text('INTERVAL 8 HOUR'))
    volume_liters = db.Column(db.Numeric(5, 2), nullable=False)
    previous_volume = db.Column(db.Numeric(5, 2), nullable=True)
    status = db.Column(db.String(20), nullable=False)
    session = db.Column(db.Integer, nullable=False)  # Kolom baru untuk sesi pemerahan
    daily_total_id = db.Column(db.Integer, db.ForeignKey('daily_milk_totals.id'), nullable=True)
    available_stocks = db.Column(db.Numeric(5, 2), nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationship with Cow
    cow = db.relationship('Cow', back_populates='raw_milks')

    # Relationship with DailyMilkTotal
    daily_total = db.relationship('DailyMilkTotal', back_populates='raw_milks')

    def to_dict(self):
        # Calculate timeLeft
        now = datetime.now()
        if self.expiration_time:
            time_left = self.expiration_time - now
            time_left_str = str(time_left) if time_left.total_seconds() > 0 else "Expired"
        else:
            time_left_str = "Unknown"

        return {
            'id': self.id,
            'cow_id': self.cow_id,
            'cow': self.cow.to_dict() if self.cow else None,  # Include cow details
            'production_time': self.production_time,
            'expiration_time': self.expiration_time,
            'volume_liters': self.volume_liters,
            'previous_volume': self.previous_volume,
            'status': self.status,
            'session': self.session,  # Tambahkan sesi ke output
            'daily_total_id': self.daily_total_id,
            'timeLeft': time_left_str,
            'available_stocks': self.volume_liters,
            'created_at': self.created_at,
        }

    def __repr__(self):
        return f"RawMilk('{self.cow_id}', '{self.production_time}', 'Session {self.session}')"