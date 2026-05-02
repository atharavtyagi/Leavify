require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Find Engineering Manager
    const engManager = await User.findOne({ department: 'Engineering', role: 'Manager' });
    console.log('Engineering Manager:', engManager ? { name: engManager.name, id: engManager._id } : 'Not found');
    
    if (!engManager) return process.exit();

    // 2. Simulate authMiddleware logic
    const now = new Date();
    const startOfWindow = new Date(now.getTime() - 36 * 60 * 60 * 1000);
    const endOfWindow = new Date(now.getTime() + 36 * 60 * 60 * 1000);
    
    console.log('Window:', { start: startOfWindow, end: endOfWindow });

    const activeActingRoles = await Leave.find({
        $or: [
            { actingManager: engManager._id },
            { backupEmployee: engManager._id }
        ],
        status: 'Approved',
        startDate: { $lte: endOfWindow },
        endDate: { $gte: startOfWindow }
    }).populate('employee', 'name department role');

    console.log('Found Acting Roles Count:', activeActingRoles.length);
    
    activeActingRoles.forEach(l => {
        console.log(`- Leave ID: ${l._id}`);
        console.log(`  Employee: ${l.employee ? l.employee.name : 'NULL'}`);
        console.log(`  Role: ${l.employee ? l.employee.role : 'N/A'}`);
        console.log(`  Dept: ${l.employee ? l.employee.department : 'N/A'}`);
    });

    process.exit();
}

check();
