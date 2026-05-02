const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function research() {
    await mongoose.connect('mongodb://localhost:27017/leavify');
    
    console.log('--- RESEARCH START ---');
    const now = new Date();
    // Using simple YYYY-MM-DD for current local day match
    const todayStr = now.toISOString().split('T')[0];
    console.log('Today (ISO):', todayStr);

    const managers = await User.find({ role: 'Manager' });
    console.log('Total Managers Found:', managers.length);

    for (const m of managers) {
        console.log(`\nChecking Manager: ${m.name} [${m.department}] (${m._id})`);
        
        // Find ALL approved leaves for this manager
        const leaves = await Leave.find({ employee: m._id, status: 'Approved' }).populate('actingManager');
        console.log(`Approved Leaves: ${leaves.length}`);
        
        for (const l of leaves) {
            console.log(`- From: ${l.startDate.toISOString()} To: ${l.endDate.toISOString()} | Acting: ${l.actingManager?.name || 'NONE'}`);
            
            // Check logic overlap
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            
            const isMatch = l.startDate <= endOfDay && l.endDate >= startOfDay;
            console.log(`  Match Today Logic: ${isMatch}`);
        }
    }

    console.log('\n--- VIVEK INFO ---');
    const vivek = await User.findOne({ name: /Vivek/i });
    if (vivek) {
        console.log(`Vivek Dept: ${vivek.department}`);
    }

    process.exit();
}

research().catch(err => { console.error(err); process.exit(1); });
