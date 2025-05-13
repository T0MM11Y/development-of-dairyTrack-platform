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
            "user_id": user.id,
            "username": username,
            "name": user.name,
            "token": token,
            "role": user.role.name,
            "role_id": user.role.id,
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

    # Jika user dengan token ditemukan
    if user:
        user.token = None
        user.token_created_at = None
        db.session.commit()
        return jsonify({"success": True, "message": "Logout successful"}), 200
    
    # Jika token tidak ditemukan, mencoba mencari user berdasarkan token dari request
    # untuk menangani kasus di mana token di database kosong tapi user masih mencoba logout
    # dengan token lama yang tersimpan di client
    try:
        # Ambil informasi dari token (misalnya, jika token berisi informasi yang bisa digunakan)
        # Ini hanya contoh, Anda mungkin perlu menyesuaikan dengan format token Anda
        # Atau menggunakan cara lain untuk mengidentifikasi user
        user_id = request.get_json().get('user_id')  # Misalnya jika client juga mengirim user_id

        if user_id:
            user = User.query.get(user_id)
            if user:
                # Pastikan token dan token_created_at kosong untuk berjaga-jaga
                user.token = None
                user.token_created_at = None
                db.session.commit()
                return jsonify({"success": True, "message": "User already logged out, session cleared"}), 200
    except:
        pass
    
    # Jika tidak ada cara untuk mengidentifikasi user atau terjadi error
    return jsonify({"success": True, "message": "No active session found, considered as logged out"}), 200