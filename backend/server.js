const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize background cron jobs
require('./src/utils/cronJobs').startJobs();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/leaves', require('./src/routes/leaveRoutes'));
app.use('/api/balances', require('./src/routes/balanceRoutes'));
app.use('/api/reimbursements', require('./src/routes/reimbursementRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/assistant', require('./src/routes/assistantRoutes'));
app.use('/api/admin/delegation', require('./src/routes/adminDelegationRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/audit', require('./src/routes/auditRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));

// Error handler middleware
app.use(require('./src/middleware/errorMiddleware'));

// Create HTTP server to unify Express and Socket.io
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // Or specific Vite frontend URL in strict prod
        methods: ["GET", "POST"]
    }
});

// Configure Socket connections
io.on("connection", (socket) => {
    console.log("Client connected to Socket.io:", socket.id);

    // Dynamic Room Joining based on contextType-contextId
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Attach io to the Express app context so controllers can emit events globally without circular dependencies
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server & WebSocket running on port ${PORT}`);
});
