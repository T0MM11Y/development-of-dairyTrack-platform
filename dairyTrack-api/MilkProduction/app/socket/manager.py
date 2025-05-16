from flask_socketio import SocketIO

# Create SocketIO instance
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')

# Connected clients tracking
user_clients = {}

def init_socketio(app):
    """Initialize SocketIO with the Flask app"""
    socketio.init_app(app)
    return socketio

def emit_notification(user_id, notification):
    """Emit notification to specific user"""
    room = f"user_{user_id}"
    socketio.emit('new_notification', notification, room=room)