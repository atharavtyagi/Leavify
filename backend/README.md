# Leavify - Backend Platform

The backend of Leavify is a robust RESTful API built with Node.js and Express, designed to handle user authentication, role-based access control, complex leave management workflows, and an intelligent AI assistant integration.

## 🚀 Technologies Used
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
- **AI Integration:** `@google/generative-ai` (Gemini 2.5 Flash API)
- **Real-time Communication:** Socket.io
- **Scheduling:** `node-cron` (for automated background tasks)
- **Email/Notifications:** `nodemailer`

## 🏗️ Architecture & Folder Structure
The backend follows the MVC (Model-View-Controller) architecture to keep the business logic clean and scalable.

- `src/models/` - Mongoose schemas (`User`, `Leave`, `LeaveBalance`, `Reimbursement`, etc.) defining the MongoDB structure and data validation rules.
- `src/controllers/` - Core business logic. Functions here handle inbound HTTP requests, validate input, call appropriate services, and formulate JSON responses.
- `src/routes/` - Express route definitions mapping endpoints to controller functions (e.g., `router.get('/', getLeaves)`).
- `src/middleware/` - Custom middleware for JWT authentication (`protect` ensures a user is logged in) and role-based authorization (`authorize` restricts endpoints to specific roles like 'Manager' or 'Admin').
- `src/services/` - Dedicated service classes (like `assistantService.js`) to handle complex calculations or third-party API integrations, keeping controllers thin.

## 🔄 Core Data Flow
If asked how data moves in the app, explain this flow:
1. **Request:** A client makes an HTTP request to an API endpoint (e.g., `POST /api/leaves`).
2. **Middleware (Auth):** The request passes through `authMiddleware.js`. The JWT in the `Authorization` header is verified, decoded, and the database user object is securely attached to the request (`req.user`).
3. **Middleware (Role):** If the route is restricted (e.g., Manager approving a leave), the `authorize('Manager', 'Admin')` middleware verifies `req.user.role`.
4. **Controller Logic:** The route forwards the request to the specific controller. The controller handles business logic and validation.
5. **Database Interaction:** Mongoose executes the corresponding NoSQL query on MongoDB.
6. **Response:** The controller formats the retrieved or updated data and sends a structured JSON response back to the client.

## 🤖 AI Assistant Integration (Gemini 2.5)
One of the standout, highly-engineered features is the contextual AI assistant:
- **Endpoint:** `POST /api/assistant/query`
- **Flow:** When a user asks a question, the `assistantService.js` takes over. It checks the user's role and dynamically queries the database to gather a "context payload" (e.g., calculating exact pending leaves for a manager's department, or fetching a user's exact balance limits).
- **Prompt Engineering:** This contextual data is injected into a strict system prompt. The instructions force the Google Gemini 2.5 Flash model to act as the HR assistant, strictly prohibiting hallucinated data, and demanding it formats its output as specific JSON structures (`type: "text" | "stat" | "table"`).
- **Result:** The frontend receives raw, structured JSON that it can parse and immediately paint into beautiful native HTML/React UI widgets, rather than just returning plain text walls.

## ⚙️ Setup & Running Locally
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with your variables (e.g., `MONGO_URI`, `JWT_SECRET`, and Gemini API Key).
4. Run the development server: `npm run dev`
