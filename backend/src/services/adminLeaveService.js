const Leave = require('../models/Leave');
const NotificationService = require('./notificationService');

class AdminLeaveService {
    /**
     * Processes a leave application specifically for an Admin user.
     * Auto-approves the leave, sets up the acting admin delegation if provided,
     * and triggers realtime notifications to all Managers.
     */
    static async processAdminLeave(leaveData, adminUser, io) {
        // 1. Enforce Admin only
        if (adminUser.role !== 'Admin') {
            throw new Error('Only Admins can use the Auto-Approve workflow');
        }

        // 2. Set auto-approval fields
        leaveData.status = 'Approved';
        leaveData.approvedByRole = 'System';
        
        // 3. Setup Delegation (Acting Admin)
        if (leaveData.actingAdminId) {
            leaveData.actingStartDate = leaveData.startDate;
            leaveData.actingEndDate = leaveData.endDate;
            leaveData.actingAdminActive = true;
        }

        // 4. Create the Leave explicitly
        const leave = await Leave.create(leaveData);

        // 5. Trigger Notifications to Managers
        const notificationMsg = `Admin ${adminUser.name} will be on leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}.`;
        
        await NotificationService.notifyAllManagers(notificationMsg, 'admin_leave', io);

        return leave;
    }
}

module.exports = AdminLeaveService;
