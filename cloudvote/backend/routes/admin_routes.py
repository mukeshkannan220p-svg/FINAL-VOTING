from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Announcement, Candidate, Election, User, Vote, Notification, db
from utils.decorators import admin_required
import csv
import io
import bcrypt
import openpyxl

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# --- Dashboard & Analytics ---

@admin_bp.get("/dashboard-stats")
@jwt_required()
@admin_required()
def get_dashboard_stats():
    total_elections = Election.query.count()
    active_elections = Election.query.filter_by(status="active").count()
    total_votes = Vote.query.count()
    registered_voters = User.query.filter_by(role="voter").count()
    pending_approvals = User.query.filter_by(role="voter", approval_status="pending").count()
    approved_voters = User.query.filter_by(role="voter", approval_status="approved").count()

    return jsonify(
        {
            "totalElections": total_elections,
            "activeElections": active_elections,
            "totalVotes": total_votes,
            "registeredVoters": registered_voters,
            "pendingApprovals": pending_approvals,
            "approvedVoters": approved_voters,
        }
    )

# --- Elections ---

@admin_bp.get("/elections")
@jwt_required()
@admin_required()
def get_all_elections():
    elections = Election.query.order_by(Election.created_at.desc()).all()
    result = []
    for el in elections:
        total_votes = len(el.votes)
        result.append(
            {
                "id": el.id,
                "title": el.title,
                "description": el.description,
                "startDate": el.start_date.isoformat(),
                "endDate": el.end_date.isoformat(),
                "status": el.status,
                "totalVotes": total_votes,
            }
        )
    return jsonify(result)

@admin_bp.post("/elections")
@jwt_required()
@admin_required()
def create_election():
    data = request.get_json()
    try:
        start_date = datetime.fromisoformat(data["startDate"].replace("Z", "+00:00"))
        end_date = datetime.fromisoformat(data["endDate"].replace("Z", "+00:00"))
        
        election = Election(
            title=data["title"],
            description=data.get("description", ""),
            start_date=start_date,
            end_date=end_date,
            status=data.get("status", "upcoming"),
        )
        db.session.add(election)
        db.session.commit()
        return jsonify({"message": "Election created successfully", "id": election.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.post("/elections/<int:election_id>/start")
@jwt_required()
@admin_required()
def start_election(election_id):
    election = Election.query.get_or_404(election_id)
    election.status = "active"
    db.session.commit()
    return jsonify({"message": "Election started"})

@admin_bp.post("/elections/<int:election_id>/end")
@jwt_required()
@admin_required()
def end_election(election_id):
    election = Election.query.get_or_404(election_id)
    election.status = "completed"
    db.session.commit()
    return jsonify({"message": "Election ended"})

@admin_bp.delete("/elections/<int:election_id>")
@jwt_required()
@admin_required()
def delete_election(election_id):
    election = Election.query.get_or_404(election_id)
    db.session.delete(election)
    db.session.commit()
    return jsonify({"message": "Election deleted"})

@admin_bp.post("/elections/<int:election_id>/assign-voters")
@jwt_required()
@admin_required()
def assign_voters_to_election(election_id):
    election = Election.query.get_or_404(election_id)
    data = request.get_json() or {}
    
    # If isRestricted is provided, update it
    if "isRestricted" in data:
        election.is_restricted = data["isRestricted"]
        
    voter_ids = data.get("voterIds")
    if voter_ids is not None:
        # Fetch users
        users = User.query.filter(User.id.in_(voter_ids), User.role == 'voter').all()
        election.allowed_voters = users
        
    db.session.commit()
    return jsonify({"message": "Election access updated"})

# --- Candidates ---

@admin_bp.get("/candidates")
@jwt_required()
@admin_required()
def get_all_candidates():
    candidates = Candidate.query.all()
    result = [
        {
            "id": c.id,
            "name": c.name,
            "party": c.party,
            "image": c.image,
            "electionId": c.election_id,
            "electionTitle": c.election.title,
        }
        for c in candidates
    ]
    return jsonify(result)

@admin_bp.post("/candidates")
@jwt_required()
@admin_required()
def add_candidate():
    data = request.get_json()
    try:
        candidate = Candidate(
            name=data["name"],
            party=data.get("party"),
            image=data.get("image"),
            election_id=data["electionId"]
        )
        db.session.add(candidate)
        db.session.commit()
        return jsonify({"message": "Candidate added successfully", "id": candidate.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.delete("/candidates/<int:candidate_id>")
@jwt_required()
@admin_required()
def delete_candidate(candidate_id):
    candidate = Candidate.query.get_or_404(candidate_id)
    db.session.delete(candidate)
    db.session.commit()
    return jsonify({"message": "Candidate deleted"})

# --- Voters ---

@admin_bp.get("/voters")
@jwt_required()
@admin_required()
def get_all_voters():
    approval_status = request.args.get("approval_status")
    query = User.query.filter_by(role="voter")
    if approval_status:
        query = query.filter_by(approval_status=approval_status)
    voters = query.all()
    
    result = []
    for v in voters:
        result.append({
            "id": v.id,
            "name": v.name,
            "email": v.email,
            "id_number": v.id_number,
            "status": v.status,
            "approval_status": v.approval_status,
            "votesCast": len(v.votes),
            "createdAt": v.created_at.isoformat()
        })
    return jsonify(result)

@admin_bp.post("/voters/<int:user_id>/approve")
@jwt_required()
@admin_required()
def approve_voter(user_id):
    user = User.query.get_or_404(user_id)
    if user.role != "voter":
        return jsonify({"error": "Can only approve voters"}), 400
    user.approval_status = "approved"
    
    notif = Notification(user_id=user.id, message="Your account has been approved. You can now log in and vote.", type="approval")
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({"message": f"User {user.email} approved"})

@admin_bp.post("/voters/<int:user_id>/reject")
@jwt_required()
@admin_required()
def reject_voter(user_id):
    user = User.query.get_or_404(user_id)
    if user.role != "voter":
        return jsonify({"error": "Can only reject voters"}), 400
    user.approval_status = "rejected"
    db.session.commit()
    return jsonify({"message": f"User {user.email} rejected"})

@admin_bp.post("/upload-voters")
@jwt_required()
@admin_required()
def upload_voters():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        created_users = []
        errors = []
        default_password = "vote123"
        hashed_password = bcrypt.hashpw(default_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        rows_data = []
        try:
            if file.filename.endswith('.csv'):
                stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
                csv_input = csv.DictReader(stream)
                rows_data = list(csv_input)
            elif file.filename.endswith('.xlsx'):
                wb = openpyxl.load_workbook(file)
                sheet = wb.active
                headers = [str(cell.value) if cell.value is not None else "" for cell in sheet[1]]
                
                for row in sheet.iter_rows(min_row=2, values_only=True):
                    # Only process if there's at least some data in the row
                    if any(cell is not None for cell in row):
                        row_dict = dict(zip(headers, row))
                        rows_data.append(row_dict)
        except Exception as e:
            return jsonify({"error": f"Failed to parse file: {str(e)}"}), 400
            
        for row in rows_data:
            name = row.get("Name") or row.get("name")
            email = row.get("Email") or row.get("email")
            id_number = row.get("ID Number") or row.get("id_number") or row.get("IDNumber")
            
            if not name or not email or not id_number:
                errors.append(f"Missing fields for row: {row}")
                continue
                
            email = email.strip().lower()
            if User.query.filter_by(email=email).first():
                errors.append(f"Email {email} already exists")
                continue
            if User.query.filter_by(id_number=id_number).first():
                errors.append(f"ID Number {id_number} already exists")
                continue
                
            user = User(
                name=name, 
                email=email, 
                password=hashed_password, 
                role="voter", 
                id_number=id_number,
                approval_status="approved"
            )
            db.session.add(user)
            created_users.append({"name": name, "email": email, "id_number": id_number, "password": default_password})
            
        db.session.commit()
        return jsonify({
            "message": f"Successfully imported {len(created_users)} voters.",
            "users": created_users,
            "errors": errors
        })
    return jsonify({"error": "Invalid file format. Please upload a CSV or Excel (.xlsx) file."}), 400

@admin_bp.post("/voters/<int:user_id>/block")
@jwt_required()
@admin_required()
def block_voter(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == "admin":
        return jsonify({"error": "Cannot block an admin"}), 400
    user.status = "blocked"
    db.session.commit()
    return jsonify({"message": f"User {user.email} blocked"})

@admin_bp.post("/voters/<int:user_id>/unblock")
@jwt_required()
@admin_required()
def unblock_voter(user_id):
    user = User.query.get_or_404(user_id)
    user.status = "active"
    db.session.commit()
    return jsonify({"message": f"User {user.email} unblocked"})

# --- Announcements ---

@admin_bp.get("/announcements")
def get_announcements():
    # Anyone can view announcements
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify([{"id": a.id, "message": a.message, "createdAt": a.created_at.isoformat()} for a in announcements])

@admin_bp.post("/announcements")
@jwt_required()
@admin_required()
def create_announcement():
    data = request.get_json()
    if not data or not data.get("message"):
        return jsonify({"error": "Message is required"}), 400
    
    announcement = Announcement(message=data["message"])
    db.session.add(announcement)
    db.session.commit()
    return jsonify({"message": "Announcement created"}), 201

# --- Live Voting & Results ---

@admin_bp.get("/elections/<int:election_id>/live")
@jwt_required()
@admin_required()
def get_live_election_data(election_id):
    election = Election.query.get_or_404(election_id)
    
    candidates_data = []
    for c in election.candidates:
        candidates_data.append({
            "id": c.id,
            "name": c.name,
            "party": c.party,
            "votes": len(c.votes)
        })
        
    return jsonify({
        "id": election.id,
        "title": election.title,
        "status": election.status,
        "totalVotes": len(election.votes),
        "candidates": candidates_data
    })
