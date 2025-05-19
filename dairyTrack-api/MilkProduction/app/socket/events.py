from flask_socketio import join_room, leave_room
from flask import request
from .manager import socketio, user_clients
import logging

logger = logging.getLogger(__name__)

@socketio.on('connect')
def handle_connect(auth):
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnect"""
    logger.info(f"Client disconnected: {request.sid}")
    # Remove from any user rooms
    for user_id, clients in user_clients.items():
        if request.sid in clients:
            clients.remove(request.sid)
            logger.info(f"Removed {request.sid} from user_{user_id} room")

@socketio.on('register')
def handle_register(data):
    """Register a client for a specific user"""
    if 'user_id' not in data:
        return {'status': 'error', 'message': 'user_id required'}
    
    user_id = data['user_id']
    room = f"user_{user_id}"
    
    # Add to room
    join_room(room)
    
    # Track client for this user
    if user_id not in user_clients:
        user_clients[user_id] = set()
    user_clients[user_id].add(request.sid)
    
    logger.info(f"Client {request.sid} registered for user {user_id}")
    return {'status': 'success', 'message': f'Registered for notifications for user {user_id}'}

@socketio.on('unregister')
def handle_unregister(data):
    """Unregister a client for a specific user"""
    if 'user_id' not in data:
        return {'status': 'error', 'message': 'user_id required'}
    
    user_id = data['user_id']
    room = f"user_{user_id}"
    
    # Remove from room
    leave_room(room)
    
    # Remove from tracking
    if user_id in user_clients and request.sid in user_clients[user_id]:
        user_clients[user_id].remove(request.sid)
    
    logger.info(f"Client {request.sid} unregistered for user {user_id}")
    return {'status': 'success', 'message': f'Unregistered from notifications for user {user_id}'}