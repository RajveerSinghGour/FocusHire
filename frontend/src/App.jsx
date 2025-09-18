import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import InterviewPage from "./pages/InterviewPage";
import ReportsPage from "./pages/ReportsPage";
import ReportDetails from "./pages/ReportDetails"; // new page
import Hero from './pages/Hero';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/home" element={<Home />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/report" element={<ReportsPage />} />
      <Route path="/report/:id" element={<ReportDetails />} /> {/* dynamic report page */}
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<Hero />} />
    </Routes>
  );
}
