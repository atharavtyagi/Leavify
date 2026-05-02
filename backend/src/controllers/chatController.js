const Chat = require('../models/Chat');
const Leave = require('../models/Leave');
const Reimbursement = require('../models/Reimbursement');
const ErrorResponse = require('../utils/errorResponse');

// Helper to verify context access
const verifyAndGetContext = async (contextType, contextId, req) => {
    const user = req.user;
    let doc;
    if (contextType === 'leave') {
        doc = await Leave.findById(contextId).populate('employee', 'name department role');
    } else if (contextType === 'reimbursement') {
        doc = await Reimbursement.findById(contextId).populate('employee', 'name department role');
    } else {
        throw new ErrorResponse('Invalid context type', 400);
    }

    if (!doc) {
        throw new ErrorResponse('Context document not found', 404);
    }

    // Role-based access control
    if (user.role === 'Admin') {
        return doc;
    }

    if (user.role === 'Employee') {
        if (doc.employee._id.toString() !== user.id) {
            throw new ErrorResponse('Not authorized to access this chat', 403);
        }
        return doc;
    }

    if (user.role === 'Manager') {
        // Standard department check
        if (doc.employee.department === user.department) {
            return doc;
        }

        // Acting Manager Check (CROSS-DEPARTMENT ACCESS)
        if (req.isActingManager && req.actingManagerDepts && req.actingManagerDepts.includes(doc.employee.department)) {
            console.log(`[CHAT DEBUG] Allowing Acting Manager ${user.name} access to ${doc.employee.name} chat (${doc.employee.department})`);
            return doc;
        }

        throw new ErrorResponse('Not authorized to access chats outside your department or delegation', 403);
    }

    throw new ErrorResponse('Unauthorized access', 403);
};

// @desc    Get chat by context
// @route   GET /api/chat/:contextType/:contextId
// @access  Private
exports.getChat = async (req, res, next) => {
    try {
        const { contextType, contextId } = req.params;
        const doc = await verifyAndGetContext(contextType, contextId, req);

        let chat = await Chat.findOne({ contextType, contextId })
            .populate('participants', 'name role department avatar')
            .populate('messages.sender', 'name role avatar');

        if (!chat) {
            // Create chat if it doesn't exist, initializing participants
            const participants = [doc.employee._id];
            if (req.user.id !== doc.employee._id.toString()) {
                participants.push(req.user.id);
            }

            chat = await Chat.create({
                contextType,
                contextId,
                participants,
                messages: []
            });

            // Re-fetch to populate
            chat = await Chat.findById(chat._id)
                .populate('participants', 'name role department avatar')
                .populate('messages.sender', 'name role avatar');
        }

        res.status(200).json({
            success: true,
            data: chat
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message
// @route   POST /api/chat/:contextType/:contextId/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { contextType, contextId } = req.params;
        const { message, isSystemMessage } = req.body;

        // System messages bypass standard strict auth, but we still verify context exists
        let doc;
        if (!isSystemMessage) {
            doc = await verifyAndGetContext(contextType, contextId, req); // Pass full req to check flags
            
            // Block messages from managers on leave (View-Only)
            if (req.viewOnlyStatus) {
                throw new ErrorResponse('You are currently on leave and have view-only access. You cannot send messages.', 403);
            }
        }

        let chat = await Chat.findOne({ contextType, contextId });
        if (!chat) {
            if (isSystemMessage) {
                // System creates it on behalf of action
                chat = await Chat.create({ contextType, contextId, participants: [], messages: [] });
            } else {
                throw new ErrorResponse('Chat not initialized', 404);
            }
        }

        if (chat.isLocked && !isSystemMessage) {
            throw new ErrorResponse('This chat discussion has been locked by the system.', 400);
        }

        let attachmentPath = null;
        if (req.file) {
            attachmentPath = `/uploads/receipts/${req.file.filename}`;
        }

        const newMessage = {
            sender: req.user.id, // for system messages, user ID is passed manually in standard controller
            message: message || '',
            attachment: attachmentPath,
            isSystemMessage: isSystemMessage === true || isSystemMessage === 'true',
            seen: false,
            timestamp: Date.now()
        };

        // Add user to participants if not already there (only if real user message)
        if (!newMessage.isSystemMessage && !chat.participants.includes(req.user.id)) {
            chat.participants.push(req.user.id);
        }

        chat.messages.push(newMessage);
        await chat.save();

        // Populate sender for realtime broadcast
        await chat.populate('messages.sender', 'name role avatar');
        const pushedMessage = chat.messages[chat.messages.length - 1];

        // Emit via Socket.io
        const io = req.app.get('io');
        if (io) {
            const roomName = `${contextType}-${contextId}`;
            io.to(roomName).emit('newMessage', pushedMessage);
        }

        res.status(200).json({
            success: true,
            data: pushedMessage
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark messages as seen
// @route   PATCH /api/chat/:contextType/:contextId/seen
// @access  Private
exports.markSeen = async (req, res, next) => {
    try {
        const { contextType, contextId } = req.params;
        const chat = await Chat.findOne({ contextType, contextId });

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found' });
        }

        let updated = false;
        chat.messages.forEach(msg => {
            if (msg.sender.toString() !== req.user.id && !msg.seen) {
                msg.seen = true;
                updated = true;
            }
        });

        if (updated) {
            // Need to save silently, skipping validation if necessary
            await chat.save({ validateBeforeSave: false });

            const io = req.app.get('io');
            if (io) {
                const roomName = `${contextType}-${contextId}`;
                io.to(roomName).emit('messageSeen', { contextId, userId: req.user.id });
            }
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// Internal helper for other controllers (No Express req/res)
exports.addSystemMessage = async (contextType, contextId, messageText, actionUserId, io) => {
    try {
        let chat = await Chat.findOne({ contextType, contextId });
        if (!chat) {
            chat = await Chat.create({ contextType, contextId, participants: [], messages: [] });
        }

        const newMessage = {
            sender: actionUserId,
            message: messageText,
            isSystemMessage: true,
            seen: true, // System messages don't need seen tracking strictly
            timestamp: Date.now()
        };

        chat.messages.push(newMessage);

        // Lock if message implies finality
        if (messageText.toLowerCase().includes('finalized') || messageText.toLowerCase().includes('approved') || messageText.toLowerCase().includes('rejected') || messageText.toLowerCase().includes('paid')) {
            chat.isLocked = true;
        }

        await chat.save();

        if (io) {
            await chat.populate('messages.sender', 'name role avatar');
            const pushedMsg = chat.messages[chat.messages.length - 1];
            io.to(`${contextType}-${contextId}`).emit('newMessage', pushedMsg);
        }
    } catch (error) {
        console.error("System Message Chat Error:", error);
    }
};
