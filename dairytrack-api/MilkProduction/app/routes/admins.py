from flask import Blueprint, jsonify, request
from app import db
from app.models import Admin

# Blueprint untuk Admin
admins_bp = Blueprint('admins', __name__)

@admins_bp.route('/admins', methods=['GET'])
def get_admins():
    admins = Admin.query.order_by(Admin.id).all()
    return jsonify([admin.to_dict() for admin in admins])

@admins_bp.route('/admins/<int:id>', methods=['GET'])
def get_admin(id):
    admin = Admin.query.get_or_404(id)
    return jsonify(admin.to_dict())

@admins_bp.route('/admins', methods=['POST'])
def create_admin():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400

    new_admin = Admin(
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    # Hash the password using the set_password method
    new_admin.set_password(data.get('password'))

    db.session.add(new_admin)
    db.session.commit()
    return jsonify({'message': 'Admin created successfully', 'data': new_admin.to_dict()}), 201

@admins_bp.route('/admins/<int:id>', methods=['PUT'])
def update_admin(id):
    admin = Admin.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    admin.first_name = data.get('first_name', admin.first_name)
    admin.last_name = data.get('last_name', admin.last_name)

    db.session.commit()
    return jsonify(admin.to_dict())

@admins_bp.route('/admins/<int:id>', methods=['DELETE'])
def delete_admin(id):
    admin = Admin.query.get_or_404(id)
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'message': 'Admin has been deleted!'})
