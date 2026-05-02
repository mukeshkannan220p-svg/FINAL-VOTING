from datetime import datetime

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

election_voters = db.Table('election_voters',
    db.Column('election_id', db.Integer, db.ForeignKey('elections.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="voter")
    status = db.Column(db.String(20), nullable=False, default="active")
    id_number = db.Column(db.String(50), nullable=True)
    approval_status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    votes = db.relationship("Vote", backref="user", lazy=True, cascade="all, delete-orphan")


class Election(db.Model):
    __tablename__ = "elections"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="upcoming")
    is_restricted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    candidates = db.relationship("Candidate", backref="election", lazy=True, cascade="all, delete-orphan")
    votes = db.relationship("Vote", backref="election", lazy=True, cascade="all, delete-orphan")
    allowed_voters = db.relationship('User', secondary=election_voters, lazy='subquery', backref=db.backref('assigned_elections', lazy=True))


class Candidate(db.Model):
    __tablename__ = "candidates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    party = db.Column(db.String(120), nullable=True)
    image = db.Column(db.String(255), nullable=True)
    election_id = db.Column(db.Integer, db.ForeignKey("elections.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    votes = db.relationship("Vote", backref="candidate", lazy=True, cascade="all, delete-orphan")


class Vote(db.Model):
    __tablename__ = "votes"
    __table_args__ = (db.UniqueConstraint("user_id", "election_id", name="uq_user_election_vote"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    election_id = db.Column(db.Integer, db.ForeignKey("elections.id"), nullable=False, index=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidates.id"), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True) # Null for admin broadcast
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False, default="info") # e.g., 'approval', 'election'
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("User", backref=db.backref("notifications", lazy=True, cascade="all, delete-orphan"))

