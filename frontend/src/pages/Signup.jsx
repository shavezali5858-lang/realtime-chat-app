
import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlesignup=async(e)=>{
    e.preventDefault()

    try{
       const response = await fetch(
  "http://localhost:8000/api/auth/signup",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.trim(),
      email: email.trim(),
      password,
    }),
  }
);
        const data=await response.json();
          if (!response.ok) {
      alert(data.msg || "Signup failed");
      return;
    }
     alert("Account created successfully! Please log in.");
    window.location.href = "/";
    }catch(error){
         console.error("Signup error:", error);
    alert("Unable to connect to the server");
    }

  }

  return (
    <div className="min-h-screen flex bg-white text-gray-900">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-12 lg:px-20">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Join the conversation.
        </h1>

        <p className="text-gray-600 mt-6 text-lg leading-relaxed max-w-md">
          Create your account and connect with people in real time.
          Share messages, meet new people, and stay connected
          wherever you are.
        </p>

        <div className="mt-8 space-y-4 text-gray-700">
          <p>✦ Chat with people instantly</p>
          <p>✦ See who's online</p>
          <p>✦ Enjoy real-time conversations</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-green-100 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center">
            Create Account
          </h2>

          <p className="text-gray-600 text-center mt-2 mb-8">
            Sign up to get started
          </p>

          <form
            className="space-y-5"
            onSubmit={handlesignup}
          >
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors py-3 rounded-lg font-semibold"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-green-700 hover:text-green-600 font-semibold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
