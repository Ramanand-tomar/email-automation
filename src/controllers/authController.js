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
            const returnUrl = req.query.returnUrl;
            const url = getAuthUrl(returnUrl);
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
        const { code, state: returnUrl } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'No authorization code provided' });
        }

        try {
            const user = await handleCallback(code);

            // Use state parameter (returnUrl) if provided, otherwise fallback to default
            const baseUrl = returnUrl || 'http://localhost:3000/ivfindia.com/email';

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
