const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function deepDive() {
    await mongoose.connect('mongodb://localhost:27017/leavify');
    
    console.log('--- DEEP DIVE RESEARCH ---');
    
    // 1. All Users
    const allUsers = await User.find({});
    console.log('\nALL USERS:');
    allUsers.forEach(u => {
        console.log(`- NAME: ${u.name} | DEPT: ${u.department} | ROLE: ${u.role} | ID: ${u._id}`);
    });

    // 2. All Approved Leaves
    const approvedLeaves = await Leave.find({ status: 'Approved' }).populate('employee actingManager');
    console.log('\nAPPROVED LEAVES:');
    approvedLeaves.forEach(l => {
        console.log(`- EMPLOYEE: ${l.employee?.name} | DATES: ${l.startDate.toISOString()} to ${l.endDate.toISOString()} | ACTING: ${l.actingManager?.name || 'NONE'}`);
    });

    // 3. Test current day resolve for Engineering
    const { getDepartmentResponders } = require('../src/utils/managerResolver');
    console.log('\nRESOLVING Engineering:');
    const engRes = await getDepartmentResponders('Engineering');
    console.log('Primary:', engRes.primary.map(p => p.name));
    console.log('FYI:', engRes.fyi.map(f => f.name));

    console.log('\nRESOLVING Marketing:');
    const markRes = await getDepartmentResponders('Marketing');
    console.log('Primary:', markRes.primary.map(p => p.name));
    console.log('FYI:', markRes.fyi.map(f => f.name));

    process.exit();
}

deepDive().catch(err => { console.error(err); process.exit(1); });
