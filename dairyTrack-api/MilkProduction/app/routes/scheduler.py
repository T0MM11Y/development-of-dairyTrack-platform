from flask import Blueprint, jsonify
from app.services.notification import check_milk_production_and_notify, check_milk_expiry_and_notify
from app.services.notificationScheduler import notification_scheduler
import logging

scheduler_bp = Blueprint('scheduler', __name__)

@scheduler_bp.route('/trigger-production-check', methods=['POST'])
def trigger_production_check():
    """Manually trigger milk production check"""
    try:
        notification_count = check_milk_production_and_notify()
        return jsonify({
            "success": True,
            "message": "Production check completed",
            "notifications_created": notification_count
        }), 200
    except Exception as e:
        logging.error(f"Error triggering production check: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@scheduler_bp.route('/trigger-expiry-check', methods=['POST'])
def trigger_expiry_check():
    """Manually trigger milk expiry check"""
    try:
        notification_count = check_milk_expiry_and_notify()
        return jsonify({
            "success": True,
            "message": "Expiry check completed",
            "notifications_created": notification_count
        }), 200
    except Exception as e:
        logging.error(f"Error triggering expiry check: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@scheduler_bp.route('/scheduler-status', methods=['GET'])
def scheduler_status():
    """Get scheduler status"""
    try:
        is_running = notification_scheduler.scheduler.running if notification_scheduler.scheduler else False
        jobs = []
        
        if notification_scheduler.scheduler and is_running:
            for job in notification_scheduler.scheduler.get_jobs():
                jobs.append({
                    'id': job.id,
                    'name': job.name,
                    'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None
                })
        
        return jsonify({
            "success": True,
            "scheduler_running": is_running,
            "jobs": jobs
        }), 200
    except Exception as e:
        logging.error(f"Error getting scheduler status: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@scheduler_bp.route('/restart-scheduler', methods=['POST'])
def restart_scheduler():
    """Restart the scheduler"""
    try:
        # Stop existing scheduler
        notification_scheduler.shutdown()
        
        # Start new scheduler
        notification_scheduler.start()
        
        return jsonify({
            "success": True,
            "message": "Scheduler restarted successfully"
        }), 200
    except Exception as e:
        logging.error(f"Error restarting scheduler: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@scheduler_bp.route('/api/test/missing-milking', methods=['POST'])
def test_missing_milking():
    """Test endpoint for missing milking check"""
    try:
        from app.services.notification import check_missing_milking_and_notify
        count = check_missing_milking_and_notify()
        return {"success": True, "notifications_sent": count}
    except Exception as e:
        return {"success": False, "error": str(e)}