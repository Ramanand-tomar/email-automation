const { getEmails, getEmailById, getThreadById, sendEmail, modifyEmail, deleteEmail, replyToEmail } = require('../services/gmailService');
const User = require('../models/User');

const gmailController = {
    /**
     * GET /api/gmail/emails
     * Fetch emails for a specified folder (INBOX, SENT, TRASH, etc.)
     */
    getEmails: async (req, res) => {
        // In a real app with sessions/JWT, googleId would come from `req.user.googleId`
        // For this example, we'll expect it in the headers or query
        const googleId = req.headers['x-google-id'] || req.query.googleId;
        const folder = req.query.folder || 'inbox';
        const pageToken = req.query.pageToken;
        const maxResults = parseInt(req.query.maxResults) || 25;

        if (!googleId) {
            return res.status(401).json({ error: 'Unauthorized: Missing googleId' });
        }

        try {
            const result = await getEmails(googleId, folder, maxResults, pageToken);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getEmails controller:', error);
            res.status(500).json({ error: 'Failed to fetch emails' });
        }
    },

    /**
     * GET /api/gmail/emails/:id
     * Fetch a single email by ID with full details
     */
    getEmailById: async (req, res) => {
        const googleId = req.headers['x-google-id'] || req.query.googleId;
        const messageId = req.params.id;

        if (!googleId) {
            return res.status(401).json({ error: 'Unauthorized: Missing googleId' });
        }

        if (!messageId) {
            return res.status(400).json({ error: 'Missing email ID' });
        }

        try {
            const result = await getEmailById(googleId, messageId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getEmailById controller:', error);
            res.status(500).json({ error: 'Failed to fetch email details' });
        }
    },

    /**
     * GET /api/gmail/threads/:id
     * Fetch a full thread by ID
     */
    getThreadById: async (req, res) => {
        const googleId = req.headers['x-google-id'] || req.query.googleId;
        const threadId = req.params.id;

        if (!googleId) {
            return res.status(401).json({ error: 'Unauthorized: Missing googleId' });
        }

        if (!threadId) {
            return res.status(400).json({ error: 'Missing thread ID' });
        }

        try {
            const result = await getThreadById(googleId, threadId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getThreadById controller:', error);
            res.status(500).json({ error: 'Failed to fetch thread details' });
        }
    },

    /**
     * POST /api/gmail/send
     * Send an email or reply to an existing one
     */
    sendEmail: async (req, res) => {
        const googleId = req.headers['x-google-id'] || req.body.googleId || req.query.googleId;
        const { to, subject, body, cc, bcc, replyToMessageId, threadId } = req.body;


        if (!googleId || !to || !subject || !body) {
            return res.status(400).json({ error: 'Missing required fields (googleId, to, subject, body)' });
        }

        try {
            // Look up the user's email for the From header
            const user = await User.findOne({ googleId });
            const from = user ? user.email : undefined;

            const result = await sendEmail(googleId, {
                to,
                subject,
                body,
                cc,
                bcc,
                from,
                replyToMessageId,
                threadId
            });
            res.status(200).json({ success: true, result });
        } catch (error) {
            console.error('Error in sendEmail controller:', error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    },

    /**
     * POST /api/gmail/modify/:id
     * Modify the labels on an email (archive, trash, mark as read/unread)
     */
    modifyEmail: async (req, res) => {
        const googleId = req.headers['x-google-id'] || req.body.googleId || req.query.googleId;
        const messageId = req.params.id;
        const { action } = req.body; // e.g. "mark_read", "mark_unread", "archive", "trash"

        if (!googleId || !messageId || !action) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        try {
            const result = await modifyEmail(googleId, messageId, action);
            res.status(200).json({ success: true, result });
        } catch (error) {
            console.error('Error in modifyEmail controller:', error);
            res.status(500).json({ error: 'Failed to modify email' });
        }
    },

    /**
     * DELETE /api/gmail/emails/:id
     * Delete (trash) an email
     */
    deleteEmail: async (req, res) => {
        const googleId = req.headers['x-google-id'] || req.body.googleId || req.query.googleId;
        const messageId = req.params.id;

        if (!googleId || !messageId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        try {
            const result = await deleteEmail(googleId, messageId);
            res.status(200).json({ success: true, result });
        } catch (error) {
            console.error('Error in deleteEmail controller:', error);
            res.status(500).json({ error: 'Failed to delete email' });
        }
    },

    /**
     * POST /api/gmail/emails/:id/reply
     * Specifically reply to an email by ID
     */
    replyToEmail: async (req, res) => {
        const googleId = req.headers['x-google-id'] || req.body.googleId || req.query.googleId;
        const messageId = req.params.id; // Original email ID
        const { body, to, cc, bcc, subject } = req.body;

        if (!googleId || !messageId || !body) {
            return res.status(400).json({ error: 'Missing required parameters (googleId, messageId, body)' });
        }

        try {
            const result = await replyToEmail(googleId, messageId, { body, to, cc, bcc, subject });
            res.status(200).json({ success: true, result });
        } catch (error) {
            console.error('Error in replyToEmail controller:', error);
            res.status(500).json({ error: 'Failed to send reply' });
        }
    }
};

module.exports = gmailController;
