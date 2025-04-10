from flask import Blueprint, jsonify, request
from app import db
from app.models import Supervisor, Farmer, Admin

# Blueprint untuk Supervisor
supervisors_bp = Blueprint('supervisors', __name__)

@supervisors_bp.route('/supervisors', methods=['GET'])
def get_supervisors():
    supervisors = Supervisor.query.order_by(Supervisor.id).all()
    return jsonify([supervisor.to_dict() for supervisor in supervisors])

@supervisors_bp.route('/supervisors/<int:id>', methods=['GET'])
def get_supervisor(id):
    supervisor = Supervisor.query.get_or_404(id)
    return jsonify(supervisor.to_dict())

@supervisors_bp.route('/supervisors', methods=['POST'])
def create_supervisor():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400  

    new_supervisor = Supervisor(
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        contact=data.get('contact'),
        password=data.get('password')
    )
    # Hash the password using the set_password method
    new_supervisor.set_password(data.get('password'))

    db.session.add(new_supervisor)
    db.session.commit()
    return jsonify({'message': 'Supervisor created successfully', 'data': new_supervisor.to_dict()}), 201

@supervisors_bp.route('/supervisors/<int:id>', methods=['PUT'])
def update_supervisor(id):
    supervisor = Supervisor.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    supervisor.email = data.get('email', supervisor.email)
    supervisor.first_name = data.get('first_name', supervisor.first_name)
    supervisor.last_name = data.get('last_name', supervisor.last_name)
    supervisor.contact = data.get('contact', supervisor.contact)

    db.session.commit()
    return jsonify(supervisor.to_dict())

@supervisors_bp.route('/supervisors/<int:id>', methods=['DELETE'])
def delete_supervisor(id):
    supervisor = Supervisor.query.get_or_404(id)
    db.session.delete(supervisor)
    db.session.commit()
    return jsonify({'message': 'Supervisor has been deleted!'})
