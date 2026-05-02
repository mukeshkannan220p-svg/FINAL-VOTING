from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from models import Candidate, Election, Vote, db
from utils.auth import role_required


voting_bp = Blueprint("voting", __name__)


@voting_bp.post("/vote")
@role_required(["voter"])
def cast_vote():
    data = request.get_json() or {}
    election_id = data.get("election_id")
    candidate_id = data.get("candidate_id")
    user_id = int(get_jwt_identity())

    if not election_id or not candidate_id:
        return jsonify({"error": "election_id and candidate_id are required"}), 400

    election = Election.query.get(election_id)
    if not election:
        return jsonify({"error": "Election not found"}), 404
    if election.status != "active":
        return jsonify({"error": "Election is not active"}), 400

    candidate = Candidate.query.get(candidate_id)
    if not candidate or candidate.election_id != election.id:
        return jsonify({"error": "Invalid candidate"}), 400

    existing_vote = Vote.query.filter_by(user_id=user_id, election_id=election.id).first()
    if existing_vote:
        return jsonify({"error": "You have already voted in this election"}), 409

    vote = Vote(user_id=user_id, election_id=election.id, candidate_id=candidate.id)
    db.session.add(vote)
    db.session.commit()
    return jsonify({"message": "Vote submitted successfully"})


@voting_bp.get("/results")
@role_required(["admin", "voter"])
def election_results():
    election_id = request.args.get("election_id", type=int)
    if not election_id:
        return jsonify({"error": "election_id query parameter is required"}), 400

    election = Election.query.get(election_id)
    if not election:
        return jsonify({"error": "Election not found"}), 404

    result_rows = []
    max_votes = 0
    for candidate in election.candidates:
        votes = Vote.query.filter_by(election_id=election.id, candidate_id=candidate.id).count()
        if votes > max_votes:
            max_votes = votes
        result_rows.append({"candidate_id": candidate.id, "candidate_name": candidate.name, "votes": votes})

    winners = [r["candidate_name"] for r in result_rows if r["votes"] == max_votes and max_votes > 0]
    return jsonify(
        {
            "election": {"id": election.id, "title": election.title, "status": election.status},
            "results": result_rows,
            "total_votes": sum(r["votes"] for r in result_rows),
            "winner": winners,
        }
    )
