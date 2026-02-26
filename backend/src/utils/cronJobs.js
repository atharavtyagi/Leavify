const cron = require('node-cron');
const LeaveBalance = require('../models/LeaveBalance');

// Run on the 1st of every month at midnight
const monthlyAccrualJob = cron.schedule('0 0 1 * *', async () => {
    console.log('[CRON] Starting monthly leave accrual...');
    try {
        const currentYear = new Date().getFullYear();
        const balances = await LeaveBalance.find({ year: currentYear });

        let updatedCount = 0;
        for (const balance of balances) {
            // Accrue 1.5 days per month
            let newAnnualLeave = balance.annualLeave + 1.5;

            // Cap at 21 days
            if (newAnnualLeave > 21) {
                newAnnualLeave = 21;
            }

            // Only update if it actually changed
            if (balance.annualLeave !== newAnnualLeave) {
                balance.annualLeave = newAnnualLeave;
                await balance.save();
                updatedCount++;
            }
        }

        console.log(`[CRON] Monthly accrual complete. Updated ${updatedCount} user balances.`);
    } catch (error) {
        console.error('[CRON] Error during monthly leave accrual:', error);
    }
});

module.exports = {
    startJobs: () => {
        monthlyAccrualJob.start();
        console.log('[CRON] Background jobs initialized and started.');
    }
};
