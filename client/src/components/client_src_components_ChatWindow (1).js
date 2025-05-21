import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const socket = io('http://localhost:5000');

function ChatWindow({ username, isDarkMode }) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    socket.on('private_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.from !== username) {
        socket.emit('read_message', { from: msg.from, to: username });
      }
      scrollToBottom();
    });

    socket.on('message_read', ({ from }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.from === from && msg.to === username ? { ...msg, read: true } : msg
        )
      );
    });

    socket.on('typing', ({ from }) => {
      if (from === recipient) setIsTyping(true);
    });

    socket.on('stop_typing', ({ from }) => {
      if (from === recipient) setIsTyping(false);
    });

    socket.on('user_status', ({ username: user, online }) => {
      if (user === recipient) {
        setMessages((prev) => [...prev]);
      }
    });

    return () => {
      socket.off('private_message');
      socket.off('message_read');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('user_status');
    };
  }, [recipient, username]);

  useEffect(() => {
    if (recipient && username) fetchMessages();
  }, [recipient, username]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      if (username && recipient) {
        const response = await axios.get(`http://localhost:5000/messages/${username}/${recipient}`);
        setMessages(response.data);
        scrollToBottom();
        socket.emit('read_message', { from: recipient, to: username });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (message.trim() && recipient) {
      socket.emit('private_message', { from: username, to: recipient, content: message });
      socket.emit('stop_typing', { from: username, to: recipient });
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value) {
      socket.emit('typing', { from: username, to: recipient });
    } else {
      socket.emit('stop_typing', { from: username, to: recipient });
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    socket.emit('typing', { from: username, to: recipient });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex-1 p-8 flex flex-col relative"
    >
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500"
      >
        {recipient ? `Connected to ${recipient}` : 'Select a node to connect'}
      </motion.h1>
      <motion.div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-6 rounded-3xl ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl relative`}
        style={{ transform: 'translateZ(0)' }}
      >
        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400"
          >
            Decrypting messages...
          </motion.p>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`mb-6 p-5 rounded-2xl max-w-md ${msg.from === username ? 'ml-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'mr-auto bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-600 dark:to-gray-500 dark:text-white'} shadow-xl transform hover:scale-105 transition-transform animate-neonGlow`}
              >
                <div className="flex items-center mb-2">
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center mr-3 text-lg font-bold"
                  >
                    {msg.from[0].toUpperCase()}
                  </motion.div>
                  <span className="font-semibold">{msg.from}</span>
                </div>
                <p className="text-lg">{msg.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.from === username && (
                    <span className="text-xs">
                      {msg.read ? '✔️ Read' : '✔️ Sent'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400 dark:text-gray-300 flex items-center mt-2"
          >
            {recipient} is typing
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="ml-1"
            >
              .
            </motion.span>
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
              className="ml-1"
            >
              .
            </motion.span>
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
              className="ml-1"
            >
              .
            </motion.span>
          </motion.div>
        )}
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex items-center relative"
      >
        <input
          type="text"
          placeholder="Recipient node"
          value={recipient}
          onChange={(e) => {
            setRecipient(e.target.value);
            fetchMessages();
          }}
          className={`w-1/3 p-4 rounded-xl border mr-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
        />
        <input
          type="text"
          placeholder="Transmit message..."
          value={message}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className={`flex-1 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="ml-2 p-4 bg-gray-600 text-white rounded-xl"
        >
          😊
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(0, 255, 255, 0.7)' }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          className="ml-2 p-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-xl"
        >
          Transmit
        </motion.button>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 right-0 z-10"
          >
            <Picker data={data} onEmojiSelect={addEmoji} theme={isDarkMode ? 'dark' : 'light'} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ChatWindow;