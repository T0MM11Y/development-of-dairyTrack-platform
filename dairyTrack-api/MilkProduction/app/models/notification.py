from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.database import db
from datetime import datetime
import pytz

def wib_now():
    # 🔥 Ini PENTING: menghasilkan waktu dengan zona waktu WIB (Asia/Jakarta)
    return datetime.now(pytz.timezone("Asia/Jakarta"))
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    cow_id = Column(Integer, ForeignKey('cows.id'), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)  # contoh: 'low_production', 'high_production'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=wib_now)  # ✅ timezone-aware

    # Relationships
    user = relationship('User', back_populates='notifications')
    cow = relationship('Cow', back_populates='notifications')

    def __repr__(self):
        return (f"<Notification(id={self.id}, user_id={self.user_id}, "
                f"cow_id={self.cow_id}, type='{self.type}', "
                f"is_read={self.is_read}, created_at={self.created_at})>")
