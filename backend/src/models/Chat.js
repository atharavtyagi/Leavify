const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    seen: {
        type: Boolean,
        default: false
    },
    attachment: {
        type: String // File path if a file was uploaded
    },
    isSystemMessage: {
        type: Boolean,
        default: false // Used for automated status updates in chat
    }
});

const ChatSchema = new mongoose.Schema({
    contextType: {
        type: String,
        enum: ['leave', 'reimbursement'],
        required: true
    },
    contextId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // We do not use `ref` directly here because it is dynamic (polymorphic)
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [MessageSchema],
    isLocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for fast contextual lookup
ChatSchema.index({ contextType: 1, contextId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', ChatSchema);
