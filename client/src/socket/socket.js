import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true,
  path: '/socket.io',
});

export const joinRoom = (room, username) => {
  socket.emit('joinRoom', { room, username });
};

export const sendMessage = (message, room, username) => {
  socket.emit('chatMessage', { message, room, username });
};

export const emitTypingStatus = (username, room, isTyping) => {
  socket.emit('typing', { username, room, isTyping });
};

export const onReceiveMessages = (cb) => {
  socket.on('newMessage', cb);
};

export const onChatHistory = (cb) => {
  socket.on('chatHistory', cb);
};

export const onTypingUsers = (cb) => {
  socket.on('typingStatus', cb);
};

export const disconnectSocket = () => {
  socket.disconnect();
};