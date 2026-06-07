from flask import Flask, request, jsonify
from models import db, APIData
import requests
import time
import threading

from flask_cors import CORS
from dotenv import load_dotenv
from config import Config
from sqlalchemy.exc import OperationalError

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)


# 🚀 FIX: Safe DB initialization (prevents crash)
with app.app_context():
    max_retries = 10

    for i in range(max_retries):
        try:
            db.create_all()
            print("✅ Database connected & tables created")
            break
        except OperationalError:
            print(f"⏳ DB not ready, retrying... ({i+1}/{max_retries})")
            time.sleep(3)


@app.route("/")
def home():
    return jsonify({"message": "PostgreSQL API Caller Running 🚀"})


def call_api_task(url, frequency, duration):
    if frequency <= 0 or duration <= 0:
        return

    total_calls = frequency * duration
    delay = 60 / frequency

    for i in range(total_calls):
        try:
            res = requests.get(url, timeout=10)

            with app.app_context():
                new_data = APIData(
                    response=(
                        res.json()
                        if "application/json" in res.headers.get("Content-Type", "")
                        else {"text": res.text}
                    ),
                    status_code=res.status_code
                )
                db.session.add(new_data)
                db.session.commit()

            app.logger.info(f"Call {i+1}/{total_calls}")

        except Exception as e:
            app.logger.error(f"Error: {str(e)}")

        if i < total_calls - 1:
            time.sleep(delay)


@app.route("/start", methods=["POST"])
def start_calls():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input provided"}), 400

    try:
        url = data["url"]
        frequency = int(data["frequency"])
        duration = int(data["duration"])
    except:
        return jsonify({"error": "Invalid input"}), 400

    thread = threading.Thread(
        target=call_api_task,
        args=(url, frequency, duration),
        daemon=True
    )
    thread.start()

    return jsonify({"message": "API calling started"})


@app.route("/data", methods=["GET"])
def get_data():
    records = APIData.query.order_by(APIData.created_at.desc()).limit(100).all()

    return jsonify([
        {
            "id": r.id,
            "response": r.response,
            "status_code": r.status_code,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for r in records
    ])


@app.route("/clear", methods=["DELETE"])
def clear_data():
    APIData.query.delete()
    db.session.commit()
    return jsonify({"message": "Cleared"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)