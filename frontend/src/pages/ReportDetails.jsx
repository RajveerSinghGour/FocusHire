import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ReportDetails() {
  const { id } = useParams(); // interviewId or reportId
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${apiBase}/reports`);
        const r = res.data.find(r => r.interviewId === id || r._id === id);
        if (!r) throw new Error('Report not found');
        setReport(r);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, apiBase]);

  if (loading) return <p className="p-4">Loading report...</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Link to="/report" className="text-teal-600 hover:underline mb-4 inline-block">
        &larr; Back to Reports
      </Link>
      <h1 className="text-2xl font-bold mb-2">{report.candidateName}</h1>
      <p className="text-gray-700 mb-1"><strong>Email:</strong> {report.candidateEmail}</p>
      <p className="text-gray-700 mb-1"><strong>Duration:</strong> {report.duration} sec</p>
      <p className="text-gray-700 mb-1"><strong>Integrity Score:</strong> {report.integrityScore}%</p>
      <p className="text-gray-500 mb-4"><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>

      {/* Embed PDF */}
      <iframe
        src={`${apiBase}/reports/${report._id}/pdf`}
        className="w-full h-[80vh] border rounded"
        title="Report PDF"
      />

      {/* Optional video preview */}
      {report.interviewVideoUrl && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Interview Video</h2>
          <video controls className="w-full rounded" src={report.interviewVideoUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
