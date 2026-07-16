<<<<<<< HEAD
# Real-Time Chat & Video Calling Web App

A modern, full-stack real-time chat and video calling application built with MERN stack.

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Socket.io Client
- Simple Peer (WebRTC)
- Axios
- Emoji Picker React

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT Authentication
- Bcryptjs
- CORS

## Features

### Authentication
- User Registration
- User Login
- JWT Token Authentication
- Protected Routes
- User Profile Management

### Real-Time Chat
- One-to-One Messaging
- Real-Time Online/Offline Status
- Typing Indicator
- Emoji Support
- Message Timestamps
- Auto Scroll to Latest Message

### Video Calling
- One-to-One Video Call
- Accept/Reject Call
- Mute/Unmute Audio
- Camera On/Off
- End Call Functionality
- Responsive Video Layout

### UI/UX
- Modern Dark Theme
- Fully Responsive Design
- Sidebar with Users List
- Chat Window Layout
- Beautiful Buttons and Animations
- Mobile Friendly

## Deployment

### Backend Deployment on Render
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set Root Directory to `backend`
5. Set Build Command to `npm install`
6. Set Start Command to `npm start`
7. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string (use MongoDB Atlas)
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your Vercel frontend URL

### Frontend Deployment on Vercel
1. Push your code to GitHub
2. Import your project on Vercel
3. Set Root Directory to `frontend`
4. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api`
   - `VITE_SOCKET_URL`: Your Render backend URL
5. Deploy!

## Local Development

### Prerequisites
- Node.js
- MongoDB

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env in backend/)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Frontend (.env in frontend/)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
=======
# chat
>>>>>>> 2f89923a73ee036798bddb9efd3c135dff20bd28
