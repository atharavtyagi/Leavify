require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const engManager = await User.findOne({ name: 'Manager' });
    const markManager = await User.findOne({ name: 'Manager M' });
    
    console.log('Eng Manager ID:', engManager._id);
    console.log('Mark Manager ID:', markManager._id);

    const now = new Date();
    const startOfWindow = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const endOfWindow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find Mark Manager's approved leave
    const markLeave = await Leave.findOne({
        employee: markManager._id,
        status: 'Approved',
        startDate: { $lte: endOfWindow },
        endDate: { $gte: startOfWindow }
    });

    console.log('Mark Manager Leave Found:', !!markLeave);
    if (markLeave) {
        console.log('Acting Manager in Record:', markLeave.actingManager);
        console.log('Match?', String(markLeave.actingManager) === String(engManager._id));
    }

    // Check employees in Marketing
    const markEmployees = await User.find({ department: 'Marketing' });
    console.log('Marketing Employees Count:', markEmployees.length);
    markEmployees.forEach(e => console.log(`- ${e.name} (${e._id})`));

    // Check their leaves
    const empIds = markEmployees.map(e => e._id);
    const leaves = await Leave.find({ employee: { $in: empIds } });
    console.log('Marketing Leaves Count:', leaves.length);
    leaves.forEach(l => console.log(`- Employee: ${l.employee}, Status: ${l.status}, Dates: ${l.startDate} to ${l.endDate}`));

    process.exit();
}

check();
