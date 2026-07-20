# NovaLearn — E-Learning Platform

A full-stack e-learning platform built with **Express.js** (backend) and **vanilla HTML/CSS/JS** (frontend).

## Why JSON files instead of MongoDB?

This project uses JSON file storage (`fs` module) instead of a real database — a deliberate choice to keep the internship submission zero-config. No MongoDB, no Docker, no cloud setup needed.

## How to Run

```bash
cd server
npm install    # only needed once
npm run dev    # starts on http://localhost:5000
```

Then open `http://localhost:5000` in your browser (Express serves the frontend as static files).

## Folder Structure

```
task5-elearning-platform/
├── server/
│   ├── server.js
│   ├── routes/          # courses.js, auth.js, enrollments.js
│   ├── middleware/       # auth.js (JWT verification)
│   ├── data/             # JSON files (courses.json, users.json, enrollments.json)
│   ├── utils/            # fileDB.js (readJSON/writeJSON helpers)
│   └── package.json
├── public/
│   ├── index.html        # Home — course grid with search & filter
│   ├── course.html       # Course detail + enrollment
│   ├── login.html        # Login / Signup
│   ├── dashboard.html    # Enrolled courses with progress tracking
│   ├── css/style.css
│   └── js/               # home.js, course.js, auth.js, dashboard.js
└── README.md
```

## Features

- Browse courses by category or search
- View course details with lesson list
- Signup / Login with JWT auth
- Enroll in courses
- Track progress — mark lessons complete
- Dark/light theme support
