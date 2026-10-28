# 💬 Real-Time Chat App

A responsive real-time chat application built with **React, Node.js, Express, Socket.IO, and MongoDB**. Users can join chat rooms, communicate privately with other online users, and share images in real time.

## ✨ Features

- **Real-Time Messaging:** Send and receive messages instantly using Socket.IO.
- **Room-Based Chat:** Create and join chat rooms to communicate with multiple users.
- **Private Messaging:** Send direct messages to individual users.
- **Online User Tracking:** See which users are currently online.
- **Image Sharing:** Upload and share images using Cloudinary.
- **Message Persistence:** Store room and private messages in MongoDB.
- **Responsive UI:** Chat comfortably on desktop, tablet, and mobile devices.
- **Username-Based Access:** Start chatting with a username without creating an account.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Tailwind CSS | Responsive styling |
| Node.js | Backend runtime |
| Express.js | REST API and server |
| Socket.IO | Real-time, bidirectional communication |
| MongoDB | Message storage |
| Mongoose | MongoDB object modeling |
| Cloudinary | Image uploads and hosting |
| Multer | Handling image uploads |

## 📁 Project Structure

```text
realtime-chat-app/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── cloudinary.js
│   ├── index.js
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas account
- [Cloudinary](https://cloudinary.com/) account for image sharing
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/realtime-chat-app.git
cd realtime-chat-app
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use the actual environment variable names expected by your backend. Keep your real `.env` file private and never commit credentials to GitHub.

Start the backend:

```bash
npm start
```

Make sure your `backend/package.json` defines the appropriate `start` script.

### 3. Set up the frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
```

Configure the frontend to use your backend URL. For local development, the API base URL is typically:

```text
http://localhost:8000
```

If using Vite environment variables, create `frontend/.env` with the variable name expected by your application, for example:

```env
VITE_API_URL=http://localhost:8000
```

Update your frontend code to read this variable if it currently uses hardcoded URLs.

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually `http://localhost:5173`.

## 🔄 How It Works

1. A user enters a username and connects to the chat server.
2. The server tracks connected users and their Socket.IO connections.
3. Users can join chat rooms or select another online user for a private conversation.
4. Messages are exchanged in real time through Socket.IO.
5. Messages are stored in MongoDB for persistence.
6. Images are uploaded to Cloudinary, and their URLs are shared through chat messages.

## 🔐 Security and Configuration

- Environment variables are used for database and Cloudinary credentials.
- `.env` files are excluded from version control.
- Image uploads are restricted by file type and size on the backend.
- Configure CORS to allow only your intended frontend origins in production.
- Use a MongoDB connection string with appropriate access permissions.

## 🌐 Deployment

The application can be deployed using:

- **Frontend:** Vercel or Netlify
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Image Hosting:** Cloudinary

For production, configure the deployed frontend URL, backend API URL, Socket.IO connection URL, CORS origins, and environment variables accordingly.

## 🔮 Future Improvements

- Message read receipts
- Authentication and user profiles
- Message notifications

## 👨‍💻 Author

**Shavez Ali**

B.Tech — Computer Science and Engineering

GitHub: shavezali5858-lang

---

If you find this project useful, consider giving the repository a ⭐ on GitHub.
