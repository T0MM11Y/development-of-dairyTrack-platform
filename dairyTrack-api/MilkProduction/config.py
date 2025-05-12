import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    TESTING = os.environ.get('FLASK_TESTING') or False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@localhost/dairy_track'
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable event system to save resources
    JSON_SORT_KEYS = False  # Prevents sorting of JSON keys in responses

# Additional configuration classes can be added here for different environments (e.g., DevelopmentConfig, ProductionConfig)