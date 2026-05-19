# Secure Web-Based Voting System

Secure Web-Based Voting System is a full-stack online voting system built for a cloud computing mini project with real backend APIs, role-based authentication, live election workflows, and database-backed analytics.

## Tech Stack

- Frontend: React + Vite, Tailwind CSS, React Router, Axios, Framer Motion, Chart.js
- Backend: Flask, Flask-CORS, Flask-JWT-Extended, SQLAlchemy, bcrypt
- Database: SQLite (local)

## Project Structure

```text
cloudvote/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── config.py
│   ├── requirements.txt
│   ├── routes/
│   ├── utils/
│   └── database.db
└── README.md
```

## Local Setup and Run

### 1) Backend installation

```bash
cd cloudvote/backend
python -m pip install -r requirements.txt
```

### 2) Frontend installation

```bash
cd ../frontend
npm install
```

### 3) Database setup

Database is auto-created by Flask on first app startup in `backend/database.db`.

### 4) Run backend

```bash
cd ../backend
python app.py
```

Backend runs at `http://127.0.0.1:5000`.

### 5) Run frontend

```bash
cd ../frontend
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

### 6) Test login credentials

- Admin:
  - Email: `admin@cloudvote.com`
  - Password: `Admin@123`
- Voter 1:
  - Email: `aarav@cloudvote.com`
  - Password: `Voter@123`
- Voter 2:
  - Email: `diya@cloudvote.com`
  - Password: `Voter@123`

### 7) Test voting flow

1. Login as admin and verify election/candidates are present.
2. Start or manage elections from admin dashboard.
3. Login as voter.
4. Open active election and cast vote.
5. Retry vote in same election to confirm duplicate prevention.
6. Open results page and verify pie/bar charts update with real data.

## API Endpoints

### Authentication

- `POST /register`
- `POST /login`
- `POST /admin/login`

### Election

- `GET /elections`
- `POST /create-election`
- `POST /add-candidate`
- `POST /start-election`
- `POST /end-election`
- `DELETE /delete-election/<election_id>`

### Voting

- `POST /vote`
- `GET /results?election_id=<id>`

### Dashboard

- `GET /dashboard/stats`
- `GET /recent-activity`

## AWS Deployment Steps (After Local Validation)

### Frontend -> AWS S3

1. Build frontend: `npm run build`
2. Create S3 bucket with static website hosting enabled.
3. Upload contents of `frontend/dist` to S3.
4. Set bucket policy for public read or use CloudFront + OAC for secure setup.
5. Configure API base URL in frontend to EC2 domain.

### Backend -> AWS EC2

1. Launch EC2 instance (Ubuntu/Amazon Linux).
2. Install Python, pip, and Git.
3. Clone project and install backend requirements.
4. Use `gunicorn` to run Flask app:
   - `gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()`
5. Configure Nginx reverse proxy.
6. Open security group ports (80/443).
7. Add SSL with Let's Encrypt (certbot).

### Database -> AWS RDS

1. Create an RDS instance (MySQL or PostgreSQL recommended).
2. Update `SQLALCHEMY_DATABASE_URI` in `backend/config.py` using RDS connection string.
3. Run migration/setup scripts to create tables and seed required records.
4. Restrict RDS access to EC2 security group only.

## Security Notes

- Passwords hashed with bcrypt.
- JWT-based auth with role claims.
- Admin-only endpoints protected using role-based middleware.
- Duplicate vote prevention enforced by API checks and DB unique constraint.
