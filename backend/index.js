require("dotenv").config()
const express=require("express")
const mongoose=require("mongoose")

const http=require("http")
const jwt=require("jsonwebtoken")
const cookieparser=require("cookie-parser")
const {Server}=require("socket.io")

const cors=require("cors")
const app=express();
const Messages=require("./models/messages")
const Pvtmessages=require("./models/privatemsg")
const User=require("./models/user")
const Imageroutes=require("./routes/imageroutes")

// const { socket } = require("../frontend/src/socket")

const authroutes=require("./routes/authroutes")

app.use(express.json());
app.use(cookieparser())

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,

}))
app.use("/api/auth", authroutes);
app.use("/api/images",Imageroutes)

const server=http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const Onlineusers=new Map()
const lastSeen = new Map();
const availableRooms=new Set();
function broadcastOnlineUsers() {
    io.sockets.sockets.forEach((clientSocket) => {
        const otherUsers = [...Onlineusers.keys()].filter(
            (username) => username !== clientSocket.username
        );

        clientSocket.emit("Onlineusers", otherUsers);
    });
}

function broadcastUserStatuses() {
    io.sockets.sockets.forEach((clientSocket) => {
        const statuses = [...new Set([
            ...Onlineusers.keys(),
            ...lastSeen.keys()
        ])]
        .filter((username) => username !== clientSocket.username)
        .map((username) => ({
            username,
            online: Onlineusers.has(username),
            lastSeen: lastSeen.get(username) || null
        }));

        clientSocket.emit("userStatuses", statuses);
    });
}


io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const tokenCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("token="));

    if (!tokenCookie) {
      return next(new Error("Authentication required"));
    }

    const token = decodeURIComponent(
      tokenCookie.substring("token=".length)
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "_id username email"
    );

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired authentication"));
  }
});


io.on("connection",(socket)=>{
    console.log("user connected:",socket.id)
       socket.emit("availableRooms", Array.from(availableRooms));
       console.log("Authenticated user:", socket.user?.username);


socket.on("registeruser", () => {
    console.log("Register event received");
    console.log("Authenticated socket user:", socket.user);

    const username = socket.user?.username;

    if (!username) {
        console.log("Username missing!");
        return;
    }

    socket.username = username;

    if (!Onlineusers.has(username)) {
        Onlineusers.set(username, new Set());
    }

    Onlineusers.get(username).add(socket.id);

    console.log("Online users:", [...Onlineusers.keys()]);

    broadcastOnlineUsers();
    broadcastUserStatuses();
});

socket.on("sendmessage", async ({ room, message, imageUrl }) => {
    try {
        console.log("Room message received:", {
            username: socket.username,
            room,
            message,
            imageUrl
        });

        const newMessages = await Messages.create({
            username: socket.username,
            room,
            message: message || "",
            imageUrl: imageUrl || ""
        });

        console.log("Room message saved:", newMessages);

        io.to(room).emit("message", {
            message: newMessages.message,
            imageUrl: newMessages.imageUrl,
            username: newMessages.username,
            time: newMessages.time
        });

    } catch (error) {
        console.error("Room message error:", error);
    }
});

socket.on("createRoom",(room)=>{
    const roomName=room.trim();

    if(!roomName){
        socket.emit("roomError","room name cannot be empty")
        return
    }

if(availableRooms.has(roomName)){
    socket.emit("roomError","room already exists")
    return;
}

availableRooms.add(roomName)
io.emit("availableRooms",Array.from(availableRooms))

console.log(roomName)


})


socket.on("joinroom",async ({room})=>{
    socket.join(room)
    console.log(socket.username, "joined",room)

    // const messages=await Messages.find({room}).sort({time:1}).lean()

    // socket.emit("messageHistory",(messages))
})


socket.on("leaveroom",(room)=>{
    socket.leave(room)

    console.log(socket.id,"leaved",room)
})



socket.on("privateMessage", async ({ to, message, imageUrl }) => {
    try {
        const from = socket.username;
        const receiver = to?.trim();

        console.log("Private message received by backend:", {
            from,
            receiver,
            message,
            imageUrl
        });

        if (!from || !receiver || (!message?.trim() && !imageUrl)) {
            console.log("Private message rejected by validation");
            return;
        }

        const savedMessage = await Pvtmessages.create({
            from,
            to: receiver,
            message: message?.trim() || "",
            imageUrl: imageUrl || ""
        });

        console.log("Saved private message:", savedMessage);

        const targetSockets = Onlineusers.get(receiver);

        console.log("Receiver sockets:", targetSockets);

        if (targetSockets) {
            targetSockets.forEach((socketId) => {
                io.to(socketId).emit("privateMessage", savedMessage);
            });
        }

        socket.emit("privateMessage", savedMessage);

    } catch (error) {
        console.error("Private message error:", error);
    }
});


socket.on("privateTyping", ({ to, isTyping }) => {
    const recipientSockets = Onlineusers.get(to);

    if (!recipientSockets) return;

    recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("privateUserTyping", {
            from: socket.username,
            isTyping
        });
    });
});



socket.on("typing", (room) => {
    console.log("Socket ID:", socket.id);
    console.log("Username:", JSON.stringify(socket.username));
    console.log("Room:", JSON.stringify(room));

    socket.to(room).emit("userTyping", {
        username: socket.username,
        room: room
    });
});

socket.on("disconnect", () => {
    const username = socket.username;

    if (!username) return;

    const userSockets = Onlineusers.get(username);

    if (userSockets) {
        userSockets.delete(socket.id);

        // Remove the username only when all their sockets disconnect
        if (userSockets.size === 0) {
            Onlineusers.delete(username);
            lastSeen.set(username, new Date().toISOString());
        }
    }

    console.log("User disconnected:", username);
    console.log("Online users:", [...Onlineusers.keys()]);

    broadcastOnlineUsers();
    broadcastUserStatuses();
});

})



app.get("/api/private-messages/conversations/:username", async (req, res) => {
  try {
    const username = req.params.username.trim();

    const messages = await Pvtmessages.find({
      $or: [
        { from: username },
        { to: username }
      ]
    }).sort({ createdAt: -1 });

    const conversations = new Map();

    for (const msg of messages) {
      const otherUser =
        msg.from === username ? msg.to : msg.from;

      if (!conversations.has(otherUser)) {
        conversations.set(otherUser, {
          username: otherUser,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          lastMessageFrom: msg.from
        });
      }
    }

    res.json([...conversations.values()]);
  } catch (error) {
    console.error("Fetch conversations error:", error);

    res.status(500).json({
      message: "Failed to fetch conversations"
    });
  }
});




mongoose.connect("mongodb://127.0.0.1:27017/Chatdata")
    .then(() => {
        console.log("mongo db connected!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:");
        console.log(error);
    });

server.listen(8000,()=>{
    console.log("server started on port 8000")
})


