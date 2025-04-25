from flask import Blueprint, jsonify
from app import db
from app.models.daily_milk_total import DailyMilkTotal
from app.models import Notification
import pytz
from datetime import datetime


# Define Blueprint
daily_milk_totals_bp = Blueprint('daily_milk_totals', __name__)
local_tz = pytz.timezone('Asia/Jakarta')

@daily_milk_totals_bp.route('/daily_milk_totals', methods=['GET'])
def get_daily_milk_totals():
    daily_totals = DailyMilkTotal.query.order_by(DailyMilkTotal.date.desc()).all()
    result = [daily_total.to_dict() for daily_total in daily_totals]
    
    # Print the type of the response data to the terminal
    print(f"Type of response data: {type(result)}")
    if result:
        print("Types of elements in the response data:")
        for index, element in enumerate(result):
            print(f"Element {index}: {type(element)}")
    
    # Corrected return statement
    return jsonify({'status': 200, 'data': result}), 200

@daily_milk_totals_bp.route('/daily_milk_totals/<int:id>', methods=['GET'])
def get_daily_milk_total(id):
    daily_total = DailyMilkTotal.query.get_or_404(id)
    return jsonify(daily_total.to_dict()), 200

@daily_milk_totals_bp.route('/daily_milk_totals/cow/<int:cow_id>', methods=['GET'])
def get_daily_milk_totals_by_cow_id(cow_id):
    daily_totals = DailyMilkTotal.query.filter_by(cow_id=cow_id).order_by(DailyMilkTotal.date.desc()).all()
    if not daily_totals:
        return jsonify({'message': f'No daily milk totals found for cow_id {cow_id}'}), 404

    # Filter out entries with missing or invalid milk data
    result = [daily_total.to_dict() for daily_total in daily_totals if daily_total.total_volume is not None]

    # If no valid data remains after filtering, return a 404 response
    if not result:
        return jsonify({'message': f'No valid daily milk totals found for cow_id {cow_id}'}), 404

    return jsonify(result), 200

@daily_milk_totals_bp.route('/daily_milk_totals/all', methods=['GET'])
def get_all_daily_milk_totals():
    daily_totals = DailyMilkTotal.query.order_by(DailyMilkTotal.date.desc()).all()
    if not daily_totals:
        return jsonify({'message': 'No daily milk totals found'}), 404

    # Filter out entries with null values
    result = [daily_total.to_dict() for daily_total in daily_totals if daily_total is not None]
    return jsonify(result), 200 

@daily_milk_totals_bp.route('/daily_milk_totals/notifications', methods=['GET'])
def get_low_production_notifications():
    current_time = datetime.now(local_tz)  # Current time with timezone

    today = datetime.now(local_tz).date()  # Ensure timezone-aware date
    daily_totals = DailyMilkTotal.query.filter(DailyMilkTotal.date == today).all()
    
    MIN_PRODUCTION = 18
    notifications = []

    for daily_total in daily_totals:
        if daily_total.total_volume is not None and daily_total.total_volume < MIN_PRODUCTION:
            deficit = float(MIN_PRODUCTION - daily_total.total_volume)  # Convert to float
            message = f"Production below standard: {float(daily_total.total_volume)} liters (deficit: {deficit} liters)"
            
            existing_notification = Notification.query.filter_by(
                cow_id=daily_total.cow_id,
                date=today
            ).first()

            if existing_notification:
                existing_notification.message = message
                notification_time = existing_notification.created_at  # Assuming created_at exists
            else:
                notification = Notification(
                    cow_id=daily_total.cow_id,
                    date=today,
                    message=message
                )
                db.session.add(notification)
                notification_time = current_time

            # Ensure notification_time is timezone-aware
            if notification_time.tzinfo is None:
                notification_time = local_tz.localize(notification_time)
            else:
                notification_time = notification_time.astimezone(local_tz)

            # Calculate how long ago the notification was created
            time_since_notification = current_time - notification_time
            hours_ago, remainder = divmod(time_since_notification.total_seconds(), 3600)
            minutes_ago = remainder // 60
            human_readable_notification_time = f"{int(hours_ago)} hours {int(minutes_ago)} minutes ago"

            notifications.append({
                'cow_id': daily_total.cow_id,
                'date': human_readable_notification_time,
                'total_volume': float(daily_total.total_volume),  # Convert to float
                'deficit': deficit,
                'message': message,
                'name': daily_total.cow.name if daily_total.cow else None,
            })

    db.session.commit()

    if not notifications:
        return jsonify({'message': 'All cows meet the daily production standard.'}), 200

    return jsonify({'notifications': notifications}), 200