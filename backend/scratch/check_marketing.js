require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const marketingManager = await User.findOne({ department: 'Marketing', role: 'Manager' });
    console.log('Marketing Manager:', marketingManager ? { name: marketingManager.name, id: marketingManager._id } : 'Not found');
    
    if (marketingManager) {
        const today = new Date();
        const startOfWindow = new Date(today.getTime() - 15 * 60 * 60 * 1000);
        const endOfWindow = new Date(today.getTime() + 15 * 60 * 60 * 1000);
        
        const leave = await Leave.findOne({
            employee: marketingManager._id,
            status: 'Approved',
            startDate: { $lte: endOfWindow },
            endDate: { $gte: startOfWindow }
        }).populate('actingManager backupEmployee');
        
        console.log('Current Leave for Marketing Manager:', leave ? {
            id: leave._id,
            start: leave.startDate,
            end: leave.endDate,
            status: leave.status,
            actingManager: leave.actingManager ? leave.actingManager.name : 'None',
            backupEmployee: leave.backupEmployee ? leave.backupEmployee.name : 'None'
        } : 'None found for today');
    }
    process.exit();
}

check();
