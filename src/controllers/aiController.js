const { generateReply } = require('../services/aiService');

const aiController = {
    /**
     * POST /api/ai/generate-reply
     * Formats the request for AI generation based on context and tone
     */
    generateReply: async (req, res) => {
        const { emailContext, tone } = req.body;

        if (!emailContext || !tone) {
            return res.status(400).json({ error: 'emailContext and tone are required' });
        }

        try {
            const generatedReply = await generateReply(emailContext, tone);
            res.status(200).json({ reply: generatedReply });
        } catch (error) {
            console.error('Error in generateReply controller:', error);
            res.status(500).json({ error: 'Failed to generate AI reply' });
        }
    }
};

module.exports = aiController;
