import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag ,faLock,faKeyboard,faTowerBroadcast} from "@fortawesome/free-solid-svg-icons";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import {socket} from '../socket'

 import { Link, Navigate, useNavigate } from 'react-router-dom';

const Landing = () => {

    const navigate=useNavigate()

   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")


    
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:8000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.msg || "Login failed");
      return;
    }

    navigate("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    alert("Unable to connect to the server");
  }
};



  return (
   <div className="min-h-screen bg-white">

       <header className="w-full border-b border-gray-200 bg-white">
  <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4">

    {/* LOGO + BRAND */}
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
        <FontAwesomeIcon icon={faComments} />
      </div>

      <div>
        <h1 className="text-xl font-bold text-zinc-900">
          Connect
        </h1>
        <p className="hidden sm:block text-xs text-gray-500">
          Real-time conversations
        </p>
      </div>
    </div>

    {/* STATUS */}
    <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-green-500"></span>
      <span className="text-sm font-medium text-green-800">
        Live chat
      </span>
    </div>

  </nav>
</header>

    
  <div className="flex flex-col lg:flex-row
                  lg:items-center lg:justify-evenly
                  gap-10 px-5 sm:px-8
                  py-10 lg:py-12
                  lg:min-h-screen ">

                 



 
{/* LEFT SECTION */}
<div className="w-full lg:w-1/2 px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16 xl:px-16 mb-15">

  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight sm:leading-snug">
    Real-Time conversations, in rooms or one-to-one.
  </h1>

  <p className="text-base sm:text-lg lg:text-xl text-gray-400 font-semibold mt-5 leading-relaxed max-w-xl">
    Pick a username and jump in. See who is online, who is typing,
    and message anyone privately.
  </p>

  {/* FEATURES */}
  <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

    {/* ROOM 1 */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 text-slate-600 bg-green-200">
        <FontAwesomeIcon icon={faHashtag} />
      </div>
      <span className="font-medium text-slate-600">
        Rooms
      </span>
    </div>

    {/* ROOM 2 */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 text-slate-600 bg-green-200">
        <FontAwesomeIcon icon={faLock} />
      </div>
      <span className="font-medium text-slate-600">
        Private messaging
      </span>
    </div>

    {/* ROOM 3 */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 text-slate-600 bg-green-200">
        <FontAwesomeIcon icon={faKeyboard} />
      </div>
      <span className="font-medium text-slate-600">
        Typing indicators
      </span>
    </div>

    {/* ROOM 4 */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 text-slate-600 bg-green-200">
        <FontAwesomeIcon icon={faTowerBroadcast} />
      </div>
      <span className="font-medium text-slate-600">
        Live presence
      </span>
    </div>

  </div>
</div>


{/* RIGHT SIDE */}

<div className="w-full max-w-md mx-auto mt-8 lg:mt-8 rounded-2xl bg-white border mb-15 border-gray-300 shadow-sm">
  <div className="p-5 sm:p-6">
    <h1 className="text-2xl font-bold text-zinc-800">
      Welcome back
    </h1>

    <p className="font-light text-base sm:text-lg text-zinc-600 mt-2">
      Login to continue chatting.
    </p>

    {/* Email */}
    <label className="block font-medium text-black text-base sm:text-lg mt-5 mb-2">
      Email
    </label>

    <input
      type="email"
      placeholder="you@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full h-12 px-4 bg-slate-50 border border-gray-300 text-black rounded-xl outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
    />

    {/* Password */}
    <label className="block font-medium text-black text-base sm:text-lg mt-5 mb-2">
      Password
    </label>

    <input
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full h-12 px-4 bg-slate-50 border border-gray-300 text-black rounded-xl outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
    />

    {/* Forgot password */}
    <div className="text-right mt-3">
     

      <Link to="/forgetpassword" className="text-green-700 hover:text-green-600 text-sm font-medium"
  >Forget password?</Link>
    </div>

    {/* Login */}
    <button onClick={handleLogin}
      type="button"
      className="w-full min-h-12 bg-green-700 text-white rounded-xl mt-6 hover:bg-green-600 active:scale-[0.98] transition duration-200"
    >
      Login
    </button>

    <p className="text-center text-sm text-zinc-600 mt-5">
      Don't have an account?{" "}
     <Link
  to="/signup"
  className="text-blue-400 hover:text-blue-300 font-semibold"
>
  Sign up
</Link>
    </p>
  </div>
</div>

</div>

</div>
  )
}
   

export default Landing
