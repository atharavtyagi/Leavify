const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../models/Leave');
const { getDepartmentResponders } = require('../src/utils/managerResolver');

async function testResolver() {
    await mongoose.connect('mongodb://localhost:27017/leavify');
    
    console.log('--- TESTING DELEGATION RESOLVER ---');
    const dept = 'Engineering';
    console.log(`Department: ${dept}`);

    const result = await getDepartmentResponders(dept);
    
    console.log('\nPRIMARY RESPONDERS (Action Required):');
    result.primary.forEach(u => console.log(`- ${u.name} [${u.role}] (${u.department})`));

    console.log('\nFYI RESPONDERS (Informational):');
    result.fyi.forEach(u => console.log(`- ${u.name} [${u.role}] (${u.department})`));

    process.exit();
}

testResolver().catch(err => {
    console.error(err);
    process.exit(1);
});
