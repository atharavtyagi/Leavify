const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const User = require('./src/models/User');
const LeaveBalance = require('./src/models/LeaveBalance');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const users = [
    {
        name: 'Admin User',
        email: 'admin@leavify.com',
        password: 'password123',
        role: 'Admin',
        department: 'Engineering'
    },
    {
        name: 'Manager User',
        email: 'manager@leavify.com',
        password: 'password123',
        role: 'Manager',
        department: 'Engineering'
    },
    {
        name: 'Employee User',
        email: 'employee@leavify.com',
        password: 'password123',
        role: 'Employee',
        department: 'Engineering'
    }
];

// Import into DB
const importData = async () => {
    try {
        const createdUsers = await User.create(users);

        // Setup initial leave balances
        const balances = createdUsers.map(user => ({ user: user._id }));
        await LeaveBalance.create(balances);

        console.log('Data Imported...');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await User.deleteMany();
        await LeaveBalance.deleteMany();

        const AuditLog = require('./src/models/AuditLog');
        await AuditLog.deleteMany();

        console.log('Data Destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
