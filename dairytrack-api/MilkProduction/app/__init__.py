import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import datetime
from flask_migrate import Migrate
from flask_cors import CORS
from flask.json import JSONEncoder
from decimal import Decimal

# Custom JSON Encoder
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # Konversi Decimal ke float
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder  # Gunakan custom JSON encoder

app.config['JWT_SECRET_KEY'] = 'tsth2'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://dairytrack_operation:c89d2e129b1b9d76b283c5989a33ef05f9cb88d2@d2pug.h.filess.io:61002/dairytrack_operation'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configure CORS
CORS(app, origins="*", allow_headers=["*"], methods=["GET", "POST", "PUT", "DELETE"])

from app.models import Farmer, Cow, RawMilk, Supervisor, Admin, daily_milk_total, blog, topicBlog, gallery,notification
from app.routes import farmers_bp, cows_bp, raw_milks_bp, supervisors_bp, admins_bp, auth_bp, blogs_bp, daily_milk_totals_bp, topic_blogs_bp, galleries_bp

app.register_blueprint(farmers_bp, url_prefix='/api')
app.register_blueprint(cows_bp, url_prefix='/api')
app.register_blueprint(raw_milks_bp, url_prefix='/api')
app.register_blueprint(supervisors_bp, url_prefix='/api')   
app.register_blueprint(admins_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(daily_milk_totals_bp, url_prefix='/api')
app.register_blueprint(blogs_bp, url_prefix='/api')
app.register_blueprint(galleries_bp, url_prefix='/api')
app.register_blueprint(topic_blogs_bp, url_prefix='/api')


    