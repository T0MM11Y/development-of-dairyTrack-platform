from app.models.notification import Notification
from app.models.daily_milk_summary import DailyMilkSummary
from app.database.database import db
from datetime import date, datetime
from app.models.cows import Cow
from app.socket import emit_notification

def check_milk_production_and_notify():
    """
    Checks if milk production is within the standard range (15-25 liters/day)
    and notifies farmers accordingly
    """
    today = date.today()
    
    # Get today's milk summaries
    daily_summaries = DailyMilkSummary.query.filter_by(date=today).all()
    
    for summary in daily_summaries:
        if summary.total_volume < 15:
            message = f"Produksi susu rendah! Sapi #{summary.cow.id} ({summary.cow.name}) " \
                      f"hanya memproduksi {summary.total_volume} liter hari ini (di bawah standar 15L)"
            notification_type = "low_production"
            create_notifications_for_cow(summary.cow_id, message, notification_type)
            
        elif summary.total_volume > 25:
            message = f"Produksi susu tinggi! Sapi #{summary.cow.id} ({summary.cow.name}) " \
                      f"memproduksi {summary.total_volume} liter hari ini (di atas standar 25L)"
            notification_type = "high_production"
            create_notifications_for_cow(summary.cow_id, message, notification_type)

def create_notifications_for_cow(cow_id, message, notification_type):
    """Creates notifications for all farmers managing the specified cow"""
    
    # Get the cow
    cow = Cow.query.get(cow_id)
    
    if not cow:
        return
    
    # Get all managers (farmers) for this cow
    managers = cow.managers.all()
    
    for manager in managers:
        notification = Notification(
            user_id=manager.id,
            cow_id=cow_id,
            message=message,
            type=notification_type
        )
        db.session.add(notification)
        
        # Create notification object for socket emission
        notification_data = {
            'cow_id': cow_id,
            'message': message,
            'type': notification_type,
            'is_read': False,
            'created_at': datetime.now().isoformat()        
        }
        
        # Emit to connected clients for this user
        emit_notification(manager.id, notification_data)
    
    db.session.commit()