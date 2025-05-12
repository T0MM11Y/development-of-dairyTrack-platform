from datetime import datetime, timedelta
from flask import Blueprint, current_app, request, jsonify
from app.models.users import User
from app.database.database import db
import uuid
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

# Konfigurasi waktu kedaluwarsa token (dalam detik)
TOKEN_EXPIRATION = 3600  # 1 jam

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

  
    if check_password_hash(user.password, password):
        # Generate token dan update user
        token = str(uuid.uuid4())
        user.token = token
        user.token_created_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": username,
            "token": token,
            "role": user.role.name,
            "email": user.email,
            "expires_in": TOKEN_EXPIRATION
        }), 200

    return jsonify({"success": False, "message": "Invalid credentials"}), 401



@auth_bp.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"success": False, "message": "Token is required"}), 400

    user = User.query.filter_by(token=token).first()

    if user:
        user.token = None
        user.token_created_at = None
        db.session.commit()
        return jsonify({"success": True, "message": "Logout successful"}), 200
    
    return jsonify({"success": False, "message": "Invalid token"}), 401

