import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Sidebar({ username, setDarkMode, isDarkMode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users');
        setUsers(response.data.filter(user => user.username !== username));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [username]);

  return (
    <motion.div
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`w-full md:w-96 p-8 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-r border-gray-700 h-screen overflow-y-auto`}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500"
      >
        Network Nodes
      </motion.h2>
      {loading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400"
        >
          Scanning nodes...
        </motion.p>
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {users.map(user => (
            <motion.li
              key={user.username}
              whileHover={{ scale: 1.03, backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb' }}
              className={`p-4 rounded-xl mb-2 flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <motion.div
                animate={{ scale: user.online ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: user.online ? Infinity : 0, duration: 1.5 }}
                className={`w-3 h-3 rounded-full mr-3 ${user.online ? 'bg-green-500' : 'bg-red-500'}`}
              ></motion.div>
              <span>{user.username}</span>
            </motion.li>
          ))}
        </motion.ul>
      )}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 255, 0.7)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setDarkMode(!isDarkMode)}
        className="mt-6 w-full p-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-xl"
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </motion.button>
    </motion.div>
  );
}

export default Sidebar;