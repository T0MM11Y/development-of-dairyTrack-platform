# FILE: auth.py
from flask import Blueprint, jsonify, request
from app.models import Admin, Supervisor, Farmer
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Search for the user by email in all tables
    user = Admin.query.filter_by(email=data['email']).first() or \
        Supervisor.query.filter_by(email=data['email']).first() or \
        Farmer.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'message': f"Login successful for email {data['email']}",
        'date': datetime.now().strftime('%Y-%m-%d')
    })

@auth_bp.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required to logout'}), 400

    # Simulate logout process (e.g., invalidate token or session)
    return jsonify({
        'message': f"Logout successful for email {data['email']}",
        'date': datetime.now().strftime('%Y-%m-%d')
    })