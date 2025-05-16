from flask import Blueprint

# Initialize the routes blueprint
routes_bp = Blueprint('routes', __name__)
from .user import user_bp
from .auth import auth_bp
from .role import role_bp
from .user_cow_association import user_cow_bp
from .cow import cow_bp
from .gallery import gallery_bp
from .blog import blog_bp
from .category import category_bp
from .blog_category import blog_category_bp
from .notification import notification_bp

# Import the authentication routes
from .auth import *
routes_bp.register_blueprint(user_bp)
routes_bp.register_blueprint(auth_bp)
routes_bp.register_blueprint(role_bp)
routes_bp.register_blueprint(user_cow_bp)
routes_bp.register_blueprint(cow_bp)
routes_bp.register_blueprint(gallery_bp)
routes_bp.register_blueprint(blog_bp)
routes_bp.register_blueprint(category_bp)
routes_bp.register_blueprint(blog_category_bp)
routes_bp.register_blueprint(notification_bp)


