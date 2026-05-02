const AuditLog = require('../models/AuditLog');

/**
 * Reusable Audit Logger
 * @param {Object} options
 * @param {String} options.action - Action performed (e.g., "LEAVE_APPLIED")
 * @param {mongoose.ObjectId} options.performedBy - User ID of who performed the action
 * @param {String} options.role - Role of the user performing the action
 * @param {mongoose.ObjectId} [options.targetUser] - User ID of the target user if applicable
 * @param {Object} [options.metadata] - Extra metadata about the action
 */
const auditLogger = async ({ action, performedBy, role, targetUser, metadata = {} }) => {
    try {
        await AuditLog.create({
            action,
            performedBy,
            role,
            targetUser,
            metadata
        });
    } catch (error) {
        console.error("Failed to write to audit log:", error);
    }
};

module.exports = auditLogger;
