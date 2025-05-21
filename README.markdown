# Cyberpunk Chat App

A production-ready, real-time chat application with a cyberpunk-inspired UI, built with React, Node.js, Express, Socket.IO, and MongoDB. Features immersive animations, emoji support, user presence, and read receipts.

## Setup
1. **Back-End**:
   - Navigate to `server/`.
   - Create a `.env` file with `MONGODB_URI` (e.g., `mongodb://localhost:27017/chatApp` or MongoDB Atlas URI).
   - Run `npm install` and `npm start`.
2. **Front-End**:
   - Navigate to `client/`.
   - Run `npm install` and `npm start`.
3. **Test**: Open `http://localhost:3000` in two tabs with different usernames.

## Features
- Real-time private messaging
- Cyberpunk UI with neon gradients and 3D effects
- Parallax animations with Framer Motion
- Emoji picker, read receipts, and user presence
- Dark/light mode toggle

## Deployment
- **Client**: Vercel or Netlify
- **Server**: Render or Heroku
- Update `SOCKET_URL` in `client/src/components/Login.js` and `ChatWindow.js` for deployment.