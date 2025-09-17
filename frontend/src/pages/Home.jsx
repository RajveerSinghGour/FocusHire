import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPlayCircle } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (!import.meta.env.VITE_API_URL) {
      console.warn("VITE_API_URL is not set — falling back to", apiUrl);
    }

    try {
      const response = await fetch(`${apiUrl}/api/start-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to start interview");

      const res = await response.json();
      navigate("/interview", { state: { interviewId: res.interviewId } });
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-50 via-green-50 to-emerald-50 px-4">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-md w-full m-20 p-8 transition transform hover:scale-[1.01]">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-600 to-green-500 text-white shadow-md mb-4">
            <FaPlayCircle className="text-2xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Start Your Interview
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your details below to begin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-semibold mb-2"
            >
              Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FaUser />
              </span>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                required
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FaEnvelope />
              </span>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                required
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-teal-600 to-green-500 hover:from-teal-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-200"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
