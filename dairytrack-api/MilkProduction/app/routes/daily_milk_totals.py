from flask import Blueprint, jsonify
from app import db
from app.models.daily_milk_total import DailyMilkTotal
from app.models import Notification
from datetime import datetime

# Define Blueprint
daily_milk_totals_bp = Blueprint('daily_milk_totals', __name__)

@daily_milk_totals_bp.route('/daily_milk_totals', methods=['GET'])
def get_daily_milk_totals():
    daily_totals = DailyMilkTotal.query.order_by(DailyMilkTotal.date.desc()).all()
    result = [daily_total.to_dict() for daily_total in daily_totals]
    return jsonify(result), 200

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
    today = datetime.now().date()
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
            else:
                notification = Notification(
                    cow_id=daily_total.cow_id,
                    date=today,
                    message=message
                )
                db.session.add(notification)

            notifications.append({
                'cow_id': daily_total.cow_id,
                'date': daily_total.date.strftime('%Y-%m-%d'),
                'total_volume': float(daily_total.total_volume),  # Convert to float
                'deficit': deficit,
                'message': message
            })

    db.session.commit()

    if not notifications:
        return jsonify({'message': 'All cows meet the daily production standard.'}), 200

    return jsonify({'notifications': notifications}), 200