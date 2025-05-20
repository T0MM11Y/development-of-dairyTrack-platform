from app.models.notification import Notification
from app.models.daily_milk_summary import DailyMilkSummary
from app.database.database import db
from datetime import date, datetime, timedelta
from app.models.cows import Cow
from app.models.milk_batches import MilkBatch, MilkStatus
from app.socket import emit_notification
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def check_milk_production_and_notify():
    """
    Checks if milk production is within the standard range (15-25 liters/day)
    and notifies farmers accordingly
    """
    today = date.today()
    notification_count = 0
    
    logging.info("Starting milk production check for date: %s", today)
    
    try:
        # Get today's milk summaries
        daily_summaries = DailyMilkSummary.query.filter_by(date=today).all()
        logging.info("Found %d daily milk summaries for today", len(daily_summaries))
        
        for summary in daily_summaries:
            logging.info("Processing summary for cow ID: %d, total volume: %.2f", summary.cow_id, summary.total_volume)
            
            if summary.total_volume < 15:
                message = f"Produksi susu rendah! Sapi #{summary.cow.id} ({summary.cow.name}) " \
                          f"hanya memproduksi {summary.total_volume} liter hari ini (di bawah standar 15L)"
                notification_type = "low_production"
                count = create_notifications_for_cow(summary.cow_id, message, notification_type)
                notification_count += count
                
            elif summary.total_volume > 25:
                message = f"Produksi susu tinggi! Sapi #{summary.cow.id} ({summary.cow.name}) " \
                          f"memproduksi {summary.total_volume} liter hari ini (di atas standar 25L)"
                notification_type = "high_production"
                count = create_notifications_for_cow(summary.cow_id, message, notification_type)
                notification_count += count
        
        logging.info("Milk production check completed. Total notifications created: %d", notification_count)
        return notification_count
        
    except Exception as e:
        logging.error("Error in check_milk_production_and_notify: %s", str(e))
        db.session.rollback()
        return 0

def create_notifications_for_cow(cow_id, message, notification_type):
    """Creates notifications for all farmers managing the specified cow"""
    
    logging.info("Creating notifications for cow ID: %d", cow_id)
    
    # Get the cow
    cow = Cow.query.get(cow_id)
    count = 0
    
    if not cow:
        logging.warning("Cow with ID %d not found", cow_id)
        return count
    
    try:
        # Get all managers (farmers) for this cow
        managers = cow.managers.all()
        logging.info("Found %d managers for cow ID: %d", len(managers), cow_id)
        
        for manager in managers:
            logging.info("Creating notification for manager ID: %d", manager.id)
            notification = Notification(
                user_id=manager.id,
                cow_id=cow_id,
                message=message,
                type=notification_type,
                is_read=False  # Pastikan is_read ditambahkan
            )
            db.session.add(notification)
            count += 1
            
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
            logging.info("Notification emitted to manager ID: %d", manager.id)
        
        db.session.commit()
        logging.info("Notifications for cow ID: %d committed to database", cow_id)
        return count
    
    except Exception as e:
        logging.error("Error in create_notifications_for_cow: %s", str(e))
        db.session.rollback()
        return 0

def check_milk_expiry_and_notify():
    """
    1. Checks all milk batches with FRESH status to see if they've expired.
       If expired, updates status to EXPIRED and creates a notification.
    2. Also checks for milk batches that have been marked as USED and sends
       notifications for those.
    3. Only notifies users who manage cows associated with these batches.
    """
    current_time = datetime.utcnow()
    notification_count = 0
    
    logging.info("Starting milk expiry check at: %s", current_time)
    
    # Check for expired milk batches (FRESH -> EXPIRED)
    expired_batches = MilkBatch.query.filter(
        MilkBatch.status == MilkStatus.FRESH,
        MilkBatch.expiry_date < current_time
    ).all()
    logging.info("Found %d expired milk batches", len(expired_batches))
    
    for batch in expired_batches:
        logging.info("Processing expired batch ID: %d", batch.id)
        # Update status to EXPIRED
        batch.status = MilkStatus.EXPIRED
        
        # Format expiry time
        expiry_time = batch.expiry_date.strftime("%H:%M:%S on %d/%m/%Y")
        
        # Find all users who should be notified about this batch
        sessions = batch.milking_sessions
        
        if not sessions:
            logging.warning("No milking sessions found for batch ID: %d", batch.id)
            continue
            
        cow_ids = set(session.cow_id for session in sessions)
        
        for cow_id in cow_ids:
            cow = Cow.query.get(cow_id)
            if not cow:
                logging.warning("Cow with ID %d not found", cow_id)
                continue
                
            managers = cow.managers.all()
            
            for manager in managers:
                logging.info("Creating expiry notification for manager ID: %d", manager.id)
                notification = Notification(
                    user_id=manager.id,
                    cow_id=cow_id,
                    message=f"Batch {batch.batch_number} with {batch.total_volume} liters from cow {cow.name} has expired at {expiry_time}.",
                    type="milk_expiry",
                    is_read=False
                )
                db.session.add(notification)
                
                notification_data = {
                    'cow_id': cow_id,
                    'message': f"Batch {batch.batch_number} with {batch.total_volume} liters from cow {cow.name} has expired at {expiry_time}.",
                    'type': "milk_expiry",
                    'is_read': False,
                    'created_at': datetime.now().isoformat()
                }
                emit_notification(manager.id, notification_data)
                logging.info("Expiry notification emitted to manager ID: %d", manager.id)
                
                notification_count += 1
    
    if notification_count > 0:
        db.session.commit()
        logging.info("Milk expiry notifications committed to database")
    
    logging.info("Milk expiry check completed. Total notifications created: %d", notification_count)
    return notification_count