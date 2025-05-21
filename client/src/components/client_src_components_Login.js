import { motion } from 'framer-motion';
import { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Login({ setUsername, setIsLoggedIn, isDarkMode }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (input.trim()) {
      socket.emit('join', input);
      setUsername(input);
      setIsLoggedIn(true);
    } else {
      setError('Username cannot be empty');
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex-1 flex items-center justify-center p-4"
    >
      <div className={`p-10 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl max-w-lg w-full animate-neonGlow`}>
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500"
        >
          Cyberpunk Chat
        </motion.h1>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-center mb-4"
          >
            {error}
          </motion.p>
        )}
        <input
          type="text"
          placeholder="Enter username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-full p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all`}
        />
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.7)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="mt-6 w-full p-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-cyan-600 transition-all"
        >
          Enter the Matrix
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Login;