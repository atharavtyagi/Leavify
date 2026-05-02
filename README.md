# 🌟 Leavify - Enterprise-Grade HR & Leave Management System

![Leavify Hero](https://placehold.co/1200x400/2563eb/ffffff?text=Leavify+-+Modern+HR+SaaS)

> A modern, highly scalable, and secure MERN stack application designed to streamline employee leave requests, expense reimbursements, and administrative workflows. Built with cutting-edge technologies, Leavify offers an intuitive user experience with AI-powered assistance and real-time updates.

Live Demo: [https://leavifyy.vercel.app/](https://leavifyy.vercel.app/)

---

## ✨ Key Features

### 🔐 Advanced Role-Based Access Control (RBAC)
- **Employee Portal**: Apply for leaves, submit expense claims, track real-time statuses, and monitor personal activity.
- **Manager Dashboard**: Seamlessly review, approve, or reject team leaves and reimbursements.
- **Admin Control Center**: Global oversight of organizational operations, acting role delegation, and user management.

### 🤖 AI-Powered HR Assistant
- Integrated **Google Gemini AI** Chatbot to answer company policy queries, guide users through workflows, and provide instant HR assistance.

### 🔄 Acting Roles & Delegation
- Sophisticated delegation engine allowing admins/managers to temporarily assign "Acting" roles to other employees during their absence.
- Dedicated review dashboards for tracking actions taken by acting managers.

### 💰 Comprehensive Reimbursement Tracking
- Submit, review, and approve financial expense claims with attached proofs.
- Department-level grouping and organization-wide analytics.

### 🛡️ Enterprise Security & Audit Logging
- **JWT Authentication** with secure token refreshing.
- Detailed **Audit Trails** tracking login history, device data, IP addresses, and sensitive system actions.
- Suspicious activity monitoring with an interactive Audit Dashboard.

### 🔔 Real-Time Notifications
- WebSockets (`Socket.io`) implementation for instant push notifications on leave/reimbursement status changes.
- Automated **Email Notifications** sent via `Nodemailer`.

### 📊 Interactive Analytics & Dashboards
- Beautiful, interactive charts (`Chart.js`) displaying leave distributions, approval rates, and financial metrics.

---

## 🛠️ Technology Stack

**Frontend**
- **React.js (v18)** & **Vite**: Blazing fast rendering and optimized build performance.
- **Tailwind CSS**: Utility-first styling for a highly responsive, glassmorphism-inspired modern UI.
- **React Context API**: Global state management for authentication and theming.
- **Chart.js** & **React-Big-Calendar**: Data visualization and schedule management.
- **Socket.io-Client**: Real-time bidirectional communication.

**Backend**
- **Node.js** & **Express.js**: Robust, non-blocking REST API architecture.
- **MongoDB** & **Mongoose**: Flexible NoSQL database with strict schema validation.
- **Google Generative AI**: LLM integration for the intelligent chatbot.
- **JWT** & **Bcrypt.js**: Stateless authentication and password hashing.
- **Nodemailer** & **Cron Jobs**: Automated communication and background task scheduling.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/atharavtyagi/Leavify.git
cd Leavify
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (do not commit this file):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/leavify
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
GEMINI_API_KEY=your_google_gemini_api_key
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The application will be running at `http://localhost:5173`.

---

## 📡 Core API Endpoints Overview

| Module | Route | Access | Description |
|---|---|---|---|
| **Auth** | `POST /api/auth/login` | Public | Authenticate user & get token |
| **Auth** | `POST /api/auth/refresh` | Private | Refresh JWT token session |
| **Leaves** | `POST /api/leaves` | Employee | Submit a new leave request |
| **Leaves** | `PUT /api/leaves/:id` | Manager/Admin | Approve/Reject leave request |
| **Reimbursements** | `POST /api/reimbursements/apply` | Employee | Submit a new expense claim |
| **Delegation** | `POST /api/admin/delegations` | Admin | Assign an acting manager role |
| **Audit** | `GET /api/audit/me/login-history` | Private | Retrieve user login history |
| **Assistant** | `POST /api/chat/message` | Private | Chat with HR Gemini AI |

*(Refer to internal documentation or Postman collection for detailed request/response schemas).*

---

## 🏗️ Architecture & Folder Structure

```text
Leavify/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers & core business logic
│   │   ├── middleware/       # JWT auth, role validation, error handling
│   │   ├── models/           # Mongoose schemas (User, Leave, AuditLog)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Encapsulated third-party services (AI, Email)
│   │   └── utils/            # Helper functions & logger utilities
│   └── server.js             # Entry point & Express configuration
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Modals, Chatbots)
    │   ├── context/          # State Contexts (AuthContext, ThemeContext)
    │   ├── layouts/          # Dashboard wrapper and structural layouts
    │   ├── pages/            # View components (Dashboard, Settings, etc.)
    │   └── services/         # Axios API interceptor configurations
    ├── index.html            # Entry HTML
    └── tailwind.config.js    # Design system tokens and plugins
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is proprietary and built for demonstration purposes.

---
*Built with ❤️ for modern workplaces.*
