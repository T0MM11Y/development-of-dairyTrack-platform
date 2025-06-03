from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger  # Move this import to the top
import logging
import atexit
from flask import current_app
from app.services.notification import check_milk_expiry_and_notify, check_missing_milking_and_notify

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class NotificationScheduler:
    def __init__(self, app=None):
        self.app = app
        self.scheduler = None
        
    def init_app(self, app):
        """Initialize scheduler with Flask app"""
        self.app = app
        self.scheduler = BackgroundScheduler(
            timezone='Asia/Jakarta',  # Set your timezone
            job_defaults={
                'coalesce': True,
                'max_instances': 1,
                'misfire_grace_time': 30
            }
        )
        
    def start(self):
        """Start the scheduler"""
        if not self.scheduler:
            logging.error("Scheduler not initialized")
            return
            
        if self.scheduler.running:
            logging.warning("Scheduler is already running")
            return
        
        # Add milk expiry check job
        self.scheduler.add_job(
            func=self._run_milk_expiry_check,
            trigger=IntervalTrigger(minutes=5),
            id='milk_expiry_check',
            name='Milk Expiry Check',
            replace_existing=True
        )

        # Add missing milking check job - runs once daily at 1:00 PM
        self.scheduler.add_job(
            func=self._run_missing_milking_check,
            trigger=CronTrigger(hour=13, minute=0),  # Run daily at 1:00 PM
            id='missing_milking_check',
            name='Missing Milking Check',
            replace_existing=True
        )
        
        self.scheduler.start()
        logging.info("Notification scheduler started - checks configured")
    
        # Shut down the scheduler when exiting the app
        atexit.register(lambda: self.shutdown())
        
    def shutdown(self):
        """Stop the scheduler"""
        if self.scheduler and self.scheduler.running:
            self.scheduler.shutdown()
            logging.info("Notification scheduler stopped")
            
            
    def _run_milk_expiry_check(self):
        """Run milk expiry check with app context"""
        try:
            with self.app.app_context():
                logging.info("Running scheduled milk expiry check")
                notification_count = check_milk_expiry_and_notify()
                logging.info(f"Milk expiry check completed - {notification_count} notifications created")
        except Exception as e:
            logging.error(f"Error in scheduled milk expiry check: {str(e)}")

    def _run_missing_milking_check(self):
        """Run missing milking check with app context"""
        try:
            with self.app.app_context():
                logging.info("Running scheduled missing milking check")
                notification_count = check_missing_milking_and_notify()
                logging.info(f"Missing milking check completed - {notification_count} notifications created")
        except Exception as e:
            logging.error(f"Error in scheduled missing milking check: {str(e)}")


# Global scheduler instance
notification_scheduler = NotificationScheduler()