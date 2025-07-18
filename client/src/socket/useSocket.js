import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket/socket';

export const useSocket = (username) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const connectedRef = useRef(false);

  useEffect(() => {
    if (username && !connectedRef.current) {
      socket.connect();
      socket.emit('user_join', { username });
      connectedRef.current = true;
    }

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('load_messages', (msgs) => setMessages(msgs));
    socket.on('user_list', setUsers);
    socket.on('typing_users', (data) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          if (!prev.find(user => user.username === data.username)) {
            return [...prev, data];
          }
        } else {
          return prev.filter(user => user.username !== data.username);
        }
        return prev;
      });
    });

    socket.on('user_joined', (user) => {
      setMessages(prev => [...prev, {
        system: true,
        message: `${user.username} joined.`,
        timestamp: new Date().toISOString()
      }]);
    });

    socket.on('user_left', (user) => {
      setMessages(prev => [...prev, {
        system: true,
        message: `${user.username} left.`,
        timestamp: new Date().toISOString()
      }]);
    });

    return () => {
      socket.disconnect();
      connectedRef.current = false;
    };
  }, [username]);

  const sendMessage = (message, to = null) => {
    socket.emit('send_message', { message, to });
  };

  return {
    isConnected,
    messages,
    users,
    typingUsers,
    sendMessage
  };
};
