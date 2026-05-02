import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from models import User, db


auth_bp = Blueprint("auth", __name__)


def _issue_token(user):
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "email": user.email, "name": user.name},
    )
    return token


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    id_number = (data.get("id_number") or "").strip()

    if not name or not email or not password or not id_number:
        return jsonify({"error": "Name, email, password and ID number are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
        
    if User.query.filter_by(id_number=id_number).first():
        return jsonify({"error": "ID number already registered"}), 409

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(name=name, email=email, password=hashed_password, role="voter", id_number=id_number, approval_status="pending")
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful. Your account is pending admin approval."}), 201


@auth_bp.post("/login")
def voter_login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email, role="voter").first()
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        return jsonify({"error": "Invalid voter credentials"}), 401

    if user.status == "blocked":
        return jsonify({"error": "Your account has been blocked by the administrator."}), 403

    if user.approval_status == "pending":
        return jsonify({"error": "Your account is still pending admin approval."}), 403
        
    if user.approval_status == "rejected":
        return jsonify({"error": "Your registration request was rejected."}), 403

    token = _issue_token(user)
    return jsonify({"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "status": user.status, "approval_status": user.approval_status, "id_number": user.id_number}})


@auth_bp.post("/admin/login")
def admin_login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email, role="admin").first()
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        return jsonify({"error": "Invalid admin credentials"}), 401

    if user.status == "blocked":
        return jsonify({"error": "Your account has been blocked."}), 403

    token = _issue_token(user)
    return jsonify({"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "status": user.status}})
