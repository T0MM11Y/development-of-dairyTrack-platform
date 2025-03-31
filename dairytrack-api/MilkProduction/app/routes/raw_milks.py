from flask import Blueprint, jsonify, request
from app import db
from app.models import RawMilk

# Define Blueprint
raw_milks_bp = Blueprint('raw_milks', __name__)

@raw_milks_bp.route('/raw_milks', methods=['GET'])
def get_raw_milks():
    raw_milks = RawMilk.query.order_by(RawMilk.id).all()
    return jsonify([raw_milk.to_dict() for raw_milk in raw_milks])

@raw_milks_bp.route('/raw_milks/<int:id>', methods=['GET'])
def get_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    return jsonify(raw_milk.to_dict())

@raw_milks_bp.route('/raw_milks', methods=['POST'])
def create_raw_milk():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Convert previous_volume to float or default to 0.0
    try:
        previous_volume = float(data.get('previous_volume', 0.0))
    except ValueError:
        previous_volume = 0.0

    raw_milk = RawMilk(
        cow_id=data.get('cow_id'),
        production_time=data.get('production_time'),
        volume_liters=data.get('volume_liters'),
        previous_volume=previous_volume,
        status=data.get('status', 'fresh')
    )

    db.session.add(raw_milk)
    db.session.commit()
    return jsonify(raw_milk.to_dict()), 201

@raw_milks_bp.route('/raw_milks/<int:id>', methods=['PUT'])
def update_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Convert previous_volume to float or retain the current value
    try:
        previous_volume = float(data.get('previous_volume', raw_milk.previous_volume))
    except ValueError:
        previous_volume = raw_milk.previous_volume

    raw_milk.cow_id = data.get('cow_id', raw_milk.cow_id)
    raw_milk.production_time = data.get('production_time', raw_milk.production_time)
    raw_milk.volume_liters = data.get('volume_liters', raw_milk.volume_liters)
    raw_milk.previous_volume = previous_volume
    raw_milk.status = data.get('status', raw_milk.status)

    db.session.commit()
    return jsonify(raw_milk.to_dict())

@raw_milks_bp.route('/raw_milks/<int:id>', methods=['DELETE'])
def delete_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    db.session.delete(raw_milk)
    db.session.commit()
    return jsonify({'message': 'Raw milk production has been deleted!'})