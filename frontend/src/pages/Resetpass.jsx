
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Resetpass() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Unable to reset password");
        return;
      }

      setMessage("Password reset successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-lg"
      >
        <h1 className="mb-2 text-2xl font-bold text-white">
          Reset Password
        </h1>

        <p className="mb-6 text-sm text-gray-400">
          Enter your new password below.
        </p>

        <label className="mb-2 block text-sm text-gray-200">
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
          minLength={8}
          className="mb-4 w-full rounded-lg border border-gray-600 bg-slate-700 p-3 text-white outline-none focus:border-indigo-500"
        />

        <label className="mb-2 block text-sm text-gray-200">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          minLength={8}
          className="mb-4 w-full rounded-lg border border-gray-600 bg-slate-700 p-3 text-white outline-none focus:border-indigo-500"
        />

        {message && (
          <p className="mb-4 text-sm text-indigo-300">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default Resetpass;
