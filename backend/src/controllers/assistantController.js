const AssistantService = require('../services/assistantService');

// @desc    Process assistant query
// @route   POST /api/assistant/query
// @access  Private
exports.processQuery = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // The user is injected by the protect middleware
        const response = await AssistantService.processQuery(message, req.user);

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Assistant Error:', error);
        res.status(500).json({ success: false, error: 'Assistant failed to process the request' });
    }
};
