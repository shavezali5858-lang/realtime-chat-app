import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPaperPlane,faHashtag } from "@fortawesome/free-solid-svg-icons";
import { Navigate, useNavigate } from 'react-router-dom';
import {socket} from '../socket'

const Dashboard = () => {
  const navigate=useNavigate()

const [onlineUsers, setonlineUsers] = useState([])
const [username, setUsername] = useState("");

const [roomName, setroomName] = useState("")
const [showroomModal, setshowroomModal] = useState(false)
const [availableRooms, setavailableRooms] = useState([])
const [currentRoom, setcurrentRoom] = useState(null)
const [newuserName, setnewuserName] = useState("")
const [showusernameInput, setshowusernameInput] = useState(false)
const [message, setmessage] = useState("")
const [messages, setMessages] = useState([])
const [selectedUser, setSelectedUser] = useState(null)
const [privateMessage, setPrivateMessage] = useState("")
const [privateMessages, setprivateMessages] = useState([])
const [unreadCounts, setUnreadCounts] = useState({});
const [usertyping, setUsertyping] = useState("")
const [conversations, setConversations] = useState([]);
const [userStatuses, setUserStatuses] = useState([]);
const [privateUserTyping, setPrivateUserTyping] = useState("");
const [mobileView, setMobileView] = useState("sidebar");
const [user, setUser] = useState(null)
const [logout, setlogout] = useState(false)
const [searchQuery, setSearchQuery] = useState("");
const [selectedImage, setSelectedImage] = useState(null);
const [uploadingImage, setUploadingImage] = useState(false);
const CreateRoom=()=>{
  if(!roomName.trim()){
    alert("room name cannot be empty")
    return;
  }

socket.emit("createRoom",roomName)
setroomName("")
setshowroomModal(false)
console.log(roomName,"created")

}

const joinRoom=(room)=>{
    
  socket.emit("joinroom",{room})
  setcurrentRoom(room)
  console.log("joined",room)
}

const leaveRoom=()=>{

  if(!currentRoom){
    return;
  }
  socket.emit("leaveroom",currentRoom)
  setcurrentRoom(null)
    

  
}



const sendImage = async () => {
    if (!selectedImage || uploadingImage) return;

    try {
        setUploadingImage(true);

        const formData = new FormData();
        formData.append("image", selectedImage);

       
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/images/upload`,
        {
            method: "POST",
            body: formData
        }
    );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || "Image upload failed");
        }

        console.log("Uploaded image URL:", data.imageUrl);

        if (selectedUser) {
            const receiver =
                typeof selectedUser === "string"
                    ? selectedUser
                    : selectedUser.username;

            const payload = {
                to: receiver,
                message: "",
                imageUrl: data.imageUrl
            };

            console.log("Sending private image:", payload);
            socket.emit("privateMessage", payload);

        } else if (currentRoom) {
            const payload = {
                room: currentRoom,
                message: "",
                imageUrl: data.imageUrl
            };

            console.log("Sending room image:", payload);
            socket.emit("sendmessage", payload);
        }

        setSelectedImage(null);

    } catch (error) {
        console.error("Image sending error:", error);
        alert(error.message || "Could not send image");
    } finally {
        setUploadingImage(false);
    }
};

useEffect(() => {
    if (!user?.username) return;

    const handleOnlineUsers = (users) => {
        console.log("Online users received:", users);
        setonlineUsers(users);
    };

    const registerUser = () => {
        console.log("Registering user:", user.username);
        socket.emit("registeruser");
    };

    socket.on("Onlineusers", handleOnlineUsers);
    socket.on("connect", registerUser);

    if (socket.connected) {
        registerUser();
    } else {
        socket.connect();
    }

    return () => {
        socket.off("Onlineusers", handleOnlineUsers);
        socket.off("connect", registerUser);
    };
}, [user]);

const filteredUsers = onlineUsers.filter((user) =>
  user.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredRooms = [...availableRooms].filter((room) =>
  room.toLowerCase().includes(searchQuery.toLowerCase())
);


const ChangeUsername = () => {
    alert("Username changes must be saved to your account first.");
    setshowusernameInput(false);
};


const Sendmessage=(e)=>{
  e.preventDefault();

  if(!message.trim() || !currentRoom){
    return;
  }
  socket.emit("sendmessage",{
    room:currentRoom,
    message:message.trim()
  })
  setmessage("")
}



useEffect(() => {
    const handleMessage = (newMessage) => {
        console.log("Message received in frontend:", newMessage);

        setMessages((prevMessages) => [
            ...prevMessages,
            newMessage
        ]);
    };

    socket.on("message", handleMessage);

    return () => {
        socket.off("message", handleMessage);
    };
}, []);
  

useEffect(()=>{
  socket.on("availableRooms",(rooms)=>{
    setavailableRooms(rooms)
  })

  return ()=>{
    socket.off("availableRooms")
  }

},[])



useEffect(() => {
  const handlePrivateMessage = (message) => {
    console.log("Private message received:", message);
    console.log("Current username:", username);

    setprivateMessages((prev) => [...prev, message]);

    const otherUser =
      message.from === username ? message.to : message.from;

    setConversations((prev) => {
      const updatedConversation = {
        username: otherUser,
        lastMessage: message.message,
        lastMessageAt: message.createdAt || new Date().toISOString(),
        lastMessageFrom: message.from,
      };

      const remaining = prev.filter(
        (conversation) => conversation.username !== otherUser
      );

      return [updatedConversation, ...remaining];
    });

    if (message.from === username) return;

    const selectedUsername =
      typeof selectedUser === "string"
        ? selectedUser
        : selectedUser?.username;

    if (message.from !== selectedUsername) {
      setUnreadCounts((prev) => ({
        ...prev,
        [message.from]: (prev[message.from] || 0) + 1,
      }));
    }
  };

  socket.on("privateMessage", handlePrivateMessage);

  return () => {
    socket.off("privateMessage", handlePrivateMessage);
  };
}, [username, selectedUser]);

useEffect(() => {
  const handlePrivateMessageError = (data) => {
    console.log(data.message);
  };

  socket.on("privateMessageError", handlePrivateMessageError);

  return () => {
    socket.off("privateMessageError", handlePrivateMessageError);
  };
}, []);


useEffect(() => {
  let typingTimeout;

  const handleUserTyping = ({ username, room }) => {
    console.log("Typing event:", username, room);

    if (room === currentRoom) {
      setUsertyping(username);

      clearTimeout(typingTimeout);

      typingTimeout = setTimeout(() => {
        setUsertyping("");
      }, 2000);
    }
  };

  socket.on("userTyping", handleUserTyping);

  return () => {
    clearTimeout(typingTimeout);
    socket.off("userTyping", handleUserTyping);
  };
}, [currentRoom]);

useEffect(() => {
  if (!username) return;

  const fetchConversations = async () => {
    try {
    const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/private-messages/conversations/${encodeURIComponent(username)}`
);

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  fetchConversations();
}, [username]);


useEffect(() => {
  const handleUserStatuses = (statuses) => {
    setUserStatuses(statuses);
  };

  socket.on("userStatuses", handleUserStatuses);

  return () => {
    socket.off("userStatuses", handleUserStatuses);
  };
}, []);


useEffect(() => {
  let typingTimeout;

  const handlePrivateTyping = ({ from, isTyping }) => {
    if (!isTyping) {
      clearTimeout(typingTimeout);
      setPrivateUserTyping("");
      return;
    }

    setPrivateUserTyping(from);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      setPrivateUserTyping("");
    }, 2000);
  };

  socket.on("privateUserTyping", handlePrivateTyping);

  return () => {
    clearTimeout(typingTimeout);
    socket.off("privateUserTyping", handlePrivateTyping);
  };
}, []);







useEffect(() => {
  const fetchUser = async () => {
    try {
     const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/me`,
    {
        method: "GET",
        credentials: "include",
    }
);
      if (!response.ok) {
        console.log("Unable to fetch user details");
        return;
      }

      const data = await response.json();
      setUser(data.user);
    
setUsername(data.user.username);
    } catch (error) {
      console.error("Fetch user error:", error);
    }
  };

  fetchUser();
}, []);





const handleLogout = async () => {
  try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/logout`,
    {
        method: "POST",
        credentials: "include",
    }
);

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    socket.disconnect();

    setUser(null);
    setUsername("");
    navigate("/")
  } catch (error) {
    console.error("Logout error:", error);
  }
};



  return (
   
      <div className="flex h-dvh overflow-hidden bg-slate-300">
         
         {/* SIDEBAR */}
   
{/* SIDEBAR */}

<div
  className={`${
    mobileView === "chat" ? "hidden md:flex" : "flex"
  } h-dvh w-full md:w-64 lg:w-72 shrink-0 bg-slate-900 border-r border-gray-800 flex-col overflow-hidden`}
>


  {/* APP NAME */}
  <h1 className="font-semibold text-2xl p-5 sm:p-6 text-white shrink-0">
    ChatApp
  </h1>

  {/* SEARCH */}
  <div className="px-4 pb-3 relative shrink-0">
    <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="absolute top-1/2 left-7 text-gray-400 -translate-y-1/2"
    />

    <input
      type="text"
      placeholder="Search Users or rooms"
      value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full min-w-0 bg-slate-800 pl-10 pr-3 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500"
    />
     {searchQuery && (
    <button
      type="button"
      onClick={() => setSearchQuery("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
      aria-label="Clear search"
    >
      ×
    </button>
  )}
  </div>
  
{/* BACK TO HOME BUTTON */}
<button
  onClick={() => window.location.href = "/"}
  className="m-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-500 transition"
>
  <span>←</span>
  <span>Back to Home</span>
</button>


  {/* SCROLLABLE SIDEBAR CONTENT */}
  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

    {/* ROOMS */}
    <div className="px-4 mt-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="text-gray-400 font-semibold">
          ROOMS
        </h2>

        <button
          onClick={() => setshowroomModal(true)}
          className="bg-gray-700 text-gray-200 hover:bg-gray-600 px-3 py-2 rounded-xl text-sm whitespace-nowrap"
        >
          Create room
        </button>
      </div>

      <div className="mt-5">
        <h2 className="mb-4 text-lg sm:text-xl font-semibold text-white">
          Available Rooms
        </h2>

        {availableRooms.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No rooms available yet.
          </p>
        ) : (
          availableRooms.map((room) => (
            <div
              key={room}
              className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-800 p-3"
            >
              <span className="text-white break-all">
                {room}
              </span>

             <button
  onClick={() => {
    joinRoom(room);
    setMobileView("chat");
  }}
  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
>
  Join Room
</button>
            </div>
          ))
        )}
      </div>


{/* ONLINE USERS */}

<div className="p-4">
  <h3 className="text-gray-500 text-xs font-semibold uppercase mb-3">
    Online Users
  </h3>

  {filteredUsers.length === 0 ? (
    <p className="text-gray-500 text-sm">
      {searchQuery.trim()
        ? "No matching users found."
        : "No online users..."}
    </p>
  ) : (
    filteredUsers.map((user, index) => {
      const name =
        typeof user === "string" ? user : user.username;

      const unreadCount = unreadCounts[name] || 0;

      return (
        <button
          key={name || index}
          onClick={() => {
            setSelectedUser(user);
            setMobileView("chat");

            setUnreadCounts((prev) => ({
              ...prev,
              [name]: 0,
            }));
          }}
          className="w-full min-w-0 flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 text-left transition"
        >
          <span className="w-2 h-2 shrink-0 bg-green-500 rounded-full" />

          <span className="min-w-0 flex-1 truncate text-white text-sm">
            {name}
          </span>

          {unreadCount > 0 && (
            <span className="ml-auto shrink-0 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      );
    })
  )}
</div>


          {/* ONLINE STATUS */}
          <span className="w-2 h-2 shrink-0 bg-green-500 rounded-full" />

          {/* USERNAME */}
          <span className="min-w-0 flex-1 truncate text-white text-sm">
            {name}
          </span>

         

    </div>

    {/* DIRECT MESSAGES */}
    <div className="p-4 mt-5">
      <h2 className="text-gray-400 font-semibold text-lg mb-2">
        Direct messages
      </h2>

      {conversations.length === 0 ? (
        <p className="text-gray-500 text-sm py-2">
          No conversations yet
        </p>
      ) : (
        conversations.map((conversation) => {
          const status = userStatuses.find(
            (user) => user.username === conversation.username
          );

          return (
            <div
              key={conversation.username}
             onClick={() => {
  setSelectedUser(conversation.username);
  setMobileView("chat");
}}
              className="flex items-start gap-2 py-3 px-2 cursor-pointer hover:bg-gray-800 rounded-lg"
            >
              <span
                className={`font-bold mt-1 shrink-0 ${
                  status?.online
                    ? "text-green-400"
                    : "text-gray-500"
                }`}
              >
                ●
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-white truncate">
                  {conversation.username}
                </p>

                <p className="text-xs text-gray-500">
                  {status?.online
                    ? "Online"
                    : status?.lastSeen
                      ? `Last seen ${new Date(
                          status.lastSeen
                        ).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}`
                      : "Offline"}
                </p>

                <p className="text-gray-400 text-xs truncate mt-1">
                  {conversation.lastMessageFrom === username
                    ? `You: ${conversation.lastMessage}`
                    : conversation.lastMessage}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>

  {/* USER PROFILE — ALWAYS AT BOTTOM */}
  

<div className="shrink-0 border-t border-slate-800 p-4">
  <div className="flex items-center gap-3 min-w-0">
    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-green-600 text-white font-bold">
      {user?.username?.charAt(0).toUpperCase() || "U"}
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-white font-bold truncate">
        {user?.username || username}
      </p>

      <p className="text-gray-400 text-xs truncate">
        {user?.email || ""}
      </p>
    </div>

    <button
      onClick={() => {
        setshowusernameInput(true);
        setnewuserName(username);
      }}
      className="text-xs sm:text-sm shrink-0 bg-gray-700 px-2 py-1 rounded text-green-300 hover:text-green-200"
    >
      Change
    </button>
  </div>
  
<button
  onClick={()=>setlogout(true)}
  className="w-full mt-3 rounded-lg bg-green-700 px-4 py-2 text-white font-medium hover:bg-green-600 transition"
>
  Logout
</button>


</div>

{logout && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800">
        Confirm Logout
      </h2>

      <p className="mt-3 text-sm text-slate-600">
        Are you sure you want to logout?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setlogout(false)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
)}

  {/* CHANGE USERNAME MODAL */}
  {showusernameInput && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-5 sm:p-6 shadow-2xl">

        <h3 className="mb-4 text-lg font-semibold text-white">
          Change Username
        </h3>

        <input
          type="text"
          value={newuserName}
          onChange={(e) => setnewuserName(e.target.value)}
          placeholder="Enter new username"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-indigo-500"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => setshowusernameInput(false)}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={ChangeUsername}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )}
</div>

   
  
  {/* CENTER CHAT AREA */}
<div className="flex-1 min-w-0 min-h-0 h-dvh flex flex-col bg-slate-50 overflow-hidden">

    {/* <button onClick={()=>navigate("/")}>Landing</button> */}
   
    
{/* ROOM HEADER */}



{/* CHAT HEADER */}
<div className="w-full shrink-0 bg-white border-b border-gray-200">
  <div className="flex justify-between items-center gap-3 px-3 sm:px-5 py-3 sm:py-4">

    <div className="min-w-0 flex-1">
      {selectedUser ? (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <button
             onClick={() => {
  setSelectedUser(null);
  setMobileView("sidebar");
}}
              className="shrink-0 rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
            >
              ← Back
            </button>

            <span className="text-green-500 shrink-0">●</span>

            <h2 className="font-bold text-slate-800 truncate">
              {typeof selectedUser === "string"
                ? selectedUser
                : selectedUser.username}
            </h2>
          </div>

          <p className="text-gray-500 text-xs mt-1 ml-12">
            Private conversation
          </p>
        </>
      ) : currentRoom ? (
        <>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faHashtag}
              className="text-gray-500 text-sm"
            />
            <h2 className="font-bold text-slate-800 truncate">
              {currentRoom}
            </h2>
          </div>

          <p className="text-gray-500 text-xs mt-1 ml-5">
            Welcome to {currentRoom} room.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-bold text-slate-800">
            Welcome to ChatApp
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            No room joined yet. Join a room from the sidebar to start chatting.
          </p>
        </>
      )}
    </div>

    {!selectedUser && currentRoom && (
      <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
        <button
          className="px-2 sm:px-3 h-9 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-xs sm:text-sm"
           onClick={() => {
    leaveRoom(); 
    setMobileView("sidebar");
  }}
          >
          Leave room
        </button>

        <button
  onClick={() => setMobileView("sidebar")}
  className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition md:hidden"
>
  ← Back
</button>

        <span className="text-green-500">●</span>
        <span className="hidden sm:inline">Online</span>
      </div>
    )}


    {/* <button
  onClick={() => setMobileView("users")}
  className="lg:hidden shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
>
  Online Users
</button> */}
  </div>
</div>




{/* MESSAGES AREA */}

<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4">
  {selectedUser ? (
  /* PRIVATE CHAT UI */
  <div className="flex h-full flex-col p-4">

    {privateMessages.filter((msg) => {
      const selectedUsername =
        typeof selectedUser === "string"
          ? selectedUser
          : selectedUser.username;

      return (
        (msg.from === username && msg.to === selectedUsername) ||
        (msg.from === selectedUsername && msg.to === username)
      );
    }).length === 0 ? (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-indigo-600">
            {(typeof selectedUser === "string"
              ? selectedUser
              : selectedUser.username
            )?.charAt(0).toUpperCase()}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-slate-700">
          {typeof selectedUser === "string"
            ? selectedUser
            : selectedUser.username}
        </h2>

        <p className="text-sm text-gray-500 mt-3">
          Start your private conversation!
        </p>
      </div>
    ) : (
      privateMessages
        .filter((msg) => {
          const selectedUsername =
            typeof selectedUser === "string"
              ? selectedUser
              : selectedUser.username;

          return (
            (msg.from === username && msg.to === selectedUsername) ||
            (msg.from === selectedUsername && msg.to === username)
          );
        })
        .map((msg, index) => {
          const isMyMessage = msg.from === username;

          return (
            <div
              key={index}
              className={`flex mb-3 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] break-words rounded-2xl p-3 shadow-sm ${
                  isMyMessage
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-slate-800"
                }`}
              >
                <p className="text-xs font-semibold mb-1">
                  {isMyMessage ? "You" : msg.from}
                </p>

                <p className="break-words">{msg.message}</p>
                {msg.imageUrl && (
  <img
    src={msg.imageUrl}
    alt="Shared image"
    className="mt-2 max-w-full max-h-64 rounded-lg object-contain"
  />
)}

                <p className="mt-2 text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
               
              </div>
     
            </div>
          );
        })
       

    )}
   
    
  </div>
  

  ) : !currentRoom ? (
    /* NO ROOM SELECTED */
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <FontAwesomeIcon
        icon={faHashtag}
        className="text-gray-300 text-4xl mb-4"
      />

      <h2 className="text-xl font-semibold text-slate-700">
        No room joined
      </h2>

      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Choose an available room from the sidebar to join the conversation.
      </p>
    </div>
   

  ) : messages.length === 0 ? (
    <p className="text-center text-sm text-gray-400">
      Welcome to #{currentRoom}. Start the conversation!
    </p>

  ) : (
    messages.map((msg, index) => {
      const IsmyMessage = msg.username === username;

      return (
        <div
          key={index}
          className={`flex ${
            IsmyMessage ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[75%] break-words rounded-2xl p-3 shadow-sm ${
              IsmyMessage
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-slate-800"
            }`}
          >
            <p
              className={`text-xs font-semibold mb-1 ${
                IsmyMessage ? "text-indigo-100" : "text-indigo-600"
              }`}
            >
              {IsmyMessage ? "you" : msg.username}
            </p>

            <p className="break-words">{msg.message}</p>
          {msg.imageUrl && (
  <img
    src={msg.imageUrl}
    alt="Shared image"
    className="mt-2 max-w-full max-h-64 rounded-lg object-contain"
  />
)}

            {msg.time && (
              <p
                className={`mt-2 text-xs ${
                  IsmyMessage ? "text-indigo-200" : "text-gray-400"
                }`}
              >
                {new Date(msg.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
        
      );
    })
  )}
  {!selectedUser && currentRoom && usertyping && (
    <p className="self-start max-w-full break-words   px-3 py-2 text-sm font-medium bg-slate-100 rounded-xl text-slate-700">
      {usertyping} is typing...
    </p>
  )}
</div>

   
     {privateUserTyping ===
  (typeof selectedUser === "string"
    ? selectedUser
    : selectedUser?.username) && (
  <div className="px-4 py-2 text-sm text-slate-800 bg-slate-100 rounded-xl border-none italic w-50 h-8">
    {privateUserTyping} is typing...
  </div>
)}
    
{/* CHAT INPUT AREA */}

{selectedUser ? (
  /* PRIVATE MESSAGE INPUT */
  
<form
  onSubmit={(e) => {
    e.preventDefault();

    if (!privateMessage.trim() || !selectedUser) return;

    const receiver =
      typeof selectedUser === "string"
        ? selectedUser
        : selectedUser.username;

    console.log("Logged-in username:", username);
    console.log("Selected recipient:", receiver);
    console.log("Sending message:", privateMessage.trim());

    socket.emit("privateMessage", {
      to: receiver,
      message: privateMessage.trim(),
    });

    setPrivateMessage("");
  }}
>

     
      
    
    {/* // className="p-4 bg-white border-t border-gray-200"
    className="shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200" */}
  
    <p className="text-xs text-gray-500 mb-2">
      Start a private conversation with{" "}
      {typeof selectedUser === "string"
        ? selectedUser
        : selectedUser.username}
    </p>
    
{selectedImage && (
  <div className="mb-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
    <img
      src={URL.createObjectURL(selectedImage)}
      alt="Selected image preview"
      className="h-14 w-14 rounded-lg object-cover"
    />

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-gray-800">
        {selectedImage.name}
      </p>
      <p className="text-xs text-gray-500">
        {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
      </p>
    </div>

    <button
      type="button"
      onClick={() => setSelectedImage(null)}
      className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-red-600"
      aria-label="Remove selected image"
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  </div>
)}

 
{/* Private message image controls */}
<div className="flex flex-wrap items-center gap-2 px-1 py-2">
  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
    <i className="fa-regular fa-image text-indigo-600"></i>
    {selectedImage ? "Change image" : "Choose image"}

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        setSelectedImage(e.target.files?.[0] || null);
        e.target.value = "";
      }}
    />
  </label>

  {selectedImage && (
    <button
      type="button"
      onClick={sendImage}
      disabled={uploadingImage}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <i
        className={`fa-solid ${
          uploadingImage ? "fa-spinner fa-spin" : "fa-paper-plane"
        }`}
      ></i>
      {uploadingImage ? "Uploading..." : "Send image"}
    </button>
  )}
</div>



   <div className="flex items-center gap-2">
      <input
        type="text"
        value={privateMessage}
       onChange={(e) => {
  const value = e.target.value;
  setPrivateMessage(value);

  const receiver =
    typeof selectedUser === "string"
      ? selectedUser
      : selectedUser?.username;

  if (receiver) {
    socket.emit("privateTyping", {
      to: receiver,
      isTyping: value.length > 0
    });
  }
}}
        placeholder="Start a private conversation..."
      className="min-w-0 flex-1 rounded-xl border border-gray-300
           px-4 py-3 text-sm outline-none
           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 p-4"
      />

      <button
        type="submit"
        disabled={!privateMessage.trim()}
       className="shrink-0 px-4 sm:px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        Send
      </button>
    </div>
  </form>

) : currentRoom ? (



 <form
  onSubmit={Sendmessage}
  // className="p-4 bg-white border-t border-gray-200"
  className="shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200"
>
  
{/* Selected image preview */}
{selectedImage && (
  <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
    <img
      src={URL.createObjectURL(selectedImage)}
      alt="Selected preview"
      className="h-16 w-16 rounded-lg object-cover"
    />

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-gray-800">
        {selectedImage.name}
      </p>
      <p className="text-xs text-gray-500">
        {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
      </p>
    </div>

    <button
      type="button"
      onClick={() => setSelectedImage(null)}
      className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-red-600"
      aria-label="Remove selected image"
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  </div>
)}

 
{/* Image upload controls */}

<div className="flex flex-wrap items-center gap-2 px-1 py-2">
  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
    <i className="fa-regular fa-image text-indigo-600"></i>
    {selectedImage ? "Change image" : "Choose image"}

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        setSelectedImage(e.target.files?.[0] || null);
        e.target.value = "";
      }}
    />
  </label>

  {selectedImage && (
    <button
      type="button"
      onClick={sendImage}
      disabled={uploadingImage}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      <i className={`fa-solid ${uploadingImage ? "fa-spinner fa-spin" : "fa-paper-plane"}`}></i>
      {uploadingImage ? "Uploading..." : "Send image"}
    </button>
  )}
</div>


  
<div className="mt-2 flex items-center gap-2 sm:gap-3">
  <input
    type="text"
    value={message}
    onChange={(e) => {
      setmessage(e.target.value);

      if (currentRoom) {
        socket.emit("typing", currentRoom);
      }
    }}
    placeholder={`Message #${currentRoom}...`}
    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
  />

  <button
    type="submit"
    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 sm:px-5"
  >
    <span>Send</span>
    <i className="fa-solid fa-paper-plane"></i>
  </button>
</div>

</form>


) : (
  /* NO ROOM SELECTED */
  <div className="p-4 bg-gray-50 border-t border-gray-200">
    <input
      type="text"
      disabled
      placeholder="Join a room to start conversation..."
      className="w-full px-4 py-3 rounded-xl border border-gray-200
                 bg-gray-100 text-gray-400 cursor-not-allowed"
    />
  </div>
)}

   </div>
   
   {/* RIGHT SIDEBAR - ONLINE USERS */}
   
{/* RIGHT SIDEBAR — MEMBERS */}
<div className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col bg-slate-50 border-l border-gray-200 min-h-0 overflow-hidden">

  {/* HEADER */}
  <div className="p-4 border-b border-gray-200 shrink-0">
    <h2 className="text-zinc-800 font-semibold">
      Members
    </h2>

    <p className="text-gray-500 text-sm mt-1">
      {onlineUsers.length} online
    </p>
  </div>

  {/* ONLINE USERS */}
  <div className="p-4 flex-1 min-h-0 overflow-y-auto">
    <h3 className="text-gray-500 text-xs font-semibold uppercase mb-3">
      Online
    </h3>

    {onlineUsers.length === 0 ? (
      <p className="text-gray-500 text-sm">
        No online users...
      </p>
    ) : (
      onlineUsers.map((user, index) => {
        const name =
          typeof user === "string" ? user : user.username;

        const unreadCount = unreadCounts[name] || 0;

        return (
          <button
            key={name || index}
            onClick={() => {
              setSelectedUser(user);

              setUnreadCounts((prev) => ({
                ...prev,
                [name]: 0,
              }));
            }}
            className="w-full min-w-0 flex items-center gap-3 p-2 rounded-lg hover:bg-slate-200 text-left transition"
          >
            {/* ONLINE STATUS */}
            <span className="w-2 h-2 shrink-0 bg-green-500 rounded-full" />

            {/* USERNAME */}
            <span className="min-w-0 flex-1 truncate text-slate-800 text-sm">
              {name}
            </span>

            {/* UNREAD COUNT */}
            {unreadCount > 0 && (
              <span className="ml-auto shrink-0 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        );
      })
    )}
  </div>
</div>




{showroomModal && (
  <div className='fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center'>

    <div className='w-130 h-60 rounded-xl rounded-xl bg-slate-900 p-6 shadow-xl'>

      <h1 className=' text-white font-bold text-2xl'>Create room</h1>

      <input type="text" placeholder='enter room name'className='w-full h-10 bg-gray-800 rounded-xl border-1 border-gray-900 text-gray-300 p-2 mt-5'
      value={roomName}
      onChange={(e)=>{
        setroomName(e.target.value)
      }}
      
      />

<div className='flex gap-4 mt-10 justify-center'>
      <button className='w-35 h-10 bg-red-600 rounded-xl p-2 text-white active:scale-105 '
      
      onClick={()=>setshowroomModal(false)}>Cancel</button>


      <button onClick={CreateRoom}
      className='w-35 h-10 bg-indigo-600 rounded-xl p-2 text-white active:scale-105'>Create</button>
      </div>


    </div>


    </div>
)}







   
   </div>
   
   
   
   
   
   
   
   
   
   
   
   
   
     
     )
    }
  
   
  
export default Dashboard
