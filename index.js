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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
