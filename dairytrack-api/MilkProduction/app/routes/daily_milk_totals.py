from flask import Blueprint, jsonify
from app import db
from app.models.daily_milk_total import DailyMilkTotal

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

    result = [daily_total.to_dict() for daily_total in daily_totals]
    return jsonify(result), 200