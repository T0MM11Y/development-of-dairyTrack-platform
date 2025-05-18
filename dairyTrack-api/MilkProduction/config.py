import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    TESTING = os.environ.get('FLASK_TESTING') or False
    # local development
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@localhost/dairy_track' 
    
    # production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or (
        'mysql+pymysql://dairytrack_stiffplate:dcdd07f7b478dd1f479b4c44c4b131048a7c0ac3@xcq0v.h.filess.io:3307/dairytrack_stiffplate'
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False