import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const printRef = useRef();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${apiBase}/reports`);
        const r = res.data.find((r) => r.interviewId === id || r._id === id);
        if (!r) throw new Error("Report not found");
        setReport(r);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, apiBase]);

  const formatDetected = (count) => (count > 0 ? "Yes" : "No");

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // reload page to restore React state
  };

  if (loading) return <p className="p-6 text-gray-600">Loading report...</p>;
  if (error)
    return <p className="p-6 text-red-600 font-semibold">Error: {error}</p>;

  const suspiciousCounts = report.suspiciousCounts || {};

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex justify-center m-20">
      <div className="w-full max-w-4xl" ref={printRef}>
        <Link
          to="/report"
          className="text-teal-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to Reports
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-center">
          Proctoring Report
        </h1>

        <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Candidate Name:</strong> {report.candidateName}
            </p>
            <p>
              <strong>Email:</strong> {report.candidateEmail}
            </p>
            <p>
              <strong>Interview Duration:</strong> {report.duration.toFixed(2)}{" "}
              sec
            </p>
            <p>
              <strong>Total Events Recorded:</strong> {report.totalEvents}
            </p>
            <p>
              <strong>Integrity Score:</strong> {report.integrityScore}%
            </p>
            <p>
              <strong>Report Created:</strong>{" "}
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>

          <h2 className="text-xl font-semibold mt-4">Suspicious Events</h2>
          <table className="min-w-full border border-gray-300 rounded-lg text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">Event Type</th>
                <th className="px-4 py-2 border-b">Detected</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">Focus Lost</td>
                <td className="px-4 py-2 border-b">
                  {formatDetected(suspiciousCounts.focusLost)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">No Face Detected</td>
                <td className="px-4 py-2 border-b">
                  {formatDetected(suspiciousCounts.noFace)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">Multiple Faces Detected</td>
                <td className="px-4 py-2 border-b">
                  {formatDetected(suspiciousCounts.multipleFaces)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">Phone Detected</td>
                <td className="px-4 py-2 border-b">
                  {formatDetected(suspiciousCounts.phoneDetected)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">Notes Detected</td>
                <td className="px-4 py-2 border-b">
                  {formatDetected(suspiciousCounts.notesDetected)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-center mt-6">
            <button
              onClick={handlePrint}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
