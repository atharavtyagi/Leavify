const ErrorResponse = require('../utils/errorResponse');
const Leave = require('../models/Leave');

// @desc    Confirm backup request
// @route   POST /api/leaves/:id/backup/confirm
// @access  Private (Employee assigned as backup)
exports.confirmBackup = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        // Verify the user is actually the assigned backup
        if (!leave.backupEmployee || leave.backupEmployee.toString() !== req.user.id) {
            console.log('--- 403 Mismatch! leave.backupEmployee:', leave.backupEmployee, 'req.user.id:', req.user.id);
            return res.status(403).json({ success: false, error: 'Not authorized to confirm this backup request' });
        }

        if (leave.backupConfirmed) {
            return res.status(400).json({ success: false, error: 'Backup is already confirmed' });
        }

        leave.backupConfirmed = true;
        leave.backupConfirmedAt = Date.now();
        if (req.body.comment) {
            leave.backupComment = req.body.comment;
        }
        await leave.save();

        res.status(200).json({
            success: true,
            data: leave,
            message: 'Backup confirmed successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Decline backup request
// @route   POST /api/leaves/:id/backup/decline
// @access  Private (Employee assigned as backup)
exports.declineBackup = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        if (!leave.backupEmployee || leave.backupEmployee.toString() !== req.user.id) {
            console.log('--- 403 Mismatch! leave.backupEmployee:', leave.backupEmployee, 'req.user.id:', req.user.id);
            return res.status(403).json({ success: false, error: 'Not authorized to decline this backup request' });
        }

        // Here we just clear the backupEmployee field to indicate it was declined and no longer assigned
        leave.backupEmployee = undefined;
        leave.backupConfirmed = false;
        leave.backupConfirmedAt = undefined;
        if (req.body.comment) {
            leave.backupComment = req.body.comment;
        }
        await leave.save();

        res.status(200).json({
            success: true,
            data: leave,
            message: 'Backup request declined'
        });
    } catch (err) {
        console.error('declineBackup error:', err);
        res.status(500).json({ success: false, error: 'Server Error', details: err.message });
    }
};
