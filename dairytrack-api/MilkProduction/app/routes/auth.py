# FILE: auth.py
from flask import Blueprint, jsonify, request, current_app
from app.models import Admin, Supervisor, Farmer
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required', 'status': 400}), 400

        user = None
        user_type = None

        # Cari user di setiap model
        admin = Admin.query.filter_by(email=data['email']).first()
        if admin and admin.check_password(data['password']):
            user = admin
            user_type = 'admin'

        if not user:
            supervisor = Supervisor.query.filter_by(email=data['email']).first()
            if supervisor and supervisor.check_password(data['password']):
                user = supervisor
                user_type = 'supervisor'

        if not user:
            farmer = Farmer.query.filter_by(email=data['email']).first()
            if farmer and farmer.check_password(data['password']):
                user = farmer
                user_type = 'farmer'

        if not user:
            return jsonify({'error': 'Invalid email or password', 'status': 401}), 401

        return jsonify({
            'status': 200,
            'message': f"Login successful for email {data['email']}",
            'user': {
                **user.to_dict(),
                'type': user_type  # ✅ tambahkan asalnya
            },
            'date': datetime.now().strftime('%Y-%m-%d')
        })
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'An unexpected error occurred', 'status': 500}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({
            'error': 'Email is required to logout',
            'status': 400
        }), 400

    # Simulate logout process (e.g., invalidate token or session)
    return jsonify({
        'status': 200,
        'message': f"Logout successful for email {data['email']}",
        'date': datetime.now().strftime('%Y-%m-%d')
    })