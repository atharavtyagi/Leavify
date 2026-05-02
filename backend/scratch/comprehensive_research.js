const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function research() {
    await mongoose.connect('mongodb://localhost:27017/leavify');
    
    console.log('--- COMPREHENSIVE RESEARCH ---');
    const now = new Date();
    console.log('Current ISO Time:', now.toISOString());

    // 1. Find all users in Engineering and Marketing
    const relevantUsers = await User.find({ 
        department: { $in: ['Engineering', 'Marketing'] } 
    });
    console.log(`\nRelevant Users found: ${relevantUsers.length}`);
    relevantUsers.forEach(u => {
        console.log(`- ${u.name} | Role: ${u.role} | Dept: ${u.department} | ID: ${u._id}`);
    });

    // 2. Find ALL leaves that are active "Today"
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    console.log(`\nSearching for active leaves between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
    
    const activeLeaves = await Leave.find({
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
        status: 'Approved'
    }).populate('employee actingManager');

    console.log(`\nActive Approved Leaves found: ${activeLeaves.length}`);
    activeLeaves.forEach(l => {
        console.log(`- Employee: ${l.employee?.name} [${l.employee?.role}] (${l.employee?.department})`);
        console.log(`  Starts: ${l.startDate.toISOString()} | Ends: ${l.endDate.toISOString()}`);
        console.log(`  Acting: ${l.actingManager?.name || 'NONE'}`);
    });

    // 3. Find if there's an "Acting Manager" logic issue
    console.log('\n--- ACTING MANAGER FIELD CHECK ---');
    const allLeavesWithActing = await Leave.find({ actingManager: { $exists: true } }).populate('employee actingManager');
    console.log(`Total leaves with actingManager field: ${allLeavesWithActing.length}`);
    allLeavesWithActing.forEach(l => {
        console.log(`- Leave by ${l.employee?.name} (${l.status}) | Acting: ${l.actingManager?.name}`);
    });

    process.exit();
}

research().catch(err => { console.error(err); process.exit(1); });
