from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class APIData(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    response = db.Column(db.JSON, nullable=False)
    status_code = db.Column(db.Integer, nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        index=True
    )