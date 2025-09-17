import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const mailto = `mailto:hello@focushire.example?subject=Contact from ${encodeURIComponent(
      form.name
    )}&body=${encodeURIComponent(
      form.message + "\n\nFrom: " + form.email
    )}`;
    window.location.href = mailto;
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-10 m-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 mb-4">
            <FaPaperPlane className="text-teal-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-teal-700">Get in Touch</h2>
          <p className="text-gray-600 mt-2">
            Have questions or want a demo? Send us a message and we'll respond
            shortly.
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="flex flex-col items-center text-center p-6 border rounded-xl hover:shadow-lg transition">
            <FaEnvelope className="text-teal-600 text-xl mb-2" />
            <div className="font-semibold">Email</div>
            <div className="text-sm text-gray-600">
              hello@focushire.example
            </div>
          </div>
          <div className="flex flex-col items-center text-center p-6 border rounded-xl hover:shadow-lg transition">
            <FaPhone className="text-teal-600 text-xl mb-2" />
            <div className="font-semibold">Phone</div>
            <div className="text-sm text-gray-600">+1 (555) 123-4567</div>
          </div>
          <div className="flex flex-col items-center text-center p-6 border rounded-xl hover:shadow-lg transition">
            <FaMapMarkerAlt className="text-teal-600 text-xl mb-2" />
            <div className="font-semibold">Address</div>
            <div className="text-sm text-gray-600">
              123 Focus Street, Suite 400, Cityville, Country
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
                className="w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
              className="w-full mt-2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-teal-700 transition disabled:opacity-70"
            >
              <FaPaperPlane />
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
