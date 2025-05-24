import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    TESTING = os.environ.get('FLASK_TESTING') or False
    # local development
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@localhost/dairytrack_massfortso' 
    
    # production
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or (
    #     'mysql+pymysql://DairyTrack_massfortso:87237ffa17d18f91ba46b6ba67ac1cc35160d14b@x6lpm.h.filess.io:61002/DairyTrack_massfortso'
    # )


    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False