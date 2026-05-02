from datetime import datetime, timedelta

import bcrypt
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import Announcement, Candidate, Election, User, Vote, db
from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp
from routes.election_routes import election_bp
from routes.voting_routes import voting_bp
from routes.admin_routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/*": {"origins": "*"}})
    JWTManager(app)
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(election_bp)
    app.register_blueprint(voting_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(admin_bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "CloudVote API"})

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    with app.app_context():
        db.create_all()
        seed_data()

    return app


def seed_data():
    admin_email = "admin@cloudvote.com"
    if User.query.filter_by(email=admin_email).first():
        return

    admin = User(
        name="CloudVote Admin",
        email=admin_email,
        password=bcrypt.hashpw("Admin@123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        role="admin",
        id_number="ADMIN",
        approval_status="approved"
    )
    voter1 = User(
        name="Aarav Sharma",
        email="aarav@cloudvote.com",
        password=bcrypt.hashpw("Voter@123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        role="voter",
        id_number="CSE-001",
        approval_status="approved"
    )
    voter2 = User(
        name="Diya Patel",
        email="diya@cloudvote.com",
        password=bcrypt.hashpw("Voter@123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        role="voter",
        id_number="CSE-002",
        approval_status="approved"
    )
    db.session.add_all([admin, voter1, voter2])
    db.session.flush()

    now = datetime.utcnow()
    election = Election(
        title="Student Council Election 2026",
        description="Vote for your preferred council lead.",
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=2),
        status="active",
    )
    db.session.add(election)
    db.session.flush()

    candidates = [
        Candidate(name="Priya Nair", party="Progressive Party", election_id=election.id),
        Candidate(name="Rahul Verma", party="Liberty Front", election_id=election.id),
        Candidate(name="Sneha Iyer", party="Democratic Alliance", election_id=election.id),
    ]
    db.session.add_all(candidates)
    db.session.flush()

    announcement = Announcement(
        message="Welcome to CloudVote! The Student Council Election 2026 is now live."
    )
    db.session.add(announcement)

    db.session.commit()


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
