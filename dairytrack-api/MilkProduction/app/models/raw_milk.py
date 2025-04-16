from app import db
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

class RawMilk(db.Model):
    __tablename__ = 'raw_milks'
    id = db.Column(db.Integer, primary_key=True)
    cow_id = db.Column(db.Integer, db.ForeignKey('cows.id'), nullable=False)
    production_time = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    expiration_time = db.Column(db.DateTime, nullable=False)
    volume_liters = db.Column(db.Numeric(5, 2), nullable=False)
    previous_volume = db.Column(db.Numeric(5, 2), nullable=True)
    status = db.Column(db.String(20), nullable=False)
    session = db.Column(db.Integer, nullable=False)
    daily_total_id = db.Column(db.Integer, db.ForeignKey('daily_milk_totals.id'), nullable=True)
    available_stocks = db.Column(db.Numeric(5, 2), nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    is_expired = db.Column(db.Boolean, default=False)

    # Relationship with Cow
    cow = db.relationship('Cow', back_populates='raw_milks')

    # Relationship with DailyMilkTotal
    daily_total = db.relationship('DailyMilkTotal', back_populates='raw_milks')

    def to_dict(self):
        # Calculate time left until expiration
        current_time = datetime.utcnow()
        if self.expiration_time and self.expiration_time > current_time:
            time_left = self.expiration_time - current_time
            time_left_str = str(time_left).split('.')[0]  # Format without microseconds
        else:
            time_left_str = "Expired"

        return {
            'id': self.id,
            'cow_id': self.cow_id,
            'cow': self.cow.to_dict(include_raw_milks=False) if include_cow and self.cow else None,
            'production_time': self.production_time,
            'expiration_time': self.expiration_time,
            'volume_liters': self.volume_liters,
            'previous_volume': self.previous_volume,
            'status': self.status,
            'session': self.session,
            'daily_total_id': self.daily_total_id,
            'timeLeft': time_left_str,
            'available_stocks': self.volume_liters,
            'is_expired': self.is_expired,
            'created_at': self.created_at,
        }

    def __repr__(self):
        return f"RawMilk('{self.cow_id}', '{self.production_time}', 'Session {self.session}')"





@db.event.listens_for(RawMilk, 'before_insert')
def set_session_for_today(mapper, connection, target):
    # Pastikan production_time adalah objek datetime
    if isinstance(target.production_time, str):
        # Coba beberapa format datetime yang mungkin
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
            try:
                # Ubah string menjadi objek datetime
                target.production_time = datetime.strptime(target.production_time, fmt)
                break
            except ValueError:
                continue
        else:
            # Jika tidak ada format yang cocok, lemparkan error
            raise ValueError(f"Invalid datetime format: {target.production_time}")

    # Ambil tanggal produksi (hanya tanggal, tanpa waktu)
    production_date = target.production_time.date()

    # Hitung jumlah sesi yang sudah ada untuk cow_id pada hari itu
    session = Session(connection)
    session_count = session.query(func.count(RawMilk.id)).filter(
        func.date(RawMilk.production_time) == production_date,
        RawMilk.cow_id == target.cow_id
    ).scalar()

    # Set session berdasarkan jumlah sesi yang sudah ada + 1
    target.session = session_count + 1