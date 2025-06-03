from flask import Flask
from config import Config
from flask_cors import CORS
from app.routes.auth import auth_bp
from app.routes.user import user_bp
from app.routes.role import role_bp
from app.routes.user_cow_association import user_cow_bp
from app.routes.cow import cow_bp
from app.routes.gallery import gallery_bp
from app.routes.blog import blog_bp
from app.database.database import db
from flask_migrate import Migrate
from app.routes.category import category_bp
from app.routes.blog_category import blog_category_bp
from app.routes.milk_production import milk_production_bp
from app.routes.notification import notification_bp
from app.routes.milk_expiry_check import milk_expiry_bp
from app.routes.scheduler import scheduler_bp  # Add this import
from app.socket import init_socketio
from app.services.notificationScheduler import notification_scheduler

import os
import logging

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Konfigurasi folder upload dan ekstensi yang diizinkan
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'app/uploads/gallery')
    app.config['BLOG_UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'app/uploads/blog')
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

    # Inisialisasi database dan migrasi
    db.init_app(app)
    migrate = Migrate(app, db)

    # Initialize notification scheduler
    notification_scheduler.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    
    # Initialize Socket.IO
    socketio = init_socketio(app)

    # Start notification scheduler after app context is available
    @app.before_first_request
    def start_notification_scheduler():
        try:
            notification_scheduler.start()
            logging.info("Notification scheduler started successfully")
        except Exception as e:
            logging.error(f"Failed to start notification scheduler: {str(e)}")

    
    start_notification_scheduler()

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(role_bp, url_prefix='/role')
    app.register_blueprint(user_cow_bp, url_prefix='/user-cow')
    app.register_blueprint(cow_bp, url_prefix='/cow')
    app.register_blueprint(gallery_bp, url_prefix='/gallery')
    app.register_blueprint(category_bp, url_prefix='/category')
    app.register_blueprint(blog_category_bp, url_prefix='/blog-category')
    app.register_blueprint(blog_bp, url_prefix='/blog')
    app.register_blueprint(milk_production_bp, url_prefix='/milk-production')
    app.register_blueprint(notification_bp, url_prefix='/notification')
    app.register_blueprint(milk_expiry_bp, url_prefix='/milk-expiry')
    app.register_blueprint(scheduler_bp, url_prefix='/scheduler')  # Add this line

    return app, socketio