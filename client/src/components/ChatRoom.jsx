import { useEffect, useRef, useState, useCallback } from 'react';
import {
  socket,
  sendMessage,
  joinRoom,
  emitTypingStatus,
  onReceiveMessages,
  onChatHistory,
  onTypingUsers,
  disconnectSocket,
} from '../socket/socket';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

function ChatRoom({ username, room }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const chatEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const messageHistory = useRef(new Set()); // Track sent message IDs to deduplicate

  // Initialize connection and event listeners with cleanup
  useEffect(() => {
    socket.connect();
    joinRoom(room, username);

    const handleNewMessage = (data) => {
      // Deduplicate using a unique message identifier (e.g., timestamp + username)
      const messageId = `${data.timestamp}_${data.username}_${data.message}`;
      if (!messageHistory.current.has(messageId)) {
        messageHistory.current.add(messageId);
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleChatHistory = (history) => {
      // Initialize message history with existing messages
      messageHistory.current.clear();
      history.forEach((msg) => {
        const messageId = `${msg.timestamp}_${msg.username}_${msg.message}`;
        messageHistory.current.add(messageId);
      });
      setMessages(history);
    };

    const handleTypingUsers = (data) => {
      setTypingUsers((prevTyping) => {
        const exists = prevTyping.some((u) => u.username === data.username);
        if (data.isTyping) {
          if (!exists) return [...prevTyping, data];
        } else {
          return prevTyping.filter((u) => u.username !== data.username);
        }
        return prevTyping;
      });
    };

    onReceiveMessages(handleNewMessage);
    onChatHistory(handleChatHistory);
    onTypingUsers(handleTypingUsers);

    return () => {
      disconnectSocket();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      // Cleanup event listeners
      socket.off('newMessage', handleNewMessage);
      socket.off('chatHistory', handleChatHistory);
      socket.off('typingStatus', handleTypingUsers);
    };
  }, [room, username]);

  // Handle sending message
  const handleSend = useCallback(() => {
    if (message.trim()) {
      sendMessage(message.trim(), room, username);
      setMessage('');
      setShowEmojiPicker(false);
    }
  }, [message, room, username]);

  // Handle typing with debounce
  const handleTyping = useCallback((e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    emitTypingStatus(username, room, true);
    typingTimeout.current = setTimeout(() => {
      emitTypingStatus(username, room, false);
    }, 2000); // Reset typing status after 2 seconds
  }, [username, room]);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-green-600 text-white text-lg px-4 py-3">{room} Room</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${
              msg.username === username ? 'bg-green-500 text-white ml-auto' : 'bg-white text-black'
            }`}
          >
            <div className="text-sm font-semibold">{msg.username}</div>
            <div>{msg.message}</div>
            <div className="text-xs text-right text-gray-400">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 text-sm text-gray-500">
          {typingUsers.map((u) => u.username).join(', ')} typing...
        </div>
      )}

      <div className="flex items-center border-t p-2 bg-white">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="mr-2 text-xl"
        >
          😊
        </button>
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          value={message}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          autoFocus
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            showPreview={false}
            showSkinTones={false}
          />
        </div>
      )}
    </div>
  );
}

export default ChatRoom;