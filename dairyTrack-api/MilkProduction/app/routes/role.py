from flask import Blueprint, request, jsonify
from app.models.roles import Role
from app.database.database import db

role_bp = Blueprint('role', __name__)

@role_bp.route('/list', methods=['GET'])
def list_roles():
    try:
        # Ambil semua role dari database
        roles = Role.query.all()
        role_list = [{"id": role.id, "name": role.name, "description": role.description} for role in roles]

        return jsonify({"roles": role_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@role_bp.route('/add', methods=['POST'])
def add_role():
    try:
        # Ambil data dari request body
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        # Validasi data
        if not name:
            return jsonify({"error": "Role name is required"}), 400

        # Buat instance Role baru
        new_role = Role(
            name=name,
            description=description
        )

        # Simpan ke database
        db.session.add(new_role)
        db.session.commit()

        return jsonify({"message": "Role added successfully", "role": {
            "id": new_role.id,
            "name": new_role.name,
            "description": new_role.description
        }}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
