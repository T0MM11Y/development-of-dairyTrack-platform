import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    DEBUG = os.environ.get('FLASK_DEBUG') or False
    TESTING = os.environ.get('FLASK_TESTING') or False
    # local development
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@localhost/dairytrack_massfortso' 
    
    # production
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or (
    #     'mysql+pymysql://dairytrackMassforsto_character:374a5a8be6c30f986befad6edbb60559355f68fc@yiy37.h.filess.io:61002/dairytrackMassforsto_character'
    # )


    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False