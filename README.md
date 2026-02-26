# Leavify - Employee Leave Management System

Leavify is a complete, production-ready MERN stack application for managing employee leave requests. It simulates a corporate HR workflow with role-based access control, a modern UI built with Vite and Tailwind CSS, and a robust RESTful API.

![Leavify Theme](https://via.placeholder.com/800x400.png?text=Leavify+-+Modern+HR+SaaS)

## Features
- **Role-Based Access Control**: Secure routes for `Admin`, `Manager`, and `Employee` roles.
- **Authentication**: JWT-based secure login and registration.
- **Employee Portal**: Apply for leaves, view leave history, and track request statuses.
- **Manager Dashboard**: Review, approve, and reject leave applications from team members.
- **Admin Panel**: Global view of all company leaves and absolute user management.
- **Modern UI**: Clean, responsive layout using TailwindCSS, React Context API, and Headless UX patterns.

---

## Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

---

## 🚀 Setup Instructions

### 1. Database Configuration
Navigate to the `backend` directory and configure the environment variables:
```bash
cd backend
# The default .env is already configured for localhost:27017/leavify
# Edit .env if you need to use a MongoDB Atlas URI
```

### 2. Backend Installation & Start
Install dependencies and run the server:
```bash
cd backend
npm install
npm start
```
*The server will run on `http://localhost:5000`.*

### 3. Frontend Installation & Start
Open a new terminal window, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*The app will run on `http://localhost:5173`.*

---

## 🌱 Demo Users / Seeding Data
You can seed the database with demo users to quickly test the application.

From the `backend` directory run:
```bash
node seeder.js -i
```
**Demo Accounts Created:**
- **Admin**: `admin@leavify.com` / `password123`
- **Manager**: `manager@leavify.com` / `password123`
- **Employee**: `employee@leavify.com` / `password123`

To destroy data:
```bash
node seeder.js -d
```

---

## 🔐 Environment Variables
### Backend
Create a `.env` file in the `backend` root.
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/leavify
JWT_SECRET=supersecretpassword123
```

---

## 📡 API Documentation
Base URL: `http://localhost:5000/api`

### Auth Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user & return JWT token
- `GET /me` - Get current logged-in user (Protected)

### User Routes (`/api/users`) - Admin Only
- `GET /` - Get all users
- `POST /` - Create a user
- `GET /:id` - Get a single user
- `PUT /:id` - Update a user role
- `DELETE /:id` - Delete a user

### Leave Routes (`/api/leaves`)
- `GET /` - Get all leaves (Employee sees own, Managers/Admins see all)
- `POST /` - Apply for a new leave (Employee)
- `GET /:id` - Get a leave by ID
- `PUT /:id` - Approve / Reject a leave (Manager/Admin)
- `DELETE /:id` - Cancel a leave request (Employee, only if Pending)

### Reimbursement Routes (`/api/reimbursements`)
- `POST /apply` - Submit a new expense reimbursement claim (Employee)
- `GET /my` - View logged-in employee's claims (Employee)
- `GET /all` - View department claims (Manager) or all claims globally (Admin)
- `PATCH /:id/approve` - Approve a reimbursement claim (Manager/Admin)
- `PATCH /:id/reject` - Reject a reimbursement claim (Manager/Admin)
- `DELETE /:id` - Permanently delete a reimbursement record (Admin Only)

---

## 🛠️ Project Structure
```
Leavify/
│
├── backend/                   # Node.js, Express, MongoDB (API)
│   ├── src/
│   │   ├── config/            # DB configuration
│   │   ├── controllers/       # Route logic & Business logic
│   │   ├── middleware/        # JWT Authentication & Error Handlers
│   │   ├── models/            # Mongoose Schemas (User, Leave)
│   │   └── routes/            # REST API endpoints
│   ├── .env                   # Environment variables
│   ├── seeder.js              # Database seed script
│   └── server.js              # Express app entry point
│
└── frontend/                  # React.js, Vite, Tailwind CSS
    ├── src/
    │   ├── assets/            # Static files & images
    │   ├── components/        # Reusable UI (Navbar, Sidebar)
    │   ├── context/           # React Context API (Auth)
    │   ├── layouts/           # Dashboard shell & routing wrappers
    │   ├── pages/             # Page components (Login, Dashboard, etc.)
    │   ├── routes/            # Protected/Public Routes
    │   └── services/          # Axios API interceptors
    ├── index.html             # HTML template
    ├── tailwind.config.js     # Tailwind configuration
    └── vite.config.js         # Vite bundler configuration
```
