from app import app, db
from apscheduler.schedulers.background import BackgroundScheduler
from app.routes.daily_milk_totals_bp import get_low_production_notifications
from datetime import datetime

def schedule_notifications():
    with app.app_context():
        print(f"Running scheduled task at {datetime.now()}")
        get_low_production_notifications()
        


if __name__ == '__main__':
    # Create tables if they do not exist
    with app.app_context():
        db.create_all()

    # Initialize scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(schedule_notifications, 'cron', hour='6,18')  # Run at 6 AM and 6 PM
    scheduler.start()

    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()