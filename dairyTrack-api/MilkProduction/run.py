# Apply monkey patch before any other imports
import eventlet
eventlet.monkey_patch()

# Now import Flask app and other modules
from app import create_app

app, socketio = create_app()

if __name__ == "__main__":
    # Run with socket.io instead of regular Flask server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)