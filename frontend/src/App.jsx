import React, { useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPaperPlane,faHashtag } from "@fortawesome/free-solid-svg-icons";
import {Routes,Route} from 'react-router-dom'
import { useState } from "react";
import { Navigate } from "react-router-dom";

import {io} from "socket.io-client"
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Forgetpass from './pages/Forgetpass';
import Resetpass from './pages/Resetpass'

// const socket=io("http://localhost:8000")
import {socket} from './socket'

const App = () => {

useEffect(() => {
    const handleConnect = () => {
        console.log("connected to server", socket.id);

        const savedUsername = localStorage.getItem("username");

        if (savedUsername) {
            socket.emit("registeruser", savedUsername.trim());
        }
    };

    socket.on("connect", handleConnect);

    // Handle an already-connected socket
    if (socket.connected) {
        handleConnect();
    }

    return () => {
        socket.off("connect", handleConnect);
    };
}, []);


function ProtectedDashboard() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
   fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
    credentials: "include",
})
      .then((response) => {
        setAuthenticated(response.ok);
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return authenticated
    ? <Dashboard />
    : <Navigate to="/" replace />;
}















  return(
    <Routes>

      <Route path="/" element={<Landing/>}/>
      {/* <Route path ="/dashboard" element={<Dashboard/>}/> */}
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      <Route path="/signup" element={<Signup/>}/>
      <Route path='/forgetpassword' element={<Forgetpass/>}/>
      <Route path='/reset-password/:token' element={<Resetpass/>}/>
      



    </Routes>
  )
}

export default App

