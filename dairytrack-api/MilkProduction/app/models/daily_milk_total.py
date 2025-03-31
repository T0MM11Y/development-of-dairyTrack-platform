from app import db
from datetime import datetime
from sqlalchemy import event
from app.models.raw_milk import RawMilk
from sqlalchemy import insert
from sqlalchemy import update



class DailyMilkTotal(db.Model):
    __tablename__ = 'daily_milk_totals'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, unique=True)  # Tanggal pemerahan
    total_volume = db.Column(db.Numeric(10, 2), nullable=False, default=0)  # Total volume susu per hari
    total_sessions = db.Column(db.Integer, nullable=False, default=0)  # Total sesi pemerahan per hari
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationship with RawMilk
    raw_milks = db.relationship('RawMilk', back_populates='daily_total', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'total_volume': self.total_volume,
            'total_sessions': self.total_sessions,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }

    def __repr__(self):
        return f"DailyMilkTotal('{self.date}', '{self.total_volume}', '{self.total_sessions}')"


@event.listens_for(RawMilk, 'after_delete')
def update_daily_milk_total_after_delete(mapper, connection, target):
    # Pastikan production_time adalah objek datetime
    if isinstance(target.production_time, str):
        try:
            production_time = datetime.strptime(target.production_time, "%Y-%m-%dT%H:%M")
        except ValueError:
            raise ValueError(f"Invalid datetime format: {target.production_time}")
    else:
        production_time = target.production_time

    # Ambil tanggal dari waktu produksi
    production_date = production_time.date()

    # Query untuk mencari entri di tabel daily_milk_totals berdasarkan tanggal
    daily_total = connection.execute(
        db.select(DailyMilkTotal).where(DailyMilkTotal.date == production_date)
    ).fetchone()

    if daily_total:
        # Jika entri ditemukan, kurangi total volume dan jumlah sesi
        new_total_volume = daily_total.total_volume - target.volume_liters
        new_total_sessions = daily_total.total_sessions - 1

        # Jika total_sessions menjadi 0, hapus entri dari DailyMilkTotal
        if new_total_sessions <= 0:
            connection.execute(
                db.delete(DailyMilkTotal).where(DailyMilkTotal.date == production_date)
            )
        else:
            # Perbarui entri di DailyMilkTotal
            connection.execute(
                db.update(DailyMilkTotal)
                .where(DailyMilkTotal.date == production_date)
                .values(
                    total_volume=new_total_volume,
                    total_sessions=new_total_sessions
                )
            )