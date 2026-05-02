const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AuditLog = require('./src/models/AuditLog');
const LoginHistory = require('./src/models/LoginHistory');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const logsCount = await AuditLog.countDocuments();
        console.log('Audit Logs Count:', logsCount);
        
        const historyCount = await LoginHistory.countDocuments();
        console.log('Login History Count:', historyCount);
        
        const sampleLog = await AuditLog.findOne();
        console.log('Sample Log:', sampleLog);
        
        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
};

test();
