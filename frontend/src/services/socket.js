import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (googleId, onNewEmails) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    socket.emit('register', googleId);
  });

  socket.on('new_emails', (data) => {
    if (onNewEmails) onNewEmails(data);
  });

  socket.on('reconnect', () => {
    socket.emit('register', googleId);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
