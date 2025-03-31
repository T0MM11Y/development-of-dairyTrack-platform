from flask import Blueprint, jsonify, request
from app import db
from app.models import Cow

# Define Blueprint
cows_bp = Blueprint('cows', __name__)

@cows_bp.route('/cows', methods=['GET'])
def get_cows():
    cows = Cow.query.order_by(Cow.id).all()
    return jsonify([cow.to_dict() for cow in cows])

@cows_bp.route('/cows/<int:id>', methods=['GET'])
def get_cow(id):
    cow = Cow.query.get_or_404(id)
    return jsonify(cow.to_dict())

@cows_bp.route('/cows', methods=['POST'])
def create_cow():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    cow = Cow(
        farmer_id=data.get('farmer_id'),
        name=data.get('name'),
        breed=data.get('breed'),
        birth_date=data.get('birth_date'),
        lactation_status=data.get('lactation_status', False),
        lactation_phase=data.get('lactation_phase'),
        weight_kg=data.get('weight_kg'),
        reproductive_status=data.get('reproductive_status'),
        gender=data.get('gender'),
        entry_date=data.get('entry_date')
        
    )

    db.session.add(cow)
    db.session.commit()
    return jsonify(cow.to_dict()), 201

@cows_bp.route('/cows/<int:id>', methods=['PUT'])
def update_cow(id):
    cow = Cow.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    cow.farmer_id = data.get('farmer_id', cow.farmer_id)
    cow.name = data.get('name', cow.name)
    cow.breed = data.get('breed', cow.breed)
    cow.birth_date = data.get('birth_date', cow.birth_date)
    cow.lactation_status = data.get('lactation_status', cow.lactation_status)
    cow.lactation_phase = data.get('lactation_phase', cow.lactation_phase)
    cow.weight_kg = data.get('weight_kg', cow.weight_kg)
    cow.reproductive_status = data.get('reproductive_status', cow.reproductive_status)
    cow.gender = data.get('gender', cow.gender)
    cow.entry_date = data.get('entry_date', cow.entry_date)

    db.session.commit()
    return jsonify(cow.to_dict())

@cows_bp.route('/cows/<int:id>', methods=['DELETE'])
def delete_cow(id):
    cow = Cow.query.get_or_404(id)
    cow_name = cow.name  # Retrieve the cow's name before deletion
    db.session.delete(cow)
    db.session.commit()
    return jsonify({'message': f'Cow with name "{cow_name}" and id "{id}" has been successfully deleted!'})