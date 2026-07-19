# E-Learning Platform — NovaStack Hub Internship (Task 5)

A full-stack MERN e-learning platform with course management, user authentication, and a protected dashboard.

## Features
- Home page with course listing (fetched from API)
- Course detail page with enrollment CTA
- User signup/login with JWT authentication
- Protected dashboard to add, edit, delete courses
- Responsive dark-theme UI with Tailwind CSS

## Tech Stack
- **Frontend:** React 18, React Router 6, Tailwind CSS, Vite
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs

## How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Server
```bash
cd server
npm install
# Copy and configure environment variables
cp ../.env.example ../.env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server on `http://localhost:5000`.

## Environment Variables (`.env`)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default 5000) |
