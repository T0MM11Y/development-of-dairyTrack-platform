from sqlalchemy import Column, Integer, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database.database import db

class DailyMilkSummary(db.Model):
    __tablename__ = 'daily_milk_summary'

    id = Column(Integer, primary_key=True, autoincrement=True)
    cow_id = Column(Integer, ForeignKey('cows.id'), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    morning_volume = Column(Float, default=0, nullable=False)
    afternoon_volume = Column(Float, default=0, nullable=False)
    evening_volume = Column(Float, default=0, nullable=False)
    total_volume = Column(Float, default=0, nullable=False)

    # Relationships
    cow = relationship('Cow', back_populates='daily_summaries')

    def __repr__(self):
        return (f"<DailyMilkSummary(id={self.id}, cow_id={self.cow_id}, "
                f"date={self.date}, total_volume={self.total_volume}, "
                f"morning_volume={self.morning_volume}, afternoon_volume={self.afternoon_volume}, "
                f"evening_volume={self.evening_volume})>")