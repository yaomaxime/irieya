import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import pyrebase


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:19006,http://localhost:3000").split(",")
    if origin.strip()
]
CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

required_env = {
    "FIREBASE_API_KEY": os.getenv("FIREBASE_API_KEY"),
    "FIREBASE_AUTH_DOMAIN": os.getenv("FIREBASE_AUTH_DOMAIN"),
    "FIREBASE_PROJECT_ID": os.getenv("FIREBASE_PROJECT_ID"),
    "FIREBASE_STORAGE_BUCKET": os.getenv("FIREBASE_STORAGE_BUCKET"),
    "FIREBASE_MESSAGING_SENDER_ID": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
    "FIREBASE_APP_ID": os.getenv("FIREBASE_APP_ID"),
    "FIREBASE_DATABASE_URL": os.getenv("FIREBASE_DATABASE_URL"),
    "SECRET_KEY": os.getenv("SECRET_KEY"),
}
missing = [key for key, value in required_env.items() if not value]
if missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

config = {
    "apiKey": required_env["FIREBASE_API_KEY"],
    "authDomain": required_env["FIREBASE_AUTH_DOMAIN"],
    "projectId": required_env["FIREBASE_PROJECT_ID"],
    "storageBucket": required_env["FIREBASE_STORAGE_BUCKET"],
    "messagingSenderId": required_env["FIREBASE_MESSAGING_SENDER_ID"],
    "appId": required_env["FIREBASE_APP_ID"],
    "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID"),
    "databaseURL": required_env["FIREBASE_DATABASE_URL"],
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()
db = firebase.database()

app.secret_key = required_env["SECRET_KEY"]

ALLOWED_PROFILE_FIELDS = {"name", "firstName", "age", "email", "pseudo", "gender"}


def get_token_from_request():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()

    data = request.get_json(silent=True) or {}
    return data.get("token")


def sanitize_profile_data(data):
    if not isinstance(data, dict):
        return {}
    return {key: value for key, value in data.items() if key in ALLOWED_PROFILE_FIELDS and value is not None}


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"status": "fail", "message": "Email et mot de passe requis."}), 400

    try:
        user = auth.sign_in_with_email_and_password(email, password)
        id_token = user.get('idToken')
        return jsonify({"status": "success", "user": {"localId": user.get("localId")}, "token": id_token}), 200
    except Exception as e:
        return jsonify({"status": "fail", "message": "mot de passe incorrect ou e-mail incorrect"}), 401


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}

    email = (data.get('email') or '').strip()
    password = data.get('password') or ''
    age = data.get('age')
    name = data.get('name')
    firstName = data.get('firstName')
    pseudo = data.get('pseudo')
    gender = data.get('gender')

    if not email or not password:
        return jsonify({"status": "fail", "message": "Email et mot de passe requis."}), 400

    try:
        user = auth.create_user_with_email_and_password(email, password)
        user_id = user['localId']

        profile_data = {
            'name': name,
            'firstName': firstName,
            'age': age,
            'email': email,
            'pseudo': pseudo,
            'gender': gender,
        }
        db.child("users").child(user_id).set(sanitize_profile_data(profile_data))

        login_user = auth.sign_in_with_email_and_password(email, password)
        id_token = login_user.get('idToken')

        return jsonify({"status": "success", "user": {"localId": user_id}, "token": id_token}), 200

    except Exception as e:
        error_message = str(e)

        if 'EMAIL_EXISTS' in error_message:
            return jsonify({"status": "fail", "message": "Un compte avec cet email existe déjà."}), 400
        elif 'WEAK_PASSWORD' in error_message:
            return jsonify({"status": "fail", "message": "Le mot de passe doit comporter au moins 6 caractères."}), 400
        elif 'INVALID_EMAIL' in error_message:
            return jsonify({"status": "fail", "message": "Veuillez saisir une adresse mail valide."}), 400
        else:
            return jsonify({"status": "fail", "message": "Une erreur inattendue s'est produite. Veuillez réessayer."}), 500


@app.route('/profile', methods=['GET'])
def get_profile():
    token = get_token_from_request()
    if not token:
        return jsonify({"error": "Authentication required."}), 401

    try:
        user_info = auth.get_account_info(token)
        user_id = user_info['users'][0]['localId']
        user_data = db.child("users").child(user_id).get().val()

        if user_data:
            return jsonify(user_data), 200
        return jsonify({"error": "User not found"}), 404
    except Exception:
        return jsonify({"error": "Invalid token."}), 401


@app.route('/profile', methods=['PUT'])
def update_profile():
    token = get_token_from_request()
    if not token:
        return jsonify({"error": "Authentication required."}), 401

    try:
        user_info = auth.get_account_info(token)
        user_id = user_info['users'][0]['localId']
        updated_data = sanitize_profile_data(request.get_json(silent=True) or {})

        if not updated_data:
            return jsonify({"error": "No valid profile fields provided."}), 400

        db.child("users").child(user_id).update(updated_data)
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception:
        return jsonify({"error": "Invalid token or update failed."}), 401


@app.route('/verify-token', methods=['POST'])
def verify_token():
    token = get_token_from_request()
    if not token:
        return jsonify({"status": "fail", "message": "Token is required."}), 401

    try:
        user_info = auth.get_account_info(token)
        user_id = user_info['users'][0]['localId']
        return jsonify({"status": "success", "user_id": user_id}), 200
    except Exception:
        return jsonify({"status": "fail", "message": "Invalid or expired token."}), 401


@app.route('/', methods=['GET'])
def index():
    return "hello world"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)

