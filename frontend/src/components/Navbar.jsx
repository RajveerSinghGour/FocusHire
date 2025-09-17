import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/report", label: "Reports" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        {/* Left Links */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-gray-700">
          {navLinks.map(({ to, label }) => (
            <Link
              key={label}
              to={to}
              className="hover:text-teal-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Center Logo */}
        <Link
          to="/"
          className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xl font-bold text-teal-600"
        >
          <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
            F
          </span>
          FocusHire
        </Link>

        {/* Right CTA */}
        <div className="hidden md:flex">
          <Link
            to="/home"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium shadow hover:bg-teal-700 transition"
          >
            Start Interview
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-md transition-all">
          <ul className="flex flex-col gap-4 p-6 font-medium text-gray-700">
            {navLinks.map(({ to, label }) => (
              <li key={label}>
                <Link
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block hover:text-teal-700 transition"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/home"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 bg-teal-600 text-white rounded-lg text-center shadow hover:bg-teal-700 transition"
              >
                Start Interview
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
