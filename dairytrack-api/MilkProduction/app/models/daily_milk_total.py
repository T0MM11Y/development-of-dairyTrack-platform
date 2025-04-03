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
    cow_id = db.Column(db.Integer, db.ForeignKey('cows.id'), nullable=False)
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

@event.listens_for(RawMilk, 'after_insert')
@event.listens_for(RawMilk, 'after_update')
def update_daily_milk_total_after_insert_or_update(mapper, connection, target):
    # Pastikan production_time adalah objek datetime
    if isinstance(target.production_time, str):
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
            try:
                production_time = datetime.strptime(target.production_time, fmt)
                break
            except ValueError:
                continue
        else:
            raise ValueError(f"Invalid datetime format: {target.production_time}")
    else:
        production_time = target.production_time

    # Ambil tanggal dari waktu produksi
    production_date = production_time.date()

    # Periksa apakah entri di daily_milk_totals sudah ada untuk kombinasi tanggal dan cow_id
    daily_total = connection.execute(
        db.select(DailyMilkTotal).where(
            DailyMilkTotal.date == production_date,
            DailyMilkTotal.cow_id == target.cow_id
        )
    ).fetchone()

    if not daily_total:
        # Jika entri belum ada, tambahkan entri baru di daily_milk_totals
        connection.execute(
            db.insert(DailyMilkTotal).values(
                date=production_date,
                cow_id=target.cow_id,
                total_volume=target.volume_liters,
                total_sessions=1
            )
        )

        # Ambil ID dari entri yang baru saja dimasukkan
        daily_total_id = connection.execute(
            db.select(DailyMilkTotal.id).where(
                DailyMilkTotal.date == production_date,
                DailyMilkTotal.cow_id == target.cow_id
            )
        ).scalar()
    else:
        # Jika entri sudah ada, hitung ulang total_volume dan total_sessions
        result = connection.execute(
            db.select(
                db.func.sum(RawMilk.volume_liters).label('total_volume'),
                db.func.count(RawMilk.id).label('total_sessions')
            ).where(
                db.func.date(RawMilk.production_time) == production_date,
                RawMilk.cow_id == target.cow_id
            )
        ).fetchone()

        total_volume = result.total_volume or 0
        total_sessions = result.total_sessions or 0

        # Perbarui entri di daily_milk_totals
        connection.execute(
            db.update(DailyMilkTotal)
            .where(
                DailyMilkTotal.date == production_date,
                DailyMilkTotal.cow_id == target.cow_id
            )
            .values(
                total_volume=total_volume,
                total_sessions=total_sessions
            )
        )

        # Ambil ID dari daily_milk_totals
        daily_total_id = daily_total.id

    # Perbarui kolom daily_total_id di raw_milks
    connection.execute(
        db.update(RawMilk)
        .where(RawMilk.id == target.id)
        .values(daily_total_id=daily_total_id)
    )

    @event.listens_for(RawMilk, 'after_delete')
    def update_daily_milk_total_after_delete(mapper, connection, target):
        # Pastikan production_time adalah objek datetime
        if isinstance(target.production_time, str):
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
                try:
                    production_time = datetime.strptime(target.production_time, fmt)
                    break
                except ValueError:
                    continue
            else:
                raise ValueError(f"Invalid datetime format: {target.production_time}")
        else:
            production_time = target.production_time
    
        # Ambil tanggal dari waktu produksi
        production_date = production_time.date()
    
        # Periksa apakah entri di daily_milk_totals sudah ada untuk kombinasi tanggal dan cow_id
        daily_total = connection.execute(
            db.select(DailyMilkTotal).where(
                DailyMilkTotal.date == production_date,
                DailyMilkTotal.cow_id == target.cow_id
            )
        ).fetchone()
    
        if daily_total:
            # Hitung ulang total_volume dan total_sessions
            result = connection.execute(
                db.select(
                    db.func.sum(RawMilk.volume_liters).label('total_volume'),
                    db.func.count(RawMilk.id).label('total_sessions')
                ).where(
                    db.func.date(RawMilk.production_time) == production_date,
                    RawMilk.cow_id == target.cow_id
                )
            ).fetchone()
    
            total_volume = result.total_volume or 0
            total_sessions = result.total_sessions or 0
    
            if total_sessions == 0:
                # Jika tidak ada sesi tersisa, hapus entri dari daily_milk_totals
                connection.execute(
                    db.delete(DailyMilkTotal).where(
                        DailyMilkTotal.date == production_date,
                        DailyMilkTotal.cow_id == target.cow_id
                    )
                )
            else:
                # Perbarui entri di daily_milk_totals
                connection.execute(
                    db.update(DailyMilkTotal)
                    .where(
                        DailyMilkTotal.date == production_date,
                        DailyMilkTotal.cow_id == target.cow_id
                    )
                    .values(
                        total_volume=total_volume,
                        total_sessions=total_sessions
                    )
                )