from flask_socketio import emit, join_room, leave_room
from flask import request
from .manager import socketio, user_clients
import logging
from datetime import datetime  # Correct import

connected_users = {}

logger = logging.getLogger(__name__)

@socketio.on('connect')
def handle_connect(auth):
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle user disconnect"""
    session_id = request.sid
    if session_id in connected_users:
        user_data = connected_users[session_id]
        user_id = user_data['user_id']
        role_id = user_data.get('role_id')
        
        # Leave rooms
        leave_room(f"user_{user_id}")
        if role_id:
            leave_room(f"role_{role_id}")
        
        # Remove from connected users
        del connected_users[session_id]
        
        logging.info(f"User {user_id} disconnected")

@socketio.on('register')
def handle_register(data):
    """Register user for notifications"""
    try:
        user_id = str(data.get('user_id'))
        role_id = data.get('role_id')
        session_id = request.sid
        
        if user_id:
            # Store user connection
            connected_users[session_id] = {
                'user_id': user_id,
                'role_id': role_id,
                'connected_at': datetime.utcnow().isoformat()
            }
            
            # Join user-specific room
            join_room(f"user_{user_id}")
            
            # Join role-specific room if needed
            if role_id:
                join_room(f"role_{role_id}")
            
            logging.info(f"User {user_id} registered for notifications")
            emit('registration_success', {'message': 'Successfully registered for notifications'})
        else:
            logging.warning("Registration failed: No user_id provided")
            emit('registration_error', {'message': 'User ID required'})
            
    except Exception as e:
        logging.error(f"Error in handle_register: {str(e)}")
        emit('registration_error', {'message': 'Registration failed'})

@socketio.on('unregister')
def handle_unregister(data):
    """Unregister a client for a specific user"""
    user_id = str(data.get('user_id', ''))
    
    if user_id in user_clients and request.sid in user_clients[user_id]:
        user_clients[user_id].remove(request.sid)
        leave_room(f"user_{user_id}")
        logger.info(f"Client {request.sid} left room user_{user_id}")
        print(f"Client {request.sid} left room user_{user_id}")

def send_notification_to_user(user_id, notification_data):
    """Send notification to specific user"""
    try:
        socketio.emit('new_notification', notification_data, room=f"user_{user_id}")
        logging.info(f"Notification sent to user {user_id}")
    except Exception as e:
        logging.error(f"Error sending notification to user {user_id}: {str(e)}")