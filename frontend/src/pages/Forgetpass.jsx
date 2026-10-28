
import { useState } from "react";
import { Link } from "react-router-dom";

function Forgetpass() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/forget-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Unable to send reset email.");
        return;
      }

      setMessage(data.msg || "Check your email for the password reset link.");
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-900">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-12 lg:px-20">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Forgot your password?
        </h1>

        <p className="text-slate-600 mt-6 text-lg leading-relaxed max-w-md">
          Don't worry. It happens to everyone.
          Enter your email address to begin recovering access
          to your account.
        </p>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-green-100 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center">
            Reset Password
          </h2>

          <p className="text-slate-500 text-center mt-2 mb-8">
            Enter your registered email address
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
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

            {message && (
              <p role="status" className="text-sm text-green-700 break-words">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6 text-sm">
            Remembered your password?{" "}
            <Link
              to="/"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Forgetpass;
