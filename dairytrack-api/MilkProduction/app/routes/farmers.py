from flask import Blueprint, jsonify, request

from app import db
from app.models import Farmer

# Blueprint untuk Farmer
farmers_bp = Blueprint('farmers', __name__)

@farmers_bp.route('/farmers', methods=['GET'])
def get_farmers():
    farmers = Farmer.query.order_by(Farmer.id).all()
    return jsonify([farmer.to_dict() for farmer in farmers])

@farmers_bp.route('/farmers/<int:id>', methods=['GET'])
def get_farmer(id):
    farmer = Farmer.query.get_or_404(id)
    return jsonify(farmer.to_dict())

@farmers_bp.route('/farmers', methods=['POST'])
def create_farmer():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400

    new_farmer = Farmer(
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        birth_date=data.get('birth_date'),
        contact=data.get('contact'),
        religion=data.get('religion'),
        address=data.get('address'),
        gender=data.get('gender'),
        total_cattle=data.get('total_cattle', 0),
        join_date=data.get('join_date'),
        status=data.get('status')
    )
    # Hash the password using the set_password method
    new_farmer.set_password(data.get('password'))

    db.session.add(new_farmer)
    db.session.commit()
    return jsonify({'message': 'Farmer created successfully', 'data': new_farmer.to_dict()}), 201

@farmers_bp.route('/farmers/<int:id>', methods=['PUT'])
def update_farmer(id):
    farmer = Farmer.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    farmer.email = data.get('email', farmer.email)
    farmer.first_name = data.get('first_name', farmer.first_name)
    farmer.last_name = data.get('last_name', farmer.last_name)
    farmer.birth_date = data.get('birth_date', farmer.birth_date)
    farmer.contact = data.get('contact', farmer.contact)
    farmer.religion = data.get('religion', farmer.religion)
    farmer.address = data.get('address', farmer.address)
    farmer.gender = data.get('gender', farmer.gender)
    farmer.total_cattle = data.get('total_cattle', farmer.total_cattle)
    farmer.join_date = data.get('join_date', farmer.join_date)
    farmer.status = data.get('status', farmer.status)

    db.session.commit()
    return jsonify(farmer.to_dict())

@farmers_bp.route('/farmers/<int:id>', methods=['DELETE'])
def delete_farmer(id):
    farmer = Farmer.query.get_or_404(id)
    db.session.delete(farmer)
    db.session.commit()
    return jsonify({'message': 'Farmer has been deleted!'})