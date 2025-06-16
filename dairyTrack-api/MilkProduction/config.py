import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    TESTING = os.environ.get('FLASK_TESTING') or False
    # local development
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@127.0.0.1/dairy_track' 
    
     # production
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or (
    #     'mysql+pymysql://DairyTrack_represent:212bf667b8832e0a530401195b131a542e31a4f0@rlsoy.h.filess.io:3307/DairyTrack_represent'
    # )


    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False