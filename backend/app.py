import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import firebase_admin
from firebase_admin import credentials, auth as admin_auth


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

API_KEY = required_env["FIREBASE_API_KEY"]
DATABASE_URL = required_env["FIREBASE_DATABASE_URL"].rstrip("/")

app.secret_key = required_env["SECRET_KEY"]

ALLOWED_PROFILE_FIELDS = {"name", "firstName", "age", "email", "pseudo", "gender"}


def _initialize_firebase_admin():
    try:
        if not firebase_admin._apps:
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if service_account_path:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})
            else:
                firebase_admin.initialize_app(options={"databaseURL": DATABASE_URL})
        return True
    except Exception:
        return False


firebase_admin_ready = _initialize_firebase_admin()


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


def _firebase_auth_request(endpoint, payload=None, method="POST"):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:{endpoint}?key={API_KEY}"
    response = requests.request(method, url, json=payload, timeout=20)
    data = response.json() if response.content else {}

    if response.status_code >= 400:
        message = data.get("error", {}).get("message", "Firebase request failed")
        raise RuntimeError(message)

    return data


def _lookup_user(token):
    return _firebase_auth_request("lookup", {"idToken": token}, method="POST")


def _database_request(path, method="GET", payload=None, token=None):
    url = f"{DATABASE_URL}/{path.lstrip('/')}".rstrip("/") + ".json"
    params = {"auth": token} if token else None
    response = requests.request(method, url, params=params, json=payload, timeout=20)
    try:
        data = response.json() if response.content else None
    except ValueError:
        data = response.text

    if response.status_code >= 400:
        raise RuntimeError(f"Database request failed: {response.status_code} {data}")

    return data


def _user_id_from_token(token):
    if firebase_admin_ready:
        try:
            decoded = admin_auth.verify_id_token(token)
            return decoded.get("uid")
        except Exception:
            pass

    user_info = _lookup_user(token)
    users = user_info.get("users") or []
    if not users:
        raise RuntimeError("User not found")
    return users[0].get("localId")


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"status": "fail", "message": "Email et mot de passe requis."}), 400

    try:
        user = _firebase_auth_request(
            "signInWithPassword",
            {"email": email, "password": password, "returnSecureToken": True},
            method="POST",
        )
        return jsonify({
            "status": "success",
            "user": {"localId": user.get("localId")},
            "token": user.get("idToken"),
        }), 200
    except Exception:
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
        user = _firebase_auth_request(
            "signUp",
            {"email": email, "password": password, "returnSecureToken": True},
            method="POST",
        )
        user_id = user["localId"]
        id_token = user["idToken"]

        profile_data = {
            'name': name,
            'firstName': firstName,
            'age': age,
            'email': email,
            'pseudo': pseudo,
            'gender': gender,
        }
        _database_request(f"users/{user_id}", method="PUT", payload=sanitize_profile_data(profile_data), token=id_token)

        login_user = _firebase_auth_request(
            "signInWithPassword",
            {"email": email, "password": password, "returnSecureToken": True},
            method="POST",
        )
        return jsonify({
            "status": "success",
            "user": {"localId": user_id},
            "token": login_user.get("idToken"),
        }), 200

    except RuntimeError as exc:
        message = str(exc)
        if 'EMAIL_EXISTS' in message:
            return jsonify({"status": "fail", "message": "Un compte avec cet email existe déjà."}), 400
        if 'WEAK_PASSWORD' in message:
            return jsonify({"status": "fail", "message": "Le mot de passe doit comporter au moins 6 caractères."}), 400
        if 'INVALID_EMAIL' in message:
            return jsonify({"status": "fail", "message": "Veuillez saisir une adresse mail valide."}), 400
        return jsonify({"status": "fail", "message": "Une erreur inattendue s'est produite. Veuillez réessayer."}), 500
    except Exception:
        return jsonify({"status": "fail", "message": "Une erreur inattendue s'est produite. Veuillez réessayer."}), 500


@app.route('/profile', methods=['GET'])
def get_profile():
    token = get_token_from_request()
    if not token:
        return jsonify({"error": "Authentication required."}), 401

    try:
        user_id = _user_id_from_token(token)
        user_data = _database_request(f"users/{user_id}", method="GET", token=token)
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
        user_id = _user_id_from_token(token)
        updated_data = sanitize_profile_data(request.get_json(silent=True) or {})

        if not updated_data:
            return jsonify({"error": "No valid profile fields provided."}), 400

        _database_request(f"users/{user_id}", method="PATCH", payload=updated_data, token=token)
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception:
        return jsonify({"error": "Invalid token or update failed."}), 401


@app.route('/verify-token', methods=['POST'])
def verify_token():
    token = get_token_from_request()
    if not token:
        return jsonify({"status": "fail", "message": "Token is required."}), 401

    try:
        user_id = _user_id_from_token(token)
        return jsonify({"status": "success", "user_id": user_id}), 200
    except Exception:
        return jsonify({"status": "fail", "message": "Invalid or expired token."}), 401


@app.route('/', methods=['GET'])
def index():
    return "hello world"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

