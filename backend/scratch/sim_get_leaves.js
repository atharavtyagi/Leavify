require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const engManager = await User.findOne({ name: 'Manager' });
    console.log('Engineering Manager:', engManager.name, engManager._id);

    // Mock the req object
    const req = {
        user: engManager,
        query: {},
        isActingManager: true,
        actingManagerDepts: ['Marketing']
    };

    // Simulate getLeaves logic
    const allowedDepts = [req.user.department, ...req.actingManagerDepts];
    const usersInDepts = await User.find({
        department: { $in: allowedDepts },
        _id: { $ne: req.user.id }
    }).select('_id name department');
    const userIds = usersInDepts.map(u => u._id);

    const filter = {};
    filter.$or = [{ employee: { $in: userIds } }, { actingManager: req.user.id }];

    console.log('Filter:', JSON.stringify(filter, null, 2));

    const leaves = await Leave.find(filter)
        .populate('employee', 'name department role status')
        .sort('-appliedOn');

    console.log('Total Leaves Found:', leaves.length);
    
    leaves.forEach(l => {
        console.log(`- ${l.employee ? l.employee.name : 'Unknown'} (${l.employee ? l.employee.department : 'N/A'}) - Status: ${l.status}`);
    });

    process.exit();
}

check();
