from datetime import datetime

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity

from models import Election, User, Vote
from utils.auth import role_required


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard/stats")
@role_required(["admin", "voter"])
def dashboard_stats():
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    elections = Election.query.all()
    total_elections = len(elections)
    active_elections = [e for e in elections if e.status == "active"]
    ended_elections = [e for e in elections if e.status == "ended"]

    if role == "admin":
        return jsonify(
            {
                "role": "admin",
                "total_users": User.query.filter_by(role="voter").count(),
                "total_elections": total_elections,
                "active_elections": len(active_elections),
                "ended_elections": len(ended_elections),
                "total_votes": Vote.query.count(),
            }
        )

    completed_votes = Vote.query.filter_by(user_id=user_id).count()
    pending_votes = max(len(active_elections) - completed_votes, 0)
    return jsonify(
        {
            "role": "voter",
            "total_elections": total_elections,
            "active_elections": len(active_elections),
            "votes_completed": completed_votes,
            "pending_votes": pending_votes,
            "voting_status": "Completed" if pending_votes == 0 else "Pending",
        }
    )


@dashboard_bp.get("/recent-activity")
@role_required(["admin", "voter"])
def recent_activity():
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    activities = []
    if role == "admin":
        latest_votes = Vote.query.order_by(Vote.timestamp.desc()).limit(10).all()
        for vote in latest_votes:
            activities.append(
                {
                    "type": "vote",
                    "message": f"{vote.user.name} voted in {vote.election.title}",
                    "timestamp": vote.timestamp.isoformat(),
                }
            )
    else:
        my_votes = Vote.query.filter_by(user_id=user_id).order_by(Vote.timestamp.desc()).limit(10).all()
        for vote in my_votes:
            activities.append(
                {
                    "type": "my_vote",
                    "message": f"You voted for {vote.candidate.name} in {vote.election.title}",
                    "timestamp": vote.timestamp.isoformat(),
                }
            )

    if not activities:
        activities.append(
            {
                "type": "system",
                "message": "No recent activity yet",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    return jsonify(activities)
