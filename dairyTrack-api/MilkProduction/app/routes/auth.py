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

    if user.is_logged:
        # Beri opsi untuk logout dari perangkat lain
        return jsonify({
            "success": False,
            "message": "User already logged in from another device",
            "allow_force_logout": True
        }), 401

    if check_password_hash(user.password, password):
        # Generate token dan update user
        token = str(uuid.uuid4())
        user.token = token
        user.token_created_at = datetime.utcnow()
        user.is_logged = True
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

@auth_bp.route('/force-logout', methods=['POST'])
def force_logout():
    data = request.get_json()
    username = data.get('username')
    
    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400

    user = User.query.filter_by(username=username).first()
    
    if user:
        user.token = None
        user.is_logged = False
        user.token_created_at = None
        db.session.commit()
        return jsonify({"success": True, "message": "Logged out from all devices"}), 200
    
    return jsonify({"success": False, "message": "User not found"}), 404

@auth_bp.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"success": False, "message": "Token is required"}), 400

    user = User.query.filter_by(token=token).first()

    if user:
        user.token = None
        user.is_logged = False
        user.token_created_at = None
        db.session.commit()
        return jsonify({"success": True, "message": "Logout successful"}), 200
    
    return jsonify({"success": False, "message": "Invalid token"}), 401

@auth_bp.route('/check-token', methods=['POST'])
def check_token():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"success": False, "message": "Token is required"}), 400

    user = User.query.filter_by(token=token).first()

    if not user:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    # Hitung sisa waktu token
    elapsed = (datetime.utcnow() - user.token_created_at).total_seconds()
    remaining = max(0, TOKEN_EXPIRATION - elapsed)

    if remaining <= 0:
        # Token expired, clear it
        user.token = None
        user.is_logged = False
        user.token_created_at = None
        db.session.commit()
        return jsonify({"success": False, "message": "Token expired"}), 401

    return jsonify({
        "success": True,
        "message": "Token is valid",
        "username": user.username,
        "role": user.role.name,
        "expires_in": remaining
    }), 200

def check_all_tokens():
    """Membersihkan token yang sudah kedaluwarsa"""
    try:
        expiration_time = datetime.utcnow() - timedelta(seconds=TOKEN_EXPIRATION)
        
        # Query dan update dalam satu operasi untuk efisiensi
        expired_users = User.query.filter(
            User.token_created_at < expiration_time,
            User.is_logged == True
        ).all()
        
        for user in expired_users:
            user.token = None
            user.is_logged = False
            user.token_created_at = None
        
        db.session.commit()
        current_app.logger.info(f"Cleared tokens for {len(expired_users)} users")
        if expired_users:
            current_app.logger.info(f"Cleared tokens for {len(expired_users)} users")
    except Exception as e:
        current_app.logger.error(f"Error clearing tokens: {str(e)}")
        db.session.rollback()