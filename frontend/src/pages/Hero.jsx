import React from "react";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaFilePdf,
  FaShieldAlt,
  FaChartBar,
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const features = [
  {
    icon: <FaRobot className="text-teal-600 w-10 h-10" />,
    title: "AI-Powered Monitoring",
    description:
      "Real-time candidate tracking with intelligent face and object detection for secure interviews.",
  },
  {
    icon: <FaChartBar className="text-teal-600 w-10 h-10" />,
    title: "Deep Analytics",
    description:
      "Focus scores, attention charts, and suspicious activity logs for smarter evaluations.",
  },
  {
    icon: <FaFilePdf className="text-teal-600 w-10 h-10" />,
    title: "Proctoring Reports",
    description:
      "Instantly download structured PDF reports summarizing candidate performance and integrity.",
  },
  {
    icon: <FaShieldAlt className="text-teal-600 w-10 h-10" />,
    title: "Enterprise Security",
    description:
      "End-to-end encryption ensures confidential and tamper-proof interview recordings.",
  },
];

const testimonials = [
  {
    name: "Raj Malhotra",
    role: "Talent Acquisition Lead",
    quote:
      "This platform gave us full confidence in remote hiring. Tracking focus and devices in real time is a game changer.",
  },
  {
    name: "Priya Verma",
    role: "Technical Recruiter",
    quote:
      "The automated reports cut down manual effort. We save hours per week while ensuring candidate integrity.",
  },
  {
    name: "David Thompson",
    role: "Head of Engineering",
    quote:
      "Finally, an interview monitoring tool that integrates AI accuracy with a seamless user experience.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-teal-50 via-green-50 to-emerald-50 text-gray-900">
      {/* Hero Section */}
      <header className="w-full py-20 bg-gradient-to-r from-teal-100 via-green-100 to-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-800 leading-tight">
              Intelligent Proctoring for Video Interviews
            </h1>
            <p className="mt-4 text-lg text-gray-700 max-w-xl mx-auto lg:mx-0">
              Ensure fair hiring with automated focus tracking, object detection,
              and instant reporting.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start gap-4">
              <Link
                to="/home"
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold shadow-md hover:bg-teal-700 transition"
              >
                Start Session
              </Link>
              <Link
                to="/report"
                className="px-6 py-3 rounded-xl border border-teal-600 text-teal-700 font-semibold hover:bg-teal-50 transition"
              >
                View Results
              </Link>
            </div>
          </div>
          {/* Candidate Card instead of video preview */}
          <div className="w-full h-64 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-6">
            <img
              src="https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg"
              alt="Candidate"
              className="w-24 h-24 rounded-full border-4 border-teal-200 mb-4"
            />
            <h3 className="text-xl font-bold text-teal-700">Rajveer Singh</h3>
            <p className="text-gray-600">Software Engineer Candidate</p>
            <p className="text-sm text-gray-500 mt-2">
              "Ready for interview session"
            </p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-14 text-gray-900">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition"
            >
              <div>{icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-teal-700">
                  {title}
                </h3>
                <p className="text-gray-600 mt-2">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20 px-6 lg:px-12">
        <h2 className="text-3xl font-extrabold text-center mb-12 text-gray-900">
          Trusted by Recruiters
        </h2>
        <div className="space-y-8 max-w-4xl mx-auto">
          {testimonials.map(({ name, role, quote }) => (
            <blockquote
              key={name}
              className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-xl shadow-sm"
            >
              <p className="text-gray-800 italic mb-4">“{quote}”</p>
              <footer className="text-right">
                <p className="font-semibold text-teal-700">{name}</p>
                <p className="text-sm text-gray-600">{role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-700 text-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold">ProctoVision</h3>
            <p className="text-sm mt-2">
              Smart AI-driven proctoring for transparent and reliable hiring.
            </p>
          </div>
          {/* Links */}
          <nav className="flex flex-col gap-2 font-medium">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/home" className="hover:underline">
              Sessions
            </Link>
            <Link to="/report" className="hover:underline">
              Reports
            </Link>
            <Link to="/#contact" className="hover:underline">
              Contact
            </Link>
          </nav>
          {/* Socials */}
          <div className="flex space-x-6 justify-center md:justify-end">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-gray-200 transition"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-gray-200 transition"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-gray-200 transition"
            >
              <FaGithub className="w-6 h-6" />
            </a>
          </div>
        </div>
        <p className="text-center text-sm mt-6">
          © {new Date().getFullYear()} ProctoVision. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
