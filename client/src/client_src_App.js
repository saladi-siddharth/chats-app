import { useState } from 'react';
import { motion } from 'framer-motion';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900 text-white' : 'bg-gradient-to-br from-cyan-200 via-purple-200 to-pink-200 text-gray-900'} transition-all duration-1000`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="flex flex-col md:flex-row h-screen"
      >
        {isLoggedIn && (
          <Sidebar
            username={username}
            setDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
          />
        )}
        {!isLoggedIn ? (
          <Login setUsername={setUsername} setIsLoggedIn={setIsLoggedIn} isDarkMode={isDarkMode} />
        ) : (
          <ChatWindow username={username} isDarkMode={isDarkMode} />
        )}
      </motion.div>
    </div>
  );
}

export default App;