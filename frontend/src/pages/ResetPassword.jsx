import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const api =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const res = await axios.post(`${api}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-2">
          Reset Password
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Enter OTP and your new password.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label className="font-medium">Email</label>

          <input
            type="email"
            value={email}
            readOnly
            className="w-full border rounded-lg px-4 py-3 mb-4 bg-gray-100"
          />

          <label className="font-medium">OTP</label>

          <input
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full border rounded-lg px-4 py-3 mb-4"
          />

          <label className="font-medium">New Password</label>

          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full border rounded-lg px-4 py-3 mb-4"
          />

          <label className="font-medium">Confirm Password</label>

          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full border rounded-lg px-4 py-3 mb-5"
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;