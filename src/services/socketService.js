/**
 * Service to manage WebSocket connections and notify clients in real-time.
 */
let io;
const userSockets = new Map(); // Map of googleId -> Set of socketIds

const socketService = {
    init: (socketIoInstance) => {
        io = socketIoInstance;

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Listen for user registration (googleId)
            socket.on('register', (googleId) => {
                if (googleId) {
                    if (!userSockets.has(googleId)) {
                        userSockets.set(googleId, new Set());
                    }
                    userSockets.get(googleId).add(socket.id);
                    socket.googleId = googleId;
                    console.log(`Socket ${socket.id} registered for user ${googleId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                if (socket.googleId && userSockets.has(socket.googleId)) {
                    userSockets.get(socket.googleId).delete(socket.id);
                    if (userSockets.get(socket.googleId).size === 0) {
                        userSockets.delete(socket.googleId);
                    }
                }
            });
        });
    },

    /**
     * Notify a specific user of an event
     * @param {string} googleId 
     * @param {string} event 
     * @param {object} data 
     */
    notifyUser: (googleId, event, data) => {
        if (io && userSockets.has(googleId)) {
            userSockets.get(googleId).forEach((socketId) => {
                io.to(socketId).emit(event, data);
            });
            return true;
        }
        return false;
    },

    /**
     * Broadcast an event to all connected clients
     */
    broadcast: (event, data) => {
        if (io) {
            io.emit(event, data);
        }
    }
};

module.exports = socketService;
