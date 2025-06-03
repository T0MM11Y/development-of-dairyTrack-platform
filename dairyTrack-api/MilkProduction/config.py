import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    TESTING = os.environ.get('FLASK_TESTING') or False
    # local development
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@127.0.0.1/dairy_track' 
    
     # production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or (
        'mysql+pymysql://DairyTrackMassfortso_machinefed:4c95497bb9c564ed5490f31089168ae5eb6a65cf@onsrd.h.filess.io:3307/DairyTrackMassfortso_machinefed'
    )


    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False