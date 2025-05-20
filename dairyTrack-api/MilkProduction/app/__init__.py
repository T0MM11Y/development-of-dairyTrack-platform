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
from app.routes.milk_freshness import milk_freshness_bp
from app.socket import init_socketio
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.notification import check_milk_expiry_and_notify

import os
import logging

# Global scheduler variable
scheduler = None

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
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    
    # Initialize Socket.IO
    socketio = init_socketio(app)

    # Set up background scheduler for milk expiry checks
    global scheduler
    if scheduler is None or not scheduler.running:
        scheduler = BackgroundScheduler()
        scheduler.add_job(check_milk_expiry_and_notify, 'interval', hours=1)
        try:
            scheduler.start()
            app.logger.info("Background scheduler started for milk expiry checks")
        except Exception as e:
            app.logger.error(f"Failed to start scheduler: {str(e)}")

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
    app.register_blueprint(milk_freshness_bp, url_prefix='/milk-freshness')
    
    @app.teardown_appcontext
    def shutdown_scheduler(exception=None):
        global scheduler
        if scheduler and scheduler.running:
            try:
                # Only attempt to shutdown if running
                scheduler.shutdown()
            except Exception as e:
                # Log but don't raise errors on shutdown
                app.logger.warning(f"Error shutting down scheduler: {str(e)}")
                pass

    return app, socketio