import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const res = await axios.post(`${apiUrl}/auth/forgot-password`, {
        email,
      });

      setMessage(res.data.message);

      // Email ko next page me bhej do
      navigate("/reset-password", {
        state: { email },
      });
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
          Forgot Password
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Enter your registered email address.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            required
            className="w-full border rounded-lg px-4 py-3 mb-5 outline-none"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;