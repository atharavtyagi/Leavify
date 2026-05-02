const Leave = require('../models/Leave');
const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all pending reviews for the logged-in manager
// @route   GET /api/reviews
// @access  Private (Manager)
exports.getPendingReviews = async (req, res, next) => {
    try {
        const leaves = await Leave.find({
            actingFor: req.user.id,
            needsManagerReview: true
        }).populate('employee', 'name department avatar')
          .populate('approvedByActingManager', 'name');

        const reimbursements = await Reimbursement.find({
            actingFor: req.user.id,
            needsManagerReview: true
        }).populate('employee', 'name department avatar')
          .populate('approvedByActingManager', 'name');

        res.status(200).json({
            success: true,
            data: {
                leaves,
                reimbursements
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Accept acting manager's decision
// @route   POST /api/reviews/:type/:id/accept
// @access  Private (Manager)
exports.acceptDecision = async (req, res, next) => {
    try {
        const { type, id } = req.params;
        let doc;

        if (type === 'leave') {
            doc = await Leave.findById(id);
        } else {
            doc = await Reimbursement.findById(id);
        }

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        if (doc.actingFor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to review this record' });
        }

        doc.needsManagerReview = false;
        doc.reviewedByManager = true;
        doc.managerReviewedAt = Date.now();
        doc.reviewedAction = 'ACCEPTED';

        await doc.save();

        await auditLogger({
            action: 'MANAGER_ACCEPTED_REVIEW',
            performedBy: req.user.id,
            role: req.user.role,
            metadata: {
                recordId: doc._id,
                type,
                originalStatus: doc.status
            }
        });

        res.status(200).json({
            success: true,
            data: doc
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Override acting manager's decision
// @route   POST /api/reviews/:type/:id/override
// @access  Private (Manager)
exports.overrideDecision = async (req, res, next) => {
    try {
        const { type, id } = req.params;
        const { status, managerComment } = req.body;
        let doc;

        if (type === 'leave') {
            doc = await Leave.findById(id).populate('employee');
        } else {
            doc = await Reimbursement.findById(id).populate('employee');
        }

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        if (doc.actingFor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to review this record' });
        }

        const oldStatus = doc.status;
        
        // Handle Balance Reversal if overriding Leave from Approved to Rejected
        if (type === 'leave' && oldStatus === 'Approved' && status === 'Rejected') {
            const LeaveBalance = require('../models/LeaveBalance');
            const { calculateWorkingDays } = require('../utils/dateHelpers');
            
            const workingDays = calculateWorkingDays(doc.startDate, doc.endDate);
            const balance = await LeaveBalance.findOne({ 
                user: doc.employee._id, 
                year: new Date(doc.startDate).getFullYear() 
            });

            if (balance) {
                let typeField = '';
                if (doc.type === 'Annual') typeField = 'annualLeave';
                else if (doc.type === 'Sick') typeField = 'sickLeave';
                else if (doc.type === 'Casual') typeField = 'casualLeave';

                if (typeField) {
                    balance[typeField] += workingDays;
                    await balance.save();
                }
            }
        }

        doc.status = status;
        if (managerComment) doc.managerComment = managerComment;
        doc.needsManagerReview = false;
        doc.reviewedByManager = true;
        doc.managerReviewedAt = Date.now();
        doc.reviewedAction = 'OVERRIDDEN';

        await doc.save();

        await auditLogger({
            action: 'MANAGER_OVERRIDDEN_DECISION',
            performedBy: req.user.id,
            role: req.user.role,
            metadata: {
                recordId: doc._id,
                type,
                oldStatus,
                newStatus: status
            }
        });

        res.status(200).json({
            success: true,
            data: doc
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error: ' + err.message });
    }
};
