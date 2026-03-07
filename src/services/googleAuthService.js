const { google } = require('googleapis');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Define requested scopes
const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
];

/**
 * Generate the authentication URL for Google OAuth
 * @param {string} state - Optional return URL to pass through the OAuth flow
 */
const getAuthUrl = (state) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Required to receive a refresh token
        prompt: 'consent', // Force to always show consent screen to ensure refresh token is provided
        scope: SCOPES,
        state: state // Pass the state parameter back to the redirect URI
    });
};

/**
 * Get tokens from the authorization code and save them to the DB
 */
const handleCallback = async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info to identify them
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfoData = await oauth2.userinfo.get();
        const googleId = userInfoData.data.id;
        const email = userInfoData.data.email;
        const profileImage = userInfoData.data.picture; // Extract the profile picture URL

        // Check if user exists or create a new one
        let user = await User.findOne({ googleId });
        if (user) {
            user.accessToken = tokens.access_token;
            user.profileImage = profileImage; // Update image if it changed
            // Only update refresh token if one was provided in the response
            if (tokens.refresh_token) {
                user.refreshToken = tokens.refresh_token;
            }
            await user.save();
        } else {
            user = new User({
                googleId,
                email,
                profileImage,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || '', // Ensure we handle cases where it's absent
            });
            await user.save();
        }

        return user;
    } catch (error) {
        console.error('Error retrieving access token', error);
        throw error;
    }
};

/**
 * Retrieve a configured authenticated client for a given googleId
 */
const getAuthenticatedClient = async (googleId) => {
    const user = await User.findOne({ googleId });
    if (!user) {
        throw new Error('User not found');
    }

    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
    });

    // Listen for automatic token refresh and save new access_token
    client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
            user.refreshToken = tokens.refresh_token;
        }
        if (tokens.access_token) {
            user.accessToken = tokens.access_token;
        }
        user.save().catch(err => console.error("Error saving new tokens:", err));
    });

    return client;
};

module.exports = {
    getAuthUrl,
    handleCallback,
    getAuthenticatedClient,
};
