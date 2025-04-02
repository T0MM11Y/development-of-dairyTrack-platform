from flask import Blueprint, jsonify, request
from app import db
from app.models import RawMilk
from datetime import datetime, timedelta



raw_milks_bp = Blueprint('raw_milks', __name__)


@raw_milks_bp.route('/raw_milks', methods=['GET'])
def get_raw_milks():
    now = datetime.utcnow()
    raw_milks = RawMilk.query.order_by(RawMilk.id).all()

    for raw_milk in raw_milks:
        if raw_milk.expiration_time <= now and raw_milk.status != 'expired':
            raw_milk.status = 'expired'
    db.session.commit()

    result = [raw_milk.to_dict() for raw_milk in raw_milks]
    return jsonify(result)

@raw_milks_bp.route('/raw_milks/<int:id>', methods=['GET'])
def get_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    return jsonify(raw_milk.to_dict())

@raw_milks_bp.route('/raw_milks', methods=['POST'])
def create_raw_milk():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    
    try:
        previous_volume = float(data.get('previous_volume', 0.0))
    except ValueError:
        previous_volume = 0.0

    
    production_time = datetime.fromisoformat(data.get('production_time'))
    expiration_time = production_time + timedelta(hours=8)

    raw_milk = RawMilk(
        cow_id=data.get('cow_id'),
        production_time=production_time,
        expiration_time=expiration_time,  
        volume_liters=data.get('volume_liters'),
        previous_volume=previous_volume,
        status=data.get('status', 'fresh'),
        session=data.get('session'),
        daily_total_id=data.get('daily_total_id'),
        available_stocks=data.get('available_stocks', data.get('volume_liters')),
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

    
    try:
        previous_volume = float(data.get('previous_volume', raw_milk.previous_volume))
    except ValueError:
        previous_volume = raw_milk.previous_volume

    
    raw_milk.cow_id = data.get('cow_id', raw_milk.cow_id)
    raw_milk.production_time = data.get('production_time', raw_milk.production_time)
    raw_milk.volume_liters = data.get('volume_liters', raw_milk.volume_liters)
    raw_milk.previous_volume = previous_volume
    raw_milk.status = data.get('status', raw_milk.status)
    raw_milk.session = data.get('session', raw_milk.session)
    raw_milk.available_stocks = data.get('available_stocks', raw_milk.available_stocks)

    
    if 'production_time' in data:
        production_time = datetime.fromisoformat(data['production_time'])
        raw_milk.expiration_time = production_time + timedelta(hours=8)

    db.session.commit()
    return jsonify(raw_milk.to_dict())

@raw_milks_bp.route('/raw_milks/cow/<int:cow_id>', methods=['GET'])
def get_raw_milks_by_cow_id(cow_id):
    raw_milks = RawMilk.query.filter_by(cow_id=cow_id).order_by(RawMilk.id).all()
    if not raw_milks:
        return jsonify({'message': f'No raw milk records found for cow_id {cow_id}'}), 404

    result = [raw_milk.to_dict() for raw_milk in raw_milks]
    return jsonify(result)    


@raw_milks_bp.route('/raw_milks/today_last_session/<int:cow_id>', methods=['GET'])
def get_today_last_session_by_cow_id(cow_id):
    
    today = datetime.utcnow().date()

    
    last_session = db.session.query(db.func.max(RawMilk.session)).filter(
        RawMilk.cow_id == cow_id,
        db.func.date(RawMilk.production_time) == today
    ).scalar()

    
    if last_session is None:
        last_session = 0

    
    return jsonify({'cow_id': cow_id, 'date': str(today), 'session': last_session}), 200


@raw_milks_bp.route('/raw_milks/<int:id>', methods=['DELETE'])
def delete_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    db.session.delete(raw_milk)
    db.session.commit()
    return jsonify({'message': 'Raw milk production has been deleted!'})