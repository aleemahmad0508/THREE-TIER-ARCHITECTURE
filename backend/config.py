import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# ensure instance folder exists
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'data.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False