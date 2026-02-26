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

// Error handler middleware
app.use(require('./src/middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
