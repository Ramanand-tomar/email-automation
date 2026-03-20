require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const gmailRoutes = require('./src/routes/gmailRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const socketService = require('./src/services/socketService');

const server = http.createServer(app);
const origins = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_1, "https://gleaming-mandazi-096272.netlify.app"].filter(Boolean);
const io = new Server(server, {
    cors: {
        origin: origins.length > 0 ? origins : "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize socket service
socketService.init(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Register routes
app.use('/api/gmail', authRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Privacy policy (HTML) — required for Google OAuth verification
app.get('/privacy', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Privacy Policy - BeyondChats</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #374151; line-height: 1.7; background: #fafaf9; }
  h1 { color: #111827; font-size: 28px; margin-bottom: 4px; }
  h2 { color: #111827; font-size: 18px; margin-top: 32px; }
  .date { color: #9ca3af; font-size: 14px; margin-bottom: 32px; }
  a { color: #0d9488; }
  ul { padding-left: 24px; }
  li { margin-bottom: 8px; }
  .back { display: inline-block; margin-top: 32px; color: #0d9488; text-decoration: none; font-weight: 500; }
</style>
</head>
<body>
<h1>Privacy Policy</h1>
<p class="date">Last updated: March 20, 2026</p>

<h2>1. About BeyondChats</h2>
<p>BeyondChats is an email automation application that connects to your Gmail account to help you manage your inbox more efficiently. It provides features like real-time email syncing, AI-powered reply drafts, multi-folder management, and instant notifications.</p>

<h2>2. Information We Collect</h2>
<p>When you use BeyondChats, we access the following information through your Google account:</p>
<ul>
<li><strong>Email metadata:</strong> Sender name, email address, subject lines, timestamps, and labels.</li>
<li><strong>Email content:</strong> The body of your emails, used to display them in the app and to generate AI reply suggestions.</li>
<li><strong>Google profile information:</strong> Your name, email address, and profile picture, used to identify your account within the app.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<ul>
<li><strong>Email display and management:</strong> We fetch and display your emails so you can read, reply to, archive, and manage them from within BeyondChats.</li>
<li><strong>AI reply generation:</strong> When you request an AI-generated reply, the email content is sent to Google Gemini AI to draft a response. This happens only when you explicitly click "Generate Reply".</li>
<li><strong>Real-time sync:</strong> We use Google Pub/Sub to receive notifications when new emails arrive, so your inbox stays up to date without manual refreshing.</li>
<li><strong>Authentication:</strong> We use Google OAuth 2.0 to securely authenticate your identity. We never see or store your Google password.</li>
</ul>

<h2>4. Google API Services Usage Disclosure</h2>
<p>BeyondChats' use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>

<h2>5. Data Storage and Security</h2>
<ul>
<li>Your OAuth access tokens are stored securely on our server and are used only to communicate with Gmail on your behalf.</li>
<li>Email data is cached temporarily to provide a fast user experience and is not shared with any third parties beyond the AI reply generation service (Google Gemini).</li>
<li>We use HTTPS encryption for all data in transit between your browser, our servers, and Google's APIs.</li>
<li>We do not sell, rent, or trade your personal information to any third party.</li>
</ul>

<h2>6. Google OAuth Scopes</h2>
<p>BeyondChats requests the following Google OAuth permissions:</p>
<ul>
<li><strong>gmail.readonly:</strong> To read and display your emails.</li>
<li><strong>gmail.send:</strong> To send emails and replies on your behalf when you click "Send".</li>
<li><strong>gmail.modify:</strong> To mark emails as read, archive, or move them to trash.</li>
<li><strong>userinfo.profile:</strong> To display your name and profile picture in the app.</li>
<li><strong>userinfo.email:</strong> To identify your account.</li>
</ul>

<h2>7. Data Retention and Deletion</h2>
<ul>
<li>You can disconnect your Google account at any time by revoking access through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account permissions</a>.</li>
<li>Upon disconnection, we delete your stored tokens and cached email data from our servers.</li>
<li>We do not retain your email content after you stop using the service.</li>
</ul>

<h2>8. Third-Party Services</h2>
<p>BeyondChats uses the following third-party services:</p>
<ul>
<li><strong>Google Gmail API:</strong> For reading, sending, and managing your emails.</li>
<li><strong>Google Pub/Sub:</strong> For real-time email notifications.</li>
<li><strong>Google Gemini AI:</strong> For generating AI reply suggestions (only when you explicitly request it).</li>
</ul>

<h2>9. Children's Privacy</h2>
<p>BeyondChats is not intended for use by children under the age of 13. We do not knowingly collect personal information from children.</p>

<h2>10. Changes to This Policy</h2>
<p>We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated "Last updated" date.</p>

<h2>11. Contact Us</h2>
<p>If you have any questions about this privacy policy, please contact us at <a href="mailto:support@beyondchats.com">support@beyondchats.com</a>.</p>

<a class="back" href="https://email-automation-rose.vercel.app">&larr; Back to BeyondChats</a>
</body>
</html>`);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
