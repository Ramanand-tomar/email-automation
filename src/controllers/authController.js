const { getAuthUrl, handleCallback } = require('../services/googleAuthService');
const User = require('../models/User');

const authController = {
    /**
     * GET /api/gmail/auth
     * Returns Google OAuth URL for the user to visit.
     * Optionally accepts ?returnUrl=... to redirect after completion.
     */
    getAuthUrl: (req, res) => {
        try {
            let returnUrl = req.query.returnUrl;
            const orgName = req.query.orgName;

            // If returnUrl is not provided, construct it using orgName if available
            if (!returnUrl && orgName) {
                returnUrl = `${process.env.FRONTEND_URL}/${orgName}/email`;
            }

            const url = getAuthUrl(returnUrl, {
                syncPeriod: req.query.syncPeriod,
                inboxCategories: req.query.inboxCategories
            });
            res.status(200).json({ url });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate auth URL' });
        }
    },

    /**
     * GET /api/gmail/oauth2callback
     * Handles the redirect from Google, exchanges code for tokens
     */
    oauthCallback: async (req, res) => {
        const { code, state } = req.query;

        let decodedState = {};
        try {
            if (state) {
                decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
            }
        } catch (e) {
            console.error('Failed to decode state:', e);
        }

        const { returnUrl, syncPeriod, inboxCategories } = decodedState;

        if (!code) {
            return res.status(400).json({ error: 'No authorization code provided' });
        }

        try {
            const user = await handleCallback(code);
            console.log(`[Diagnostic] OAuth successful. User: ${user.email}, googleId: ${user.googleId}`);

            // Update user sync settings if provided
            if (syncPeriod) user.syncPeriod = syncPeriod;
            if (inboxCategories) user.inboxCategories = inboxCategories.split(',').map(c => c.trim());
            await user.save();

            // Automatically start watching inbox for real-time sync

            // Automatically start watching inbox for real-time sync
            try {
                const { watchInbox, syncUserEmails } = require('../services/gmailService');
                await watchInbox(user.googleId);
                console.log(`Automatic watch initiated for ${user.email}`);
                
                // Trigger initial sync of historical emails
                syncUserEmails(user.googleId).catch(err => 
                    console.error(`Initial sync failed for ${user.email}:`, err)
                );
            } catch (watchError) {
                console.error(`Failed to initiate automatic watch/sync for ${user.email}:`, watchError);
            }

            // Use state parameter (returnUrl) if provided, otherwise fallback to default
            const baseUrl = returnUrl || `${process.env.FRONTEND_URL}/ivfindia.com/email`;

            // Append googleId to the redirect URL
            const finalRedirectUrl = new URL(baseUrl);
            finalRedirectUrl.searchParams.append('googleId', user.googleId);

            res.redirect(finalRedirectUrl.toString());

        } catch (error) {
            console.error('OAuth Callback Error:', error);
            res.status(500).json({ error: 'OAuth Callback Failed' });
        }
    },

    /**
     * GET /api/gmail/status
     * Checks if a provided googleId has valid tokens
     */
    getStatus: async (req, res) => {
        const googleId = req.query.googleId; // Assuming googleId is sent to check status

        if (!googleId) {
            return res.status(400).json({ error: 'googleId required to check status' });
        }

        try {
            const user = await User.findOne({ googleId });

            const status = !!user && !!user.accessToken;

            res.status(200).json({
                connected: status,
                profileImage: user ? user.profileImage : null,
                email: user ? user.email : null
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to check status' });
        }
    }
};

module.exports = authController;
