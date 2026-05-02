from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Candidate, Election, Vote, db
from utils.auth import role_required


election_bp = Blueprint("election", __name__)


def election_to_dict(election, current_user_id=None):
    total_votes = Vote.query.filter_by(election_id=election.id).count()
    has_voted = False
    if current_user_id:
        has_voted = Vote.query.filter_by(election_id=election.id, user_id=current_user_id).first() is not None

    return {
        "id": election.id,
        "title": election.title,
        "description": election.description,
        "start_date": election.start_date.isoformat(),
        "end_date": election.end_date.isoformat(),
        "status": election.status,
        "candidate_count": len(election.candidates),
        "total_votes": total_votes,
        "has_voted": has_voted,
        "candidates": [{"id": c.id, "name": c.name} for c in election.candidates],
    }


@election_bp.get("/elections")
@jwt_required(optional=True)
def list_elections():
    from flask_jwt_extended import get_jwt_identity

    identity = get_jwt_identity()
    current_user_id = int(identity) if identity else None
    elections = Election.query.order_by(Election.created_at.desc()).all()
    
    from models import User
    user = User.query.get(current_user_id) if current_user_id else None
    
    visible_elections = []
    if user and user.role == "admin":
        visible_elections = elections
    else:
        for e in elections:
            if not e.is_restricted:
                visible_elections.append(e)
            elif user and user in e.allowed_voters:
                visible_elections.append(e)
                
    return jsonify([election_to_dict(e, current_user_id) for e in visible_elections])


@election_bp.post("/create-election")
@role_required(["admin"])
def create_election():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not title or not start_date or not end_date:
        return jsonify({"error": "title, start_date, end_date are required"}), 400

    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use ISO format"}), 400

    if end <= start:
        return jsonify({"error": "End date must be after start date"}), 400

    election = Election(title=title, description=description, start_date=start, end_date=end, status="upcoming")
    db.session.add(election)
    db.session.commit()
    return jsonify({"message": "Election created", "election": election_to_dict(election)}), 201


@election_bp.post("/add-candidate")
@role_required(["admin"])
def add_candidate():
    data = request.get_json() or {}
    election_id = data.get("election_id")
    name = (data.get("name") or "").strip()

    if not election_id or not name:
        return jsonify({"error": "election_id and name are required"}), 400

    election = Election.query.get(election_id)
    if not election:
        return jsonify({"error": "Election not found"}), 404

    candidate = Candidate(name=name, election_id=election.id)
    db.session.add(candidate)
    db.session.commit()
    return jsonify({"message": "Candidate added", "candidate": {"id": candidate.id, "name": candidate.name}}), 201


@election_bp.post("/start-election")
@role_required(["admin"])
def start_election():
    data = request.get_json() or {}
    election_id = data.get("election_id")
    election = Election.query.get(election_id)
    if not election:
        return jsonify({"error": "Election not found"}), 404
    if len(election.candidates) < 2:
        return jsonify({"error": "Election needs at least 2 candidates"}), 400
    election.status = "active"
    db.session.commit()
    return jsonify({"message": "Election started"})


@election_bp.post("/end-election")
@role_required(["admin"])
def end_election():
    data = request.get_json() or {}
    election_id = data.get("election_id")
    election = Election.query.get(election_id)
    if not election:
        return jsonify({"error": "Election not found"}), 404
    election.status = "ended"
    db.session.commit()
    return jsonify({"message": "Election ended"})


@election_bp.delete("/delete-election/<int:election_id>")
@role_required(["admin"])
def delete_election(election_id):
    election = Election.query.get(election_id)
    if not election:
        return jsonify({"error": "Election not found"}), 404
    db.session.delete(election)
    db.session.commit()
    return jsonify({"message": "Election deleted"})
